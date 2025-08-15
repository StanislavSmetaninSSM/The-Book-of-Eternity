
import React, { useMemo, useState } from 'react';
import { Location, LocationData, PlayerCharacter, AdjacencyMapEntry } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import DetailRow from './Shared/DetailRow';
import EditableField from './Shared/EditableField';
import ImageRenderer from '../ImageRenderer';
import { useLocalization } from '../../context/LocalizationContext';
import {
    InformationCircleIcon, MapPinIcon, ExclamationTriangleIcon, GlobeAltIcon, SunIcon, BuildingOfficeIcon,
    HomeModernIcon, ClockIcon, LinkIcon, CogIcon, TrashIcon, BookOpenIcon, FireIcon, UserGroupIcon, ChevronDownIcon, ChevronUpIcon
} from '@heroicons/react/24/outline';
import LocationEventsModal from './Shared/LocationEventsModal';

interface LocationDetailsProps extends Omit<DetailRendererProps, 'data'> {
  location: Location;
  onOpenForgetConfirm: () => void;
  playerCharacter: PlayerCharacter | null;
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
    profile: Location['difficultyProfile'];
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

const LocationDetailsRenderer: React.FC<LocationDetailsProps> = ({ location, onOpenImageModal, onOpenForgetConfirm, currentLocationId, allowHistoryManipulation, onEditLocationData, imageCache, onImageGenerated, playerCharacter }) => {
    const { t } = useLocalization();
    const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
    const [expandedLink, setExpandedLink] = useState<string | null>(null);
    const isCurrentLocation = location.locationId === currentLocationId;
    const isRealLocation = location.locationId && !location.locationId.startsWith('undiscovered-');

    const events = useMemo(() => location.lastEventsDescription ? location.lastEventsDescription.split('\n\n').filter(e => e.trim()) : [], [location.lastEventsDescription]);
    
    const handleSaveEvents = (newEvents: string[]) => {
      if (location?.locationId) {
          const newEventsString = newEvents.join('\n\n');
          onEditLocationData(location.locationId, 'lastEventsDescription', newEventsString);
      }
    };


    return (
        <>
            <div className="space-y-4">
                {location.image_prompt && (
                    <div className="w-full h-48 rounded-lg overflow-hidden mb-4 bg-gray-900 group relative cursor-pointer" onClick={() => onOpenImageModal?.(location.image_prompt)}>
                        <ImageRenderer prompt={location.image_prompt} alt={location.name} imageCache={imageCache} onImageGenerated={onImageGenerated} />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-bold text-lg">{t('Enlarge')}</p>
                        </div>
                    </div>
                )}
                 <div className="text-xl font-bold">
                    <EditableField 
                        label={t('Name')}
                        value={location.name}
                        isEditable={allowHistoryManipulation && !!location.locationId}
                        onSave={(val) => { if (location.locationId) onEditLocationData(location.locationId, 'name', val) }}
                        as="input"
                        className="font-bold text-xl"
                    />
                </div>
                <div className="italic text-gray-400">
                    <EditableField 
                        label={t('Description')}
                        value={location.description}
                        isEditable={allowHistoryManipulation && !!location.locationId}
                        onSave={(val) => { if (location.locationId) onEditLocationData(location.locationId, 'description', val) }}
                    />
                </div>
                
                <Section title={t("Information")} icon={InformationCircleIcon}>
                    <DetailRow label={t("Coordinates")} value={`(${location.coordinates?.x}, ${location.coordinates?.y})`} icon={MapPinIcon} />
                </Section>
                
                {location.difficultyProfile && playerCharacter && (
                    <Section title={t("Challenge Assessment")} icon={ExclamationTriangleIcon}>
                        <ChallengeAssessment profile={location.difficultyProfile} player={playerCharacter} />
                    </Section>
                )}

                <Section title={t("Environment")} icon={GlobeAltIcon}>
                     <DetailRow 
                        label={t("Location Type")} 
                        value={t(location.locationType as any)} 
                        icon={location.locationType === 'outdoor' ? SunIcon : BuildingOfficeIcon} 
                    />
                    {location.biome && <DetailRow label={t("Biome")} value={t(location.biome as any)} icon={GlobeAltIcon} />}
                    {location.indoorType && <DetailRow label={t("Indoor Type")} value={t(location.indoorType as any)} icon={HomeModernIcon} />}
                </Section>
                
                {events.length > 0 && (
                    <Section title={t("Last Events")} icon={ClockIcon}>
                        <div className="bg-gray-700/50 p-3 rounded-md italic text-gray-300">
                           <p className="line-clamp-3 whitespace-pre-wrap">{events[0]}</p>
                        </div>
                        {events.length > 1 && (
                            <div className="pt-2">
                                <button
                                onClick={() => setIsEventsModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 rounded-md hover:bg-cyan-500/20 transition-colors"
                                >
                                <BookOpenIcon className="w-4 h-4" />
                                {t('Read Full Log')}
                                </button>
                            </div>
                        )}
                    </Section>
                )}
                
                {location.adjacencyMap && location.adjacencyMap.length > 0 && (
                    <Section title={t("Connections")} icon={LinkIcon}>
                        <div className="space-y-2">
                            {location.adjacencyMap.map((link: AdjacencyMapEntry, i) => {
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
                                            {link.estimatedDifficultyProfile && playerCharacter && (
                                                <div className="pt-2 border-t border-gray-700/50 mt-2">
                                                    <h5 className="font-semibold mb-2 text-gray-300">{t("Challenge Assessment")}</h5>
                                                    <ChallengeAssessment profile={link.estimatedDifficultyProfile} player={playerCharacter} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    </Section>
                )}

                {isRealLocation && (
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
                )}
            </div>
            {isEventsModalOpen && (
                <LocationEventsModal 
                    isOpen={isEventsModalOpen}
                    onClose={() => setIsEventsModalOpen(false)}
                    locationName={location.name}
                    events={events}
                    isEditable={allowHistoryManipulation}
                    onSaveEvents={handleSaveEvents}
                />
            )}
        </>
    );
}

export default LocationDetailsRenderer;
