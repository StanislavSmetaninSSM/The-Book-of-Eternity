import { GameContext, GameResponse } from '../types';
// @ts-ignore
import * as mainPromptModule from '../prompts/mainPromptModule.js';
// @ts-ignore
import narrativeStyleGuide from '../prompts/narrativeStyleGuide.js';
// @ts-ignore
import worldLogicGuide from '../prompts/worldLogicGuide.js';
import { callGenerativeApi, RegenerationRequiredError } from './gemini';

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