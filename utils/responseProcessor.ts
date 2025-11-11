import { GameState, GameResponse, PlayerCharacter, Characteristics, GameSettings, Quest, Location, Item, NPC, Faction, ActiveSkill, PassiveSkill, SkillMastery, Wound, CustomState, WorldStateFlag, WorldEvent, Recipe, QuestUpdate, FactionChronicleUpdate, FactionBonusChange, FactionResourceChange, StructuredBonus, FactionCustomStateChange, UnlockedMemory, AdjacencyMapEntry, CompletedActivity, LocationStorage, ActiveThreat, Project, CompletedProject, FactionRankBranchChange, FactionRankBranch, NPCSkillChange, FactionRank, Effect, CompleteThreatActivity, NPCSkillMasteryChange, NPCPassiveSkillMasteryChange, EnemyCombatObject, AllyCombatObject } from '../types';
import { recalculateAllWeights } from './inventoryManager';
import { recalculateDerivedStats } from './gameContext';
import { generateFactionColor } from './colorUtils';

type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

const isObject = (item: any): item is object => {
    return (item && typeof item === 'object' && !Array.isArray(item));
};

const asArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.filter(item => item !== null && item !== undefined);
  return [value];
};

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const arrayMergeConfig: Record<string, { idField: string, nameField?: string, compositeKey?: (item: any) => string }> = {
    players: { idField: 'playerId' },
    activeQuests: { idField: 'questId', nameField: 'questName' },
    completedQuests: { idField: 'questId', nameField: 'questName' },
    questUpdates: { idField: 'questId', nameField: 'questName' },
    encounteredNPCs: { idField: 'NPCId', nameField: 'name' },
    NPCsData: { idField: 'NPCId', nameField: 'name' },
    NPCRelationshipChanges: { idField: 'NPCId', nameField: 'NPCName' },
    NPCJournals: { idField: 'NPCId', nameField: 'NPCName' },
    NPCEffectChanges: { idField: 'NPCId', nameField: 'NPCName' },
    NPCWoundChanges: { idField: 'NPCId', nameField: 'NPCName' },
    NPCCustomStateChanges: { idField: 'NPCId', nameField: 'NPCName' },
    NPCActivityUpdates: { idField: 'NPCId', nameField: 'NPCName' },
    inventoryItemsData: { idField: 'existedId', nameField: 'name' },
    inventory: { idField: 'existedId', nameField: 'name' },
    moveInventoryItems: { idField: 'movedItemId', nameField: 'itemName' },
    itemJournalUpdates: { idField: 'itemId', nameField: 'itemName' },
    encounteredFactions: { idField: 'factionId', nameField: 'name' },
    factionDataChanges: { idField: 'factionId', nameField: 'name' },
    skillMasteryChanges: { idField: 'skillName' },
    skillMasteryData: { idField: 'skillName' },
    activeProjects: { idField: 'projectId', nameField: 'projectName' },
    completedProjects: { idField: 'projectId', nameField: 'projectName' },
    worldEventsLog: { idField: 'eventId', nameField: 'headline' },
    customStateChanges: { idField: 'stateId', nameField: 'stateName' },
    playerCustomStates: { idField: 'stateId', nameField: 'stateName' },
    customStates: { idField: 'stateId', nameField: 'stateName' },
    thresholds: { idField: 'levelName' },
    playerWounds: { idField: 'woundId', nameField: 'woundName' },
    wounds: { idField: 'woundId', nameField: 'woundName' },
    unlockedMemories: { idField: 'memoryId', nameField: 'title' },
    'ranks.branches': { idField: 'branchId', nameField: 'displayName' },
    ranks: { idField: '', nameField: 'rankNameMale' },
    objectives: { idField: 'objectiveId' },
    completedActivities: { idField: '', compositeKey: (item: any) => `${item.activityName}_${item.completionTurn}` },
    activeSkills: { idField: 'skillName' },
    passiveSkills: { idField: 'skillName' },
    activeThreats: { idField: 'threatId', nameField: 'name' },
    activePlayerEffects: { idField: 'effectId' },
    activeEffects: { idField: 'effectId' },
    adjacencyMap: { idField: '', compositeKey: (item: any) => `${item.targetCoordinates.x},${item.targetCoordinates.y}` },
    worldStateFlags: { idField: 'flagId', nameField: 'displayName' },
    locationStorages: { idField: 'storageId' },
};

const arrayReplaceKeys = new Set([
    'enemiesData', 
    'alliesData', 
    'generatedEffects', 
    'canBeImprovedBy', 
    'bonuses', 
    'structuredBonuses', 
    'effects',
    'combatEffect',
    'equipmentSlot',
    'disassembleTo',
    'dialogueOptions',
    'multipliers',
    'temporaryStash',
    'tags',
    'customProperties',
    'affectedFactions',
    'affectedLocations',
    'involvedNPCs',
    'months',
    'dayNames',
    'contentsPath',
    'activeSkillSortOrder',
    'passiveSkillSortOrder',
    'itemSortOrder',
    'personalNpcReputations',
    'personalFactionReputations',
    'items',
    'metaResources',
    'strategicGoods',
    'factionAffiliations',
    'relations',
    'factionControl',
    'controlledTerritories',
    'fateCards',
    'associatedEffects',
    'eventDescriptions'
]);

const arrayConcatKeys = new Set(['combatLogEntries', 'gameLog', 'detailsLog', 'scribeChronicle', 'journalEntries', 'textContent']);

const mergeById = (arr1: any[], arr2: any[], idField: string, nameField?: string, compositeKey?: (item: any) => string) => {
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

export const deepMergeResponses = (target: any, source: any): any => {
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            const sourceValue = source[key];
            const targetValue = output[key];

            if (sourceValue === null || sourceValue === undefined) {
                return;
            }

            if (Array.isArray(sourceValue)) {
                if (Array.isArray(targetValue)) {
                    if (arrayReplaceKeys.has(key)) {
                        output[key] = sourceValue;
                    } else if (arrayConcatKeys.has(key)) {
                        output[key] = targetValue.concat(sourceValue);
                    } else if (sourceValue.every(item => typeof item !== 'object' || item === null)) {
                         const combined = targetValue.concat(sourceValue);
                         output[key] = [...new Set(combined.filter(item => item !== null && item !== undefined))];
                    } else {
                        const mergeConfig = arrayMergeConfig[key as keyof typeof arrayMergeConfig];
                        if (mergeConfig) {
                             output[key] = mergeById(targetValue, sourceValue, mergeConfig.idField, mergeConfig.nameField, mergeConfig.compositeKey);
                        } else {
                            output[key] = targetValue.concat(sourceValue);
                        }
                    }
                } else {
                    output[key] = sourceValue;
                }
            } else if (isObject(sourceValue)) {
                output[key] = isObject(targetValue) ? deepMergeResponses(targetValue, sourceValue) : sourceValue;
            } else {
                output[key] = sourceValue;
            }
        });
    } else if (isObject(source)) {
        return { ...source };
    }
    
    return output;
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

