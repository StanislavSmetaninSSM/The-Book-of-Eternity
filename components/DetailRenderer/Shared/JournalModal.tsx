import React, { useState } from 'react';
import Modal from '../../Modal';
import EditableField from './EditableField';
import { useLocalization } from '../../../context/LocalizationContext';
import { useSpeech } from '../../../context/SpeechContext';
import { SpeakerWaveIcon, StopCircleIcon } from '@heroicons/react/24/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../ConfirmationModal';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalEntries: string[];
  npcName: string;
  isEditable: boolean;
  onSaveEntry: (index: number, newContent: string) => void;
  onDeleteOldest?: (count: number) => void;
  onDeleteEntry?: (index: number) => void;
  onClearAll?: () => void;
}

// Helper function to strip markdown for cleaner speech
const stripMarkdown = (text: string) => {
  return text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/#{1,6}\s/g, '')
    .replace(/`/g, '');
};

const JournalModal: React.FC<JournalModalProps> = ({ isOpen, onClose, journalEntries, npcName, isEditable, onSaveEntry, onDeleteOldest, onDeleteEntry, onClearAll }) => {
  const { t } = useLocalization();
  const { speak, isSpeaking, currentlySpeakingText } = useSpeech();
  
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [isDeleteOldestConfirmOpen, setIsDeleteOldestConfirmOpen] = useState(false);
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);
  const [deleteCount, setDeleteCount] = useState('10');

  const handleDeleteEntryConfirm = () => {
    if (entryToDelete !== null && onDeleteEntry) {
      onDeleteEntry(entryToDelete);
    }
    setEntryToDelete(null);
  };
  
  const handleDeleteOldestConfirm = () => {
    const count = parseInt(deleteCount, 10);
    if (!isNaN(count) && count > 0 && onDeleteOldest) {
      onDeleteOldest(count);
    }
    setIsDeleteOldestConfirmOpen(false);
  };
  
  const handleClearAllConfirm = () => {
    if (onClearAll) {
      onClearAll();
    }
    setIsClearAllConfirmOpen(false);
  };


  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t("Full Journal: {name}", { name: npcName })}
        showFontSizeControls={true}
      >
        <div className="space-y-4">
          {journalEntries.map((entry, index) => {
             if (typeof entry !== 'string') {
              return (
                <div key={index} className="bg-red-900/40 p-3 rounded-lg border border-red-700/50">
                  <div className="text-red-300 font-semibold text-sm">
                    [{t('Corrupted Journal Entry')}]
                  </div>
                  <pre className="text-xs text-red-200/80 whitespace-pre-wrap break-all mt-1">
                    {JSON.stringify(entry, null, 2)}
                  </pre>
                </div>
              );
            }

            const strippedEntry = stripMarkdown(entry);
            const isThisEntrySpeaking = isSpeaking && currentlySpeakingText === strippedEntry;

            return (
              <div key={index} className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/50 group">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <EditableField
                      label={`${t('Entry')} ${journalEntries.length - index}`}
                      value={entry}
                      onSave={(newContent) => onSaveEntry(index, newContent)}
                      isEditable={isEditable}
                      as="textarea"
                      className="narrative-text leading-relaxed whitespace-pre-wrap"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => speak(strippedEntry)}
                      className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white opacity-40 group-hover:opacity-100 transition-opacity"
                      title={isThisEntrySpeaking ? t("Stop speech") : t("Read aloud")}
                    >
                      {isThisEntrySpeaking 
                        ? <StopCircleIcon className="w-5 h-5 text-cyan-400 animate-pulse" /> 
                        : <SpeakerWaveIcon className="w-5 h-5" />}
                    </button>
                    {isEditable && onDeleteEntry && (
                         <button
                            onClick={() => setEntryToDelete(index)}
                            className="p-1 rounded-full text-gray-400 hover:bg-red-900/50 hover:text-red-300 opacity-40 group-hover:opacity-100 transition-opacity"
                            title={t("Delete Entry")}
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {isEditable && journalEntries.length > 0 && (
            <footer className="mt-6 pt-4 border-t border-gray-700/60 flex flex-col sm:flex-row justify-end items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={deleteCount}
                        onChange={(e) => setDeleteCount(e.target.value)}
                        min="1"
                        max={journalEntries.length}
                        className="w-20 bg-gray-700/50 border border-gray-600 rounded-md py-1 px-2 text-sm text-center text-white"
                        aria-label={t("Number of entries to delete")}
                    />
                    <button
                        onClick={() => setIsDeleteOldestConfirmOpen(true)}
                        disabled={!onDeleteOldest}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-yellow-300 bg-yellow-500/10 rounded-md hover:bg-yellow-500/20 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                        {t("Delete Oldest")}
                    </button>
                </div>
                <button
                    onClick={() => setIsClearAllConfirmOpen(true)}
                    disabled={!onClearAll}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"
                >
                    <TrashIcon className="w-4 h-4" />
                    {t("Clear All Entries")}
                </button>
            </footer>
        )}
      </Modal>
      <ConfirmationModal
        isOpen={entryToDelete !== null}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleDeleteEntryConfirm}
        title={t("Delete Entry")}
      >
        <p>{t("Are you sure you want to delete this journal entry?")}</p>
      </ConfirmationModal>
      <ConfirmationModal
        isOpen={isDeleteOldestConfirmOpen}
        onClose={() => setIsDeleteOldestConfirmOpen(false)}
        onConfirm={handleDeleteOldestConfirm}
        title={t("Delete Oldest Entries")}
      >
        <p>{t("Are you sure you want to delete the {count} oldest journal entries for {name}?", { count: deleteCount, name: npcName })}</p>
      </ConfirmationModal>
      <ConfirmationModal
        isOpen={isClearAllConfirmOpen}
        onClose={() => setIsClearAllConfirmOpen(false)}
        onConfirm={handleClearAllConfirm}
        title={t("Clear All Entries")}
      >
        <p>{t("Are you sure you want to delete all journal entries for {name}? This cannot be undone.", { name: npcName })}</p>
      </ConfirmationModal>
    </>
  );
};

export default JournalModal;