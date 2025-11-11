import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold, Modality } from "@google/genai";
import { GameContext, GameResponse } from '../types';
// @ts-ignore
import * as mainPromptModule from '../prompts/mainPromptModule.js';
// @ts-ignore
import { getMusicPrompt } from '../prompts/musicPrompt.js';
// @ts-ignore
import { getCorrectionPrompt, getAdultPrompt } from '../prompts/systemPrompts.js';
// @ts-ignore
import narrativeStyleGuide from '../prompts/narrativeStyleGuide.js';
// @ts-ignore
import worldLogicGuide from '../prompts/worldLogicGuide.js';
import { deepMergeResponses } from "./responseProcessor";

const MAX_REGENERATION_RETRIES = 10;

// The custom error class for signaling a need for response regeneration.
export class RegenerationRequiredError extends Error {
    public reason: string;
    public rawText?: string;
    constructor(reason: string, message?: string, rawText?: string) {
        super(message || "Regeneration of the response is required.");
        this.name = "RegenerationRequiredError";
        this.reason = reason;
        this.rawText = rawText;
    }
}

const disabledSafetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const cleanJsonString = (jsonString: string): string => {
    if (!jsonString || typeof jsonString !== 'string') return '';
    // Remove markdown code block fences
    let cleaned = jsonString.trim().replace(/^```json\s*/, '').replace(/```$/, '');
    
    // Attempt to find the start of the JSON object/array
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    
    let startIndex = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
        startIndex = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
        startIndex = firstBrace;
    } else {
        startIndex = firstBracket;
    }

    if (startIndex !== -1) {
        cleaned = cleaned.substring(startIndex);
    }

    // Attempt to find the end of the JSON object/array
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    
    const endIndex = Math.max(lastBrace, lastBracket);

    if (endIndex !== -1) {
        cleaned = cleaned.substring(0, endIndex + 1);
    }
    
    return cleaned;
};


async function callGenerativeApiRaw(
    prompt: string,
    context: GameContext,
    abortSignal: AbortSignal,
    modelName: string,
    aiProvider: string,
    apiKey: string,
): Promise<string> {
    const defaultModel = 'gemini-2.5-flash';
    const finalModelName = modelName || defaultModel;
    
    let responseText: string;

    if (aiProvider === 'gemini') {
        const effectiveApiKey = process.env.API_KEY;
        if (!effectiveApiKey) {
            throw new Error("Gemini API Key not found in process.env.API_KEY.");
        }
        
        const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

        const modelConfig: any = {
            model: finalModelName,
            signal: abortSignal,
        };

        if (context.image && context.image.data) {
            const base64Data = context.image.data;
            modelConfig.contents = {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: context.image.mimeType, data: base64Data } }
                ]
            };
        } else {
            modelConfig.contents = prompt;
        }

        modelConfig.config = {}; // Initialize config object
        if (context.gameSettings.adultMode) {
            modelConfig.config.systemInstruction = getAdultPrompt();
        }
        if (context.gameSettings.useGoogleSearch) {
            modelConfig.config.tools = [{googleSearch: {}}];
        } else {
            modelConfig.config.responseMimeType = "application/json";
        }
        
        if (!finalModelName.includes('image')) {
            modelConfig.config.safetySettings = disabledSafetySettings;
        }

        const budget = context.gameSettings.useDynamicThinkingBudget ? undefined : context.gameSettings.geminiThinkingBudget;
        if (budget !== undefined) {
            modelConfig.config.thinkingConfig = { thinkingBudget: budget };
        }
        
        const response = await ai.models.generateContent(modelConfig);
        responseText = response.text;
    } else { // openrouter
        const effectiveApiKey = apiKey || context.gameSettings.openRouterApiKey;
        if (!effectiveApiKey) {
            throw new Error("OpenRouter API Key not found.");
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${effectiveApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": finalModelName,
                "messages": [
                    { "role": "user", "content": prompt }
                ]
            }),
            signal: abortSignal,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const data = await response.json();
        responseText = data.choices[0].message.content;
    }
    
    if (abortSignal.aborted) {
        throw new Error('Aborted');
    }

    return responseText;
}

