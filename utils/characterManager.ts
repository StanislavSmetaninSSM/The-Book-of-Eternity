
import { PlayerCharacter, Characteristics, GameSettings, Item, ActiveSkill, PassiveSkill, SkillMastery, Recipe } from '../types';
import { gameData } from './localizationGameData';
import { recalculateDerivedStats } from './gameContext';

const CHARACTERISTICS_LIST = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'faith', 'attractiveness', 'trade', 'persuasion', 'perception', 'luck', 'speed'];
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export function createNewPlayerCharacter(
    creationData: any, 
    gameSettings: GameSettings, 
    options: { 
        partyLevel: number, 
        shareCharacteristics: boolean, 
        templatePlayer?: PlayerCharacter | null 
    }
): PlayerCharacter {
    const { templatePlayer, shareCharacteristics, partyLevel } = options;

    const experienceForLevelTransition = (level: number): number => {
        if (level < 1) return 100; // Fallback for safety
        const baseXP = 100;
        // New formula: TotalXPForLevel(L) = floor(BaseXP * (L ^ 2.5))
        // This is interpreted as the XP required to go from level L to L+1.
        return Math.floor(baseXP * Math.pow(level, 2.5));
    };

    if (templatePlayer) {
        // --- CREATING FROM TEMPLATE ---
        const newPlayer: PlayerCharacter = JSON.parse(JSON.stringify(templatePlayer)); // Deep copy

        // Overwrite unique/personal info from the form
        newPlayer.playerId = generateId('player');
        newPlayer.name = creationData.playerName;
        newPlayer.appearanceDescription = creationData.characterDescription;
        newPlayer.age = creationData.age;
        
        // Reset dynamic state for a "new" character
        newPlayer.currentHealth = newPlayer.maxHealth;
        newPlayer.currentEnergy = newPlayer.maxEnergy;
        newPlayer.activePlayerEffects = [];
        newPlayer.playerWounds = [];
        newPlayer.portrait = null;
        
        // Ensure personal reputations are copied correctly
        newPlayer.personalNpcReputations = JSON.parse(JSON.stringify(templatePlayer.personalNpcReputations || []));
        newPlayer.personalFactionReputations = JSON.parse(JSON.stringify(templatePlayer.personalFactionReputations || []));

        if (!shareCharacteristics) {
            // Characteristics, race, class are NOT shared. We need to build them from the form data.
            const {
                race, charClass, isCustomRace, customRaceName, customRaceDescription,
                customAttributes, isCustomClass, customClassName, customClassDescription,
                customClassAttributes
            } = creationData;
            
            const currentWorld = gameSettings.gameWorldInformation.baseInfo as any;

            newPlayer.race = isCustomRace ? customRaceName : race;
            newPlayer.class = isCustomClass ? customClassName : charClass;
            newPlayer.raceDescription = isCustomRace ? customRaceDescription : currentWorld?.races[race]?.description || '';
            newPlayer.classDescription = isCustomClass ? customClassDescription : currentWorld?.classes[charClass]?.description || '';
            
            const standardCharacteristics: any = {};
            const isLevelSyncedCreation = partyLevel > 1;

            if (isLevelSyncedCreation) {
                newPlayer.level = partyLevel;
                CHARACTERISTICS_LIST.forEach(char => {
                    const charCapitalized = char.charAt(0).toUpperCase() + char.slice(1);
                    standardCharacteristics[`standard${charCapitalized}`] = customAttributes[char];
                });
            } else {
                newPlayer.level = 1;
                const raceBonuses = isCustomRace ? {} : currentWorld.races[race]?.bonuses || {};
                const classBonuses = isCustomClass ? customClassAttributes : currentWorld.classes[charClass]?.bonuses || {};
                CHARACTERISTICS_LIST.forEach(char => {
                    let total = 0;
                    const classBonus = classBonuses[char] || 0;
                    if (isCustomRace) {
                        total = (customAttributes[char] || 1) + classBonus;
                    } else {
                        total = 1 + (raceBonuses[char] || 0) + classBonus;
                    }
                    standardCharacteristics[`standard${char.charAt(0).toUpperCase() + char.slice(1)}`] = total;
                });
            }

            Object.keys(standardCharacteristics).forEach(key => {
                const modifiedKey = key.replace('standard', 'modified');
                newPlayer.characteristics[key as keyof Characteristics] = standardCharacteristics[key];
                newPlayer.characteristics[modifiedKey as keyof Characteristics] = standardCharacteristics[key];
            });

            const recalculated = recalculateDerivedStats(newPlayer);
            newPlayer.maxHealth = recalculated.maxHealth;
            newPlayer.maxEnergy = recalculated.maxEnergy;
            newPlayer.maxWeight = recalculated.maxWeight;
            newPlayer.critChanceThreshold = recalculated.critChanceThreshold;
            newPlayer.critChanceBuffFromLuck = recalculated.critChanceBuffFromLuck;
            newPlayer.currentHealth = recalculated.maxHealth;
            newPlayer.currentEnergy = recalculated.maxEnergy;

            const experienceForNextLevel = experienceForLevelTransition(newPlayer.level);
            newPlayer.experience = 0;
            newPlayer.experienceForNextLevel = experienceForNextLevel;
        }
        
        return newPlayer;
    }
    
    // --- CREATING FROM SCRATCH (Original Logic) ---
    const {
        playerName,
        characterDescription,
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
    } = creationData;

    const currentWorld = gameSettings.gameWorldInformation.baseInfo as any;

    const standardCharacteristics: any = {};
    const finalLevel = (partyLevel > 1 && !shareCharacteristics) ? partyLevel : 1;

    if (finalLevel > 1) {
        CHARACTERISTICS_LIST.forEach(char => {
            const charCapitalized = char.charAt(0).toUpperCase() + char.slice(1);
            standardCharacteristics[`standard${charCapitalized}`] = customAttributes[char];
        });
    } else {
        const raceBonuses = isCustomRace ? {} : currentWorld.races[race]?.bonuses || {};
        const classBonuses = isCustomClass ? customClassAttributes : currentWorld.classes[charClass]?.bonuses || {};
        CHARACTERISTICS_LIST.forEach(char => {
            let total = 0;
            const classBonus = classBonuses[char] || 0;
            if (isCustomRace) {
                total = (customAttributes[char] || 1) + classBonus;
            } else {
                total = 1 + (raceBonuses[char] || 0) + classBonus;
            }
            standardCharacteristics[`standard${char.charAt(0).toUpperCase() + char.slice(1)}`] = total;
        });
    }
    
    const experienceForNextLevel = experienceForLevelTransition(finalLevel);
    
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
        playerId: generateId('player'),
        name: playerName,
        race: isCustomRace ? customRaceName : race,
        class: isCustomClass ? customClassName : charClass,
        age: age,
        appearanceDescription: characterDescription,
        raceDescription: isCustomRace ? customRaceDescription : currentWorld.races[race]?.description || '',
        classDescription: isCustomClass ? customClassDescription : currentWorld.classes[charClass]?.description || '',
        portrait: null,
        level: finalLevel,
        levelOnPreviousTurn: finalLevel,
        experience: 0,
        experienceForNextLevel: experienceForNextLevel,
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
        equippedItems: {
            Head: null, Neck: null, Chest: null, Back: null, MainHand: null, OffHand: null,
            Hands: null, Wrists: null, Waist: null, Legs: null, Feet: null,
            Finger1: null, Finger2: null,
            Underwear_Top: null, Underwear_Bottom: null,
            Accessory1: null, Accessory2: null, Accessory3: null, Accessory4: null,
            Sigil: null,
        },
        activePlayerEffects: [],
        playerWounds: [],
        playerCustomStates: [],
        autoCombatSkill: null,
        stealthState: { isActive: false, detectionLevel: 0, description: 'Not sneaking' },
        effortTracker: { lastUsedCharacteristic: null, consecutivePartialSuccesses: 0 },
        personalNpcReputations: [],
        personalFactionReputations: [],
    };

    return playerCharacter;
}
