import React from 'react';
import Modal from '../../Modal';
import EditableField from './EditableField';
import { useLocalization } from '../../../context/LocalizationContext';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalEntries: string[];
  npcName: string;
  isEditable: boolean;
  onSaveEntry: (index: number, newContent: string) => void;
}

const JournalModal: React.FC<JournalModalProps> = ({ isOpen, onClose, journalEntries, npcName, isEditable, onSaveEntry }) => {
  const { t } = useLocalization();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("Full Journal: {name}", { name: npcName })}
      showFontSizeControls={true}
    >
      <div className="space-y-4">
        {journalEntries.map((entry, index) => (
          <div key={index} className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/50">
            {/* The Modal component will pass down font-size classes to this child via cloneElement */}
            <EditableField
              label={`${t('Entry')} ${journalEntries.length - index}`}
              value={entry}
              onSave={(newContent) => onSaveEntry(index, newContent)}
              isEditable={isEditable}
              as="textarea"
              className="narrative-text leading-relaxed whitespace-pre-wrap"
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default JournalModal;
