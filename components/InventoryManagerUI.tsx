

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Item, PlayerCharacter, NPC } from '../types';
import Modal from './Modal';
import {
    AcademicCapIcon, 
    UserCircleIcon,
    ShieldCheckIcon,
    SparklesIcon,
    FingerPrintIcon,
    ArrowUturnLeftIcon,
    TrashIcon,
    MagnifyingGlassPlusIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ExclamationTriangleIcon,
    ArrowDownOnSquareIcon,
    ArrowUpOnSquareIcon
} from '@heroicons/react/24/outline';
import { ArchiveBoxIcon as ArchiveBoxSolidIcon, ArrowsUpDownIcon, CheckIcon } from '@heroicons/react/24/solid';
import ImageRenderer from './ImageRenderer';
import { useLocalization } from '../context/LocalizationContext';

const qualityColorMap: Record<string, string> = {
    'Trash': 'border-gray-700 hover:border-gray-500',
    'Common': 'border-gray-600 hover:border-gray-400',
    'Uncommon': 'border-green-800 hover:border-green-600',
    'Good': 'border-blue-800 hover:border-blue-600',
    'Rare': 'border-indigo-800 hover:border-indigo-600',
    'Epic': 'border-purple-800 hover:border-purple-600',
    'Legendary': 'border-orange-700 hover:border-orange-500',
    'Unique': 'border-yellow-700 hover:border-yellow-500',
};

interface DragData {
    item: Item;
    isEquipped: boolean;
    isFromContainer: boolean;
}

interface InventoryManagerUIProps {
    character: PlayerCharacter | NPC;
    playerCharacter?: PlayerCharacter; // Player, used when character is an NPC
    isCompanionMode?: boolean;
    onEquip: (item: Item, slot: string) => void;
    onUnequip: (item: Item) => void;
    onDropItem: (item: Item) => void; // For Player: drop. For NPC: take.
    onGiveItem?: (item: Item, quantity: number) => void;
    onMoveItem: (item: Item, containerId: string | null) => void;
    onSplitItem: (item: Item, quantity: number) => void;
    onMergeItems: (sourceItem: Item, targetItem: Item) => void;
    onOpenDetailModal: (title: string, data: any) => void;
    onOpenImageModal: (prompt: string) => void;
    imageCache: Record<string, string>;
    onImageGenerated: (prompt: string, base64: string) => void;
    updateItemSortOrder: (newOrder: string[]) => void;
    updateItemSortSettings: (criteria: PlayerCharacter['itemSortCriteria'], direction: PlayerCharacter['itemSortDirection']) => void;
}

const qualityOrder: Record<string, number> = {
    'Trash': 0, 'Common': 1, 'Uncommon': 2, 'Good': 3,
    'Rare': 4, 'Epic': 5, 'Legendary': 6, 'Unique': 7,
};

