import React from 'react';
import { NPC, GameSettings } from '../../types';
import FateCardDetailsRenderer from '../DetailRenderer/Shared/FateCardDetailsRenderer';

interface FateViewProps {
    character: NPC;
    isPlayer: boolean;
    // FIX: Updated the onOpenImageModal signature to match the more detailed version used throughout the app.
    onOpenImageModal: (displayPrompt: string, originalTextPrompt: string, onClearCustom?: () => void, onUpload?: (base64: string) => void) => void;
    imageCache: Record<string, string>;
    onImageGenerated: (prompt: string, base64: string) => void;
    gameSettings: GameSettings | null;
}

const FateView: React.FC<FateViewProps> = ({
    character,
    isPlayer,
    onOpenImageModal,
    imageCache,
    onImageGenerated,
    gameSettings
}) => {
    if (isPlayer || !character.fateCards || character.fateCards.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {character.fateCards.map(card => {
                const openCardImageModal = () => {
                    if (onOpenImageModal) {
                        const prompt = card.image_prompt || `A detailed fantasy art image of a tarot card representing "${card.name}". ${card.description}`;
                        onOpenImageModal(prompt, card.image_prompt);
                    }
                };
                return (
                    <FateCardDetailsRenderer 
                        key={card.cardId} 
                        card={card}
                        onOpenImageModal={openCardImageModal}
                        imageCache={imageCache}
                        onImageGenerated={onImageGenerated}
                        model={gameSettings?.pollinationsImageModel}
                        gameSettings={gameSettings}
                    />
                );
            })}
        </div>
    );
}

export default FateView;