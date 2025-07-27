
import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { DocumentMagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useLocalization } from '../context/LocalizationContext';

interface GameLogViewProps {
  gameLog: string[];
  onDeleteLogs: () => void;
}

export default function GameLogView({ gameLog, onDeleteLogs }: GameLogViewProps): React.ReactNode {
  const { t } = useLocalization();
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-cyan-400 narrative-text">{t("Game Master's Log")}</h3>
        <button
            onClick={onDeleteLogs}
            disabled={!gameLog || gameLog.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t("Clear log")}
        >
            <TrashIcon className="w-4 h-4" />
            {t("Clear Button")}
        </button>
      </div>
      <div className="flex-1 bg-gray-900/50 rounded-lg p-4 overflow-y-auto space-y-4">
        {gameLog && gameLog.length > 0 ? (
          (gameLog || []).map((entry, index) => (
            <div key={index} className="bg-gray-800/50 p-3 rounded-md shadow-inner">
              <MarkdownRenderer content={entry} className="prose-sm" />
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 p-6 flex flex-col items-center justify-center h-full">
            <DocumentMagnifyingGlassIcon className="w-12 h-12 text-gray-600 mb-4" />
            <p className="font-semibold">{t("The log is currently empty.")}</p>
            <p className="text-sm mt-1">{t("Perform an action to see the Game Master's calculations and decisions here.")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
