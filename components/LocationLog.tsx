
import React, { useMemo, useState } from 'react';
import { Location, LocationData } from '../types';
import { MapIcon, FireIcon, GlobeAltIcon, UserGroupIcon, MapPinIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useLocalization } from '../context/LocalizationContext';
import MarkdownRenderer from './MarkdownRenderer';
import ImageRenderer from './ImageRenderer';
import ConfirmationModal from './ConfirmationModal';

interface LocationLogProps {
  locations: Location[];
  currentLocation: LocationData;
  onOpenModal: (title: string, data: any) => void;
  allowHistoryManipulation: boolean;
  onEditLocationData: (locationId: string, field: keyof Location, value: any) => void;
  imageCache: Record<string, string>;
  onImageGenerated: (prompt: string, base64: string) => void;
  forgetLocation: (locationId: string) => void;
}

const LocationItem: React.FC<{ 
  loc: Location, 
  onOpenModal: (title: string, data: any) => void;
  imageCache: Record<string, string>;
  onImageGenerated: (prompt: string, base64: string) => void;
  isCurrentLocation: boolean;
  allowHistoryManipulation: boolean;
  onDelete: () => void;
}> = ({ loc, onOpenModal, imageCache, onImageGenerated, isCurrentLocation, allowHistoryManipulation, onDelete }) => {
  const { t } = useLocalization();
  
  const displayType = t((loc.indoorType || loc.biome || loc.locationType) as any);
  
  const { eventType, eventText } = useMemo(() => {
    const fullEventText = loc.lastEventsDescription ? loc.lastEventsDescription.split('\n\n')[0].trim() : '';
    if (!fullEventText) {
      return { eventType: null, eventText: '' };
    }
    
    const lines = fullEventText.split('\n');
    const firstLine = lines[0].trim();
    // A list of potential single-word event types the GM might prepend.
    const eventTypes = ['Exploration', 'Combat', 'Social', 'Quest', 'Travel', 'Crafting', 'Trade'];
    
    if (eventTypes.includes(firstLine) && lines.length > 1 && lines[1].trim().startsWith('#[')) {
      return { eventType: firstLine, eventText: lines.slice(1).join('\n').trim() };
    }
    
    return { eventType: null, eventText: fullEventText };
  }, [loc.lastEventsDescription]);

  const imagePrompt = loc.custom_image_prompt || loc.image_prompt || `A detailed fantasy art image of a ${loc.name}.`;

  return (
    <div 
      className="relative w-full text-left bg-gray-900/40 p-3 rounded-lg border border-gray-700/50 shadow-md transition-all hover:ring-1 hover:ring-cyan-500/50 hover:border-cyan-500/50 group"
    >
      {allowHistoryManipulation && (
        <button
            onClick={(e) => {
                e.stopPropagation();
                if (!isCurrentLocation) {
                    onDelete();
                }
            }}
            disabled={isCurrentLocation}
            className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 z-10 disabled:opacity-20 disabled:cursor-not-allowed"
            title={isCurrentLocation ? t('You cannot forget your current location.') : t('Forget Location')}
        >
            <TrashIcon className="w-4 h-4" />
        </button>
      )}
      <button 
        onClick={() => onOpenModal(t("Location: {name}", { name: loc.name }), { ...loc, type: 'location' })}
        className="w-full text-left"
      >
        <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-800 flex items-center justify-center">
                <ImageRenderer prompt={imagePrompt} alt={loc.name} className="w-full h-full object-cover" imageCache={imageCache} onImageGenerated={onImageGenerated} />
            </div>
            <div className="flex-1">
                <p className="font-semibold text-cyan-400 text-lg group-hover:underline">{loc.name}</p>
                <div className="text-sm text-gray-300 mt-1 line-clamp-2">
                    <MarkdownRenderer content={loc.description} className="prose-p:my-0" />
                </div>
            </div>
        </div>

        <div className="text-xs text-gray-400 border-t border-gray-700/50 mt-3 pt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span><strong className="text-gray-500">{t('Type')}:</strong> {displayType}</span>
            {loc.coordinates && <span><strong className="text-gray-500">{t('Coordinates')}:</strong> ({loc.coordinates.x}, {loc.coordinates.y})</span>}
            {loc.difficultyProfile && (
                <>
                    <span title={t('DifficultyCombatTooltip')} className="flex items-center gap-1"><FireIcon className="w-3 h-3 text-red-400" />{loc.difficultyProfile.combat}</span>
                    <span title={t('DifficultyEnvironmentTooltip')} className="flex items-center gap-1"><GlobeAltIcon className="w-3 h-3 text-green-400" />{loc.difficultyProfile.environment}</span>
                    <span title={t('DifficultySocialTooltip')} className="flex items-center gap-1"><UserGroupIcon className="w-3 h-3 text-blue-400" />{loc.difficultyProfile.social}</span>
                    <span title={t('DifficultyExplorationTooltip')} className="flex items-center gap-1"><MapPinIcon className="w-3 h-3 text-yellow-400" />{loc.difficultyProfile.exploration}</span>
                </>
            )}
        </div>
        
        {eventText && (
            <div className="border-t border-gray-700/50 pt-3 mt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-400">
                    {t('Last Event')}: {eventType && <span className="text-cyan-300 font-medium">{t(eventType as any)}</span>}
                </p>
                <div className="text-sm italic text-gray-400 line-clamp-2">
                    <MarkdownRenderer content={eventText} />
                </div>
            </div>
        )}
      </button>
    </div>
  );
};

export default function LocationLog({ locations, currentLocation, onOpenModal, allowHistoryManipulation, onEditLocationData, imageCache, onImageGenerated, forgetLocation }: LocationLogProps): React.ReactNode {
  const { t } = useLocalization();
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);

  const handleDeleteConfirm = () => {
    if (locationToDelete && locationToDelete.locationId) {
        forgetLocation(locationToDelete.locationId);
    }
    setLocationToDelete(null);
  };
  
  const sortedLocations = useMemo(() => {
    if (!locations || !currentLocation) {
      return locations || [];
    }
    const otherLocations = locations.filter(
      loc => loc.locationId !== currentLocation.locationId
    );
    const currentLocInList = locations.find(loc => loc.locationId === currentLocation.locationId) || currentLocation;
    return [currentLocInList, ...otherLocations];
  }, [locations, currentLocation]);


  return (
    <>
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text">{t('Known Locations')}</h3>
        {sortedLocations && sortedLocations.length > 0 ? (
          <div className="space-y-3">
            {sortedLocations.map((loc) => (
              loc.locationId ? <LocationItem 
                                key={loc.locationId} 
                                loc={loc} 
                                onOpenModal={onOpenModal} 
                                imageCache={imageCache} 
                                onImageGenerated={onImageGenerated}
                                isCurrentLocation={loc.locationId === currentLocation.locationId}
                                allowHistoryManipulation={allowHistoryManipulation}
                                onDelete={() => setLocationToDelete(loc)}
                              /> : null
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 p-6 bg-gray-900/20 rounded-lg">
            <MapIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            {t('No locations discovered yet.')}
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={!!locationToDelete}
        onClose={() => setLocationToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t("Forget Location")}
      >
        <p>{t("Are you sure you want to forget this location? This will remove it from your map and logs.")}</p>
      </ConfirmationModal>
    </>
  );
}