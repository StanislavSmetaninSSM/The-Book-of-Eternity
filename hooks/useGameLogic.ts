

import { useState, useCallback, useRef } from 'react';
import { GameState, GameContext, ChatMessage, GameResponse, LocationData, Item, NPC, SaveFile, Location, PlayerCharacter, WorldState, GameSettings, Quest, Faction, PlotOutline, Language } from '../types';
import { executeTurn, askGmQuestion } from '../utils/gameApi';
import { createInitialContext, buildNextContext, updateWorldMap, recalculateDerivedStats } from '../utils/gameContext';
import { processAndApplyResponse } from '../utils/responseProcessor';
import { equipItem as equipItemUtil, unequipItem as unequipItemUtil, dropItem as dropItemUtil, moveItem as moveItemUtil, recalculateAllWeights } from '../utils/inventoryManager';
import { deleteMessage as deleteMessageUtil, clearHalfHistory as clearHalfHistoryUtil, deleteLogs as deleteLogsUtil, forgetNpc as forgetNpcUtil } from '../utils/uiManager';
import { saveGameToFile, loadGameFromFile } from '../utils/fileManager';
import { useLocalization } from '../context/LocalizationContext';
import { formatError } from '../utils/errorUtils';

const AUTOSAVE_KEY = 'gemini-rpg-autosave';

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

