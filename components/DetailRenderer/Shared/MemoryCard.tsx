import React, { useState } from 'react';
import { UnlockedMemory } from '../../../types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { SpeakerWaveIcon, StopCircleIcon } from '@heroicons/react/24/solid';
import MarkdownRenderer from '../../MarkdownRenderer';
import { useLocalization } from '../../../context/LocalizationContext';
import { useSpeech } from '../../../context/SpeechContext';

interface MemoryCardProps {
    memory: UnlockedMemory;
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

const MemoryCard: React.FC<MemoryCardProps> = ({ memory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLocalization();
    const { speak, isSpeaking, currentlySpeakingText } = useSpeech();

    const strippedContent = stripMarkdown(memory.content);
    const isThisMemorySpeaking = isSpeaking && currentlySpeakingText === strippedContent;

    return (
        <div className="bg-gray-700/50 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-left"
            >
                <div className="flex-1 mr-2">
                    <p className="font-semibold text-cyan-400">{memory.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('Unlocked at relationship level {level}', { level: memory.unlockedAtRelationshipLevel })}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            speak(strippedContent);
                        }}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                        title={isThisMemorySpeaking ? t("Stop speech") : t("Read aloud")}
                    >
                        {isThisMemorySpeaking 
                            ? <StopCircleIcon className="w-5 h-5 text-cyan-400 animate-pulse" /> 
                            : <SpeakerWaveIcon className="w-5 h-5" />}
                    </button>
                    {isOpen ? <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
                </div>
            </button>
            {isOpen && (
                <div className="p-3 border-t border-gray-600/50">
                    <div className="text-sm italic text-gray-300 prose prose-invert max-w-none prose-p:my-2">
                        <MarkdownRenderer content={memory.content} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemoryCard;