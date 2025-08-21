
import { GameState, ChatMessage, NPC, Faction } from '../types';

export const deleteMessage = (indexToDelete: number, currentHistory: ChatMessage[]): ChatMessage[] => {
    return currentHistory.filter((_, index) => index !== indexToDelete);
};

export const clearHalfHistory = (currentHistory: ChatMessage[]): ChatMessage[] => {
    if (currentHistory.length < 2) return [];
    const halfIndex = Math.ceil(currentHistory.length / 2);
    return currentHistory.slice(halfIndex);
};

export const deleteLogs = (): string[] => {
    return [];
};

export const forgetNpc = (npcIdToForget: string, currentState: GameState): GameState => {
    const newState = JSON.parse(JSON.stringify(currentState));
    newState.encounteredNPCs = newState.encounteredNPCs.filter((npc: NPC) => npc.NPCId !== npcIdToForget);
    return newState;
};

export const forgetFaction = (factionIdToForget: string, currentState: GameState): GameState => {
    const newState = JSON.parse(JSON.stringify(currentState));
    newState.encounteredFactions = newState.encounteredFactions.filter((faction: Faction) => faction.factionId !== factionIdToForget);
    return newState;
};