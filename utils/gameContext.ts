



import { GameState, GameContext, ChatMessage, GameResponse, PlayerCharacter, LocationData, Characteristics, Location, Faction, Language, LootTemplate, UnlockedMemory, Recipe } from '../types';
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

export function recalculateDerivedStats(pc: PlayerCharacter): PlayerCharacter {
  const newPc = JSON.parse(JSON.stringify(pc)); // Work on a copy
  
  const stdStr = newPc.characteristics.standardStrength;
  const stdCon = newPc.characteristics.standardConstitution;
  const stdInt = newPc.characteristics.standardIntelligence;
  const stdWis = newPc.characteristics.standardWisdom;
  const stdFth = newPc.characteristics.standardFaith;
  const stdLck = newPc.characteristics.standardLuck;

  newPc.maxHealth = 100 + Math.floor(stdCon * 1.5) + Math.floor(stdStr * 0.5);
  newPc.maxEnergy = 100 + Math.floor(stdInt * 0.6) + Math.floor(stdWis * 0.6) + Math.floor(stdFth * 0.6) + Math.floor(stdCon * 0.2);
  newPc.maxWeight = 30 + Math.floor(stdStr * 1.8 + stdCon * 0.4);
  newPc.critChanceBuffFromLuck = Math.floor(stdLck / 20);
  newPc.critChanceThreshold = 20 - newPc.critChanceBuffFromLuck;

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
    Object.values(newPc.equippedItems).forEach((itemId: string | null) => {
        if (!itemId) return;
        const item = newPc.inventory.find((i: any) => i.existedId === itemId);
        if (item && item.bonuses) {
            item.bonuses.forEach((bonus: string) => {
                const match = bonus.match(/^([+-]?\d+)\s+(.+)$/);
                if (match && match[2].toLowerCase() === char) {
                    flatBonusTotal += parseInt(match[1]);
                }
            });
        }
    });

    // 2. Bonuses from passive skills (flat)
    newPc.passiveSkills.forEach((skill: any) => {
        if (skill.playerStatBonus) {
            const match = skill.playerStatBonus.match(/^([+-]?\d+)\s+(.+)$/);
            if (match && match[2].toLowerCase() === char) {
                flatBonusTotal += parseInt(match[1]);
            }
        }
    });

    // 3. Bonuses from temporary effects (percentage)
    newPc.activePlayerEffects.forEach((effect: any) => {
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
      geminiThinkingBudget,
      nonMagicMode,
      useMultiStepRequests,
      adultMode,
      geminiApiKey,
      openRouterApiKey,
      allowHistoryManipulation,
  } = creationData;

  const standardCharacteristics: any = {};
  const currentWorld = gameData[universe as keyof typeof gameData];
  const { currencyName, ...baseInfo } = currentWorld;
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

  const maxHealth = 100 + Math.floor(stdCon * 1.5) + Math.floor(stdStr * 0.5);
  const maxEnergy = 100 + Math.floor(stdInt * 0.6) + Math.floor(stdWis * 0.6) + Math.floor(stdFth * 0.6) + Math.floor(stdCon * 0.2);
  const maxWeight = 30 + Math.floor(stdStr * 1.8 + stdCon * 0.4);
  const critChanceThreshold = 20 - Math.floor(stdLck / 20);

  const initialPlayerCharacter: PlayerCharacter = {
    name: playerName,
    race: isCustomRace ? customRaceName : race,
    class: isCustomClass ? customClassName : charClass,
    age: age || 25,
    appearanceDescription: characterDescription,
    raceDescription: isCustomRace ? customRaceDescription : (currentWorld.races as any)[race]?.description,
    classDescription: isCustomClass ? customClassDescription : (currentWorld.classes as any)[charClass]?.description,
    level: 1,
    levelOnPreviousTurn: 0,
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
    critChanceBuffFromLuck: Math.floor(stdLck / 20),
    critChanceThreshold: critChanceThreshold,
    characteristics: {
      ...standardCharacteristics,
      ...Object.keys(standardCharacteristics).reduce((acc, key) => {
          const modifiedKey = key.replace('standard', 'modified');
          acc[modifiedKey] = standardCharacteristics[key];
          return acc;
      }, {} as any)
    } as Characteristics,
    activeSkills: [],
    passiveSkills: [],
    skillMasteryData: [],
    knownRecipes: [],
    inventory: [],
    equippedItems: { Head: null, Chest: null, Legs: null, Feet: null, Hands: null, Wrists: null, Neck: null, Waist: null, Back: null, Finger1: null, Finger2: null, MainHand: null, OffHand: null },
    activePlayerEffects: [],
    playerWounds: [],
    playerCustomStates: null,
    autoCombatSkill: null,
    stealthState: {
        isActive: false,
        detectionLevel: 0,
        description: 'Not sneaking'
    },
  };
  
  const [startHour, startMinute] = (startTime || '08:00').split(':').map(Number);
  const currentTimeInMinutes = startHour * 60 + startMinute;
  let timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night' = 'Morning';
  if (startHour >= 6 && startHour < 12) {
      timeOfDay = 'Morning';
  } else if (startHour >= 12 && startHour < 18) {
      timeOfDay = 'Afternoon';
  } else if (startHour >= 18 && startHour < 22) {
      timeOfDay = 'Evening';
  } else {
      timeOfDay = 'Night';
  }
  
  const possibleWeathers = [
    'Clear', 'Cloudy', 'Overcast', 'Foggy', 'Light Rain', 'Heavy Rain', 'Storm',
    'Scorching Sun', 'Windy', 'Sandstorm', 'Frigid Air', 'Light Snow', 'Heavy Snow',
    'Blizzard', 'Humid', 'Misty', 'Drizzle', 'Downpour', 'Rain', 'Snow'
  ];
  const randomWeather = possibleWeathers[Math.floor(Math.random() * possibleWeathers.length)];
  const initialWeather = weather === 'Random' ? randomWeather : weather;

  const initialLocationPlaceholder: Location = {
    name: "Unknown",
    difficulty: 1,
    description: "",
    lastEventsDescription: "",
    image_prompt: "",
    locationId: "start-loc-0",
    coordinates: { x: 0, y: 0 },
    locationType: 'outdoor',
    biome: 'Plains',
  };

  const initialLoot = generateLootTemplates([0.1, 1.1, 1.1, 1.1, 0.1], initialPlayerCharacter, 10);

  return {
    message: initialPrompt,
    superInstructions: superInstructions || "No special rules provided by the player.",
    currentTurnNumber: 1,
    gameSettings: {
      nonMagicMode: nonMagicMode ?? false,
      language: language,
      gameWorldInformation: {
        currencyName: currencyName,
        baseInfo: baseInfo,
        customInfo: worldInformation || "No additional world information provided by the player.",
      },
      modelName: modelName || 'gemini-2.5-flash',
      aiProvider: aiProvider || 'gemini',
      geminiThinkingBudget: geminiThinkingBudget ?? 60,
      useMultiStepRequests: useMultiStepRequests ?? true,
      adultMode: adultMode ?? false,
      geminiApiKey: geminiApiKey || '',
      openRouterApiKey: openRouterApiKey || '',
      allowHistoryManipulation: allowHistoryManipulation ?? false,
      correctionModelName: correctionModelName || '',
    },
    playerCharacter: initialPlayerCharacter,
    currentLocation: initialLocationPlaceholder,
    visitedLocations: [initialLocationPlaceholder],
    activeQuests: [],
    completedQuests: [],
    encounteredNPCs: [],
    npcSkillMasteryData: [],
    lootForCurrentTurn: initialLoot,
    preGeneratedDices1d20: Array.from({ length: 50 }, () => Math.floor(Math.random() * 20) + 1),
    worldState: {
      day: 1,
      timeOfDay: timeOfDay,
      weather: initialWeather,
      currentTimeInMinutes: currentTimeInMinutes,
    },
    worldStateFlags: {},
    previousTurnResponse: null,
    plotOutline: null,
    worldMap: { [initialLocationPlaceholder.locationId!]: initialLocationPlaceholder },
    responseHistory: [],
    currentStepFocus: null,
    partiallyGeneratedResponse: null,
    enemiesDataForCurrentTurn: null,
    alliesDataForCurrentTurn: null,
    playerCustomStates: null,
    encounteredFactions: [],
  };
};

export const buildNextContext = (
  prevContext: GameContext,
  response: GameResponse,
  newState: GameState, // This is a mutable reference
  chatHistory: ChatMessage[],
  incrementTurn = true
): GameContext => {
  const newWorldMap = updateWorldMap(prevContext.worldMap, response.worldMapUpdates, newState.currentLocationData);
  
  const newVisitedLocations = [...prevContext.visitedLocations];
  const currentLocationUpdate = newState.currentLocationData;

  if (currentLocationUpdate) {
    let existingIndex = -1;
    
    const placeholderIndex = newVisitedLocations.findIndex(loc => loc && loc.locationId === 'start-loc-0');
    if (placeholderIndex !== -1 && prevContext.currentTurnNumber === 1) {
        existingIndex = placeholderIndex;
    } else {
        if (currentLocationUpdate.locationId) {
            existingIndex = newVisitedLocations.findIndex(loc => loc && loc.locationId === currentLocationUpdate.locationId);
        }
        if (existingIndex === -1 && currentLocationUpdate.name) {
            existingIndex = newVisitedLocations.findIndex(loc => loc && loc.name && loc.name.toLowerCase() === currentLocationUpdate.name.toLowerCase());
        }
    }
    
    if (existingIndex !== -1) {
        // An existing location was found. Update it.
        const originalLocation = newVisitedLocations[existingIndex];
        const updatedLocation = { ...originalLocation, ...currentLocationUpdate };

        // Specific merge logic for event history
        const newEvent = currentLocationUpdate.lastEventsDescription;
        const oldEvents = originalLocation.lastEventsDescription;
        updatedLocation.lastEventsDescription = newEvent ? `${newEvent}\n\n${oldEvents}`.trim() : oldEvents;

        // Ensure the ID is correct and consistent.
        updatedLocation.locationId = (originalLocation.locationId === 'start-loc-0') 
            ? generateId('loc') 
            : originalLocation.locationId;
        
        // MUTATE the newState object so the UI gets the correct ID.
        newState.currentLocationData.locationId = updatedLocation.locationId;

        newVisitedLocations[existingIndex] = updatedLocation;
    } else {
        // It's a brand new location not seen before.
        const newId = currentLocationUpdate.locationId || generateId('loc');
        newState.currentLocationData.locationId = newId; // Mutate
        newVisitedLocations.push(newState.currentLocationData);
    }
  }

  const newWorldState = JSON.parse(JSON.stringify(prevContext.worldState));

  if (response.timeChange && response.timeChange > 0) {
      newWorldState.currentTimeInMinutes = (newWorldState.currentTimeInMinutes || 0) + response.timeChange;
      if (newWorldState.currentTimeInMinutes >= 1440) { // 24 * 60 minutes
          newWorldState.day += Math.floor(newWorldState.currentTimeInMinutes / 1440);
          newWorldState.currentTimeInMinutes %= 1440;
      }
  
      const currentHour = Math.floor(newWorldState.currentTimeInMinutes / 60);
      if (currentHour >= 6 && currentHour < 12) {
          newWorldState.timeOfDay = 'Morning';
      } else if (currentHour >= 12 && currentHour < 18) {
          newWorldState.timeOfDay = 'Afternoon';
      } else if (currentHour >= 18 && currentHour < 22) {
          newWorldState.timeOfDay = 'Evening';
      } else {
          newWorldState.timeOfDay = 'Night';
      }
  }

  if (response.weatherChange && newState.currentLocationData.locationType === 'outdoor') {
    const biome = newState.currentLocationData.biome || 'Plains';
    const weatherLadder = BIOME_WEATHER[biome as keyof typeof BIOME_WEATHER] || BIOME_WEATHER['Unique'];
    const currentWeatherIndex = weatherLadder.indexOf(newWorldState.weather);

    const tendency = response.weatherChange.tendency;

    if (tendency === 'IMPROVE' && currentWeatherIndex > 0) {
        newWorldState.weather = weatherLadder[currentWeatherIndex - 1];
    } else if (tendency === 'WORSEN' && currentWeatherIndex < weatherLadder.length - 1) {
        newWorldState.weather = weatherLadder[currentWeatherIndex + 1];
    } else if (tendency.startsWith('JUMP_TO_')) {
        const targetWeather = tendency.replace('JUMP_TO_', '').replace(/_/g, ' ');
        // Convert 'LIGHT RAIN' to 'Light Rain'
        const titleCaseTarget = targetWeather.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (weatherLadder.includes(titleCaseTarget)) {
            newWorldState.weather = titleCaseTarget;
        }
    }
  }

  const lootForNextTurn = generateLootTemplates(response.multipliers, newState.playerCharacter, 10);

  return {
      ...prevContext,
      message: '',
      superInstructions: '',
      currentTurnNumber: prevContext.currentTurnNumber + (incrementTurn ? 1 : 0),
      playerCharacter: newState.playerCharacter,
      currentLocation: newState.currentLocationData,
      visitedLocations: newVisitedLocations,
      activeQuests: newState.activeQuests,
      completedQuests: newState.completedQuests,
      encounteredNPCs: newState.encounteredNPCs,
      previousTurnResponse: response,
      responseHistory: chatHistory.slice(-10),
      lootForCurrentTurn: lootForNextTurn,
      preGeneratedDices1d20: Array.from({ length: 50 }, () => Math.floor(Math.random() * 20) + 1),
      enemiesDataForCurrentTurn: response.enemiesData,
      alliesDataForCurrentTurn: response.alliesData,
      worldState: newWorldState,
      worldStateFlags: { ...prevContext.worldStateFlags, ...(response.worldStateFlags || {}) },
      encounteredFactions: newState.encounteredFactions,
      plotOutline: response.plotOutline || prevContext.plotOutline,
      worldMap: newWorldMap,
      playerCustomStates: newState.playerCustomStates,
  };
};