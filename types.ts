// FIX: Defined and exported all missing types required by the application.
export interface Month {
  name: string;
  days: number;
}

export interface Calendar {
  startingYear: number;
  months: Month[];
  daysInWeek: number;

  dayNames: string[];
}

export type ImageGenerationSource = 
  { provider: 'pollinations'; model: 'flux' | 'turbo' | 'gptimage'; } |
  { provider: 'nanobanana'; } |
  { provider: 'imagen'; };

export type ImageCacheEntry = {
  src: string;
  sourceProvider: 'Pollinations.ai' | 'Nano Banana' | 'Imagen' | 'Custom Upload';
  sourceModel?: string;
};

export interface GameSettings {
  nonMagicMode: boolean;
  language: Language;
  gameWorldInformation: {
    currencyName: string;
    baseInfo: any;
    customInfo: string;
    calendar?: Calendar;
  };
  modelName: string;
  correctionModelName?: string;
  aiProvider: 'gemini' | 'openrouter';
  isCustomModel: boolean;
  customModelName?: string;
  openRouterModelName?: string;
  geminiThinkingBudget?: number;
  useDynamicThinkingBudget?: boolean;
  adultMode: boolean;
  geminiApiKey?: string;
  openRouterApiKey?: string;
  youtubeApiKey?: string;
  allowHistoryManipulation: boolean;
  hardMode: boolean;
  impossibleMode: boolean;
  notificationSound: boolean;
  keepLatestNpcJournals: boolean;
  latestNpcJournalsCount: number;
  cooperativeGameType: 'None' | 'MultiplePersonalities' | 'FullParty';
  autoPassTurnInCoop: boolean;
  showPartyStatusPanel?: boolean;
  multiplePersonalitiesSettings?: {
    shareCharacteristics: boolean;
    shareSkills: boolean;
    shareNpcReputation: boolean;
    shareFactionReputation: boolean;
    shareInventory: boolean;
  };
  doNotUseWorldEvents: boolean;
  imageGenerationModelPipeline: ImageGenerationSource[];
  useGoogleSearch?: boolean;
  showImageSourceInfo?: boolean;
  // FIX: Add missing properties for backward compatibility and image generation settings.
  pollinationsImageModel?: 'flux' | 'turbo' | 'gptimage' | 'kontext';
  useNanoBananaFallback?: boolean;
  useNanoBananaPrimary?: boolean;
}

export interface WorldState {
  day: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  weather: string;
  currentTimeInMinutes: number;
  lastWorldProgressionTimeInMinutes: number;
  lastFactionProgressionTimeInMinutes?: number;
  date?: {
    currentYear: number;
    currentMonthName: string;
    dayOfMonth: number;
    dayOfWeekName: string;
  };
}

export interface ChatMessage {
  sender: 'player' | 'gm' | 'system';
  content: string;
}

export interface Characteristics {
  standardStrength: number;
  modifiedStrength: number;
  standardDexterity: number;
  modifiedDexterity: number;
  standardConstitution: number;
  modifiedConstitution: number;
  standardIntelligence: number;
  modifiedIntelligence: number;
  standardWisdom: number;
  modifiedWisdom: number;
  standardFaith: number;
  modifiedFaith: number;
  standardAttractiveness: number;
  modifiedAttractiveness: number;
  standardTrade: number;
  modifiedTrade: number;
  standardPersuasion: number;
  modifiedPersuasion: number;
  standardPerception: number;
  modifiedPerception: number;
  standardLuck: number;
  modifiedLuck: number;
  standardSpeed: number;
  modifiedSpeed: number;
}

export interface StealthState {
  isActive: boolean;
  detectionLevel: number;
  description: string;
}

export interface EffortTracker {
  lastUsedCharacteristic: string | null;
  consecutivePartialSuccesses: number;
}

export interface StructuredBonus {
    bonusId?: string;
    description: string;
    bonusType: 'Characteristic' | 'ActionCheck' | 'Utility' | 'Other' | 'PowerProfileScale' | 'Resource' | 'CustomStatePower';
    target: string;
    valueType: 'Flat' | 'Percentage' | 'String' | 'Boolean' | 'Reference';
    value: any;
    application: 'Permanent' | 'Conditional';
    condition: string | null;
}

