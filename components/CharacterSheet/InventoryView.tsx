import React, { useMemo } from 'react';
import { PlayerCharacter, NPC, Item, GameSettings, ImageCacheEntry } from '../../types';
import { useLocalization } from '../../context/LocalizationContext';
import ItemCard from './Shared/ItemCard';
import { ArchiveBoxIcon as ArchiveBoxSolidIcon } from '@heroicons/react/24/solid';
import { CheckIcon as CheckSolidIcon } from '@heroicons/react/24/solid';

const qualityOrder: Record<string, number> = {
    'Trash': 0, 'Common': 1, 'Uncommon': 2, 'Good': 3,
    'Rare': 4, 'Epic': 5, 'Legendary': 6, 'Unique': 7,
};

interface InventoryViewProps {
    character: PlayerCharacter | NPC;
    playerCharacter: PlayerCharacter;
    isPlayer: boolean;
    isCompanion: boolean;
    onOpenInventory: () => void;
    onOpenNpcInventory?: (npc: NPC) => void;
    equippedItemIds: Set<string | null>;
    onOpenDetailModal: (title: string, data: any) => void;
    gameSettings: any;
    imageCache: Record<string, ImageCacheEntry>;
    onImageGenerated: (prompt: string, src: string, sourceProvider: ImageCacheEntry['sourceProvider'], sourceModel?: string) => void;
    onOpenImageModal: (displayPrompt: string, originalTextPrompt: string, onClearCustom?: () => void, onUpload?: (base64: string) => void) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({
    character,
    isPlayer,
    isCompanion,
    onOpenInventory,
    onOpenNpcInventory,
    equippedItemIds,
    onOpenDetailModal,
    gameSettings,
    imageCache,
    onImageGenerated,
    onOpenImageModal
}) => {
    const { t } = useLocalization();

    const handleManageInventory = () => {
        if (isPlayer) {
            onOpenInventory();
        } else if (isCompanion && onOpenNpcInventory) {
            onOpenNpcInventory(character as NPC);
        }
    };

    const sortedInventoryList = useMemo(() => {
        if (!character.inventory) return [];
        const inventoryCopy: Item[] = JSON.parse(JSON.stringify(character.inventory));
        const rootItems = inventoryCopy.filter(item => item && !item.contentsPath);

        const { itemSortCriteria = 'manual', itemSortDirection = 'asc', itemSortOrder = [] } = character;

        let sortedRootItems: Item[] = [];

        if (itemSortCriteria === 'manual') {
            if (itemSortOrder && itemSortOrder.length > 0) {
                const itemMap = new Map(rootItems.map(item => [item.existedId, item]));
                const sorted = itemSortOrder
                    .map(id => itemMap.get(id!))
                    .filter((item): item is Item => !!item && rootItems.some(i => i.existedId === item.existedId));
                const newItems = rootItems.filter(item => !item.existedId || !itemSortOrder.includes(item.existedId));
                sortedRootItems = [...sorted, ...newItems];
            } else {
                sortedRootItems = rootItems;
            }
        } else { // Automatic sorting
            const sortFn = (a: Item, b: Item) => {
                let valA: string | number;
                let valB: string | number;

                switch (itemSortCriteria) {
                    case 'quality':
                        valA = qualityOrder[a.quality] ?? -1;
                        valB = qualityOrder[b.quality] ?? -1;
                        break;
                    case 'weight':
                        valA = (a.weight || 0) * (a.count || 1);
                        valB = (b.weight || 0) * (b.count || 1);
                        break;
                    case 'price':
                        valA = (a.price || 0) * (a.count || 1);
                        valB = (b.price || 0) * (b.count || 1);
                        break;
                    case 'type':
                        valA = (a.type || '').toLowerCase();
                        valB = (b.type || '').toLowerCase();
                        break;
                    default: // name
                        valA = (a.name || '').toLowerCase();
                        valB = (b.name || '').toLowerCase();
                        break;
                }

                let comparison = 0;
                if (typeof valA === 'string' && typeof valB === 'string') {
                    comparison = valA.localeCompare(valB);
                } else {
                    if (valA < valB) comparison = -1;
                    if (valA > valB) comparison = 1;
                }
                
                return itemSortDirection === 'asc' ? comparison : -comparison;
            };
            sortedRootItems = [...rootItems].sort(sortFn);
        }
        
        const equipped: Item[] = [];
        const unequipped: Item[] = [];
        for (const item of sortedRootItems) {
            if (item.existedId && equippedItemIds.has(item.existedId)) {
                equipped.push(item);
            } else {
                unequipped.push(item);
            }
        }
        
        return [...equipped, ...unequipped];

    }, [character, equippedItemIds]);
    
    const showManageInventoryButton = isPlayer || isCompanion;

    return (
        <div className="space-y-4">
            {showManageInventoryButton && (
                <button
                    onClick={handleManageInventory}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold text-cyan-200 bg-cyan-600/20 rounded-lg hover:bg-cyan-600/30 transition-colors border border-cyan-600/50"
                >
                    <ArchiveBoxSolidIcon className="w-6 h-6" />
                    {t('Manage Inventory')}
                </button>
            )}
          
            {sortedInventoryList.length > 0 ? (
                <div className="inventory-grid max-h-[calc(100vh-450px)] overflow-y-auto pr-2">
                    {sortedInventoryList.map((item) => {
                        const isEquipped = item.existedId ? equippedItemIds.has(item.existedId) : false;
                        return (
                            <button
                                key={item.existedId}
                                onClick={() => onOpenDetailModal(t("Item: {name}", { name: item.name }), {
                                    ...item,
                                    ownerType: isPlayer ? 'player' : 'npc',
                                    ownerId: isPlayer ? (character as PlayerCharacter).playerId : (character as NPC).NPCId,
                                    isEquippedByOwner: isEquipped,
                                })}
                                className="relative focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-lg transition-transform transform hover:z-10"
                            >
                                <ItemCard 
                                    item={item} 
                                    gameSettings={gameSettings}
                                    imageCache={imageCache}
                                    onImageGenerated={onImageGenerated}
                                    onOpenImageModal={onOpenImageModal}
                                />
                                {isEquipped && (
                                    <div className="absolute -top-1 -right-1 bg-cyan-500 rounded-full p-1 border-2 border-gray-800" title={t('Equipped')}>
                                        <CheckSolidIcon className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic text-center py-4">{t('Nothing carried.')}</p>
            )}
        </div>
    );
}

export default InventoryView;