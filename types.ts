

// Represents the entire state of the game world passed between turns

export interface UnlockedMemory {
  memoryId: string;
  title: string;
  unlockedAtRelationshipLevel: number;
  content: string;
}

export interface LootTemplate {
  baseName: string;
  quality: string;
  bonuses: string[];
}

export interface GameContext {
  message: string;
  superInstructions: string;
  currentTurnNumber: number;
  gameSettings: GameSettings;
  playerCharacter: PlayerCharacter;
  currentLocation: Location;
  visitedLocations: Location[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  encounteredNPCs: NPC[];
  npcSkillMasteryData: any[]; // Define more specifically if needed
  lootForCurrentTurn: LootTemplate[]; // Define more specifically if needed
  preGeneratedDices1d20: number[];
  worldState: WorldState;
  worldStateFlags: Record<string, boolean | string>;
  previousTurnResponse: GameResponse | null;
  encounteredFactions: Faction[];
  plotOutline: PlotOutline | null;
  worldMap: Record<string, Location>;
  responseHistory: ChatMessage[];
  currentStepFocus: string | null;
  partiallyGeneratedResponse: Partial<GameResponse> | string | null;
  enemiesDataForCurrentTurn: EnemyCombatObject[] | null;
  alliesDataForCurrentTurn: AllyCombatObject[] | null;
  playerCustomStates: CustomState[] | null;
}

// Represents a single chat message
export interface ChatMessage {
  sender: 'player' | 'gm' | 'system';
  content: string;
}

export interface GameState {
  playerCharacter: PlayerCharacter;
  currentLocationData: LocationData;
  activeQuests: Quest[];
  completedQuests: Quest[];
  encounteredNPCs: NPC[];
  encounteredFactions: Faction[];
  enemiesData: EnemyCombatObject[];
  alliesData: AllyCombatObject[];
  playerCustomStates: CustomState[] | null;
  lastUpdatedQuestId?: string | null;
  plotOutline: PlotOutline | null;
  temporaryStash?: Item[];
  worldStateFlags: Record<string, boolean | string>;
  playerStatus?: PlayerStatus;
}

export type Language = 'ru' | 'en';

// Sub-interfaces for GameContext
export interface GameSettings {
  nonMagicMode: boolean;
  language: Language;
  gameWorldInformation: Record<string, any>;
  modelName: string;
  aiProvider: string;
  geminiThinkingBudget: number;
  useMultiStepRequests: boolean;
  adultMode: boolean;
  geminiApiKey?: string;
  openRouterApiKey?: string;
  youtubeApiKey?: string;
  allowHistoryManipulation: boolean;
  correctionModelName?: string;
  hardMode?: boolean;
}

export interface RecipeMaterial {
    materialName: string;
    quantity: number;
    alternatives?: string[];
}

export interface Recipe {
    recipeName: string;
    description: string;
    craftedItemName: string;
    requiredKnowledgeSkill?: {
        skillName: string;
        requiredMasteryLevel: number;
    };
    requiredMaterials: RecipeMaterial[];
    requiredTools: string[];
    outputQuantity: number;
    timeCost?: number;
}


export interface PlayerCharacter {
  name: string;
  race: string;
  class: string;
  age: number;
  appearanceDescription: string;
  raceDescription?: string;
  classDescription?: string;
  level: number;
  levelOnPreviousTurn: number;
  experience: number;
  experienceForNextLevel: number;
  attributePoints: number;
  money: number;
  currentHealth: number;
  maxHealth: number;
  currentEnergy: number;
  maxEnergy: number;
  maxWeight: number;
  totalWeight: number;
  criticalExcessWeight: number;
  critChanceBuffFromLuck: number;
  critChanceThreshold: number;
  characteristics: Characteristics;
  activeSkills: ActiveSkill[];
  passiveSkills: PassiveSkill[];
  skillMasteryData: SkillMastery[];
  knownRecipes: Recipe[];
  inventory: Item[];
  equippedItems: Record<string, string | null>; // Maps slot to itemId
  activePlayerEffects: Effect[];
  playerWounds: Wound[];
  playerCustomStates: CustomState[] | null;
  autoCombatSkill?: string | null;
  stealthState?: {
    isActive: boolean;
    detectionLevel: number;
    description: string;
  } | null;
}

export interface Characteristics {
    standardStrength: number; modifiedStrength: number;
    standardDexterity: number; modifiedDexterity: number;
    standardConstitution: number; modifiedConstitution: number;
    standardIntelligence: number; modifiedIntelligence: number;
    standardWisdom: number; modifiedWisdom: number;
    standardFaith: number; modifiedFaith: number;
    standardAttractiveness: number; modifiedAttractiveness: number;
    standardTrade: number; modifiedTrade: number;
    standardPersuasion: number; modifiedPersuasion: number;
    standardPerception: number; modifiedPerception: number;
    standardLuck: number; modifiedLuck: number;
    standardSpeed: number; modifiedSpeed: number;
}

export interface Skill {
  skillName: string;
  skillDescription: string;
  rarity: string;
}

export interface ActiveSkill extends Skill {
  combatEffect: CombatAction;
  scalingCharacteristic: keyof Characteristics | null;
  scalesValue: boolean;
  scalesDuration: boolean;
  scalesChance: boolean;
  energyCost?: string | number;
  cooldownTurns?: number;
}

export interface PassiveSkill extends Skill {
  type: string;
  group: string;
  combatEffect: CombatAction | null;
  playerStatBonus?: string;
  effectDetails?: string;
  masteryLevel: number;
  maxMasteryLevel: number;
}

export interface SkillMastery {
  skillName: string;
  currentMasteryLevel: number;
  currentMasteryProgress: number;
  masteryProgressNeeded: number;
  maxMasteryLevel: number;
}

export interface StructuredBonus {
  description: string;
  bonusType: 'Characteristic' | 'ActionCheck' | 'Utility' | 'Other';
  target: string;
  valueType: 'Flat' | 'Percentage' | 'String' | 'Boolean';
  value: number | string | boolean;
  application: 'Permanent' | 'Conditional';
  condition: string | null;
}

export interface Item {
  existedId: string | null;
  name: string;
  description: string;
  image_prompt: string;
  quality: string;
  type?: string;
  group?: string;
  price: number;
  count: number;
  weight: number;
  volume: number;
  bonuses: string[];
  structuredBonuses?: StructuredBonus[];
  customProperties?: CustomProperty[];
  contentsPath: string[] | null;
  isContainer: boolean;
  capacity: number | null;
  isConsumption: boolean;
  containerWeight?: number | null;
  weightReduction?: number | null;
  durability: string;
  combatEffect?: CombatAction[];
  equipmentSlot: string | string[] | null;
  requiresTwoHands: boolean;
  disassembleTo?: any[];
  fateCards?: any[];
  ownerBondLevelCurrent?: number;
  resource?: number;
  maximumResource?: number;
  resourceType?: string;
}

export interface CustomProperty {
  interactionType: 'onConsume' | 'onEquip' | 'onUse';
  targetStateName: string;
  changeValue: number;
  description: string;
}

export interface Location {
  name: string;
  difficulty: number;
  description: string;
  lastEventsDescription: string;
  image_prompt: string;
  locationId?: string;
  coordinates?: { x: number, y: number };
  adjacencyMap?: AdjacencyMapEntry[];
  locationType: 'outdoor' | 'indoor';
  biome?: 'TemperateForest' | 'Desert' | 'ArcticTundra' | 'Mountains' | 'Swamp' | 'Plains' | 'Urban' | 'Coastal' | 'Unique';
  indoorType?: 'Building' | 'Dungeon' | 'CaveSystem' | 'Vehicle' | 'UniqueIndoor';
}

export interface AdjacencyMapEntry {
  name: string;
  shortDescription: string;
  linkType: string;
  linkState: string;
  targetCoordinates: { x: number; y: number };
  estimatedDifficulty: number;
}


export interface Quest {
  questId: string | null;
  questName: string;
  questGiver: string;
  status: 'Active' | 'Completed' | 'Failed' | 'Updated';
  questBackground: string;
  description: string;
  objectives: QuestObjective[];
  rewards?: {
    experience?: number;
    money?: number;
    items?: string[];
    other?: string;
  };
  failureConsequences?: string;
  detailsLog?: string[];
}

export interface QuestObjective {
  objectiveId: string | null;
  description: string;
  status: 'Active' | 'Completed' | 'Failed';
}

export interface TacticalTrigger {
    triggerCondition: string;
    newTargetPriority: string;
    newActionPreference: string[];
    description: string;
}

export interface FateCardReward {
    description: string;
    newActiveSkills?: ActiveSkill[];
    newPassiveSkills?: PassiveSkill[];
    statBoosts?: string[];
    newServices?: string[];
    otherNarrativeRewards?: string;
    tacticalTriggers?: TacticalTrigger[];
}

export interface FateCard {
    cardId: string;
    name: string;
    image_prompt: string;
    description: string;
    unlockConditions: {
        requiredRelationshipLevel?: number;
        plotConditionDescription?: string;
        conjunction?: 'AND' | 'OR';
    };
    rewards: FateCardReward;
    isUnlocked: boolean;
}

export interface FactionAffiliation {
    factionId: string;
    factionName?: string;
    rank: string;
    membershipStatus: 'Active' | 'Former' | 'Exiled' | 'Undercover' | 'Ally' | 'Enemy';
}

export interface NPC {
  NPCId: string | null;
  name: string;
  currentLocationId?: string | null;
  image_prompt?: string;
  rarity?: string;
  age?: number;
  worldview?: string;
  race?: string;
  class?: string;
  appearanceDescription?: string;
  history?: string;
  level?: number;
  progressionType?: 'Companion' | 'PlotDriven' | 'Static';
  relationshipLevel?: number;
  attitude?: string;
  characteristics?: Characteristics;
  passiveSkills?: PassiveSkill[];
  activeSkills?: ActiveSkill[];
  inventory?: Item[];
  fateCards?: FateCard[];
  currentHealthPercentage?: string;
  maxHealthPercentage?: string;
  factionAffiliations?: FactionAffiliation[];
  activeEffects?: Effect[];
  wounds?: Wound[];
  journalEntries?: string[];
  skillMasteryData?: SkillMastery[];
  unlockedMemories?: UnlockedMemory[];
}


export interface FactionRank {
    rankNameMale: string;
    rankNameFemale: string;
    requiredReputation: number;
    benefits: string[];
}

export interface FactionRelation {
    targetFactionId: string;
    status: 'Allied' | 'War' | 'Rivalry' | 'Neutral' | 'Vassal' | 'Patron';
    description: string;
}

export interface Faction {
  factionId: string | null;
  name: string;
  description: string;
  reputation: number;
  reputationDescription: string;
  isPlayerMember: boolean;
  playerRank: string | null;
  ranks?: FactionRank[];
  relations?: FactionRelation[];
}

export interface WorldState {
  day: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  weather: string;
  currentTimeInMinutes: number;
}

export interface PlotOutline {
    mainArc: { summary: string, nextImmediateStep: string, potentialClimax: string };
    characterSubplots: { characterName: string, arcSummary: string, nextStep: string, potentialConflictOrResolution: string}[];
    loomingThreatsOrOpportunities: string[];
    lastUpdatedTurn: number;
}

export interface Effect {
  effectId?: string | null;
  effectType: string;
  value: string;
  targetType: string;
  duration: number;
  sourceSkill?: string;
  description: string;
  sourceWoundId?: string;
}

export interface HealingState {
    currentState: 'Untreated' | 'Stabilized' | 'Recovering' | 'Healed';
    description: string;
    treatmentProgress: number;
    progressNeeded: number;
    nextState: 'Stabilized' | 'Recovering' | 'Healed' | null;
    canBeImprovedBy: string[];
}

export interface Wound {
    woundId: string | null;
    woundName: string;
    severity: 'Light' | 'Moderate' | 'Serious' | 'Critical';
    descriptionOfEffects: string;
    generatedEffects: Effect[];
    healingState: HealingState;
}

export interface CombatActionEffect {
  effectType: string;
  value: string;
  targetType: string;
  targetTypeDisplayName?: string;
  duration?: number;
  effectDescription: string;
  targetsCount?: number;
}

export interface CombatAction {
  actionName?: string;
  isActivatedEffect?: boolean;
  effects: CombatActionEffect[];
  targetPriority?: string;
  scalingCharacteristic?: keyof Characteristics | null;
  shotsPerTurn?: number;
  ammoType?: string;
}

export interface Combatant {
    name: string;
    type: string;
    image_prompt: string;
    description?: string;
    maxHealth: string;
    currentHealth: string | null;
    actions: CombatAction[];
    resistances: {
        resistanceName: string;
        resistanceValue: string;
        resistType: string;
        resistTypeDisplayName: string;
    }[];
    activeBuffs: Effect[];
    activeDebuffs: Effect[];
    passiveSkills?: PassiveSkill[];
    inventory?: Item[];
    isGroup?: boolean;
    count?: number;
    unitName?: string;
    healthStates?: string[];
}

export interface EnemyCombatObject extends Combatant {
    NPCId: string | null;
}
export interface AllyCombatObject extends Combatant {
    NPCId: string | null;
}

export interface CustomState {
    stateId: string | null;
    stateName: string;
    currentValue: number;
    minValue: number;
    maxValue: number;
    description?: string;
    progressionRule?: {
        changePerTurn: number;
        description: string;
    };
    thresholds: {
        levelName: string;
        triggerCondition: 'value_greater_than_or_equal_to' | 'value_less_than_or_equal_to';
        triggerValue: number;
        associatedEffects: Effect[];
    }[];
}

// The full JSON response structure from the Gemini API
export interface GameResponse {
  response: string;
  items_and_stat_calculations: string[];
  inventoryItemsData: Partial<Item>[] | null;
  inventoryItemsResources: any[] | null;
  moveInventoryItems: any[] | null;
  removeInventoryItems: any[] | null;
  equipmentChanges: any[] | null;
  addOrUpdateRecipes?: Recipe[];
  removeRecipes?: string[];
  activeSkillChanges: Partial<ActiveSkill>[] | null;
  removeActiveSkills: string[] | null;
  skillMasteryChanges: any[] | null;
  passiveSkillChanges: Partial<PassiveSkill>[] | null;
  removePassiveSkills: string[] | null;
  NPCActiveSkillChanges: any[] | null;
  NPCPassiveSkillChanges?: any[] | null;
  NPCSkillMasteryChanges?: any[] | null;
  NPCPassiveSkillMasteryChanges?: any[] | null;
  enemiesData: EnemyCombatObject[] | null;
  alliesData: AllyCombatObject[] | null;
  combatLogEntries: string[] | null;
  playerActiveEffectsChanges: Effect[] | null;
  NPCEffectChanges: any[] | null;
  calculatedWeightData: { additionalEnergyExpenditure: number | null } | null;
  currentLocationData: LocationData;
  playerStatus: PlayerStatus;
  questUpdates: Quest[] | null;
  plotOutline: PlotOutline | null;
  worldMapUpdates: any | null;
  worldStateFlags: Record<string, any> | null;
  dialogueOptions: string[] | null;
  NPCsData: Partial<NPC>[] | null;
  NPCsRenameData: any[] | null;
  NPCJournals: any[] | null;
  NPCUnlockedMemories: any[] | null;
  NPCFateCardUnlocks: any[] | null;
  NPCRelationshipChanges: any[] | null;
  NPCsInScene: boolean;
  factionDataChanges: Faction[] | null;
  itemFateCardUnlocks: any[] | null;
  itemBondLevelChanges: any[] | null;
  statsIncreased: string[] | null;
  statsDecreased: string[] | null;
  currentEnergyChange: number;
  experienceGained: number;
  currentHealthChange: number;
  moneyChange: number;
  timeChange: number | null;
  weatherChange: { tendency: string; description: string; } | null;
  image_prompt: string;
  playerNameChange: string | null;
  playerAppearanceChange: string | null;
  playerRaceChange: string | null;
  playerClassChange: string | null;
  playerAutoCombatSkillChange: string | null;
  playerStealthStateChange?: {
    isActive: boolean;
    detectionLevel: number;
    description: string;
  } | null;
  multipliers: number[];
  playerWoundChanges: Wound[] | null;
  NPCWoundChanges: any[] | null;
  NPCInventoryResourcesChanges?: any[] | null;

  customStateChanges: CustomState[] | null;
  playerBehaviorAssessment: {
    historyManipulationCoefficient: number;
  };
}

export interface LocationData extends Location {
    locationId: string;
}

export interface PlayerStatus {
    healthPercentage: string;
    energyPercentage: string;
    activeConditions: string[];
}

export interface DBSaveSlotInfo {
  slotId: number;
  timestamp: string;
  playerName: string;
  playerLevel: number;
  locationName: string;
  turnNumber: number;
}

export interface SaveFile {
  gameContext: GameContext;
  gameState: GameState;
  gameHistory: ChatMessage[];
  gameLog: string[];
  lastJsonResponse: string | null;
  sceneImagePrompt: string | null;
  combatLog: string[];
  timestamp: string;
}
