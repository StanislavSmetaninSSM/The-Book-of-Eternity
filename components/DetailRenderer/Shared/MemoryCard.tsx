import React from 'react';
import { UnlockedMemory } from '../../../types';
import { SpeakerWaveIcon, StopCircleIcon } from '@heroicons/react/24/solid';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useLocalization } from '../../../context/LocalizationContext';
import { useSpeech } from '../../../context/SpeechContext';
import { stripMarkdown } from '../../../utils/textUtils';

interface MemoryCardProps {
    memory: UnlockedMemory;
    onOpenMemoryModal: (title: string, content: string) => void;
    isEditable?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onOpenMemoryModal, isEditable, onEdit, onDelete }) => {
    const { t } = useLocalization();
    const { speak, isSpeaking, currentlySpeakingText } = useSpeech();

    const strippedContent = memory.content ? stripMarkdown(memory.content) : '';
    const isThisMemorySpeaking = isSpeaking && currentlySpeakingText === strippedContent;

    const handleCardClick = () => {
        onOpenMemoryModal(memory.title, memory.content);
    };

    return (
        <button
            onClick={handleCardClick}
            className="w-full text-left bg-gray-700/50 rounded-lg p-3 group hover:bg-gray-700/80 transition-colors"
        >
            <div className="flex justify-between items-center">
                <div className="flex-1 mr-2">
                    <p className="font-semibold text-cyan-400 group-hover:underline">{memory.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('Unlocked at relationship level {level}', { level: memory.unlockedAtRelationshipLevel })}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            speak(strippedContent);
                        }}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white opacity-40 group-hover:opacity-100 transition-opacity"
                        title={isThisMemorySpeaking ? t("Stop speech") : t("Read aloud")}
                    >
                        {isThisMemorySpeaking 
                            ? <StopCircleIcon className="w-5 h-5 text-cyan-400 animate-pulse" /> 
                            : <SpeakerWaveIcon className="w-5 h-5" />}
                    </button>
                    {isEditable && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onEdit) onEdit();
                                }}
                                className="p-1 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white opacity-40 group-hover:opacity-100 transition-opacity"
                                title={t("Edit Memory")}
                            >
                                <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onDelete) onDelete();
                                }}
                                className="p-1 rounded-full text-gray-400 hover:bg-red-900/50 hover:text-red-300 opacity-40 group-hover:opacity-100 transition-opacity"
                                title={t("Delete Memory")}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </button>
    );
};

export default MemoryCard;
