
import { GameState, GameResponse, PlayerCharacter, Item, ActiveSkill, PassiveSkill, NPC, LocationData, Quest, EnemyCombatObject, AllyCombatObject, CustomState, Wound, Faction, SkillMastery, Effect, Recipe, UnlockedMemory, WorldStateFlag, NPCCustomStateChange, GameSettings } from '../types';
import { recalculateDerivedStats } from './gameContext';
import { recalculateAllWeights } from './inventoryManager';
import { characteristics as charTranslations } from './translations/characteristics';

/**
 * A helper function to ensure that a given value is always an array.
 * If the value is null or undefined, it returns an empty array.
 * If the value is already an array, it returns it as is, filtering out any null/undefined items.
 * If the value is a single item, it wraps it in an array.
 * @param value The value to process.
 * @returns An array.
 */
function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter(item => item !== null && item !== undefined);
  }
  return [value];
}

/**
 * Generates a unique ID string for new game entities.
 * @param prefix A short string to identify the entity type (e.g., 'item', 'npc').
 * @returns A unique ID string.
 */
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const isObject = (item: any): item is object => {
    return (item && typeof item === 'object' && !Array.isArray(item));
};

/**
 * Deeply merges two objects. Arrays are replaced, not merged, but are sanitized for null/undefined values.
 * This is crucial for handling both partial state updates (like characteristics)
 * and full array replacements, ensuring no corrupted data enters the state.
 * @param target The original object.
 * @param source The object with updates.
 * @returns A new, deeply merged object.
 */
function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
    const output = { ...target } as T & U;

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            const sourceKey = key as keyof U;
            const targetKey = key as keyof T;
            const sourceValue = source[sourceKey];
            
            if (isObject(sourceValue)) {
                if (!(key in target) || !isObject(target[targetKey])) {
                    (output as any)[key] = sourceValue;
                } else {
                    (output as any)[key] = deepMerge(target[targetKey] as object, sourceValue as object);
                }
            } else if (Array.isArray(sourceValue)) {
                // If the source value is an array, filter out any null/undefined items before merging.
                (output as any)[key] = sourceValue.filter(item => item !== null && item !== undefined).map(item => {
                    // Recursively merge objects within arrays
                    if (isObject(item)) {
                        const targetItem = (target[targetKey] as any[])?.find((t: any) => t.id === (item as any).id) || {};
                        return deepMerge(targetItem, item);
                    }
                    return item;
                });
            } else {
                // For primitives and null, replace the target's value.
                (output as any)[key] = sourceValue;
            }
        });
    }

    return output;
}


/**
 * Updates a list of entities with new or changed entities, preventing duplicates.
 * It uses a primary ID key and a secondary name key for matching.
 * It performs case-insensitive matching for string-based keys.
 * @param currentEntities The current array of entities.
 * @param entityChanges The array of new or updated entities.
 * @param idKey The name of the ID property (e.g., 'skillId', 'NPCId').
 * @param nameKey The name of the name property (e.g., 'skillName', 'name').
 * @returns A new array of entities with updates applied.
 */
function upsertEntities<T extends { [key: string]: any }>(
    currentEntities: T[],
    entityChanges: Partial<T>[],
    idKey: keyof T,
    nameKey: keyof T
): T[] {
    if (!entityChanges || entityChanges.length === 0) {
        return currentEntities;
    }

    const newEntities = [...currentEntities];
    const idMap = new Map<string | any, number>();
    newEntities.forEach((e, i) => {
        const key = e[idKey];
        if (key) {
            idMap.set(typeof key === 'string' ? key.toLowerCase() : key, i);
        }
    });

    const nameMap = new Map<string | any, number>();
    newEntities.forEach((e, i) => {
        const key = e[nameKey];
        if (key) {
            nameMap.set(typeof key === 'string' ? key.toLowerCase() : key, i);
        }
    });


    entityChanges.forEach(change => {
        // Specific fix for NPC Fate Card IDs to ensure uniqueness before merging.
        // This prevents React key conflicts and rendering bugs.
        if (idKey === 'NPCId' && (change as any).fateCards && Array.isArray((change as any).fateCards)) {
            const seenIds = new Set();
            ((change as any).fateCards as any[]).forEach((card: any) => {
                if (!card.cardId || seenIds.has(card.cardId)) {
                    // If cardId is missing, duplicated, or invalid, generate a new unique one.
                    card.cardId = generateId(`fatecard-${(change as any).name || 'npc'}`);
                }
                seenIds.add(card.cardId);
            });
        }

        let existingIndex = -1;

        const changeId = change[idKey];
        const changeName = change[nameKey];

        // Priority 1: Match by ID
        if (changeId) {
            const lookupKey = typeof changeId === 'string' ? changeId.toLowerCase() : changeId;
            if (idMap.has(lookupKey)) {
                existingIndex = idMap.get(lookupKey)!;
            }
        }
        
        // Priority 2: Match by Name (if ID match failed or ID was not provided)
        if (existingIndex === -1 && changeName) {
            const lookupKey = typeof changeName === 'string' ? changeName.toLowerCase() : changeName;
            if (nameMap.has(lookupKey)) {
                existingIndex = nameMap.get(lookupKey)!;
            }
        }


        if (existingIndex !== -1) {
            const existingEntity = newEntities[existingIndex];
            
            // DEFENSIVE FIX: Prevent overwriting a valid ID with a null/undefined one from the AI.
            if (existingEntity[idKey] && !change[idKey]) {
                delete (change as {[key: string]: any})[idKey as string];
            }

            // SPECIAL PRESERVATION LOGIC FOR NPC JOURNALS
            if (idKey === 'NPCId') {
                const npcChange = change as unknown as Partial<NPC>;
                const existingNpc = existingEntity as unknown as NPC;
                
                // If the AI sends an update for an NPC but omits the journal or sends an empty one,
                // and a journal already exists, we assume the AI forgot and we preserve the old journal.
                if (existingNpc.journalEntries && Array.isArray(existingNpc.journalEntries) && existingNpc.journalEntries.length > 0) {
                    if (!npcChange.journalEntries || (Array.isArray(npcChange.journalEntries) && npcChange.journalEntries.length === 0)) {
                        // Preserve the existing journal by deleting the empty/missing one from the incoming change.
                        // This way, deepMerge won't overwrite it.
                        delete npcChange.journalEntries;
                    }
                }
            }

            // Deep merge new data into the existing entity
            newEntities[existingIndex] = deepMerge(existingEntity, change);
        } else {
            // It's a new entity.
            
            // SPECIAL PROTOCOL: Handle initial equipment for new NPCs using temporary IDs.
            if (idKey === 'NPCId' && (change as any).inventory) {
                const tempIdMap = new Map<string, string>();

                const newInventory = ((change as any).inventory as any[]).map((item: any) => {
                    const newItem = { ...item };
                    // Assign a permanent ID to all new items.
                    if (!newItem.existedId) {
                        newItem.existedId = generateId('item');
                    }
                    // If a temporary 'initialId' exists, map it to the new permanent ID.
                    if (newItem.initialId) {
                        tempIdMap.set(newItem.initialId, newItem.existedId);
                        delete newItem.initialId; // Clean up the temporary field.
                    }
                    return newItem;
                });
                (change as any).inventory = newInventory;

                // If equippedItems uses temporary IDs, replace them with the new permanent IDs.
                if ((change as any).equippedItems && tempIdMap.size > 0) {
                    const newEquippedItems: { [key: string]: string | null } = {};
                    for (const slot in ((change as any).equippedItems as any)) {
                        const tempId = ((change as any).equippedItems as any)[slot];
                        if (typeof tempId === 'string' && tempIdMap.has(tempId)) {
                            newEquippedItems[slot] = tempIdMap.get(tempId)!;
                        } else {
                            newEquippedItems[slot] = tempId;
                        }
                    }
                    (change as any).equippedItems = newEquippedItems;
                }
            }
            
            // Ensure the new entity itself has a generated ID if one wasn't provided.
            if (!change[idKey]) {
                change[idKey] = generateId(idKey.toString().replace('Id', '')) as any;
            }
            newEntities.push(change as T);
        }
    });

    return newEntities;
}

