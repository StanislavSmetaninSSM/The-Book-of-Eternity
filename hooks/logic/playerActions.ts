import React from 'react';
// FIX: Add missing imports for LocationStorage and Item
import { GameState, ChatMessage, NPC, Faction, PlayerCharacter, Location, Quest, CustomState, WorldState, WorldStateFlag, UnlockedMemory, WorldEvent, Item, LocationStorage } from '../../types';
import { deleteMessage as deleteMessageUtil, clearHalfHistory as clearHalfHistoryUtil, deleteLogs as deleteLogsUtil, forgetNpc as forgetNpcUtil, forgetFaction as forgetFactionUtil } from '../../utils/uiManager';
// FIX: Add imports for calculateDate and calculateTotalMinutes to support calendar system.
import { recalculateDerivedStats, calculateDate, calculateTotalMinutes } from '../../utils/gameContext';
import { recalculateAllWeights } from '../../utils/inventoryManager';

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const createPlayerActionsManager = (
    {
        setGameState,
        setGameHistory,
        setGameLog,
        setCombatLog,
        setVisitedLocations,
        setWorldMap,
        setWorldState,
        gameSettings,
        gameContextRef,
        t
    }: {
        setGameState: React.Dispatch<React.SetStateAction<GameState | null>>,
        setGameHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
        setGameLog: React.Dispatch<React.SetStateAction<string[]>>,
        setCombatLog: React.Dispatch<React.SetStateAction<string[]>>,
        setVisitedLocations: React.Dispatch<React.SetStateAction<Location[]>>,
        setWorldMap: React.Dispatch<React.SetStateAction<Record<string, Location>>>,
        setWorldState: React.Dispatch<React.SetStateAction<WorldState | null>>,
        gameSettings: any,
        gameContextRef: React.MutableRefObject<any>,
        t: (key: string, replacements?: any) => string,
    }
) => {
    const spendAttributePoint = (characteristic: string) => {
        setGameState(prevState => {
            if (!prevState || prevState.playerCharacter.attributePoints <= 0) return prevState;

            const pc = JSON.parse(JSON.stringify(prevState.playerCharacter)) as PlayerCharacter;
            const standardKey = `standard${characteristic.charAt(0).toUpperCase() + characteristic.slice(1)}` as keyof PlayerCharacter['characteristics'];
            
            if (pc.characteristics[standardKey] >= 100) {
                return prevState;
            }

            pc.attributePoints -= 1;
            (pc.characteristics[standardKey] as number) += 1;
            
            const updatedPc = recalculateDerivedStats(pc);

            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter = updatedPc;
            }

            return { ...prevState, playerCharacter: updatedPc };
        });
    };

    const setAutoCombatSkill = (skillName: string | null) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const newPc = { ...prevState.playerCharacter, autoCombatSkill: skillName };
            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter.autoCombatSkill = skillName;
            }
            return { ...prevState, playerCharacter: newPc };
        });
    };

    const editChatMessage = (indexToEdit: number, newContent: string) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameHistory(prevHistory => {
            const newHistory = [...prevHistory];
            if (newHistory[indexToEdit]) {
                newHistory[indexToEdit] = { ...newHistory[indexToEdit], content: newContent };
            }
            if (gameContextRef.current) gameContextRef.current.responseHistory = newHistory;
            return newHistory;
        });
    };

    const editNpcData = (npcId: string, field: keyof NPC, value: any) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newNpcs = prevState.encounteredNPCs.map(npc => npc.NPCId === npcId ? { ...npc, [field]: value } : npc);
            if (gameContextRef.current) gameContextRef.current.encounteredNPCs = newNpcs as NPC[];
            return { ...prevState, encounteredNPCs: newNpcs };
        });
    };

    const editQuestData = (questId: string, field: keyof Quest, value: any) => {
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
    };

    const editItemData = (itemId: string, field: keyof Item, value: any) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newInventory = prevState.playerCharacter.inventory.map(item => item.existedId === itemId ? { ...item, [field]: value } : item);
            const newPc = { ...prevState.playerCharacter, inventory: newInventory };
            if (gameContextRef.current) gameContextRef.current.playerCharacter.inventory = newInventory;
            return { ...prevState, playerCharacter: newPc };
        });
    };

    const editFactionData = (factionId: string, field: keyof Faction, value: any) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newFactions = prevState.encounteredFactions.map(faction => faction.factionId === factionId ? { ...faction, [field]: value } : faction);
            if (gameContextRef.current) {
              gameContextRef.current.encounteredFactions = newFactions;
            }
            return { ...prevState, encounteredFactions: newFactions };
        });
    };

    const editLocationData = (locationId: string, field: keyof Location, value: any) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setVisitedLocations(prev => {
            const newLocations = prev.map(loc => loc.locationId === locationId ? { ...loc, [field]: value } : loc);
            if (gameContextRef.current) gameContextRef.current.visitedLocations = newLocations;
            return newLocations;
        });
        setGameState(prev => {
            if(!prev) return null;
            if(prev.currentLocationData?.locationId === locationId){
                const newCurrent = {...prev.currentLocationData, [field]: value} as Location;
                if(gameContextRef.current) gameContextRef.current.currentLocation = newCurrent;
                return {...prev, currentLocationData: newCurrent};
            }
            return prev;
        });
    };

    const editPlayerData = (field: keyof PlayerCharacter, value: any) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newPc = { ...prevState.playerCharacter, [field]: value };
            if (gameContextRef.current) gameContextRef.current.playerCharacter = newPc;
            return { ...prevState, playerCharacter: newPc };
        });
    };

    const editWorldState = (updates: Partial<{ day: number, time: string, year: number, monthIndex: number }>) => {
        if (!gameContextRef.current || !gameSettings?.allowHistoryManipulation) return;

        setWorldState(worldState => {
            if (!worldState || !gameContextRef.current?.gameSettings.gameWorldInformation.calendar) return worldState;
            
            const calendar = gameContextRef.current.gameSettings.gameWorldInformation.calendar;
            let currentTotalMinutes = worldState.currentTimeInMinutes;

            const currentDate = worldState.date || calculateDate(currentTotalMinutes, calendar);
            const currentMonthIndex = calendar.months.findIndex((m: { name: string; }) => m.name === currentDate.currentMonthName);

            const newDateParts = {
                year: updates.year ?? currentDate.currentYear,
                monthIndex: updates.monthIndex ?? (currentMonthIndex > -1 ? currentMonthIndex : 0),
                day: updates.day ?? currentDate.dayOfMonth,
            };
            
            let totalDaysMinutes = calculateTotalMinutes(newDateParts, calendar);

            let minutesIntoDay;
            if (updates.time) {
                const [hours, minutes] = updates.time.split(':').map(Number);
                if (!isNaN(hours) && !isNaN(minutes)) {
                    minutesIntoDay = hours * 60 + minutes;
                } else {
                    minutesIntoDay = worldState.currentTimeInMinutes % (24*60);
                }
            } else {
                minutesIntoDay = worldState.currentTimeInMinutes % (24*60);
            }
            
            const newTotalMinutes = totalDaysMinutes + minutesIntoDay;
            
            const newDate = calculateDate(newTotalMinutes, calendar);
            
            let timeOfDay: WorldState['timeOfDay'] = 'Night';
            if (minutesIntoDay >= 5 * 60 && minutesIntoDay < 12 * 60) timeOfDay = 'Morning';
            else if (minutesIntoDay >= 12 * 60 && minutesIntoDay < 18 * 60) timeOfDay = 'Afternoon';
            else if (minutesIntoDay >= 18 * 60 && minutesIntoDay < 22 * 60) timeOfDay = 'Evening';

            const newWorldState: WorldState = {
                ...worldState,
                day: newDate.dayOfMonth,
                currentTimeInMinutes: newTotalMinutes,
                timeOfDay: timeOfDay,
                date: newDate,
            };
            
            if (gameContextRef.current) {
                gameContextRef.current.worldState = newWorldState;
            }
            return newWorldState;
        });
    };

    const editWeather = (newWeather: string) => {
        if (!gameContextRef.current || !gameSettings?.allowHistoryManipulation) return;
        setWorldState(worldState => {
            if (!worldState) return worldState;
            const newWorldState: WorldState = { ...worldState, weather: newWeather };
            if (gameContextRef.current) {
                gameContextRef.current.worldState = newWorldState;
            }
            return newWorldState;
        });
    };
    
    const editWorldStateFlagData = (flagId: string, field: keyof WorldStateFlag, value: any) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState || !Array.isArray(prevState.worldStateFlags)) return prevState;
            const newFlags = prevState.worldStateFlags.map(flag => 
                flag.flagId === flagId ? { ...flag, [field]: value } : flag
            );
            if (gameContextRef.current) gameContextRef.current.worldStateFlags = newFlags;
            return { ...prevState, worldStateFlags: newFlags };
        });
    };
    
    const onEditNpcMemory = (npcId: string, memoryToUpdate: UnlockedMemory) => {
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
    };

    const onDeleteNpcMemory = (npcId: string, memoryId: string) => {
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
    };

    const deleteMessage = (indexToDelete: number) => {
        setGameHistory(prevHistory => deleteMessageUtil(indexToDelete, prevHistory));
    };

    const clearHalfHistory = () => {
        setGameHistory(prevHistory => clearHalfHistoryUtil(prevHistory));
    };

    const deleteLogs = () => {
        setGameLog(deleteLogsUtil());
        setCombatLog([]);
    };

    const forgetNpc = (npcIdToForget: string) => {
        setGameState(prevState => {
            if (!prevState) return null;
            return forgetNpcUtil(npcIdToForget, prevState);
        });
    };

    const forgetFaction = (factionIdToForget: string) => {
        setGameState(prevState => {
            if (!prevState) return null;
            return forgetFactionUtil(factionIdToForget, prevState);
        });
    };

    const clearNpcJournal = (npcId: string) => {
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
    };

    const deleteNpcJournalEntry = (npcId: string, entryIndex: number) => {
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
    };

    const deleteOldestNpcJournalEntries = (npcId: string, count: number) => {
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
    };

    const forgetLocation = (locationId: string) => {
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
    };

    const forgetQuest = (questId: string) => {
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
    };
    
    const deleteCustomState = (idOrName: string) => {
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
    };

    const deleteNpcCustomState = (npcId: string, idOrName: string) => {
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
    };

    const deleteWorldStateFlag = (flagId: string) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState || !Array.isArray(prevState.worldStateFlags)) return prevState;
            const newFlags = prevState.worldStateFlags.filter((flag: WorldStateFlag) => flag.flagId !== flagId);
            if (gameContextRef.current) gameContextRef.current.worldStateFlags = newFlags;
            return { ...prevState, worldStateFlags: newFlags };
        });
    };
      
    const deleteWorldEvent = (eventId: string) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState || !Array.isArray(prevState.worldEventsLog)) return prevState;
            const newEvents = prevState.worldEventsLog.filter(event => event.eventId !== eventId);
            if (gameContextRef.current) gameContextRef.current.worldEventsLog = newEvents;
            return { ...prevState, worldEventsLog: newEvents };
        });
    };
    
    const deleteWorldEventsByTurnRange = (startTurn: number, endTurn: number) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState || !Array.isArray(prevState.worldEventsLog)) return prevState;
            const newEvents = prevState.worldEventsLog.filter(event => 
                event.turnNumber < startTurn || event.turnNumber > endTurn
            );
            if (gameContextRef.current) gameContextRef.current.worldEventsLog = newEvents;
            return { ...prevState, worldEventsLog: newEvents };
        });
    };
    
    const onRegenerateId = (entity: any, entityType: string) => {
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
                        gameContextRef.current.currentLocation = newCurrent as Location;
                    }
                    return { ...prev, currentLocationData: newCurrent as Location };
                }
                return prev;
            });
        }
    };

    const updateNpcSortOrder = (newOrder: string[]) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const newState = { ...prevState, npcSortOrder: newOrder };
            // Note: npcSortOrder is not in gameContext, only local game state for UI
            return newState;
        });
    };

    const updateItemSortOrder = (newOrder: string[]) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const newPc = { ...prevState.playerCharacter, itemSortOrder: newOrder, itemSortCriteria: 'manual' as 'manual' };
            if (gameContextRef.current) gameContextRef.current.playerCharacter = newPc;
            return { ...prevState, playerCharacter: newPc };
        });
    };

    const updateItemSortSettings = (criteria: PlayerCharacter['itemSortCriteria'], direction: PlayerCharacter['itemSortDirection']) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const newPc = { ...prevState.playerCharacter, itemSortCriteria: criteria, itemSortDirection: direction };
            if (gameContextRef.current) gameContextRef.current.playerCharacter = newPc;
            return { ...prevState, playerCharacter: newPc };
        });
    };

    const updateNpcItemSortOrder = (npcId: string, newOrder: string[]) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const newNpcs = prevState.encounteredNPCs.map(npc =>
                npc.NPCId === npcId ? { ...npc, itemSortOrder: newOrder, itemSortCriteria: 'manual' as 'manual' } : npc
            );
            if (gameContextRef.current) gameContextRef.current.encounteredNPCs = newNpcs;
            return { ...prevState, encounteredNPCs: newNpcs };
        });
    };

    const updateNpcItemSortSettings = (npcId: string, criteria: PlayerCharacter['itemSortCriteria'], direction: PlayerCharacter['itemSortDirection']) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const newNpcs = prevState.encounteredNPCs.map(npc =>
                npc.NPCId === npcId ? { ...npc, itemSortCriteria: criteria, itemSortDirection: direction } : npc
            );
            if (gameContextRef.current) gameContextRef.current.encounteredNPCs = newNpcs;
            return { ...prevState, encounteredNPCs: newNpcs };
        });
    };

    const updateActiveSkillSortOrder = (newOrder: string[]) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newPc = { ...prevState.playerCharacter, activeSkillSortOrder: newOrder };
            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter = newPc;
            }
            return { ...prevState, playerCharacter: newPc };
        });
    };

    const updatePassiveSkillSortOrder = (newOrder: string[]) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newPc = { ...prevState.playerCharacter, passiveSkillSortOrder: newOrder };
            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter = newPc;
            }
            return { ...prevState, playerCharacter: newPc };
        });
    };

    const clearNpcJournalsNow = () => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;
            const newNpcs = prevState.encounteredNPCs.map(npc => ({ ...npc, journalEntries: [] }));
            if (gameContextRef.current) gameContextRef.current.encounteredNPCs = newNpcs;
            return { ...prevState, encounteredNPCs: newNpcs };
        });
    };

    const clearAllCompletedFactionProjects = (factionId: string) => {
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
    };

    const clearAllCompletedNpcActivities = (npcId: string) => {
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
    };
    
    const placeAsStorage = (itemToPlace: Item) => {
        if (!gameSettings?.allowHistoryManipulation) return;
        setGameState(prevState => {
            if (!prevState) return null;

            let newPc = { ...prevState.playerCharacter };
            let wasEquipped = false;
            Object.keys(newPc.equippedItems).forEach(slot => {
                if (newPc.equippedItems[slot] === itemToPlace.existedId) {
                    newPc.equippedItems[slot] = null;
                    wasEquipped = true;
                }
            });

            const itemIndex = newPc.inventory.findIndex(i => i.existedId === itemToPlace.existedId);
            if (itemIndex === -1) {
                console.warn("Item to place as storage not found in inventory.");
                return prevState;
            }
            newPc.inventory.splice(itemIndex, 1);
            
            const newLocation = { ...prevState.currentLocationData };
            if (!newLocation.locationStorages) {
                newLocation.locationStorages = [];
            }

            const newStorage: LocationStorage = {
                storageId: generateId('storage'),
                name: itemToPlace.name,
                description: itemToPlace.description,
                image_prompt: itemToPlace.image_prompt,
                capacity: itemToPlace.capacity,
                volume: itemToPlace.volume,
                owner: {
                    ownerType: 'Player',
                    ownerId: newPc.playerId,
                    ownerName: newPc.name,
                },
                authorizedUsers: [],
                contents: [], // starts empty
                hasFullAccess: true,
            };

            newLocation.locationStorages.push(newStorage);
            
            newPc = recalculateAllWeights(newPc);
            if (wasEquipped) {
                newPc = recalculateDerivedStats(newPc);
            }
            
            const newState = {
                ...prevState,
                playerCharacter: newPc,
                currentLocationData: newLocation,
            };

            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter = newPc;
                gameContextRef.current.currentLocation = newLocation;
            }

            return newState;
        });
    };

    const moveToLocationStorage = (locationId: string, storageId: string, item: Item, quantity: number) => {
        setGameState(prevState => {
            if (!prevState || !prevState.currentLocationData || prevState.currentLocationData.locationId !== locationId) return prevState;
    
            const newState = JSON.parse(JSON.stringify(prevState));
            let pc = newState.playerCharacter as PlayerCharacter;
            let location = newState.currentLocationData as Location;
    
            const storage = location.locationStorages?.find(s => s.storageId === storageId);
            const sourceItemIndex = pc.inventory.findIndex(i => i.existedId === item.existedId);
    
            if (!storage || sourceItemIndex === -1) return prevState;
            
            const sourceItem = pc.inventory[sourceItemIndex];
            const validQuantity = Math.min(quantity, sourceItem.count);
    
            const itemToMove = { ...sourceItem, count: validQuantity };
            if (itemToMove.existedId) {
                delete (itemToMove as any).existedId;
            }
    
            const existingStack = storage.contents.find(i => i.name === itemToMove.name && !i.equipmentSlot);
            if (existingStack) {
                existingStack.count += validQuantity;
            } else {
                storage.contents.push({ ...itemToMove, existedId: generateId('item') });
            }
    
            sourceItem.count -= validQuantity;
            if (sourceItem.count <= 0) {
                pc.inventory.splice(sourceItemIndex, 1);
            }
    
            pc = recalculateAllWeights(pc);
            newState.playerCharacter = pc;
            newState.currentLocationData = location;
    
            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter = pc;
                gameContextRef.current.currentLocation = location;
            }
    
            return newState;
        });
    };

    const retrieveFromLocationStorage = (locationId: string, storageId: string, item: Item, quantity: number) => {
        setGameState(prevState => {
            if (!prevState || !prevState.currentLocationData || prevState.currentLocationData.locationId !== locationId) return prevState;
    
            const newState = JSON.parse(JSON.stringify(prevState));
            let pc = newState.playerCharacter as PlayerCharacter;
            let location = newState.currentLocationData as Location;
    
            const storage = location.locationStorages?.find(s => s.storageId === storageId);
            if (!storage) return prevState;

            const sourceItemIndex = storage.contents.findIndex(i => i.existedId === item.existedId);
            if (sourceItemIndex === -1) return prevState;

            const sourceItem = storage.contents[sourceItemIndex];
            const validQuantity = Math.min(quantity, sourceItem.count);

            const weightToTake = sourceItem.weight * validQuantity;
            if (pc.totalWeight + weightToTake > pc.maxWeight + pc.criticalExcessWeight) {
                alert(t('You are carrying too much to take this item.'));
                return prevState;
            }

            const itemToMove = { ...sourceItem, count: validQuantity };
            if (itemToMove.existedId) {
                delete (itemToMove as any).existedId;
            }

            const existingStack = pc.inventory.find(i => i.name === itemToMove.name && !i.equipmentSlot);
            if (existingStack) {
                existingStack.count += validQuantity;
            } else {
                pc.inventory.push({ ...itemToMove, existedId: generateId('item') });
            }

            sourceItem.count -= validQuantity;
            if (sourceItem.count <= 0) {
                storage.contents.splice(sourceItemIndex, 1);
            }

            pc = recalculateAllWeights(pc);
            newState.playerCharacter = pc;
            newState.currentLocationData = location;

            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter = pc;
                gameContextRef.current.currentLocation = location;
            }
    
            return newState;
        });
    };

    const shareStorageAccess = (locationId: string, storageId: string, targetPlayerId: string) => {
        setGameState(prevState => {
            if (!prevState || !prevState.currentLocationData || prevState.currentLocationData.locationId !== locationId) return prevState;
    
            const newState = JSON.parse(JSON.stringify(prevState));
            const pc = newState.playerCharacter as PlayerCharacter;
            const location = newState.currentLocationData as Location;
            const storage = location.locationStorages?.find(s => s.storageId === storageId);
            const targetPlayer = newState.players.find((p: PlayerCharacter) => p.playerId === targetPlayerId);

            if (!storage || !targetPlayer || storage.owner.ownerId !== pc.playerId) return prevState;

            if (!storage.authorizedUsers) storage.authorizedUsers = [];
            if (!storage.authorizedUsers.some(u => u.playerId === targetPlayerId)) {
                storage.authorizedUsers.push({ playerId: targetPlayerId, playerName: targetPlayer.name });
            }
            if (storage.owner.ownerType === 'Player') {
                storage.owner.ownerType = 'Shared';
            }
            
            newState.currentLocationData = location;
            if (gameContextRef.current) gameContextRef.current.currentLocation = location;

            return newState;
        });
    };

    const revokeStorageAccess = (locationId: string, storageId: string, targetPlayerId: string) => {
         setGameState(prevState => {
            if (!prevState || !prevState.currentLocationData || prevState.currentLocationData.locationId !== locationId) return prevState;
    
            const newState = JSON.parse(JSON.stringify(prevState));
            const pc = newState.playerCharacter as PlayerCharacter;
            const location = newState.currentLocationData as Location;
            const storage = location.locationStorages?.find(s => s.storageId === storageId);

            if (!storage || storage.owner.ownerId !== pc.playerId) return prevState;

            storage.authorizedUsers = (storage.authorizedUsers || []).filter(u => u.playerId !== targetPlayerId);
            if (storage.authorizedUsers.length === 0 && storage.owner.ownerType === 'Shared') {
                storage.owner.ownerType = 'Player';
            }
            
            newState.currentLocationData = location;
            if (gameContextRef.current) gameContextRef.current.currentLocation = location;

            return newState;
        });
    };

    return {
        spendAttributePoint,
        setAutoCombatSkill,
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
        onEditNpcMemory,
        onDeleteNpcMemory,
        deleteMessage,
        clearHalfHistory,
        deleteLogs,
        forgetNpc,
        forgetFaction,
        clearNpcJournal,
        deleteNpcJournalEntry,
        deleteOldestNpcJournalEntries,
        forgetLocation,
        forgetQuest,
        deleteCustomState,
        deleteNpcCustomState,
        deleteWorldStateFlag,
        deleteWorldEvent,
        deleteWorldEventsByTurnRange,
        onRegenerateId,
        updateNpcSortOrder,
        updateItemSortOrder,
        updateItemSortSettings,
        updateNpcItemSortOrder,
        updateNpcItemSortSettings,
        updateActiveSkillSortOrder,
        updatePassiveSkillSortOrder,
        clearNpcJournalsNow,
        clearAllCompletedFactionProjects,
        clearAllCompletedNpcActivities,
        placeAsStorage,
        moveToLocationStorage,
        retrieveFromLocationStorage,
        shareStorageAccess,
        revokeStorageAccess,
    };
}