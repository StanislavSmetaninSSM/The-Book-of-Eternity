import React, { useState } from 'react';
import { UnlockedMemory } from '../../../types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import MarkdownRenderer from '../../MarkdownRenderer';
import { useLocalization } from '../../../context/LocalizationContext';

interface MemoryCardProps {
    memory: UnlockedMemory;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLocalization();

    return (
        <div className="bg-gray-700/50 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-left"
            >
                <div className="flex-1">
                    <p className="font-semibold text-cyan-400">{memory.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('Unlocked at relationship level {level}', { level: memory.unlockedAtRelationshipLevel })}</p>
                </div>
                {isOpen ? <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
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
