import React from 'react';
import { PassiveSkill } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import DetailRow from './Shared/DetailRow';
import CombatActionDetails from './Shared/CombatActionDetails';
import MarkdownRenderer from '../MarkdownRenderer';
import { useLocalization } from '../../context/LocalizationContext';
import {
    InformationCircleIcon, TagIcon, PuzzlePieceIcon, CogIcon, AcademicCapIcon, StarIcon, LightBulbIcon, BoltIcon
} from '@heroicons/react/24/outline';
import { qualityColorMap } from './utils';

interface PassiveSkillDetailsProps extends Omit<DetailRendererProps, 'data'> {
  skill: PassiveSkill;
}

const PassiveSkillDetailsRenderer: React.FC<PassiveSkillDetailsProps> = ({ skill }) => {
    const { t } = useLocalization();
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
        {skill.playerStatBonus && (
            <Section title={t("Bonus")} icon={StarIcon}>
                <MarkdownRenderer content={skill.playerStatBonus} />
            </Section>
        )}
        {skill.effectDetails && (
            <Section title={t("Effect Details")} icon={LightBulbIcon}>
                <MarkdownRenderer content={skill.effectDetails} />
            </Section>
        )}
        {skill.combatEffect && (
            <Section title={t("Combat Effect")} icon={BoltIcon}>
                <CombatActionDetails action={skill.combatEffect} />
            </Section>
        )}
    </div>
    );
};

export default PassiveSkillDetailsRenderer;