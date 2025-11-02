
import React from 'react';
import { Item, GameSettings } from '../../../types';
import { qualityColorMap } from '../../DetailRenderer/utils';
import ImageRenderer from '../../ImageRenderer';
import { useLocalization } from '../../../context/LocalizationContext';
import { ExclamationTriangleIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';

interface ItemCardProps {
    item: Item;
    gameSettings: GameSettings | null;
    imageCache: Record<string, string>;
    onImageGenerated: (p: string, b: string) => void;
    onOpenImageModal: (displayPrompt: string, originalTextPrompt: string, onClearCustom?: () => void, onUpload?: (base64: string) => void) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, gameSettings, imageCache, onImageGenerated, onOpenImageModal }) => {
    const { t } = useLocalization();
    const isBroken = item.durability === '0%';
    const displayPrompt = item.custom_image_prompt || item.image_prompt || `game asset, inventory icon, ${item.quality} ${item.name}, fantasy art, plain background`;
    const originalTextPrompt = item.image_prompt || `game asset, inventory icon, ${item.quality} ${item.name}, fantasy art, plain background`;

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenImageModal(displayPrompt, originalTextPrompt);
    };

    return (
        <div
            className={`w-20 h-20 bg-gray-900/50 rounded-md flex flex-col justify-center items-center border-2 ${qualityColorMap[item.quality]?.split(' ')[1] || 'border-gray-600'} shadow-lg transition-all relative group overflow-hidden ${isBroken ? '' : 'hover:shadow-xl hover:shadow-cyan-500/30'}`}
            title={isBroken ? t("This item is broken and cannot be equipped.") : (typeof item.name === 'string' ? item.name : '')}
        >
            <ImageRenderer 
                prompt={displayPrompt} 
                originalTextPrompt={originalTextPrompt}
                alt={item.name} 
                className={`absolute inset-0 w-full h-full object-cover ${isBroken ? 'filter grayscale brightness-50' : ''}`} 
                imageCache={imageCache} 
                onImageGenerated={onImageGenerated} 
                model={gameSettings?.pollinationsImageModel} 
                gameSettings={gameSettings}
            />
            {isBroken && (
                <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center pointer-events-none">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-center">
                <p className="text-xs text-white line-clamp-1 font-semibold">{typeof item.name === 'string' ? item.name : `[${t('corrupted_item')}]`}</p>
            </div>
            {item.count > 1 && <div className="absolute top-1 right-1 text-xs bg-gray-900/80 px-1.5 py-0.5 rounded-full font-mono text-white">{item.count}</div>}
            {item.resource !== undefined && item.maximumResource !== undefined && (
                <div className="absolute bottom-1 left-1 text-xs bg-cyan-700/90 px-1.5 py-0.5 rounded-full font-mono text-white border border-cyan-400/50">
                    {item.resource}/{item.maximumResource}
                </div>
            )}
            <div onClick={handleImageClick} className="absolute top-0.5 left-0.5 bg-gray-900/50 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500/50 cursor-pointer z-10">
                <MagnifyingGlassPlusIcon className="w-4 h-4 text-white" />
            </div>
        </div>
    );
};

export default ItemCard;