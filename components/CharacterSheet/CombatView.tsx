import React from 'react';
import { useLocalization } from '../../context/LocalizationContext';
import SectionHeader from './Shared/SectionHeader';
import { 
    FireIcon as FireSolidIcon, 
    ShieldCheckIcon as ShieldCheckSolidIcon, 
    SparklesIcon as SparklesSolidIcon,
    LightBulbIcon as LightBulbSolidIcon,
    SunIcon as SunSolidIcon,
    HandRaisedIcon as HandRaisedSolidIcon,
} from '@heroicons/react/24/solid';

interface CombatViewProps {
    derivedStats: {
        levelAttackBonus: number;
        levelResistance: number;
        strAttackBonus: number;
        precisionAttackBonus: number;
        speedAttackBonus: number;
        arcaneAttackBonus: number;
        willpowerAttackBonus: number;
        divineAttackBonus: number;
        conResistance: number;
        critDamageLuckBonus: number;
        finalCritMultiplier: number;
        totalMeleeAttackBonus: number;
        totalPrecisionAttackBonus: number;
        totalSpeedAttackBonus: number;
        totalArcaneAttackBonus: number;
        totalWillpowerAttackBonus: number;
        totalDivineAttackBonus: number;
        totalGeneralResistance: number;
    } | null;
    onOpenDetailModal: (title: string, data: any) => void;
}

