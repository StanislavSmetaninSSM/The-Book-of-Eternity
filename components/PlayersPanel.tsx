
import React, { useState, useMemo } from 'react';
// FIX: Changed import from 'Peer' to 'PeerInfo' to match the renamed interface in types.ts, resolving a name collision.
import { PlayerCharacter, GameSettings, PeerInfo, NetworkRole, NPC } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { UserIcon, PlusCircleIcon, DocumentDuplicateIcon, ArrowRightOnRectangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import PlayerCreationModal from './PlayerCreationModal';
import { gameData } from '../utils/localizationGameData';
import ConfirmationModal from './ConfirmationModal';
import ImageRenderer from './ImageRenderer';

interface PlayersPanelProps {
    playerCharacter: PlayerCharacter;
    players: PlayerCharacter[];
    gameSettings: GameSettings | null;
    onAddPlayer: (creationData: any) => void;
    onViewCharacterSheet: (character: PlayerCharacter | NPC) => void;
    removePlayer: (playerId: string) => void;
    passTurnToPlayer: (playerIndex: number) => void;
    allowHistoryManipulation: boolean;
    assignCharacterToPeer: (characterId: string, newPeerId: string | null) => void;
// FIX: Changed type from 'Peer[]' to 'PeerInfo[]' to match the renamed interface in types.ts.
    peers: PeerInfo[];
    networkRole: NetworkRole;
    imageCache: Record<string, string>;
    onImageGenerated: (prompt: string, base64: string) => void;
    // FIX: Added missing updatePlayerPortrait prop to fix type error.
    updatePlayerPortrait: (playerId: string, portraitData: { prompt?: string | null; custom?: string | null; }) => void;
}

const PlayersPanel: React.FC<PlayersPanelProps> = ({ playerCharacter, players, gameSettings, onAddPlayer, onViewCharacterSheet, removePlayer, passTurnToPlayer, allowHistoryManipulation, assignCharacterToPeer, peers, networkRole, imageCache, onImageGenerated, updatePlayerPortrait }) => {
    const { t } = useLocalization();
    const [isCreating, setIsCreating] = useState(false);
    const [templatePlayer, setTemplatePlayer] = useState<PlayerCharacter | null>(null);
    const [playerToDelete, setPlayerToDelete] = useState<PlayerCharacter | null>(null);
    const universe = gameSettings?.gameWorldInformation?.baseInfo?.universe || 'fantasy';

    const handleCreateNew = () => {
        setTemplatePlayer(null);
        setIsCreating(true);
    };

    const handleCreateBasedOn = (player: PlayerCharacter) => {
        setTemplatePlayer(player);
        setIsCreating(true);
    };

    const handleSubmitCreation = (creationData: any) => {
        onAddPlayer(creationData);
        setIsCreating(false);
    };

    const handleDeleteConfirm = () => {
        if (playerToDelete && playerToDelete.playerId) {
            removePlayer(playerToDelete.playerId);
        }
        setPlayerToDelete(null);
    };
    
    const currentWorldData = useMemo(() => {
        const universeKey = gameSettings?.gameWorldInformation?.baseInfo?.universe as keyof typeof gameData;
        if (universeKey === 'history' || universeKey === 'myths') {
            const eraKey = gameSettings?.gameWorldInformation?.baseInfo?.selectedEra as any;
            return gameData[universeKey][eraKey] || gameData.fantasy;
        }
        return gameData[universeKey] || gameData.fantasy;
    }, [gameSettings]);

    return (
        <>
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text">{t('Characters')}</h3>
                <div className="space-y-3">
                    {(players || []).map((player, index) => {
                        const isActive = player.playerId === playerCharacter.playerId;
                        return (
                            <div key={player.playerId} className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/50 shadow-md group">
                                <button
                                    onClick={() => onViewCharacterSheet(player)}
                                    title={t('view_character_sheet')}
                                    className="w-full text-left flex items-center gap-4 hover:bg-gray-800/50 -m-3 p-3 rounded-t-lg transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 border-2 border-gray-600">
                                        {player.portrait ? (
// FIX: Pass 'gameSettings' prop to ImageRenderer
                                            <ImageRenderer
                                                prompt={player.portrait}
                                                alt={player.name}
                                                imageCache={imageCache}
                                                onImageGenerated={onImageGenerated}
                                                className="w-full h-full object-cover"
                                                gameSettings={gameSettings}
                                            />
                                        ) : (
                                            <UserIcon className="w-full h-full text-cyan-400/80 p-2" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-200">{player.name}</p>
                                        <p className="text-sm text-gray-400">{t('Level {level} {charClass}', { level: player.level, charClass: t(player.class as any) })}</p>
                                    </div>
                                </button>
                                <div className="mt-2 pt-2 border-t border-gray-700/50 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => passTurnToPlayer(index)}
                                        disabled={isActive}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-green-600/20 text-green-300 hover:bg-green-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                        {t("Pass Turn to Player")}
                                    </button>
                                    {allowHistoryManipulation && players.length > 1 && player.playerId !== playerCharacter.playerId && (
                                        <button
                                            onClick={() => setPlayerToDelete(player)}
                                            className="flex-shrink-0 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-red-600/20 text-red-300 hover:bg-red-600/40"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                            {t("Delete Character")}
                                        </button>
                                    )}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-700/50">
                                    <button
                                        onClick={() => handleCreateBasedOn(player)}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 rounded-md hover:bg-cyan-500/20 transition-colors"
                                    >
                                        <DocumentDuplicateIcon className="w-4 h-4" />
                                        {t("Create based on {name}", { name: player.name })}
                                    </button>
                                </div>
                                {networkRole === 'host' && (
                                    <div className="mt-2 pt-2 border-t border-gray-700/50">
                                        <label htmlFor={`assign-${player.name}-${index}`} className="text-xs text-gray-400">{t('Assign to Player')}</label>
                                        <select
                                            id={`assign-${player.name}-${index}`}
                                            value={peers.some(p => p.id === player.playerId) ? player.playerId : 'unassigned'}
                                            onChange={(e) => {
                                                const newPeerId = e.target.value === 'unassigned' ? null : e.target.value;
                                                assignCharacterToPeer(player.playerId, newPeerId);
                                            }}
                                            className="w-full mt-1 bg-gray-700/50 border border-gray-600 rounded-md py-1 px-2 text-xs text-gray-200"
                                        >
                                            <option value="unassigned">{t('Unassigned')}</option>
                                            {peers.map(peer => (
                                                <option key={peer.id} value={peer.id}>{peer.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleCreateNew}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold text-green-300 bg-green-600/20 rounded-lg hover:bg-green-600/30 transition-colors border border-green-600/50"
                    >
                        <PlusCircleIcon className="w-6 h-6" />
                        {t('Create New Player')}
                    </button>
                </div>
            </div>

            {isCreating && gameSettings && (
                <PlayerCreationModal
                    isOpen={isCreating}
                    onClose={() => setIsCreating(false)}
                    onSubmit={handleSubmitCreation}
                    templatePlayer={templatePlayer}
                    universe={universe}
                    currentWorldData={currentWorldData}
                    gameSettings={gameSettings}
                    partyLevel={playerCharacter.level}
                    shareCharacteristics={gameSettings.multiplePersonalitiesSettings?.shareCharacteristics ?? false}
                />
            )}

            <ConfirmationModal
                isOpen={!!playerToDelete}
                onClose={() => setPlayerToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title={t('Delete Character')}
            >
                <p>{t("Are you sure you want to remove {name} from the party? This cannot be undone.", { name: playerToDelete?.name })}</p>
            </ConfirmationModal>
        </>
    );
};

export default PlayersPanel;
