
import { CheckIcon, ChevronDoubleLeftIcon, XMarkIcon } from '@heroicons/react/24/solid';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CharacterSheet from './components/CharacterSheet';
import ChatWindow from './components/ChatWindow';
import CollectiveActionPanel from './components/CollectiveActionPanel';
import CollectiveActionRequestModal from './components/CollectiveActionRequestModal';
import CombatTracker from './components/CombatTracker';
import DetailRenderer from './components/DetailRenderer/index';
import ImageRenderer from './components/ImageRenderer';
import InputBar from './components/InputBar';
import { InventoryScreen } from './components/InventoryScreen';
import LocationViewer from './components/LocationViewer';
import MarkdownRenderer from './components/MarkdownRenderer';
import Modal from './components/Modal';
import MusicPlayer from './components/MusicPlayer';
import { PartyStatus } from './components/PartyStatus';
import PlayerCreationModal from './components/PlayerCreationModal';
import SidePanel from './components/SidePanel';
import SimultaneousActionPanel from './components/SimultaneousActionPanel';
import StartScreen from './components/StartScreen';
import TurnIndicator from './components/TurnIndicator';
import { useLocalization } from './context/LocalizationContext';
import { useGameLogic } from './hooks/useGameLogic';
import { ChatMessage, Cinematic, Faction, Item, Location, NPC, NetworkRole, PlayerCharacter, Quest, Wound, LocationStorage, Project, LocationData, ImageCacheEntry } from './types';
import { gameData } from './utils/localizationGameData';
import TextReaderModal from './components/TextReaderModal';
import { useSpeech } from './context/SpeechContext';
import StorageScreen from './components/StorageScreen';
import CinemaPlayer from './components/CinemaPlayer';
import CinemaHall from './components/CinemaHall';
import ConfirmationModal from './components/ConfirmationModal';


interface ImageModalInfo {
    prompt: string;
    originalTextPrompt: string;
    onClearCustom?: () => void;
    onUpload?: (base64: string) => void;
}

const isNpc = (d: any): d is NPC => d && typeof d === 'object' && !Array.isArray(d) && (d.relationshipLevel !== undefined || d.NPCId !== undefined);
const isItem = (d: any): d is Item => d && typeof d === 'object' && !Array.isArray(d) && typeof d.quality === 'string' && typeof d.weight === 'number';
const isQuest = (d: any): d is Quest => d && typeof d === 'object' && !Array.isArray(d) && typeof d.questGiver === 'string' && Array.isArray(d.objectives);
const isLocation = (d: any): d is (Location & { type: 'location' }) => d && typeof d === 'object' && !Array.isArray(d) && d.type === 'location' && d.externalDifficultyProfile !== undefined;
const isWound = (d: any): d is (Wound & { type: 'wound', characterType: 'player' | 'npc', characterId: string | null }) => d && typeof d === 'object' && !Array.isArray(d) && d.type === 'wound';
const isPlayerCharacter = (d: any): d is PlayerCharacter & { type: 'playerCharacter' } => d && typeof d === 'object' && !Array.isArray(d) && d.type === 'playerCharacter';
const isFaction = (data: any): data is Faction & { type: 'faction' } => data && typeof data === 'object' && !Array.isArray(data) && data.type === 'faction' && data.reputation !== undefined;


