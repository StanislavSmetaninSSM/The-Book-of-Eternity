
import React from 'react';
import Modal from '../../Modal';
import EditableField from './EditableField';
import { useLocalization } from '../../../context/LocalizationContext';

interface LocationEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  events: string[];
  isEditable: boolean;
  onSaveEvents: (newEvents: string[]) => void;
}

const LocationEventsModal: React.FC<LocationEventsModalProps> = ({
  isOpen,
  onClose,
  locationName,
  events,
  isEditable,
  onSaveEvents,
}) => {
  const { t } = useLocalization();

  const handleSaveEntry = (index: number, newContent: string) => {
    const newEvents = [...events];
    newEvents[index] = newContent;
    onSaveEvents(newEvents);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('Events Log')}: ${locationName}`}
      showFontSizeControls={true}
    >
      <div className="space-y-4">
        {events.map((entry, index) => (
          <div key={index} className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/50">
            <EditableField
              label={`${t('Event')} #${events.length - index}`}
              value={entry}
              onSave={(newContent) => handleSaveEntry(index, newContent)}
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

export default LocationEventsModal;
