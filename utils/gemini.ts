import { GoogleGenAI } from "@google/genai";
import { GameContext } from '../types';
// @ts-ignore
import { getCorrectionPrompt, getAdultPrompt } from '../prompts/systemPrompts.js';
import { translate } from "./localization";

export class RegenerationRequiredError extends Error {
    reason: string;
    constructor(reason: string) {
        super(reason);
        this.name = 'RegenerationRequiredError';
        this.reason = reason;
    }
}


async function callOpenRouter(prompt: string, context: GameContext, signal?: AbortSignal, onChunk?: (chunkText: string) => void, modelName?: string, apiKey?: string): Promise<any> {
    const MAX_SYNTAX_RETRIES = 5;
    const MAX_SERVER_ERROR_RETRIES = 5;
    const lang = context.gameSettings.language || 'en';

    for (let serverAttempt = 1; serverAttempt <= MAX_SERVER_ERROR_RETRIES; serverAttempt++) {
        try {
            let lastError: any = null;
            let currentPrompt = prompt;
            let modelForAttempt = modelName || 'google/gemini-flash-1.5';

            for (let attempt = 1; attempt <= MAX_SYNTAX_RETRIES; attempt++) {
                let aggregatedText = '';
                try {
                    const finalApiKey = apiKey || process.env.API_KEY;
                    if (!finalApiKey) {
                        throw new Error(translate(lang, 'openRouterApiKeyMissing'));
                    }

                    const messages = [];
                    if (context.gameSettings?.adultMode) {
                        messages.push({ role: 'system', content: getAdultPrompt() });
                    }
                    messages.push({ role: 'user', content: currentPrompt });

                    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${finalApiKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            model: modelForAttempt,
                            messages: messages,
                            stream: true,
                            response_format: { type: "json_object" }
                        }),
                        signal: signal,
                    });

                    if (!response.ok) {
                        if (response.status >= 500 && response.status < 600) {
                            const error = new Error(`Server error: ${response.status} ${response.statusText}`);
                            error.name = 'ServerError';
                            throw error;
                        }
                        const errorBody = await response.text();
                        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorBody}`);
                    }
                    
                    if (!response.body) {
                        throw new Error("Response body is null");
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';

                    while (true) {
                        if (signal?.aborted) {
                            const error = new Error(translate(lang, 'requestCancelledByUser'));
                            error.name = 'AbortError';
                            throw error;
                        }
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || ''; // Keep the last, possibly incomplete, line

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const jsonStr = line.substring(6);
                                if (jsonStr === '[DONE]') {
                                    break;
                                }
                                try {
                                    const chunkJson = JSON.parse(jsonStr);
                                    const content = chunkJson.choices?.[0]?.delta?.content;
                                    if (content) {
                                        aggregatedText += content;
                                        if (onChunk) {
                                            onChunk(aggregatedText);
                                        }
                                    }
                                } catch (e) {
                                    // Incomplete JSON, will be completed in next chunk
                                }
                            }
                        }
                    }
                    
                    const parsedResponse = JSON.parse(aggregatedText);

                    if (parsedResponse.regenerationRequired === true) {
                        throw new RegenerationRequiredError(parsedResponse.reason || "AI requested regeneration.");
                    }

                    return parsedResponse; // Success!

                } catch (error: any) {
                    lastError = error;
                    if (error.name === 'AbortError' || error.name === 'RegenerationRequiredError' || error.name === 'ServerError') {
                        throw error;
                    }

                    if (error instanceof SyntaxError) {
                        console.error(`Attempt ${attempt} failed to parse JSON with model ${modelForAttempt}:`, error.message);
                        console.error("Original text that failed to parse:", aggregatedText);

                        if (attempt < MAX_SYNTAX_RETRIES) {
                            console.log(`Retrying with correction prompt... (Attempt ${attempt + 1}/${MAX_SYNTAX_RETRIES})`);
                            currentPrompt = getCorrectionPrompt(aggregatedText, context, error);
                            if (context.gameSettings.correctionModelName && context.gameSettings.correctionModelName.trim() !== '') {
                                console.log(`Switching to correction model: ${context.gameSettings.correctionModelName}`);
                                modelForAttempt = context.gameSettings.correctionModelName;
                            }
                        }
                    } else {
                        console.error(`An unrecoverable error occurred with model ${modelForAttempt}:`, error);
                        throw new Error(translate(lang, 'gmCommunicationError', { provider: 'OpenRouter', message: error.message }));
                    }
                }
            }
            
            console.error("All syntax correction attempts failed. Throwing the last encountered error.");
            if (lastError instanceof SyntaxError) {
                throw new Error(translate(lang, 'failedToParseGmResponseMultiple', { attempts: MAX_SYNTAX_RETRIES, message: lastError.message }));
            }
            throw lastError || new Error('Unknown error in callOpenRouter after retries.');
        } catch (error: any) {
            if (error.name === 'ServerError') {
                if (serverAttempt < MAX_SERVER_ERROR_RETRIES) {
                    const delay = 1000 * serverAttempt;
                    console.log(`Server returned 5xx. Retrying in ${delay}ms... (Attempt ${serverAttempt + 1}/${MAX_SERVER_ERROR_RETRIES})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                } else {
                    console.error(`Server error persisted after ${MAX_SERVER_ERROR_RETRIES} attempts.`);
                    throw new Error(translate(lang, 'serverTooBusy'));
                }
            } else {
                // Re-throw other critical errors (Abort, Regen, final Syntax)
                throw error;
            }
        }
    }
}


