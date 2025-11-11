import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Item, PlayerCharacter, NPC, GameSettings, GameState, ImageCacheEntry } from '../types';
import Modal from './Modal';
import {
    AcademicCapIcon, 
    UserCircleIcon,
    ShieldCheckIcon,
    SparklesIcon,
    FingerPrintIcon,
    ArrowUturnLeftIcon,
    TrashIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowDownOnSquareIcon,
    ArrowUpOnSquareIcon,
    HeartIcon,
    BoltIcon,
    ScaleIcon,
    ChevronUpIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { ArrowsUpDownIcon, CheckIcon, ArchiveBoxIcon as ArchiveBoxSolidIcon } from '@heroicons/react/24/solid';
import ItemCard from './CharacterSheet/Shared/ItemCard';
import { useLocalization } from '../context/LocalizationContext';
import StatBar from './CharacterSheet/Shared/StatBar';

interface DragData {
    item: Item;
    isEquipped: boolean;
    isFromContainer: boolean;
}

interface InventoryManagerUIProps {
    character: PlayerCharacter | NPC;
    playerCharacter?: PlayerCharacter;
    isCompanionMode?: boolean;
    onEquip: (item: Item, slot: string) => void;
    onUnequip: (item: Item) => void;
    onDropItem: (item: Item) => void;
    onGiveItem?: (item: Item, quantity: number) => void;
    onMoveItem: (item: Item, containerId: string | null) => void;
    onSplitItem: (item: Item, quantity: number) => void;
    onMergeItems: (sourceItem: Item, targetItem: Item) => void;
    onOpenDetailModal: (title: string, data: any) => void;
    onOpenImageModal: (displayPrompt: string, originalTextPrompt: string, onClearCustom?: () => void, onUpload?: (base64: string) => void) => void;
    imageCache: Record<string, ImageCacheEntry>;
    onImageGenerated: (prompt: string, src: string, sourceProvider: ImageCacheEntry['sourceProvider'], sourceModel?: string) => void;
    updateItemSortOrder: (newOrder: string[]) => void;
    updateItemSortSettings: (criteria: PlayerCharacter['itemSortCriteria'], direction: PlayerCharacter['itemSortDirection']) => void;
    gameSettings: GameSettings | null;
    isLoading?: boolean;
}

const qualityOrder: Record<string, number> = {
    'Trash': 0, 'Common': 1, 'Uncommon': 2, 'Good': 3,
    'Rare': 4, 'Epic': 5, 'Legendary': 6, 'Unique': 7,
};

const EquipmentSlotComponent: React.FC<{
    slot: { id: string, label: string, icon: React.ElementType };
    item: Item | null;
    onEquip: (item: Item, slot: string) => void;
    gameSettings: GameSettings | null;
    imageCache: Record<string, ImageCacheEntry>;
    onImageGenerated: (prompt: string, src: string, sourceProvider: ImageCacheEntry['sourceProvider'], sourceModel?: string) => void;
    onOpenImageModal: (displayPrompt: string, originalTextPrompt: string, onClearCustom?: () => void, onUpload?: (base64: string) => void) => void;
    isLoading?: boolean;
}> = ({ slot, item, onEquip, gameSettings, imageCache, onImageGenerated, onOpenImageModal, isLoading }) => {
    const [isOver, setIsOver] = useState(false);
    const { t } = useLocalization();
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
            className={`w-20 h-20 border-2 border-dashed rounded-md flex flex-col items-center justify-center transition-colors ${isOver ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-600'}`}
        >
            {item ? (
                <div draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd} className="cursor-pointer">
                    <ItemCard item={item} gameSettings={gameSettings} imageCache={imageCache} onImageGenerated={onImageGenerated} onOpenImageModal={onOpenImageModal} gameIsLoading={isLoading} />
                </div>
            ) : (
                <div className="text-center text-gray-500 pointer-events-none">
                    <Icon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <div className="text-xs font-semibold opacity-60">{t(slot.label as any)}</div>
                </div>
            )}
        </div>
    );
};


