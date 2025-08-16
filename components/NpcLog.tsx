

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { NPC, Faction, GameState } from '../types';
import { UserGroupIcon, UserIcon, UserPlusIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { CheckIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { useLocalization } from '../context/LocalizationContext';
import ImageRenderer from './ImageRenderer';

interface NpcLogProps {
  gameState: GameState | null;
  npcs: NPC[];
  encounteredFactions: Faction[];
  onOpenModal: (title: string, data: any) => void;
  imageCache: Record<string, string>;
  onImageGenerated: (prompt: string, base64: string) => void;
  updateNpcSortOrder: (newOrder: string[]) => void;
}

const NpcItem: React.FC<{ 
    npc: NPC, 
    faction: Faction | undefined, 
    factionName: string | undefined, 
    onOpenModal: (title: string, data: any) => void, 
    imageCache: Record<string, string>, 
    onImageGenerated: (prompt: string, base64: string) => void,
    isSorting: boolean
}> = ({ npc, faction, factionName, onOpenModal, imageCache, onImageGenerated, isSorting }) => {
    const { t } = useLocalization();
    const primaryAffiliation = npc.factionAffiliations?.[0];
    const displayFactionName = faction ? faction.name : (factionName || t('Unknown Faction'));
    const imagePrompt = npc.custom_image_prompt || npc.image_prompt;
    
    const getRelationshipTooltip = (level: number) => {
        if (level <= 49) return t('relationship_level_hostility');
        if (level === 50) return t('relationship_level_neutrality');
        if (level <= 100) return t('relationship_level_friendship');
        if (level <= 150) return t('relationship_level_deep_bond');
        return t('relationship_level_devotion');
    };

    return (
        <button
            onClick={() => onOpenModal(t("NPC: {name}", { name: npc.name }), npc)}
            className="w-full text-left bg-gray-900/40 p-3 rounded-lg border border-gray-700/50 shadow-md transition-all hover:ring-1 hover:ring-cyan-500/50 hover:border-cyan-500/50 flex items-start gap-4"
        >
            {isSorting && (
                <div className="text-gray-500 cursor-grab active:cursor-grabbing">
                    <Bars3Icon className="w-5 h-5" />
                </div>
            )}
            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-800 flex items-center justify-center">
                {imagePrompt ? (
                    <ImageRenderer prompt={imagePrompt} alt={npc.name} className="w-full h-full object-cover" imageCache={imageCache} onImageGenerated={onImageGenerated} />
                ) : (
                    <UserIcon className="w-8 h-8 text-cyan-400" />
                )}
            </div>
            <div className="flex-1">
                <p className="font-semibold text-gray-200">{npc.name}</p>
                <p className="text-sm text-gray-400">{t(npc.race as any)} {t(npc.class as any)}</p>
                {npc.relationshipLevel !== undefined ? (
                    <div title={getRelationshipTooltip(npc.relationshipLevel)}>
                        <p className={`text-xs mt-1 font-semibold ${attitudeColorMap[npc.attitude || ''] || 'text-gray-400'}`}>
                            {t('Relationship')}: {npc.relationshipLevel} {npc.attitude ? `(${t(npc.attitude as any)})` : ''}
                        </p>
                    </div>
                ) : npc.attitude && (
                    <p className={`text-xs mt-1 font-semibold ${attitudeColorMap[npc.attitude] || 'text-gray-400'}`}>{t('Attitude')}: {t(npc.attitude as any)}</p>
                )}
                {primaryAffiliation && (
                    <div className="text-xs text-yellow-300/70 mt-1 flex items-center gap-1.5">
                        <UserPlusIcon className="w-3 h-3" />
                        <span>{displayFactionName} ({primaryAffiliation.rank})</span>
                    </div>
                )}
            </div>
        </button>
    );
};

const attitudeColorMap: Record<string, string> = {
    'Hateful': 'text-red-500',
    'Hostile': 'text-red-400',
    'Neutral': 'text-gray-400',
    'Friendly': 'text-green-400',
    'Loyal': 'text-cyan-400',
    'Devoted': 'text-yellow-400',
};


export default function NpcLog({ gameState, npcs, encounteredFactions, onOpenModal, imageCache, onImageGenerated, updateNpcSortOrder }: NpcLogProps): React.ReactNode {
  const { t } = useLocalization();
  const factionMapById = new Map((encounteredFactions || []).filter(f => f.factionId).map(f => [f.factionId, f]));
  const factionMapByName = new Map((encounteredFactions || []).map(f => [f.name.toLowerCase(), f]));
  
  const [isSorting, setIsSorting] = useState(false);
  const [localNpcs, setLocalNpcs] = useState<NPC[]>([]);
  const dragItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);

  useEffect(() => {
    const sortOrder = gameState?.npcSortOrder || [];
    const sorted = [...npcs].sort((a, b) => {
        if (!a.NPCId || !b.NPCId) return 0;
        const aIndex = sortOrder.indexOf(a.NPCId);
        const bIndex = sortOrder.indexOf(b.NPCId);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });
    setLocalNpcs(sorted);
  }, [npcs, gameState?.npcSortOrder]);

  const handleSort = () => {
    if (dragItemIndex.current === null || dragOverItemIndex.current === null) return;
    let _localNpcs = [...localNpcs];
    const draggedItemContent = _localNpcs.splice(dragItemIndex.current, 1)[0];
    _localNpcs.splice(dragOverItemIndex.current, 0, draggedItemContent);
    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
    setLocalNpcs(_localNpcs);
  };

  const handleSortToggle = () => {
    if (isSorting) {
        const newOrder = localNpcs.map(npc => npc.NPCId).filter(Boolean) as string[];
        updateNpcSortOrder(newOrder);
    }
    setIsSorting(!isSorting);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-cyan-400 narrative-text">{t('Encountered NPCs')}</h3>
        <button
            onClick={handleSortToggle}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 rounded-md hover:bg-cyan-500/20 transition-colors"
        >
            {isSorting ? <CheckIcon className="w-4 h-4" /> : <ArrowsUpDownIcon className="w-4 h-4" />}
            {isSorting ? t('Done') : t('Sort')}
        </button>
      </div>
      {localNpcs && localNpcs.length > 0 ? (
        <div className="space-y-3">
          {localNpcs.map((npc, index) => {
            const primaryAffiliation = npc.factionAffiliations?.[0];
            let faction: Faction | undefined = undefined;
            if (primaryAffiliation) {
                if (primaryAffiliation.factionId) faction = factionMapById.get(primaryAffiliation.factionId);
                if (!faction && primaryAffiliation.factionName) faction = factionMapByName.get(primaryAffiliation.factionName.toLowerCase());
                if (!faction && primaryAffiliation.factionId) faction = factionMapByName.get(primaryAffiliation.factionId.toLowerCase());
            }
            return (
              <div
                key={npc.NPCId || npc.name}
                draggable={isSorting}
                onDragStart={() => (dragItemIndex.current = index)}
                onDragEnter={() => (dragOverItemIndex.current = index)}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                className={isSorting ? 'cursor-move' : ''}
              >
                <NpcItem 
                    npc={npc} 
                    faction={faction} 
                    factionName={primaryAffiliation?.factionName} 
                    onOpenModal={onOpenModal} 
                    imageCache={imageCache} 
                    onImageGenerated={onImageGenerated}
                    isSorting={isSorting}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 p-6 bg-gray-900/20 rounded-lg">
          <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
          {t('No NPCs encountered yet.')}
        </div>
      )}
    </div>
  );
}