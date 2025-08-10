
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Location, LocationData } from '../types';
import { 
    MapPinIcon, QuestionMarkCircleIcon, HomeModernIcon, BuildingStorefrontIcon, 
    FireIcon, GlobeAltIcon, SunIcon, PlusIcon, MinusIcon, ArrowPathIcon, UserGroupIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../context/LocalizationContext';

// --- Tooltip Component ---
const Tooltip = ({ location, position }: { location: Location | null; position: { top: number; left: number } }) => {
    const { t } = useLocalization();
    if (!location) return null;
    
    const profile = location.difficultyProfile || (location as any).estimatedDifficultyProfile;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div 
            className="map-tooltip" 
            style={{ top: position.top, left: position.left }}
        >
            <div className="map-tooltip-title">{location.name}</div>
            {location.description && <p className="map-tooltip-desc">{location.description}</p>}
            {profile && (
                <div className="map-tooltip-difficulty grid grid-cols-2 gap-x-4 mt-2 text-xs">
                    <span className="flex items-center gap-1" title={t('DifficultyCombatTooltip')}><FireIcon className="w-3 h-3 text-red-500"/>{t('Combat')}: {profile.combat}</span>
                    <span className="flex items-center gap-1" title={t('DifficultyEnvironmentTooltip')}><GlobeAltIcon className="w-3 h-3 text-green-500"/>{t('Environment')}: {profile.environment}</span>
                    <span className="flex items-center gap-1" title={t('DifficultySocialTooltip')}><UserGroupIcon className="w-3 h-3 text-blue-500"/>{t('Social')}: {profile.social}</span>
                    <span className="flex items-center gap-1" title={t('DifficultyExplorationTooltip')}><MapPinIcon className="w-3 h-3 text-yellow-500"/>{t('Exploration')}: {profile.exploration}</span>
                </div>
            )}
        </div>,
        modalRoot
    );
};

// --- Icon Helper ---
const getLocationIconAndStyle = (location: Location & { isVisited: boolean }) => {
    if (!location.isVisited) {
        return { Icon: QuestionMarkCircleIcon, color: 'text-gray-600' };
    }
    let Icon = MapPinIcon;
    let color = 'text-gray-700';
    const locName = location.name.toLowerCase();

    if (locName.includes('city') || locName.includes('town') || locName.includes('village')) {
        Icon = HomeModernIcon;
        color = 'text-amber-800';
    } else if (location.indoorType === 'Dungeon' || location.indoorType === 'CaveSystem' || locName.includes('dungeon') || locName.includes('cave')) {
        Icon = FireIcon;
        color = 'text-red-900';
    } else if (locName.includes('inn') || locName.includes('tavern') || locName.includes('shop')) {
        Icon = BuildingStorefrontIcon;
        color = 'text-green-800';
    } else if (location.biome === 'TemperateForest') {
        color = 'text-green-900';
    } else if (location.biome === 'Mountains') {
        color = 'text-stone-600';
    } else if (location.biome === 'Plains') {
        Icon = SunIcon;
        color = 'text-yellow-700';
    } else if (location.biome === 'Unique') {
        Icon = GlobeAltIcon;
        color = 'text-purple-800';
    }

    return { Icon, color };
};

const CompassRose = () => (
    <svg className="compass-rose" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#f3e9d2" stroke="#5a3d2b" strokeWidth="1"/>
        <path d="M50 10 L55 50 L50 90 L45 50 Z" fill="#a0522d"/>
        <path d="M50 10 L55 50 L50 90 L45 50 Z" fill="none" stroke="#5a3d2b" strokeWidth="1"/>
        <path d="M10 50 L50 45 L90 50 L50 55 Z" fill="#d4c7a9"/>
        <path d="M10 50 L50 45 L90 50 L50 55 Z" fill="none" stroke="#5a3d2b" strokeWidth="1"/>
        <circle cx="50" cy="50" r="5" fill="#a0522d" stroke="#5a3d2b" strokeWidth="1"/>
        <text x="50" y="8" textAnchor="middle" fontSize="10" fill="#5a3d2b" fontFamily="Lora">N</text>
    </svg>
);


