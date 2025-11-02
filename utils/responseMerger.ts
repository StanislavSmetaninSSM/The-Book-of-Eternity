import { GameResponse } from '../types';

const isObject = (item: any): item is object => {
    return (item && typeof item === 'object' && !Array.isArray(item));
};

// Keys for arrays that should be merged by entity ID or name
const entityMergeKeys: { key: keyof GameResponse, idField: string, nameField?: string }[] = [
    { key: 'inventoryItemsData', idField: 'existedId', nameField: 'name' },
    { key: 'NPCsData', idField: 'NPCId', nameField: 'name' },
    { key: 'questUpdates', idField: 'questId', nameField: 'questName' },
    { key: 'factionDataChanges', idField: 'factionId', nameField: 'name' },
    { key: 'worldStateFlags', idField: 'flagId', nameField: 'displayName' },
    { key: 'worldEventsLog', idField: 'eventId', nameField: 'headline' },
    { key: 'customStateChanges', idField: 'stateId', nameField: 'stateName' },
    { key: 'playerWoundChanges', idField: 'woundId', nameField: 'woundName' },
    { key: 'NPCWoundChanges', idField: 'woundId', nameField: 'woundName' },
    { key: 'activeSkillChanges', idField: 'skillName' },
    { key: 'passiveSkillChanges', idField: 'skillName' },
    { key: 'skillMasteryChanges', idField: 'skillName' },
    { key: 'addOrUpdateRecipes', idField: 'recipeName' },
];

const nestedEntityMergeConfig: Record<string, { idField: string, nameField?: string, compositeKey?: (item: any) => string }> = {
    // Faction
    ranks: { idField: '', nameField: 'rankNameMale' },
    structuredBonuses: { idField: 'bonusId', nameField: 'description' },
    customStates: { idField: 'stateId', nameField: 'stateName' },
    activeProjects: { idField: 'projectId', nameField: 'projectName' },
    completedProjects: { idField: 'projectId', nameField: 'projectName' },
    relations: { idField: 'targetFactionId' },
    
    // NPC / Player
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
    unlockedMemories: { idField: 'memoryId' },
    factionAffiliations: { idField: 'factionId' },
    completedActivities: { idField: '', compositeKey: (item: any) => `${item.activityName}_${item.completionTurn}` },
    
    // Location
    adjacencyMap: { idField: '', compositeKey: (item: any) => `${item.targetCoordinates.x},${item.targetCoordinates.y}` },
    factionControl: { idField: 'factionId' },
    locationStorages: { idField: 'storageId' },
    activeThreats: { idField: 'threatId', nameField: 'name' },
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


/**
 * Deeply merges a source object into a target object.
 * - Recursively merges nested objects.
 * - Concatenates simple arrays and removes duplicates.
 * - Intelligently merges arrays of objects based on unique keys (ID or name) to prevent duplicates.
 * - Allows `null` from the source to overwrite values in the target ONLY if the target value is not already set.
 * @param target The original object.
 * @param source The object with new/updated data.
 * @returns A new object representing the merged state.
 */
export const deepMergeResponses = (target: any, source: any): any => {
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            const sourceValue = source[key];
            const targetValue = output[key];
            const keyTyped = key as keyof GameResponse;

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
                    const entityMergeConfig = entityMergeKeys.find(k => k.key === keyTyped);
                    const nestedConfig = nestedEntityMergeConfig[key as keyof typeof nestedEntityMergeConfig];

                    if (entityMergeConfig) {
                        output[key] = mergeEntities(targetValue, sourceValue, entityMergeConfig.idField, entityMergeConfig.nameField);
                    } else if (nestedConfig) {
                        output[key] = mergeEntities(targetValue, sourceValue, nestedConfig.idField, nestedConfig.nameField, nestedConfig.compositeKey);
                    } else if (sourceValue.every(item => typeof item === 'string' || typeof item === 'number' || item === null || item === undefined)) {
                        const combined = targetValue.concat(sourceValue);
                        output[key] = [...new Set(combined.filter(item => item !== null && item !== undefined))];
                    } else {
                        output[key] = targetValue.concat(sourceValue);
                    }
                } else {
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