export async function callGenerativeApi(
    prompt: string,
    context: GameContext,
    abortSignal: AbortSignal,
    onStreamingChunk: (text: string) => void,
    modelName: string,
    aiProvider: string,
    apiKey: string
): Promise<any> {
    const defaultModel = 'gemini-2.5-flash';
    const finalModelName = modelName || defaultModel;
    let fullResponseText = '';

    if (aiProvider === 'gemini') {
        const effectiveApiKey = process.env.API_KEY;
        if (!effectiveApiKey) {
            throw new Error("Gemini API Key not found in process.env.API_KEY.");
        }
        
        const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

        const modelConfig: any = {
            model: finalModelName,
            signal: abortSignal,
        };
        
        if (context.image && context.image.data) {
            const base64Data = context.image.data;
            modelConfig.contents = {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: context.image.mimeType, data: base64Data } }
                ]
            };
        } else {
            modelConfig.contents = prompt;
        }

        modelConfig.config = {}; // Initialize config object
        if (context.gameSettings.adultMode) {
            modelConfig.config.systemInstruction = getAdultPrompt();
        }
        if (context.gameSettings.useGoogleSearch) {
            modelConfig.config.tools = [{googleSearch: {}}];
        } else {
            modelConfig.config.responseMimeType = "application/json";
        }
        
        if (!finalModelName.includes('image')) {
            modelConfig.config.safetySettings = disabledSafetySettings;
        }

        const budget = context.gameSettings.useDynamicThinkingBudget ? undefined : context.gameSettings.geminiThinkingBudget;
        if (budget !== undefined) {
            modelConfig.config.thinkingConfig = { thinkingBudget: budget };
        }
        
        const stream = await ai.models.generateContentStream(modelConfig);

        for await (const chunk of stream) {
            if (abortSignal.aborted) {
                throw new Error('Aborted');
            }
            const chunkText = chunk.text;
            fullResponseText += chunkText;
            onStreamingChunk(fullResponseText);
        }
    } else { // openrouter
        const effectiveApiKey = apiKey || context.gameSettings.openRouterApiKey;
        if (!effectiveApiKey) {
            throw new Error("OpenRouter API Key not found.");
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${effectiveApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": finalModelName,
                "messages": [
                    { "role": "user", "content": prompt }
                ],
                "stream": true
            }),
            signal: abortSignal,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        if (!response.body) {
            throw new Error("OpenRouter stream response has no body.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (abortSignal.aborted) {
                reader.cancel();
                throw new Error('Aborted');
            }
            
            buffer += decoder.decode(value, { stream: true });
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last, potentially incomplete line

            for (const line of lines) {
                if (line.trim() === '' || !line.startsWith('data: ')) continue;
                
                const data = line.substring(6).trim();
                if (data === '[DONE]') {
                    break;
                }
                
                try {
                    const json = JSON.parse(data);
                    const content = json.choices[0]?.delta?.content;
                    if (content) {
                        fullResponseText += content;
                        onStreamingChunk(fullResponseText);
                    }
                } catch (e) {
                    console.error('Error parsing stream chunk:', data, e);
                }
            }
        }
    }

    if (abortSignal.aborted) {
        throw new Error('Aborted');
    }
    
    try {
        const cleanedJson = cleanJsonString(fullResponseText);
        onStreamingChunk(cleanedJson);
        const parsed = JSON.parse(cleanedJson);
        return parsed;
    } catch (e: any) {
        console.error("Final JSON parse failed. Raw response:", fullResponseText);
        throw new RegenerationRequiredError(e.message, `Failed to parse response from LLM. Raw text: ${fullResponseText}`, fullResponseText);
    }
}

