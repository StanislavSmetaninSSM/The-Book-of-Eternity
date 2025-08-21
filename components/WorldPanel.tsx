

import React, { useState } from 'react';
import { WorldState, WorldStateFlag } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { GlobeAltIcon, FlagIcon, TrashIcon } from '@heroicons/react/24/outline';
import MarkdownRenderer from './MarkdownRenderer';
import ConfirmationModal from './ConfirmationModal';

const WorldStateDisplay = ({ worldState, turnNumber }: { worldState: WorldState | null, turnNumber: number | null }) => {
    const { t } = useLocalization();
    
    if (!worldState && (turnNumber === null || turnNumber === 0)) {
        return null;
    }

    const formatTime = (totalMinutes: number) => {
        const hours = Math.floor(totalMinutes / 60) % 24;
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    return (
        <div className="bg-gray-900/50 p-3 rounded-lg text-sm flex justify-around items-center border border-gray-700/60 mb-6">
            <div className="text-center">
                <p className="text-xs text-gray-400">{t('Turn')}</p>
                <p className="font-bold text-lg text-cyan-300">{turnNumber && turnNumber > 0 ? turnNumber : '—'}</p>
            </div>
            {worldState && (
                <>
                    <div className="text-center">
                        <p className="text-xs text-gray-400">{t('Day')}</p>
                        <p className="font-bold text-lg text-cyan-300">{worldState.day}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400">{t('Time')}</p>
                        <p className="font-bold text-lg text-cyan-300">{formatTime(worldState.currentTimeInMinutes)}</p>
                        <p className="text-xs text-gray-400">({t(worldState.timeOfDay)})</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400">{t('Weather')}</p>
                        <p className="font-bold text-lg text-cyan-300">{t(worldState.weather)}</p>
                    </div>
                </>
            )}
        </div>
    );
};

interface WorldPanelProps {
    worldState: WorldState | null;
    worldStateFlags: Record<string, WorldStateFlag> | null;
    turnNumber: number | null;
    allowHistoryManipulation: boolean;
    onDeleteFlag: (flagId: string) => void;
}

const WorldPanel = ({ worldState, worldStateFlags, turnNumber, allowHistoryManipulation, onDeleteFlag }: WorldPanelProps) => {
    const { t } = useLocalization();
    const [flagToDelete, setFlagToDelete] = useState<WorldStateFlag | null>(null);
    const activeFlags = worldStateFlags ? Object.values(worldStateFlags).filter(flag => flag.value !== false) : [];

    const handleDeleteConfirm = () => {
        if (flagToDelete) {
            onDeleteFlag(flagToDelete.flagId);
        }
        setFlagToDelete(null);
    };


    return (
        <>
            <div className="space-y-6">
                <WorldStateDisplay worldState={worldState} turnNumber={turnNumber} />
                <div>
                    <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text flex items-center gap-2">
                        <FlagIcon className="w-6 h-6" />
                        {t('World State')}
                    </h3>
                    {activeFlags.length > 0 ? (
                        <div className="space-y-3">
                            {activeFlags.map((flag) => (
                                <div key={flag.flagId} className="relative group bg-gray-900/40 p-3 rounded-lg border border-gray-700/50" title={flag.description}>
                                     {allowHistoryManipulation && (
                                        <button
                                            onClick={() => setFlagToDelete(flag)}
                                            className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 z-10"
                                            title={t('Delete Flag')}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                    <p className="font-semibold text-cyan-300">{flag.displayName}</p>
                                    <div className="text-sm text-gray-400 italic mt-1">
                                        <MarkdownRenderer content={flag.description} />
                                    </div>
                                    {typeof flag.value !== 'boolean' && (
                                        <p className="text-xs text-yellow-300 mt-2 font-mono">
                                            {t('Status')}: {String(flag.value)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 p-6 bg-gray-900/20 rounded-lg">
                            <GlobeAltIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                            <p>{t('The state of the world is calm and unchanged.')}</p>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmationModal
                isOpen={!!flagToDelete}
                onClose={() => setFlagToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title={t('delete_flag_title', { name: flagToDelete?.displayName ?? '' })}
            >
                <p>{t('delete_flag_confirm', { name: flagToDelete?.displayName ?? '' })}</p>
            </ConfirmationModal>
        </>
    );
};

export default WorldPanel;