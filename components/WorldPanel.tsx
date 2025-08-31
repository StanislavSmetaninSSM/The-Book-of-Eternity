
import React, { useState, useEffect, useMemo } from 'react';
import { WorldState, WorldStateFlag, WorldEvent, NPC, Faction, Location, GameSettings } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { 
    GlobeAltIcon, FlagIcon, TrashIcon, PencilSquareIcon, CheckIcon, XMarkIcon, 
    ClockIcon, ChevronDownIcon, ChevronUpIcon, ScaleIcon as PoliticalIcon, ShieldExclamationIcon as MilitaryIcon, 
    CurrencyDollarIcon as EconomicIcon, BuildingLibraryIcon as SocialIcon, BoltIcon as MysticalIcon, 
    FireIcon as DisasterIcon, UserIcon as PersonalIcon, EyeIcon as PublicIcon, EyeSlashIcon as SecretIcon, 
    UsersIcon as RegionalIcon, UserGroupIcon as FactionIcon, MapPinIcon, BookOpenIcon
} from '@heroicons/react/24/outline';
import MarkdownRenderer from './MarkdownRenderer';
import ConfirmationModal from './ConfirmationModal';
import Modal from './Modal';
import EditableField from './DetailRenderer/Shared/EditableField';
import LocationLog from './LocationLog';

interface WorldPanelProps {
    worldState: WorldState | null;
    worldStateFlags: WorldStateFlag[] | null;
    worldEventsLog: WorldEvent[] | null;
    turnNumber: number | null;
    allowHistoryManipulation: boolean;
    onDeleteFlag: (flagId: string) => void;
    onEditWorldState: (day: number, time: string) => void;
    onEditWeather: (newWeather: string) => void;
    onEditFlagData: (flagId: string, field: keyof WorldStateFlag, value: any) => void;
    biome: string | null | undefined;
    allNpcs: NPC[];
    allFactions: Faction[];
    allLocations: Location[];
    onOpenDetailModal: (title: string, data: any) => void;
    onDeleteEvent: (eventId: string) => void;
    deleteWorldEventsByTurnRange: (startTurn: number, endTurn: number) => void;
    onShowMessageModal: (title: string, content: string) => void;
    gameSettings: GameSettings | null;
}

