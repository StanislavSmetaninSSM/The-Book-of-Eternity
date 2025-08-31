

import { GameState, GameContext, ChatMessage, GameResponse, PlayerCharacter, LocationData, Characteristics, Location, Faction, Language, LootTemplate, UnlockedMemory, Recipe, Item, WorldStateFlag, SkillMastery, GameSettings, WorldState, NPC, Effect, WorldEvent, PassiveSkill } from '../types';
import { gameData } from './localizationGameData';
import { generateLootTemplates } from './lootGenerator';

const CHARACTERISTICS_LIST = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'faith', 'attractiveness', 'trade', 'persuasion', 'perception', 'luck', 'speed'];
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const BIOME_WEATHER: Record<string, string[]> = {
    TemperateForest: ['Clear', 'Cloudy', 'Overcast', 'Foggy', 'Light Rain', 'Heavy Rain', 'Storm'],
    Plains: ['Clear', 'Cloudy', 'Overcast', 'Foggy', 'Light Rain', 'Heavy Rain', 'Storm'],
    Desert: ['Clear', 'Scorching Sun', 'Cloudy', 'Windy', 'Sandstorm'],
    ArcticTundra: ['Clear', 'Frigid Air', 'Cloudy', 'Light Snow', 'Heavy Snow', 'Blizzard'],
    Mountains: ['Clear', 'Frigid Air', 'Cloudy', 'Light Snow', 'Heavy Snow', 'Blizzard'],
    Swamp: ['Clear', 'Humid', 'Misty', 'Foggy', 'Drizzle', 'Downpour'],
    Coastal: ['Clear', 'Cloudy', 'Foggy', 'Light Rain', 'Heavy Rain', 'Storm'],
    Urban: ['Clear', 'Cloudy', 'Overcast', 'Foggy', 'Light Rain', 'Heavy Rain', 'Storm'],
    Unique: ['Clear', 'Cloudy', 'Rain', 'Storm', 'Snow', 'Foggy'], // a generic fallback
};

