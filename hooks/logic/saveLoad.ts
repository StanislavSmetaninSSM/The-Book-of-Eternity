import React from 'react';
// FIX: Imported all necessary types from the newly defined types.ts to resolve multiple import errors.
import { GameState, GameContext, ChatMessage, SaveFile, DBSaveSlotInfo } from '../../types';
import { saveGameToFile, loadGameFromFile, saveToDB, loadFromDB, getAutosaveTimestampFromDB, saveToDBSlot, loadFromDBSlot, listDBSlots, deleteDBSlot } from '../../utils/fileManager';

type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

export const createSaveLoadManager = (
    {
        gameContextRef,
        gameStateRef,
        gameHistory,
        gameLog,
        combatLog,
        lastJsonResponse,
        sceneImagePrompt,
        restoreFromSaveData,
        t,
        setAutosaveTimestamp,
        setDbSaveSlots,
        cleanupNetwork
    }: {
        gameContextRef: React.MutableRefObject<GameContext | null>,
        gameStateRef: React.MutableRefObject<GameState | null>,
        gameHistory: ChatMessage[],
        gameLog: string[],
        combatLog: string[],
        lastJsonResponse: string | null,
        sceneImagePrompt: string | null,
        restoreFromSaveData: (data: SaveFile) => void,
        t: TFunction,
        setAutosaveTimestamp: React.Dispatch<React.SetStateAction<string | null>>,
        setDbSaveSlots: React.Dispatch<React.SetStateAction<DBSaveSlotInfo[]>>,
        cleanupNetwork: () => void,
    }
) => {
    const packageSaveData = (gameState: GameState): SaveFile | null => {
        if (!gameContextRef.current || !gameState) {
            return null;
        }
        return {
            gameContext: gameContextRef.current,
            gameState: gameState,
            gameHistory: gameHistory,
            gameLog: gameLog,
            combatLog: combatLog,
            lastJsonResponse: lastJsonResponse,
            sceneImagePrompt: sceneImagePrompt,
            timestamp: new Date().toISOString(),
        };
    };

    const autosave = async (saveData: SaveFile) => {
        if (saveData) {
            try {
                await saveToDB(saveData);
                setAutosaveTimestamp(saveData.timestamp);
            } catch (e) {
                console.error("Autosave to DB failed", e);
            }
        }
    };

    const saveGame = async () => {
        const saveData = packageSaveData(gameStateRef.current!);
        if (saveData) {
            saveGameToFile(saveData, t);
        }
    };

    const loadGame = async (): Promise<boolean> => {
        // ФИКС: НЕ очищать сеть если это сетевая игра
        const currentGameState = gameStateRef.current;
        if (!currentGameState || currentGameState.networkRole === 'none') {
            console.log("🔌 CLEANUP: Cleaning up network for local game load");
            cleanupNetwork();
        } else {
            console.log("🌐 NETWORK: Preserving network connection for multiplayer game");
        }

        const data = await loadGameFromFile(t);
        if (data) {
            restoreFromSaveData(data);
            return true;
        }
        return false;
    };

    const loadAutosave = async (): Promise<boolean> => {
        // ФИКС: НЕ очищать сеть если это сетевая игра
        const currentGameState = gameStateRef.current;
        if (!currentGameState || currentGameState.networkRole === 'none') {
            console.log("🔌 CLEANUP: Cleaning up network for local autosave load");
            cleanupNetwork();
        } else {
            console.log("🌐 NETWORK: Preserving network connection for multiplayer autosave");
        }

        const data = await loadFromDB();
        if (data) {
            restoreFromSaveData(data);
            return true;
        }
        alert(t("No autosave data found."));
        return false;
    };
    
    const refreshDbSaveSlots = async () => {
        try {
            const slots = await listDBSlots();
            setDbSaveSlots(slots);
        } catch (e) {
            console.error("Failed to refresh DB save slots", e);
        }
    };

    const saveGameToSlot = async (slotId: number) => {
        const saveData = packageSaveData(gameStateRef.current!);
        if (saveData) {
            try {
                await saveToDBSlot(slotId, saveData);
                await refreshDbSaveSlots();
                alert(t('Game saved to slot {slotId}.', { slotId }));
            } catch(e) {
                console.error("Save to slot failed", e);
                alert(t('Failed to save game.'));
            }
        }
    };

    const loadGameFromSlot = async (slotId: number): Promise<boolean> => {
        // ФИКС: НЕ очищать сеть если это сетевая игра
        const currentGameState = gameStateRef.current;
        if (!currentGameState || currentGameState.networkRole === 'none') {
            console.log("🔌 CLEANUP: Cleaning up network for slot load");
            cleanupNetwork();
        } else {
            console.log("🌐 NETWORK: Preserving network connection for multiplayer slot load");
        }

        try {
            const data = await loadFromDBSlot(slotId);
            if (data) {
                restoreFromSaveData(data);
                return true;
            }
            alert(t('No data found in this slot.'));
            return false;
        } catch (e) {
            console.error("Load from slot failed", e);
            alert(t('Failed to load game.'));
            return false;
        }
    };

    const deleteGameSlot = async (slotId: number) => {
        try {
            await deleteDBSlot(slotId);
            await refreshDbSaveSlots();
            alert(t('Save slot {slotId} deleted.', { slotId }));
        } catch(e) {
            console.error("Delete slot failed", e);
            alert(t('Failed to delete save slot.'));
        }
    };

    return {
        packageSaveData,
        autosave,
        saveGame,
        loadGame,
        loadAutosave,
        saveGameToSlot,
        loadGameFromSlot,
        deleteGameSlot,
        refreshDbSaveSlots
    };
};