const FlagEditor: React.FC<{
    flag: WorldStateFlag;
    onSave: (value: any) => void;
    onCancel: () => void;
}> = ({ flag, onSave, onCancel }) => {
    const [value, setValue] = useState(flag.value);
    const inputType = typeof flag.value;

    const handleSave = () => {
        if (inputType === 'number' && typeof value === 'string') {
            onSave(parseInt(value, 10));
        } else {
            onSave(value);
        }
    };

    const renderInput = () => {
        if (inputType === 'boolean') {
            return (
                <input
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => setValue(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
            );
        }
        if (inputType === 'number') {
            return (
                <input
                    type="number"
                    value={String(value)}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-1 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition text-sm"
                />
            );
        }
        return (
            <input
                type="text"
                value={String(value)}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-1 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition text-sm"
            />
        );
    };

    return (
        <div className="flex items-center gap-2 mt-2 p-2 bg-gray-900/50 rounded-md">
            <div className="flex-1">{renderInput()}</div>
            <button onClick={handleSave} className="p-1 text-green-400 hover:text-white rounded-full hover:bg-green-700"><CheckIcon className="w-4 h-4" /></button>
            <button onClick={onCancel} className="p-1 text-red-400 hover:text-white rounded-full hover:bg-red-700"><XMarkIcon className="w-4 h-4" /></button>
        </div>
    );
};

const WorldEventCard: React.FC<{
    event: WorldEvent;
    onOpenModal: (event: WorldEvent) => void;
    onDelete: (event: WorldEvent) => void;
    allowHistoryManipulation: boolean;
    onOpenDetailModal: (title: string, data: any) => void;
    allNpcs: NPC[];
    allFactions: Faction[];
    allLocations: Location[];
}> = ({ event, onOpenModal, onDelete, allowHistoryManipulation, onOpenDetailModal, allNpcs, allFactions, allLocations }) => {
    const { t } = useLocalization();
    const eventTypeMapping = useMemo(() => ({
        'Political': { icon: PoliticalIcon, colorClass: 'event-type-Political', label: t('Political') },
        'Military': { icon: MilitaryIcon, colorClass: 'event-type-Military', label: t('Military') },
        'Economic': { icon: EconomicIcon, colorClass: 'event-type-Economic', label: t('Economic') },
        'Social': { icon: SocialIcon, colorClass: 'event-type-Social', label: t('Social') },
        'Mystical': { icon: MysticalIcon, colorClass: 'event-type-Mystical', label: t('Mystical') },
        'Disaster': { icon: DisasterIcon, colorClass: 'event-type-Disaster', label: t('Disaster') },
        'Personal': { icon: PersonalIcon, colorClass: 'event-type-Personal', label: t('Personal') },
    }), [t]);

    const typeInfo = eventTypeMapping[event.eventType as keyof typeof eventTypeMapping];

    return (
        <div className={`timeline-event-card ${typeInfo.colorClass} group relative`}>
            {allowHistoryManipulation && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(event); }}
                    className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 z-10"
                    title={t('Delete Event')}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            )}
            <button onClick={() => onOpenModal(event)} className="w-full text-left p-3 space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start gap-3">
                        <typeInfo.icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${typeInfo.colorClass.replace('event-type-', 'text-').replace(/-\d+$/, '-400')}`} />
                        <div className="flex-1">
                            <p className="font-bold text-gray-100 pr-16">{event.headline}</p>
                            <div className="text-xs text-gray-400 mt-1">
                                {t('Day')} {event.worldTime.day} - {t('Turn')} {event.turnNumber}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pl-9 text-sm text-gray-300 italic line-clamp-2">
                    <MarkdownRenderer content={event.summary} />
                </div>
            </button>
        </div>
    );
};

const FULL_WEATHER_OPTIONS = [
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

const WorldPanel = ({ worldState, worldStateFlags, worldEventsLog, turnNumber, allowHistoryManipulation, onDeleteFlag, onEditWorldState, onEditWeather, onEditFlagData, biome, allNpcs, allFactions, allLocations, onOpenDetailModal, onDeleteEvent, deleteWorldEventsByTurnRange, onShowMessageModal, gameSettings }: WorldPanelProps) => {
    const { t } = useLocalization();
    const [flagToDelete, setFlagToDelete] = useState<WorldStateFlag | null>(null);
    const [isEditingTime, setIsEditingTime] = useState(false);
    const [editingFlagId, setEditingFlagId] = useState<string | null>(null);
    const [editingFlagDescriptionId, setEditingFlagDescriptionId] = useState<string | null>(null);
    const [editedDescription, setEditedDescription] = useState('');
    const [filters, setFilters] = useState<{ type: string[], visibility: string[] }>({ type: [], visibility: [] });
    const [turnFilter, setTurnFilter] = useState<string>('');
    
    const [viewingEvent, setViewingEvent] = useState<WorldEvent | null>(null);
    const [eventToDelete, setEventToDelete] = useState<WorldEvent | null>(null);
    const [isFlagsExpanded, setIsFlagsExpanded] = useState(false);
    const INITIAL_FLAGS_TO_SHOW = 2;
    const [isRangeDeleteConfirmOpen, setIsRangeDeleteConfirmOpen] = useState(false);
    const [deleteTurnRange, setDeleteTurnRange] = useState({ start: '', end: '' });

    const eventTypeMapping = useMemo(() => ({
        'Political': { icon: PoliticalIcon, colorClass: 'event-type-Political', label: t('Political') },
        'Military': { icon: MilitaryIcon, colorClass: 'event-type-Military', label: t('Military') },
        'Economic': { icon: EconomicIcon, colorClass: 'event-type-Economic', label: t('Economic') },
        'Social': { icon: SocialIcon, colorClass: 'event-type-Social', label: t('Social') },
        'Mystical': { icon: MysticalIcon, colorClass: 'event-type-Mystical', label: t('Mystical') },
        'Disaster': { icon: DisasterIcon, colorClass: 'event-type-Disaster', label: t('Disaster') },
        'Personal': { icon: PersonalIcon, colorClass: 'event-type-Personal', label: t('Personal') },
    }), [t]);

    const visibilityMapping = useMemo(() => ({
        'Public': { icon: PublicIcon, colorClass: 'visibility-Public', label: t('Public') },
        'Regional': { icon: RegionalIcon, colorClass: 'visibility-Regional', label: t('Regional') },
        'Faction-Internal': { icon: FactionIcon, colorClass: 'visibility-Faction-Internal', label: t('Faction-Internal') },
        'Secret': { icon: SecretIcon, colorClass: 'visibility-Secret', label: t('Secret') },
    }), [t]);

    const formatTime = (totalMinutes: number) => {
        const hours = Math.floor(totalMinutes / 60) % 24;
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };
    
    const [day, setDay] = useState(worldState?.day || 1);
    const [time, setTime] = useState(formatTime(worldState?.currentTimeInMinutes || 480));

    useEffect(() => {
        if (!isEditingTime) {
            setDay(worldState?.day || 1);
            setTime(formatTime(worldState?.currentTimeInMinutes || 480));
        }
    }, [worldState, isEditingTime]);

    const handleTimeSave = () => {
        onEditWorldState(day, time);
        setIsEditingTime(false);
    };
    
    const displayableFlags = useMemo(() => 
        (worldStateFlags || []).filter(flag => flag && (flag.displayName)).slice().reverse(),
    [worldStateFlags]);

    const systemFlags = useMemo(() => 
        (worldStateFlags || []).filter(flag => flag && !(flag.displayName)),
    [worldStateFlags]);
    
    const sortedEvents = useMemo(() => {
        if (!worldEventsLog) return [];
        return [...worldEventsLog].sort((a, b) => {
            if (b.turnNumber !== a.turnNumber) return b.turnNumber - a.turnNumber;
            return (b.worldTime.minutesIntoDay || 0) - (a.worldTime.minutesIntoDay || 0);
        });
    }, [worldEventsLog]);

    const eventsByTurn = useMemo(() => {
        return sortedEvents.reduce((acc, event) => {
            const turn = event.turnNumber;
            if (!acc[turn]) {
                acc[turn] = [];
            }
            acc[turn].push(event);
            return acc;
        }, {} as Record<number, WorldEvent[]>);
    }, [sortedEvents]);

    const filteredEventsByTurn = useMemo(() => {
        if (filters.type.length === 0 && filters.visibility.length === 0 && turnFilter.trim() === '') {
            return eventsByTurn;
        }
        const filtered: Record<number, WorldEvent[]> = {};
        for (const turn in eventsByTurn) {
            if (turnFilter.trim() !== '') {
                const turnNum = parseInt(turnFilter.trim(), 10);
                if (isNaN(turnNum) || Number(turn) !== turnNum) {
                    continue;
                }
            }

            const turnEvents = eventsByTurn[turn].filter(event => {
                const typeMatch = filters.type.length === 0 || filters.type.includes(event.eventType);
                const visibilityMatch = filters.visibility.length === 0 || filters.visibility.includes(event.visibility);
                return typeMatch && visibilityMatch;
            });
            if (turnEvents.length > 0) {
                filtered[turn] = turnEvents;
            }
        }
        return filtered;
    }, [eventsByTurn, filters, turnFilter]);

    const handleDeleteFlagConfirm = () => {
        if (flagToDelete) {
            onDeleteFlag(flagToDelete.flagId);
        }
        setFlagToDelete(null);
    };

    const handleDeleteEventConfirm = () => {
        if (eventToDelete && eventToDelete.eventId) {
            onDeleteEvent(eventToDelete.eventId);
        }
        setEventToDelete(null);
    };

    const toggleFilter = (category: 'type' | 'visibility', value: string) => {
        setFilters(prev => {
            const current = prev[category];
            const newFilter = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: newFilter };
        });
    };

    const flagsToShow = isFlagsExpanded ? displayableFlags : displayableFlags.slice(0, INITIAL_FLAGS_TO_SHOW);

    const handleFlagClick = (flag: WorldStateFlag) => {
        if (!flag) return;
        const title = `${t('Global Flag')}: ${flag.displayName}`;
        const content = `