export function recalculateDerivedStats<T extends PlayerCharacter | NPC>(pc: T): T {
  const newPc = JSON.parse(JSON.stringify(pc)); // Work on a copy
  
  const stdStr = newPc.characteristics.standardStrength;
  const stdCon = newPc.characteristics.standardConstitution;
  const stdInt = newPc.characteristics.standardIntelligence;
  const stdWis = newPc.characteristics.standardWisdom;
  const stdFth = newPc.characteristics.standardFaith;
  const stdLck = newPc.characteristics.standardLuck;

  newPc.maxHealth = 100 + Math.floor(stdCon * 2.0) + Math.floor(stdStr * 1.0);
  newPc.maxEnergy = 100 + Math.floor(stdCon * 0.75) + Math.floor(stdInt * 0.75) + Math.floor(stdWis * 0.75) + Math.floor(stdFth * 0.75);
  newPc.maxWeight = 30 + Math.floor(stdStr * 1.8 + stdCon * 0.4);
  newPc.critChanceBuffFromLuck = Math.floor(stdLck / 20);
  newPc.critChanceThreshold = 20 - newPc.critChanceBuffFromLuck;
  
  if (newPc.currentHealth === undefined) newPc.currentHealth = newPc.maxHealth;
  if (newPc.currentEnergy === undefined) newPc.currentEnergy = newPc.maxEnergy;

  newPc.currentHealth = Math.min(newPc.currentHealth, newPc.maxHealth);
  newPc.currentEnergy = Math.min(newPc.currentEnergy, newPc.maxEnergy);

  // Recalculate all modified stats
  CHARACTERISTICS_LIST.forEach(char => {
    const charCapitalized = char.charAt(0).toUpperCase() + char.slice(1);
    const standardKey = `standard${charCapitalized}` as keyof PlayerCharacter['characteristics'];
    const modifiedKey = `modified${charCapitalized}` as keyof PlayerCharacter['characteristics'];

    const standardValue = newPc.characteristics[standardKey];
    let flatBonusTotal = 0;
    let percentageBonusTotal = 0;

    // 1. Bonuses from equipped items (flat)
    Object.values(newPc.equippedItems || {}).forEach((itemId: string | null) => {
        if (!itemId) return;
        const item = (newPc.inventory || []).find((i: Item) => i.existedId === itemId);
        if (!item) return;

        // Prioritize new structuredBonuses for mechanics
        if (item.structuredBonuses && item.structuredBonuses.length > 0) {
            item.structuredBonuses.forEach(bonus => {
                if (
                    bonus.bonusType === 'Characteristic' &&
                    bonus.target.toLowerCase() === char.toLowerCase() &&
                    bonus.application === 'Permanent' && // 'Permanent' here means 'while equipped'
                    bonus.valueType === 'Flat' &&
                    typeof bonus.value === 'number'
                ) {
                    flatBonusTotal += bonus.value;
                }
            });
        } 
        // Fallback to old `bonuses` array for backward compatibility
        else if (item.bonuses) {
            item.bonuses.forEach((bonus: string) => {
                const match = bonus.match(/^([+-]?\d+)\s+(.+)$/);
                if (match && match[2].toLowerCase() === char) {
                    flatBonusTotal += parseInt(match[1]);
                }
            });
        }
    });

    // 2. Bonuses from passive skills (flat)
    (newPc.passiveSkills || []).forEach((skill: PassiveSkill) => {
        let bonusApplied = false;
        if (skill.structuredBonuses && skill.structuredBonuses.length > 0) {
            skill.structuredBonuses.forEach(bonus => {
                if (
                    bonus.bonusType === 'Characteristic' &&
                    bonus.target.toLowerCase() === char.toLowerCase() &&
                    bonus.application === 'Permanent' &&
                    bonus.valueType === 'Flat' &&
                    typeof bonus.value === 'number'
                ) {
                    flatBonusTotal += bonus.value;
                    bonusApplied = true;
                }
            });
        }
        
        // Legacy Fallback for old save data without structuredBonuses
        if (!bonusApplied && skill.playerStatBonus) {
            const match = skill.playerStatBonus.match(/^([+-]?\d+)\s+(.+)$/);
            const charName = match?.[2]?.toLowerCase();
            // This is a brittle check assuming English characteristic names in the bonus string,
            // but it's necessary for backward compatibility.
            if (match && charName && CHARACTERISTICS_LIST.includes(charName) && charName === char) {
                flatBonusTotal += parseInt(match[1]);
            }
        }
    });

    // 3. Bonuses from temporary effects (percentage)
    (newPc.activePlayerEffects || []).forEach((effect: any) => {
        if ((effect.effectType === 'Buff' || effect.effectType === 'Debuff') && effect.targetType === char) {
            if (typeof effect.value === 'string' && effect.value.includes('%')) {
                const percentageValue = parseInt(effect.value.replace('%', ''));
                if (!isNaN(percentageValue)) {
                    percentageBonusTotal += percentageValue;
                }
            }
        }
    });

    // Calculate the final modified value using (Base + Flat) * (1 + Percentage)
    const modifiedValue = Math.round((standardValue + flatBonusTotal) * (1 + (percentageBonusTotal / 100)));

    newPc.characteristics[modifiedKey] = modifiedValue;
  });

  return newPc;
}


export function updateWorldMap(
    currentMap: Record<string, Location>, 
    updates: any, 
    newLocationData: LocationData
): Record<string, Location> {
    const newMap = JSON.parse(JSON.stringify(currentMap));

    if (newLocationData && newLocationData.locationId) {
        newMap[newLocationData.locationId] = {
            ...(newMap[newLocationData.locationId] || {}),
            ...newLocationData
        };
    }
    
    if (updates && updates.newLinks) {
        updates.newLinks.forEach((linkUpdate: any) => {
            const sourceLocation = newMap[linkUpdate.sourceLocationId];
            if (sourceLocation) {
                if (!sourceLocation.adjacencyMap) {
                    sourceLocation.adjacencyMap = [];
                }
                if (!sourceLocation.adjacencyMap.some((l: any) => l.name === linkUpdate.link.name)) {
                    sourceLocation.adjacencyMap.push(linkUpdate.link);
                }
            }
        });
    }

    return newMap;
}


