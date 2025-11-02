
//DO NOT USE ./components/{componentName}
//USE ./{componentName} since we are already INSIDE components folder
//DO NOT DELETE THESE COMMENTS!

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
// FIX: Add NetworkChatMessage, NetworkMessage types.
// FIX: Import CinemaFrame to resolve 'Cannot find name' errors.
import { GameState, GameContext, ChatMessage, SaveFile, WorldState, GameSettings, Language, DBSaveSlotInfo, PlayerCharacter, Location, NPC, Faction, Quest, Wound, CustomState, WorldStateFlag, UnlockedMemory, WorldEvent, Effect, NetworkRole, PeerInfo, NetworkMessage, GameResponse, CollectiveActionState, SimultaneousActionState, Item, CompletedActivity, LocationStorage, AdjacencyMapEntry, Project, CompletedProject, StructuredBonus, ActiveThreat, Cinematic, FactionRank, NetworkChatMessage, CinemaFrame } from '../types';
import Peer, { DataConnection } from 'peerjs';
import { useLocalization } from '../context/LocalizationContext';
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold, Modality } from '@google/genai';
import { getCinemaPrompt, getContinueCinemaPrompt } from '../prompts/cinemaPrompt';
import narrativeStyleGuide from '../prompts/narrativeStyleGuide.js';

import { formatError } from '../utils/errorUtils';

import { createTurnManager } from './logic/turn';
import { createSaveLoadManager } from './logic/saveLoad';
import { createInventoryActions } from './logic/inventoryActions';
import { createPlayerActionsManager } from './logic/playerActions';
import { createMusicManager } from './logic/music';
import { createMultiplayerManager } from './logic/multiplayer';
import { checkAndApplyLevelUp, processAndApplyResponse } from '../utils/responseProcessor';
import { recalculateAllWeights } from '../utils/inventoryManager';
// FIX: Imported `calculateDate` and `calculateTotalMinutes` to support the new calendar system's date calculations.
import { recalculateDerivedStats, buildNextContext, createInitialContext, calculateDate, calculateTotalMinutes } from '../utils/gameContext';
import { getAutosaveTimestampFromDB, listDBSlots } from '../utils/fileManager';
// FIX: Import `playNotificationSound` to fix the 'Cannot find name' error.
import { initializeAndPreviewSound, playNotificationSound } from '../utils/soundManager';
import { createNewPlayerCharacter } from '../utils/characterManager';
import { generateFactionColor } from '../utils/colorUtils';
import { executeCancellableJsonGeneration, RegenerationRequiredError } from '../utils/gemini';
import { deepStripModerationSymbols } from '../utils/textUtils';
import { gameData } from '../utils/localizationGameData';


interface UseGameLogicProps {
    language: Language;
    setLanguage: (lang: Language) => void;
}

const isObject = (item: any): item is object => {
    return (item && typeof item === 'object' && !Array.isArray(item));
};

