
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GameState, Location, Item, Quest, NPC, ActiveSkill, PassiveSkill } from '../types';
import { MagnifyingGlassIcon, XMarkIcon, CubeIcon, BookOpenIcon, UserIcon, SparklesIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useLocalization } from '../context/LocalizationContext';

// Define result types
type SearchResultItem =
    | { type: 'Item'; data: Item }
    | { type: 'Quest'; data: Quest }
    | { type: 'NPC'; data: NPC }
    | { type: 'ActiveSkill'; data: ActiveSkill }
    | { type: 'PassiveSkill'; data: PassiveSkill }
    | { type: 'Location'; data: Location };

type SearchResults = {
    Items: SearchResultItem[];
    Quests: SearchResultItem[];
    NPCs: SearchResultItem[];
    Skills: SearchResultItem[];
    Locations: SearchResultItem[];
};

interface GlobalSearchProps {
    gameState: GameState | null;
    visitedLocations: Location[];
    onOpenDetailModal: (title: string, data: any) => void;
    isLoading: boolean;
}

const ResultIcon = ({ type }: { type: SearchResultItem['type'] }) => {
    const iconMap: Record<SearchResultItem['type'], React.ElementType> = {
        Item: CubeIcon,
        Quest: BookOpenIcon,
        NPC: UserIcon,
        ActiveSkill: SparklesIcon,
        PassiveSkill: SparklesIcon,
        Location: MapPinIcon,
    };
    const Icon = iconMap[type] || CubeIcon;
    return <Icon className="w-5 h-5 text-cyan-400" />;
};


export default function GlobalSearch({ gameState, visitedLocations, onOpenDetailModal, isLoading }: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const { t } = useLocalization();

    // Debounce logic
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 250); // 250ms debounce delay
        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchRef]);


    const searchResults = useMemo<SearchResults | null>(() => {
        if (!debouncedQuery || !gameState) return null;

        const q = debouncedQuery.toLowerCase();
        const results: SearchResults = {
            Items: [], Quests: [], NPCs: [], Skills: [], Locations: []
        };

        // Search Items
        gameState.playerCharacter.inventory.forEach(item => {
            if (item && item.name && (item.name.toLowerCase().includes(q) || item.existedId?.toLowerCase().includes(q))) {
                results.Items.push({ type: 'Item', data: item });
            }
        });

        // Search Quests
        [...gameState.activeQuests, ...gameState.completedQuests].forEach(quest => {
            if (quest && quest.questName && (quest.questName.toLowerCase().includes(q) || quest.questId?.toLowerCase().includes(q))) {
                results.Quests.push({ type: 'Quest', data: quest });
            }
        });

        // Search NPCs
        gameState.encounteredNPCs.forEach(npc => {
            if (npc && npc.name && (npc.name.toLowerCase().includes(q) || npc.NPCId?.toLowerCase().includes(q))) {
                results.NPCs.push({ type: 'NPC', data: npc });
            }
        });

        // Search Skills
        [...gameState.playerCharacter.activeSkills, ...gameState.playerCharacter.passiveSkills].forEach(skill => {
            if (skill && skill.skillName && skill.skillName.toLowerCase().includes(q)) {
                const type = 'energyCost' in skill ? 'ActiveSkill' : 'PassiveSkill';
                results.Skills.push({ type, data: skill } as SearchResultItem);
            }
        });
        
        // Search Locations
        visitedLocations.forEach(loc => {
            if (loc && loc.name && (loc.name.toLowerCase().includes(q) || loc.locationId?.toLowerCase().includes(q))) {
                results.Locations.push({ type: 'Location', data: loc });
            }
        });

        return results;
    }, [debouncedQuery, gameState, visitedLocations]);

    const handleResultClick = (result: SearchResultItem) => {
        let title = '';
        let data = result.data as any;
        switch (result.type) {
            case 'Item': title = t("Item: {name}", { name: result.data.name }); break;
            case 'Quest': title = t("Quest: {name}", { name: (result.data as Quest).questName }); break;
            case 'NPC': title = t("NPC: {name}", { name: result.data.name }); break;
            case 'ActiveSkill': title = t("Active Skill: {name}", { name: (result.data as ActiveSkill).skillName }); data = {...data, owner: 'player'}; break;
            case 'PassiveSkill': title = t("Passive Skill: {name}", { name: (result.data as PassiveSkill).skillName }); break;
            case 'Location': 
                title = t("Location: {name}", { name: result.data.name }); 
                data = { ...data, type: 'location' }; // Add type for DetailRenderer
                break;
        }
        onOpenDetailModal(title, data);
        setQuery('');
        setIsFocused(false);
    };

    const hasResults = searchResults && Object.values(searchResults).some(arr => arr.length > 0);
    const showResults = query && isFocused;

    return (
        <div className="relative mb-4" ref={searchRef}>
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                    type="text"
                    placeholder={t("Search by name or ID...")}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    disabled={isLoading}
                    className="w-full bg-gray-900/70 border border-gray-700 rounded-md py-2 pl-10 pr-8 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {query && (
                     <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white">
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                )}
            </div>

            {showResults && (
                <div className="absolute top-full mt-2 w-full bg-gray-800/95 border border-gray-700/80 rounded-lg shadow-2xl z-20 max-h-96 overflow-y-auto backdrop-blur-sm">
                    {searchResults && hasResults ? (
                        <div className="p-2">
                            {Object.entries(searchResults).map(([category, items]) => {
                                if (items.length === 0) return null;
                                return (
                                    <div key={category} className="mb-2 last:mb-0">
                                        <h4 className="text-xs font-bold uppercase text-gray-500 px-2 py-1">{t(category as any)}</h4>
                                        <ul className="space-y-1">
                                            {items.map((item, index) => (
                                                <li key={index}>
                                                    <button onClick={() => handleResultClick(item)} className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-cyan-500/10 transition-colors">
                                                        <ResultIcon type={item.type} />
                                                        <span className="text-gray-200">
                                                            { (item.data as any).name || (item.data as any).questName || (item.data as any).skillName }
                                                        </span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                         <div className="p-4 text-center text-gray-500">{t("No results found.")}</div>
                    )}
                </div>
            )}
        </div>
    );
}