export interface Item {
    existedId: string | null;
    initialId?: string;
    name: string;
    description: string;
    image_prompt?: string;
    custom_image_prompt?: string | null;
    quality: string;
    type: string;
    group?: string;
    price: number;
    count: number;
    weight: number;
    volume: number;
    textContent?: (string | null)[];
    bonuses: string[];
    structuredBonuses?: StructuredBonus[];
    customProperties?: any[];
    contentsPath: string[] | null;
    isContainer: boolean;
    capacity: number | null;
    isConsumption: boolean;
    containerWeight?: number | null;
    weightReduction?: number | null;
    durability: string;
    combatEffect?: CombatAction[];
    equipmentSlot: string | string[] | null;
    requiresTwoHands?: boolean;
    disassembleTo?: any[];
    fateCards?: FateCard[];
    ownerBondLevelCurrent?: number;
    resource?: number;
    maximumResource?: number;
    resourceType?: string;
    tags?: string[];
    isSentient?: boolean;
    journalEntries?: (string | null)[];
}

export interface ActiveSkill {
    skillName: string;
    skillDescription: string;
    rarity: string;
    combatEffect?: CombatAction;
    scalingCharacteristic: string | null;
    scalesValue?: boolean;
    scalesDuration?: boolean;
    scalesChance?: boolean;
    energyCost?: string | number;
    cooldownTurns?: number;
    tags?: string[];
}

export interface PassiveSkill {
    skillName: string;
    skillDescription: string;
    rarity: string;
    type: string;
    group: string;
    combatEffect?: CombatAction;
    playerStatBonus?: string | null;
    structuredBonuses?: StructuredBonus[];
    effectDetails?: string;
    masteryLevel: number;
    maxMasteryLevel: number;
    knowledgeDomain?: string;
    unlockedActiveSkillsCount?: number;
    maxUnlockableActiveSkills?: number;
    tags?: string[];
}

export interface SkillMastery {
    skillName: string;
    currentMasteryLevel: number;
    currentMasteryProgress: number;
    masteryProgressNeeded: number;
}

export interface SkillMasteryChange {
    skillName: string;
    newMasteryLevel?: number;
    newCurrentMasteryProgress?: number;
    newMasteryProgressNeeded?: number;
    masteryLeveledUp?: boolean;
}

export interface Recipe {
    recipeName: string;
    craftedItemName: string;
    description: string;
    requiredKnowledgeSkill?: {
        skillName: string;
        requiredMasteryLevel: number;
    };
    requiredMaterials: {
        materialName: string;
        quantity: number;
    }[];
    requiredTools: string[];
    outputQuantity: number;
}

export interface Effect {
    effectId?: string;
    effectType: string;
    value: string;
    targetType: string;
    duration: number;
    sourceSkill?: string;
    sourceWoundId?: string;
    description: string;
}

export interface Wound {
    woundId: string;
    woundName: string;
    severity: string;
    descriptionOfEffects: string;
    generatedEffects: Effect[];
    healingState: {
        currentState: string;
        description: string;
        treatmentProgress: number;
        progressNeeded: number;
        nextState: string | null;
        canBeImprovedBy: string[];
    };
}

export interface CustomState {
    stateId: string;
    stateName: string;
    currentValue: number;
    minValue: number;
    maxValue: number;
    description: string;
    progressionRule: {
        description: string;
    };
    thresholds: any[];
}

export interface PlayerCharacter {
    playerId: string;
    name: string;
    race: string;
    class: string;
    age: number;
    appearanceDescription: string;
    raceDescription: string;
    classDescription: string;
    portrait: string | null;
    image_prompt: string | null;
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
    isOverloaded?: boolean;
    critChanceBuffFromLuck: number;
    critChanceThreshold: number;
    characteristics: Characteristics;
    activeSkills: ActiveSkill[];
    passiveSkills: PassiveSkill[];
    activeSkillSortOrder?: string[];
    passiveSkillSortOrder?: string[];
    skillMasteryData: SkillMastery[];
    knownRecipes: Recipe[];
    inventory: Item[];
    itemSortOrder?: string[];
    itemSortCriteria?: 'manual' | 'name' | 'quality' | 'weight' | 'price' | 'type';
    itemSortDirection?: 'asc' | 'desc';
    equippedItems: Record<string, string | null>;
    activePlayerEffects: Effect[];
    playerWounds: Wound[];
    playerCustomStates: CustomState[];
    autoCombatSkill: string | null;
    stealthState: StealthState;
    effortTracker: EffortTracker;
    personalNpcReputations?: any[];
    personalFactionReputations?: any[];
    characterChronicle?: (string | null)[];
}

export interface LocationStorage {
    storageId: string;
    name: string;
    description: string;
    image_prompt?: string;
    capacity: number | null;
    volume: number | null;
    owner: {
      ownerType: 'Player' | 'Faction' | 'Shared';
      ownerId: string;
      ownerName: string;
    };
    authorizedUsers: {
      playerId: string;
      playerName: string;
    }[];
    contents: Item[];
    hasFullAccess: boolean;
}

export interface DifficultyProfile {
    combat: number;
    environment: number;
    social: number;
    exploration: number;
}

