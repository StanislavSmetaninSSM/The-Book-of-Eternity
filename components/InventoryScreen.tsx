import React from 'react';
import { GameState, Item, PlayerCharacter, GameSettings } from '../types';
import Modal from './Modal';
import { useLocalization } from '../context/LocalizationContext';
import InventoryManagerUI from './InventoryManagerUI';

interface InventoryScreenProps {
    gameState: GameState;
    onClose: () => void;
    onEquip: (item: Item, slot: string) => void;
    onUnequip: (item: Item) => void;
    onDropItem: (item: Item) => void;
    onMoveItem: (item: Item, containerId: string | null) => void;
    onSplitItem: (item: Item, quantity: number) => void;
    onMergeItems: (sourceItem: Item, targetItem: Item) => void;
    onOpenDetailModal: (title: string, data: any) => void;
    onOpenImageModal: (prompt: string) => void;
    imageCache: Record<string, string>;
    onImageGenerated: (prompt: string, base64: string) => void;
    updateItemSortOrder: (newOrder: string[]) => void;
    updateItemSortSettings: (criteria: PlayerCharacter['itemSortCriteria'], direction: PlayerCharacter['itemSortDirection']) => void;
    gameSettings: GameSettings | null;
}

export default function InventoryScreen({ 
    gameState, 
    onClose, 
    gameSettings,
    ...handlers 
}: InventoryScreenProps) {
    const { t } = useLocalization();

    return (
        <Modal title={t("Inventory & Equipment")} isOpen={true} onClose={onClose}>
            <InventoryManagerUI
                character={gameState.playerCharacter}
                gameSettings={gameSettings}
                {...handlers}
            />
        </Modal>
    );
}