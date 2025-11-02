import React, { useState } from 'react';
import { PlayerCharacter } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import Modal from './Modal';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface CollectiveActionRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    players: PlayerCharacter[];
    myPlayerId: string;
    onSubmit: (participantIds: string[], prompt: string) => void;
}

const CollectiveActionRequestModal: React.FC<CollectiveActionRequestModalProps> = ({
    isOpen,
    onClose,
    players,
    myPlayerId,
    onSubmit
}) => {
    const { t } = useLocalization();
    const [selectedPlayers, setSelectedPlayers] = useState<Record<string, boolean>>({});
    const [prompt, setPrompt] = useState('');

    const handleTogglePlayer = (playerId: string) => {
        setSelectedPlayers(prev => ({
            ...prev,
            [playerId]: !prev[playerId]
        }));
    };

    const handleSubmit = () => {
        const otherParticipantIds = Object.keys(selectedPlayers).filter(id => selectedPlayers[id]);
        const allParticipantIds = [myPlayerId, ...otherParticipantIds];

        if (allParticipantIds.length > 0 && prompt.trim()) {
            onSubmit(allParticipantIds, prompt);
            onClose();
        } else {
            alert(t('Please select at least one player and write a prompt.'));
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('Request Collective Action')}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('Select Participants')}</label>
                    <div className="space-y-2 p-3 bg-gray-900/40 rounded-md max-h-48 overflow-y-auto">
                        {players.map(player => {
                            const isMe = player.playerId === myPlayerId;
                            return (
                                <div key={player.playerId} className={`flex items-center p-2 rounded-md ${isMe ? 'bg-gray-700/50' : ''}`}>
                                    <input
                                        id={`player-${player.playerId}`}
                                        type="checkbox"
                                        checked={isMe || !!selectedPlayers[player.playerId]}
                                        onChange={() => !isMe && handleTogglePlayer(player.playerId)}
                                        disabled={isMe}
                                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-cyan-600 focus:ring-cyan-500 disabled:opacity-50"
                                    />
                                    <label htmlFor={`player-${player.playerId}`} className="ml-3 text-sm text-gray-200">
                                        {player.name} {isMe && <span className="text-xs text-cyan-400">({t('You, Initiator')})</span>}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <label htmlFor="collective-action-prompt" className="block text-sm font-medium text-gray-300 mb-2">{t('Prompt for Players')}</label>
                    <textarea
                        id="collective-action-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('e.g., "The guard is distracted. What do you all do?"')}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[100px]"
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition flex items-center gap-2">
                        <XMarkIcon className="w-5 h-5" />
                        {t('Cancel')}
                    </button>
                    <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition flex items-center gap-2">
                        <CheckIcon className="w-5 h-5" />
                        {t('Send Request')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CollectiveActionRequestModal;