const asArray = <T>(value: T | T[] | null | undefined): T[] => {
    if (value === null || value === undefined) {
        return [];
    }
    if (Array.isArray(value)) {
        return value.filter(item => item !== null && item !== undefined);
    }
    return [value];
};

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const formatTime = (totalMinutes: number) => {
    const hours = Math.floor((totalMinutes / 60) % 24);
    const minutes = Math.floor(totalMinutes % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};


export function useGameLogic({ language, setLanguage }: UseGameLogicProps) {
    const [gameState, _setGameState] = useState<GameState | null>(null);
    const gameStateRef = useRef(gameState);

    const setGameState = useCallback((action: React.SetStateAction<GameState | null>) => {
        _setGameState(prevState => {
            const newState = typeof action === 'function' ? (action as (prevState: GameState | null) => GameState | null)(prevState) : action;

            if (newState) {
                if (Array.isArray(newState.encounteredNPCs)) {
                    newState.encounteredNPCs = newState.encounteredNPCs.filter(isObject);
                }
                if (Array.isArray(newState.encounteredFactions)) {
                    newState.encounteredFactions = newState.encounteredFactions.filter(isObject);
                }
            }

            gameStateRef.current = newState;
            return newState;
        });
    }, []);

    const [worldState, setWorldState] = useState<WorldState | null>(null);
    const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
    const [superInstructions, setSuperInstructions] = useState<string>('');
    const [gameHistory, setGameHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastJsonResponse, setLastJsonResponse] = useState<string | null>(null);
    const [lastRequestJson, setLastRequestJson] = useState<string | null>(null);
    const [gameLog, setGameLog] = useState<string[]>([]);
    const [combatLog, setCombatLog] = useState<string[]>([]);
    const [sceneImagePrompt, setSceneImagePrompt] = useState<string | null>(null);
    const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
    const [worldMap, setWorldMap] = useState<Record<string, Location>>({});
    const [visitedLocations, setVisitedLocations] = useState<Location[]>([]);
    const [turnNumber, setTurnNumber] = useState<number | null>(null);
    const [autosaveTimestamp, setAutosaveTimestamp] = useState<string | null>(null);
    const [dbSaveSlots, setDbSaveSlots] = useState<DBSaveSlotInfo[]>([]);
    const [musicVideoIds, setMusicVideoIds] = useState<string[] | null>(null);
    const [isMusicLoading, setIsMusicLoading] = useState(false);
    const [isMusicPlayerVisible, setIsMusicPlayerVisible] = useState(false);
    const previousMusicQueries = useRef<string[]>([]);

    const [isGeneratingCinema, setIsGeneratingCinema] = useState(false);
    const [cinemaGenerationProgress, setCinemaGenerationProgress] = useState({ current: 0, total: 0, message: '' });
    const [playingCinematic, setPlayingCinematic] = useState<Cinematic | null>(null);
    const [extendingCinematicId, setExtendingCinematicId] = useState<string | null>(null);

    const [lastTurnSaveFile, setLastTurnSaveFile] = useState<SaveFile | null>(null);

    const [currentStep, setCurrentStep] = useState<string | null>(null);
    const [currentModel, setCurrentModel] = useState<string | null>(null);
    const [turnTime, setTurnTime] = useState<number | null>(null);
    const turnStartTimeRef = useRef<number | null>(null);

    const peerRef = useRef<Peer | null>(null);
    const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
    const hostConnectionRef = useRef<DataConnection | null>(null);
    const lastBroadcastedStateRef = useRef<{ turn: number; playerIndex: number } | null>(null);
    const lastBroadcastedCoopState = useRef<string | null>(null);

    const wasLoadingRef = useRef(false);

    const [networkChatHistory, setNetworkChatHistory] = useState<NetworkChatMessage[]>([]);

    useEffect(() => {
        if (wasLoadingRef.current && !isLoading) {
            if (gameSettings?.notificationSound) {
                playNotificationSound();
            }
        }
        wasLoadingRef.current = isLoading;
    }, [isLoading, gameSettings]);

    const { t } = useLocalization();
    const gameContextRef = useRef<GameContext | null>(null);

    useEffect(() => {
        if (gameState && gameContextRef.current) {
            // This effect is the SINGLE SOURCE OF TRUTH for synchronizing gameState to gameContextRef.
            // All direct mutations of gameContextRef have been removed from other callbacks.
            gameContextRef.current.playerCharacter = gameState.playerCharacter;
            gameContextRef.current.players = gameState.players;
            gameContextRef.current.encounteredNPCs = gameState.encounteredNPCs;
            gameContextRef.current.encounteredFactions = gameState.encounteredFactions;
            gameContextRef.current.activeQuests = gameState.activeQuests;
            gameContextRef.current.completedQuests = gameState.completedQuests;
            gameContextRef.current.worldStateFlags = gameState.worldStateFlags;
            gameContextRef.current.worldEventsLog = gameState.worldEventsLog;
            gameContextRef.current.playerCustomStates = gameState.playerCustomStates;

            // Sync network state to context
            gameContextRef.current.networkRole = gameState.networkRole;
            gameContextRef.current.peers = gameState.peers;
            gameContextRef.current.isConnectedToHost = gameState.isConnectedToHost;
        }
        if (gameSettings && gameContextRef.current) {
            gameContextRef.current.gameSettings = gameSettings;
        }
        if (superInstructions && gameContextRef.current) {
            gameContextRef.current.superInstructions = superInstructions;
        }
    }, [gameState, gameSettings, superInstructions]);

    const restoreFromSaveData = useCallback((data: SaveFile, isNetworkSync: boolean = false, networkIdentityOverride?: { role: NetworkRole; myPeerId: string; hostPeerId: string }) => {
        // --- BACKWARD COMPATIBILITY MIGRATION FOR EVENT LOGS ---
        const migrateLocationEvents = (loc: any) => {
            if (loc && loc.lastEventsDescription && typeof loc.lastEventsDescription === 'string' && !loc.eventDescriptions) {
                console.warn(`Migrating old 'lastEventsDescription' for location: ${loc.name || loc.locationId}`);
                loc.eventDescriptions = loc.lastEventsDescription.split('\n\n').filter((e: string) => e.trim());
                delete loc.lastEventsDescription;
            }
        };

        migrateLocationEvents(data.gameContext?.currentLocation);
        if (data.gameContext?.worldMap) {
            Object.values(data.gameContext.worldMap).forEach(migrateLocationEvents);
        }
        if (data.gameContext?.visitedLocations) {
            data.gameContext.visitedLocations.forEach(migrateLocationEvents);
        }
        if (data.gameState?.currentLocationData) {
            migrateLocationEvents(data.gameState.currentLocationData);
        }
        // --- END EVENT LOG MIGRATION ---

        // --- BACKWARD COMPATIBILITY MIGRATION FOR DIFFICULTY PROFILES ---
        const migrateDifficultyProfile = (obj: any) => {
            if (obj && obj.difficultyProfile && !obj.internalDifficultyProfile) {
                console.warn(`Migrating old 'difficultyProfile' for: ${obj.name || obj.locationId}`);
                obj.internalDifficultyProfile = JSON.parse(JSON.stringify(obj.difficultyProfile));
                obj.externalDifficultyProfile = JSON.parse(JSON.stringify(obj.difficultyProfile));
                delete obj.difficultyProfile;
            }
        };
        const migrateAdjacencyMap = (adjMap: any[] | undefined) => {
            if (!adjMap) return;
            adjMap.forEach((link: any) => {
                if (link && link.estimatedDifficultyProfile && !link.estimatedInternalDifficultyProfile) {
                    console.warn(`Migrating old 'estimatedDifficultyProfile' for link: ${link.name}`);
                    link.estimatedInternalDifficultyProfile = JSON.parse(JSON.stringify(link.estimatedDifficultyProfile));
                    link.estimatedExternalDifficultyProfile = JSON.parse(JSON.stringify(link.estimatedDifficultyProfile));
                    delete link.estimatedDifficultyProfile;
                }
            });
        };

        // Migrate all locations
        const allLocationsToMigrate = [
            data.gameContext?.currentLocation,
            ...(Object.values(data.gameContext?.worldMap || {})),
            ...(data.gameContext?.visitedLocations || [])
        ].filter(Boolean);

        allLocationsToMigrate.forEach(loc => {
            migrateDifficultyProfile(loc);
            migrateAdjacencyMap(loc.adjacencyMap);
        });

        // Migrate worldMapUpdates in previousTurnResponse
        const worldMapUpdates = data.gameContext?.previousTurnResponse?.worldMapUpdates;
        if (worldMapUpdates) {
            asArray(worldMapUpdates.locationUpdates).forEach((update: any) => {
                if (update && update.newDifficultyProfile && !update.newInternalDifficultyProfile) {
                    update.newInternalDifficultyProfile = JSON.parse(JSON.stringify(update.newDifficultyProfile));
                    update.newExternalDifficultyProfile = JSON.parse(JSON.stringify(update.newDifficultyProfile));
                    delete update.newDifficultyProfile;
                }
            });
            asArray(worldMapUpdates.newLocations).forEach((newLoc: any) => {
                migrateDifficultyProfile(newLoc);
            });
        }
        // --- END MIGRATION ---

        // --- EXPERIENCE MIGRATION ---
        const experienceForLevelTransition = (level: number): number => {
            if (level < 1) return 100;
            const baseXP = 100;
            return Math.floor(baseXP * Math.pow(level, 2.5));
        };

        const migrateExperience = <T extends PlayerCharacter | NPC>(character: T): T => {
            if (!character || typeof character.level !== 'number' || character.level < 1) {
                return character;
            }

            const currentExperience = Number(character.experience) || 0;
            const currentExpForNextLevel = Number(character.experienceForNextLevel) || 0;

            const correctExpForNextLevel = experienceForLevelTransition(character.level);

            if (currentExpForNextLevel > 0 && currentExpForNextLevel !== correctExpForNextLevel) {
                console.warn(`Migrating experience for ${character.name} (Lvl ${character.level}). Old next level XP: ${currentExpForNextLevel}, New: ${correctExpForNextLevel}`);

                const oldProportion = currentExperience / currentExpForNextLevel;
                const newExperience = Math.floor(correctExpForNextLevel * oldProportion);

                character.experience = newExperience;
                character.experienceForNextLevel = correctExpForNextLevel;
            } else if (currentExpForNextLevel === 0 && correctExpForNextLevel > 0 && character.level > 0) {
                character.experienceForNextLevel = correctExpForNextLevel;
            }
            return character;
        };
        // --- END EXPERIENCE MIGRATION ---

        // --- LOCATION STORAGE ID MIGRATION ---
        const fixStorageIdsInLocation = (loc: Location | undefined | null): void => {
            if (!loc || !loc.locationStorages) return;
            loc.locationStorages = loc.locationStorages.map(storage => {
                if (storage && !storage.storageId) {
                    console.warn(`Found a location storage named "${storage.name}" without a storageId. Generating a new one.`);
                    return { ...storage, storageId: generateId('storage') };
                }
                return storage;
            }).filter((s): s is LocationStorage => !!s);
        };

        fixStorageIdsInLocation(data.gameContext?.currentLocation);
        if (data.gameContext?.worldMap) {
            Object.values(data.gameContext.worldMap).forEach(fixStorageIdsInLocation);
        }
        if (data.gameContext?.visitedLocations) {
            data.gameContext.visitedLocations.forEach(fixStorageIdsInLocation);
        }
        if (data.gameState?.currentLocationData) {
            fixStorageIdsInLocation(data.gameState.currentLocationData);
        }
        // --- END LOCATION STORAGE ID MIGRATION ---

        // --- FACTION RANK MIGRATION ---
        const migrateFactionRanks = (faction: Partial<Faction> | undefined | null) => {
            if (faction && (faction as any).ranks && Array.isArray((faction as any).ranks)) {
                console.warn(`Migrating old array-based rank structure for faction: ${faction.name}`);
                const oldRanks = (faction as any).ranks as FactionRank[];
                faction.ranks = {
                    branches: [
                        {
                            branchId: 'core',
                            displayName: t('core_path_name'),
                            isCoreBranch: true,
                            ranks: oldRanks
                        }
                    ]
                };
            }
        };

        if (data.gameState?.encounteredFactions) {
            data.gameState.encounteredFactions.forEach(migrateFactionRanks);
        }
        if (data.gameContext?.encounteredFactions) {
            data.gameContext.encounteredFactions.forEach(migrateFactionRanks);
        }
        if (data.gameContext?.previousTurnResponse?.factionDataChanges) {
            data.gameContext.previousTurnResponse.factionDataChanges.forEach(migrateFactionRanks);
        }
        // --- END FACTION RANK MIGRATION ---

        // --- CALENDAR MIGRATION ---
        if (data.gameContext.gameSettings.gameWorldInformation && !data.gameContext.gameSettings.gameWorldInformation.calendar) {
            console.warn("Save data missing calendar, adding default.");
            data.gameContext.gameSettings.gameWorldInformation.calendar = gameData.fantasy.calendar;
        }
        if (data.gameContext.worldState && !data.gameContext.worldState.date) {
            console.warn("Save data missing date, calculating from total minutes.");
            const calendar = data.gameContext.gameSettings.gameWorldInformation.calendar!;
            data.gameContext.worldState.date = calculateDate(data.gameContext.worldState.currentTimeInMinutes, calendar);
        }
        // --- END CALENDAR MIGRATION ---

        gameContextRef.current = data.gameContext;
        const loadedGameState = data.gameState;

        // --- NETWORK STATE RESET ON LOAD ---
        if (!isNetworkSync) {
             if (loadedGameState.networkRole === 'host' || loadedGameState.networkRole === 'player' || loadedGameState.networkRole === 'spectator') {
                console.log(`Loaded a network game save (role: ${loadedGameState.networkRole}). Resetting to local game state.`);
                loadedGameState.networkRole = 'none';
                loadedGameState.myPeerId = null;
                loadedGameState.hostPeerId = null;
                loadedGameState.peers = [];
                loadedGameState.isConnectedToHost = true; // It's a local game now

                if (gameContextRef.current) {
                    gameContextRef.current.networkRole = 'none';
                    gameContextRef.current.peers = [];
                    gameContextRef.current.isConnectedToHost = true;
                }
            }
        } else {
             if (networkIdentityOverride) {
                console.log("Network sync with identity override detected.");
                loadedGameState.networkRole = networkIdentityOverride.role;
                loadedGameState.myPeerId = networkIdentityOverride.myPeerId;
                loadedGameState.hostPeerId = networkIdentityOverride.hostPeerId;
                loadedGameState.isConnectedToHost = true;
                console.log(`🔧 OVERRIDE: Role=${loadedGameState.networkRole}, MyID=${loadedGameState.myPeerId}`);
            } else {
                console.log("Network sync detected - preserving network role from current state");
                const currentGameState = gameStateRef.current;
                if (currentGameState && (currentGameState.networkRole === 'player' || currentGameState.networkRole === 'host')) {
                    loadedGameState.networkRole = currentGameState.networkRole;
                    loadedGameState.myPeerId = currentGameState.myPeerId;
                    loadedGameState.hostPeerId = currentGameState.hostPeerId;
                    loadedGameState.peers = currentGameState.peers; 
                    loadedGameState.isConnectedToHost = currentGameState.isConnectedToHost;
                    console.log(`🔧 PRESERVED: Role=${currentGameState.networkRole}, MyID=${currentGameState.myPeerId}`);
                } else {
                     console.log(`🏠 NEW CLIENT?: Using loaded network settings from save data`);
                }
            }
        }
        // --- END NETWORK STATE RESET ---

        // --- APPLY EXPERIENCE MIGRATION ---
        if (loadedGameState.playerCharacter) {
            loadedGameState.playerCharacter = migrateExperience(loadedGameState.playerCharacter);
        }
        if (loadedGameState.players) {
            loadedGameState.players = loadedGameState.players.map(p => p ? migrateExperience(p) : p).filter((p): p is PlayerCharacter => !!p);
        }
        if (loadedGameState.encounteredNPCs) {
            loadedGameState.encounteredNPCs = loadedGameState.encounteredNPCs.map(npc => npc ? migrateExperience(npc) : npc).filter((n): n is NPC => !!n);
        }
        // --- END APPLY EXPERIENCE MIGRATION ---

        if (loadedGameState.playerCharacter && !loadedGameState.playerCharacter.playerId) {
            console.warn("Loaded playerCharacter is missing a playerId. Generating a new one.");
            loadedGameState.playerCharacter.playerId = generateId('player');
        }

        if (loadedGameState.players) {
            loadedGameState.players = loadedGameState.players.map(p => {
                if (p && !p.playerId) {
                    console.warn(`Loaded player in players array (name: ${p.name}) is missing a playerId. Generating a new one.`);
                    return { ...p, playerId: generateId('player') };
                }
                return p;
            }).filter((p): p is PlayerCharacter => !!p);
        }

        const fixTextContentInInventory = (inventory?: Item[]): Item[] | undefined => {
            if (!Array.isArray(inventory)) return inventory;
            return inventory.map(item => {
                if (item && typeof item.textContent === 'string') {
                    return { ...item, textContent: [item.textContent] };
                }
                return item;
            }).filter((i): i is Item => !!i);
        };

        const processCharacterInventories = <T extends PlayerCharacter | NPC>(characters: T[]): T[] => {
            if (!Array.isArray(characters)) return characters;
            return characters.map(c => {
                if (c) {
                    c.inventory = fixTextContentInInventory(c.inventory) || [];
                }
                return c;
            });
        };

        if (loadedGameState.playerCharacter) {
            loadedGameState.playerCharacter.inventory = fixTextContentInInventory(loadedGameState.playerCharacter.inventory) || [];
        }
        if (loadedGameState.players) {
            loadedGameState.players = processCharacterInventories(loadedGameState.players);
        }
        if (loadedGameState.encounteredNPCs) {
            loadedGameState.encounteredNPCs = processCharacterInventories(loadedGameState.encounteredNPCs);
        }
        if (loadedGameState.temporaryStash) {
            loadedGameState.temporaryStash = fixTextContentInInventory(loadedGameState.temporaryStash);
        }

        if (!loadedGameState.imageCache) {
            loadedGameState.imageCache = {};
        }

        if (!loadedGameState.cinematics) {
            loadedGameState.cinematics = [];
        }

        const originalFlags = loadedGameState.worldStateFlags;
        let processedFlags: WorldStateFlag[] = [];
        if (originalFlags) {
            if (Array.isArray(originalFlags)) {
                processedFlags = originalFlags;
            } else if (typeof originalFlags === 'object') {
                processedFlags = Object.keys(originalFlags).map(key => {
                    const flagData = (originalFlags as any)[key];
                    if (isObject(flagData) && !(flagData as any).flagId) {
                        return { ...flagData, flagId: key };
                    }
                    return flagData;
                }).filter(f => isObject(f));
            }
        }
        loadedGameState.worldStateFlags = processedFlags;

        if (loadedGameState.encounteredNPCs) {
            loadedGameState.encounteredNPCs = loadedGameState.encounteredNPCs.map(npc => {
                if (!npc || !npc.characteristics) {
                    return npc;
                }
                if (!npc.tags) {
                    npc.tags = [];
                }
                let updatedNpc = recalculateDerivedStats(npc);
                updatedNpc = recalculateAllWeights(updatedNpc);
                if (updatedNpc.totalWeight !== undefined && updatedNpc.maxWeight !== undefined) {
                    updatedNpc.isOverloaded = updatedNpc.totalWeight > updatedNpc.maxWeight;
                } else {
                    updatedNpc.isOverloaded = false;
                }
                if (updatedNpc.criticalExcessWeight === undefined) {
                    updatedNpc.criticalExcessWeight = 15;
                }
                return updatedNpc;
            }).filter(isObject) as NPC[];
        }

        if (loadedGameState.encounteredFactions) {
            loadedGameState.encounteredFactions = loadedGameState.encounteredFactions.map(faction => {
                if (faction && !faction.color) {
                    return { ...faction, color: generateFactionColor(faction.factionId || faction.name) };
                }
                return faction;
            }).filter(isObject) as Faction[];
        }

        if (!loadedGameState.players || !Array.isArray(loadedGameState.players) || loadedGameState.players.length === 0) {
            loadedGameState.players = [loadedGameState.playerCharacter];
        }
        if (loadedGameState.activePlayerIndex === undefined || loadedGameState.activePlayerIndex === null || loadedGameState.activePlayerIndex >= loadedGameState.players.length) {
            loadedGameState.activePlayerIndex = 0;
        }

        if (isNetworkSync && loadedGameState.networkRole === 'player' && loadedGameState.myPeerId) {
            const myPlayer = loadedGameState.players.find(p => p.playerId === loadedGameState.myPeerId);
            if (myPlayer) {
                loadedGameState.playerCharacter = myPlayer;
                console.log(`🎯 FIXED: Player character set to ${myPlayer.name} (${myPlayer.playerId})`);
                loadedGameState.playerNeedsToCreateCharacter = false;
            } else {
                console.warn(`🚫 WARNING: Player ${loadedGameState.myPeerId} not found in players array! Triggering character creation.`);
                loadedGameState.playerNeedsToCreateCharacter = true;
            }
        } else if (isNetworkSync && loadedGameState.networkRole === 'host' && loadedGameState.myPeerId) {
            const myPlayer = loadedGameState.players.find(p => p.playerId === loadedGameState.myPeerId);
            if (myPlayer) {
                loadedGameState.playerCharacter = myPlayer;
                console.log(`🏠 HOST: Host character set to ${myPlayer.name} (${myPlayer.playerId})`);
            } else {
                console.warn(`🚫 WARNING: Host ${loadedGameState.myPeerId} not found in players array!`);
            }
        }

        let updatedPc = loadedGameState.playerCharacter;
        let levelUpLogs: string[] = [];
        if (updatedPc) {
            updatedPc = recalculateDerivedStats(updatedPc);
            updatedPc = recalculateAllWeights(updatedPc);
            if (updatedPc.totalWeight !== undefined && updatedPc.maxWeight !== undefined) {
                updatedPc.isOverloaded = updatedPc.totalWeight > updatedPc.maxWeight;
            } else {
                updatedPc.isOverloaded = false;
            }
            if (updatedPc.criticalExcessWeight === undefined) {
                updatedPc.criticalExcessWeight = 15;
            }

            const result = checkAndApplyLevelUp(updatedPc, t);
            updatedPc = result.pc;
            levelUpLogs = result.logs;
        }

        let finalGameLog = data.gameLog || [];
        if (levelUpLogs.length > 0) {
            loadedGameState.playerCharacter = updatedPc;
            loadedGameState.players[loadedGameState.activePlayerIndex] = updatedPc;
            finalGameLog = [...finalGameLog, ...levelUpLogs];
        }

        const loadedSettings = data.gameContext.gameSettings;
        if (loadedSettings.keepLatestNpcJournals === undefined) {
            loadedSettings.keepLatestNpcJournals = false;
        }
        if (loadedSettings.latestNpcJournalsCount === undefined) {
            loadedSettings.latestNpcJournalsCount = 20;
        }
        if (loadedSettings.cooperativeGameType === undefined) {
            loadedSettings.cooperativeGameType = 'None';
        }
        if (loadedSettings.doNotUseWorldEvents === undefined) {
            loadedSettings.doNotUseWorldEvents = false;
        }
        if (loadedSettings.useGoogleSearch === undefined) {
            loadedSettings.useGoogleSearch = false;
        }
        if (loadedSettings.pollinationsImageModel === undefined || (loadedSettings.pollinationsImageModel as any) === 'kontext') {
            loadedSettings.pollinationsImageModel = 'flux';
        }
        if (loadedSettings.useNanoBananaFallback === undefined) {
            loadedSettings.useNanoBananaFallback = false;
        }
        if (loadedSettings.useNanoBananaPrimary === undefined) {
            loadedSettings.useNanoBananaPrimary = false;
        }

        console.log(`🔄 RESTORE DEBUG: About to restore game state`);
        console.log(`  - Is Network Sync: ${isNetworkSync}`);
        console.log(`  - Loaded Network Role: ${loadedGameState.networkRole}`);
        console.log(`  - Loaded Active Player Index: ${loadedGameState.activePlayerIndex}`);
        console.log(`  - Loaded Players:`, loadedGameState.players.map(p => ({ name: p.name, id: p.playerId })));
        console.log(`  - Loaded My Peer ID: ${loadedGameState.myPeerId}`);

        if (!isNetworkSync) {
            console.log("🔌 CLEANUP: Cleaning up network connections for local game load");
            if (hostConnectionRef.current) {
                hostConnectionRef.current.close();
                hostConnectionRef.current = null;
            }
            connectionsRef.current.forEach(conn => conn.close());
            connectionsRef.current.clear();
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
        } else {
            console.log("🌐 NETWORK SYNC: Preserving network connections");
        }

        setGameState(loadedGameState);
        setWorldState(data.gameContext.worldState);
        setGameSettings(loadedSettings);
        setSuperInstructions(data.gameContext.superInstructions || '');
        setLanguage(loadedSettings.language || 'en');
        setGameHistory(data.gameHistory as ChatMessage[]);
        setGameLog(finalGameLog);
        setCombatLog(data.combatLog ?? []);
        setLastJsonResponse(data.lastJsonResponse);
        setSceneImagePrompt(data.sceneImagePrompt);
        setWorldMap(data.gameContext.worldMap ?? {});
        setVisitedLocations(data.gameContext.visitedLocations ?? []);
        setTurnNumber(data.gameContext.currentTurnNumber);

        // Forcefully reset loading/error state after any load operation.
        // This ensures the UI is responsive and prevents getting stuck in a "waiting" state.
        setIsLoading(false);
        setError(null);

    }, [setLanguage, t, setGameState, setWorldState, setGameSettings, setSuperInstructions, setGameHistory, setGameLog, setCombatLog, setLastJsonResponse, setSceneImagePrompt, setWorldMap, setVisitedLocations, setTurnNumber, setIsLoading, setError]);

    const abortControllerRef = useRef<AbortController | null>(null);
    const lastSavedTurnRef = useRef<number | null>(null);
    const prevPlayersLengthRef = useRef<number | undefined>(undefined);

    const onImageGenerated = useCallback((cacheKey: string, base664: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const newCache = { ...(prev.imageCache || {}), [cacheKey]: base664 };
            return { ...prev, imageCache: newCache };
        });
    }, [setGameState]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const ts = await getAutosaveTimestampFromDB();
                setAutosaveTimestamp(ts);
                const slots = await listDBSlots();
                setDbSaveSlots(slots);
            } catch (e) {
                console.error("Failed to fetch initial save data from DB", e);
            }
        };
        fetchInitialData();
    }, []);

    const syncNewPeerRef = useRef((conn: DataConnection) => {
        console.warn("syncNewPeer called before initialization.");
    });
    const sendMessageRef = useRef((_message: string, _image?: { data: string; mimeType: string; } | null) => {
        console.warn("sendMessageRef called before initialization.");
    });

    const sendNetworkChatMessage = useCallback((content: string) => {
        const currentGameState = gameStateRef.current;
        if (!currentGameState || !currentGameState.myPeerId) return;

        let senderName: string;
        if (currentGameState.networkRole === 'host') {
            senderName = t('Host');
        } else {
            const senderPlayer = currentGameState.players.find(p => p.playerId === currentGameState!.myPeerId);
            senderName = senderPlayer ? senderPlayer.name : (currentGameState.peers.find(p => p.id === currentGameState!.myPeerId)?.name || `Player-${currentGameState.myPeerId.slice(-4)}`);
        }

        const chatMessage: NetworkChatMessage = {
            senderId: currentGameState.myPeerId,
            senderName: senderName,
            content: content,
            timestamp: Date.now()
        };

        const message: NetworkMessage = {
            type: 'chat_message',
            payload: chatMessage,
            senderId: currentGameState.myPeerId,
        };

        if (currentGameState.networkRole === 'host') {
            // Host adds to own history and broadcasts to everyone.
            setNetworkChatHistory(prev => [...prev, message.payload]);
            connectionsRef.current.forEach(conn => {
                conn.send(message);
            });
        } else if (currentGameState.networkRole === 'player' && hostConnectionRef.current) {
            // Client just sends to host. The host will broadcast it back to all clients.
            hostConnectionRef.current.send(message);
        }
    }, [t, setNetworkChatHistory]);

    const addPlayer = useCallback((creationData: PlayerCharacter | any) => {
        if (!gameSettings) return;

        const currentPartyLevel = gameStateRef.current?.playerCharacter.level || 1;

        const newPlayer: PlayerCharacter = creationData.playerId
            ? creationData
            : createNewPlayerCharacter(
                creationData,
                gameSettings,
                {
                    partyLevel: currentPartyLevel,
                    shareCharacteristics: gameSettings.multiplePersonalitiesSettings?.shareCharacteristics ?? false,
                    templatePlayer: creationData.templatePlayer
                }
            );

        setGameState(prevState => {
            if (!prevState) return null;
            const updatedPlayers = [...prevState.players, newPlayer];
            return { ...prevState, players: updatedPlayers };
        });

        setGameHistory(prevHistory => {
            const systemMessage: ChatMessage = {
                sender: 'system',
                content: t('player_joined', { name: newPlayer.name }),
            };
            return [...prevHistory, systemMessage];
        });

    }, [gameSettings, t, setGameState, setGameHistory]);

    const removePlayer = useCallback((playerIdToRemove: string) => {
        setGameState(prevState => {
            if (!prevState || prevState.players.length <= 1) return prevState;

            const playerToRemove = prevState.players.find(p => p.playerId === playerIdToRemove);
            if (!playerToRemove) return prevState;

            const newPlayers = prevState.players.filter(p => p.playerId !== playerIdToRemove);
            let newActivePlayerIndex = prevState.activePlayerIndex;
            const removedPlayerIndex = prevState.players.findIndex(p => p.playerId === playerIdToRemove);

            if (removedPlayerIndex < newActivePlayerIndex) {
                newActivePlayerIndex--;
            }
            else if (removedPlayerIndex === newActivePlayerIndex || newActivePlayerIndex >= newPlayers.length) {
                newActivePlayerIndex = 0;
            }
            newActivePlayerIndex = Math.max(0, Math.min(newPlayers.length - 1, newActivePlayerIndex));
            const newPc = newPlayers[newActivePlayerIndex];

            const newState = {
                ...prevState,
                players: newPlayers,
                activePlayerIndex: newActivePlayerIndex,
                playerCharacter: newPc,
            };

            const systemMessage: ChatMessage = {
                sender: 'system',
                content: t('player_removed', { name: playerToRemove.name }),
            };
            setGameHistory(prev => [...prev, systemMessage]);

            return newState;
        });
    }, [t, setGameState, setGameHistory]);

    const passTurnToPlayer = useCallback((targetPlayerIndex: number) => {
        setGameState(prevState => {
            if (!prevState || !gameSettings) return prevState;
            if (targetPlayerIndex === prevState.activePlayerIndex) return prevState;

            // ФИКС: Добавить проверки для сетевой игры
            if (prevState.networkRole !== 'none' && prevState.networkRole !== 'host') {
                console.warn("Non-host trying to pass turn in network game");
                return prevState;
            }

            // ФИКС: Валидация индексов игроков
            if (targetPlayerIndex < 0 || targetPlayerIndex >= prevState.players.length) {
                console.error(`Invalid targetPlayerIndex: ${targetPlayerIndex}, players length: ${prevState.players.length}`);
                return prevState;
            }

            // ФИКС: Проверка уникальности playerId перед обработкой
            const playerIds = new Set();
            for (const player of prevState.players) {
                if (playerIds.has(player.playerId)) {
                    console.error(`Duplicate playerId detected before turn pass: ${player.playerId}`);
                    return prevState;
                }
                playerIds.add(player.playerId);
            }

            const nextGameState = JSON.parse(JSON.stringify(prevState));

            const currentActivePlayerIndex = nextGameState.activePlayerIndex;
            const outgoingPlayerCharacterState = { ...nextGameState.playerCharacter };
            const outgoingPlayerSnapshot = nextGameState.players[currentActivePlayerIndex];

            // ФИКС: Проверить, что outgoingPlayerSnapshot существует
            if (!outgoingPlayerSnapshot) {
                console.error(`No player found at current active index: ${currentActivePlayerIndex}`);
                return prevState;
            }

            let updatedOutgoingSnapshot = { ...outgoingPlayerSnapshot, ...outgoingPlayerCharacterState };

            if (gameSettings.cooperativeGameType === 'MultiplePersonalities' && !gameSettings.multiplePersonalitiesSettings?.shareNpcReputation) {
                updatedOutgoingSnapshot.personalNpcReputations = nextGameState.encounteredNPCs.map((npc: NPC) => ({
                    NPCId: npc.NPCId,
                    relationshipLevel: npc.relationshipLevel,
                    isCompanion: npc.progressionType === 'Companion',
                }));
            }
            if (gameSettings.cooperativeGameType === 'MultiplePersonalities' && !gameSettings.multiplePersonalitiesSettings?.shareFactionReputation) {
                updatedOutgoingSnapshot.personalFactionReputations = nextGameState.encounteredFactions.map((faction: Faction) => ({
                    factionId: faction.factionId,
                    reputation: faction.reputation,
                    playerRank: faction.playerRank,
                    isPlayerMember: faction.isPlayerMember,
                }));
            }
            nextGameState.players[currentActivePlayerIndex] = updatedOutgoingSnapshot;

            const incomingPlayerSnapshot = { ...nextGameState.players[targetPlayerIndex] };

            // ФИКС: Проверить, что incomingPlayerSnapshot существует
            if (!incomingPlayerSnapshot) {
                console.error(`No player found at target index: ${targetPlayerIndex}`);
                return prevState;
            }

            let newActivePlayerCharacter: PlayerCharacter;

            if (gameSettings.cooperativeGameType === 'MultiplePersonalities') {
                const { shareCharacteristics, shareSkills, shareNpcReputation, shareFactionReputation, shareInventory } = gameSettings.multiplePersonalitiesSettings || {};
                newActivePlayerCharacter = {
                    ...incomingPlayerSnapshot,
                    characteristics: shareCharacteristics ? outgoingPlayerCharacterState.characteristics : incomingPlayerSnapshot.characteristics,
                    activeSkills: shareSkills ? outgoingPlayerCharacterState.activeSkills : incomingPlayerSnapshot.activeSkills,
                    passiveSkills: shareSkills ? outgoingPlayerCharacterState.passiveSkills : incomingPlayerSnapshot.passiveSkills,
                    skillMasteryData: shareSkills ? outgoingPlayerCharacterState.skillMasteryData : incomingPlayerSnapshot.skillMasteryData,
                    inventory: shareInventory ? outgoingPlayerCharacterState.inventory : incomingPlayerSnapshot.inventory,
                    equippedItems: shareInventory ? outgoingPlayerCharacterState.equippedItems : incomingPlayerSnapshot.equippedItems,
                    knownRecipes: shareInventory ? outgoingPlayerCharacterState.knownRecipes : incomingPlayerSnapshot.knownRecipes,
                    money: shareInventory ? outgoingPlayerCharacterState.money : incomingPlayerSnapshot.money,
                    currentHealth: shareCharacteristics ? outgoingPlayerCharacterState.currentHealth : incomingPlayerSnapshot.currentHealth,
                    maxHealth: shareCharacteristics ? outgoingPlayerCharacterState.maxHealth : incomingPlayerSnapshot.maxHealth,
                    currentEnergy: shareCharacteristics ? outgoingPlayerCharacterState.currentEnergy : incomingPlayerSnapshot.currentEnergy,
                    maxEnergy: shareCharacteristics ? outgoingPlayerCharacterState.maxEnergy : incomingPlayerSnapshot.maxEnergy,
                };
            } else { // FullParty mode
                newActivePlayerCharacter = incomingPlayerSnapshot;
            }

            const nextEncounteredNPCs = [...nextGameState.encounteredNPCs];
            const nextEncounteredFactions = [...nextGameState.encounteredFactions];

            if (gameSettings.cooperativeGameType === 'MultiplePersonalities' && !gameSettings.multiplePersonalitiesSettings?.shareNpcReputation) {
                const personalReps = new Map(asArray(incomingPlayerSnapshot.personalNpcReputations).map(rep => [rep.NPCId, rep]));
                nextEncounteredNPCs.forEach(npc => {
                    if (!npc) return;
                    const personalRep = personalReps.get(npc.NPCId) as { relationshipLevel: number; isCompanion: boolean; } | undefined;
                    if (personalRep) {
                        npc.relationshipLevel = personalRep.relationshipLevel;
                        npc.progressionType = personalRep.isCompanion ? 'Companion' : 'PlotDriven';
                    } else {
                        npc.relationshipLevel = 50;
                        npc.progressionType = 'PlotDriven';
                    }
                });
            }
            if (gameSettings.cooperativeGameType === 'MultiplePersonalities' && !gameSettings.multiplePersonalitiesSettings?.shareFactionReputation) {
                const personalReps = new Map(asArray(incomingPlayerSnapshot.personalFactionReputations).map(rep => [rep.factionId, rep]));
                nextEncounteredFactions.forEach(faction => {
                    const personalRep = personalReps.get(faction.factionId!) as { reputation: number; playerRank: string | null; isPlayerMember: boolean; } | undefined;
                    if (personalRep) {
                        faction.reputation = personalRep.reputation;
                        faction.playerRank = personalRep.playerRank;
                        faction.isPlayerMember = personalRep.isPlayerMember;
                    } else {
                        faction.reputation = 0;
                        faction.playerRank = null;
                        faction.isPlayerMember = false;
                    }
                });
            }

            let nextTurnNumber = turnNumber || 0;
            if (targetPlayerIndex < currentActivePlayerIndex) {
                nextTurnNumber++;
            }

            nextGameState.activePlayerIndex = targetPlayerIndex;
            nextGameState.playerCharacter = newActivePlayerCharacter;
            nextGameState.encounteredNPCs = nextEncounteredNPCs;
            nextGameState.encounteredFactions = nextEncounteredFactions;

            // ФИКС: Проверить уникальность playerId после обработки
            const finalPlayerIds = new Set();
            for (const player of nextGameState.players) {
                if (finalPlayerIds.has(player.playerId)) {
                    console.error(`Duplicate playerId detected after turn pass: ${player.playerId}. Aborting turn pass.`);
                    return prevState;
                }
                finalPlayerIds.add(player.playerId);
            }

            console.log(`🎯 PASS TURN DEBUG: Turn passed successfully`);
            console.log(`  - From Player Index: ${currentActivePlayerIndex} (${prevState.players[currentActivePlayerIndex]?.name})`);
            console.log(`  - To Player Index: ${targetPlayerIndex} (${newActivePlayerCharacter.name})`);
            console.log(`  - New Active Player ID: ${newActivePlayerCharacter.playerId}`);
            console.log(`  - Network Role: ${nextGameState.networkRole}`);
            console.log(`  - Turn Number: ${nextTurnNumber}`);
            console.log(`  - Final Players Array:`, nextGameState.players.map(p => ({ name: p.name, id: p.playerId })));

            setTurnNumber(nextTurnNumber);

            const systemMessage: ChatMessage = {
                sender: 'system',
                content: t('turn_passed_to', { name: newActivePlayerCharacter.name }),
            };
            setGameHistory(prev => [...prev, systemMessage]);

            return nextGameState;
        });
    }, [gameSettings, t, turnNumber, setGameState, setTurnNumber, setGameHistory]);

    const cleanupNetwork = useCallback(() => {
        console.log("Performing full network cleanup on game load...");
        if (hostConnectionRef.current) {
            hostConnectionRef.current.close();
            hostConnectionRef.current = null;
        }
        connectionsRef.current.forEach(conn => conn.close());
        connectionsRef.current.clear();
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
    }, []);

    const broadcastFullSync = useCallback((saveData: SaveFile) => {
        console.log("Broadcasting full sync to all clients...");
        const syncMessage: NetworkMessage = {
            type: 'full_sync',
            payload: { saveFile: saveData },
        };

        const currentGameState = gameStateRef.current;

        // ФИКС: Только хост должен рассылать синхронизацию
        if (currentGameState?.networkRole !== 'host') {
            console.warn("Non-host trying to broadcast sync!");
            return;
        }

        connectionsRef.current.forEach(conn => {
            console.log(`📡 Sending sync to client: ${conn.peer}`);
            conn.send(syncMessage);
        });
    }, []);

    const allManagers = useMemo(() => {
        const saveLoadManager = createSaveLoadManager({
            gameContextRef, gameStateRef, gameHistory, gameLog, combatLog, lastJsonResponse, sceneImagePrompt,
            restoreFromSaveData, t, setAutosaveTimestamp, setDbSaveSlots, cleanupNetwork
        });

        const { packageSaveData } = saveLoadManager;

        const turnManager = createTurnManager({
            gameState, setGameState, gameHistory, setGameHistory,
            isLoading, setIsLoading, setError,
            setLastJsonResponse, setLastRequestJson,
            setGameLog, setCombatLog, setSceneImagePrompt, setSuggestedActions,
            setWorldMap, setVisitedLocations, setWorldState, setTurnNumber,
            gameContextRef, abortControllerRef,
            setSuperInstructions, setGameSettings,
            setLanguage,
            t,
            turnStartTimeRef, setTurnTime, setCurrentStep, setCurrentModel,
            language, gameSettings,
            hostConnectionRef,
            gameStateRef,
            broadcastFullSync,
            combatLog,
            gameLog,
            packageSaveDataForTurn: () => packageSaveData(gameStateRef.current!),
            setLastTurnSaveFile
        });

        return {
            ...turnManager,
            ...saveLoadManager,
            ...createInventoryActions({
                setGameState, gameContextRef, t, gameState
            }),
            ...createPlayerActionsManager({
                setGameState, setGameHistory, setGameLog, setCombatLog, setVisitedLocations,
                setWorldMap, setWorldState, gameSettings, gameContextRef, t
            }),
            ...createMusicManager({
                gameContextRef, setError, t, setGameLog, setMusicVideoIds,
                setIsMusicLoading, setIsMusicPlayerVisible, previousMusicQueries
            }),
            ...createMultiplayerManager({
                setGameState,
                setGameHistory,
                setError,
                t,
                initializeAndRunFirstTurn: (creationData, networkConfig) => {
                    const initialContext = createInitialContext(creationData, language);
                    gameContextRef.current = initialContext;

                    const firstTurnManager = createTurnManager({ gameState: null, setGameState, gameHistory: initialContext.responseHistory, setGameHistory, isLoading, setIsLoading, setError, setLastJsonResponse, setLastRequestJson, setGameLog, setCombatLog, setSceneImagePrompt, setSuggestedActions, setWorldMap, setVisitedLocations, setWorldState, setTurnNumber, gameContextRef, abortControllerRef, setSuperInstructions, setGameSettings, setLanguage, t, turnStartTimeRef, setTurnTime, setCurrentStep, setCurrentModel, language: initialContext.gameSettings.language, gameSettings: initialContext.gameSettings, hostConnectionRef, gameStateRef, broadcastFullSync: (saveData: SaveFile) => { }, combatLog: [], gameLog: [], packageSaveDataForTurn: () => packageSaveData(gameStateRef.current!), setLastTurnSaveFile });
                    firstTurnManager.initializeAndRunFirstTurn(creationData, networkConfig);
                },
                restoreFromSaveData,
                packageSaveData,
                broadcastFullSync,
                addPlayer,
                removePlayer,
                passTurnToPlayer,
                gameContextRef,
                peerRef,
                connectionsRef,
                hostConnectionRef,
                setIsLoading,
                syncNewPeerRef,
                sendMessageRef,
                gameStateRef,
                onChatMessage: (message: NetworkChatMessage) => {
                    setNetworkChatHistory(prev => [...prev, message]);
                }
            }),
            broadcastFullSync
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        gameState, gameHistory, isLoading, error, combatLog, gameLog, lastJsonResponse, sceneImagePrompt,
        gameSettings, superInstructions, language, t, restoreFromSaveData, setGameState, setGameHistory, setIsLoading, setError, setLastJsonResponse, setLastRequestJson, setGameLog, setCombatLog, setSceneImagePrompt, setSuggestedActions, setWorldMap, setVisitedLocations, setWorldState, setTurnNumber, setSuperInstructions, setGameSettings, setLanguage, setAutosaveTimestamp, setDbSaveSlots, setMusicVideoIds, setIsMusicLoading, setIsMusicPlayerVisible,
        setLastTurnSaveFile, addPlayer, removePlayer, passTurnToPlayer, cleanupNetwork, broadcastFullSync
    ]);

    useEffect(() => {
        if (turnNumber && turnNumber > 0 && gameState && lastSavedTurnRef.current !== turnNumber) {
            console.log(`Autosaving for turn ${turnNumber}`);
            const saveData = allManagers.packageSaveData(gameState);
            if (saveData) {
                allManagers.autosave(saveData);
            }
            lastSavedTurnRef.current = turnNumber;
        }
    }, [turnNumber, gameState, allManagers]);

    useEffect(() => {
        return () => {
            if (peerRef.current) {
                peerRef.current.destroy();
            }
        };
    }, []);

    const updateGameSettings = useCallback((newSettings: Partial<GameSettings>) => {
        setGameSettings(prevSettings => {
            if (!prevSettings) return prevSettings;

            if (newSettings.notificationSound === true && prevSettings.notificationSound === false) {
                initializeAndPreviewSound();
            }

            const updatedSettings = { ...prevSettings, ...newSettings };

            return updatedSettings;
        });
    }, []);

    const updateSuperInstructions = useCallback((newInstructions: string) => {
        setSuperInstructions(newInstructions);
    }, []);

    const updatePlayerPortrait = useCallback((playerId: string, portraitData: { prompt?: string | null; custom?: string | null; }) => {
        setGameState(prevState => {
            if (!prevState || !prevState.players || prevState.players.length === 0) return prevState;
    
            const pcIndex = prevState.players.findIndex(p => p.playerId === playerId);
            if (pcIndex === -1) {
                console.warn(`updatePlayerPortrait: Player with ID ${playerId} not found.`);
                return prevState;
            }
    
            const newPlayers = [...prevState.players];
            const playerToUpdate = { ...newPlayers[pcIndex] };
            let newImageCache = { ...prevState.imageCache };
    
            if (portraitData.custom !== undefined) {
                const currentKey = playerToUpdate.portrait;
                if (currentKey && currentKey.startsWith('custom-portrait-')) {
                    delete newImageCache[currentKey];
                }
                if (portraitData.custom === null) {
                    playerToUpdate.portrait = playerToUpdate.appearanceDescription;
                } else {
                    const key = `custom-portrait-${playerToUpdate.playerId}`;
                    newImageCache[key] = portraitData.custom;
                    playerToUpdate.portrait = key;
                }
            }
            else if (portraitData.prompt !== undefined) {
                const currentKey = playerToUpdate.portrait;
                if (currentKey && currentKey.startsWith('custom-portrait-')) {
                    delete newImageCache[currentKey];
                }
                playerToUpdate.portrait = portraitData.prompt;
            }
    
            newPlayers[pcIndex] = playerToUpdate;
    
            let newPlayerCharacter = prevState.playerCharacter;
            if (prevState.activePlayerIndex === pcIndex) {
                newPlayerCharacter = playerToUpdate;
            }
    
            const newState = {
                ...prevState,
                players: newPlayers,
                playerCharacter: newPlayerCharacter,
                imageCache: newImageCache,
            };
    
            return newState;
        });
    }, [setGameState]);

    const updateNpcPortrait = useCallback((npcId: string, portraitData: { prompt?: string | null; custom?: string | null; }) => {
        console.log('updateNpcPortrait called:', { npcId, portraitData });

        setGameState(prevState => {
            if (!prevState || !prevState.encounteredNPCs || prevState.encounteredNPCs.length === 0) return prevState; // ФИКС: Проверить encounteredNPCs

            const newNpcs = [...prevState.encounteredNPCs];
            const npcIndex = newNpcs.findIndex(n => n.NPCId === npcId);
            if (npcIndex === -1) {
                console.log('NPC not found:', npcId);
                return prevState;
            }

            const newNpc = { ...newNpcs[npcIndex] };
            let newImageCache = { ...prevState.imageCache };

            console.log('Before update:', {
                currentCustomPrompt: newNpc.custom_image_prompt,
                imageCache: Object.keys(newImageCache)
            });

            if (portraitData.custom !== undefined) {
                const currentKey = newNpc.custom_image_prompt;
                if (currentKey && (currentKey.startsWith('custom-portrait-npc-') || currentKey.startsWith('data:image'))) {
                    if (currentKey.startsWith('custom-portrait-npc-')) {
                        console.log('Deleting old cache key:', currentKey);
                        delete newImageCache[currentKey];
                    }
                }

                if (portraitData.custom === null) {
                    console.log('Reverting to generated image');
                    newNpc.custom_image_prompt = null;
                } else {
                    const key = `custom-portrait-npc-${npcId}`;
                    console.log('Setting new cache key:', key);
                    newImageCache[key] = portraitData.custom;
                    newNpc.custom_image_prompt = key;
                }
            } else if (portraitData.prompt !== undefined) {
                const currentKey = newNpc.custom_image_prompt;
                if (currentKey && (currentKey.startsWith('custom-portrait-npc-') || currentKey.startsWith('data:image'))) {
                    if (currentKey.startsWith('custom-portrait-npc-')) {
                        console.log('Deleting cache key for prompt update:', currentKey);
                        delete newImageCache[currentKey];
                    }
                }
                newNpc.custom_image_prompt = null;
                newNpc.image_prompt = portraitData.prompt;
            }

            newNpcs[npcIndex] = newNpc;

            console.log('After update:', {
                newCustomPrompt: newNpc.custom_image_prompt,
                newImageCache: Object.keys(newImageCache)
            });

            const newState = {
                ...prevState,
                encounteredNPCs: newNpcs,
                imageCache: newImageCache,
            };

            return newState;
        });
    }, [setGameState]);

    const regenerateLastResponse = useCallback(async (): Promise<boolean> => {
        const turnSaveToUse = lastTurnSaveFile;

        if (!turnSaveToUse) {
            setError(t('no_regeneration_data'));
            return false;
        }

        try {
            restoreFromSaveData(turnSaveToUse);
            // After restoring, we need to resend the last message.
            // The actual send logic is moved to a useEffect in App.tsx triggered by a state change.
            // Returning true here signals App.tsx to proceed.
            return true;
        } catch (e: any) {
            setError(formatError(e));
            return false;
        }
    }, [lastTurnSaveFile, restoreFromSaveData, setError, t]);

    const passTurnManually = useCallback(() => {
        if (!gameState || !gameSettings || gameSettings.cooperativeGameType === 'None') return;
        if (!gameState.players || gameState.players.length === 0) return;

        const currentActivePlayerIndex = gameState.activePlayerIndex;
        let nextPlayerIndex = (currentActivePlayerIndex + 1) % gameState.players.length;

        passTurnToPlayer(nextPlayerIndex);
    }, [gameState, gameSettings, passTurnToPlayer]);

    useEffect(() => {
        if (gameState?.networkRole === 'host' && turnNumber !== null) {
            const currentTurnInfo = { turn: turnNumber, playerIndex: gameState.activePlayerIndex };
            const lastState = lastBroadcastedStateRef.current;

            const shouldBroadcast = !lastState ||
                lastState.turn < currentTurnInfo.turn ||
                (lastState.turn === currentTurnInfo.turn && lastState.playerIndex !== currentTurnInfo.playerIndex);

            if (shouldBroadcast) {
                const saveData = allManagers.packageSaveData(gameState);
                if (saveData) {
                    allManagers.broadcastFullSync(saveData);
                    lastBroadcastedStateRef.current = currentTurnInfo;
                }
            }
        }
    }, [turnNumber, gameState?.activePlayerIndex, gameState, allManagers]);

    useEffect(() => {
        if (gameState?.networkRole === 'host') {
            const currentCoopState = JSON.stringify({
                collective: gameState.collectiveActionState,
                simultaneous: gameState.simultaneousActionState
            });

            if (currentCoopState !== lastBroadcastedCoopState.current) {
                console.log("Co-op state changed on host, broadcasting sync.");
                const saveData = allManagers.packageSaveData(gameState);
                if (saveData) {
                    allManagers.broadcastFullSync(saveData);
                    lastBroadcastedCoopState.current = currentCoopState;
                }
            }
        }
    }, [gameState, allManagers]);

    const forceSyncAll = useCallback(() => {
        if (gameState?.networkRole !== 'host') {
            console.warn("forceSyncAll called by non-host.");
            return;
        }
        console.log("Host is forcing a full sync...");
        const saveData = allManagers.packageSaveData(gameState);
        if (saveData) {
            allManagers.broadcastFullSync(saveData);
            const systemMessage: ChatMessage = {
                sender: 'system',
                content: t('host_forced_sync'),
            };
            setGameHistory(prev => [...prev, systemMessage]);
        } else {
            console.error("Could not package save data for forced sync.");
        }
    }, [gameState, allManagers, t, setGameHistory]);

    useEffect(() => {
        if (gameState?.networkRole === 'host') {
            const currentLength = gameState.players?.length;
            const prevLength = prevPlayersLengthRef.current;

            if (typeof prevLength === 'number' && typeof currentLength === 'number' && currentLength !== prevLength) {
                console.log(`Player list changed on host (${prevLength} -> ${currentLength}), broadcasting new state...`);
                const newSaveData = allManagers.packageSaveData(gameState);
                if (newSaveData) {
                    allManagers.broadcastFullSync(newSaveData);
                }
            }
        }
        prevPlayersLengthRef.current = gameState?.players?.length;
    }, [gameState, allManagers]);

    const deleteActiveSkill = useCallback((skillName: string) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newPc = { ...prevState.playerCharacter };
            newPc.activeSkills = newPc.activeSkills.filter(s => s.skillName !== skillName);
            newPc.skillMasteryData = newPc.skillMasteryData.filter(m => m.skillName !== skillName);
            if (newPc.autoCombatSkill === skillName) {
                newPc.autoCombatSkill = null;
            }
            return { ...prevState, playerCharacter: newPc };
        });
    }, [gameSettings, setGameState]);

    const deletePassiveSkill = useCallback((skillName: string) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newPc = { ...prevState.playerCharacter };
            newPc.passiveSkills = newPc.passiveSkills.filter(s => s.skillName !== skillName);
            const recalculatedPc = recalculateDerivedStats(newPc);
            return { ...prevState, playerCharacter: recalculatedPc };
        });
    }, [gameSettings, setGameState]);

    const onEditNpcMemory = useCallback((npcId: string, memory: UnlockedMemory) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newNpcs = prevState.encounteredNPCs.map(npc => {
                if (npc.NPCId === npcId && npc.unlockedMemories) {
                    const newMemories = npc.unlockedMemories.map(mem =>
                        mem.memoryId === memory.memoryId ? memory : mem
                    );
                    return { ...npc, unlockedMemories: newMemories };
                }
                return npc;
            });
            if (gameContextRef.current) {
                gameContextRef.current.encounteredNPCs = newNpcs;
            }
            return { ...prevState, encounteredNPCs: newNpcs };
        });
    }, [gameSettings, setGameState]);

    const onDeleteNpcMemory = useCallback((npcId: string, memoryId: string) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newNpcs = prevState.encounteredNPCs.map(npc => {
                if (npc.NPCId === npcId && npc.unlockedMemories) {
                    const newMemories = npc.unlockedMemories.filter(mem => mem.memoryId !== memoryId);
                    return { ...npc, unlockedMemories: newMemories };
                }
                return npc;
            });
            if (gameContextRef.current) {
                gameContextRef.current.encounteredNPCs = newNpcs;
            }
            return { ...prevState, encounteredNPCs: newNpcs };
        });
    }, [gameSettings, setGameState]);

    const onDeleteCurrentActivity = useCallback((npcId: string) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newNpcs = prevState.encounteredNPCs.map(npc => {
                if (npc.NPCId === npcId) {
                    return { ...npc, currentActivity: null };
                }
                return npc;
            });
            return { ...prevState, encounteredNPCs: newNpcs };
        });
    }, [gameSettings, setGameState]);

    const onDeleteCompletedActivity = useCallback((npcId: string, activity: CompletedActivity) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newNpcs = prevState.encounteredNPCs.map(npc => {
                if (npc.NPCId === npcId) {
                    const newCompleted = (npc.completedActivities || []).filter(
                        (act: CompletedActivity) => !(act.activityName === activity.activityName && act.completionTurn === activity.completionTurn)
                    );
                    return { ...npc, completedActivities: newCompleted };
                }
                return npc;
            });
            return { ...prevState, encounteredNPCs: newNpcs };
        });
    }, [gameSettings, setGameState]);

    const deleteFactionProject = useCallback((factionId: string, projectId: string) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newFactions = prevState.encounteredFactions.map(faction => {
                if (faction.factionId === factionId) {
                    const newActiveProjects = (faction.activeProjects || []).filter(p => p.projectId !== projectId);
                    return { ...faction, activeProjects: newActiveProjects };
                }
                return faction;
            });
            if (gameContextRef.current) {
                gameContextRef.current.encounteredFactions = newFactions;
            }
            return { ...prevState, encounteredFactions: newFactions };
        });
    }, [gameSettings, setGameState]);

    const deleteFactionCompletedProject = useCallback((factionId: string, projectId: string) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newFactions = prevState.encounteredFactions.map(faction => {
                if (faction.factionId === factionId) {
                    const newCompletedProjects = (faction.completedProjects || []).filter(p => p.projectId !== projectId);
                    return { ...faction, completedProjects: newCompletedProjects };
                }
                return faction;
            });
            if (gameContextRef.current) {
                gameContextRef.current.encounteredFactions = newFactions;
            }
            return { ...prevState, encounteredFactions: newFactions };
        });
    }, [gameSettings, setGameState]);

    const deleteFactionCustomState = useCallback((factionId: string, stateId: string) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newFactions = prevState.encounteredFactions.map(faction => {
                if (faction.factionId === factionId && faction.customStates) {
                    const newStates = faction.customStates.filter(s => s.stateId !== stateId);
                    return { ...faction, customStates: newStates };
                }
                return faction;
            });
            if (gameContextRef.current) {
                gameContextRef.current.encounteredFactions = newFactions;
            }
            return { ...prevState, encounteredFactions: newFactions };
        });
    }, [gameSettings, setGameState]);

    const deleteLocationThreat = useCallback((locationId: string, threatId: string) => {
        if (!gameSettings?.allowHistoryManipulation) return;

        const updater = (location: Location) => {
            if (location && location.activeThreats) {
                const newThreats = location.activeThreats.filter(t => t.threatId !== threatId);
                return { ...location, activeThreats: newThreats };
            }
            return location;
        };

        setWorldMap(prevMap => {
            const newMap = { ...prevMap };
            if (newMap[locationId]) {
                newMap[locationId] = updater(newMap[locationId]);
                if (gameContextRef.current) {
                    gameContextRef.current.worldMap = newMap;
                }
                return newMap;
            }
            return prevMap;
        });

        setGameState(prevState => {
            if (prevState && prevState.currentLocationData.locationId === locationId) {
                const newCurrentLocation = updater(prevState.currentLocationData);
                if (gameContextRef.current) {
                    gameContextRef.current.currentLocation = newCurrentLocation;
                }
                return { ...prevState, currentLocationData: newCurrentLocation };
            }
            return prevState;
        });

        setVisitedLocations(prev => {
            const newLocations = prev.map(loc => loc.locationId === locationId ? updater(loc) : loc);
            if (gameContextRef.current) {
                gameContextRef.current.visitedLocations = newLocations;
            }
            return newLocations;
        });

    }, [gameSettings, setGameState, setWorldMap, setVisitedLocations]);

    const deleteFactionBonus = useCallback((factionId: string, bonusId: string) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newFactions = prevState.encounteredFactions.map(faction => {
                if (faction.factionId === factionId && faction.structuredBonuses) {
                    const newBonuses = faction.structuredBonuses.filter(b => b.bonusId !== bonusId);
                    return { ...faction, structuredBonuses: newBonuses };
                }
                return faction;
            });
            if (gameContextRef.current) {
                gameContextRef.current.encounteredFactions = newFactions;
            }
            return { ...prevState, encounteredFactions: newFactions };
        });
    }, [gameSettings, setGameState]);

    const clearAllCompletedFactionProjects = useCallback((factionId: string) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newFactions = prevState.encounteredFactions.map(faction => {
                if (faction.factionId === factionId) {
                    return { ...faction, completedProjects: [] };
                }
                return faction;
            });
            if (gameContextRef.current) {
                gameContextRef.current.encounteredFactions = newFactions;
            }
            return { ...prevState, encounteredFactions: newFactions };
        });
    }, [gameSettings, setGameState]);

    const clearAllCompletedNpcActivities = useCallback((npcId: string) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newNpcs = prevState.encounteredNPCs.map(npc => {
                if (npc.NPCId === npcId) {
                    return { ...npc, completedActivities: [] };
                }
                return npc;
            });
            if (gameContextRef.current) {
                gameContextRef.current.encounteredNPCs = newNpcs;
            }
            return { ...prevState, encounteredNPCs: newNpcs };
        });
    }, [gameSettings, setGameState]);

    const createErrorPlaceholder = (width: number, height: number, text: string): string => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return ''; // fallback to empty string

        // Black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Red error text
        ctx.fillStyle = '#8B0000'; // DarkRed for better aesthetics
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 30px Lora, serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 10;
        ctx.fillText(text, width / 2, height / 2);

        return canvas.toDataURL('image/png');
    };

    const generateImageForFrames = async (frames: Omit<CinemaFrame, 'imageUrl'>[], onProgress: (current: number, total: number, message: string) => void) => {
        const generatedFrames: CinemaFrame[] = [];
        const MAX_RETRIES = 5;
        const RETRY_DELAY = 2000; // 2 seconds

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            onProgress(i + 1, frames.length, `${t('GeneratingScene')} ${i + 1}/${frames.length}...`);

            if (abortControllerRef.current?.signal.aborted) {
                throw new DOMException('Aborted by user.', 'AbortError');
            }

            let imageUrl: string | null = null;
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    imageUrl = await new Promise<string>((resolveImg, rejectImg) => {
                        const newSeed = Date.now() + Math.random();
                        const imageModel = gameSettings?.pollinationsImageModel || 'flux';
                        const params = new URLSearchParams({
                            width: String(1024),
                            height: String(576), // 16:9 aspect ratio for cinema
                            seed: String(newSeed),
                            model: imageModel,
                            nologo: 'true'
                        });
                        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(frame.imagePrompt)}?${params}`;

                        const img = new Image();
                        img.crossOrigin = "Anonymous";
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.naturalWidth;
                            canvas.height = img.naturalHeight;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                                try {
                                    ctx.drawImage(img, 0, 0);
                                    const base664data = canvas.toDataURL('image/png');
                                    resolveImg(base664data);
                                } catch (e) {
                                    rejectImg(e);
                                }
                            } else {
                                rejectImg(new Error("Could not get canvas context."));
                            }
                        };
                        img.onerror = (err) => {
                            // Reject with a proper Error object
                            rejectImg(new Error(`Image failed to load from ${url}. Attempt ${attempt}/${MAX_RETRIES}. Error: ${JSON.stringify(err)}`));
                        };
                        img.src = url;
                    });

                    // If successful, break the retry loop
                    if (imageUrl) {
                        break;
                    }

                } catch (e: any) {
                    console.warn(`Image generation for frame ${i + 1} failed on attempt ${attempt}. Retrying...`, e.message);
                    if (abortControllerRef.current?.signal.aborted) {
                        throw new DOMException('Aborted by user.', 'AbortError');
                    }
                    if (attempt < MAX_RETRIES) {
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                    } else {
                        console.error(`All ${MAX_RETRIES} attempts failed for frame ${i + 1}. Generating placeholder.`);
                        setError(t('image_generation_failed_placeholder'));
                        imageUrl = createErrorPlaceholder(1024, 576, t('Image Generation Failed'));
                    }
                }
            }

            generatedFrames.push({ ...frame, imageUrl: imageUrl! });
        }
        return generatedFrames;
    };

    const generateFilmTrailer = useCallback(async (userPrompt: string) => {
        if (!gameContextRef.current || !gameSettings) {
            setError("Game not initialized.");
            return;
        }

        setIsGeneratingCinema(true);
        setCinemaGenerationProgress({ current: 0, total: 0, message: t('GeneratingTrailerScript') });
        setError(null);
        abortControllerRef.current = new AbortController();

        try {
            const model = gameSettings.modelName ? gameSettings.modelName : 'gemini-2.5-flash';
            const { promptContent, systemInstruction } = getCinemaPrompt(gameContextRef.current, userPrompt);
            const narrativeGuide = narrativeStyleGuide.getGuide();
            const apiContext = { ...gameContextRef.current!, gameSettings: { ...gameSettings, modelName: model } };

            const trailerData = await executeCancellableJsonGeneration(
                promptContent + narrativeGuide,
                apiContext,
                abortControllerRef.current.signal,
                (text) => { },
                systemInstruction
            );

            const cleanedTrailerData = deepStripModerationSymbols(trailerData);

            const framesToGenerate = cleanedTrailerData.frames as Omit<CinemaFrame, 'imageUrl'>[];

            if (!framesToGenerate || framesToGenerate.length === 0) {
                throw new Error("AI did not generate any frames for the trailer.");
            }
            setCinemaGenerationProgress({ current: 0, total: framesToGenerate.length, message: t('GeneratingSceneImages') });

            const generatedFrames = await generateImageForFrames(framesToGenerate, (c, t, m) => setCinemaGenerationProgress({ current: c, total: t, message: m }));

            const newCinematic: Cinematic = {
                id: generateId('cinematic'),
                title: cleanedTrailerData.title,
                synopsis: cleanedTrailerData.synopsis,
                userPrompt: userPrompt,
                frames: generatedFrames,
                comments: cleanedTrailerData.comments,
            };

            setGameState(prev => {
                if (!prev) return null;
                const newCinematics = [...(prev.cinematics || []), newCinematic];
                return { ...prev, cinematics: newCinematics };
            });
            setCinemaGenerationProgress({ current: framesToGenerate.length, total: framesToGenerate.length, message: t('TrailerReady') });

        } catch (e: any) {
            if (e instanceof RegenerationRequiredError) {
                console.error("Error generating film trailer:", e);
                setError(t('gmCommunicationError', { provider: 'Gemini', message: `${e.message}\n\n--- Raw AI Output ---\n${e.rawText}` }));
            } else if (e.name === 'AbortError') {
                setError(t('Trailer generation cancelled.'));
            } else {
                console.error("Error generating film trailer:", e);
                setError(formatError(e));
            }
        } finally {
            setIsGeneratingCinema(false);
        }
    }, [gameContextRef, gameSettings, t, setError, setGameState]);

    const continueFilmTrailer = useCallback(async (cinematicId: string) => {
        const cinematic = gameStateRef.current?.cinematics?.find(c => c.id === cinematicId);
        if (!cinematic || !gameContextRef.current || !gameSettings) {
            setError("Could not find cinematic or game not initialized.");
            return;
        }

        setExtendingCinematicId(cinematicId);
        setIsGeneratingCinema(true);
        setCinemaGenerationProgress({ current: 0, total: 0, message: t('ContinuingTrailerScript') });
        setError(null);
        abortControllerRef.current = new AbortController();

        try {
            const model = gameSettings.modelName ? gameSettings.modelName : 'gemini-2.5-flash';
            const { promptContent, systemInstruction } = getContinueCinemaPrompt(gameContextRef.current, cinematic);
            const narrativeGuide = narrativeStyleGuide.getGuide();
            const apiContext = { ...gameContextRef.current!, gameSettings: { ...gameSettings, modelName: model } };

            const responseData = await executeCancellableJsonGeneration(
                promptContent + narrativeGuide,
                apiContext,
                abortControllerRef.current.signal,
                (text) => { },
                systemInstruction
            );

            const cleanedResponseData = deepStripModerationSymbols(responseData);

            const newFramesToGenerate = cleanedResponseData.frames;
            const newComments = cleanedResponseData.newComments;
            const updatedSynopsis = cleanedResponseData.updatedSynopsis;

            if (!newFramesToGenerate || newFramesToGenerate.length === 0) {
                throw new Error("AI did not generate any new frames.");
            }
            setCinemaGenerationProgress({ current: 0, total: newFramesToGenerate.length, message: t('GeneratingAdditionalScenes') });

            const generatedFrames = await generateImageForFrames(newFramesToGenerate, (c, t, m) => setCinemaGenerationProgress({ current: c, total: t, message: m }));

            setGameState(prev => {
                if (!prev) return null;
                const newCinematics = (prev.cinematics || []).map(c => {
                    if (c.id === cinematicId) {
                        return {
                            ...c,
                            synopsis: updatedSynopsis || c.synopsis,
                            frames: [...c.frames, ...generatedFrames],
                            comments: [...c.comments, ...(newComments || [])]
                        };
                    }
                    return c;
                });
                return { ...prev, cinematics: newCinematics };
            });
            setCinemaGenerationProgress({ current: newFramesToGenerate.length, total: newFramesToGenerate.length, message: t('TrailerReady') });

        } catch (e: any) {
            if (e instanceof RegenerationRequiredError) {
                console.error("Error continuing film trailer:", e);
                setError(t('gmCommunicationError', { provider: 'Gemini', message: `${e.message}\n\n--- Raw AI Output ---\n${e.rawText}` }));
            } else if (e.name === 'AbortError') {
                setError(t('Trailer generation cancelled.'));
            } else {
                console.error("Error continuing film trailer:", e);
                setError(formatError(e));
            }
        } finally {
            setIsGeneratingCinema(false);
            setExtendingCinematicId(null);
        }
    }, [gameContextRef, gameSettings, t, setError, setGameState]);

    const playCinematic = useCallback((cinematicId: string) => {
        const cinematic = gameStateRef.current?.cinematics?.find(c => c.id === cinematicId);
        if (cinematic) {
            setPlayingCinematic(cinematic);
        }
    }, []);

    const stopPlayingCinematic = useCallback(() => {
        setPlayingCinematic(null);
    }, []);

    const exportCinematic = useCallback((cinematicId: string) => {
        const cinematic = gameStateRef.current?.cinematics?.find(c => c.id === cinematicId);
        if (!cinematic) return;
        try {
            const blob = new Blob([JSON.stringify(cinematic, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const filename = `cinematic-${cinematic.title.replace(/\s+/g, '_')}.json`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setGameLog(prev => [t('CinematicExported', { filename }), ...prev]);
        } catch (err) {
            console.error('Error exporting cinematic:', err);
            setError(formatError(err));
        }
    }, [t, setGameLog, setError]);

    const importCinematic = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                try {
                    const content = readerEvent.target?.result as string;
                    const imported = JSON.parse(content);
                    // Basic validation
                    if (imported && imported.id && imported.title && imported.frames && imported.comments) {
                        setGameState(prev => {
                            if (!prev) return null;
                            // Avoid duplicate IDs
                            if ((prev.cinematics || []).some(c => c.id === imported.id)) {
                                imported.id = generateId('cinematic');
                            }
                            const newCinematics = [...(prev.cinematics || []), imported];
                            return { ...prev, cinematics: newCinematics };
                        });
                        setGameLog(prev => [t('CinematicImported'), ...prev]);
                    } else {
                        throw new Error("Invalid cinematic file format.");
                    }
                } catch (err) {
                    console.error("Error importing cinematic:", err);
                    setError(t('CinematicImportError'));
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }, [t, setGameState, setGameLog, setError]);

    const deleteCinematic = useCallback((cinematicId: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const newCinematics = (prev.cinematics || []).filter(c => c.id !== cinematicId);
            return { ...prev, cinematics: newCinematics };
        });
        setGameLog(prev => [t('CinematicDeleted'), ...prev]);
    }, [t, setGameLog, setGameState]);

    const cancelCinemaGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            console.log("Cinema generation cancelled by user.");
        }
        setIsGeneratingCinema(false);
        setExtendingCinematicId(null);
    }, []);

    const updateCinematic = useCallback((cinematicId: string, updates: Partial<Omit<Cinematic, 'id'>>) => {
        setGameState(prev => {
            if (!prev || !prev.cinematics) return prev;
            const newCinematics = prev.cinematics.map(c => {
                if (c.id === cinematicId) {
                    const newFrames = updates.frames ? updates.frames : c.frames;
                    return { ...c, ...updates, frames: newFrames };
                }
                return c;
            });
            return { ...prev, cinematics: newCinematics };
        });
        setGameLog(prev => [t('CinematicUpdated'), ...prev]);
    }, [setGameState, t, setGameLog]);

    const regenerateCinemaFrame = useCallback(async (cinematicId: string, frameIndex: number, newPrompt: string): Promise<boolean> => {
        if (!gameContextRef.current || !gameSettings) {
            setError("Game not initialized for regeneration.");
            return false;
        }

        const cinematic = gameStateRef.current?.cinematics?.find(c => c.id === cinematicId);
        if (!cinematic || !cinematic.frames[frameIndex]) {
            setError("Cinematic or frame not found for regeneration.");
            return false;
        }

        setIsGeneratingCinema(true);
        setCinemaGenerationProgress({ current: 0, total: 1, message: `${t('GeneratingScene')} 1/1...` });
        setError(null);
        abortControllerRef.current = new AbortController();

        try {
            const frameToRegenerate: Omit<CinemaFrame, 'imageUrl'> = {
                imagePrompt: newPrompt,
                subtitle: cinematic.frames[frameIndex].subtitle,
            };

            const [generatedFrame] = await generateImageForFrames(
                [frameToRegenerate],
                (c, t, m) => setCinemaGenerationProgress({ current: c, total: t, message: m })
            );

            if (generatedFrame) {
                setGameState(prev => {
                    if (!prev || !prev.cinematics) return prev;
                    const newCinematics = prev.cinematics.map(c => {
                        if (c.id === cinematicId) {
                            const newFrames = [...c.frames];
                            newFrames[frameIndex] = { ...newFrames[frameIndex], imageUrl: generatedFrame.imageUrl, imagePrompt: newPrompt };
                            return { ...c, frames: newFrames };
                        }
                        return c;
                    });
                    return { ...prev, cinematics: newCinematics };
                });
                return true;
            } else {
                throw new Error("Image generation failed to return a frame.");
            }
        } catch (e: any) {
            if (e.name === 'AbortError') {
                setError(t('Trailer generation cancelled.'));
            } else {
                console.error("Error regenerating frame:", e);
                setError(formatError(e));
            }
            return false;
        } finally {
            setIsGeneratingCinema(false);
        }
    }, [gameContextRef, gameSettings, t, setError, setGameState]);

    const generateCinematicAudio = useCallback(async (cinematicId: string, voice: string): Promise<void> => {
        const cinematic = gameStateRef.current?.cinematics?.find(c => c.id === cinematicId);
        if (!cinematic || !gameContextRef.current || !gameSettings) {
            setError(t("Could not find cinematic or game not initialized."));
            return;
        }

        setIsGeneratingCinema(true);
        setCinemaGenerationProgress({ current: 0, total: 1, message: t('GeneratingAudio') });
        setError(null);

        try {
            const script = cinematic.frames.map(f => f.subtitle).join('\n\n');

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: script }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: voice },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

            if (base64Audio) {
                setGameState(prev => {
                    if (!prev || !prev.cinematics) return prev;
                    const newCinematics = prev.cinematics.map(c => {
                        if (c.id === cinematicId) {
                            return { ...c, audio_base64: base64Audio, audio_voice: voice };
                        }
                        return c;
                    });
                    return { ...prev, cinematics: newCinematics };
                });
                setCinemaGenerationProgress({ current: 1, total: 1, message: t('AudioReady') });
            } else {
                throw new Error("No audio data received from API.");
            }

        } catch (e: any) {
            console.error("Error generating cinematic audio:", e);
            setError(formatError(e));
        } finally {
            setIsGeneratingCinema(false);
        }
    }, [gameContextRef, gameSettings, t, setError, setGameState]);


    const {
        handlePrimaryMusicClick
    } = {
        handlePrimaryMusicClick: () => {
            if (musicVideoIds && musicVideoIds.length > 0 && !isMusicPlayerVisible) {
                setIsMusicPlayerVisible(true);
            } else {
                allManagers.fetchMusicSuggestion();
            }
        }
    };

    // Derived values for backward compatibility
    const isCinemaVisible = !!playingCinematic;
    const cinemaFrames = playingCinematic?.frames || null;
    const closeCinemaPlayer = stopPlayingCinematic;

    const syncNewPeer = useCallback((conn: DataConnection) => {
        const newPeer: PeerInfo = { id: conn.peer, name: conn.metadata.playerName || `Player-${conn.peer.slice(-4)}` };

        setGameState(prev => {
            if (!prev) {
                console.warn("syncNewPeer called before gameState is initialized. Peer will not be synced yet.");
                return null;
            }
            const updatedPeers = [...prev.peers.filter(p => p.id !== newPeer.id), newPeer];
            return { ...prev, peers: updatedPeers };
        });

        const connectMessage: ChatMessage = { sender: 'system', content: t('player_has_connected', { name: newPeer.name }) };
        setGameHistory(prev => [...prev, connectMessage]);

        const saveData = allManagers.packageSaveData(gameStateRef.current!);
        if (saveData) {
            const syncMessage: NetworkMessage = {
                type: 'full_sync',
                payload: { saveFile: saveData },
            };
            conn.send(syncMessage);
            console.log(`Sent full_sync to ${conn.peer}`);
        } else {
            console.warn("Could not package save data for new peer, game state might be null. This can happen if a player connects during initial world generation.");
        }
    }, [allManagers, t, setGameState, setGameHistory]);

    useEffect(() => {
        syncNewPeerRef.current = syncNewPeer;
    }, [syncNewPeer]);

    useEffect(() => {
        (sendMessageRef as React.MutableRefObject<any>).current = allManagers.sendMessage;
    }, [allManagers.sendMessage]);

    const myPlayerId = gameState?.myPeerId;

    const initiateCollectiveAction = useCallback((participantIds: string[], prompt: string, remoteInitiator?: { id: string; name: string }) => {
        const currentState = gameStateRef.current;
        if (!currentState) return;

        const isRemote = !!remoteInitiator;
        const initiatorId = isRemote ? remoteInitiator.id : (myPlayerId || '');
        const initiatorName = isRemote ? remoteInitiator.name : (currentState.players.find(p => p.playerId === initiatorId)?.name || 'Player');

        if (currentState.networkRole === 'host') {
            setGameState(prevState => {
                if (!prevState) return null;
                const newCollectiveState: CollectiveActionState = {
                    isActive: true,
                    initiatorId: initiatorId,
                    initiatorName: initiatorName,
                    prompt: prompt,
                    participantIds: participantIds,
                    actions: {}
                };
                return { ...prevState, collectiveActionState: newCollectiveState };
            });
        } else if (currentState.networkRole === 'player' && hostConnectionRef.current && !isRemote) {
            const message: NetworkMessage = {
                type: 'request_collective_action',
                payload: { participantIds, prompt, initiatorId, initiatorName },
                senderId: initiatorId
            };
            hostConnectionRef.current.send(message);
        }
    }, [t, setGameState, myPlayerId]);

    const submitCollectiveAction = useCallback((action: string, senderOverrideId?: string) => {
        const currentState = gameStateRef.current;
        if (!currentState || !currentState.collectiveActionState?.isActive) return;

        const effectiveSenderId = senderOverrideId || currentState.myPeerId;
        if (!effectiveSenderId) {
            console.warn(`[HOST/CLIENT] submit_collective_action: No effective sender ID. Returning.`);
            return;
        }

        if (currentState.networkRole === 'host') {
            console.log(`[HOST] Processing submit_collective_action from senderId: ${effectiveSenderId}, Action: "${action}"`);
            setGameState(prevState => {
                if (!prevState) {
                    console.warn(`[HOST] submit_collective_action: prevState is null, cannot update.`);
                    return null;
                }
                if (!prevState.collectiveActionState?.isActive) {
                    console.warn(`[HOST] submit_collective_action: collectiveActionState is not active, returning previous state.`);
                    return prevState;
                }

                const currentActions = { ...prevState.collectiveActionState.actions };

                if (currentActions[effectiveSenderId] === action) {
                    console.warn(`[HOST] submit_collective_action: Action for ${effectiveSenderId} is already set to the same value. Skipping update.`);
                    return prevState;
                }

                currentActions[effectiveSenderId] = action; // Update the action for the specific sender

                const newCollectiveState = { ...prevState.collectiveActionState, actions: currentActions };
                const newState = { ...prevState, collectiveActionState: newCollectiveState };

                console.log(`[HOST] Updated collectiveActionState for ${effectiveSenderId}:`, newCollectiveState.actions);
                return newState;
            });
        } else if (currentState.networkRole === 'player' && hostConnectionRef.current) {
            const message: NetworkMessage = {
                type: 'submit_collective_action',
                payload: { action },
                senderId: effectiveSenderId // This should be the client's myPeerId
            };
            console.log(`[CLIENT] Sending 'submit_collective_action' to host. MyPeerId: ${effectiveSenderId}, Action: "${action}"`);
            hostConnectionRef.current.send(message);

            setGameState(prevState => {
                if (!prevState || !prevState.collectiveActionState?.isActive) return prevState;
                const newActions = { ...prevState.collectiveActionState.actions, [effectiveSenderId]: action };
                const newCollectiveState = { ...prevState.collectiveActionState, actions: newActions };
                console.log(`[CLIENT] Updated local collectiveActionState for ${effectiveSenderId}:`, newCollectiveState.actions);
                return { ...prevState, collectiveActionState: newCollectiveState };
            });
        }
    }, [setGameState]);

    const processCollectiveActions = useCallback(() => {
        const currentState = gameStateRef.current;
        if (!currentState || !currentState.collectiveActionState?.isActive) return;

        const { prompt, actions, initiatorName } = currentState.collectiveActionState;
        let combinedMessage = `[${t('Collective Action requested by {name}', { name: initiatorName })}: ${prompt}]\n`;

        currentState.players.forEach(p => {
            if (actions[p.playerId]) {
                combinedMessage += `${p.name}: ${actions[p.playerId]}\n`;
            }
        });

        // Nullify the collective action state in the context reference
        // to ensure the subsequent AI turn does not process against the now-completed action.
        if (gameContextRef.current) {
            (gameContextRef.current as any).collectiveActionState = null;
        }

        // CRITICAL FIX: To prevent a race condition, we must ensure the `collectiveActionState`
        // is cleared from the `gameState` that will be used as the base for the next turn's state.
        // The subsequent `setGameState` call will update the UI immediately, but the `handleTurn`
        // function might capture the `gameStateRef` before that async update completes.
        // Directly mutating the ref here ensures `handleTurn` uses a clean state.
        if (gameStateRef.current) {
            gameStateRef.current.collectiveActionState = null;
        }

        allManagers.sendMessage(combinedMessage.trim());

        // This updates the UI immediately.
        setGameState(prev => prev ? { ...prev, collectiveActionState: null } : null);
    }, [t, allManagers, setGameState]);

    const cancelCollectiveAction = useCallback(() => {
        setGameState(prevState => {
            if (!prevState) return null;
            const systemMessage: ChatMessage = {
                sender: 'system',
                content: t('collective_action_cancelled', { name: prevState.collectiveActionState?.initiatorName || 'Player' })
            };
            setGameHistory(prevHistory => [...prevHistory, systemMessage]);
            return { ...prevState, collectiveActionState: null };
        });
    }, [t, setGameHistory, setGameState]);

    const initiateSimultaneousAction = useCallback(() => {
        const currentState = gameStateRef.current;
        if (!currentState) return;

        if (currentState.networkRole === 'host') {
            const newSimultaneousState: SimultaneousActionState = {
                isActive: true,
                actions: {}
            };
            setGameState(prevState => {
                if (!prevState) return null;
                return { ...prevState, simultaneousActionState: newSimultaneousState };
            });
        } else if (currentState.networkRole === 'player' && hostConnectionRef.current) {
            const message: NetworkMessage = {
                type: 'request_simultaneous_action',
                payload: {},
                senderId: myPlayerId!,
            };
            hostConnectionRef.current.send(message);
        }
    }, [setGameState, myPlayerId]);

    const submitSimultaneousAction = useCallback((action: string) => {
        const currentState = gameStateRef.current;
        if (!currentState || !currentState.simultaneousActionState?.isActive || !myPlayerId) return;

        const myPlayerIdConst = myPlayerId;

        if (currentState.networkRole === 'host') {
            setGameState(prevState => {
                if (!prevState || !prevState.simultaneousActionState?.isActive) return prevState;
                const newActions = { ...prevState.simultaneousActionState.actions, [myPlayerIdConst]: action };
                const newSimultaneousState = { ...prevState.simultaneousActionState, actions: newActions };
                return { ...prevState, simultaneousActionState: newSimultaneousState };
            });
        } else if (currentState.networkRole === 'player' && hostConnectionRef.current) {
            const message: NetworkMessage = {
                type: 'simultaneous_action_submit',
                payload: { action },
                senderId: myPlayerIdConst
            };
            hostConnectionRef.current.send(message);

            setGameState(prevState => {
                if (!prevState || !prevState.simultaneousActionState?.isActive) return prevState;
                const newActions = { ...prevState.simultaneousActionState.actions, [myPlayerIdConst]: action };
                const newSimultaneousState = { ...prevState.simultaneousActionState, actions: newActions };
                return { ...prevState, simultaneousActionState: newSimultaneousState };
            });
        }
    }, [setGameState, myPlayerId]);

    const cancelSimultaneousAction = useCallback(() => {
        setGameState(prevState => {
            if (!prevState) return null;
            const systemMessage: ChatMessage = {
                sender: 'system',
                content: t('simultaneous_action_cancelled')
            };
            setGameHistory(prevHistory => [...prevHistory, systemMessage]);
            return { ...prevState, simultaneousActionState: null };
        });
    }, [t, setGameHistory, setGameState]);

    return {
        gameState,
        gameHistory,
        isLoading,
        error,
        ...allManagers,
        lastJsonResponse,
        lastRequestJson,
        gameLog,
        combatLog,
        sceneImagePrompt,
        suggestedActions,
        visitedLocations,
        worldState,
        gameSettings,
        updateGameSettings,
        superInstructions,
        updateSuperInstructions,
        turnNumber,
        autosaveTimestamp,
        dbSaveSlots,
        musicVideoIds,
        isMusicLoading,
        isMusicPlayerVisible,
        handlePrimaryMusicClick,
        currentStep,
        currentModel,
        turnTime,
        onImageGenerated,
        updatePlayerPortrait,
        addPlayer,
        removePlayer,
        passTurnToPlayer,
        passTurnManually,
        deleteActiveSkill,
        deletePassiveSkill,
        onEditNpcMemory,
        onDeleteNpcMemory,
        forceSyncAll,
        initiateCollectiveAction,
        submitCollectiveAction,
        processCollectiveActions,
        cancelCollectiveAction,
        initiateSimultaneousAction,
        submitSimultaneousAction,
        cancelSimultaneousAction,
        clearAllCompletedFactionProjects,
        clearAllCompletedNpcActivities,
        onDeleteCurrentActivity,
        onDeleteCompletedActivity,
        deleteFactionProject,
        deleteFactionCompletedProject,
        deleteFactionCustomState,
        deleteFactionBonus,
        worldMap,
        updateNpcPortrait,
        deleteLocationThreat,
        isGeneratingCinema,
        cinemaGenerationProgress,
        generateFilmTrailer,
        playingCinematic,
        playCinematic,
        stopPlayingCinematic,
        exportCinematic,
        importCinematic,
        deleteCinematic,
        continueFilmTrailer,
        extendingCinematicId,
        cancelCinemaGeneration,
        isCinemaVisible,
        cinemaFrames,
        closeCinemaPlayer,
        updateCinematic,
        regenerateCinemaFrame,
        generateCinematicAudio,
        lastTurnSaveFile,
        regenerateLastResponse,
        networkChatHistory,
        sendNetworkChatMessage,
    };
}
