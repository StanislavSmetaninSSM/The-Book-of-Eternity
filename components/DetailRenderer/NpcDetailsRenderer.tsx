
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { NPC, FateCard, Faction, Wound, Item, PlayerCharacter, Location, ActiveSkill, PassiveSkill, CustomState, UnlockedMemory } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import EditableField from './Shared/EditableField';
import IdDisplay from './Shared/IdDisplay';
import ImageRenderer from '../ImageRenderer';
import { useLocalization } from '../../context/LocalizationContext';
import JournalModal from './Shared/JournalModal';
import MemoryCard from './Shared/MemoryCard';
import FateCardDetailsRenderer from './Shared/FateCardDetailsRenderer';
import {
    UserIcon, IdentificationIcon, TagIcon, CalendarIcon, GlobeAltIcon, UsersIcon, HeartIcon,
    StarIcon, BookOpenIcon, SparklesIcon, ShieldCheckIcon, ArchiveBoxIcon, DocumentTextIcon,
    CogIcon, TrashIcon, ArchiveBoxXMarkIcon, BoltIcon, PhotoIcon,
    AcademicCapIcon, FingerPrintIcon, ArrowUpOnSquareIcon, ArrowsRightLeftIcon, PlusIcon, MapPinIcon,
    ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon, ShieldExclamationIcon, ClockIcon, ScaleIcon,
} from '@heroicons/react/24/outline';
import { UserCircleIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import ConfirmationModal from '../ConfirmationModal';
import Modal from '../Modal';
import DetailRow from './Shared/DetailRow';
import InventoryManagerUI from '../InventoryManagerUI';

interface NpcDetailsProps extends Omit<DetailRendererProps, 'data'> {
  npc: NPC;
  onOpenForgetConfirm: () => void;
  onOpenClearJournalConfirm: () => void;
  deleteNpcCustomState?: (npcId: string, stateId: string) => void;
}

const qualityColorMap: Record<string, string> = {
    'Trash': 'text-gray-500 border-gray-700',
    'Common': 'text-gray-300 border-gray-500',
    'Uncommon': 'text-green-400 border-green-700/80',
    'Good': 'text-blue-400 border-blue-700/80',
    'Rare': 'text-indigo-400 border-indigo-700/80',
    'Epic': 'text-purple-400 border-purple-700/80',
    'Legendary': 'text-orange-400 border-orange-700/80',
    'Unique': 'text-yellow-400 border-yellow-600/80',
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

const CHARACTERISTICS_LIST = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'faith', 'attractiveness', 'trade', 'persuasion', 'perception', 'luck', 'speed'];

const StatBar: React.FC<{ 
    value: number; 
    max: number; 
    color: string; 
    label: string; 
    unit?: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    onClick?: () => void;
}> = ({ value, max, color, label, unit = '', icon: Icon, onClick }) => (
  <button onClick={onClick} className="w-full text-left group transition-transform transform hover:scale-[1.02]" disabled={!onClick}>
    <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
            <span className="text-sm font-medium text-gray-300 group-hover:text-cyan-300">{label}</span>
        </div>
      <span className="text-sm font-mono text-gray-400">{value}{unit} / {max}{unit}</span>
    </div>
    <div className="w-full bg-gray-700/50 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}></div>
    </div>
  </button>
);

const NpcDetailsRenderer: React.FC<NpcDetailsProps> = (props) => {
    const { 
        npc, onOpenImageModal, onOpenDetailModal, onOpenForgetConfirm, onOpenClearJournalConfirm, 
        allowHistoryManipulation, onEditNpcData, encounteredFactions, onDeleteOldestNpcJournalEntries, 
        imageCache, onImageGenerated, forgetHealedWound, clearAllHealedWounds, onRegenerateId,
        handleTransferItem, handleEquipItemForNpc, handleUnequipItemForNpc, handleSplitItemForNpc, handleMergeItemsForNpc,
        updateNpcItemSortOrder, updateNpcItemSortSettings, playerCharacter, visitedLocations,
        onShowMessageModal, deleteNpcCustomState, onEditNpcMemory, onDeleteNpcMemory, onCloseModal,
        onDeleteNpcJournalEntry
    } = props;
    const { t } = useLocalization();
    const [isJournalOpen, setIsJournalOpen] = useState(false);
    const [isInventoryManagerOpen, setIsInventoryManagerOpen] = useState(false);
    const [confirmDeleteState, setConfirmDeleteState] = useState<CustomState | null>(null);
    
    const [memoriesExpanded, setMemoriesExpanded] = useState(false);
    const [editingMemory, setEditingMemory] = useState<UnlockedMemory | null>(null);
    const [editedContent, setEditedContent] = useState('');
    const [deletingMemory, setDeletingMemory] = useState<UnlockedMemory | null>(null);

    const handleJournalClose = () => {
        setIsJournalOpen(false);
    };
    
    const handleDeleteCustomState = () => {
        if (confirmDeleteState && npc.NPCId && deleteNpcCustomState) {
            const idToDelete = confirmDeleteState.stateId || confirmDeleteState.stateName;
            deleteNpcCustomState(npc.NPCId, idToDelete);
        }
        setConfirmDeleteState(null);
    };

    const handleSaveJournalEntry = (index: number, newContent: string) => {
        if (npc.NPCId && onEditNpcData) {
            const newJournalEntries = [...(npc.journalEntries || [])];
            newJournalEntries[index] = newContent;
            onEditNpcData(npc.NPCId, 'journalEntries', newJournalEntries);
        }
    };
    
    const handleFateCardImageRegenerated = useCallback((cardId: string, newPrompt: string) => {
        if (!onEditNpcData || !npc.NPCId) return;

        const newFateCards = (npc.fateCards || []).map(card => {
            if (card.cardId === cardId) {
                return { ...card, image_prompt: newPrompt };
            }
            return card;
        });

        onEditNpcData(npc.NPCId, 'fateCards', newFateCards);
    }, [npc, onEditNpcData]);

    const factionMapById = new Map((encounteredFactions || []).filter(f => f.factionId).map(f => [f.factionId, f]));
    const factionMapByName = new Map((encounteredFactions || []).map(f => [f.name.toLowerCase(), f]));

    const [healedWoundsCollapsed, setHealedWoundsCollapsed] = useState(true);
    const [confirmClear, setConfirmClear] = useState(false);
    const [confirmForget, setConfirmForget] = useState<Wound | null>(null);

    const handleClearAllHealedWounds = () => {
        if (npc.NPCId) {
            clearAllHealedWounds('npc', npc.NPCId);
        }
        setConfirmClear(false);
    };

    const handleForgetWound = () => {
        if (confirmForget && confirmForget.woundId && npc.NPCId) {
            forgetHealedWound('npc', npc.NPCId, confirmForget.woundId);
        }
        setConfirmForget(null);
    };

    const imagePrompt = npc.custom_image_prompt || npc.image_prompt;

    const journalPreviewContent = useMemo(() => {
        if (!npc.journalEntries || npc.journalEntries.length === 0) {
            return null;
        }
        const firstEntry = npc.journalEntries[0];
        if (typeof firstEntry === 'string') {
            return firstEntry;
        }
        return `[${t('Corrupted Journal Entry')}]`;
    }, [npc.journalEntries, t]);
    
    const getRelationshipTooltip = (level: number) => {
        if (level <= 49) return t('relationship_level_hostility');
        if (level === 50) return t('relationship_level_neutrality');
        if (level <= 100) return t('relationship_level_friendship');
        if (level <= 150) return t('relationship_level_deep_bond');
        return t('relationship_level_devotion');
    };

    const activeWounds = useMemo(() => (npc.wounds ?? []).filter(w => !w.healingState || w.healingState.currentState !== 'Healed'), [npc.wounds]);
    const healedWounds = useMemo(() => (npc.wounds ?? []).filter(w => w.healingState && w.healingState.currentState === 'Healed'), [npc.wounds]);
    
    const isCompanion = npc.progressionType === 'Companion';

    const isNpcItemEquipped = (itemId: string | null): boolean => {
        if (!itemId) return false;
        return Object.values(npc.equippedItems || {}).includes(itemId);
    };

    const currentLocation = useMemo(() => {
        if (!npc.currentLocationId || !visitedLocations) return null;
        return visitedLocations.find(loc => loc.locationId === npc.currentLocationId);
    }, [npc.currentLocationId, visitedLocations]);
    
    const sortedInventory = useMemo(() => {
        const inventory = npc.inventory || [];
        const { itemSortCriteria = 'manual', itemSortDirection = 'asc', itemSortOrder = [] } = npc;

        let sortedList: Item[] = [];

        // Step 1: Apply sorting to the entire list of items
        if (itemSortCriteria === 'manual') {
            if (itemSortOrder && itemSortOrder.length > 0) {
                const itemMap = new Map(inventory.map(item => [item.existedId, item]));
                const sorted = itemSortOrder
                    .map(id => itemMap.get(id!))
                    .filter((item): item is Item => !!item);
                const newItems = inventory.filter(item => item.existedId && !itemSortOrder.includes(item.existedId));
                sortedList = [...sorted, ...newItems];
            } else {
                sortedList = [...inventory]; // If manual but no order, keep as is
            }
        } else { // Automatic sorting
            const sortFn = (a: Item, b: Item) => {
                 if (!a || typeof a !== 'object') return 1;
                if (!b || typeof b !== 'object') return -1;
                
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
            sortedList = [...inventory].sort(sortFn);
        }

        // Step 2: Bubble equipped items to the top, preserving their relative sorted order
        const equippedItemIds = new Set(Object.values(npc.equippedItems || {}).filter(id => id !== null));
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

    }, [npc.inventory, npc.equippedItems, npc.itemSortCriteria, npc.itemSortDirection, npc.itemSortOrder]);

    const sortedMemories = useMemo(() => {
        return npc.unlockedMemories ? [...npc.unlockedMemories].sort((a, b) => b.unlockedAtRelationshipLevel - a.unlockedAtRelationshipLevel) : [];
    }, [npc.unlockedMemories]);

    const latestMemory = sortedMemories.length > 0 ? sortedMemories[0] : null;
    const otherMemories = sortedMemories.slice(1);

    const handleOpenEditMemory = (memory: UnlockedMemory) => {
        setEditingMemory(memory);
        setEditedContent(memory.content);
    };

    const handleSaveMemory = () => {
        if (editingMemory && npc.NPCId && onEditNpcMemory) {
            onEditNpcMemory(npc.NPCId, { ...editingMemory, content: editedContent });
        }
        setEditingMemory(null);
    };

    const handleDeleteMemoryConfirm = () => {
        if (deletingMemory && npc.NPCId && onDeleteNpcMemory) {
            onDeleteNpcMemory(npc.NPCId, deletingMemory.memoryId);
        }
        setDeletingMemory(null);
    };

    return (
    <>
        <div className="space-y-4">
            {imagePrompt && (
                <div className="w-full h-48 rounded-lg overflow-hidden mb-4 bg-gray-900 group relative cursor-pointer" onClick={() => onOpenImageModal?.(imagePrompt || '')}>
                    <ImageRenderer 
                        prompt={imagePrompt} 
                        alt={npc.name} 
                        width={1024} 
                        height={1024}
                        showRegenerateButton={allowHistoryManipulation} 
                        imageCache={imageCache}
                        onImageGenerated={onImageGenerated}
                    />
                     <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-bold text-lg">{t('Enlarge')}</p>
                    </div>
                </div>
            )}
             {allowHistoryManipulation && (
                 <Section title={t("Custom Image Prompt")} icon={PhotoIcon}>
                    <EditableField 
                        label={t("Image Prompt")}
                        value={npc.custom_image_prompt || ''}
                        isEditable={true}
                        onSave={(val) => { if (npc.NPCId) onEditNpcData(npc.NPCId, 'custom_image_prompt', val) }}
                        as="textarea"
                    />
                    <p className="text-xs text-gray-400 mt-2"><strong>{t("Default prompt from AI:")}</strong> {npc.image_prompt}</p>
                 </Section>
             )}
            
            <Section title={t("Core Information")} icon={IdentificationIcon}>
                <DetailRow label={t("Name")} value={
                    <EditableField 
                        label={t('Name')}
                        value={npc.name}
                        isEditable={allowHistoryManipulation && !!npc.NPCId}
                        onSave={(val) => { if (npc.NPCId) onEditNpcData(npc.NPCId, 'name', val) }}
                        as="input"
                    />
                } icon={UserIcon} />
                 {currentLocation && (
                    <DetailRow 
                        label={t("Current Location")} 
                        value={
                            <button 
                                onClick={() => onOpenDetailModal(t("Location: {name}", { name: currentLocation.name }), { ...currentLocation, type: 'location' })}
                                className="text-cyan-300 hover:underline text-right"
                            >
                                {currentLocation.name}
                            </button>
                        } 
                        icon={MapPinIcon} 
                    />
                )}
                <DetailRow label={t("Race & Class")} value={`${t(npc.race as any)}, ${t(npc.class as any)}`} icon={TagIcon} />
                {npc.age !== undefined && <DetailRow label={t("Age")} value={npc.age || t('Unknown')} icon={CalendarIcon} />}
                {npc.rarity && <DetailRow label={t("Rarity")} value={t(npc.rarity as any)} icon={StarIcon} />}
                {npc.worldview && <DetailRow label={t("Worldview")} value={t(npc.worldview as any)} icon={GlobeAltIcon} />}
                {npc.attitude && <DetailRow label={t("Attitude")} value={t(npc.attitude as any)} icon={HeartIcon} />}
                {npc.relationshipLevel !== undefined && (
                     <DetailRow 
                        label={t("Relationship")} 
                        value={`${npc.relationshipLevel} / 200`} 
                        icon={UsersIcon} 
                        title={getRelationshipTooltip(npc.relationshipLevel ?? 50)} 
                     />
                )}
                {npc.currentHealth !== undefined && npc.maxHealth !== undefined && npc.maxHealth > 0 && (
                     <div className="pt-2">
                        <StatBar 
                            value={npc.currentHealth} 
                            max={npc.maxHealth} 
                            color="bg-red-500" 
                            label={t('Health')} 
                            icon={HeartIcon}
                            unit="%"
                        />
                    </div>
                )}
                {(npc.totalWeight !== undefined && npc.maxWeight !== undefined && npc.maxWeight > 0) && (
                     <div className="pt-2">
                        <StatBar 
                            value={Math.round(npc.totalWeight * 100) / 100} 
                            max={npc.maxWeight} 
                            color={npc.isOverloaded ? 'bg-red-600' : 'bg-orange-500'} 
                            label={t('Weight')} 
                            unit={t('kg')}
                            icon={ScaleIcon}
                        />
                    </div>
                )}
            </Section>

            <Section title={t("Progression")} icon={StarIcon}>
                 {npc.level !== undefined && (
                    <DetailRow label={t("Level")} value={npc.level} icon={AcademicCapIcon} />
                )}
                {npc.progressionType && (
                    <DetailRow label={t("Progression Type")} value={t(npc.progressionType as any)} icon={UserCircleIcon} />
                )}
                {npc.progressionType === 'Companion' && npc.experience !== undefined && npc.experienceForNextLevel !== undefined && (
                    <div className="pt-2">
                        <StatBar 
                            value={npc.experience} 
                            max={npc.experienceForNextLevel} 
                            color="bg-yellow-500" 
                            label={t('Experience')} 
                            icon={StarIcon} 
                        />
                    </div>
                )}
            </Section>

            <Section title={t("Appearance")} icon={UserIcon}>
                <EditableField 
                    label={t('Appearance')}
                    value={npc.appearanceDescription || ''}
                    isEditable={allowHistoryManipulation && !!npc.NPCId}
                    onSave={(val) => { if (npc.NPCId) onEditNpcData(npc.NPCId, 'appearanceDescription', val) }}
                    className="italic text-gray-400"
                />
            </Section>
            
            <Section title={t("History")} icon={BookOpenIcon}>
                <EditableField 
                    label={t('History')}
                    value={npc.history || ''}
                    isEditable={allowHistoryManipulation && !!npc.NPCId}
                    onSave={(val) => { if (npc.NPCId) onEditNpcData(npc.NPCId, 'history', val) }}
                    className="italic text-gray-400"
                />
            </Section>
            
            {journalPreviewContent && (
                <div className="mt-6">
                    <h4 className="text-lg font-bold text-cyan-300/80 uppercase tracking-wider mb-3 pb-2 border-b-2 border-cyan-500/20 flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5" />
                        {t("Journal Preview")}
                    </h4>
                    <div className="bg-slate-800/50 p-4 rounded-lg shadow-inner space-y-4">
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">{journalPreviewContent}</p>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsJournalOpen(true);
                            }} 
                            className="w-full text-center py-2 px-4 bg-slate-700/60 hover:bg-slate-700 rounded-md text-cyan-300 font-semibold transition-colors"
                        >
                            {t('Read Full Journal')}
                        </button>
                    </div>
                </div>
            )}

            {sortedMemories.length > 0 && (
                <Section title={t("Unlocked Memories")} icon={BookOpenIcon}>
                    <div className="space-y-3">
                        {latestMemory && (
                            <MemoryCard
                                key={latestMemory.memoryId}
                                memory={latestMemory}
                                onOpenMemoryModal={onShowMessageModal}
                                isEditable={allowHistoryManipulation}
                                onEdit={() => handleOpenEditMemory(latestMemory)}
                                onDelete={() => setDeletingMemory(latestMemory)}
                            />
                        )}
                        {otherMemories.length > 0 && (
                            <>
                                <button
                                    onClick={() => setMemoriesExpanded(!memoriesExpanded)}
                                    className="w-full flex justify-between items-center px-3 py-2 text-sm text-cyan-300 bg-gray-700/50 hover:bg-gray-700/80 rounded-md transition-colors"
                                >
                                    <span>{memoriesExpanded ? t('Hide Older Memories') : t('Show {count} Older Memories', { count: otherMemories.length })}</span>
                                    {memoriesExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                                </button>
                                {memoriesExpanded && (
                                    <div className="space-y-3 pt-2 animate-fade-in-down">
                                        {otherMemories.map(memory => (
                                            <MemoryCard
                                                key={memory.memoryId}
                                                memory={memory}
                                                onOpenMemoryModal={onShowMessageModal}
                                                isEditable={allowHistoryManipulation}
                                                onEdit={() => handleOpenEditMemory(memory)}
                                                onDelete={() => setDeletingMemory(memory)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </Section>
            )}

            {npc.characteristics && (
                 <Section title={t("Characteristics")} icon={AcademicCapIcon}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {CHARACTERISTICS_LIST.map(charName => {
                            const charNameRaw = charName.charAt(0).toUpperCase() + charName.slice(1);
                            const standardKey = `standard${charNameRaw}` as keyof typeof npc.characteristics;
                            const modifiedKey = `modified${charNameRaw}` as keyof typeof npc.characteristics;
                            const baseValue = npc.characteristics![standardKey];
                            const modifiedValue = npc.characteristics![modifiedKey];

                            return (
                                <div key={charName} className="bg-gray-700/40 p-3 rounded-lg flex items-center justify-between shadow-inner">
                                    <span className="text-gray-300 capitalize text-sm font-semibold">{t(charName)}</span>
                                    <div className="flex flex-col items-end">
                                        <span className="font-bold text-2xl text-cyan-400 font-mono">{modifiedValue}</span>
                                        <span className="text-xs font-mono text-gray-400">({t('Base')}: {baseValue})</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                 </Section>
            )}

            <Section title={t('Wounds')} icon={ShieldExclamationIcon}>
                {(activeWounds.length > 0) ? (activeWounds.map((wound, index) => (
                    <button 
                        key={wound.woundId || index} 
                        onClick={() => {
                            const cleanWound = {
                                type: 'wound',
                                woundId: wound.woundId,
                                woundName: wound.woundName,
                                severity: wound.severity,
                                descriptionOfEffects: wound.descriptionOfEffects,
                                generatedEffects: wound.generatedEffects,
                                healingState: wound.healingState,
                            };
                            onOpenDetailModal(t("Wound: {name}", { name: wound.woundName }), cleanWound);
                        }} 
                        className="w-full text-left bg-gray-900/60 p-3 rounded-md border border-red-800/50 flex items-start gap-3 hover:border-red-600 transition-colors"
                    >
                        <ShieldExclamationIcon className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="flex justify-between items-baseline">
                                 <span className="font-semibold text-red-400">{wound.woundName}</span>
                                 <span className="text-xs text-red-500 bg-red-900/50 px-2 py-0.5 rounded-full">{t(wound.severity as any)}</span>
                            </div>
                            <p className="text-sm text-gray-400 italic mt-1 line-clamp-2">{wound.descriptionOfEffects}</p>
                        </div>
                    </button>
                ))) : <p className="text-sm text-gray-500 text-center p-2">{t('You are unwounded.')}</p>}
            </Section>
            
             {healedWounds.length > 0 && (
                <div className="mt-4">
                    <div className="border-b border-cyan-500/20 mb-3">
                        <button onClick={() => setHealedWoundsCollapsed(prev => !prev)} className="w-full flex justify-between items-center text-left pb-1 group">
                            <h4 className="text-sm font-bold text-cyan-300/80 uppercase tracking-wider group-hover:text-cyan-200">{t('Healed Wounds')}</h4>
                            {healedWoundsCollapsed ? <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : <ChevronUpIcon className="w-5 h-5 text-gray-400" />}
                        </button>
                    </div>
                    {!healedWoundsCollapsed && (
                        <div className="space-y-3 animate-fade-in-down">
                            {healedWounds.map((wound, index) => (
                                <div key={wound.woundId || index} className="w-full bg-gray-900/60 p-3 rounded-md border border-green-800/50 flex items-center justify-between gap-3">
                                    <button onClick={() => {
                                        const cleanWound = {
                                            type: 'wound',
                                            woundId: wound.woundId,
                                            woundName: wound.woundName,
                                            severity: wound.severity,
                                            descriptionOfEffects: wound.descriptionOfEffects,
                                            generatedEffects: wound.generatedEffects,
                                            healingState: wound.healingState,
                                        };
                                        onOpenDetailModal(t("Wound: {name}", { name: wound.woundName }), cleanWound);
                                    }} className="flex-1 text-left">
                                        <span className="font-semibold text-green-400/80 hover:text-green-300 transition-colors">{wound.woundName}</span>
                                    </button>
                                    <button
                                        onClick={() => setConfirmForget(wound)}
                                        className="p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors flex-shrink-0"
                                        title={t('Forget Wound')}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <div className="!mt-4">
                                <button
                                    onClick={() => setConfirmClear(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs bg-red-900/50 hover:bg-red-900/80 rounded-md text-red-300 font-semibold transition-colors"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    {t('Clear All Healed Wounds')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {npc.customStates && npc.customStates.length > 0 && (
                <Section title={t("States")} icon={ExclamationTriangleIcon}>
                    {npc.customStates.map((state, index) => (
                        <div key={state.stateId || index} className="flex items-center gap-2 group">
                            <div className="flex-1">
                                <StatBar
                                    value={state.currentValue}
                                    max={state.maxValue}
                                    color="bg-purple-500"
                                    label={t(state.stateName as any)}
                                    icon={ExclamationTriangleIcon}
                                    onClick={() => onOpenDetailModal(t("CustomState: {name}", { name: state.stateName }), { ...state, type: 'customState' })}
                                />
                            </div>
                             <button
                                onClick={() => setConfirmDeleteState(state)}
                                className="p-1 text-gray-500 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                                title={t('Delete State')}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </Section>
            )}

            {npc.activeSkills && npc.activeSkills.length > 0 && (
                <Section title={t("Active Skills")} icon={SparklesIcon}>
                    {(npc.activeSkills ?? []).map((skill, index) => {
                        const masteryData = npc.skillMasteryData?.find(m => m.skillName.toLowerCase() === skill.skillName.toLowerCase());
                        const masteryProgress = (masteryData && masteryData.masteryProgressNeeded > 0)
                            ? (masteryData.currentMasteryProgress / masteryData.masteryProgressNeeded) * 100
                            : 0;
                        return (
                            <button key={index} onClick={() => onOpenDetailModal(t("Active Skill: {name}", { name: skill.skillName }), { ...skill, owner: 'npc' })} className={`w-full text-left bg-gray-700/50 p-3 rounded-md border-l-4 ${qualityColorMap[skill.rarity]?.split(' ')[1] || 'border-gray-500'} shadow-sm hover:bg-gray-700/80 hover:border-cyan-400 transition-colors`}>
                                <div className="flex justify-between items-baseline flex-wrap gap-x-4 gap-y-1">
                                    <span className={`font-semibold ${qualityColorMap[skill.rarity]?.split(' ')[0] || 'text-gray-200'} text-lg`}>
                                        {skill.skillName}
                                    </span>
                                    <div className="text-xs space-x-3 flex items-center text-gray-400">
                                        {masteryData && (
                                            <span className="font-semibold whitespace-nowrap flex items-center gap-1.5">{t('Mastery Level')}: <span className="text-cyan-300 font-bold text-sm">{masteryData.currentMasteryLevel ?? '?'}/{masteryData.maxMasteryLevel ?? '?'}</span></span>
                                        )}
                                        {skill.energyCost && <span className="flex items-center gap-1"><BoltIcon className="w-3 h-3 text-blue-400" />{skill.energyCost} {t('EnergyUnit')}</span>}
                                        {skill.cooldownTurns != null && <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3 text-purple-400" />{t('CooldownAbbr')}: {skill.cooldownTurns}{t('TurnUnit')}</span>}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 italic mt-2 line-clamp-2">{skill.skillDescription}</p>
                                {masteryData && masteryData.masteryProgressNeeded > 0 && (
                                    <div className="mt-2">
                                        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                                            <span className="font-medium">{t('Progress')}</span>
                                            <span className="font-mono">{masteryData.currentMasteryProgress ?? '?'}/{masteryData.masteryProgressNeeded ?? '?'}</span>
                                        </div>
                                        <div className="w-full bg-gray-800/70 rounded-full h-2 overflow-hidden">
                                            <div className="bg-cyan-500 h-2 rounded-full transition-all duration-300" style={{ width: `${masteryProgress}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </Section>
            )}

            {npc.passiveSkills && npc.passiveSkills.length > 0 && (
                <Section title={t("Passive Skills")} icon={SparklesIcon}>
                    {(npc.passiveSkills ?? []).map((skill, index) => (
                        <button key={index} onClick={() => onOpenDetailModal(t("Passive Skill: {name}", { name: skill.skillName }), skill)} className={`w-full text-left bg-gray-700/50 p-3 rounded-md border-l-4 ${qualityColorMap[skill.rarity]?.split(' ')[1] || 'border-gray-500'} shadow-sm hover:bg-gray-700/80 hover:border-cyan-400 transition-colors`}>
                             <div className="flex justify-between items-start">
                                <span className={`font-semibold ${qualityColorMap[skill.rarity]?.split(' ')[0] || 'text-gray-200'}`}>{skill.skillName}</span>
                                <span className="text-xs font-semibold text-gray-400 whitespace-nowrap pl-2">{t('Mastery Level')}: <span className="text-cyan-300 font-bold">{skill.masteryLevel} / {skill.maxMasteryLevel}</span></span>
                            </div>
                            <p className="text-sm text-gray-400 italic mt-1 line-clamp-2">{skill.skillDescription}</p>
                        </button>
                    ))}
                </Section>
            )}

            <Section title={t("Inventory")} icon={ArchiveBoxIcon}>
                {(sortedInventory && sortedInventory.length > 0) ? (
                    <div className="space-y-2">
                        {sortedInventory.map((item, index) => {
                            if (!item || typeof item.name !== 'string' || typeof item.description !== 'string') {
                              return <div key={index} className="text-red-400 text-xs p-2 bg-red-900/30 rounded">{`[${t('corrupted_item')}]`}</div>;
                            }
                            const itemName = item.name;
                            const isEquipped = isNpcItemEquipped(item.existedId);
                            return (
                                <button
                                    key={item.existedId || index}
                                    onClick={() => {
                                        const detailData = { ...item, ownerType: 'npc', ownerId: 'NPCId' in npc ? npc.NPCId : '', isEquippedByOwner: 'NPCId' in npc ? Object.values(npc.equippedItems || {}).includes(item.existedId) : false };
                                        onOpenDetailModal(t("Item: {name}", { name: itemName }), detailData);
                                    }}
                                    className={`w-full text-left p-3 rounded-md border-l-4 ${qualityColorMap[item.quality] || 'border-gray-500'} bg-gray-700/50 shadow-sm hover:bg-gray-700/80 hover:border-cyan-400 transition-colors`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`font-semibold ${qualityColorMap[item.quality]?.split(' ')[0] || 'text-gray-200'}`}>
                                            {itemName} {item.count > 1 ? `(x${item.count})` : ''}
                                        </span>
                                        {isEquipped && <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">{t('Equipped')}</span>}
                                    </div>
                                    <p className="text-sm text-gray-400 italic my-1 line-clamp-2">{item.description}</p>
                                </button>
                            )
                        })}
                    </div>
                ) : <p className="text-sm text-gray-500">{t('No carried items.')}</p>}
                
                {isCompanion && npc.NPCId && (
                    <div className="mt-4">
                        <button onClick={() => setIsInventoryManagerOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-cyan-300 bg-cyan-600/20 rounded-md hover:bg-cyan-600/40 transition-colors">
                            <CogIcon className="w-5 h-5"/> {t("Manage Inventory")}
                        </button>
                    </div>
                )}
            </Section>

            {npc.fateCards && npc.fateCards.length > 0 && (
                <Section title={t("Fate Cards")} icon={SparklesIcon}>
                    <div className="space-y-3">
                        {npc.fateCards.map(card => {
                            const openCardImageModal = () => {
                                if (onOpenImageModal) {
                                    const prompt = card.image_prompt || `A detailed fantasy art image of a tarot card representing "${card.name}". ${card.description}`;
                                    onOpenImageModal(prompt, (newPrompt) => handleFateCardImageRegenerated(card.cardId, newPrompt));
                                }
                            };
                            return (
                                <FateCardDetailsRenderer 
                                    key={card.cardId} 
                                    card={card}
                                    onOpenImageModal={openCardImageModal}
                                    imageCache={imageCache}
                                    onImageGenerated={onImageGenerated}
                                />
                            );
                        })}
                    </div>
                </Section>
            )}
            
            {allowHistoryManipulation && (
                <Section title={t("Actions")} icon={CogIcon}>
                     <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={onOpenForgetConfirm}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-300 bg-red-600/20 rounded-md hover:bg-red-600/40 transition-colors"
                        >
                            <TrashIcon className="w-5 h-5" />
                            {t("Forget NPC")}
                        </button>
                         <button
                            onClick={onOpenClearJournalConfirm}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-yellow-300 bg-yellow-600/20 rounded-md hover:bg-yellow-600/40 transition-colors"
                        >
                            <ArchiveBoxXMarkIcon className="w-5 h-5" />
                            {t("Clear Journal")}
                        </button>
                    </div>
                </Section>
            )}

            {allowHistoryManipulation && onRegenerateId && (
            <Section title={t("System Information")} icon={CogIcon}>
                <IdDisplay 
                    id={npc.NPCId} 
                    name={npc.name} 
                    onRegenerate={() => onRegenerateId(npc, 'NPC')}
                />
            </Section>
            )}
        </div>
        
        <JournalModal
            isOpen={isJournalOpen}
            onClose={handleJournalClose}
            journalEntries={npc.journalEntries || []}
            npcName={npc.name}
            isEditable={allowHistoryManipulation && !!npc.NPCId}
            onSaveEntry={handleSaveJournalEntry}
            onDeleteOldest={onDeleteOldestNpcJournalEntries && npc.NPCId ? (count) => onDeleteOldestNpcJournalEntries(npc.NPCId!, count) : undefined}
            onDeleteEntry={onDeleteNpcJournalEntry && npc.NPCId ? (index) => onDeleteNpcJournalEntry(npc.NPCId!, index) : undefined}
            onClearAll={onOpenClearJournalConfirm}
        />
        <ConfirmationModal
            isOpen={confirmClear}
            onClose={() => setConfirmClear(false)}
            onConfirm={handleClearAllHealedWounds}
            title={t('Clear All Healed Wounds')}
        >
            <p>{t('Are you sure you want to clear all healed wounds? This will remove them permanently.')}</p>
        </ConfirmationModal>
        <ConfirmationModal
            isOpen={!!confirmForget}
            onClose={() => setConfirmForget(null)}
            onConfirm={handleForgetWound}
            title={t('Forget Wound')}
        >
            <p>{t('Are you sure you want to forget this healed wound?')}</p>
        </ConfirmationModal>
        <ConfirmationModal
            isOpen={!!confirmDeleteState}
            onClose={() => setConfirmDeleteState(null)}
            onConfirm={handleDeleteCustomState}
            title={t('delete_state_title', { name: confirmDeleteState?.stateName ?? '' })}
        >
            <p>{t('delete_state_confirm', { name: confirmDeleteState?.stateName ?? '' })}</p>
        </ConfirmationModal>
        {isInventoryManagerOpen && isCompanion && npc.NPCId && playerCharacter && (
            <Modal title={`${t("Inventory & Equipment")}: ${npc.name}`} isOpen={isInventoryManagerOpen} onClose={() => setIsInventoryManagerOpen(false)}>
                <InventoryManagerUI
                    character={npc}
                    playerCharacter={playerCharacter}
                    isCompanionMode={true}
                    onEquip={(item, slot) => handleEquipItemForNpc?.(npc.NPCId!, item, slot)}
                    onUnequip={(item) => handleUnequipItemForNpc?.(npc.NPCId!, item)}
                    onDropItem={(item) => handleTransferItem?.('npc', 'player', npc.NPCId!, item, item.count)} // Repurposed for "Take"
                    onGiveItem={(item, quantity) => handleTransferItem?.('player', 'npc', npc.NPCId!, item, quantity)}
                    onMoveItem={(item, containerId) => { /* NPC move logic can be added here */ }}
                    onSplitItem={(item, quantity) => handleSplitItemForNpc?.(npc.NPCId!, item, quantity)}
                    onMergeItems={(source, target) => handleMergeItemsForNpc?.(npc.NPCId!, source, target)}
                    updateItemSortOrder={(order) => updateNpcItemSortOrder?.(npc.NPCId!, order)}
                    updateItemSortSettings={(criteria, direction) => updateNpcItemSortSettings?.(npc.NPCId!, criteria, direction)}
                    onOpenDetailModal={onOpenDetailModal}
                    onOpenImageModal={onOpenImageModal}
                    imageCache={imageCache}
                    onImageGenerated={onImageGenerated}
                />
            </Modal>
        )}
        {editingMemory && (
            <Modal
                isOpen={!!editingMemory}
                onClose={() => setEditingMemory(null)}
                title={`${t('Edit Memory')}: ${editingMemory.title}`}
            >
                <div className="space-y-4">
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[300px]"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingMemory(null)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition flex items-center gap-2">
                        <XMarkIcon className="w-5 h-5" />
                        {t('Cancel')}
                      </button>
                      <button onClick={handleSaveMemory} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition flex items-center gap-2">
                        <CheckIcon className="w-5 h-5" />
                        {t('Save')}
                      </button>
                    </div>
                </div>
            </Modal>
        )}
        {deletingMemory && (
            <ConfirmationModal
                isOpen={!!deletingMemory}
                onClose={() => setDeletingMemory(null)}
                onConfirm={handleDeleteMemoryConfirm}
                title={`${t('Delete Memory')}: ${deletingMemory.title}`}
            >
                <p>{t('Are you sure you want to permanently delete this memory?')}</p>
            </ConfirmationModal>
        )}
    </>
    );
};

export default NpcDetailsRenderer;