import React from 'react';
import { Item, PlayerCharacter } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { ArchiveBoxXMarkIcon, ExclamationTriangleIcon, TrashIcon, ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';
import ImageRenderer from './ImageRenderer';
import MarkdownRenderer from './MarkdownRenderer';

interface StashViewProps {
  stash: Item[];
  playerCharacter: PlayerCharacter;
  onTake: (item: Item) => void;
  onDrop: (item: Item) => void;
}

const qualityColorMap: Record<string, string> = {
    'Trash': 'border-gray-700',
    'Common': 'border-gray-500',
    'Uncommon': 'border-green-700/80',
    'Good': 'border-blue-700/80',
    'Rare': 'border-indigo-700/80',
    'Epic': 'border-purple-700/80',
    'Legendary': 'border-orange-700/80',
    'Unique': 'border-yellow-600/80',
};

const StashView: React.FC<StashViewProps> = ({ stash, playerCharacter, onTake, onDrop }) => {
    const { t } = useLocalization();

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-red-400 mb-3 narrative-text flex items-center gap-2">
                <ArchiveBoxXMarkIcon className="w-6 h-6" />
                {t('Stash')}
            </h3>

            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-3">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-400 flex-shrink-0" />
                <div className="text-sm text-red-300/90 text-left">
                    <MarkdownRenderer content={t('StashWarning')} className="prose-p:my-0 prose-strong:text-red-200" />
                </div>
            </div>

            <div className="space-y-3">
                {stash.map(item => {
                    const itemTotalWeight = item.weight * item.count;
                    const canTake = playerCharacter.totalWeight + itemTotalWeight <= playerCharacter.maxWeight + playerCharacter.criticalExcessWeight;
                    const imagePrompt = item.image_prompt || `game asset, inventory icon, ${item.quality} ${item.name}, fantasy art, plain background`;

                    return (
                        <div key={item.existedId} className={`bg-gray-900/40 p-3 rounded-lg border-l-4 ${qualityColorMap[item.quality] || 'border-gray-600'} flex items-center gap-4`}>
                            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-800">
                                <ImageRenderer prompt={imagePrompt} alt={item.name} />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-200">{item.name} {item.count > 1 ? `(x${item.count})` : ''}</p>
                                <p className="text-xs text-gray-400">{t('Weight')}: {itemTotalWeight.toFixed(2)} {t('kg')}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={() => onTake(item)}
                                    disabled={!canTake}
                                    className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-green-300 bg-green-600/20 rounded-md hover:bg-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600/20"
                                    title={!canTake ? t("You still cannot carry this item. Drop something else first.") : t('Take')}
                                >
                                    <ArrowDownOnSquareIcon className="w-4 h-4" />
                                    {t('Take')}
                                </button>
                                <button
                                    onClick={() => onDrop(item)}
                                    className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-600/20 rounded-md hover:bg-red-600/40 transition-colors"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    {t('Drop')}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StashView;