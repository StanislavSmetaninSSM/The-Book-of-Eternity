import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PlayerCharacter, NPC, GameSettings, Item, StructuredBonus, Faction, Location, UnlockedMemory, CompletedActivity } from '../types';
import { useLocalization } from '../context/LocalizationContext';

// Import sub-components
import CharacterSheetHeader from './CharacterSheet/Header';
import ProfileView from './CharacterSheet/ProfileView';
import StatsView from './CharacterSheet/StatsView';
import CombatView from './CharacterSheet/CombatView';
import SkillsView from './CharacterSheet/SkillsView';
import InventoryView from './CharacterSheet/InventoryView';
import ConditionsView from './CharacterSheet/ConditionsView';
import BonusesView from './CharacterSheet/BonusesView';
import MemoriesView from './CharacterSheet/MemoriesView';
import FateView from './CharacterSheet/FateView';
import SectionHeader from './CharacterSheet/Shared/SectionHeader';
import ConfirmationModal from './ConfirmationModal';
import EditableField from './DetailRenderer/Shared/EditableField';
import { useSpeech } from '../context/SpeechContext';
// FIX: Import MarkdownRenderer which is used in ActivitiesView.
import MarkdownRenderer from './MarkdownRenderer';
import { stripMarkdown } from '../utils/textUtils';


import { 
    UserCircleIcon, 
    ShieldCheckIcon,
    SparklesIcon,
    FireIcon,
    CubeIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    AcademicCapIcon,
    StarIcon,
    ArrowUturnLeftIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    BookOpenIcon,
    ClipboardDocumentListIcon,
    BoltIcon,
    CheckCircleIcon,
    TrashIcon,
    MinusIcon,
    PlusIcon,
    MapPinIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolidIcon, SpeakerWaveIcon, StopCircleIcon, BookOpenIcon as BookOpenSolidIcon } from '@heroicons/react/24/solid';


// Define the massive props interface
interface CharacterSheetProps {
    character: PlayerCharacter | NPC;
    playerCharacter: PlayerCharacter;
    isViewOnly: boolean;
    gameSettings: GameSettings;
    onOpenDetailModal: (title: string, data: any) => void;
    onShowMessageModal: (title: string, content: string) => void;
    onOpenTextReader: (title: string, content: string) => void;
    onOpenInventory: () => void;
    onOpenNpcInventory: (npc: NPC) => void;
    onSpendAttributePoint: (characteristic: string) => void;
    forgetHealedWound: (characterType: 'player' | 'npc', characterId: string | null, woundId: string) => void;
    forgetActiveWound: (characterType: 'player' | 'npc', characterId: string | null, woundId: string) => void;
    clearAllHealedWounds: (characterType: 'player' | 'npc', characterId: string | null) => void;
    onDeleteCustomState: (stateId: string) => void;
    onDeleteNpcCustomState?: (npcId: string, stateId: string) => void;
    onEditPlayerData?: (field: keyof PlayerCharacter, value: any) => void;
    onEditNpcData?: (npcId: string, field: keyof NPC, value: any) => void;
    updatePlayerPortrait?: (playerId: string, portraitData: { prompt?: string | null; custom?: string | null; }) => void;
    updateNpcPortrait?: (npcId: string, portraitData: { prompt?: string | null; custom?: string | null; }) => void;
    onDeleteActiveSkill: (skillName: string) => void;
    onDeletePassiveSkill: (skillName: string) => void;
    updateActiveSkillSortOrder: (newOrder: string[]) => void;
    updatePassiveSkillSortOrder: (newOrder: string[]) => void;
    updateNpcItemSortOrder: (npcId: string, newOrder: string[]) => void;
    updateNpcItemSortSettings: (npcId: string, criteria: PlayerCharacter['itemSortCriteria'], direction: PlayerCharacter['itemSortDirection']) => void;
    imageCache: Record<string, string>;
    onImageGenerated: (prompt: string, base64: string) => void;
    encounteredFactions: Faction[];
    // FIX: Standardize onOpenImageModal signature
    onOpenImageModal: (displayPrompt: string, originalTextPrompt: string, onClearCustom?: () => void, onUpload?: (base64: string) => void) => void;
    onOpenJournalModal: (npc: NPC) => void;
    clearAllCompletedNpcActivities: (npcId: string) => void;
    onDeleteCurrentActivity: (npcId: string) => void;
    onDeleteCompletedActivity: (npcId: string, activity: CompletedActivity) => void;
    onEditNpcMemory: (npcId: string, memory: UnlockedMemory) => void;
    onDeleteNpcMemory: (npcId: string, memoryId: string) => void;
    allLocations: Location[];
    allNpcs: NPC[];
    onViewCharacterSheet: (character: PlayerCharacter | NPC) => void;
    handleTransferItem: (sourceType: 'player' | 'npc', targetType: 'player' | 'npc', npcId: string, item: Item, quantity: number) => void;
    handleEquipItemForNpc: (npcId: string, item: Item, slot: string) => void;
    handleUnequipItemForNpc: (npcId: string, item: Item) => void;
    handleSplitItemForNpc: (npcId: string, item: Item, quantity: number) => void;
    handleMergeItemsForNpc: (npcId: string, sourceItem: Item, targetItem: Item) => void;
    initialView?: string;
    onRegenerateId: (entity: any, entityType: string) => void;
}