export default function InventoryManagerUI({ 
    character,
    playerCharacter,
    isCompanionMode = false,
    onEquip, 
    onUnequip, 
    onDropItem, 
    onGiveItem,
    onMoveItem, 
    onSplitItem, 
    onMergeItems, 
    onOpenDetailModal, 
    onOpenImageModal, 
    imageCache, 
    onImageGenerated, 
    updateItemSortOrder,
    updateItemSortSettings 
}: InventoryManagerUIProps) {
    const [viewingContainer, setViewingContainer] = useState<Item | null>(null);
    const [splitItem, setSplitItem] = useState<Item | null>(null);
    const [splitAmount, setSplitAmount] = useState('1');
    const { t } = useLocalization();
    
    const [isSorting, setIsSorting] = useState(false);
    const [localItems, setLocalItems] = useState<Item[]>([]);
    const dragItemIndex = useRef<number | null>(null);
    const dragOverItemIndex = useRef<number | null>(null);

    const { itemSortCriteria = 'manual', itemSortDirection = 'asc' } = character;

    const handleSplit = () => {
        if (!splitItem) return;
        const amount = parseInt(splitAmount, 10);
        if (!isNaN(amount) && amount > 0 && amount < splitItem.count) {
            onSplitItem(splitItem, amount);
        }
        setSplitItem(null);
        setSplitAmount('1');
    };

    const playerUnequippedInventory = useMemo(() => {
        if (!playerCharacter) return [];
        const equippedIds = new Set(Object.values(playerCharacter.equippedItems || {}).filter(Boolean));
        return playerCharacter.inventory.filter(item => !item.existedId || !equippedIds.has(item.existedId));
    }, [playerCharacter]);

    // Slot definition
    const EQUIPMENT_SLOTS = [
        { id: 'Head', label: 'Head', icon: AcademicCapIcon },
        { id: 'Neck', label: 'Neck', icon: ArchiveBoxSolidIcon },
        { id: 'Chest', label: 'Chest', icon: UserCircleIcon },
        { id: 'Back', label: 'Back', icon: ArchiveBoxSolidIcon },
        { id: 'MainHand', label: 'Main Hand', icon: SparklesIcon },
        { id: 'OffHand', label: 'Off Hand', icon: ShieldCheckIcon },
        { id: 'Hands', label: 'Hands', icon: ArchiveBoxSolidIcon },
        { id: 'Wrists', label: 'Wrists', icon: ArchiveBoxSolidIcon },
        { id: 'Waist', label: 'Waist', icon: ArchiveBoxSolidIcon },
        { id: 'Legs', label: 'Legs', icon: ArchiveBoxSolidIcon },
        { id: 'Feet', label: 'Feet', icon: ArchiveBoxSolidIcon },
        { id: 'Finger1', label: 'Finger 1', icon: FingerPrintIcon },
        { id: 'Finger2', label: 'Finger 2', icon: FingerPrintIcon },
    ];

    const isNpcItemEquipped = (itemId: string | null): boolean => {
        if (!isCompanionMode || !itemId) return false;
        const npc = character as NPC;
        return Object.values(npc.equippedItems || {}).includes(itemId);
    };

    const ItemCard = ({ item }: { item: Item }) => {
        const isBroken = item.durability === '0%';
        const imagePrompt = item.custom_image_prompt || item.image_prompt || `game asset, inventory icon, ${item.quality} ${item.name}, fantasy art, plain background`;

        const handleImageClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            onOpenImageModal(imagePrompt);
        };

        return (
            <div
                className={`w-20 h-20 bg-gray-900/50 rounded-md flex flex-col justify-center items-center border-2 ${qualityColorMap[item.quality] || 'border-gray-600'} shadow-lg transition-all relative group overflow-hidden ${isBroken ? '' : 'hover:shadow-cyan-500/20 hover:scale-105'}`}
                title={isBroken ? t("This item is broken and cannot be equipped.") : (typeof item.name === 'string' ? item.name : '')}
            >
                <ImageRenderer prompt={imagePrompt} alt={item.name} className={`absolute inset-0 w-full h-full object-cover ${isBroken ? 'filter grayscale brightness-50' : ''}`} imageCache={imageCache} onImageGenerated={onImageGenerated} />
                 {isBroken && (
                    <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center pointer-events-none">
                        <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
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
                <div onClick={handleImageClick} className="absolute top-1 left-1 bg-gray-900/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500/50 cursor-pointer">
                    <MagnifyingGlassPlusIcon className="w-4 h-4 text-white" />
                </div>
            </div>
        );
    };
    
    const EquipmentSlotComponent = ({ slot, item }: { slot: { id: string, label: string, icon: React.ElementType }, item: Item | null }) => {
        const [isOver, setIsOver] = useState(false);
        const Icon = slot.icon;
    
        const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            try {
                const data: DragData = JSON.parse(e.dataTransfer.getData('application/json'));
                if (data.isEquipped || data.item.durability === '0%') return;
                const validSlots = Array.isArray(data.item.equipmentSlot) ? data.item.equipmentSlot : [data.item.equipmentSlot];
                if (validSlots.includes(slot.id)) {
                  setIsOver(true);
                }
            } catch(e) {}
        };
        const handleDragLeave = () => setIsOver(false);
    
        const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsOver(false);
            try {
                const data: DragData = JSON.parse(e.dataTransfer.getData('application/json'));
                if (!data.isEquipped && data.item.durability !== '0%') {
                    const validSlots = Array.isArray(data.item.equipmentSlot) ? data.item.equipmentSlot : [data.item.equipmentSlot];
                    if (validSlots.includes(slot.id)) {
                        onEquip(data.item, slot.id);
                    }
                }
            } catch(e) {
                console.error("Failed to parse dropped item data:", e);
            }
        };
        
        const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
            if (!item) return;
            const dragData: DragData = { item, isEquipped: true, isFromContainer: false };
            e.dataTransfer.setData('application/json', JSON.stringify(dragData));
            e.currentTarget.style.opacity = '0.4';
        };
        
        const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
            e.currentTarget.style.opacity = '1';
        };
    
        return (
            <div 
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`w-24 h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center transition-colors ${isOver ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-600'}`}
            >
                {item ? (
                    <div draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd} className="cursor-pointer">
                        <ItemCard item={item} />
                    </div>
                ) : (
                    <div className="text-center text-gray-500 pointer-events-none">
                        <Icon className="w-8 h-8 mx-auto mb-1" />
                        <div className="text-xs font-semibold">{t(slot.label as any)}</div>
                    </div>
                )}
            </div>
        );
    };

    const equippedItemsMap = useMemo(() => {
        const map = new Map<string, Item>();
        Object.entries(character.equippedItems || {}).forEach(([slot, itemId]) => {
            if (itemId) {
                const item = character.inventory?.find(i => i.existedId === itemId);
                if (item) map.set(slot, item);
            }
        });
        return map;
    }, [character.equippedItems, character.inventory]);

    const itemsInView = useMemo(() => {
        const inventory = character.inventory || [];
        const equippedItemIds = new Set(Object.values(character.equippedItems || {}).filter(Boolean));

        if (!viewingContainer) { // Root inventory view
            // Filter for items that are at the root AND are not currently equipped.
            return inventory.filter(item => !item.contentsPath && (!item.existedId || !equippedItemIds.has(item.existedId)));
        } else { // Viewing a container
            // Items inside containers are never considered equipped, so we just filter by path.
            const containerPath = viewingContainer.contentsPath ? [...viewingContainer.contentsPath, viewingContainer.name] : [viewingContainer.name];
            return inventory.filter(item => item.contentsPath?.join('/') === containerPath.join('/'));
        }
    }, [character.inventory, character.equippedItems, viewingContainer]);

    const sortedItems = useMemo(() => {
        const itemsToProcess = [...itemsInView];
        const { itemSortCriteria = 'manual', itemSortDirection = 'asc', itemSortOrder = [] } = character;
    
        let sortedList: Item[] = [];
    
        // Step 1: Apply sorting to the entire list of items in view
        if (itemSortCriteria === 'manual') {
            if (itemSortOrder && itemSortOrder.length > 0) {
                const itemMap = new Map(itemsToProcess.map(item => [item.existedId, item]));
                const sorted = itemSortOrder.map(id => itemMap.get(id!))
                    .filter((item): item is Item => !!item && itemsToProcess.some(i => i.existedId === item.existedId));
                const newItems = itemsToProcess.filter(item => item.existedId && !itemSortOrder.includes(item.existedId));
                sortedList = [...sorted, ...newItems];
            } else {
                sortedList = itemsToProcess; // If manual but no order, keep as is
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
    
            const containers = itemsToProcess.filter(i => i.isContainer);
            const normalItems = itemsToProcess.filter(i => !i.isContainer);
            sortedList = [...containers.sort(sortFn), ...normalItems.sort(sortFn)];
        }
    
        // Step 2: Bubble equipped items to the top, preserving their relative sorted order
        const equippedItemIds = new Set(Object.values(character.equippedItems || {}).filter(id => id !== null));
        const equippedItems: Item[] = [];
        const unequippedItems: Item[] = [];
    
        sortedList.forEach(item => {
            if (item && item.existedId && equippedItemIds.has(item.existedId)) {
                equippedItems.push(item);
            } else if (item) {
                unequippedItems.push(item);
            }
        });
        
        return [...equippedItems, ...unequippedItems];
    
    }, [itemsInView, itemSortCriteria, itemSortDirection, character.itemSortOrder, character.equippedItems]);

    useEffect(() => {
        setLocalItems(sortedItems);
    }, [sortedItems]);
    
    const handleSortDragEnd = () => {
        if (dragItemIndex.current === null || dragOverItemIndex.current === null) return;
        let _localItems = [...localItems];
        const draggedItemContent = _localItems.splice(dragItemIndex.current, 1)[0];
        _localItems.splice(dragOverItemIndex.current, 0, draggedItemContent);
        dragItemIndex.current = null;
        dragOverItemIndex.current = null;
        setLocalItems(_localItems);
        // Immediately persist the new manual order and criteria
        const newOrder = _localItems.map(item => item.existedId).filter(Boolean) as string[];
        updateItemSortOrder(newOrder);
        if (itemSortCriteria !== 'manual') {
            updateItemSortSettings('manual', itemSortDirection);
        }
    };

    const handleSortToggle = () => {
        if (isSorting) { // Finishing sort
            const newOrder = localItems.map(item => item.existedId).filter(Boolean) as string[];
            updateItemSortOrder(newOrder);
        } else { // Starting sort
            if (itemSortCriteria !== 'manual') {
                updateItemSortSettings('manual', itemSortDirection);
            }
        }
        setIsSorting(!isSorting);
    };
    
    const handleDropOnInventory = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        try {
            const data: DragData = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.isEquipped) {
                onUnequip(data.item);
            } else if (data.isFromContainer) {
                onMoveItem(data.item, null); // Move to root
            }
        } catch(err) {}
    };

    const handleDropOnDropZone = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
         try {
            const data: DragData = JSON.parse(e.dataTransfer.getData('application/json'));
            onDropItem(data.item);
        } catch(err) {}
    };
    
    const handleDropOnItem = (e: React.DragEvent<HTMLDivElement>, targetItem: Item) => {
        if (isSorting) return;
        e.preventDefault();
        e.stopPropagation();
        try {
            const data: DragData = JSON.parse(e.dataTransfer.getData('application/json'));
            const droppedItem = data.item;

            if (targetItem.isContainer && droppedItem.existedId !== targetItem.existedId) {
                onMoveItem(droppedItem, targetItem.existedId!);
            } else {
                const canMerge = droppedItem.name === targetItem.name &&
                    !droppedItem.equipmentSlot && !targetItem.equipmentSlot &&
                    (droppedItem.resource === undefined || 
                        (droppedItem.resource === droppedItem.maximumResource && targetItem.resource === targetItem.maximumResource)
                    );
                
                if (canMerge && droppedItem.existedId !== targetItem.existedId) {
                    onMergeItems(droppedItem, targetItem);
                }
            }
        } catch(err) {}
    };

    const handleItemDragStart = (e: React.DragEvent<HTMLDivElement>, index: number, item: Item) => {
        if (isSorting) {
            dragItemIndex.current = index;
        } else {
            if (item.durability === '0%') { e.preventDefault(); return; }
            const dragData: DragData = { item, isEquipped: false, isFromContainer: !!viewingContainer };
            e.dataTransfer.setData('application/json', JSON.stringify(dragData));
            e.currentTarget.style.opacity = '0.4';
        }
    };
    
    const handleItemDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (isSorting) {
            handleSortDragEnd();
        } else {
            e.currentTarget.style.opacity = '1';
        }
    };

    const allowDrop = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    const itemsToDisplay = isSorting ? localItems : sortedItems;
    const dropZoneLabel = isCompanionMode ? t('Take Item') : t('Drag here to drop item');
    const dropZoneIcon = isCompanionMode ? ArrowDownOnSquareIcon : TrashIcon;

    return (
        <div className={`flex flex-col md:flex-row gap-8 ${isCompanionMode ? 'h-[80vh]' : 'h-[70vh]'}`}>
            {/* Equipment Panel */}
            <div className="flex-shrink-0 w-full md:w-auto text-center">
                <h3 className="text-xl font-bold text-cyan-400 mb-4 narrative-text">{t('Equipment')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 justify-items-center">
                    {EQUIPMENT_SLOTS.map(slot => (
                        <EquipmentSlotComponent 
                            key={slot.id} 
                            slot={slot} 
                            item={equippedItemsMap.get(slot.id) || null}
                        />
                    ))}
                </div>
            </div>
            
            {/* Inventory Panel */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h3 className="text-xl font-bold text-cyan-400 narrative-text">
                        {viewingContainer ? viewingContainer.name : (isCompanionMode ? t('Carried Items') : t('Inventory'))}
                    </h3>
                     <div className="flex items-center gap-2">
                        <fieldset disabled={isSorting} className="flex items-center gap-2">
                            <label htmlFor="sort-criteria" className="text-sm text-gray-400 flex-shrink-0">{t('Sort by:')}</label>
                            <select
                                id="sort-criteria"
                                value={itemSortCriteria}
                                onChange={(e) => {
                                    const newCriteria = e.target.value as typeof itemSortCriteria;
                                    updateItemSortSettings(newCriteria, itemSortDirection);
                                    if (newCriteria !== 'manual') {
                                        setIsSorting(false);
                                    }
                                }}
                                className="bg-gray-700/50 border border-gray-600 rounded-md py-1 px-2 text-xs text-gray-200 focus:ring-1 focus:ring-cyan-500 transition"
                            >
                                <option value="manual">{t('Manual')}</option>
                                <option value="name">{t('Name')}</option>
                                <option value="quality">{t('Quality')}</option>
                                <option value="weight">{t('Weight')}</option>
                                <option value="price">{t('Price')}</option>
                                <option value="type">{t('Type')}</option>
                            </select>
                            <button
                                onClick={() => updateItemSortSettings(itemSortCriteria, itemSortDirection === 'asc' ? 'desc' : 'asc')}
                                className="p-1 bg-gray-700/50 border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
                                title={itemSortDirection === 'asc' ? t('Ascending') : t('Descending')}
                            >
                                {itemSortDirection === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                            </button>
                        </fieldset>
                         <button
                            onClick={handleSortToggle}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 rounded-md hover:bg-cyan-500/20 transition-colors"
                        >
                            {isSorting ? <CheckIcon className="w-4 h-4" /> : <ArrowsUpDownIcon className="w-4 h-4" />}
                            {isSorting ? t('Done') : t('Sort')}
                        </button>
                        {viewingContainer && (
                            <button onClick={() => setViewingContainer(null)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 rounded-md hover:bg-cyan-500/20 transition-colors">
                                <ArrowUturnLeftIcon className="w-4 h-4" />
                                {t('Back to Inventory')}
                            </button>
                        )}
                    </div>
                </div>
                <div 
                    onDrop={handleDropOnInventory}
                    onDragOver={allowDrop}
                    className="flex-1 bg-gray-900/30 p-4 rounded-lg overflow-y-auto flex flex-col"
                >
                   <div className="flex-1">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {itemsToDisplay.map((item, index) => (
                                <div
                                    key={item.existedId}
                                    draggable={item.durability !== '0%'}
                                    onDragStart={(e) => handleItemDragStart(e, index, item)}
                                    onDragEnd={handleItemDragEnd}
                                    onDragEnter={isSorting ? () => (dragOverItemIndex.current = index) : undefined}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDropOnItem(e, item)}
                                    onClick={() => {
                                        if (isSorting) return;
                                        if (item.isContainer) {
                                            setViewingContainer(item);
                                        } else {
                                            const detailData = (isCompanionMode && 'NPCId' in character)
                                                ? { ...item, ownerType: 'npc', ownerId: character.NPCId, isEquippedByOwner: isNpcItemEquipped(item.existedId) }
                                                : item;
                                            onOpenDetailModal(t("Item: {name}", { name: item.name }), detailData);
                                        }
                                    }}
                                    onContextMenu={(e) => { e.preventDefault(); if (!isSorting && item.count > 1) { setSplitItem(item); setSplitAmount('1'); } }}
                                    className={`${isSorting ? 'cursor-move' : 'cursor-pointer'}`}
                                >
                                    <ItemCard item={item} />
                                </div>
                            ))}
                        </div>
                        {itemsToDisplay.length === 0 && <p className="text-gray-500 text-center mt-16">{isCompanionMode ? t('No carried items.') : t('Your pockets are empty.')}</p>}
                   </div>
                   <div 
                        onDrop={handleDropOnDropZone} 
                        onDragOver={allowDrop}
                        className={`mt-4 p-4 border-2 border-dashed rounded-lg text-center ${isCompanionMode ? 'border-green-800/50 text-green-400/70' : 'border-red-800/50 text-red-400/70'}`}
                   >
                        {React.createElement(dropZoneIcon, { className: "w-8 h-8 mx-auto mb-2" })}
                        {dropZoneLabel}
                   </div>
                </div>
                 {isCompanionMode && playerCharacter && (
                    <div className="mt-4 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-cyan-400 narrative-text mb-4">{t("Your Inventory")}</h3>
                        <div className="flex-1 bg-gray-900/30 p-4 rounded-lg overflow-y-auto">
                           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {playerUnequippedInventory.map(item => (
                                    <div key={item.existedId} className="flex flex-col gap-2">
                                        <ItemCard item={item} />
                                        <button 
                                            onClick={() => onGiveItem?.(item, item.count)}
                                            className="w-full flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-semibold rounded-md transition-colors bg-green-600/20 text-green-300 hover:bg-green-600/40"
                                            title={t('Give Item')}
                                        >
                                            <ArrowUpOnSquareIcon className="w-4 h-4" />
                                            <span>{t('Give Item')}</span>
                                        </button>
                                    </div>
                                ))}
                           </div>
                           {playerUnequippedInventory.length === 0 && <p className="text-gray-500 text-center mt-16">{t('Your pockets are empty.')}</p>}
                        </div>
                    </div>
                )}
            </div>
            {splitItem && (
                <Modal isOpen={!!splitItem} onClose={() => setSplitItem(null)} title={`${t('Split Stack')}: ${splitItem.name}`}>
                    <div className="space-y-4">
                        <label htmlFor="split-amount" className="block text-sm font-medium text-gray-300">
                            {t('Amount to split off (1 - {max})', { max: splitItem.count - 1 })}
                        </label>
                        <input
                            id="split-amount"
                            type="number"
                            value={splitAmount}
                            onChange={(e) => setSplitAmount(e.target.value)}
                            min="1"
                            max={splitItem.count - 1}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition"
                            autoFocus
                        />
                        <button onClick={handleSplit} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-all">
                            {t('Split')}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
