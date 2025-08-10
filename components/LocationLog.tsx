
import React, { useMemo } from 'react';
import { Location, LocationData } from '../types';
import { MapIcon, FireIcon, GlobeAltIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useLocalization } from '../context/LocalizationContext';
import MarkdownRenderer from './MarkdownRenderer';

interface LocationLogProps {
  locations: Location[];
  currentLocation: LocationData;
  onOpenModal: (title: string, data: any) => void;
  allowHistoryManipulation: boolean;
  onEditLocationData: (locationId: string, field: keyof Location, value: any) => void;
}

const LocationItem: React.FC<{ 
  loc: Location, 
  onOpenModal: (title: string, data: any) => void;
}> = ({ loc, onOpenModal }) => {
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

  return (
    <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/50 shadow-md flex flex-col gap-3">
      <button 
        onClick={() => onOpenModal(t("Location: {name}", { name: loc.name }), { ...loc, type: 'location' })}
        className="w-full text-left"
      >
        <p className="font-semibold text-cyan-400 text-lg hover:underline">{loc.name}</p>
        <div className="text-sm text-gray-300 my-2 line-clamp-2">
          <MarkdownRenderer content={loc.description} className="prose-p:my-0" />
        </div>
        <div className="text-xs text-gray-400 border-t border-gray-700/50 pt-2 flex flex-wrap gap-x-4 gap-y-1">
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
      </button>

      {eventText && (
        <div className="border-t border-gray-700/50 pt-3 space-y-2">
          <p className="text-xs font-semibold text-gray-400">
            {t('Last Event')}: {eventType && <span className="text-cyan-300 font-medium">{t(eventType as any)}</span>}
          </p>
          <div className="text-sm italic text-gray-400 line-clamp-2">
            <MarkdownRenderer content={eventText} />
          </div>
        </div>
      )}
    </div>
  );
};

export default function LocationLog({ locations, currentLocation, onOpenModal }: LocationLogProps): React.ReactNode {
  const { t } = useLocalization();
  
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
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text">{t('Known Locations')}</h3>
      {sortedLocations && sortedLocations.length > 0 ? (
        <div className="space-y-3">
          {sortedLocations.map((loc) => (
            loc.locationId ? <LocationItem key={loc.locationId} loc={loc} onOpenModal={onOpenModal} /> : null
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 p-6 bg-gray-900/20 rounded-lg">
          <MapIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
          {t('No locations discovered yet.')}
        </div>
      )}
    </div>
  );
}
