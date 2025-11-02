import { GameState, GameResponse, PlayerCharacter, Characteristics, GameSettings, Quest, Location, Item, NPC, Faction, ActiveSkill, PassiveSkill, SkillMastery, Wound, CustomState, WorldStateFlag, WorldEvent, Recipe, QuestUpdate, FactionChronicleUpdate, FactionBonusChange, FactionResourceChange, StructuredBonus, FactionCustomStateChange, UnlockedMemory, AdjacencyMapEntry, CompletedActivity, LocationStorage, ActiveThreat, Project, CompletedProject, FactionRankBranchChange, FactionRankBranch } from '../types';
import { recalculateAllWeights } from './inventoryManager';
import { recalculateDerivedStats, updateWorldMap } from './gameContext';
import { generateFactionColor } from './colorUtils';

const isObject = (item: any): item is object => {
    return (item && typeof item === 'object' && !Array.isArray(item));
};

const arrayMergeConfig: Record<string, { idField: string, nameField?: string, compositeKey?: (item: any) => string }> = {
    // Top-level GameResponse command arrays
    inventoryItemsData: { idField: 'existedId', nameField: 'name' },
    NPCsData: { idField: 'NPCId', nameField: 'name' },
    questUpdates: { idField: 'questId', nameField: 'questName' },
    factionDataChanges: { idField: 'factionId', nameField: 'name' },
    worldStateFlags: { idField: 'flagId', nameField: 'displayName' },
    worldEventsLog: { idField: 'eventId', nameField: 'headline' },
    customStateChanges: { idField: 'stateId', nameField: 'stateName' },
    playerWoundChanges: { idField: 'woundId', nameField: 'woundName' },
    NPCWoundChanges: { idField: 'woundId', nameField: 'woundName' },
    activeSkillChanges: { idField: 'skillName' },
    passiveSkillChanges: { idField: 'skillName' },
    skillMasteryChanges: { idField: 'skillName' },
    addOrUpdateRecipes: { idField: 'recipeName' },
    factionChronicleUpdates: { idField: 'factionId' },
    factionBonusChanges: { idField: 'factionId' },
    factionResourceChanges: { idField: 'factionId' },
    factionCustomStateChanges: { idField: 'factionId' },
    NPCActiveSkillChanges: { idField: 'NPCId', nameField: 'NPCName' },
    NPCPassiveSkillChanges: { idField: 'NPCId', nameField: 'NPCName' },
    NPCSkillMasteryChanges: { idField: 'NPCId', nameField: 'NPCName' },
    NPCPassiveSkillMasteryChanges: { idField: 'NPCId', nameField: 'NPCName' },
    NPCEffectChanges: { idField: 'NPCId', nameField: 'NPCName' },
    NPCUnlockedMemories: { idField: 'memoryId', nameField: 'title' },
    NPCFateCardUnlocks: { idField: 'NPCId', nameField: 'NPCName' },
    NPCsInScene: { idField: '', nameField: '' }, // Should likely just concat or replace
    NPCCustomStateChanges: { idField: 'NPCId', nameField: 'NPCName' },
    NPCInventoryAdds: { idField: 'NPCId', nameField: 'NPCName' },
    NPCInventoryUpdates: { idField: 'NPCId', nameField: 'NPCName' },
    NPCInventoryRemovals: { idField: 'NPCId', nameField: 'NPCName' },
    NPCEquipmentChanges: { idField: 'NPCId', nameField: 'NPCName' },
    itemFateCardUnlocks: { idField: 'itemId' },
    itemBondLevelChanges: { idField: 'itemId' },
    itemJournalUpdates: { idField: 'itemId' },
    NPCInventoryResourcesChanges: { idField: 'NPCId', nameField: 'NPCName' },
    NPCActivityUpdates: { idField: 'NPCId' },
    factionProjectUpdates: { idField: 'factionId' },
    completeNPCActivities: { idField: 'NPCId' },
    completeFactionProjects: { idField: 'factionId' },
    playerActiveEffectsChanges: { idField: 'effectId' },
    updateItemTextContents: { idField: 'itemId' },
    NPCRelationshipChanges: { idField: 'NPCId', nameField: 'NPCName' },
    locationUpdates: { idField: 'locationId' },
    threatsToUpdate: { idField: 'threatId', compositeKey: (item: any) => item.threatUpdate.threatId },
    inventoryItemsResources: { idField: 'existedId' },


    // Nested entity arrays within game state objects
    ranks: { idField: '', nameField: 'rankNameMale' },
    structuredBonuses: { idField: 'bonusId', nameField: 'description' },
    customStates: { idField: 'stateId', nameField: 'stateName' },
    activeProjects: { idField: 'projectId', nameField: 'projectName' },
    completedProjects: { idField: 'projectId', nameField: 'projectName' },
    relations: { idField: 'targetFactionId' },
    thresholds: { idField: '', nameField: 'levelName' }, // From user's example
    
    activeSkills: { idField: 'skillName' },
    passiveSkills: { idField: 'skillName' },
    skillMasteryData: { idField: 'skillName' },
    inventory: { idField: 'existedId' },
    activePlayerEffects: { idField: 'effectId' },
    activeEffects: { idField: 'effectId' },
    playerWounds: { idField: 'woundId' },
    wounds: { idField: 'woundId' },
    playerCustomStates: { idField: 'stateId' },
    fateCards: { idField: 'cardId' },
    unlockedMemories: { idField: 'memoryId', nameField: 'title' },
    factionAffiliations: { idField: 'factionId' },
    completedActivities: { idField: '', compositeKey: (item: any) => `${item.activityName}_${item.completionTurn}` },
    
    // Location
    adjacencyMap: { idField: '', compositeKey: (item: any) => `${item.targetCoordinates.x},${item.targetCoordinates.y}` },
    factionControl: { idField: 'factionId' },
    locationStorages: { idField: 'storageId' },
    activeThreats: { idField: 'threatId', nameField: 'name' },
    
    // Project
    resourcesSpent: { idField: 'resourceName' },
    totalResourceCost: { idField: 'resourceName' },
};

const mergeEntities = (arr1: any[], arr2: any[], idField: string, nameField?: string, compositeKey?: (item: any) => string) => {
    const map = new Map<string, any>();
    const withoutKey: any[] = [];

    const getKey = (item: any): string | null => {
        if (compositeKey) return compositeKey(item);
        if (idField && item[idField]) return `id_${item[idField]}`;
        if (nameField && item[nameField]) return `name_${item[nameField]}`;
        return null;
    };

    for (const item of arr1) {
        if (!isObject(item)) continue;
        const key = getKey(item);
        if (key) {
            map.set(key, item);
        } else {
            withoutKey.push(item);
        }
    }

    for (const item of arr2) {
        if (!isObject(item)) continue;
        const key = getKey(item);

        if (key && map.has(key)) {
            const existingItem = map.get(key);
            map.set(key, deepMergeResponses(existingItem, item));
        } else if (key) {
            map.set(key, item);
        } else {
            withoutKey.push(item);
        }
    }

    return [...Array.from(map.values()), ...withoutKey];
};


