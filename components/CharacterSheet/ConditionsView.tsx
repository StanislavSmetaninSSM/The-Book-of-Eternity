
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
    onDeleteNpcCustomState
}) => {
    const { t } = useLocalization();
    const [confirmClear, setConfirmClear] = useState(false);
    const [confirmForget, setConfirmForget] = useState<Wound | null>(null);
    const [confirmForgetActive, setConfirmForgetActive] = useState<Wound | null>(null);
    const [healedWoundsCollapsed, setHealedWoundsCollapsed] = useState(true);
    const [confirmDeleteState, setConfirmDeleteState] = useState<CustomState | null>(null);
    
    const effects = isPlayer ? (character as PlayerCharacter).activePlayerEffects : (character as NPC).activeEffects || [];
    const wounds = isPlayer ? (character as PlayerCharacter).playerWounds : (character as NPC).wounds || [];
    const customStates = isPlayer ? (character as PlayerCharacter).playerCustomStates : (character as NPC).customStates || [];
    const activeWounds = (wounds ?? []).filter(w => w.healingState.currentState !== 'Healed');
    const healedWounds = (wounds ?? []).filter(w => w.healingState.currentState === 'Healed');
    
    const handleClearAllHealedWounds = () => {
        // FIX: Add type assertion to character to access NPCId
        clearAllHealedWounds(isPlayer ? 'player' : 'npc', isPlayer ? null : (character as NPC).NPCId);
        setConfirmClear(false);
    };
    
    const handleForgetWound = () => {
        if (confirmForget && confirmForget.woundId) {
            // FIX: Add type assertion to character to access NPCId
            forgetHealedWound(isPlayer ? 'player' : 'npc', isPlayer ? null : (character as NPC).NPCId, confirmForget.woundId);
        }
        setConfirmForget(null);
    };
    
    const handleForgetActiveWound = () => {
        if (confirmForgetActive && confirmForgetActive.woundId) {
            // FIX: Add type assertion to character to access NPCId
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
            // FIX: Add type assertion to character to access NPCId
            onDeleteNpcCustomState((character as NPC).NPCId, stateIdentifier);
        }
        setConfirmDeleteState(null);
    };

    return (
        <>
            <div className="space-y-4">
                <div className="mt-6">
                    <SectionHeader title={t('Active Effects')} icon={SunIcon} />
                    <div className="space-y-3 text-gray-300">
                        {(effects ?? []).length > 0 ? (effects ?? []).map((effect, index) => {
                            if (effect.effectType === 'WoundReference' && effect.sourceWoundId) {
                                let linkedWound = wounds.find(w => w.woundId === effect.sourceWoundId);
                                if (!linkedWound && effect.sourceSkill) {
                                    linkedWound = wounds.find(w => w.woundName === effect.sourceSkill);
                                }
                                if (linkedWound) {
                                    const cleanWound = {
                                        type: 'wound',
                                        characterType: isPlayer ? 'player' : 'npc',
                                        // FIX: Cast character to NPC to safely access NPCId.
                                        characterId: isPlayer ? null : (character as NPC).NPCId,
                                        ...linkedWound
                                    };
                                    return (
                                        <button key={index} onClick={() => onOpenDetailModal(t("Wound: {name}", { name: linkedWound!.woundName }), cleanWound)} className="w-full text-left p-3 rounded-md text-sm flex items-start gap-3 hover:scale-105 transition-transform bg-purple-900/40 text-purple-300">
                                            <ShieldExclamationIcon className="w-5 h-5 mt-0.5 text-purple-400 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className="font-semibold">{t('Wound')}</span>
                                                    {effect.duration < 999 && <span className="text-xs">{t('turns_left_count', { duration: effect.duration })}</span>}
                                                </div>
                                                <p>{effect.description}</p>
                                            </div>
                                        </button>
                                    );
                                }
                            }
                            return (
                                <button key={index} onClick={() => onOpenDetailModal(t("Effect: {name}", { name: effect.sourceSkill || t('Effect') }), effect)} className={`w-full text-left p-3 rounded-md text-sm flex items-start gap-3 hover:scale-105 transition-transform ${effect.effectType.includes('Buff') ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                                    {effect.effectType.includes('Buff') ? <SunIcon className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" /> : <CloudIcon className="w-5 h-5 mt-0.5 text-red-400 flex-shrink-0" />}
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">{effect.sourceSkill || t('Effect')}</span>
                                            {effect.duration < 999 && <span className="text-xs">{t('turns_left_count', { duration: effect.duration })}</span>}
                                        </div>
                                        <p>{effect.description}</p>
                                    </div>
                                </button>
                            );
                        }) : <p className="text-sm text-gray-500 text-center p-2">{t('You are free of temporary effects.')}</p>}
                    </div>
                </div>
                <div className="mt-6">
                    <SectionHeader title={t('Wounds')} icon={ShieldExclamationIcon} />
                    <div className="space-y-3 text-gray-300">
                        {(activeWounds.length > 0) ? (activeWounds.map((wound, index) => (
                            <div key={wound.woundId || index} className="w-full bg-gray-900/60 rounded-md border border-red-800/50 flex items-center justify-between gap-3 group">
                                <button 
                                    onClick={() => onOpenDetailModal(t("Wound: {name}", { name: wound.woundName }), { type: 'wound', characterType: isPlayer ? 'player' : 'npc', characterId: isPlayer ? null : (character as NPC).NPCId, ...wound })}
                                    className="flex-1 text-left p-3 flex items-start gap-3"
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
                                        className="p-1 mr-2 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
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
                                    <div key={wound.woundId || index} className="w-full bg-gray-900/60 p-3 rounded-md border border-green-800/50 flex items-center justify-between gap-3">
                                        <button onClick={() => onOpenDetailModal(t("Wound: {name}", { name: wound.woundName }), {type: 'wound', ...wound})} className="flex-1 text-left">
                                            <span className="font-semibold text-green-400/80 hover:text-green-300 transition-colors">{wound.woundName}</span>
                                        </button>
                                        <button onClick={() => setConfirmForget(wound)} className="p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors flex-shrink-0" title={t('Forget Wound')}>
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
                            <div key={state.stateId || state.stateName} className="flex items-center gap-2 group">
                                <div className="flex-1">
                                    <StatBar value={state.currentValue} max={state.maxValue} min={state.minValue} color="bg-purple-500" label={t(state.stateName as any)} icon={ExclamationTriangleIcon} onClick={() => onOpenDetailModal(t("CustomState: {name}", { name: state.stateName }), { ...state, type: 'customState' })} />
                                </div>
                                {isAdminEditable && (
                                    <button onClick={() => setConfirmDeleteState(state)} className="p-1 text-gray-500 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100" title={t('Delete State')}>
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
        </>
    );
}

export default ConditionsView;
