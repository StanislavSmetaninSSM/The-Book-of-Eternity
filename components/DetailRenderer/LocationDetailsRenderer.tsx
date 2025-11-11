

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Location, LocationData, PlayerCharacter, AdjacencyMapEntry, Faction, LocationStorage, DifficultyProfile } from '../../types';
import { DetailRendererProps } from './types';
import { useLocalization } from '../../context/LocalizationContext';
import Section from './Shared/Section';
import EditableField from './Shared/EditableField';
import IdDisplay from './Shared/IdDisplay';
import ImageRenderer from '../ImageRenderer';
import MarkdownRenderer from '../MarkdownRenderer';
import {
    InformationCircleIcon, MapPinIcon, ExclamationTriangleIcon, GlobeAltIcon, SunIcon, BuildingOfficeIcon,
    HomeModernIcon, ClockIcon, LinkIcon, CogIcon, TrashIcon, BookOpenIcon, FireIcon, UserGroupIcon, ChevronDownIcon, ChevronUpIcon, PhotoIcon, ArchiveBoxIcon, ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { useSpeech } from '../../context/SpeechContext';
import { stripMarkdown } from '../../utils/textUtils';
import ConfirmationModal from '../ConfirmationModal';
import { 
    BookOpenIcon as BookOpenSolidIcon, 
    SpeakerWaveIcon, 
    StopCircleIcon, 
    MinusIcon, 
    PlusIcon
} from '@heroicons/react/24/solid';
import ThreatsView from './Shared/ThreatsView';

interface LocationDetailsProps extends Omit<DetailRendererProps, 'data'> {
  location: Location;
  onOpenForgetConfirm: () => void;
  playerCharacter: PlayerCharacter | null;
  onOpenStorage: (locationId: string, storage: LocationStorage) => void;
  initialView?: string;
}

const CHALLENGE_LEVELS = {
    TRIVIAL: { labelKey: 'Trivial', color: 'bg-blue-500', textColor: 'text-blue-400', percentage: 10 },
    EASY: { labelKey: 'Easy', color: 'bg-green-500', textColor: 'text-green-400', percentage: 30 },
    MODERATE: { labelKey: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-400', percentage: 50 },
    HARD: { labelKey: 'Hard', color: 'bg-orange-500', textColor: 'text-orange-400', percentage: 70 },
    VERY_HARD: { labelKey: 'Very Hard', color: 'bg-red-600', textColor: 'text-red-500', percentage: 90 },
    DEADLY: { labelKey: 'Deadly', color: 'bg-purple-600', textColor: 'text-purple-500', percentage: 100 },
};

const ChallengeAssessment: React.FC<{
    profile: DifficultyProfile;
    player: PlayerCharacter;
}> = ({ profile, player }) => {
    const { t } = useLocalization();

    const calculateChallenge = (difficulty: number, level: number) => {
        const difficultyScale = Math.max(0.2, Math.min(1.5, (level / 50)));
        const baseDifficulty = Math.round(difficulty * difficultyScale);

        const delta = difficulty - level;

        let levelInfo = CHALLENGE_LEVELS.DEADLY;
        if (delta <= -10) levelInfo = CHALLENGE_LEVELS.TRIVIAL;
        else if (delta <= 5) levelInfo = CHALLENGE_LEVELS.EASY;
        else if (delta <= 20) levelInfo = CHALLENGE_LEVELS.MODERATE;
        else if (delta <= 40) levelInfo = CHALLENGE_LEVELS.HARD;
        else if (delta <= 60) levelInfo = CHALLENGE_LEVELS.VERY_HARD;

        return {
            baseDifficulty,
            label: t(levelInfo.labelKey as any),
            color: levelInfo.color,
            textColor: levelInfo.textColor,
            percentage: levelInfo.percentage
        };
    };

    const facets = [
        { key: 'combat', labelKey: 'Combat', icon: FireIcon, tooltipKey: 'DifficultyCombatTooltip' },
        { key: 'environment', labelKey: 'Environment', icon: GlobeAltIcon, tooltipKey: 'DifficultyEnvironmentTooltip' },
        { key: 'social', labelKey: 'Social', icon: UserGroupIcon, tooltipKey: 'DifficultySocialTooltip' },
        { key: 'exploration', labelKey: 'Exploration', icon: MapPinIcon, tooltipKey: 'DifficultyExplorationTooltip' },
    ];

    return (
        <div className="space-y-4">
            {facets.map(facet => {
                const difficultyValue = profile[facet.key as keyof typeof profile];
                if (difficultyValue === undefined) return null;
                
                const { baseDifficulty, label, color, textColor, percentage } = calculateChallenge(difficultyValue, player.level);
                const Icon = facet.icon;

                return (
                    <div key={facet.key} className="bg-gray-700/30 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-300 flex items-center gap-2" title={t(facet.tooltipKey as any)}>
                                <Icon className="w-5 h-5 text-cyan-400" />
                                {t(facet.labelKey as any)} <span className="text-gray-500 text-xs">({difficultyValue})</span>
                            </span>
                            <span className="font-mono text-lg text-white" title={t('Effective Difficulty')}>{baseDifficulty}</span>
                        </div>
                        <div className="w-full bg-gray-900/50 rounded-full h-2.5 relative">
                            <div className={`h-2.5 rounded-full transition-all duration-500 ${color}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                        <p className={`text-right text-sm font-semibold mt-1 ${textColor}`}>{label}</p>
                    </div>
                );
            })}
        </div>
    );
};

const EventsView: React.FC<{
  location: Location;
  isEditable: boolean;
  onEditLocationData: (locationId: string, field: keyof Location, value: any) => void;
}> = ({ location, isEditable, onEditLocationData }) => {
    const { t } = useLocalization();
    const { speak, isSpeaking, currentlySpeakingText } = useSpeech();
    const [fontSizeIndex, setFontSizeIndex] = useState(2);
    const FONT_SIZES = [12, 14, 16, 18, 20, 24];
    const FONT_SIZE_CLASSES = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
    const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
    const [isDeleteOldestConfirmOpen, setIsDeleteOldestConfirmOpen] = useState(false);
    const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);
    const [deleteCount, setDeleteCount] = useState('10');
    const [newEntry, setNewEntry] = useState('');
    const [isAddEntryCollapsed, setIsAddEntryCollapsed] = useState(true);

    const getTurnNumber = (eventString: string): number => {
        if (typeof eventString !== 'string') return -1;
        const match = eventString.match(/^#\[(\d+)/);
        return match ? parseInt(match[1], 10) : -1;
    };

    const events = useMemo(() => {
        return location.eventDescriptions || [];
    }, [location.eventDescriptions]);
    
    const handleSaveEvents = (newEvents: string[]) => {
      if (location?.locationId && onEditLocationData) {
          onEditLocationData(location.locationId, 'eventDescriptions', newEvents);
      }
    };
    
    const onSaveEntry = (index: number, newContent: string) => {
        const originalEntry = events[index];
        const newEvents = (location.eventDescriptions || []).map(e => (e === originalEntry ? newContent : e));
        handleSaveEvents(newEvents);
    };

    const handleDeleteEntryConfirm = () => {
        if (entryToDelete !== null) {
            const originalEntry = events[entryToDelete];
            const newEvents = (location.eventDescriptions || []).filter(e => e !== originalEntry);
            handleSaveEvents(newEvents);
        }
        setEntryToDelete(null);
    };

    const onDeleteOldest = (count: number) => {
        const sortedByTurnAsc = [...(location.eventDescriptions || [])].sort((a, b) => getTurnNumber(a) - getTurnNumber(b));
        const toKeep = sortedByTurnAsc.slice(count);
        handleSaveEvents(toKeep);
    };

    const handleDeleteOldestConfirm = () => {
        const count = parseInt(deleteCount, 10);
        if (!isNaN(count) && count > 0) {
            onDeleteOldest(count);
        }
        setIsDeleteOldestConfirmOpen(false);
    };
    
    const handleClearAllConfirm = () => {
        handleSaveEvents([]);
        setIsClearAllConfirmOpen(false);
    };
    
    const handleAddEntry = () => {
        if (newEntry.trim()) {
            const currentEvents = location.eventDescriptions || [];
            const newEvents = [newEntry, ...currentEvents];
            handleSaveEvents(newEvents);
            setNewEntry('');
        }
    };

    if (events.length === 0 && !isEditable) {
        return <p className="text-sm text-gray-500 text-center p-4">{t('No events recorded for this location.')}</p>;
    }

    return (
        <>
            <div className={`space-y-4 ${FONT_SIZE_CLASSES[fontSizeIndex]}`}>
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setFontSizeIndex(p => Math.max(p - 1, 0))} disabled={fontSizeIndex === 0} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"><MinusIcon className="w-5 h-5" /></button>
                    <span className="text-sm text-gray-400 font-mono w-6 text-center">{FONT_SIZES[fontSizeIndex]}px</span>
                    <button onClick={() => setFontSizeIndex(p => Math.min(p + 1, FONT_SIZES.length - 1))} disabled={fontSizeIndex === FONT_SIZES.length - 1} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"><PlusIcon className="w-5 h-5" /></button>
                </div>
                
                 {isEditable && (
                    <div className="bg-gray-900/40 rounded-lg border border-cyan-700/50">
                        <button
                            onClick={() => setIsAddEntryCollapsed(prev => !prev)}
                            className="w-full p-3 text-left flex justify-between items-center group"
                            aria-expanded={!isAddEntryCollapsed}
                        >
                            <h4 className="text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">{t('Add New Entry')}</h4>
                            {isAddEntryCollapsed ? <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : <ChevronUpIcon className="w-5 h-5 text-gray-400" />}
                        </button>
                        {!isAddEntryCollapsed && (
                            <div className="p-3 border-t border-cyan-700/50 animate-fade-in-down-fast">
                                <textarea value={newEntry} onChange={(e) => setNewEntry(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition text-sm min-h-[80px]" placeholder={t('Write your new entry here...')} />
                                <button onClick={handleAddEntry} disabled={!newEntry.trim()} className="w-full mt-2 px-4 py-2 text-sm font-bold text-white rounded-md transition-colors bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed">{t('Add Entry')}</button>
                            </div>
                        )}
                    </div>
                )}
                
                {events.map((entry, index) => {
                    const strippedEntry = stripMarkdown(entry);
                    const isThisEntrySpeaking = isSpeaking && currentlySpeakingText === strippedEntry;
                    return (
                        <div key={index} className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/50 group">
                            <div className="flex items-start gap-2">
                                <div className="flex-1">
                                    <EditableField
                                        label={t('Entry #{count}', { count: events.length - index })}
                                        value={entry}
                                        onSave={(newContent) => onSaveEntry(index, newContent)}
                                        isEditable={isEditable}
                                        as="textarea"
                                        className="narrative-text leading-relaxed whitespace-pre-wrap"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => speak(strippedEntry)} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white opacity-40 group-hover:opacity-100 transition-opacity" title={isThisEntrySpeaking ? t("Stop speech") : t("Read aloud")}>
                                        {isThisEntrySpeaking ? <StopCircleIcon className="w-5 h-5 text-cyan-400 animate-pulse" /> : <SpeakerWaveIcon className="w-5 h-5" />}
                                    </button>
                                    {isEditable && (
                                        <button
                                            onClick={() => setEntryToDelete(index)}
                                            className="p-1 rounded-full text-gray-400 hover:bg-red-900/50 hover:text-red-300 opacity-40 group-hover:opacity-100 transition-opacity"
                                            title={t("Delete Entry")}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {isEditable && events.length > 0 && (
                <footer className="mt-6 pt-4 border-t border-gray-700/60 flex flex-col sm:flex-row justify-end items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={deleteCount}
                            onChange={(e) => setDeleteCount(e.target.value)}
                            min="1"
                            max={events.length}
                            className="w-20 bg-gray-700/50 border border-gray-600 rounded-md py-1 px-2 text-sm text-center text-white"
                            aria-label={t("Number of entries to delete")}
                        />
                        <button
                            onClick={() => setIsDeleteOldestConfirmOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-yellow-300 bg-yellow-500/10 rounded-md hover:bg-yellow-500/20 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                            {t("Delete Oldest")}
                        </button>
                    </div>
                    <button
                        onClick={() => setIsClearAllConfirmOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                        {t("Clear All Entries")}
                    </button>
                </footer>
            )}
             <ConfirmationModal isOpen={entryToDelete !== null} onClose={() => setEntryToDelete(null)} onConfirm={handleDeleteEntryConfirm} title={t("Delete Entry")}><p>{t("Are you sure you want to delete this event entry?")}</p></ConfirmationModal>
             <ConfirmationModal isOpen={isDeleteOldestConfirmOpen} onClose={() => setIsDeleteOldestConfirmOpen(false)} onConfirm={handleDeleteOldestConfirm} title={t("Delete Oldest Entries")}><p>{t("Are you sure you want to delete the {count} oldest event entries for {name}?", { count: deleteCount, name: location.name })}</p></ConfirmationModal>
             <ConfirmationModal isOpen={isClearAllConfirmOpen} onClose={() => setIsClearAllConfirmOpen(false)} onConfirm={handleClearAllConfirm} title={t("Clear All Entries")}><p>{t("Are you sure you want to delete all event entries for {name}? This cannot be undone.", { name: location.name })}</p></ConfirmationModal>
        </>
    );
};

const LocationHeader: React.FC<LocationDetailsProps> = (props) => {
    const { location, allowHistoryManipulation, onEditLocationData, onOpenImageModal, imageCache, onImageGenerated, gameSettings } = props;
    const { t } = useLocalization();
    const displayImagePrompt = location.custom_image_prompt || location.image_prompt || `A detailed fantasy art image of a ${location.name}.`;
    const originalImagePrompt = location.image_prompt || `A detailed fantasy art image of a ${location.name}.`;
    const isCustomImage = !!location.custom_image_prompt;

    const handleUpload = useCallback((base64: string) => {
        if (onEditLocationData && location.locationId) {
            onEditLocationData(location.locationId, 'custom_image_prompt', base64);
        }
    }, [onEditLocationData, location.locationId]);
    
    const handleClearCustom = useCallback(() => {
        if (onEditLocationData && location.locationId) {
            onEditLocationData(location.locationId, 'custom_image_prompt', null);
        }
    }, [onEditLocationData, location.locationId]);

    const handleOpenModal = useCallback(() => {
        if (!onOpenImageModal || !displayImagePrompt) return;

        let onClearCustomCallback: (() => void) | undefined;
        let onUploadCallback: ((base64: string) => void) | undefined;

        if (allowHistoryManipulation && onEditLocationData && location.locationId) {
            onClearCustomCallback = handleClearCustom;
            onUploadCallback = handleUpload;
        }
        
        onOpenImageModal(displayImagePrompt, originalImagePrompt || displayImagePrompt, onClearCustomCallback, onUploadCallback);
    }, [displayImagePrompt, originalImagePrompt, onOpenImageModal, allowHistoryManipulation, onEditLocationData, location.locationId, handleClearCustom, handleUpload]);
    
    return (
        <div className="p-4 bg-gray-800/30 rounded-lg mb-4">
            <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-900 group relative cursor-pointer mb-4" onClick={handleOpenModal}>
                <ImageRenderer 
                    prompt={displayImagePrompt}
                    originalTextPrompt={originalImagePrompt}
                    alt={location.name} 
                    className="w-full h-full object-cover"
                    imageCache={imageCache} 
                    onImageGenerated={onImageGenerated} 
                    width={1024} 
                    height={1024}
                    showRegenerateButton={allowHistoryManipulation}
                    onUploadCustom={allowHistoryManipulation ? handleUpload : undefined}
                    onClearCustom={isCustomImage ? handleClearCustom : undefined}
                    uploadButtonPosition="overlay"
                    model={gameSettings?.pollinationsImageModel}
                    gameSettings={gameSettings}
                />
            </div>
            <EditableField 
                label={t('Name')}
                value={location.name}
                isEditable={allowHistoryManipulation && !!location.locationId}
                onSave={(val) => { if (location.locationId) onEditLocationData(location.locationId, 'name', val) }}
                as="input"
                className="font-bold text-4xl narrative-text text-cyan-400"
            />
            <div className="mt-2 text-gray-300">
                <EditableField 
                    label={t('Description')}
                    value={location.description}
                    isEditable={allowHistoryManipulation && !!location.locationId}
                    onSave={(val) => { if (location.locationId) onEditLocationData(location.locationId, 'description', val) }}
                />
            </div>
        </div>
    )
}

const LocationDetailsRenderer: React.FC<LocationDetailsProps> = (props) => {
    const { location, onOpenForgetConfirm, currentLocationId, allowHistoryManipulation, onEditLocationData, playerCharacter, onRegenerateId, encounteredFactions, onOpenDetailModal, onOpenStorage, initialView, deleteLocationThreat } = props;
    const { t } = useLocalization();
    const [activeView, setActiveView] = useState(initialView || 'menu');
    const [expandedLink, setExpandedLink] = useState<string | null>(null);
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const isCurrentLocation = location.locationId === currentLocationId;
    const isRealLocation = location.locationId && !location.locationId.startsWith('undiscovered-');
    
    const events = useMemo(() => location.eventDescriptions || [], [location.eventDescriptions]);    

    const menuItems = useMemo(() => {
        const items = [
            { key: 'Information', icon: InformationCircleIcon, show: true },
            { key: 'Connections', icon: LinkIcon, show: location.adjacencyMap && location.adjacencyMap.length > 0 },
            { key: 'Faction Control', icon: UserGroupIcon, show: location.factionControl && location.factionControl.length > 0 },
            { key: 'Storages', icon: ArchiveBoxIcon, show: location.locationStorages && location.locationStorages.length > 0 },
            { key: 'Threats', icon: ExclamationTriangleIcon, show: location.activeThreats && location.activeThreats.length > 0 },
            { key: 'Challenge', icon: ExclamationTriangleIcon, show: (location.internalDifficultyProfile || location.externalDifficultyProfile) && playerCharacter },
            { key: 'Events', icon: ClockIcon, show: events.length > 0 || allowHistoryManipulation },
            { key: 'System', icon: CogIcon, show: allowHistoryManipulation && isRealLocation }
        ];
        return items.filter(item => item.show);
    }, [location, playerCharacter, events, allowHistoryManipulation, isRealLocation]);

    const renderViewContent = () => {
        switch(activeView) {
            case 'Information': return (
                <Section title={t("Information")} icon={InformationCircleIcon}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                        <div className="flex justify-between items-center py-1.5"><span className="text-sm font-medium text-gray-400 flex items-center gap-2"><MapPinIcon className="w-4 h-4" />{t("Coordinates")}</span><div className="text-right text-sm text-gray-200">{`(${location.coordinates?.x}, ${location.coordinates?.y})`}</div></div>
                        <div className="flex justify-between items-center py-1.5"><span className="text-sm font-medium text-gray-400 flex items-center gap-2">{location.locationType === 'outdoor' ? <SunIcon className="w-4 h-4" /> : <BuildingOfficeIcon className="w-4 h-4" />}{t("Location Type")}</span><div className="text-right text-sm text-gray-200">{t(location.locationType as any)}</div></div>
                        {location.biome && <div className="flex justify-between items-center py-1.5"><span className="text-sm font-medium text-gray-400 flex items-center gap-2"><GlobeAltIcon className="w-4 h-4" />{t("Biome")}</span><div className="text-right text-sm text-gray-200">{t(location.biome as any)}</div></div>}
                        {location.indoorType && <div className="flex justify-between items-center py-1.5"><span className="text-sm font-medium text-gray-400 flex items-center gap-2"><HomeModernIcon className="w-4 h-4" />{t("Indoor Type")}</span><div className="text-right text-sm text-gray-200">{t(location.indoorType as any)}</div></div>}
                    </div>
                </Section>
            );
            case 'Connections': return (
                <Section title={t("Connections")} icon={LinkIcon}>
                    <div className="space-y-2">
                        {location.adjacencyMap!.map((link: AdjacencyMapEntry, i) => {
                            const isExpanded = expandedLink === link.name;
                            return (
                            <div key={i} className="bg-gray-700/50 rounded-lg">
                                <button
                                    onClick={() => setExpandedLink(isExpanded ? null : link.name)}
                                    className="w-full text-left p-3 flex justify-between items-center"
                                >
                                    <div className="flex-1 pr-4">
                                        <p className="font-bold text-cyan-400">{link.name}</p>
                                        <p className="text-sm italic text-gray-400">{link.shortDescription}</p>
                                    </div>
                                    {isExpanded ? <ChevronUpIcon className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                                </button>
                                {isExpanded && (
                                    <div className="p-3 border-t border-gray-700/50 space-y-3">
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                                            <span><strong className="text-gray-500">{t("Type")}:</strong> {t(link.linkType as any)}</span>
                                            <span><strong className="text-gray-500">{t("State")}:</strong> {t(link.linkState as any)}</span>
                                            <span><strong className="text-gray-500">{t("Coordinates")}:</strong> ({link.targetCoordinates.x}, {link.targetCoordinates.y})</span>
                                        </div>
                                        {(link.estimatedInternalDifficultyProfile || link.estimatedExternalDifficultyProfile) && playerCharacter && (
                                            <div className="pt-2 border-t border-gray-700/50 mt-2">
                                                <h5 className="font-semibold mb-2 text-gray-300">{t("Estimated Difficulty")}</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {link.estimatedInternalDifficultyProfile && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2 text-cyan-300 text-center">{t("For Insiders / Allies")}</h4>
                                                            <ChallengeAssessment profile={link.estimatedInternalDifficultyProfile} player={playerCharacter} />
                                                        </div>
                                                    )}
                                                    {link.estimatedExternalDifficultyProfile && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2 text-red-400 text-center">{t("For Outsiders / Enemies")}</h4>
                                                            <ChallengeAssessment profile={link.estimatedExternalDifficultyProfile} player={playerCharacter} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )})}
                    </div>
                </Section>
            );
            case 'Faction Control': return (
                <Section title={t("Faction Control")} icon={UserGroupIcon}>
                    <div className="space-y-3">
                        {location.factionControl!.map((fc, i) => {
                            const faction = encounteredFactions?.find(f => f.factionId === fc.factionId || f.name === fc.factionName);
                            const controlPercentage = fc.controlLevel;
                            return (
                                <div key={fc.factionId || i} className="bg-gray-700/40 p-3 rounded-md">
                                    <div className="flex justify-between items-center">
                                        {faction ? (
                                            <button
                                                onClick={() => onOpenDetailModal(t("Faction: {name}", { name: faction.name }), { ...faction, type: 'faction' })}
                                                disabled={!faction}
                                                className="font-bold text-lg hover:underline disabled:cursor-not-allowed"
                                                style={{ color: faction.color || 'inherit' }}
                                            >
                                                {fc.factionName}
                                            </button>
                                        ) : (
                                            <span className="font-bold text-lg text-white">{fc.factionName}</span>
                                        )}
                                        <span className="text-xs bg-gray-600 px-2 py-1 rounded-full">{t(fc.controlType as any)}</span>
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                                            <span>{t("Control Level")}</span>
                                            <span className="font-mono">{controlPercentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-800/70 rounded-full h-2.5 overflow-hidden">
                                            <div className="h-2.5 rounded-full" style={{ width: `${controlPercentage}%`, backgroundColor: faction?.color || '#667eea' }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Section>
            );
             case 'Storages': return (
                <Section title={t('Storages')} icon={ArchiveBoxIcon}>
                    <div className="space-y-2">
                        {location.locationStorages!.map(storage => (
                            <button
                                key={storage.storageId}
                                onClick={() => onOpenStorage(location.locationId!, storage)}
                                disabled={!storage.hasFullAccess}
                                className="w-full text-left p-3 rounded-md bg-gray-700/50 hover:bg-gray-700/80 transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="font-semibold text-cyan-300">{storage.name}</span>
                                {!storage.hasFullAccess && <span className="text-xs text-yellow-400">{t('access_denied')}</span>}
                            </button>
                        ))}
                    </div>
                </Section>
            );
            case 'Threats': return (
                <ThreatsView
                    threats={location.activeThreats || []}
                    locationId={location.locationId!}
                    allowHistoryManipulation={allowHistoryManipulation}
                    onDeleteThreat={deleteLocationThreat!}
                />
            );
            case 'Challenge': return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {location.internalDifficultyProfile && (
                        <div>
                            <h4 className="font-semibold mb-2 text-cyan-300 text-center">{t("For Insiders / Allies")}</h4>
                            <ChallengeAssessment profile={location.internalDifficultyProfile} player={playerCharacter!} />
                        </div>
                    )}
                     {location.externalDifficultyProfile && (
                        <div>
                            <h4 className="font-semibold mb-2 text-red-400 text-center">{t("For Outsiders / Enemies")}</h4>
                             <ChallengeAssessment profile={location.externalDifficultyProfile} player={playerCharacter!} />
                        </div>
                    )}
                </div>
            );
            case 'Events': return (
                <EventsView location={location} isEditable={allowHistoryManipulation} onEditLocationData={onEditLocationData} />
            );
            case 'System': return (
                 <div className="space-y-4">
                    <Section title={t("System Information")} icon={CogIcon}>
                        <IdDisplay
                            id={location.locationId}
                            name={location.name}
                            onRegenerate={() => onRegenerateId!(location, 'Location')}
                        />
                         <EditableField 
                            label={t("Image Prompt")}
                            value={location.image_prompt || ''}
                            isEditable={true}
                            onSave={(val) => { if (location.locationId) onEditLocationData(location.locationId, 'image_prompt', val) }}
                            as="textarea"
                        />
                    </Section>
                    <Section title={t("Actions")} icon={CogIcon}>
                        <button
                            onClick={onOpenForgetConfirm}
                            disabled={isCurrentLocation}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-300 bg-red-600/20 rounded-md hover:bg-red-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isCurrentLocation ? t("You cannot forget your current location.") : t("Forget Location")}
                        >
                            <TrashIcon className="w-5 h-5" />
                            {t("Forget Location")}
                        </button>
                    </Section>
                </div>
            );
            default: return null;
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${!isHeaderCollapsed ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <LocationHeader {...props} />
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {activeView === 'menu' ? (
                     <div className="p-4 md:p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-cyan-400 narrative-text flex items-center gap-2">
                               <MapPinIcon className="w-6 h-6" /> {t('Location Menu')}
                            </h3>
                             <button onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)} title={t(isHeaderCollapsed ? 'Expand Header' : 'Collapse Header')} className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 transition-colors">
                                {isHeaderCollapsed ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {menuItems.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveView(tab.key)}
                                    className="bg-slate-800/70 hover:bg-slate-700/90 rounded-lg p-3 flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 transform hover:scale-105 border border-slate-700 hover:border-cyan-500"
                                >
                                    <tab.icon className="w-7 h-7 text-cyan-400" />
                                    <span className="font-semibold text-gray-200 text-sm">{t(tab.key as any)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                         <div className="flex-shrink-0 border-b border-gray-700 flex items-center p-2 gap-3">
                            <button onClick={() => setActiveView('menu')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white p-2 rounded-md transition-colors hover:bg-gray-700/50">
                                <ArrowUturnLeftIcon className="w-5 h-5" />
                                {t('Back to Menu')}
                            </button>
                            <div className="w-px h-6 bg-gray-700"></div>
                            <h3 className="text-xl font-bold text-cyan-400 narrative-text flex-1">{t(activeView as any)}</h3>
                            <button onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)} title={t(isHeaderCollapsed ? 'Expand Header' : 'Collapse Header')} className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 transition-colors">
                                {isHeaderCollapsed ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in-down-fast">
                            {renderViewContent()}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default LocationDetailsRenderer;
