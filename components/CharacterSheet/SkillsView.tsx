import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PlayerCharacter, NPC, ActiveSkill, PassiveSkill } from '../../types';
import { useLocalization } from '../../context/LocalizationContext';
import SectionHeader from './Shared/SectionHeader';
import ConfirmationModal from '../ConfirmationModal';
import { qualityColorMap } from '../DetailRenderer/utils';
import {
    SparklesIcon,
    TrashIcon,
    BoltIcon,
    ClockIcon,
    ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import {
    SparklesIcon as SparklesSolidIcon,
    CheckIcon as CheckSolidIcon,
    Bars3Icon,
} from '@heroicons/react/24/solid';

interface SkillsViewProps {
    character: PlayerCharacter | NPC;
    isPlayer: boolean;
    isViewOnly?: boolean;
    isAdminEditable: boolean;
    onOpenDetailModal: (title: string, data: any) => void;
    onDeleteActiveSkill: (skillName: string) => void;
    onDeletePassiveSkill: (skillName: string) => void;
    updateActiveSkillSortOrder: (newOrder: string[]) => void;
    updatePassiveSkillSortOrder: (newOrder: string[]) => void;
    onEditNpcData?: (npcId: string, field: keyof NPC, value: any) => void;
}

const SkillsView: React.FC<SkillsViewProps> = ({
    character,
    isPlayer,
    isViewOnly,
    isAdminEditable,
    onOpenDetailModal,
    onDeleteActiveSkill,
    onDeletePassiveSkill,
    updateActiveSkillSortOrder,
    updatePassiveSkillSortOrder,
    onEditNpcData
}) => {
    const { t } = useLocalization();
    const [activeSkillToDelete, setActiveSkillToDelete] = useState<ActiveSkill | null>(null);
    const [passiveSkillToDelete, setPassiveSkillToDelete] = useState<PassiveSkill | null>(null);
    const [activeSkillTags, setActiveSkillTags] = useState<string[]>([]);
    const [isSorting, setIsSorting] = useState(false);

    const dragActiveSkillName = useRef<string | null>(null);
    const dragOverActiveSkillName = useRef<string | null>(null);
    const dragPassiveSkillName = useRef<string | null>(null);
    const dragOverPassiveSkillName = useRef<string | null>(null);

    const sortedActiveSkills = useMemo(() => {
        const skills = character.activeSkills || [];
        if (!isPlayer || !(character as PlayerCharacter).activeSkillSortOrder) return skills;
        const pc = character as PlayerCharacter;
        const orderMap = new Map(pc.activeSkillSortOrder.map((name, index) => [name, index]));
        return [...skills].sort((a, b) => {
            const aIndex = orderMap.get(a.skillName);
            const bIndex = orderMap.get(b.skillName);
            if (aIndex === undefined && bIndex === undefined) return 0;
            if (aIndex === undefined) return 1;
            if (bIndex === undefined) return -1;
            return aIndex - bIndex;
        });
    }, [character, isPlayer]);

    const sortedPassiveSkills = useMemo(() => {
        const skills = character.passiveSkills || [];
        if (!isPlayer || !(character as PlayerCharacter).passiveSkillSortOrder) return skills;
        const pc = character as PlayerCharacter;
        const orderMap = new Map(pc.passiveSkillSortOrder.map((name, index) => [name, index]));
        return [...skills].sort((a, b) => {
            const aIndex = orderMap.get(a.skillName);
            const bIndex = orderMap.get(b.skillName);
            if (aIndex === undefined && bIndex === undefined) return 0;
            if (aIndex === undefined) return 1;
            if (bIndex === undefined) return -1;
            return aIndex - bIndex;
        });
    }, [character, isPlayer]);
    
    const [localActiveSkills, setLocalActiveSkills] = useState(sortedActiveSkills);
    const [localPassiveSkills, setLocalPassiveSkills] = useState(sortedPassiveSkills);

    useEffect(() => {
        if (!isSorting) {
            setLocalActiveSkills(sortedActiveSkills);
        }
    }, [sortedActiveSkills, isSorting]);

    useEffect(() => {
        if (!isSorting) {
            setLocalPassiveSkills(sortedPassiveSkills);
        }
    }, [sortedPassiveSkills, isSorting]);
    
    const allSkillTags = useMemo(() => {
        const tagSet = new Set<string>();
        (character.activeSkills || []).forEach(skill => (skill.tags || []).forEach(tag => tagSet.add(tag)));
        (character.passiveSkills || []).forEach(skill => (skill.tags || []).forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [character.activeSkills, character.passiveSkills]);

    const filteredActiveSkills = useMemo(() => {
        if (activeSkillTags.length === 0) return localActiveSkills || [];
        return (localActiveSkills || []).filter(skill =>
            activeSkillTags.every(tag => (skill.tags || []).includes(tag))
        );
    }, [localActiveSkills, activeSkillTags]);

    const filteredPassiveSkills = useMemo(() => {
        if (activeSkillTags.length === 0) return localPassiveSkills || [];
        return (localPassiveSkills || []).filter(skill =>
            activeSkillTags.every(tag => (skill.tags || []).includes(tag))
        );
    }, [localPassiveSkills, activeSkillTags]);

    const handleConfirmDeleteActiveSkill = () => {
        if (!activeSkillToDelete) return;
        if (isPlayer) {
          onDeleteActiveSkill(activeSkillToDelete.skillName);
        } else if (onEditNpcData) {
          const newSkills = (character as NPC).activeSkills.filter(s => s.skillName !== activeSkillToDelete.skillName);
          onEditNpcData((character as NPC).NPCId, 'activeSkills', newSkills);
        }
        setActiveSkillToDelete(null);
    };
  
    const handleConfirmDeletePassiveSkill = () => {
        if (!passiveSkillToDelete) return;
        if (isPlayer) {
          onDeletePassiveSkill(passiveSkillToDelete.skillName);
        } else if (onEditNpcData) {
          const newSkills = (character as NPC).passiveSkills.filter(s => s.skillName !== passiveSkillToDelete.skillName);
          onEditNpcData((character as NPC).NPCId, 'passiveSkills', newSkills);
        }
        setPassiveSkillToDelete(null);
    };

    const toggleSkillTag = (tag: string) => {
        setActiveSkillTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleSortToggle = () => {
        if (isSorting) {
            if (isPlayer && !isViewOnly) {
                const newActiveOrder = localActiveSkills.map(s => s.skillName);
                updateActiveSkillSortOrder(newActiveOrder);

                const newPassiveOrder = localPassiveSkills.map(s => s.skillName);
                updatePassiveSkillSortOrder(newPassiveOrder);
            }
        }
        setIsSorting(prev => !prev);
    };

    const handleActiveSortEnd = () => {
        if (!dragActiveSkillName.current || !dragOverActiveSkillName.current || dragActiveSkillName.current === dragOverActiveSkillName.current) return;
        setLocalActiveSkills(prevSkills => {
            const dragIndex = prevSkills.findIndex(s => s.skillName === dragActiveSkillName.current);
            const overIndex = prevSkills.findIndex(s => s.skillName === dragOverActiveSkillName.current);
            if (dragIndex === -1 || overIndex === -1) return prevSkills;
            const newSkills = [...prevSkills];
            const [draggedItem] = newSkills.splice(dragIndex, 1);
            newSkills.splice(overIndex, 0, draggedItem);
            return newSkills;
        });
        dragActiveSkillName.current = null;
        dragOverActiveSkillName.current = null;
    };
    
    const handlePassiveSortEnd = () => {
        if (!dragPassiveSkillName.current || !dragOverPassiveSkillName.current || dragPassiveSkillName.current === dragOverPassiveSkillName.current) return;
        setLocalPassiveSkills(prevSkills => {
            const dragIndex = prevSkills.findIndex(s => s.skillName === dragPassiveSkillName.current);
            const overIndex = prevSkills.findIndex(s => s.skillName === dragOverPassiveSkillName.current);
            if (dragIndex === -1 || overIndex === -1) return prevSkills;
            const newSkills = [...prevSkills];
            const [draggedItem] = newSkills.splice(dragIndex, 1);
            newSkills.splice(overIndex, 0, draggedItem);
            return newSkills;
        });
        dragPassiveSkillName.current = null;
        dragOverPassiveSkillName.current = null;
    };


    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    {allSkillTags.length > 0 && (
                        <div className="p-3 bg-gray-900/30 rounded-lg flex-1 min-w-[200px]">
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">{t("Filter by tags:")}</h4>
                            <div className="flex flex-wrap gap-2">
                                {allSkillTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleSkillTag(tag)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors border ${
                                            activeSkillTags.includes(tag)
                                                ? 'bg-cyan-500 text-white border-cyan-400'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {isPlayer && !isViewOnly && (
                        <button
                            onClick={handleSortToggle}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-cyan-300 bg-cyan-500/10 rounded-lg hover:bg-cyan-500/20 transition-colors border border-cyan-500/20"
                        >
                            {isSorting ? <CheckSolidIcon className="w-5 h-5" /> : <ArrowsUpDownIcon className="w-5 h-5" />}
                            {isSorting ? t('Done') : t('Sort')}
                        </button>
                    )}
                </div>
                <div className="mt-6">
                    <SectionHeader title={t('Active Skills')} icon={SparklesIcon} />
                    <div className="space-y-3 text-gray-300">
                        {filteredActiveSkills.length > 0 ? filteredActiveSkills.map((skill, index) => {
                            const masteryData = character.skillMasteryData?.find(m => m.skillName.toLowerCase() === skill.skillName.toLowerCase());
                            const masteryProgress = (masteryData && masteryData.masteryProgressNeeded > 0) 
                                ? (masteryData.currentMasteryProgress / masteryData.masteryProgressNeeded) * 100 
                                : 0;
                            return (
                                <div 
                                    key={skill.skillName} 
                                    className={`flex items-center gap-2 group ${isSorting ? 'cursor-move' : ''}`}
                                    draggable={isSorting}
                                    onDragStart={() => (dragActiveSkillName.current = skill.skillName)}
                                    onDragEnter={() => (dragOverActiveSkillName.current = skill.skillName)}
                                    onDragEnd={handleActiveSortEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    {isSorting && <Bars3Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                                    <button
                                        onClick={() => onOpenDetailModal(t("Active Skill: {name}", { name: skill.skillName }), { ...skill, owner: isPlayer ? 'player' : 'npc' })}
                                        disabled={isSorting}
                                        className={`flex-1 text-left bg-gray-700/50 p-3 rounded-md border-l-4 ${qualityColorMap[skill.rarity]?.split(' ')[1] || 'border-gray-500'} shadow-sm ${!isSorting ? 'hover:bg-gray-700/80 hover:border-cyan-400' : ''} transition-colors`}
                                    >
                                        <div className="flex justify-between items-baseline flex-wrap gap-x-4 gap-y-1">
                                            <span className={`font-semibold ${qualityColorMap[skill.rarity]?.split(' ')[0] || 'text-gray-200'} flex items-center gap-2 text-lg`}>
                                                {skill.skillName}
                                                {isPlayer && (character as PlayerCharacter).autoCombatSkill === skill.skillName && (
                                                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full font-mono">{t('AUTO')}</span>
                                                )}
                                            </span>
                                            <div className="text-xs space-x-3 flex items-center text-gray-400">
                                                {masteryData && (
                                                    <span className="font-semibold whitespace-nowrap flex items-center gap-1.5">{t('mastery_level')}: <span className="text-cyan-300 font-bold text-sm">{masteryData.currentMasteryLevel ?? '?'}</span></span>
                                                )}
                                                {skill.energyCost && <span className="flex items-center gap-1"><BoltIcon className="w-3 h-3 text-blue-400"/>{skill.energyCost} {t('EnergyUnit')}</span>}
                                                {skill.cooldownTurns != null && <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3 text-purple-400"/>{t('CooldownAbbr')}: {skill.cooldownTurns}{t('TurnUnit')}</span>}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400 italic mt-2 line-clamp-2">{skill.skillDescription}</p>
                                        {masteryData && masteryData.masteryProgressNeeded > 0 && (
                                            <div className="mt-2">
                                                <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                                                    <span className="font-medium">{t('Progress')}</span>
                                                    <span className="font-mono">{masteryData.currentMasteryProgress ?? '?'}/{masteryData.masteryProgressNeeded ?? '?'}</span>
                                                </div>
                                                <div className="w-full bg-gray-800/70 rounded-full h-2.5 overflow-hidden">
                                                    <div className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300" style={{width: `${masteryProgress}%`}}></div>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                    {isAdminEditable && !isSorting && (
                                        <button
                                            onClick={() => setActiveSkillToDelete(skill)}
                                            className="p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                            title={t('Delete Skill')}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )
                        }) : <p className="text-sm text-gray-500 text-center p-2">{t('No active skills known.')}</p>}
                    </div>
                </div>
                <div className="mt-6">
                    <SectionHeader title={t('Passive Skills')} icon={SparklesSolidIcon} />
                    <div className="space-y-3 text-gray-300">
                        {filteredPassiveSkills.length > 0 ? filteredPassiveSkills.map((skill) => (
                            <div 
                                key={skill.skillName} 
                                className={`flex items-center gap-2 group ${isSorting ? 'cursor-move' : ''}`}
                                draggable={isSorting}
                                onDragStart={() => (dragPassiveSkillName.current = skill.skillName)}
                                onDragEnter={() => (dragOverPassiveSkillName.current = skill.skillName)}
                                onDragEnd={handlePassiveSortEnd}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                {isSorting && <Bars3Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                                <button
                                    onClick={() => onOpenDetailModal(t("Passive Skill: {name}", { name: skill.skillName }), { ...skill, owner: isPlayer ? 'player' : 'npc' })}
                                    disabled={isSorting}
                                    className={`flex-1 text-left bg-gray-700/50 p-3 rounded-md border-l-4 ${qualityColorMap[skill.rarity]?.split(' ')[1] || 'border-gray-500'} shadow-sm ${!isSorting ? 'hover:bg-gray-700/80 hover:border-cyan-400' : ''} transition-colors`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`font-semibold ${qualityColorMap[skill.rarity]?.split(' ')[0] || 'text-gray-200'}`}>{skill.skillName}</span>
                                        <span className="text-xs font-semibold text-gray-400 whitespace-nowrap pl-2">{t('mastery_level')}: <span className="text-cyan-300 font-bold">{skill.masteryLevel} / {skill.maxMasteryLevel}</span></span>
                                    </div>
                                    <p className="text-sm text-gray-400 italic mt-1 line-clamp-2">{skill.skillDescription}</p>
                                </button>
                                {isAdminEditable && !isSorting &&(
                                    <button
                                        onClick={() => setPassiveSkillToDelete(skill)}
                                        className="p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                        title={t('Delete Skill')}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )) : <p className="text-sm text-gray-500 text-center p-2">{t('No passive skills known.')}</p>}
                    </div>
                </div>
            </div>
            <ConfirmationModal isOpen={!!activeSkillToDelete} onClose={() => setActiveSkillToDelete(null)} onConfirm={handleConfirmDeleteActiveSkill} title={t('Delete Active Skill')}>
                <p>{t('Are you sure you want to delete the active skill "{name}"?', { name: activeSkillToDelete?.skillName })}</p>
            </ConfirmationModal>
            <ConfirmationModal isOpen={!!passiveSkillToDelete} onClose={() => setPassiveSkillToDelete(null)} onConfirm={handleConfirmDeletePassiveSkill} title={t('Delete Passive Skill')}>
                <p>{t('Are you sure you want to delete the passive skill "{name}"?', { name: passiveSkillToDelete?.skillName || '' })}</p>
            </ConfirmationModal>
        </>
    );
}

export default SkillsView;