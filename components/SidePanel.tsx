
//DO NOT USE ./components/{componentName}
//USE ./{componentName} since we are already INSIDE components folder

import React, { useState, useMemo } from 'react';
// FIX: Corrected import paths for local components.
import CharacterSheet from './CharacterSheet';
import QuestLog from './QuestLog';
// FIX: Changed import from 'Peer' to 'PeerInfo' to match the renamed interface in types.ts, resolving a name collision.
import { GameState, Location, WorldState, GameSettings, PlayerCharacter, Faction, PlotOutline, Item, DBSaveSlotInfo, WorldStateFlag, Wound, CustomState, UnlockedMemory, NPC, WorldEvent, Quest, PeerInfo, NetworkRole, CompletedActivity, LocationStorage, Project, Cinematic, NetworkChatMessage } from '../types';
import { UserCircleIcon, BookOpenIcon, CodeBracketIcon, DocumentTextIcon, UsersIcon, ShieldExclamationIcon, Cog6ToothIcon, MapIcon, MapPinIcon, QuestionMarkCircleIcon, UserGroupIcon, GlobeAltIcon, ArchiveBoxXMarkIcon, BeakerIcon, TrashIcon, WifiIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ArrowsPointingOutIcon, ClockIcon, FilmIcon } from '@heroicons/react/24/outline';
import { ChevronDoubleRightIcon, ChevronDoubleLeftIcon, UserIcon as UserIconSolid } from '@heroicons/react/24/solid';
import JsonDebugView from './JsonDebugView';
import GameLogView from './GameLogView';
import NpcLog from './NpcLog';
import CombatTracker from './CombatTracker';
import GameMenuView from './GameMenuView';
import LocationViewer from './LocationViewer';
import LocationLog from './LocationLog';
import { useLocalization } from '../context/LocalizationContext';
import GlobalSearch from './GlobalSearch';
import HelpGuide from './HelpGuide';
import StashView from './StashView';
import CraftingScreen from './CraftingScreen';
import WorldPanel from './WorldPanel';
import ConfirmationModal from './ConfirmationModal';
import ImageRenderer from './ImageRenderer';
import PlayersPanel from './PlayersPanel';
import Modal from './Modal';
import CinemaHall from './CinemaHall';