export interface ThreatActivity {
    activityName: string;
    description: string;
    totalTimeCostMinutes: number;
    timeSpentMinutes: number;
    currentStepNumber?: number;
    totalStepsInActivity?: number;
}

export interface ThreatImpactProfile {
    primaryTargetType: 'Faction' | 'Location' | 'Resource';
    primaryTargetId: string | null;
    primaryTargetName: string;
    primaryImpact: 'Military' | 'Economic' | 'Social' | 'Covert' | 'Stability' | 'Environment';
    baseImpactValue: number;
}

export interface ThreatArchetype {
    motivation: 'Domination' | 'Consumption' | 'Preservation' | 'Corruption' | 'Accumulation' | 'Execution' | 'Custom';
    method: 'Overt' | 'Covert' | 'Deceptive' | 'Opportunistic' | 'Systemic' | 'Custom';
    customMotivation: string | null;
    customMethod: string | null;
}

export interface CompletedThreatActivity {
    activityName: string;
    finalState: 'Completed' | 'Abandoned';
    narrativeSummary: string;
    completionTurn: number;
}

export interface ActiveThreat {
    threatId: string | null;
    name: string;
    threatArchetype: ThreatArchetype;
    intensity: number;
    longTermGoal: string;
    currentActivity: ThreatActivity | null;
    impactProfile: ThreatImpactProfile;
    completedActivities?: CompletedThreatActivity[];
}

export interface LocationData {
    locationId: string | null;
    initialId?: string;
    name: string;
    coordinates: { x: number, y: number };
    locationType: 'indoor' | 'outdoor';
    biome: string | null;
    indoorType?: string | null;
    internalDifficultyProfile: DifficultyProfile;
    externalDifficultyProfile: DifficultyProfile;
    description: string;
    eventDescriptions?: string[];
    image_prompt: string;
    custom_image_prompt?: string | null;
    adjacencyMap?: AdjacencyMapEntry[];
    factionControl?: any[];
    locationStorages?: LocationStorage[];
    activeThreats?: ActiveThreat[];
}

export type Location = LocationData;

export interface Objective {
    objectiveId: string;
    description: string;
    status: 'Active' | 'Completed' | 'Failed';
}

// FIX: Added optional newDetailsLogEntry to Quest for quest update objects.
export interface Quest {
    questId: string;
    questName: string;
    questGiver: string;
    status: 'Active' | 'Completed' | 'Failed' | 'Updated';
    questBackground: string;
    description: string;
    objectives: Objective[];
    rewards?: {
        experience?: number;
        money?: number;
        items?: string[];
        other?: string;
    };
    failureConsequences?: string;
    detailsLog?: string[];
    newDetailsLogEntry?: string;
}

// FIX: Defined QuestUpdate type for GameResponse.
export interface QuestUpdate extends Partial<Quest> {
  newDetailsLogEntry?: string;
}

// FIX: Defined PlotOutline and related types to resolve multiple 'Cannot find name' errors.
export interface PlotOutlineArc {
    summary: string;
    nextImmediateStep: string;
    potentialClimax: string;
}
  
export interface CharacterSubplot {
    characterName: string;
    arcSummary: string;
    nextStep: string;
    potentialConflictOrResolution: string;
}
  
export interface PlotOutline {
    mainArc: PlotOutlineArc;
    characterSubplots: CharacterSubplot[];
    loomingThreatsOrOpportunities: string[];
    lastUpdatedTurn: number;
}

export interface UnlockedMemory {
    memoryId: string;
    title: string;
    unlockedAtRelationshipLevel: number;
    content: string;
}

export interface FateCard {
    cardId: string;
    name: string;
    image_prompt: string;
    description: string;
    unlockConditions?: {
        requiredRelationshipLevel?: number;
        plotConditionDescription?: string;
        conjunction?: 'AND' | 'OR';
    };
    rewards?: {
        description: string;
    };
    isUnlocked: boolean;
}

// FIX: Added missing Activity types for NPCs.
export interface CurrentActivity {
    activityName: string;
    description: string;
    totalTimeCostMinutes: number;
    timeSpentMinutes: number;
    currentStepNumber: number;
    totalStepsInActivity: number;
    linkedQuestId?: string;
    linkedPlotOutlineNode?: string;
    activeState?: 'Active' | 'Completed' | 'Abandoned';
}

export interface CompletedActivity {
    activityName: string;
    completionTurn: number;
    finalOutcome: 'Success' | 'SuccessWithComplication' | 'Failure';
    narrativeSummary: string;
}

export interface FactionAffiliation {
    factionId: string;
    factionName: string;
    rank: string | null;
    branch?: string | null;
    membershipStatus: 'Active' | 'Former' | 'Exiled' | 'Undercover' | 'Ally' | 'Enemy';
}

// FIX: Added missing properties to NPC interface.
export interface NPC {
    NPCId: string;
    name: string;
    currentLocationId?: string | null;
    initialLocationId?: string;
    image_prompt?: string;
    custom_image_prompt?: string | null;
    rarity?: string;
    age?: number;
    worldview?: string;
    personalityArchetype?: string;
    race: string;
    class: string;
    appearanceDescription: string;
    raceDescription: string;
    classDescription: string;
    history: string;
    level?: number;
    progressionType?: 'Companion' | 'PlotDriven' | 'Static';
    relationshipLevel: number;
    lastRelationshipChangeReason?: string;
    attitude: string;
    characteristics: Characteristics;
    passiveSkills: PassiveSkill[];
    activeSkills: ActiveSkill[];
    skillMasteryData?: SkillMastery[];
    inventory: Item[];
    itemSortOrder?: string[];
    itemSortCriteria?: 'manual' | 'name' | 'quality' | 'weight' | 'price' | 'type';
    itemSortDirection?: 'asc' | 'desc';
    equippedItems?: Record<string, string | null>;
    customStates?: CustomState[];
    fateCards?: FateCard[];
    factionAffiliations?: FactionAffiliation[];
    journalEntries?: string[];
    unlockedMemories?: UnlockedMemory[];
    wounds?: Wound[];
    activeEffects?: Effect[];
    maxWeight?: number;
    totalWeight?: number;
    isOverloaded?: boolean;
    criticalExcessWeight?: number;
    currentHealth: number;
    maxHealth: number;
    currentEnergy?: number;
    maxEnergy?: number;
    experience?: number;
    experienceForNextLevel?: number;
    playerCompanionDirective?: string | null;
    progressionTrackers?: {
        lastPlayerXPValueOnSync?: number;
        dailyEffortHoursSpent?: number;
    };
    currentActivity?: CurrentActivity | null;
    completedActivities?: CompletedActivity[];
    tags?: string[];
}

export interface FactionRank {
    rankNameMale: string;
    rankNameFemale: string;
    requiredReputation: number;
    benefits: string[];
    unlockCondition?: string;
    isJunctionPoint?: boolean;
    availableBranches?: string[];
}

export interface FactionRankBranch {
    branchId: string;
    displayName: string;
    isCoreBranch: boolean;
    ranks: FactionRank[];
}

export interface PowerProfile {
    military: number;
    economic: number;
    social: number;
    covert: number;
    logistics: number;
    stability: number;
    arcane_tech: number;
    exploration: number;
}

export interface MetaResource {
    resourceName: 'Wealth' | 'Influence' | 'Manpower';
    currentStockpile: number;
    incomePerCycle: number;
    upkeepPerCycle: number;
}

export interface StrategicGood {
    resourceName: string;
    currentStockpile: number;
    incomePerCycle: number;
}

export interface Project {
    projectId: string;
    projectName: string;
    description: string;
    totalTimeCostMinutes: number;
    timeSpentMinutes: number;
    currentStep: number;
    totalSteps: number;
    totalResourceCost?: any[];
    resourcesSpent?: any[];
    activeState?: 'Active' | 'Completed' | 'Abandoned';
}

export interface CompletedProject {
    projectId: string;
    projectName: string;
    completionTurn: number;
    finalState: 'Completed' | 'Abandoned';
}

// FIX: Expanded the Faction interface to include all properties available from the Gemini API prompt.
export interface Faction {
    factionId: string;
    initialId?: string | null;
    name: string;
    description: string;
    reputation: number;
    reputationDescription: string;
    isPlayerMember: boolean;
    playerRank: string | null;
    playerBranch?: string | null;
    ranks?: { branches: FactionRankBranch[] };
    color?: string;
    image_prompt?: string;
    custom_image_prompt?: string | null;
    level?: number;
    experience?: number;
    experienceForNextLevel?: number;
    developmentArchetype?: string;
    customArchetypePriorities?: { primary: string; secondary: string; tertiary: string; };
    powerProfile?: PowerProfile;
    resources?: {
        metaResources: MetaResource[];
        strategicGoods: StrategicGood[];
    };
    controlledTerritories?: { locationId: string; locationName: string; }[];
    isPlayerFaction?: boolean;
    playerStrategyDirective?: string;
    structuredBonuses?: StructuredBonus[];
    customStates?: CustomState[];
    activeProjects?: Project[];
    completedProjects?: CompletedProject[];
    scribeChronicle?: string[];
    relations?: {
        targetFactionId: string;
        status: 'Allied' | 'War' | 'Rivalry' | 'Neutral' | 'Vassal' | 'Patron';
        description: string;
    }[];
}

export interface WorldStateFlag {
    flagId: string;
    displayName: string;
    value: any;
    description: string;
}