async function attemptCorrection(
    invalidJson: string, 
    context: GameContext, 
    error: Error,
    originalModelName: string,
    aiProvider: string,
    apiKey: string
): Promise<any> {
    console.log("Attempting self-correction...");
    const correctionPrompt = getCorrectionPrompt(invalidJson, context, error);
    
    const correctionModel = context.gameSettings.correctionModelName || 'gemini-2.5-flash';
    const correctionProvider = context.gameSettings.correctionModelName ? 'gemini' : aiProvider;

    const correctionContext = { 
        ...context, 
        image: null,
        gameSettings: {
            ...context.gameSettings,
            useGoogleSearch: false // Always disable search for correction
        }
    };
    
    const correctionResponseText = await callGenerativeApiRaw(
        correctionPrompt, 
        correctionContext, 
        new AbortController().signal, 
        correctionModel, 
        correctionProvider,
        apiKey
    );

    const cleanedForCorrection = cleanJsonString(correctionResponseText);
    const parsedCorrection = JSON.parse(cleanedForCorrection); // This might throw, to be caught by the loop

    if (parsedCorrection.regenerationRequired) {
        console.log("Correction AI indicated regeneration is required.", parsedCorrection.reason);
        return { regenerationRequired: true, reason: parsedCorrection.reason };
    }
    
    console.log("Correction successful!");
    return parsedCorrection;
}

async function executeStepWithCorrection(
    stepName: string,
    promptFn: () => string,
    context: GameContext,
    partiallyGeneratedResponse: any,
    abortSignal: AbortSignal,
    onPartialResponse: (response: any, stepName: string, modelName: string) => void,
    onStreamingChunk: (text: string) => void,
    onStepStart: (stepName: string, modelName: string) => void
): Promise<any> {
    let lastError: any = null;
    let additionalGuides = '';

    // Add guides based on the step name
    if (stepName === 'Step0_AnalysisAndPlanning_TaskGuide' || stepName === 'Step0_5_Verification_TaskGuide') {
        additionalGuides += worldLogicGuide.getGuide();
    }
    if (stepName === 'Step_FactionProgression_TaskGuide' || stepName === 'Step_WorldProgression_TaskGuide') {
        additionalGuides += narrativeStyleGuide.getGuide();
        additionalGuides += worldLogicGuide.getGuide();
    }
    if (stepName === 'Step1_NarrativeGeneration_TaskGuide') {
        additionalGuides += narrativeStyleGuide.getGuide();
    }
    if (stepName === 'Step4_NPC_TaskGuide') {
        additionalGuides += narrativeStyleGuide.getGuide();
        additionalGuides += worldLogicGuide.getGuide();
    }
    if (stepName === 'Step5_Inventory_TaskGuide') {
        additionalGuides += narrativeStyleGuide.getGuide();
    }

    for (let attempt = 1; attempt <= MAX_REGENERATION_RETRIES; attempt++) {
        const stepContext = { 
            ...context, 
            partiallyGeneratedResponse: JSON.stringify(partiallyGeneratedResponse), 
            currentStepFocus: stepName, 
            isRegenerationAttempt: attempt > 1,
            regenerationReason: lastError?.reason || '' 
        };
        const stepPrompt = promptFn();
        const fullPrompt = stepPrompt + additionalGuides + mainPromptModule.getGameMasterGuideRules(stepContext);
        const model = getModelForStep(stepName, context);
        onStepStart(stepName, model);
        
        try {
            const stepResponse = await callGenerativeApi(
                fullPrompt, 
                stepContext, 
                abortSignal, 
                onStreamingChunk, 
                model, 
                context.gameSettings.aiProvider, 
                context.gameSettings.geminiApiKey || context.gameSettings.openRouterApiKey || ''
            );
            
            const newPartialResponse = deepMergeResponses(partiallyGeneratedResponse, stepResponse);
            onPartialResponse(newPartialResponse, stepName, model);
            return newPartialResponse;

        } catch (err: any) {
            lastError = err;
            if (abortSignal.aborted) throw err;
            
            console.warn(`Step '${stepName}' failed on regeneration attempt ${attempt}. Reason: ${err.message}`);

            if (err instanceof RegenerationRequiredError && err.rawText) {
                const MAX_CORRECTION_RETRIES = 10;
                let correctionSuccessful = false;
                let correctedResponse = null;

                for (let correctionAttempt = 1; correctionAttempt <= MAX_CORRECTION_RETRIES; correctionAttempt++) {
                     console.log(`Attempting self-correction for step '${stepName}', attempt ${correctionAttempt}/${MAX_CORRECTION_RETRIES}...`);
                    try {
                        const correctionResult = await attemptCorrection(
                            err.rawText, 
                            stepContext, 
                            err, 
                            model, 
                            context.gameSettings.aiProvider, 
                            context.gameSettings.geminiApiKey || context.gameSettings.openRouterApiKey || ''
                        );

                        if (correctionResult.regenerationRequired) {
                            console.log("Correction AI indicated regeneration is required.", correctionResult.reason);
                            lastError = { ...lastError, reason: correctionResult.reason };
                            break;
                        }
                        
                        console.log("Correction attempt produced valid JSON.");
                        correctedResponse = deepMergeResponses(partiallyGeneratedResponse, correctionResult);
                        correctionSuccessful = true;
                        break;

                    } catch (correctionError: any) {
                        console.warn(`Correction attempt ${correctionAttempt} failed. Error: ${correctionError.message}`);
                    }
                }

                if (correctionSuccessful && correctedResponse) {
                    console.log("Correction succeeded.");
                    onPartialResponse(correctedResponse, stepName, model);
                    return correctedResponse;
                } else {
                    console.log("Correction failed after all attempts or was explicitly requested by AI. Proceeding to next regeneration attempt...");
                    continue;
                }
            } else {
                console.log("Error is not a parsing error or has no raw text. Retrying step...");
                continue;
            }
        }
    }
    
    throw new Error(`Failed to execute step '${stepName}' after ${MAX_REGENERATION_RETRIES} attempts. Last error: ${lastError?.message}`);
}

