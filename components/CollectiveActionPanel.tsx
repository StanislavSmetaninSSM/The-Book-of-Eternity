
import React, { useState, useMemo } from 'react';
import { GameState } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { PaperAirplaneIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from './LoadingSpinner';

interface CollectiveActionPanelProps {
    gameState: GameState;
    onSubmitAction: (action: string) => void;
    onProcessActions: () => void;
    onCancelAction: () => void;
    isLoading: boolean;
}

const CollectiveActionPanel: React.FC<CollectiveActionPanelProps> = ({
    gameState,
    onSubmitAction,
    onProcessActions,
    onCancelAction,
    isLoading
}) => {
    const { t } = useLocalization();
    const [localAction, setLocalAction] = useState('');

    const collectiveState = gameState.collectiveActionState;
    if (!collectiveState?.isActive) return null;

    const myPlayerId = gameState.myPeerId || gameState.players[gameState.activePlayerIndex]?.playerId;
    const isInitiator = myPlayerId === collectiveState.initiatorId;
    const isParticipant = myPlayerId ? collectiveState.participantIds.includes(myPlayerId) : false;
    const hasSubmitted = myPlayerId ? !!collectiveState.actions[myPlayerId] : false;

    const allParticipantsReady = useMemo(() => {
        return collectiveState.participantIds.every(id => !!collectiveState.actions[id]);
    }, [collectiveState]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (localAction.trim() && !hasSubmitted) {
            onSubmitAction(localAction);
        }
    };

    const participantList = useMemo(() => {
        return collectiveState.participantIds.map(id => {
            const player = gameState.players.find(p => p.playerId === id);
            return {
                id,
                name: player?.name || `Player ${id.slice(-4)}`,
                isReady: !!collectiveState.actions[id],
                action: collectiveState.actions[id] || null
            };
        });
    }, [collectiveState, gameState.players]);

    // Initiator's View
    if (isInitiator) {
        return (
            <div className="mt-auto p-4 bg-gray-900/80 border-2 border-yellow-500/50 rounded-lg shadow-lg pointer-events-auto animate-fade-in-down backdrop-blur-sm">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">{t('Collective Action Requested')}</h3>
                <p className="text-gray-300 italic mb-4">"{collectiveState.prompt}"</p>
                <div className="bg-gray-800/50 p-3 rounded-md mb-4">
                    <h4 className="font-semibold text-gray-300 mb-2">{t('Participant Status')}</h4>
                    <ul className="space-y-2">
                        {participantList.map(p => (
                            <li key={p.id} className="bg-gray-900/30 p-2 rounded-md">
                                <div className="flex items-start justify-between text-sm">
                                    <span className={p.id === myPlayerId ? 'font-bold text-white' : 'text-gray-300'}>
                                        {p.name} {p.id === myPlayerId && `(${t('You, Initiator')})`}
                                    </span>
                                    {p.isReady ? (
                                        <span className="flex items-center gap-1.5 text-green-400 font-semibold flex-shrink-0 ml-2"><CheckCircleIcon className="w-5 h-5" />{t('Ready')}</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-yellow-400 flex-shrink-0 ml-2"><ClockIcon className="w-5 h-5" />{t('Waiting...')}</span>
                                    )}
                                </div>
                                {p.action && (
                                    <p className="text-xs text-gray-400 italic mt-1 pl-2 border-l-2 border-gray-600 ml-2">"{p.action}"</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {!hasSubmitted ? (
                    <form onSubmit={handleSubmit} className="mt-4">
                        <textarea
                            value={localAction}
                            onChange={(e) => setLocalAction(e.target.value)}
                            disabled={isLoading}
                            placeholder={t('Describe your action for this round...')}
                            className="w-full bg-slate-800 text-slate-300 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 transition min-h-[80px] resize-y"
                        />
                        <div className="mt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading || !localAction.trim()}
                                className="flex items-center justify-center gap-2 px-6 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                                {t('Submit Action')}
                            </button>
                        </div>
                    </form>
                ) : (
                     participantList.some(p => p.id === myPlayerId && p.action) &&
                     (
                        <div className="text-center p-4 my-2 bg-gray-800/50 rounded-md text-green-400 font-semibold flex items-center justify-center gap-2">
                            <CheckCircleIcon className="w-5 h-5" /> {t('Your action is submitted. Waiting for others.')}
                        </div>
                    )
                )}
                
                <div className="flex justify-end items-center gap-2 mt-4">
                    <button onClick={onCancelAction} disabled={isLoading} className="px-4 py-2 rounded-md bg-red-700 hover:bg-red-600 text-white font-semibold transition flex items-center gap-2">
                        <XCircleIcon className="w-5 h-5" />
                        {t('Cancel')}
                    </button>
                    <button onClick={onProcessActions} disabled={!allParticipantsReady || isLoading} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition flex items-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? <LoadingSpinner/> : <PaperAirplaneIcon className="w-5 h-5" />}
                        {t('Process Actions')}
                    </button>
                </div>
            </div>
        );
    }

    // Participant's View (who is not the initiator)
    if (isParticipant) {
        return (
             <div className="mt-auto p-4 bg-gray-900/80 border-2 border-cyan-500/50 rounded-lg shadow-lg pointer-events-auto animate-fade-in-down backdrop-blur-sm">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">{t('Action Requested by {name}', { name: collectiveState.initiatorName })}</h3>
                <p className="text-gray-300 italic mb-4">"{collectiveState.prompt}"</p>
                {hasSubmitted ? (
                    <div className="text-center p-6 bg-gray-800/50 rounded-md">
                        <p className="flex items-center justify-center gap-2 text-yellow-400"><LoadingSpinner /> {t('Action submitted. Waiting for initiator...')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={localAction}
                            onChange={(e) => setLocalAction(e.target.value)}
                            disabled={isLoading}
                            placeholder={t('Describe your action for this round...')}
                            className="w-full bg-slate-800 text-slate-300 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 transition min-h-[80px] resize-y"
                        />
                        <div className="mt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading || !localAction.trim()}
                                className="flex items-center justify-center gap-2 px-6 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                                {t('Submit Action')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    }

    // Observer's View
    return (
        <div className="mt-auto p-4 bg-gray-800/60 rounded-lg pointer-events-auto animate-fade-in-down">
            <p className="text-center text-gray-400 italic flex items-center justify-center gap-2">
                <LoadingSpinner />
                {t('{name} is requesting a collective action...', { name: collectiveState.initiatorName })}
            </p>
        </div>
    );
};

export default CollectiveActionPanel;