const CombatView: React.FC<CombatViewProps> = ({ derivedStats, onOpenDetailModal }) => {
    const { t } = useLocalization();

    if (!derivedStats) return null;

    return (
        <div className="space-y-4">
            <div className="mt-6">
                <SectionHeader title={t("Physical Combat")} icon={FireSolidIcon} />
                <div className="space-y-2">
                    <button onClick={() => onOpenDetailModal(t("Derived Stat: {name}", { name: t("Melee Attack Bonus") }), { type: 'derivedStat', name: t("Melee Attack Bonus"), value: `+${derivedStats.totalMeleeAttackBonus}%`, breakdown: [{ label: t('Level Bonus'), value: `+${derivedStats.levelAttackBonus}%` }, { label: t('Strength Bonus'), value: `+${derivedStats.strAttackBonus}%` }], description: t('derived_stat_description_melee_attack')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-red-300"><FireSolidIcon className="w-5 h-5 text-red-400" />{t('Melee Attack Bonus')}</span>
                        <span className="font-mono text-red-300 font-bold">+{derivedStats.totalMeleeAttackBonus}%</span>
                    </button>
                    <button onClick={() => onOpenDetailModal(t("Derived Stat: {name}", { name: t("Precision Attack Bonus") }), { type: 'derivedStat', name: t("Precision Attack Bonus"), value: `+${derivedStats.totalPrecisionAttackBonus}%`, breakdown: [{ label: t('Level Bonus'), value: `+${derivedStats.levelAttackBonus}%` }, { label: t('Dexterity Bonus'), value: `+${derivedStats.precisionAttackBonus}%` }], description: t('derived_stat_description_precision_attack')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-red-300"><FireSolidIcon className="w-5 h-5 text-red-400" />{t('Precision Attack Bonus')}</span>
                        <span className="font-mono text-red-300 font-bold">+{derivedStats.totalPrecisionAttackBonus}%</span>
                    </button>
                    <button onClick={() => onOpenDetailModal(t("Derived Stat: {name}", { name: t("Speed Attack Bonus") }), { type: 'derivedStat', name: t("Speed Attack Bonus"), value: `+${derivedStats.totalSpeedAttackBonus}%`, breakdown: [{ label: t('Level Bonus'), value: `+${derivedStats.levelAttackBonus}%` }, { label: t('Speed Bonus'), value: `+${derivedStats.speedAttackBonus}%` }], description: t('derived_stat_description_speed_attack')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-red-300"><FireSolidIcon className="w-5 h-5 text-red-400" />{t('Speed Attack Bonus')}</span>
                        <span className="font-mono text-red-300 font-bold">+{derivedStats.totalSpeedAttackBonus}%</span>
                    </button>
                </div>
            </div>
            <div className="mt-6">
                <SectionHeader title={t("Magical & Psionic Combat")} icon={LightBulbSolidIcon} />
                <div className="space-y-2">
                    <button onClick={() => onOpenDetailModal(t("Derived Stat: {name}", { name: t("Arcane Attack Bonus") }), { type: 'derivedStat', name: t("Arcane Attack Bonus"), value: `+${derivedStats.totalArcaneAttackBonus}%`, breakdown: [{ label: t('Level Bonus'), value: `+${derivedStats.levelAttackBonus}%` }, { label: t('Intelligence Bonus'), value: `+${derivedStats.arcaneAttackBonus}%` }], description: t('derived_stat_description_arcane_attack')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-indigo-300"><LightBulbSolidIcon className="w-5 h-5 text-indigo-400" />{t('Arcane Attack Bonus')}</span>
                        <span className="font-mono text-indigo-300 font-bold">+{derivedStats.totalArcaneAttackBonus}%</span>
                    </button>
                    <button onClick={() => onOpenDetailModal(t("Derived Stat: {name}", { name: t("Willpower Attack Bonus") }), { type: 'derivedStat', name: t("Willpower Attack Bonus"), value: `+${derivedStats.totalWillpowerAttackBonus}%`, breakdown: [{ label: t('Level Bonus'), value: `+${derivedStats.levelAttackBonus}%` }, { label: t('Wisdom Bonus'), value: `+${derivedStats.willpowerAttackBonus}%` }], description: t('derived_stat_description_willpower_attack')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-cyan-300"><HandRaisedSolidIcon className="w-5 h-5 text-cyan-400" />{t('Willpower Attack Bonus')}</span>
                        <span className="font-mono text-cyan-300 font-bold">+{derivedStats.totalWillpowerAttackBonus}%</span>
                    </button>
                    <button onClick={() => onOpenDetailModal(t("Derived Stat: {name}", { name: t("Divine Attack Bonus") }), { type: 'derivedStat', name: t("Divine Attack Bonus"), value: `+${derivedStats.totalDivineAttackBonus}%`, breakdown: [{ label: t('Level Bonus'), value: `+${derivedStats.levelAttackBonus}%` }, { label: t('Faith Bonus'), value: `+${derivedStats.divineAttackBonus}%` }], description: t('derived_stat_description_divine_attack')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-yellow-300"><SunSolidIcon className="w-5 h-5 text-yellow-400" />{t('Divine Attack Bonus')}</span>
                        <span className="font-mono text-yellow-300 font-bold">+{derivedStats.totalDivineAttackBonus}%</span>
                    </button>
                </div>
            </div>
            <div className="mt-6">
                <SectionHeader title={t("General Combat")} icon={ShieldCheckSolidIcon} />
                <div className="space-y-2">
                    <button onClick={() => onOpenDetailModal(t("Derived Stat: {name}", { name: t("Critical Damage Multiplier") }), { type: 'derivedStat', name: t("Critical Damage Multiplier"), value: `${derivedStats.finalCritMultiplier.toFixed(2)}x`, breakdown: [{ label: t('Base Multiplier'), value: `1.50x` }, { label: t('Luck Bonus'), value: `+${derivedStats.critDamageLuckBonus}%` }], description: t('derived_stat_description_crit_multiplier')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-yellow-300"><SparklesSolidIcon className="w-5 h-5 text-yellow-400" />{t('Critical Damage Multiplier')}</span>
                        <span className="font-mono text-yellow-300 font-bold">{derivedStats.finalCritMultiplier.toFixed(2)}x</span>
                    </button>
                    <button onClick={() => onOpenDetailModal(t("Derived Stat: {name}", { name: t("General Resistance") }), { type: 'derivedStat', name: t("General Resistance"), value: `${derivedStats.totalGeneralResistance}%`, breakdown: [{ label: t('Level Bonus'), value: `${derivedStats.levelResistance}%` }, { label: t('Constitution Bonus'), value: `${derivedStats.conResistance}%` }], description: t('derived_stat_description_general_resistance')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-green-300"><ShieldCheckSolidIcon className="w-5 h-5 text-green-400" />{t('General Resistance')}</span>
                        <span className="font-mono text-green-300 font-bold">{derivedStats.totalGeneralResistance}%</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CombatView;