interface SidePanelProps {
  gameState: GameState | null;
  worldState: WorldState | null;
  worldStateFlags: WorldStateFlag[] | null;
  onOpenInventory: () => void;
  onOpenNpcInventory: (npc: NPC) => void;
  lastJsonResponse: string | null;
  lastRequestJsonForDebug: string | null;
  gameLog: string[];
  combatLog: string[];
  onDeleteLogs: () => void;
  onSaveGame: () => Promise<void>;
  onLoadGame: () => Promise<void>;
  onLoadAutosave: () => void;
  autosaveTimestamp: string | null;
  visitedLocations: Location[];
  onOpenDetailModal: (title: string, data: any) => void;
  onOpenJournalModal: (npc: NPC) => void;
  onOpenImageModal: (prompt: string, originalTextPrompt: string, onClearCustom?: () => void, onUpload?: (base64: string) => void) => void;
  onShowMessageModal: (title: string, content: string) => void;
  onSpendAttributePoint: (characteristic: string) => void;
  onToggleSidebar: () => void;
  onExpandMap: () => void;
  onExpandCombat?: () => void;
  onExpandCinemaHall?: () => void;
  gameSettings: GameSettings | null;
  updateGameSettings: (newSettings: Partial<GameSettings>) => void;
  superInstructions: string;
  updateSuperInstructions: (instructions: string) => void;
  isLoading: boolean;
  setAutoCombatSkill: (skillName: string | null) => void;
  lastUpdatedQuestId?: string | null;
  onSendMessage: (message: string) => void;
  craftItem: (recipeName: string) => void;
  moveFromStashToInventory: (item: Item, quantity: number) => void;
  dropItemFromStash: (item: Item) => void;
  turnNumber: number | null;
  editChatMessage: (index: number, newContent: string) => void;
  editNpcData: (npcId: string, field: keyof NPC, value: any) => void;
  editQuestData: (questId: string, field: keyof Quest, value: any) => void;
  editItemData: (itemId: string, field: keyof Item, value: any) => void;
  editFactionData: (factionId: string, field: keyof Faction, value: any) => void;
  editLocationData: (locationId: string, field: keyof Location, value: any) => void;
  editPlayerData: (field: keyof PlayerCharacter, value: any) => void;
  // FIX: Updated the type signature of `editWorldState` to accept a single object argument instead of two separate arguments, aligning it with the updated `useGameLogic` hook and resolving the TypeScript error.
  editWorldState: (updates: Partial<{ day: number; time: string; year: number; monthIndex: number; }>) => void;
  editWeather: (newWeather: string) => void;
  editWorldStateFlagData: (flagId: string, field: keyof WorldStateFlag, value: any) => void;
  saveGameToSlot: (slotId: number) => Promise<void>;
  loadGameFromSlot: (slotId: number) => Promise<void>;
  deleteGameSlot: (slotId: number) => Promise<void>;
  dbSaveSlots: DBSaveSlotInfo[];
  refreshDbSaveSlots: () => Promise<void>;
  currentStep: string | null;
  currentModel: string | null;
  turnTime: number | null;
  imageCache: Record<string, string>;
  onImageGenerated: (prompt: string, base64: string) => void;
  forgetHealedWound: (characterType: 'player' | 'npc', characterId: string | null, woundId: string) => void;
  forgetActiveWound: (characterType: 'player' | 'npc', characterId: string | null, woundId: string) => void;
  clearAllHealedWounds: (characterType: 'player' | 'npc', characterId: string | null) => void;
  onRegenerateId: (entity: any, entityType: string) => void;
  deleteCustomState: (stateId: string) => void;
  deleteNpcCustomState: (npcId: string, stateId: string) => void;
  deleteWorldStateFlag: (flagId: string) => void;
  deleteWorldEvent: (eventId: string) => void;
  deleteWorldEventsByTurnRange: (startTurn: number, endTurn: number) => void;
  updateNpcSortOrder: (newOrder: string[]) => void;
  updateItemSortOrder: (newOrder: string[]) => void;
  updateItemSortSettings: (criteria: PlayerCharacter['itemSortCriteria'], direction: PlayerCharacter['itemSortDirection']) => void;
  updateNpcItemSortOrder: (npcId: string, newOrder: string[]) => void;
  updateNpcItemSortSettings: (npcId: string, criteria: PlayerCharacter['itemSortCriteria'], direction: PlayerCharacter['itemSortDirection']) => void;
  updateActiveSkillSortOrder: (newOrder: string[]) => void;
  updatePassiveSkillSortOrder: (newOrder: string[]) => void;
  handleTransferItem: (sourceType: 'player' | 'npc', targetType: 'player' | 'npc', npcId: string, item: Item, quantity: number) => void;
  handleEquipItemForNpc: (npcId: string, item: Item, slot: string) => void;
  handleUnequipItemForNpc: (npcId: string, item: Item) => void;
  handleSplitItemForNpc: (npcId: string, item: Item, quantity: number) => void;
  handleMergeItemsForNpc: (npcId: string, sourceItem: Item, targetItem: Item) => void;
  handleMoveItemForNpc: (npcId: string, item: Item, containerId: string | null) => void;
  forgetNpc: (npcId: string) => void;
  forgetFaction: (factionId: string) => void;
  forgetQuest: (questId: string) => void;
  forgetLocation: (locationId: string) => void;
  onEditNpcMemory: (npcId: string, memory: UnlockedMemory) => void;
  onDeleteNpcMemory: (npcId: string, memoryId: string) => void;
  clearNpcJournalsNow: () => void;
  addPlayer: (creationData: any) => void;
  // FIX: Added playerId to updatePlayerPortrait signature to match the implementation in useGameLogic.
  updatePlayerPortrait: (playerId: string, portraitData: { prompt?: string | null; custom?: string | null; }) => void;
  allNpcs?: NPC[];
  allFactions?: Faction[];
  allLocations?: Location[];
  removePlayer: (playerId: string) => void;
  passTurnManually: () => void;
  passTurnToPlayer: (playerIndex: number) => void;
  deleteActiveSkill: (skillName: string) => void;
  deletePassiveSkill: (skillName: string) => void;
  assignCharacterToPeer: (characterId: string, newPeerId: string | null) => void;
  peers?: PeerInfo[];
  networkRole?: NetworkRole;
  onViewCharacterSheet: (character: PlayerCharacter | NPC) => void;
  forceSyncAll: () => void;
  startHostingFromLocalGame: () => void;
  disconnect: () => void;
  isMyTurn: boolean;
  requestSyncFromHost: () => void;
  clearAllCompletedFactionProjects: (factionId: string) => void;
  clearAllCompletedNpcActivities: (npcId: string) => void;
  onDeleteCurrentActivity: (npcId: string) => void;
  onDeleteCompletedActivity: (npcId: string, activity: CompletedActivity) => void;
  deleteFactionProject: (factionId: string, projectId: string) => void;
  deleteFactionCustomState: (factionId: string, stateId: string) => void;
  sidePanelView: string;
  onSetSidePanelView: (view: string) => void;
  updateNpcPortrait: (npcId: string, portraitData: { prompt?: string | null; custom?: string | null; }) => void;
  onOpenTextReader: (title: string, content: string) => void;
  onOpenStorage: (locationId: string, storage: LocationStorage) => void;
  placeAsStorage: (item: Item) => void;
  generateFilmTrailer: (prompt: string) => void;
  isGeneratingCinema: boolean;
  cinemaGenerationProgress: { current: number; total: number; message: string };
  playCinematic: (id: string) => void;
  exportCinematic: (id: string) => void;
  importCinematic: () => void;
  deleteCinematic: (id: string) => void;
  continueFilmTrailer: (cinematicId: string) => void;
  extendingCinematicId: string | null;
  cancelCinemaGeneration: () => void;
  updateCinematic: (cinematicId: string, updates: Partial<Omit<Cinematic, 'id'>>) => void;
  regenerateCinemaFrame: (cinematicId: string, frameIndex: number, newPrompt: string) => Promise<boolean>;
  generateCinematicAudio: (cinematicId: string, voice: string) => Promise<void>;
  npcsInScene: NPC[];
  networkChatHistory: NetworkChatMessage[];
  sendNetworkChatMessage: (content: string) => void;
}

