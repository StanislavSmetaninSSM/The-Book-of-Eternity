
import React, { useState, useMemo } from 'react';
import { NPC, FateCard, Faction, Wound } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import DetailRow from './Shared/DetailRow';
import EditableField from './Shared/EditableField';
import FateCardDetailsRenderer from './Shared/FateCardDetailsRenderer';
import ImageRenderer from '../ImageRenderer';
import { useLocalization } from '../../context/LocalizationContext';
import { qualityColorMap } from './utils';
import JournalModal from './Shared/JournalModal';
import MemoryCard from './Shared/MemoryCard';
import {
    UserIcon, IdentificationIcon, TagIcon, CalendarIcon, GlobeAltIcon, UsersIcon, HeartIcon,
    StarIcon, BookOpenIcon, SparklesIcon, ShieldCheckIcon, ArchiveBoxIcon, DocumentTextIcon,
    CogIcon, TrashIcon, ArchiveBoxXMarkIcon, BoltIcon, SunIcon, CloudIcon, ShieldExclamationIcon, KeyIcon,
    ClockIcon, ArrowPathIcon, AcademicCapIcon, PhotoIcon, ChevronDownIcon, ChevronUpIcon
} from '@heroicons/react/24/outline';
import ConfirmationModal from '../ConfirmationModal';

interface NpcDetailsProps extends Omit<DetailRendererProps, 'data'> {
  npc: NPC;
  onOpenForgetConfirm: () => void;
  onOpenClearJournalConfirm: () => void;
}

const StatBar: React.FC<{
    value: number;
    max: number;
    color: string;
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}> = ({ value, max, color, label, icon: Icon }) => (
    <div className="w-full text-left">
        <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
                <span className="text-sm font-medium text-gray-300">{label}</span>
            </div>
          <span className="text-sm font-mono text-gray-400">{value} / {max}</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}></div>
        </div>
    </div>
);


