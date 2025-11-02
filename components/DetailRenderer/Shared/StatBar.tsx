import React from 'react';
import { useLocalization } from '../../../context/LocalizationContext';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { PlayerCharacter, NPC } from '../../../types';

const StatBar: React.FC<{
    value: number;
    max: number;
    threshold?: number;
    color: string;
    thresholdColor?: string;
    label: string;
    unit?: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    onClick?: () => void;
    min?: number;
    title?: string;
    character?: PlayerCharacter | NPC;
}> = ({ value, max, threshold, color, thresholdColor = 'bg-red-500', label, unit = '', icon: Icon, onClick, min = 0, title, character }) => {
    const { t } = useLocalization();
    const isOverThreshold = threshold !== undefined && value > threshold;
    const hasMeaningfulRange = max > (min || 0);

    const barMax = threshold !== undefined && character ? max + ((character as PlayerCharacter).criticalExcessWeight ?? 15) : max;
    const range = barMax - (min || 0);
    const valueInRange = value - (min || 0);
    const valuePercentage = range > 0 ? (valueInRange / range) * 100 : 0;
    const thresholdPercentage = threshold !== undefined && range > 0 ? ((threshold - (min || 0)) / range) * 100 : 101;

    const displayValue = value || 0;
    
    const formattedValue = React.useMemo(() => {
        const healthLabel = t('Health');
        const energyLabel = t('Energy');
        const experienceLabel = t('Experience');
        const weightLabel = t('Weight');
        const relationshipLabel = t('Relationship');
        const reputationLabel = t('Reputation');

        if (label === healthLabel || label === energyLabel || label === experienceLabel || label === reputationLabel) {
            return `${Math.round(displayValue)} / ${Math.round(max)}`;
        }
        if (label === weightLabel) {
            return `${displayValue.toFixed(1)}${unit} / ${(threshold ?? max).toFixed(0)}${unit}`;
        }
        if (label === relationshipLabel) {
             return `${Math.round(displayValue)} / ${Math.round(max)}`;
        }
        
        const unitDisplay = unit ? ` ${unit}` : '';
        if (hasMeaningfulRange) {
            return `${t('Current')}: ${displayValue.toFixed(2)} (${t('Range')}: ${min.toFixed(2)} – ${max.toFixed(2)})`;
        }
        return `${displayValue.toFixed(2)} / ${max.toFixed(2)}${unitDisplay}`;
    }, [label, displayValue, max, min, unit, t, hasMeaningfulRange, threshold]);
    
    return (
        <button onClick={onClick} className="w-full text-left group transition-transform transform disabled:cursor-default hover:enabled:scale-[1.02]" disabled={!onClick} title={title}>
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isOverThreshold ? 'text-red-400' : color.replace('bg-', 'text-')}`} />
                    <span className={`text-sm font-medium ${isOverThreshold ? 'text-red-300' : 'text-gray-300'} group-hover:enabled:text-cyan-300`}>{label}</span>
                    {isOverThreshold && <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" title={t('Overloaded!')} />}
                </div>
              <span className={`text-sm font-mono ${isOverThreshold ? 'text-red-300' : 'text-gray-400'}`}>
                   {formattedValue}
              </span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2.5 relative overflow-hidden">
                <div className={`${isOverThreshold ? thresholdColor : color} h-2.5 rounded-l-full transition-all duration-500 absolute left-0 top-0`} style={{ width: `${valuePercentage}%` }}></div>
                {threshold !== undefined && (
                    <div className="absolute top-0 bottom-0 border-r-2 border-yellow-300" style={{ left: `${thresholdPercentage}%` }} title={t('Max Weight (Overload Threshold)')}></div>
                )}
            </div>
        </button>
    );
};

export default StatBar;