type Tab = 'Character' | 'Quests' | 'Factions' | 'SceneNPCs' | 'NPCs' | 'Locations' | 'Map' | 'Combat' | 'Log' | 'Guide' | 'Debug' | 'System' | 'Stash' | 'World' | 'Characters' | 'Network' | 'Crafting' | 'CinemaHall';

const TABS: { name: Tab; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { name: 'Character', icon: UserCircleIcon },
    { name: 'Quests', icon: BookOpenIcon },
    { name: 'Characters', icon: UserGroupIcon },
    { name: 'World', icon: GlobeAltIcon },
    { name: 'Factions', icon: UserGroupIcon },
    { name: 'SceneNPCs', icon: UserIconSolid },
    { name: 'NPCs', icon: UsersIcon },
    { name: 'Locations', icon: MapPinIcon },
    { name: 'Map', icon: MapIcon },
    { name: 'Combat', icon: ShieldExclamationIcon },
    { name: 'Log', icon: DocumentTextIcon },
    { name: 'Stash', icon: ArchiveBoxXMarkIcon },
    { name: 'Crafting', icon: BeakerIcon },
    { name: 'CinemaHall', icon: FilmIcon },
    { name: 'Guide', icon: QuestionMarkCircleIcon },
    { name: 'Debug', icon: CodeBracketIcon },
    { name: 'System', icon: Cog6ToothIcon },
    { name: 'Network', icon: WifiIcon },
];

type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