interface LocationViewerProps {
  visitedLocations: Location[];
  currentLocation: LocationData;
  onOpenModal: (title: string, data: any) => void;
}

export default function LocationViewer({ visitedLocations, currentLocation, onOpenModal }: LocationViewerProps): React.ReactNode {
    const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const panOffsetRef = useRef({ x: 0, y: 0 });
    const viewportRef = useRef<HTMLDivElement>(null);
    const { t } = useLocalization();

    // Guard clause to prevent rendering if essential data is missing
    if (!currentLocation) {
        return (
            <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text">{t('World Map')}</h3>
                <div className="text-center text-gray-500 p-6 bg-gray-900/20 rounded-lg">
                    <MapPinIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p>{t('No current location data available to display the map.')}</p>
                </div>
            </div>
        );
    }

    const handleMouseEnter = useCallback((location: Location, event: React.MouseEvent) => {
        setHoveredLocation(location);
    }, []);
    
    const handleMouseMoveTooltip = useCallback((event: React.MouseEvent) => {
        setTooltipPosition({ top: event.clientY, left: event.clientX });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoveredLocation(null);
    }, []);

    const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsPanning(true);
        panStartRef.current = { x: e.clientX, y: e.clientY };
        panOffsetRef.current = pan;
        if (viewportRef.current) {
            viewportRef.current.classList.add('is-panning');
        }
    }, [pan]);

    const onMouseUp = useCallback(() => {
        setIsPanning(false);
        if (viewportRef.current) {
            viewportRef.current.classList.remove('is-panning');
        }
    }, []);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isPanning) return;
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        setPan({
            x: panOffsetRef.current.x + dx,
            y: panOffsetRef.current.y + dy,
        });
    }, [isPanning]);
    
    const handleZoom = useCallback((delta: number) => {
        setZoom(prevZoom => Math.max(0.5, Math.min(3, prevZoom + delta)));
    }, []);
    
    const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleZoom(e.deltaY * -0.002);
    }, [handleZoom]);

    const handleReset = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, []);

    useEffect(() => {
        if (isPanning) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isPanning, onMouseMove, onMouseUp]);


    const { mapDimensions, locations, connections } = useMemo(() => {
        const allLocations = new Map<string, Location & { isVisited: boolean }>();
        
        visitedLocations.forEach(loc => {
            if (loc.coordinates) {
                const key = `${loc.coordinates.x},${loc.coordinates.y}`;
                allLocations.set(key, { ...loc, isVisited: true });
            }
        });
        
        visitedLocations.forEach(loc => {
            if (loc.coordinates && loc.adjacencyMap) {
                loc.adjacencyMap.forEach(link => {
                    const key = `${link.targetCoordinates.x},${link.targetCoordinates.y}`;
                    if (!allLocations.has(key)) {
                        const unvisitedLoc: Location & { isVisited: boolean } = {
                            name: link.name,
                            description: link.shortDescription,
                            difficultyProfile: link.estimatedDifficultyProfile,
                            coordinates: link.targetCoordinates,
                            isVisited: false,
                            locationId: `undiscovered-${key}`,
                            lastEventsDescription: '',
                            image_prompt: '',
                            locationType: 'outdoor',
                        };
                        allLocations.set(key, unvisitedLoc);
                    }
                });
            }
        });
        
        const locationsWithCoords = Array.from(allLocations.values());
        if (locationsWithCoords.length === 0) {
            return { mapDimensions: { width: 100, height: 100 }, locations: [], connections: [] };
        }

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        locationsWithCoords.forEach(loc => {
            minX = Math.min(minX, loc.coordinates!.x);
            maxX = Math.max(maxX, loc.coordinates!.x);
            minY = Math.min(minY, loc.coordinates!.y);
            maxY = Math.max(maxY, loc.coordinates!.y);
        });

        const mapPadding = 1;
        const widthUnits = (maxX - minX) || 1;
        const heightUnits = (maxY - minY) || 1;
        
        const totalWidth = widthUnits + 2 * mapPadding;
        const totalHeight = heightUnits + 2 * mapPadding;

        const locationsWithPositions = locationsWithCoords.map(loc => ({
            ...loc,
            x: (((loc.coordinates!.x - minX + mapPadding) / totalWidth) * 100),
            y: (((loc.coordinates!.y - minY + mapPadding) / totalHeight) * 100)
        }));

        const locationMap = new Map(locationsWithPositions.map(l => [`${l.coordinates.x},${l.coordinates.y}`, l]));
        const drawnConnections = new Set<string>();
        const connections = [];

        for (const loc of locationsWithPositions) {
            if (loc.isVisited && loc.adjacencyMap) {
                for (const link of loc.adjacencyMap) {
                    const targetKey = `${link.targetCoordinates.x},${link.targetCoordinates.y}`;
                    const targetLoc = locationMap.get(targetKey);
                    if (targetLoc) {
                        const connectionKey = [loc.locationId, targetLoc.locationId].sort().join('-');
                        if (!drawnConnections.has(connectionKey)) {
                            drawnConnections.add(connectionKey);
                            connections.push({
                                key: connectionKey,
                                x1: loc.x, y1: loc.y,
                                x2: targetLoc.x, y2: targetLoc.y,
                                isDiscovered: targetLoc.isVisited
                            });
                        }
                    }
                }
            }
        }
        return {
            mapDimensions: { width: totalWidth * 50, height: totalHeight * 50 },
            locations: locationsWithPositions,
            connections
        };
    }, [visitedLocations]);
    
    if (locations.length === 0) {
        return (
            <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text">{t('World Map')}</h3>
                <div className="text-center text-gray-500 p-6 bg-gray-900/20 rounded-lg">
                    <MapPinIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p>{t('No map data available.')}</p>
                </div>
            </div>
        );
    }

    return (
        <div onMouseMove={handleMouseMoveTooltip}>
            <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text">{t('World Map')}</h3>
            <div
                ref={viewportRef}
                className="map-viewport"
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onWheel={onWheel}
            >
                <div className="map-controls">
                    <button className="map-control-button" onClick={() => handleZoom(0.2)} title={t("Zoom In")}>
                        <PlusIcon className="w-4 h-4" />
                    </button>
                    <button className="map-control-button" onClick={() => handleZoom(-0.2)} title={t("Zoom Out")}>
                        <MinusIcon className="w-4 h-4" />
                    </button>
                    <button className="map-control-button" onClick={handleReset} title={t("Reset View")}>
                        <ArrowPathIcon className="w-4 h-4" />
                    </button>
                </div>
                <CompassRose />

                <div
                    className="map-transform-wrapper"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        width: `${mapDimensions.width}px`,
                        height: `${mapDimensions.height}px`
                    }}
                >
                    <div className="map-canvas" style={{ width: `${mapDimensions.width}px`, height: `${mapDimensions.height}px` }}>
                        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                            <g>
                                {connections.map(c => (
                                    <line
                                        key={c.key}
                                        x1={`${c.x1}%`}
                                        y1={`${c.y1}%`}
                                        x2={`${c.x2}%`}
                                        y2={`${c.y2}%`}
                                        className={c.isDiscovered ? 'map-line' : 'map-line--undiscovered'}
                                    />
                                ))}
                            </g>
                        </svg>

                        {locations.map(loc => {
                            const { Icon, color } = getLocationIconAndStyle(loc);
                            const isPlayerLocation = loc.locationId === currentLocation.locationId;
                            return (
                                <div
                                    key={loc.locationId}
                                    className={`map-location ${!loc.isVisited ? 'map-location--undiscovered' : ''} ${isPlayerLocation ? 'map-location--player' : ''}`}
                                    style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                                    onClick={() => onOpenModal(t("Location: {name}", { name: loc.name }), { ...loc, type: 'location' })}
                                    onMouseEnter={(e) => handleMouseEnter(loc, e)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <Icon className={`w-6 h-6 map-location-icon ${color}`} />
                                    <div className="map-location-label">{loc.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <Tooltip location={hoveredLocation} position={tooltipPosition} />
        </div>
    );
}