export const getModelForStep = (stepName: string, context: GameContext): string => {
    const { isCustomModel, customModelName, modelName, correctionModelName, aiProvider, openRouterModelName } = context.gameSettings;
    if (aiProvider === 'openrouter') {
        return openRouterModelName || 'google/gemini-flash-1.5';
    }

    if (isCustomModel) {
        return customModelName || 'gemini-2.5-flash';
    }
    
    if (stepName === 'Step0_5_Verification_TaskGuide' && correctionModelName) {
        return correctionModelName;
    }
    return modelName || 'gemini-2.5-flash';
};

export async function executeTurn(
    context: GameContext,
    abortSignal: AbortSignal,
    onPartialResponse: (response: any, stepName: string, modelName: string) => void,
    onStreamingChunk: (text: string) => void,
    onStepStart: (stepName: string, modelName: string) => void,
): Promise<GameResponse> {
    let partiallyGeneratedResponse: any = {};

    partiallyGeneratedResponse = await executeStepWithCorrection('Step0_AnalysisAndPlanning_TaskGuide', mainPromptModule.getStep0, context, partiallyGeneratedResponse, abortSignal, onPartialResponse, onStreamingChunk, onStepStart);
    
    if (partiallyGeneratedResponse._internal_flags_?.needsSelfCorrection) {
        partiallyGeneratedResponse = await executeStepWithCorrection('Step0_5_Verification_TaskGuide', mainPromptModule.getStep0_5, context, partiallyGeneratedResponse, abortSignal, onPartialResponse, onStreamingChunk, onStepStart);
    }
    
    const doNotUseWorldEvents = context.gameSettings.doNotUseWorldEvents ?? false;
    
    // Faction Progression (Conditional)
    if (partiallyGeneratedResponse._internal_flags_?.needsFactionProgression === true && !doNotUseWorldEvents) {
         partiallyGeneratedResponse = await executeStepWithCorrection('Step_FactionProgression_TaskGuide', mainPromptModule.getStepFactionProgression, context, partiallyGeneratedResponse, abortSignal, onPartialResponse, onStreamingChunk, onStepStart);
    }

    // World Progression (Conditional)
    if (partiallyGeneratedResponse._internal_flags_?.needsWorldProgression === true && !doNotUseWorldEvents) {
        partiallyGeneratedResponse = await executeStepWithCorrection('Step_WorldProgression_TaskGuide', mainPromptModule.getStepWorldProgression, context, partiallyGeneratedResponse, abortSignal, onPartialResponse, onStreamingChunk, onStepStart);
    }
    
    if (partiallyGeneratedResponse._internal_flags_?.isSimpleTurn) {
        partiallyGeneratedResponse = await executeStepWithCorrection('StepSimpleFullResponse_TaskGuide', mainPromptModule.getStepSimpleFullResponse, context, partiallyGeneratedResponse, abortSignal, onPartialResponse, onStreamingChunk, onStepStart);
        return partiallyGeneratedResponse as GameResponse;
    }

    // Step 2: Core State (Always runs for complex turn)
    partiallyGeneratedResponse = await executeStepWithCorrection(
        'Step2_CoreState_TaskGuide',
        mainPromptModule.getStep2,
        context, partiallyGeneratedResponse, abortSignal, onPartialResponse, onStreamingChunk, onStepStart
    );

    // Step 3: Combat (Conditional)
    if (partiallyGeneratedResponse._internal_flags_?.isCombatActive === true) {
        partiallyGeneratedResponse = await executeStepWithCorrection(
            'Step3_Combat_TaskGuide',
            mainPromptModule.getStep3,
            context, partiallyGeneratedResponse, abortSignal, onPartialResponse, onStreamingChunk, onStepStart
        );
    }

    // Step 4: NPC (Conditional)
    if (partiallyGeneratedResponse._internal_flags_?.needsNPCProcessing === true) {
        partiallyGeneratedResponse = await executeStepWithCorrection(
            'Step4_NPC_TaskGuide',
            mainPromptModule.getStep4,
            context, partiallyGeneratedResponse, abortSignal, onPartialResponse, onStreamingChunk, onStepStart
        );
    }

    // Step 5: Inventory (Conditional)
    if (partiallyGeneratedResponse._internal_flags_?.needsInventoryProcessing === true) {
        partiallyGeneratedResponse = await executeStepWithCorrection(
            'Step5_Inventory_TaskGuide',
            mainPromptModule.getStep5,
            context, partiallyGeneratedResponse, abortSignal, onPartialResponse, onStreamingChunk, onStepStart
        );
    }

    // Step 1: Narrative (Now runs for complex turn near the end)
    partiallyGeneratedResponse = await executeStepWithCorrection(
        'Step1_NarrativeGeneration_TaskGuide',
        mainPromptModule.getStep1,
        context, partiallyGeneratedResponse, abortSignal, onPartialResponse, onStreamingChunk, onStepStart
    );

    // Step 6: Finalization (Always runs for complex turn)
    partiallyGeneratedResponse = await executeStepWithCorrection(
        'Step6_Finalization_TaskGuide',
        mainPromptModule.getStep6,
        context, partiallyGeneratedResponse, abortSignal, onPartialResponse, onStreamingChunk, onStepStart
    );

    return partiallyGeneratedResponse as GameResponse;
}

