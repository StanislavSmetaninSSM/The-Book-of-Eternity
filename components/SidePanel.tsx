





import React, { useState } from 'react';
import CharacterSheet from './CharacterSheet';
import QuestLog from './QuestLog';
// FIX: Import Quest type
import { GameState, Location, WorldState, GameSettings, PlayerCharacter, Faction, PlotOutline, Item, DBSaveSlotInfo, WorldStateFlag, Wound, CustomState, UnlockedMemory, NPC, WorldEvent, Quest } from '../types';
import { UserCircleIcon, BookOpenIcon, CodeBracketIcon, DocumentTextIcon, UsersIcon, ShieldExclamationIcon, Cog6ToothIcon, MapIcon, MapPinIcon, QuestionMarkCircleIcon, UserGroupIcon, GlobeAltIcon, ArchiveBoxXMarkIcon, BeakerIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ChevronDoubleRightIcon } from '@heroicons/react/24/solid';
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

interface SidePanelProps {
  gameState: GameState | null;
  worldState: WorldState | null;
  worldStateFlags: WorldStateFlag[] | null;
  onOpenInventory: () => void;
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
  onOpenImageModal: (prompt: string) => void;
  onShowMessageModal: (title: string, content: string) => void;
  onSpendAttributePoint: (characteristic: string) => void;
  onToggleSidebar: () => void;
  onExpandMap: () => void;
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
  // FIX: Added missing props for editing game state.
  editChatMessage: (index: number, newContent: string) => void;
  editNpcData: (npcId: string, field: keyof NPC, value: any) => void;
  editQuestData: (questId: string, field: keyof Quest, value: any) => void;
  editItemData: (itemId: string, field: keyof Item, value: any) => void;
  editFactionData: (factionId: string, field: keyof Faction, value: any) => void;
  editPlayerData: (field: keyof PlayerCharacter, value: any) => void;
  editLocationData: (locationId: string, field: keyof Location, value: any) => void;
  editWorldState: (day: number, time: string) => void;
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
  handleTransferItem: (sourceType: 'player' | 'npc', targetType: 'player' | 'npc', npcId: string, item: Item, quantity: number) => void;
  handleEquipItemForNpc: (npcId: string, item: Item, slot: string) => void;
  handleUnequipItemForNpc: (npcId: string, item: Item) => void;
  handleSplitItemForNpc: (npcId: string, item: Item, quantity: number) => void;
  handleMergeItemsForNpc: (npcId: string, sourceItem: Item, targetItem: Item) => void;
  forgetNpc: (npcId: string) => void;
  forgetFaction: (factionId: string) => void;
  forgetQuest: (questId: string) => void;
  forgetLocation: (locationId: string) => void;
  onEditNpcMemory: (npcId: string, memory: UnlockedMemory) => void;
  onDeleteNpcMemory: (npcId: string, memoryId: string) => void;
  clearNpcJournalsNow: () => void;
  forgetActiveWound: (characterType: 'player' | 'npc', characterId: string | null, woundId: string) => void;
}

type Tab = 'Character' | 'Quests' | 'Factions' | 'NPCs' | 'Locations' | 'Map' | 'Combat' | 'Log' | 'Guide' | 'Debug' | 'Game' | 'Stash' | 'World' | 'Crafting';

const TABS: { name: Tab; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { name: 'Character', icon: UserCircleIcon },
    { name: 'Quests', icon: BookOpenIcon },
    { name: 'World', icon: GlobeAltIcon },
    { name: 'Factions', icon: UserGroupIcon },
    { name: 'NPCs', icon: UsersIcon },
    { name: 'Locations', icon: MapPinIcon },
    { name: 'Map', icon: MapIcon },
    { name: 'Combat', icon: ShieldExclamationIcon },
    { name: 'Log', icon: DocumentTextIcon },
    { name: 'Stash', icon: ArchiveBoxXMarkIcon },
    { name: 'Crafting', icon: BeakerIcon },
    { name: 'Guide', icon: QuestionMarkCircleIcon },
    { name: 'Debug', icon: CodeBracketIcon },
    { name: 'Game', icon: Cog6ToothIcon },
];

