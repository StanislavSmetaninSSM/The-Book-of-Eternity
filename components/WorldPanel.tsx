
import React, { useState, useEffect, useMemo } from 'react';
import { WorldState, WorldStateFlag } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { GlobeAltIcon, FlagIcon, TrashIcon, PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import MarkdownRenderer from './MarkdownRenderer';
import ConfirmationModal from './ConfirmationModal';

interface WorldPanelProps {
    worldState: WorldState | null;
    worldStateFlags: Record<string, WorldStateFlag> | null;
    turnNumber: number | null;
    allowHistoryManipulation: boolean;
    onDeleteFlag: (flagId: string) => void;
    onEditWorldState: (day: number, time: string) => void;
    onEditWeather: (newWeather: string) => void;
    biome: string | null | undefined;
}

const FULL_WEATHER_OPTIONS: string[] = [
    'Blizzard', 
    'Clear', 
    'Cloudy', 
    'Downpour', 
    'Drizzle', 
    'Foggy', 
    'Frigid Air', 
    'Heavy Rain', 
    'Heavy Snow', 
    'Humid', 
    'Light Rain', 
    'Light Snow', 
    'Misty', 
    'Overcast', 
    'Rain', 
    'Sandstorm', 
    'Scorching Sun', 
    'Snow', 
    'Storm', 
    'Windy'
];

const WorldPanel = ({ worldState, worldStateFlags, turnNumber, allowHistoryManipulation, onDeleteFlag, onEditWorldState, onEditWeather, biome }: WorldPanelProps) => {
    const { t } = useLocalization();
    const [flagToDelete, setFlagToDelete] = useState<WorldStateFlag | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const formatTime = (totalMinutes: number) => {
        const hours = Math.floor(totalMinutes / 60) % 24;
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };
    
    const [day, setDay] = useState(worldState?.day || 1);
    const [time, setTime] = useState(formatTime(worldState?.currentTimeInMinutes || 480));

    useEffect(() => {
        if (!isEditing) {
            setDay(worldState?.day || 1);
            setTime(formatTime(worldState?.currentTimeInMinutes || 480));
        }
    }, [worldState, isEditing]);

    const handleSave = () => {
        onEditWorldState(day, time);
        setIsEditing(false);
    };
    
    const activeFlags = worldStateFlags ? Object.values(worldStateFlags).filter(flag => flag.value !== false) : [];

    const handleDeleteConfirm = () => {
        if (flagToDelete) {
            onDeleteFlag(flagToDelete.flagId);
        }
        setFlagToDelete(null);
    };

    const WorldStateDisplay = () => {
        if (!worldState && (turnNumber === null || turnNumber === 0)) {
            return null;
        }
        
        const renderStaticView = () => (
            <>
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
            </>
        );

        const renderEditingView = () => (
             <>
                <div className="text-center flex-shrink-0">
                    <p className="text-xs text-gray-400">{t('Turn')}</p>
                    <p className="font-bold text-lg text-cyan-300">{turnNumber && turnNumber > 0 ? turnNumber : '—'}</p>
                </div>
                <div className="text-center flex flex-col items-center">
                    <label className="text-xs text-gray-400" htmlFor="day-input">{t('Day')}</label>
                    <input
                        id="day-input"
                        type="number"
                        value={day}
                        onChange={(e) => setDay(parseInt(e.target.value, 10))}
                        className="font-bold text-lg text-cyan-300 bg-gray-700/50 w-20 text-center rounded p-1"
                    />
                </div>
                <div className="text-center flex flex-col items-center">
                    <label className="text-xs text-gray-400" htmlFor="time-input">{t('Time')}</label>
                    <input
                        id="time-input"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="font-bold text-lg text-cyan-300 bg-gray-700/50 w-28 text-center rounded p-1"
                    />
                </div>
                {worldState && (
                     <div className="text-center flex flex-col items-center">
                        <label className="text-xs text-gray-400" htmlFor="weather-select">{t('Weather')}</label>
                        <select
                            id="weather-select"
                            value={worldState.weather}
                            onChange={(e) => onEditWeather(e.target.value)}
                            className="font-bold text-lg text-cyan-300 bg-gray-700/50 w-full max-w-[120px] text-center rounded p-1 appearance-none"
                        >
                            {FULL_WEATHER_OPTIONS.map(w => <option key={w} value={w}>{t(w)}</option>)}
                        </select>
                    </div>
                )}
            </>
        );

        return (
            <div className="bg-gray-900/50 p-3 rounded-lg flex justify-around items-center border border-gray-700/60 mb-6 relative">
                {allowHistoryManipulation && (
                    !isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="absolute top-1 right-1 p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700">
                            <PencilSquareIcon className="w-4 h-4" />
                        </button>
                    ) : (
                        <div className="absolute top-1 right-1 flex gap-1">
                            <button onClick={handleSave} className="p-1 text-green-400 hover:text-white rounded-full hover:bg-green-700">
                                <CheckIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsEditing(false)} className="p-1 text-red-400 hover:text-white rounded-full hover:bg-red-700">
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )
                )}
                {isEditing ? renderEditingView() : renderStaticView()}
            </div>
        );
    };

    return (
        <>
            <div className="space-y-6">
                <WorldStateDisplay />
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