export async function askGmQuestion(
    context: GameContext,
    abortSignal: AbortSignal,
    onStreamingChunk: (text: string) => void,
    onStepStart: (stepName: string, modelName: string) => void,
): Promise<GameResponse> {
    const stepContext = { 
        ...context, 
        partiallyGeneratedResponse: {},
        currentStepFocus: 'StepQuestion_CorrectionAndClarification_TaskGuide',
    };
    const stepPrompt = mainPromptModule.getStepQuestion();
    const fullPrompt = stepPrompt + narrativeStyleGuide.getGuide() + mainPromptModule.getGameMasterGuideRules(stepContext);
    const model = getModelForStep('StepQuestion_CorrectionAndClarification_TaskGuide', context);
    onStepStart('StepQuestion_CorrectionAndClarification_TaskGuide', model);

    const response = await callGenerativeApi(
        fullPrompt, 
        stepContext, 
        abortSignal, 
        onStreamingChunk, 
        model, 
        context.gameSettings.aiProvider, 
        context.gameSettings.geminiApiKey || context.gameSettings.openRouterApiKey || ''
    );
    return response as GameResponse;
}

export async function executeWorldProgression(
    context: GameContext,
    abortSignal: AbortSignal,
    onStreamingChunk: (text: string) => void,
    onPartialResponse: (response: any, stepName: string, modelName: string) => void,
    onStepStart: (stepName: string, modelName: string) => void,
): Promise<GameResponse> {
     const response = await executeStepWithCorrection(
        'Step_WorldProgression_TaskGuide',
        mainPromptModule.getStepWorldProgression,
        context,
        {},
        abortSignal,
        onPartialResponse,
        onStreamingChunk,
        onStepStart
    );
    return response as GameResponse;
}

