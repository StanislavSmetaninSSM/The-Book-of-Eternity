import React, { useMemo } from 'react';
import { Location, LocationData } from '../types';
import { MapIcon } from '@heroicons/react/24/outline';
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
  const latestEvent = useMemo(() => loc.lastEventsDescription ? loc.lastEventsDescription.split('\n\n')[0].trim() : '', [loc.lastEventsDescription]);

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
        <div className="text-xs text-gray-400 border-t border-gray-700/50 pt-2 flex flex-wrap gap-x-3">
          <span><strong className="text-gray-500">{t('Type')}:</strong> {displayType}</span>
          {loc.coordinates && <span><strong className="text-gray-500">{t('Coordinates')}:</strong> ({loc.coordinates.x}, {loc.coordinates.y})</span>}
          <span><strong className="text-gray-500">{t('Difficulty')}:</strong> {loc.difficulty}</span>
        </div>
      </button>

      {latestEvent && (
        <div className="border-t border-gray-700/50 pt-3 space-y-2">
          <p className="text-xs font-semibold text-gray-400">{t('Last Event')}:</p>
          <div className="text-sm italic text-gray-400 line-clamp-2">
            <MarkdownRenderer content={latestEvent} />
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