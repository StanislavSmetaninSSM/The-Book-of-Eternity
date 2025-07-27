
import React from 'react';
import { CombatActionEffect } from '../../../types';
import { useLocalization } from '../../../context/LocalizationContext';
import { parseAndTranslateTargetType } from '../utils';
import MarkdownRenderer from '../../MarkdownRenderer';
import { HeartIcon, FireIcon, SunIcon, CloudIcon, SparklesIcon, ShieldCheckIcon, ShieldExclamationIcon, HandRaisedIcon } from '@heroicons/react/24/outline';

const EffectCard = ({ effect }: { effect: CombatActionEffect }) => {
    const { t } = useLocalization();
    const effectMeta: Record<string, { icon: React.ElementType; colorClass: string }> = {
        Damage: { icon: FireIcon, colorClass: 'border-red-500 text-red-400' },
        DamageOverTime: { icon: FireIcon, colorClass: 'border-red-500 text-red-400' },
        Heal: { icon: HeartIcon, colorClass: 'border-green-500 text-green-400' },
        HealOverTime: { icon: HeartIcon, colorClass: 'border-green-500 text-green-400' },
        Buff: { icon: SunIcon, colorClass: 'border-blue-500 text-blue-400' },
        DamageReduction: { icon: ShieldCheckIcon, colorClass: 'border-blue-500 text-blue-400' },
        Debuff: { icon: CloudIcon, colorClass: 'border-yellow-500 text-yellow-400' },
        Control: { icon: HandRaisedIcon, colorClass: 'border-yellow-500 text-yellow-400' },
        WoundReference: { icon: ShieldExclamationIcon, colorClass: 'border-purple-500 text-purple-400' },
    };
    const meta = effectMeta[effect.effectType] || { icon: SparklesIcon, colorClass: 'border-gray-500 text-gray-400' };
    const Icon = meta.icon;
    
    return (
        <div className={`bg-gray-900/40 p-3 rounded-md border-l-4 ${meta.colorClass.split(' ')[0]}`}>
            <div className="font-semibold text-gray-200 flex items-start gap-2">
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${meta.colorClass.split(' ')[1]}`} />
                <MarkdownRenderer content={effect.effectDescription} className="flex-1" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-gray-400 mt-2 pl-7">
                <span><strong>{t("Value")}:</strong> {t(effect.value as any)}</span>
                <span><strong>{t("Target")}:</strong> {effect.targetTypeDisplayName || parseAndTranslateTargetType(effect.targetType, t)}</span>
                {effect.duration != null && <span><strong>{t("Duration")}:</strong> {t('{duration} turns', { duration: effect.duration })}</span>}
                {effect.targetsCount !== undefined && <span><strong>{t("Targets")}:</strong> {effect.targetsCount}</span>}
            </div>
        </div>
    );
};

export default EffectCard;
