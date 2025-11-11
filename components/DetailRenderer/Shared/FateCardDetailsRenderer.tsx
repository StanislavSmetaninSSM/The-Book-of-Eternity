import React from 'react';
import { FateCard, GameSettings, ImageCacheEntry } from '../../../types';
import ImageRenderer from '../../ImageRenderer';
import MarkdownRenderer from '../../MarkdownRenderer';
import { useLocalization } from '../../../context/LocalizationContext';

interface FateCardDetailsProps {
  card: FateCard;
  onOpenImageModal?: (displayPrompt: string, originalTextPrompt: string, onClearCustom?: () => void, onUpload?: (base64: string) => void) => void;
  imageCache: Record<string, ImageCacheEntry>;
  onImageGenerated: (prompt: string, src: string, sourceProvider: ImageCacheEntry['sourceProvider'], sourceModel?: string) => void;
  gameSettings: GameSettings | null;
  model?: 'flux' | 'turbo' | 'gptimage' | 'kontext';
}

const FateCardDetailsRenderer: React.FC<FateCardDetailsProps> = ({ card, onOpenImageModal, imageCache, onImageGenerated, gameSettings, model }) => {
    const { t } = useLocalization();
    const effectivePrompt = card.image_prompt || `A detailed fantasy art image of a tarot card representing "${card.name}". ${card.description}`;

    return (
    <div className={`p-4 rounded-lg border-l-4 ${card.isUnlocked ? 'border-yellow-500 bg-yellow-900/20' : 'border-gray-600 bg-gray-700/50'}`}>
        <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-gray-900 group relative cursor-pointer" onClick={() => onOpenImageModal?.(effectivePrompt, card.image_prompt)}>
            <ImageRenderer prompt={effectivePrompt} originalTextPrompt={card.image_prompt} alt={card.name} width={1024} height={1024} imageCache={imageCache} onImageGenerated={onImageGenerated} gameSettings={gameSettings} />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-bold text-lg">{t('Enlarge')}</p>
            </div>
        </div>
        <p className="font-bold text-lg">{card.name} {card.isUnlocked ? <span className="text-xs text-yellow-300">({t('Unlocked')})</span> : <span className="text-xs text-gray-400">({t('Locked')})</span>}</p>
        <div className="italic text-gray-400 my-1"><MarkdownRenderer content={card.description} /></div>
        {!card.isUnlocked && card.unlockConditions && (
            <div className="text-xs mt-2 text-cyan-300/80">
                <p>{t('Unlock Conditions:')}</p>
                <ul className="list-disc list-inside pl-2">
                    {card.unlockConditions.requiredRelationshipLevel != null && <li>{t('Reach relationship level {level}', { level: card.unlockConditions.requiredRelationshipLevel })}</li>}
                    {card.unlockConditions.plotConditionDescription && <li><MarkdownRenderer content={t(card.unlockConditions.plotConditionDescription as any)} inline /></li>}
                </ul>
            </div>
        )}
        {card.isUnlocked && card.rewards && (
             <div className="text-xs mt-2 text-green-300/80">
                <p>{t('Rewards')}:</p>
                <div className="pl-2"><MarkdownRenderer content={t(card.rewards.description as any)} /></div>
            </div>
        )}
    </div>
    );
};

export default FateCardDetailsRenderer;