export interface AffectedFaction {
  factionId: string;
  factionName: string;
  impactDescription: string;
}

export interface AffectedLocation {
  locationId: string;
  locationName: string;
  impactDescription: string;
}

export interface InvolvedNPC {
  NPCId: string;
  NPCName: string;
  roleInEvent: string;
}

export interface WorldEvent {
    eventId: string;
    turnNumber: number;
    worldTime: { day: number; minutesIntoDay: number };
    headline: string;
    summary: string;
    vignette: string;
    eventType: string;
    visibility: string;
    image_prompt?: string;
    affectedFactions?: AffectedFaction[];
    affectedLocations?: AffectedLocation[];
    involvedNPCs?: InvolvedNPC[];
}

export interface LootTemplate {
    baseName: string;
    quality: string;
    bonuses: string[];
}

export interface FactionChronicleUpdate {
    factionId: string;
    factionName: string;
    entryToAppend: string;
}

export interface FactionBonusChange {
    factionId: string;
    factionName: string;
    bonusesToAddOrUpdate?: (StructuredBonus & { bonusId?: string | null })[];
    bonusesToRemove?: string[] | null;
}

export interface FactionResourceChange {
    factionId: string;
    factionName: string;
    resourceChanges: {
        resourceName: string;
        changeAmount: number;
    }[];
}

export interface FactionCustomStateChange {
    factionId: string;
    factionName: string;
    statesToAddOrUpdate?: (CustomState & { stateId?: string | null })[];
    statesToRemove?: string[];
}

export interface NPCSkillChange {
    NPCId: string | null;
    NPCName: string;
    skillChanges?: (ActiveSkill | PassiveSkill)[];
    skillsToRemove?: string[];
}

export interface NPCSkillMasteryChange {
    NPCId: string | null;
    NPCName: string;
    skillName: string;
    newMasteryLevel?: number;
    newCurrentMasteryProgress?: number;
    newMasteryProgressNeeded?: number;
}

export interface NPCPassiveSkillMasteryChange {
    NPCId: string | null;
    NPCName: string;
    skillName: string;
    newMasteryLevel?: number;
    newMaxMasteryLevel?: number;
}

export interface NPCEffectChange {
    NPCId: string | null;
    NPCName: string;
    effectsApplied?: (Partial<Effect> & { effectId?: string | null })[];
    effectsToRemove?: string[];
}

export interface NPCInventoryAdd {
    NPCId: string | null;
    NPCName: string;
    item: Item;
    destinationContainerId?: string | null;
}

export interface NPCInventoryUpdate {
    NPCId: string | null;
    NPCName: string;
    itemUpdate: Partial<Item> & { existedId: string };
}

export interface NPCInventoryRemoval {
    NPCId: string | null;
    NPCName: string;
    itemId: string;
}

export interface NPCEquipmentChange {
    NPCId: string | null;
    NPCName: string;
    action: 'equip' | 'unequip';
    itemId: string | null;
    itemName: string;
    targetSlots?: string[];
    sourceSlots?: string[];
}

export interface NPCInventoryResourceChange {
    NPCId: string | null;
    NPCName: string;
    itemId: string | null;
    itemName: string;
    newResourceValue?: number;
    resource?: number;
    maximumResource?: number;
    resourceType?: string;
}

export interface NPCCustomStateChange {
    NPCId: string | null;
    NPCName: string;
    stateChanges: (Partial<CustomState> & { stateId?: string | null })[];
}

export interface NPCActivityUpdate {
    NPCId: string;
    NPCName: string;
    activityUpdate: Partial<CurrentActivity>;
}

export interface FactionProjectUpdate {
    factionId: string;
    factionName: string;
    projectUpdate: Partial<Project> & { projectId: string };
}

export interface CompleteNPCActivity {
    NPCId: string;
    NPCName: string;
    activityName: string;
    finalState: 'Completed' | 'Abandoned';
    narrativeSummary: string;
}

export interface CompleteFactionProject {
    projectId: string;
    projectName: string;
    completionTurn: number;
    finalState: 'Completed' | 'Abandoned';
}

export interface CompleteThreatActivity {
  targetLocationId: string;
  threatId: string;
  threatName: string;
  finalState: 'Completed' | 'Abandoned';
  narrativeSummary: string;
}

// FIX: Added missing player-specific commands.
export interface EquipmentChange {
  action: 'equip' | 'unequip';
  itemId: string;
  itemName: string;
  targetSlots?: string[];
  sourceSlots?: string[];
}

export interface ItemResourceChange {
  name: string;
  resource: number;
  maximumResource: number;
  resourceType: string;
  contentsPath: string[] | null;
  existedId: string;
}