### ${flag.displayName}

**${t('Description')}:**
> ${flag.description.replace(/\n/g, '\n> ')}

---

**${t('Current Value')}:** \`${JSON.stringify(flag.value)}\`

**${t('System ID')}:** \`${flag.flagId}\`
        `;
        onShowMessageModal(title, content);
    };

    const handleRangeDeleteClick = () => {
        const start = parseInt(deleteTurnRange.start, 10);
        const end = parseInt(deleteTurnRange.end, 10);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
            setIsRangeDeleteConfirmOpen(true);
        } else {
            alert(t('invalid_turn_range'));
        }
    };
    
    const handleRangeDeleteConfirm = () => {
        const start = parseInt(deleteTurnRange.start, 10);
        const end = parseInt(deleteTurnRange.end, 10);
        deleteWorldEventsByTurnRange(start, end);
        setIsRangeDeleteConfirmOpen(false);
        setDeleteTurnRange({ start: '', end: '' });
    };

    const WorldStateDisplay = () => {
        return (
            <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text flex items-center gap-2">
                    <GlobeAltIcon className="w-6 h-6" />
                    {t('World State')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="bg-gray-900/40 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">{t('Turn')}</p>
                        <p className="text-2xl font-bold font-mono">{turnNumber}</p>
                    </div>
                    <div className="bg-gray-900/40 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">{t('Day')}</p>
                        {isEditingTime ? (
                            <input type="number" value={day} onChange={e => setDay(Number(e.target.value))} className="w-full text-center bg-gray-700/50 rounded-md p-0 border-gray-600 text-2xl font-bold font-mono" />
                        ) : (
                            <p className="text-2xl font-bold font-mono">{worldState?.day}</p>
                        )}
                    </div>
                    <div className="bg-gray-900/40 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">{t('Time')}</p>
                        {isEditingTime ? (
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full text-center bg-gray-700/50 rounded-md p-0 border-gray-600 text-2xl font-bold font-mono" />
                        ) : (
                            <p className="text-2xl font-bold font-mono">{time}</p>
                        )}
                    </div>
                    <div className="bg-gray-900/40 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">{t('Weather')}</p>
                        {allowHistoryManipulation ? (
                            <select value={worldState?.weather} onChange={e => onEditWeather(e.target.value)} className="dark-select w-full text-center text-lg font-semibold capitalize">
                                {FULL_WEATHER_OPTIONS.map(w => <option key={w} value={w}>{t(w as any)}</option>)}
                            </select>
                        ) : (
                            <p className="text-lg font-semibold capitalize">{t((worldState?.weather || 'N/A') as any)}</p>
                        )}
                    </div>
                </div>
                {allowHistoryManipulation && (
                    <div className="flex justify-end gap-2 mt-2">
                        {isEditingTime ? (
                            <>
                                <button onClick={() => setIsEditingTime(false)} className="px-3 py-1 text-xs rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition flex items-center gap-1"><XMarkIcon className="w-4 h-4"/>{t('Cancel')}</button>
                                <button onClick={handleTimeSave} className="px-3 py-1 text-xs rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition flex items-center gap-1"><CheckIcon className="w-4 h-4"/>{t('Save')}</button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditingTime(true)} className="px-3 py-1 text-xs rounded-md bg-gray-700 hover:bg-gray-600 text-white font-semibold transition flex items-center gap-1"><PencilSquareIcon className="w-4 h-4"/>{t('Edit Time')}</button>
                        )}
                    </div>
                )}
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
                        {t('Global Flags')}
                    </h3>
                    {displayableFlags && displayableFlags.length > 0 ? (
                        <div className="space-y-2">
                            {flagsToShow.map(flag => (
                                <div
                                    key={flag.flagId}
                                    className="bg-gray-900/40 p-3 rounded-lg group cursor-pointer hover:bg-gray-800/70 transition-colors"
                                    onClick={() => handleFlagClick(flag)}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-200">{flag.displayName}</p>
                                            <div className="text-sm text-gray-400 mt-1 italic">
                                                <MarkdownRenderer content={flag.description} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="font-mono text-cyan-300 text-sm">{String(flag.value)}</span>
                                            {allowHistoryManipulation && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditingFlagId(editingFlagId === flag.flagId ? null : flag.flagId); setEditingFlagDescriptionId(null); }}
                                                        className="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white"
                                                        title={t('Edit Value')}
                                                    >
                                                        <PencilSquareIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            if (editingFlagDescriptionId === flag.flagId) {
                                                                setEditingFlagDescriptionId(null);
                                                            } else {
                                                                setEditingFlagId(null);
                                                                setEditedDescription(flag.description);
                                                                setEditingFlagDescriptionId(flag.flagId);
                                                            }
                                                        }}
                                                        className="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white"
                                                        title={t('Edit Description')}
                                                    >
                                                        <BookOpenIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setFlagToDelete(flag); }}
                                                        className="p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300"
                                                        title={t('Delete Flag')}
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {editingFlagId === flag.flagId && (
                                        <div onClick={e => e.stopPropagation()}>
                                            <FlagEditor
                                                flag={flag}
                                                onSave={(newValue) => {
                                                    onEditFlagData(flag.flagId, 'value', newValue);
                                                    setEditingFlagId(null);
                                                }}
                                                onCancel={() => setEditingFlagId(null)}
                                            />
                                        </div>
                                    )}
                                     {editingFlagDescriptionId === flag.flagId && (
                                        <div onClick={e => e.stopPropagation()} className="mt-2 p-2 bg-gray-900/50 rounded-md">
                                            <textarea
                                                value={editedDescription}
                                                onChange={(e) => setEditedDescription(e.target.value)}
                                                className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition text-sm"
                                                rows={3}
                                            />
                                            <div className="flex justify-end gap-2 mt-1">
                                                <button onClick={() => setEditingFlagDescriptionId(null)} className="px-2 py-1 text-xs rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition">{t('Cancel')}</button>
                                                <button onClick={() => { onEditFlagData(flag.flagId, 'description', editedDescription); setEditingFlagDescriptionId(null); }} className="px-2 py-1 text-xs rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition">{t('Save')}</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {displayableFlags.length > INITIAL_FLAGS_TO_SHOW && (
                                <button
                                    onClick={() => setIsFlagsExpanded(!isFlagsExpanded)}
                                    className="w-full text-center text-xs text-cyan-400 hover:underline py-1"
                                >
                                    {isFlagsExpanded ? t('Show Less') : t('Show More...')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center p-4 bg-gray-900/20 rounded-lg">{t("The state of the world is calm and unchanged.")}</p>
                    )}
                    {allowHistoryManipulation && systemFlags.length > 0 && (
                        <p className="text-xs text-gray-500 text-center mt-2" title={systemFlags.map(f => `${f.flagId}: ${f.value}`).join(', ')}>
                            {t('system_flags_hidden')}
                        </p>
                    )}
                </div>
                
                <div>
                    <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text flex items-center gap-2">
                        <ClockIcon className="w-6 h-6" />
                        {t('World Events Log')}
                    </h3>
                    
                    {/* Filters */}
                    <div className="bg-gray-900/40 p-3 rounded-lg mb-4 space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                             <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('Filter by Type')}</h4>
                                <div className="flex flex-wrap gap-1">
                                    {Object.keys(eventTypeMapping).map(key => (
                                        <button
                                            key={key}
                                            onClick={() => toggleFilter('type', key)}
                                            className={`px-2 py-1 text-xs rounded-full border transition-colors ${filters.type.includes(key) ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'}`}
                                        >
                                            {eventTypeMapping[key as keyof typeof eventTypeMapping].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('Filter by Visibility')}</h4>
                                <div className="flex flex-wrap gap-1">
                                    {Object.keys(visibilityMapping).map(key => (
                                        <button
                                            key={key}
                                            onClick={() => toggleFilter('visibility', key)}
                                            className={`px-2 py-1 text-xs rounded-full border transition-colors ${filters.visibility.includes(key) ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'}`}
                                        >
                                            {visibilityMapping[key as keyof typeof visibilityMapping].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <div className="col-span-2 sm:col-span-2">
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('Filter by Turn')}</h4>
                                <input
                                    type="text"
                                    value={turnFilter}
                                    onChange={(e) => setTurnFilter(e.target.value)}
                                    placeholder={t('Enter turn number...')}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition text-sm"
                                />
                             </div>
                        </div>
                        {allowHistoryManipulation && (
                             <div className="pt-3 border-t border-gray-700/50">
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">{t("Admin Actions")}</h4>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm text-gray-300">{t("From turn")}</span>
                                    <input
                                        type="number"
                                        value={deleteTurnRange.start}
                                        onChange={(e) => setDeleteTurnRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-20 bg-gray-700/50 border border-gray-600 rounded-md py-1 px-2 text-sm text-center text-white"
                                    />
                                    <span className="text-sm text-gray-300">{t("To turn")}</span>
                                     <input
                                        type="number"
                                        value={deleteTurnRange.end}
                                        onChange={(e) => setDeleteTurnRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-20 bg-gray-700/50 border border-gray-600 rounded-md py-1 px-2 text-sm text-center text-white"
                                    />
                                    <button
                                        onClick={handleRangeDeleteClick}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        {t("Delete Range")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {Object.keys(filteredEventsByTurn).length > 0 ? (
                        <div className="timeline-container">
                             {Object.keys(filteredEventsByTurn).sort((a,b) => Number(b) - Number(a)).map(turn => (
                                <div key={turn} className="timeline-turn-group">
                                    <div className="timeline-turn-header">
                                        <span className="timeline-turn-number">{t('Turn')} {turn}</span>
                                    </div>
                                    <div className="timeline-events-for-turn">
                                        {filteredEventsByTurn[Number(turn)].map(event => (
                                            <WorldEventCard 
                                                key={event.eventId} 
                                                event={event} 
                                                onOpenModal={setViewingEvent}
                                                onDelete={setEventToDelete}
                                                allowHistoryManipulation={allowHistoryManipulation}
                                                onOpenDetailModal={onOpenDetailModal}
                                                allNpcs={allNpcs}
                                                allFactions={allFactions}
                                                allLocations={allLocations}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center p-4 bg-gray-900/20 rounded-lg">{t("No major world events have been recorded yet.")}</p>
                    )}
                </div>
            </div>
            
            <ConfirmationModal
                isOpen={!!flagToDelete}
                onClose={() => setFlagToDelete(null)}
                onConfirm={handleDeleteFlagConfirm}
                title={t('delete_flag_title', { name: flagToDelete?.displayName || flagToDelete?.flagId || ''})}
            >
                <p>{t('delete_flag_confirm', { name: flagToDelete?.displayName || flagToDelete?.flagId || ''})}</p>
            </ConfirmationModal>

            <ConfirmationModal
                isOpen={!!eventToDelete}
                onClose={() => setEventToDelete(null)}
                onConfirm={handleDeleteEventConfirm}
                title={t('Delete Event')}
            >
                <p>{t('Are you sure you want to permanently delete the event: "{headline}"?', { headline: eventToDelete?.headline })}</p>
            </ConfirmationModal>

            <ConfirmationModal
                isOpen={isRangeDeleteConfirmOpen}
                onClose={() => setIsRangeDeleteConfirmOpen(false)}
                onConfirm={handleRangeDeleteConfirm}
                title={t('Delete Event Range')}
            >
                <p>{t('delete_event_range_confirm', { start: deleteTurnRange.start, end: deleteTurnRange.end })}</p>
            </ConfirmationModal>

            {viewingEvent && (
                <Modal
                    isOpen={!!viewingEvent}
                    onClose={() => setViewingEvent(null)}
                    title={viewingEvent.headline}
                >
                    <div className="space-y-4">
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-gray-300"><MarkdownRenderer content={viewingEvent.summary} /></p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                {React.createElement(eventTypeMapping[viewingEvent.eventType as keyof typeof eventTypeMapping].icon, { className: 'w-5 h-5 text-cyan-400' })}
                                <span>{eventTypeMapping[viewingEvent.eventType as keyof typeof eventTypeMapping].label}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                {React.createElement(visibilityMapping[viewingEvent.visibility as keyof typeof visibilityMapping].icon, { className: 'w-5 h-5 text-cyan-400' })}
                                <span>{visibilityMapping[viewingEvent.visibility as keyof typeof visibilityMapping].label}</span>
                            </div>
                        </div>

                        {viewingEvent.involvedNPCs && viewingEvent.involvedNPCs.length > 0 && (
                            <div>
                                {/* FIX: Use PersonalIcon alias for UserIcon */}
                                <h4 className="font-semibold text-gray-400 text-base mb-2 flex items-center gap-2"><PersonalIcon className="w-5 h-5"/>{t('Involved NPCs')}</h4>
                                <div className="space-y-2">
                                    {viewingEvent.involvedNPCs.map(npcRef => {
                                        const npcData = allNpcs.find(n => n.NPCId === npcRef.NPCId);
                                        return (
                                        <button key={npcRef.NPCId} onClick={() => { if (npcData) { setViewingEvent(null); onOpenDetailModal(t("NPC: {name}", {name: npcData.name}), npcData); } }} disabled={!npcData} className="w-full text-left bg-gray-700/40 p-2 rounded-md hover:bg-gray-700 transition-colors disabled:cursor-not-allowed">
                                            <p className="font-semibold text-cyan-300">{npcRef.NPCName}</p>
                                            <p className="text-xs text-gray-400">{npcRef.roleInEvent}</p>
                                        </button>
                                    )})}
                                </div>
                            </div>
                        )}

                        {viewingEvent.affectedFactions && viewingEvent.affectedFactions.length > 0 && (
                            <div>
                                {/* FIX: Use FactionIcon alias for UserGroupIcon */}
                                <h4 className="font-semibold text-gray-400 text-base mb-2 flex items-center gap-2"><FactionIcon className="w-5 h-5"/>{t('Affected Factions')}</h4>
                                <div className="space-y-2">
                                    {viewingEvent.affectedFactions.map(facRef => {
                                        const factionData = allFactions.find(f => f.factionId === facRef.factionId);
                                        return (
                                        <button key={facRef.factionId} onClick={() => { if (factionData) { setViewingEvent(null); onOpenDetailModal(t("Faction: {name}", {name: factionData.name}), {...factionData, type: 'faction'}); } }} disabled={!factionData} className="w-full text-left bg-gray-700/40 p-2 rounded-md hover:bg-gray-700 transition-colors disabled:cursor-not-allowed">
                                            <p className="font-semibold text-cyan-300">{facRef.factionName}</p>
                                            <p className="text-xs text-gray-400 italic">{facRef.impactDescription}</p>
                                        </button>
                                    )})}
                                </div>
                            </div>
                        )}
                        
                        {viewingEvent.affectedLocations && viewingEvent.affectedLocations.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-400 text-base mb-2 flex items-center gap-2"><MapPinIcon className="w-5 h-5"/>{t('Affected Locations')}</h4>
                                 <div className="space-y-2">
                                    {viewingEvent.affectedLocations.map(locRef => {
                                        const locationData = allLocations.find(l => l.locationId === locRef.locationId);
                                        return (
                                        <button key={locRef.locationId} onClick={() => { if (locationData) { setViewingEvent(null); onOpenDetailModal(t("Location: {name}", {name: locationData.name}), {...locationData, type: 'location'}); } }} disabled={!locationData} className="w-full text-left bg-gray-700/40 p-2 rounded-md hover:bg-gray-700 transition-colors disabled:cursor-not-allowed">
                                            <p className="font-semibold text-cyan-300">{locRef.locationName}</p>
                                            <p className="text-xs text-gray-400 italic">{locRef.impactDescription}</p>
                                        </button>
                                    )})}
                                </div>
                            </div>
                        )}

                    </div>
                </Modal>
            )}
        </>
    );
};

// FIX: Added default export
export default WorldPanel;