interface JournalViewProps {
    character: NPC;
    isAdminEditable: boolean;
    onEditNpcData: (npcId: string, field: keyof NPC, value: any) => void;
    onOpenTextReader: (title: string, content: string) => void;
}

const JournalView: React.FC<JournalViewProps> = ({ character, isAdminEditable, onEditNpcData, onOpenTextReader }) => {
    const { t } = useLocalization();
    const { speak, isSpeaking, currentlySpeakingText } = useSpeech();

    const [fontSizeIndex, setFontSizeIndex] = useState(2);
    const FONT_SIZES = [12, 14, 16, 18, 20, 24];
    const FONT_SIZE_CLASSES = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];

    const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
    const [isDeleteOldestConfirmOpen, setIsDeleteOldestConfirmOpen] = useState(false);
    const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);
    const [deleteCount, setDeleteCount] = useState('10');
    const [newEntry, setNewEntry] = useState('');
    const [isAddEntryCollapsed, setIsAddEntryCollapsed] = useState(true);

    const journalEntries = character.journalEntries || [];

    const onSaveEntry = (index: number, newContent: string) => {
        const newEntries = [...journalEntries];
        newEntries[index] = newContent;
        onEditNpcData(character.NPCId, 'journalEntries', newEntries);
    };
    
    const onDeleteEntry = (index: number) => {
        const newEntries = journalEntries.filter((_, i) => i !== index);
        onEditNpcData(character.NPCId, 'journalEntries', newEntries);
    };

    const onDeleteOldest = (count: number) => {
        const newEntries = journalEntries.slice(0, Math.max(0, journalEntries.length - count));
        onEditNpcData(character.NPCId, 'journalEntries', newEntries);
    };

    const onClearAll = () => {
        onEditNpcData(character.NPCId, 'journalEntries', []);
    };
    
    const onAddEntry = (content: string) => {
        const newEntries = [content, ...journalEntries];
        onEditNpcData(character.NPCId, 'journalEntries', newEntries);
    };

    const handleDeleteEntryConfirm = () => {
        if (entryToDelete !== null) {
            onDeleteEntry(entryToDelete);
        }
        setEntryToDelete(null);
    };

    const handleDeleteOldestConfirm = () => {
        const count = parseInt(deleteCount, 10);
        if (!isNaN(count) && count > 0) {
            onDeleteOldest(count);
        }
        setIsDeleteOldestConfirmOpen(false);
    };

    const handleClearAllConfirm = () => {
        onClearAll();
        setIsClearAllConfirmOpen(false);
    };

    const handleAddEntry = () => {
        if (newEntry.trim()) {
            onAddEntry(newEntry);
            setNewEntry('');
        }
    };

    if (journalEntries.length === 0 && !isAdminEditable) {
        return (
            <div className="text-center text-gray-500 p-6">
                <BookOpenIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p>{t('no_journal_entries')}</p>
            </div>
        );
    }
    
    return (
        <>
            <div className={`space-y-4 ${FONT_SIZE_CLASSES[fontSizeIndex]}`}>
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setFontSizeIndex(p => Math.max(p - 1, 0))} disabled={fontSizeIndex === 0} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"><MinusIcon className="w-5 h-5" /></button>
                    <span className="text-sm text-gray-400 font-mono w-6 text-center">{FONT_SIZES[fontSizeIndex]}px</span>
                    <button onClick={() => setFontSizeIndex(p => Math.min(p + 1, FONT_SIZES.length - 1))} disabled={fontSizeIndex === FONT_SIZES.length - 1} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"><PlusIcon className="w-5 h-5" /></button>
                </div>
                
                {isAdminEditable && (
                    <div className="bg-gray-900/40 rounded-lg border border-cyan-700/50">
                        <button
                            onClick={() => setIsAddEntryCollapsed(prev => !prev)}
                            className="w-full p-3 text-left flex justify-between items-center group"
                            aria-expanded={!isAddEntryCollapsed}
                        >
                            <h4 className="text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">{t('Add New Entry')}</h4>
                            {isAddEntryCollapsed ? <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : <ChevronUpIcon className="w-5 h-5 text-gray-400" />}
                        </button>
                        {!isAddEntryCollapsed && (
                            <div className="p-3 border-t border-cyan-700/50 animate-fade-in-down-fast">
                                <textarea value={newEntry} onChange={(e) => setNewEntry(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition text-sm min-h-[80px]" placeholder={t('Write your new entry here...')} />
                                <button onClick={handleAddEntry} disabled={!newEntry.trim()} className="w-full mt-2 px-4 py-2 text-sm font-bold text-white rounded-md transition-colors bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed">{t('Add Entry')}</button>
                            </div>
                        )}
                    </div>
                )}
                
                {journalEntries.map((entry, index) => {
                    const strippedEntry = stripMarkdown(entry);
                    const isThisEntrySpeaking = isSpeaking && currentlySpeakingText === strippedEntry;
                    const entryTitle = t('Entry #{count}', { count: journalEntries.length - index });
                    return (
                        <div key={index} className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/50 group">
                            <div className="flex items-start gap-2">
                                <div className="flex-1">
                                    <EditableField label={entryTitle} value={entry} onSave={(newContent) => onSaveEntry(index, newContent)} isEditable={isAdminEditable} as="textarea" className="narrative-text leading-relaxed whitespace-pre-wrap" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => onOpenTextReader(entryTitle, entry)} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white opacity-40 group-hover:opacity-100 transition-opacity" title={t('Read')}><BookOpenSolidIcon className="w-5 h-5" /></button>
                                    <button onClick={() => speak(strippedEntry)} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white opacity-40 group-hover:opacity-100 transition-opacity" title={isThisEntrySpeaking ? t("Stop speech") : t("Read aloud")}>
                                        {isThisEntrySpeaking ? <StopCircleIcon className="w-5 h-5 text-cyan-400 animate-pulse" /> : <SpeakerWaveIcon className="w-5 h-5" />}
                                    </button>
                                    {isAdminEditable && <button onClick={() => setEntryToDelete(index)} className="p-1 rounded-full text-gray-400 hover:bg-red-900/50 hover:text-red-300 opacity-40 group-hover:opacity-100 transition-opacity" title={t("Delete Entry")}><TrashIcon className="w-5 h-5" /></button>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isAdminEditable && journalEntries.length > 0 && (
                <footer className="mt-6 pt-4 border-t border-gray-700/60 flex flex-col sm:flex-row justify-end items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <input type="number" value={deleteCount} onChange={(e) => setDeleteCount(e.target.value)} min="1" max={journalEntries.length} className="w-20 bg-gray-700/50 border border-gray-600 rounded-md py-1 px-2 text-sm text-center text-white" aria-label={t("Number of entries to delete")} />
                        <button onClick={() => setIsDeleteOldestConfirmOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-yellow-300 bg-yellow-500/10 rounded-md hover:bg-yellow-500/20 transition-colors"><TrashIcon className="w-4 h-4" />{t("Delete Oldest")}</button>
                    </div>
                    <button onClick={() => setIsClearAllConfirmOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"><TrashIcon className="w-4 h-4" />{t("Clear All Entries")}</button>
                </footer>
            )}

            <ConfirmationModal isOpen={entryToDelete !== null} onClose={() => setEntryToDelete(null)} onConfirm={handleDeleteEntryConfirm} title={t("Delete Entry")}><p>{t("Are you sure you want to delete this journal entry?")}</p></ConfirmationModal>
            <ConfirmationModal isOpen={isDeleteOldestConfirmOpen} onClose={() => setIsDeleteOldestConfirmOpen(false)} onConfirm={handleDeleteOldestConfirm} title={t("Delete Oldest Entries")}><p>{t("Are you sure you want to delete the {count} oldest journal entries for {name}?", { count: deleteCount, name: character.name })}</p></ConfirmationModal>
            <ConfirmationModal isOpen={isClearAllConfirmOpen} onClose={() => setIsClearAllConfirmOpen(false)} onConfirm={handleClearAllConfirm} title={t("Clear All Entries")}><p>{t("Are you sure you want to delete all journal entries for {name}? This cannot be undone.", { name: character.name })}</p></ConfirmationModal>
        </>
    );
};

const ActivitiesView: React.FC<{
    character: NPC;
    isAdminEditable: boolean;
    clearAllCompletedNpcActivities: (npcId: string) => void;
    onDeleteCurrentActivity: (npcId: string) => void;
    onDeleteCompletedActivity: (npcId: string, activity: CompletedActivity) => void;
}> = ({ character, isAdminEditable, clearAllCompletedNpcActivities, onDeleteCurrentActivity, onDeleteCompletedActivity }) => {
    const { t } = useLocalization();
    const { currentActivity, completedActivities = [] } = character;
    const [confirmClear, setConfirmClear] = useState(false);
    const [confirmDeleteCurrent, setConfirmDeleteCurrent] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState<CompletedActivity | null>(null);

    const formatDuration = (totalMinutes: number): string => {
        const minutesNum = Math.round(totalMinutes);
        if (minutesNum < 1) return `0${t('min_short')}`;
    
        const hours = Math.floor(minutesNum / 60);
        const minutes = minutesNum % 60;
    
        const parts = [];
        if (hours > 0) {
            parts.push(`${hours}${t('h_short')}`);
        }
        if (minutes > 0) {
            parts.push(`${minutes}${t('min_short')}`);
        }
    
        if (parts.length === 0) return `0${t('min_short')}`;
        
        return parts.join(' ');
    };

    const handleClear = () => {
        clearAllCompletedNpcActivities(character.NPCId);
        setConfirmClear(false);
    };

    const handleDeleteCurrent = () => {
        onDeleteCurrentActivity(character.NPCId);
        setConfirmDeleteCurrent(false);
    };

    const handleDeleteCompleted = () => {
        if(activityToDelete) {
            onDeleteCompletedActivity(character.NPCId, activityToDelete);
        }
        setActivityToDelete(null);
    };
    
    const timeProgress = currentActivity && currentActivity.totalTimeCostMinutes > 0
    ? (currentActivity.timeSpentMinutes / currentActivity.totalTimeCostMinutes) * 100
    : 0;

    if (!currentActivity && completedActivities.length === 0) {
        return (
             <div className="text-center text-gray-500 p-6">
                <ClipboardDocumentListIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p>{t('no_activity_log_available')}</p>
            </div>
        );
    }

    return (
        <>
        <div className="space-y-6">
            {currentActivity && (
                <div>
                    <SectionHeader title={t('Active Activity')} icon={BoltIcon} />
                    <div className="bg-gray-700/50 p-4 rounded-lg group relative">
                        <h4 className="font-bold text-cyan-400 text-lg">{currentActivity.activityName}</h4>
                        <p className="text-sm text-gray-400 italic mt-1 mb-3">{currentActivity.description}</p>
                        
                        <div className="space-y-2 text-xs">
                             <div>
                                <div className="flex justify-between items-center text-gray-300 mb-1">
                                    <span className="font-medium">{t('Time Progress')}</span>
                                    <span className="font-mono">{formatDuration(currentActivity.timeSpentMinutes)} / {formatDuration(currentActivity.totalTimeCostMinutes)}</span>
                                </div>
                                <div className="w-full bg-gray-800/70 rounded-full h-2.5 overflow-hidden">
                                    <div className="bg-cyan-500 h-2.5 rounded-full" style={{width: `${timeProgress}%`}}></div>
                                </div>
                            </div>
                        </div>

                        {isAdminEditable && onDeleteCurrentActivity && (
                            <button
                                onClick={() => setConfirmDeleteCurrent(true)}
                                className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                title={t('Delete Activity')}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}
            
            <div>
                <SectionHeader title={t('Completed Activities')} icon={CheckCircleIcon} />
                {completedActivities.length > 0 ? (
                    <div className="space-y-3">
                        {completedActivities.map((activity, index) => {
                            const isSuccess = activity.finalOutcome.startsWith('Success');
                            return (
                            <div key={`${activity.activityName}-${index}`} className={`bg-gray-800/60 p-3 rounded-lg border-l-4 ${isSuccess ? 'border-green-600' : 'border-red-600'} group relative`}>
                                <div>
                                <h4 className={`font-semibold ${isSuccess ? 'text-green-300' : 'text-red-300'}`}>{activity.activityName}</h4>
                                <p className="text-xs text-gray-400">{t('Completed on turn {turn}', { turn: activity.completionTurn })} - {t(activity.finalOutcome as any)}</p>
                                <p className="text-sm text-gray-300 mt-1"><MarkdownRenderer content={activity.narrativeSummary} /></p>
                                </div>
                                {isAdminEditable && onDeleteCompletedActivity && (
                                    <button
                                        onClick={() => setActivityToDelete(activity)}
                                        className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                        title={t('Delete Activity')}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            )
                        })}
                        {isAdminEditable && clearAllCompletedNpcActivities && completedActivities.length > 0 && (
                             <button
                                onClick={() => setConfirmClear(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs bg-red-900/50 hover:bg-red-900/80 rounded-md text-red-300 font-semibold transition-colors mt-4"
                            >
                                <TrashIcon className="w-4 h-4" />
                                {t('Clear All Completed')}
                            </button>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center p-4">{!currentActivity ? t('no_activity_log_available') : t('No completed activities.')}</p>
                )}
            </div>
        </div>
        
        {/* Modals for confirmation */}
        <ConfirmationModal isOpen={confirmClear} onClose={() => setConfirmClear(false)} onConfirm={handleClear} title={t('Clear Completed Activities')}>
            <p>{t('Are you sure you want to clear all completed activities for this NPC?')}</p>
        </ConfirmationModal>
        <ConfirmationModal isOpen={confirmDeleteCurrent} onClose={() => setConfirmDeleteCurrent(false)} onConfirm={handleDeleteCurrent} title={t('Delete Activity')}>
            <p>{t('confirm_delete_current_activity_p1', { name: currentActivity?.activityName || '' })}</p>
        </ConfirmationModal>
        <ConfirmationModal isOpen={!!activityToDelete} onClose={() => setActivityToDelete(null)} onConfirm={handleDeleteCompleted} title={t('Delete Activity')}>
            <p>{t('confirm_delete_completed_activity_p1', { name: activityToDelete?.activityName || '' })}</p>
        </ConfirmationModal>
        </>
    );
};


const CharacterSheet: React.FC<CharacterSheetProps> = (props) => {
    const {
        character,
        playerCharacter,
        isViewOnly,
        gameSettings,
        initialView,
        ...rest
    } = props;
    const { t } = useLocalization();
    const isPlayer = 'playerId' in character;
    const isMyOwnSheet = isPlayer && character.playerId === playerCharacter.playerId;
    const [activeView, setActiveView] = useState(initialView || 'menu');
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);

    const characterId = useMemo(() => isPlayer ? (character as PlayerCharacter).playerId : (character as NPC).NPCId, [character, isPlayer]);

    useEffect(() => {
        setActiveView(initialView || 'menu');
    }, [characterId, initialView]);

    const handleSwitchView = (view: string) => {
        setActiveView(view);
    };

    const equippedItemIds = useMemo(() => new Set(Object.values(character.equippedItems || {}).filter(Boolean)), [character.equippedItems]);
    
    const equippedItems = useMemo(() => {
        if (!character.inventory) return [];
        return character.inventory.filter(item => item && item.existedId && equippedItemIds.has(item.existedId));
    }, [character.inventory, equippedItemIds]);

    const { equipmentBonuses, passiveSkillBonuses, situationalBonuses } = useMemo(() => {
        const eqBonuses: Record<string, number> = {};
        const skillBonuses: Record<string, number> = {};
        const sitBonuses: { item: Item, bonuses: StructuredBonus[] }[] = [];

        equippedItems.forEach(item => {
            (item.structuredBonuses || []).forEach(bonus => {
                if (bonus.bonusType === 'Characteristic' && bonus.valueType === 'Flat' && bonus.application === 'Permanent') {
                    eqBonuses[bonus.target] = (eqBonuses[bonus.target] || 0) + bonus.value;
                } else if (bonus.application === 'Conditional') {
                    const existing = sitBonuses.find(i => i.item.existedId === item.existedId);
                    if(existing) {
                        existing.bonuses.push(bonus);
                    } else {
                        sitBonuses.push({ item, bonuses: [bonus] });
                    }
                }
            });
        });

        (character.passiveSkills || []).forEach(skill => {
            (skill.structuredBonuses || []).forEach(bonus => {
                if (bonus.bonusType === 'Characteristic' && bonus.valueType === 'Flat' && bonus.application === 'Permanent') {
                    skillBonuses[bonus.target] = (skillBonuses[bonus.target] || 0) + bonus.value;
                }
            });
        });

        return { equipmentBonuses: eqBonuses, passiveSkillBonuses: skillBonuses, situationalBonuses: sitBonuses };
    }, [equippedItems, character.passiveSkills]);

    const derivedStats = useMemo(() => {
        const { characteristics, level } = character;
        if (!characteristics) return null;
        
        const levelAttackBonus = 5 + Math.floor((level || 1) / 10) * 2;
        const levelResistance = Math.floor((level || 1) / 10) * 2;
        const strAttackBonus = Math.floor(characteristics.modifiedStrength / 2.5);
        const precisionAttackBonus = Math.floor(characteristics.modifiedDexterity / 2.5);
        const speedAttackBonus = Math.floor(characteristics.modifiedSpeed / 2.5);
        const arcaneAttackBonus = Math.floor(characteristics.modifiedIntelligence / 2.5);
        const willpowerAttackBonus = Math.floor(characteristics.modifiedWisdom / 2.5);
        const divineAttackBonus = Math.floor(characteristics.modifiedFaith / 2.5);
        const conResistance = Math.floor(characteristics.modifiedConstitution / 10);
        const critDamageLuckBonus = Math.floor(characteristics.modifiedLuck / 2);
        const finalCritMultiplier = 1.5 + (critDamageLuckBonus / 100);

        return {
            levelAttackBonus,
            levelResistance,
            strAttackBonus,
            precisionAttackBonus,
            speedAttackBonus,
            arcaneAttackBonus,
            willpowerAttackBonus,
            divineAttackBonus,
            conResistance,
            critDamageLuckBonus,
            finalCritMultiplier,
            totalMeleeAttackBonus: levelAttackBonus + strAttackBonus,
            totalPrecisionAttackBonus: levelAttackBonus + precisionAttackBonus,
            totalSpeedAttackBonus: levelAttackBonus + speedAttackBonus,
            totalArcaneAttackBonus: levelAttackBonus + arcaneAttackBonus,
            totalWillpowerAttackBonus: levelAttackBonus + willpowerAttackBonus,
            totalDivineAttackBonus: levelAttackBonus + divineAttackBonus,
            totalGeneralResistance: levelResistance + conResistance,
        };
    }, [character]);
    
    const canUpgrade = isPlayer && !isViewOnly && (character as PlayerCharacter).attributePoints > 0;
    const isAdminEditable = gameSettings.allowHistoryManipulation;
    
    const tabs = useMemo(() => {
        const allTabs: { name: string, icon: React.ElementType, show: boolean }[] = [
            { name: 'Profile', icon: UserCircleIcon, show: true },
            { name: 'Stats', icon: AcademicCapIcon, show: true },
            { name: 'Combat', icon: FireIcon, show: true },
            { name: 'Skills', icon: SparklesIcon, show: true },
            { name: 'Inventory', icon: CubeIcon, show: true },
            { name: 'Bonuses', icon: SparklesSolidIcon, show: true },
            { name: 'Conditions', icon: ExclamationTriangleIcon, show: true },
            { name: 'Memories', icon: HeartIcon, show: !isPlayer && !!(character as NPC).unlockedMemories && (character as NPC).unlockedMemories!.length > 0 },
            { name: 'Fate', icon: StarIcon, show: !isPlayer && !!(character as NPC).fateCards && (character as NPC).fateCards!.length > 0 },
            { name: 'Journal', icon: BookOpenIcon, show: !isPlayer },
            { name: 'Activities', icon: ClipboardDocumentListIcon, show: !isPlayer }
        ];
        return allTabs.filter(tab => tab.show);
    }, [isPlayer, character]);
    
    const simpleOpenImageModalForInventory = useCallback((prompt: string) => {
        props.onOpenImageModal(prompt, prompt);
    }, [props.onOpenImageModal]);

    const renderViewContent = () => {
        const isAdmin = isAdminEditable && !isViewOnly;
        switch (activeView) {
            case 'Profile': return <ProfileView {...rest} character={character} playerCharacter={playerCharacter} isPlayer={isPlayer} isAdminEditable={isAdmin} onSwitchView={handleSwitchView} isViewOnly={isViewOnly} onRegenerateId={props.onRegenerateId} gameSettings={gameSettings} />;
            case 'Stats': return <StatsView {...rest} character={character} canUpgrade={canUpgrade} equipmentBonuses={equipmentBonuses} passiveSkillBonuses={passiveSkillBonuses} />;
            case 'Combat': return <CombatView {...rest} derivedStats={derivedStats} />;
            case 'Skills': return <SkillsView {...rest} character={character} isPlayer={isPlayer} isAdminEditable={isAdmin} />;
            case 'Inventory': return <InventoryView {...rest} character={character} playerCharacter={playerCharacter} isPlayer={isMyOwnSheet} isCompanion={!isPlayer && (character as NPC).progressionType === 'Companion'} equippedItemIds={equippedItemIds} gameSettings={gameSettings} />;
            case 'Bonuses': return <BonusesView {...rest} situationalBonuses={situationalBonuses} />;
            case 'Conditions': return <ConditionsView {...rest} character={character} isPlayer={isPlayer} isAdminEditable={isAdmin} />;
            case 'Memories': return <MemoriesView {...rest} character={character as NPC} isPlayer={isPlayer} isAdminEditable={isAdmin} />;
            case 'Fate': return <FateView {...rest} character={character as NPC} isPlayer={isPlayer} gameSettings={gameSettings} />;
            case 'Journal': return <JournalView character={character as NPC} isAdminEditable={isAdmin} onEditNpcData={props.onEditNpcData!} onOpenTextReader={props.onOpenTextReader} />;
            case 'Activities': return <ActivitiesView character={character as NPC} isAdminEditable={isAdmin} clearAllCompletedNpcActivities={props.clearAllCompletedNpcActivities} onDeleteCurrentActivity={props.onDeleteCurrentActivity} onDeleteCompletedActivity={props.onDeleteCompletedActivity} />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isHeaderExpanded ? 'max-h-[500px] mb-4' : 'max-h-0'}`}>
                <div className="p-4 md:p-6 bg-gray-800/50 rounded-lg">
                    <CharacterSheetHeader {...props} isAdminEditable={isAdminEditable} onSwitchView={handleSwitchView} />
                </div>
            </div>
            
            <div className="flex-1 flex flex-col min-h-0">
                {activeView === 'menu' ? (
                    <div className="p-4 md:p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-cyan-400 narrative-text flex items-center gap-2">
                               <UserCircleIcon className="w-6 h-6" /> {t('Character Menu')}
                            </h3>
                             <button onClick={() => setIsHeaderExpanded(!isHeaderExpanded)} title={t(isHeaderExpanded ? 'Collapse Header' : 'Expand Header')} className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 transition-colors">
                                {isHeaderExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {tabs.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveView(tab.name)}
                                    className="bg-slate-800/70 hover:bg-slate-700/90 rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 transform hover:scale-105 border border-slate-700 hover:border-cyan-500"
                                >
                                    <tab.icon className="w-8 h-8 text-cyan-400" />
                                    <span className="font-semibold text-gray-200">{t(tab.name as any)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-shrink-0 border-b border-gray-700 flex items-center p-2 gap-3">
                            <button onClick={() => setActiveView('menu')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white p-2 rounded-md transition-colors hover:bg-gray-700/50">
                                <ArrowUturnLeftIcon className="w-5 h-5" />
                                {t('back_to_menu')}
                            </button>
                            <div className="w-px h-6 bg-gray-700"></div>
                            <h3 className="text-xl font-bold text-cyan-400 narrative-text flex-1">{t(activeView as any)}</h3>
                            <button onClick={() => setIsHeaderExpanded(!isHeaderExpanded)} title={t(isHeaderExpanded ? 'Collapse Header' : 'Expand Header')} className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 transition-colors">
                                {isHeaderExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 md:p-6">
                            {renderViewContent()}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CharacterSheet;