export interface ItemMove {
  movedItemId: string;
  itemName: string;
  currentContentsPath: string[] | null;
  destinationContainerId: string | null;
  destinationContainerName: string | null;
  destinationContentsPath: string[] | null;
}

interface LocationUpdate {
    locationId: string;
    newName?: string;
    newInternalDifficultyProfile?: Partial<DifficultyProfile>;
    newExternalDifficultyProfile?: Partial<DifficultyProfile>;
    newLastEventsDescription?: string;
    factionControl?: any[];
    locationStorages?: LocationStorage[];
}

export interface StorageUpdatePayload {
  newName?: string;
  newDescription?: string;
  newCapacity?: number | null;
  newOwner?: LocationStorage['owner'];
  [key: string]: any;
}

export interface StorageUpdate {
  targetLocationId: string;
  storageId: string;
  update: StorageUpdatePayload;
}

export interface StorageRemoval {
  targetLocationId: string;
  storageId: string;
}

interface WorldMapUpdates {
    newLocations?: Partial<Location>[];
    newLinks?: { sourceLocationId: string; link: AdjacencyMapEntry }[];
    locationUpdates?: LocationUpdate[];
    linkUpdates?: any[];
    linksToRemove?: any[];
    threatsToAdd?: { targetLocationId?: string; initialTargetLocationId?: string; threat: ActiveThreat }[];
    threatsToUpdate?: { targetLocationId: string, threatUpdate: Partial<ActiveThreat> & { threatId: string } }[];
    threatsToRemove?: { targetLocationId: string, threatId: string }[];
    completeThreatActivities?: CompleteThreatActivity[];
    storageUpdates?: StorageUpdate[];
    storagesToRemove?: StorageRemoval[];
}

export interface FactionRankBranchChange {
    factionId: string | null;
    initialFactionId?: string | null;
    factionName: string;
    branchesToAdd?: FactionRankBranch[];
    branchesToUpdate?: { branchId: string; newDisplayName?: string }[];
    branchesToRemove?: string[];
    ranksToAdd?: { targetBranchId: string; rank: FactionRank }[];
    ranksToUpdate?: {
        targetBranchId: string;
        rankIdentifier: string;
        update: Partial<{
            newRankNameMale: string;
            newRankNameFemale: string;
            newRequiredReputation: number;
            newUnlockCondition: string;
            newBenefits: string[];
            newIsJunctionPoint: boolean;
            newAvailableBranches: string[];
        }>;
    }[];
    ranksToRemove?: { targetBranchId: string; rankIdentifier: string }[];
}

