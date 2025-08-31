

import React, {useState} from 'react';
import { Wound } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import DetailRow from './Shared/DetailRow';
import EffectDetailsRenderer from './EffectDetailsRenderer';
import MarkdownRenderer from '../MarkdownRenderer';
import { useLocalization } from '../../context/LocalizationContext';
import {
    InformationCircleIcon, ExclamationTriangleIcon, HeartIcon, ShieldExclamationIcon, TrashIcon, CogIcon
} from '@heroicons/react/24/outline';
import ConfirmationModal from '../ConfirmationModal';

interface WoundDetailsProps extends Omit<DetailRendererProps, 'data'> {
  wound: Wound & { characterType?: 'player' | 'npc', characterId?: string | null };
}

const WoundDetailsRenderer: React.FC<WoundDetailsProps> = ({ wound, allowHistoryManipulation, forgetActiveWound, forgetHealedWound, clearAllHealedWounds }) => {
    const { t } = useLocalization();
    const [isForgetConfirmOpen, setIsForgetConfirmOpen] = useState(false);
    const healing = wound.healingState;
    const progressPercentage = healing && healing.progressNeeded > 0 ? (healing.treatmentProgress / healing.progressNeeded) * 100 : 0;
    
    // Defensive check to prevent crash from malformed AI data where generatedEffects might not be an array.
    const safeGeneratedEffects = Array.isArray(wound.generatedEffects) 
        ? wound.generatedEffects.filter(effect => effect) 
        : [];
    
    const handleForgetConfirm = () => {
        if (forgetActiveWound && wound.woundId && wound.characterType) {
            forgetActiveWound(wound.characterType, wound.characterId || null, wound.woundId);
        }
        setIsForgetConfirmOpen(false);
    };

    return (
        <>
            <div className="space-y-4">
                <div className="italic text-gray-400"><MarkdownRenderer content={wound.descriptionOfEffects} /></div>

                <Section title={t("Properties")} icon={InformationCircleIcon}>
                    <DetailRow label={t("Severity")} value={t(wound.severity as any)} icon={ExclamationTriangleIcon} />
                </Section>

                {healing && (
                    <Section title={t("Healing Progress")} icon={HeartIcon}>
                        <div className="bg-gray-900/30 p-4 rounded-lg space-y-4 border border-gray-700/50">
                            <DetailRow 
                                label={t("Current State")} 
                                value={<span className="font-bold text-cyan-300">{t(healing.currentState as any)}</span>} 
                            />
                            <div className="text-sm text-gray-400 italic border-l-2 border-cyan-500/30 pl-3">
                                <MarkdownRenderer content={healing.description} />
                            </div>

                            {healing.currentState !== 'Healed' && healing.nextState && (
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-sm">
                                        <span className="font-medium text-gray-300">{t("Progress to")} <span className="font-bold text-green-400">{t(healing.nextState as any)}</span></span>
                                        <span className="font-mono text-gray-400">{healing.treatmentProgress} / {healing.progressNeeded}</span>
                                    </div>
                                    <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                                        <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                </div>
                            )}
                            
                            {healing.canBeImprovedBy && healing.canBeImprovedBy.length > 0 && (
                                <div className="pt-2">
                                    <h5 className="font-semibold text-gray-400 text-sm mb-2">{t("Can be improved by:")}</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {healing.canBeImprovedBy.map((method, i) => (
                                            <span key={i} className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">{method}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Section>
                )}

                {safeGeneratedEffects.length > 0 && (
                     <Section title={t("Generated Effects")} icon={ShieldExclamationIcon}>
                        <div className="space-y-3">
                            {safeGeneratedEffects.map((effect, i) => <EffectDetailsRenderer key={i} effect={effect} />)}
                        </div>
                    </Section>
                )}
            </div>
             <ConfirmationModal
                isOpen={isForgetConfirmOpen}
                onClose={() => setIsForgetConfirmOpen(false)}
                onConfirm={handleForgetConfirm}
                title={t("Forget Active Wound")}
            >
                <p>{t('forget_active_wound_confirm')}</p>
            </ConfirmationModal>
        </>
    );
};

export default WoundDetailsRenderer;