function preProcessAndAssignIds(response: GameResponse, currentState: GameState): GameResponse {
    const mutableResponse = response;

    // Safeguard against overwriting full NPC inventories with partial data.
    if (mutableResponse.NPCsData) {
        mutableResponse.NPCsData = asArray(mutableResponse.NPCsData).map((npcUpdate: Partial<NPC>) => {
            if (npcUpdate.NPCId && currentState.encounteredNPCs.some(n => n.NPCId === npcUpdate.NPCId)) {
                if (npcUpdate.inventory) {
                    console.warn(`[SAFEGUARD] An 'inventory' array was provided for an existing NPC ('${npcUpdate.name || npcUpdate.NPCId}'). This is a deprecated and dangerous operation. The inventory update for this NPC will be ignored to prevent data loss. Use atomic commands (NPCInventoryAdds, etc.) instead.`);
                    delete npcUpdate.inventory;
                }
            }
            return npcUpdate;
        });
    }

    const assignIdIfNeeded = (items: any[] | undefined | null, idField: string, prefix: string) => {
        asArray(items).forEach(item => {
            if (item && (item[idField] === null || item[idField] === undefined)) {
                item[idField] = generateId(prefix);
            }
        });
    };

    // Top-level entities that need IDs
    assignIdIfNeeded(asArray(mutableResponse.inventoryItemsData), 'existedId', 'item');
    assignIdIfNeeded(asArray(mutableResponse.questUpdates), 'questId', 'quest');
    assignIdIfNeeded(asArray(mutableResponse.NPCsData), 'NPCId', 'npc');
    assignIdIfNeeded(asArray(mutableResponse.factionDataChanges), 'factionId', 'faction');
    assignIdIfNeeded(asArray(mutableResponse.worldEventsLog), 'eventId', 'event');
    assignIdIfNeeded(asArray(mutableResponse.playerWoundChanges), 'woundId', 'wound');
    assignIdIfNeeded(asArray(mutableResponse.playerActiveEffectsChanges), 'effectId', 'effect');
    assignIdIfNeeded(asArray(mutableResponse.customStateChanges), 'stateId', 'state');
    assignIdIfNeeded(asArray(mutableResponse.worldStateFlags), 'flagId', 'flag');

    // Nested entities
    asArray(mutableResponse.questUpdates).forEach(quest => {
        assignIdIfNeeded(quest.objectives, 'objectiveId', 'obj');
    });

    asArray(mutableResponse.NPCsData).forEach(npc => {
        assignIdIfNeeded(asArray(npc.inventory), 'existedId', 'item');
        assignIdIfNeeded(npc.customStates, 'stateId', 'state');
        assignIdIfNeeded(npc.fateCards, 'cardId', 'fate');
        assignIdIfNeeded(npc.unlockedMemories, 'memoryId', 'mem');
        assignIdIfNeeded(npc.wounds, 'woundId', 'wound');
        assignIdIfNeeded(npc.activeEffects, 'effectId', 'effect');
    });

    asArray(mutableResponse.factionDataChanges).forEach(faction => {
        assignIdIfNeeded(faction.structuredBonuses, 'bonusId', 'bonus');
        assignIdIfNeeded(faction.customStates, 'stateId', 'state');
        assignIdIfNeeded(faction.activeProjects, 'projectId', 'proj');
    });

    const processLocationForIds = (loc: Partial<Location>) => {
        if (!loc) return;
        assignIdIfNeeded(loc.locationStorages, 'storageId', 'storage');
        assignIdIfNeeded(loc.activeThreats, 'threatId', 'threat');
    };

    if (mutableResponse.worldMapUpdates) {
        assignIdIfNeeded(asArray(mutableResponse.worldMapUpdates.newLocations), 'locationId', 'loc');
        asArray(mutableResponse.worldMapUpdates.newLocations).forEach(processLocationForIds);
        asArray(mutableResponse.worldMapUpdates.locationUpdates).forEach(processLocationForIds);
    }
    if (mutableResponse.currentLocationData) {
        if (!mutableResponse.currentLocationData.locationId) {
            mutableResponse.currentLocationData.locationId = generateId('loc');
        }
        processLocationForIds(mutableResponse.currentLocationData);
    }

    // NPC-targeted arrays
    assignIdIfNeeded(asArray(mutableResponse.NPCWoundChanges), 'woundId', 'wound');
    asArray(mutableResponse.NPCEffectChanges).forEach(c => assignIdIfNeeded(c.effectsApplied, 'effectId', 'effect'));
    asArray(mutableResponse.NPCCustomStateChanges).forEach(c => assignIdIfNeeded(c.stateChanges, 'stateId', 'state'));

    // Sentient item journals are added via a separate command, but items in NPCInventoryAdds need IDs.
    asArray(mutableResponse.NPCInventoryAdds).forEach(add => {
        assignIdIfNeeded([add.item], 'existedId', 'item');
    });

    return mutableResponse;
}

function resolveInitialIds(obj: any, idMap: Map<string, string>) {
    if (!obj) return;

    if (Array.isArray(obj)) {
        obj.forEach(item => resolveInitialIds(item, idMap));
        return;
    }

    if (typeof obj === 'object') {
        if (obj.initialFactionId && idMap.has(obj.initialFactionId)) {
            obj.factionId = idMap.get(obj.initialFactionId);
        }
        if (obj.initialLocationId && idMap.has(obj.initialLocationId)) {
            obj.currentLocationId = idMap.get(obj.initialLocationId);
        }
        if (obj.initialTargetLocationId && idMap.has(obj.initialTargetLocationId)) {
            obj.targetLocationId = idMap.get(obj.initialTargetLocationId);
        }
        if (obj.factionRankBranchChanges) {
             asArray(obj.factionRankBranchChanges).forEach((change: any) => {
                if (change.initialFactionId && idMap.has(change.initialFactionId)) {
                    change.factionId = idMap.get(change.initialFactionId);
                }
            });
        }
        
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                resolveInitialIds(obj[key], idMap);
            }
        }
    }
}

const findNpcForUpdate = (update: { NPCId?: string | null; name?: string; NPCName?: string }, npcs: NPC[]): NPC | undefined => {
    if (update.NPCId) { const found = npcs.find(n => n.NPCId === update.NPCId); if (found) return found; }
    const name = update.name || update.NPCName;
    return name ? npcs.find(n => n.name === name) : undefined;
};

