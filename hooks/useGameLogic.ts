

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, GameContext, ChatMessage, GameResponse, LocationData, Item, NPC, SaveFile, Location, PlayerCharacter, WorldState, GameSettings, Quest, Faction, PlotOutline, Language, DBSaveSlotInfo, Wound, CustomState, WorldStateFlag, UnlockedMemory, WorldEvent, Effect } from '../types';
import { executeTurn, askGmQuestion, getMusicSuggestionFromAi, getModelForStep, executeWorldProgression } from '../utils/gameApi';
import { createInitialContext, buildNextContext, updateWorldMap, recalculateDerivedStats } from '../utils/gameContext';
import { processAndApplyResponse, checkAndApplyLevelUp } from '../utils/responseProcessor';
import { equipItem as equipItemUtil, unequipItem as unequipItemUtil, dropItem as dropItemUtil, moveItem as moveItemUtil, recalculateAllWeights, splitItemStack as splitItemUtil, mergeItemStacks as mergeItemUtil, transferItemBetweenCharacters, equipItemForNpc as equipItemForNpcUtil, unequipItemForNpc as unequipItemForNpcUtil, splitItemStackForNpc as splitItemForNpcUtil, mergeItemStacksForNpc as mergeItemForNpcUtil } from '../utils/inventoryManager';
import { deleteMessage as deleteMessageUtil, clearHalfHistory as clearHalfHistoryUtil, deleteLogs as deleteLogsUtil, forgetNpc as forgetNpcUtil, forgetFaction as forgetFactionUtil } from '../utils/uiManager';
import { saveGameToFile, loadGameFromFile, saveToDB, loadFromDB, getAutosaveTimestampFromDB, saveToDBSlot, loadFromDBSlot, listDBSlots, deleteDBSlot } from '../utils/fileManager';
import { useLocalization } from '../context/LocalizationContext';
import { formatError } from '../utils/errorUtils';
import { playNotificationSound, initializeAndPreviewSound } from '../utils/soundManager';

const asArray = <T>(value: T | T[] | null | undefined): T[] => {
    if (value === null || value === undefined) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
};

interface UseGameLogicProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const isObject = (item: any): item is object => {
    return (item && typeof item === 'object' && !Array.isArray(item));
};