export const createInitialContext = (creationData: any, language: Language): GameContext => {
  const {
      playerName,
      characterDescription,
      initialPrompt,
      universe,
      selectedEra,
      race,
      charClass,
      age,
      isCustomRace,
      customRaceName,
      customRaceDescription,
      customAttributes,
      isCustomClass,
      customClassName,
      customClassDescription,
      customClassAttributes,
      worldInformation,
      superInstructions,
      startTime,
      weather,
      modelName,
      correctionModelName,
      aiProvider,
      isCustomModel,
      customModelName,
      openRouterModelName,
      geminiThinkingBudget,
      useDynamicThinkingBudget,
      nonMagicMode,
      adultMode,
      geminiApiKey,
      openRouterApiKey,
      youtubeApiKey,
      allowHistoryManipulation,
      currencyName,
      hardMode,
      notificationSound,
      keepLatestNpcJournals,
      latestNpcJournalsCount,
  } = creationData;

  const standardCharacteristics: any = {};
  
  const isCustomWorld = (universe === 'history' && !gameData.history[selectedEra as keyof typeof gameData.history]) 
                   || (universe === 'myths' && !gameData.myths[selectedEra as keyof typeof gameData.myths]);

  const currentWorld = (() => {
    if (isCustomWorld) {
        return {
            name: selectedEra, // The custom name from the form
            description: "A custom world created by the player.",
            currencyName: "Coins", // Generic fallback
            currencyOptions: [],
            races: {},
            classes: {}
        };
    }
    if (universe === 'history') {
      return gameData.history[selectedEra as keyof typeof gameData.history];
    }
    if (universe === 'myths') {
      return gameData.myths[selectedEra as keyof typeof gameData.myths];
    }
    return gameData[universe as keyof Omit<typeof gameData, 'history' | 'myths'>];
  })();

  const defaultCurrencyName = (() => {
    if ((universe === 'history' || universe === 'myths') && !isCustomRace && !isCustomWorld) {
        return (currentWorld.races as any)[race].currencyName;
    }
    return (currentWorld as any).currencyName;
  })();

  const { currencyName: ignored, ...baseInfo } = currentWorld as any;

  const finalCurrencyName = currencyName || defaultCurrencyName;
  const finalNonMagicMode = universe === 'history' ? true : (universe === 'myths' ? false : (nonMagicMode ?? false));

  const raceBonuses = isCustomRace ? {} : currentWorld.races[race]!.bonuses;
  const classBonuses = isCustomClass ? customClassAttributes : currentWorld.classes[charClass]!.bonuses;

  CHARACTERISTICS_LIST.forEach(char => {
      let total = 0;
      const classBonus = classBonuses[char as keyof typeof classBonuses] || 0;

      if (isCustomRace) {
          const customAttributeValue = customAttributes[char] || 1;
          total = customAttributeValue + classBonus;
      } else {
          const baseValue = 1;
          const raceBonus = raceBonuses[char as keyof typeof raceBonuses] || 0;
          total = baseValue + raceBonus + classBonus;
      }
      
      standardCharacteristics[`standard${char.charAt(0).toUpperCase() + char.slice(1)}`] = total;
  });

  const stdStr = standardCharacteristics.standardStrength;
  const stdCon = standardCharacteristics.standardConstitution;
  const stdInt = standardCharacteristics.standardIntelligence;
  const stdWis = standardCharacteristics.standardWisdom;
  const stdFth = standardCharacteristics.standardFaith;
  const stdLck = standardCharacteristics.standardLuck;

  const maxHealth = 100 + Math.floor(stdCon * 2.0) + Math.floor(stdStr * 1.0);
  const maxEnergy = 100 + Math.floor(stdCon * 0.75) + Math.floor(stdInt * 0.75) + Math.floor(stdWis * 0.75) + Math.floor(stdFth * 0.75);
  const maxWeight = 30 + Math.floor(stdStr * 1.8 + stdCon * 0.4);
  const critChanceBuffFromLuck = Math.floor(stdLck / 20);
  const critChanceThreshold = 20 - critChanceBuffFromLuck;
  
  const playerCharacter: PlayerCharacter = {
    name: playerName,
    race: isCustomRace ? customRaceName : race,
    class: isCustomClass ? customClassName : charClass,
    age: age,
    appearanceDescription: characterDescription,
    raceDescription: isCustomRace ? customRaceDescription : currentWorld.races[race]!.description,
    classDescription: isCustomClass ? customClassDescription : currentWorld.classes[charClass]!.description,
    level: 1,
    levelOnPreviousTurn: 1,
    experience: 0,
    experienceForNextLevel: 100,
    attributePoints: 0,
    money: 0,
    currentHealth: maxHealth,
    maxHealth: maxHealth,
    currentEnergy: maxEnergy,
    maxEnergy: maxEnergy,
    maxWeight: maxWeight,
    totalWeight: 0,
    criticalExcessWeight: 15,
    critChanceBuffFromLuck,
    critChanceThreshold,
    characteristics: {
      ...standardCharacteristics,
      modifiedStrength: standardCharacteristics.standardStrength,
      modifiedDexterity: standardCharacteristics.standardDexterity,
      modifiedConstitution: standardCharacteristics.standardConstitution,
      modifiedIntelligence: standardCharacteristics.standardIntelligence,
      modifiedWisdom: standardCharacteristics.standardWisdom,
      modifiedFaith: standardCharacteristics.standardFaith,
      modifiedAttractiveness: standardCharacteristics.standardAttractiveness,
      modifiedTrade: standardCharacteristics.standardTrade,
      modifiedPersuasion: standardCharacteristics.standardPersuasion,
      modifiedPerception: standardCharacteristics.standardPerception,
      modifiedLuck: standardCharacteristics.standardLuck,
      modifiedSpeed: standardCharacteristics.standardSpeed,
    },
    activeSkills: [],
    passiveSkills: [],
    skillMasteryData: [],
    knownRecipes: [],
    inventory: [],
    itemSortOrder: [],
    itemSortCriteria: 'manual',
    itemSortDirection: 'asc',
    equippedItems: {
        Head: null, Neck: null, Chest: null, Back: null, MainHand: null, OffHand: null,
        Hands: null, Wrists: null, Waist: null, Legs: null, Feet: null,
        Finger1: null, Finger2: null
    },
    activePlayerEffects: [],
    playerWounds: [],
    playerCustomStates: [],
    autoCombatSkill: null,
    stealthState: { isActive: false, detectionLevel: 0, description: 'Not sneaking' },
    effortTracker: { lastUsedCharacteristic: null, consecutivePartialSuccesses: 0 },
  };

  const gameSettings: GameSettings = {
    nonMagicMode: finalNonMagicMode,
    language,
    gameWorldInformation: {
      currencyName: finalCurrencyName,
      baseInfo: baseInfo,
      customInfo: worldInformation,
    },
    modelName: isCustomModel ? customModelName : (aiProvider === 'openrouter' ? openRouterModelName : modelName),
    correctionModelName,
    aiProvider,
    isCustomModel,
    customModelName,
    openRouterModelName,
    geminiThinkingBudget: geminiThinkingBudget,
    useDynamicThinkingBudget,
    adultMode,
    geminiApiKey,
    openRouterApiKey,
    youtubeApiKey,
    allowHistoryManipulation,
    hardMode,
    notificationSound: notificationSound ?? false,
    keepLatestNpcJournals: keepLatestNpcJournals ?? false,
    latestNpcJournalsCount: latestNpcJournalsCount ?? 20,
  };

  const initialLocation: LocationData = {
      locationId: generateId('loc'),
      name: "Starting Point",
      description: "You find yourself at the beginning of your journey.",
      coordinates: {x: 0, y: 0},
      locationType: 'outdoor',
      biome: 'Plains',
      lastEventsDescription: '',
      image_prompt: 'A vast open plain under a clear blue sky, a single path leading towards the horizon, fantasy landscape.',
      difficultyProfile: { combat: 5, environment: 5, social: 5, exploration: 5 }
  };
  
  const initialWeather = (() => {
    if (weather === 'Random') {
        const allWeatherOptions = Array.from(new Set(Object.values(BIOME_WEATHER).flat()));
        return allWeatherOptions[Math.floor(Math.random() * allWeatherOptions.length)];
    }
    return weather || 'Clear';
  })();

  const initialWorldState: WorldState = {
      day: 1,
      timeOfDay: 'Morning',
      weather: initialWeather,
      currentTimeInMinutes: parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]),
      lastWorldProgressionTimeInMinutes: 0,
  };

  const initialContext: GameContext = {
    message: initialPrompt,
    superInstructions,
    currentTurnNumber: 1,
    gameSettings,
    playerCharacter,
    currentLocation: initialLocation,
    visitedLocations: [initialLocation],
    activeQuests: [],
    completedQuests: [],
    encounteredNPCs: [],
    npcSkillMasteryData: [],
    lootForCurrentTurn: generateLootTemplates([0.1, 1.1, 1.1, 1.1, 0.1], playerCharacter, 5),
    preGeneratedDices1d20: Array.from({ length: 50 }, () => Math.floor(Math.random() * 20) + 1),
    worldState: initialWorldState,
    worldStateFlags: [],
    previousTurnResponse: null,
    encounteredFactions: [],
    plotOutline: null,
    worldMap: { [initialLocation.locationId]: initialLocation },
    responseHistory: [], // this will be populated in useGameLogic
    currentStepFocus: null,
    partiallyGeneratedResponse: null,
    enemiesDataForCurrentTurn: [],
    alliesDataForCurrentTurn: [],
    playerCustomStates: [],
    worldEventsLog: [],
  };

  return initialContext;
};