const FactionItem: React.FC<{
    faction: Faction;
    onOpenModal: (title: string, data: any) => void;
    allowHistoryManipulation: boolean;
    onDelete: () => void;
    gameSettings: GameSettings | null;
    imageCache: Record<string, string>;
    onImageGenerated: (prompt: string, base64: string) => void;
    t: TFunction;
}> = ({ faction, onOpenModal, allowHistoryManipulation, onDelete, gameSettings, imageCache, onImageGenerated, t }) => {
    const imagePrompt = faction.custom_image_prompt || faction.image_prompt;
    return (
        <div className="relative w-full text-left bg-gray-900/40 p-3 rounded-lg border-l-4 shadow-md transition-all hover:ring-1 hover:ring-cyan-500/50 group" style={{ borderColor: faction.color || '#4b5563' }}>
            {allowHistoryManipulation && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 z-10"
                    title={t('Forget Faction')}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            )}
            <button
                onClick={() => onOpenModal(t("Faction: {name}", { name: faction.name }), { ...faction, type: 'faction' })}
                className="w-full text-left flex items-start gap-4"
            >
                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-800 flex items-center justify-center">
                    {imagePrompt ? (
/* FIX: Passed the required `gameSettings` prop to the `ImageRenderer` component. */
                        <ImageRenderer prompt={imagePrompt} originalTextPrompt={faction.image_prompt || ''} alt={faction.name} className="w-full h-full object-cover" imageCache={imageCache} onImageGenerated={onImageGenerated} model={gameSettings?.pollinationsImageModel} gameSettings={gameSettings} />
                    ) : (
                        <UserGroupIcon className="w-8 h-8 text-cyan-400" />
                    )}
                </div>
                <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-200" style={{ color: faction.color || 'inherit' }}>
                        {faction.name} {faction.level !== undefined && <span className="text-sm font-mono text-cyan-400">({t('Lvl {level}', { level: faction.level })})</span>}
                    </p>
                    <p className="text-sm text-gray-400">{t('Reputation')}: {faction.reputation}</p>
                </div>
            </button>
        </div>
    );
};

