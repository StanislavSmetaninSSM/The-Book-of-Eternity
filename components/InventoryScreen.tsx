
import React, { useState, useMemo } from 'react';
import { GameState, Item } from '../types';
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
    ArrowDownIcon
} from '@heroicons/react/24/outline';
import { ArchiveBoxIcon as ArchiveBoxSolidIcon } from '@heroicons/react/24/solid';
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

interface InventoryScreenProps {
    gameState: GameState;
    onClose: () => void;
    onEquip: (item: Item, slot: string) => void;
    onUnequip: (item: Item) => void;
    onDropItem: (item: Item) => void;
    onMoveItem: (item: Item, containerId: string | null) => void;
    onOpenDetailModal: (title: string, data: any) => void;
    onOpenImageModal: (prompt: string) => void;
}

const qualityOrder: Record<string, number> = {
    'Trash': 0, 'Common': 1, 'Uncommon': 2, 'Good': 3,
    'Rare': 4, 'Epic': 5, 'Legendary': 6, 'Unique': 7,
};

export default function InventoryScreen({ gameState, onClose, onEquip, onUnequip, onDropItem, onMoveItem, onOpenDetailModal, onOpenImageModal }: InventoryScreenProps) {
    const { playerCharacter } = gameState;
    const [viewingContainer, setViewingContainer] = useState<Item | null>(null);
    const [sortCriteria, setSortCriteria] = useState<'name' | 'quality' | 'weight' | 'price' | 'type'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const { t } = useLocalization();

    // Slot definition
    const EQUIPMENT_SLOTS = [
        { id: 'Head', label: 'Head', icon: AcademicCapIcon },
        { id: 'Neck', label: 'Neck', icon: ArchiveBoxSolidIcon },
        { id: 'Chest', label: 'Chest', icon: UserCircleIcon },
        { id: 'Back', label: 'Back', icon: ArchiveBoxSolidIcon },
        { id: 'MainHand', label: 'Main Hand', icon: SparklesIcon },
        { id: 'OffHand', label: 'Off Hand', icon: ShieldCheckIcon },
        { id: 'Hands', label: 'Hands', icon: ArchiveBoxSolidIcon },
        { id: 'Waist', label: 'Waist', icon: ArchiveBoxSolidIcon },
        { id: 'Legs', label: 'Legs', icon: ArchiveBoxSolidIcon },
        { id: 'Feet', label: 'Feet', icon: ArchiveBoxSolidIcon },
        { id: 'Finger1', label: 'Finger 1', icon: FingerPrintIcon },
        { id: 'Finger2', label: 'Finger 2', icon: FingerPrintIcon },
    ];

    const DraggableItem = ({ item, isEquipped = false, isFromContainer = false }: { item: Item; isEquipped?: boolean; isFromContainer?: boolean }) => {
        const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
            const dragData: DragData = { item, isEquipped, isFromContainer };
            e.dataTransfer.setData('application/json', JSON.stringify(dragData));
            e.currentTarget.style.opacity = '0.4';
        };
        const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
            e.currentTarget.style.opacity = '1';
        };

        const handleClick = () => {
            onOpenDetailModal(t("Item: {name}", { name: item.name }), item);
        };
        
        const imagePrompt = item.image_prompt || `game asset, inventory icon, ${item.quality} ${item.name}, fantasy art, plain background`;

        const handleImageClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            onOpenImageModal(imagePrompt);
        };
    
        return (
            <div
                onClick={handleClick}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className={`w-20 h-20 bg-gray-900/50 rounded-md flex flex-col justify-center items-center cursor-pointer border-2 ${qualityColorMap[item.quality] || 'border-gray-600'} shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all relative group overflow-hidden`}
                title={item.name}
            >
                <ImageRenderer prompt={imagePrompt} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-center">
                    <p className="text-xs text-white line-clamp-1 font-semibold">{item.name}</p>
                </div>
                {item.count > 1 && <div className="absolute top-1 right-1 text-xs bg-gray-900/80 px-1.5 py-0.5 rounded-full font-mono text-white">{item.count}</div>}
                {item.resource !== undefined && item.maximumResource !== undefined && (
                    <div className="absolute bottom-1 left-1 text-xs bg-cyan-700/90 px-1.5 py-0.5 rounded-full font-mono text-white border border-cyan-400/50">
                        {item.resource}/{item.maximumResource}
                    </div>
                )}
                <div onClick={handleImageClick} className="absolute top-1 left-1 bg-gray-900/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500/50">
                    <MagnifyingGlassPlusIcon className="w-4 h-4 text-white" />
                </div>
            </div>
        );
    };
    
    const EquipmentSlotComponent = ({ slot, item, onDrop }: { slot: { id: string, label: string, icon: React.ElementType }, item: Item | null, onDrop: (item: Item, slotId: string) => void }) => {
        const [isOver, setIsOver] = useState(false);
        const Icon = slot.icon;
    
        const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            try {
                const data: DragData = JSON.parse(e.dataTransfer.getData('application/json'));
                if (data.isEquipped) return;
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
                if (!data.isEquipped) {
                    const validSlots = Array.isArray(data.item.equipmentSlot) ? data.item.equipmentSlot : [data.item.equipmentSlot];
                    if (validSlots.includes(slot.id)) {
                        onDrop(data.item, slot.id);
                    }
                }
            } catch(e) {
                console.error("Failed to parse dropped item data:", e);
            }
        };
    
        return (
            <div 
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`w-24 h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center transition-colors ${isOver ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-600'}`}
            >
                {item ? <DraggableItem item={item} isEquipped={true} /> : (
                    <div className="text-center text-gray-500 pointer-events-none">
                        <Icon className="w-8 h-8 mx-auto mb-1" />
                        <div className="text-xs font-semibold">{t(slot.label)}</div>
                    </div>
                )}
            </div>
        );
    };

    const equippedItemsMap = useMemo(() => {
        const map = new Map<string, Item>();
        Object.entries(playerCharacter.equippedItems).forEach(([slot, itemId]) => {
            if (itemId) {
                const item = playerCharacter.inventory.find(i => i.existedId === itemId);
                if (item) map.set(slot, item);
            }
        });
        return map;
    }, [playerCharacter.equippedItems, playerCharacter.inventory]);

    const itemsInView = useMemo(() => {
        const equippedIds = new Set(Object.values(playerCharacter.equippedItems));
        const unequipped = playerCharacter.inventory.filter(item => item.existedId && !equippedIds.has(item.existedId));

        if (!viewingContainer) { // Root inventory
            return unequipped.filter(item => !item.contentsPath);
        } else { // Viewing a container
            const containerPath = viewingContainer.contentsPath ? [...viewingContainer.contentsPath, viewingContainer.name] : [viewingContainer.name];
            return unequipped.filter(item => item.contentsPath?.join('/') === containerPath.join('/'));
        }
    }, [playerCharacter.inventory, playerCharacter.equippedItems, viewingContainer]);
    
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
    
    const allowDrop = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    const sortItems = (items: Item[]) => {
        const itemsToSort = [...items];
        itemsToSort.sort((a, b) => {
            let valA: string | number;
            let valB: string | number;

            switch (sortCriteria) {
                case 'quality':
                    valA = qualityOrder[a.quality] ?? -1;
                    valB = qualityOrder[b.quality] ?? -1;
                    break;
                case 'weight':
                    valA = a.weight * a.count;
                    valB = b.weight * b.count;
                    break;
                case 'price':
                    valA = a.price * a.count;
                    valB = b.price * b.count;
                    break;
                case 'type':
                    valA = a.type || 'zzzz'; // Push undefined types to the end
                    valB = b.type || 'zzzz';
                    break;
                default: // name
                    valA = a.name;
                    valB = b.name;
                    break;
            }

            let comparison = 0;
            if (typeof valA === 'string' && typeof valB === 'string') {
                comparison = valA.localeCompare(valB);
            } else {
                if (valA < valB) comparison = -1;
                if (valA > valB) comparison = 1;
            }
            
            return sortDirection === 'asc' ? comparison : -comparison;
        });
        return itemsToSort;
    };

    const normalItemsInView = useMemo(() => itemsInView.filter(i => !i.isContainer), [itemsInView]);
    const containersInView = useMemo(() => itemsInView.filter(i => i.isContainer), [itemsInView]);

    const sortedNormalItemsInView = useMemo(() => sortItems(normalItemsInView), [normalItemsInView, sortCriteria, sortDirection]);
    const sortedContainersInView = useMemo(() => sortItems(containersInView), [containersInView, sortCriteria, sortDirection]);

    return (
        <Modal title={t("Inventory & Equipment")} isOpen={true} onClose={onClose}>
            <div className="flex flex-col md:flex-row gap-8 h-[70vh]">
                {/* Equipment Panel */}
                <div className="flex-shrink-0 w-full md:w-auto text-center">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 narrative-text">{t('Equipment')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 justify-items-center">
                        {EQUIPMENT_SLOTS.map(slot => (
                            <EquipmentSlotComponent 
                                key={slot.id} 
                                slot={slot} 
                                item={equippedItemsMap.get(slot.id) || null}
                                onDrop={onEquip}
                            />
                        ))}
                    </div>
                </div>
                
                {/* Inventory Panel */}
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h3 className="text-xl font-bold text-cyan-400 narrative-text">
                            {viewingContainer ? viewingContainer.name : t('Inventory')}
                        </h3>
                         <div className="flex items-center gap-2">
                            <label htmlFor="sort-criteria" className="text-sm text-gray-400 flex-shrink-0">{t('Sort by:')}</label>
                            <select
                                id="sort-criteria"
                                value={sortCriteria}
                                onChange={(e) => setSortCriteria(e.target.value as any)}
                                className="bg-gray-700/50 border border-gray-600 rounded-md py-1 px-2 text-xs text-gray-200 focus:ring-1 focus:ring-cyan-500 transition"
                            >
                                <option value="name">{t('Name')}</option>
                                <option value="quality">{t('Quality')}</option>
                                <option value="weight">{t('Weight')}</option>
                                <option value="price">{t('Price')}</option>
                                <option value="type">{t('Type')}</option>
                            </select>
                            <button
                                onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
                                className="p-1 bg-gray-700/50 border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
                                title={sortDirection === 'asc' ? t('Ascending') : t('Descending')}
                            >
                                {sortDirection === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
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
                                {sortedContainersInView.map(item => (
                                    item.existedId ? <ContainerItem key={item.existedId} item={item} onClick={() => setViewingContainer(item)} onDrop={(droppedItem) => onMoveItem(droppedItem, item.existedId)} onOpenImageModal={onOpenImageModal} /> : null
                                ))}
                                {sortedNormalItemsInView.map(item => (
                                    item.existedId ? <DraggableItem key={item.existedId} item={item} isFromContainer={!!viewingContainer} /> : null
                                ))}
                            </div>
                            {itemsInView.length === 0 && <p className="text-gray-500 text-center mt-16">{t('This space is empty.')}</p>}
                       </div>
                       <div 
                        onDrop={handleDropOnDropZone} 
                        onDragOver={allowDrop}
                        className="mt-4 p-4 border-2 border-dashed border-red-800/50 rounded-lg text-center text-red-400/70"
                       >
                            <TrashIcon className="w-8 h-8 mx-auto mb-2" />
                            {t('Drag here to drop item')}
                       </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

const ContainerItem = ({ item, onClick, onDrop, onOpenImageModal }: { item: Item, onClick: () => void, onDrop: (droppedItem: Item) => void, onOpenImageModal: (prompt: string) => void }) => {
    const [isOver, setIsOver] = useState(false);
    const { t } = useLocalization();
    const imagePrompt = item.image_prompt || `game asset, inventory icon, ${item.quality} ${item.name}, fantasy art, plain background`;

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };
    const handleDragLeave = () => setIsOver(false);
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        try {
            const data: DragData = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.item.existedId !== item.existedId) { // Can't drop a container in itself
                onDrop(data.item);
            }
        } catch (err) {}
    };
    
    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenImageModal(imagePrompt);
    };

    return (
        <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
            <div 
                onClick={onClick}
                className={`w-20 h-20 rounded-md flex flex-col justify-center items-center cursor-pointer border-2 shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all relative group overflow-hidden
                ${isOver ? 'border-cyan-400 bg-cyan-500/10' : qualityColorMap[item.quality] || 'border-gray-600'}
                `}
                title={t('Open {name}', { name: item.name })}
            >
                <ImageRenderer prompt={imagePrompt} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-cyan-900/30 flex items-center justify-center pointer-events-none">
                    <ArchiveBoxSolidIcon className="w-8 h-8 text-cyan-200/80" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-center">
                    <p className="text-xs text-white line-clamp-1 font-semibold">{item.name}</p>
                </div>
                {item.resource !== undefined && item.maximumResource !== undefined && (
                    <div className="absolute bottom-1 left-1 text-xs bg-cyan-700/90 px-1.5 py-0.5 rounded-full font-mono text-white border border-cyan-400/50">
                        {item.resource}/{item.maximumResource}
                    </div>
                )}
                 <div onClick={handleImageClick} className="absolute top-1 left-1 bg-gray-900/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500/50">
                    <MagnifyingGlassPlusIcon className="w-4 h-4 text-white" />
                </div>
            </div>
        </div>
    );
};