export interface GameResponse {
    response?: string;
    image_prompt?: string;
    items_and_stat_calculations?: string[];
    inventoryItemsData?: Partial<Item>[];
    removeInventoryItems?: { removedItemId: string }[];
    updateItemTextContents?: { itemId: string; itemName: string; textToAppend: string }[];
    activeSkillChanges?: Partial<ActiveSkill>[];
    removeActiveSkills?: string[];
    skillMasteryChanges?: SkillMasteryChange[];
    passiveSkillChanges?: Partial<PassiveSkill>[];
    removePassiveSkills?: string[];
    enemiesData?: EnemyCombatObject[];
    alliesData?: AllyCombatObject[];
    combatLogEntries?: string[];
    playerActiveEffectsChanges?: Partial<Effect>[];
    currentLocationData?: Partial<Location> & { lastEventsDescription?: string };
    questUpdates?: QuestUpdate[];
    NPCsData?: Partial<NPC>[];
    NPCsRenameData?: { oldName: string; newName: string }[];
    NPCJournals?: { NPCId: string; name: string; lastJournalNote: string }[];
    NPCRelationshipChanges?: { NPCId: string; newRelationshipLevel: number; changeReason?: string; }[];
    factionDataChanges?: Partial<Faction>[];
    factionRankBranchChanges?: FactionRankBranchChange[];
    dialogueOptions?: string[];
    multipliers?: number[];
    playerBehaviorAssessment?: { historyManipulationCoefficient: number };
    currentHealthChange?: number;
    currentEnergyChange?: number;
    moneyChange?: number;
    experienceGained?: number;
    timeChange?: number;
    weatherChange?: { tendency: string };
    setWorldTime?: { day: number, minutesIntoDay: number };
    updateWorldProgressionTracker?: { newLastWorldProgressionTimeInMinutes: number };
    updateFactionProgressionTracker?: { newLastFactionProgressionTimeInMinutes: number };
    playerStatus?: any;
    worldStateFlags?: WorldStateFlag[];
    removeWorldStateFlags?: string[];
    worldEventsLog?: WorldEvent[];
    plotOutline?: PlotOutline;
    worldMapUpdates?: WorldMapUpdates;
    playerWoundChanges?: Partial<Wound>[];
    addOrUpdateRecipes?: Recipe[];
    removeRecipes?: string[];
    calculatedWeightData?: { additionalEnergyExpenditure: number };
    otherPlayersInteractions?: Record<string, any>;
    customStateChanges?: Partial<CustomState>[];
    playerCharacterNameChange?: string | null;
    playerImagePromptChange?: string | null;
    generateWorldProgression?: boolean;
    factionChronicleUpdates?: FactionChronicleUpdate[];
    factionBonusChanges?: FactionBonusChange[];
    factionResourceChanges?: FactionResourceChange[];
    statsIncreased?: string | string[];
    statsDecreased?: string | string[];
    setCharacteristics?: Record<string, number>;
    NPCActiveSkillChanges?: NPCSkillChange[];
    NPCPassiveSkillChanges?: NPCSkillChange[];
    NPCSkillMasteryChanges?: NPCSkillMasteryChange[];
    NPCPassiveSkillMasteryChanges?: NPCPassiveSkillMasteryChange[];
    NPCEffectChanges?: NPCEffectChange[];
    NPCUnlockedMemories?: (Partial<UnlockedMemory> & { NPCId: string; NPCName: string })[];
    NPCFateCardUnlocks?: { NPCId: string; cardId: string; cardName: string }[];
    NPCsInScene?: boolean;
    factionCustomStateChanges?: FactionCustomStateChange[];
    NPCInventoryAdds?: NPCInventoryAdd[];
    NPCInventoryUpdates?: NPCInventoryUpdate[];
    NPCInventoryRemovals?: NPCInventoryRemoval[];
    NPCEquipmentChanges?: NPCEquipmentChange[];
    itemFateCardUnlocks?: { itemId: string; cardId: string; cardName: string }[];
    itemBondLevelChanges?: { itemId: string; itemName: string; newBondLevel: number; changeReason: string }[];
    itemJournalUpdates?: { itemId: string | null; initialItemId?: string; itemName: string; entryToAppend: string }[];
    playerAppearanceChange?: string | null;
    playerRaceChange?: string | null;
    playerRaceDescriptionChange?: string | null;
    playerClassChange?: string | null;
    playerClassDescriptionChange?: string | null;
    playerAutoCombatSkillChange?: string | 'clear' | null;
    playerStealthStateChange?: Partial<StealthState>;
    playerEffortTrackerChange?: Partial<EffortTracker>;
    NPCWoundChanges?: (Partial<Wound> & { NPCId: string; NPCName: string })[];
    NPCInventoryResourcesChanges?: NPCInventoryResourceChange[];
    NPCCustomStateChanges?: NPCCustomStateChange[];
    NPCActivityUpdates?: NPCActivityUpdate[];
    factionProjectUpdates?: FactionProjectUpdate[];
    completeNPCActivities?: CompleteNPCActivity[];
    completeFactionProjects?: CompleteFactionProject[];
    // FIX: Added missing player-specific commands for 100% prompt coverage.
    equipmentChanges?: EquipmentChange[];
    inventoryItemsResources?: ItemResourceChange[];
    moveInventoryItems?: ItemMove[];
    characterChronicleUpdates?: { entryToAppend: string }[];
}

export interface CollectiveActionState {
    isActive: boolean;
    initiatorId: string;
    initiatorName: string;
    prompt: string;
    participantIds: string[];
    actions: Record<string, string>;
}

export interface SimultaneousActionState {
    isActive: boolean;
    actions: Record<string, string>; // playerId -> action
}

export interface CinemaFrame {
    imagePrompt: string;
    imageUrl?: string;
    subtitle: string;
}

export interface Cinematic {
    id: string;
    title: string;
    synopsis: string;
    userPrompt: string;
    frames: CinemaFrame[];
    comments: string[];
    audio_base64?: string;
    audio_voice?: string;
}

export interface GameState {
    playerCharacter: PlayerCharacter;
    players: PlayerCharacter[];
    activePlayerIndex: number;
    currentLocationData: Location;
    activeQuests: Quest[];
    completedQuests: Quest[];
    encounteredNPCs: NPC[];
    encounteredFactions: Faction[];
    enemiesData: EnemyCombatObject[];
    alliesData: AllyCombatObject[];
    playerCustomStates: CustomState[];
    plotOutline: PlotOutline | null;
    temporaryStash?: Item[];
    worldStateFlags: WorldStateFlag[];
    worldEventsLog: WorldEvent[];
    imageCache: Record<string, ImageCacheEntry>;
    lastUpdatedQuestId?: string | null;
    npcSortOrder?: string[];
    NPCsInScene?: boolean;
    cinematics?: Cinematic[];
    // Network state
    networkRole: NetworkRole;
    myPeerId: string | null;
    hostPeerId?: string | null;
// FIX: Changed Peer[] to PeerInfo[] to resolve name collision with peerjs library.
    peers: PeerInfo[];
    isConnectedToHost: boolean;
    playerNeedsToCreateCharacter?: boolean;
    collectiveActionState?: CollectiveActionState | null;
    simultaneousActionState?: SimultaneousActionState | null;
}

