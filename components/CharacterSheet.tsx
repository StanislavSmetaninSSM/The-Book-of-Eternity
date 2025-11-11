import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PlayerCharacter, NPC, GameSettings, Item, StructuredBonus, Faction, Location, UnlockedMemory, CompletedActivity, ImageCacheEntry } from '../types';
import { useLocalization } from '../context/LocalizationContext';
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
    UserGroupIcon,
    CurrencyDollarIcon,
    ScaleIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolidIcon, SpeakerWaveIcon, StopCircleIcon, BookOpenIcon as BookOpenSolidIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import ImageRenderer from './ImageRenderer';
import StatBar from './CharacterSheet/Shared/StatBar';


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
    onDeleteActiveEffect: (characterType: 'player' | 'npc', characterId: string | null, effectId: string) => void;
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
    imageCache: Record<string, ImageCacheEntry>;
    onImageGenerated: (prompt: string, src: string, sourceProvider: ImageCacheEntry['sourceProvider'], sourceModel?: string) => void;
    encounteredFactions: Faction[];
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
    isLoading: boolean;
}

interface CharacterSheetHeaderProps extends Omit<CharacterSheetProps, 'character' | 'isViewOnly' | 'onSwitchView'> {
    character: PlayerCharacter | NPC;
    isViewOnly: boolean;
    isAdminEditable: boolean;
    onSwitchView: (view: string) => void;
}

