
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import SidePanel from './components/SidePanel';
import InventoryScreen from './components/InventoryScreen';
import { useGameLogic } from './hooks/useGameLogic';
import { GameState, Item, WorldState, PlayerCharacter, ChatMessage, GameSettings } from './types';
import { PlusIcon, MinusIcon, ChevronDoubleLeftIcon, PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { InformationCircleIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import ImageRenderer from './components/ImageRenderer';
import Modal from './components/Modal';
import MarkdownRenderer from './components/MarkdownRenderer';
import DetailRenderer from './components/DetailRenderer/index';
import { saveConfigurationToFile, loadConfigurationFromFile } from './utils/fileManager';
import ConfirmationModal from './components/ConfirmationModal';
import { useLocalization } from './context/LocalizationContext';
import { gameData } from './utils/localizationGameData';
import AboutContent from './components/AboutContent';
import MusicPlayer from './components/MusicPlayer';

const CHARACTERISTICS_LIST = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'faith', 'attractiveness', 'trade', 'persuasion', 'perception', 'luck', 'speed'];

export default function App(): React.ReactNode {
  const { language, setLanguage, t } = useLocalization();

  const { 
    gameState, 
    gameHistory, 
    isLoading, 
    error, 
    startGame, 
    sendMessage, 
    askQuestion, 
    cancelRequest, 
    lastJsonResponse,
    lastRequestJson, 
    gameLog, 
    combatLog,
    equipItem, 
    unequipItem, 
    dropItem, 
    moveItem,
    splitItemStack,
    mergeItemStacks,
    disassembleItem,
    craftItem,
    moveFromStashToInventory,
    dropItemFromStash,
    deleteMessage,
    clearHalfHistory,
    deleteLogs,
    forgetNpc,
    clearNpcJournal,
    deleteOldestNpcJournalEntries,
    forgetLocation,
    forgetQuest,
    spendAttributePoint,
    setAutoCombatSkill,
    sceneImagePrompt,
    saveGame,
    loadGame,
    loadAutosave,
    autosaveTimestamp,
    suggestedActions,
    visitedLocations,
    worldState,
    gameSettings,
    updateGameSettings,
    superInstructions,
    updateSuperInstructions,
    turnNumber,
    editChatMessage,
    editNpcData,
    editQuestData,
    editItemData,
    editLocationData,
    editPlayerData,
    saveGameToSlot,
    loadGameFromSlot,
    deleteGameSlot,
    dbSaveSlots,
    refreshDbSaveSlots,
    musicVideoIds,
    isMusicLoading,
    isMusicPlayerVisible,
    handlePrimaryMusicClick,
    fetchMusicSuggestion,
    clearMusic,
  } = useGameLogic({ language, setLanguage });
  const [hasStarted, setHasStarted] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState<string | null>(null);
  const [imageModalPrompt, setImageModalPrompt] = useState<string | null>(null);
  const [detailModalData, setDetailModalData] = useState<{ title: string; data: any } | null>(null);
  const [editModalData, setEditModalData] = useState<{ index: number, message: ChatMessage } | null>(null);
  const [editContent, setEditContent] = useState('');

  // Resizable sidebar state and logic
  const [sidebarWidth, setSidebarWidth] = useState(384); // Default width (e.g., lg:w-96)
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // This effect ensures that the data shown in the detail modal is always fresh.
    // When gameState is updated (e.g., by deleting journal entries), this finds the
    // corresponding object in the new state and updates the modal's data,
    // triggering a re-render with the correct information.
    if (detailModalData && gameState) {
        const { data } = detailModalData;
        let updatedData = null;

        // Identify the type of data and find its updated version in the new gameState.
        if (data.NPCId && Array.isArray(gameState.encounteredNPCs)) {
            updatedData = gameState.encounteredNPCs.find(npc => npc.NPCId === data.NPCId);
        } else if (data.existedId && Array.isArray(gameState.playerCharacter.inventory)) {
            updatedData = gameState.playerCharacter.inventory.find(item => item.existedId === data.existedId);
        } else if (data.questId && Array.isArray(gameState.activeQuests)) {
            updatedData = gameState.activeQuests.find(q => q.questId === data.questId) || gameState.completedQuests.find(q => q.questId === data.questId);
        }

        if (updatedData && JSON.stringify(updatedData) !== JSON.stringify(data)) {
            setDetailModalData(prev => (prev ? { ...prev, data: updatedData } : null));
        }
    }
  }, [gameState, detailModalData]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      // Calculate new width based on mouse position from the right edge of the screen
      const newWidth = window.innerWidth - mouseMoveEvent.clientX;
      
      // Define constraints for the sidebar width
      const minWidth = 320; // e.g., md:w-80
      const maxWidth = 800; // A reasonable maximum width
      
      if (newWidth > minWidth && newWidth < maxWidth) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    // Attach and clean up event listeners for resizing
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);


  const handleStartGame = (creationData: any) => {
    startGame(creationData);
    setHasStarted(true);
  };

  const handleSaveGame = async () => {
    await saveGame();
    // In a real app, you might show a "Game Saved!" notification here.
  };

  const handleLoadGame = async () => {
    const success = await loadGame();
    if (success) {
      setHasStarted(true);
    } else {
      alert(t("Failed to load game file. It might be corrupted or in an invalid format."));
    }
  };

  const handleLoadAutosave = async () => {
    const success = await loadAutosave();
    if (success) {
      setHasStarted(true);
    } else {
      alert(t("Failed to load autosave data. It may be corrupted."));
    }
  };

  const handleLoadGameFromSlot = async (slotId: number) => {
    const success = await loadGameFromSlot(slotId);
    if (success) {
        setHasStarted(true);
    } else {
        alert(t("Failed to load game from slot. It might be corrupted."));
    }
  };

  const handleShowMessageModal = (content: string) => {
    setMessageModalContent(content);
  };

  const handleShowImageModal = (prompt: string | null) => {
    if (prompt) {
      setImageModalPrompt(prompt);
    }
  };

  const handleOpenDetailModal = (title: string, data: any) => {
    setDetailModalData({ title, data });
  };
  
  const handleShowEditModal = (index: number, message: ChatMessage) => {
    setEditModalData({ index, message });
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editModalData) {
      editChatMessage(editModalData.index, editContent);
      setEditModalData(null);
    }
  };


  const handleCloseDetailModal = () => {
    setDetailModalData(null);
  };

  const lastPlayerMessage = useMemo(() => 
    gameHistory.slice().reverse().find(m => m.sender === 'player'),
  [gameHistory]);

  const handleResend = useCallback(() => {
    if (lastPlayerMessage && !isLoading) {
      const isLastMessageAQuestion = lastPlayerMessage.content.startsWith('[Question]');
      
      if (isLastMessageAQuestion) {
        const originalQuestion = lastPlayerMessage.content.substring('[Question] '.length);
        askQuestion(originalQuestion);
      } else {
        sendMessage(lastPlayerMessage.content);
      }
    }
  }, [lastPlayerMessage, isLoading, sendMessage, askQuestion]);


  if (!hasStarted) {
    return <StartScreen
      onStart={handleStartGame}
      onLoadGame={handleLoadGame}
      onLoadAutosave={handleLoadAutosave}
      autosaveTimestamp={autosaveTimestamp}
      onLoadFromSlot={handleLoadGameFromSlot}
      dbSaveSlots={dbSaveSlots}
    />;
  }
  
  return (
    <>
      <div className="bg-gray-900/50 text-gray-200 min-h-screen flex flex-col md:flex-row font-sans backdrop-blur-sm">
        <div className="relative flex-1 h-screen min-w-0">
          {sceneImagePrompt && (
            <div className="absolute inset-0 z-0 cursor-pointer" onClick={() => handleShowImageModal(sceneImagePrompt)}>
                <ImageRenderer 
                  prompt={sceneImagePrompt} 
                  alt={t("Current game scene")} 
                  className="object-cover w-full h-full opacity-30" 
                  width={1024} 
                  height={1024} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
            </div>
          )}
          <main className="relative z-10 flex-1 flex flex-col h-screen p-4 md:p-6 lg:p-8 pointer-events-none">
            <div className="flex-1 overflow-y-auto mb-4 pr-2 pointer-events-auto">
               <ChatWindow 
                 history={gameHistory} 
                 error={error} 
                 onDeleteMessage={deleteMessage} 
                 onShowMessageModal={handleShowMessageModal} 
                 onResend={lastPlayerMessage ? handleResend : undefined}
                 onShowEditModal={handleShowEditModal}
                 allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false}
                />
            </div>
            <InputBar
              onSendMessage={sendMessage}
              onAskQuestion={askQuestion}
              onCancelRequest={cancelRequest}
              onClearHalfHistory={clearHalfHistory}
              isLoading={isLoading}
              history={gameHistory}
              suggestedActions={suggestedActions}
              playerCharacter={gameState?.playerCharacter}
              gameSettings={gameSettings}
              onGetMusicSuggestion={handlePrimaryMusicClick}
              isMusicLoading={isMusicLoading}
              isMusicPlayerVisible={isMusicPlayerVisible}
            />
          </main>
        </div>
        
        {/* Resizer Handle */}
        {!isSidebarCollapsed && (
          <div
            onMouseDown={startResizing}
            className="hidden md:block w-1.5 cursor-col-resize bg-gray-700/40 hover:bg-cyan-500/60 transition-colors duration-200 flex-shrink-0"
          />
        )}
        
        <aside 
          style={{ width: isSidebarCollapsed ? '0px' : `${sidebarWidth}px` }}
          className={`w-full md:w-auto bg-gray-900/30 border-l border-gray-700/50 h-screen flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isSidebarCollapsed ? 'p-0 border-none' : 'p-4 md:p-6'}`}
        >
          {!isSidebarCollapsed && (
            <SidePanel 
              gameState={gameState} 
              worldState={worldState}
              worldStateFlags={gameState?.worldStateFlags}
              onOpenInventory={() => setIsInventoryOpen(true)} 
              lastJsonResponse={lastJsonResponse}
              lastRequestJsonForDebug={lastRequestJson} 
              gameLog={gameLog} 
              combatLog={combatLog}
              onDeleteLogs={deleteLogs} 
              onSaveGame={handleSaveGame}
              onLoadGame={handleLoadGame}
              onLoadAutosave={handleLoadAutosave}
              autosaveTimestamp={autosaveTimestamp}
              visitedLocations={visitedLocations}
              onOpenDetailModal={handleOpenDetailModal}
              onSpendAttributePoint={spendAttributePoint}
              onToggleSidebar={toggleSidebar}
              gameSettings={gameSettings}
              updateGameSettings={updateGameSettings}
              superInstructions={superInstructions}
              updateSuperInstructions={updateSuperInstructions}
              isLoading={isLoading}
              setAutoCombatSkill={setAutoCombatSkill}
              lastUpdatedQuestId={gameState?.lastUpdatedQuestId}
              onSendMessage={sendMessage}
              craftItem={craftItem}
              moveFromStashToInventory={moveFromStashToInventory}
              dropItemFromStash={dropItemFromStash}
              turnNumber={turnNumber}
              editLocationData={editLocationData}
              saveGameToSlot={saveGameToSlot}
              loadGameFromSlot={handleLoadGameFromSlot}
              deleteGameSlot={deleteGameSlot}
              dbSaveSlots={dbSaveSlots}
              refreshDbSaveSlots={refreshDbSaveSlots}
            />
          )}
        </aside>
      </div>
       {isSidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className="fixed top-1/2 -translate-y-1/2 right-0 z-30 p-2 bg-gray-800/80 hover:bg-cyan-600/80 rounded-l-md transition-colors shadow-lg"
          title={t("Expand Sidebar")}
        >
          <ChevronDoubleLeftIcon className="h-6 w-6 text-white" />
        </button>
      )}
      {isInventoryOpen && gameState && (
        <InventoryScreen
          gameState={gameState}
          onClose={() => setIsInventoryOpen(false)}
          onEquip={equipItem}
          onUnequip={unequipItem}
          onDropItem={dropItem}
          onMoveItem={moveItem}
          onSplitItem={splitItemStack}
          onMergeItems={mergeItemStacks}
          onOpenDetailModal={handleOpenDetailModal}
          onOpenImageModal={handleShowImageModal}
        />
      )}
       {messageModalContent && (
        <Modal isOpen={true} onClose={() => setMessageModalContent(null)} title={t("Message Details")} showFontSizeControls={true}>
            <MarkdownRenderer content={messageModalContent} />
        </Modal>
      )}

      {imageModalPrompt && (
        <Modal isOpen={true} onClose={() => setImageModalPrompt(null)} title={t("Scene Image")}>
            <ImageRenderer 
              prompt={imageModalPrompt} 
              className="w-full h-auto rounded-md" 
              alt={t("Enlarged game scene")}
              showRegenerateButton={true}
              width={1024}
              height={1024}
            />
        </Modal>
      )}
       <Modal isOpen={!!detailModalData} onClose={handleCloseDetailModal} title={detailModalData?.title || t('Details')}>
        {detailModalData && <DetailRenderer 
            data={detailModalData.data} 
            onForgetNpc={forgetNpc} 
            onForgetLocation={forgetLocation} 
            onClearNpcJournal={clearNpcJournal}
            onDeleteOldestNpcJournalEntries={deleteOldestNpcJournalEntries}
            onForgetQuest={forgetQuest}
            onCloseModal={handleCloseDetailModal} 
            onOpenImageModal={handleShowImageModal}
            playerCharacter={gameState?.playerCharacter}
            setAutoCombatSkill={setAutoCombatSkill}
            onOpenDetailModal={handleOpenDetailModal}
            disassembleItem={disassembleItem}
            currentLocationId={gameState?.currentLocationData?.locationId}
            allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false}
            onEditNpcData={editNpcData}
            onEditQuestData={editQuestData}
            onEditItemData={editItemData}
            onEditLocationData={editLocationData}
            onEditPlayerData={editPlayerData}
            encounteredFactions={gameState?.encounteredFactions}
            gameSettings={gameSettings}
            />}
      </Modal>

      {editModalData && (
        <Modal isOpen={true} onClose={() => setEditModalData(null)} title={t("Edit Message")}>
          <div className="space-y-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[200px]"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditModalData(null)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition flex items-center gap-2">
                <XMarkIcon className="w-5 h-5" />
                {t('Cancel')}
              </button>
              <button onClick={handleSaveEdit} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition flex items-center gap-2">
                <CheckIcon className="w-5 h-5" />
                {t('Save')}
              </button>
            </div>
          </div>
        </Modal>
      )}
       {isMusicPlayerVisible && musicVideoIds && musicVideoIds.length > 0 && (
        <MusicPlayer 
          videoIds={musicVideoIds} 
          onClear={clearMusic}
          onRegenerate={fetchMusicSuggestion}
        />
      )}
    </>
  );
}

