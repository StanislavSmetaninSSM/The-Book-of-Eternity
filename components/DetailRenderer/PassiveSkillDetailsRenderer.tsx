import React, { useState, useCallback } from 'react';
import { PassiveSkill, PlayerCharacter } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import DetailRow from './Shared/DetailRow';
import CombatActionDetails from './Shared/CombatActionDetails';
import MarkdownRenderer from '../MarkdownRenderer';
import { useLocalization } from '../../context/LocalizationContext';
import {
    InformationCircleIcon, TagIcon, PuzzlePieceIcon, CogIcon, AcademicCapIcon, StarIcon, LightBulbIcon, BoltIcon,
    Cog6ToothIcon, ShieldCheckIcon, WrenchScrewdriverIcon, SparklesIcon, XCircleIcon
} from '@heroicons/react/24/outline';
import { qualityColorMap } from './utils';

interface PassiveSkillDetailsProps extends Omit<DetailRendererProps, 'data'> {
  skill: PassiveSkill & { owner?: 'player' | 'npc' };
}

const PassiveSkillDetailsRenderer: React.FC<PassiveSkillDetailsProps> = ({ skill, playerCharacter, onEditPlayerData, allowHistoryManipulation }) => {
    const { t } = useLocalization();
    const isPlayerSkill = skill.owner !== 'npc';
    const [newTag, setNewTag] = useState('');

    const handleAddTag = useCallback(() => {
        if (newTag.trim() && onEditPlayerData && playerCharacter) {
            const currentTags = skill.tags || [];
            const lowercasedTag = newTag.trim().toLowerCase();
            if (!currentTags.map(t => t.toLowerCase()).includes(lowercasedTag)) {
                const newSkillsArray = playerCharacter.passiveSkills.map(s => 
                    s.skillName === skill.skillName 
                        ? { ...s, tags: [...currentTags, newTag.trim()] } 
                        : s
                );
                onEditPlayerData('passiveSkills', newSkillsArray);
            }
            setNewTag('');
        }
    }, [newTag, skill, playerCharacter, onEditPlayerData]);

    const handleRemoveTag = useCallback((tagToRemove: string) => {
        if (onEditPlayerData && playerCharacter) {
            const newSkillsArray = playerCharacter.passiveSkills.map(s => {
                if (s.skillName === skill.skillName) {
                    const newTags = (s.tags || []).filter(t => t !== tagToRemove);
                    return { ...s, tags: newTags };
                }
                return s;
            });
            onEditPlayerData('passiveSkills', newSkillsArray);
        }
    }, [skill, playerCharacter, onEditPlayerData]);

    const hasSpecialProperties = 
        (skill.structuredBonuses && skill.structuredBonuses.length > 0) ||
        skill.combatEffect ||
        skill.effectDetails ||
        skill.playerStatBonus;

    return (
     <div className="space-y-4">
        <div className="italic text-gray-400"><MarkdownRenderer content={skill.skillDescription} /></div>
        <Section title={t("Properties")} icon={InformationCircleIcon}>
            <DetailRow 
                label={t("Rarity")} 
                value={<span className={qualityColorMap[skill.rarity] || 'text-gray-300'}>{t(skill.rarity)}</span>} 
                icon={TagIcon} 
            />
            <DetailRow label={t("Type")} value={t(skill.type as any)} icon={PuzzlePieceIcon} />
            <DetailRow label={t("Group")} value={t(skill.group as any)} icon={CogIcon} />
        </Section>
        <Section title={t("Mastery")} icon={AcademicCapIcon}>
            <DetailRow label={t("Level")} value={`${skill.masteryLevel} / ${skill.maxMasteryLevel}`} icon={AcademicCapIcon} />
            <p className="text-xs text-gray-400 italic mt-2">{t("PassiveMasteryNote")}</p>
        </Section>
        
        {hasSpecialProperties && (
            <Section title={t("Bonuses & Effects")} icon={StarIcon}>
                {skill.structuredBonuses && skill.structuredBonuses.length > 0 && (
                    <div className="mt-2">
                        <h5 className="font-semibold text-gray-400 flex items-center gap-2"><Cog6ToothIcon className="w-4 h-4" />{t("Mechanical Bonuses")}</h5>
                        <div className="space-y-3 mt-2">
                            {skill.structuredBonuses.map((bonus, i) => {
                                const { icon: Icon, colorClass, titleKey } = (() => {
                                    switch(bonus.bonusType) {
                                        case 'Characteristic': return { icon: AcademicCapIcon, colorClass: 'border-cyan-500', titleKey: 'Characteristic Bonus' };
                                        case 'ActionCheck': return { icon: ShieldCheckIcon, colorClass: 'border-green-500', titleKey: 'Action Check Bonus' };
                                        case 'Utility': return { icon: WrenchScrewdriverIcon, colorClass: 'border-blue-500', titleKey: 'Utility Effect' };
                                        default: return { icon: SparklesIcon, colorClass: 'border-indigo-500', titleKey: 'Other Bonus' };
                                    }
                                })();
                                
                                return (
                                    <div key={i} className={`bg-gray-800/60 p-3 rounded-md border-l-4 ${colorClass}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className={`w-5 h-5 flex-shrink-0 ${colorClass.replace('border-', 'text-')}`} />
                                            <h5 className="font-semibold text-gray-200">{t(titleKey as any)}</h5>
                                        </div>
                                        <p className="text-gray-300 font-bold text-lg mb-2 pl-7">{bonus.description}</p>
                                        <div className="text-xs text-gray-400 pl-7 grid grid-cols-2 gap-x-4 gap-y-1">
                                            <span><strong>{t("Target")}:</strong> {bonus.bonusType === 'Characteristic' ? t(bonus.target as any) : bonus.target}</span>
                                            <span><strong>{t("Value")}:</strong> {String(bonus.value)} ({t(bonus.valueType as any)})</span>
                                            <span><strong>{t("Application")}:</strong> {t(bonus.application as any)}</span>
                                            {bonus.condition && <span><strong>{t("Condition")}:</strong> {t(bonus.condition as any)}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {skill.playerStatBonus && (!skill.structuredBonuses || skill.structuredBonuses.length === 0) && (
                     <div className="mt-2">
                        <h5 className="font-semibold text-gray-400 flex items-center gap-2"><StarIcon className="w-4 h-4" />{t("Bonus")}</h5>
                        <div className="pl-6 mt-1 text-cyan-300/90"><MarkdownRenderer content={skill.playerStatBonus} /></div>
                    </div>
                )}
                {skill.effectDetails && (
                    <div className="mt-2">
                        <h5 className="font-semibold text-gray-400 flex items-center gap-2"><LightBulbIcon className="w-4 h-4" />{t("Effect Details")}</h5>
                         <div className="pl-6 mt-1"><MarkdownRenderer content={skill.effectDetails} /></div>
                    </div>
                )}
                {skill.combatEffect && (
                    <div className="mt-2">
                         <h5 className="font-semibold text-gray-400 flex items-center gap-2"><BoltIcon className="w-4 h-4" />{t("Combat Effect")}</h5>
                         <div className="mt-1"><CombatActionDetails action={skill.combatEffect} /></div>
                    </div>
                )}
            </Section>
        )}
         {allowHistoryManipulation && isPlayerSkill && (
            <Section title={t("Tags")} icon={TagIcon}>
                <div className="flex flex-wrap gap-2 items-center">
                    {(skill.tags || []).length > 0 ? (skill.tags || []).map(tag => (
                        <div key={tag} className="flex items-center gap-1 bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <span>{tag}</span>
                            <button onClick={() => handleRemoveTag(tag)} className="text-cyan-400 hover:text-white transition-colors">
                                <XCircleIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )) : (
                        <p className="text-xs text-gray-500 italic">{t('No tags assigned.')}</p>
                    )}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleAddTag(); }} className="flex gap-2 mt-3">
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder={t("Add a tag...")}
                        className="flex-1 bg-gray-800/60 border border-gray-600 rounded-md py-1 px-2 text-sm text-gray-200 focus:ring-1 focus:ring-cyan-500 transition"
                    />
                    <button type="submit" className="px-4 py-1 text-xs font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors">
                        {t("Add")}
                    </button>
                </form>
            </Section>
        )}
    </div>
    );
};

export default PassiveSkillDetailsRenderer;