const findFactionForUpdate = (update: { factionId?: string | null, initialFactionId?: string | null, factionName?: string }, factions: Faction[]): Faction | undefined => {
    if (update.factionId) { const found = factions.find(f => f.factionId === update.factionId); if (found) return found; }
    if (update.initialFactionId) { const found = factions.find(f => f.initialId === update.initialFactionId); if (found) return found; }
    return update.factionName ? factions.find(f => f.name === update.factionName) : undefined;
};

const applySkillChanges = (npc: NPC, change: NPCSkillChange, isPassive: boolean) => {
    const skills = isPassive ? npc.passiveSkills || [] : npc.activeSkills || [];
    let newSkills = mergeById(skills, asArray(change.skillChanges), 'skillName');
    if (change.skillsToRemove) newSkills = newSkills.filter(s => !asArray(change.skillsToRemove).includes(s.skillName));
    if (isPassive) npc.passiveSkills = newSkills as PassiveSkill[]; else npc.activeSkills = newSkills as ActiveSkill[];
};

const applyChangesToPlayer = (player: PlayerCharacter, changes: Partial<GameResponse>, t: TFunction, gameSettings: GameSettings | null): { player: PlayerCharacter, logs: string[] } => {
    let newPlayer = JSON.parse(JSON.stringify(player));
    const logs: string[] = [];
    const itemsToAdd: Item[] = [];

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
        const statCap = newPlayer.level * 2;
        asArray(changes.statsIncreased).forEach(charName => {
            const charKey = `standard${charName.charAt(0).toUpperCase() + charName.slice(1)}` as keyof Characteristics;
            const currentStatValue = newPlayer.characteristics[charKey] as number;

            if (currentStatValue >= statCap) {
                const xpCompensation = Math.max(25, Math.round(newPlayer.experienceForNextLevel * 0.05));
                newPlayer.experience += xpCompensation;
                logs.push(t('stats_increased_capped', { 
                    statName: t(charName as any),
                    statCap: statCap,
                    xp: xpCompensation 
                }));
            } else {
                (newPlayer.characteristics[charKey] as number) += 1;
                logs.push(t('stats_increased_success', { statName: t(charName as any) }));
            }
        });
    }
    if (changes.statsDecreased) asArray(changes.statsDecreased).forEach(charName => { (newPlayer.characteristics[`standard${charName.charAt(0).toUpperCase() + charName.slice(1)}` as keyof Characteristics] as number) -= 1; });
    if (changes.setCharacteristics) for (const charName in changes.setCharacteristics) { (newPlayer.characteristics[`standard${charName.charAt(0).toUpperCase() + charName.slice(1)}` as keyof Characteristics] as number) = (changes.setCharacteristics as any)[charName]; }

    const levelUpResult = checkAndApplyLevelUp(newPlayer, t);
    newPlayer = levelUpResult.pc;
    logs.push(...levelUpResult.logs);
    newPlayer.levelOnPreviousTurn = newPlayer.level;

    if (changes.characterChronicleUpdates) {
        asArray(changes.characterChronicleUpdates).forEach(update => {
            if (!newPlayer.characterChronicle) {
                newPlayer.characterChronicle = [];
            }
            newPlayer.characterChronicle.unshift(update.entryToAppend);
        });
    }

    newPlayer.inventory = mergeById(newPlayer.inventory || [], asArray(changes.inventoryItemsData), 'existedId', 'name');
    if (changes.removeInventoryItems) newPlayer.inventory = newPlayer.inventory.filter((item: Item) => !asArray(changes.removeInventoryItems).some(i => i.removedItemId === item.existedId));
    if (changes.updateItemTextContents) asArray(changes.updateItemTextContents).forEach(update => { const item = newPlayer.inventory.find((i: Item) => i.existedId === update.itemId); if (item) { if (!Array.isArray(item.textContent)) item.textContent = []; item.textContent.unshift(update.textToAppend); } });
    if (changes.itemBondLevelChanges) asArray(changes.itemBondLevelChanges).forEach(change => { const item = newPlayer.inventory.find((i: Item) => i.existedId === change.itemId); if (item) item.ownerBondLevelCurrent = change.newBondLevel; });
    if (changes.itemFateCardUnlocks) asArray(changes.itemFateCardUnlocks).forEach(unlock => { const item = newPlayer.inventory.find((i: Item) => i.existedId === unlock.itemId); if (item?.fateCards) { const card = item.fateCards.find(c => c.cardId === unlock.cardId); if (card) card.isUnlocked = true; } });
    
    if (changes.equipmentChanges) asArray(changes.equipmentChanges).forEach(change => {
        if (change.action === 'equip') {
            const item = newPlayer.inventory.find((i: Item) => i.existedId === change.itemId);
            if (item?.requiresTwoHands) { newPlayer.equippedItems.MainHand = change.itemId; newPlayer.equippedItems.OffHand = change.itemId; }
            else (change.targetSlots || []).forEach(slot => { newPlayer.equippedItems[slot] = change.itemId; });
        } else if (change.action === 'unequip') {
            const item = newPlayer.inventory.find((i: Item) => i.existedId === change.itemId);
            if (item?.requiresTwoHands) { if (newPlayer.equippedItems.MainHand === change.itemId) newPlayer.equippedItems.MainHand = null; if (newPlayer.equippedItems.OffHand === change.itemId) newPlayer.equippedItems.OffHand = null; }
            else (change.sourceSlots || []).forEach(slot => { if (newPlayer.equippedItems[slot] === change.itemId) newPlayer.equippedItems[slot] = null; });
        }
    });
    
    if (changes.inventoryItemsResources) {
        asArray(changes.inventoryItemsResources).forEach(change => {
            const item = newPlayer.inventory.find((i: Item) => i.existedId === change.existedId);
            if (item) {
                const oldResource = item.resource;
                if(change.resource !== undefined) item.resource = change.resource;
                if(change.maximumResource !== undefined) item.maximumResource = change.maximumResource;
                if (item.isConsumption && oldResource !== undefined && oldResource > 0 && item.resource === 0) {
                    logs.push(t('item_consumed_creating_empty', { itemName: item.name }));
                    itemsToAdd.push({ name: t('empty_item_name', { itemName: item.name }), description: t('empty_item_desc', { itemName: item.name }), image_prompt: `empty ${item.image_prompt || item.name}, trash`, quality: 'Trash', type: 'Junk', price: Math.ceil(item.price * 0.1), count: 1, weight: item.containerWeight ?? item.weight * 0.2, volume: item.volume, bonuses: [], isContainer: false, capacity: null, isConsumption: false, durability: '100%', equipmentSlot: null, contentsPath: null, existedId: null, structuredBonuses: [] });
                    item.count -= 1;
                    if (item.count > 0 && item.maximumResource !== undefined) item.resource = item.maximumResource;
                }
            }
        });
        itemsToAdd.forEach(newItem => {
            const existingStack = newPlayer.inventory.find((i: Item) => i.name === newItem.name && !i.equipmentSlot);
            if (existingStack) existingStack.count += 1;
            else { (newItem as any).existedId = generateId('item'); newPlayer.inventory.push(newItem); }
        });
    }
    
    if (changes.moveInventoryItems) asArray(changes.moveInventoryItems).forEach(move => { const item = newPlayer.inventory.find((i: Item) => i.existedId === move.movedItemId); if (item) item.contentsPath = move.destinationContentsPath; });
    
    newPlayer.activeSkills = mergeById(newPlayer.activeSkills || [], asArray(changes.activeSkillChanges), 'skillName');
    if(changes.removeActiveSkills) newPlayer.activeSkills = newPlayer.activeSkills.filter(s => !asArray(changes.removeActiveSkills).includes(s.skillName));
    if (changes.skillMasteryChanges) newPlayer.skillMasteryData = mergeById(newPlayer.skillMasteryData || [], asArray(changes.skillMasteryChanges).map(c => ({...c, currentMasteryLevel: c.newMasteryLevel, currentMasteryProgress: c.newCurrentMasteryProgress, masteryProgressNeeded: c.newMasteryProgressNeeded})), 'skillName');
    newPlayer.passiveSkills = mergeById(newPlayer.passiveSkills || [], asArray(changes.passiveSkillChanges), 'skillName');
    if(changes.removePassiveSkills) newPlayer.passiveSkills = newPlayer.passiveSkills.filter(s => !asArray(changes.removePassiveSkills).includes(s.skillName));
    newPlayer.knownRecipes = mergeById(newPlayer.knownRecipes || [], asArray(changes.addOrUpdateRecipes), 'recipeName');
    if (changes.removeRecipes) newPlayer.knownRecipes = newPlayer.knownRecipes.filter(r => !asArray(changes.removeRecipes).includes(r.recipeName));
    
    newPlayer.playerWounds = mergeById(newPlayer.playerWounds || [], asArray(changes.playerWoundChanges), 'woundId');
    newPlayer.activePlayerEffects = mergeById(newPlayer.activePlayerEffects || [], asArray(changes.playerActiveEffectsChanges), 'effectId');
    newPlayer.playerCustomStates = mergeById(newPlayer.playerCustomStates || [], asArray(changes.customStateChanges), 'stateId');
    
    if (changes.playerCharacterNameChange !== undefined && changes.playerCharacterNameChange !== null) newPlayer.name = changes.playerCharacterNameChange;
    if (changes.playerImagePromptChange !== undefined && changes.playerImagePromptChange !== null) newPlayer.portrait = changes.playerImagePromptChange;
    if (changes.playerAppearanceChange !== undefined && changes.playerAppearanceChange !== null) newPlayer.appearanceDescription = changes.playerAppearanceChange;
    if (changes.playerRaceChange !== undefined && changes.playerRaceChange !== null) newPlayer.race = changes.playerRaceChange;
    if (changes.playerRaceDescriptionChange !== undefined && changes.playerRaceDescriptionChange !== null) newPlayer.raceDescription = changes.playerRaceDescriptionChange;
    if (changes.playerClassChange !== undefined && changes.playerClassChange !== null) newPlayer.class = changes.playerClassChange;
    if (changes.playerClassDescriptionChange !== undefined && changes.playerClassDescriptionChange !== null) newPlayer.classDescription = changes.playerClassDescriptionChange;
    if (changes.playerAutoCombatSkillChange !== undefined && changes.playerAutoCombatSkillChange !== null) newPlayer.autoCombatSkill = changes.playerAutoCombatSkillChange === 'clear' ? null : changes.playerAutoCombatSkillChange;
    if (changes.playerStealthStateChange !== undefined && changes.playerStealthStateChange !== null) newPlayer.stealthState = { ...newPlayer.stealthState, ...changes.playerStealthStateChange };
    if (changes.playerEffortTrackerChange !== undefined && changes.playerEffortTrackerChange !== null) newPlayer.effortTracker = { ...newPlayer.effortTracker, ...changes.playerEffortTrackerChange };
    
    newPlayer.inventory = newPlayer.inventory.filter((item: Item) => item.count > 0);
    return { player: newPlayer, logs };
};