interface StartScreenProps {
  onStart: (creationData: any) => void;
  onLoadGame: () => Promise<void>;
  onLoadAutosave: () => Promise<void>;
  autosaveTimestamp: string | null;
  onLoadFromSlot: (slotId: number) => Promise<void>;
  dbSaveSlots: any[];
}

const initialFormData = {
  universe: 'fantasy',
  playerName: '',
  characterDescription: '',
  initialPrompt: '',
  worldInformation: '',
  superInstructions: '',
  race: 'Human',
  charClass: 'Warrior',
  age: 25,
  isCustomRace: false,
  customRaceName: '',
  customRaceDescription: '',
  customAttributes: CHARACTERISTICS_LIST.reduce((acc, char) => ({ ...acc, [char]: 1 }), {}),
  attributePoints: 5,
  isCustomClass: false,
  customClassName: '',
  customClassDescription: '',
  customClassAttributes: CHARACTERISTICS_LIST.reduce((acc, char) => ({ ...acc, [char]: 0 }), {}),
  customClassAttributePoints: 3,
  startTime: '08:00',
  weather: 'Random',
  aiProvider: 'gemini',
  modelName: 'gemini-2.5-pro',
  correctionModelName: '',
  isCustomModel: false,
  customModelName: '',
  openRouterModelName: 'google/gemini-flash-1.5',
  geminiThinkingBudget: 60,
  nonMagicMode: false,
  useMultiStepRequests: true,
  adultMode: false,
  geminiApiKey: '',
  openRouterApiKey: '',
  allowHistoryManipulation: false,
  currencyName: 'Gold',
  customCurrencyValue: '',
  hardMode: false,
};

