import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ClockIcon, CpuChipIcon, WrenchScrewdriverIcon, InformationCircleIcon, TrashIcon, CloudArrowDownIcon, ExclamationTriangleIcon, BookOpenIcon, UserGroupIcon, WifiIcon, CheckIcon, ClipboardDocumentIcon, ArrowPathIcon, PaintBrushIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { GameSettings, DBSaveSlotInfo, GameState, PeerInfo, NetworkRole, NetworkChatMessage, ImageGenerationSource } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import ConfirmationModal from './ConfirmationModal';
import AboutContent from './AboutContent';
import Modal from './Modal';
import { UniverseCustomizer } from './UniverseCustomizer';
import { gameData as defaultGameData } from '../utils/localizationGameData';
import { initializeAndPreviewSound } from '../utils/soundManager';
import { weather as weatherTranslations } from '../utils/translations/ui/weather';
import MarkdownRenderer from './MarkdownRenderer';


interface GameMenuViewProps {
    onSave: () => void;
    onLoad: () => void;
    onLoadAutosave: () => void;
    autosaveTimestamp: string | null;
    isGameActive: boolean;
    gameSettings: GameSettings | null;
    updateGameSettings: (newSettings: Partial<GameSettings>) => void;
    superInstructions: string;
    updateSuperInstructions: (instructions: string) => void;
    isLoading: boolean;
    onSaveToSlot: (slotId: number) => Promise<void>;
    onLoadFromSlot: (slotId: number) => Promise<void>;
    onDeleteSlot: (slotId: number) => Promise<void>;
    dbSaveSlots: DBSaveSlotInfo[];
    refreshDbSaveSlots: () => Promise<void>;
    clearNpcJournalsNow: () => void;
    gameState: GameState | null;
    activeTab: 'System' | 'Network';
    forceSyncAll: () => void;
    startHostingFromLocalGame: () => void;
    disconnect: () => void;
    isMyTurn: boolean;
    requestSyncFromHost: () => void;
    networkChatHistory: NetworkChatMessage[];
    sendNetworkChatMessage: (content: string) => void;
}

const formatTimestamp = (timestamp: string | null, t: (key: string, replacements?: any) => string): string => {
    if (!timestamp) return t('Never');
    try {
        return new Date(timestamp).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch {
        return 'Invalid Date';
    }
};

const ToggleSwitch: React.FC<{
    label: string;
    description?: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    disabled?: boolean;
}> = ({ label, description, checked, onChange, name, disabled = false }) => (
  <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
    <div>
      <label htmlFor={name} className={`font-medium text-gray-300 ${disabled ? 'text-gray-500' : ''}`}>{label}</label>
      {description && <p className={`text-xs text-gray-400 ${disabled ? 'text-gray-500' : ''}`}>{description}</p>}
    </div>
    <label htmlFor={name} className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <input type="checkbox" id={name} name={name} checked={checked} onChange={onChange} disabled={disabled} className="sr-only peer" />
      <div className={`w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 ${disabled ? 'opacity-50' : ''}`}></div>
    </label>
  </div>
);

type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

const NetworkChatView: React.FC<{
    chatHistory: NetworkChatMessage[];
    onSendMessage: (content: string) => void;
    myPeerId: string | null;
    t: TFunction;
}> = ({ chatHistory, onSendMessage, myPeerId, t }) => {
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    return (
        <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700/50 flex flex-col flex-1 min-h-0">
            <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2 flex-shrink-0">
                <UserGroupIcon className="w-5 h-5 text-cyan-400" />
                {t("Player Chat")}
            </h4>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-2">
                {chatHistory.map((msg, index) => {
                    const isMyMessage = msg.senderId === myPeerId;
                    return (
                        <div key={index} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                            <div className={`text-xs mb-1 ${isMyMessage ? 'text-cyan-400' : 'text-gray-400'}`}>{msg.senderName}</div>
                            <div className={`px-3 py-2 rounded-lg max-w-xs text-sm ${isMyMessage ? 'bg-cyan-600/70 text-white rounded-br-none' : 'bg-gray-700/50 text-gray-200 rounded-bl-none'}`}>
                                <MarkdownRenderer content={msg.content} />
                            </div>
                        </div>
                    );
                })}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSend} className="flex gap-2 flex-shrink-0">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('Type a message...')}
                    className="flex-1 bg-gray-800/60 border border-gray-600 rounded-md py-2 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-cyan-500 transition"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    {t('Send')}
                </button>
            </form>
        </div>
    );
};

const ImagePipelineManager: React.FC<{
    pipeline: ImageGenerationSource[];
    onPipelineChange: (newPipeline: ImageGenerationSource[]) => void;
    t: TFunction;
}> = ({ pipeline, onPipelineChange, t }) => {
    const ALL_PROVIDERS: ImageGenerationSource[] = [
        { provider: 'pollinations', model: 'flux' },
        { provider: 'nanobanana' },
        { provider: 'imagen' },
    ];

    const availableToAdd = useMemo(() => {
        const currentProviders = new Set(pipeline.map(p => p.provider));
        return ALL_PROVIDERS.filter(p => !currentProviders.has(p.provider));
    }, [pipeline]);

    const move = (index: number, direction: 'up' | 'down') => {
        const newPipeline = [...pipeline];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newPipeline.length) return;
        [newPipeline[index], newPipeline[targetIndex]] = [newPipeline[targetIndex], newPipeline[index]];
        onPipelineChange(newPipeline);
    };

    const remove = (index: number) => {
        onPipelineChange(pipeline.filter((_, i) => i !== index));
    };

    const add = (source: ImageGenerationSource) => {
        onPipelineChange([...pipeline, source]);
    };

    const getDisplayName = (source: ImageGenerationSource) => {
        switch(source.provider) {
            case 'pollinations': return 'Pollinations.ai (Flux)';
            case 'nanobanana': return 'Nano Banana (Gemini)';
            case 'imagen': return 'Imagen (Google)';
            default: return 'Unknown';
        }
    };

    return (
        <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700/50 space-y-4">
            <h4 className="font-semibold text-gray-300">{t("Image Generation Pipeline")}</h4>
            <p className="text-xs text-gray-400">{t("image_pipeline_desc")}</p>
            <div className="space-y-2">
                {pipeline.map((source, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-md">
                        <span className="font-mono text-cyan-400 mr-2">{index + 1}.</span>
                        <span className="flex-1 text-gray-200">{getDisplayName(source)}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => move(index, 'up')} disabled={index === 0} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 disabled:opacity-50"><ArrowUpIcon className="w-4 h-4" /></button>
                            <button onClick={() => move(index, 'down')} disabled={index === pipeline.length - 1} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 disabled:opacity-50"><ArrowDownIcon className="w-4 h-4" /></button>
                            <button onClick={() => remove(index)} className="p-1 rounded-full text-red-400 hover:bg-red-900/50"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
            {availableToAdd.length > 0 && (
                <div className="pt-2 border-t border-gray-700/50">
                    <h5 className="text-sm font-semibold text-gray-400 mb-2">{t('Add to Pipeline')}</h5>
                    <div className="flex gap-2">
                        {availableToAdd.map(source => (
                            <button key={source.provider} onClick={() => add(source)} className="px-3 py-1.5 text-xs font-semibold text-green-300 bg-green-500/10 rounded-md hover:bg-green-500/20 transition-colors">
                                + {getDisplayName(source)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


export default function GameMenuView({ 
    onSave, 
    onLoad, 
    onLoadAutosave, 
    autosaveTimestamp, 
    isGameActive,
    gameSettings,
    updateGameSettings,
    superInstructions,
    updateSuperInstructions,
    isLoading,
    onSaveToSlot,
    onLoadFromSlot,
    onDeleteSlot,
    dbSaveSlots,
    refreshDbSaveSlots,
    clearNpcJournalsNow,
    gameState,
    activeTab,
    forceSyncAll,
    startHostingFromLocalGame,
    disconnect,
    isMyTurn,
    requestSyncFromHost,
    networkChatHistory,
    sendNetworkChatMessage
}: GameMenuViewProps): React.ReactNode {
    const [isAdultConfirmOpen, setIsAdultConfirmOpen] = useState(false);
    const [localSuperInstructions, setLocalSuperInstructions] = React.useState(superInstructions);
    const [localWorldInfo, setLocalWorldInfo] = useState(gameSettings?.gameWorldInformation?.customInfo ?? '');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<number | null>(null);
    const [isOverwriteConfirmOpen, setIsOverwriteConfirmOpen] = useState<number | null>(null);
    const [isClearJournalConfirmOpen, setIsClearJournalConfirmOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
    const [advancedBudget, setAdvancedBudget] = useState(false);
    const { t } = useLocalization();

    useEffect(() => {
        setLocalSuperInstructions(superInstructions);
    }, [superInstructions]);

    useEffect(() => {
        if (gameSettings) {
            setLocalWorldInfo(gameSettings.gameWorldInformation.customInfo);
        }
    }, [gameSettings?.gameWorldInformation?.customInfo]);

    useEffect(() => {
        refreshDbSaveSlots();
    }, [refreshDbSaveSlots]);
    
    const universeInfo = useMemo(() => {
        if (!gameSettings) return { universe: null, selectedEra: null };
    
        const { baseInfo } = gameSettings.gameWorldInformation;
        if (!baseInfo) return { universe: null, selectedEra: null };
    
        if (baseInfo.universe) {
            return { universe: baseInfo.universe, selectedEra: baseInfo.selectedEra };
        }
    
        for (const uniKey of Object.keys(defaultGameData)) {
            const uniData = (defaultGameData as any)[uniKey];
            if (uniKey === 'history' || uniKey === 'myths') {
                for (const eraKey in uniData) {
                    if (uniData[eraKey].name === baseInfo.name) {
                        return { universe: uniKey, selectedEra: eraKey };
                    }
                }
            } else if (uniKey !== 'custom') {
                if (uniData.name === baseInfo.name) {
                    return { universe: uniKey, selectedEra: null };
                }
            }
        }
        
        const customEraKey = baseInfo.name?.toLowerCase().replace(/\s+/g, '_');
        return { universe: 'custom', selectedEra: customEraKey };
    
    }, [gameSettings]);

    const handleUpdateGameData = (newGameData: any) => {
        if (!gameSettings || !universeInfo.universe) return;
        const { universe, selectedEra } = universeInfo;
        
        let world;
        if (universe === 'history' && selectedEra) world = newGameData.history[selectedEra];
        else if (universe === 'myths' && selectedEra) world = newGameData.myths[selectedEra];
        else if (universe === 'custom' && selectedEra) world = newGameData.custom[selectedEra];
        else world = newGameData[universe];
        
        if (world) {
            const finalWorldData = {
                ...world,
                universe: universe,
                selectedEra: selectedEra,
            };
            updateGameSettings({
                gameWorldInformation: {
                    ...gameSettings.gameWorldInformation,
                    baseInfo: finalWorldData,
                    currencyName: finalWorldData.currencyName
                }
            });
        }
    };

    const gameDataStateForCustomizer = useMemo(() => {
        if (!gameSettings || !universeInfo.universe) {
            return JSON.parse(JSON.stringify(defaultGameData));
        }
        const { universe, selectedEra } = universeInfo;
        const baseInfo = gameSettings.gameWorldInformation.baseInfo;
        const gameDataState = JSON.parse(JSON.stringify(defaultGameData));
        
        if (universe === 'history' && selectedEra) {
            gameDataState.history[selectedEra as keyof typeof gameDataState.history] = baseInfo;
        } else if (universe === 'myths' && selectedEra) {
            gameDataState.myths[selectedEra as keyof typeof gameDataState.myths] = baseInfo;
        } else if (universe === 'custom' && selectedEra) {
            if (!gameDataState.custom) (gameDataState as any).custom = {};
            (gameDataState as any).custom[selectedEra] = baseInfo;
        } else if ((gameDataState as any)[universe as keyof typeof gameDataState]) {
            (gameDataState as any)[universe] = baseInfo;
        }
        return gameDataState;
    }, [gameSettings, universeInfo]);

    const handleSaveSuperInstructions = () => {
        updateSuperInstructions(localSuperInstructions);
    };
    
    const handleSaveWorldInfo = () => {
        if (gameSettings) {
            updateGameSettings({
                gameWorldInformation: {
                    ...gameSettings.gameWorldInformation,
                    customInfo: localWorldInfo,
                },
            });
        }
    };

    const handleSaveToNewSlot = () => {
        const nextSlotId = dbSaveSlots.length > 0 ? Math.max(...dbSaveSlots.map(s => s.slotId)) + 1 : 1;
        onSaveToSlot(nextSlotId);
    };

    const confirmDelete = () => {
        if (isDeleteConfirmOpen !== null) {
            onDeleteSlot(isDeleteConfirmOpen);
            setIsDeleteConfirmOpen(null);
        }
    };

    const confirmOverwrite = () => {
        if (isOverwriteConfirmOpen !== null) {
            onSaveToSlot(isOverwriteConfirmOpen);
            setIsOverwriteConfirmOpen(null);
        }
    };
    
    const handleClearJournalsConfirm = () => {
        clearNpcJournalsNow();
        setIsClearJournalConfirmOpen(false);
    };
    
    if (!gameSettings) {
        return (
             <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 narrative-text">{t('Game Management')}</h3>
                    <div className="space-y-3">
                         <button disabled className="w-full flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold text-cyan-200 bg-cyan-600/20 rounded-lg opacity-50 cursor-not-allowed">
                            {t("Loading Settings...")}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const { adultMode, allowHistoryManipulation, keepLatestNpcJournals, latestNpcJournalsCount, cooperativeGameType, multiplePersonalitiesSettings, autoPassTurnInCoop, showPartyStatusPanel, aiProvider, modelName, isCustomModel, geminiThinkingBudget, useDynamicThinkingBudget, doNotUseWorldEvents, useGoogleSearch, hardMode, impossibleMode } = gameSettings;
    
    const handleDifficultyChange = (difficulty: 'normal' | 'hard' | 'impossible') => {
        updateGameSettings({
            hardMode: difficulty === 'hard' || difficulty === 'impossible',
            impossibleMode: difficulty === 'impossible'
        });
    };
    const currentDifficulty = impossibleMode ? 'impossible' : (hardMode ? 'hard' : 'normal');

    const minBudget = 0;
    const maxBudget = 2048;
    const budget = geminiThinkingBudget ?? 128;
    const progress = maxBudget > minBudget ? ((budget - minBudget) / (maxBudget - minBudget)) * 100 : 0;
    
    const handleAdultModeClick = () => {
        if (isLoading) return;

        if (adultMode) {
            updateGameSettings({ adultMode: false });
        } else {
            setIsAdultConfirmOpen(true);
        }
    };

    const confirmAdultMode = () => {
      updateGameSettings({ adultMode: true });
      setIsAdultConfirmOpen(false);
    };
    
    const handleModelChange = (modelValue: string) => {
        if (modelValue === 'CUSTOM') {
            updateGameSettings({ isCustomModel: true, modelName: gameSettings.customModelName || '' });
        } else {
            updateGameSettings({ isCustomModel: false, modelName: modelValue });
        }
    };
    
    const handleBudgetToggle = () => {
      setAdvancedBudget(prev => {
          const isSwitchingToSimple = prev;
          if (isSwitchingToSimple && (gameSettings.geminiThinkingBudget ?? 0) > 1000) {
              updateGameSettings({ geminiThinkingBudget: 1000 });
          }
          return !prev;
      });
    };

    const handleProviderChange = (provider: 'gemini' | 'openrouter') => {
        updateGameSettings({
            aiProvider: provider,
            modelName: provider === 'gemini' ? 'gemini-2.5-flash' : gameSettings.openRouterModelName,
            isCustomModel: provider === 'gemini' ? gameSettings.isCustomModel : false,
        });
    };
    
    const NetworkStatusView: React.FC<{ gameState: GameState | null, forceSyncAll: () => void, gameSettings: GameSettings | null, startHostingFromLocalGame: () => void, disconnect: () => void, isMyTurn: boolean, requestSyncFromHost: () => void }> = ({ gameState, forceSyncAll, gameSettings, startHostingFromLocalGame, disconnect, isMyTurn, requestSyncFromHost }) => {
        const { t } = useLocalization();
        const [copied, setCopied] = useState(false);
    
        if (!gameState || gameState.networkRole === 'none') {
            const canHost = gameSettings?.cooperativeGameType !== 'None';
            return (
                <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700/50 space-y-4 flex-shrink-0">
                     <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <WifiIcon className="w-5 h-5 text-cyan-400" />
                        {t("Network Status")}
                    </h4>
                    <p className="text-sm text-gray-500 text-center py-4">{t("Not in a network game.")}</p>
                    <button
                        onClick={startHostingFromLocalGame}
                        disabled={!canHost}
                        title={!canHost ? t('hosting_disabled_coop_none') : t("start_hosting_button")}
                        className="w-full mt-2 bg-green-600/80 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition-all text-sm disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {t("start_hosting_button")}
                    </button>
                    {!canHost && (
                        <p className="text-xs text-yellow-400 text-center mt-2">
                            {t('hosting_disabled_coop_none')}
                        </p>
                    )}
                </div>
            );
        }
        
        const handleCopy = () => {
            if (gameState.myPeerId) {
                navigator.clipboard.writeText(gameState.myPeerId);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        };
        
        const isHost = gameState.networkRole === 'host';
        const showSyncButton = isHost || isMyTurn;
    
        return (
            <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700/50 space-y-4 flex-shrink-0">
                 <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <WifiIcon className="w-5 h-5 text-cyan-400" />
                    {t("Network Status")}
                </h4>
                <div className="text-sm space-y-2">
                    <p><span className="font-semibold text-gray-400">{t("Your Role")}:</span> <span className="font-bold text-cyan-300 capitalize">{t(gameState.networkRole)}</span></p>
                    <p><span className="font-semibold text-gray-400">{t("Status")}:</span> {gameState.isConnectedToHost || gameState.networkRole === 'host' ? <span className="text-green-400">{t("Connected")}</span> : <span className="text-yellow-400">{t("Connecting...")}</span>}</p>
                </div>
                
                {gameState.networkRole === 'host' && gameState.myPeerId && (
                    <div className="space-y-3 pt-3 border-t border-gray-700/50">
                        <h5 className="font-semibold text-gray-400 text-sm mb-1">{t("Your Host ID")}</h5>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-gray-800/60 p-2 rounded-md text-cyan-300 font-mono text-sm break-all">{gameState.myPeerId}</code>
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${copied ? 'bg-green-600/30 text-green-300' : 'bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/40'}`}
                            >
                                {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                                {copied ? t('Copied!') : t('Copy')}
                            </button>
                        </div>
                    </div>
                )}
    
                {gameState.networkRole === 'host' && (
                    <div>
                        <h5 className="font-semibold text-gray-400 text-sm mb-2">{t("Connected Peers")} ({gameState.peers.length})</h5>
                        <div className="bg-gray-800/50 p-2 rounded-md space-y-1 max-h-40 overflow-y-auto">
                            {gameState.peers.length > 0 ? gameState.peers.map((peer: PeerInfo) => (
                                <div key={peer.id} className="text-sm text-gray-300">{peer.name}</div>
                            )) : <p className="text-xs text-gray-500">{t("No players have connected yet.")}</p>}
                        </div>
                    </div>
                )}
                
                {showSyncButton && (
                    <button
                        onClick={isHost ? forceSyncAll : requestSyncFromHost}
                        disabled={isHost && gameState.peers.length === 0}
                        className="w-full mt-4 bg-blue-600/80 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-all text-sm disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        {isHost ? t("Sync All Players") : t("Request Sync")}
                    </button>
                )}
    
                <button
                    className="w-full mt-2 bg-red-600/80 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-all text-sm"
                    onClick={disconnect}
                >
                    {t("Disconnect")}
                </button>
            </div>
        );
    };

    return (
        <div className={`h-full ${activeTab === 'Network' ? 'flex flex-col gap-4' : ''}`}>
            {activeTab === 'System' &&
            <div className="space-y-8">
            <fieldset disabled={!isGameActive || isLoading} className="space-y-4">
                <h3 className="text-xl font-bold text-cyan-400 mb-2 narrative-text flex items-center gap-2">
                    <WrenchScrewdriverIcon className="w-6 h-6" /> {t('Game Management')}
                </h3>

                <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
                    <h4 className="font-semibold text-gray-300 mb-3">{t("Database Saves")}</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {dbSaveSlots.length > 0 ? dbSaveSlots.map(slot => (
                            <div key={slot.slotId} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-md">
                                <div className="flex-1">
                                    <p className="font-semibold text-white">
                                        {t('Slot')} {slot.slotId}: {slot.playerName} ({t('Lvl {level}', { level: slot.playerLevel })})
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {slot.locationName} - {t('Turn')} {slot.turnNumber} - {formatTimestamp(slot.timestamp, t)}
                                    </p>
                                </div>
                                <button onClick={() => onLoadFromSlot(slot.slotId)} className="p-2 text-cyan-300 bg-cyan-600/20 hover:bg-cyan-600/40 rounded-md transition-colors" title={t('Load')}><CloudArrowDownIcon className="w-5 h-5" /></button>
                                <button onClick={() => setIsOverwriteConfirmOpen(slot.slotId)} className="p-2 text-yellow-300 bg-yellow-600/20 hover:bg-yellow-600/40 rounded-md transition-colors" title={t('Save')}><ArrowDownTrayIcon className="w-5 h-5" /></button>
                                <button onClick={() => setIsDeleteConfirmOpen(slot.slotId)} className="p-2 text-red-300 bg-red-600/20 hover:bg-red-600/40 rounded-md transition-colors" title={t('Delete')}><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        )) : <p className="text-sm text-gray-500 text-center py-4">{t("No saved games in the database yet.")}</p>}
                    </div>
                    <button onClick={handleSaveToNewSlot} className="w-full mt-3 bg-cyan-600/80 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-600 transition-all text-sm">{t("Save to New Slot")}</button>
                </div>

                <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
                    <h4 className="font-semibold text-gray-300 mb-3">{t("File & Autosave")}</h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={onSave} className="flex-1 w-full flex items-center justify-center gap-3 px-4 py-2 text-base font-semibold text-gray-200 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            {t("Save to File")}
                        </button>
                        <button onClick={onLoad} className="flex-1 w-full flex items-center justify-center gap-3 px-4 py-2 text-base font-semibold text-gray-200 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600">
                            <ArrowUpTrayIcon className="w-5 h-5" />
                            {t("Load from File")}
                        </button>
                    </div>
                    <button onClick={onLoadAutosave} disabled={!autosaveTimestamp} className="w-full mt-3 text-cyan-400/80 hover:text-cyan-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 p-2">
                        <ClockIcon className="w-5 h-5" />
                        {t("Autosave")}: {formatTimestamp(autosaveTimestamp, t)}
                    </button>
                </div>
            </fieldset>

            <fieldset disabled={!isGameActive || isLoading} className="space-y-4">
                <h3 className="text-xl font-bold text-cyan-400 mb-2 narrative-text">{t("Game Master's Memory")}</h3>
                <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700/50 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium text-gray-300 flex items-center gap-2">
                                {t("keep_journals_label")}
                                <span className="text-gray-400 hover:text-white cursor-pointer" title={t("keep_journals_tooltip")}>
                                    <InformationCircleIcon className="w-4 h-4" />
                                </span>
                            </label>
                            <p className="text-xs text-gray-400">{t("Helps reduce context size and speed up turns.")}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={keepLatestNpcJournals} onChange={(e) => updateGameSettings({ keepLatestNpcJournals: e.target.checked })} />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                    {keepLatestNpcJournals && (
                        <div className="animate-fade-in-down-fast">
                            <label htmlFor="latestNpcJournalsCount" className="block text-sm font-medium text-gray-300 mb-2">{t("Number of entries to keep")}</label>
                            <input type="number" id="latestNpcJournalsCount" value={latestNpcJournalsCount} onChange={(e) => updateGameSettings({ latestNpcJournalsCount: parseInt(e.target.value, 10) })} min="1" className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" />
                        </div>
                    )}
                    <button onClick={() => setIsClearJournalConfirmOpen(true)} className="w-full bg-gray-700/50 text-gray-300 font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm">
                        <TrashIcon className="w-4 h-4" />
                        {t("Clear now")}
                    </button>
                </div>
            </fieldset>
            
            <fieldset disabled={!isGameActive || isLoading} className="space-y-4">
                <h3 className="text-xl font-bold text-cyan-400 mb-2 narrative-text">{t("Game Rules")}</h3>
                <div className="p-4 bg-gray-900/30 rounded-lg border border-cyan-500/20 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t("Difficulty")}</label>
                        <div className="flex gap-2 p-1 bg-gray-900/50 rounded-lg">
                            <button type="button" onClick={() => handleDifficultyChange('normal')} className={`flex-1 p-2 rounded-md text-center text-sm font-semibold transition-all ${currentDifficulty === 'normal' ? 'bg-cyan-600 text-white ring-2 ring-cyan-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{t('Normal')}</button>
                            <button type="button" onClick={() => handleDifficultyChange('hard')} className={`flex-1 p-2 rounded-md text-center text-sm font-semibold transition-all ${currentDifficulty === 'hard' ? 'bg-cyan-600 text-white ring-2 ring-cyan-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{t('Hard')}</button>
                            <button type="button" onClick={() => handleDifficultyChange('impossible')} className={`flex-1 p-2 rounded-md text-center text-sm font-semibold transition-all ${currentDifficulty === 'impossible' ? 'bg-cyan-600 text-white ring-2 ring-cyan-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{t('Impossible')}</button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">{t(`${currentDifficulty}_mode_description` as any)}</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-yellow-500/20">
                        <div>
                            <label className="font-medium text-yellow-300">{t("Adult Mode (21+)")}</label>
                            <p className="text-xs text-gray-400">{t("Enables less restrictive, player-driven narrative content.")}</p>
                        </div>
                        <div onClick={handleAdultModeClick} className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={!!adultMode} readOnly tabIndex={-1} />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-yellow-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                        </div>
                    </div>
                    
                    <ToggleSwitch label={t("Allow History Manipulation")} description={t("allowHistoryManipulationDescription")} name="allowHistoryManipulation" checked={allowHistoryManipulation} onChange={(e) => updateGameSettings({ allowHistoryManipulation: e.target.checked })} />
                    <ToggleSwitch label={t('Disable World Events')} description={t('disable_world_events_desc')} name="doNotUseWorldEvents" checked={!!doNotUseWorldEvents} onChange={(e) => updateGameSettings({ doNotUseWorldEvents: e.target.checked })} />
                    <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                        <div>
                            <label htmlFor="notificationSound" className="font-medium text-gray-300 flex items-center gap-2">
                                {t("Notification Sound")}
                                <span className="text-gray-400 hover:text-white cursor-pointer" title={t("notificationSoundTooltip")}>
                                    <InformationCircleIcon className="w-4 h-4" />
                                </span>
                            </label>
                            <p className="text-xs text-gray-400">{t("Play a sound when the GM's response is ready.")}</p>
                        </div>
                        <label htmlFor="notificationSound-ingame" className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="notificationSound-ingame" name="notificationSound" checked={!!gameSettings.notificationSound} onChange={(e) => updateGameSettings({ notificationSound: e.target.checked })} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                </div>
            </fieldset>
            
            <fieldset disabled={!isGameActive || isLoading} className="space-y-4">
                <h3 className="text-xl font-bold text-cyan-400 mb-2 narrative-text">{t("Cooperative Settings")}</h3>
                <div className="p-4 bg-gray-900/30 rounded-lg border border-cyan-500/20 space-y-4">
                     <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                        <div>
                            <label className="font-medium text-gray-300">{t("Show Players Panel")}</label>
                            <p className="text-xs text-gray-400">{t("Show/hide the party status panel at the top of the screen.")}</p>
                        </div>
                        <label htmlFor="showPartyStatusPanel" className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="showPartyStatusPanel" name="showPartyStatusPanel" className="sr-only peer" checked={!!showPartyStatusPanel} onChange={(e) => updateGameSettings({ showPartyStatusPanel: e.target.checked })} />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                    <div className="p-4 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                        <h4 className="font-semibold text-gray-300 mb-3">{t("cooperative_mode")}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button type="button" onClick={() => updateGameSettings({ cooperativeGameType: 'None' })} className={`p-3 rounded-md text-center transition-all border ${cooperativeGameType === 'None' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}>{t('single_player')}</button>
                            <button type="button" onClick={() => updateGameSettings({ cooperativeGameType: 'MultiplePersonalities' })} className={`p-3 rounded-md text-center transition-all border ${cooperativeGameType === 'MultiplePersonalities' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}>{t('multiple_personalities')}</button>
                            <button type="button" onClick={() => updateGameSettings({ cooperativeGameType: 'FullParty' })} className={`p-3 rounded-md text-center transition-all border ${cooperativeGameType === 'FullParty' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}>{t('full_party')}</button>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-2 min-h-[2.5rem] px-2">
                            {cooperativeGameType === 'MultiplePersonalities' ? t('multiple_personalities_desc') :
                            cooperativeGameType === 'FullParty' ? t('full_party_desc') : ''}
                        </p>
                        
                        {cooperativeGameType === 'MultiplePersonalities' && (
                            <div className="p-3 bg-gray-800/30 rounded-md mt-4 space-y-3 animate-fade-in-down">
                                <h4 className="font-medium text-gray-300">{t("multiple_personalities_settings")}</h4>
                                <p className="text-xs text-gray-400">{t("share_settings_desc")}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(['shareCharacteristics', 'shareSkills', 'shareNpcReputation', 'shareFactionReputation', 'shareInventory'] as const).map(key => (
                                        <div key={key} className="flex items-center justify-between p-2 bg-gray-900/30 rounded-lg">
                                        <label className="font-medium text-gray-300 text-sm">{t(key as any)}</label>
                                        <label htmlFor={`mp-${key}-ingame`} className="relative inline-flex items-center cursor-pointer">
                                            <input
                                            type="checkbox"
                                            id={`mp-${key}-ingame`}
                                            name={key}
                                            checked={multiplePersonalitiesSettings?.[key] ?? false}
                                            onChange={(e) => {
                                                const { name, checked } = e.target;
                                                updateGameSettings({
                                                    multiplePersonalitiesSettings: {
                                                        ...gameSettings.multiplePersonalitiesSettings,
                                                        [name]: checked
                                                    }
                                                });
                                            }}
                                            className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                        </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(cooperativeGameType === 'FullParty' || cooperativeGameType === 'MultiplePersonalities') && (
                            <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg mt-4">
                                <div>
                                <label className="font-medium text-gray-300">{t("auto_pass_turn")}</label>
                                <p className="text-xs text-gray-400">{t("auto_pass_turn_desc")}</p>
                                </div>
                                <label htmlFor="autoPassTurnInCoop" className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="autoPassTurnInCoop"
                                    name="autoPassTurnInCoop"
                                    checked={autoPassTurnInCoop ?? true}
                                    onChange={(e) => updateGameSettings({ autoPassTurnInCoop: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </fieldset>
            
            <fieldset disabled={!isGameActive || isLoading} className="space-y-4">
                 <h3 className="text-xl font-bold text-cyan-400 mb-2 narrative-text flex items-center gap-2"><CpuChipIcon className="w-6 h-6" />{t("AI Settings")}</h3>
                 <div className="p-4 bg-gray-900/30 rounded-lg border border-cyan-500/20 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t("AI Provider")}</label>
                  <div className="grid grid-cols-2 gap-2">
                      <button
                          type="button"
                          onClick={() => handleProviderChange('gemini')}
                          className={`p-3 rounded-md text-center transition-all border ${aiProvider === 'gemini' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                      >
                          {t('Google Gemini')}
                      </button>
                      <button
                          type="button"
                          onClick={() => handleProviderChange('openrouter')}
                          className={`p-3 rounded-md text-center transition-all border ${aiProvider === 'openrouter' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                      >
                          {t('OpenRouter')}
                      </button>
                  </div>
                </div>
                {aiProvider === 'gemini' && (
                    <div className="p-3 bg-gray-800/30 rounded-md space-y-3 animate-fade-in-down">
                        <ToggleSwitch label={t("use_google_search")} description={t("use_google_search_desc")} name="useGoogleSearch" checked={!!useGoogleSearch} onChange={(e) => updateGameSettings({ useGoogleSearch: e.target.checked })} />
                        <div>
                            <label htmlFor="modelName-ingame" className="block text-sm font-medium text-gray-300 mb-2">{t("AI Model")}</label>
                            <select id="modelName-ingame" value={isCustomModel ? 'CUSTOM' : modelName} onChange={(e) => handleModelChange(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition">
                                <option value="gemini-2.5-pro">{t('Pro')} ({t('Superior Quality')})</option>
                                <option value="gemini-2.5-flash">{t('Flash')} ({t('Best Speed/Quality')})</option>
                                <option value="CUSTOM">{t("Custom...")}</option>
                            </select>
                            {isCustomModel && (
                                <div className="mt-2">
                                    <label htmlFor="customModelName-ingame" className="block text-xs font-medium text-gray-400 mb-1">{t('Custom Model Name')}</label>
                                    <input id="customModelName-ingame" name="customModelName" type="text" onChange={(e) => updateGameSettings({ customModelName: e.target.value, modelName: e.target.value })} value={gameSettings.customModelName || ''} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition" placeholder={t('Specify model')} required />
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="correctionModelName-ingame" className="block text-sm font-medium text-gray-300 mb-2">
                                {t("Correction Model (Optional)")}
                                <span className="text-gray-400 hover:text-white cursor-pointer ml-1" title={t("Correction Model Tooltip")}>
                                    <InformationCircleIcon className="w-4 h-4 inline-block" />
                                </span>
                            </label>
                            <input id="correctionModelName-ingame" name="correctionModelName" type="text" onChange={(e) => updateGameSettings({ correctionModelName: e.target.value })} value={gameSettings.correctionModelName || ''} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("e.g., google/gemini-pro-1.5")} />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">{t("Gemini Thinking Budget")}</h4>
                            <div className="flex items-center justify-between">
                                <label htmlFor="useDynamicThinkingBudget-ingame" className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                                    <input 
                                        type="checkbox" 
                                        id="useDynamicThinkingBudget-ingame" 
                                        name="useDynamicThinkingBudget" 
                                        checked={!!useDynamicThinkingBudget} 
                                        onChange={(e) => updateGameSettings({ useDynamicThinkingBudget: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <span className="w-5 h-5 rounded-sm border-2 border-gray-500 bg-gray-800 flex items-center justify-center transition-colors peer-checked:bg-cyan-500 peer-checked:border-cyan-400">
                                        <CheckIcon className={`w-3 h-3 text-white transition-opacity ${useDynamicThinkingBudget ? 'opacity-100' : 'opacity-0'}`} />
                                    </span>
                                    <span className="text-xs text-gray-400">{t("Use dynamic thinking budget")}</span>
                                </label>
                                {!useDynamicThinkingBudget && (
                                    <button type="button" onClick={handleBudgetToggle} className="text-xs text-cyan-400 hover:underline">{advancedBudget ? t("Simple") : t("Advanced")}</button>
                                )}
                            </div>
                            {!useDynamicThinkingBudget && (
                                <div className="mt-3">
                                {advancedBudget ? (
                                    <input type="number" name="geminiThinkingBudget" value={budget} onChange={(e) => updateGameSettings({ geminiThinkingBudget: parseInt(e.target.value, 10)})} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200" />
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="range" 
                                            name="geminiThinkingBudget" 
                                            min={minBudget} 
                                            max={maxBudget} 
                                            step="16" 
                                            value={budget} 
                                            onChange={(e) => updateGameSettings({ geminiThinkingBudget: parseInt(e.target.value, 10)})} 
                                            className="w-full styled-slider"
                                            style={{ '--range-progress': `${progress}%` } as React.CSSProperties}
                                        />
                                        <span className="font-mono text-cyan-300 w-12 text-right">{budget}</span>
                                    </div>
                                )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {aiProvider === 'openrouter' && (
                    <div className="animate-fade-in-down space-y-4">
                        <div>
                            <label htmlFor="openRouterModelName-ingame" className="block text-sm font-medium text-gray-300 mb-2">{t('OpenRouter Model')}</label>
                            <input id="openRouterModelName-ingame" name="openRouterModelName" type="text" onChange={(e) => updateGameSettings({ openRouterModelName: e.target.value, modelName: e.target.value })} value={gameSettings.openRouterModelName || ''} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t('e.g., google/gemini-flash-1.5')} required />
                        </div>
                        <div>
                            <label htmlFor="openRouterApiKey-ingame" className="block text-sm font-medium text-gray-300 mb-2">{t("OpenRouter API Key (Optional)")}</label>
                            <input id="openRouterApiKey-ingame" name="openRouterApiKey" type="password" onChange={(e) => updateGameSettings({ openRouterApiKey: e.target.value })} value={gameSettings.openRouterApiKey || ''} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t('Leave blank to use pre-configured key')} />
                        </div>
                        <div>
                            <label htmlFor="correctionModelName-ingame-or" className="block text-sm font-medium text-gray-300 mb-2">
                                {t("Correction Model (Optional)")}
                                <span className="text-gray-400 hover:text-white cursor-pointer ml-1" title={t("Correction Model Tooltip")}>
                                    <InformationCircleIcon className="w-4 h-4 inline-block" />
                                </span>
                            </label>
                            <input id="correctionModelName-ingame-or" name="correctionModelName" type="text" onChange={(e) => updateGameSettings({ correctionModelName: e.target.value })} value={gameSettings.correctionModelName || ''} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("e.g., google/gemini-pro-1.5")} />
                        </div>
                    </div>
                )}
                <ImagePipelineManager 
                    pipeline={gameSettings.imageGenerationModelPipeline || []}
                    onPipelineChange={(newPipeline) => updateGameSettings({ imageGenerationModelPipeline: newPipeline })}
                    t={t}
                />
                <ToggleSwitch
                    label={t("show_image_source_info_label")}
                    description={t("show_image_source_info_desc")}
                    name="showImageSourceInfo"
                    checked={!!gameSettings.showImageSourceInfo}
                    onChange={(e) => updateGameSettings({ showImageSourceInfo: e.target.checked })}
                />
                </div>
            </fieldset>
            
            <fieldset disabled={!isGameActive || isLoading} className="space-y-4">
                 <h3 className="text-xl font-bold text-cyan-400 mb-2 narrative-text flex items-center gap-2"><BookOpenIcon className="w-6 h-6" /> {t('Narrative Overrides')}</h3>
                 <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700/50 space-y-4">
                    <button 
                        type="button" 
                        onClick={() => setIsCustomizerOpen(true)} 
                        className="w-full bg-gray-700/60 text-cyan-300 font-semibold py-2 px-4 rounded-md hover:bg-gray-700 hover:text-cyan-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <PaintBrushIcon className="w-5 h-5"/>
                        {t('Customize World')}
                    </button>
                    <div>
                        <label htmlFor="superInstructions" className="block text-sm font-medium text-gray-300 mb-2">{t("Player Super-Instructions")}</label>
                        <p className="text-xs text-gray-400 mb-2">{t("These instructions override the GM's default behavior. Use with caution.")}</p>
                        <textarea id="superInstructions" value={localSuperInstructions} onChange={(e) => setLocalSuperInstructions(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[120px]" />
                        <button onClick={handleSaveSuperInstructions} className="w-full mt-2 bg-cyan-600/80 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-600 transition-all text-sm">{t("Save Super-Instructions")}</button>
                    </div>
                     <div className="pt-4 border-t border-gray-700/60">
                        <label htmlFor="worldInformation" className="block text-sm font-medium text-gray-300 mb-2">{t("World Information")}</label>
                        <textarea id="worldInformation" value={localWorldInfo} onChange={(e) => setLocalWorldInfo(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[120px]" />
                        <button onClick={handleSaveWorldInfo} className="w-full mt-2 bg-cyan-600/80 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-600 transition-all text-sm">{t("Save World Information")}</button>
                    </div>
                 </div>
            </fieldset>
             <button type="button" onClick={() => setIsAboutModalOpen(true)} className="w-full bg-transparent text-gray-400 font-semibold py-2 px-4 rounded-md hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2">
                <InformationCircleIcon className="w-5 h-5"/>
                {t('About the Project')}
            </button>
        </div>
            }
            {activeTab === 'Network' &&
                <>
                <NetworkStatusView 
                    gameState={gameState} 
                    forceSyncAll={forceSyncAll} 
                    gameSettings={gameSettings} 
                    startHostingFromLocalGame={startHostingFromLocalGame} 
                    disconnect={disconnect} 
                    isMyTurn={isMyTurn}
                    requestSyncFromHost={requestSyncFromHost}
                />
                <NetworkChatView
                    chatHistory={networkChatHistory}
                    onSendMessage={sendNetworkChatMessage}
                    myPeerId={gameState?.myPeerId || null}
                    t={t}
                />
                </>
            }
            
            <ConfirmationModal isOpen={isAdultConfirmOpen} onClose={() => setIsAdultConfirmOpen(false)} onConfirm={confirmAdultMode} title={t("Adult Mode (21+)")}>
                <p>{t("adult_mode_warning_p1")}</p><p>{t("adult_mode_warning_p2")}</p><p>{t("adult_mode_warning_p3")}</p><p className="font-bold">{t("adult_mode_warning_p4")}</p>
            </ConfirmationModal>
            <ConfirmationModal isOpen={isDeleteConfirmOpen !== null} onClose={() => setIsDeleteConfirmOpen(null)} onConfirm={confirmDelete} title={t("Confirm Deletion")}>
                <p>{t("Are you sure you want to delete this save slot? This action cannot be undone.")}</p>
            </ConfirmationModal>
            <ConfirmationModal isOpen={isOverwriteConfirmOpen !== null} onClose={() => setIsOverwriteConfirmOpen(null)} onConfirm={confirmOverwrite} title={t("Confirm Overwrite")}>
                 <p>{t("Are you sure you want to overwrite this save slot with your current progress?")}</p>
            </ConfirmationModal>
             <ConfirmationModal isOpen={isClearJournalConfirmOpen} onClose={() => setIsClearJournalConfirmOpen(false)} onConfirm={handleClearJournalsConfirm} title={t("Confirm Journal Clearing")}>
                <p>{t("confirm_journal_clearing_p1", { count: latestNpcJournalsCount })}</p>
                <p className="mt-2">{t("confirm_journal_clearing_p2")}</p>
            </ConfirmationModal>
            {isAboutModalOpen && (
                <Modal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} title={""}>
                    <AboutContent />
                </Modal>
            )}
            {isCustomizerOpen && gameSettings && universeInfo.universe && (
                <UniverseCustomizer
                    isOpen={isCustomizerOpen}
                    onClose={() => setIsCustomizerOpen(false)}
                    gameDataState={gameDataStateForCustomizer}
                    onUpdateGameData={handleUpdateGameData}
                    universe={universeInfo.universe}
                    selectedEra={universeInfo.selectedEra!}
                />
            )}
        </div>
    );
}