// Arrays that represent a full state and should be replaced, not concatenated.
const arrayReplaceKeys = new Set(['enemiesData', 'alliesData']);
// Arrays that are pure logs or command sequences and should always be concatenated, duplicates included.
const arrayConcatKeys = new Set([
    'items_and_stat_calculations', 
    'combatLogEntries', 
    'NPCsRenameData', 
    'equipmentChanges', 
    'moveInventoryItems',
    'removeInventoryItems',
    'NPCJournals'
]);

export const deepMergeResponses = (target: any, source: any): any => {
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            const sourceValue = source[key];
            const targetValue = output[key];

            if (sourceValue === undefined) {
                return;
            }
            if (sourceValue === null) {
                if (targetValue !== null && targetValue !== undefined) {
                    return;
                }
                output[key] = null;
                return;
            }

            if (Array.isArray(sourceValue)) {
                if (Array.isArray(targetValue)) {
                    // --- New Array Merging Logic ---
                    if (arrayReplaceKeys.has(key)) {
                        // 1. Absolute replacement for state arrays like combatants.
                        output[key] = sourceValue;
                    } else if (arrayConcatKeys.has(key)) {
                        // 2. Simple concatenation for logs where duplicates and order matter.
                        output[key] = targetValue.concat(sourceValue);
                    } else if (sourceValue.every(item => typeof item !== 'object' || item === null)) {
                         // 3. Primitives (strings, numbers): Union to remove duplicates.
                         const combined = targetValue.concat(sourceValue);
                         output[key] = [...new Set(combined.filter(item => item !== null && item !== undefined))];
                    } else {
                        // 4. Objects: Check for an intelligent merge configuration.
                        const mergeConfig = arrayMergeConfig[key as keyof typeof arrayMergeConfig];
                        if (mergeConfig) {
                             output[key] = mergeEntities(targetValue, sourceValue, mergeConfig.idField, mergeConfig.nameField, mergeConfig.compositeKey);
                        } else {
                            // 5. Default for other object arrays (likely command arrays): Concatenate.
                            output[key] = targetValue.concat(sourceValue);
                        }
                    }
                } else {
                    // Target is not an array, so source overwrites it.
                    output[key] = sourceValue;
                }
            } else if (isObject(sourceValue)) {
                if (isObject(targetValue)) {
                    output[key] = deepMergeResponses(targetValue, sourceValue);
                } else {
                    output[key] = sourceValue;
                }
            } else {
                output[key] = sourceValue;
            }
        });
    } else if (isObject(source)) {
        return { ...source };
    }
    
    return output;
};


type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

function mergeById<T extends Record<string, any>>(
    original: T[],
    updates: Partial<T>[],
    idField: keyof T,
    idPrefix: string,
    nameField?: keyof T
): T[] {
    const newArray = [...original];
    const originalMapById = new Map<string, number>();
    const originalMapByName = new Map<string, number>();

    original.forEach((item, index) => {
        if (item[idField]) {
            originalMapById.set(item[idField], index);
        } else if (nameField && item[nameField]) {
            originalMapByName.set(item[nameField], index);
        }
    });

    updates.forEach(update => {
        if (!isObject(update)) return;

        const updateId = update[idField];
        const updateName = nameField ? update[nameField] : undefined;
        let found = false;

        if (updateId && originalMapById.has(updateId)) {
            const index = originalMapById.get(updateId)!;
            newArray[index] = deepMergeResponses(newArray[index], update) as T;
            found = true;
        } 
        else if (updateName && originalMapByName.has(updateName)) {
            const index = originalMapByName.get(updateName)!;
            newArray[index] = deepMergeResponses(newArray[index], update) as T;
            found = true;
        }
        else if (updateName && !updateId) {
            const existingIndex = newArray.findIndex(item => item[nameField!] === updateName);
            if(existingIndex > -1){
                newArray[existingIndex] = deepMergeResponses(newArray[existingIndex], update) as T;
                found = true;
            }
        }

        if (!found) {
            const newItem = { ...update };
            if (!newItem[idField]) {
               (newItem as any)[idField] = generateId(idPrefix);
            }
            newArray.push(newItem as T);
        }
    });

    return newArray.filter(item => isObject(item));
}

const asArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.filter(item => item !== null && item !== undefined);
  return [value];
};

const experienceForLevelTransition = (level: number): number => {
    if (level < 1) return 100;
    const baseXP = 100;
    return Math.floor(baseXP * Math.pow(level, 2.5));
};

export function checkAndApplyLevelUp(pc: PlayerCharacter, t: TFunction): { pc: PlayerCharacter, logs: string[] } {
    const newPc = JSON.parse(JSON.stringify(pc));
    let leveledUp = false;
    let levelsGained = 0;
    const logs: string[] = [];

    let currentExperience = Number(newPc.experience);
    let experienceForNextLevel = Number(newPc.experienceForNextLevel);

    while (currentExperience >= experienceForNextLevel && experienceForNextLevel > 0) {
        leveledUp = true;
        levelsGained++;
        const prevLevelExp = experienceForNextLevel;
        newPc.level += 1;
        newPc.attributePoints = (newPc.attributePoints || 0) + 5;
        currentExperience -= prevLevelExp;
        
        experienceForNextLevel = experienceForLevelTransition(newPc.level);
    }

    if (leveledUp) {
        newPc.experience = currentExperience;
        newPc.experienceForNextLevel = experienceForNextLevel;
        if (levelsGained > 1) {
            logs.push(t("You have gained {levels} levels and reached Level {level}! You have {points} new attribute points to spend.", { levels: levelsGained, level: newPc.level, points: levelsGained * 5 }));
        } else {
            logs.push(t("You have reached Level {level}! You have 5 new attribute points to spend.", { level: newPc.level }));
        }
    }

    return { pc: newPc, logs };
}