export const processAndApplyResponse = (response: GameResponse, baseState: GameState, gameSettings: GameSettings | null, t: TFunction, advanceTurn: boolean, currentTurnNumber: number): { newState: GameState, logsToAdd: string[], combatLogsToAdd: string[] } => {
    if (!baseState) throw new Error("processAndApplyResponse called with a null baseState.");

    const mutableResponse = JSON.parse(JSON.stringify(response));
    
    const manuallyUpdatedEffectIds = new Set<string>();
    
    asArray(mutableResponse.playerActiveEffectsChanges).forEach(effectUpdate => {
        if (effectUpdate.effectId && effectUpdate.duration !== undefined) {
            manuallyUpdatedEffectIds.add(effectUpdate.effectId);
        }
    });

    asArray(mutableResponse.NPCEffectChanges).forEach(npcEffectChange => {
        asArray(npcEffectChange.effectsApplied).forEach(effectUpdate => {
            if (effectUpdate.effectId && effectUpdate.duration !== undefined) {
                manuallyUpdatedEffectIds.add(effectUpdate.effectId);
            }
        });
    });

    const findUpdatedDurations = (oldCombatants: (EnemyCombatObject | AllyCombatObject)[], newCombatants: (Partial<EnemyCombatObject> | Partial<AllyCombatObject>)[]) => {
        if (!newCombatants || !oldCombatants) return;
        
        const oldMap = new Map<string, (EnemyCombatObject | AllyCombatObject)>();
        oldCombatants.forEach(c => {
            if (c.NPCId) oldMap.set(c.NPCId, c);
            else if (c.name) oldMap.set(c.name, c);
        });

        newCombatants.forEach(newCombatant => {
            const oldCombatant = newCombatant.NPCId ? oldMap.get(newCombatant.NPCId) : (newCombatant.name ? oldMap.get(newCombatant.name) : undefined);
            
            if (oldCombatant) {
                const oldEffects = [...(oldCombatant.activeBuffs || []), ...(oldCombatant.activeDebuffs || [])];
                const newEffects = [...(newCombatant.activeBuffs || []), ...(newCombatant.activeDebuffs || [])];
                
                const oldEffectMap = new Map<string, number | undefined>();
                oldEffects.forEach(e => {
                    if (e.effectId) oldEffectMap.set(e.effectId, e.duration);
                });

                newEffects.forEach(newEffect => {
                    if (newEffect.effectId && oldEffectMap.has(newEffect.effectId)) {
                        const oldDuration = oldEffectMap.get(newEffect.effectId);
                        if (newEffect.duration !== undefined && newEffect.duration !== oldDuration) {
                            manuallyUpdatedEffectIds.add(newEffect.effectId);
                        }
                    }
                });
            }
        });
    };

    findUpdatedDurations(baseState.enemiesData, asArray(mutableResponse.enemiesData));
    findUpdatedDurations(baseState.alliesData, asArray(mutableResponse.alliesData));

    const initialIdToGeneratedIdMap = new Map<string, string>();

    const processForIdMapping = (items: any[] | undefined, idField: string, initialIdField: string, prefix: string) => {
        asArray(items).forEach(item => {
            if (item && !item[idField] && item[initialIdField]) {
                const newId = generateId(prefix);
                initialIdToGeneratedIdMap.set(item[initialIdField], newId);
                item[idField] = newId;
            }
        });
    };

    processForIdMapping(asArray(mutableResponse.factionDataChanges), 'factionId', 'initialId', 'faction');
    processForIdMapping(asArray(mutableResponse.NPCsData), 'NPCId', 'initialId', 'npc');
    processForIdMapping(asArray(mutableResponse.worldMapUpdates?.newLocations), 'locationId', 'initialId', 'loc');
    if (mutableResponse.currentLocationData && !mutableResponse.currentLocationData.locationId && mutableResponse.currentLocationData.initialId) {
         const newId = generateId('loc');
         initialIdToGeneratedIdMap.set(mutableResponse.currentLocationData.initialId, newId);
         mutableResponse.currentLocationData.locationId = newId;
    }

    resolveInitialIds(mutableResponse, initialIdToGeneratedIdMap);

    const processedResponse = preProcessAndAssignIds(mutableResponse, baseState);
    const changes = processedResponse;

    let newState: GameState = JSON.parse(JSON.stringify(baseState));
    const logsToAdd: string[] = [];
    const combatLogsToAdd = asArray(changes.combatLogEntries);
    const activePlayerIndex = newState.activePlayerIndex;

    if (changes.currentLocationData) {
        const newEvent = (changes.currentLocationData as any).lastEventsDescription;
        const { eventDescriptions, lastEventsDescription, ...restOfLocationData } = changes.currentLocationData as any;
        
        let mergedLocation = deepMergeResponses(newState.currentLocationData, restOfLocationData) as Location;
        
        if (newEvent && typeof newEvent === 'string' && newEvent.trim() !== '') {
            if (!Array.isArray(mergedLocation.eventDescriptions)) {
                mergedLocation.eventDescriptions = [];
            }
            mergedLocation.eventDescriptions.unshift(newEvent);
        }
        
        newState.currentLocationData = mergedLocation;
    }
    
    newState.NPCsInScene = changes.NPCsInScene ?? newState.encounteredNPCs.some(npc => npc && npc.currentLocationId === newState.currentLocationData.locationId);
    if (newState.currentLocationData.initialId) newState.encounteredNPCs.forEach(npc => { if (npc.initialLocationId === newState.currentLocationData.initialId) npc.currentLocationId = newState.currentLocationData.locationId; });

    if (changes.itemJournalUpdates) {
        asArray(changes.itemJournalUpdates).forEach(update => {
            let itemFound = false;
            
            const findAndUpdate = (inventory: Item[]) => {
                if (itemFound || !inventory) return;
    
                let item: Item | null = null;
                
                if (update.itemId) {
                    item = inventory.find((i: Item) => i.existedId === update.itemId) || null;
                }
                
                if (!item && update.initialItemId) {
                    item = inventory.find((i: Item) => i.initialId === update.initialItemId) || null;
                }
    
                if (!item && update.itemName) {
                    item = inventory.find((i: Item) => i.name === update.itemName && (!i.journalEntries || i.journalEntries.length === 0)) || inventory.find(i => i.name === update.itemName);
                }
    
                if (item) {
                    if (!Array.isArray(item.journalEntries)) {
                        item.journalEntries = [];
                    }
                    item.journalEntries.unshift(update.entryToAppend);
                    itemFound = true;
                }
            };
    
            newState.players.forEach(p => {
                if (p && p.inventory) findAndUpdate(p.inventory);
            });

            if (!itemFound) {
                newState.encounteredNPCs.forEach(npc => {
                    if (npc && npc.inventory) findAndUpdate(npc.inventory);
                });
            }
        });
        delete changes.itemJournalUpdates;
    }

    if (newState.players?.[activePlayerIndex]) {
        newState.players[activePlayerIndex] = newState.playerCharacter;
        const { player: updatedActivePlayer, logs: activePlayerLogs } = applyChangesToPlayer(newState.players[activePlayerIndex], changes, t, gameSettings);
        newState.players[activePlayerIndex] = updatedActivePlayer;
        newState.playerCharacter = updatedActivePlayer;
        logsToAdd.push(...activePlayerLogs);
    }
    
    if (changes.otherPlayersInteractions) for (const playerId in changes.otherPlayersInteractions) {
        const playerIndex = newState.players.findIndex(p => p.playerId === playerId);
        if (playerIndex > -1) {
            const mergedChanges = (changes.otherPlayersInteractions as any)[playerId].reduce((acc: any, cmd: any) => ({ ...acc, ...cmd }), {});
            const { player: updatedOtherPlayer, logs: otherPlayerLogs } = applyChangesToPlayer(newState.players[playerIndex], mergedChanges, t, gameSettings);
            newState.players[playerIndex] = updatedOtherPlayer;
            logsToAdd.push(...otherPlayerLogs);
        }
    }
  
    if (changes.plotOutline !== undefined && changes.plotOutline !== null) newState.plotOutline = changes.plotOutline;
    newState.enemiesData = asArray(changes.enemiesData);
    newState.alliesData = asArray(changes.alliesData);

    newState.worldStateFlags = mergeById(newState.worldStateFlags || [], asArray(changes.worldStateFlags), 'flagId', 'displayName');
    newState.worldEventsLog = mergeById(newState.worldEventsLog || [], asArray(changes.worldEventsLog), 'eventId');
    
    newState.encounteredFactions = mergeById(newState.encounteredFactions || [], asArray(changes.factionDataChanges), 'factionId', 'name').map(f => (f && !f.color) ? { ...f, color: generateFactionColor(f.factionId || f.name) } : f);
    asArray(changes.factionChronicleUpdates).forEach(update => { const f = findFactionForUpdate(update, newState.encounteredFactions); if (f) { if (!f.scribeChronicle) f.scribeChronicle = []; f.scribeChronicle.unshift(update.entryToAppend); } });
    asArray(changes.factionBonusChanges).forEach(change => { const f = findFactionForUpdate(change, newState.encounteredFactions); if (f) { if (change.bonusesToRemove) f.structuredBonuses = (f.structuredBonuses || []).filter(b => !b.bonusId || !asArray(change.bonusesToRemove).includes(b.bonusId)); if (change.bonusesToAddOrUpdate) f.structuredBonuses = mergeById(f.structuredBonuses || [], asArray(change.bonusesToAddOrUpdate), 'bonusId', 'description'); } });
    asArray(changes.factionResourceChanges).forEach(change => { const f = findFactionForUpdate(change, newState.encounteredFactions); if (f?.resources) asArray(change.resourceChanges).forEach(rc => { let r = f.resources!.metaResources.find(res => res.resourceName === rc.resourceName); if(r) r.currentStockpile += rc.changeAmount; else { let sg = f.resources!.strategicGoods.find(g => g.resourceName === rc.resourceName); if(sg) sg.currentStockpile += rc.changeAmount; } }); });
    asArray(changes.factionCustomStateChanges).forEach(change => { const f = findFactionForUpdate(change, newState.encounteredFactions); if (f) { f.customStates = mergeById(f.customStates || [], asArray(change.statesToAddOrUpdate), 'stateId'); if(change.statesToRemove) f.customStates = f.customStates.filter(s => !s.stateId || !asArray(change.statesToRemove).includes(s.stateId)); } });
    if (changes.factionRankBranchChanges) {
        asArray(changes.factionRankBranchChanges).forEach(change => {
            const targetFaction = findFactionForUpdate(change, newState.encounteredFactions);
            if (targetFaction) {
                if (!targetFaction.ranks) targetFaction.ranks = { branches: [] };
                let branches = targetFaction.ranks.branches || [];

                if (change.branchesToRemove) branches = branches.filter(b => !asArray(change.branchesToRemove).includes(b.branchId));
                if (change.ranksToRemove) asArray(change.ranksToRemove).forEach(r => {
                    const branch = branches.find(b => b.branchId === r.targetBranchId);
                    if (branch) branch.ranks = branch.ranks.filter(rank => rank.rankNameMale !== r.rankIdentifier && rank.rankNameFemale !== r.rankIdentifier);
                });
                
                if (change.branchesToAdd) branches.push(...asArray(change.branchesToAdd));
                if (change.ranksToAdd) asArray(change.ranksToAdd).forEach(r => {
                    const branch = branches.find(b => b.branchId === r.targetBranchId);
                    if (branch) branch.ranks.push(r.rank);
                });

                if (change.branchesToUpdate) asArray(change.branchesToUpdate).forEach(u => {
                    const branch = branches.find(b => b.branchId === u.branchId);
                    if (branch && u.newDisplayName) branch.displayName = u.newDisplayName;
                });
                if (change.ranksToUpdate) asArray(change.ranksToUpdate).forEach(u => {
                    const branch = branches.find(b => b.branchId === u.targetBranchId);
                    if (branch) {
                        const rankIndex = branch.ranks.findIndex(rank => rank.rankNameMale === u.rankIdentifier || rank.rankNameFemale === u.rankIdentifier);
                        if (rankIndex > -1) {
                            const newRankData = u.update;
                            const oldRank = branch.ranks[rankIndex] as FactionRank;
                            const destination = branch.ranks[rankIndex] as FactionRank;
                            destination.rankNameMale = newRankData.newRankNameMale ?? oldRank.rankNameMale;
                            destination.rankNameFemale = newRankData.newRankNameFemale ?? oldRank.rankNameFemale;
                            destination.requiredReputation = newRankData.newRequiredReputation ?? oldRank.requiredReputation;
                            destination.unlockCondition = newRankData.newUnlockCondition ?? oldRank.unlockCondition;
                            destination.benefits = newRankData.newBenefits ?? oldRank.benefits;
                            destination.isJunctionPoint = newRankData.newIsJunctionPoint ?? oldRank.isJunctionPoint;
                            destination.availableBranches = newRankData.newAvailableBranches ?? oldRank.availableBranches;
                        }
                    }
                });

                targetFaction.ranks.branches = branches;
            }
        });
    }

    newState.encounteredNPCs = mergeById(newState.encounteredNPCs || [], asArray(changes.NPCsData).map(u => ({...u, currentHealth: typeof u.currentHealth === 'string' ? parseInt(u.currentHealth) || 0 : u.currentHealth, maxHealth: typeof u.maxHealth === 'string' ? parseInt(u.maxHealth) || 100 : u.maxHealth })), 'NPCId', 'name');
    newState.encounteredNPCs.forEach(npc => {
        if (npc && !Array.isArray(npc.inventory)) {
            npc.inventory = [];
        }
    });

    asArray(changes.NPCSkillMasteryChanges).forEach(change => {
        const npc = findNpcForUpdate(change, newState.encounteredNPCs);
        if (npc) {
            const masteryUpdate = {
                skillName: change.skillName,
                currentMasteryLevel: change.newMasteryLevel,
                currentMasteryProgress: change.newCurrentMasteryProgress,
                masteryProgressNeeded: change.newMasteryProgressNeeded,
            };
            npc.skillMasteryData = mergeById(npc.skillMasteryData || [], [masteryUpdate], 'skillName');
        }
    });

    asArray(changes.NPCPassiveSkillMasteryChanges).forEach(change => {
        const npc = findNpcForUpdate(change, newState.encounteredNPCs);
        if (npc?.passiveSkills) {
            const skillIndex = npc.passiveSkills.findIndex(s => s.skillName === change.skillName);
            if (skillIndex > -1) {
                const skill = npc.passiveSkills[skillIndex];
                if (change.newMasteryLevel !== undefined) {
                    skill.masteryLevel = change.newMasteryLevel;
                }
                if (change.newMaxMasteryLevel !== undefined) {
                    skill.maxMasteryLevel = change.newMaxMasteryLevel;
                }
            }
        }
    });

    asArray(changes.NPCsRenameData).forEach(r => { const npc = newState.encounteredNPCs.find(n => n.name === r.oldName); if (npc) npc.name = r.newName; });
    asArray(changes.NPCRelationshipChanges).forEach(c => { const npc = findNpcForUpdate(c, newState.encounteredNPCs); if(npc) { npc.relationshipLevel = c.newRelationshipLevel; if (c.changeReason) npc.lastRelationshipChangeReason = c.changeReason; } });
    asArray(changes.NPCJournals).forEach(u => {
        const npc = findNpcForUpdate(u, newState.encounteredNPCs);
        if(npc) {
            if(!npc.journalEntries) npc.journalEntries = [];
            npc.journalEntries.unshift(u.lastJournalNote);
            if(gameSettings?.keepLatestNpcJournals) {
                // FIX: Ensure latestNpcJournalsCount is a valid positive number before slicing.
                // An invalid value (like NaN, null, or 0) would cause slice to clear the array. Default to 20 if invalid.
                const count = (gameSettings.latestNpcJournalsCount && !isNaN(gameSettings.latestNpcJournalsCount) && gameSettings.latestNpcJournalsCount > 0) 
                    ? gameSettings.latestNpcJournalsCount 
                    : 20;
                npc.journalEntries = npc.journalEntries.slice(0, count);
            }
        }
    });
    asArray(changes.NPCUnlockedMemories).forEach(m => { const npc = findNpcForUpdate(m, newState.encounteredNPCs); if (npc) { if(!npc.unlockedMemories) npc.unlockedMemories = []; npc.unlockedMemories.push(m as UnlockedMemory); } });
    asArray(changes.NPCFateCardUnlocks).forEach(u => { const npc = findNpcForUpdate(u, newState.encounteredNPCs); if (npc?.fateCards) { const card = npc.fateCards.find(c => c.cardId === u.cardId); if(card) card.isUnlocked = true; } });
    asArray(changes.NPCWoundChanges).forEach(wu => { const npc = findNpcForUpdate(wu, newState.encounteredNPCs); if(npc) npc.wounds = mergeById(npc.wounds || [], [wu], 'woundId'); });
    asArray(changes.NPCEffectChanges).forEach(ec => {
        const npc = findNpcForUpdate(ec, newState.encounteredNPCs);
        if (npc) {
            // Apply new/updated effects
            if (ec.effectsApplied) {
                npc.activeEffects = mergeById(npc.activeEffects || [], asArray(ec.effectsApplied), 'effectId');
            }
            // Remove effects
            if (ec.effectsToRemove) {
                const toRemove = new Set(asArray(ec.effectsToRemove));
                if (toRemove.size > 0) {
                    npc.activeEffects = (npc.activeEffects || []).filter((effect: Effect) => !effect.effectId || !toRemove.has(effect.effectId));
                }
            }
        }
    });
    asArray(changes.NPCCustomStateChanges).forEach(sc => { const npc = findNpcForUpdate(sc, newState.encounteredNPCs); if (npc) npc.customStates = mergeById(npc.customStates || [], sc.stateChanges, 'stateId'); });
    asArray(changes.NPCInventoryAdds).forEach(add => { const npc = findNpcForUpdate(add, newState.encounteredNPCs); if(npc) { if (!npc.inventory) npc.inventory = []; const newItem = { ...add.item, existedId: add.item.existedId || generateId('item') }; if (add.destinationContainerId) { const c = npc.inventory.find(i => i.existedId === add.destinationContainerId); if (c) newItem.contentsPath = c.contentsPath ? [...c.contentsPath, c.name] : [c.name]; } npc.inventory.push(newItem as Item); } });
    asArray(changes.NPCInventoryUpdates).forEach(u => { const npc = findNpcForUpdate(u, newState.encounteredNPCs); if(npc) { const i = npc.inventory.findIndex(item => item.existedId === u.itemUpdate.existedId); if(i > -1) npc.inventory[i] = { ...npc.inventory[i], ...u.itemUpdate }; } });
    asArray(changes.NPCInventoryRemovals).forEach(r => { const npc = findNpcForUpdate(r, newState.encounteredNPCs); if (npc?.inventory) { const i = npc.inventory.findIndex(item => item.existedId === r.itemId); if(i > -1) { const [removed] = npc.inventory.splice(i, 1); if (npc.progressionType === 'Companion') { if (!newState.temporaryStash) newState.temporaryStash = []; if (!newState.temporaryStash.find(item => item.existedId === removed.existedId)) newState.temporaryStash.push({ ...removed, contentsPath: null }); logsToAdd.push(t('item_moved_to_stash_from_npc', { itemName: removed.name, npcName: npc.name })); } } } });
    asArray(changes.NPCEquipmentChanges).forEach(c => { const npc = findNpcForUpdate(c, newState.encounteredNPCs); if(npc) { if(!npc.equippedItems) npc.equippedItems = {}; if(c.action === 'equip') (c.targetSlots || []).forEach(s => npc.equippedItems![s] = c.itemId); else (c.sourceSlots || []).forEach(s => { if(npc.equippedItems![s] === c.itemId) npc.equippedItems![s] = null; }); } });
    
    asArray(changes.NPCInventoryResourcesChanges).forEach(change => {
        const npc = findNpcForUpdate(change, newState.encounteredNPCs);
        if (npc && npc.inventory) {
            const itemIndex = npc.inventory.findIndex(item => 
                ((change.itemId && item.existedId === change.itemId) || 
                (!change.itemId && item.name === change.itemName)) && !(item as any)._patched_resource_consumption
            );
    
            if (itemIndex > -1) {
                const item = npc.inventory[itemIndex];
                const oldResource = item.resource;
                const resourceValue = (change as any).newResourceValue ?? (change as any).resource;
    
                if (resourceValue !== undefined) {
                    item.resource = resourceValue;
                }
                if ((change as any).maximumResource !== undefined) {
                    item.maximumResource = (change as any).maximumResource;
                }
                if ((change as any).resourceType !== undefined) {
                    item.resourceType = (change as any).resourceType;
                }
                (item as any)._patched_resource_consumption = true;
    
                if (item.isConsumption && oldResource !== undefined && oldResource > 0 && item.resource === 0) {
                    logsToAdd.push(t('item_consumed_creating_empty_npc', { itemName: item.name, npcName: npc.name }));
                    
                    const emptyItemName = t('empty_item_name', { itemName: item.name });
                    const existingEmptyStack = npc.inventory.find(i => i.name === emptyItemName && !i.equipmentSlot);
    
                    if (existingEmptyStack) {
                        existingEmptyStack.count += 1;
                    } else {
                        const newItem: Item = { 
                            name: emptyItemName, 
                            description: t('empty_item_desc', { itemName: item.name }), 
                            image_prompt: `empty ${item.image_prompt || item.name}, trash`, 
                            quality: 'Trash', 
                            type: 'Junk', 
                            price: Math.ceil(item.price * 0.1), 
                            count: 1, 
                            weight: item.containerWeight ?? item.weight * 0.2, 
                            volume: item.volume, 
                            bonuses: [], 
                            isContainer: false, 
                            capacity: null, 
                            isConsumption: false, 
                            durability: '100%', 
                            equipmentSlot: null, 
                            contentsPath: null,
                            existedId: generateId('item'),
                            initialId: undefined,
                            structuredBonuses: [],
                        };
                        npc.inventory.push(newItem);
                    }
                    
                    item.count -= 1;
                    if (item.count > 0 && item.maximumResource !== undefined) {
                        item.resource = item.maximumResource;
                    }
                }
            }
        }
    });

    asArray(changes.NPCActiveSkillChanges).forEach(c => { const npc = findNpcForUpdate(c, newState.encounteredNPCs); if(npc) applySkillChanges(npc, c, false); });
    asArray(changes.NPCPassiveSkillChanges).forEach(c => { const npc = findNpcForUpdate(c, newState.encounteredNPCs); if(npc) applySkillChanges(npc, c, true); });
    asArray(changes.NPCActivityUpdates).forEach(u => { const npc = findNpcForUpdate(u, newState.encounteredNPCs); if (npc) npc.currentActivity = !npc.currentActivity ? u.activityUpdate as any : deepMergeResponses(npc.currentActivity, u.activityUpdate); });
    asArray(changes.completeNPCActivities).forEach(c => { const npc = findNpcForUpdate(c, newState.encounteredNPCs); if (npc?.currentActivity?.activityName === c.activityName) { if (!npc.completedActivities) npc.completedActivities = []; npc.completedActivities.unshift({ activityName: npc.currentActivity.activityName, completionTurn: currentTurnNumber, finalOutcome: c.finalState === 'Completed' ? 'Success' : 'Failure', narrativeSummary: c.narrativeSummary }); npc.currentActivity = null; } });
    
    const updatedActiveQuests = [...newState.activeQuests];
    const updatedCompletedQuests = [...newState.completedQuests];
    const lastUpdatedQuestIds = new Set<string>();
    asArray(changes.questUpdates).forEach((update: QuestUpdate) => {
        if (!update.questId && !update.questName) return;
        let questFoundIn: 'active' | 'completed' | 'none' = 'none', questIndex = -1;
        questIndex = updatedActiveQuests.findIndex(q => (update.questId && q.questId === update.questId) || (!update.questId && q.questName === update.questName));
        if (questIndex > -1) questFoundIn = 'active';
        else { questIndex = updatedCompletedQuests.findIndex(q => (update.questId && q.questId === update.questId) || (!update.questId && q.questName === update.questName)); if (questIndex > -1) questFoundIn = 'completed'; }
        const { newDetailsLogEntry, ...restOfUpdate } = update;
        if (questFoundIn !== 'none') {
            let targetArray = questFoundIn === 'active' ? updatedActiveQuests : updatedCompletedQuests;
            let existingQuest = deepMergeResponses(targetArray[questIndex], restOfUpdate);
            if (newDetailsLogEntry) existingQuest.detailsLog = [...(existingQuest.detailsLog || []), newDetailsLogEntry];
            if ((questFoundIn === 'active' && (existingQuest.status === 'Completed' || existingQuest.status === 'Failed'))) { updatedActiveQuests.splice(questIndex, 1); updatedCompletedQuests.unshift(existingQuest); }
            else if (questFoundIn === 'completed' && (existingQuest.status === 'Active' || existingQuest.status === 'Updated')) { updatedCompletedQuests.splice(questIndex, 1); updatedActiveQuests.unshift(existingQuest); }
            else targetArray[questIndex] = existingQuest;
            if (existingQuest.questId) lastUpdatedQuestIds.add(existingQuest.questId);
        } else {
            const newQuest = { ...restOfUpdate, questId: restOfUpdate.questId || generateId('quest') } as Quest;
            if (newDetailsLogEntry) newQuest.detailsLog = [newDetailsLogEntry];
            if (newQuest.status === 'Completed' || newQuest.status === 'Failed') updatedCompletedQuests.unshift(newQuest); else updatedActiveQuests.unshift(newQuest);
            lastUpdatedQuestIds.add(newQuest.questId);
        }
    });
    newState.activeQuests = updatedActiveQuests;
    newState.completedQuests = updatedCompletedQuests;
    if (lastUpdatedQuestIds.size > 0) newState.lastUpdatedQuestId = Array.from(lastUpdatedQuestIds).pop();

    if (changes.removeWorldStateFlags) {
      const flagsToRemove = new Set(asArray(changes.removeWorldStateFlags));
      newState.worldStateFlags = newState.worldStateFlags.filter(flag => !flagsToRemove.has(flag.flagId));
    }

    const tickDownAndFilterEffects = (effects: Effect[] | undefined, shouldDecrement: boolean): Effect[] => {
        if (!effects || effects.length === 0) {
            return [];
        }
    
        let processedEffects = effects;
        if (shouldDecrement) {
            processedEffects = effects.map(effect => {
                if (!effect || typeof effect.duration !== 'number' || effect.duration >= 999) {
                    return effect;
                }
                if (effect.effectId && manuallyUpdatedEffectIds.has(effect.effectId)) {
                    return effect; 
                }
                return { ...effect, duration: effect.duration - 1 };
            });
        }
    
        const activeEffects = processedEffects.filter((effect): effect is Effect => {
            if (!effect) return false;
            if (typeof effect.duration !== 'number' || effect.duration >= 999) {
                return true;
            }
            return effect.duration > 0;
        });
    
        return activeEffects;
    };

    newState.players = newState.players.map(p => {
        if (p) {
            return { ...p, activePlayerEffects: tickDownAndFilterEffects(p.activePlayerEffects, advanceTurn) };
        }
        return p;
    });
    
    newState.playerCharacter = newState.players[activePlayerIndex];

    newState.encounteredNPCs = newState.encounteredNPCs.map(npc => {
        if (npc) {
            return { ...npc, activeEffects: tickDownAndFilterEffects(npc.activeEffects, advanceTurn) };
        }
        return npc;
    });
    
    newState.enemiesData = newState.enemiesData.map(enemy => {
        if (enemy) {
            return {
                ...enemy,
                activeBuffs: tickDownAndFilterEffects(enemy.activeBuffs, advanceTurn),
                activeDebuffs: tickDownAndFilterEffects(enemy.activeDebuffs, advanceTurn)
            };
        }
        return enemy;
    });
    newState.alliesData = newState.alliesData.map(ally => {
        if (ally) {
            return {
                ...ally,
                activeBuffs: tickDownAndFilterEffects(ally.activeBuffs, advanceTurn),
                activeDebuffs: tickDownAndFilterEffects(ally.activeDebuffs, advanceTurn)
            };
        }
        return ally;
    });

    newState.encounteredNPCs.forEach(npc => {
        if (npc?.inventory) {
            npc.inventory.forEach(item => {
                delete (item as any)._patched_resource_consumption;
            });
        }
    });

    newState.players = newState.players.map(p => p ? recalculateDerivedStats(recalculateAllWeights(p)) : null).filter((p): p is PlayerCharacter => !!p);
    newState.playerCharacter = newState.players[newState.activePlayerIndex];
    newState.encounteredNPCs = newState.encounteredNPCs.map(n => n ? recalculateDerivedStats(recalculateAllWeights(n)) : null).filter((n): n is NPC => !!n);
    newState.encounteredNPCs.forEach(npc => { if (npc?.inventory) npc.inventory = npc.inventory.filter((item: Item) => item.count > 0); });

    newState.networkRole = baseState.networkRole;
    newState.myPeerId = baseState.myPeerId;
    newState.hostPeerId = baseState.hostPeerId;
    newState.peers = baseState.peers;
    newState.isConnectedToHost = baseState.isConnectedToHost;

    return { newState, logsToAdd, combatLogsToAdd };
};