export function useGameLogic({ language, setLanguage }: UseGameLogicProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
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
  const [autosaveTimestamp, setAutosaveTimestamp] = useState<string | null>(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (!saved) return null;
    try {
      const data: SaveFile = JSON.parse(saved);
      return data.timestamp;
    } catch {
      return null;
    }
  });

  const { t } = useLocalization();

  const gameContextRef = useRef<GameContext | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  const restoreFromSaveData = useCallback((data: SaveFile) => {
      gameContextRef.current = data.gameContext;
      setGameState(data.gameState);
      setWorldState(data.gameContext.worldState);
      const loadedSettings = data.gameContext.gameSettings;
      setGameSettings(loadedSettings);
      setLanguage(loadedSettings.language || 'en');
      setGameHistory(data.gameHistory as ChatMessage[]);
      setGameLog(data.gameLog);
      setCombatLog(data.combatLog ?? []);
      setLastJsonResponse(data.lastJsonResponse);
      setSceneImagePrompt(data.sceneImagePrompt);
      setWorldMap(data.gameContext.worldMap ?? {});
      setVisitedLocations(data.gameContext.visitedLocations ?? []);
      setTurnNumber(data.gameContext.currentTurnNumber);
  }, [setLanguage]);

  const autosave = useCallback(() => {
    const saveData = packageSaveData();
    if (saveData) {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(saveData));
      setAutosaveTimestamp(saveData.timestamp);
    }
  }, [packageSaveData]);

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
      const onPartialResponse = (response: any) => {
        setLastJsonResponse(JSON.stringify(response, null, 2));
        if (response.items_and_stat_calculations) {
            setGameLog(response.items_and_stat_calculations);
        }
      };

      const onStreamingChunk = (text: string) => {
        setLastJsonResponse(text);
      };

      const finalResponse = await executeTurn(context, abortControllerRef.current.signal, onPartialResponse, onStreamingChunk);
      
      if (context.gameSettings.allowHistoryManipulation !== true && finalResponse.playerBehaviorAssessment?.historyManipulationCoefficient >= 0.8) {
          setError(t("history_manipulation_rejection"));
          setGameHistory(prev => prev.slice(0, -1)); // Remove the offending player message
          setIsLoading(false);
          return;
      }

      if (context.gameSettings.adultMode && finalResponse.response) {
          finalResponse.response = finalResponse.response.replace(/~~/g, '');
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
      };
      
      const { newState, logsToAdd, combatLogsToAdd } = processAndApplyResponse(finalResponse, baseState, t);
      
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
      
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const formattedError = formatError(err);
        setError(formattedError);
        const systemMessage: ChatMessage = { sender: 'system', content: `Error: ${formattedError}` };
        setGameHistory(prev => [...prev, systemMessage]);
      }
    } finally {
      setIsLoading(false);
      autosave();
    }
  }, [gameState, autosave, t]);

  const sendMessage = useCallback((message: string) => {
    if (isLoading || !gameContextRef.current) return;
    const playerMessage: ChatMessage = { sender: 'player', content: message };
    setSuggestedActions([]);
    
    setGameHistory(prevHistory => {
        const newHistory = [...prevHistory, playerMessage];
        const newContext = { ...gameContextRef.current! };
        newContext.message = message;
        newContext.responseHistory = newHistory;
        setLastRequestJson(JSON.stringify(newContext, null, 2));
        handleTurn(playerMessage, newContext);
        return newHistory;
    });
  }, [isLoading, handleTurn]);
  
  const startGame = useCallback((creationData: any) => {
    const initialContext = createInitialContext(creationData, language);
    gameContextRef.current = initialContext;
    setWorldMap(initialContext.worldMap);
    setVisitedLocations(initialContext.visitedLocations);
    setWorldState(initialContext.worldState);
    setGameSettings(initialContext.gameSettings);
    setTurnNumber(initialContext.currentTurnNumber);
    const initialMessage = { sender: 'player', content: creationData.initialPrompt } as ChatMessage;
    const newHistory = [initialMessage];
    setGameHistory(newHistory);
    const contextWithHistory = { ...initialContext, responseHistory: newHistory };
    setLastRequestJson(JSON.stringify(contextWithHistory, null, 2));
    handleTurn(initialMessage, contextWithHistory);
  }, [handleTurn, language]);

  const askQuestion = useCallback(async (question: string) => {
    if (!gameContextRef.current || isLoading) return;

    setIsLoading(true);
    setError(null);
    clearStashForNewTurn();
    if (!gameContextRef.current?.enemiesDataForCurrentTurn || gameContextRef.current.enemiesDataForCurrentTurn.length === 0) {
        setCombatLog([]);
    }
    setGameLog([]);
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
            responseHistory: historyWithQuestion
        };
        setLastRequestJson(JSON.stringify(context, null, 2));

        const onStreamingChunk = (text: string) => {
          setLastJsonResponse(text);
        };

        const response: GameResponse = await askGmQuestion(context, abortControllerRef.current.signal, onStreamingChunk);

        if (context.gameSettings.adultMode && response.response) {
            response.response = response.response.replace(/~~/g, '');
        }

        setLastJsonResponse(JSON.stringify(response, null, 2));
        if (response.items_and_stat_calculations) {
            setGameLog(response.items_and_stat_calculations);
        }
        setSceneImagePrompt(response.image_prompt);
        setSuggestedActions(response.dialogueOptions || []);

        const gmMessage: ChatMessage = { sender: 'gm', content: response.response || '' };
        
        const historyWithAnswer = [...historyWithQuestion, gmMessage];
        setGameHistory(historyWithAnswer);

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
        };

        const { newState, logsToAdd, combatLogsToAdd } = processAndApplyResponse(response, baseState, t);
        if (logsToAdd.length > 0) {
          setGameLog(prev => [...prev, ...logsToAdd]);
        }
        if (combatLogsToAdd.length > 0) {
            setCombatLog(prev => [...prev, ...combatLogsToAdd]);
        }
        setGameState(newState);

        if (gameContextRef.current) {
            const nextContext = buildNextContext(gameContextRef.current, response, newState, historyWithAnswer, false);
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
      autosave();
    }
  }, [isLoading, gameState, autosave, gameHistory, t]);
  
  const updateGameSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setGameSettings(prevSettings => {
        if (!prevSettings || !gameContextRef.current) return prevSettings;
        
        const updatedSettings = { ...prevSettings, ...newSettings };
        gameContextRef.current.gameSettings = updatedSettings;
        
        autosave(); 

        return updatedSettings;
    });
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
    // Let the regular autosave at the end of the next turn handle saving.
  }, []);

  const craftItem = useCallback((recipeName: string) => {
    sendMessage(`[System Action] Attempt to craft item using recipe: ${recipeName}`);
  }, [sendMessage]);


  // Client-side Inventory & Equipment Management
  const equipItem = useCallback((itemToEquip: Item, slot: string) => {
    setGameState(prevState => {
        if (!prevState) return null;
        let newGameState = equipItemUtil(itemToEquip, slot, prevState);
        newGameState.playerCharacter = recalculateAllWeights(newGameState.playerCharacter);
        if (gameContextRef.current) {
            gameContextRef.current.playerCharacter = newGameState.playerCharacter;
        }
        return newGameState;
    });
  }, []);

  const unequipItem = useCallback((itemToUnequip: Item) => {
    setGameState(prevState => {
      if (!prevState) return null;
      let newGameState = unequipItemUtil(itemToUnequip, prevState);
      newGameState.playerCharacter = recalculateAllWeights(newGameState.playerCharacter);
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
      newGameState.playerCharacter = recalculateAllWeights(newGameState.playerCharacter);
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
      newGameState.playerCharacter = recalculateAllWeights(newGameState.playerCharacter);
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

        // Find and remove/decrement the original item
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
            return prevState; // Item wasn't in inventory or count was already 0
        }

        // Add materials
        itemToDisassemble.disassembleTo.forEach((material: any) => {
            const existingStackIndex = inventory.findIndex(i => 
                i.name === material.materialName &&
                !i.equipmentSlot && // Simple check for stackability
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

        if (gameContextRef.current) {
            gameContextRef.current.playerCharacter = pc;
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
            return prevState; // Silently prevent increase if capped
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

  // Client-side UI State Management
  const deleteMessage = useCallback((indexToDelete: number) => {
    setGameHistory(prev => deleteMessageUtil(indexToDelete, prev));
  }, []);

  const clearHalfHistory = useCallback(() => {
    setGameHistory(prev => clearHalfHistoryUtil(prev));
  }, []);

  const deleteLogs = useCallback(() => {
    setGameLog(deleteLogsUtil());
  }, []);

  const forgetNpc = useCallback((npcIdToForget: string) => {
    setGameState(prevGameState => {
      if (!prevGameState) return prevGameState;
      const newGameState = forgetNpcUtil(npcIdToForget, prevGameState);
      if (gameContextRef.current) {
        gameContextRef.current.encounteredNPCs = newGameState.encounteredNPCs;
      }
      return newGameState;
    });
  }, []);
  
  const clearNpcJournal = useCallback((npcIdToClear: string) => {
    setGameState(prevGameState => {
      if (!prevGameState) return prevGameState;
      
      const newNPCs = prevGameState.encounteredNPCs.map(n => {
        if (n.NPCId === npcIdToClear) {
          const { journalEntries, ...rest } = n;
          return rest;
        }
        return n;
      }) as NPC[];

      const newState = { ...prevGameState, encounteredNPCs: newNPCs };

      if (gameContextRef.current) {
        const contextNpc = gameContextRef.current.encounteredNPCs.find((n: NPC) => n.NPCId === npcIdToClear);
        if (contextNpc) {
          delete (contextNpc as Partial<NPC>).journalEntries;
        }
      }
      return newState;
    });
  }, []);

  const forgetLocation = useCallback((locationIdToForget: string) => {
    setVisitedLocations(prevLocations => {
      const newVisitedLocations = prevLocations.filter(loc => loc.locationId !== locationIdToForget);
      if (gameContextRef.current) {
          gameContextRef.current.visitedLocations = newVisitedLocations;
      }
      return newVisitedLocations;
    });
  }, []);

  const forgetQuest = useCallback((questIdToForget: string) => {
    setGameState(prevGameState => {
      if (!prevGameState) return prevGameState;

      const newActiveQuests = prevGameState.activeQuests.filter(q => q.questId !== questIdToForget);
      const newCompletedQuests = prevGameState.completedQuests.filter(q => q.questId !== questIdToForget);
      
      const newState = {
        ...prevGameState,
        activeQuests: newActiveQuests,
        completedQuests: newCompletedQuests,
      };

      if (gameContextRef.current) {
        gameContextRef.current.activeQuests = newActiveQuests;
        gameContextRef.current.completedQuests = newCompletedQuests;
      }
      return newState;
    });
  }, []);

  // Save/Load Management
  const saveGame = useCallback(async () => {
    const saveData = packageSaveData();
    if (saveData) {
      saveGameToFile(saveData, t);
    }
  }, [packageSaveData, t]);

  const loadGame = useCallback(async (): Promise<boolean> => {
    const loadedData = await loadGameFromFile(t);
    if (loadedData) {
      try {
        restoreFromSaveData(loadedData);
        return true;
      } catch (e) {
        console.error("Error restoring game state:", e);
        return false;
      }
    }
    return false;
  }, [restoreFromSaveData, t]);

  const loadAutosave = useCallback((): boolean => {
    const savedJson = localStorage.getItem(AUTOSAVE_KEY);
    if (savedJson) {
      try {
        const loadedData: SaveFile = JSON.parse(savedJson);
        restoreFromSaveData(loadedData);
        return true;
      } catch (e) {
        console.error("Error restoring autosave:", e);
        return false;
      }
    }
    return false;
  }, [restoreFromSaveData]);
  
  // --- History Manipulation Functions ---

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

  // --- Temporary Stash Management ---
  const moveFromStashToInventory = useCallback((itemToMove: Item) => {
    setGameState(prevState => {
        if (!prevState || !prevState.temporaryStash) return prevState;

        const prospectiveWeight = prevState.playerCharacter.totalWeight + (itemToMove.weight * itemToMove.count);
        if (prospectiveWeight > prevState.playerCharacter.maxWeight + prevState.playerCharacter.criticalExcessWeight) {
            alert(t('You still cannot carry this item. Drop something else first.'));
            return prevState;
        }

        const newStash = prevState.temporaryStash.filter(i => i.existedId !== itemToMove.existedId);
        const newInventory = [...prevState.playerCharacter.inventory, itemToMove];
        
        let newPc = { ...prevState.playerCharacter, inventory: newInventory };
        newPc = recalculateAllWeights(newPc); 

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
    disassembleItem,
    craftItem,
    moveFromStashToInventory,
    dropItemFromStash,
    deleteMessage,
    clearHalfHistory,
    deleteLogs,
    forgetNpc,
    clearNpcJournal,
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
    turnNumber,
    updateGameSettings,
    editChatMessage,
    editNpcData,
    editQuestData,
    editItemData,
    editLocationData,
    editPlayerData,
  };
}