function applyChangesToPlayer(
    player: PlayerCharacter,
    changes: Partial<GameResponse>,
    t: TFunction
): { player: PlayerCharacter, logs: string[] } {
    let newPlayer = JSON.parse(JSON.stringify(player));
    const logs: string[] = [];

    newPlayer.currentHealth = Math.max(0, newPlayer.currentHealth + (changes.currentHealthChange || 0));
    let totalEnergyChange = changes.currentEnergyChange || 0;
    if (changes.calculatedWeightData?.additionalEnergyExpenditure) {
        totalEnergyChange -= changes.calculatedWeightData.additionalEnergyExpenditure;
        logs.push(t('energy_lost_overload', { amount: changes.calculatedWeightData.additionalEnergyExpenditure }));
    }
    newPlayer.currentEnergy = Math.max(0, newPlayer.currentEnergy + totalEnergyChange);
    newPlayer.money += changes.moneyChange || 0;
    newPlayer.experience += changes.experienceGained || 0;

    if (changes.statsIncreased) {
        asArray(changes.statsIncreased).forEach(charName => {
            const key = `standard${charName.charAt(0).toUpperCase() + charName.slice(1)}` as keyof Characteristics;
            if (newPlayer.characteristics[key] < 100) { (newPlayer.characteristics[key] as number) += 1; }
        });
    }
    if (changes.statsDecreased) {
        asArray(changes.statsDecreased).forEach(charName => {
            const key = `standard${charName.charAt(0).toUpperCase() + charName.slice(1)}` as keyof Characteristics;
            if (newPlayer.characteristics[key] > 1) { (newPlayer.characteristics[key] as number) -= 1; }
        });
    }
    if (changes.setCharacteristics) {
        for (const charName in changes.setCharacteristics) {
            const key = `standard${charName.charAt(0).toUpperCase() + charName.slice(1)}` as keyof Characteristics;
            const value = (changes.setCharacteristics as any)[charName];
            (newPlayer.characteristics[key] as number) = Math.max(1, Math.min(100, value));
        }
    }

    const levelUpResult = checkAndApplyLevelUp(newPlayer, t);
    newPlayer = levelUpResult.pc;
    if (levelUpResult.logs.length > 0) {
        logs.push(...levelUpResult.logs);
    }
    newPlayer.levelOnPreviousTurn = newPlayer.level;

    newPlayer.inventory = mergeById(newPlayer.inventory || [], asArray(changes.inventoryItemsData), 'existedId', 'item');
    if (changes.removeInventoryItems) {
        const idsToRemove = new Set(asArray(changes.removeInventoryItems).map(i => i.removedItemId));
        newPlayer.inventory = newPlayer.inventory.filter((item: Item) => !idsToRemove.has(item.existedId!));
    }
    if (changes.updateItemTextContents) {
        asArray(changes.updateItemTextContents).forEach(update => {
            const item = newPlayer.inventory.find((i: Item) => i.existedId === update.itemId);
            if (item) {
                if (!Array.isArray(item.textContent)) item.textContent = [];
                item.textContent.unshift(update.textToAppend);
            }
        });
    }
     if (changes.itemBondLevelChanges) {
        asArray(changes.itemBondLevelChanges).forEach(change => {
            const item = newPlayer.inventory.find((i: Item) => i.existedId === change.itemId);
            if (item) item.ownerBondLevelCurrent = change.newBondLevel;
        });
    }
    if (changes.itemFateCardUnlocks) {
        asArray(changes.itemFateCardUnlocks).forEach(unlock => {
            const item = newPlayer.inventory.find((i: Item) => i.existedId === unlock.itemId);
            if (item && item.fateCards) {
                const card = item.fateCards.find(c => c.cardId === unlock.cardId);
                if (card) card.isUnlocked = true;
            }
        });
    }
    if (changes.equipmentChanges) {
        asArray(changes.equipmentChanges).forEach(change => {
            if (change.action === 'equip') {
                const item = newPlayer.inventory.find((i: Item) => i.existedId === change.itemId);
                if (item && item.requiresTwoHands) {
                    newPlayer.equippedItems.MainHand = change.itemId;
                    newPlayer.equippedItems.OffHand = change.itemId;
                } else {
                    (change.targetSlots || []).forEach(slot => {
                        newPlayer.equippedItems[slot] = change.itemId;
                    });
                }
            } else if (change.action === 'unequip') {
                 const item = newPlayer.inventory.find((i: Item) => i.existedId === change.itemId);
                if (item && item.requiresTwoHands) {
                    if (newPlayer.equippedItems.MainHand === change.itemId) newPlayer.equippedItems.MainHand = null;
                    if (newPlayer.equippedItems.OffHand === change.itemId) newPlayer.equippedItems.OffHand = null;
                } else {
                    (change.sourceSlots || []).forEach(slot => {
                        if (newPlayer.equippedItems[slot] === change.itemId) {
                            newPlayer.equippedItems[slot] = null;
                        }
                    });
                }
            }
        });
    }
    if (changes.inventoryItemsResources) {
        asArray(changes.inventoryItemsResources).forEach(change => {
            const item = newPlayer.inventory.find((i: Item) => i.existedId === change.existedId);
            if (item) {
                if(change.resource !== undefined) item.resource = change.resource;
                if(change.maximumResource !== undefined) item.maximumResource = change.maximumResource;
            }
        });
    }
    if (changes.moveInventoryItems) {
        asArray(changes.moveInventoryItems).forEach(move => {
            const item = newPlayer.inventory.find((i: Item) => i.existedId === move.movedItemId);
            if (item) {
                item.contentsPath = move.destinationContentsPath;
            }
        });
    }


    newPlayer.activeSkills = mergeById(newPlayer.activeSkills || [], asArray(changes.activeSkillChanges), 'skillName', 'skill');
    if(changes.removeActiveSkills) {
        const skillsToRemove = new Set(changes.removeActiveSkills);
        newPlayer.activeSkills = newPlayer.activeSkills.filter(s => !skillsToRemove.has(s.skillName));
    }
    if (changes.skillMasteryChanges) {
        const transformedMasteryChanges = asArray(changes.skillMasteryChanges).map(change => {
            const newMasteryData: Partial<SkillMastery> & { skillName: string } = {
                skillName: change.skillName,
            };
            if (change.newMasteryLevel !== undefined) {
                newMasteryData.currentMasteryLevel = change.newMasteryLevel;
            }
            if (change.newCurrentMasteryProgress !== undefined) {
                newMasteryData.currentMasteryProgress = change.newCurrentMasteryProgress;
            }
            if (change.newMasteryProgressNeeded !== undefined) {
                newMasteryData.masteryProgressNeeded = change.newMasteryProgressNeeded;
            }
            if (change.newMaxMasteryLevel !== undefined) {
                newMasteryData.maxMasteryLevel = change.newMaxMasteryLevel;
            }
            return newMasteryData;
        });
        newPlayer.skillMasteryData = mergeById(newPlayer.skillMasteryData || [], transformedMasteryChanges, 'skillName', 'mastery');
    }
    newPlayer.passiveSkills = mergeById(newPlayer.passiveSkills || [], asArray(changes.passiveSkillChanges), 'skillName', 'skill');
     if(changes.removePassiveSkills) {
        const skillsToRemove = new Set(changes.removePassiveSkills);
        newPlayer.passiveSkills = newPlayer.passiveSkills.filter(s => !skillsToRemove.has(s.skillName));
    }
    newPlayer.knownRecipes = mergeById(newPlayer.knownRecipes || [], asArray(changes.addOrUpdateRecipes), 'recipeName', 'recipe');
    if (changes.removeRecipes) {
        const recipesToRemove = new Set(changes.removeRecipes);
        newPlayer.knownRecipes = newPlayer.knownRecipes.filter(r => !recipesToRemove.has(r.recipeName));
    }
    
    newPlayer.playerWounds = mergeById(newPlayer.playerWounds || [], asArray(changes.playerWoundChanges), 'woundId', 'wound');
    newPlayer.activePlayerEffects = mergeById(newPlayer.activePlayerEffects || [], asArray(changes.playerActiveEffectsChanges), 'effectId', 'effect');
    newPlayer.playerCustomStates = mergeById(newPlayer.playerCustomStates || [], asArray(changes.customStateChanges), 'stateId', 'state');
    
    if (changes.playerCharacterNameChange) newPlayer.name = changes.playerCharacterNameChange;
    if (changes.playerImagePromptChange !== undefined) newPlayer.portrait = changes.playerImagePromptChange;
    if (changes.playerAppearanceChange) newPlayer.appearanceDescription = changes.playerAppearanceChange;
    if (changes.playerRaceChange) newPlayer.race = changes.playerRaceChange;
    if (changes.playerRaceDescriptionChange) newPlayer.raceDescription = changes.playerRaceDescriptionChange;
    if (changes.playerClassChange) newPlayer.class = changes.playerClassChange;
    if (changes.playerClassDescriptionChange) newPlayer.classDescription = changes.playerClassDescriptionChange;
    if (changes.playerAutoCombatSkillChange) {
        newPlayer.autoCombatSkill = changes.playerAutoCombatSkillChange === 'clear' ? null : changes.playerAutoCombatSkillChange;
    }
    if (changes.playerStealthStateChange) newPlayer.stealthState = { ...newPlayer.stealthState, ...changes.playerStealthStateChange };
    if (changes.playerEffortTrackerChange) newPlayer.effortTracker = { ...newPlayer.effortTracker, ...changes.playerEffortTrackerChange };
    
    return { player: newPlayer, logs };
}

