
import React from 'react';
import { CombatAction } from '../../../types';
import { useLocalization } from '../../../context/LocalizationContext';
import StatItem from './StatItem';
import EffectCard from './EffectCard';
import { Cog6ToothIcon, UsersIcon, AcademicCapIcon, HashtagIcon, PaperClipIcon, SparklesIcon } from '@heroicons/react/24/outline';

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
