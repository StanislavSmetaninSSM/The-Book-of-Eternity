
import React, { useMemo, useState } from 'react';
import { Location, AdjacencyMapEntry } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import DetailRow from './Shared/DetailRow';
import EditableField from './Shared/EditableField';
import ImageRenderer from '../ImageRenderer';
import { useLocalization } from '../../context/LocalizationContext';
import {
    InformationCircleIcon, MapPinIcon, ExclamationTriangleIcon, GlobeAltIcon, SunIcon, BuildingOfficeIcon,
    HomeModernIcon, ClockIcon, LinkIcon, CogIcon, TrashIcon, BookOpenIcon
} from '@heroicons/react/24/outline';
import LocationEventsModal from './Shared/LocationEventsModal';

interface LocationDetailsProps extends Omit<DetailRendererProps, 'data'> {
  location: Location;
  onOpenForgetConfirm: () => void;
}

const LocationDetailsRenderer: React.FC<LocationDetailsProps> = ({ location, onOpenImageModal, onOpenForgetConfirm, currentLocationId, allowHistoryManipulation, onEditLocationData }) => {
    const { t } = useLocalization();
    const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
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
                        <ImageRenderer prompt={location.image_prompt} alt={location.name} />
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
                    <DetailRow label={t("Difficulty")} value={location.difficulty} icon={ExclamationTriangleIcon} />
                </Section>

                <Section title={t("Environment")} icon={GlobeAltIcon}>
                     <DetailRow 
                        label={t("Location Type")} 
                        value={t(location.locationType)} 
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
                        <div className="space-y-3">
                            {location.adjacencyMap.map((link: AdjacencyMapEntry, i) => (
                                <div key={i} className="bg-gray-700/50 p-3 rounded-md">
                                    <p className="font-bold text-cyan-400">{link.name}</p>
                                    <p className="text-sm italic text-gray-400">{link.shortDescription}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-2">
                                        <span><strong className="text-gray-400">{t("Type")}:</strong> {t(link.linkType as any)}</span>
                                        <span><strong className="text-gray-400">{t("State")}:</strong> {t(link.linkState as any)}</span>
                                        <span><strong className="text-gray-400">{t("Coordinates")}:</strong> ({link.targetCoordinates.x}, {link.targetCoordinates.y})</span>
                                        <span><strong className="text-gray-400">{t("Difficulty")}:</strong> {link.estimatedDifficulty}</span>
                                    </div>
                                </div>
                            ))}
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
