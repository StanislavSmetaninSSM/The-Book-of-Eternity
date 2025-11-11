import React, { useMemo, useCallback, useState } from 'react';
import { ActiveSkill, PlayerCharacter } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import DetailRow from './Shared/DetailRow';
import CombatActionDetails from './Shared/CombatActionDetails';
import MarkdownRenderer from '../MarkdownRenderer';
import { useLocalization } from '../../context/LocalizationContext';
import {
    InformationCircleIcon, TagIcon, BoltIcon, ClockIcon, ArrowPathIcon, LinkIcon, WrenchScrewdriverIcon, Cog6ToothIcon, BeakerIcon, XCircleIcon, AcademicCapIcon, StarIcon
} from '@heroicons/react/24/outline';
import { qualityColorMap } from './utils';

interface ActiveSkillDetailsProps extends Omit<DetailRendererProps, 'data'> {
  skill: ActiveSkill & { owner?: 'player' | 'npc' };
}

const ActiveSkillDetailsRenderer: React.FC<ActiveSkillDetailsProps> = ({ skill, playerCharacter, setAutoCombatSkill, onEditPlayerData, allowHistoryManipulation }) => {
    const { t } = useLocalization();
    const isCurrentlyAuto = playerCharacter?.autoCombatSkill === skill.skillName;
    const canBeAuto = !!skill.combatEffect && (skill.combatEffect.isActivatedEffect === undefined || skill.combatEffect.isActivatedEffect === true);
    const isPlayerSkill = skill.owner !== 'npc';
    const [newTag, setNewTag] = useState('');

    const handleAddTag = useCallback(() => {
        if (newTag.trim() && onEditPlayerData && playerCharacter) {
            const currentTags = skill.tags || [];
            const lowercasedTag = newTag.trim().toLowerCase();
            if (!currentTags.map(t => t.toLowerCase()).includes(lowercasedTag)) {
                const newSkillsArray = playerCharacter.activeSkills.map(s => 
                    s.skillName === skill.skillName 
                        ? { ...s, tags: [...currentTags, newTag.trim()] } 
                        : s
                );
                onEditPlayerData('activeSkills', newSkillsArray);
            }
            setNewTag('');
        }
    }, [newTag, skill, playerCharacter, onEditPlayerData]);

    const handleRemoveTag = useCallback((tagToRemove: string) => {
        if (onEditPlayerData && playerCharacter) {
            const newSkillsArray = playerCharacter.activeSkills.map(s => {
                if (s.skillName === skill.skillName) {
                    const newTags = (s.tags || []).filter(t => t !== tagToRemove);
                    return { ...s, tags: newTags };
                }
                return s;
            });
            onEditPlayerData('activeSkills', newSkillsArray);
        }
    }, [skill, playerCharacter, onEditPlayerData]);

    const skillMastery = useMemo(() => {
        if (!playerCharacter) return null;
        return playerCharacter.skillMasteryData.find(m => m.skillName.toLowerCase() === skill.skillName.toLowerCase());
    }, [playerCharacter, skill.skillName]);

    const masteryLevel = skillMastery?.currentMasteryLevel || 0;

    const scalingCalculations = useMemo(() => {
        if (!playerCharacter || !skill.scalingCharacteristic || !skillMastery) return null;

        const baseEffect = skill.combatEffect?.effects[0];
        if (!baseEffect) return null;

        const baseValue = parseFloat(baseEffect.value);
        const baseDuration = baseEffect.duration;

        const casterLevel = playerCharacter.level;
        const charKey = `modified${skill.scalingCharacteristic.charAt(0).toUpperCase() + skill.scalingCharacteristic.slice(1)}` as keyof PlayerCharacter['characteristics'];
        const relevantCharValue = playerCharacter.characteristics[charKey];

        const S1 = 10, M1 = 5;
        const S2 = 5, M2 = 8;
        const SM_S = 1, SM_M = 4;

        const charBonusPercent = Math.floor(relevantCharValue / S1) * M1;
        const levelBonusPercent = Math.floor(casterLevel / S2) * M2;
        const masteryBonusPercent = Math.floor(masteryLevel / SM_S) * SM_M;
        
        const totalBonusMultiplier = 1 + (charBonusPercent / 100) + (levelBonusPercent / 100) + (masteryBonusPercent / 100);

        const finalValue = !isNaN(baseValue) && skill.scalesValue ? Math.round(baseValue * totalBonusMultiplier) : null;
        const finalDuration = baseDuration != null && skill.scalesDuration ? Math.round(baseDuration * totalBonusMultiplier) : null;
        
        let finalChance: number | null = null;
        if (baseEffect.effectType === 'Control' && skill.scalesChance && !isNaN(baseValue)) {
            finalChance = Math.min(95, Math.round(baseValue * totalBonusMultiplier));
        }

        return {
            baseValue,
            baseDuration,
            charBonusPercent,
            levelBonusPercent,
            masteryBonusPercent,
            totalBonusMultiplier,
            finalValue,
            finalDuration,
            finalChance,
            relevantCharValue
        };
    }, [skill, playerCharacter, masteryLevel, skillMastery]);

    return (
    <div className="space-y-4">
        <div className="italic text-gray-400"><MarkdownRenderer content={skill.skillDescription} /></div>
        <Section title={t("Properties")} icon={InformationCircleIcon}>
            <DetailRow 
                label={t("Rarity")} 
                value={<span className={qualityColorMap[skill.rarity] || 'text-gray-300'}>{t(skill.rarity)}</span>} 
                icon={TagIcon} 
            />
            {skill.energyCost && <DetailRow label={t("Energy Cost")} value={skill.energyCost} icon={BoltIcon} />}
            {skill.cooldownTurns != null && <DetailRow label={t("Cooldown")} value={t('{duration} turns', { duration: skill.cooldownTurns })} icon={ClockIcon} />}
        </Section>
        {isPlayerSkill && skillMastery && (
            <Section title={t("Mastery")} icon={AcademicCapIcon}>
                <DetailRow label={t("Current Level")} value={masteryLevel} icon={StarIcon} />
                <div className="text-xs text-gray-400 italic mt-2">
                    <p>{t('active_skill_mastery_note')}</p>
                </div>
            </Section>
        )}
        <Section title={t("Scaling")} icon={ArrowPathIcon}>
            <DetailRow label={t("Scales With")} value={skill.scalingCharacteristic ? t(skill.scalingCharacteristic as any) : t('None')} icon={LinkIcon} />
            <DetailRow label={t("Scales Value")} value={skill.scalesValue ? t('Yes') : t('No')} icon={WrenchScrewdriverIcon} />
            <DetailRow label={t("Scales Duration")} value={skill.scalesDuration ? t('Yes') : t('No')} icon={WrenchScrewdriverIcon} />
            <DetailRow label={t("Scales Chance")} value={skill.scalesChance ? t('Yes') : t('No')} icon={WrenchScrewdriverIcon} />
        </Section>
        
        {isPlayerSkill && scalingCalculations && skill.scalingCharacteristic && (
            <Section title={t("Effect Scaling")} icon={BeakerIcon}>
                <div className="bg-gray-800/50 p-3 rounded-md space-y-2 text-sm">
                    <DetailRow label={t("Base Value/Duration")} value={`${scalingCalculations.baseValue}% ${scalingCalculations.baseDuration != null ? `/ ${t('{duration} turns', { duration: scalingCalculations.baseDuration })}` : ''}`} />
                    <div className="pl-4 border-l-2 border-gray-700 space-y-1">
                        <DetailRow label={t("Bonus from {char}", { char: t(skill.scalingCharacteristic as any) })} value={`+${scalingCalculations.charBonusPercent}% (${t('Value')}: ${scalingCalculations.relevantCharValue})`} />
                        <DetailRow label={t("Bonus from Level")} value={`+${scalingCalculations.levelBonusPercent}% (${t('Level')} ${playerCharacter?.level})`} />
                        <DetailRow label={t("Bonus from Mastery")} value={`+${scalingCalculations.masteryBonusPercent}% (${t('Level')} ${masteryLevel})`} />
                    </div>
                    <DetailRow label={t("Total Multiplier")} value={`${scalingCalculations.totalBonusMultiplier.toFixed(2)}x`} />
                    
                    <div className="pt-2 border-t border-gray-700/50">
                        {scalingCalculations.finalValue !== null && <DetailRow label={t("Final Scaled Value")} value={<span className="font-bold text-green-400">{`${scalingCalculations.finalValue}%`}</span>} />}
                        {scalingCalculations.finalDuration !== null && <DetailRow label={t("Final Scaled Duration")} value={<span className="font-bold text-green-400">{t('{duration} turns', { duration: scalingCalculations.finalDuration })}</span>} />}
                        {scalingCalculations.finalChance !== null && <DetailRow label={t("Final Scaled Chance")} value={<span className="font-bold text-green-400">{`${scalingCalculations.finalChance}%`}</span>} />}
                    </div>
                </div>
            </Section>
        )}

        {skill.combatEffect && (
            <Section title={t("Combat Effect")} icon={BoltIcon}>
                <CombatActionDetails action={skill.combatEffect} />
            </Section>
        )}
        {isPlayerSkill && canBeAuto && setAutoCombatSkill && (
            <Section title={t("Auto-Combat")} icon={Cog6ToothIcon}>
                <p className="text-sm text-gray-400">{t("Set this skill to be used automatically for general attack commands in combat.")}</p>
                <button
                    onClick={() => setAutoCombatSkill(isCurrentlyAuto ? null : skill.skillName)}
                    className={`w-full mt-2 px-4 py-2 rounded-md font-semibold transition-colors ${
                        isCurrentlyAuto
                            ? 'bg-yellow-600/80 hover:bg-yellow-700 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                >
                    {isCurrentlyAuto ? t("Clear Auto-Combat Skill") : t("Set as Auto-Combat Skill")}
                </button>
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

export default ActiveSkillDetailsRenderer;