const FactionLog: React.FC<{
    factions: Faction[];
    onOpenModal: (title: string, data: any) => void;
    allowHistoryManipulation: boolean;
    forgetFaction: (factionId: string) => void;
    imageCache: Record<string, string>;
    onImageGenerated: (prompt: string, base64: string) => void;
    gameSettings: GameSettings | null;
    t: TFunction;
}> = ({ factions, onOpenModal, allowHistoryManipulation, forgetFaction, imageCache, onImageGenerated, gameSettings, t }) => {
    const [factionToDelete, setFactionToDelete] = useState<Faction | null>(null);

    const handleDeleteConfirm = () => {
        if (factionToDelete && factionToDelete.factionId) {
            forgetFaction(factionToDelete.factionId);
        }
        setFactionToDelete(null);
    };

    return (
        <>
            <div className="space-y-4">
                 <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text">{t('Factions')}</h3>
                {factions.length > 0 ? (
                    <div className="space-y-3">
                        {factions.map((faction) => (
                            <FactionItem
                                key={faction.factionId || faction.name}
                                faction={faction}
                                onOpenModal={onOpenModal}
                                allowHistoryManipulation={allowHistoryManipulation}
                                onDelete={() => setFactionToDelete(faction)}
                                gameSettings={gameSettings}
                                imageCache={imageCache}
                                onImageGenerated={onImageGenerated}
                                t={t}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 p-6 bg-gray-900/20 rounded-lg">
                        <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        {t('No factions encountered yet.')}
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={!!factionToDelete}
                onClose={() => setFactionToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title={t('Forget Faction')}
            >
                <p>{t("Are you sure you want to forget about {name}? This will remove them from your known factions list.", { name: factionToDelete?.name })}</p>
            </ConfirmationModal>
        </>
    );
};


export default function SidePanel(props: SidePanelProps): React.ReactNode {
  const { 
    gameState, 
    worldState, 
    worldStateFlags,
    onOpenInventory, 
    onOpenNpcInventory,
    lastJsonResponse,
    lastRequestJsonForDebug, 
    gameLog, 
    combatLog,
    onDeleteLogs, 
    onSaveGame, 
    onLoadGame, 
    onLoadAutosave, 
    autosaveTimestamp, 
    visitedLocations, 
    onOpenDetailModal,
    onOpenJournalModal,
    onOpenImageModal,
    onShowMessageModal,
    onSpendAttributePoint, 
    onToggleSidebar,
    onExpandMap,
    onExpandCombat,
    onExpandCinemaHall,
    gameSettings,
    updateGameSettings,
    superInstructions,
    updateSuperInstructions,
    isLoading,
    setAutoCombatSkill,
    lastUpdatedQuestId,
    onSendMessage,
    craftItem,
    moveFromStashToInventory,
    dropItemFromStash,
    turnNumber,
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
    saveGameToSlot,
    loadGameFromSlot,
    deleteGameSlot,
    dbSaveSlots,
    refreshDbSaveSlots,
    currentStep,
    currentModel,
    turnTime,
    imageCache,
    onImageGenerated,
    forgetHealedWound,
    forgetActiveWound,
    clearAllHealedWounds,
    onRegenerateId,
    deleteCustomState,
    deleteNpcCustomState,
    deleteWorldStateFlag,
    deleteWorldEvent,
    deleteWorldEventsByTurnRange,
    updateNpcSortOrder,
    updateItemSortOrder,
    updateItemSortSettings,
    updateNpcItemSortOrder,
    updateNpcItemSortSettings,
    updateActiveSkillSortOrder,
    updatePassiveSkillSortOrder,
    handleTransferItem,
    handleEquipItemForNpc,
    handleUnequipItemForNpc,
    handleSplitItemForNpc,
    handleMergeItemsForNpc,
    handleMoveItemForNpc,
    forgetNpc,
    forgetFaction,
    forgetQuest,
    forgetLocation,
    onEditNpcMemory,
    onDeleteNpcMemory,
    clearNpcJournalsNow,
    addPlayer,
    updatePlayerPortrait,
    allNpcs,
    allFactions,
    allLocations,
    removePlayer,
    passTurnManually,
    passTurnToPlayer,
    deleteActiveSkill,
    deletePassiveSkill,
    assignCharacterToPeer,
    peers,
    networkRole,
    onViewCharacterSheet,
    forceSyncAll,
    startHostingFromLocalGame,
    disconnect,
    isMyTurn,
    requestSyncFromHost,
    clearAllCompletedFactionProjects,
    clearAllCompletedNpcActivities,
    onDeleteCurrentActivity,
    onDeleteCompletedActivity,
    deleteFactionProject,
    deleteFactionCustomState,
    sidePanelView,
    onSetSidePanelView,
    updateNpcPortrait,
    onOpenTextReader,
    onOpenStorage,
    placeAsStorage,
    generateFilmTrailer,
    isGeneratingCinema,
    cinemaGenerationProgress,
    playCinematic,
    exportCinematic,
    importCinematic,
    deleteCinematic,
    continueFilmTrailer,
    extendingCinematicId,
    cancelCinemaGeneration,
    updateCinematic,
    regenerateCinemaFrame,
    generateCinematicAudio,
    npcsInScene,
    networkChatHistory,
    sendNetworkChatMessage,
  } = props;
  const [isPlayerSheetFullScreen, setPlayerSheetFullScreen] = useState(false);
  const { language, t } = useLocalization();

  const handleLanguageToggle = () => {
    const newLang = language === 'ru' ? 'en' : 'ru';
    updateGameSettings({ language: newLang });
  };

  const temporaryStash = gameState?.temporaryStash || [];
  const showStash = temporaryStash.length > 0;
  
  React.useEffect(() => {
    if (showStash) {
        onSetSidePanelView('Stash');
    }
  }, [showStash, onSetSidePanelView]);

  const biome = gameState?.currentLocationData?.biome;

  const visibleTabs = useMemo(() => {
    return TABS.filter(tab => {
        if (tab.name === 'Characters' && gameSettings?.cooperativeGameType === 'None') return false;
        if (tab.name === 'Stash' && !showStash) return false;
        if (tab.name === 'SceneNPCs' && (!npcsInScene || npcsInScene.length === 0)) return false;
        if (tab.name === 'CinemaHall' && !gameSettings?.modelName.includes('2.5')) return false;
        return true;
    });
  }, [gameSettings, showStash, npcsInScene]);

  const renderMainMenu = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-2 mb-4">
          <h3 className="text-xl font-bold text-cyan-400 narrative-text">{t("Menu")}</h3>
          <div className="flex items-center gap-2">
              <button
                  onClick={handleLanguageToggle}
                  className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-1.5"
                  title={t("Switch Language")}
                  aria-label={t("Switch Language")}
              >
                  <GlobeAltIcon className="w-5 h-5" />
                  <span className="font-bold text-xs">{language.toUpperCase()}</span>
              </button>
              <button
                  onClick={onToggleSidebar}
                  className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 hover:text-white transition-colors flex-shrink-0"
                  title={t("Collapse Sidebar")}
                  aria-label={t("Collapse Sidebar")}
              >
                  <ChevronDoubleRightIcon className="w-5 h-5" />
              </button>
          </div>
      </div>
      <div className="flex-1 overflow-y-auto -mx-4 md:-mx-6 px-4 md:px-6">
        <GlobalSearch
            gameState={gameState}
            visitedLocations={visitedLocations}
            onOpenDetailModal={onOpenDetailModal}
        />
        <div className="grid grid-cols-2 gap-3">
            {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isStashTab = tab.name === 'Stash';
            return (
                <button
                key={tab.name}
                onClick={() => onSetSidePanelView(tab.name)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors relative ${
                    isStashTab
                    ? 'text-red-300 hover:bg-red-500/10'
                    : 'text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-300'
                }`}
                >
                <Icon className={`w-6 h-6 flex-shrink-0 ${isStashTab ? 'text-red-400' : 'text-cyan-400/80'}`} />
                <span className="font-semibold text-base">{t(tab.name as any)}</span>
                {isStashTab && showStash && (
                    <span className="absolute top-2 right-2 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{temporaryStash.length}</span>
                    </span>
                )}
                </button>
            );
            })}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700/60 flex flex-col sm:flex-row gap-2">
        <button onClick={onSaveGame} disabled={!gameState || isLoading} className="flex-1 flex items-center justify-center gap-3 px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
            <ArrowDownTrayIcon className="w-5 h-5" />
            {t("Save to File")}
        </button>
        <button onClick={onLoadGame} disabled={isLoading} className="flex-1 flex items-center justify-center gap-3 px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
             <ArrowUpTrayIcon className="w-5 h-5" />
            {t("Load from File")}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    const currentTabInfo = TABS.find(t => t.name === sidePanelView);
    const Icon = currentTabInfo?.icon || UserCircleIcon;
    const isSystemOrNetwork = sidePanelView === 'System' || sidePanelView === 'Network';
    return (
      <>
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between gap-3 mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onSetSidePanelView('menu')}
                        className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 hover:text-white transition-colors"
                        title={t("Back to Menu")}
                    >
                        <ChevronDoubleLeftIcon className="w-5 h-5" />
                    </button>
                    <Icon className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-xl font-bold text-cyan-400 narrative-text">{t(sidePanelView as Tab)}</h3>
                </div>
                {sidePanelView === 'Character' && (
                    <button onClick={() => setPlayerSheetFullScreen(true)} className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 hover:text-white transition-colors" title={t('Expand')}>
                        <ArrowsPointingOutIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto -mx-4 md:-mx-6 px-4 md:px-6">
              {sidePanelView === 'Character' && gameState && <CharacterSheet
                {...props}
                character={gameState.playerCharacter}
                playerCharacter={gameState.playerCharacter}
                isViewOnly={false}
                allLocations={allLocations || []}
                allNpcs={allNpcs || []}
                encounteredFactions={allFactions || []}
                onDeleteCustomState={deleteCustomState}
                onEditPlayerData={editPlayerData}
                onDeleteActiveSkill={deleteActiveSkill}
                onDeletePassiveSkill={deletePassiveSkill}
                onOpenTextReader={onOpenTextReader}
              />}
              {sidePanelView === 'Quests' && gameState && <QuestLog activeQuests={gameState.activeQuests} completedQuests={gameState.completedQuests} onOpenModal={onOpenDetailModal} lastUpdatedQuestId={lastUpdatedQuestId} allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false} forgetQuest={forgetQuest} />}
              {sidePanelView === 'Characters' && gameState && gameSettings && <PlayersPanel playerCharacter={gameState.playerCharacter} players={gameState.players} gameSettings={gameSettings} onAddPlayer={addPlayer} removePlayer={removePlayer} passTurnToPlayer={passTurnToPlayer} allowHistoryManipulation={gameSettings.allowHistoryManipulation} assignCharacterToPeer={assignCharacterToPeer} peers={peers || []} networkRole={networkRole || 'none'} onViewCharacterSheet={onViewCharacterSheet} imageCache={imageCache} onImageGenerated={onImageGenerated} updatePlayerPortrait={updatePlayerPortrait} />}
              {sidePanelView === 'World' && <WorldPanel 
                worldState={worldState} 
                worldStateFlags={gameState?.worldStateFlags || null} 
                worldEventsLog={gameState?.worldEventsLog || null} 
                turnNumber={turnNumber} 
                allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false} 
                onDeleteFlag={deleteWorldStateFlag} 
                editWorldState={editWorldState} 
                onEditWeather={editWeather} 
                onEditFlagData={editWorldStateFlagData} 
                biome={biome} 
                allNpcs={allNpcs || []} 
                allFactions={allFactions || []} 
                allLocations={allLocations || []} 
                onOpenDetailModal={onOpenDetailModal} 
                onDeleteEvent={deleteWorldEvent} 
                deleteWorldEventsByTurnRange={deleteWorldEventsByTurnRange} 
                onShowMessageModal={onShowMessageModal} 
                gameSettings={gameSettings}
                imageCache={imageCache}
                onImageGenerated={onImageGenerated}
                onOpenImageModal={onOpenImageModal}
                />}
              {sidePanelView === 'Factions' && gameState && <FactionLog factions={gameState.encounteredFactions} onOpenModal={onOpenDetailModal} allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false} forgetFaction={forgetFaction} imageCache={gameState.imageCache} onImageGenerated={onImageGenerated} gameSettings={gameSettings} t={t} />}
              {sidePanelView === 'SceneNPCs' && gameState && <NpcLog gameState={gameState} npcs={npcsInScene} encounteredFactions={gameState.encounteredFactions} onOpenModal={onOpenDetailModal} onOpenJournalModal={onOpenJournalModal} onViewCharacterSheet={onViewCharacterSheet} imageCache={imageCache} onImageGenerated={onImageGenerated} updateNpcSortOrder={updateNpcSortOrder} forgetNpc={forgetNpc} allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false} gameSettings={gameSettings} onOpenImageModal={onOpenImageModal} updateNpcPortrait={updateNpcPortrait} />}
              {sidePanelView === 'NPCs' && gameState && <NpcLog gameState={gameState} npcs={gameState.encounteredNPCs} encounteredFactions={gameState.encounteredFactions} onOpenModal={onOpenDetailModal} onOpenJournalModal={onOpenJournalModal} onViewCharacterSheet={onViewCharacterSheet} imageCache={imageCache} onImageGenerated={onImageGenerated} updateNpcSortOrder={updateNpcSortOrder} forgetNpc={forgetNpc} allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false} gameSettings={gameSettings} onOpenImageModal={onOpenImageModal} updateNpcPortrait={updateNpcPortrait} />}
              {sidePanelView === 'Locations' && gameState && <LocationLog locations={visitedLocations} currentLocation={gameState.currentLocationData} onOpenModal={onOpenDetailModal} allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false} onEditLocationData={editLocationData} imageCache={gameState.imageCache} onImageGenerated={onImageGenerated} forgetLocation={forgetLocation} gameSettings={gameSettings} />}
              {sidePanelView === 'Map' && gameState && <LocationViewer visitedLocations={visitedLocations} currentLocation={gameState.currentLocationData} onOpenModal={onOpenDetailModal} imageCache={gameState.imageCache} onImageGenerated={onImageGenerated} onExpand={onExpandMap} gameSettings={gameSettings} encounteredFactions={gameState.encounteredFactions || []} />}
              {sidePanelView === 'Combat' && gameState && <CombatTracker enemies={gameState.enemiesData} allies={gameState.alliesData} combatLog={combatLog} allNpcs={gameState.encounteredNPCs} playerCharacter={gameState.playerCharacter} setAutoCombatSkill={setAutoCombatSkill} onOpenDetailModal={onOpenDetailModal} onViewCharacterSheet={onViewCharacterSheet} onSendMessage={onSendMessage} isLoading={isLoading} imageCache={imageCache} onImageGenerated={onImageGenerated} onOpenImageModal={onOpenImageModal} gameSettings={gameSettings} onExpand={onExpandCombat} editNpcData={editNpcData} />}
              {sidePanelView === 'Stash' && showStash && gameState && <StashView stash={temporaryStash} onTake={moveFromStashToInventory} onDrop={dropItemFromStash} playerCharacter={gameState.playerCharacter} imageCache={imageCache} onImageGenerated={onImageGenerated} gameSettings={gameSettings} />}
              {sidePanelView === 'Crafting' && gameState && <CraftingScreen playerCharacter={gameState.playerCharacter} craftItem={craftItem} />}
              {sidePanelView === 'CinemaHall' && <CinemaHall 
                cinematics={gameState?.cinematics || []} 
                onGenerateTrailer={generateFilmTrailer} 
                isGenerating={isGeneratingCinema} 
                progress={cinemaGenerationProgress} 
                onPlay={playCinematic} 
                onExport={exportCinematic} 
                onDelete={deleteCinematic} 
                onImport={importCinematic} 
                onContinue={continueFilmTrailer} 
                extendingCinematicId={extendingCinematicId} 
                onCancel={cancelCinemaGeneration}
                updateCinematic={updateCinematic}
                regenerateCinemaFrame={regenerateCinemaFrame}
                generateCinematicAudio={generateCinematicAudio}
                onExpand={onExpandCinemaHall}
                isFullScreen={false}
              />}
              {sidePanelView === 'Guide' && <HelpGuide />}
              {sidePanelView === 'Log' && <GameLogView gameLog={gameLog} onDeleteLogs={onDeleteLogs} />}
              {sidePanelView === 'Debug' && <JsonDebugView jsonString={lastJsonResponse} requestJsonString={lastRequestJsonForDebug} plotOutline={gameState?.plotOutline || null} currentStep={currentStep} currentModel={currentModel} turnTime={turnTime} />}
              {isSystemOrNetwork && <GameMenuView onSave={onSaveGame} onLoad={onLoadGame} onLoadAutosave={onLoadAutosave} autosaveTimestamp={autosaveTimestamp} isGameActive={!!gameState} gameSettings={gameSettings} updateGameSettings={updateGameSettings} superInstructions={superInstructions} updateSuperInstructions={updateSuperInstructions} isLoading={isLoading} onSaveToSlot={saveGameToSlot} onLoadFromSlot={loadGameFromSlot} onDeleteSlot={deleteGameSlot} dbSaveSlots={dbSaveSlots} refreshDbSaveSlots={refreshDbSaveSlots} clearNpcJournalsNow={clearNpcJournalsNow} gameState={gameState} activeTab={sidePanelView as 'System' | 'Network'} forceSyncAll={forceSyncAll} startHostingFromLocalGame={startHostingFromLocalGame} disconnect={disconnect} isMyTurn={isMyTurn} requestSyncFromHost={requestSyncFromHost} networkChatHistory={networkChatHistory} sendNetworkChatMessage={sendNetworkChatMessage} />}
            </div>
        </div>
        {isPlayerSheetFullScreen && gameState && (
            <Modal
                isOpen={true}
                onClose={() => setPlayerSheetFullScreen(false)}
                title={`${t('Character Sheet')}: ${gameState.playerCharacter.name}`}
                size="fullscreen"
                onToggleFullScreen={() => setPlayerSheetFullScreen(false)}
                isFullScreen={true}
            >
                <CharacterSheet
                    {...props}
                    character={gameState.playerCharacter}
                    playerCharacter={gameState.playerCharacter}
                    isViewOnly={false}
                    allLocations={allLocations || []}
                    allNpcs={allNpcs || []}
                    encounteredFactions={allFactions || []}
                    onDeleteCustomState={deleteCustomState}
                    onEditPlayerData={editPlayerData}
                    onDeleteActiveSkill={deleteActiveSkill}
                    onDeletePassiveSkill={deletePassiveSkill}
                    onOpenTextReader={onOpenTextReader}
                />
            </Modal>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {sidePanelView === 'menu' ? renderMainMenu() : renderContent()}
    </div>
  );
}