const NpcDetailsRenderer: React.FC<NpcDetailsProps> = ({ npc, onOpenImageModal, onOpenDetailModal, onOpenForgetConfirm, onOpenClearJournalConfirm, allowHistoryManipulation, onEditNpcData, encounteredFactions, onDeleteOldestNpcJournalEntries, imageCache, onImageGenerated, forgetHealedWound, clearAllHealedWounds }) => {
    const { t } = useLocalization();
    const [isJournalOpen, setIsJournalOpen] = useState(false);
    const factionMapById = new Map((encounteredFactions || []).filter(f => f.factionId).map(f => [f.factionId, f]));
    const factionMapByName = new Map((encounteredFactions || []).map(f => [f.name.toLowerCase(), f]));

    const [healedWoundsCollapsed, setHealedWoundsCollapsed] = useState(true);
    const [confirmClear, setConfirmClear] = useState(false);
    const [confirmForget, setConfirmForget] = useState<Wound | null>(null);

    const handleSaveJournalEntry = (index: number, newContent: string) => {
        if (!npc.NPCId || !npc.journalEntries) return;
        const newJournalEntries = [...npc.journalEntries];
        newJournalEntries[index] = newContent;
        onEditNpcData(npc.NPCId, 'journalEntries', newJournalEntries);
    };
    
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

    const activeWounds = useMemo(() => (npc.wounds ?? []).filter(w => w.healingState.currentState !== 'Healed'), [npc.wounds]);
    const healedWounds = useMemo(() => (npc.wounds ?? []).filter(w => w.healingState.currentState === 'Healed'), [npc.wounds]);

    return (
        <div className="space-y-4">
            {imagePrompt && (
                <div className="w-full h-48 rounded-lg overflow-hidden mb-4 bg-gray-900 group relative cursor-pointer" onClick={() => onOpenImageModal?.(imagePrompt || '')}>
                    <ImageRenderer 
                        prompt={imagePrompt} 
                        alt={npc.name} 
                        width={1024} 
                        height={1024}
                        showRegenerateButton={true} 
                        imageCache={imageCache}
                        onImageGenerated={onImageGenerated}
                    />
                     <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-bold text-lg">{t('Enlarge')}</p>
                    </div>
                </div>
            )}
            
            <Section title={t("Image Prompt")} icon={PhotoIcon}>
                <EditableField 
                    label={t('Custom Image Prompt')}
                    value={npc.custom_image_prompt || ''}
                    isEditable={allowHistoryManipulation && !!npc.NPCId}
                    onSave={(val) => { if (npc.NPCId) onEditNpcData(npc.NPCId, 'custom_image_prompt', val) }}
                    as="textarea"
                    className="text-sm italic text-gray-400"
                />
                {npc.image_prompt && (
                    <p className="text-xs text-gray-500 mt-2">{t("Default prompt from AI:")} <span className="italic">{npc.image_prompt}</span></p>
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
                {npc.race && npc.class && <DetailRow label={t("Race & Class")} value={`${t(npc.race as any)} ${t(npc.class as any)}`} icon={TagIcon} />}
                {npc.age && <DetailRow label={t("Age")} value={npc.age} icon={CalendarIcon} />}
                {npc.rarity && <DetailRow label={t("Rarity")} value={t(npc.rarity as any)} icon={TagIcon} />}
                {npc.worldview && <DetailRow label={t("Worldview")} value={t(npc.worldview as any)} icon={GlobeAltIcon} />}
                {npc.attitude && <DetailRow label={t("Attitude")} value={t(npc.attitude as any)} icon={UsersIcon} />}
                {npc.relationshipLevel !== undefined && (
                    <div title={getRelationshipTooltip(npc.relationshipLevel)}>
                        <DetailRow label={t("Relationship")} value={`${npc.relationshipLevel} / 200`} icon={HeartIcon} />
                    </div>
                )}
                {npc.currentHealthPercentage && <DetailRow label={t("Health")} value={
                    <div className="flex items-center gap-2 justify-end">
                        <span>{npc.currentHealthPercentage}</span>
                        <div className="w-24 bg-gray-700 rounded-full h-2.5">
                            <div
                                className="bg-red-500 h-2.5 rounded-full"
                                style={{ width: npc.currentHealthPercentage }}
                            ></div>
                        </div>
                    </div>
                } icon={HeartIcon} />}
            </Section>

            {(npc.level !== undefined || npc.progressionType) && (
                <Section title={t("Progression")} icon={AcademicCapIcon}>
                    {npc.level !== undefined && <DetailRow label={t("Level")} value={npc.level} icon={StarIcon} />}
                    {npc.progressionType && <DetailRow label={t("Progression Type")} value={t(npc.progressionType as any)} icon={ArrowPathIcon} />}
                    {(npc.experience !== undefined && npc.experienceForNextLevel !== undefined && npc.experienceForNextLevel > 0) && (
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
            )}

            {npc.history && (
                <Section title={t("History")} icon={BookOpenIcon}>
                    <EditableField 
                        label={t('History')}
                        value={npc.history}
                        isEditable={allowHistoryManipulation && !!npc.NPCId}
                        onSave={(val) => { if (npc.NPCId) onEditNpcData(npc.NPCId, 'history', val) }}
                    />
                </Section>
            )}

            {npc.factionAffiliations && npc.factionAffiliations.length > 0 && (
                <Section title={t("Faction Affiliations")} icon={UsersIcon}>
                    {npc.factionAffiliations.map((aff, index) => {
                        let faction: Faction | undefined = undefined;
                        if (aff.factionId) {
                            faction = factionMapById.get(aff.factionId);
                        }
                        if (!faction && aff.factionName) {
                            faction = factionMapByName.get(aff.factionName.toLowerCase());
                        }
                        if (!faction && aff.factionId) {
                            faction = factionMapByName.get(aff.factionId.toLowerCase());
                        }

                        const factionDisplayName = faction ? faction.name : (aff.factionName || t('Unknown Faction'));

                        return (
                            <div key={index} className="bg-gray-700/50 p-3 rounded-md">
                                <button
                                    onClick={() => {
                                        if (faction) {
                                            onOpenDetailModal(
                                                t("Faction: {name}", { name: faction.name }), 
                                                { 
                                                    ...faction, 
                                                    type: 'faction', 
                                                    perspectiveFor: { name: npc.name, rank: aff.rank } 
                                                }
                                            )
                                        }
                                    }}
                                    disabled={!faction}
                                    className={`font-bold text-cyan-400 ${faction ? 'hover:underline' : 'cursor-default'}`}
                                >
                                    {factionDisplayName}
                                </button>
                                <p className="text-sm">{t('Rank')}: {t(aff.rank as any)}</p>
                                <p className="text-xs text-gray-400">{t('Status')}: {t(aff.membershipStatus as any)}</p>
                            </div>
                        )
                    })}
                </Section>
            )}

            {npc.unlockedMemories && npc.unlockedMemories.length > 0 && (
                <Section title={t("Unlocked Memories")} icon={KeyIcon}>
                    <div className="space-y-3">
                        {npc.unlockedMemories.map((memory) => (
                            <MemoryCard key={memory.memoryId} memory={memory} />
                        ))}
                    </div>
                </Section>
            )}

            {npc.characteristics && (
                <Section title={t("Characteristics")} icon={IdentificationIcon}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.keys(npc.characteristics).filter(k => k.startsWith('standard')).map(key => {
                            const charNameRaw = key.replace('standard', '');
                            const charName = charNameRaw.charAt(0).toLowerCase() + charNameRaw.slice(1);
                            const standardKey = `standard${charNameRaw}` as keyof typeof npc.characteristics;
                            const modifiedKey = `modified${charNameRaw}` as keyof typeof npc.characteristics;
                            const baseValue = npc.characteristics![standardKey];
                            const modifiedValue = npc.characteristics![modifiedKey];
                            const difference = modifiedValue - baseValue;

                            return (
                                 <div key={key} className="bg-gray-700/40 p-3 rounded-lg flex items-center justify-between shadow-inner">
                                    <span className="text-gray-300 capitalize text-sm font-semibold">{t(charName as any)}</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold text-2xl text-cyan-400 font-mono">{modifiedValue}</span>
                                        {difference !== 0 && (
                                            <span className={`text-xs font-mono ${difference > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                ({baseValue}{difference > 0 ? '+' : ''}{difference})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Section>
            )}
            
            {(npc.activeEffects && npc.activeEffects.length > 0) && (
                <Section title={t("Active Effects")} icon={SparklesIcon}>
                    {(npc.activeEffects ?? []).map((effect, index) => (
                        <button key={index} onClick={() => onOpenDetailModal(t("Effect: {name}", { name: effect.sourceSkill || t('Effect') }), effect)} className={`w-full text-left p-3 rounded-md text-sm flex items-start gap-3 hover:scale-105 transition-transform ${effect.effectType.includes('Buff') ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                            {effect.effectType.includes('Buff') ? <SunIcon className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" /> : <CloudIcon className="w-5 h-5 mt-0.5 text-red-400 flex-shrink-0" />}
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <span className="font-semibold">{effect.sourceSkill || t('Effect')}</span>
                                    {effect.duration < 999 && <span className="text-xs">{t('({duration} turns left)', { duration: effect.duration })}</span>}
                                </div>
                                <p>{effect.description}</p>
                            </div>
                        </button>
                    ))}
                </Section>
            )}

            <Section title={t("Wounds")} icon={ShieldExclamationIcon}>
                {(activeWounds.length > 0) ? (activeWounds.map((wound, index) => (
                    <button key={wound.woundId || index} onClick={() => onOpenDetailModal(t("Wound: {name}", { name: wound.woundName }), wound)} className="w-full text-left bg-gray-900/60 p-3 rounded-md border border-red-800/50 flex items-start gap-3 hover:border-red-600 transition-colors">
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
                                    <button onClick={() => onOpenDetailModal(t("Wound: {name}", { name: wound.woundName }), wound)} className="flex-1 text-left">
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

            <Section title={t("Active Skills")} icon={SparklesIcon}>
                {npc.activeSkills && npc.activeSkills.length > 0 ? npc.activeSkills.map((skill, index) => {
                    const masteryData = npc.skillMasteryData?.find(m => m.skillName.toLowerCase() === skill.skillName.toLowerCase());
                    const masteryProgress = (masteryData && masteryData.masteryProgressNeeded > 0) 
                        ? (masteryData.currentMasteryProgress / masteryData.masteryProgressNeeded) * 100 
                        : 0;
                    return (
                    <button key={index} onClick={() => onOpenDetailModal(t("Active Skill: {name}", { name: skill.skillName }), { ...skill, owner: 'npc' })} className={`w-full text-left bg-gray-700/50 p-3 rounded-md border-l-4 ${qualityColorMap[skill.rarity] || 'border-gray-500'} shadow-sm hover:bg-gray-700/80 hover:border-cyan-400 transition-colors`}>
                        <div className="flex justify-between items-baseline flex-wrap gap-x-4 gap-y-1">
                            <span className={`font-semibold ${qualityColorMap[skill.rarity]?.split(' ')[0] || 'text-gray-200'} text-lg`}>{skill.skillName}</span>
                             <div className="text-xs space-x-3 flex items-center text-gray-400">
                                {masteryData && (
                                     <span className="font-semibold whitespace-nowrap flex items-center gap-1.5">{t('Mastery Level')}: <span className="text-cyan-300 font-bold text-sm">{masteryData.currentMasteryLevel ?? '?'}/{masteryData.maxMasteryLevel ?? '?'}</span></span>
                                )}
                                {skill.energyCost && <span className="flex items-center gap-1"><BoltIcon className="w-3 h-3 text-blue-400"/>{skill.energyCost} E</span>}
                                {skill.cooldownTurns != null && <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3 text-purple-400"/>CD: {skill.cooldownTurns}T</span>}
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
                                    <div className="bg-cyan-500 h-2 rounded-full transition-all duration-300" style={{width: `${masteryProgress}%`}}></div>
                                </div>
                            </div>
                        )}
                    </button>
                    )
                }) : <p className="text-sm text-gray-500 text-center p-4">{t('No active skills known.')}</p>}
            </Section>

            <Section title={t("Passive Skills")} icon={ShieldCheckIcon}>
                {npc.passiveSkills && npc.passiveSkills.length > 0 ? npc.passiveSkills.map((skill, index) => (
                    <button key={index} onClick={() => onOpenDetailModal(t("Passive Skill: {name}", { name: skill.skillName }), skill)} className={`w-full text-left bg-gray-700/50 p-3 rounded-md border-l-4 ${qualityColorMap[skill.rarity] || 'border-gray-500'} shadow-sm hover:bg-gray-700/80 hover:border-cyan-400 transition-colors`}>
                        <div className="flex justify-between items-start">
                            <span className={`font-semibold ${qualityColorMap[skill.rarity]?.split(' ')[0] || 'text-gray-200'}`}>{skill.skillName}</span>
                             <span className="text-xs font-semibold text-gray-400 whitespace-nowrap pl-2">{t('Mastery Level')}: <span className="text-cyan-300 font-bold">{skill.masteryLevel} / {skill.maxMasteryLevel}</span></span>
                        </div>
                        <p className="text-sm text-gray-400 italic mt-1 line-clamp-2">{skill.skillDescription}</p>
                    </button>
                )) : <p className="text-sm text-gray-500 text-center p-4">{t('No passive skills known.')}</p>}
            </Section>

            <Section title={t("Inventory")} icon={ArchiveBoxIcon}>
                {npc.inventory && npc.inventory.length > 0 ? npc.inventory.map((item, index) => (
                    <button key={item.existedId || index} onClick={() => onOpenDetailModal(t("Item: {name}", { name: item.name }), item)} className={`w-full text-left p-3 rounded-md border-l-4 ${qualityColorMap[item.quality] || 'border-gray-500'} bg-gray-700/50 shadow-sm hover:bg-gray-700/80 hover:border-cyan-400 transition-colors`}>
                        <div className="flex justify-between items-start">
                            <span className={`font-semibold ${qualityColorMap[item.quality]?.split(' ')[0] || 'text-gray-200'}`}>
                                {item.name} {item.count > 1 ? `(x${item.count})` : ''}
                                {item.resource !== undefined && item.maximumResource !== undefined && ` (${item.resource}/${item.maximumResource})`}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 italic mt-1 line-clamp-2">{item.description}</p>
                    </button>
                )) : <p className="text-sm text-gray-500 text-center p-4">{t('No items in inventory.')}</p>}
            </Section>

            {journalPreviewContent && (
                <Section title={t("Journal Preview")} icon={DocumentTextIcon}>
                    <div className="bg-gray-700/50 p-3 rounded-md italic text-gray-400">
                        <p className="line-clamp-3 whitespace-pre-wrap">
                            {journalPreviewContent}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsJournalOpen(true)}
                        className="w-full mt-2 text-center px-4 py-2 bg-gray-700/60 hover:bg-gray-700 rounded-md text-cyan-300 font-semibold transition-colors"
                    >
                        {t('Read Full Journal')}
                    </button>
                </Section>
            )}

            {npc.fateCards && npc.fateCards.length > 0 && (
                <Section title={t("Fate Cards")} icon={SparklesIcon}>
                    <div className="space-y-3">
                        {npc.fateCards.map((card: FateCard) => (
                           <FateCardDetailsRenderer key={card.cardId} card={card} onOpenImageModal={onOpenImageModal} imageCache={imageCache} onImageGenerated={onImageGenerated} />
                        ))}
                    </div>
                </Section>
            )}

            {npc.NPCId && allowHistoryManipulation && (
                <Section title={t("Actions")} icon={CogIcon}>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                         <button
                            onClick={onOpenClearJournalConfirm}
                            disabled={!npc.journalEntries || npc.journalEntries.length === 0}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-yellow-300 bg-yellow-600/20 rounded-md hover:bg-yellow-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            <ArchiveBoxXMarkIcon className="w-5 h-5" />
                            {t("Clear Journal")}
                        </button>
                        <button
                            onClick={onOpenForgetConfirm}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-300 bg-red-600/20 rounded-md hover:bg-red-600/40 transition-colors"
                        >
                            <TrashIcon className="w-5 h-5" />
                            {t("Forget NPC")}
                        </button>
                    </div>
                </Section>
            )}

            {npc.journalEntries && npc.journalEntries.length > 0 && npc.NPCId && (
                <JournalModal
                    isOpen={isJournalOpen}
                    onClose={() => setIsJournalOpen(false)}
                    journalEntries={npc.journalEntries}
                    npcName={npc.name}
                    isEditable={allowHistoryManipulation}
                    onSaveEntry={handleSaveJournalEntry}
                    onDeleteOldest={onDeleteOldestNpcJournalEntries ? () => onDeleteOldestNpcJournalEntries(npc.NPCId!) : undefined}
                />
            )}
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
        </div>
    );
};

export default NpcDetailsRenderer;
