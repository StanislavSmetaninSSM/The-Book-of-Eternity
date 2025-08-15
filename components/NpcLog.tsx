

import React from 'react';
import { NPC, Faction } from '../types';
import { UserGroupIcon, UserIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useLocalization } from '../context/LocalizationContext';
import ImageRenderer from './ImageRenderer';

interface NpcLogProps {
  npcs: NPC[];
  encounteredFactions: Faction[];
  onOpenModal: (title: string, data: any) => void;
  imageCache: Record<string, string>;
  onImageGenerated: (prompt: string, base64: string) => void;
}

const attitudeColorMap: Record<string, string> = {
    'Hateful': 'text-red-500',
    'Hostile': 'text-red-400',
    'Neutral': 'text-gray-400',
    'Friendly': 'text-green-400',
    'Loyal': 'text-cyan-400',
    'Devoted': 'text-yellow-400',
};

const NpcItem: React.FC<{ npc: NPC, faction: Faction | undefined, factionName: string | undefined, onOpenModal: (title: string, data: any) => void, imageCache: Record<string, string>, onImageGenerated: (prompt: string, base64: string) => void }> = ({ npc, faction, factionName, onOpenModal, imageCache, onImageGenerated }) => {
    const { t } = useLocalization();
    const primaryAffiliation = npc.factionAffiliations?.[0];
    const displayFactionName = faction ? faction.name : (factionName || t('Unknown Faction'));
    
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
            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-800 flex items-center justify-center">
                {npc.image_prompt ? (
                    <ImageRenderer prompt={npc.image_prompt} alt={npc.name} className="w-full h-full object-cover" imageCache={imageCache} onImageGenerated={onImageGenerated} />
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

export default function NpcLog({ npcs, encounteredFactions, onOpenModal, imageCache, onImageGenerated }: NpcLogProps): React.ReactNode {
  const { t } = useLocalization();
  const factionMapById = new Map((encounteredFactions || []).filter(f => f.factionId).map(f => [f.factionId, f]));
  const factionMapByName = new Map((encounteredFactions || []).map(f => [f.name.toLowerCase(), f]));
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text">{t('Encountered NPCs')}</h3>
      {npcs && npcs.length > 0 ? (
        <div className="space-y-3">
          {npcs.map((npc) => {
            const primaryAffiliation = npc.factionAffiliations?.[0];
            let faction: Faction | undefined = undefined;
            if (primaryAffiliation) {
                // First, try to find by ID
                if (primaryAffiliation.factionId) {
                    faction = factionMapById.get(primaryAffiliation.factionId);
                }
                // If not found by ID, try by name (case-insensitive)
                if (!faction && primaryAffiliation.factionName) {
                    faction = factionMapByName.get(primaryAffiliation.factionName.toLowerCase());
                }
                // Fallback for when ID contains the name
                if (!faction && primaryAffiliation.factionId) {
                    faction = factionMapByName.get(primaryAffiliation.factionId.toLowerCase());
                }
            }
            return (
              <NpcItem key={npc.NPCId || npc.name} npc={npc} faction={faction} factionName={primaryAffiliation?.factionName} onOpenModal={onOpenModal} imageCache={imageCache} onImageGenerated={onImageGenerated} />
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
