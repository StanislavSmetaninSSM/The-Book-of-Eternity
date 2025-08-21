
import React from 'react';
import { UnlockedMemory } from '../../../types';
import { SpeakerWaveIcon, StopCircleIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../../../context/LocalizationContext';
import { useSpeech } from '../../../context/SpeechContext';

interface MemoryCardProps {
    memory: UnlockedMemory;
    onOpenMemoryModal: (title: string, content: string) => void;
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

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onOpenMemoryModal }) => {
    const { t } = useLocalization();
    const { speak, isSpeaking, currentlySpeakingText } = useSpeech();

    const strippedContent = stripMarkdown(memory.content);
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
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            speak(strippedContent);
                        }}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white"
                        title={isThisMemorySpeaking ? t("Stop speech") : t("Read aloud")}
                    >
                        {isThisMemorySpeaking 
                            ? <StopCircleIcon className="w-5 h-5 text-cyan-400 animate-pulse" /> 
                            : <SpeakerWaveIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </button>
    );
};

export default MemoryCard;