export async function callGenerativeApi(
    prompt: string, 
    context: GameContext,
    signal?: AbortSignal, 
    onChunk?: (chunkText: string) => void, 
    modelName?: string, 
    aiProvider: string = 'gemini',
    apiKey?: string,
): Promise<any> {
    if (!prompt.trim()) {
        throw new Error("Prompt cannot be empty.");
    }

    if (aiProvider === 'openrouter') {
        return callOpenRouter(prompt, context, signal, onChunk, modelName, apiKey);
    }
    
    // Gemini with retry logic for SYNTAX CORRECTION
    const MAX_SYNTAX_RETRIES = 5;
    const MAX_SERVER_ERROR_RETRIES = 5;
    const lang = context.gameSettings.language || 'en';

    for (let serverAttempt = 1; serverAttempt <= MAX_SERVER_ERROR_RETRIES; serverAttempt++) {
        try {
            let lastError: any = null;
            let currentPrompt = prompt;
            let modelForAttempt = modelName || 'gemini-2.5-flash';

            for (let attempt = 1; attempt <= MAX_SYNTAX_RETRIES; attempt++) {
                let aggregatedText = '';
                try {
                    const finalApiKey = apiKey || process.env.API_KEY;
                    if (!finalApiKey) {
                        throw new Error(translate(lang, 'geminiApiKeyMissing'));
                    }
                    const ai = new GoogleGenAI({ apiKey: finalApiKey });
                    
                    const config: any = {
                        responseMimeType: "application/json",
                    };

                    if (context.gameSettings?.adultMode) {
                        config.systemInstruction = getAdultPrompt();
                    }

                    const streamResult = await ai.models.generateContentStream({
                        model: modelForAttempt,
                        contents: currentPrompt,
                        config: config
                    });

                    for await (const chunk of streamResult) {
                        if (signal?.aborted) {
                            const error = new Error(translate(lang, 'requestCancelledByUser'));
                            error.name = 'AbortError';
                            throw error;
                        }
                        aggregatedText += chunk.text;
                        if (onChunk) {
                            onChunk(aggregatedText);
                        }
                    }
                    
                    const parsedResponse = JSON.parse(aggregatedText);

                    if (parsedResponse.regenerationRequired === true) {
                        throw new RegenerationRequiredError(parsedResponse.reason || "AI requested regeneration.");
                    }

                    return parsedResponse; // Success!

                } catch (error: any) {
                    lastError = error;

                    if (error.message && (error.message.includes('500') || error.message.toLowerCase().includes('server error') || error.message.toLowerCase().includes('backend error'))) {
                        const serverError = new Error(error.message);
                        serverError.name = 'ServerError';
                        throw serverError;
                    }
                    
                    if (error.name === 'AbortError' || error.name === 'RegenerationRequiredError' || error.name === 'ServerError') {
                        throw error;
                    }

                    if (error instanceof SyntaxError) {
                        console.error(`Attempt ${attempt} failed to parse JSON with model ${modelForAttempt}:`, error.message);
                        console.error("Original text that failed to parse:", aggregatedText);

                        if (attempt < MAX_SYNTAX_RETRIES) {
                            console.log(`Retrying with correction prompt... (Attempt ${attempt + 1}/${MAX_SYNTAX_RETRIES})`);
                            currentPrompt = getCorrectionPrompt(aggregatedText, context, error);
                            if (context.gameSettings.correctionModelName && context.gameSettings.correctionModelName.trim() !== '') {
                                console.log(`Switching to correction model: ${context.gameSettings.correctionModelName}`);
                                modelForAttempt = context.gameSettings.correctionModelName;
                            }
                        }
                    } else {
                        console.error(`An unrecoverable error occurred with model ${modelForAttempt}:`, error);
                        throw new Error(translate(lang, 'gmCommunicationError', { provider: 'Gemini', message: error.message }));
                    }
                }
            }
            
            console.error("All syntax correction attempts failed. Throwing the last encountered error.");
            if (lastError instanceof SyntaxError) {
                throw new Error(translate(lang, 'failedToParseGmResponseMultiple', { attempts: MAX_SYNTAX_RETRIES, message: lastError.message }));
            }
            throw lastError || new Error('Unknown error in callGenerativeApi after syntax retries.');
        } catch (error: any) {
             if (error.name === 'ServerError') {
                if (serverAttempt < MAX_SERVER_ERROR_RETRIES) {
                    const delay = 1000 * serverAttempt;
                    console.log(`Server returned 5xx-class error. Retrying in ${delay}ms... (Attempt ${serverAttempt + 1}/${MAX_SERVER_ERROR_RETRIES})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                } else {
                    console.error(`Server error persisted after ${MAX_SERVER_ERROR_RETRIES} attempts.`);
                    throw new Error(translate(lang, 'serverTooBusy'));
                }
            } else {
                // Re-throw other critical errors
                throw error;
            }
        }
    }
}