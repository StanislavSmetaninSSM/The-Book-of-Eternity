import React from 'react';
import { ActiveSkill } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import DetailRow from './Shared/DetailRow';
import CombatActionDetails from './Shared/CombatActionDetails';
import MarkdownRenderer from '../MarkdownRenderer';
import { useLocalization } from '../../context/LocalizationContext';
import {
    InformationCircleIcon, TagIcon, BoltIcon, ClockIcon, ArrowPathIcon, LinkIcon, WrenchScrewdriverIcon, Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { qualityColorMap } from './utils';

interface ActiveSkillDetailsProps extends Omit<DetailRendererProps, 'data'> {
  skill: ActiveSkill & { owner?: 'player' | 'npc' };
}

const ActiveSkillDetailsRenderer: React.FC<ActiveSkillDetailsProps> = ({ skill, playerCharacter, setAutoCombatSkill }) => {
    const { t } = useLocalization();
    const isCurrentlyAuto = playerCharacter?.autoCombatSkill === skill.skillName;
    const canBeAuto = !!skill.combatEffect && (skill.combatEffect.isActivatedEffect === undefined || skill.combatEffect.isActivatedEffect === true);
    const isPlayerSkill = skill.owner !== 'npc';

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
        <Section title={t("Scaling")} icon={ArrowPathIcon}>
            <DetailRow label={t("Scales With")} value={skill.scalingCharacteristic ? t(skill.scalingCharacteristic as any) : t('None')} icon={LinkIcon} />
            <DetailRow label={t("Scales Value")} value={skill.scalesValue ? t('Yes') : t('No')} icon={WrenchScrewdriverIcon} />
            <DetailRow label={t("Scales Duration")} value={skill.scalesDuration ? t('Yes') : t('No')} icon={WrenchScrewdriverIcon} />
            <DetailRow label={t("Scales Chance")} value={skill.scalesChance ? t('Yes') : t('No')} icon={WrenchScrewdriverIcon} />
        </Section>
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
    </div>
    );
};

export default ActiveSkillDetailsRenderer;