const formatTimestamp = (timestamp: string | null): string => {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return '';
    }
};

interface WorldData {
  name: string;
  description: string;
  currencyName: string;
  currencyOptions?: string[];
  races: Record<string, { description: string; bonuses: Record<string, number> }>;
  classes: Record<string, { description: string; bonuses: Record<string, number> }>;
}

function StartScreen({ onStart, onLoadGame, onLoadAutosave, autosaveTimestamp, onLoadFromSlot, dbSaveSlots }: StartScreenProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [isAdultConfirmOpen, setIsAdultConfirmOpen] = useState(false);
  const [isNonMagicConfirmOpen, setIsNonMagicConfirmOpen] = useState(false);
  const [advancedBudget, setAdvancedBudget] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const { language, setLanguage, t } = useLocalization();

  const { universe, race, charClass, isCustomRace, customAttributes, attributePoints, isCustomModel, aiProvider, isCustomClass, customClassAttributes, customClassAttributePoints } = formData;
  
  const weatherOptions = [
    'Random', 
    'Blizzard', 
    'Clear', 
    'Cloudy', 
    'Downpour', 
    'Drizzle', 
    'Foggy', 
    'Frigid Air', 
    'Heavy Rain', 
    'Heavy Snow', 
    'Humid', 
    'Light Rain', 
    'Light Snow', 
    'Misty', 
    'Overcast', 
    'Rain', 
    'Sandstorm', 
    'Scorching Sun', 
    'Snow', 
    'Storm', 
    'Windy'
  ];

  const handleLanguageToggle = () => {
    const newLang = language === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
  };

  const handleSaveConfiguration = () => {
    saveConfigurationToFile(formData, t);
  };

  const handleLoadConfiguration = async () => {
    const loadedData = await loadConfigurationFromFile(t);
    if (loadedData) {
      // Merge with initial data to ensure all keys are present for forward compatibility
      const newFormData = { ...initialFormData, ...loadedData };
      setFormData(newFormData);
    }
  };
  
  const handleBudgetToggle = () => {
    setAdvancedBudget(prev => {
        const isSwitchingToAdvanced = !prev;
        if (isSwitchingToAdvanced) {
            // If current value is in the simple range, set to advanced default
            if (formData.geminiThinkingBudget <= 200) {
                setFormData(f => ({ ...f, geminiThinkingBudget: 512 }));
            }
        } else { // Switching back to simple
            if (formData.geminiThinkingBudget > 200) {
                setFormData(f => ({ ...f, geminiThinkingBudget: 200 }));
            }
        }
        return !prev;
    });
  };

  const currentWorld = gameData[universe as keyof typeof gameData] as WorldData;
  const raceOptions = useMemo(() => Object.keys(currentWorld.races), [universe]);
  const classOptions = useMemo(() => Object.keys(currentWorld.classes), [universe]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const finalValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => {
      const newState: typeof initialFormData = { ...prev, [name]: finalValue as any };

      if (name === 'universe') {
          const newWorld = gameData[value as keyof typeof gameData] as WorldData;
          newState.race = Object.keys(newWorld.races)[0];
          newState.charClass = Object.keys(newWorld.classes)[0];
          newState.isCustomRace = false;
          newState.isCustomClass = false;
          newState.customClassAttributes = CHARACTERISTICS_LIST.reduce((acc, char) => ({ ...acc, [char]: 0 }), {}),
          newState.customClassAttributePoints = 3;
          if (newWorld.currencyOptions && newWorld.currencyOptions.length > 0) {
              newState.currencyName = newWorld.currencyOptions[0];
          } else {
              newState.currencyName = newWorld.currencyName || 'Gold';
          }
          newState.customCurrencyValue = '';
      }

      if (name === 'race' && value === 'CUSTOM') {
          newState.isCustomRace = true;
      } else if (name === 'race') {
          newState.isCustomRace = false;
      }
      
      if (name === 'charClass' && value === 'CUSTOM') {
          newState.isCustomClass = true;
      } else if (name === 'charClass') {
          newState.isCustomClass = false;
          newState.customClassAttributes = CHARACTERISTICS_LIST.reduce((acc, char) => ({ ...acc, [char]: 0 }), {});
          newState.customClassAttributePoints = 3;
      }

      if (name === 'customModelName' && newState.isCustomModel) {
        newState.modelName = value;
      }

      if (name === 'openRouterModelName' && newState.aiProvider === 'openrouter') {
        newState.modelName = value;
      }

      return newState;
    });
  };

  const handleProviderChange = (provider: 'gemini' | 'openrouter') => {
    setFormData(prev => ({
        ...prev,
        aiProvider: provider,
        modelName: provider === 'gemini' ? 'gemini-2.5-pro' : prev.openRouterModelName,
        isCustomModel: provider === 'gemini' ? prev.isCustomModel : false,
    }));
  };

  const handleModelChange = (modelValue: string) => {
    setFormData(prev => {
        if (modelValue === 'CUSTOM') {
            return {
                ...prev,
                isCustomModel: true,
                modelName: prev.customModelName
            };
        }
        return {
            ...prev,
            isCustomModel: false,
            modelName: modelValue
        };
    });
  };
  
  const handleAttributeChange = (attr: string, delta: number) => {
    setFormData(prev => {
        const currentPoints = prev.customAttributes[attr as keyof typeof prev.customAttributes];
        const remainingPoints = prev.attributePoints;

        if (delta > 0 && remainingPoints <= 0) return prev;
        if (delta < 0 && currentPoints <= 1) return prev;
        
        const newPoints = currentPoints + delta;
        const newRemaining = remainingPoints - delta;

        return {
            ...prev,
            attributePoints: newRemaining,
            customAttributes: {
                ...prev.customAttributes,
                [attr]: newPoints
            }
        };
    });
  };

  const handleCustomClassAttributeChange = (attr: string, delta: number) => {
    setFormData(prev => {
        const currentPoints = prev.customClassAttributes[attr as keyof typeof prev.customClassAttributes];
        const remainingPoints = prev.customClassAttributePoints;

        if (delta > 0 && remainingPoints <= 0) return prev;
        if (delta < 0 && currentPoints <= 0) return prev;
        
        const newPoints = currentPoints + delta;
        const newRemaining = remainingPoints - delta;

        return {
            ...prev,
            customClassAttributePoints: newRemaining,
            customClassAttributes: {
                ...prev.customClassAttributes,
                [attr]: newPoints
            }
        };
    });
  };

  const handleAdultModeClick = () => {
    if (formData.adultMode) {
      setFormData(prev => ({ ...prev, adultMode: false }));
    } else {
      setIsAdultConfirmOpen(true);
    }
  };

  const confirmAdultMode = () => {
    setFormData(prev => ({ ...prev, adultMode: true }));
    setIsAdultConfirmOpen(false);
  };

  const handleNonMagicModeClick = () => {
    if (formData.nonMagicMode) {
      setFormData(prev => ({ ...prev, nonMagicMode: false }));
    } else {
      setIsNonMagicConfirmOpen(true);
    }
  };

  const confirmNonMagicMode = () => {
    setFormData(prev => ({ ...prev, nonMagicMode: true }));
    setIsNonMagicConfirmOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.playerName && formData.characterDescription && formData.initialPrompt) {
        const finalData = { ...formData };
        
        if (isCustomRace && (!formData.customRaceName || attributePoints > 0)) {
            alert(t("Please enter a custom race name and allocate all attribute points."));
            return;
        }
        if (isCustomClass && (!formData.customClassName.trim() || customClassAttributePoints > 0)) {
            alert(t("Please enter a custom class name and allocate all 3 bonus points."));
            return;
        }

        if (finalData.currencyName === 'CUSTOM') {
          if (!finalData.customCurrencyValue.trim()) {
              alert(t("Enter currency name..."));
              return;
          }
          finalData.currencyName = finalData.customCurrencyValue.trim();
        }
        delete (finalData as any).customCurrencyValue;

        if (finalData.aiProvider === 'gemini') {
            if (finalData.isCustomModel && !finalData.customModelName.trim()) {
                alert(t("Please enter a custom model name."));
                return;
            }
            if (finalData.isCustomModel) {
                finalData.modelName = finalData.customModelName;
            }
        } else if (finalData.aiProvider === 'openrouter') {
            if (!finalData.openRouterModelName.trim()) {
                alert(t("Please enter an OpenRouter model name."));
                return;
            }
            finalData.modelName = finalData.openRouterModelName;
        }
        onStart(finalData);
    }
  };
  
  const selectedRaceInfo = !isCustomRace && (currentWorld.races as Record<string, { description: string; bonuses: Record<string, number> }>)[race];
  const selectedClassInfo = !isCustomClass && (currentWorld.classes as Record<string, { description: string; bonuses: Record<string, number> }>)[charClass];

  return (
    <div className="min-h-screen bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-gray-800/80 p-8 rounded-lg shadow-2xl border border-cyan-500/20 ring-1 ring-cyan-500/20">
        <div className="absolute top-4 right-4">
            <button
                onClick={handleLanguageToggle}
                className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-1.5"
                title={t("Switch Language")}
                aria-label={t("Switch Language")}
            >
                <GlobeAltIcon className="w-5 h-5" />
                <span className="font-bold text-xs">{language.toUpperCase()}</span>
            </button>
        </div>
        <h1 className="text-5xl font-bold text-cyan-400 mb-2 text-center narrative-text drop-shadow-[0_2px_2px_rgba(0,255,255,0.2)]">{t("The Book of Eternity")}</h1>
        <p className="text-gray-400 mb-8 text-center text-lg narrative-text italic">{t("Chronicle of the Unwritten")}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t("Choose Your Universe")}</label>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(gameData).map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'universe', value: key } } as any)}
                  className={`p-3 rounded-md transition-all border flex items-center justify-center whitespace-normal min-h-[4rem] ${formData.universe === key ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                >
                  {t(gameData[key as keyof typeof gameData].name)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">{t(currentWorld.description)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">{t("Character Name")}</label>
              <input id="playerName" name="playerName" type="text" onChange={handleInputChange} value={formData.playerName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" required />
            </div>
             <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">{t("Age")}</label>
              <input id="age" name="age" type="number" onChange={handleInputChange} value={formData.age} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" required min="1" />
            </div>
          </div>
          
           <div>
              <label htmlFor="currencyName" className="block text-sm font-medium text-gray-300 mb-2">{t("Currency Name")}</label>
              <div className="flex gap-2">
                <select 
                  id="currencyName" 
                  name="currencyName" 
                  onChange={handleInputChange} 
                  value={formData.currencyName}
                  className="bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition flex-grow"
                >
                  {currentWorld.currencyOptions && currentWorld.currencyOptions.length > 0 ? (
                    currentWorld.currencyOptions.map(currency => (
                      <option key={currency} value={currency}>{t(currency)}</option>
                    ))
                  ) : (
                    <option value={currentWorld.currencyName || 'Gold'}>{t(currentWorld.currencyName || 'Gold')}</option>
                  )}
                  <option value="CUSTOM">{t("Custom...")}</option>
                </select>
                {formData.currencyName === 'CUSTOM' && (
                  <input 
                    id="customCurrencyValue" 
                    name="customCurrencyValue" 
                    type="text" 
                    onChange={handleInputChange} 
                    value={formData.customCurrencyValue}
                    className="bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition flex-grow"
                    placeholder={t("Enter currency name...")}
                    required 
                    autoFocus
                  />
                )}
              </div>
           </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="race" className="block text-sm font-medium text-gray-300 mb-2">{t("Race")}</label>
              <select id="race" name="race" onChange={handleInputChange} value={isCustomRace ? 'CUSTOM' : race} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition">
                {raceOptions.map(r => <option key={r} value={r}>{t(r)}</option>)}
                <option value="CUSTOM">{t("Custom...")}</option>
              </select>
              {selectedRaceInfo && <p className="text-xs text-cyan-300/80 mt-2">{t(selectedRaceInfo.description)}</p>}
            </div>
            <div>
              <label htmlFor="charClass" className="block text-sm font-medium text-gray-300 mb-2">{t("Class")}</label>
              <select id="charClass" name="charClass" onChange={handleInputChange} value={isCustomClass ? 'CUSTOM' : charClass} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition">
                {classOptions.map(c => <option key={c} value={c}>{t(c)}</option>)}
                <option value="CUSTOM">{t("Custom...")}</option>
              </select>
              {selectedClassInfo && <p className="text-xs text-cyan-300/80 mt-2">{t(selectedClassInfo.description)}</p>}
            </div>
          </div>
         
          {isCustomRace && (
            <div className="p-4 bg-gray-900/30 rounded-lg border border-cyan-500/20 space-y-3">
              <h3 className="text-lg font-semibold text-cyan-400">{t("Create Custom Race")}</h3>
              <div>
                <label htmlFor="customRaceName" className="block text-sm font-medium text-gray-300 mb-2">{t("Race Name")}</label>
                <input id="customRaceName" name="customRaceName" type="text" onChange={handleInputChange} value={formData.customRaceName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("e.g., Star-kin")} required />
              </div>
              <div>
                <label htmlFor="customRaceDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Custom Race Description")}</label>
                <textarea id="customRaceDescription" name="customRaceDescription" onChange={handleInputChange} value={formData.customRaceDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Describe the unique traits and history of your race...")} rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t("Distribute Attribute Points (Remaining: {points})", { points: attributePoints })}</label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {CHARACTERISTICS_LIST.map(attr => (
                        <div key={attr} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md">
                            <span className="capitalize text-sm">{t(attr)}</span>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => handleAttributeChange(attr, -1)} disabled={customAttributes[attr as keyof typeof customAttributes] <= 1} className="p-1 rounded-full bg-red-600/50 hover:bg-red-500 disabled:bg-gray-600 text-white"><MinusIcon className="w-4 h-4" /></button>
                                <span>{customAttributes[attr as keyof typeof customAttributes]}</span>
                                <button type="button" onClick={() => handleAttributeChange(attr, 1)} disabled={attributePoints <= 0} className="p-1 rounded-full bg-green-600/50 hover:bg-green-500 disabled:bg-gray-600 text-white"><PlusIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          
          {isCustomClass && (
             <div className="p-4 bg-gray-900/30 rounded-lg border border-cyan-500/20 space-y-3">
              <h3 className="text-lg font-semibold text-cyan-400">{t("Create Custom Class")}</h3>
              <div>
                <label htmlFor="customClassName" className="block text-sm font-medium text-gray-300 mb-2">{t("Custom Class Name")}</label>
                <input id="customClassName" name="customClassName" type="text" onChange={handleInputChange} value={formData.customClassName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("e.g., Chronomancer")} required />
              </div>
              <div>
                <label htmlFor="customClassDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Custom Class Description")}</label>
                <textarea id="customClassDescription" name="customClassDescription" onChange={handleInputChange} value={formData.customClassDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Describe the core tenets and abilities of your class...")} rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t("Distribute Bonus Points (Remaining: {points})", { points: customClassAttributePoints })}</label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {CHARACTERISTICS_LIST.map(attr => (
                        <div key={attr} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md">
                            <span className="capitalize text-sm">{t(attr)}</span>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => handleCustomClassAttributeChange(attr, -1)} disabled={customClassAttributes[attr as keyof typeof customClassAttributes] <= 0} className="p-1 rounded-full bg-red-600/50 hover:bg-red-500 disabled:bg-gray-600 text-white"><MinusIcon className="w-4 h-4" /></button>
                                <span>{customClassAttributes[attr as keyof typeof customClassAttributes]}</span>
                                <button type="button" onClick={() => handleCustomClassAttributeChange(attr, 1)} disabled={customClassAttributePoints <= 0} className="p-1 rounded-full bg-green-600/50 hover:bg-green-500 disabled:bg-gray-600 text-white"><PlusIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="characterDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Character Description")}</label>
            <textarea id="characterDescription" name="characterDescription" onChange={handleInputChange} value={formData.characterDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("e.g., A grizzled warrior with a scarred face...")} rows={3} required />
          </div>
          <div>
            <label htmlFor="initialPrompt" className="block text-sm font-medium text-gray-300 mb-2">{t("Your First Action")}</label>
            <textarea id="initialPrompt" name="initialPrompt" onChange={handleInputChange} value={formData.initialPrompt} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("e.g., I wake up in a dimly lit tavern...")} rows={3} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-2">{t("Starting Time")}</label>
              <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" />
            </div>
            <div>
              <label htmlFor="weather" className="block text-sm font-medium text-gray-300 mb-2">{t("Starting Weather")}</label>
              <select id="weather" name="weather" value={formData.weather} onChange={handleInputChange} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition">
                {weatherOptions.map(w => <option key={w} value={w}>{t(w)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="worldInformation" className="block text-sm font-medium text-gray-300 mb-2">{t("World Information")}</label>
            <textarea id="worldInformation" name="worldInformation" onChange={handleInputChange} value={formData.worldInformation} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Briefly describe your world's key features or history. This is optional.")} rows={3} />
          </div>
          <div>
            <label htmlFor="superInstructions" className="block text-sm font-medium text-gray-300 mb-2">{t("Your own rules")}</label>
            <textarea id="superInstructions" name="superInstructions" onChange={handleInputChange} value={formData.superInstructions} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Add any special rules or 'super-instructions' for the Game Master to follow. This is optional.")} rows={3} />
          </div>
            
            <div className="p-4 bg-gray-900/40 rounded-lg border border-cyan-500/20 space-y-4">
               <h3 className="text-lg font-semibold text-cyan-400">{t("Game Rules")}</h3>
                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                  <div>
                    <label className="font-medium text-gray-300">{t("Hard Mode")}</label>
                    <p className="text-xs text-gray-400">{t("Increases enemy health and action difficulty for a greater challenge and enhanced rewards.")}</p>
                  </div>
                   <label htmlFor="hardMode" className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="hardMode"
                      name="hardMode"
                      className="sr-only peer"
                      checked={formData.hardMode}
                      onChange={handleInputChange}
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                  <div>
                    <label className="font-medium text-gray-300">{t("Allow History Manipulation")}</label>
                    <p className="text-xs text-gray-400">{t("allowHistoryManipulationDescription")}</p>
                  </div>
                   <label htmlFor="allowHistoryManipulation" className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="allowHistoryManipulation"
                      name="allowHistoryManipulation"
                      className="sr-only peer"
                      checked={formData.allowHistoryManipulation}
                      onChange={handleInputChange}
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
               <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                  <div>
                    <label className="font-medium text-gray-300">{t("Non-Magic Mode")}</label>
                    <p className="text-xs text-gray-400">{t("Disables all magical elements for a realistic playthrough.")}</p>
                  </div>
                  <div onClick={handleNonMagicModeClick} className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="nonMagicMode"
                      name="nonMagicMode"
                      className="sr-only peer"
                      checked={formData.nonMagicMode}
                      readOnly
                      tabIndex={-1}
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </div>
                </div>
            </div>
          
            <div className="p-4 bg-gray-900/40 rounded-lg border border-cyan-500/20 space-y-4">
               <h3 className="text-lg font-semibold text-cyan-400">{t("AI Settings")}</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <label htmlFor="useMultiStepRequests" className="font-medium text-gray-300">{t("Multi-Step Request Architecture")}</label>
                        <p className="text-xs text-gray-400">{t("Use a multi-step process for higher quality responses. Disabling may be faster but can reduce coherence.")}</p>
                    </div>
                    <label htmlFor="useMultiStepRequests" className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="useMultiStepRequests"
                            name="useMultiStepRequests"
                            className="sr-only peer"
                            checked={formData.useMultiStepRequests}
                            onChange={(e) => setFormData(prev => ({...prev, useMultiStepRequests: e.target.checked}))}
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-yellow-500/20">
                    <div>
                        <label htmlFor="adultMode" className="font-medium text-yellow-300">{t("Adult Mode (21+)")}</label>
                        <p className="text-xs text-gray-400">{t("Enables less restrictive, player-driven narrative content.")}</p>
                    </div>
                    <div onClick={handleAdultModeClick} className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="adultMode"
                            name="adultMode"
                            className="sr-only peer"
                            checked={formData.adultMode}
                            readOnly
                            tabIndex={-1}
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-yellow-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </div>
                </div>
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t("AI Provider")}</label>
                  <div className="grid grid-cols-2 gap-2">
                      <button
                          type="button"
                          onClick={() => handleProviderChange('gemini')}
                          className={`p-3 rounded-md text-center transition-all border ${aiProvider === 'gemini' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                      >
                          {t('Google Gemini')}
                      </button>
                      <button
                          type="button"
                          onClick={() => handleProviderChange('openrouter')}
                          className={`p-3 rounded-md text-center transition-all border ${aiProvider === 'openrouter' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                      >
                          {t('OpenRouter')}
                      </button>
                  </div>
                </div>
                
                {aiProvider === 'gemini' && (
                  <>
                    <div>
                      <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-300 mb-2">{t("Google Gemini API Key (Optional)")}</label>
                      <input id="geminiApiKey" name="geminiApiKey" type="password" onChange={handleInputChange} value={formData.geminiApiKey} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Leave blank to use pre-configured key")} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 mt-4">{t("AI Model")}</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          key="flash"
                          type="button"
                          onClick={() => handleModelChange('gemini-2.5-flash')}
                          className={`p-3 rounded-md text-center transition-all border ${!isCustomModel && formData.modelName === 'gemini-2.5-flash' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                        >
                          <span className="font-semibold">{t("Flash")}</span>
                          <span className="block text-xs text-gray-400">{t("High Quality")}</span>
                        </button>
                         <button
                          key="pro"
                          type="button"
                          onClick={() => handleModelChange('gemini-2.5-pro')}
                          className={`p-3 rounded-md text-center transition-all border ${!isCustomModel && formData.modelName === 'gemini-2.5-pro' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                        >
                          <span className="font-semibold">{t("Pro")}</span>
                          <span className="block text-xs text-gray-400">{t("Superior Quality")}</span>
                        </button>
                        <button
                          key="custom"
                          type="button"
                          onClick={() => handleModelChange('CUSTOM')}
                          className={`p-3 rounded-md text-center transition-all border ${isCustomModel ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                        >
                          <span className="font-semibold">{t("Custom...")}</span>
                          <span className="block text-xs text-gray-400">{t("Specify model")}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
                
                {aiProvider === 'gemini' && isCustomModel && (
                  <div className="p-2 bg-gray-900/30 rounded-lg">
                    <label htmlFor="customModelName" className="block text-sm font-medium text-gray-300 mb-2">{t("Custom Model Name")}</label>
                    <input id="customModelName" name="customModelName" type="text" onChange={handleInputChange} value={formData.customModelName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder="e.g., gemini-2.5-flash" required />
                  </div>
                )}

                {aiProvider === 'gemini' && (
                  <div className="p-3 bg-gray-900/30 rounded-lg">
                    <div className="flex justify-between items-center">
                        <label htmlFor={advancedBudget ? "geminiThinkingBudgetAdvanced" : "geminiThinkingBudget"} className="font-medium text-gray-300 flex items-center gap-2">
                          {t("Gemini Thinking Budget")}
                          <button type="button" onClick={handleBudgetToggle} className="px-2 py-0.5 text-xs bg-gray-700/60 text-cyan-400 rounded-full hover:bg-gray-700 transition-colors" title={advancedBudget ? t("Switch to simple slider") : t("Switch to advanced input")}>
                              {advancedBudget ? t("Simple") : t("Advanced")}
                          </button>
                        </label>
                        {!advancedBudget && <span className="font-mono text-cyan-300">{formData.geminiThinkingBudget}</span>}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{t("Controls AI's 'thinking' token budget. Higher is better quality, lower is faster. 0 disables it.")}</p>
                      
                      {!advancedBudget ? (
                        <input
                            type="range"
                            id="geminiThinkingBudget"
                            name="geminiThinkingBudget"
                            min="0"
                            max="200"
                            step="10"
                            value={formData.geminiThinkingBudget}
                            onChange={(e) => setFormData(prev => ({ ...prev, geminiThinkingBudget: parseInt(e.target.value, 10) }))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      ) : (
                        <input
                            type="number"
                            id="geminiThinkingBudgetAdvanced"
                            name="geminiThinkingBudget"
                            min="0"
                            max="24576"
                            step="1"
                            value={formData.geminiThinkingBudget}
                            onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                if (value > 24576) return;
                                setFormData(prev => ({ ...prev, geminiThinkingBudget: isNaN(value) ? 0 : value }));
                            }}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition font-mono"
                        />
                      )}
                  </div>
                )}

                {aiProvider === 'openrouter' && (
                   <>
                    <div>
                        <label htmlFor="openRouterApiKey" className="block text-sm font-medium text-gray-300 mb-2">{t("OpenRouter API Key (Optional)")}</label>
                        <input id="openRouterApiKey" name="openRouterApiKey" type="password" onChange={handleInputChange} value={formData.openRouterApiKey} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Leave blank to use pre-configured key")} />
                    </div>
                    <div className="p-2 bg-gray-900/30 rounded-lg mt-4">
                      <label htmlFor="openRouterModelName" className="block text-sm font-medium text-gray-300 mb-2">{t("OpenRouter Model")}</label>
                      <input 
                          id="openRouterModelName" 
                          name="openRouterModelName" 
                          type="text" 
                          onChange={handleInputChange} 
                          value={formData.openRouterModelName} 
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" 
                          placeholder={t("e.g., google/gemini-flash-1.5")} 
                          required 
                      />
                    </div>
                   </>
                )}
                {aiProvider === 'gemini' ? (
                    <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                         <div>
                            <label className="font-medium text-gray-300 flex items-center gap-2">
                                {t("Use Flash for Corrections")}
                                <span className="text-gray-400 hover:text-white cursor-pointer" title={t("Correction Model Tooltip")}>
                                    <InformationCircleIcon className="w-4 h-4" />
                                </span>
                            </label>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.correctionModelName === 'gemini-2.5-flash'}
                                onChange={(e) => {
                                    const value = e.target.checked ? 'gemini-2.5-flash' : '';
                                    setFormData(prev => ({...prev, correctionModelName: value }));
                                }}
                            />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                ) : (
                    <div className="p-3 bg-gray-900/30 rounded-lg mt-2">
                        <label htmlFor="correctionModelName" className="font-medium text-gray-300 flex items-center gap-2">
                            {t("Correction Model (Optional)")}
                            <span className="text-gray-400 hover:text-white cursor-pointer" title={t("Correction Model Tooltip")}>
                                <InformationCircleIcon className="w-4 h-4" />
                            </span>
                        </label>
                        <p className="text-xs text-gray-400 mb-2">{t("Model to use for correcting JSON errors. Leave blank to use the primary model.")}</p>
                        <input 
                            id="correctionModelName" 
                            name="correctionModelName" 
                            type="text" 
                            onChange={handleInputChange} 
                            value={formData.correctionModelName} 
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" 
                            placeholder={t("e.g., google/gemini-pro-1.5")}
                        />
                    </div>
                )}
            </div>

          <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500">
            {t("Begin Your Adventure")}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-700/50 pt-6">
          <p className="text-gray-400 text-sm mb-4">{t("Or continue your journey")}</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onLoadGame}
              className="bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-bold py-3 px-4 rounded-md transition-all border border-gray-600"
            >
              {t("Load from File")}
            </button>
            <button
              type="button"
              onClick={onLoadAutosave}
              disabled={!autosaveTimestamp}
              className="bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-bold py-3 px-4 rounded-md transition-all border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("Load Autosave")}
              {autosaveTimestamp && <span className="block text-xs text-cyan-400/80 font-normal mt-1">{formatTimestamp(autosaveTimestamp)}</span>}
            </button>
            <button
              type="button"
              onClick={handleSaveConfiguration}
              className="bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-bold py-3 px-4 rounded-md transition-all border border-gray-600"
            >
              {t("Save Configuration")}
            </button>
            <button
              type="button"
              onClick={handleLoadConfiguration}
              className="bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-bold py-3 px-4 rounded-md transition-all border border-gray-600"
            >
              {t("Load Configuration")}
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-700/50 pt-6">
          <p className="text-gray-400 text-sm mb-4 text-center">{t("Load from Database")}</p>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {dbSaveSlots && dbSaveSlots.length > 0 ? (
              dbSaveSlots.map(slot => (
                <button
                  key={slot.slotId}
                  type="button"
                  onClick={() => onLoadFromSlot(slot.slotId)}
                  className="w-full text-left bg-gray-700/50 hover:bg-gray-700 text-gray-200 p-3 rounded-md transition-all border border-gray-600 flex items-center gap-4 group"
                >
                  <div className="flex-shrink-0 bg-cyan-900/50 group-hover:bg-cyan-800/70 text-cyan-300 font-bold rounded-md w-12 h-12 flex flex-col items-center justify-center text-center transition-colors">
                    <span className="text-xs">{t("Slot")}</span>
                    <span className="text-lg">{slot.slotId}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">{slot.playerName}</p>
                    <p className="text-sm text-gray-400 truncate">{t("Lvl {level}", { level: slot.playerLevel })} - {slot.locationName}</p>
                    <p className="text-xs text-gray-500 mt-1">{t("Turn")} {slot.turnNumber} - {new Date(slot.timestamp).toLocaleString()}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-gray-500 p-4 bg-gray-900/20 rounded-lg">
                {t("No saved games in the database yet.")}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
            <button
                type="button"
                onClick={() => setIsAboutModalOpen(true)}
                className="text-gray-400 hover:text-cyan-400 text-sm transition-colors"
            >
                {t('About the Project')}
            </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isAdultConfirmOpen}
        onClose={() => setIsAdultConfirmOpen(false)}
        onConfirm={confirmAdultMode}
        title={t("Adult Mode (21+)")}
      >
        <p>{t("adult_mode_warning_p1")}</p>
        <p>{t("adult_mode_warning_p2")}</p>
        <p>{t("adult_mode_warning_p3")}</p>
        <p className="font-bold">{t("adult_mode_warning_p4")}</p>
      </ConfirmationModal>
      <ConfirmationModal
        isOpen={isNonMagicConfirmOpen}
        onClose={() => setIsNonMagicConfirmOpen(false)}
        onConfirm={confirmNonMagicMode}
        title={t("non_magic_mode_title")}
      >
        <p>{t("non_magic_mode_warning_p1")}</p>
        <p>{t("non_magic_mode_warning_p2")}</p>
        <p className="font-bold">{t("non_magic_mode_warning_p3")}</p>
        <p>{t("non_magic_mode_warning_p4")}</p>
      </ConfirmationModal>
       <Modal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} title={t('About the Project')}>
          <AboutContent />
      </Modal>
    </div>
  );
}
