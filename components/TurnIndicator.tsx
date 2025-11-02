import React from 'react';
import { GameSettings } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

interface TurnIndicatorProps {
  isMyTurn: boolean;
  activePlayerName: string | null;
  gameSettings: GameSettings | null;
}

const TurnIndicator: React.FC<TurnIndicatorProps> = ({ isMyTurn, activePlayerName, gameSettings }) => {
  const { t } = useLocalization();

  if (!gameSettings || gameSettings.cooperativeGameType === 'None') {
    return null;
  }

  const baseClasses = "w-full text-center p-2 rounded-lg mb-2 transition-all duration-300 animate-fade-in-down-fast flex items-center justify-center gap-2 font-semibold pointer-events-auto";
  
  if (isMyTurn) {
    return (
      <div className={`${baseClasses} bg-green-500/20 border border-green-500/30 text-green-300`}>
        <CheckCircleIcon className="w-5 h-5" />
        <span>{t('YOUR TURN')}</span>
      </div>
    );
  } else {
    return (
      <div className={`${baseClasses} bg-gray-700/50 border border-gray-600/80 text-gray-400`}>
        <ClockIcon className="w-5 h-5 animate-pulse" />
        <span>{t("Waiting for {name}'s turn...", { name: activePlayerName || '...' })}</span>
      </div>
    );
  }
};

export default TurnIndicator;
