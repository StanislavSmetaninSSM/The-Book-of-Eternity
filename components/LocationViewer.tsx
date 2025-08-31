
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Location, LocationData, GameSettings } from '../types';
import { 
    MapPinIcon, QuestionMarkCircleIcon, HomeModernIcon, BuildingStorefrontIcon, 
    FireIcon, GlobeAltIcon, SunIcon, PlusIcon, MinusIcon, ArrowPathIcon, UserGroupIcon,
    DocumentTextIcon, ArrowRightIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../context/LocalizationContext';
import ImageRenderer from './ImageRenderer';

// --- Tooltip Component ---
const Tooltip = ({ 
    location, 
    position, 
    imageCache, 
    onImageGenerated,
    model
}: { 
    location: Location | null; 
    position: { top: number; left: number };
    imageCache: Record<string, string>;
    onImageGenerated: (prompt: string, base64: string) => void;
    model?: 'flux' | 'kontext' | 'turbo';
}) => {
    const { t } = useLocalization();
    if (!location) return null;
    
    const profile = location.difficultyProfile || (location as any).estimatedDifficultyProfile;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;
    
    const imagePrompt = location.custom_image_prompt || location.image_prompt || `A detailed fantasy art image of a ${location.name}.`;

    return ReactDOM.createPortal(
        <div 
            className="map-tooltip" 
            style={{ top: position.top, left: position.left }}
        >
            {imagePrompt && (
                <div className="map-tooltip-image">
                    <ImageRenderer prompt={imagePrompt} alt={location.name} imageCache={imageCache} onImageGenerated={onImageGenerated} model={model} />
                </div>
            )}
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
        <defs>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{stopColor: '#d4c7a9', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#c6b89e', stopOpacity: 1}} />
            </radialGradient>
        </defs>
        {/* Outer circle */}
        <circle cx="50" cy="50" r="48" fill="url(#grad1)" stroke="#856d4b" strokeWidth="1"/>

        {/* 16-point star background */}
        <polygon points="50,10 52,48 50,50 48,48" fill="#a0522d80" /> {/* N */}
        <polygon points="90,50 52,52 50,50 52,48" fill="#a0522d80" /> {/* E */}
        <polygon points="50,90 48,52 50,50 52,52" fill="#a0522d80" /> {/* S */}
        <polygon points="10,50 48,48 50,50 48,52" fill="#a0522d80" /> {/* W */}

        {/* 8-point star (intercardinal) */}
        <polygon points="50,20 58,42 50,50 42,42" fill="#c6b89e" stroke="#856d4b" strokeWidth="0.5"/>
        <polygon points="78,22 58,42 50,50 58,58" fill="#c6b89e" stroke="#856d4b" strokeWidth="0.5"/>
        <polygon points="80,50 58,58 50,50 58,42" fill="#c6b89e" stroke="#856d4b" strokeWidth="0.5"/>
        <polygon points="78,78 58,58 50,50 42,58" fill="#c6b89e" stroke="#856d4b" strokeWidth="0.5"/>
        <polygon points="50,80 42,58 50,50 58,58" fill="#c6b89e" stroke="#856d4b" strokeWidth="0.5"/>
        <polygon points="22,78 42,58 50,50 42,42" fill="#c6b89e" stroke="#856d4b" strokeWidth="0.5"/>
        <polygon points="20,50 42,42 50,50 42,58" fill="#c6b89e" stroke="#856d4b" strokeWidth="0.5"/>
        <polygon points="22,22 42,42 50,50 42,58" fill="#c6b89e" stroke="#856d4b" strokeWidth="0.5"/>

        {/* 4-point star (cardinal) */}
        <polygon points="50,2 55,48 50,50" fill="#a0522d" />
        <polygon points="50,2 45,48 50,50" fill="#856d4b" />
        <polygon points="98,50 52,55 50,50" fill="#a0522d" />
        <polygon points="98,50 52,45 50,50" fill="#856d4b" />
        <polygon points="50,98 45,52 50,50" fill="#a0522d" />
        <polygon points="50,98 55,52 50,50" fill="#856d4b" />
        <polygon points="2,50 48,45 50,50" fill="#a0522d" />
        <polygon points="2,50 48,55 50,50" fill="#856d4b" />

        {/* Fleur-de-lis for North */}
        <path d="M50 2 L 47 15 C 45 10, 40 12, 40 20 C 40 28, 50 30, 50 30 C 50 30, 60 28, 60 20 C 60 12, 55 10, 53 15 Z" fill="#5a3d2b" stroke="#f3e9d2" strokeWidth="0.5" />

        {/* Center circle */}
        <circle cx="50" cy="50" r="8" fill="#f3e9d2" stroke="#5a3d2b" strokeWidth="1"/>
        <circle cx="50" cy="50" r="3" fill="#5a3d2b"/>

        {/* Cardinal points text */}
        <text x="50" y="18" textAnchor="middle" fontSize="10" fill="#f3e9d2" fontFamily="Lora" fontWeight="bold">N</text>
        <text x="85" y="53" textAnchor="middle" fontSize="8" fill="#5a3d2b" fontFamily="Lora">E</text>
        <text x="50" y="88" textAnchor="middle" fontSize="8" fill="#5a3d2b" fontFamily="Lora">S</text>
        <text x="15" y="53" textAnchor="middle" fontSize="8" fill="#5a3d2b" fontFamily="Lora">W</text>
    </svg>
);


interface LocationViewerProps {
  visitedLocations: Location[];
  currentLocation: LocationData;
  onOpenModal: (title: string, data: any) => void;
  imageCache: Record<string, string>;
  onImageGenerated: (prompt: string, base64: string) => void;
  isFullScreen?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  gameSettings: GameSettings | null;
}

export default function LocationViewer({ visitedLocations, currentLocation, onOpenModal, imageCache, onImageGenerated, isFullScreen, onExpand, onCollapse, gameSettings }: LocationViewerProps): React.ReactNode {
    const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const panOffsetRef = useRef({ x: 0, y: 0 });
    const viewportRef = useRef<HTMLDivElement>(null);
    const { t } = useLocalization();

    const [showAllLabels, setShowAllLabels] = useState(true);
    const [goToCoords, setGoToCoords] = useState({ x: '', y: '' });

    // State to trigger recentering effect
    const [recenterRequest, setRecenterRequest] = useState(0);


    const { mapDimensions, locations, connections, mapMetrics } = useMemo(() => {
        const allLocations = new Map<string, Location & { isVisited: boolean }>();

        visitedLocations.forEach(loc => {
            if (loc.coordinates) {
                const key = `${loc.coordinates.x},${loc.coordinates.y}`;
                allLocations.set(key, { ...loc, isVisited: true });
            }
        });

        if (currentLocation && currentLocation.coordinates) {
            const key = `${currentLocation.coordinates.x},${currentLocation.coordinates.y}`;
            allLocations.set(key, { ...currentLocation, isVisited: true });
        }

        const processedLocations = Array.from(allLocations.values());
        processedLocations.forEach(loc => {
            if (loc.isVisited && loc.adjacencyMap) {
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
        
        const locationsWithCoords = Array.from(allLocations.values()).filter(l => l.coordinates);
        if (locationsWithCoords.length === 0) {
            return { mapDimensions: { width: 600, height: 500 }, locations: [], connections: [], mapMetrics: { minX:0, minY:0, totalWidthUnits:1, totalHeightUnits:1} };
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
        
        const totalWidthInUnits = widthUnits + 2 * mapPadding;
        const totalHeightInUnits = heightUnits + 2 * mapPadding;
        
        const calculatedWidth = totalWidthInUnits * 50;
        const calculatedHeight = totalHeightInUnits * 50;
        
        const MIN_CSS_WIDTH = 600;
        const MIN_CSS_HEIGHT = 500;
        
        const finalMapWidth = Math.max(calculatedWidth, MIN_CSS_WIDTH);
        const finalMapHeight = Math.max(calculatedHeight, MIN_CSS_HEIGHT);
        
        const effectiveTotalWidthUnits = finalMapWidth / 50;
        const effectiveTotalHeightUnits = finalMapHeight / 50;
        const offsetX = (effectiveTotalWidthUnits - totalWidthInUnits) / 2;
        const offsetY = (effectiveTotalHeightUnits - totalHeightInUnits) / 2;
        
        const locationsWithPositions = locationsWithCoords.map(loc => ({
            ...loc,
            x: (((loc.coordinates!.x - minX + mapPadding) + offsetX) / effectiveTotalWidthUnits) * 100,
            y: (((loc.coordinates!.y - minY + mapPadding) + offsetY) / effectiveTotalHeightUnits) * 100
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
            mapDimensions: { width: finalMapWidth, height: finalMapHeight },
            locations: locationsWithPositions,
            connections,
            mapMetrics: { minX, minY, totalWidthUnits: effectiveTotalWidthUnits, totalHeightUnits: effectiveTotalHeightUnits }
        };
    }, [visitedLocations, currentLocation]);

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

    // Effect for the "Center on Player" button
    useEffect(() => {
        if (recenterRequest === 0) return; // Don't run on initial render

        if (viewportRef.current?.clientWidth) {
            const playerLoc = locations.find(loc => loc.locationId === currentLocation.locationId);
            if (!playerLoc || typeof playerLoc.x !== 'number' || typeof playerLoc.y !== 'number') return;

            const { width: mapWidth, height: mapHeight } = mapDimensions;
            const { clientWidth: viewportWidth, clientHeight: viewportHeight } = viewportRef.current;

            if (viewportWidth === 0 || viewportHeight === 0) return;

            const targetXPixel = (playerLoc.x / 100) * mapWidth;
            const targetYPixel = (playerLoc.y / 100) * mapHeight;
            
            // Use the CURRENT zoom, do not reset it.
            setPan({
                x: (viewportWidth / 2) - (targetXPixel * zoom),
                y: (viewportHeight / 2) - (targetYPixel * zoom),
            });
        }
    }, [recenterRequest, locations, currentLocation.locationId, mapDimensions, zoom]);

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

    useEffect(() => {
        // Effect for initial centering and recentering on fullscreen toggle or map data change.
        const timer = setTimeout(() => {
            if (viewportRef.current?.clientWidth) {
                const playerLoc = locations.find(loc => loc.locationId === currentLocation.locationId);
                if (!playerLoc || typeof playerLoc.x !== 'number' || typeof playerLoc.y !== 'number') return;
                
                const { width: mapWidth, height: mapHeight } = mapDimensions;
                const { clientWidth: viewportWidth, clientHeight: viewportHeight } = viewportRef.current;

                if (viewportWidth === 0 || viewportHeight === 0) return;

                const targetXPixel = (playerLoc.x / 100) * mapWidth;
                const targetYPixel = (playerLoc.y / 100) * mapHeight;

                const initialZoom = 1;
                setZoom(initialZoom);
                setPan({
                    x: (viewportWidth / 2) - (targetXPixel * initialZoom),
                    y: (viewportHeight / 2) - (targetYPixel * initialZoom),
                });
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [locations, currentLocation.locationId, mapDimensions, isFullScreen]);
    
    const handleGoToCoords = (e: React.FormEvent) => {
        e.preventDefault();
        const x = parseInt(goToCoords.x, 10);
        const y = parseInt(goToCoords.y, 10);

        if (isNaN(x) || isNaN(y) || !viewportRef.current) return;
        
        const { minX, minY } = mapMetrics;
        
        const effectiveTotalWidthUnits = mapDimensions.width / 50;
        const effectiveTotalHeightUnits = mapDimensions.height / 50;
        
        const totalWidthInUnits = (mapMetrics as any).totalWidthUnits;
        const totalHeightInUnits = (mapMetrics as any).totalHeightUnits;

        const offsetX = (effectiveTotalWidthUnits - totalWidthInUnits) / 2;
        const offsetY = (effectiveTotalHeightUnits - totalHeightInUnits) / 2;

        const mapPadding = 1;
        const targetXPercent = (((x - minX + mapPadding) + offsetX) / effectiveTotalWidthUnits) * 100;
        const targetYPercent = (((y - minY + mapPadding) + offsetY) / effectiveTotalHeightUnits) * 100;

        const targetXPixel = (targetXPercent / 100) * mapDimensions.width;
        const targetYPixel = (targetYPercent / 100) * mapDimensions.height;

        const { clientWidth: viewportWidth, clientHeight: viewportHeight } = viewportRef.current;

        const newZoom = 1.2;
        setZoom(newZoom);

        setPan({
            x: (viewportWidth / 2) - (targetXPixel * newZoom),
            y: (viewportHeight / 2) - (targetYPixel * newZoom),
        });
    };

    if (!currentLocation || locations.length === 0) {
        return (
            <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text">{t('World Map')}</h3>
                <div className="text-center text-gray-500 p-6 bg-gray-900/20 rounded-lg">
                    <MapPinIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p>{!currentLocation ? t('No current location data available to display the map.') : t('No map data available.')}</p>
                </div>
            </div>
        );
    }

    return (
        <div onMouseMove={handleMouseMoveTooltip} className="flex flex-col h-full">
            <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text flex-shrink-0">{t('World Map')}</h3>
            <div
                ref={viewportRef}
                className="map-viewport flex-1"
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
                    <button className="map-control-button" onClick={() => setRecenterRequest(prev => prev + 1)} title={t("Center on Player")}>
                        <MapPinIcon className="w-4 h-4" />
                    </button>
                     <button 
                        className={`map-control-button ${showAllLabels ? 'map-control-button--active' : ''}`} 
                        onClick={() => setShowAllLabels(!showAllLabels)}
                        title={t("Toggle Labels")}
                    >
                        <DocumentTextIcon className="w-4 h-4" />
                    </button>
                    {isFullScreen ? (
                        onCollapse && (
                            <button className="map-control-button" onClick={onCollapse} title={t("Collapse Map")}>
                                <ArrowsPointingInIcon className="w-4 h-4" />
                            </button>
                        )
                    ) : (
                        onExpand && (
                            <button className="map-control-button" onClick={onExpand} title={t("Expand Map")}>
                                <ArrowsPointingOutIcon className="w-4 h-4" />
                            </button>
                        )
                    )}
                </div>
                 <form className="map-goto-controls" onSubmit={handleGoToCoords} onMouseDown={(e) => e.stopPropagation()}>
                    <input 
                        type="number" 
                        className="map-goto-input" 
                        placeholder="X" 
                        value={goToCoords.x}
                        onChange={(e) => setGoToCoords(prev => ({...prev, x: e.target.value}))}
                    />
                    <input 
                        type="number" 
                        className="map-goto-input" 
                        placeholder="Y" 
                        value={goToCoords.y}
                        onChange={(e) => setGoToCoords(prev => ({...prev, y: e.target.value}))}
                    />
                    <button type="submit" className="map-control-button" title={t("Go")}>
                        <ArrowRightIcon className="w-4 h-4" />
                    </button>
                </form>
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
                                    <div className={`map-location-label ${!showAllLabels ? 'map-location-label--hidden' : ''}`}>{loc.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <Tooltip 
                location={hoveredLocation} 
                position={tooltipPosition} 
                imageCache={imageCache} 
                onImageGenerated={onImageGenerated}
                model={gameSettings?.pollinationsImageModel}
            />
        </div>
    );
}