const findNpcForUpdate = (update: { NPCId: string | null; name?: string; NPCName?: string }, npcs: NPC[]): NPC | undefined => {
    if (update.NPCId) {
        const found = npcs.find(n => n.NPCId === update.NPCId);
        if (found) return found;
    }
    const name = update.name || update.NPCName;
    if (name) {
        for (let i = npcs.length - 1; i >= 0; i--) {
            if (npcs[i].name === name) {
                return npcs[i];
            }
        }
    }
    return undefined;
};

const findFactionForUpdate = (update: { factionId: string | null, factionName?: string }, factions: Faction[]): Faction | undefined => {
    if (update.factionId) {
        const found = factions.find(f => f.factionId === update.factionId);
        if (found) return found;
    }
    if (update.factionName) {
        for (let i = factions.length - 1; i >= 0; i--) {
            if (factions[i].name === update.factionName) {
                return factions[i];
            }
        }
    }
    return undefined;
};

const applySkillChanges = (npc: NPC, change: any, isPassive: boolean) => {
    const isPassiveSkill = (skill: ActiveSkill | PassiveSkill): skill is PassiveSkill => 'masteryLevel' in skill;
    const isActiveSkill = (skill: ActiveSkill | PassiveSkill): skill is ActiveSkill => 'scalingCharacteristic' in skill;

    if (isPassive) {
        const skills = npc.passiveSkills || [];
        const passiveSkillChanges = asArray(change.skillChanges).filter(isPassiveSkill);
        let newSkills = mergeById(skills, passiveSkillChanges, 'skillName', 'skill');
        if (change.skillsToRemove) {
            const toRemove = new Set(change.skillsToRemove);
            newSkills = newSkills.filter(s => !toRemove.has(s.skillName));
        }
        npc.passiveSkills = newSkills;
    } else {
        const skills = npc.activeSkills || [];
        const activeSkillChanges = asArray(change.skillChanges).filter(isActiveSkill);
        let newSkills = mergeById(skills, activeSkillChanges, 'skillName', 'skill');
        if (change.skillsToRemove) {
            const toRemove = new Set(change.skillsToRemove);
            newSkills = newSkills.filter(s => !toRemove.has(s.skillName));
        }
        npc.activeSkills = newSkills;
    }
};

