
import React, { useState } from 'react';
import { PlayerCharacter, NPC, Effect, Wound, CustomState } from '../../types';
import { useLocalization } from '../../context/LocalizationContext';
import SectionHeader from './Shared/SectionHeader';
import ConfirmationModal from '../ConfirmationModal';
import StatBar from './Shared/StatBar';
import {
    SunIcon,
    CloudIcon,
    ExclamationTriangleIcon,
    ShieldExclamationIcon,
    TrashIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from '@heroicons/react/24/outline';

interface ConditionsViewProps {
    character: PlayerCharacter | NPC;
    isPlayer: boolean;
    isAdminEditable: boolean;
    onOpenDetailModal: (title: string, data: any) => void;
    forgetHealedWound: (characterType: 'player' | 'npc', characterId: string | null, woundId: string) => void;
    forgetActiveWound: (characterType: 'player' | 'npc', characterId: string | null, woundId: string) => void;
    clearAllHealedWounds: (characterType: 'player' | 'npc', characterId: string | null) => void;
    onDeleteCustomState: (stateId: string) => void;
    onDeleteNpcCustomState?: (npcId: string, stateId: string) => void;
    onDeleteActiveEffect: (characterType: 'player' | 'npc', characterId: string | null, effectId: string) => void;
}

const ConditionsView: React.FC<ConditionsViewProps> = ({
    character,
    isPlayer,
    isAdminEditable,
    onOpenDetailModal,
    forgetHealedWound,
    forgetActiveWound,
    clearAllHealedWounds,
    onDeleteCustomState,
    onDeleteNpcCustomState,
    onDeleteActiveEffect
}) => {
    const { t } = useLocalization();
    const [confirmClear, setConfirmClear] = useState(false);
    const [confirmForget, setConfirmForget] = useState<Wound | null>(null);
    const [confirmForgetActive, setConfirmForgetActive] = useState<Wound | null>(null);
    const [healedWoundsCollapsed, setHealedWoundsCollapsed] = useState(true);
    const [confirmDeleteState, setConfirmDeleteState] = useState<CustomState | null>(null);
    const [confirmDeleteEffect, setConfirmDeleteEffect] = useState<Effect | null>(null);
    
    const effects = isPlayer ? (character as PlayerCharacter).activePlayerEffects : (character as NPC).activeEffects || [];
    const wounds = isPlayer ? (character as PlayerCharacter).playerWounds : (character as NPC).wounds || [];
    const customStates = isPlayer ? (character as PlayerCharacter).playerCustomStates : (character as NPC).customStates || [];
    const activeWounds = (wounds ?? []).filter(w => w.healingState && w.healingState.currentState !== 'Healed');
    const healedWounds = (wounds ?? []).filter(w => w.healingState && w.healingState.currentState === 'Healed');
    
    const handleClearAllHealedWounds = () => {
        clearAllHealedWounds(isPlayer ? 'player' : 'npc', isPlayer ? null : (character as NPC).NPCId);
        setConfirmClear(false);
    };
    
    const handleForgetWound = () => {
        if (confirmForget && confirmForget.woundId) {
            forgetHealedWound(isPlayer ? 'player' : 'npc', isPlayer ? null : (character as NPC).NPCId, confirmForget.woundId);
        }
        setConfirmForget(null);
    };
    
    const handleForgetActiveWound = () => {
        if (confirmForgetActive && confirmForgetActive.woundId) {
            forgetActiveWound(isPlayer ? 'player' : 'npc', isPlayer ? null : (character as NPC).NPCId, confirmForgetActive.woundId);
        }
        setConfirmForgetActive(null);
    };

    const handleDeleteCustomState = () => {
        if (!confirmDeleteState) return;
        const stateIdentifier = confirmDeleteState.stateId || confirmDeleteState.stateName;
        if (isPlayer) {
            onDeleteCustomState(stateIdentifier);
        } else if (onDeleteNpcCustomState) {
            onDeleteNpcCustomState((character as NPC).NPCId, stateIdentifier);
        }
        setConfirmDeleteState(null);
    };

    const handleDeleteEffectConfirm = () => {
        if (confirmDeleteEffect && confirmDeleteEffect.effectId) {
            onDeleteActiveEffect(isPlayer ? 'player' : 'npc', isPlayer ? null : (character as NPC).NPCId, confirmDeleteEffect.effectId);
        }
        setConfirmDeleteEffect(null);
    };

    return (
        <>
            <div className="space-y-4">
                <div className="mt-6">
                    <SectionHeader title={t('Active Effects')} icon={SunIcon} />
                    <div className="space-y-3 text-gray-300">
                        {(effects ?? []).length > 0 ? (effects ?? []).map((effect, index) => {
                            const isWoundRef = effect.effectType === 'WoundReference' && effect.sourceWoundId;
                            let linkedWound: Wound | undefined;
                            if (isWoundRef) {
                                linkedWound = wounds.find(w => w.woundId === effect.sourceWoundId);
                                if (!linkedWound && effect.sourceSkill) {
                                    linkedWound = wounds.find(w => w.woundName === effect.sourceSkill);
                                }
                            }
                            
                            return (
                                <div key={effect.effectId || index} className="relative group">
                                    <button
                                        onClick={() => {
                                            if (linkedWound) {
                                                const cleanWound = {
                                                    type: 'wound',
                                                    characterType: isPlayer ? 'player' : 'npc' as 'player' | 'npc',
                                                    characterId: isPlayer ? null : (character as NPC).NPCId,
                                                    ...linkedWound
                                                };
                                                onOpenDetailModal(t("Wound: {name}", { name: linkedWound.woundName }), cleanWound);
                                            } else {
                                                onOpenDetailModal(t("Effect: {name}", { name: effect.sourceSkill || t('Effect') }), effect);
                                            }
                                        }}
                                        className={`w-full text-left p-3 rounded-md text-sm flex items-start gap-3 hover:scale-105 transition-transform ${
                                            isWoundRef ? 'bg-purple-900/40 text-purple-300' :
                                            effect.effectType.includes('Buff') ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'
                                        }`}
                                    >
                                        {isWoundRef 
                                            ? <ShieldExclamationIcon className="w-5 h-5 mt-0.5 text-purple-400 flex-shrink-0" />
                                            : (effect.effectType.includes('Buff') ? <SunIcon className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" /> : <CloudIcon className="w-5 h-5 mt-0.5 text-red-400 flex-shrink-0" />)
                                        }
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-semibold">{linkedWound ? t('Wound') : (effect.sourceSkill || t('Effect'))}</span>
                                                {effect.duration < 999 && <span className="text-xs">{t('turns_left_count', { duration: effect.duration })}</span>}
                                            </div>
                                            <p>{effect.description}</p>
                                        </div>
                                    </button>
                                    {isAdminEditable && effect.effectId && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteEffect(effect); }}
                                            className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                            title={t('Delete Effect')}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            );

                        }) : <p className="text-sm text-gray-500 text-center p-2">{t('You are free of temporary effects.')}</p>}
                    </div>
                </div>
                <div className="mt-6">
                    <SectionHeader title={t('Wounds')} icon={ShieldExclamationIcon} />
                    <div className="space-y-3 text-gray-300">
                        {(activeWounds.length > 0) ? (activeWounds.map((wound, index) => (
                            <div key={wound.woundId || index} className="relative group w-full bg-gray-900/60 rounded-md border border-red-800/50">
                                <button 
                                    onClick={() => onOpenDetailModal(t("Wound: {name}", { name: wound.woundName }), { type: 'wound', characterType: isPlayer ? 'player' : 'npc', characterId: isPlayer ? null : (character as NPC).NPCId, ...wound })}
                                    className="w-full text-left p-3 flex items-start gap-3"
                                >
                                    <ShieldExclamationIcon className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline">
                                             <span className="font-semibold text-red-400">{wound.woundName}</span>
                                             <span className="text-xs text-red-500 bg-red-900/50 px-2 py-0.5 rounded-full">{t(wound.severity as any)}</span>
                                        </div>
                                         <p className="text-sm text-gray-400 italic mt-1 line-clamp-2">{wound.descriptionOfEffects}</p>
                                    </div>
                                </button>
                                {isAdminEditable && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setConfirmForgetActive(wound); }}
                                        className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                        title={t('Forget Active Wound')}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))) : <p className="text-sm text-gray-500 text-center p-2">{t('You are unwounded.')}</p>}
                    </div>
                </div>
                {isAdminEditable && healedWounds.length > 0 && (
                    <div className="mt-4">
                        <div className="border-b border-cyan-500/20 mb-3">
                            <button onClick={() => setHealedWoundsCollapsed(prev => !prev)} className="w-full flex justify-between items-center text-left pb-1 group">
                                <h4 className="text-sm font-bold text-cyan-300/80 uppercase tracking-wider group-hover:text-cyan-200">{t('Healed Wounds')}</h4>
                                {healedWoundsCollapsed ? <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : <ChevronUpIcon className="w-5 h-5 text-gray-400" />}
                            </button>
                        </div>
                        {!healedWoundsCollapsed && (
                            <div className="space-y-3 animate-fade-in-down">
                                {healedWounds.map((wound, index) => (
                                    <div key={wound.woundId || index} className="relative group w-full bg-gray-900/60 p-3 rounded-md border border-green-800/50">
                                        <button onClick={() => onOpenDetailModal(t("Wound: {name}", { name: wound.woundName }), {type: 'wound', ...wound})} className="w-full text-left">
                                            <span className="font-semibold text-green-400/80 hover:text-green-300 transition-colors">{wound.woundName}</span>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setConfirmForget(wound); }} className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100" title={t('Forget Wound')}>
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <div className="!mt-4">
                                    <button onClick={() => setConfirmClear(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs bg-red-900/50 hover:bg-red-900/80 rounded-md text-red-300 font-semibold transition-colors">
                                        <TrashIcon className="w-4 h-4" /> {t('Clear All Healed Wounds')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div className="mt-6">
                    <SectionHeader title={t('States')} icon={ExclamationTriangleIcon} />
                    <div className="space-y-3 text-gray-300">
                        {(customStates ?? []).length > 0 ? (customStates ?? []).map((state) => (
                            <div key={state.stateId || state.stateName} className="relative group">
                                <StatBar
                                    value={state.currentValue}
                                    max={state.maxValue}
                                    min={state.minValue}
                                    color="bg-purple-500"
                                    label={t(state.stateName as any)}
                                    icon={ExclamationTriangleIcon}
                                    onClick={() => onOpenDetailModal(t("CustomState: {name}", { name: state.stateName }), { ...state, type: 'customState' })}
                                />
                                {isAdminEditable && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteState(state); }}
                                        className="absolute top-1 right-1 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                        title={t('Delete State')}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )) : <p className="text-sm text-gray-500 text-center p-2">{t('No custom states are active.')}</p>}
                    </div>
                </div>
            </div>

            <ConfirmationModal isOpen={confirmClear} onClose={() => setConfirmClear(false)} onConfirm={handleClearAllHealedWounds} title={t('Clear All Healed Wounds')}>
                <p>{t('Are you sure you want to clear all healed wounds? This will remove them permanently.')}</p>
            </ConfirmationModal>
            <ConfirmationModal isOpen={!!confirmForget} onClose={() => setConfirmForget(null)} onConfirm={handleForgetWound} title={t('Forget Wound')}>
                <p>{t('Are you sure you want to forget this healed wound?')}</p>
            </ConfirmationModal>
            <ConfirmationModal isOpen={!!confirmForgetActive} onClose={() => setConfirmForgetActive(null)} onConfirm={handleForgetActiveWound} title={t('Forget Active Wound')}>
                <p>{t('forget_active_wound_confirm')}</p>
            </ConfirmationModal>
            <ConfirmationModal isOpen={!!confirmDeleteState} onClose={() => setConfirmDeleteState(null)} onConfirm={handleDeleteCustomState} title={t('delete_state_title', { name: confirmDeleteState?.stateName ?? '' })}>
                <p>{t('delete_state_confirm', { name: confirmDeleteState?.stateName ?? '' })}</p>
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={!!confirmDeleteEffect}
                onClose={() => setConfirmDeleteEffect(null)}
                onConfirm={handleDeleteEffectConfirm}
                title={t('Delete Effect')}
            >
                <p>{t('Are you sure you want to permanently delete the effect "{name}"?', { name: confirmDeleteEffect?.description ?? '' })}</p>
            </ConfirmationModal>
        </>
    );
}

export default ConditionsView;
