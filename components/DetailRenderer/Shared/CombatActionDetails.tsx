
import React from 'react';
import { CombatAction, CombatActionEffect } from '../../../types';
import { useLocalization } from '../../../context/LocalizationContext';
import StatItem from './StatItem';
import { 
    Cog6ToothIcon, UsersIcon, AcademicCapIcon, HashtagIcon, PaperClipIcon, SparklesIcon, 
    HeartIcon, FireIcon, SunIcon, CloudIcon, ShieldCheckIcon, ShieldExclamationIcon, HandRaisedIcon 
} from '@heroicons/react/24/outline';
import MarkdownRenderer from '../../MarkdownRenderer';
import { parseAndTranslateTargetType, generateEffectDescription } from '../utils';

// Re-implemented EffectCard here to add the new feature as the original file was not provided.
const EffectCard = ({ effect }: { effect: CombatActionEffect }) => {
    const { t } = useLocalization();
    const effectMeta: Record<string, { icon: React.ElementType; colorClass: string }> = {
        'Damage': { icon: FireIcon, colorClass: 'border-red-500 text-red-400' },
        'DamageOverTime': { icon: FireIcon, colorClass: 'border-red-500 text-red-400' },
        'Heal': { icon: HeartIcon, colorClass: 'border-green-500 text-green-400' },
        'HealOverTime': { icon: HeartIcon, colorClass: 'border-green-500 text-green-400' },
        'Buff': { icon: SunIcon, colorClass: 'border-blue-500 text-blue-400' },
        'DamageReduction': { icon: ShieldCheckIcon, colorClass: 'border-blue-500 text-blue-400' },
        'Debuff': { icon: CloudIcon, colorClass: 'border-yellow-500 text-yellow-400' },
        'Control': { icon: HandRaisedIcon, colorClass: 'border-yellow-500 text-yellow-400' },
        'WoundReference': { icon: ShieldExclamationIcon, colorClass: 'border-purple-500 text-purple-400' },
    };
    const meta = effectMeta[effect.effectType] || { icon: SparklesIcon, colorClass: 'border-gray-500 text-gray-400' };
    const Icon = meta.icon;
    
    const descriptionToRender = generateEffectDescription(effect, t);

    return (
        <div className={`bg-gray-900/40 p-3 rounded-md border-l-4 ${meta.colorClass.split(' ')[0]}`}>
            <div className="font-semibold text-gray-200 flex items-start gap-2">
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${meta.colorClass.split(' ')[1]}`} />
                <MarkdownRenderer content={descriptionToRender} className="flex-1" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-gray-400 mt-2 pl-7">
                <span><strong>{t("Value")}:</strong> {t(effect.value as any)}</span>
                <span><strong>{t("Target")}:</strong> {effect.targetTypeDisplayName || parseAndTranslateTargetType(effect.targetType, t)}</span>
                {effect.duration != null && <span><strong>{t("Duration")}:</strong> {t('{duration} turns', { duration: effect.duration })}</span>}
                {effect.targetsCount !== undefined && <span><strong>{t("Targets")}:</strong> {effect.targetsCount}</span>}
                {effect.effectType === 'DamageReduction' && effect.damageThreshold != null && <span title={t('thresholdTooltip')}><strong>{t("Threshold")}:</strong> {effect.damageThreshold}</span>}
            </div>
        </div>
    );
};


const CombatActionDetails = ({ action }: { action: CombatAction }) => {
    const { t } = useLocalization();
    return (
        <div className="bg-gray-700/50 p-4 rounded-lg space-y-4">
            {action.actionName && <h4 className="font-bold text-xl text-cyan-300 narrative-text">{t(action.actionName as any)}</h4>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <StatItem icon={Cog6ToothIcon} label={t("Activation Type")} value={action.isActivatedEffect ? t('Active') : t('Passive')} />
                {action.targetPriority && <StatItem icon={UsersIcon} label={t("Target Priority")} value={t(action.targetPriority as any)} />}
                {action.scalingCharacteristic && <StatItem icon={AcademicCapIcon} label={t("Scaling Characteristic")} value={t(action.scalingCharacteristic as any)} />}
                {action.shotsPerTurn && <StatItem icon={HashtagIcon} label={t("Shots Per Turn")} value={action.shotsPerTurn} />}
                {action.ammoType && <StatItem icon={PaperClipIcon} label={t("Ammo Type")} value={action.ammoType} />}
            </div>

            {action.effects && action.effects.length > 0 && (
                <div className="pt-2">
                    <h5 className="font-semibold text-gray-400 mb-2 flex items-center gap-2 text-base"><SparklesIcon className="w-5 h-5" />{t("Effects")}</h5>
                    <div className="space-y-3">
                        {action.effects.map((effect, i) => (
                           <EffectCard key={i} effect={effect} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CombatActionDetails;