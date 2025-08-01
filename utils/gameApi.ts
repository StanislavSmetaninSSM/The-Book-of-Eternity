
import { GameContext, GameResponse } from '../types';
// @ts-ignore
import * as mainPromptModule from '../prompts/mainPromptModule.js';
// @ts-ignore
import narrativeStyleGuide from '../prompts/narrativeStyleGuide.js';
// @ts-ignore
import worldLogicGuide from '../prompts/worldLogicGuide.js';
// @ts-ignore
import { getMusicPrompt } from '../prompts/musicPrompt.js';
import { callGenerativeApi, RegenerationRequiredError } from './gemini';
import { GoogleGenAI, Type } from "@google/genai";

interface InternalFlags {
    isCombatActive: boolean;
    needsNPCProcessing: boolean;
    needsInventoryProcessing: boolean;
    historyManipulationCoefficient: number;
    needsSelfCorrection: boolean;
    isSimpleTurn: boolean;
}

interface PartialResponseWithFlags extends Partial<GameResponse> {
    _internal_flags_?: InternalFlags;
}

const worldLogic = worldLogicGuide.getGuide();
const narrativeStyle = narrativeStyleGuide.getGuide();

function recursivelyRemoveTildes(obj: any): any {
    if (typeof obj === 'string') {
        return obj.replace(/~~/g, '');
    }
    if (Array.isArray(obj)) {
        return obj.map(item => recursivelyRemoveTildes(item));
    }
    if (obj !== null && typeof obj === 'object') {
        const newObj: { [key: string]: any } = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = recursivelyRemoveTildes(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
}

const executeApiStep = async (
    stepName: string,
    getPromptFunc: () => string,
    guide: string,
    context: GameContext,
    currentPartialResponse: any,
    abortSignal: AbortSignal,
    onPartialResponse: (response: any) => void,
    onStreamingChunk: (text: string) => void
): Promise<any> => {
    const { modelName, aiProvider, geminiApiKey, openRouterApiKey } = context.gameSettings;
    const apiKey = aiProvider === 'gemini' ? geminiApiKey : openRouterApiKey;
    const MAX_STEP_RETRIES = 5;
    let isRegen = false;
    let reason = '';

    for (let i = 0; i < MAX_STEP_RETRIES; i++) {
        try {
            const stepContext = {
                ...context,
                currentStepFocus: stepName,
                partiallyGeneratedResponse: currentPartialResponse ? JSON.stringify(currentPartialResponse, null, 2) : null,
                isRegenerationAttempt: isRegen,
                regenerationReason: reason
            };

            const basePrompt = mainPromptModule.getGameMasterGuideRules(stepContext as any);
            const stepPrompt = getPromptFunc();
            const fullPrompt = stepPrompt + basePrompt + (guide || '');

            const result = await callGenerativeApi(fullPrompt, stepContext, abortSignal, onStreamingChunk, modelName, aiProvider, apiKey);
            return result; // Success
        } catch (error: any) {
            if (error instanceof RegenerationRequiredError) {
                console.log(`Regeneration required for step ${stepName} due to: ${error.reason}. Retrying (${i + 1}/${MAX_STEP_RETRIES})...`);
                isRegen = true;
                reason = error.reason;
                if (i === MAX_STEP_RETRIES - 1) {
                    throw new Error(`Step ${stepName} failed after ${MAX_STEP_RETRIES} regeneration attempts.`);
                }
                continue; // retry the for loop
            }
            throw error; // re-throw other errors
        }
    }
    throw new Error(`Step ${stepName} failed to produce a result after retries.`);
};

export async function executeTurn(
    context: GameContext, 
    abortSignal: AbortSignal,
    onPartialResponse: (response: any) => void,
    onStreamingChunk: (text: string) => void
): Promise<GameResponse> {
    const { useMultiStepRequests } = context.gameSettings;

    if (useMultiStepRequests === false) {
        let response = await executeApiStep(
            'StepSimpleFullResponse',
            mainPromptModule.getStepSimpleFullResponse,
            worldLogic + narrativeStyle,
            context,
            null,
            abortSignal,
            onPartialResponse,
            onStreamingChunk
        );
        if (context.gameSettings.adultMode) {
            response = recursivelyRemoveTildes(response);
        }
        return response;
    }

    // --- Multi-Step Path (default behavior) ---
    let partialResponse: PartialResponseWithFlags = await executeApiStep(
        'Step0_AnalysisAndPlanning',
        mainPromptModule.getStep0,
        worldLogic,
        context,
        null,
        abortSignal,
        onPartialResponse,
        onStreamingChunk
    );
    onPartialResponse(partialResponse);
    
    if (partialResponse._internal_flags_?.needsSelfCorrection) {
        partialResponse = await executeApiStep(
            'Step0_5_Verification',
            mainPromptModule.getStep0_5,
            worldLogic,
            context,
            partialResponse,
            abortSignal,
            onPartialResponse,
            onStreamingChunk
        );
        onPartialResponse(partialResponse);
    }

    let finalResponse: GameResponse;
    const flags = partialResponse._internal_flags_;
    
    if (flags?.isSimpleTurn) {
        finalResponse = await executeApiStep(
            'StepSimpleFullResponse',
            mainPromptModule.getStepSimpleFullResponse,
            narrativeStyle,
            context,
            partialResponse,
            abortSignal,
            onPartialResponse,
            onStreamingChunk
        );
    } else {
        const steps = [
            { name: 'Step1_NarrativeGeneration', getPrompt: mainPromptModule.getStep1, guide: narrativeStyle, condition: () => true },
            { name: 'Step2_CoreState', getPrompt: mainPromptModule.getStep2, guide: "", condition: () => true },
            { name: 'Step3_Combat', getPrompt: mainPromptModule.getStep3, guide: "", condition: (f: InternalFlags) => f.isCombatActive },
            { name: 'Step4_NPC', getPrompt: mainPromptModule.getStep4, guide: narrativeStyle, condition: (f: InternalFlags) => f.needsNPCProcessing },
            { name: 'Step5_Inventory', getPrompt: mainPromptModule.getStep5, guide: "", condition: (f: InternalFlags) => f.needsInventoryProcessing },
            { name: 'Step6_Finalization', getPrompt: mainPromptModule.getStep6, guide: "", condition: () => true },
        ];
        
        let accumulatedResponse: any = partialResponse;
        const stepsToRun = flags ? steps.filter(step => step.condition(flags)) : steps;

        for (const step of stepsToRun) {
            if (abortSignal.aborted) throw new Error('Aborted');
            
            const stepResponse = await executeApiStep(
                step.name,
                step.getPrompt,
                step.guide,
                context,
                accumulatedResponse,
                abortSignal,
                onPartialResponse,
                onStreamingChunk
            );
            
            accumulatedResponse = { ...accumulatedResponse, ...stepResponse };
            onPartialResponse(accumulatedResponse);
        }
        
        finalResponse = accumulatedResponse as GameResponse;
    }
    
    if (context.gameSettings.adultMode) {
        finalResponse = recursivelyRemoveTildes(finalResponse);
    }
    
    return finalResponse;
}

export async function askGmQuestion(
    context: GameContext, 
    abortSignal: AbortSignal,
    onStreamingChunk: (text: string) => void
): Promise<GameResponse> {
    let response: GameResponse = await executeApiStep(
        'StepQuestion_CorrectionAndClarification',
        mainPromptModule.getStepQuestion,
        worldLogic,
        context,
        null,
        abortSignal,
        () => {}, // No partial responses for single-step question
        onStreamingChunk
    );
    
    if (context.gameSettings.adultMode) {
        response = recursivelyRemoveTildes(response);
    }

    return response;
}

export async function getMusicSuggestionFromAi(
    context: GameContext,
    youtubeApiKey: string,
    previousQueries: string[]
): Promise<{ videoIds: string[]; reasoning: string; searchQuery: string } | null> {
    
    // Step 1: Get search query and reasoning from Gemini
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

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            searchQuery: {
                type: Type.STRING,
                description: 'A few concise keywords for a YouTube search for ambient, instrumental music that fits the mood.',
            },
            reasoning: {
                type: Type.STRING,
                description: 'A brief, one-sentence justification for the music choice.',
            },
        },
        required: ["searchQuery", "reasoning"],
    };

    let suggestion: { searchQuery: string; reasoning: string } | null = null;
    try {
        const apiKey = context.gameSettings.geminiApiKey || process.env.API_KEY;
        if (!apiKey) {
            throw new Error("Gemini API Key not found.");
        }
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });
        
        const textResponse = response.text;
        let jsonStr = textResponse.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7);
        }
        if (jsonStr.endsWith('```')) {
            jsonStr = jsonStr.substring(0, jsonStr.length - 3);
        }
        
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
        // This case should be rare if the above try/catch is improved
        throw new Error("The AI returned an empty suggestion.");
    }

    // Step 2: Use the search query to find a video on YouTube
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
