
import React from 'react';
import Modal from '../../Modal';
import EditableField from './EditableField';
import { useLocalization } from '../../../context/LocalizationContext';
import { useSpeech } from '../../../context/SpeechContext';
import { SpeakerWaveIcon, StopCircleIcon } from '@heroicons/react/24/solid';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalEntries: string[];
  npcName: string;
  isEditable: boolean;
  onSaveEntry: (index: number, newContent: string) => void;
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

const JournalModal: React.FC<JournalModalProps> = ({ isOpen, onClose, journalEntries, npcName, isEditable, onSaveEntry }) => {
  const { t } = useLocalization();
  const { speak, isSpeaking, currentlySpeakingText } = useSpeech();

  return (
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
    </Modal>
  );
};

export default JournalModal;