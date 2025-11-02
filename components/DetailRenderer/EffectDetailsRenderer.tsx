import React from 'react';
import { Effect } from '../../types';
import Section from './Shared/Section';
import DetailRow from './Shared/DetailRow';
import MarkdownRenderer from '../MarkdownRenderer';
import { parseAndTranslateTargetType } from './utils';
import { useLocalization } from '../../context/LocalizationContext';
import {
    InformationCircleIcon, SunIcon, CloudIcon, BeakerIcon, AdjustmentsHorizontalIcon, ClockIcon, SparklesIcon
} from '@heroicons/react/24/outline';

const EffectDetailsRenderer = ({ effect }: { effect: Effect }) => {
    const { t } = useLocalization();
    return (
     <div className="space-y-4">
        <div className="italic text-gray-400"><MarkdownRenderer content={effect.description} /></div>
        <Section title={t("Properties")} icon={InformationCircleIcon}>
            <DetailRow label={t("Type")} value={t(effect.effectType as any)} icon={effect.effectType.includes('Buff') ? SunIcon : CloudIcon} />
            <DetailRow label={t("Value")} value={t(effect.value as any)} icon={BeakerIcon} />
            <DetailRow label={t("Target")} value={parseAndTranslateTargetType(effect.targetType, t)} icon={AdjustmentsHorizontalIcon} />
            {effect.duration < 999 && <DetailRow label={t("Duration")} value={t('turns_left_count', { duration: effect.duration })} icon={ClockIcon} />}
            {effect.sourceSkill && <DetailRow label={t("Source")} value={effect.sourceSkill} icon={SparklesIcon} />}
        </Section>
    </div>
    );
};

export default EffectDetailsRenderer;