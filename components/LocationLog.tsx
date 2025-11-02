import React, { useMemo, useState } from 'react';
import { Location, LocationData, GameSettings } from '../types';
import { MapIcon, FireIcon, GlobeAltIcon, UserGroupIcon, MapPinIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useLocalization } from '../context/LocalizationContext';
import MarkdownRenderer from './MarkdownRenderer';
import ImageRenderer from './ImageRenderer';
import ConfirmationModal from './ConfirmationModal';

interface LocationLogProps {
  locations: Location[];
  currentLocation: Location;
  onOpenModal: (title: string, data: any) => void;
  allowHistoryManipulation: boolean;
  onEditLocationData: (locationId: string, field: keyof Location, value: any) => void;
  imageCache: Record<string, string>;
  onImageGenerated: (prompt: string, base64: string) => void;
  forgetLocation: (locationId: string) => void;
  gameSettings: GameSettings | null;
}

const LocationItem: React.FC<{ 
  loc: Location, 
  onOpenModal: (title: string, data: any) => void;
  imageCache: Record<string, string>;
  onImageGenerated: (prompt: string, base64: string) => void;
  isCurrentLocation: boolean;
  allowHistoryManipulation: boolean;
  onDelete: () => void;
  gameSettings: GameSettings | null;
}> = ({ loc, onOpenModal, imageCache, onImageGenerated, isCurrentLocation, allowHistoryManipulation, onDelete, gameSettings }) => {
  const { t } = useLocalization();
  
  const displayType = t((loc.indoorType || loc.biome || loc.locationType) as any);
  
  const { eventType, eventText } = useMemo(() => {
    const fullEventText = loc.eventDescriptions && loc.eventDescriptions.length > 0 ? loc.eventDescriptions[0].trim() : '';
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
  }, [loc.eventDescriptions]);

  const imagePrompt = loc.custom_image_prompt || loc.image_prompt || `A detailed fantasy art image of a ${loc.name}.`;
  
  const dominantControl = useMemo(() => {
    if (!loc.factionControl || loc.factionControl.length === 0) return null;
    const sorted = [...loc.factionControl].sort((a, b) => b.controlLevel - a.controlLevel);
    return sorted[0].controlLevel > 50 ? sorted[0] : null;
  }, [loc.factionControl]);


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
{/*
FIX: Pass 'gameSettings' prop to ImageRenderer.
The ImageRenderer component requires gameSettings to determine which image generation model to use.
*/}
                <ImageRenderer prompt={imagePrompt} alt={loc.name} className="w-full h-full object-cover" imageCache={imageCache} onImageGenerated={onImageGenerated} model={gameSettings?.pollinationsImageModel} gameSettings={gameSettings} />
            </div>
            <div className="flex-1">
                <p className="font-semibold text-cyan-400 text-lg group-hover:underline">{loc.name}</p>
                {dominantControl && (
                    <p className="text-xs text-yellow-400/80 mt-1 flex items-center gap-1.5">
                        <UserGroupIcon className="w-3 h-3" />
                        {t("Controlled by {name}", { name: dominantControl.factionName })}
                    </p>
                )}
                <div className="text-sm text-gray-300 mt-1 line-clamp-2">
                    <MarkdownRenderer content={loc.description} className="prose-p:my-0" />
                </div>
            </div>
        </div>

        {loc.factionControl && loc.factionControl.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700/50">
                <div className="space-y-2">
                    {loc.factionControl.map(fc => (
                        <div key={fc.factionId || fc.factionName} className="text-xs">
                            <div className="flex justify-between items-center text-gray-300 mb-1">
                                <span className="font-semibold">{fc.factionName} ({t(fc.controlType as any)})</span>
                                <span className="font-mono">{fc.controlLevel}%</span>
                            </div>
                            <div className="w-full bg-gray-700/70 rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full" style={{ width: `${fc.controlLevel}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="text-xs text-gray-400 border-t border-gray-700/50 mt-3 pt-2 space-y-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span><strong className="text-gray-500">{t('Type')}:</strong> {displayType}</span>
                {loc.coordinates && <span><strong className="text-gray-500">{t('Coordinates')}:</strong> ({loc.coordinates.x}, {loc.coordinates.y})</span>}
            </div>
            {loc.externalDifficultyProfile && (
                <div>
                    <p className="text-xs font-semibold text-red-400/80 mt-1">{t('For Outsiders / Enemies')}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pl-2">
                        <span title={t('DifficultyCombatTooltip')} className="flex items-center gap-1"><FireIcon className="w-3 h-3 text-red-400" />{t('Combat')}: {loc.externalDifficultyProfile.combat}</span>
                        <span title={t('DifficultyEnvironmentTooltip')} className="flex items-center gap-1"><GlobeAltIcon className="w-3 h-3 text-green-400" />{t('Environment')}: {loc.externalDifficultyProfile.environment}</span>
                        <span title={t('DifficultySocialTooltip')} className="flex items-center gap-1"><UserGroupIcon className="w-3 h-3 text-blue-400" />{t('Social')}: {loc.externalDifficultyProfile.social}</span>
                        <span title={t('DifficultyExplorationTooltip')} className="flex items-center gap-1"><MapPinIcon className="w-3 h-3 text-yellow-400" />{t('Exploration')}: {loc.externalDifficultyProfile.exploration}</span>
                    </div>
                </div>
            )}
            {loc.internalDifficultyProfile && (
                <div>
                    <p className="text-xs font-semibold text-cyan-400/80 mt-1">{t('For Insiders / Allies')}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pl-2">
                        <span title={t('DifficultyCombatTooltip')} className="flex items-center gap-1"><FireIcon className="w-3 h-3 text-red-400" />{t('Combat')}: {loc.internalDifficultyProfile.combat}</span>
                        <span title={t('DifficultyEnvironmentTooltip')} className="flex items-center gap-1"><GlobeAltIcon className="w-3 h-3 text-green-400" />{t('Environment')}: {loc.internalDifficultyProfile.environment}</span>
                        <span title={t('DifficultySocialTooltip')} className="flex items-center gap-1"><UserGroupIcon className="w-3 h-3 text-blue-400" />{t('Social')}: {loc.internalDifficultyProfile.social}</span>
                        <span title={t('DifficultyExplorationTooltip')} className="flex items-center gap-1"><MapPinIcon className="w-3 h-3 text-yellow-400" />{t('Exploration')}: {loc.internalDifficultyProfile.exploration}</span>
                    </div>
                </div>
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
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenModal(t("Location: {name}", { name: loc.name }), { ...loc, type: 'location', initialView: 'Events' });
                    }}
                    className="text-xs font-semibold text-cyan-400 hover:underline mt-2"
                >
                    {t('Read Full Log')}
                </button>
            </div>
        )}
      </button>
    </div>
  );
};

export default function LocationLog({ locations, currentLocation, onOpenModal, allowHistoryManipulation, onEditLocationData, imageCache, onImageGenerated, forgetLocation, gameSettings }: LocationLogProps): React.ReactNode {
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
      return [];
    }
    // The `locations` array is now pre-sorted by the game context logic.
    // This component's only job is to ensure the current location is at the very top.
    const otherLocations = locations.filter(
      loc => loc.locationId !== currentLocation.locationId
    );
    // Find the most up-to-date version of the current location from the list, or use the one from props.
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
                                gameSettings={gameSettings}
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