export function buildNextContext(
    currentContext: GameContext,
    response: GameResponse,
    newState: GameState,
    newHistory: ChatMessage[],
    advanceTurn: boolean = true
): GameContext {
    const newTurnNumber = advanceTurn ? currentContext.currentTurnNumber + 1 : currentContext.currentTurnNumber;

    let newWorldState = { ...currentContext.worldState };

    if (response.setWorldTime) {
        const { day, minutesIntoDay } = response.setWorldTime;
        newWorldState.day = day;
        newWorldState.currentTimeInMinutes = ((day - 1) * 24 * 60) + minutesIntoDay;
        
        if (minutesIntoDay >= 5 * 60 && minutesIntoDay < 12 * 60) newWorldState.timeOfDay = 'Morning';
        else if (minutesIntoDay >= 12 * 60 && minutesIntoDay < 18 * 60) newWorldState.timeOfDay = 'Afternoon';
        else if (minutesIntoDay >= 18 * 60 && minutesIntoDay < 22 * 60) newWorldState.timeOfDay = 'Evening';
        else newWorldState.timeOfDay = 'Night';
    } else if (advanceTurn && response.timeChange && response.timeChange > 0) {
        newWorldState.currentTimeInMinutes += response.timeChange;
        // Rounding to nearest integer to prevent floating point inaccuracies from cumulative additions.
        const totalDays = Math.floor(Math.round(newWorldState.currentTimeInMinutes) / (24 * 60));
        newWorldState.day = 1 + totalDays;
        const minutesIntoDay = newWorldState.currentTimeInMinutes % (24 * 60);

        if (minutesIntoDay >= 5 * 60 && minutesIntoDay < 12 * 60) newWorldState.timeOfDay = 'Morning';
        else if (minutesIntoDay >= 12 * 60 && minutesIntoDay < 18 * 60) newWorldState.timeOfDay = 'Afternoon';
        else if (minutesIntoDay >= 18 * 60 && minutesIntoDay < 22 * 60) newWorldState.timeOfDay = 'Evening';
        else newWorldState.timeOfDay = 'Night';
    }

    if (response.updateWorldProgressionTracker) {
        newWorldState.lastWorldProgressionTimeInMinutes = response.updateWorldProgressionTracker.newLastWorldProgressionTimeInMinutes;
    }

    if (response.weatherChange && response.weatherChange.tendency !== 'NO_CHANGE') {
        const currentBiome = newState.currentLocationData.biome || 'TemperateForest';
        const weatherOptions = BIOME_WEATHER[currentBiome] || BIOME_WEATHER['Unique'];
        const currentIdx = weatherOptions.indexOf(newWorldState.weather);

        if (response.weatherChange.tendency.startsWith('JUMP_TO_')) {
            const targetWeatherRaw = response.weatherChange.tendency.replace('JUMP_TO_', '').replace(/_/g, ' ');
            const foundWeather = weatherOptions.find(option => option.toLowerCase() === targetWeatherRaw.toLowerCase());
            if (foundWeather) {
                newWorldState.weather = foundWeather;
            }
        } else if (currentIdx !== -1) {
            if (response.weatherChange.tendency === 'IMPROVE') {
                newWorldState.weather = weatherOptions[Math.max(0, currentIdx - 1)];
            } else if (response.weatherChange.tendency === 'WORSEN') {
                newWorldState.weather = weatherOptions[Math.min(weatherOptions.length - 1, currentIdx + 1)];
            }
        }
    }
    
    let newWorldMap: Record<string, Location>;
    let newVisitedLocations: Location[];

    // Special logic for Turn 1 to completely replace the "Starting Point" placeholder.
    if (currentContext.currentTurnNumber === 1 && response.currentLocationData) {
        // The new world map starts fresh with ONLY the new, real starting location.
        const initialMapForTurn1 = {};
        newWorldMap = updateWorldMap(initialMapForTurn1, response.worldMapUpdates, newState.currentLocationData);

        // The visited locations list also starts fresh with only the new location.
        newVisitedLocations = [newState.currentLocationData];
    } else {
        // This is the logic for all subsequent turns.
        newWorldMap = updateWorldMap(currentContext.worldMap, response.worldMapUpdates, newState.currentLocationData);
        
        newVisitedLocations = [...currentContext.visitedLocations];
        const locationIndex = newVisitedLocations.findIndex(l => l.locationId === newState.currentLocationData.locationId);

        if (locationIndex === -1) {
            // Location not found, so add it.
            newVisitedLocations.push(newState.currentLocationData);
        } else {
            // Location found, so update it with the latest data, preserving the event log.
            const oldLocationData = newVisitedLocations[locationIndex];
            const newLocationData = newState.currentLocationData;
            
            // If the new event description is present and different, prepend it.
            if (newLocationData.lastEventsDescription && newLocationData.lastEventsDescription !== oldLocationData.lastEventsDescription) {
                 newLocationData.lastEventsDescription = `${newLocationData.lastEventsDescription}\n\n${oldLocationData.lastEventsDescription || ''}`.trim();
            }

            newVisitedLocations[locationIndex] = { 
                ...oldLocationData, 
                ...newLocationData,
            };
        }
    }

    const nextContext: GameContext = {
        ...currentContext,
        message: '', // Clear message for next turn
        currentTurnNumber: newTurnNumber,
        playerCharacter: newState.playerCharacter,
        currentLocation: newState.currentLocationData,
        visitedLocations: newVisitedLocations,
        activeQuests: newState.activeQuests,
        completedQuests: newState.completedQuests,
        encounteredNPCs: newState.encounteredNPCs,
        encounteredFactions: newState.encounteredFactions,
        worldState: newWorldState,
        worldStateFlags: newState.worldStateFlags,
        worldEventsLog: newState.worldEventsLog || [],
        previousTurnResponse: response,
        plotOutline: newState.plotOutline,
        worldMap: newWorldMap,
        responseHistory: newHistory,
        // Reset turn-specific data
        lootForCurrentTurn: generateLootTemplates(response.multipliers, newState.playerCharacter, 5),
        preGeneratedDices1d20: Array.from({ length: 50 }, () => Math.floor(Math.random() * 20) + 1),
        enemiesDataForCurrentTurn: newState.enemiesData,
        alliesDataForCurrentTurn: newState.alliesData,
        playerCustomStates: newState.playerCustomStates,
        currentStepFocus: null,
        partiallyGeneratedResponse: null,
    };

    return nextContext;
}