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
  onDeleteOldest?: () => void;
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

const JournalModal: React.FC<JournalModalProps> = ({ isOpen, onClose, journalEntries, npcName, isEditable, onSaveEntry, onDeleteOldest }) => {
  const { t } = useLocalization();
  const { speak, isSpeaking, currentlySpeakingText } = useSpeech();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDeleteConfirm = () => {
    if (onDeleteOldest) {
      onDeleteOldest();
    }
    setIsDeleteConfirmOpen(false);
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
                  <button
                    onClick={() => speak(strippedEntry)}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white opacity-40 group-hover:opacity-100 transition-opacity"
                    title={isThisEntrySpeaking ? t("Stop speech") : t("Read aloud")}
                  >
                    {isThisEntrySpeaking 
                      ? <StopCircleIcon className="w-5 h-5 text-cyan-400 animate-pulse" /> 
                      : <SpeakerWaveIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {onDeleteOldest && journalEntries.length > 10 && (
            <footer className="mt-6 pt-4 border-t border-gray-700/60 flex justify-end">
                <button
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"
                    aria-label={t("Delete 10 Oldest Entries")}
                >
                    <TrashIcon className="w-4 h-4" />
                    {t("Delete 10 Oldest Entries")}
                </button>
            </footer>
        )}
      </Modal>
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t("Delete Oldest Journal Entries")}
      >
        <p>{t("Are you sure you want to delete the 10 oldest journal entries for {name}? This cannot be undone.", { name: npcName })}</p>
      </ConfirmationModal>
    </>
  );
};

export default JournalModal;