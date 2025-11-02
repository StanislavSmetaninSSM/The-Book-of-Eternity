import React, { useState } from 'react';
import { PlayerCharacter } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { PaperAirplaneIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from './LoadingSpinner';

interface SimultaneousActionPanelProps {
  players: PlayerCharacter[];
  myPlayerId: string | null | undefined;
  roundActions: Record<string, string>;
  onSubmitAction: (action: string) => void;
  isLoading: boolean;
  onCancelAction?: () => void;
  isHost?: boolean;
}

const SimultaneousActionPanel: React.FC<SimultaneousActionPanelProps> = ({
  players,
  myPlayerId,
  roundActions,
  onSubmitAction,
  isLoading,
  onCancelAction,
  isHost
}) => {
  const { t } = useLocalization();
  const [localAction, setLocalAction] = useState('');
  const hasSubmitted = myPlayerId ? !!roundActions[myPlayerId] : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localAction.trim() && !hasSubmitted) {
      onSubmitAction(localAction);
    }
  };
  
  const allPlayersReady = players.length > 0 && players.every(p => roundActions[p.playerId]);
  const isWaiting = hasSubmitted && !allPlayersReady;

  return (
    <div className="mt-auto p-4 bg-gray-900/80 border-2 border-cyan-500/50 rounded-lg shadow-lg pointer-events-auto animate-fade-in-down backdrop-blur-sm">
      <h3 className="text-lg font-bold text-cyan-400 mb-3 text-center">{t('Combat Round: Enter Your Action')}</h3>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Player Status Panel */}
        <div className="w-full md:w-1/3 bg-gray-800/50 p-3 rounded-md">
          <h4 className="font-semibold text-gray-300 mb-2 border-b border-gray-600 pb-2">{t('Party Status')}</h4>
          <ul className="space-y-2">
            {players.map(player => {
              const isReady = !!roundActions[player.playerId];
              return (
                <li key={player.playerId} className="flex items-center justify-between text-sm">
                  <span className={player.playerId === myPlayerId ? 'font-bold text-white' : 'text-gray-300'}>{player.name}</span>
                  {isReady ? (
                    <span className="flex items-center gap-1.5 text-green-400 font-semibold">
                      <CheckCircleIcon className="w-5 h-5" />
                      {t('Ready')}
                    </span>
                  ) : (
                    <span className="text-yellow-400">{t('Waiting...')}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Action Input Panel */}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={localAction}
              onChange={(e) => setLocalAction(e.target.value)}
              disabled={hasSubmitted || isLoading}
              placeholder={t('Describe your action for this round...')}
              className="w-full bg-slate-800 text-slate-300 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 transition min-h-[80px] resize-y"
            />
             <div className="mt-2 flex justify-between items-center gap-4">
                {isHost && onCancelAction && (
                    <button
                        type="button"
                        onClick={onCancelAction}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-6 py-2 font-semibold text-white bg-red-700 rounded-md hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        <XCircleIcon className="w-5 h-5" />
                        {t('Cancel')}
                    </button>
                )}
                <div className="flex-1" /> {/* Spacer */}
                {isWaiting && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <LoadingSpinner />
                    <span>{t('Waiting for other players...')}</span>
                  </div>
                )}
                <button
                    type="submit"
                    disabled={hasSubmitted || isLoading || !localAction.trim()}
                    className="flex items-center justify-center gap-2 px-6 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    <PaperAirplaneIcon className="w-5 h-5" />
                    {hasSubmitted ? t('Action Submitted') : t('Submit Action')}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimultaneousActionPanel;