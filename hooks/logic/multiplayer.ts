
import { GameState, SaveFile, NetworkMessage, NetworkRole, PeerInfo, PlayerCharacter, GameSettings, ChatMessage, CollectiveActionState, SimultaneousActionState, NetworkChatMessage } from '../../types';
import Peer, { DataConnection } from 'peerjs';
import { createNewPlayerCharacter } from '../../utils/characterManager';

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

interface MultiplayerManagerProps {
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
    setGameHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    t: TFunction;
    initializeAndRunFirstTurn: (creationData: any, networkConfig?: { role: NetworkRole; peerId?: string }) => void;
    restoreFromSaveData: (data: SaveFile, isNetworkSync?: boolean) => void;
    packageSaveData: (gameState: GameState | null) => SaveFile | null;
    broadcastFullSync: (saveData: SaveFile) => void;
    addPlayer: (creationData: any) => void;
    removePlayer: (playerId: string) => void;
    passTurnToPlayer: (playerIndex: number) => void;
    gameContextRef: React.MutableRefObject<any>;
    peerRef: React.MutableRefObject<Peer | null>;
    connectionsRef: React.MutableRefObject<Map<string, DataConnection>>;
    hostConnectionRef: React.MutableRefObject<DataConnection | null>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    syncNewPeerRef: React.MutableRefObject<(conn: DataConnection) => void>;
    sendMessageRef: React.MutableRefObject<(message: string, image?: { data: string; mimeType: string; } | null) => void>;
    gameStateRef: React.RefObject<GameState | null>;
    onChatMessage: (message: NetworkChatMessage) => void;
}


