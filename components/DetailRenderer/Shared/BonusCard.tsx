
import React, { useMemo } from 'react';
import { StructuredBonus } from '../../../types';
import { useLocalization } from '../../../context/LocalizationContext';
import {
    AcademicCapIcon,
    WrenchScrewdriverIcon,
    SparklesIcon,
    BoltIcon,
    StarIcon,
    InformationCircleIcon,
    ShieldCheckIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const BonusCard: React.FC<{ bonus: StructuredBonus, onDelete?: () => void }> = ({ bonus, onDelete }) => {
    const { t } = useLocalization();
    const { icon: Icon, colorClass, titleKey } = useMemo(() => {
        switch(bonus.bonusType) {
            case 'Characteristic': return { icon: AcademicCapIcon, colorClass: 'border-cyan-500', titleKey: 'Characteristic Bonus' };
            case 'ActionCheck': return { icon: ShieldCheckIcon, colorClass: 'border-green-500', titleKey: 'Action Check Bonus' };
            case 'Utility': return { icon: WrenchScrewdriverIcon, colorClass: 'border-blue-500', titleKey: 'Utility Effect' };
            case 'PowerProfileScale': return { icon: StarIcon, colorClass: 'border-yellow-500', titleKey: 'Power Profile Bonus' };
            case 'Resource': return { icon: BoltIcon, colorClass: 'border-orange-500', titleKey: 'Resource Bonus' };
            case 'CustomStatePower': return { icon: InformationCircleIcon, colorClass: 'border-purple-500', titleKey: 'Custom State Power' };
            default: return { icon: SparklesIcon, colorClass: 'border-indigo-500', titleKey: 'Other Bonus' };
        }
    }, [bonus.bonusType]);

    return (
        <div className={`bg-gray-800/60 p-3 rounded-md border-l-4 ${colorClass} relative group`}>
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
            {onDelete && (
                <button
                    onClick={onDelete}
                    className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                    title={t('Delete Bonus')}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default BonusCard;