export async function getMusicSuggestionFromAi(
    context: GameContext,
    youtubeApiKey: string,
    previousQueries: string[]
): Promise<{ videoIds: string[]; reasoning: string; searchQuery: string } | null> {
    
    const summarizedContext = {
        last_messages: context.responseHistory.slice(-6).map(m => `${m.sender}: ${m.content}`).join('\n'),
        location_description: context.currentLocation.description,
        player_status: context.previousTurnResponse?.playerStatus,
        plot_summary: context.plotOutline?.mainArc.summary,
        game_world: context.gameSettings.gameWorldInformation.baseInfo.name,
        previous_queries: previousQueries,
        user_language: context.gameSettings.language,
    };
    
    const prompt = getMusicPrompt(summarizedContext);

    let suggestion: { searchQuery: string; reasoning: string } | null = null;
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("Gemini API Key not found in process.env.API_KEY.");
        }
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                safetySettings: disabledSafetySettings,
            }
        });
        
        const textResponse = response.text;
        const jsonStr = cleanJsonString(textResponse);
        
        let parsed = JSON.parse(jsonStr);
        
        if (parsed && parsed.searchQuery && parsed.reasoning) {
            suggestion = parsed;
        } else {
            console.error("AI music suggestion response was not in the expected format:", textResponse);
            throw new Error(`The AI returned an invalid music suggestion format: ${textResponse}`);
        }

    } catch (err: any) {
        console.error("Error getting music suggestion from AI:", err);
        throw new Error(`The AI failed to generate a music suggestion. Error: ${err.message}`);
    }

    if (!suggestion) {
        throw new Error("The AI returned an empty suggestion.");
    }

    const refinedSearchQuery = `${suggestion.searchQuery} ambient instrumental music long`;
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(refinedSearchQuery)}&type=video&videoEmbeddable=true&maxResults=5&key=${youtubeApiKey}`;

    try {
        const youtubeResponse = await fetch(apiUrl);
        if (!youtubeResponse.ok) {
            const errorBody = await youtubeResponse.text();
            throw new Error(`YouTube API error: ${youtubeResponse.status} - ${errorBody}`);
        }
        const data = await youtubeResponse.json();

        if (data.items && data.items.length > 0) {
            const videoIds = data.items.map((item: any) => item.id.videoId).filter(Boolean);
            if (videoIds.length > 0) {
                return {
                    videoIds: videoIds,
                    reasoning: suggestion.reasoning,
                    searchQuery: suggestion.searchQuery,
                };
            }
        }
        
        console.warn("No embeddable YouTube video found for query:", refinedSearchQuery);
        throw new Error(`No YouTube results found for the AI-suggested query: "${suggestion.searchQuery}"`);

    } catch (error) {
        console.error("Error fetching from YouTube API:", error);
        throw error;
    }
}

export async function translateToEnglish(text: string, context: GameContext): Promise<string> {
    if (!text || !text.trim()) {
        return "";
    }
    
    if (/^[a-zA-Z0-9\s.,!?'"-]+$/.test(text)) {
        return text;
    }

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.warn("Gemini API Key not found for translation.");
            return text;
        }
        const ai = new GoogleGenAI({ apiKey });
        
        const prompt = `Translate the following text to English. Respond with only the translated text, without any additional explanations or formatting. If the text is already in English, return it unchanged.\n\nText to translate:\n"""\n${text}\n"""`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                safetySettings: disabledSafetySettings
            }
        });

        const translatedText = response.text.trim();
        return translatedText;

    } catch (err) {
        console.error("Error translating text to English:", err);
        return text;
    }
}

export async function executeCancellableJsonGeneration(
    prompt: string,
    context: GameContext,
    abortSignal: AbortSignal,
    onStreamingChunk: (text: string) => void,
    systemInstruction?: string
): Promise<any> {
    const { modelName, aiProvider, geminiApiKey, openRouterApiKey, useDynamicThinkingBudget, geminiThinkingBudget } = context.gameSettings;

    if (aiProvider !== 'gemini') {
        throw new Error("Only Gemini provider is supported for this cinematic generation feature.");
    }
    
    const effectiveApiKey = process.env.API_KEY;
    if (!effectiveApiKey) {
        throw new Error("Gemini API Key not found in process.env.API_KEY.");
    }

    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

    const modelConfig: any = {
        model: modelName,
        contents: prompt,
        signal: abortSignal,
    };
    
    modelConfig.config = {
        responseMimeType: "application/json",
    };

    if (systemInstruction) {
        modelConfig.config.systemInstruction = systemInstruction;
    }

    if (!modelName.includes('image')) {
        modelConfig.config.safetySettings = disabledSafetySettings;
    }

    const budget = useDynamicThinkingBudget ? undefined : geminiThinkingBudget;
    if (budget !== undefined) {
        modelConfig.config.thinkingConfig = { thinkingBudget: budget };
    }
    
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_REGENERATION_RETRIES; attempt++) {
        let fullResponseText = '';
        try {
            const stream = await ai.models.generateContentStream(modelConfig);
            for await (const chunk of stream) {
                if (abortSignal.aborted) {
                    throw new DOMException('Aborted by user.', 'AbortError');
                }
                const chunkText = chunk.text;
                if (chunkText) {
                    fullResponseText += chunkText;
                }
                onStreamingChunk(fullResponseText);
            }
        
            if (abortSignal.aborted) {
                throw new DOMException('Aborted by user.', 'AbortError');
            }

            if (!fullResponseText.trim()) {
                throw new Error("Received empty response from the model.");
            }

            const cleanedJson = cleanJsonString(fullResponseText);
            onStreamingChunk(cleanedJson);
            const parsed = JSON.parse(cleanedJson);
            return parsed; // Success!

        } catch (e: any) {
            lastError = e;
            if (abortSignal.aborted || (e instanceof DOMException && e.name === 'AbortError')) {
                throw e;
            }

            console.warn(`Cancellable JSON generation failed on attempt ${attempt}. Reason: ${e.message}`);
            
            if (!fullResponseText.trim()) {
                console.log("Response was empty, retrying generation.");
                continue;
            }

            const MAX_CORRECTION_RETRIES = 10;
            let correctionSuccessful = false;
            let correctedResponse = null;

            for (let correctionAttempt = 1; correctionAttempt <= MAX_CORRECTION_RETRIES; correctionAttempt++) {
                 console.log(`Attempting self-correction for cancellable generation, attempt ${correctionAttempt}/${MAX_CORRECTION_RETRIES}...`);
                try {
                    const correctionResult = await attemptCorrection(
                        fullResponseText, 
                        context, 
                        e, 
                        modelName, 
                        aiProvider, 
                        effectiveApiKey
                    );

                    if (correctionResult.regenerationRequired) {
                        console.log("Correction AI indicated regeneration is required.", correctionResult.reason);
                        lastError = { ...lastError, reason: correctionResult.reason };
                        break; // Break correction loop to trigger regeneration
                    }
                    
                    console.log("Correction attempt produced valid JSON.");
                    correctedResponse = correctionResult;
                    correctionSuccessful = true;
                    break; // Success, break correction loop

                } catch (correctionError: any) {
                    console.warn(`Correction attempt ${correctionAttempt} failed. Error: ${correctionError.message}`);
                    lastError = correctionError;
                }
            }

            if (correctionSuccessful && correctedResponse) {
                console.log("Correction succeeded.");
                return correctedResponse;
            } else {
                console.log("Correction failed or regeneration was requested. Proceeding to next regeneration attempt...");
                continue; // to next regeneration attempt
            }
        }
    }
    
    throw new Error(`Failed to generate a valid JSON response for the cinematic after ${MAX_REGENERATION_RETRIES} attempts. Last error: ${lastError?.message}`);
}