const getTurnNumber = (eventString: string): number => {
    if (typeof eventString !== 'string') return -1;
    const match = eventString.match(/^#\[(\d+)/);
    return match ? parseInt(match[1], 10) : -1;
};

export const processAndApplyResponse = (response: GameResponse, baseState: GameState, gameSettings: GameSettings | null, t: TFunction, advanceTurn: boolean, currentTurnNumber: number): { newState: GameState, logsToAdd: string[], combatLogsToAdd: string[] } => {
    if (!baseState) {
        throw new Error("processAndApplyResponse was called with a null or undefined baseState. This indicates a critical error in the game loop.");
    }
    
    const changes = JSON.parse(JSON.stringify(response)); 

    asArray(changes.questUpdates).forEach((q: Partial<Quest>) => {
        if (q.objectives) {
            q.objectives = q.objectives.map(o => ({ ...o, objectiveId: o.objectiveId || generateId('objective') }));
        }
    });

    asArray(changes.NPCsData).forEach((npc: Partial<NPC>) => {
        if (npc.inventory) {
            npc.inventory = npc.inventory.map(i => ({ ...i, existedId: i.existedId || generateId('item') }));
        }
        if (npc.customStates) {
            npc.customStates = npc.customStates.map(s => ({ ...s, stateId: s.stateId || generateId('state') }));
        }
        if (npc.fateCards) {
            npc.fateCards = npc.fateCards.map(c => ({ ...c, cardId: c.cardId || generateId('fate') }));
        }
        if (npc.unlockedMemories) {
            npc.unlockedMemories = npc.unlockedMemories.map(m => ({ ...m, memoryId: m.memoryId || generateId('memory') }));
        }
        if (npc.wounds) {
            npc.wounds = npc.wounds.map(w => ({ ...w, woundId: w.woundId || generateId('wound') }));
        }
        if (npc.activeEffects) {
            npc.activeEffects = npc.activeEffects.map(e => ({ ...e, effectId: e.effectId || generateId('effect') }));
        }
    });
    
    asArray(changes.factionDataChanges).forEach((faction: Partial<Faction>) => {
        if (faction.structuredBonuses) {
            faction.structuredBonuses = faction.structuredBonuses.map(b => ({ ...b, bonusId: b.bonusId || generateId('bonus') }));
        }
        if (faction.customStates) {
            faction.customStates = faction.customStates.map(s => ({ ...s, stateId: s.stateId || generateId('state') }));
        }
        if (faction.activeProjects) {
            faction.activeProjects = faction.activeProjects.map(p => ({ ...p, projectId: p.projectId || generateId('project') }));
        }
        if (faction.completedProjects) {
            faction.completedProjects = faction.completedProjects.map(p => ({ ...p, projectId: p.projectId || generateId('project') }));
        }
    });

    const processLocationForIds = (loc: Partial<Location>) => {
        if (!loc) return loc;
        if (loc.locationStorages) {
            loc.locationStorages = (loc.locationStorages as Partial<LocationStorage>[]).map(s => ({ ...s, storageId: s.storageId || generateId('storage') }) as LocationStorage);
        }
        if (loc.activeThreats) {
            loc.activeThreats = (loc.activeThreats as Partial<ActiveThreat>[]).map(t => ({ ...t, threatId: t.threatId || generateId('threat') }) as ActiveThreat);
        }
        return loc;
    };
    
    if (changes.currentLocationData) {
        changes.currentLocationData = processLocationForIds(changes.currentLocationData);
    }
    if (changes.worldMapUpdates) {
        if (changes.worldMapUpdates.newLocations) {
            changes.worldMapUpdates.newLocations = changes.worldMapUpdates.newLocations.map(l => processLocationForIds(l));
        }
        if (changes.worldMapUpdates.locationUpdates) {
            changes.worldMapUpdates.locationUpdates = changes.worldMapUpdates.locationUpdates.map(u => processLocationForIds(u));
        }
    }
    
    let newState: GameState = JSON.parse(JSON.stringify(baseState));
    const logsToAdd: string[] = [];
    const combatLogsToAdd = asArray(response.combatLogEntries);

    if (changes.currentLocationData) {
        newState.currentLocationData = deepMergeResponses(newState.currentLocationData, changes.currentLocationData) as Location;

        if (changes.currentLocationData.lastEventsDescription) {
            const oldEvents = baseState.currentLocationData?.eventDescriptions || [];
            // Prepend the new event description to ensure the latest event is always first.
            newState.currentLocationData.eventDescriptions = [changes.currentLocationData.lastEventsDescription, ...oldEvents];
        }
        
        if (!newState.currentLocationData.locationId) {
            newState.currentLocationData.locationId = generateId('loc');
        }
        
        if (changes.currentLocationData.locationStorages) {
            newState.currentLocationData.locationStorages = changes.currentLocationData.locationStorages;
        }
    }

    if (changes.NPCsInScene !== undefined) {
        newState.NPCsInScene = changes.NPCsInScene;
    } else {
        if (newState.encounteredNPCs && newState.currentLocationData) {
            const npcsInCurrentLocation = newState.encounteredNPCs.some(npc => npc && npc.currentLocationId === newState.currentLocationData.locationId);
            newState.NPCsInScene = npcsInCurrentLocation;
        } else {
            newState.NPCsInScene = false;
        }
    }

    const activePlayerIndex = newState.activePlayerIndex;
    if (newState.players && newState.players[activePlayerIndex]) {
        newState.players[activePlayerIndex] = newState.playerCharacter;
        
        const { player: updatedActivePlayer, logs: activePlayerLogs } = applyChangesToPlayer(newState.players[activePlayerIndex], changes, t);
        newState.players[activePlayerIndex] = updatedActivePlayer;
        newState.playerCharacter = updatedActivePlayer;
        logsToAdd.push(...activePlayerLogs);
    } else {
        console.error("No active player character found during response processing.");
    }

    if (changes.otherPlayersInteractions) {
        for (const playerId in changes.otherPlayersInteractions) {
            if (playerId === newState.playerCharacter.playerId) continue;

            const playerIndex = newState.players.findIndex(p => p.playerId === playerId);
            if (playerIndex > -1) {
                const commands = changes.otherPlayersInteractions[playerId];
                const mergedChanges: Partial<GameResponse> = commands.reduce((acc: any, command: any) => ({ ...acc, ...command }), {});
                
                const { player: updatedOtherPlayer, logs: otherPlayerLogs } = applyChangesToPlayer(newState.players[playerIndex], mergedChanges, t);
                newState.players[playerIndex] = updatedOtherPlayer;
                logsToAdd.push(...otherPlayerLogs);
            }
        }
    }
  
    if (changes.plotOutline) newState.plotOutline = changes.plotOutline;
    if (changes.enemiesData) newState.enemiesData = changes.enemiesData;
    if (changes.alliesData) newState.alliesData = changes.alliesData;

    newState.worldStateFlags = mergeById(newState.worldStateFlags || [], asArray(changes.worldStateFlags), 'flagId', 'flag');
    newState.worldEventsLog = mergeById(newState.worldEventsLog || [], asArray(changes.worldEventsLog), 'eventId', 'event');
    
    newState.encounteredFactions = mergeById(newState.encounteredFactions || [], asArray(changes.factionDataChanges), 'factionId', 'faction');
    newState.encounteredFactions = newState.encounteredFactions.map(faction => {
        if (faction && !faction.color) {
            return { ...faction, color: generateFactionColor(faction.factionId || faction.name) };
        }
        return faction;
    });

    if (changes.factionRankBranchChanges) {
        asArray(changes.factionRankBranchChanges as FactionRankBranchChange[]).forEach(change => {
            let targetFaction: Faction | undefined;
            if (change.factionId) {
                targetFaction = newState.encounteredFactions.find(f => f.factionId === change.factionId);
            } else if (change.initialFactionId) {
                // Find a newly created faction by its temporary tag. It would be in `newState.encounteredFactions` now.
                // We need to look it up from the source changes to find the one with the matching initialId.
                const newFactionData = asArray(changes.factionDataChanges).find(f => f.initialId === change.initialFactionId);
                if (newFactionData) {
                    targetFaction = newState.encounteredFactions.find(f => f.name === newFactionData.name && !f.factionId); // Heuristic for new factions
                    if (targetFaction) {
                        // The `newFactionData` has the real ID now, if mergeById assigned one. Let's make sure it's consistent.
                         if (!targetFaction.factionId && newFactionData.factionId) {
                           targetFaction.factionId = newFactionData.factionId;
                        }
                    }
                }
            }

            if (targetFaction) {
                if (!targetFaction.ranks) targetFaction.ranks = { branches: [] };
                let branches = targetFaction.ranks.branches || [];

                // Process removals first
                if (change.branchesToRemove) {
                    const idsToRemove = new Set(change.branchesToRemove);
                    branches = branches.filter(b => !idsToRemove.has(b.branchId));
                }
                if (change.ranksToRemove) {
                    change.ranksToRemove.forEach(removal => {
                        const branch = branches.find(b => b.branchId === removal.targetBranchId);
                        if (branch) {
                            branch.ranks = branch.ranks.filter(r => r.rankNameMale !== removal.rankIdentifier && r.rankNameFemale !== removal.rankIdentifier);
                        }
                    });
                }

                // Process additions
                if (change.branchesToAdd) {
                    branches = [...branches, ...(change.branchesToAdd as FactionRankBranch[])];
                }
                if (change.ranksToAdd) {
                    change.ranksToAdd.forEach(addition => {
                        const branch = branches.find(b => b.branchId === addition.targetBranchId);
                        if (branch) {
                            branch.ranks.push(addition.rank);
                            branch.ranks.sort((a, b) => a.requiredReputation - b.requiredReputation);
                        }
                    });
                }

                // Process updates
                if (change.branchesToUpdate) {
                    change.branchesToUpdate.forEach(update => {
                        const branch = branches.find(b => b.branchId === update.branchId);
                        if (branch && update.newDisplayName) {
                            branch.displayName = update.newDisplayName;
                        }
                    });
                }
                if (change.ranksToUpdate) {
                    change.ranksToUpdate.forEach(update => {
                        const branch = branches.find(b => b.branchId === update.targetBranchId);
                        if (branch) {
                            const rankIndex = branch.ranks.findIndex(r => r.rankNameMale === update.rankIdentifier || r.rankNameFemale === update.rankIdentifier);
                            if (rankIndex > -1) {
                                const oldRank = branch.ranks[rankIndex];
                                const updatedRank = {
                                    ...oldRank,
                                    rankNameMale: update.update.newRankNameMale ?? oldRank.rankNameMale,
                                    rankNameFemale: update.update.newRankNameFemale ?? oldRank.rankNameFemale,
                                    requiredReputation: update.update.newRequiredReputation ?? oldRank.requiredReputation,
                                    unlockCondition: update.update.newUnlockCondition ?? oldRank.unlockCondition,
                                    benefits: update.update.newBenefits ?? oldRank.benefits,
                                    isJunctionPoint: update.update.newIsJunctionPoint ?? oldRank.isJunctionPoint,
                                    availableBranches: update.update.newAvailableBranches ?? oldRank.availableBranches,
                                };
                                branch.ranks[rankIndex] = updatedRank;
                            }
                        }
                    });
                }

                targetFaction.ranks.branches = branches;
            }
        });
    }


    asArray(changes.factionChronicleUpdates).forEach(update => {
        const faction = findFactionForUpdate(update, newState.encounteredFactions);
        if (faction) {
            if (!faction.scribeChronicle) faction.scribeChronicle = [];
            faction.scribeChronicle.unshift(update.entryToAppend);
        }
    });

    asArray(changes.factionBonusChanges).forEach(change => {
        const faction = findFactionForUpdate(change, newState.encounteredFactions);
        if (faction) {
            let bonuses = faction.structuredBonuses || [];
            if (change.bonusesToRemove) {
                const idsToRemove = new Set(change.bonusesToRemove);
                bonuses = bonuses.filter(b => !b.bonusId || !idsToRemove.has(b.bonusId));
            }
            if (change.bonusesToAddOrUpdate) {
                bonuses = mergeById(bonuses, asArray(change.bonusesToAddOrUpdate), 'bonusId', 'facbonus');
            }
            faction.structuredBonuses = bonuses;
        }
    });

    asArray(changes.factionResourceChanges).forEach(change => {
        const faction = findFactionForUpdate(change, newState.encounteredFactions);
        if (faction?.resources) {
            asArray(change.resourceChanges).forEach(resChange => {
                let resource = faction.resources!.metaResources.find(r => r.resourceName === resChange.resourceName);
                if (resource) resource.currentStockpile += resChange.changeAmount;
                else {
                    let strategicGood = faction.resources!.strategicGoods.find(g => g.resourceName === resChange.resourceName);
                    if (strategicGood) strategicGood.currentStockpile += resChange.changeAmount;
                }
            });
        }
    });

    asArray(changes.factionCustomStateChanges).forEach(change => {
        const faction = findFactionForUpdate(change, newState.encounteredFactions);
        if (faction) {
            faction.customStates = mergeById(faction.customStates || [], asArray(change.statesToAddOrUpdate), 'stateId', 'facstate');
            if(change.statesToRemove) {
                const idsToRemove = new Set(change.statesToRemove);
                faction.customStates = faction.customStates.filter(s => !s.stateId || !idsToRemove.has(s.stateId));
            }
        }
    });

    const npcUpdates = asArray(changes.NPCsData).map(update => {
        const newUpdate = { ...update } as Partial<NPC>;
        if (typeof newUpdate.currentHealth === 'string') newUpdate.currentHealth = parseInt(newUpdate.currentHealth, 10) || 0;
        if (typeof newUpdate.maxHealth === 'string') newUpdate.maxHealth = parseInt(newUpdate.maxHealth, 10) || 100;
        return newUpdate;
    });

    npcUpdates.forEach(update => {
        if (update.NPCId && newState.encounteredNPCs.some(npc => npc.NPCId === update.NPCId)) {
            if (update.inventory !== undefined) {
                console.warn(`[SAFEGUARD] Ignored 'inventory' array in NPCsData update for existing NPC ${update.NPCId}. Use atomic inventory commands instead.`);
                delete update.inventory;
            }
        }
    });

    newState.encounteredNPCs = mergeById(newState.encounteredNPCs || [], npcUpdates, 'NPCId', 'npc');
    newState.encounteredNPCs.forEach(npc => {
        if (npc && npc.inventory && !Array.isArray(npc.inventory)) {
            console.warn(`[SAFEGUARD] Correcting malformed non-array inventory for NPC ${npc.name}. Inventory was:`, npc.inventory);
            npc.inventory = [];
        }
    });

    if (newState.NPCsInScene) {
        newState.encounteredNPCs.forEach(npc => {
            if (npc.name && npcUpdates.some(u => u.name === npc.name && u.currentLocationId === undefined)) {
                npc.currentLocationId = newState.currentLocationData.locationId;
            }
        });
    }
    
    if (newState.currentLocationData.initialId) {
        newState.encounteredNPCs.forEach(npc => {
            if (npc.initialLocationId === newState.currentLocationData.initialId) {
                npc.currentLocationId = newState.currentLocationData.locationId;
            }
        });
    }

    asArray(changes.NPCsRenameData).forEach(rename => {
        const npc = newState.encounteredNPCs.find(n => n.name === rename.oldName);
        if (npc) npc.name = rename.newName;
    });

    asArray(changes.NPCRelationshipChanges).forEach(change => {
        const npc = findNpcForUpdate(change, newState.encounteredNPCs);
        if(npc) {
            npc.relationshipLevel = change.newRelationshipLevel;
            if (change.changeReason) npc.lastRelationshipChangeReason = change.changeReason;
        }
    });

    asArray(changes.NPCJournals).forEach(update => {
        const npc = findNpcForUpdate(update, newState.encounteredNPCs);
        if(npc) {
            if(!npc.journalEntries) npc.journalEntries = [];
            npc.journalEntries.unshift(update.lastJournalNote);
            if(gameSettings?.keepLatestNpcJournals) {
                npc.journalEntries = npc.journalEntries.slice(0, gameSettings.latestNpcJournalsCount);
            }
        }
    });

    asArray(changes.NPCUnlockedMemories).forEach(memory => {
        const npc = findNpcForUpdate(memory, newState.encounteredNPCs);
        if (npc) {
            if(!npc.unlockedMemories) npc.unlockedMemories = [];
            npc.unlockedMemories.push(memory as UnlockedMemory);
        }
    });
    
    asArray(changes.NPCFateCardUnlocks).forEach(unlock => {
        const npc = findNpcForUpdate(unlock, newState.encounteredNPCs);
        if (npc?.fateCards) {
            const card = npc.fateCards.find(c => c.cardId === unlock.cardId);
            if(card) card.isUnlocked = true;
        }
    });

    if (changes.itemJournalUpdates) {
        asArray(changes.itemJournalUpdates).forEach(update => {
            let foundItem: Item | null = null;
    
            for (const player of newState.players) {
                if (!player.inventory) continue;
                if (update.itemId) {
                    const item = player.inventory.find(i => i.existedId === update.itemId);
                    if (item) {
                        foundItem = item;
                        break;
                    }
                }
            }
            if (!foundItem) {
                for (const player of newState.players) {
                    if (!player.inventory) continue;
                    if (update.itemName) {
                        const item = player.inventory.find(i => i.name === update.itemName);
                        if (item) {
                            foundItem = item;
                            break;
                        }
                    }
                }
            }
            
            if (!foundItem) {
                for (const npc of newState.encounteredNPCs) {
                    if (!npc.inventory) continue;
                    if (update.itemId) {
                        const item = npc.inventory.find(i => i.existedId === update.itemId);
                        if (item) {
                            foundItem = item;
                            break;
                        }
                    }
                }
            }
            if (!foundItem) {
                for (const npc of newState.encounteredNPCs) {
                    if (!npc.inventory) continue;
                    if (update.itemName) {
                         const item = npc.inventory.find(i => i.name === update.itemName);
                        if (item) {
                            foundItem = item;
                            break;
                        }
                    }
                }
            }
    
            if (foundItem) {
                if (!Array.isArray(foundItem.journalEntries)) {
                    foundItem.journalEntries = [];
                }
                foundItem.journalEntries.unshift(update.entryToAppend);
            } else {
                console.warn(`Could not find item for journal update:`, update);
            }
        });
    }

    asArray(changes.NPCWoundChanges).forEach(woundUpdate => {
        const npc = findNpcForUpdate(woundUpdate, newState.encounteredNPCs);
        if(npc) npc.wounds = mergeById(npc.wounds || [], [woundUpdate], 'woundId', 'wound');
    });

    asArray(changes.NPCEffectChanges).forEach(effectChange => {
        const npc = findNpcForUpdate(effectChange, newState.encounteredNPCs);
        if(npc) npc.activeEffects = mergeById(npc.activeEffects || [], effectChange.effectsApplied, 'effectId', 'effect');
    });
    
    asArray(changes.NPCCustomStateChanges).forEach(stateChange => {
        const npc = findNpcForUpdate(stateChange, newState.encounteredNPCs);
        if (npc) npc.customStates = mergeById(npc.customStates || [], stateChange.stateChanges, 'stateId', 'npcstate');
    });

    asArray(changes.NPCInventoryAdds).forEach(add => {
        const npc = findNpcForUpdate(add, newState.encounteredNPCs);
        if(npc) {
            if (!npc.inventory) npc.inventory = [];
            const newItem = { ...add.item };
            if (!newItem.existedId) newItem.existedId = generateId('item');
            if (add.destinationContainerId) {
                const container = npc.inventory.find(i => i.existedId === add.destinationContainerId);
                if (container) newItem.contentsPath = container.contentsPath ? [...container.contentsPath, container.name] : [container.name];
            }
            npc.inventory.push(newItem as Item);
        }
    });

    asArray(changes.NPCInventoryUpdates).forEach(update => {
        const npc = findNpcForUpdate(update, newState.encounteredNPCs);
        if(npc) {
            const itemIndex = npc.inventory.findIndex(i => i.existedId === update.itemUpdate.existedId);
            if(itemIndex > -1) npc.inventory[itemIndex] = { ...npc.inventory[itemIndex], ...update.itemUpdate };
        }
    });
    
    asArray(changes.NPCInventoryRemovals).forEach(removal => {
        const npc = findNpcForUpdate(removal, newState.encounteredNPCs);
        if (npc && npc.inventory) {
            const itemIndex = npc.inventory.findIndex(i => i.existedId === removal.itemId);
            if (itemIndex > -1) {
                const [removedItem] = npc.inventory.splice(itemIndex, 1);

                if (npc.progressionType === 'Companion') {
                    if (!newState.temporaryStash) {
                        newState.temporaryStash = [];
                    }
                    if (!newState.temporaryStash.find(i => i.existedId === removedItem.existedId)) {
                        const itemForStash = { ...removedItem, contentsPath: null };
                        newState.temporaryStash.push(itemForStash);
                    }
                    logsToAdd.push(t('item_moved_to_stash_from_npc', { itemName: removedItem.name, npcName: npc.name }));
                }
            }
        }
    });

    asArray(changes.NPCEquipmentChanges).forEach(change => {
        const npc = findNpcForUpdate(change, newState.encounteredNPCs);
        if(npc) {
            if(!npc.equippedItems) npc.equippedItems = {};
            if(change.action === 'equip') {
                (change.targetSlots || []).forEach(slot => npc.equippedItems![slot] = change.itemId);
            } else {
                (change.sourceSlots || []).forEach(slot => { if(npc.equippedItems![slot] === change.itemId) npc.equippedItems![slot] = null; });
            }
        }
    });

     asArray(changes.NPCInventoryResourcesChanges).forEach(change => {
        const npc = findNpcForUpdate(change, newState.encounteredNPCs);
        if (npc) {
            const item = npc.inventory.find(i => i.existedId === change.itemId);
            if (item) item.resource = change.newResourceValue;
        }
    });

    asArray(changes.NPCActiveSkillChanges).forEach(change => {
        const npc = findNpcForUpdate(change, newState.encounteredNPCs);
        if(npc) applySkillChanges(npc, change, false);
    });
    asArray(changes.NPCPassiveSkillChanges).forEach(change => {
        const npc = findNpcForUpdate(change, newState.encounteredNPCs);
        if(npc) applySkillChanges(npc, change, true);
    });
    asArray(changes.NPCSkillMasteryChanges).forEach(change => {
        const npc = findNpcForUpdate(change, newState.encounteredNPCs);
        if (npc) {
            if (!npc.skillMasteryData) npc.skillMasteryData = [];
            const transformedMasteryChange: Partial<SkillMastery> & { skillName: string } = {
                skillName: change.skillName,
            };
            if (change.newMasteryLevel !== undefined) {
                transformedMasteryChange.currentMasteryLevel = change.newMasteryLevel;
            }
            if (change.newCurrentMasteryProgress !== undefined) {
                transformedMasteryChange.currentMasteryProgress = change.newCurrentMasteryProgress;
            }
            if (change.newMasteryProgressNeeded !== undefined) {
                transformedMasteryChange.masteryProgressNeeded = change.newMasteryProgressNeeded;
            }
            if (change.newMaxMasteryLevel !== undefined) {
                transformedMasteryChange.maxMasteryLevel = change.newMaxMasteryLevel;
            }
            npc.skillMasteryData = mergeById(npc.skillMasteryData, [transformedMasteryChange], 'skillName', 'mastery');
        }
    });
    asArray(changes.NPCPassiveSkillMasteryChanges).forEach(change => {
        const npc = findNpcForUpdate(change, newState.encounteredNPCs);
        if (npc && npc.passiveSkills) {
            const skill = npc.passiveSkills.find(s => s.skillName === change.skillName);
            if (skill) {
                if (change.newMasteryLevel !== undefined) skill.masteryLevel = change.newMasteryLevel;
                if (change.newMaxMasteryLevel !== undefined) skill.maxMasteryLevel = change.newMaxMasteryLevel;
            }
        }
    });

    asArray(changes.NPCActivityUpdates).forEach(update => {
        const npc = findNpcForUpdate(update, newState.encounteredNPCs);
        if (npc) {
            if (!npc.currentActivity) {
                npc.currentActivity = update.activityUpdate as any;
            } else {
                npc.currentActivity = deepMergeResponses(npc.currentActivity, update.activityUpdate);
            }
        }
    });

    asArray(changes.factionProjectUpdates).forEach(update => {
        const faction = findFactionForUpdate(update, newState.encounteredFactions);
        if (faction && faction.activeProjects) {
            const projectIndex = faction.activeProjects.findIndex(p => p.projectId === update.projectUpdate.projectId);
            if (projectIndex > -1) {
                faction.activeProjects[projectIndex] = deepMergeResponses(faction.activeProjects[projectIndex], update.projectUpdate) as Project;
            }
        }
    });
    
    asArray(changes.completeNPCActivities).forEach(completion => {
        const npc = findNpcForUpdate(completion, newState.encounteredNPCs);
        if (npc && npc.currentActivity?.activityName === completion.activityName) {
            const completedActivity: CompletedActivity = {
                activityName: npc.currentActivity.activityName,
                completionTurn: currentTurnNumber,
                finalOutcome: completion.finalState === 'Completed' ? 'Success' : 'Failure',
                narrativeSummary: completion.narrativeSummary,
            };
            if (!npc.completedActivities) npc.completedActivities = [];
            npc.completedActivities.unshift(completedActivity);
            npc.currentActivity = null;
        }
    });

    asArray(changes.completeFactionProjects).forEach(completion => {
        const faction = findFactionForUpdate(completion, newState.encounteredFactions);
        if (faction && faction.activeProjects) {
            const projectIndex = faction.activeProjects.findIndex(p => p.projectId === completion.projectId);
            if (projectIndex > -1) {
                const [projectToComplete] = faction.activeProjects.splice(projectIndex, 1);
                const completedProject: CompletedProject = {
                    projectId: projectToComplete.projectId,
                    projectName: projectToComplete.projectName,
                    completionTurn: currentTurnNumber,
                    finalState: completion.finalState,
                };
                if (!faction.completedProjects) faction.completedProjects = [];
                faction.completedProjects.unshift(completedProject);
            }
        }
    });
    
    newState.activeQuests = mergeById(newState.activeQuests || [], asArray(changes.questUpdates).filter(q => q.status === 'Active' || q.status === 'Updated'), 'questId', 'quest');
    const completedOrFailedQuests = asArray(changes.questUpdates).filter(q => q.status === 'Completed' || q.status === 'Failed');
    if (completedOrFailedQuests.length > 0) {
        const completedIds = new Set(completedOrFailedQuests.map(q => q.questId));
        newState.activeQuests = newState.activeQuests.filter(q => !completedIds.has(q.questId!));
        newState.completedQuests = mergeById(newState.completedQuests || [], completedOrFailedQuests, 'questId', 'quest');
    }

    const updatedActiveQuests = [...newState.activeQuests];
    const updatedCompletedQuests = [...newState.completedQuests];
    asArray(changes.questUpdates).forEach((update: QuestUpdate) => {
        if (update.newDetailsLogEntry && update.questId) {
            let questFound = false;
            const activeIndex = updatedActiveQuests.findIndex(q => q.questId === update.questId);
            if (activeIndex > -1) {
                const existingQuest = updatedActiveQuests[activeIndex];
                const newDetailsLog = [...(existingQuest.detailsLog || []), update.newDetailsLogEntry];
                updatedActiveQuests[activeIndex] = { ...existingQuest, detailsLog: newDetailsLog };
                questFound = true;
            }
            if (!questFound) {
                const completedIndex = updatedCompletedQuests.findIndex(q => q.questId === update.questId);
                if (completedIndex > -1) {
                    const existingQuest = updatedCompletedQuests[completedIndex];
                    const newDetailsLog = [...(existingQuest.detailsLog || []), update.newDetailsLogEntry];
                    updatedCompletedQuests[completedIndex] = { ...existingQuest, detailsLog: newDetailsLog };
                }
            }
        }
    });

    newState.players = newState.players.map(p => {
        if (!p) return null;
        let updatedP = recalculateAllWeights(p);
        return recalculateDerivedStats(updatedP);
    }).filter((p): p is PlayerCharacter => !!p);
    
    newState.playerCharacter = newState.players[newState.activePlayerIndex];

    newState.encounteredNPCs = newState.encounteredNPCs.map(n => {
        if (!n) return null;
        let updatedN = recalculateAllWeights(n);
        return recalculateDerivedStats(updatedN);
    }).filter((n): n is NPC => !!n);

    newState.networkRole = baseState.networkRole;
    newState.myPeerId = baseState.myPeerId;
    newState.hostPeerId = baseState.hostPeerId;
    newState.peers = baseState.peers;
    newState.isConnectedToHost = baseState.isConnectedToHost;

    return { newState, logsToAdd, combatLogsToAdd };
};