type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

const getEffectKey = (effect: Effect): string => {
    // Prioritize sourceSkill as it's a more stable identifier
    if (effect.sourceSkill) {
        return effect.sourceSkill;
    }
    // Fallback to description, but remove the duration part to allow matching
    return effect.description.replace(/\s*\([^)]*\)$/, '').trim();
};

export function checkAndApplyLevelUp(pc: PlayerCharacter, t: TFunction): { pc: PlayerCharacter, logs: string[] } {
    const newPc = JSON.parse(JSON.stringify(pc));
    let leveledUp = false;
    let levelsGained = 0;
    const logs: string[] = [];

    let currentExperience = Number(newPc.experience);
    let experienceForNextLevel = Number(newPc.experienceForNextLevel);

    // Prevent infinite loop if experienceForNextLevel is 0 or negative
    while (currentExperience >= experienceForNextLevel && experienceForNextLevel > 0) {
        leveledUp = true;
        levelsGained++;
        const prevLevelExp = experienceForNextLevel;
        newPc.level = Number(newPc.level) + 1;
        newPc.attributePoints = (Number(newPc.attributePoints) || 0) + 5;
        currentExperience -= prevLevelExp;
        experienceForNextLevel = Math.floor(prevLevelExp * 1.5);
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

export const processAndApplyResponse = (response: GameResponse, baseState: GameState, gameSettings: GameSettings | null, t: TFunction, advanceTurn: boolean): { newState: GameState, logsToAdd: string[], combatLogsToAdd: string[] } => {
    const newState: GameState = JSON.parse(JSON.stringify(baseState));
    let pc = newState.playerCharacter;
    const logsToAdd: string[] = [];
    const combatLogsToAdd = asArray(response.combatLogEntries);
    
    if (!newState.imageCache) {
      newState.imageCache = {};
    }

    // --- Player Stats ---
    pc.currentHealth = Math.max(0, pc.currentHealth + (response.currentHealthChange || 0));

    let totalEnergyChange = response.currentEnergyChange || 0;
    if (response.calculatedWeightData?.additionalEnergyExpenditure) {
        totalEnergyChange -= response.calculatedWeightData.additionalEnergyExpenditure;
        logsToAdd.push(t('energy_lost_overload', { amount: response.calculatedWeightData.additionalEnergyExpenditure }));
    }
    pc.currentEnergy = Math.max(0, pc.currentEnergy + totalEnergyChange);
    
    // Check for Fatigue
    if (pc.currentEnergy <= 0) {
        const hasFatigue = pc.activePlayerEffects.some(e => e.effectId === 'system-fatigue');
        if (!hasFatigue) {
            const fatigueEffect: Effect = {
                effectId: 'system-fatigue',
                effectType: 'Debuff',
                value: 'Disadvantage',
                targetType: 'all_action_checks',
                duration: 999,
                sourceSkill: t('exhaustion_source'),
                description: t('fatigue_effect_description')
            };
            if (!response.playerActiveEffectsChanges) {
                response.playerActiveEffectsChanges = [];
            }
            (response.playerActiveEffectsChanges as Effect[]).push(fatigueEffect);
            logsToAdd.push(t("You have become Fatigued from exhaustion!"));
        }
    } else {
        const fatigueIndex = pc.activePlayerEffects.findIndex(e => e.effectId === 'system-fatigue');
        if (fatigueIndex > -1) {
            // Signal removal
            const removeFatigueEffect: Partial<Effect> = {
                effectId: 'system-fatigue',
                duration: 0
            };
            if (!response.playerActiveEffectsChanges) {
                response.playerActiveEffectsChanges = [];
            }
            (response.playerActiveEffectsChanges as Partial<Effect>[]).push(removeFatigueEffect);
            logsToAdd.push(t("You are no longer Fatigued."));
        }
    }

    pc.money += response.moneyChange || 0;
    pc.experience += response.experienceGained || 0;

    // --- Level Up Logic ---
    const levelUpResult = checkAndApplyLevelUp(pc, t);
    pc = levelUpResult.pc;
    if (levelUpResult.logs.length > 0) {
        logsToAdd.push(...levelUpResult.logs);
    }
    pc.levelOnPreviousTurn = pc.level;


    // --- Identity, Appearance & Stat Increases ---
    if (response.playerNameChange) {
        pc.name = response.playerNameChange;
    }
    if (response.playerRaceChange) {
        pc.race = response.playerRaceChange;
    }
    if (response.playerClassChange) {
        pc.class = response.playerClassChange;
    }
    if (response.playerAppearanceChange) {
        pc.appearanceDescription = response.playerAppearanceChange;
    }
    if (typeof response.playerAutoCombatSkillChange === 'string') {
        if (response.playerAutoCombatSkillChange === 'clear') {
            pc.autoCombatSkill = null;
        } else {
            pc.autoCombatSkill = response.playerAutoCombatSkillChange;
        }
    }
     if (response.playerStealthStateChange) {
        pc.stealthState = response.playerStealthStateChange;
    }
    
    const ruToEnCharMap: Record<string, string> = {};
    const enCharKeys = Object.keys(charTranslations.en);
    for (const enKey of enCharKeys) {
        const ruValue = charTranslations.ru[enKey];
        if (ruValue) {
            ruToEnCharMap[ruValue.toLowerCase()] = enKey;
        }
    }

    const findEnglishCharKey = (statNameFromGm: string): string | undefined => {
        const lowerCaseStat = statNameFromGm.toLowerCase();
        // Check if it's already a valid english key (e.g., 'strength')
        if (enCharKeys.includes(lowerCaseStat)) {
            return lowerCaseStat;
        }
        // If not, check if it's a russian value in our reverse map (e.g., 'сила')
        return ruToEnCharMap[lowerCaseStat];
    };

    asArray(response.statsIncreased).forEach(statNameFromGm => {
        const englishKey = findEnglishCharKey(statNameFromGm);
        
        if (englishKey) {
            const standardKey = `standard${englishKey.charAt(0).toUpperCase() + englishKey.slice(1)}` as keyof PlayerCharacter['characteristics'];
            
            if(standardKey in pc.characteristics) {
                const trainingCap = pc.level * 2;
                const absoluteCap = 100;
                const effectiveCap = Math.min(trainingCap, absoluteCap);

                if (pc.characteristics[standardKey] < effectiveCap) {
                    pc.characteristics[standardKey] += 1;
                } else {
                    pc.experience += 25;
                    logsToAdd.push(t("stat_at_training_cap", { statName: t(englishKey), cap: effectiveCap }));
                }
            }
        } else {
            console.warn(`Unrecognized characteristic name in statsIncreased: "${statNameFromGm}"`);
        }
    });

    asArray(response.statsDecreased).forEach(statNameFromGm => {
        const englishKey = findEnglishCharKey(statNameFromGm);

        if (englishKey) {
            const standardKey = `standard${englishKey.charAt(0).toUpperCase() + englishKey.slice(1)}` as keyof PlayerCharacter['characteristics'];
            if(standardKey in pc.characteristics && pc.characteristics[standardKey] > 1) {
                pc.characteristics[standardKey] -= 1;
            }
        } else {
            console.warn(`Unrecognized characteristic name in statsDecreased: "${statNameFromGm}"`);
        }
    });

    // --- Effort Tracker ---
    if (response.playerEffortTrackerChange) {
        pc.effortTracker = response.playerEffortTrackerChange;
    }

    // --- Inventory Management ---
    const potentialNewItems: Item[] = [];
    asArray(response.inventoryItemsData)
        .filter(itemData => !itemData.existedId)
        .forEach(itemUpdate => {
            const isStackable = !itemUpdate.equipmentSlot && (itemUpdate.isConsumption || itemUpdate.type === 'Material' || typeof itemUpdate.count === 'number');
            if (isStackable && itemUpdate.name) {
                const existingStack = potentialNewItems.find(i => i.name === itemUpdate.name && isStackable);
                if (existingStack) {
                    existingStack.count += itemUpdate.count || 1;
                    return;
                }
            }
            potentialNewItems.push({ ...itemUpdate, existedId: generateId('item'), count: itemUpdate.count || 1 } as Item);
        });

    potentialNewItems.forEach(newItem => {
        if (newItem.contentsPath && newItem.contentsPath.length > 0) {
            const containerName = newItem.contentsPath[newItem.contentsPath.length - 1];
            const container = pc.inventory.find(i => i.isContainer && i.name === containerName);
            if (container && container.existedId) {
                const containerFullPath = (container.contentsPath ? [...container.contentsPath, container.name] : [container.name]).join('/');
                const itemsInContainer = pc.inventory.filter(i => i.contentsPath?.join('/') === containerFullPath);
                const currentVolumeInContainer = itemsInContainer.reduce((sum, item) => sum + (item.volume * item.count), 0);
                const capacityOk = container.capacity === null || itemsInContainer.length < container.capacity;
                const volumeOk = container.volume === null || (currentVolumeInContainer + (newItem.volume * newItem.count)) <= container.volume;

                if (!capacityOk || !volumeOk) {
                    const reason = !capacityOk ? t('container_full_capacity') : t('container_full_volume');
                    logsToAdd.push(t('item_moved_to_inventory_log', { itemName: newItem.name, containerName: container.name, reason }));
                    newItem.contentsPath = null;
                }
            } else {
                newItem.contentsPath = null;
            }
        }
    });

    const inventoryMap = new Map(pc.inventory.map(i => [i.existedId, i]));
    asArray(response.inventoryItemsData)
        .filter(itemData => itemData.existedId)
        .forEach(itemUpdate => {
            const existingItem = inventoryMap.get(itemUpdate.existedId!);
            if (existingItem) {
                Object.assign(existingItem, itemUpdate);
            }
        });

    pc.inventory.push(...potentialNewItems);

    asArray(response.inventoryItemsResources).forEach(resourceUpdate => {
        let itemToUpdate: Item | undefined;
        if (resourceUpdate.existedId) itemToUpdate = pc.inventory.find(i => i.existedId === resourceUpdate.existedId);
        if (!itemToUpdate && resourceUpdate.name) itemToUpdate = pc.inventory.find(i => i.name === resourceUpdate.name);

        if (itemToUpdate) {
            const oldResource = itemToUpdate.resource;

            itemToUpdate.resource = resourceUpdate.resource;
            if (resourceUpdate.maximumResource !== undefined) {
                itemToUpdate.maximumResource = resourceUpdate.maximumResource;
            }
            if (resourceUpdate.resourceType !== undefined) {
                itemToUpdate.resourceType = resourceUpdate.resourceType;
            }

            // If a resource was just depleted (went from >0 to <=0)
            if (oldResource !== undefined && oldResource > 0 && itemToUpdate.resource !== undefined && itemToUpdate.resource <= 0) {
                if (itemToUpdate.count > 0) {
                    // One item from the stack is depleted.
                    itemToUpdate.count -= 1;
                    logsToAdd.push(t("item_resource_depleted", { itemName: itemToUpdate.name }));

                    // Create the empty container item
                    const emptyItem: Item = {
                        ...JSON.parse(JSON.stringify(itemToUpdate)), // Deep copy to avoid reference issues
                        existedId: generateId('item'),
                        name: `${t('empty_item_prefix')} ${itemToUpdate.name}`,
                        description: t('empty_item_description', { originalName: itemToUpdate.name }),
                        count: 1,
                        resource: 0,
                        bonuses: [],
                        customProperties: [],
                        combatEffect: [],
                        isConsumption: false, // It's no longer a consumable in the same way
                        price: Math.max(1, Math.floor(itemToUpdate.price / 10)), // Drastically reduced price
                        contentsPath: null, // Empty items shouldn't be inside containers by default
                    };

                    // Add the new empty item to the inventory.
                    pc.inventory.push(emptyItem);

                    // If items remain in the original stack, reset its resource for the next use.
                    if (itemToUpdate.count > 0 && itemToUpdate.maximumResource !== undefined) {
                        itemToUpdate.resource = itemToUpdate.maximumResource;
                    }
                }
            }
        }
    });

    asArray(response.moveInventoryItems).forEach(move => {
        const itemToMove = pc.inventory.find(i => i.existedId === move.movedItemId);
        if (itemToMove) {
            itemToMove.contentsPath = move.destinationContentsPath;
        }
    });

    asArray(response.removeInventoryItems).forEach(itemToRemove => {
        // First, check if the item is equipped and unequip it.
        Object.keys(pc.equippedItems).forEach(slot => {
            if (pc.equippedItems[slot] === itemToRemove.removedItemId) {
                pc.equippedItems[slot] = null;
            }
        });
        // Then, remove it from the master inventory list.
        pc.inventory = pc.inventory.filter(i => i.existedId !== itemToRemove.removedItemId);
    });
    
    // Filter out items with count 0 and unequip them if they were equipped
    pc.inventory = pc.inventory.filter(item => {
        if (item.count <= 0) {
            Object.keys(pc.equippedItems).forEach(slot => {
                if (pc.equippedItems[slot] === item.existedId) {
                    pc.equippedItems[slot] = null;
                }
            });
            return false; // Remove from inventory
        }
        return true; // Keep in inventory
    });

    asArray(response.equipmentChanges).forEach(change => {
        if (change.action === 'equip') {
            let { itemId, itemName, targetSlots } = change;
            
            let itemToEquip: Item | undefined;

            // First, try to find the item object.
            // On turn 1, itemId is null and we must find the new item by name.
            if (!itemId && itemName) {
                // We search in the list of newly created items for this turn.
                itemToEquip = potentialNewItems.find(item => item.name === itemName);
            } else if (itemId) {
                // For subsequent turns, an ID is provided. pc.inventory contains all items (old and new).
                itemToEquip = pc.inventory.find(i => i.existedId === itemId);
            }

            // If we couldn't find the item, log an error and skip.
            if (!itemToEquip) {
                logsToAdd.push(`[System Warning] Auto-equip failed: could not find item named "${itemName}" or with ID "${itemId}".`);
                return; // continue to next change
            }
            
            // At this point, we have the itemToEquip object. We must use its ID for the slot map.
            itemId = itemToEquip.existedId;
            if (!itemId || !targetSlots) return;

            // Logic to handle unequipping items from occupied slots.
            const slotsToClear = new Set<string>();

            if (itemToEquip.requiresTwoHands) {
                slotsToClear.add('MainHand');
                slotsToClear.add('OffHand');
            } else {
                targetSlots.forEach((slot: string) => slotsToClear.add(slot));
                // If equipping a 1-handed item, and a 2-handed item is currently equipped, clear both hand slots.
                const mainHandId = pc.equippedItems['MainHand'];
                if (mainHandId && mainHandId === pc.equippedItems['OffHand']) {
                    const mainHandItem = pc.inventory.find(i => i.existedId === mainHandId);
                    if (mainHandItem && mainHandItem.requiresTwoHands) {
                         slotsToClear.add('MainHand');
                         slotsToClear.add('OffHand');
                    }
                }
            }

            // Unequip items from the slots that will be occupied.
            slotsToClear.forEach(slot => {
                if (pc.equippedItems[slot]) {
                    pc.equippedItems[slot] = null;
                }
            });

            // Equip the new item.
            if (itemToEquip.requiresTwoHands) {
                pc.equippedItems['MainHand'] = itemId;
                pc.equippedItems['OffHand'] = itemId;
            } else {
                targetSlots.forEach((slot: string) => {
                    pc.equippedItems[slot] = itemId;
                });
            }

        } else if (change.action === 'unequip') {
            const { sourceSlots } = change;
            sourceSlots.forEach((slot: string) => {
                pc.equippedItems[slot] = null;
            });
        }
    });
    
    // Auto-unequip broken items
    pc.inventory.forEach(item => {
        if (item.durability === '0%') {
            Object.keys(pc.equippedItems).forEach(slot => {
                if (pc.equippedItems[slot] === item.existedId) {
                    pc.equippedItems[slot] = null;
                    logsToAdd.push(t("item_broke_unequipped", { itemName: item.name }));
                }
            });
        }
    });

    asArray(response.itemBondLevelChanges).forEach(change => {
        const item = pc.inventory.find(i => i.existedId === change.itemId);
        if(item) item.ownerBondLevelCurrent = change.newBondLevel;
    });

    asArray(response.itemFateCardUnlocks).forEach(unlock => {
        const item = pc.inventory.find(i => i.existedId === unlock.itemId);
        if(item && item.fateCards) {
            const card = item.fateCards.find(c => c.cardId === unlock.cardId);
            if(card) card.isUnlocked = true;
        }
    });

    // --- Recipes ---
    pc.knownRecipes = upsertEntities(pc.knownRecipes, asArray(response.addOrUpdateRecipes), 'recipeName', 'recipeName');
    const recipesToRemove = new Set(asArray(response.removeRecipes));
    if(recipesToRemove.size > 0){
        pc.knownRecipes = pc.knownRecipes.filter(r => !recipesToRemove.has(r.recipeName));
    }

    // --- Skills & Mastery ---
    pc.activeSkills = upsertEntities(pc.activeSkills, asArray(response.activeSkillChanges), 'skillName', 'skillName');
    const skillsToRemove = new Set(asArray(response.removeActiveSkills));
    if (skillsToRemove.size > 0) pc.activeSkills = pc.activeSkills.filter(s => !skillsToRemove.has(s.skillName));
    
    pc.passiveSkills = upsertEntities(pc.passiveSkills, asArray(response.passiveSkillChanges), 'skillName', 'skillName');
    const passiveSkillsToRemove = new Set(asArray(response.removePassiveSkills));
    if (passiveSkillsToRemove.size > 0) pc.passiveSkills = pc.passiveSkills.filter(s => !passiveSkillsToRemove.has(s.skillName));

    pc.skillMasteryData = upsertEntities(pc.skillMasteryData, asArray(response.skillMasteryChanges).map(c => ({
        skillName: c.skillName,
        currentMasteryLevel: c.newMasteryLevel,
        currentMasteryProgress: c.newCurrentMasteryProgress,
        masteryProgressNeeded: c.newMasteryProgressNeeded,
        maxMasteryLevel: c.newMaxMasteryLevel
    })), 'skillName', 'skillName');

    // --- Effects & Wounds (Player) ---
    const newNextPlayerEffects: Effect[] = [];
    const serverChangesToProcess = [...asArray(response.playerActiveEffectsChanges)];
    const existingEffectsToProcess = [...(pc.activePlayerEffects || [])];

    while (serverChangesToProcess.length > 0) {
        const change = serverChangesToProcess.shift()!;
        let matchIndex = -1;

        if (change.effectId) {
            matchIndex = existingEffectsToProcess.findIndex(ef => ef.effectId === change.effectId);
        }

        if (matchIndex === -1) {
             matchIndex = existingEffectsToProcess.findIndex(ef => getEffectKey(ef) === getEffectKey(change));
        }

        if (matchIndex !== -1) {
            const existing = existingEffectsToProcess.splice(matchIndex, 1)[0];
            const updatedEffect = { ...existing, ...change };
            newNextPlayerEffects.push(updatedEffect);
        } else {
            const newEffect = { ...change };
            if (!newEffect.effectId) {
                newEffect.effectId = generateId('effect');
            }
            newNextPlayerEffects.push(newEffect as Effect);
        }
    }

    existingEffectsToProcess.forEach(existingEffect => {
        if (advanceTurn && existingEffect.duration < 999 && existingEffect.duration > 0) {
            newNextPlayerEffects.push({ ...existingEffect, duration: existingEffect.duration - 1 });
        } else {
            newNextPlayerEffects.push(existingEffect);
        }
    });

    pc.activePlayerEffects = newNextPlayerEffects.filter(effect => {
        if (effect.duration === 0) {
            const wasInOriginalChanges = asArray(response.playerActiveEffectsChanges).some(e => {
                let match = false;
                if (e.effectId && effect.effectId) {
                    match = (e.effectId === effect.effectId);
                } else {
                    match = (getEffectKey(e) === getEffectKey(effect));
                }
                return match && e.duration === 0;
            });

            if (wasInOriginalChanges) {
                 logsToAdd.push(t("Effect '{effectName}' has been removed.", { effectName: effect.sourceSkill || effect.description }));
            } else {
                 logsToAdd.push(t("Effect '{effectName}' has expired.", { effectName: effect.sourceSkill || effect.description }));
            }
            return false;
        }
        return true;
    });
    
    const playerWoundChangesCleaned = asArray(response.playerWoundChanges).map(change => {
        const woundData: Partial<Wound> = {
            woundId: change.woundId,
            woundName: change.woundName,
            severity: change.severity,
            descriptionOfEffects: change.descriptionOfEffects,
            generatedEffects: change.generatedEffects,
            healingState: change.healingState,
        };
        if (!woundData.healingState) {
            woundData.healingState = {
                currentState: 'Untreated',
                description: 'The wound is fresh and requires attention.',
                treatmentProgress: 0,
                progressNeeded: 20, // A reasonable default
                nextState: 'Stabilized',
                canBeImprovedBy: ['First Aid check']
            };
        }
        return woundData;
    });
    pc.playerWounds = upsertEntities(pc.playerWounds, playerWoundChangesCleaned, 'woundId', 'woundName');


    // --- NPCs ---
    newState.encounteredNPCs = upsertEntities(newState.encounteredNPCs, asArray(response.NPCsData), 'NPCId', 'name');
    
    asArray(response.NPCsRenameData).forEach(rename => {
        const npc = newState.encounteredNPCs.find(n => n.name && n.name.toLowerCase() === rename.oldName.toLowerCase());
        if(npc) npc.name = rename.newName;
    });

    const findNpc = (change: { NPCId?: string | null, NPCName?: string, name?: string }): NPC | undefined => {
        let npc: NPC | undefined;
        if (change.NPCId) {
            npc = newState.encounteredNPCs.find(n => n.NPCId && n.NPCId.toLowerCase() === String(change.NPCId).toLowerCase());
        }
        if (!npc) {
            const nameToFind = change.NPCName || change.name;
            if (nameToFind) {
                npc = newState.encounteredNPCs.find(n => n.name && n.name.toLowerCase() === String(nameToFind).toLowerCase());
            }
        }
        return npc;
    };
    
    asArray(response.NPCActiveSkillChanges).forEach(change => {
        const npc = findNpc(change);
        if (npc) {
            npc.activeSkills = upsertEntities(npc.activeSkills || [], asArray(change.skillChanges), 'skillName', 'skillName');
            const skillsToRemove = new Set(asArray(change.skillsToRemove));
            if (skillsToRemove.size > 0) npc.activeSkills = (npc.activeSkills || []).filter(s => !skillsToRemove.has(s.skillName));
        }
    });

    asArray(response.NPCPassiveSkillChanges).forEach(change => {
        const npc = findNpc(change);
        if (npc) {
            npc.passiveSkills = upsertEntities(npc.passiveSkills || [], asArray(change.skillChanges), 'skillName', 'skillName');
            const skillsToRemove = new Set(asArray(change.skillsToRemove));
            if (skillsToRemove.size > 0) npc.passiveSkills = (npc.passiveSkills || []).filter(s => !skillsToRemove.has(s.skillName));
        }
    });

    asArray(response.NPCSkillMasteryChanges).forEach(change => {
        const npc = findNpc(change);
        if (npc) {
            if(!npc.skillMasteryData) npc.skillMasteryData = [];
            npc.skillMasteryData = upsertEntities(npc.skillMasteryData, [({
                skillName: change.skillName,
                currentMasteryLevel: change.newMasteryLevel,
                currentMasteryProgress: change.newCurrentMasteryProgress,
                masteryProgressNeeded: change.newMasteryProgressNeeded,
                maxMasteryLevel: change.newMaxMasteryLevel
            })], 'skillName', 'skillName');
        }
    });
    
    asArray(response.NPCPassiveSkillMasteryChanges).forEach(change => {
        const npc = findNpc(change);
        if (npc && npc.passiveSkills) {
            const skill = npc.passiveSkills.find(s => s.skillName.toLowerCase() === change.skillName.toLowerCase());
            if (skill) {
                if (change.newMasteryLevel !== undefined) skill.masteryLevel = change.newMasteryLevel;
                if (change.newMaxMasteryLevel !== undefined) skill.maxMasteryLevel = change.newMaxMasteryLevel;
            }
        }
    });

    asArray(response.NPCInventoryResourcesChanges).forEach(change => {
        const npc = findNpc(change);
        if (npc && npc.inventory) {
            const item = npc.inventory.find(i => i.existedId === change.itemId || i.name === change.itemName);
            if (item) {
                item.resource = change.newResourceValue;
                if (change.maximumResource !== undefined) item.maximumResource = change.maximumResource;
                if (change.resourceType !== undefined) item.resourceType = change.resourceType;
            }
        }
    });
    
    // --- Effects & Wounds (NPC) ---
    const npcEffectChangesFromServer = asArray(response.NPCEffectChanges);
    newState.encounteredNPCs.forEach(npc => {
        if (!npc.activeEffects) npc.activeEffects = [];
        const serverUpdateForNpc = npcEffectChangesFromServer.find(c => (c.NPCId && c.NPCId === npc.NPCId) || c.NPCName === npc.name);
        
        const serverChangesForNpcToProcess = serverUpdateForNpc ? [...asArray(serverUpdateForNpc.effectsApplied)] : [];
        const existingNpcEffectsToProcess = [...(npc.activeEffects || [])];
        const nextNpcEffects: Effect[] = [];

        while (serverChangesForNpcToProcess.length > 0) {
            const change = serverChangesForNpcToProcess.shift()!;
            let matchIndex = -1;

            if (change.effectId) {
                matchIndex = existingNpcEffectsToProcess.findIndex(ef => ef.effectId === change.effectId);
            }
            
            if (matchIndex === -1) {
                matchIndex = existingNpcEffectsToProcess.findIndex(ef => getEffectKey(ef) === getEffectKey(change));
            }

            if (matchIndex !== -1) {
                const existing = existingNpcEffectsToProcess.splice(matchIndex, 1)[0];
                const updatedEffect = { ...existing, ...change };
                nextNpcEffects.push(updatedEffect);
            } else {
                const newEffect = { ...change };
                if (!newEffect.effectId) {
                    newEffect.effectId = generateId('effect');
                }
                nextNpcEffects.push(newEffect as Effect);
            }
        }

        existingNpcEffectsToProcess.forEach(existingEffect => {
            if (advanceTurn && existingEffect.duration < 999 && existingEffect.duration > 0) {
                nextNpcEffects.push({ ...existingEffect, duration: existingEffect.duration - 1 });
            } else {
                nextNpcEffects.push(existingEffect);
            }
        });
        
        npc.activeEffects = nextNpcEffects.filter(effect => {
            if (effect.duration === 0) {
                 const serverChangesForNpcOriginal = serverUpdateForNpc ? asArray(serverUpdateForNpc.effectsApplied) : [];
                 const wasInOriginalChanges = serverChangesForNpcOriginal.some(e => {
                     let match = false;
                     if (e.effectId && effect.effectId) match = e.effectId === effect.effectId;
                     else match = getEffectKey(e) === getEffectKey(effect);
                     return match && e.duration === 0;
                 });
                 if (wasInOriginalChanges) {
                      logsToAdd.push(t("NPCEffect '{effectName}' on {npcName} has been removed.", { effectName: effect.sourceSkill || effect.description, npcName: npc.name }));
                 } else {
                      logsToAdd.push(t("NPCEffect '{effectName}' on {npcName} has expired.", { effectName: effect.sourceSkill || effect.description, npcName: npc.name }));
                 }
                return false;
            }
            return true;
        });
    });

    asArray(response.NPCJournals).forEach(journal => {
        const npc = findNpc(journal);
        if (npc) {
            if (!npc.journalEntries) npc.journalEntries = [];
            npc.journalEntries.unshift(journal.lastJournalNote);
        }
    });

    // --- NPC JOURNAL PRUNING ---
    if (advanceTurn && gameSettings?.keepLatestNpcJournals) {
        const countToKeep = gameSettings.latestNpcJournalsCount || 20;
        newState.encounteredNPCs.forEach(npc => {
            if (npc.journalEntries && npc.journalEntries.length > countToKeep) {
                npc.journalEntries = npc.journalEntries.slice(0, countToKeep);
            }
        });
    }

    asArray(response.NPCUnlockedMemories).forEach(memory => {
        const npc = findNpc(memory);
        if (npc) {
            if (!npc.unlockedMemories) npc.unlockedMemories = [];
            if (!npc.unlockedMemories.some(m => m.memoryId === memory.memoryId)) {
                npc.unlockedMemories.push(memory as UnlockedMemory);
                npc.unlockedMemories.sort((a, b) => b.unlockedAtRelationshipLevel - a.unlockedAtRelationshipLevel);
            }
        }
    });

    asArray(response.NPCRelationshipChanges).forEach(change => {
        const npc = findNpc(change);
        if(npc) npc.relationshipLevel = change.newRelationshipLevel;
    });

    asArray(response.NPCFateCardUnlocks).forEach(unlock => {
        const npc = findNpc({ NPCId: unlock.NPCId });
        if(npc && npc.fateCards) {
            const card = npc.fateCards.find(c => c.cardId === unlock.cardId);
            if(card) card.isUnlocked = true;
        }
    });
    
    asArray(response.NPCWoundChanges).forEach(change => {
        const npc = findNpc(change);
        if (npc) {
            if (!npc.wounds) {
                npc.wounds = [];
            }
            const woundData: Partial<Wound> = {
                woundId: change.woundId,
                woundName: change.woundName,
                severity: change.severity,
                descriptionOfEffects: change.descriptionOfEffects,
                generatedEffects: change.generatedEffects,
                healingState: change.healingState,
            };
            // If healingState is missing, create a default one. This makes the system more robust against AI errors.
            if (!woundData.healingState) {
                woundData.healingState = {
                    currentState: 'Untreated',
                    description: 'The wound is fresh and requires attention.',
                    treatmentProgress: 0,
                    progressNeeded: 20, // A reasonable default
                    nextState: 'Stabilized',
                    canBeImprovedBy: ['First Aid check']
                };
            }
            npc.wounds = upsertEntities(npc.wounds, [woundData], 'woundId', 'woundName');
        }
    });
    
    asArray(response.NPCCustomStateChanges).forEach((change: NPCCustomStateChange) => {
        const npc = findNpc(change);
        if (npc) {
            if (!npc.customStates) {
                npc.customStates = [];
            }
            npc.customStates = upsertEntities(npc.customStates, asArray(change.stateChanges), 'stateId', 'stateName');
        }
    });

    // --- NPC Inventory & Equipment Management ---
    const newlyAddedNpcItems = new Map<string, Map<string, Item>>();

    asArray((response as any).NPCInventoryAdds).forEach((add: any) => {
        const npc = findNpc(add);
        if (npc) {
            if (!npc.inventory) npc.inventory = [];
            const newItem = { ...add.item };
            if (!newItem.existedId) {
                newItem.existedId = generateId('item');
            }

            if (npc.NPCId) {
                if (!newlyAddedNpcItems.has(npc.NPCId)) {
                    newlyAddedNpcItems.set(npc.NPCId, new Map());
                }
                newlyAddedNpcItems.get(npc.NPCId)!.set(newItem.name, newItem as Item);
            }

            const isStackable = !newItem.equipmentSlot && (newItem.isConsumption || newItem.type === 'Material' || typeof newItem.count === 'number');
            if (isStackable) {
                const existingStack = npc.inventory.find(i => i.name === newItem.name && !i.equipmentSlot);
                if (existingStack) {
                    existingStack.count += newItem.count || 1;
                    return;
                }
            }
            npc.inventory.push(newItem as Item);
        }
    });

    asArray((response as any).NPCInventoryUpdates).forEach((update: any) => {
        const npc = findNpc(update);
        if (npc && npc.inventory) {
            const itemToUpdate = npc.inventory.find(i => i.existedId === update.itemUpdate.existedId);
            if (itemToUpdate) {
                Object.assign(itemToUpdate, update.itemUpdate);
            }
        }
    });

    newState.encounteredNPCs.forEach(npc => {
        if (npc.inventory) {
            npc.inventory = npc.inventory.filter(item => {
                if (item.count <= 0) {
                    if (npc.equippedItems) {
                        Object.keys(npc.equippedItems).forEach(slot => {
                            if (npc.equippedItems?.[slot] === item.existedId) {
                                npc.equippedItems[slot] = null;
                            }
                        });
                    }
                    return false;
                }
                return true;
            });
        }
    });

    asArray((response as any).NPCInventoryRemovals).forEach((removal: any) => {
        const npc = findNpc(removal);
        if (npc && npc.inventory) {
            if (npc.equippedItems) {
                Object.keys(npc.equippedItems).forEach(slot => {
                    if (npc.equippedItems?.[slot] === removal.itemId) {
                        npc.equippedItems[slot] = null;
                    }
                });
            }
            npc.inventory = npc.inventory.filter(i => i.existedId !== removal.itemId);
        }
    });
    
    asArray((response as any).NPCEquipmentChanges).forEach((change: any) => {
        const npc = findNpc(change);
        if (!npc) return;

        if (!npc.inventory) npc.inventory = [];
        if (!npc.equippedItems) {
            npc.equippedItems = { Head: null, Neck: null, Chest: null, Back: null, MainHand: null, OffHand: null, Hands: null, Wrists: null, Waist: null, Legs: null, Feet: null, Finger1: null, Finger2: null };
        }

        if (change.action === 'equip') {
            let itemToEquip: Item | undefined;

            if (!change.itemId && change.itemName && npc.NPCId) {
                itemToEquip = newlyAddedNpcItems.get(npc.NPCId)?.get(change.itemName);
            } else if (change.itemId) {
                itemToEquip = npc.inventory.find(i => i.existedId === change.itemId);
            }

            if (itemToEquip && itemToEquip.existedId && change.targetSlots) {
                const slotsToClear = new Set<string>();
                const inventory = npc.inventory as Item[];

                if (itemToEquip.requiresTwoHands) {
                    slotsToClear.add('MainHand');
                    slotsToClear.add('OffHand');
                } else {
                    change.targetSlots.forEach((slot: string) => slotsToClear.add(slot));
                    const mainHandId = npc.equippedItems['MainHand'];
                    if (mainHandId && mainHandId === npc.equippedItems['OffHand']) {
                        const mainHandItem = inventory.find(i => i.existedId === mainHandId);
                        if (mainHandItem && mainHandItem.requiresTwoHands) {
                            slotsToClear.add('MainHand');
                            slotsToClear.add('OffHand');
                        }
                    }
                }
                
                slotsToClear.forEach(slot => {
                    if (npc.equippedItems?.[slot]) {
                        npc.equippedItems[slot] = null;
                    }
                });

                if (itemToEquip.requiresTwoHands) {
                    npc.equippedItems['MainHand'] = itemToEquip.existedId;
                    npc.equippedItems['OffHand'] = itemToEquip.existedId;
                } else {
                    change.targetSlots.forEach((slot: string) => {
                        if(npc.equippedItems) npc.equippedItems[slot] = itemToEquip!.existedId;
                    });
                }
            }
        } else if (change.action === 'unequip') {
            if (change.sourceSlots) {
                change.sourceSlots.forEach((slot: string) => {
                    if (npc.equippedItems?.[slot] === change.itemId) {
                        npc.equippedItems[slot] = null;
                    }
                });
            }
        }
    });

    // --- Final Recalculations & State Assignment ---
    pc = recalculateDerivedStats(pc);
    pc = recalculateAllWeights(pc);
    newState.playerCharacter = pc;

    // Recalculate derived stats for ALL encountered NPCs to ensure data consistency
    newState.encounteredNPCs = newState.encounteredNPCs.map(npc => {
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

    if (response.currentLocationData) {
        // FIX: Ensure new locations from the GM get a unique ID.
        // On turn 1, the GM generates the *real* starting location, which arrives with a null ID.
        // We must assign one here so it can be correctly added to the world map and tracked.
        const newLocationDataWithId = { ...response.currentLocationData };
        if (!newLocationDataWithId.locationId) {
            newLocationDataWithId.locationId = generateId('loc');
        }
        newState.currentLocationData = newLocationDataWithId;
    }
    
    // First, update the list of active quests with any changes from the response.
    // This will add new quests or update the status of existing ones.
    newState.activeQuests = upsertEntities(newState.activeQuests, asArray(response.questUpdates), 'questId', 'questName');
    
    // Identify any quests in the (now updated) active list that have been completed or failed this turn.
    const justCompletedOrFailed = newState.activeQuests.filter(q => q.status === 'Completed' || q.status === 'Failed');

    // Add these newly completed/failed quests to the persistent list of completed quests.
    // upsertEntities will prevent duplicates if a quest was somehow already there.
    newState.completedQuests = upsertEntities(newState.completedQuests, justCompletedOrFailed, 'questId', 'questName');
    
    // Now, filter the active quests list to remove those that are no longer active.
    newState.activeQuests = newState.activeQuests.filter(q => q.status !== 'Completed' && q.status !== 'Failed');
    
    newState.lastUpdatedQuestId = response.questUpdates && response.questUpdates.length > 0 ? response.questUpdates[response.questUpdates.length - 1].questId : null;
    
    newState.encounteredFactions = upsertEntities(newState.encounteredFactions, asArray(response.factionDataChanges), 'factionId', 'name');
    
    // Handle enemiesData: null/undefined = no change, [] = clear, [...] = upsert
    if (response.enemiesData !== null && response.enemiesData !== undefined) {
        if (Array.isArray(response.enemiesData) && response.enemiesData.length === 0) {
            newState.enemiesData = [];
        } else {
            newState.enemiesData = upsertEntities(newState.enemiesData || [], asArray(response.enemiesData), 'NPCId', 'name');
        }
    }

    // Handle alliesData: null/undefined = no change, [] = clear, [...] = upsert
    if (response.alliesData !== null && response.alliesData !== undefined) {
        if (Array.isArray(response.alliesData) && response.alliesData.length === 0) {
            newState.alliesData = [];
        } else {
            newState.alliesData = upsertEntities(newState.alliesData || [], asArray(response.alliesData), 'NPCId', 'name');
        }
    }
    
    newState.playerCustomStates = upsertEntities(newState.playerCustomStates || [], asArray(response.customStateChanges), 'stateId', 'stateName');
    newState.playerCharacter.playerCustomStates = newState.playerCustomStates; // SYNC THE TWO
    newState.plotOutline = response.plotOutline || newState.plotOutline;
    if (response.playerStatus) {
        newState.playerStatus = response.playerStatus;
    }

    const flagUpdates = asArray(response.worldStateFlags).reduce((acc, flag) => {
        if (flag && flag.flagId) {
            acc[flag.flagId] = flag as WorldStateFlag;
        }
        return acc;
    }, {} as Record<string, WorldStateFlag>);
    newState.worldStateFlags = { ...newState.worldStateFlags, ...flagUpdates };


    const finalWeight = newState.playerCharacter.totalWeight;
    const maxWeight = newState.playerCharacter.maxWeight + newState.playerCharacter.criticalExcessWeight;
    if (finalWeight > maxWeight) {
        const excessWeight = finalWeight - maxWeight;
        const itemsToStash: Item[] = [];
        let weightToShed = excessWeight;
        
        const sortedNewItems = potentialNewItems.sort((a,b) => (b.weight * b.count) - (a.weight * a.count));
        
        for (const item of sortedNewItems) {
            if (weightToShed <= 0) break;
            const itemWeight = item.weight * item.count;
            itemsToStash.push(item);
            weightToShed -= itemWeight;
        }

        if (itemsToStash.length > 0) {
            newState.playerCharacter.inventory = newState.playerCharacter.inventory.filter(i => !itemsToStash.some(s => s.existedId === i.existedId));
            newState.temporaryStash = [...(newState.temporaryStash || []), ...itemsToStash];
            logsToAdd.push(t("items_moved_to_stash_log"));
        }
        
        newState.playerCharacter = recalculateAllWeights(newState.playerCharacter);
    }
    
    return { newState, logsToAdd, combatLogsToAdd };
};
