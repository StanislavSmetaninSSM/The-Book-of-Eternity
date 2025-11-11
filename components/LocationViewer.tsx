import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Location, GameSettings, Faction, DifficultyProfile, ImageCacheEntry } from '../types';
import { 
    MapPinIcon, QuestionMarkCircleIcon, HomeModernIcon, BuildingStorefrontIcon, 
    FireIcon, GlobeAltIcon, SunIcon, PlusIcon, MinusIcon, ArrowPathIcon, UserGroupIcon,
    ArrowsPointingOutIcon, ArrowsPointingInIcon, FlagIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../context/LocalizationContext';
import ImageRenderer from './ImageRenderer';

// --- Utility Functions ---

// Darkens a HEX color by a given percentage
const darkenColor = (hex: string, percent: number): string => {
    if (!hex || hex.length < 7) return '#000000';
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r = Math.floor(r * (1 - percent / 100));
    g = Math.floor(g * (1 - percent / 100));
    b = Math.floor(b * (1 - percent / 100));

    const toHex = (c: number) => `0${c.toString(16)}`.slice(-2);

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const generateBlobPath = (points: {x: number, y: number}[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) {
        const p = points[0];
        const r = 25; // radius for single point blob, slightly larger
        return `M ${p.x - r},${p.y} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
    }
    if (points.length === 2) {
        const [p1, p2] = points;
        const r = 25;
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const dx = r * Math.sin(angle);
        const dy = -r * Math.cos(angle);
        return `M ${p1.x + dx},${p1.y + dy} L ${p2.x + dx},${p2.y + dy} A ${r},${r} 0 0,1 ${p2.x - dx},${p2.y - dy} L ${p1.x - dx},${p1.y - dy} A ${r},${r} 0 0,1 ${p1.x + dx},${p1.y + dy} Z`;
    }
    
    const centroid = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    centroid.x /= points.length;
    centroid.y /= points.length;

    const sortedPoints = points.sort((a, b) => {
        const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
        const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
        return angleA - angleB;
    });

    const tension = 0.4;
    let path = `M${sortedPoints[0].x},${sortedPoints[0].y}`;

    for(let i = 0; i < sortedPoints.length; i++) {
        const p0 = sortedPoints[(i - 1 + sortedPoints.length) % sortedPoints.length];
        const p1 = sortedPoints[i];
        const p2 = sortedPoints[(i + 1) % sortedPoints.length];
        const p3 = sortedPoints[(i + 2) % sortedPoints.length];

        const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
        const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
        
        const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
        const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;
        
        path += ` C${cp1x},${cp1y},${cp2x},${cp2y},${p2.x},${p2.y}`;
    }
    
    return path + ' Z';
};

// --- Tooltip Component ---
const Tooltip = ({ 
    location, 
    position, 
    imageCache, 
    onImageGenerated,
    gameSettings
}: { 
    location: Location | null; 
    position: { top: number; left: number };
    imageCache: Record<string, ImageCacheEntry>;
    onImageGenerated: (prompt: string, src: string, sourceProvider: ImageCacheEntry['sourceProvider'], sourceModel?: string) => void;
    gameSettings: GameSettings | null;
}) => {
    const { t } = useLocalization();
    if (!location) return null;
    
    const profile = (location as any).externalDifficultyProfile || (location as any).estimatedExternalDifficultyProfile;

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
                    <ImageRenderer prompt={imagePrompt} alt={location.name} imageCache={imageCache} onImageGenerated={onImageGenerated} width={1024} height={1024} gameSettings={gameSettings} />
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
            {location.factionControl && location.factionControl.length > 0 && (
                <div className="mt-2 pt-2 border-t border-t-amber-800/20">
                    <h5 className="font-bold text-sm text-amber-900">{t('Faction Control')}</h5>
                    <div className="space-y-2 mt-1">
                        {location.factionControl.map(fc => (
                            <div key={fc.factionId || fc.factionName} className="text-xs">
                                <div className="flex justify-between items-center text-amber-900/90 mb-0.5">
                                    <span className="font-semibold">{fc.factionName} ({t(fc.controlType as any)})</span>
                                    <span className="font-mono">{fc.controlLevel}%</span>
                                </div>
                                <div className="w-full bg-amber-800/20 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-amber-700 h-full rounded-full" style={{ width: `${fc.controlLevel}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
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
  currentLocation: Location;
  onOpenModal: (title: string, data: any) => void;
  imageCache: Record<string, ImageCacheEntry>;
  onImageGenerated: (prompt: string, src: string, sourceProvider: ImageCacheEntry['sourceProvider'], sourceModel?: string) => void;
  isFullScreen?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  gameSettings: GameSettings | null;
  encounteredFactions: Faction[];
}

export default function LocationViewer({ visitedLocations, currentLocation, onOpenModal, imageCache, onImageGenerated, isFullScreen, onExpand, onCollapse, gameSettings, encounteredFactions }: LocationViewerProps): React.ReactNode {
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
    const [isStrategicView, setIsStrategicView] = useState(false);

    // State to trigger recentering effect
    const [recenterRequest, setRecenterRequest] = useState(0);

    const { mapDimensions, locations, connections } = useMemo(() => {
        const allLocations = new Map<string, Location & { isVisited: boolean }>();

        visitedLocations.forEach(loc => {
            if (loc.coordinates) {
                const key = `${loc.coordinates.x},${loc.coordinates.y}`;
                allLocations.set(key, { ...loc, isVisited: true });
            }
        });

        if (currentLocation && currentLocation.coordinates) {
            const key = `${currentLocation.coordinates.x},${currentLocation.coordinates.y}`;
            allLocations.set(key, { ...(currentLocation as Location), isVisited: true });
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
                            internalDifficultyProfile: link.estimatedInternalDifficultyProfile || { combat: 0, environment: 0, social: 0, exploration: 0 },
                            externalDifficultyProfile: link.estimatedExternalDifficultyProfile || { combat: 0, environment: 0, social: 0, exploration: 0 },
                            coordinates: link.targetCoordinates,
                            isVisited: false,
                            locationId: `undiscovered-${key}`, 
                            lastEventsDescription: '',
                            locationType: 'outdoor', 
                            biome: 'Plains', // A safe default for an unknown outdoor location
                            image_prompt: `A detailed fantasy art image of a mysterious location known as ${link.name}. ${link.shortDescription}`,
                        } as any;
                        allLocations.set(key, unvisitedLoc);
                    }
                });
            }
        });
        
        const locationsWithCoords = Array.from(allLocations.values()).filter(l => l.coordinates);
        if (locationsWithCoords.length === 0) {
            return { mapDimensions: { width: 600, height: 500 }, locations: [], connections: [] };
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
        
        const calculatedWidth = totalWidthInUnits * 100;
        const calculatedHeight = totalHeightInUnits * 100;
        
        const MIN_CSS_WIDTH = 600;
        const MIN_CSS_HEIGHT = 500;
        
        const finalMapWidth = Math.max(calculatedWidth, MIN_CSS_WIDTH);
        const finalMapHeight = Math.max(calculatedHeight, MIN_CSS_HEIGHT);
        
        const effectiveTotalWidthUnits = finalMapWidth / 100;
        const effectiveTotalHeightUnits = finalMapHeight / 100;
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
        };
    }, [visitedLocations, currentLocation]);

    const factionTerritories = useMemo(() => {
        if (!isStrategicView || encounteredFactions.length === 0 || locations.length === 0) {
            return [];
        }

        const factionPoints = new Map<string, { color: string; points: { x: number; y: number }[] }>();

        // Initialize map with all factions
        encounteredFactions.forEach(faction => {
            factionPoints.set(faction.factionId, { color: faction.color || '#cccccc', points: [] });
        });

        // Group locations by dominant faction
        locations.forEach(loc => {
            if (loc.factionControl && loc.factionControl.length > 0) {
                const dominantControl = loc.factionControl.reduce((max, fc) => fc.controlLevel > max.controlLevel ? fc : max);
                if (dominantControl.controlLevel > 20) { // Threshold for showing control
                    const factionId = dominantControl.factionId;
                    if (factionPoints.has(factionId)) {
                        factionPoints.get(factionId)!.points.push({ x: (loc.x / 100) * mapDimensions.width, y: (loc.y / 100) * mapDimensions.height });
                    }
                }
            }
        });

        // Generate paths for factions with controlled points
        const territories = [];
        for (const [factionId, data] of factionPoints.entries()) {
            if (data.points.length > 0) {
                territories.push({
                    factionId,
                    factionColor: data.color,
                    pathData: generateBlobPath(data.points)
                });
            }
        }

        return territories;
    }, [isStrategicView, encounteredFactions, locations, mapDimensions]);

    const territoryDefs = useMemo(() => {
        if (!isStrategicView) return null;
        const uniqueColors = [...new Set(encounteredFactions.map(f => f.color).filter(Boolean))];
        return (
            <defs>
                {uniqueColors.map(color => (
                    <pattern 
                        key={`hatch-${color}`}
                        id={`hatch-${color?.replace('#', '')}`} 
                        patternUnits="userSpaceOnUse" 
                        width="8" 
                        height="8"
                    >
                        <path 
                            d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" 
                            stroke={darkenColor(color!, 30)} 
                            strokeWidth="1"
                        />
                    </pattern>
                ))}
            </defs>
        );
    }, [isStrategicView, encounteredFactions]);

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
        if (recenterRequest === 0) return;

        if (viewportRef.current?.clientWidth) {
            const playerLoc = locations.find(loc => loc.locationId === currentLocation.locationId);
            if (!playerLoc || typeof playerLoc.x !== 'number' || typeof playerLoc.y !== 'number') return;

            const { width: mapWidth, height: mapHeight } = mapDimensions;
            const { clientWidth: viewportWidth, clientHeight: viewportHeight } = viewportRef.current;

            if (viewportWidth === 0 || viewportHeight === 0) return;

            const targetXPixel = (playerLoc.x / 100) * mapWidth;
            const targetYPixel = (playerLoc.y / 100) * mapHeight;
            
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

    const factionMap = useMemo(() => new Map(encounteredFactions.map(f => [f.factionId || f.name, f])), [encounteredFactions]);

    return (
        <div 
            ref={viewportRef}
            className="map-viewport" 
            onMouseDown={onMouseDown} 
            onWheel={onWheel}
            onMouseMove={handleMouseMoveTooltip}
        >
            <CompassRose />
            <div 
                className="map-transform-wrapper"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            >
                <div 
                    className="map-canvas"
                    style={{ width: `${mapDimensions.width}px`, height: `${mapDimensions.height}px` }}
                >
                    <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, opacity: isStrategicView ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}>
                        {territoryDefs}
                        {factionTerritories.map(t => (
                            <g key={t.factionId}>
                                <path
                                    d={t.pathData}
                                    className="territory-blob"
                                    style={{
                                        fill: `url(#hatch-${t.factionColor.replace('#', '')})`
                                    }}
                                />
                                <path
                                    d={t.pathData}
                                    className="territory-border"
                                    style={{
                                        stroke: t.factionColor
                                    }}
                                />
                            </g>
                        ))}
                    </svg>
                    <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                        {connections.map(c => (
                            <line 
                                key={c.key} 
                                x1={`${c.x1}%`} y1={`${c.y1}%`} 
                                x2={`${c.x2}%`} y2={`${c.y2}%`} 
                                className={c.isDiscovered ? 'map-line' : 'map-line--undiscovered'}
                            />
                        ))}
                    </svg>
                    {locations.map(loc => {
                        const { Icon, color } = getLocationIconAndStyle(loc);
                        const isPlayerLocation = loc.locationId === currentLocation.locationId;
                        const isUndiscovered = !loc.isVisited;
                        
                        const dominantControl = loc.factionControl && loc.factionControl.length > 0
                            ? loc.factionControl.reduce((max, fc) => fc.controlLevel > max.controlLevel ? fc : max, loc.factionControl[0])
                            : null;
                        
                        const isControlled = dominantControl && dominantControl.controlLevel > 50;
                        const controllingFaction = isControlled ? factionMap.get(dominantControl.factionId || dominantControl.factionName) : null;
                        const factionColor = controllingFaction?.color;

                        const locationClasses = [
                            'map-location',
                            isPlayerLocation ? 'map-location--player' : '',
                            isUndiscovered ? 'map-location--undiscovered' : '',
                            isControlled ? 'map-location--controlled' : ''
                        ].filter(Boolean).join(' ');
                        
                        const locationStyle = isControlled && factionColor ? { '--faction-color': factionColor } as React.CSSProperties : {};

                        return (
                            <div 
                                key={loc.locationId}
                                className={locationClasses}
                                style={{ ...locationStyle, left: `${loc.x}%`, top: `${loc.y}%` }}
                                onMouseEnter={(e) => handleMouseEnter(loc, e)}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => { if (!isUndiscovered) onOpenModal(t("Location: {name}", { name: loc.name }), { ...loc, type: 'location' }); }}
                            >
                                <Icon className={`w-6 h-6 map-location-icon ${color}`} />
                                <div className={`map-location-label ${showAllLabels ? '' : 'map-location-label--hidden'}`}>
                                    {loc.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="map-controls">
                <button onClick={(e) => { e.stopPropagation(); handleZoom(0.2); }} className="map-control-button">+</button>
                <button onClick={(e) => { e.stopPropagation(); handleZoom(-0.2); }} className="map-control-button">-</button>
                <button onClick={(e) => { e.stopPropagation(); handleReset(); }} className="map-control-button" title={t('Reset View')}>
                    <ArrowPathIcon className="w-4 h-4"/>
                </button>
                <button onClick={(e) => { e.stopPropagation(); setRecenterRequest(c => c + 1); }} className="map-control-button" title={t('Center on Player')}>
                    <UserGroupIcon className="w-4 h-4" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowAllLabels(prev => !prev); }} 
                    className={`map-control-button ${showAllLabels ? 'map-control-button--active' : ''}`}
                    title={t('Toggle Labels')}
                >
                    A
                </button>
                {!isFullScreen && onExpand && (
                    <button onClick={(e) => { e.stopPropagation(); onExpand(); }} className="map-control-button" title={t('Expand Map')}>
                        <ArrowsPointingOutIcon className="w-4 h-4"/>
                    </button>
                )}
                 {isFullScreen && onCollapse && (
                    <button onClick={(e) => { e.stopPropagation(); onCollapse(); }} className="map-control-button" title={t('Collapse Map')}>
                        <ArrowsPointingInIcon className="w-4 h-4"/>
                    </button>
                )}
            </div>
             <div className="map-strategic-controls">
                <button
                    onClick={(e) => { e.stopPropagation(); setIsStrategicView(prev => !prev); }}
                    className={`map-strategic-button ${isStrategicView ? 'map-strategic-button--active' : ''}`}
                    title={t('Strategic View')}
                >
                    <FlagIcon className="w-4 h-4" />
                </button>
            </div>
            
            <Tooltip 
                location={hoveredLocation} 
                position={tooltipPosition} 
                imageCache={imageCache} 
                onImageGenerated={onImageGenerated}
                gameSettings={gameSettings}
            />
        </div>
    );
}