// FIX: Export InventoryManagerUI to be used in other components.
export const InventoryManagerUI: React.FC<InventoryManagerUIProps> = ({
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
    updateItemSortSettings,
    gameSettings,
    isLoading
}) => {
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: Item } | null>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const [showEquipSubMenu, setShowEquipSubMenu] = useState(false);
    const submenuTimeoutRef = useRef<number | null>(null);

    const [viewingContainer, setViewingContainer] = useState<Item | null>(null);
    const [splitItem, setSplitItem] = useState<Item | null>(null);
    const [splitAmount, setSplitAmount] = useState('1');
    const { t } = useLocalization();
    
    const [isSorting, setIsSorting] = useState(false);
    const [localItems, setLocalItems] = useState<Item[]>([]);
    const dragItemIndex = useRef<number | null>(null);
    const dragOverItemIndex = useRef<number | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const [topPanelFlexBasis, setTopPanelFlexBasis] = useState('40%');
    const [isStatsVisible, setIsStatsVisible] = useState(true);

    const handleEquipSubMenuEnter = useCallback(() => {
        if (submenuTimeoutRef.current) {
            clearTimeout(submenuTimeoutRef.current);
        }
        setShowEquipSubMenu(true);
    }, []);

    const handleEquipSubMenuLeave = useCallback(() => {
        submenuTimeoutRef.current = window.setTimeout(() => {
            setShowEquipSubMenu(false);
        }, 200); // 200ms delay to allow moving to submenu
    }, []);


    const startResize = useCallback((mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        
        const onMouseMove = (mouseMoveEvent: MouseEvent) => {
            if (containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const containerHeight = containerRect.height - 8; // Account for resizer height
                const newTopHeight = mouseMoveEvent.clientY - containerRect.top;
                const newPercentage = (newTopHeight / containerHeight) * 100;
                const clampedPercentage = Math.max(15, Math.min(85, newPercentage));
                setTopPanelFlexBasis(`${clampedPercentage}%`);
            }
        };
    
        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, []);

    const { itemSortCriteria = 'manual', itemSortDirection = 'asc' } = character;

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
        setShowEquipSubMenu(false);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                closeContextMenu();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closeContextMenu]);

    const handleContextMenu = (e: React.MouseEvent, item: Item) => {
        e.preventDefault();
        setContextMenu({ x: e.pageX, y: e.pageY, item });
    };

    const handleEquip = (slot: string) => {
        if (!contextMenu) return;
        const { item } = contextMenu;
        onEquip(item, slot);
        closeContextMenu();
    };

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

    const ALL_SLOTS = useMemo(() => [
        { id: 'Underwear_Top', label: 'Underwear Top', icon: ArchiveBoxSolidIcon },
        { id: 'Head', label: 'Head', icon: AcademicCapIcon },
        { id: 'Accessory1', label: 'Accessory 1', icon: ArchiveBoxSolidIcon },
        { id: 'Underwear_Bottom', label: 'Underwear Bottom', icon: ArchiveBoxSolidIcon },
        { id: 'Neck', label: 'Neck', icon: ArchiveBoxSolidIcon },
        { id: 'Accessory4', label: 'Accessory 4', icon: ArchiveBoxSolidIcon },
        { id: 'Back', label: 'Back', icon: ArchiveBoxSolidIcon },
        { id: 'Chest', label: 'Chest', icon: UserCircleIcon },
        { id: 'Sigil', label: 'Sigil', icon: SparklesIcon },
        { id: 'Wrists', label: 'Wrists', icon: ArchiveBoxSolidIcon },
        { id: 'Waist', label: 'Waist', icon: ArchiveBoxSolidIcon },
        { id: 'Hands', label: 'Hands', icon: ArchiveBoxSolidIcon },
        { id: 'MainHand', label: 'Main Hand', icon: SparklesIcon },
        { id: 'Legs', label: 'Legs', icon: ArchiveBoxSolidIcon },
        { id: 'OffHand', label: 'Off Hand', icon: ShieldCheckIcon },
        { id: 'Finger1', label: 'Finger 1', icon: FingerPrintIcon },
        { id: 'Feet', label: 'Feet', icon: ArchiveBoxSolidIcon },
        { id: 'Finger2', label: 'Finger 2', icon: FingerPrintIcon },
        { id: 'Accessory2', label: 'Accessory 2', icon: ArchiveBoxSolidIcon },
        { id: 'Accessory3', label: 'Accessory 3', icon: ArchiveBoxSolidIcon }
    ], []);


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

        if (!viewingContainer) {
            return inventory.filter(item => !item.contentsPath && (!item.existedId || !equippedItemIds.has(item.existedId)));
        } else {
            const containerPath = viewingContainer.contentsPath ? [...viewingContainer.contentsPath, viewingContainer.name] : [viewingContainer.name];
            return inventory.filter(item => item.contentsPath?.join('/') === containerPath.join('/'));
        }
    }, [character.inventory, character.equippedItems, viewingContainer]);

    const sortedItems = useMemo(() => {
        const itemsToProcess = [...itemsInView];
        const { itemSortCriteria = 'manual', itemSortDirection = 'asc', itemSortOrder = [] } = character;
    
        let sortedList: Item[] = [];
    
        if (itemSortCriteria === 'manual') {
            if (itemSortOrder && itemSortOrder.length > 0) {
                const itemMap = new Map(itemsToProcess.map(item => [item.existedId, item]));
                const sorted = itemSortOrder
                    .map(id => itemMap.get(id!))
                    .filter((item): item is Item => !!item && itemsToProcess.some(i => i.existedId === item.existedId));
                const newItems = itemsToProcess.filter(item => !item.existedId || !itemSortOrder.includes(item.existedId));
                sortedList = [...sorted, ...newItems];
            } else {
                sortedList = itemsToProcess;
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
            sortedList = [...itemsToProcess].sort(sortFn);
        }
        
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
        const newOrder = _localItems.map(item => item.existedId).filter(Boolean) as string[];
        updateItemSortOrder(newOrder);
        if (itemSortCriteria !== 'manual') {
            updateItemSortSettings('manual', itemSortDirection);
        }
    };

    const handleSortToggle = () => {
        if (isSorting) {
            const newOrder = localItems.map(item => item.existedId).filter(Boolean) as string[];
            updateItemSortOrder(newOrder);
        } else {
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
                onMoveItem(data.item, null);
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

    const renderContextMenu = () => {
        if (!contextMenu) return null;
        const { item } = contextMenu;
        const isEquipped = item.existedId ? Object.values(character.equippedItems || {}).includes(item.existedId) : false;
        const canEquip = item.equipmentSlot && item.durability !== '0%';
        const isInsideContainer = item.contentsPath && item.contentsPath.length > 0;

        const handleUnequip = () => {
            onUnequip(item);
            closeContextMenu();
        };

        const handleDrop = () => {
            onDropItem(item);
            closeContextMenu();
        }

        const handleDetails = () => {
            const ownerInfo = isCompanionMode 
                ? { ownerType: 'npc', ownerId: 'NPCId' in character ? character.NPCId : '', isEquippedByOwner: isEquipped }
                : { ownerType: 'player', ownerId: (character as PlayerCharacter).playerId, isEquippedByOwner: isEquipped };
            onOpenDetailModal(t("Item: {name}", { name: item.name }), { ...item, ...ownerInfo });
            closeContextMenu();
        };

        const handleGive = (quantity: number) => {
            if (onGiveItem) {
                onGiveItem(item, quantity);
            }
            closeContextMenu();
        };
    
        const handleMoveToInventory = () => {
            if (!contextMenu) return;
            const { item } = contextMenu;
            onMoveItem(item, null);
            closeContextMenu();
        };

        return (
            <div ref={contextMenuRef} className="context-menu animate-fade-in-down-fast" style={{ top: contextMenu.y, left: contextMenu.x }}>
                <button onClick={handleDetails} className="context-menu-item">{t('Details')}</button>
                {isInsideContainer && (
                    <button onClick={handleMoveToInventory} className="context-menu-item">{t('Move to Inventory')}</button>
                )}
                {canEquip && !isEquipped && (
                    <div 
                        className="relative" 
                        onMouseEnter={handleEquipSubMenuEnter} 
                        onMouseLeave={handleEquipSubMenuLeave}
                    >
                        <div className="context-menu-item context-menu-item-with-submenu block w-full text-left cursor-default">
                            {t('Equip')}
                        </div>
                        {showEquipSubMenu && (
                            <div 
                                className="context-menu absolute left-full top-0 ml-1 z-10"
                                onMouseEnter={handleEquipSubMenuEnter}
                                onMouseLeave={handleEquipSubMenuLeave}
                            >
                                {(Array.isArray(item.equipmentSlot) ? item.equipmentSlot : [item.equipmentSlot]).map(slot => (
                                    slot && <button key={slot} onClick={() => handleEquip(slot)} className="context-menu-item">
                                        {t(slot as any)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {isEquipped && <button onClick={handleUnequip} className="context-menu-item">{t('Unequip')}</button>}
                {!isCompanionMode && <button onClick={handleDrop} className="context-menu-item">{t('Drop')}</button>}
                {isCompanionMode && onGiveItem && <button onClick={() => handleGive(item.count)} className="context-menu-item">{t('Take Stack')}</button>}
                {isCompanionMode && item.count > 1 && onGiveItem && <button onClick={() => handleGive(1)} className="context-menu-item">{t('Take')} 1</button>}
                {isCompanionMode && onGiveItem && (
                    <>
                        <div className="my-1 border-t border-gray-600" />
                        <button onClick={() => handleGive(item.count)} className="context-menu-item">{t('Give Stack')}</button>
                        {item.count > 1 && <button onClick={() => handleGive(1)} className="context-menu-item">{t('Give')} 1</button>}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="inventory-screen-layout">
            <div className="flex flex-col w-[500px] flex-shrink-0 gap-4">
                <h3 className="text-xl font-bold text-cyan-400 narrative-text text-center">{t('Equipment')}</h3>
                <div className="equipment-grid-layout">
                    {ALL_SLOTS.map(slot => (
                        <div key={slot.id} className={`slot-${slot.id}`}>
                            <EquipmentSlotComponent 
                                slot={slot} 
                                item={equippedItemsMap.get(slot.id) || null}
                                onEquip={onEquip}
                                gameSettings={gameSettings}
                                imageCache={imageCache}
                                onImageGenerated={onImageGenerated}
                                onOpenImageModal={onOpenImageModal}
                                isLoading={isLoading}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="inventory-panel" ref={containerRef}>
                {isCompanionMode ? (
                    <>
                        <div style={{ flex: `0 0 ${topPanelFlexBasis}` }} className="flex flex-col min-h-0 gap-4">
                            <h3 className="text-xl font-bold text-cyan-400 narrative-text text-center">{t('Carried Items')}</h3>
                             <div onDrop={handleDropOnInventory} onDragOver={allowDrop} className="inventory-scroll-container flex flex-col !p-0" style={{marginBottom: 0, marginTop: 0}}>
                                <div className="flex-1 p-4 overflow-y-auto">
                                    <div className="inventory-grid">{itemsToDisplay.map((item, index) => <div key={item.existedId} draggable={item.durability !== '0%'} onDragStart={(e) => handleItemDragStart(e, index, item)} onDragEnd={handleItemDragEnd} onDragEnter={isSorting ? () => (dragOverItemIndex.current = index) : undefined} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOnItem(e, item)} onClick={() => { if (isSorting) return; if (item.isContainer) { setViewingContainer(item); } else { const detailData = { ...item, ownerType: 'npc', ownerId: 'NPCId' in character ? character.NPCId : '', isEquippedByOwner: 'NPCId' in character ? Object.values(character.equippedItems || {}).includes(item.existedId) : false }; onOpenDetailModal(t("Item: {name}", { name: item.name }), detailData); } }} onContextMenu={(e) => handleContextMenu(e, item)} className={`${isSorting ? 'cursor-move' : 'cursor-pointer'}`}><ItemCard item={item} gameSettings={gameSettings} imageCache={imageCache} onImageGenerated={onImageGenerated} onOpenImageModal={onOpenImageModal} gameIsLoading={isLoading}/></div>)}</div>
                                    {itemsToDisplay.length === 0 && <p className="text-gray-500 text-center mt-16">{t('No carried items.')}</p>}
                                </div>
                                <div onDrop={handleDropOnDropZone} onDragOver={allowDrop} className={`p-4 mt-auto drop-zone`}>{React.createElement(dropZoneIcon, { className: "w-8 h-8 mx-auto mb-2" })}{dropZoneLabel}</div>
                            </div>
                        </div>

                        <div onMouseDown={startResize} className="inventory-resizer" />

                        <div style={{ flex: '1 1 0' }} className="flex flex-col min-h-0">
                            <h3 className="text-xl font-bold text-cyan-400 narrative-text my-4 text-center">{t("Your Inventory")}</h3>
                            <div className="inventory-scroll-container" style={{marginBottom: 0}}>
                                <div className="inventory-grid">
                                    {playerUnequippedInventory.map(item => (<div key={item.existedId} className="flex flex-col items-center justify-start gap-2">
                                        <div onContextMenu={(e) => handleContextMenu(e, item)}>
                                            <ItemCard item={item} gameSettings={gameSettings} imageCache={imageCache} onImageGenerated={onImageGenerated} onOpenImageModal={onOpenImageModal} gameIsLoading={isLoading} />
                                        </div>
                                        {onGiveItem && <button onClick={() => onGiveItem(item, item.count)} className="w-full flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-semibold rounded-md transition-colors bg-green-600/20 text-green-300 hover:bg-green-600/40" title={t('Give Item')}>
                                            <ArrowUpOnSquareIcon className="w-4 h-4" /><span>{t('Give Item')}</span>
                                        </button>}
                                    </div>))}
                                </div>
                                {playerUnequippedInventory.length === 0 && <p className="text-gray-500 text-center mt-16">{t('Your pockets are empty.')}</p>}
                            </div>
                        </div>
                    </>
                ) : (
                     <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-4 gap-4">
                            <h3 className="text-xl font-bold text-cyan-400 narrative-text truncate">
                                {viewingContainer ? viewingContainer.name : t('Your Inventory')}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <fieldset disabled={isSorting} className="flex items-center gap-2">
                                    <label htmlFor="sort-criteria" className="text-sm text-gray-400 flex-shrink-0">{t('Sort by:')}</label>
                                    <select id="sort-criteria" value={itemSortCriteria} onChange={(e) => updateItemSortSettings(e.target.value as any, itemSortDirection)} className="dark-select">
                                        <option value="manual">{t('Manual')}</option>
                                        <option value="name">{t('Name')}</option>
                                        <option value="quality">{t('Quality')}</option>
                                        <option value="weight">{t('Weight')}</option>
                                        <option value="price">{t('Price')}</option>
                                        <option value="type">{t('Type')}</option>
                                    </select>
                                    <button onClick={() => updateItemSortSettings(itemSortCriteria, itemSortDirection === 'asc' ? 'desc' : 'asc')} className="p-1.5 bg-gray-700/50 border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700" title={itemSortDirection === 'asc' ? t('Ascending') : t('Descending')}>
                                        {itemSortDirection === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                                    </button>
                                </fieldset>
                                <button onClick={handleSortToggle} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 rounded-md hover:bg-cyan-500/20 transition-colors">
                                    {isSorting ? <CheckIcon className="w-4 h-4" /> : <ArrowsUpDownIcon className="w-4 h-4" />}
                                    {isSorting ? t('Done') : t('Sort')}
                                </button>
                                {viewingContainer && <button onClick={() => setViewingContainer(null)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 rounded-md hover:bg-cyan-500/20 transition-colors"><ArrowUturnLeftIcon className="w-4 h-4" />{t('Back to Inventory')}</button>}
                            </div>
                        </div>
                        <div onDrop={handleDropOnInventory} onDragOver={allowDrop} className="inventory-scroll-container">
                            <div className="inventory-grid">{itemsToDisplay.map((item, index) => <div key={item.existedId} draggable={item.durability !== '0%'} onDragStart={(e) => handleItemDragStart(e, index, item)} onDragEnd={handleItemDragEnd} onDragEnter={isSorting ? () => (dragOverItemIndex.current = index) : undefined} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOnItem(e, item)} onClick={() => {if (isSorting) return; if (item.isContainer) {setViewingContainer(item);} else {onOpenDetailModal(t("Item: {name}", { name: item.name }), item);}}} onContextMenu={(e) => handleContextMenu(e, item)} className={`${isSorting ? 'cursor-move' : 'cursor-pointer'}`}><ItemCard item={item} gameSettings={gameSettings} imageCache={imageCache} onImageGenerated={onImageGenerated} onOpenImageModal={onOpenImageModal} gameIsLoading={isLoading}/></div>)}</div>{itemsToDisplay.length === 0 && <p className="text-gray-500 text-center mt-16">{t('Your pockets are empty.')}</p>}
                        </div>

                        <div className="character-stats-summary">
                            <button onClick={() => setIsStatsVisible(!isStatsVisible)} className="w-full flex justify-between items-center text-left font-semibold text-gray-300 mb-2">
                                {character.name}
                                {isStatsVisible ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                            </button>
                            {isStatsVisible && (
                                <div className="space-y-2 animate-fade-in-down-fast">
                                    <StatBar label={t('Health')} value={character.currentHealth} max={character.maxHealth} color="bg-red-500" icon={HeartIcon} character={character} />
                                    {'currentEnergy' in character && <StatBar label={t('Energy')} value={character.currentEnergy} max={character.maxEnergy} color="bg-blue-500" icon={BoltIcon} character={character} />}
                                    <StatBar label={t('Weight')} value={character.totalWeight!} max={character.maxWeight!} threshold={character.maxWeight} color="bg-orange-500" unit={t('kg_short')} icon={ScaleIcon} character={character} />
                                </div>
                            )}
                        </div>

                        <div onDrop={handleDropOnDropZone} onDragOver={allowDrop} className={`drop-zone`}>{React.createElement(dropZoneIcon, { className: "w-8 h-8 mx-auto mb-2" })}{dropZoneLabel}</div>
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
            {renderContextMenu()}
        </div>
    );
};

interface InventoryScreenProps {
    gameState: GameState;
    npc: NPC | null;
    onClose: () => void;
    
    // Player actions
    onEquip: (item: Item, slot: string) => void;
    onUnequip: (item: Item) => void;
    onDropItem: (item: Item) => void;
    onMoveItem: (item: Item, containerId: string | null) => void;
    onSplitItem: (item: Item, quantity: number) => void;
    onMergeItems: (sourceItem: Item, targetItem: Item) => void;
    
    // NPC-specific actions
    onTransferItem: (sourceType: 'player' | 'npc', targetType: 'player' | 'npc', npcId: string, item: Item, quantity: number) => void;
    onEquipItemForNpc: (npcId: string, item: Item, slot: string) => void;
    onUnequipItemForNpc: (npcId: string, item: Item) => void;
    onSplitItemForNpc: (npcId: string, item: Item, quantity: number) => void;
    onMergeItemsForNpc: (npcId: string, sourceItem: Item, targetItem: Item) => void;
    onMoveNpcItem: (npcId: string, item: Item, containerId: string | null) => void;

    // Common actions
    onOpenDetailModal: (title: string, data: any) => void;
    onOpenImageModal: (displayPrompt: string, originalTextPrompt: string, onClearCustom?: () => void, onUpload?: (base64: string) => void) => void;
    imageCache: Record<string, ImageCacheEntry>;
    onImageGenerated: (prompt: string, src: string, sourceProvider: ImageCacheEntry['sourceProvider'], sourceModel?: string) => void;
    
    // Sorting
    updateItemSortOrder: (newOrder: string[]) => void;
    updateItemSortSettings: (criteria: PlayerCharacter['itemSortCriteria'], direction: PlayerCharacter['itemSortDirection']) => void;
    updateNpcItemSortOrder: (npcId: string, newOrder: string[]) => void;
    updateNpcItemSortSettings: (npcId: string, criteria: PlayerCharacter['itemSortCriteria'], direction: PlayerCharacter['itemSortDirection']) => void;
    
    gameSettings: GameSettings | null;
    isLoading?: boolean;
}

export const InventoryScreen: React.FC<Partial<InventoryScreenProps>> = ({ 
    gameState, 
    npc,
    onClose, 
    gameSettings,
    onEquip,
    onUnequip,
    onDropItem,
    onMoveItem,
    onSplitItem,
    onMergeItems,
    onTransferItem,
    onEquipItemForNpc,
    onUnequipItemForNpc,
    onSplitItemForNpc,
    onMergeItemsForNpc,
    onMoveNpcItem,
    onOpenDetailModal,
    onOpenImageModal,
    imageCache,
    onImageGenerated,
    updateItemSortOrder,
    updateItemSortSettings,
    updateNpcItemSortOrder,
    updateNpcItemSortSettings,
    isLoading,
}) => {
    const { t } = useLocalization();
    
    if (!gameState || !onClose || !gameSettings) return null;

    const managerProps = {
        gameSettings,
        onOpenDetailModal: onOpenDetailModal!,
        onOpenImageModal: onOpenImageModal!,
        imageCache: imageCache!,
        onImageGenerated: onImageGenerated!,
        isLoading: isLoading,
    };

    if (npc) {
        // NPC Inventory management
        return (
            <Modal title={t("Inventory") + `: ${npc.name}`} isOpen={true} onClose={onClose} size="fullscreen">
                <InventoryManagerUI
                    {...managerProps}
                    character={npc}
                    playerCharacter={gameState.playerCharacter}
                    isCompanionMode={true}
                    onEquip={(item, slot) => onEquipItemForNpc!(npc.NPCId, item, slot)}
                    onUnequip={(item) => onUnequipItemForNpc!(npc.NPCId, item)}
                    onDropItem={(item) => onTransferItem!('npc', 'player', npc.NPCId, item, item.count)} // Take from NPC
                    onGiveItem={(item, quantity) => onTransferItem!('player', 'npc', npc.NPCId, item, quantity)} // Give to NPC
                    onMoveItem={(item, containerId) => onMoveNpcItem!(npc.NPCId, item, containerId)}
                    onSplitItem={(item, quantity) => onSplitItemForNpc!(npc.NPCId, item, quantity)}
                    onMergeItems={(source, target) => onMergeItemsForNpc!(npc.NPCId, source, target)}
                    updateItemSortOrder={(newOrder) => updateNpcItemSortOrder!(npc.NPCId, newOrder)}
                    updateItemSortSettings={(criteria, direction) => updateNpcItemSortSettings!(npc.NPCId, criteria, direction)}
                />
            </Modal>
        );
    }

    // Player Inventory management
    return (
        <Modal title={t("Inventory & Equipment")} isOpen={true} onClose={onClose} size="fullscreen">
            <InventoryManagerUI
                {...managerProps}
                character={gameState.playerCharacter}
                playerCharacter={gameState.playerCharacter}
                onEquip={onEquip!}
                onUnequip={onUnequip!}
                onDropItem={onDropItem!}
                onMoveItem={onMoveItem!}
                onSplitItem={onSplitItem!}
                onMergeItems={onMergeItems!}
                updateItemSortOrder={updateItemSortOrder!}
                updateItemSortSettings={updateItemSortSettings!}
            />
        </Modal>
    );
};