export interface CombatActionEffect {
    effectType: string;
    value: string;
    targetType: string;
    targetTypeDisplayName?: string;
    duration?: number;
    effectDescription?: string;
    targetsCount?: number;
}

export interface CombatAction {
    actionName: string;
    isActivatedEffect?: boolean;
    effects: CombatActionEffect[];
    targetPriority?: string;
    scalingCharacteristic?: string | null;
    shotsPerTurn?: number;
    ammoType?: string;
}

export interface Combatant {
    NPCId: string | null;
    name: string;
    image_prompt?: string;
    description: string;
    type: string;
    isGroup?: boolean;
    count?: number;
    unitName?: string;
    healthStates?: string[];
    maxHealth: string;
    currentHealth: string | null;
    actions: CombatAction[];
    resistances?: any[];
    activeBuffs?: any[];
    activeDebuffs?: any[];
    wounds?: Wound[];
}

export type EnemyCombatObject = Combatant;
export type AllyCombatObject = Combatant;

export interface GameContext {
    message: string;
    image?: { mimeType: string; data: string; } | null;
    superInstructions: string;
    currentTurnNumber: number;
    gameSettings: GameSettings;
    playerCharacter: PlayerCharacter;
    players: PlayerCharacter[];
    currentLocation: Location;
    visitedLocations: Location[];
    activeQuests: Quest[];
    completedQuests: Quest[];
    encounteredNPCs: NPC[];
    npcSkillMasteryData: any[]; // Or more specific type
    lootForCurrentTurn: LootTemplate[];
    preGeneratedDices1d20: number[];
    worldState: WorldState;
    worldStateFlags: WorldStateFlag[];
    previousTurnResponse: GameResponse | null;
    encounteredFactions: Faction[];
    plotOutline: PlotOutline | null;
    worldMap: Record<string, Location>;
    responseHistory: ChatMessage[];
    currentStepFocus: string | null;
    partiallyGeneratedResponse: any | null;
    enemiesDataForCurrentTurn: EnemyCombatObject[];
    alliesDataForCurrentTurn: AllyCombatObject[];
    playerCustomStates: CustomState[];
    worldEventsLog: WorldEvent[];
    networkRole: NetworkRole;
// FIX: Changed Peer[] to PeerInfo[] to resolve name collision with peerjs library.
    peers: PeerInfo[];
    isConnectedToHost: boolean;
}

export interface DBSaveSlotInfo {
    slotId: number;
    timestamp: string;
    playerName: string;
    playerLevel: number;
    locationName: string;
    turnNumber: number;
}

export interface AdjacencyMapEntry {
    name: string;
    shortDescription: string;
    linkType: string;
    linkState: string;
    targetCoordinates: { x: number, y: number };
    estimatedInternalDifficultyProfile?: DifficultyProfile;
    estimatedExternalDifficultyProfile?: DifficultyProfile;
}

export interface NetworkChatMessage {
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

export interface NetworkMessage {
    type: NetworkMessageType;
    payload: any;
    senderId?: string;
}

export type Language = 'en' | 'ru';

export type NetworkRole = 'host' | 'player' | 'spectator' | 'none';

// FIX: Renamed interface from Peer to PeerInfo to avoid name collision with the 'peerjs' library.
export interface PeerInfo {
    id: string; // Will be a peer connection ID
    name: string; // The player's character name
}

// --- NEW Network Message Protocol ---
export type NetworkMessageType = 
  'full_sync' | 
  'game_state_update' | 
  'new_player_character_data' |
  'player_joined_notification' |
  'player_left_notification' |
  'chat_message' |
  'turn_passed' |
  'player_action' |
  'request_full_sync' |
  'request_collective_action' |
  'submit_collective_action' |
  'request_simultaneous_action' |
  'simultaneous_action_submit' |
  'turn_result_from_player';

export interface SaveFile {
  gameContext: GameContext;
  gameState: GameState;
  gameHistory: ChatMessage[];
  gameLog: string[];
  combatLog: string[];
  lastJsonResponse: string | null;
  sceneImagePrompt: string | null;
  timestamp: string;
}

export interface FullSyncPayload {
  saveFile: SaveFile;
}

export const isWound = (d: any): d is (Wound & { type: 'wound', characterType: 'player' | 'npc', characterId: string | null }) => d && typeof d === 'object' && !Array.isArray(d) && d.type === 'wound';