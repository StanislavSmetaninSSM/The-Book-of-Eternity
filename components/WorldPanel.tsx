
import React from 'react';
import { WorldState } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { GlobeAltIcon, FlagIcon } from '@heroicons/react/24/outline';
import MarkdownRenderer from './MarkdownRenderer';

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
                <p className="font-bold text-lg text-cyan-300">{turnNumber > 0 ? turnNumber : '—'}</p>
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

const WorldPanel = ({ worldState, worldStateFlags, turnNumber }: { worldState: WorldState | null, worldStateFlags: Record<string, boolean | string> | null, turnNumber: number | null }) => {
    const { t } = useLocalization();
    const activeFlags = worldStateFlags ? Object.entries(worldStateFlags).filter(([_, value]) => value === true || typeof value === 'string') : [];

    return (
        <div className="space-y-6">
            <WorldStateDisplay worldState={worldState} turnNumber={turnNumber} />
            <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text flex items-center gap-2">
                    <FlagIcon className="w-6 h-6" />
                    {t('World State')}
                </h3>
                {activeFlags.length > 0 ? (
                    <div className="space-y-3">
                        {activeFlags.map(([key, value]) => (
                            <div key={key} className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/50">
                                <p className="font-semibold text-cyan-300">{t(key)}</p>
                                {typeof value === 'string' && <div className="text-sm text-gray-400 italic mt-1"><MarkdownRenderer content={t(value)} /></div>}
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
    );
};

export default WorldPanel;