export function useGameLogic({ language, setLanguage }: UseGameLogicProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
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
  const lastSavedTurnRef = useRef<number | null>(null);
  const [musicVideoIds, setMusicVideoIds] = useState<string[] | null>(null);
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const [isMusicPlayerVisible, setIsMusicPlayerVisible] = useState(false);
  const previousMusicQueries = useRef<string[]>([]);

  // New state for debug view
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [turnTime, setTurnTime] = useState<number | null>(null);
  const turnStartTimeRef = useRef<number | null>(null);

  const refreshDbSaveSlots = useCallback(async () => {
    const slots = await listDBSlots();
    setDbSaveSlots(slots);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const ts = await getAutosaveTimestampFromDB();
            setAutosaveTimestamp(ts);
            await refreshDbSaveSlots();
        } catch (e) {
            console.error("Failed to fetch initial save data from DB", e);
        }
    };
    fetchInitialData();
  }, [refreshDbSaveSlots]);

  const { t } = useLocalization();

  const gameContextRef = useRef<GameContext | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const onImageGenerated = useCallback((cacheKey: string, base64: string) => {
    setGameState(prev => {
        if (!prev) return null;
        const newCache = { ...prev.imageCache, [cacheKey]: base64 };
        return { ...prev, imageCache: newCache };
    });
  }, []);

  const packageSaveData = useCallback((): SaveFile | null => {
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
  }, [gameState, gameHistory, gameLog, lastJsonResponse, sceneImagePrompt, combatLog]);

  const autosave = useCallback(async () => {
    const saveData = packageSaveData();
    if (saveData) {
      try {
        await saveToDB(saveData);
        setAutosaveTimestamp(saveData.timestamp);
      } catch (e) {
        console.error("Autosave to DB failed", e);
      }
    }
  }, [packageSaveData]);

  useEffect(() => {
    // This effect triggers after any state update that causes a re-render.
    // We only want to save if the turn number has advanced since the last save.
    // This prevents re-saving during streaming partial updates within the same turn.
    if (turnNumber && turnNumber > 0 && gameState && lastSavedTurnRef.current !== turnNumber) {
        console.log(`Autosaving for turn ${turnNumber}`);
        autosave();
        lastSavedTurnRef.current = turnNumber;
    }
  }, [turnNumber, gameState, autosave]);

  const restoreFromSaveData = useCallback((data: SaveFile) => {
      gameContextRef.current = data.gameContext;
      const loadedGameState = data.gameState;

      if (!loadedGameState.imageCache) {
        loadedGameState.imageCache = {};
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
          });
          if (gameContextRef.current) {
              gameContextRef.current.encounteredNPCs = loadedGameState.encounteredNPCs;
          }
      }

      const { pc: updatedPc, logs: levelUpLogs } = checkAndApplyLevelUp(loadedGameState.playerCharacter, t);
      
      let finalGameLog = data.gameLog || [];
      if (levelUpLogs.length > 0) {
          loadedGameState.playerCharacter = updatedPc;
          if (gameContextRef.current) {
            gameContextRef.current.playerCharacter = updatedPc;
          }
          finalGameLog = [...finalGameLog, ...levelUpLogs];
      }
      
      const loadedSettings = data.gameContext.gameSettings;
      if (loadedSettings.keepLatestNpcJournals === undefined) {
          loadedSettings.keepLatestNpcJournals = false;
      }
      if (loadedSettings.latestNpcJournalsCount === undefined) {
          loadedSettings.latestNpcJournalsCount = 20;
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
  }, [setLanguage, t]);

  const clearStashForNewTurn = () => {
    setGameState(prev => {
        if (!prev) return null;
        if (prev.temporaryStash && prev.temporaryStash.length > 0) {
            return { ...prev, temporaryStash: [] };
        }
        return prev;
    });
  };

  const handleTurn = useCallback(async (playerMessage: ChatMessage, context: GameContext) => {
    setIsLoading(true);
    setError(null);
    clearStashForNewTurn();
    if (!context.enemiesDataForCurrentTurn || context.enemiesDataForCurrentTurn.length === 0) {
      setCombatLog([]);
    }
    setGameLog([]);
    setLastJsonResponse('');
    setSuggestedActions([]);
    abortControllerRef.current = new AbortController();

    try {
      const onPartialResponse = (response: any, stepName: string, modelName: string) => {
        setLastJsonResponse(JSON.stringify(response, null, 2));
        if (response.items_and_stat_calculations) {
            setGameLog(response.items_and_stat_calculations);
        }
      };
      
      const onStepStart = (stepName: string, modelName: string) => {
        setCurrentStep(stepName);
        setCurrentModel(getModelForStep(stepName, context));
      };

      const onStreamingChunk = (text: string) => {
        setLastJsonResponse(text);
      };

      const finalResponse = await executeTurn(context, abortControllerRef.current.signal, onPartialResponse, onStreamingChunk, onStepStart);
      
      if (context.gameSettings.allowHistoryManipulation !== true && finalResponse.playerBehaviorAssessment?.historyManipulationCoefficient >= 0.8) {
          setError(t("history_manipulation_rejection"));
          setGameHistory(prev => prev.slice(0, -1)); // Remove the offending player message
          setIsLoading(false);
          return;
      }
      
      setLastJsonResponse(JSON.stringify(finalResponse, null, 2));
      if (finalResponse.items_and_stat_calculations) {
        setGameLog(finalResponse.items_and_stat_calculations);
      }
      setSceneImagePrompt(finalResponse.image_prompt);
      setSuggestedActions(finalResponse.dialogueOptions || []);

      const gmMessage: ChatMessage = { sender: 'gm', content: finalResponse.response || '' };
      
      const baseState: GameState = gameState || {
          playerCharacter: context.playerCharacter,
          currentLocationData: context.currentLocation as LocationData,
          activeQuests: context.activeQuests,
          completedQuests: context.completedQuests,
          encounteredNPCs: context.encounteredNPCs,
          encounteredFactions: context.encounteredFactions,
          enemiesData: [],
          alliesData: [],
          playerCustomStates: context.playerCustomStates,
          plotOutline: context.plotOutline,
          temporaryStash: [],
          worldStateFlags: context.worldStateFlags,
          worldEventsLog: context.worldEventsLog,
          imageCache: {},
      };
      
      const { newState, logsToAdd, combatLogsToAdd } = processAndApplyResponse(finalResponse, baseState, context.gameSettings, t, true);
      
      if (logsToAdd.length > 0) {
        setGameLog(prev => [...prev, ...logsToAdd]);
      }
      if (combatLogsToAdd.length > 0) {
        setCombatLog(prev => [...prev, ...combatLogsToAdd]);
      }
      
      const newHistoryWithAnswer = [...context.responseHistory, gmMessage];
      setGameHistory(newHistoryWithAnswer);
      setGameState(newState);
      
      const nextContext = buildNextContext(context, finalResponse, newState, newHistoryWithAnswer);
      gameContextRef.current = nextContext;
      setWorldMap(nextContext.worldMap);
      setVisitedLocations(nextContext.visitedLocations);
      setWorldState(nextContext.worldState);
      setTurnNumber(nextContext.currentTurnNumber);
      
      if (nextContext.gameSettings.notificationSound) {
        playNotificationSound();
      }
      
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const formattedError = formatError(err);
        setError(formattedError);
        const systemMessage: ChatMessage = { sender: 'system', content: `Error: ${formattedError}` };
        setGameHistory(prev => [...prev, systemMessage]);
      }
    } finally {
      setIsLoading(false);
      if (turnStartTimeRef.current) {
        const endTime = performance.now();
        const elapsedTime = endTime - turnStartTimeRef.current;
        setTurnTime(elapsedTime);
        turnStartTimeRef.current = null;
      }
    }
  }, [gameState, t]);

  const fetchMusicSuggestion = useCallback(async () => {
    if (!gameContextRef.current) return;

    const youtubeApiKey = gameContextRef.current.gameSettings.youtubeApiKey;
    if (!youtubeApiKey) {
        setError(t("youtube_api_key_missing_error"));
        return;
    }

    setIsMusicLoading(true);
    setError(null);
    try {
      const suggestion = await getMusicSuggestionFromAi(gameContextRef.current, youtubeApiKey, previousMusicQueries.current);
      if (suggestion && suggestion.videoIds && suggestion.videoIds.length > 0) {
        setMusicVideoIds(suggestion.videoIds);
        previousMusicQueries.current.push(suggestion.searchQuery);
        if (previousMusicQueries.current.length > 10) {
            previousMusicQueries.current.shift();
        }
        setGameLog(prev => [t("music_suggestion_reasoning", {reasoning: suggestion.reasoning}), ...prev]);
        setIsMusicPlayerVisible(true);
      } else {
        setGameLog(prev => [t("music_suggestion_failed"), ...prev]);
      }
    } catch (e: any) {
      console.error("Failed to get music suggestion:", e);
      const formattedError = formatError(e);
      setError(t("music_suggestion_error", { error: formattedError }));
    } finally {
      setIsMusicLoading(false);
    }
  }, [t]);

  const clearMusic = useCallback(() => {
    setMusicVideoIds(null);
    setIsMusicPlayerVisible(false);
    previousMusicQueries.current = [];
  }, []);

  const handlePrimaryMusicClick = useCallback(() => {
    if (musicVideoIds && musicVideoIds.length > 0 && !isMusicPlayerVisible) {
        setIsMusicPlayerVisible(true);
    } else {
        fetchMusicSuggestion();
    }
  }, [musicVideoIds, isMusicPlayerVisible, fetchMusicSuggestion]);

  const sendMessage = useCallback((message: string) => {
    if (isLoading || !gameContextRef.current) return;
    turnStartTimeRef.current = performance.now();
    setTurnTime(null);
    setCurrentStep(null);
    setCurrentModel(null);
    const playerMessage: ChatMessage = { sender: 'player', content: message };
    setSuggestedActions([]);
    
    setGameHistory(prevHistory => {
        const newHistory = [...prevHistory, playerMessage];
        const newContext = { ...gameContextRef.current! };
        newContext.message = message;
        newContext.responseHistory = newHistory.slice(-15);
        setLastRequestJson(JSON.stringify(newContext, null, 2));
        handleTurn(playerMessage, newContext);
        return newHistory;
    });
  }, [isLoading, handleTurn]);
  
  const startGame = useCallback((creationData: any) => {
    const initialContext = createInitialContext(creationData, language);
    gameContextRef.current = initialContext;
    setSuperInstructions(initialContext.superInstructions || '');
    setWorldMap(initialContext.worldMap);
    setVisitedLocations(initialContext.visitedLocations);
    setWorldState(initialContext.worldState);
    setGameSettings(initialContext.gameSettings);
    setTurnNumber(initialContext.currentTurnNumber);
    turnStartTimeRef.current = performance.now();
    setTurnTime(null);
    const initialMessage = { sender: 'player', content: creationData.initialPrompt } as ChatMessage;
    const newHistory = [initialMessage];
    setGameHistory(newHistory);
    const contextWithHistory = { ...initialContext, responseHistory: newHistory };
    setLastRequestJson(JSON.stringify(contextWithHistory, null, 2));
    handleTurn(initialMessage, contextWithHistory);
  }, [handleTurn, language]);

  const askQuestion = useCallback(async (question: string) => {
    if (!gameContextRef.current || isLoading) return;

    turnStartTimeRef.current = performance.now();
    setTurnTime(null);
    setCurrentStep(null);
    setCurrentModel(null);
    setIsLoading(true);
    setError(null);
    clearStashForNewTurn();
    if (!gameContextRef.current?.enemiesDataForCurrentTurn || gameContextRef.current.enemiesDataForCurrentTurn.length === 0) {
        setCombatLog([]);
    }
    setLastJsonResponse('');
    setSuggestedActions([]);
    abortControllerRef.current = new AbortController();

    const questionMessage: ChatMessage = { sender: 'player', content: `[Question] ${question}` };
    const historyWithQuestion = [...gameHistory, questionMessage];
    setGameHistory(historyWithQuestion);

    try {
        const context = { 
            ...gameContextRef.current, 
            message: question, 
            superInstructions: "The user is asking a question out-of-character. Answer it as the Game Master based on the rules and current state, then return to the game.",
            currentStepFocus: 'StepQuestion_CorrectionAndClarification',
            partiallyGeneratedResponse: null,
            responseHistory: historyWithQuestion.slice(-15)
        };
        setLastRequestJson(JSON.stringify(context, null, 2));
        
        const onStepStart = (stepName: string, modelName: string) => {
          setCurrentStep(stepName);
          setCurrentModel(getModelForStep(stepName, context));
        };
        const onStreamingChunk = (text: string) => {
          setLastJsonResponse(text);
        };

        const response: GameResponse = await askGmQuestion(context, abortControllerRef.current.signal, onStreamingChunk, onStepStart);

        const gmMessage: ChatMessage = { sender: 'gm', content: response.response || '' };
        const historyWithAnswer = [...historyWithQuestion, gmMessage];
        
        let finalMergedResponse = response;

        if (response.generateWorldProgression === true) {
            setGameHistory(historyWithAnswer); 

            const wpContext = { ...context, responseHistory: historyWithAnswer };
            
            const onWpPartialResponse = (wpPartial: any, stepName: string, modelName: string) => {
                setLastJsonResponse(JSON.stringify(wpPartial, null, 2));
            };

            const wpResponse = await executeWorldProgression(
                wpContext,
                abortControllerRef.current!.signal,
                onStreamingChunk,
                onWpPartialResponse,
                onStepStart
            );
            
            finalMergedResponse = {
                ...response,
                worldEventsLog: wpResponse.worldEventsLog || null,
                plotOutline: wpResponse.plotOutline || null,
                updateWorldProgressionTracker: wpResponse.updateWorldProgressionTracker || null,
                items_and_stat_calculations: [
                    ...asArray(response.items_and_stat_calculations),
                    ...asArray(wpResponse.items_and_stat_calculations)
                ],
            };
        }

        setLastJsonResponse(JSON.stringify(finalMergedResponse, null, 2));
        if (finalMergedResponse.items_and_stat_calculations) {
            setGameLog(prev => [...prev, ...asArray(finalMergedResponse.items_and_stat_calculations)]);
        }
        
        if (!finalMergedResponse.generateWorldProgression) {
            setGameHistory(historyWithAnswer);
        }

        setSceneImagePrompt(finalMergedResponse.image_prompt);
        setSuggestedActions(finalMergedResponse.dialogueOptions || []);

        const baseState: GameState = gameState || {
          playerCharacter: context.playerCharacter,
          currentLocationData: context.currentLocation as LocationData,
          activeQuests: context.activeQuests,
          completedQuests: context.completedQuests,
          encounteredNPCs: context.encounteredNPCs,
          encounteredFactions: context.encounteredFactions,
          enemiesData: [],
          alliesData: [],
          playerCustomStates: context.playerCustomStates,
          plotOutline: context.plotOutline,
          temporaryStash: [],
          worldStateFlags: context.worldStateFlags,
          worldEventsLog: context.worldEventsLog,
          imageCache: {},
        };

        const { newState, logsToAdd, combatLogsToAdd } = processAndApplyResponse(finalMergedResponse, baseState, gameSettings, t, false);
        if (logsToAdd.length > 0) {
          setGameLog(prev => [...prev, ...logsToAdd]);
        }
        if (combatLogsToAdd.length > 0) {
            setCombatLog(prev => [...prev, ...combatLogsToAdd]);
        }
        setGameState(newState);

        if (gameContextRef.current) {
            const nextContext = buildNextContext(gameContextRef.current, finalMergedResponse, newState, historyWithAnswer, false);
            gameContextRef.current = nextContext;
            
            setWorldState(nextContext.worldState);
            setWorldMap(nextContext.worldMap);
            setVisitedLocations(nextContext.visitedLocations);
            setTurnNumber(nextContext.currentTurnNumber);
        }

    } catch (err: any) {
        if (err.name !== 'AbortError') {
            const formattedError = formatError(err);
            setError(formattedError);
            const systemMessage: ChatMessage = { sender: 'system', content: `Error: ${formattedError}` };
            const errorHistory = [...historyWithQuestion, systemMessage];
            setGameHistory(errorHistory);
        }
    } finally {
      setIsLoading(false);
      if (turnStartTimeRef.current) {
          const endTime = performance.now();
          const elapsedTime = endTime - turnStartTimeRef.current;
          setTurnTime(elapsedTime);
          turnStartTimeRef.current = null;
      }
    }
  }, [isLoading, gameState, gameHistory, t, gameSettings]);
  
  const updateGameSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setGameSettings(prevSettings => {
        if (!prevSettings || !gameContextRef.current) return prevSettings;
        
        if (newSettings.notificationSound === true && prevSettings.notificationSound === false) {
            initializeAndPreviewSound();
        }

        const updatedSettings = { ...prevSettings, ...newSettings };
        gameContextRef.current.gameSettings = updatedSettings;
        
        autosave(); 

        return updatedSettings;
    });
  }, [autosave]);

  const updateSuperInstructions = useCallback((newInstructions: string) => {
    setSuperInstructions(newInstructions);
    if (gameContextRef.current) {
        gameContextRef.current.superInstructions = newInstructions;
        autosave();
    }
  }, [autosave]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setIsLoading(false);
        setError("Request cancelled by user.");
        setSuggestedActions([]);
    }
  }, []);

  const setAutoCombatSkill = useCallback((skillName: string | null) => {
    setGameState(prevState => {
        if (!prevState) return null;
        const newPc = { ...prevState.playerCharacter, autoCombatSkill: skillName };
        if (gameContextRef.current) {
            gameContextRef.current.playerCharacter.autoCombatSkill = skillName;
        }
        return { ...prevState, playerCharacter: newPc };
    });
  }, []);

  const craftItem = useCallback((recipeName: string) => {
    sendMessage(`[System Action] Attempt to craft item using recipe: ${recipeName}`);
  }, [sendMessage]);


  const equipItem = useCallback((itemToEquip: Item, slot: string) => {
    setGameState(prevState => {
        if (!prevState) return null;
        
        const potentialNewState = equipItemUtil(itemToEquip, slot, prevState);
        const newPc = potentialNewState.playerCharacter;
        const inventory = newPc.inventory;

        const mainHandId = newPc.equippedItems.MainHand;
        const offHandId = newPc.equippedItems.OffHand;

        const mainHandItem = mainHandId ? inventory.find(i => i.existedId === mainHandId) : null;
        const offHandItem = offHandId ? inventory.find(i => i.existedId === offHandId) : null;

        const mainHandIsTwoHander = mainHandItem && mainHandItem.requiresTwoHands;
        const offHandIsTwoHander = offHandItem && offHandItem.requiresTwoHands;

        const isPenalty = (mainHandIsTwoHander && mainHandId !== offHandId) || (offHandIsTwoHander && mainHandId !== offHandId);

        if (isPenalty) {
            alert(t('two_handed_penalty_warning'));
        }
        
        let pc = recalculateAllWeights(newPc);
        pc = recalculateDerivedStats(pc);
        potentialNewState.playerCharacter = pc;

        if (gameContextRef.current) {
            gameContextRef.current.playerCharacter = pc;
        }
        
        return potentialNewState;
    });
  }, [t]);

  const unequipItem = useCallback((itemToUnequip: Item) => {
    setGameState(prevState => {
      if (!prevState) return null;
      let newGameState = unequipItemUtil(itemToUnequip, prevState);
      let pc = recalculateAllWeights(newGameState.playerCharacter);
      pc = recalculateDerivedStats(pc);
      newGameState.playerCharacter = pc;
      if (gameContextRef.current) {
          gameContextRef.current.playerCharacter = newGameState.playerCharacter;
      }
      return newGameState;
    });
  }, []);

  const dropItem = useCallback((itemToDrop: Item) => {
    setGameState(prevState => {
      if (!prevState) return null;
      let newGameState = dropItemUtil(itemToDrop, prevState);
      let pc = recalculateAllWeights(newGameState.playerCharacter);
      pc = recalculateDerivedStats(pc);
      newGameState.playerCharacter = pc;
      if (gameContextRef.current) {
          gameContextRef.current.playerCharacter = newGameState.playerCharacter;
      }
      return newGameState;
    });
  }, []);
  
  const moveItem = useCallback((itemToMove: Item, destinationContainerId: string | null) => {
    setGameState(prevState => {
      if (!prevState) return null;
      let newGameState = moveItemUtil(itemToMove, destinationContainerId, prevState);
      let pc = recalculateAllWeights(newGameState.playerCharacter);
      pc = recalculateDerivedStats(pc);
      newGameState.playerCharacter = pc;
      if (gameContextRef.current) {
          gameContextRef.current.playerCharacter = newGameState.playerCharacter;
      }
      return newGameState;
    });
  }, []);

  const splitItemStack = useCallback((itemToSplit: Item, splitAmount: number) => {
    setGameState(prevState => {
        if (!prevState) return null;
        let newGameState = splitItemUtil(itemToSplit, splitAmount, prevState);
        let pc = recalculateAllWeights(newGameState.playerCharacter);
        pc = recalculateDerivedStats(pc);
        newGameState.playerCharacter = pc;
        if (gameContextRef.current) {
            gameContextRef.current.playerCharacter = newGameState.playerCharacter;
        }
        return newGameState;
    });
  }, []);

  const mergeItemStacks = useCallback((sourceItem: Item, targetItem: Item) => {
    setGameState(prevState => {
        if (!prevState) return null;
        let newGameState = mergeItemUtil(sourceItem, targetItem, prevState);
        let pc = recalculateAllWeights(newGameState.playerCharacter);
        pc = recalculateDerivedStats(pc);
        newGameState.playerCharacter = pc;
        if (gameContextRef.current) {
            gameContextRef.current.playerCharacter = newGameState.playerCharacter;
        }
        return newGameState;
    });
  }, []);

  const disassembleItem = useCallback((itemToDisassemble: Item) => {
    if (!itemToDisassemble.disassembleTo || itemToDisassemble.disassembleTo.length === 0) {
        return;
    }

    setGameState(prevState => {
        if (!prevState) return null;

        const newState = JSON.parse(JSON.stringify(prevState));
        let pc = newState.playerCharacter as PlayerCharacter;
        
        let inventory = pc.inventory as Item[];

        let itemFoundAndDecremented = false;
        inventory = inventory.map(item => {
            if (item.existedId === itemToDisassemble.existedId) {
                itemFoundAndDecremented = true;
                return { ...item, count: item.count - 1 };
            }
            return item;
        }).filter(item => item.count > 0);

        if (!itemFoundAndDecremented) {
            console.warn("Item to disassemble not found or already gone.");
            return prevState;
        }

        itemToDisassemble.disassembleTo.forEach((material: any) => {
            const existingStackIndex = inventory.findIndex(i => 
                i.name === material.materialName &&
                !i.equipmentSlot &&
                i.type === 'Material'
            );

            if (existingStackIndex > -1) {
                inventory[existingStackIndex].count += material.quantity;
            } else {
                const newItem: Item = {
                    existedId: generateId('item'),
                    name: material.materialName,
                    description: material.description || t('A crafting material.'),
                    image_prompt: `crafting material, ${material.materialName}, fantasy art, plain background`,
                    quality: material.quality || 'Common',
                    type: 'Material',
                    group: 'CraftingMaterial',
                    price: material.price || 1,
                    count: material.quantity,
                    weight: material.weight || 0.1,
                    volume: material.volume || 0.1,
                    bonuses: [],
                    isContainer: false,
                    capacity: null,
                    isConsumption: true,
                    durability: "100%",
                    equipmentSlot: null,
                    requiresTwoHands: false,
                    contentsPath: null,
                };
                inventory.push(newItem);
            }
        });

        pc.inventory = inventory;
        pc = recalculateAllWeights(pc);
        pc = recalculateDerivedStats(pc);

        if (gameContextRef.current) {
            gameContextRef.current.playerCharacter = pc;
        }

        return newState;
    });
  }, [t]);
  
    const disassembleNpcItem = useCallback((npcId: string, itemToDisassemble: Item) => {
    if (!itemToDisassemble.disassembleTo || itemToDisassemble.disassembleTo.length === 0) {
        return;
    }

    setGameState(prevState => {
        if (!prevState) return null;

        const newState = JSON.parse(JSON.stringify(prevState));
        const npcIndex = newState.encounteredNPCs.findIndex((n: NPC) => n.NPCId === npcId);
        if (npcIndex === -1) return prevState;

        let npc = newState.encounteredNPCs[npcIndex] as NPC;
        if (!npc.inventory) npc.inventory = [];
        let inventory = npc.inventory as Item[];

        let itemFoundAndDecremented = false;
        inventory = inventory.map(item => {
            if (item.existedId === itemToDisassemble.existedId) {
                itemFoundAndDecremented = true;
                return { ...item, count: item.count - 1 };
            }
            return item;
        }).filter(item => item.count > 0);

        if (!itemFoundAndDecremented) {
            console.warn("Item to disassemble not found in NPC inventory.");
            return prevState;
        }

        itemToDisassemble.disassembleTo.forEach((material: any) => {
            const existingStackIndex = inventory.findIndex(i => 
                i.name === material.materialName &&
                !i.equipmentSlot &&
                i.type === 'Material'
            );

            if (existingStackIndex > -1) {
                inventory[existingStackIndex].count += material.quantity;
            } else {
                const newItem: Item = {
                    existedId: generateId('item'),
                    name: material.materialName,
                    description: material.description || t('A crafting material.'),
                    image_prompt: `crafting material, ${material.materialName}, fantasy art, plain background`,
                    quality: material.quality || 'Common',
                    type: 'Material',
                    group: 'CraftingMaterial',
                    price: material.price || 1,
                    count: material.quantity,
                    weight: material.weight || 0.1,
                    volume: material.volume || 0.1,
                    bonuses: [],
                    isContainer: false,
                    capacity: null,
                    isConsumption: true,
                    durability: "100%",
                    equipmentSlot: null,
                    requiresTwoHands: false,
                    contentsPath: null,
                };
                inventory.push(newItem);
            }
        });

        npc.inventory = inventory;
        let updatedNpc = recalculateAllWeights(npc);
        updatedNpc = recalculateDerivedStats(updatedNpc);
        newState.encounteredNPCs[npcIndex] = updatedNpc;

        if (gameContextRef.current) {
            gameContextRef.current.encounteredNPCs = newState.encounteredNPCs;
        }

        return newState;
    });
  }, [t]);


  const spendAttributePoint = useCallback((characteristic: string) => {
    setGameState(prevState => {
        if (!prevState || prevState.playerCharacter.attributePoints <= 0) return prevState;

        const pc = JSON.parse(JSON.stringify(prevState.playerCharacter)) as PlayerCharacter;
        const standardKey = `standard${characteristic.charAt(0).toUpperCase() + characteristic.slice(1)}` as keyof PlayerCharacter['characteristics'];
        
        if (pc.characteristics[standardKey] >= 100) {
            return prevState;
        }

        pc.attributePoints -= 1;
        pc.characteristics[standardKey] += 1;
        
        const updatedPc = recalculateDerivedStats(pc);

        if (gameContextRef.current) {
            gameContextRef.current.playerCharacter = updatedPc;
        }

        return { ...prevState, playerCharacter: updatedPc };
    });
  }, []);

  const editChatMessage = useCallback((indexToEdit: number, newContent: string) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameHistory(prevHistory => {
        const newHistory = [...prevHistory];
        if (newHistory[indexToEdit]) {
            newHistory[indexToEdit] = { ...newHistory[indexToEdit], content: newContent };
        }
        if (gameContextRef.current) gameContextRef.current.responseHistory = newHistory;
        return newHistory;
    });
  }, [gameSettings]);

  const editNpcData = useCallback((npcId: string, field: keyof NPC, value: any) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState) return null;
        const newNpcs = prevState.encounteredNPCs.map(npc => npc.NPCId === npcId ? { ...npc, [field]: value } : npc);
        if (gameContextRef.current) gameContextRef.current.encounteredNPCs = newNpcs as NPC[];
        return { ...prevState, encounteredNPCs: newNpcs };
    });
  }, [gameSettings]);

  const editQuestData = useCallback((questId: string, field: keyof Quest, value: any) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState) return null;
        const newActive = prevState.activeQuests.map(q => q.questId === questId ? { ...q, [field]: value } : q);
        const newCompleted = prevState.completedQuests.map(q => q.questId === questId ? { ...q, [field]: value } : q);
        if (gameContextRef.current) {
            gameContextRef.current.activeQuests = newActive;
            gameContextRef.current.completedQuests = newCompleted;
        }
        return { ...prevState, activeQuests: newActive, completedQuests: newCompleted };
    });
  }, [gameSettings]);

  const editItemData = useCallback((itemId: string, field: keyof Item, value: any) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState) return null;
        const newInventory = prevState.playerCharacter.inventory.map(item => item.existedId === itemId ? { ...item, [field]: value } : item);
        const newPc = { ...prevState.playerCharacter, inventory: newInventory };
        if (gameContextRef.current) gameContextRef.current.playerCharacter.inventory = newInventory;
        return { ...prevState, playerCharacter: newPc };
    });
  }, [gameSettings]);

  const editFactionData = useCallback((factionId: string, field: keyof Faction, value: any) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState) return null;
        const newFactions = prevState.encounteredFactions.map(faction => faction.factionId === factionId ? { ...faction, [field]: value } : faction);
        if (gameContextRef.current) {
          gameContextRef.current.encounteredFactions = newFactions;
        }
        return { ...prevState, encounteredFactions: newFactions };
    });
  }, [gameSettings]);

  const editLocationData = useCallback((locationId: string, field: keyof Location, value: any) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setVisitedLocations(prev => {
        const newLocations = prev.map(loc => loc.locationId === locationId ? { ...loc, [field]: value } : loc);
        if (gameContextRef.current) gameContextRef.current.visitedLocations = newLocations;
        return newLocations;
    });
    if(gameState?.currentLocationData?.locationId === locationId){
        setGameState(prev => {
            if(!prev) return null;
            const newCurrent = {...prev.currentLocationData, [field]: value} as LocationData;
            if(gameContextRef.current) gameContextRef.current.currentLocation = newCurrent;
            return {...prev, currentLocationData: newCurrent};
        });
    }
  }, [gameSettings, gameState]);

  const editPlayerData = useCallback((field: keyof PlayerCharacter, value: any) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState) return null;
        const newPc = { ...prevState.playerCharacter, [field]: value };
        if (gameContextRef.current) gameContextRef.current.playerCharacter = newPc;
        return { ...prevState, playerCharacter: newPc };
    });
  }, [gameSettings]);
  
  const editWorldState = useCallback((day: number, time: string) => {
    if (!gameContextRef.current || !worldState || !gameSettings?.allowHistoryManipulation) return;

    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    const minutesIntoDay = hours * 60 + minutes;
    const totalMinutes = ((day - 1) * 24 * 60) + minutesIntoDay;
    
    let timeOfDay: WorldState['timeOfDay'] = 'Night';
    if (minutesIntoDay >= 5 * 60 && minutesIntoDay < 12 * 60) timeOfDay = 'Morning';
    else if (minutesIntoDay >= 12 * 60 && minutesIntoDay < 18 * 60) timeOfDay = 'Afternoon';
    else if (minutesIntoDay >= 18 * 60 && minutesIntoDay < 22 * 60) timeOfDay = 'Evening';

    const newWorldState: WorldState = {
        ...worldState,
        day: day,
        currentTimeInMinutes: totalMinutes,
        timeOfDay: timeOfDay,
    };
    
    setWorldState(newWorldState);
    if (gameContextRef.current) {
        gameContextRef.current.worldState = newWorldState;
    }
  }, [worldState, gameSettings]);

  const editWeather = useCallback((newWeather: string) => {
    if (!gameContextRef.current || !worldState || !gameSettings?.allowHistoryManipulation) return;

    const newWorldState: WorldState = {
        ...worldState,
        weather: newWeather,
    };
    
    setWorldState(newWorldState);
    if (gameContextRef.current) {
        gameContextRef.current.worldState = newWorldState;
    }
  }, [worldState, gameSettings]);
  
  const editWorldStateFlagData = useCallback((flagId: string, field: keyof WorldStateFlag, value: any) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState || !Array.isArray(prevState.worldStateFlags)) return prevState;
        const newFlags = prevState.worldStateFlags.map(flag => 
            flag.flagId === flagId ? { ...flag, [field]: value } : flag
        );
        if (gameContextRef.current) gameContextRef.current.worldStateFlags = newFlags;
        return { ...prevState, worldStateFlags: newFlags };
    });
  }, [gameSettings]);
  
    const onEditNpcMemory = useCallback((npcId: string, memoryToUpdate: UnlockedMemory) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState) return null;
        const newNpcs = prevState.encounteredNPCs.map(npc => {
            if (npc.NPCId === npcId && npc.unlockedMemories) {
                const newMemories = npc.unlockedMemories.map(mem => 
                    mem.memoryId === memoryToUpdate.memoryId ? memoryToUpdate : mem
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
  }, [gameSettings]);

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
  }, [gameSettings]);

  const moveFromStashToInventory = useCallback((itemToMove: Item, quantity: number) => {
    setGameState(prevState => {
        if (!prevState || !prevState.temporaryStash) return prevState;

        const itemInStash = prevState.temporaryStash.find(i => i.existedId === itemToMove.existedId);
        if (!itemInStash) return prevState;

        const validQuantity = Math.max(0, Math.min(quantity, itemInStash.count));
        if (validQuantity === 0) return prevState;

        const weightOfItemsToTake = itemToMove.weight * validQuantity;
        const prospectiveWeight = prevState.playerCharacter.totalWeight + weightOfItemsToTake;
        if (prospectiveWeight > prevState.playerCharacter.maxWeight + prevState.playerCharacter.criticalExcessWeight) {
            alert(t('You still cannot carry this item. Drop something else first.'));
            return prevState;
        }
        
        const newStash = [...prevState.temporaryStash];
        const stashItemIndex = newStash.findIndex(i => i.existedId === itemToMove.existedId);
        
        newStash[stashItemIndex].count -= validQuantity;
        if (newStash[stashItemIndex].count <= 0) {
            newStash.splice(stashItemIndex, 1);
        }

        let inventory = [...prevState.playerCharacter.inventory];
        const existingStackIndex = inventory.findIndex(i => i.name === itemToMove.name && !i.equipmentSlot && i.resource === undefined);
        
        if (existingStackIndex > -1) {
            inventory[existingStackIndex].count += validQuantity;
        } else {
            const newItemForInventory = { ...itemToMove, count: validQuantity };
            inventory.push(newItemForInventory);
        }
        
        let newPc = { ...prevState.playerCharacter, inventory: inventory };
        newPc = recalculateAllWeights(newPc); 
        newPc = recalculateDerivedStats(newPc);

        if (gameContextRef.current) {
            gameContextRef.current.playerCharacter = newPc;
        }

        return { ...prevState, temporaryStash: newStash, playerCharacter: newPc };
    });
  }, [t]);

  const dropItemFromStash = useCallback((itemToDrop: Item) => {
    setGameState(prevState => {
        if (!prevState || !prevState.temporaryStash) return prevState;
        const newStash = prevState.temporaryStash.filter(i => i.existedId !== itemToDrop.existedId);
        return { ...prevState, temporaryStash: newStash };
    });
  }, []);

  const forgetHealedWound = useCallback((characterType: 'player' | 'npc', characterId: string | null, woundId: string) => {
    setGameState(prevState => {
        if (!prevState) return null;
        const newState = JSON.parse(JSON.stringify(prevState));
        if (characterType === 'player') {
            const pc = newState.playerCharacter as PlayerCharacter;
            pc.playerWounds = pc.playerWounds.filter((w: Wound) => w.woundId !== woundId);
            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter.playerWounds = pc.playerWounds;
            }
        } else if (characterType === 'npc' && characterId) {
            const npcIndex = newState.encounteredNPCs.findIndex((n: NPC) => n.NPCId === characterId);
            if (npcIndex > -1) {
                newState.encounteredNPCs[npcIndex].wounds = (newState.encounteredNPCs[npcIndex].wounds || []).filter((w: Wound) => w.woundId !== woundId);
                if (gameContextRef.current) {
                    gameContextRef.current.encounteredNPCs = newState.encounteredNPCs;
                }
            }
        }
        return newState;
    });
  }, []);

  const forgetActiveWound = useCallback((characterType: 'player' | 'npc', characterId: string | null, woundId: string) => {
    setGameState(prevState => {
        if (!prevState) return null;
        const newState = JSON.parse(JSON.stringify(prevState));
        
        let woundToRemove: Wound | undefined;

        if (characterType === 'player') {
            const pc = newState.playerCharacter as PlayerCharacter;
            const woundIndex = pc.playerWounds.findIndex((w: Wound) => w.woundId === woundId);
            if (woundIndex > -1) {
                woundToRemove = pc.playerWounds[woundIndex];
                pc.playerWounds.splice(woundIndex, 1);
            }
            if (woundToRemove) {
                // An effect with a sourceWoundId points back to the wound object.
                pc.activePlayerEffects = (pc.activePlayerEffects || []).filter((e: Effect) => e.sourceWoundId !== woundId);
            }
            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter = pc;
            }
        } else if (characterType === 'npc' && characterId) {
            const npcIndex = newState.encounteredNPCs.findIndex((n: NPC) => n.NPCId === characterId);
            if (npcIndex > -1) {
                const npc = newState.encounteredNPCs[npcIndex];
                if (npc.wounds) {
                    const woundIndex = npc.wounds.findIndex((w: Wound) => w.woundId === woundId);
                    if (woundIndex > -1) {
                        woundToRemove = npc.wounds[woundIndex];
                        npc.wounds.splice(woundIndex, 1);
                    }
                }
                if (woundToRemove) {
                     // An effect with a sourceWoundId points back to the wound object.
                    npc.activeEffects = (npc.activeEffects || []).filter((e: Effect) => e.sourceWoundId !== woundId);
                }
                if (gameContextRef.current) {
                    gameContextRef.current.encounteredNPCs = newState.encounteredNPCs;
                }
            }
        }
        return newState;
    });
  }, []);

  const clearAllHealedWounds = useCallback((characterType: 'player' | 'npc', characterId: string | null) => {
    setGameState(prevState => {
        if (!prevState) return null;
        const newState = JSON.parse(JSON.stringify(prevState));
        if (characterType === 'player') {
            const pc = newState.playerCharacter as PlayerCharacter;
            pc.playerWounds = pc.playerWounds.filter((w: Wound) => !w.healingState || w.healingState.currentState !== 'Healed');
             if (gameContextRef.current) {
                gameContextRef.current.playerCharacter.playerWounds = pc.playerWounds;
            }
        } else if (characterType === 'npc' && characterId) {
            const npcIndex = newState.encounteredNPCs.findIndex((n: NPC) => n.NPCId === characterId);
            if (npcIndex > -1) {
                newState.encounteredNPCs[npcIndex].wounds = (newState.encounteredNPCs[npcIndex].wounds || []).filter((w: Wound) => !w.healingState || w.healingState.currentState !== 'Healed');
                 if (gameContextRef.current) {
                    gameContextRef.current.encounteredNPCs = newState.encounteredNPCs;
                }
            }
        }
        return newState;
    });
  }, []);
  
  const onRegenerateId = useCallback((entity: any, entityType: string) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    const newId = generateId(entityType.toLowerCase());

    const updateLogic = (prevState: GameState | null) => {
        if (!prevState) return null;

        const newState = JSON.parse(JSON.stringify(prevState));
        let wasUpdated = false;

        const findAndUpdateByIdOrName = (items: any[], idField: string, nameField: string) => {
            const index = items.findIndex(item => 
                (entity[idField] && item[idField] === entity[idField]) ||
                (!entity[idField] && item[nameField] === entity[nameField] && !item[idField])
            );
            if (index > -1) {
                const oldId = items[index][idField];
                items[index][idField] = newId;
                wasUpdated = true;
                return oldId;
            }
            return undefined;
        };

        switch (entityType) {
            case 'Item': {
                const oldId = findAndUpdateByIdOrName(newState.playerCharacter.inventory, 'existedId', 'name');
                if (wasUpdated) {
                    Object.keys(newState.playerCharacter.equippedItems).forEach(slot => {
                        if (newState.playerCharacter.equippedItems[slot] === oldId) {
                            newState.playerCharacter.equippedItems[slot] = newId;
                        }
                    });
                }
                break;
            }
            case 'NPC': {
                findAndUpdateByIdOrName(newState.encounteredNPCs, 'NPCId', 'name');
                break;
            }
            case 'Quest': {
                if (!findAndUpdateByIdOrName(newState.activeQuests, 'questId', 'questName')) {
                    findAndUpdateByIdOrName(newState.completedQuests, 'questId', 'questName');
                }
                break;
            }
        }
        
        if (wasUpdated) {
            if (gameContextRef.current) {
                gameContextRef.current = {
                    ...gameContextRef.current,
                    playerCharacter: newState.playerCharacter,
                    encounteredNPCs: newState.encounteredNPCs,
                    activeQuests: newState.activeQuests,
                    completedQuests: newState.completedQuests,
                };
            }
            return newState;
        }
        return prevState;
    };

    setGameState(updateLogic);

    if (entityType === 'Location') {
        const updateLocationState = (prev: Location[]) => {
            let wasUpdated = false;
            const newLocations = prev.map(loc => {
                const match = (entity.locationId && loc.locationId === entity.locationId) || 
                              (!entity.locationId && loc.name === entity.name && !loc.locationId);
                if (match) {
                    wasUpdated = true;
                    const newLoc = { ...loc, locationId: newId };
                    if (gameContextRef.current) {
                        gameContextRef.current.worldMap[newId] = newLoc;
                    }
                    return newLoc;
                }
                return loc;
            });
            return wasUpdated ? newLocations : prev;
        };

        setVisitedLocations(prev => {
            const newLocations = updateLocationState(prev);
            if (gameContextRef.current && newLocations !== prev) {
                gameContextRef.current.visitedLocations = newLocations;
            }
            return newLocations;
        });

        setGameState(prev => {
            if (!prev) return null;
            const match = (entity.locationId && prev.currentLocationData.locationId === entity.locationId) || 
                        (!entity.locationId && prev.currentLocationData.name === entity.name && !prev.currentLocationData.locationId);
            if (match) {
                const newCurrent = { ...prev.currentLocationData, locationId: newId };
                if (gameContextRef.current) {
                    gameContextRef.current.currentLocation = newCurrent;
                }
                return { ...prev, currentLocationData: newCurrent };
            }
            return prev;
        });
    }
  }, [gameSettings?.allowHistoryManipulation]);

  const handleCompanionInventoryAction = useCallback((action: (currentState: GameState) => GameState) => {
        setGameState(prevState => {
            if (!prevState) return null;
            let newState = action(prevState);
            
            newState.playerCharacter = recalculateAllWeights(newState.playerCharacter);
            newState.playerCharacter = recalculateDerivedStats(newState.playerCharacter);

            newState.encounteredNPCs = newState.encounteredNPCs.map((npc) => {
                let updatedNpc = recalculateAllWeights(npc);
                updatedNpc = recalculateDerivedStats(updatedNpc);
                if (updatedNpc.totalWeight !== undefined && updatedNpc.maxWeight !== undefined) {
                    updatedNpc.isOverloaded = updatedNpc.totalWeight > updatedNpc.maxWeight;
                } else {
                    updatedNpc.isOverloaded = false;
                }
                return updatedNpc;
            });

            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter = newState.playerCharacter;
                gameContextRef.current.encounteredNPCs = newState.encounteredNPCs;
            }
            return newState;
        });
    }, []);

    const handleTransferItem = useCallback((sourceType: 'player' | 'npc', targetType: 'player' | 'npc', npcId: string, item: Item, quantity: number) => {
        if (targetType === 'npc') {
            const npc = gameState?.encounteredNPCs.find(n => n.NPCId === npcId);
            if (npc) {
                const validQuantity = Math.min(quantity, item.count);
                const weightOfMovedItem = item.weight * validQuantity;
                
                let npcWithStats = recalculateAllWeights(npc);
                npcWithStats = recalculateDerivedStats(npcWithStats);

                const criticalWeight = (npcWithStats.maxWeight || 0) + (npcWithStats.criticalExcessWeight || 15);
                const prospectiveWeight = (npcWithStats.totalWeight || 0) + weightOfMovedItem;

                if (prospectiveWeight > criticalWeight) {
                    alert(t('npc_overloaded_refusal'));
                    return;
                }
            }
        }
        handleCompanionInventoryAction(currentState => 
            transferItemBetweenCharacters(sourceType, targetType, npcId, item, quantity, currentState)
        );
    }, [handleCompanionInventoryAction, gameState, t]);

    const handleEquipItemForNpc = useCallback((npcId: string, item: Item, slot: string) => {
        handleCompanionInventoryAction(currentState => equipItemForNpcUtil(npcId, item, slot, currentState));
    }, [handleCompanionInventoryAction]);

    const handleUnequipItemForNpc = useCallback((npcId: string, item: Item) => {
        handleCompanionInventoryAction(currentState => unequipItemForNpcUtil(npcId, item, currentState));
    }, [handleCompanionInventoryAction]);

    const handleSplitItemForNpc = useCallback((npcId: string, item: Item, quantity: number) => {
        handleCompanionInventoryAction(currentState => splitItemForNpcUtil(npcId, item, quantity, currentState));
    }, [handleCompanionInventoryAction]);

    const handleMergeItemsForNpc = useCallback((npcId: string, sourceItem: Item, targetItem: Item) => {
        handleCompanionInventoryAction(currentState => mergeItemForNpcUtil(npcId, sourceItem, targetItem, currentState));
    }, [handleCompanionInventoryAction]);

  const deleteMessage = useCallback((indexToDelete: number) => {
    setGameHistory(prevHistory => deleteMessageUtil(indexToDelete, prevHistory));
  }, []);

  const clearHalfHistory = useCallback(() => {
    setGameHistory(prevHistory => clearHalfHistoryUtil(prevHistory));
  }, []);

  const deleteLogs = useCallback(() => {
    setGameLog(deleteLogsUtil());
    setCombatLog([]);
  }, []);

  const forgetNpc = useCallback((npcIdToForget: string) => {
    setGameState(prevState => {
        if (!prevState) return null;
        return forgetNpcUtil(npcIdToForget, prevState);
    });
  }, []);

  const forgetFaction = useCallback((factionIdToForget: string) => {
    setGameState(prevState => {
        if (!prevState) return null;
        return forgetFactionUtil(factionIdToForget, prevState);
    });
  }, []);

  const clearNpcJournal = useCallback((npcId: string) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState) return null;
        const newNpcs = prevState.encounteredNPCs.map(npc => {
            if (npc.NPCId === npcId) {
                return { ...npc, journalEntries: [] };
            }
            return npc;
        });
        if (gameContextRef.current) gameContextRef.current.encounteredNPCs = newNpcs;
        return { ...prevState, encounteredNPCs: newNpcs };
    });
  }, [gameSettings]);

  const deleteNpcJournalEntry = useCallback((npcId: string, entryIndex: number) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState) return null;
        const newNpcs = prevState.encounteredNPCs.map(npc => {
            if (npc.NPCId === npcId) {
                const newEntries = (npc.journalEntries || []).filter((_, index) => index !== entryIndex);
                return { ...npc, journalEntries: newEntries };
            }
            return npc;
        });
        if (gameContextRef.current) gameContextRef.current.encounteredNPCs = newNpcs;
        return { ...prevState, encounteredNPCs: newNpcs };
    });
  }, [gameSettings]);

  const deleteOldestNpcJournalEntries = useCallback((npcId: string, count: number) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    const numToDelete = Math.max(0, count);
    if (numToDelete === 0) return;
    setGameState(prevState => {
        if (!prevState) return null;
        const newNpcs = prevState.encounteredNPCs.map(npc => {
            if (npc.NPCId === npcId && npc.journalEntries && npc.journalEntries.length > 0) {
                const newEntries = npc.journalEntries.slice(0, Math.max(0, npc.journalEntries.length - numToDelete));
                return { ...npc, journalEntries: newEntries };
            }
            return npc;
        });
        if (gameContextRef.current) gameContextRef.current.encounteredNPCs = newNpcs;
        return { ...prevState, encounteredNPCs: newNpcs };
    });
  }, [gameSettings]);

  const forgetLocation = useCallback((locationId: string) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setVisitedLocations(prev => {
        const newLocations = prev.filter(l => l.locationId !== locationId);
        if (gameContextRef.current) gameContextRef.current.visitedLocations = newLocations;
        return newLocations;
    });
    setWorldMap(prev => {
        const newMap = { ...prev };
        delete newMap[locationId];
        Object.keys(newMap).forEach(key => {
            if (newMap[key].adjacencyMap) {
                newMap[key].adjacencyMap = newMap[key].adjacencyMap!.filter(link => {
                    const targetLoc = Object.values(newMap).find(l => l.coordinates?.x === link.targetCoordinates.x && l.coordinates?.y === link.targetCoordinates.y);
                    return !(targetLoc && targetLoc.locationId === locationId);
                });
            }
        });
        if (gameContextRef.current) gameContextRef.current.worldMap = newMap;
        return newMap;
    });
  }, [gameSettings]);

  const forgetQuest = useCallback((questId: string) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState) return null;
        const newActive = prevState.activeQuests.filter(q => q.questId !== questId);
        const newCompleted = prevState.completedQuests.filter(q => q.questId !== questId);
        if (gameContextRef.current) {
            gameContextRef.current.activeQuests = newActive;
            gameContextRef.current.completedQuests = newCompleted;
        }
        return { ...prevState, activeQuests: newActive, completedQuests: newCompleted };
    });
  }, [gameSettings]);

  const saveGame = useCallback(async () => {
    const saveData = packageSaveData();
    if (saveData) {
      saveGameToFile(saveData, t);
    }
  }, [packageSaveData, t]);

  const loadGame = useCallback(async () => {
    const saveData = await loadGameFromFile(t);
    if (saveData) {
      restoreFromSaveData(saveData);
      return true;
    }
    return false;
  }, [restoreFromSaveData, t]);

  const loadAutosave = useCallback(async () => {
    const saveData = await loadFromDB();
    if (saveData) {
      restoreFromSaveData(saveData);
      return true;
    }
    return false;
  }, [restoreFromSaveData]);

  const saveGameToSlot = useCallback(async (slotId: number) => {
    const saveData = packageSaveData();
    if (saveData) {
        try {
            await saveToDBSlot(slotId, saveData);
            await refreshDbSaveSlots();
        } catch (e) {
            console.error(`Failed to save to DB slot ${slotId}`, e);
        }
    }
  }, [packageSaveData, refreshDbSaveSlots]);

  const loadGameFromSlot = useCallback(async (slotId: number) => {
    try {
        const saveData = await loadFromDBSlot(slotId);
        if (saveData) {
            restoreFromSaveData(saveData);
            return true;
        }
        return false;
    } catch (e) {
        console.error(`Failed to load from DB slot ${slotId}`, e);
        return false;
    }
  }, [restoreFromSaveData]);

  const deleteGameSlot = useCallback(async (slotId: number) => {
    try {
        await deleteDBSlot(slotId);
        await refreshDbSaveSlots();
    } catch (e) {
        console.error(`Failed to delete DB slot ${slotId}`, e);
    }
  }, [refreshDbSaveSlots]);

  const deleteCustomState = useCallback((idOrName: string) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState || !prevState.playerCustomStates) {
            return prevState;
        }
        
        const initialLength = prevState.playerCustomStates.length;
        const newPlayerCustomStates = prevState.playerCustomStates.filter(s => 
            s.stateId !== idOrName && s.stateName !== idOrName
        );

        if (newPlayerCustomStates.length === initialLength) {
            return prevState;
        }

        const newPc = { 
            ...prevState.playerCharacter, 
            playerCustomStates: newPlayerCustomStates 
        };

        const newState = { 
            ...prevState, 
            playerCharacter: newPc, 
            playerCustomStates: newPlayerCustomStates 
        };

        if (gameContextRef.current) {
            gameContextRef.current.playerCustomStates = newPlayerCustomStates;
            if (gameContextRef.current.playerCharacter) {
                gameContextRef.current.playerCharacter.playerCustomStates = newPlayerCustomStates;
            }
        }
        
        return newState;
    });
  }, [gameSettings]);

  const deleteNpcCustomState = useCallback((npcId: string, idOrName: string) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState) return null;
        const newNpcs = prevState.encounteredNPCs.map(npc => {
            if (npc.NPCId === npcId && npc.customStates) {
                const newStates = npc.customStates.filter(s => s.stateId !== idOrName && s.stateName !== idOrName);
                return { ...npc, customStates: newStates };
            }
            return npc;
        });
        if (gameContextRef.current) gameContextRef.current.encounteredNPCs = newNpcs;
        return { ...prevState, encounteredNPCs: newNpcs };
    });
  }, [gameSettings]);

  const deleteWorldStateFlag = useCallback((flagId: string) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState || !Array.isArray(prevState.worldStateFlags)) return prevState;
        const newFlags = prevState.worldStateFlags.filter((flag: WorldStateFlag) => flag.flagId !== flagId);
        if (gameContextRef.current) gameContextRef.current.worldStateFlags = newFlags;
        return { ...prevState, worldStateFlags: newFlags };
    });
  }, [gameSettings]);
  
    const deleteWorldEvent = useCallback((eventId: string) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState || !Array.isArray(prevState.worldEventsLog)) return prevState;
        const newEvents = prevState.worldEventsLog.filter(event => event.eventId !== eventId);
        if (gameContextRef.current) gameContextRef.current.worldEventsLog = newEvents;
        return { ...prevState, worldEventsLog: newEvents };
    });
  }, [gameSettings?.allowHistoryManipulation]);
  
    const deleteWorldEventsByTurnRange = useCallback((startTurn: number, endTurn: number) => {
    if (!gameSettings?.allowHistoryManipulation) return;
    setGameState(prevState => {
        if (!prevState || !Array.isArray(prevState.worldEventsLog)) return prevState;
        const newEvents = prevState.worldEventsLog.filter(event => 
            event.turnNumber < startTurn || event.turnNumber > endTurn
        );
        if (gameContextRef.current) gameContextRef.current.worldEventsLog = newEvents;
        return { ...prevState, worldEventsLog: newEvents };
    });
  }, [gameSettings?.allowHistoryManipulation]);

  const updateNpcSortOrder = useCallback((newOrder: string[]) => {
    setGameState(prevState => {
        if (!prevState) return null;
        const newNpcs = prevState.encounteredNPCs.map(npc => {
            if (npc.NPCId && !newOrder.includes(npc.NPCId)) {
                newOrder.push(npc.NPCId);
            }
            return npc;
        });
        const finalState = { ...prevState, npcSortOrder: newOrder, encounteredNPCs: newNpcs };
        return finalState;
    });
  }, []);
  
  const updateItemSortOrder = useCallback((newOrder: string[]) => {
    setGameState(prevState => {
        if (!prevState) return null;
        const newPc = { ...prevState.playerCharacter, itemSortOrder: newOrder };
        return { ...prevState, playerCharacter: newPc };
    });
  }, []);
  
  const updateItemSortSettings = useCallback((criteria: PlayerCharacter['itemSortCriteria'], direction: PlayerCharacter['itemSortDirection']) => {
    setGameState(prevState => {
        if (!prevState) return null;
        const newPc = { ...prevState.playerCharacter, itemSortCriteria: criteria, itemSortDirection: direction };
        return { ...prevState, playerCharacter: newPc };
    });
  }, []);
  
  const updateNpcItemSortOrder = useCallback((npcId: string, newOrder: string[]) => {
    setGameState(prevState => {
        if (!prevState) return null;
        const newNpcs = prevState.encounteredNPCs.map(npc => {
            if (npc.NPCId === npcId) {
                return { ...npc, itemSortOrder: newOrder };
            }
            return npc;
        });
        return { ...prevState, encounteredNPCs: newNpcs };
    });
  }, []);
  
  const updateNpcItemSortSettings = useCallback((npcId: string, criteria: PlayerCharacter['itemSortCriteria'], direction: PlayerCharacter['itemSortDirection']) => {
    setGameState(prevState => {
        if (!prevState) return null;
        const newNpcs = prevState.encounteredNPCs.map(npc => {
            if (npc.NPCId === npcId) {
                return { ...npc, itemSortCriteria: criteria, itemSortDirection: direction };
            }
            return npc;
        });
        return { ...prevState, encounteredNPCs: newNpcs };
    });
  }, []);

  const clearNpcJournalsNow = useCallback(() => {
    if (!gameSettings?.keepLatestNpcJournals || !gameState) return;

    setGameState(prevState => {
        if (!prevState) return null;

        const countToKeep = gameSettings.latestNpcJournalsCount || 20;

        const newNpcs = prevState.encounteredNPCs.map(npc => {
            if (npc.journalEntries && npc.journalEntries.length > countToKeep) {
                const updatedEntries = npc.journalEntries.slice(0, countToKeep);
                return { ...npc, journalEntries: updatedEntries };
            }
            return npc;
        });

        const newState = { ...prevState, encounteredNPCs: newNpcs };
        
        if (gameContextRef.current) {
            gameContextRef.current.encounteredNPCs = newNpcs;
        }

        return newState;
    });
  }, [gameSettings, gameState]);

  return {
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
    handleTransferItem,
    handleEquipItemForNpc,
    handleUnequipItemForNpc,
    handleSplitItemForNpc,
    handleMergeItemsForNpc,
    onEditNpcMemory,
    onDeleteNpcMemory,
    clearNpcJournalsNow,
  };
}
