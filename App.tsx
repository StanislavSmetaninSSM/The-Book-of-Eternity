import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import SidePanel from './components/SidePanel';
import InventoryScreen from './components/InventoryScreen';
import { useGameLogic } from './hooks/useGameLogic';
import { GameState, Item, WorldState, PlayerCharacter, ChatMessage, GameSettings, Quest, Location, Wound, UnlockedMemory, NPC } from './types';
import { ChevronDoubleLeftIcon, PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import ImageRenderer from './components/ImageRenderer';
import Modal from './components/Modal';
import MarkdownRenderer from './components/MarkdownRenderer';
import DetailRenderer from './components/DetailRenderer/index';
import { useLocalization } from './context/LocalizationContext';
import MusicPlayer from './components/MusicPlayer';
import StartScreen from './components/StartScreen';
import JournalModal from './components/DetailRenderer/Shared/JournalModal';

interface ImageModalInfo {
  prompt: string;
  onRegenerate?: (newPrompt: string) => void;
}

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
    disassembleNpcItem,
    craftItem,
    moveFromStashToInventory,
    dropItemFromStash,
    deleteMessage,
    clearHalfHistory,
    deleteLogs,
    forgetNpc,
    forgetFaction,
    clearNpcJournal,
    deleteOldestNpcJournalEntries,
    deleteNpcJournalEntry,
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
    editFactionData,
    editLocationData,
    editPlayerData,
    editWorldState,
    editWeather,
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
    currentStep,
    currentModel,
    turnTime,
    onImageGenerated,
    forgetHealedWound,
    clearAllHealedWounds,
    onRegenerateId,
    deleteCustomState,
    deleteNpcCustomState,
    deleteWorldStateFlag,
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
    onEditNpcMemory,
    onDeleteNpcMemory,
    clearNpcJournalsNow,
  } = useGameLogic({ language, setLanguage });
  const [hasStarted, setHasStarted] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [messageModalState, setMessageModalState] = useState<{ title: string; content: string } | null>(null);
  const [imageModalInfo, setImageModalInfo] = useState<ImageModalInfo | null>(null);
  const [detailModalStack, setDetailModalStack] = useState<{ title: string; data: any }[]>([]);
  const [editModalData, setEditModalData] = useState<{ index: number, message: ChatMessage } | null>(null);
  const [editContent, setEditContent] = useState('');
  const [journalModalNpc, setJournalModalNpc] = useState<NPC | null>(null);


  // Resizable sidebar state and logic
  const [sidebarWidth, setSidebarWidth] = useState(384); // Default width (e.g., lg:w-96)
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const currentDetailModal = useMemo(() => detailModalStack.length > 0 ? detailModalStack[detailModalStack.length - 1] : null, [detailModalStack]);

  useEffect(() => {
    // This effect ensures that the data shown in the detail modal is always fresh.
    // When gameState is updated (e.g., after regenerating an ID), this finds the
    // corresponding object in the new state and updates the modal's data,
    // triggering a re-render with the correct information.
    if (!currentDetailModal || !gameState) return;

    const { data } = currentDetailModal;
    let updatedData = null;

    // Type guards to identify the entity
    const isNpc = data.NPCId !== undefined || (data.attitude !== undefined && data.race !== undefined);
    const isItem = data.existedId !== undefined;
    const isQuest = data.questId !== undefined;
    const isLocation = data.type === 'location';
    const isWound = data.type === 'wound';

    if (isWound) {
        // Correctly find the wound in the current game state to get the fresh data.
        let foundWound: Wound | undefined | null = null;
        
        const findWoundInList = (woundList?: Wound[]) => (woundList || []).find(w => 
            (data.woundId && w.woundId === data.woundId) || 
            // Fallback for new wounds from the current turn that might not have an ID yet
            (!data.woundId && w.woundName === data.woundName && w.severity === data.severity)
        );
        
        // Check player wounds first
        foundWound = findWoundInList(gameState.playerCharacter.playerWounds);

        // If not found, check all NPCs
        if (!foundWound && Array.isArray(gameState.encounteredNPCs)) {
            for (const npc of gameState.encounteredNPCs) {
                foundWound = findWoundInList(npc.wounds);
                if (foundWound) break;
            }
        }
        
        if (foundWound) {
            // CRITICAL FIX: The `foundWound` from the game state does not have the `type` property.
            // We must create a new object that combines the fresh data from the state
            // with the essential `type: 'wound'` property from the original modal data.
            updatedData = { ...foundWound, type: 'wound' };
        } else {
            // If no fresh data was found (e.g., wound was just removed), stick with the original data.
            updatedData = data;
        }
    } else if (isNpc && Array.isArray(gameState.encounteredNPCs)) {
        const foundNpc = gameState.encounteredNPCs.find(npc => 
            (data.NPCId && npc.NPCId === data.NPCId) || // Find by existing ID first
            (!data.NPCId && npc.name === data.name)      // Fallback to name if original had no ID
        );
        if (foundNpc) {
            updatedData = { ...foundNpc }; // Create a copy
            if ((data as any).openJournal) {
                (updatedData as any).openJournal = true;
            }
        }
    } else if (isItem && Array.isArray(gameState.playerCharacter.inventory)) {
        updatedData = gameState.playerCharacter.inventory.find(item => item.existedId === data.existedId);
    } else if (isQuest && Array.isArray(gameState.activeQuests)) {
        const allQuests = [...gameState.activeQuests, ...gameState.completedQuests];
        updatedData = allQuests.find(q => 
            (data.questId && q.questId === data.questId) ||
            (!data.questId && q.questName === data.questName)
        );
    } else if (isLocation && Array.isArray(visitedLocations)) {
        updatedData = visitedLocations.find(loc => 
            (data.locationId && loc.locationId === data.locationId) ||
            (!data.locationId && loc.name === data.name)
        );
        if (updatedData) {
            // Preserve the type property needed by the renderer, which isn't part of the core data model
            updatedData = { ...updatedData, type: 'location' };
        }
    }

    // Only update state if the found data is different, to prevent render loops.
    // Add additional check to ensure updatedData is valid for wounds
    if (updatedData && updatedData !== data && JSON.stringify(updatedData) !== JSON.stringify(data)) {
        setDetailModalStack(prev => {
            const newStack = [...prev];
            if (newStack.length > 0) {
                newStack[newStack.length - 1] = { ...newStack[newStack.length - 1], data: updatedData };
            }
            return newStack;
        });
    }
  }, [gameState, currentDetailModal, visitedLocations]);

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

  const handleShowMessageModal = (title: string, content: string) => {
    setMessageModalState({ title, content });
  };
  
  const handleShowImageModal = (prompt: string, onRegenerate?: (newPrompt: string) => void) => {
    if (prompt) {
        setImageModalInfo({ prompt, onRegenerate });
    }
  };

  const handleOpenDetailModal = useCallback((title: string, data: any) => {
    setDetailModalStack(prev => [...prev, { title, data }]);
  }, []);
  
  const handleCloseDetailModal = useCallback(() => {
    setDetailModalStack(prev => prev.slice(0, -1));
  }, []);
  
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

  const handleOpenJournalModal = useCallback((npc: NPC) => {
    setJournalModalNpc(npc);
  }, []);

  const handleCloseJournalModal = useCallback(() => {
    setJournalModalNpc(null);
  }, []);


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
                  imageCache={gameState?.imageCache ?? {}}
                  onImageGenerated={onImageGenerated}
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
          className={`w-full md:w-auto bg-gray-800/80 rounded-lg backdrop-blur-md border border-gray-700/60 h-screen flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isSidebarCollapsed ? 'p-0 border-none' : 'p-4 md:p-6'}`}
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
              onOpenJournalModal={handleOpenJournalModal}
              onOpenImageModal={handleShowImageModal}
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
              currentStep={currentStep}
              currentModel={currentModel}
              turnTime={turnTime}
              imageCache={gameState?.imageCache ?? {}}
              onImageGenerated={onImageGenerated}
              forgetHealedWound={forgetHealedWound}
              clearAllHealedWounds={clearAllHealedWounds}
              onRegenerateId={onRegenerateId}
              deleteCustomState={deleteCustomState}
              deleteNpcCustomState={deleteNpcCustomState}
              deleteWorldStateFlag={deleteWorldStateFlag}
              editWorldState={editWorldState}
              editWeather={editWeather}
              updateNpcSortOrder={updateNpcSortOrder}
              updateItemSortOrder={updateItemSortOrder}
              updateItemSortSettings={updateItemSortSettings}
              updateNpcItemSortOrder={updateNpcItemSortOrder}
              updateNpcItemSortSettings={updateNpcItemSortSettings}
              handleTransferItem={handleTransferItem}
              handleEquipItemForNpc={handleEquipItemForNpc}
              handleUnequipItemForNpc={handleUnequipItemForNpc}
              handleSplitItemForNpc={handleSplitItemForNpc}
              handleMergeItemsForNpc={handleMergeItemsForNpc}
              forgetNpc={forgetNpc}
              forgetFaction={forgetFaction}
              forgetQuest={forgetQuest}
              forgetLocation={forgetLocation}
              onEditNpcMemory={onEditNpcMemory}
              onDeleteNpcMemory={onDeleteNpcMemory}
              clearNpcJournalsNow={clearNpcJournalsNow}
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
          imageCache={gameState?.imageCache ?? {}}
          onImageGenerated={onImageGenerated}
          updateItemSortOrder={updateItemSortOrder}
          updateItemSortSettings={updateItemSortSettings}
        />
      )}
       {messageModalState && (
        <Modal isOpen={true} onClose={() => setMessageModalState(null)} title={messageModalState.title} showFontSizeControls={true}>
            <MarkdownRenderer content={messageModalState.content} />
        </Modal>
      )}

      {imageModalInfo && (
        <Modal isOpen={true} onClose={() => setImageModalInfo(null)} title={t("Scene Image")}>
            <ImageRenderer 
              prompt={imageModalInfo.prompt} 
              className="w-full h-auto rounded-md" 
              alt={t("Enlarged game scene")}
              showRegenerateButton={true}
              width={1024}
              height={1024}
              imageCache={gameState?.imageCache ?? {}}
              onImageGenerated={(newPrompt, newBase64) => {
                onImageGenerated(newPrompt, newBase64); // Update cache
                if (imageModalInfo.onRegenerate) {
                  imageModalInfo.onRegenerate(newPrompt); // Update entity state
                }
                // Update modal's own prompt to show new image if regenerated again
                setImageModalInfo(prev => prev ? { ...prev, prompt: newPrompt } : null);
              }}
            />
        </Modal>
      )}
       <Modal isOpen={!!currentDetailModal} onClose={handleCloseDetailModal} title={currentDetailModal?.title || t('Details')}>
        {currentDetailModal && <DetailRenderer 
            data={currentDetailModal.data} 
            onForgetNpc={forgetNpc} 
            onForgetLocation={forgetLocation} 
            onClearNpcJournal={clearNpcJournal}
            onDeleteOldestNpcJournalEntries={deleteOldestNpcJournalEntries}
            onDeleteNpcJournalEntry={deleteNpcJournalEntry}
            onForgetQuest={forgetQuest}
            onCloseModal={handleCloseDetailModal} 
            onOpenImageModal={handleShowImageModal}
            onShowMessageModal={handleShowMessageModal}
            playerCharacter={gameState?.playerCharacter}
            setAutoCombatSkill={setAutoCombatSkill}
            onOpenDetailModal={handleOpenDetailModal}
            disassembleItem={disassembleItem}
            disassembleNpcItem={disassembleNpcItem}
            currentLocationId={gameState?.currentLocationData?.locationId}
            allowHistoryManipulation={gameSettings?.allowHistoryManipulation ?? false}
            onEditNpcData={editNpcData}
            onEditQuestData={editQuestData}
            onEditItemData={editItemData}
            onEditLocationData={editLocationData}
            onEditPlayerData={editPlayerData}
            onEditFactionData={editFactionData}
            onRegenerateId={onRegenerateId}
            encounteredFactions={gameState?.encounteredFactions}
            gameSettings={gameSettings}
            imageCache={gameState?.imageCache ?? {}}
            onImageGenerated={onImageGenerated}
            forgetHealedWound={forgetHealedWound}
            clearAllHealedWounds={clearAllHealedWounds}
            visitedLocations={visitedLocations}
            handleTransferItem={handleTransferItem}
            handleEquipItemForNpc={handleEquipItemForNpc}
            handleUnequipItemForNpc={handleUnequipItemForNpc}
            handleSplitItemForNpc={handleSplitItemForNpc}
            handleMergeItemsForNpc={handleMergeItemsForNpc}
            updateNpcItemSortOrder={updateNpcItemSortOrder}
            updateNpcItemSortSettings={updateNpcItemSortSettings}
            deleteNpcCustomState={deleteCustomState}
            deleteWorldStateFlag={deleteWorldStateFlag}
            onEditNpcMemory={onEditNpcMemory}
            onDeleteNpcMemory={onDeleteNpcMemory}
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
       {journalModalNpc && (
        <JournalModal
          isOpen={!!journalModalNpc}
          onClose={handleCloseJournalModal}
          journalEntries={journalModalNpc.journalEntries || []}
          npcName={journalModalNpc.name}
          isEditable={gameSettings?.allowHistoryManipulation ?? false}
          onSaveEntry={(index, newContent) => {
              if (journalModalNpc.NPCId) {
                  const newEntries = [...(journalModalNpc.journalEntries || [])];
                  newEntries[index] = newContent;
                  editNpcData(journalModalNpc.NPCId, 'journalEntries', newEntries);
                  setJournalModalNpc(prev => prev ? { ...prev, journalEntries: newEntries } : null);
              }
          }}
          onDeleteOldest={deleteOldestNpcJournalEntries && journalModalNpc.NPCId ? (count) => {
              deleteOldestNpcJournalEntries(journalModalNpc.NPCId!, count);
              setJournalModalNpc(prev => {
                  if (!prev) return null;
                  const newEntries = (prev.journalEntries || []).slice(0, Math.max(0, (prev.journalEntries || []).length - count));
                  return { ...prev, journalEntries: newEntries };
              });
          } : undefined}
          onDeleteEntry={deleteNpcJournalEntry && journalModalNpc.NPCId ? (index) => {
              deleteNpcJournalEntry(journalModalNpc.NPCId!, index);
              setJournalModalNpc(prev => {
                  if (!prev) return null;
                  const newEntries = (prev.journalEntries || []).filter((_, i) => i !== index);
                  return { ...prev, journalEntries: newEntries };
              });
          } : undefined}
          onClearAll={clearNpcJournal && journalModalNpc.NPCId ? () => {
              clearNpcJournal(journalModalNpc.NPCId!);
              setJournalModalNpc(prev => prev ? { ...prev, journalEntries: [] } : null);
          } : undefined}
        />
      )}
    </>
  );
}