export default function App(): React.ReactNode {
    const { language, setLanguage, t } = useLocalization();
    const { cancel } = useSpeech();

    const {
        gameState,
        gameHistory,
        isLoading,
        error,
        startGame,
        sendMessage,
        askQuestion,
        cancelRequest,
        lastJsonResponse,
        lastRequestJson,
        gameLog,
        combatLog,
        equipItem,
        unequipItem,
        dropItem,
        moveItem,
        splitItemStack,
        mergeItemStacks,
        disassembleItem,
        disassembleNpcItem,
        craftItem,
        moveFromStashToInventory,
        dropItemFromStash,
        deleteMessage,
        clearHalfHistory,
        deleteLogs,
        forgetNpc,
        forgetFaction,
        clearNpcJournal,
        deleteOldestNpcJournalEntries,
        deleteNpcJournalEntry,
        forgetLocation,
        forgetQuest,
        spendAttributePoint,
        setAutoCombatSkill,
        sceneImagePrompt,
        saveGame,
        loadGame,
        loadAutosave,
        autosaveTimestamp,
        suggestedActions,
        visitedLocations,
        worldState,
        gameSettings,
        updateGameSettings,
        superInstructions,
        updateSuperInstructions,
        turnNumber,
        editChatMessage,
        editNpcData,
        editQuestData,
        editItemData,
        editFactionData,
        editLocationData,
        editPlayerData,
        editWorldState,
        editWeather,
        editWorldStateFlagData,
        saveGameToSlot,
        loadGameFromSlot,
        deleteGameSlot,
        dbSaveSlots,
        refreshDbSaveSlots,
        musicVideoIds,
        isMusicLoading,
        isMusicPlayerVisible,
        handlePrimaryMusicClick,
        fetchMusicSuggestion,
        clearMusic,
        currentStep,
        currentModel,
        turnTime,
        onImageGenerated,
        forgetHealedWound,
        forgetActiveWound,
        clearAllHealedWounds,
        onRegenerateId,
        deleteCustomState,
        deleteNpcCustomState,
        deleteWorldStateFlag,
        deleteWorldEvent,
        deleteWorldEventsByTurnRange,
        updateNpcSortOrder,
        updateItemSortOrder,
        updateItemSortSettings,
        updateNpcItemSortOrder,
        updateNpcItemSortSettings,
        updateActiveSkillSortOrder,
        updatePassiveSkillSortOrder,
        handleTransferItem,
        handleEquipItemForNpc,
        handleUnequipItemForNpc,
        handleSplitItemForNpc,
        handleMergeItemsForNpc,
        handleMoveItemForNpc,
        onEditNpcMemory,
        onDeleteNpcMemory,
        clearNpcJournalsNow,
        passTurnManually,
        addPlayer,
        updatePlayerPortrait,
        removePlayer,
        passTurnToPlayer,
        deleteActiveSkill,
        deletePassiveSkill,
        deleteActiveEffect,
        startHost,
        joinGame,
        sendNewCharacterToHost,
        initiateCollectiveAction,
        submitCollectiveAction,
        processCollectiveActions,
        cancelCollectiveAction,
        assignCharacterToPeer,
        forceSyncAll,
        startHostingFromLocalGame,
        initiateSimultaneousAction,
        submitSimultaneousAction,
        cancelSimultaneousAction,
        disconnect,
        requestSyncFromHost,
        clearAllCompletedFactionProjects,
        clearAllCompletedNpcActivities,
        onDeleteCurrentActivity,
        onDeleteCompletedActivity,
        deleteFactionProject,
        deleteFactionCustomState,
        worldMap,
        updateNpcPortrait,
        placeAsStorage,
        moveToLocationStorage,
        retrieveFromLocationStorage,
        shareStorageAccess,
        revokeStorageAccess,
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
        deleteFactionBonus,
    } = useGameLogic({ language, setLanguage });

    const [hasStarted, setHasStarted] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [managingNpcInventory, setManagingNpcInventory] = useState<NPC | null>(null);
    const [messageModalState, setMessageModalState] = useState<{ title: string; content: string } | null>(null);
    const [textReaderState, setTextReaderState] = useState<{ title: string; content: string } | null>(null);
    const [imageModalInfo, setImageModalInfo] = useState<ImageModalInfo | null>(null);
    const [detailModalStack, setDetailModalStack] = useState<{ title: string; data: any }[]>([]);
    const [isDetailModalFullScreen, setIsDetailModalFullScreen] = useState(false);
    const [editModalData, setEditModalData] = useState<{ index: number, message: ChatMessage } | null>(null);
    const [editContent, setEditContent] = useState('');
    const [isMapFullScreen, setIsMapFullScreen] = useState(false);
    const [isCombatFullScreen, setIsCombatFullScreen] = useState(false);
    const [isCollectiveActionModalOpen, setIsCollectiveActionModalOpen] = useState(false);
    const [viewingCharacter, setViewingCharacter] = useState<PlayerCharacter | NPC | null>(null);
    const [isCharacterSheetFullScreen, setIsCharacterSheetFullScreen] = useState(false);
    const [isPartyStatusFullScreen, setIsPartyStatusFullScreen] = useState(false);
    const [sidePanelView, setSidePanelView] = useState<string>('menu');
    const [characterSheetDefaultView, setCharacterSheetDefaultView] = useState('menu');
    const [storageScreenState, setStorageScreenState] = useState<{ storage: LocationStorage, locationId: string } | null>(null);
    const [isCinemaHallFullScreen, setIsCinemaHallFullScreen] = useState(false);
    const [isRegenConfirmOpen, setIsRegenConfirmOpen] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [stealthConfirmAction, setStealthConfirmAction] = useState<'enter' | 'exit' | null>(null);
    const allWorldLocations = useMemo<LocationData[]>(() => Object.values(worldMap || {}), [worldMap]);

    const handleOpenStorage = useCallback((locationId: string, storage: LocationStorage) => {
        setStorageScreenState({ locationId, storage });
    }, []);
    const handleCloseStorage = useCallback(() => {
        setStorageScreenState(null);
    }, []);


    const handleOpenNpcInventory = useCallback((npc: NPC) => {
        setViewingCharacter(null); // Ensure character sheet modal is closed
        setManagingNpcInventory(npc);
        setIsInventoryOpen(false);
    }, []);

    const handleCloseNpcInventory = useCallback(() => {
        setManagingNpcInventory(null);
    }, []);

    const handleOpenPlayerInventory = useCallback(() => {
        setViewingCharacter(null); // Ensure character sheet modal is closed
        setManagingNpcInventory(null);
        setIsInventoryOpen(true);
    }, []);

    const handleClosePlayerInventory = useCallback(() => {
        setIsInventoryOpen(false);
    }, []);


    useEffect(() => {
        if (managingNpcInventory && gameState?.encounteredNPCs) {
            const freshNpc = gameState.encounteredNPCs.find(n => n.NPCId === managingNpcInventory.NPCId);
            if (freshNpc && JSON.stringify(freshNpc) !== JSON.stringify(managingNpcInventory)) {
                setManagingNpcInventory(freshNpc);
            }
        }
    }, [gameState?.encounteredNPCs, managingNpcInventory]);


    useEffect(() => {
        if (viewingCharacter && gameState) {
            if ('playerId' in viewingCharacter) { // It's a PlayerCharacter
                const freshCharacter = gameState.players.find(p => p.playerId === viewingCharacter.playerId);
                if (freshCharacter && JSON.stringify(freshCharacter) !== JSON.stringify(viewingCharacter)) {
                    setViewingCharacter(freshCharacter);
                }
            } else { // It's an NPC
                const freshCharacter = gameState.encounteredNPCs.find(n => n.NPCId === viewingCharacter.NPCId);
                if (freshCharacter && JSON.stringify(freshCharacter) !== JSON.stringify(viewingCharacter)) {
                    setViewingCharacter(freshCharacter);
                }
            }
        }
    }, [gameState, viewingCharacter]);

    useEffect(() => {
        // This was causing a bug where viewing other players' character sheets was impossible
        // in co-op mode. It would automatically switch the view to the active player.
        // Commenting this out allows for free viewing of any character sheet at any time.
        /*
        if (viewingCharacter && gameState && 'playerId' in viewingCharacter) {
            const viewingPlayerIndex = gameState.players.findIndex(p => p.playerId === viewingCharacter.playerId);
    
            if (viewingPlayerIndex !== -1 && viewingPlayerIndex !== gameState.activePlayerIndex) {
                console.log(`Switching character view from ${viewingCharacter.name} to active player ${gameState.players[gameState.activePlayerIndex].name}`);
                setViewingCharacter(gameState.players[gameState.activePlayerIndex]);
            }
        }
        */
    }, [gameState?.activePlayerIndex, gameState?.players, viewingCharacter]);


    // Resizable sidebar state and logic
    const [sidebarWidth, setSidebarWidth] = useState(507);
    const [isResizing, setIsResizing] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const currentDetailModal = useMemo(() => detailModalStack.length > 0 ? detailModalStack[detailModalStack.length - 1] : null, [detailModalStack]);

    useEffect(() => {
        if (!currentDetailModal || !gameState) return;

        const { data } = currentDetailModal;
        let updatedData: any = null;

        if (isWound(data)) {
            const woundData = data as (Wound & { type: 'wound', characterType: 'player' | 'npc', characterId: string | null });
            let foundWound: Wound | undefined | null = null;

            const findWoundInList = (woundList?: Wound[]) => (woundList || []).find((w: Wound) =>
                (woundData.woundId && w.woundId === woundData.woundId) ||
                (!woundData.woundId && w.woundName === woundData.woundName && w.severity === woundData.severity)
            );

            foundWound = findWoundInList(gameState.playerCharacter.playerWounds);

            if (!foundWound && Array.isArray(gameState.encounteredNPCs)) {
                for (const npc of gameState.encounteredNPCs) {
                    if (npc) {
                        foundWound = findWoundInList(npc.wounds);
                        if (foundWound) break;
                    }
                }
            }

            if (foundWound) {
                updatedData = Object.assign({}, data, foundWound);
            } else {
                updatedData = data;
            }
        } else if (isPlayerCharacter(data)) {
            const pcData = data as PlayerCharacter & { type: 'playerCharacter' };
            const foundPlayer = gameState.players.find((p: PlayerCharacter) => p.playerId === pcData.playerId);
            if (foundPlayer) {
                updatedData = Object.assign({}, data, foundPlayer);
            }
        } else if (isNpc(data) && Array.isArray(gameState.encounteredNPCs)) {
            const npcData = data as NPC;
            const foundNpc = gameState.encounteredNPCs.find(npc =>
                npc && ((npcData.NPCId && npc.NPCId === npcData.NPCId) ||
                    (!npcData.NPCId && npc.name === npcData.name))
            );
            if (foundNpc) {
                updatedData = Object.assign({}, data, foundNpc);
            }
        } else if (isFaction(data) && Array.isArray(gameState.encounteredFactions)) {
            const factionData = data as Faction;
            const foundFaction = gameState.encounteredFactions.find(faction =>
                faction && ((factionData.factionId && faction.factionId === factionData.factionId) ||
                    (!factionData.factionId && faction.name === factionData.name))
            );
            if (foundFaction) {
                updatedData = Object.assign({}, data, foundFaction);
            }
        } else if (isItem(data) && Array.isArray(gameState.playerCharacter.inventory)) {
            const itemData = data as Item;
            updatedData = gameState.playerCharacter.inventory.find((item: Item) => item.existedId === itemData.existedId);
        } else if (isQuest(data)) {
            const questData = data as Quest;
            const allQuests = [...(Array.isArray(gameState.activeQuests) ? gameState.activeQuests : []), ...(Array.isArray(gameState.completedQuests) ? gameState.completedQuests : [])];
            updatedData = allQuests.find((q: Quest) =>
                (questData.questId && q.questId === questData.questId) ||
                (!questData.questId && q.questName === questData.questName)
            );
        } else if (isLocation(data)) {
             const locationData = data as Location & { type: 'location' };
             const allKnownLocations = { ...(worldMap || {}), ...(gameState.currentLocationData && gameState.currentLocationData.locationId ? { [gameState.currentLocationData.locationId]: gameState.currentLocationData } : {}) };
             const foundLocation = locationData.locationId ? allKnownLocations[locationData.locationId] : undefined;
             if (foundLocation && typeof foundLocation === 'object' && !Array.isArray(foundLocation)) {
                 updatedData = Object.assign({}, data, foundLocation);
             }
        }

        if (updatedData && JSON.stringify(updatedData) !== JSON.stringify(data)) {
            setDetailModalStack(prev => {
                const newStack = [...prev];
                if (newStack.length > 0) {
                    newStack[newStack.length - 1] = { ...newStack[newStack.length - 1], data: updatedData };
                }
                return newStack;
            });
        }
    }, [gameState, currentDetailModal, visitedLocations, worldMap]);

    const { isMyTurn, activePlayerName } = useMemo(() => {
        if (!gameState || !gameSettings || gameSettings.cooperativeGameType === 'None') {
            return { isMyTurn: true, activePlayerName: null };
        }

        const activePlayer = gameState.players[gameState.activePlayerIndex];
        const activeName = activePlayer?.name || null;

        if (gameState.playerNeedsToCreateCharacter) {
            return { isMyTurn: false, activePlayerName: activeName };
        }

        const myPlayerId = gameState.myPeerId;
        if (!myPlayerId || !activePlayer) {
            return { isMyTurn: true, activePlayerName: activeName }; // Fallback for single player/initial state
        }

        return { isMyTurn: activePlayer.playerId === myPlayerId, activePlayerName: activeName };
    }, [gameState, gameSettings]);

    const npcsInScene = useMemo(() => {
        if (!gameState) return [];
        const { currentLocationData, encounteredNPCs } = gameState;
        if (!currentLocationData || !encounteredNPCs) return [];
    
        const currentLocId = currentLocationData.locationId;
        const currentLocInitialId = currentLocationData.initialId;
        const currentLocName = currentLocationData.name;

        // Create a map of all known locations for efficient lookup
        const allKnownLocations = new Map<string, Location>();
        Object.values(worldMap || {}).forEach(loc => loc.locationId && allKnownLocations.set(loc.locationId, loc));
        (visitedLocations || []).forEach(loc => loc.locationId && allKnownLocations.set(loc.locationId, loc));
        if (currentLocationData.locationId) {
            allKnownLocations.set(currentLocationData.locationId, currentLocationData);
        }

        const npcsInLocation = encounteredNPCs.filter(npc => {
            if (!npc) return false;
    
            // 1. Match by location ID
            if (currentLocId && npc.currentLocationId === currentLocId) {
                return true;
            }
    
            // 2. Match by initial ID (for new locations)
            if (currentLocInitialId && npc.initialLocationId === currentLocInitialId) {
                return true;
            }

            // 3. Match by location name
            if (npc.currentLocationId) {
                const npcLocation = allKnownLocations.get(npc.currentLocationId);
                if (npcLocation && npcLocation.name === currentLocName) {
                    return true;
                }
            }
    
            return false;
        });

        const npcsWithRecentJournalsSet = new Set<string>();
        if (lastJsonResponse) {
            try {
                // This might fail if JSON is streaming, but that's okay.
                const response = JSON.parse(lastJsonResponse);
                if (response && response.NPCJournals && Array.isArray(response.NPCJournals)) {
                    response.NPCJournals.forEach((journalEntry: any) => {
                        const npcName = journalEntry.NPCName || journalEntry.name;
                        if (journalEntry.NPCId) {
                            npcsWithRecentJournalsSet.add(journalEntry.NPCId);
                        } else if (npcName) {
                            // Fallback to name if ID is missing (e.g. for new NPCs)
                            const npc = encounteredNPCs.find(n => n.name === npcName);
                            if (npc && npc.NPCId) {
                                npcsWithRecentJournalsSet.add(npc.NPCId);
                            }
                        }
                    });
                }
            } catch (e) {
                // It's fine if it's not a valid JSON yet during streaming.
            }
        }
        
        const combinedNpcSet = new Set(npcsInLocation.map(n => n.NPCId));
        npcsWithRecentJournalsSet.forEach(id => id && combinedNpcSet.add(id));

        return encounteredNPCs.filter(npc => npc && npc.NPCId && combinedNpcSet.has(npc.NPCId));

    }, [gameState, visitedLocations, worldMap, lastJsonResponse]);

    const toggleSidebar = useCallback(() => {
        setIsSidebarCollapsed(prev => !prev);
    }, []);

    const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            const newWidth = window.innerWidth - mouseMoveEvent.clientX;
            const minWidth = 320;
            const maxWidth = 800;
            if (newWidth > minWidth && newWidth < maxWidth) {
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    const handleStartGame = (creationData: any) => {
        startGame(creationData);
        setHasStarted(true);
    };

    const handleStartHost = (creationData: any) => {
        startHost(creationData);
        setHasStarted(true);
    };

    const handleJoinGame = (hostId: string, role: NetworkRole, playerName: string) => {
        joinGame(hostId, role, playerName);
        setHasStarted(true);
    };

    const handleSaveGame = async () => {
        await saveGame();
    };

    const handleLoadGame = async () => {
        const success = await loadGame();
        if (success) {
            setHasStarted(true);
        }
    };

    const handleLoadAutosave = async () => {
        const success = await loadAutosave();
        if (success) {
            setHasStarted(true);
        }
    };

    const handleLoadGameFromSlot = async (slotId: number) => {
        const success = await loadGameFromSlot(slotId);
        if (success) {
            setHasStarted(true);
        }
    };

    const handleShowMessageModal = useCallback((title: string, content: string) => {
        setMessageModalState({ title, content });
    }, []);

    const handleOpenTextReader = useCallback((title: string, content: string) => {
        setTextReaderState({ title, content });
    }, []);

    const handleCloseTextReader = useCallback(() => {
        cancel(); // Stop speech when closing modal
        setTextReaderState(null);
    }, [cancel]);

    const handleShowImageModal = useCallback((prompt: string, originalTextPrompt: string, onClearCustom?: () => void, onUpload?: (base64: string) => void) => {
        if (prompt) {
            setImageModalInfo({ prompt, originalTextPrompt, onClearCustom, onUpload });
        }
    }, []);

    const handleOpenDetailModal = useCallback((title: string, data: any) => {
        setDetailModalStack(prev => [...prev, { title, data }]);
    }, []);

    const handleCloseDetailModal = useCallback(() => {
        setDetailModalStack(prev => {
            const newStack = prev.slice(0, -1);
            if (newStack.length === 0) {
                setIsDetailModalFullScreen(false); // Reset on closing last modal
            }
            return newStack;
        });
    }, []);

    const handleShowEditModal = (index: number, message: ChatMessage) => {
        setEditModalData({ index, message });
        setEditContent(message.content);
    };

    const handleSaveEdit = () => {
        if (editModalData) {
            editChatMessage(editModalData.index, editContent);
            setEditModalData(null);
        }
    };

    const handleOpenJournalModal = useCallback((npc: NPC) => {
        setViewingCharacter(npc);
        setCharacterSheetDefaultView('Journal');
    }, []);


    const lastPlayerMessage = useMemo(() =>
        gameHistory.slice().reverse().find(m => m.sender === 'player'),
        [gameHistory]);

    const handleResend = useCallback(() => {
        if (lastPlayerMessage && !isLoading) {
            const isLastMessageAQuestion = lastPlayerMessage.content.startsWith('[Question]');

            if (isLastMessageAQuestion) {
                const originalQuestion = lastPlayerMessage.content.substring('[Question] '.length);
                sendMessage(originalQuestion, null);
            } else {
                sendMessage(lastPlayerMessage.content, null);
            }
        }
    }, [lastPlayerMessage, isLoading, sendMessage, askQuestion]);

    const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);

    useEffect(() => {
        if (gameState?.playerNeedsToCreateCharacter) {
            setIsCreatingPlayer(true);
        } else {
            setIsCreatingPlayer(false);
        }
    }, [gameState?.playerNeedsToCreateCharacter]);

    const handleSubmitNewNetworkPlayer = (creationData: any) => {
        if (sendNewCharacterToHost) {
            sendNewCharacterToHost(creationData);
        }
        setIsCreatingPlayer(false);
    };

    const currentWorldData = useMemo(() => {
        if (!gameSettings) return gameData.fantasy;
        const { universe, selectedEra } = gameSettings.gameWorldInformation.baseInfo;
        const universeKey = universe as keyof typeof gameData;
        if (universeKey === 'history' || universeKey === 'myths') {
            const eraKey = selectedEra as any;
            return gameData[universeKey][eraKey] || gameData.fantasy;
        }
        return gameData[universeKey] || gameData.fantasy;
    }, [gameSettings]);

    const handleViewCharacter = useCallback((character: PlayerCharacter | NPC) => {
        setViewingCharacter(character);
        setCharacterSheetDefaultView('menu');
    }, []);

    const handleCloseCharacterSheet = useCallback(() => {
        setViewingCharacter(null);
        setCharacterSheetDefaultView('menu');
    }, []);

    const handleModalClearCustom = useCallback(() => {
        const onClearCallback = imageModalInfo?.onClearCustom;
        if (onClearCallback) {
            onClearCallback();
        }
    }, [imageModalInfo]);
    
    const handleModalUploadCustom = useCallback((base64: string | null) => {
        setImageModalInfo(prev => {
            if (prev?.onUpload && base64) {
                prev.onUpload(base64);
                return { ...prev, prompt: base64 };
            }
            return prev;
        });
    }, []);

    const handleImageGeneratedInModal = useCallback((generatedFromPrompt: string, newBase64: string, sourceProvider: ImageCacheEntry['sourceProvider'], sourceModel?: string) => {
        onImageGenerated(generatedFromPrompt, newBase64, sourceProvider, sourceModel);
        
        if (imageModalInfo?.onClearCustom) {
            imageModalInfo.onClearCustom();
        }
        
        setImageModalInfo(prev => {
            if (!prev) return null;
            return { ...prev, prompt: generatedFromPrompt, originalTextPrompt: generatedFromPrompt };
        });
    }, [onImageGenerated, imageModalInfo]);

    const handleConfirmRegenerate = useCallback(async () => {
        setIsRegenConfirmOpen(false);
        if (regenerateLastResponse) {
            const success = await regenerateLastResponse();
            if (success) {
                setIsRegenerating(true);
            }
        }
    }, [regenerateLastResponse]);

    const handleStealthButtonClick = useCallback(() => {
        if (!gameState) return;
        const action = gameState.playerCharacter.stealthState.isActive ? 'exit' : 'enter';
        setStealthConfirmAction(action);
    }, [gameState]);

    const handleConfirmStealth = useCallback(() => {
        if (!stealthConfirmAction) return;
        const message = stealthConfirmAction === 'enter' ? t('enterStealthAction') : t('exitStealthAction');
        sendMessage(message, null);
        setStealthConfirmAction(null);
    }, [stealthConfirmAction, sendMessage, t]);

    useEffect(() => {
        if (isRegenerating) {
            // The state is now reset. We can resend the last message.
            // The useEffect will trigger a re-render, and handleResend will be fresh.
            handleResend();
            setIsRegenerating(false);
        }
    }, [isRegenerating, handleResend]);

    if (!hasStarted) {
        return <StartScreen
            onStartLocal={handleStartGame}
            onStartHost={handleStartHost}
            onJoinGame={handleJoinGame}
            onLoadGame={handleLoadGame}
            onLoadAutosave={handleLoadAutosave}
            autosaveTimestamp={autosaveTimestamp}
            onLoadFromSlot={handleLoadGameFromSlot}
            dbSaveSlots={dbSaveSlots}
        />;
    }

    if (isCreatingPlayer && gameSettings && gameState) {
        return (
            <PlayerCreationModal
                isOpen={isCreatingPlayer}
                onClose={() => { /* Disconnect logic could go here */ }}
                onSubmit={handleSubmitNewNetworkPlayer}
                universe={gameSettings.gameWorldInformation.baseInfo.universe}
                currentWorldData={currentWorldData}
                gameSettings={gameSettings}
                partyLevel={gameState.playerCharacter.level || 1}
                shareCharacteristics={gameSettings.multiplePersonalitiesSettings?.shareCharacteristics ?? false}
            />
        );
    }

    return (
        <>
            <div className="bg-gray-900/50 text-gray-200 min-h-screen flex flex-col md:flex-row font-sans backdrop-blur-sm">
                <div className="relative flex-1 h-screen min-w-0">
                    {sceneImagePrompt && (
                        <div className="absolute inset-0 z-0 cursor-pointer" onClick={() => handleShowImageModal(sceneImagePrompt, sceneImagePrompt)}>
                            <ImageRenderer
                                key={sceneImagePrompt}
                                prompt={sceneImagePrompt}
                                originalTextPrompt={sceneImagePrompt}
                                alt={t("Current game scene")}
                                className="object-cover w-full h-full opacity-30"
                                width={1024}
                                height={1024}
                                imageCache={gameState?.imageCache ?? {}}
                                onImageGenerated={onImageGenerated}
                                onClick={() => handleShowImageModal(sceneImagePrompt, sceneImagePrompt)}
                                gameSettings={gameSettings}
                                gameIsLoading={isLoading}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
                        </div>
                    )}
                    <main className="relative z-10 flex-1 flex flex-col h-screen p-4 md:p-6 lg:p-8 pointer-events-none">
                        {gameState && gameSettings?.showPartyStatusPanel && gameState.players.length > 1 && (
                            <PartyStatus
                                players={gameState.players}
                                activePlayerIndex={gameState.activePlayerIndex}
                                onPassTurn={passTurnManually}
                                gameSettings={gameSettings}
                                imageCache={gameState?.imageCache ?? {}}
                                onImageGenerated={onImageGenerated}
                                onOpenImageModal={handleShowImageModal}
                                onExpandFullScreen={() => setIsPartyStatusFullScreen(true)}
                                updatePlayerPortrait={updatePlayerPortrait}
                                isLoading={isLoading}
                            />
                        )}
                        <div className="flex-1 overflow-y-auto mb-4 pr-2 pointer-events-auto">
                            <ChatWindow
                                history={gameHistory}
                                error={error}
                                onDeleteMessage={deleteMessage}
                                onShowMessageModal={handleShowMessageModal}
                                onResend={lastPlayerMessage ? handleResend : undefined}
                                onShowEditModal={handleShowEditModal}
                                allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false}
                                onRegenerate={lastTurnSaveFile && !isLoading ? () => setIsRegenConfirmOpen(true) : undefined}
                                isLoading={isLoading}
                            />
                        </div>
                        {gameState?.simultaneousActionState?.isActive ? (
                            <SimultaneousActionPanel
                                players={gameState.players}
                                myPlayerId={gameState.myPeerId}
                                roundActions={gameState.simultaneousActionState.actions}
                                onSubmitAction={submitSimultaneousAction}
                                isLoading={isLoading}
                                onCancelAction={gameState.networkRole === 'host' ? cancelSimultaneousAction : undefined}
                                isHost={gameState.networkRole === 'host'}
                            />
                        ) : gameState?.collectiveActionState?.isActive ? (
                            <CollectiveActionPanel
                                gameState={gameState}
                                onSubmitAction={submitCollectiveAction}
                                onProcessActions={processCollectiveActions}
                                onCancelAction={cancelCollectiveAction}
                                isLoading={isLoading}
                            />
                        ) : (
                            <>
                                <TurnIndicator
                                    isMyTurn={isMyTurn}
                                    activePlayerName={activePlayerName}
                                    gameSettings={gameSettings}
                                />
                                <InputBar
                                    onSendMessage={sendMessage}
                                    onAskQuestion={askQuestion}
                                    onCancelRequest={cancelRequest}
                                    onClearHalfHistory={clearHalfHistory}
                                    isLoading={isLoading}
                                    history={gameHistory}
                                    suggestedActions={suggestedActions}
                                    gameState={gameState}
                                    playerCharacter={gameState?.playerCharacter}
                                    gameSettings={gameSettings}
                                    onGetMusicSuggestion={handlePrimaryMusicClick}
                                    isMusicLoading={isMusicLoading}
                                    isMusicPlayerVisible={isMusicPlayerVisible}
                                    onRequestCollectiveAction={() => setIsCollectiveActionModalOpen(true)}
                                    onInitiateSimultaneousAction={initiateSimultaneousAction}
                                    onToggleStealth={handleStealthButtonClick}
                                />
                            </>
                        )}
                    </main>
                </div>

                {!isSidebarCollapsed && (
                    <div
                        onMouseDown={startResizing}
                        className="hidden md:block w-1.5 cursor-col-resize bg-gray-700/40 hover:bg-cyan-500/60 transition-colors duration-200 flex-shrink-0"
                    />
                )}

                <aside
                    style={{ width: isSidebarCollapsed ? '0px' : `${sidebarWidth}px` }}
                    className={`w-full md:w-auto bg-gray-800/80 rounded-lg backdrop-blur-md border border-gray-700/60 h-screen flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isSidebarCollapsed ? 'p-0 border-none' : 'p-4 md:p-6'}`}
                >
                    {!isSidebarCollapsed && (
                        <SidePanel
                            gameState={gameState}
                            worldState={worldState}
                            worldStateFlags={gameState?.worldStateFlags}
                            onOpenInventory={handleOpenPlayerInventory}
                            onOpenNpcInventory={handleOpenNpcInventory}
                            lastJsonResponse={lastJsonResponse}
                            lastRequestJsonForDebug={lastRequestJson}
                            gameLog={gameLog}
                            combatLog={combatLog}
                            onDeleteLogs={deleteLogs}
                            onSaveGame={handleSaveGame}
                            onLoadGame={handleLoadGame}
                            onLoadAutosave={loadAutosave}
                            autosaveTimestamp={autosaveTimestamp}
                            visitedLocations={visitedLocations}
                            onOpenDetailModal={handleOpenDetailModal}
                            onOpenJournalModal={handleOpenJournalModal}
                            onOpenImageModal={handleShowImageModal}
                            onShowMessageModal={handleShowMessageModal}
                            onSpendAttributePoint={spendAttributePoint}
                            onToggleSidebar={toggleSidebar}
                            onExpandMap={() => setIsMapFullScreen(true)}
                            onExpandCombat={() => setIsCombatFullScreen(true)}
                            onExpandCinemaHall={() => setIsCinemaHallFullScreen(true)}
                            gameSettings={gameSettings}
                            updateGameSettings={updateGameSettings}
                            superInstructions={superInstructions}
                            updateSuperInstructions={updateSuperInstructions}
                            isLoading={isLoading}
                            setAutoCombatSkill={setAutoCombatSkill}
                            lastUpdatedQuestId={gameState?.lastUpdatedQuestId}
                            onSendMessage={sendMessage}
                            craftItem={craftItem}
                            moveFromStashToInventory={moveFromStashToInventory}
                            dropItemFromStash={dropItemFromStash}
                            turnNumber={turnNumber}
                            editChatMessage={editChatMessage}
                            editNpcData={editNpcData}
                            editQuestData={editQuestData}
                            editItemData={editItemData}
                            editFactionData={editFactionData}
                            editLocationData={editLocationData}
                            editPlayerData={editPlayerData}
                            editWorldState={editWorldState}
                            editWeather={editWeather}
                            editWorldStateFlagData={editWorldStateFlagData}
                            saveGameToSlot={saveGameToSlot}
                            loadGameFromSlot={handleLoadGameFromSlot}
                            deleteGameSlot={deleteGameSlot}
                            dbSaveSlots={dbSaveSlots}
                            refreshDbSaveSlots={refreshDbSaveSlots}
                            currentStep={currentStep}
                            currentModel={currentModel}
                            turnTime={turnTime}
                            imageCache={gameState?.imageCache ?? {}}
                            onImageGenerated={onImageGenerated}
                            forgetHealedWound={forgetHealedWound}
                            forgetActiveWound={forgetActiveWound}
                            clearAllHealedWounds={clearAllHealedWounds}
                            onRegenerateId={onRegenerateId}
                            deleteCustomState={deleteCustomState}
                            deleteNpcCustomState={deleteNpcCustomState}
                            deleteWorldStateFlag={deleteWorldStateFlag}
                            deleteWorldEvent={deleteWorldEvent}
                            deleteWorldEventsByTurnRange={deleteWorldEventsByTurnRange}
                            updateNpcSortOrder={updateNpcSortOrder}
                            updateItemSortOrder={updateItemSortOrder}
                            updateItemSortSettings={updateItemSortSettings}
                            updateNpcItemSortOrder={updateNpcItemSortOrder}
                            updateNpcItemSortSettings={updateNpcItemSortSettings}
                            updateActiveSkillSortOrder={updateActiveSkillSortOrder}
                            updatePassiveSkillSortOrder={updatePassiveSkillSortOrder}
                            handleTransferItem={handleTransferItem}
                            handleEquipItemForNpc={handleEquipItemForNpc}
                            handleUnequipItemForNpc={handleUnequipItemForNpc}
                            handleSplitItemForNpc={handleSplitItemForNpc}
                            handleMergeItemsForNpc={handleMergeItemsForNpc}
                            handleMoveItemForNpc={handleMoveItemForNpc}
                            forgetNpc={forgetNpc}
                            forgetFaction={forgetFaction}
                            forgetQuest={forgetQuest}
                            forgetLocation={forgetLocation}
                            onEditNpcMemory={onEditNpcMemory}
                            onDeleteNpcMemory={onDeleteNpcMemory}
                            clearNpcJournalsNow={clearNpcJournalsNow}
                            addPlayer={addPlayer}
                            updatePlayerPortrait={updatePlayerPortrait}
                            allNpcs={gameState?.encounteredNPCs || []}
                            allFactions={gameState?.encounteredFactions || []}
                            allLocations={allWorldLocations}
                            removePlayer={removePlayer}
                            passTurnManually={passTurnManually}
                            passTurnToPlayer={passTurnToPlayer}
                            deleteActiveSkill={deleteActiveSkill}
                            deletePassiveSkill={deletePassiveSkill}
                            deleteActiveEffect={deleteActiveEffect}
                            deleteFactionBonus={deleteFactionBonus}
                            assignCharacterToPeer={assignCharacterToPeer}
                            peers={gameState?.peers}
                            networkRole={gameState?.networkRole}
                            onViewCharacterSheet={handleViewCharacter}
                            forceSyncAll={forceSyncAll}
                            startHostingFromLocalGame={startHostingFromLocalGame}
                            disconnect={disconnect}
                            isMyTurn={isMyTurn}
                            requestSyncFromHost={requestSyncFromHost}
                            clearAllCompletedFactionProjects={clearAllCompletedFactionProjects}
                            clearAllCompletedNpcActivities={clearAllCompletedNpcActivities}
                            onDeleteCurrentActivity={onDeleteCurrentActivity}
                            onDeleteCompletedActivity={onDeleteCompletedActivity}
                            deleteFactionProject={deleteFactionProject}
                            deleteFactionCustomState={deleteFactionCustomState}
                            sidePanelView={sidePanelView}
                            onSetSidePanelView={setSidePanelView}
                            updateNpcPortrait={updateNpcPortrait}
                            onOpenTextReader={handleOpenTextReader}
                            onOpenStorage={handleOpenStorage}
                            placeAsStorage={placeAsStorage}
                            generateFilmTrailer={generateFilmTrailer}
                            isGeneratingCinema={isGeneratingCinema}
                            cinemaGenerationProgress={cinemaGenerationProgress}
                            playCinematic={playCinematic}
                            exportCinematic={exportCinematic}
                            importCinematic={importCinematic}
                            deleteCinematic={deleteCinematic}
                            continueFilmTrailer={continueFilmTrailer}
                            extendingCinematicId={extendingCinematicId}
                            cancelCinemaGeneration={cancelCinemaGeneration}
                            updateCinematic={updateCinematic}
                            regenerateCinemaFrame={regenerateCinemaFrame}
                            generateCinematicAudio={generateCinematicAudio}
                            npcsInScene={npcsInScene}
                            networkChatHistory={networkChatHistory}
                            sendNetworkChatMessage={sendNetworkChatMessage}
                        />
                    )}
                </aside>
            </div>
            {isSidebarCollapsed && (
                <button
                    onClick={toggleSidebar}
                    className="fixed top-1/2 -translate-y-1/2 right-0 z-30 p-2 bg-gray-800/80 hover:bg-cyan-600/80 rounded-l-md transition-colors shadow-lg"
                    title={t("Expand Sidebar")}
                >
                    <ChevronDoubleLeftIcon className="h-6 w-6 text-white" />
                </button>
            )}
            {(isInventoryOpen || managingNpcInventory) && gameState && (
                <InventoryScreen
                    gameState={gameState}
                    npc={managingNpcInventory}
                    onClose={isInventoryOpen ? handleClosePlayerInventory : handleCloseNpcInventory}
                    gameSettings={gameSettings}
                    onEquip={equipItem}
                    onUnequip={unequipItem}
                    onDropItem={dropItem}
                    onMoveItem={moveItem}
                    onSplitItem={splitItemStack}
                    onMergeItems={mergeItemStacks}
                    onTransferItem={handleTransferItem}
                    onEquipItemForNpc={handleEquipItemForNpc}
                    onUnequipItemForNpc={handleUnequipItemForNpc}
                    onSplitItemForNpc={handleSplitItemForNpc}
                    onMergeItemsForNpc={handleMergeItemsForNpc}
                    onMoveNpcItem={handleMoveItemForNpc}
                    onOpenDetailModal={handleOpenDetailModal}
                    onOpenImageModal={handleShowImageModal}
                    imageCache={gameState.imageCache ?? {}}
                    onImageGenerated={onImageGenerated}
                    updateItemSortOrder={updateItemSortOrder}
                    updateItemSortSettings={updateItemSortSettings}
                    updateNpcItemSortOrder={updateNpcItemSortOrder}
                    updateNpcItemSortSettings={updateNpcItemSortSettings}
                    isLoading={isLoading}
                />
            )}
            {messageModalState && (
                <Modal isOpen={true} onClose={() => setMessageModalState(null)} title={messageModalState.title} showFontSizeControls={true}>
                    <MarkdownRenderer content={messageModalState.content} />
                </Modal>
            )}

            {textReaderState && (
                <TextReaderModal
                    isOpen={!!textReaderState}
                    onClose={handleCloseTextReader}
                    title={textReaderState.title}
                    content={textReaderState.content}
                />
            )}

            {storageScreenState && gameState && (
                <StorageScreen
                    isOpen={!!storageScreenState}
                    onClose={handleCloseStorage}
                    storage={storageScreenState.storage}
                    locationId={storageScreenState.locationId}
                    gameState={gameState}
                    onMoveToStorage={moveToLocationStorage}
                    onRetrieveFromStorage={retrieveFromLocationStorage}
                    onShareAccess={shareStorageAccess}
                    onRevokeAccess={revokeStorageAccess}
                    onOpenDetailModal={handleOpenDetailModal}
                    imageCache={gameState.imageCache}
                    onImageGenerated={onImageGenerated}
                    gameSettings={gameSettings}
                />
            )}

            {imageModalInfo && (
                <Modal isOpen={true} onClose={() => setImageModalInfo(null)} title={t("Scene Image")}>
                    <div className="flex justify-center items-center h-full">
                        <ImageRenderer
                            key={imageModalInfo.originalTextPrompt}
                            prompt={imageModalInfo.prompt}
                            originalTextPrompt={imageModalInfo.originalTextPrompt}
                            alt={t("Enlarged game scene")}
                            fitMode="natural"
                            className="rounded-md"
                            showRegenerateButton={!!imageModalInfo.onClearCustom || !imageModalInfo.prompt.startsWith('data:image')}
                            width={1024}
                            height={1024}
                            imageCache={gameState?.imageCache ?? {}}
                            onImageGenerated={handleImageGeneratedInModal}
                            onClearCustom={imageModalInfo.onClearCustom ? handleModalClearCustom : undefined}
                            onUploadCustom={imageModalInfo.onUpload ? handleModalUploadCustom : undefined}
                            gameSettings={gameSettings}
                            gameIsLoading={isLoading}
                            showSourceInfo={true}
                        />
                    </div>
                </Modal>
            )}
            <Modal 
                isOpen={!!currentDetailModal} 
                onClose={handleCloseDetailModal} 
                title={currentDetailModal?.title || t('Details')}
                size={isDetailModalFullScreen ? "fullscreen" : "default"}
                onToggleFullScreen={() => setIsDetailModalFullScreen(p => !p)}
                isFullScreen={isDetailModalFullScreen}
            >
                {currentDetailModal && <DetailRenderer
                    data={currentDetailModal.data}
                    onForgetNpc={forgetNpc}
                    onForgetLocation={forgetLocation}
                    onClearNpcJournal={clearNpcJournal}
                    onDeleteOldestNpcJournalEntries={deleteOldestNpcJournalEntries}
                    onDeleteNpcJournalEntry={deleteNpcJournalEntry}
                    onForgetQuest={forgetQuest}
                    onCloseModal={handleCloseDetailModal}
                    onOpenImageModal={handleShowImageModal}
                    onShowMessageModal={handleShowMessageModal}
                    playerCharacter={gameState?.playerCharacter}
                    setAutoCombatSkill={setAutoCombatSkill}
                    onOpenDetailModal={handleOpenDetailModal}
                    onOpenJournalModal={handleOpenJournalModal}
                    disassembleItem={disassembleItem}
                    disassembleNpcItem={disassembleNpcItem}
                    currentLocationId={gameState?.currentLocationData?.locationId}
                    allowHistoryManipulation={(gameSettings?.allowHistoryManipulation ?? false) && !isLoading}
                    onEditNpcData={editNpcData}
                    onEditQuestData={editQuestData}
                    onEditItemData={editItemData}
                    onEditLocationData={editLocationData}
                    onEditPlayerData={editPlayerData}
                    onEditFactionData={editFactionData}
                    onRegenerateId={onRegenerateId}
                    encounteredFactions={gameState?.encounteredFactions}
                    gameSettings={gameSettings}
                    imageCache={gameState?.imageCache ?? {}}
                    onImageGenerated={onImageGenerated}
                    forgetHealedWound={forgetHealedWound}
                    forgetActiveWound={forgetActiveWound}
                    clearAllHealedWounds={clearAllHealedWounds}
                    visitedLocations={visitedLocations}
                    handleTransferItem={handleTransferItem}
                    handleEquipItemForNpc={handleEquipItemForNpc}
                    handleUnequipItemForNpc={handleUnequipItemForNpc}
                    handleSplitItemForNpc={handleSplitItemForNpc}
                    handleMergeItemsForNpc={handleMergeItemsForNpc}
                    updateItemSortOrder={updateItemSortOrder}
                    updateItemSortSettings={updateItemSortSettings}
                    updateNpcItemSortOrder={updateNpcItemSortOrder}
                    updateNpcItemSortSettings={updateNpcItemSortSettings}
                    deleteNpcCustomState={deleteNpcCustomState}
                    deleteCustomState={deleteCustomState}
                    deleteWorldStateFlag={deleteWorldStateFlag}
                    onEditNpcMemory={onEditNpcMemory}
                    onDeleteNpcMemory={onDeleteNpcMemory}
                    updatePlayerPortrait={updatePlayerPortrait}
                    allNpcs={gameState?.encounteredNPCs}
                    allFactions={gameState?.encounteredFactions}
                    allLocations={allWorldLocations}
                    clearAllCompletedFactionProjects={clearAllCompletedFactionProjects}
                    deleteFactionProject={deleteFactionProject}
                    deleteFactionCustomState={deleteFactionCustomState}
                    deleteFactionBonus={deleteFactionBonus}
                    clearAllCompletedNpcActivities={clearAllCompletedNpcActivities}
                    onDeleteCurrentActivity={onDeleteCurrentActivity}
                    onDeleteCompletedActivity={onDeleteCompletedActivity}
                    onViewCharacterSheet={handleViewCharacter}
                    updateNpcPortrait={updateNpcPortrait}
                    onOpenTextReader={handleOpenTextReader}
                    onOpenStorage={handleOpenStorage}
                    placeAsStorage={placeAsStorage}
                    deleteLocationThreat={deleteLocationThreat}
                    isLoading={isLoading}
                    deleteActiveEffect={deleteActiveEffect}
                />}
            </Modal>
            {isMapFullScreen && gameState && (
                <Modal
                    isOpen={isMapFullScreen}
                    onClose={() => setIsMapFullScreen(false)}
                    title={t('World Map')}
                    size="fullscreen"
                >
                    <div className="flex-1 flex flex-col h-full bg-gray-900 -m-6">
                        <LocationViewer
                            visitedLocations={visitedLocations}
                            currentLocation={gameState.currentLocationData}
                            onOpenModal={handleOpenDetailModal}
                            imageCache={gameState?.imageCache ?? {}}
                            onImageGenerated={onImageGenerated}
                            isFullScreen={true}
                            onCollapse={() => setIsMapFullScreen(false)}
                            gameSettings={gameSettings}
                            encounteredFactions={gameState.encounteredFactions || []}
                        />
                    </div>
                </Modal>
            )}
            {isCombatFullScreen && gameState && (
                <Modal
                    isOpen={isCombatFullScreen}
                    onClose={() => setIsCombatFullScreen(false)}
                    title={t('Combat')}
                    size="fullscreen"
                >
                    <div className="flex-1 flex flex-col h-full bg-gray-900 -m-6 p-4">
                        <CombatTracker
                            enemies={gameState.enemiesData}
                            allies={gameState.alliesData}
                            combatLog={combatLog}
                            allNpcs={gameState.encounteredNPCs}
                            playerCharacter={gameState.playerCharacter}
                            setAutoCombatSkill={setAutoCombatSkill}
                            onOpenDetailModal={handleOpenDetailModal}
                            onViewCharacterSheet={handleViewCharacter}
                            onSendMessage={sendMessage}
                            isLoading={isLoading}
                            imageCache={gameState?.imageCache ?? {}}
                            onImageGenerated={onImageGenerated}
                            onOpenImageModal={handleShowImageModal}
                            gameSettings={gameSettings}
                            isFullScreen={true}
                            onCollapse={() => setIsCombatFullScreen(false)}
                            editNpcData={editNpcData}
                        />
                    </div>
                </Modal>
            )}
            {isPartyStatusFullScreen && gameState && (
                <Modal
                    isOpen={isPartyStatusFullScreen}
                    onClose={() => setIsPartyStatusFullScreen(false)}
                    title={t('Party Status')}
                    size="fullscreen"
                >
                    <div className="flex-1 flex flex-col h-full bg-gray-900 -m-6 p-4">
                        <PartyStatus
                            players={gameState.players}
                            activePlayerIndex={gameState.activePlayerIndex}
                            onPassTurn={passTurnManually}
                            gameSettings={gameSettings}
                            imageCache={gameState?.imageCache ?? {}}
                            onImageGenerated={onImageGenerated}
                            onOpenImageModal={handleShowImageModal}
                            isFullScreen={true}
                            onCollapseFullScreen={() => setIsPartyStatusFullScreen(false)}
                            updatePlayerPortrait={updatePlayerPortrait}
                            isLoading={isLoading}
                        />
                    </div>
                </Modal>
            )}
            {isCinemaHallFullScreen && gameState && (
                <Modal
                    isOpen={isCinemaHallFullScreen}
                    onClose={() => setIsCinemaHallFullScreen(false)}
                    title={t('CinemaHall')}
                    size="fullscreen"
                >
                    <div className="flex-1 flex flex-col h-full bg-gray-900 -m-6 p-4">
                        <CinemaHall
                            cinematics={gameState.cinematics || []}
                            onGenerateTrailer={generateFilmTrailer}
                            isGenerating={isGeneratingCinema || isLoading}
                            progress={cinemaGenerationProgress}
                            onPlay={playCinematic}
                            onExport={exportCinematic}
                            onDelete={deleteCinematic}
                            onImport={importCinematic}
                            onContinue={continueFilmTrailer}
                            extendingCinematicId={extendingCinematicId}
                            onCancel={cancelCinemaGeneration}
                            updateCinematic={updateCinematic}
                            regenerateCinemaFrame={regenerateCinemaFrame}
                            generateCinematicAudio={generateCinematicAudio}
                            isFullScreen={true}
                            onCollapse={() => setIsCinemaHallFullScreen(false)}
                        />
                    </div>
                </Modal>
            )}
            {isCollectiveActionModalOpen && gameState && (
                <CollectiveActionRequestModal
                    isOpen={isCollectiveActionModalOpen}
                    onClose={() => setIsCollectiveActionModalOpen(false)}
                    players={gameState.players}
                    myPlayerId={gameState.playerCharacter.playerId}
                    onSubmit={initiateCollectiveAction}
                />
            )}
            {editModalData && (
                <Modal isOpen={true} onClose={() => setEditModalData(null)} title={t("Edit Message")}>
                    <div className="space-y-4">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[200px]"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditModalData(null)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition flex items-center gap-2">
                                <XMarkIcon className="w-5 h-5" />
                                {t('Cancel')}
                            </button>
                            <button onClick={handleSaveEdit} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition flex items-center gap-2">
                                <CheckIcon className="w-5 h-5" />
                                {t('Save')}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
             <ConfirmationModal
                isOpen={isRegenConfirmOpen}
                onClose={() => setIsRegenConfirmOpen(false)}
                onConfirm={handleConfirmRegenerate}
                title={t('Regenerate Last Response')}
            >
                <p>{t('regenerate_confirmation_p1')}</p>
                <p className="mt-2 text-sm text-yellow-400/80">{t('regenerate_confirmation_p2')}</p>
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={!!stealthConfirmAction}
                onClose={() => setStealthConfirmAction(null)}
                onConfirm={handleConfirmStealth}
                title={stealthConfirmAction === 'enter' ? t('enter_stealth_confirmation_title') : t('exit_stealth_confirmation_title')}
            >
                <p>{stealthConfirmAction === 'enter' ? t('enter_stealth_confirmation_p1') : t('exit_stealth_confirmation_p1')}</p>
            </ConfirmationModal>
            {isMusicPlayerVisible && musicVideoIds && musicVideoIds.length > 0 && (
                <MusicPlayer
                    videoIds={musicVideoIds}
                    onClear={clearMusic}
                    onRegenerate={fetchMusicSuggestion}
                />
            )}
            {viewingCharacter && gameState && (
                <Modal
                    isOpen={true}
                    onClose={handleCloseCharacterSheet}
                    title={`${t('Character Sheet')}: ${viewingCharacter.name}`}
                    size={isCharacterSheetFullScreen ? "fullscreen" : "default"}
                    onToggleFullScreen={() => setIsCharacterSheetFullScreen(p => !p)}
                    isFullScreen={isCharacterSheetFullScreen}
                >
                    <CharacterSheet
                        character={viewingCharacter as PlayerCharacter | NPC}
                        playerCharacter={gameState.playerCharacter}
                        isViewOnly={isLoading || ('playerId' in viewingCharacter ? viewingCharacter.playerId !== gameState.playerCharacter.playerId : (viewingCharacter.progressionType !== 'Companion' && !gameSettings!.allowHistoryManipulation))}
                        gameSettings={gameSettings!}
                        onOpenDetailModal={handleOpenDetailModal}
                        onShowMessageModal={handleShowMessageModal}
                        onOpenTextReader={handleOpenTextReader}
                        onOpenInventory={handleOpenPlayerInventory}
                        onOpenNpcInventory={handleOpenNpcInventory}
                        onSpendAttributePoint={spendAttributePoint}
                        forgetHealedWound={forgetHealedWound}
                        forgetActiveWound={forgetActiveWound}
                        clearAllHealedWounds={clearAllHealedWounds}
                        onDeleteCustomState={deleteCustomState}
                        onDeleteNpcCustomState={deleteNpcCustomState}
                        onDeleteActiveEffect={deleteActiveEffect}
                        onEditPlayerData={editPlayerData}
                        onEditNpcData={editNpcData}
                        updatePlayerPortrait={updatePlayerPortrait}
                        updateNpcPortrait={updateNpcPortrait}
                        onDeleteActiveSkill={deleteActiveSkill}
                        onDeletePassiveSkill={deletePassiveSkill}
                        updateActiveSkillSortOrder={updateActiveSkillSortOrder}
                        updatePassiveSkillSortOrder={updatePassiveSkillSortOrder}
                        updateNpcItemSortOrder={updateNpcItemSortOrder}
                        updateNpcItemSortSettings={updateNpcItemSortSettings}
                        imageCache={gameState.imageCache ?? {}}
                        onImageGenerated={onImageGenerated}
                        encounteredFactions={gameState.encounteredFactions}
                        onOpenImageModal={handleShowImageModal}
                        onOpenJournalModal={handleOpenJournalModal}
                        clearAllCompletedNpcActivities={clearAllCompletedNpcActivities}
                        onDeleteCurrentActivity={onDeleteCurrentActivity}
                        onDeleteCompletedActivity={onDeleteCompletedActivity}
                        onEditNpcMemory={onEditNpcMemory}
                        onDeleteNpcMemory={onDeleteNpcMemory}
                        allLocations={allWorldLocations}
                        allNpcs={gameState.encounteredNPCs}
                        onViewCharacterSheet={handleViewCharacter}
                        handleTransferItem={handleTransferItem}
                        handleEquipItemForNpc={handleEquipItemForNpc}
                        handleUnequipItemForNpc={handleUnequipItemForNpc}
                        handleSplitItemForNpc={handleSplitItemForNpc}
                        handleMergeItemsForNpc={handleMergeItemsForNpc}
                        initialView={characterSheetDefaultView}
                        onRegenerateId={onRegenerateId}
                        isLoading={isLoading}
                    />
                </Modal>
            )}
            <CinemaPlayer
                cinematic={playingCinematic}
                isOpen={isCinemaVisible}
                onClose={closeCinemaPlayer}
            />
        </>
    );
}
