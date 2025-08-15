
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import SidePanel from './components/SidePanel';
import InventoryScreen from './components/InventoryScreen';
import { useGameLogic } from './hooks/useGameLogic';
import { GameState, Item, WorldState, PlayerCharacter, ChatMessage, GameSettings } from './types';
import { ChevronDoubleLeftIcon, PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import ImageRenderer from './components/ImageRenderer';
import Modal from './components/Modal';
import MarkdownRenderer from './components/MarkdownRenderer';
import DetailRenderer from './components/DetailRenderer/index';
import { useLocalization } from './context/LocalizationContext';
import MusicPlayer from './components/MusicPlayer';
import StartScreen from './components/StartScreen';

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
    currentStep,
    currentModel,
    turnTime,
    onImageGenerated,
    forgetHealedWound,
    clearAllHealedWounds,
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
              currentStep={currentStep}
              currentModel={currentModel}
              turnTime={turnTime}
              imageCache={gameState?.imageCache ?? {}}
              onImageGenerated={onImageGenerated}
              forgetHealedWound={forgetHealedWound}
              clearAllHealedWounds={clearAllHealedWounds}
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
              imageCache={gameState?.imageCache ?? {}}
              onImageGenerated={onImageGenerated}
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
            imageCache={gameState?.imageCache ?? {}}
            onImageGenerated={onImageGenerated}
            forgetHealedWound={forgetHealedWound}
            clearAllHealedWounds={clearAllHealedWounds}
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