export const createMultiplayerManager = (
    {
        setGameState,
        setGameHistory,
        setError,
        t,
        initializeAndRunFirstTurn,
        restoreFromSaveData,
        packageSaveData,
        broadcastFullSync,
        addPlayer,
        removePlayer,
        passTurnToPlayer,
        gameContextRef,
        peerRef,
        connectionsRef,
        hostConnectionRef,
        setIsLoading,
        syncNewPeerRef,
        sendMessageRef,
        gameStateRef,
        onChatMessage
    }: MultiplayerManagerProps
) => {

    const requestSyncFromHost = () => {
        const currentGameState = gameStateRef.current;
        if (!currentGameState || currentGameState.networkRole !== 'player' || !hostConnectionRef.current) {
            return;
        }
        const message: NetworkMessage = {
            type: 'request_full_sync',
            payload: {},
            senderId: currentGameState.myPeerId!,
        };
        hostConnectionRef.current.send(message);
        const systemMessage: ChatMessage = { sender: 'system', content: t('requesting_sync_from_host') };
        setGameHistory(prev => [...prev, systemMessage]);
    };

    const startHost = (creationData: any) => {
        setIsLoading(true);
        setError(null);
        if (peerRef.current) {
            peerRef.current.destroy();
        }
        const peer = new Peer();
        peerRef.current = peer;

        (peer as any).on('open', (id: string) => {
            console.log('PeerJS Host open. ID:', id);
            initializeAndRunFirstTurn(creationData, { role: 'host', peerId: id });
            const hostMessage: ChatMessage = { sender: 'system', content: t('hosting_started_message', { hostId: id }) };
            setGameHistory(prev => [...prev, hostMessage]);
        });

        (peer as any).on('connection', (conn: DataConnection) => {
            console.log(`Incoming connection from ${conn.peer}`);

            (conn as any).on('open', () => {
                connectionsRef.current.set(conn.peer, conn);
                syncNewPeerRef.current(conn);
            });

            (conn as any).on('data', (data: any) => {
                const message = data as NetworkMessage;
                console.log(`Data from ${conn.peer}:`, message.type);
                switch (message.type) {
                    case 'turn_result_from_player': {
                        if (!message.payload.saveFile) {
                            console.error("Received turn_result_from_player without saveFile payload.");
                            return;
                        }
                        const currentGameState = gameStateRef.current;
                        if (currentGameState && currentGameState.players[currentGameState.activePlayerIndex]?.playerId === message.senderId) {
                            console.log(`✅ HOST: Received and applying turn result from player ${message.senderId}`);
                            // The host MUST update its own state with the result from the active player.
                            restoreFromSaveData(message.payload.saveFile, true);
                            
                            // After updating its own state, it broadcasts the new canonical state to all clients.
                            const updatedSaveData = packageSaveData(gameStateRef.current);
                            if (updatedSaveData) {
                                console.log(`📡 HOST: Broadcasting updated state to all clients after player turn.`);
                                broadcastFullSync(updatedSaveData);
                            } else {
                                console.error("Host failed to package save data after applying player turn.");
                            }
                        } else {
                            const activePlayerInfo = currentGameState ? `Expected turn from: ${currentGameState.players[currentGameState.activePlayerIndex]?.playerId}` : "No game state.";
                            console.warn(`Turn result from non-active player ${message.senderId}. Ignoring. ${activePlayerInfo}`);
                        }
                        break;
                    }
                    case 'new_player_character_data': {
                        addPlayer(message.payload.playerCharacter);
                        break;
                    }
                    case 'request_full_sync': {
                        console.log(`Received sync request from ${conn.peer}. Broadcasting full state.`);
                        const saveData = packageSaveData(gameStateRef.current);
                        if (saveData) {
                            broadcastFullSync(saveData);
                            const systemMessage: ChatMessage = { sender: 'system', content: t('sync_requested_by_player', { name: conn.metadata.playerName }) };
                            setGameHistory(prev => [...prev, systemMessage]);
                        }
                        break;
                    }
                    case 'chat_message': {
                        onChatMessage(message.payload); // Add to host's history
                        // Broadcast to all clients
                        connectionsRef.current.forEach(c => {
                            c.send(message);
                        });
                        break;
                    }
                    case 'request_collective_action': {
                        const { participantIds, prompt, initiatorId, initiatorName } = message.payload;
                        setGameState(prevState => {
                            if (!prevState) return null;
                            const newCollectiveState: CollectiveActionState = {
                                isActive: true,
                                initiatorId: initiatorId,
                                initiatorName: initiatorName,
                                prompt: prompt,
                                participantIds: participantIds,
                                actions: {}
                            };
                            return { ...prevState, collectiveActionState: newCollectiveState };
                        });
                        break;
                    }
                    case 'submit_collective_action': {
                        const { action } = message.payload;
                        const senderId = message.senderId!;
                        setGameState(prevState => {
                            if (!prevState || !prevState.collectiveActionState?.isActive) return prevState;
                            const newActions = { ...prevState.collectiveActionState.actions, [senderId]: action };
                            const newCollectiveState = { ...prevState.collectiveActionState, actions: newActions };
                            return { ...prevState, collectiveActionState: newCollectiveState };
                        });
                        break;
                    }
                    case 'request_simultaneous_action': {
                        setGameState(prevState => {
                            if (!prevState) return null;
                            const newSimultaneousState: SimultaneousActionState = {
                                isActive: true,
                                actions: {}
                            };
                            return { ...prevState, simultaneousActionState: newSimultaneousState };
                        });
                        break;
                    }
                    case 'simultaneous_action_submit': {
                        const { action } = message.payload;
                        const senderId = message.senderId!;
                        setGameState(prevState => {
                            if (!prevState || !prevState.simultaneousActionState?.isActive) return prevState;
                            const newActions = { ...prevState.simultaneousActionState.actions, [senderId]: action };
                            const newSimultaneousState = { ...prevState.simultaneousActionState, actions: newActions };
                            return { ...prevState, simultaneousActionState: newSimultaneousState };
                        });
                        break;
                    }
                }
            });

            (conn as any).on('close', () => {
                console.log(`Connection from ${conn.peer} closed.`);
                connectionsRef.current.delete(conn.peer);
                setGameState(prev => {
                    if (!prev) return null;
                    const peerThatLeft = prev.peers.find(p => p.id === conn.peer);
                    const disconnectMessage: ChatMessage = { sender: 'system', content: t('player_has_disconnected', { name: peerThatLeft?.name || conn.peer }) };
                    setGameHistory(p => [...p, disconnectMessage]);
                    return { ...prev, peers: prev.peers.filter(p => p.id !== conn.peer) };
                });
            });
        });

        (peer as any).on('error', (err: any) => {
            console.error('PeerJS error:', err);
            setError(`Network error: ${err.message}`);
            setIsLoading(false);
        });
    };

    const joinGame = (hostPeerId: string, role: NetworkRole, playerName: string) => {
        setIsLoading(true);
        setError(null);
        if (peerRef.current) {
            peerRef.current.destroy();
        }
        
        const connectMessage: ChatMessage = { sender: 'system', content: t('Connecting to host {hostId}...', { hostId: hostPeerId }) };
        setGameHistory([connectMessage]);
        
        const peer = new Peer();
        peerRef.current = peer;

        (peer as any).on('open', (id: string) => {
            console.log('PeerJS Client open. My ID:', id, 'Connecting to host:', hostPeerId);
            
            const conn = peer.connect(hostPeerId, {
                metadata: { playerName: playerName || `Player-${id.slice(-4)}`, role },
                reliable: true,
            });
            hostConnectionRef.current = conn;
            
            (conn as any).on('open', () => {
                console.log('Connection to host established.');
            });
            
            (conn as any).on('data', (data: any) => {
                const message = data as NetworkMessage;
                console.log('Received data from host:', message.type);
                
                switch(message.type) {
                    case 'full_sync':
                        console.log("Received full_sync, restoring state...");

                        // ФИКС: Сначала восстанавливаем состояние
                        restoreFromSaveData(message.payload.saveFile, true);

                        // ЗАТЕМ немедленно устанавливаем правильные сетевые параметры
                        setGameState(prevState => {
                            if (!prevState) return null;

                            const needsCreation = role === 'player' && !prevState.players.some(p => p.playerId === id);

                            // ФИКС: Принудительно устанавливаем корректную сетевую роль
                            const correctedState = {
                                ...prevState,
                                networkRole: role,           // ПРИНУДИТЕЛЬНО устанавливаем роль
                                myPeerId: id,               // ПРИНУДИТЕЛЬНО устанавливаем peer ID
                                hostPeerId,
                                isConnectedToHost: true,
                                playerNeedsToCreateCharacter: needsCreation
                            };

                            // КРИТИЧЕСКИЙ ФИКС: Также обновляем gameContextRef немедленно
                            if (gameContextRef.current) {
                                gameContextRef.current.networkRole = role;
                                gameContextRef.current.isConnectedToHost = true;
                            }

                            console.log(`ФИКС: Принудительно установлена роль ${role} для peer ${id}`);
                            return correctedState;
                        });

                        const connectedMessage: ChatMessage = { sender: 'system', content: t('connected_to_host', { hostId: hostPeerId }) };
                        const syncedMessage: ChatMessage = { sender: 'system', content: t('game_state_synced') };
                        setGameHistory(prev => [...prev, connectedMessage, syncedMessage]);
                        setIsLoading(false);
                        break;

                    case 'chat_message':
                        onChatMessage(message.payload);
                        break;
                }
            });
            
            (conn as any).on('close', () => {
                console.log('Connection to host lost.');
                setError(t('connection_lost'));
                setIsLoading(false);
                setGameState(prev => prev ? ({ ...prev, isConnectedToHost: false }) : null);
            });

            (conn as any).on('error', (err: any) => {
                 console.error('PeerJS connection error:', err);
                setError(`Connection error: ${err.message}`);
                setIsLoading(false);
            });
        });

        (peer as any).on('error', (err: any) => {
            console.error('PeerJS client error:', err);
            setError(`Network error: ${err.message}`);
            setIsLoading(false);
        });
    };

    const sendNewCharacterToHost = (creationData: any) => {
        const currentGameState = gameStateRef.current;
        const currentGameSettings = gameContextRef.current?.gameSettings;
        if (!currentGameState || !currentGameSettings || !hostConnectionRef.current) return;

        const newPlayer = createNewPlayerCharacter(
            creationData,
            currentGameSettings,
            {
                partyLevel: currentGameState.playerCharacter.level,
                shareCharacteristics: currentGameSettings.multiplePersonalitiesSettings?.shareCharacteristics ?? false,
                templatePlayer: creationData.templatePlayer
            }
        );
        newPlayer.playerId = currentGameState.myPeerId!;

        const message: NetworkMessage = {
            type: 'new_player_character_data',
            payload: { playerCharacter: newPlayer },
            senderId: currentGameState.myPeerId,
        };
        hostConnectionRef.current.send(message);

        setGameState(prev => prev ? { ...prev, playerNeedsToCreateCharacter: false } : null);
        const sentMessage: ChatMessage = { sender: 'system', content: 'Character data sent to host. Waiting for game state sync...' };
        setGameHistory(prev => [...prev, sentMessage]);
    };

    const assignCharacterToPeer = (characterId: string, newPeerId: string | null) => {
        const currentGameState = gameStateRef.current;
        if (currentGameState?.networkRole !== 'host') return;

        setGameState(prevState => {
            if (!prevState) return null;

            const newPlayers = JSON.parse(JSON.stringify(prevState.players)) as PlayerCharacter[];
            
            const characterToMoveIndex = newPlayers.findIndex(p => p.playerId === characterId);
            if (characterToMoveIndex === -1) {
                console.warn(`assignCharacterToPeer: Character with ID ${characterId} not found.`);
                return prevState;
            }

            if (newPeerId) {
                newPlayers.forEach((p, index) => {
                    if (p.playerId === newPeerId && index !== characterToMoveIndex) {
                        p.playerId = generateId('unassigned-player');
                    }
                });
            }

            const movedCharName = newPlayers[characterToMoveIndex].name;
            const newPeer = newPeerId ? prevState.peers.find(p => p.id === newPeerId) : null;
            const newPeerName = newPeer ? newPeer.name : t('Unassigned');

            newPlayers[characterToMoveIndex].playerId = newPeerId || generateId('unassigned-player');

            const newState = { ...prevState, players: newPlayers };
            
            const systemMessage: ChatMessage = {
                sender: 'system',
                content: t('character_assigned_to_player', { charName: movedCharName, playerName: newPeerName }),
            };
            setGameHistory(prev => [...prev, systemMessage]);

            return newState;
        });
    };

    const startHostingFromLocalGame = () => {
        const currentGameSettings = gameContextRef.current?.gameSettings;
        if (!currentGameSettings) return;
        if (currentGameSettings.cooperativeGameType === 'None') {
            setError(t('hosting_disabled_coop_none'));
            return;
        }

        setIsLoading(true);
        setError(null);
        if (peerRef.current) {
            peerRef.current.destroy();
        }
        const peer = new Peer();
        peerRef.current = peer;

        (peer as any).on('open', (id: string) => {
            console.log('PeerJS Host started from local game. ID:', id);
            setGameState(prev => {
                if (!prev) return null;

                const newPlayers = [...prev.players];
                const activePlayerIndex = prev.activePlayerIndex;

                const updatedActivePlayer = {
                    ...newPlayers[activePlayerIndex],
                    playerId: id,
                };

                newPlayers[activePlayerIndex] = updatedActivePlayer;

                if (gameContextRef.current) {
                    gameContextRef.current.playerCharacter = updatedActivePlayer;
                    gameContextRef.current.players = newPlayers;
                }

                return {
                    ...prev,
                    players: newPlayers,
                    playerCharacter: updatedActivePlayer,
                    networkRole: 'host',
                    myPeerId: id,
                    isConnectedToHost: true,
                };
            });
            const hostMessage: ChatMessage = { sender: 'system', content: t('hosting_started_message', { hostId: id }) };
            setGameHistory(prev => [...prev, hostMessage]);
            console.log('Setting isLoading to false...');
            setIsLoading(false); // ВАЖНО: Убрать loading состояние после успешной настройки
        });

        (peer as any).on('connection', (conn: DataConnection) => {
            console.log(`Incoming connection from ${conn.peer}`);
            
            (conn as any).on('open', () => {
                connectionsRef.current.set(conn.peer, conn);
                syncNewPeerRef.current(conn);
            });

            (conn as any).on('data', (data: any) => {
                const message = data as NetworkMessage;
                console.log(`Data from ${conn.peer}:`, message.type);
                switch (message.type) {
                    case 'turn_result_from_player': {
                        if (!message.payload.saveFile) {
                            console.error("Received turn_result_from_player without saveFile payload.");
                            return;
                        }
                        const currentGameState = gameStateRef.current;
                        if (currentGameState && currentGameState.players[currentGameState.activePlayerIndex]?.playerId === message.senderId) {
                            console.log(`✅ HOST: Received and applying turn result from player ${message.senderId}`);
                            // The host MUST update its own state with the result from the active player.
                            restoreFromSaveData(message.payload.saveFile, true);
                            
                            // After updating its own state, it broadcasts the new canonical state to all clients.
                            const updatedSaveData = packageSaveData(gameStateRef.current);
                            if (updatedSaveData) {
                                console.log(`📡 HOST: Broadcasting updated state to all clients after player turn.`);
                                broadcastFullSync(updatedSaveData);
                            } else {
                                console.error("Host failed to package save data after applying player turn.");
                            }
                        } else {
                            const activePlayerInfo = currentGameState ? `Expected turn from: ${currentGameState.players[currentGameState.activePlayerIndex]?.playerId}` : "No game state.";
                            console.warn(`Turn result from non-active player ${message.senderId}. Ignoring. ${activePlayerInfo}`);
                        }
                        break;
                    }
                    case 'new_player_character_data': {
                        addPlayer(message.payload.playerCharacter);
                        break;
                    }
                    case 'chat_message': {
                        onChatMessage(message.payload); // Add to host's history
                        // Broadcast to all clients
                        connectionsRef.current.forEach(c => {
                            c.send(message);
                        });
                        break;
                    }
                    case 'request_full_sync': {
                        console.log(`Received sync request from ${conn.peer}. Broadcasting full state.`);
                        const saveData = packageSaveData(gameStateRef.current);
                        if (saveData) {
                            broadcastFullSync(saveData);
                            const systemMessage: ChatMessage = { sender: 'system', content: t('sync_requested_by_player', { name: conn.metadata.playerName }) };
                            setGameHistory(prev => [...prev, systemMessage]);
                        }
                        break;
                    }
                    case 'request_collective_action': {
                        const { participantIds, prompt, initiatorId, initiatorName } = message.payload;
                        setGameState(prevState => {
                            if (!prevState) return null;
                            const newCollectiveState: CollectiveActionState = {
                                isActive: true,
                                initiatorId: initiatorId,
                                initiatorName: initiatorName,
                                prompt: prompt,
                                participantIds: participantIds,
                                actions: {}
                            };
                            return { ...prevState, collectiveActionState: newCollectiveState };
                        });
                        break;
                    }
                    case 'submit_collective_action': {
                        const { action } = message.payload;
                        const senderId = message.senderId!;
                        setGameState(prevState => {
                            if (!prevState || !prevState.collectiveActionState?.isActive) return prevState;
                            const newActions = { ...prevState.collectiveActionState.actions, [senderId]: action };
                            const newCollectiveState = { ...prevState.collectiveActionState, actions: newActions };
                            return { ...prevState, collectiveActionState: newCollectiveState };
                        });
                        break;
                    }
                    case 'request_simultaneous_action': {
                        setGameState(prevState => {
                            if (!prevState) return null;
                            const newSimultaneousState: SimultaneousActionState = {
                                isActive: true,
                                actions: {}
                            };
                            return { ...prevState, simultaneousActionState: newSimultaneousState };
                        });
                        break;
                    }
                    case 'simultaneous_action_submit': {
                        const { action } = message.payload;
                        const senderId = message.senderId!;
                        setGameState(prevState => {
                            if (!prevState || !prevState.simultaneousActionState?.isActive) return prevState;
                            const newActions = { ...prevState.simultaneousActionState.actions, [senderId]: action };
                            const newSimultaneousState = { ...prevState.simultaneousActionState, actions: newActions };
                            return { ...prevState, simultaneousActionState: newSimultaneousState };
                        });
                        break;
                    }
                }
            });

            (conn as any).on('close', () => {
                console.log(`Connection from ${conn.peer} closed.`);
                connectionsRef.current.delete(conn.peer);
                setGameState(prev => {
                    if (!prev) return null;
                    const peerThatLeft = prev.peers.find(p => p.id === conn.peer);
                    const disconnectMessage: ChatMessage = { sender: 'system', content: t('player_has_disconnected', { name: peerThatLeft?.name || conn.peer }) };
                    setGameHistory(p => [...p, disconnectMessage]);
                    return { ...prev, peers: prev.peers.filter(p => p.id !== conn.peer) };
                });
            });
        });

        (peer as any).on('error', (err: any) => {
            console.error('PeerJS error:', err);
            setError(`Network error: ${err.message}`);
            setIsLoading(false);
        });
    };

    const disconnect = () => {
        const role = gameStateRef.current?.networkRole;
        
        setGameHistory(prev => [...prev, { sender: 'system', content: t('disconnecting_message') }]);
    
        if (hostConnectionRef.current) {
            hostConnectionRef.current.close();
            hostConnectionRef.current = null;
        }
        connectionsRef.current.forEach(conn => conn.close());
        connectionsRef.current.clear();
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
    
        setIsLoading(false);
        setError(null);

        if (role === 'player' || role === 'spectator' || role === 'host') {
            setGameState(prev => {
                if (!prev) return null;
                const newState: GameState = {
                    ...prev,
                    networkRole: 'none',
                    myPeerId: null,
                    hostPeerId: null,
                    peers: [],
                    isConnectedToHost: true, 
                };
                
                if (gameContextRef.current) {
                    gameContextRef.current.networkRole = 'none';
                    gameContextRef.current.peers = [];
                    gameContextRef.current.isConnectedToHost = true;
                }
    
                return newState;
            });
        }
    };

    return {
        startHost,
        joinGame,
        sendNewCharacterToHost,
        assignCharacterToPeer,
        startHostingFromLocalGame,
        disconnect,
        requestSyncFromHost
    };
};
