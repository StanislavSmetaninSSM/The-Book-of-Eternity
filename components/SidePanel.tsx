
import React, { useState } from 'react';
import CharacterSheet from './CharacterSheet';
import QuestLog from './QuestLog';
import { GameState, Location, WorldState, GameSettings, PlayerCharacter, Faction, PlotOutline, Item, DBSaveSlotInfo, WorldStateFlag, Wound, CustomState } from '../types';
import { UserCircleIcon, BookOpenIcon, CodeBracketIcon, DocumentTextIcon, UsersIcon, ShieldExclamationIcon, Cog6ToothIcon, MapIcon, MapPinIcon, QuestionMarkCircleIcon, UserGroupIcon, GlobeAltIcon, ArchiveBoxXMarkIcon, BeakerIcon } from '@heroicons/react/24/outline';
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

interface SidePanelProps {
  gameState: GameState | null;
  worldState: WorldState | null;
  worldStateFlags: Record<string, WorldStateFlag> | null;
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
  onOpenImageModal: (prompt: string) => void;
  onSpendAttributePoint: (characteristic: string) => void;
  onToggleSidebar: () => void;
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
  editLocationData: (locationId: string, field: keyof Location, value: any) => void;
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
  updateNpcSortOrder: (newOrder: string[]) => void;
}

type Tab = 'Character' | 'Quests' | 'Factions' | 'NPCs' | 'Locations' | 'Map' | 'Combat' | 'Log' | 'Guide' | 'Debug' | 'Game' | 'Stash' | 'Crafting' | 'World';

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

const FactionLog: React.FC<{ factions: Faction[]; onOpenModal: (title: string, data: any) => void }> = ({ factions, onOpenModal }) => {
  const { t } = useLocalization();
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text">{t('Factions')}</h3>
      {factions && factions.length > 0 ? (
        <div className="space-y-3">
          {factions.map((faction) => (
             <button 
                key={faction.factionId || faction.name}
                onClick={() => onOpenModal(t("Faction: {name}", { name: faction.name }), { ...faction, type: 'faction' })}
                className="w-full text-left bg-gray-900/40 p-3 rounded-lg border border-gray-700/50 shadow-md transition-all hover:ring-1 hover:ring-cyan-500/50 hover:border-cyan-500/50 flex items-center gap-4"
              >
                <UserGroupIcon className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-gray-200">{faction.name}</p>
                    <p className="text-sm text-gray-400">{t('Reputation')}: {faction.reputation} ({t(faction.reputationDescription)})</p>
                    {faction.isPlayerMember && <p className="text-xs text-yellow-300/70 mt-1">{t('Rank')}: {faction.playerRank}</p>}
                </div>
              </button>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 p-6 bg-gray-900/20 rounded-lg">
          <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
          {t('No factions encountered yet.')}
        </div>
      )}
    </div>
  );
};


export default function SidePanel({ 
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
    onOpenImageModal,
    onSpendAttributePoint, 
    onToggleSidebar,
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
    editLocationData,
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
    updateNpcSortOrder,
}: SidePanelProps): React.ReactNode {
  const [activeTab, setActiveTab] = useState<Tab>('Character');
  const { language, t } = useLocalization();

  const handleLanguageToggle = () => {
    const newLang = language === 'ru' ? 'en' : 'ru';
    updateGameSettings({ language: newLang });
  };

  const temporaryStash = gameState?.temporaryStash || [];
  const showStash = temporaryStash.length > 0;
  
  // If the stash appears, switch to it automatically
  React.useEffect(() => {
    if (showStash) {
        setActiveTab('Stash');
    }
  }, [showStash]);

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
          {activeTab === 'Character' && gameState && <CharacterSheet character={gameState.playerCharacter} gameSettings={gameSettings} onOpenModal={onOpenDetailModal} onOpenInventory={onOpenInventory} onSpendAttributePoint={onSpendAttributePoint} forgetHealedWound={forgetHealedWound} clearAllHealedWounds={clearAllHealedWounds} onDeleteCustomState={deleteCustomState} />}
          {activeTab === 'Quests' && gameState && <QuestLog activeQuests={gameState.activeQuests} completedQuests={gameState.completedQuests} onOpenModal={onOpenDetailModal} lastUpdatedQuestId={lastUpdatedQuestId} />}
          {activeTab === 'World' && <WorldPanel worldState={worldState} worldStateFlags={worldStateFlags} turnNumber={turnNumber} />}
          {activeTab === 'Factions' && gameState && <FactionLog factions={gameState.encounteredFactions} onOpenModal={onOpenDetailModal} />}
          {activeTab === 'NPCs' && gameState && <NpcLog gameState={gameState} npcs={gameState.encounteredNPCs} encounteredFactions={gameState.encounteredFactions} onOpenModal={onOpenDetailModal} imageCache={gameState?.imageCache ?? {}} onImageGenerated={onImageGenerated} updateNpcSortOrder={updateNpcSortOrder} />}
          {activeTab === 'Locations' && gameState && <LocationLog locations={visitedLocations} currentLocation={gameState.currentLocationData} onOpenModal={onOpenDetailModal} allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false} onEditLocationData={editLocationData} />}
          {activeTab === 'Map' && gameState && <LocationViewer visitedLocations={visitedLocations} currentLocation={gameState.currentLocationData} onOpenModal={onOpenDetailModal} />}
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
            />
          }
        </div>
      </div>
    </>
  );
}