const CharacterSheetHeader: React.FC<CharacterSheetHeaderProps> = ({
    character,
    isViewOnly,
    isAdminEditable,
    onEditPlayerData,
    onEditNpcData,
    onOpenImageModal,
    updatePlayerPortrait,
    updateNpcPortrait,
    imageCache,
    onImageGenerated,
    gameSettings,
    onOpenDetailModal,
    onSwitchView,
    isLoading,
    playerCharacter
}) => {
    const { t } = useLocalization();
    const isPlayer = 'playerId' in character;
    const canUpgrade = isPlayer && !isViewOnly && (character as PlayerCharacter).attributePoints > 0;

    const [isEditingAge, setIsEditingAge] = useState(false);
    const [editedAge, setEditedAge] = useState(String(character.age));

    useEffect(() => {
        if (!isEditingAge) {
            setEditedAge(String(character.age));
        }
    }, [character.age, isEditingAge]);

    const handleNameSave = (val: any) => {
        if (isPlayer && onEditPlayerData) onEditPlayerData('name', val);
        else if (!isPlayer && onEditNpcData) onEditNpcData((character as NPC).NPCId, 'name', val);
    };
    
    const handleAgeSave = () => {
        const newAge = parseInt(editedAge, 10);
        if (!isNaN(newAge) && newAge >= 0) {
            if (isPlayer && onEditPlayerData) {
                onEditPlayerData('age', newAge);
            } else if (!isPlayer && onEditNpcData) {
                onEditNpcData((character as NPC).NPCId, 'age', newAge);
            }
        }
        setIsEditingAge(false);
    };

    const portraitPrompt = useMemo(() => {
        if (isPlayer) {
            return (character as PlayerCharacter).portrait || (character as PlayerCharacter).image_prompt;
        } else {
            return (character as NPC).custom_image_prompt || (character as NPC).image_prompt;
        }
    }, [character, isPlayer]);
    
    const originalImagePrompt = useMemo(() => {
        if (isPlayer) {
            return (character as PlayerCharacter).image_prompt;
        } else {
            return (character as NPC).image_prompt;
        }
    }, [character, isPlayer]);

    const handleOpenModal = useCallback(() => {
        if (isLoading || !onOpenImageModal || !portraitPrompt) return;

        let onClearCustom: (() => void) | undefined;
        let onUpload: ((base64: string) => void) | undefined;

        if (isPlayer && updatePlayerPortrait) {
            onClearCustom = () => updatePlayerPortrait((character as PlayerCharacter).playerId, { custom: null });
            onUpload = (base64) => updatePlayerPortrait((character as PlayerCharacter).playerId, { custom: base64 });
        } 
        else if (!isPlayer && updateNpcPortrait) {
            onClearCustom = () => updateNpcPortrait!((character as NPC).NPCId, { custom: null });
            onUpload = (base64) => updateNpcPortrait!((character as NPC).NPCId, { custom: base64 });
        }
        
        onOpenImageModal(portraitPrompt, originalImagePrompt || portraitPrompt, onClearCustom, onUpload);
    }, [character, isPlayer, onOpenImageModal, portraitPrompt, originalImagePrompt, updatePlayerPortrait, updateNpcPortrait, isLoading]);


    const handleHealthClick = () => {
        onOpenDetailModal(t('Health'), {
            type: 'derivedStat',
            name: t('Health'),
            value: `${character.currentHealth} / ${character.maxHealth}`,
            breakdown: [
                { label: t('Base Health'), value: '100' },
                { label: t('Constitution Bonus'), value: `+${Math.floor(character.characteristics.standardConstitution * 2.0)}` },
                { label: t('Strength Bonus'), value: `+${Math.floor(character.characteristics.standardStrength * 1.0)}` }
            ],
            description: t('primary_stat_description_health')
        });
    };
    
    const handleEnergyClick = () => {
        if ('currentEnergy' in character) {
            onOpenDetailModal(t('Energy'), {
                type: 'derivedStat',
                name: t('Energy'),
                value: `${character.currentEnergy} / ${character.maxEnergy}`,
                breakdown: [
                    { label: t('Base Energy'), value: '100' },
                    { label: t('Constitution Bonus'), value: `+${Math.floor(character.characteristics.standardConstitution * 0.75)}` },
                    { label: t('Intelligence Bonus'), value: `+${Math.floor(character.characteristics.standardIntelligence * 0.75)}` },
                    { label: t('Wisdom Bonus'), value: `+${Math.floor(character.characteristics.standardWisdom * 0.75)}` },
                    { label: t('Faith Bonus'), value: `+${Math.floor(character.characteristics.standardFaith * 0.75)}` }
                ],
                description: t('primary_stat_description_energy')
            });
        }
    };

    const handleExperienceClick = () => {
        if ('experience' in character) {
            onOpenDetailModal(t('Experience'), {
                type: 'derivedStat',
                name: t('Experience'),
                value: `${(character as PlayerCharacter).experience} / ${(character as PlayerCharacter).experienceForNextLevel}`,
                breakdown: [
                    { label: t('Formula for Next Level'), value: 'floor(100 * (Lvl ^ 2.5))' }
                ],
                description: t('primary_stat_description_experience')
            });
        }
    };
    
    const handleWeightClick = () => {
        onOpenDetailModal(t('Weight'), {
            type: 'derivedStat',
            name: t('Weight'),
            value: `${character.totalWeight?.toFixed(1)} / ${character.maxWeight?.toFixed(0)} kg`,
            breakdown: [
                { label: t('Base Capacity'), value: `30 ${t('kg_short')}` },
                { label: t('Strength Bonus'), value: `+${Math.floor(character.characteristics.standardStrength * 1.8)} ${t('kg_short')}` },
                { label: t('Constitution Bonus'), value: `+${Math.floor(character.characteristics.standardConstitution * 0.4)} ${t('kg_short')}` },
                { label: '---', value: '' }, // Separator
                { label: t('Max Weight (Overload Threshold)'), value: `${character.maxWeight?.toFixed(0)} ${t('kg_short')}` },
                { label: t('Critical Weight'), value: `${((character.maxWeight || 0) + ((character as PlayerCharacter).criticalExcessWeight || 15)).toFixed(0)} ${t('kg_short')}` },
            ],
            description: t('primary_stat_description_weight')
        });
    };

    const handleRelationshipClick = () => {
        const tiers = [
            { lowerBound: -400, upperBound: -201, name: t('relationship_tier_implacable_foe'), desc: t('relationship_desc_implacable_foe') },
            { lowerBound: -200, upperBound: -51, name: t('relationship_tier_adversary'), desc: t('relationship_desc_adversary') },
            { lowerBound: -50, upperBound: -1, name: t('relationship_tier_dislike'), desc: t('relationship_desc_dislike') },
            { lowerBound: 0, upperBound: 100, name: t('relationship_tier_neutral'), desc: t('relationship_desc_neutral') },
            { lowerBound: 101, upperBound: 250, name: t('relationship_tier_familiarity_trust'), desc: t('relationship_desc_familiarity_trust') },
            { lowerBound: 251, upperBound: 350, name: t('relationship_tier_deep_bond'), desc: t('relationship_desc_deep_bond') },
            { lowerBound: 351, upperBound: 400, name: t('relationship_tier_legendary_bond'), desc: t('relationship_desc_legendary_bond') },
        ];
        onOpenDetailModal(t('Relationship'), {
            type: 'relationship',
            tiers: tiers,
            current: (character as NPC).relationshipLevel
        });
    };
    
    return (
        <div className="grid grid-cols-[208px_1fr] gap-x-6 items-start">
            {/* Left Column: Avatar */}
            <div className="w-52 h-72 rounded-md overflow-hidden bg-gray-900 group relative cursor-pointer flex-shrink-0" onClick={handleOpenModal}>
                <ImageRenderer 
                    prompt={portraitPrompt} 
                    originalTextPrompt={originalImagePrompt}
                    alt={character.name} 
                    className="w-full h-full object-cover"
                    imageCache={imageCache} 
                    onImageGenerated={onImageGenerated} 
                    width={512} 
                    height={768}
                    gameSettings={gameSettings}
                    gameIsLoading={isLoading}
                />
            </div>

            {/* Right Column: Info */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Name & Level */}
                <div>
                    <EditableField
                        label={t('Name')}
                        value={character.name}
                        isEditable={isAdminEditable && !isViewOnly}
                        onSave={handleNameSave}
                        as="input"
                        className="font-bold text-3xl text-cyan-400 narrative-text"
                    />
                    {character.level !== undefined && (
                        <div className="mt-1">
                            <span className="font-bold px-2 py-0.5 rounded-md bg-cyan-600 text-white text-xs whitespace-nowrap">
                                {t('Lvl_short')} {character.level}
                            </span>
                        </div>
                    )}
                </div>
                
                {/* Sub-info */}
                <div className="text-gray-400 text-sm mt-2 flex items-center gap-1 flex-wrap">
                    <span>{t(character.race as any)} {t(character.class as any)},&nbsp;</span>
                    {isAdminEditable && !isViewOnly ? (
                        isEditingAge ? (
                            <input
                                type="number"
                                value={editedAge}
                                onChange={(e) => setEditedAge(e.target.value)}
                                onBlur={handleAgeSave}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAgeSave(); } if (e.key === 'Escape') { setIsEditingAge(false); setEditedAge(String(character.age)); } }}
                                className="w-16 bg-gray-700/50 border border-gray-600 rounded-md p-0.5 text-center"
                                autoFocus
                            />
                        ) : (
                            <span onClick={() => setIsEditingAge(true)} className="cursor-pointer hover:bg-gray-700/50 px-1 rounded-md transition-colors relative group">
                                {character.age}
                                <PencilSquareIcon className="inline-block align-middle ml-1 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                        )
                    ) : (
                        <span>{character.age}</span>
                    )}
                    <span>&nbsp;{t('years_old')}</span>
                </div>
                
                {/* Stat Bars (Vertical Stack) */}
                <div className="mt-4 space-y-3">
                    <StatBar
                        label={t('Health')}
                        value={character.currentHealth}
                        max={character.maxHealth}
                        color="bg-red-500"
                        icon={HeartIcon}
                        onClick={handleHealthClick}
                        title={t("Click to view details about Health")}
                        character={character}
                    />
                    {'currentEnergy' in character && character.currentEnergy !== undefined && (
                        <StatBar
                            label={t('Energy')}
                            value={character.currentEnergy}
                            max={character.maxEnergy!}
                            color="bg-blue-500"
                            icon={BoltIcon}
                            onClick={handleEnergyClick}
                            title={t("Click to view details about Energy")}
                            character={character}
                        />
                    )}
                     {'experience' in character && character.experience !== undefined && (
                        <StatBar
                            label={t('Experience')}
                            value={character.experience}
                            max={character.experienceForNextLevel!}
                            color="bg-yellow-500"
                            icon={StarIcon}
                            onClick={handleExperienceClick}
                            title={t("Click to view details about Experience")}
                            character={character}
                        />
                    )}
                    {isPlayer && 'money' in character && (
                        <div title={t('Money')}>
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <CurrencyDollarIcon className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm font-medium text-gray-300">{t('Money')}</span>
                                </div>
                                <span className="text-sm font-mono text-gray-200 font-semibold">
                                    {character.money} {t(gameSettings.gameWorldInformation.currencyName as any)}
                                </span>
                            </div>
                            {/* Spacer to align with other stat bars that have a progress bar */}
                            <div className="h-2.5" />
                        </div>
                    )}
                     {character.totalWeight !== undefined && character.maxWeight !== undefined && (
                        <StatBar
                            label={t('Weight')}
                            value={character.totalWeight}
                            max={character.maxWeight}
                            threshold={character.maxWeight}
                            color="bg-orange-500"
                            unit={t('kg_short')}
                            icon={ScaleIcon}
                            onClick={handleWeightClick}
                            title={t("Click to view details about Weight")}
                            character={character}
                        />
                    )}
                     {!isPlayer && (character as NPC).relationshipLevel !== undefined && (
                        <StatBar
                            label={t('Relationship')}
                            value={(character as NPC).relationshipLevel}
                            min={-400}
                            max={400}
                            color="bg-pink-500"
                            icon={HeartIcon}
                            onClick={handleRelationshipClick}
                            title={t("Click to view details about Relationship")}
                            character={character}
                        />
                    )}
                </div>
                {canUpgrade && (
                    <div className="mt-4">
                        <button
                            onClick={() => onSwitchView('Stats')}
                            className="w-full p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center animate-pulse hover:bg-yellow-500/20 transition-colors"
                        >
                            <p className="font-bold text-yellow-300">
                                {t("You have {points} attribute points to spend!", { points: (character as PlayerCharacter).attributePoints })}
                            </p>
                            <p className="text-xs text-yellow-400/80">{t("Click here to go to the Stats tab.")}</p>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
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

interface ChronicleViewProps {
    character: PlayerCharacter;
    isAdminEditable: boolean;
    onEditPlayerData: (field: keyof PlayerCharacter, value: any) => void;
    onOpenTextReader: (title: string, content: string) => void;
}

const ChronicleView: React.FC<ChronicleViewProps> = ({ character, isAdminEditable, onEditPlayerData, onOpenTextReader }) => {
    const { t } = useLocalization();
    const { speak, isSpeaking, currentlySpeakingText } = useSpeech();

    const [fontSizeIndex, setFontSizeIndex] = useState(2);
    const FONT_SIZES = [12, 14, 16, 18, 20, 24];
    const FONT_SIZE_CLASSES = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];

    const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
    const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);
    const [newEntry, setNewEntry] = useState('');
    const [isAddEntryCollapsed, setIsAddEntryCollapsed] = useState(true);

    const chronicleEntries = character.characterChronicle || [];

    const onSaveEntry = (index: number, newContent: string) => {
        const newEntries = [...(chronicleEntries || [])];
        newEntries[index] = newContent;
        onEditPlayerData('characterChronicle', newEntries);
    };
    
    const onDeleteEntry = (index: number) => {
        const newEntries = (chronicleEntries || []).filter((_, i) => i !== index);
        onEditPlayerData('characterChronicle', newEntries);
    };

    const onClearAll = () => {
        onEditPlayerData('characterChronicle', []);
    };
    
    const onAddEntry = (content: string) => {
        const newEntries = [content, ...(chronicleEntries || [])];
        onEditPlayerData('characterChronicle', newEntries);
    };

    const handleDeleteEntryConfirm = () => {
        if (entryToDelete !== null) {
            onDeleteEntry(entryToDelete);
        }
        setEntryToDelete(null);
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

    if (chronicleEntries.length === 0 && !isAdminEditable) {
        return (
            <div className="text-center text-gray-500 p-6">
                <BookOpenIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p>{t('no_chronicle_entries_player')}</p>
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
                
                {chronicleEntries.map((entry, index) => {
                    if (typeof entry !== 'string') return null; // Handle potential nulls
                    const strippedEntry = stripMarkdown(entry);
                    const isThisEntrySpeaking = isSpeaking && currentlySpeakingText === strippedEntry;
                    const entryTitle = t('Entry #{count}', { count: chronicleEntries.length - index });
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

            {isAdminEditable && chronicleEntries.length > 0 && (
                <footer className="mt-6 pt-4 border-t border-gray-700/60 flex flex-col sm:flex-row justify-end items-center gap-4 flex-wrap">
                    <button onClick={() => setIsClearAllConfirmOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"><TrashIcon className="w-4 h-4" />{t("Clear All Entries")}</button>
                </footer>
            )}

            <ConfirmationModal isOpen={entryToDelete !== null} onClose={() => setEntryToDelete(null)} onConfirm={handleDeleteEntryConfirm} title={t("Delete Entry")}><p>{t("Are you sure you want to delete this chronicle entry?")}</p></ConfirmationModal>
            <ConfirmationModal isOpen={isClearAllConfirmOpen} onClose={() => setIsClearAllConfirmOpen(false)} onConfirm={handleClearAllConfirm} title={t("Clear All Entries")}><p>{t("Are you sure you want to delete all chronicle entries for {name}? This cannot be undone.", { name: character.name })}</p></ConfirmationModal>
        </>
    );
};

interface ActivitiesViewProps {
    character: NPC;
    isAdminEditable: boolean;
    clearAllCompletedNpcActivities: (npcId: string) => void;
    onDeleteCurrentActivity: (npcId: string) => void;
    onDeleteCompletedActivity: (npcId: string, activity: CompletedActivity) => void;
}

const ActivitiesView: React.FC<ActivitiesViewProps> = ({ character, isAdminEditable, clearAllCompletedNpcActivities, onDeleteCurrentActivity, onDeleteCompletedActivity }) => {
    const { t } = useLocalization();
    const { currentActivity, completedActivities = [] } = character;
    const [confirmClear, setConfirmClear] = useState(false);
    const [confirmDeleteCurrent, setConfirmDeleteCurrent] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState<CompletedActivity | null>(null);

    const formatDuration = (totalMinutes: number, t: (key: string) => string): string => {
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

    return (
        <>
            <div>
                <SectionHeader title={t('Active Activity')} icon={BoltIcon} />
                {currentActivity ? (
                    <div className="bg-gray-900/40 p-4 rounded-lg border border-cyan-700/50 group relative">
                        <h4 className="font-bold text-cyan-400 text-lg">{currentActivity.activityName}</h4>
                        <p className="text-sm text-gray-400 italic mt-1 mb-3">{currentActivity.description}</p>
                        
                        <div className="space-y-3 text-xs">
                            <div>
                                <div className="flex justify-between items-center text-gray-300 mb-1">
                                    <span className="font-medium">{t('Time Progress')}</span>
                                    <span className="font-mono">{formatDuration(currentActivity.timeSpentMinutes, t)} / {formatDuration(currentActivity.totalTimeCostMinutes, t)}</span>
                                </div>
                                <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                                    <div className="bg-cyan-500 h-2.5 rounded-full" style={{width: `${(currentActivity.timeSpentMinutes / currentActivity.totalTimeCostMinutes) * 100}%`}}></div>
                                </div>
                            </div>
                        </div>
                        {isAdminEditable && (
                            <button
                                onClick={() => setConfirmDeleteCurrent(true)}
                                className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                title={t('Delete Activity')}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center p-4">{t('No active activity.')}</p>
                )}
            </div>

            {completedActivities.length > 0 && (
                <div className="mt-6">
                    <SectionHeader title={t('Completed Activities')} icon={CheckCircleIcon} />
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
                                    {isAdminEditable && (
                                        <button
                                            onClick={() => setActivityToDelete(activity)}
                                            className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                            title={t('Delete Activity')}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {isAdminEditable && (
                        <div className="mt-4">
                             <button
                                onClick={() => setConfirmClear(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs bg-red-900/50 hover:bg-red-900/80 rounded-md text-red-300 font-semibold transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                                {t('Clear All Completed')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmClear}
                onClose={() => setConfirmClear(false)}
                onConfirm={() => { clearAllCompletedNpcActivities(character.NPCId); setConfirmClear(false); }}
                title={t('Clear Completed Activities')}
            >
                <p>{t('Are you sure you want to clear all completed activities for this NPC?')}</p>
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={confirmDeleteCurrent}
                onClose={() => setConfirmDeleteCurrent(false)}
                onConfirm={() => { onDeleteCurrentActivity(character.NPCId); setConfirmDeleteCurrent(false); }}
                title={t('Delete Activity')}
            >
                <p>{t('confirm_delete_current_activity_p1', { name: currentActivity?.activityName || '' })}</p>
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={!!activityToDelete}
                onClose={() => setActivityToDelete(null)}
                onConfirm={() => { onDeleteCompletedActivity(character.NPCId, activityToDelete!); setActivityToDelete(null); }}
                title={t('Delete Activity')}
            >
                 <p>{t('confirm_delete_completed_activity_p1', { name: activityToDelete?.activityName || '' })}</p>
            </ConfirmationModal>
        </>
    );
};

const CharacterSheet: React.FC<CharacterSheetProps> = (props) => {
    const { character, initialView, onEditPlayerData } = props;
    const { t } = useLocalization();
    const [activeView, setActiveView] = useState(initialView || 'menu');
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

    const isPlayer = 'playerId' in character;
    const isCompanion = !isPlayer && (character as NPC).progressionType === 'Companion';
    const isAdminEditable = props.gameSettings.allowHistoryManipulation && !props.isLoading;

    const derivedCombatStats = useMemo(() => {
        const { characteristics, level } = character;
        if (!characteristics) return null;
        
        const { modifiedStrength, modifiedDexterity, modifiedConstitution, modifiedIntelligence, modifiedWisdom, modifiedFaith, modifiedLuck, modifiedSpeed } = characteristics;

        const levelAttackBonus = 5 + Math.floor(level / 10) * 2;
        const levelResistance = Math.floor(level / 10) * 2;

        const strAttackBonus = Math.floor(modifiedStrength / 2.5);
        const precisionAttackBonus = Math.floor(modifiedDexterity / 2.5);
        const speedAttackBonus = Math.floor(modifiedSpeed / 2.5);
        const arcaneAttackBonus = Math.floor(modifiedIntelligence / 2.5);
        const willpowerAttackBonus = Math.floor(modifiedWisdom / 2.5);
        const divineAttackBonus = Math.floor(modifiedFaith / 2.5);
        const conResistance = Math.floor(modifiedConstitution / 10);
        const critDamageLuckBonus = Math.floor(modifiedLuck / 2);
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
    
    const equipmentBonuses = useMemo(() => {
        const bonuses: Record<string, number> = {};
        if (!character.equippedItems) return bonuses;

        Object.values(character.equippedItems).forEach(itemId => {
            if (!itemId) return;
            const item = character.inventory?.find(i => i.existedId === itemId);
            if (!item) return;

            (item.structuredBonuses || []).forEach(bonus => {
                if (bonus.bonusType === 'Characteristic' && bonus.valueType === 'Flat' && typeof bonus.value === 'number') {
                    const char = bonus.target.toLowerCase();
                    bonuses[char] = (bonuses[char] || 0) + bonus.value;
                }
            });
        });
        return bonuses;
    }, [character.equippedItems, character.inventory]);

    const passiveSkillBonuses = useMemo(() => {
        const bonuses: Record<string, number> = {};
        (character.passiveSkills || []).forEach(skill => {
            (skill.structuredBonuses || []).forEach(bonus => {
                if (bonus.bonusType === 'Characteristic' && bonus.valueType === 'Flat' && typeof bonus.value === 'number') {
                     const char = bonus.target.toLowerCase();
                     bonuses[char] = (bonuses[char] || 0) + bonus.value;
                }
            });
        });
        return bonuses;
    }, [character.passiveSkills]);

    const situationalBonuses = useMemo(() => {
        const bonuses: { item: Item, bonuses: StructuredBonus[] }[] = [];
        if (!character.equippedItems) return bonuses;
        Object.values(character.equippedItems).forEach(itemId => {
            if (!itemId) return;
            const item = character.inventory?.find(i => i.existedId === itemId);
            if (!item || !item.structuredBonuses) return;

            const conditional = item.structuredBonuses.filter(b => b.application === 'Conditional');
            if (conditional.length > 0) {
                bonuses.push({ item, bonuses: conditional });
            }
        });
        return bonuses;
    }, [character.equippedItems, character.inventory]);

    const equippedItemIds = useMemo(() => new Set(Object.values(character.equippedItems || {}).filter(Boolean)), [character.equippedItems]);
    
    const menuItems = useMemo(() => [
        { name: 'Profile', icon: UserCircleIcon, view: 'Profile' },
        { name: 'Stats', icon: ShieldCheckIcon, view: 'Stats' },
        { name: 'Combat', icon: FireIcon, view: 'Combat' },
        { name: 'Skills', icon: SparklesIcon, view: 'Skills' },
        { name: 'Inventory', icon: CubeIcon, view: 'Inventory' },
        { name: 'Conditions', icon: ExclamationTriangleIcon, view: 'Conditions' },
        { name: 'Bonuses', icon: HeartIcon, view: 'Bonuses', show: situationalBonuses.length > 0 },
        { name: 'Memories', icon: AcademicCapIcon, view: 'Memories', show: !isPlayer && !!(character as NPC).unlockedMemories && (character as NPC).unlockedMemories!.length > 0 },
        { name: 'Fate', icon: StarIcon, view: 'Fate', show: !isPlayer && !!(character as NPC).fateCards && (character as NPC).fateCards!.length > 0 },
        { name: 'Journal', icon: BookOpenIcon, view: 'Journal', show: !isPlayer && (isAdminEditable || (!!(character as NPC).journalEntries && (character as NPC).journalEntries!.length > 0)) },
        { name: 'Chronicle', icon: BookOpenIcon, view: 'Chronicle', show: isPlayer },
        { name: 'Activities', icon: ClipboardDocumentListIcon, view: 'Activities', show: !isPlayer },
    ].filter(item => item.show !== false), [isPlayer, situationalBonuses, character, isAdminEditable]);

    const handleSwitchView = (view: string) => {
        setActiveView(view);
    };

    const renderContent = () => {
        switch (activeView) {
            case 'Profile': return <ProfileView {...props} isPlayer={isPlayer} isAdminEditable={isAdminEditable} onSwitchView={handleSwitchView} />;
            case 'Stats': return <StatsView character={character} canUpgrade={isPlayer && !props.isViewOnly && (character as PlayerCharacter).attributePoints > 0} onSpendAttributePoint={props.onSpendAttributePoint} onOpenDetailModal={props.onOpenDetailModal} equipmentBonuses={equipmentBonuses} passiveSkillBonuses={passiveSkillBonuses} />;
            case 'Combat': return <CombatView derivedStats={derivedCombatStats} onOpenDetailModal={props.onOpenDetailModal} />;
            case 'Skills': return <SkillsView character={character} isPlayer={isPlayer} isViewOnly={props.isViewOnly} isAdminEditable={isAdminEditable} onOpenDetailModal={props.onOpenDetailModal} onDeleteActiveSkill={props.onDeleteActiveSkill} onDeletePassiveSkill={props.onDeletePassiveSkill} updateActiveSkillSortOrder={props.updateActiveSkillSortOrder} updatePassiveSkillSortOrder={props.updatePassiveSkillSortOrder} onEditNpcData={props.onEditNpcData} />;
            case 'Inventory': return <InventoryView character={character} playerCharacter={props.playerCharacter} isPlayer={isPlayer} isCompanion={isCompanion} onOpenInventory={props.onOpenInventory} onOpenNpcInventory={props.onOpenNpcInventory!} equippedItemIds={equippedItemIds} onOpenDetailModal={props.onOpenDetailModal} gameSettings={props.gameSettings} imageCache={props.imageCache} onImageGenerated={props.onImageGenerated} onOpenImageModal={props.onOpenImageModal} />;
            case 'Conditions': return <ConditionsView character={character} isPlayer={isPlayer} isAdminEditable={isAdminEditable} onOpenDetailModal={props.onOpenDetailModal} forgetHealedWound={props.forgetHealedWound} forgetActiveWound={props.forgetActiveWound} clearAllHealedWounds={props.clearAllHealedWounds} onDeleteCustomState={props.onDeleteCustomState} onDeleteNpcCustomState={props.onDeleteNpcCustomState} onDeleteActiveEffect={props.onDeleteActiveEffect} />;
            case 'Bonuses': return <BonusesView situationalBonuses={situationalBonuses} />;
            case 'Memories': return <MemoriesView character={character as NPC} isPlayer={isPlayer} isAdminEditable={isAdminEditable} onOpenDetailModal={props.onOpenDetailModal} onEditNpcMemory={props.onEditNpcMemory} onDeleteNpcMemory={props.onDeleteNpcMemory} />;
            case 'Fate': return <FateView character={character as NPC} isPlayer={isPlayer} onOpenImageModal={props.onOpenImageModal} imageCache={props.imageCache} onImageGenerated={props.onImageGenerated} gameSettings={props.gameSettings} />;
            case 'Journal': return <JournalView character={character as NPC} isAdminEditable={isAdminEditable && !props.isViewOnly} onEditNpcData={props.onEditNpcData!} onOpenTextReader={props.onOpenTextReader} />;
            case 'Chronicle': return <ChronicleView character={character as PlayerCharacter} isAdminEditable={isAdminEditable && !props.isViewOnly} onEditPlayerData={onEditPlayerData!} onOpenTextReader={props.onOpenTextReader} />;
            case 'Activities': return <ActivitiesView character={character as NPC} isAdminEditable={isAdminEditable} clearAllCompletedNpcActivities={props.clearAllCompletedNpcActivities} onDeleteCurrentActivity={props.onDeleteCurrentActivity} onDeleteCompletedActivity={props.onDeleteCompletedActivity} />;
            default: return null;
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${!isHeaderCollapsed ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <CharacterSheetHeader {...props} isAdminEditable={isAdminEditable} onSwitchView={handleSwitchView} />
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {activeView === 'menu' ? (
                    <div className="p-4 md:p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-xl font-bold text-cyan-400 narrative-text flex items-center gap-2">
                                <UserCircleIcon className="w-6 h-6" /> {t('Character Menu')}
                            </h3>
                            <button onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)} title={t(isHeaderCollapsed ? 'Expand Header' : 'Collapse Header')} className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 transition-colors">
                                {isHeaderCollapsed ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {menuItems.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => handleSwitchView(tab.view)}
                                    className="bg-slate-800/70 hover:bg-slate-700/90 rounded-lg p-3 flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 transform hover:scale-105 border border-slate-700 hover:border-cyan-500"
                                >
                                    <tab.icon className="w-7 h-7 text-cyan-400" />
                                    <span className="font-semibold text-gray-200 text-sm">{t(tab.name as any)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-shrink-0 border-b border-gray-700 flex items-center p-2 gap-3">
                            <button onClick={() => setActiveView('menu')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white p-2 rounded-md transition-colors hover:bg-gray-700/50">
                                <ArrowUturnLeftIcon className="w-5 h-5" />
                                {t('Back to Menu')}
                            </button>
                            <div className="w-px h-6 bg-gray-700"></div>
                            <h3 className="text-xl font-bold text-cyan-400 narrative-text flex-1">{t(activeView as any)}</h3>
                            <button onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)} title={t(isHeaderCollapsed ? 'Expand Header' : 'Collapse Header')} className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 transition-colors">
                                {isHeaderCollapsed ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in-down-fast">
                            {renderContent()}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CharacterSheet;