const FactionLog: React.FC<{ 
    factions: Faction[]; 
    onOpenModal: (title: string, data: any) => void;
    allowHistoryManipulation: boolean;
    forgetFaction: (factionId: string) => void;
    imageCache: Record<string, string>;
    onImageGenerated: (prompt: string, base64: string) => void;
}> = ({ factions, onOpenModal, allowHistoryManipulation, forgetFaction, imageCache, onImageGenerated }) => {
  const { t } = useLocalization();
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
        {factions && factions.length > 0 ? (
          <div className="space-y-3">
            {factions.map((faction) => {
              const imagePrompt = faction.custom_image_prompt || faction.image_prompt;
              return (
              <div key={faction.factionId || faction.name} className="relative group">
                 {allowHistoryManipulation && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setFactionToDelete(faction);
                        }}
                        className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 z-10"
                        title={t('Forget Faction')}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                )}
                <button 
                  onClick={() => onOpenModal(t("Faction: {name}", { name: faction.name }), { ...faction, type: 'faction' })}
                  className="w-full text-left bg-gray-900/40 p-3 rounded-lg border border-gray-700/50 shadow-md transition-all hover:ring-1 hover:ring-cyan-500/50 hover:border-cyan-500/50 flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-800 flex items-center justify-center">
                        {imagePrompt ? (
                            <ImageRenderer prompt={imagePrompt} alt={faction.name} className="w-full h-full object-cover" imageCache={imageCache} onImageGenerated={onImageGenerated} />
                        ) : (
                            <UserGroupIcon className="w-8 h-8 text-cyan-400" />
                        )}
                    </div>
                  <div>
                      <p className="font-semibold text-gray-200">{faction.name}</p>
                      <p className="text-sm text-gray-400">{t('Reputation')}: {faction.reputation} ({t(faction.reputationDescription as any)})</p>
                      {faction.isPlayerMember && <p className="text-xs text-yellow-300/70 mt-1">{t('Rank')}: {faction.playerRank}</p>}
                  </div>
                </button>
              </div>
            )})}
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
        <p>{t("forget_faction_confirm", { name: factionToDelete?.name })}</p>
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
    handleTransferItem,
    handleEquipItemForNpc,
    handleUnequipItemForNpc,
    handleSplitItemForNpc,
    handleMergeItemsForNpc,
    forgetNpc,
    forgetFaction,
    forgetQuest,
    forgetLocation,
    onEditNpcMemory,
    onDeleteNpcMemory,
    clearNpcJournalsNow,
    forgetActiveWound,
  } = props;
  const [activeTab, setActiveTab] = useState<Tab>('Character');
  const { language, t } = useLocalization();

  const handleLanguageToggle = () => {
    const newLang = language === 'ru' ? 'en' : 'ru';
    updateGameSettings({ language: newLang });
  };

  const temporaryStash = gameState?.temporaryStash || [];
  const showStash = temporaryStash.length > 0;
  
  React.useEffect(() => {
    if (showStash) {
        setActiveTab('Stash');
    }
  }, [showStash]);

  const biome = gameState?.currentLocationData?.biome;

  return (
    <>
      <div className="flex flex-col h-full bg-gray-800/80 rounded-lg backdrop-blur-md border border-gray-700/60">
        <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex-1">
                 <GlobalSearch
                    gameState={gameState}
                    visitedLocations={visitedLocations}
                    onOpenDetailModal={onOpenDetailModal}
                />
            </div>
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
        
        <div className="flex flex-wrap border-b border-gray-700/60 p-1 gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            const isStash = tab.name === 'Stash';
            if (isStash && !showStash) {
                return null;
            }
            const isCrafting = tab.name === 'Crafting';
            
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`relative flex-shrink-0 py-2.5 px-3 mx-0.5 text-sm font-medium transition-all duration-200 ease-in-out flex items-center justify-center gap-2 rounded-md ${
                  isActive 
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-inner shadow-cyan-500/10' 
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                } ${isStash ? 'text-red-400 hover:bg-red-500/20' : ''}`}
              >
                <Icon className="w-5 h-5" />
                {t(tab.name)}
                {isStash && showStash && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{temporaryStash.length}</span>
                    </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'Character' && gameState && <CharacterSheet character={gameState.playerCharacter} gameSettings={gameSettings} onOpenModal={onOpenDetailModal} onOpenInventory={onOpenInventory} onSpendAttributePoint={onSpendAttributePoint} forgetHealedWound={forgetHealedWound} forgetActiveWound={forgetActiveWound} clearAllHealedWounds={clearAllHealedWounds} onDeleteCustomState={deleteCustomState} />}
          {activeTab === 'Quests' && gameState && <QuestLog activeQuests={gameState.activeQuests} completedQuests={gameState.completedQuests} onOpenModal={onOpenDetailModal} lastUpdatedQuestId={lastUpdatedQuestId} allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false} forgetQuest={forgetQuest} />}
          {activeTab === 'World' && <WorldPanel worldState={worldState} worldStateFlags={gameState?.worldStateFlags || null} worldEventsLog={gameState?.worldEventsLog || null} turnNumber={turnNumber} allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false} onDeleteFlag={deleteWorldStateFlag} onEditWorldState={editWorldState} onEditWeather={editWeather} onEditFlagData={editWorldStateFlagData} biome={biome} allNpcs={gameState?.encounteredNPCs || []} allFactions={gameState?.encounteredFactions || []} allLocations={visitedLocations} onOpenDetailModal={onOpenDetailModal} onDeleteEvent={deleteWorldEvent} deleteWorldEventsByTurnRange={deleteWorldEventsByTurnRange} onShowMessageModal={onShowMessageModal} />}
          {activeTab === 'Factions' && gameState && <FactionLog factions={gameState.encounteredFactions} onOpenModal={onOpenDetailModal} allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false} forgetFaction={forgetFaction} imageCache={gameState.imageCache} onImageGenerated={onImageGenerated} />}
          {activeTab === 'NPCs' && gameState && <NpcLog gameState={gameState} npcs={gameState.encounteredNPCs} encounteredFactions={gameState.encounteredFactions} onOpenModal={onOpenDetailModal} onOpenJournalModal={onOpenJournalModal} imageCache={gameState?.imageCache ?? {}} onImageGenerated={onImageGenerated} updateNpcSortOrder={updateNpcSortOrder} forgetNpc={forgetNpc} allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false} />}
          {activeTab === 'Locations' && gameState && <LocationLog locations={visitedLocations} currentLocation={gameState.currentLocationData} onOpenModal={onOpenDetailModal} allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false} onEditLocationData={editLocationData} imageCache={gameState.imageCache} onImageGenerated={onImageGenerated} forgetLocation={forgetLocation} />}
          {activeTab === 'Map' && gameState && <LocationViewer visitedLocations={visitedLocations} currentLocation={gameState.currentLocationData} onOpenModal={onOpenDetailModal} imageCache={gameState.imageCache} onImageGenerated={onImageGenerated} onExpand={onExpandMap} />}
          {activeTab === 'Combat' && gameState && <CombatTracker 
            enemies={gameState.enemiesData} 
            allies={gameState.alliesData} 
            combatLog={combatLog}
            allNpcs={gameState.encounteredNPCs}
            playerCharacter={gameState.playerCharacter}
            setAutoCombatSkill={setAutoCombatSkill}
            onOpenDetailModal={onOpenDetailModal}
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            imageCache={imageCache}
            onImageGenerated={onImageGenerated}
            onOpenImageModal={onOpenImageModal}
            gameSettings={gameSettings}
          />}
          {activeTab === 'Stash' && showStash && gameState && <StashView stash={temporaryStash} onTake={moveFromStashToInventory} onDrop={dropItemFromStash} playerCharacter={gameState.playerCharacter} imageCache={imageCache} onImageGenerated={onImageGenerated} />}
          {activeTab === 'Crafting' && gameState && <CraftingScreen playerCharacter={gameState.playerCharacter} craftItem={craftItem} />}
          {activeTab === 'Guide' && <HelpGuide />}
          
          {['Character', 'Quests', 'NPCs', 'Factions', 'Combat', 'Map', 'Locations', 'Crafting', 'World'].includes(activeTab) && !gameState && (
            <div className="text-center text-gray-500 p-6 flex flex-col items-center justify-center h-full">
              <p className="font-semibold">{t("Game Not Started")}</p>
              <p className="text-sm mt-1">{t("Character data will appear here after the first turn.")}</p>
            </div>
          )}

          {activeTab === 'Log' && <GameLogView gameLog={gameLog} onDeleteLogs={onDeleteLogs} />}
          {activeTab === 'Debug' && <JsonDebugView jsonString={lastJsonResponse} requestJsonString={lastRequestJsonForDebug} plotOutline={gameState?.plotOutline || null} currentStep={currentStep} currentModel={currentModel} turnTime={turnTime} />}
          {activeTab === 'Game' && 
            <GameMenuView 
              onSave={onSaveGame} 
              onLoad={onLoadGame} 
              onLoadAutosave={onLoadAutosave} 
              autosaveTimestamp={autosaveTimestamp} 
              isGameActive={!!gameState}
              gameSettings={gameSettings}
              updateGameSettings={updateGameSettings}
              superInstructions={superInstructions}
              updateSuperInstructions={updateSuperInstructions}
              isLoading={isLoading}
              onSaveToSlot={saveGameToSlot}
              onLoadFromSlot={loadGameFromSlot}
              onDeleteSlot={deleteGameSlot}
              dbSaveSlots={dbSaveSlots}
              refreshDbSaveSlots={refreshDbSaveSlots}
              clearNpcJournalsNow={clearNpcJournalsNow}
            />
          }
        </div>
      </div>
    </>
  );
}