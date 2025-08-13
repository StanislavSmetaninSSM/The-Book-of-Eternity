
import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ClockIcon, CpuChipIcon, WrenchScrewdriverIcon, InformationCircleIcon, TrashIcon, CloudArrowDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { GameSettings, DBSaveSlotInfo } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import ConfirmationModal from './ConfirmationModal';
import AboutContent from './AboutContent';
import Modal from './Modal';


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
}: GameMenuViewProps): React.ReactNode {
    const [isAdultConfirmOpen, setIsAdultConfirmOpen] = useState(false);
    const [advancedBudget, setAdvancedBudget] = useState(false);
    const [localSuperInstructions, setLocalSuperInstructions] = React.useState(superInstructions);
    const [localWorldInfo, setLocalWorldInfo] = useState(gameSettings?.gameWorldInformation?.customInfo ?? '');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<number | null>(null);
    const [isOverwriteConfirmOpen, setIsOverwriteConfirmOpen] = useState<number | null>(null);
    const [isCustomModelModalOpen, setIsCustomModelModalOpen] = useState(false);
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

    const { aiProvider, modelName, geminiThinkingBudget, adultMode, geminiApiKey, openRouterApiKey, youtubeApiKey, allowHistoryManipulation, correctionModelName, useDynamicThinkingBudget, isCustomModel, customModelName, openRouterModelName, hardMode, notificationSound } = gameSettings;

    const handleProviderChange = (provider: 'gemini' | 'openrouter') => {
        updateGameSettings({
            aiProvider: provider,
            modelName: provider === 'gemini' ? 'gemini-2.5-pro' : (openRouterModelName || 'google/gemini-flash-1.5'),
            isCustomModel: false,
        });
    };
    
    const handleModelChange = (modelValue: string) => {
        if (modelValue === 'CUSTOM') {
            setIsCustomModelModalOpen(true);
        } else {
            updateGameSettings({
                isCustomModel: false,
                modelName: modelValue,
            });
        }
    };

    const handleCustomModelSave = (newCustomModel: string) => {
        updateGameSettings({
            isCustomModel: true,
            customModelName: newCustomModel,
            modelName: newCustomModel
        });
        setIsCustomModelModalOpen(false);
    };

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
    
    const handleBudgetToggle = () => {
      setAdvancedBudget(prev => {
          const isSwitchingToSimple = prev;
          if (isSwitchingToSimple && (geminiThinkingBudget ?? 0) > 1000) {
              updateGameSettings({ geminiThinkingBudget: 1000 });
          }
          return !prev;
      });
    };

    return (
        <div className="space-y-8">
            <fieldset disabled={!isGameActive || isLoading} className="space-y-4">
                <h3 className="text-xl font-bold text-cyan-400 mb-2 narrative-text flex items-center gap-2"><CpuChipIcon className="w-6 h-6" /> {t('AI Settings')}</h3>
                
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

                {aiProvider === 'gemini' ? (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="inGameGeminiApiKey" className="block text-sm font-medium text-gray-300">{t("Google Gemini API Key (Optional)")}</label>
                      <input id="inGameGeminiApiKey" name="geminiApiKey" type="password" onChange={(e) => updateGameSettings({ geminiApiKey: e.target.value })} value={geminiApiKey} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Leave blank to use pre-configured key")} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t("AI Model")}</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <button type="button" onClick={() => handleModelChange('gemini-2.5-flash')} className={`p-3 rounded-md text-center transition-all border ${!isCustomModel && modelName === 'gemini-2.5-flash' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}><span className="font-semibold">{t("Flash")}</span><span className="block text-xs text-gray-400">{t("High Quality")}</span></button>
                        <button type="button" onClick={() => handleModelChange('gemini-2.5-pro')} className={`p-3 rounded-md text-center transition-all border ${!isCustomModel && modelName === 'gemini-2.5-pro' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}><span className="font-semibold">{t("Pro")}</span><span className="block text-xs text-gray-400">{t("Superior Quality")}</span></button>
                        <button type="button" onClick={() => handleModelChange('gemini-hybrid-pro-flash')} className={`p-3 rounded-md text-center transition-all border ${!isCustomModel && modelName === 'gemini-hybrid-pro-flash' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}><span className="font-semibold">{t("Hybrid (Pro/Flash)")}</span><span className="block text-xs text-gray-400">{t("Best Speed/Quality")}</span></button>
                        <button type="button" onClick={() => handleModelChange('CUSTOM')} className={`p-3 rounded-md text-center transition-all border ${isCustomModel ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}><span className="font-semibold">{t("Custom...")}</span><span className="block text-xs text-gray-400">{t("Specify model")}</span></button>
                      </div>
                    </div>
                  </>
                ) : ( 
                   <>
                    <div className="space-y-2">
                        <label htmlFor="inGameOpenRouterApiKey" className="block text-sm font-medium text-gray-300">{t("OpenRouter API Key (Optional)")}</label>
                        <input id="inGameOpenRouterApiKey" name="openRouterApiKey" type="password" onChange={(e) => updateGameSettings({ openRouterApiKey: e.target.value })} value={openRouterApiKey} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Leave blank to use pre-configured key")} />
                    </div>
                    <div className="p-2 bg-gray-900/30 rounded-lg">
                      <label htmlFor="inGameOpenRouterModelName" className="block text-sm font-medium text-gray-300 mb-2">{t("OpenRouter Model")}</label>
                      <input id="inGameOpenRouterModelName" name="openRouterModelName" type="text" onChange={(e) => updateGameSettings({ openRouterModelName: e.target.value, modelName: e.target.value })} value={openRouterModelName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("e.g., google/gemini-flash-1.5")} required />
                    </div>
                   </>
                )}

                {aiProvider === 'gemini' ? (
                    <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                        <div>
                            <label className="font-medium text-gray-300 flex items-center gap-2">
                                {t("Use Flash for Corrections")}
                                <span className="text-gray-400 hover:text-white cursor-pointer" title={t("Use Flash for Corrections Tooltip")}>
                                    <InformationCircleIcon className="w-4 h-4" />
                                </span>
                            </label>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={correctionModelName === 'gemini-2.5-flash'}
                                onChange={(e) => updateGameSettings({ correctionModelName: e.target.checked ? 'gemini-2.5-flash' : '' })}
                            />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                ) : (
                    <div className="p-3 bg-gray-900/30 rounded-lg mt-2">
                        <label htmlFor="inGameCorrectionModelName" className="font-medium text-gray-300 flex items-center gap-2">
                            {t("Correction Model (Optional)")}
                            <span className="text-gray-400 hover:text-white cursor-pointer" title={t("Correction Model Tooltip")}>
                                <InformationCircleIcon className="w-4 h-4" />
                            </span>
                        </label>
                        <p className="text-xs text-gray-400 mb-2">{t("Model to use for correcting JSON errors. Leave blank to use the primary model.")}</p>
                        <input 
                            id="inGameCorrectionModelName" 
                            name="correctionModelName" 
                            type="text" 
                            onChange={(e) => updateGameSettings({ correctionModelName: e.target.value })} 
                            value={correctionModelName || ''} 
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" 
                            placeholder={t("e.g., google/gemini-pro-1.5")}
                        />
                    </div>
                )}
                
                <div className="space-y-4">
                    <div className="p-3 bg-gray-900/30 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="font-medium text-gray-300">{t("Use dynamic thinking budget")}</label>
                                <p className="text-xs text-gray-400">{t("Lets the model decide how much thinking is needed.")}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={!!useDynamicThinkingBudget} onChange={(e) => updateGameSettings({ useDynamicThinkingBudget: e.target.checked })} />
                                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                            </label>
                        </div>
                    </div>

                    <div className={`p-3 bg-gray-900/30 rounded-lg transition-opacity ${!!useDynamicThinkingBudget ? 'opacity-50' : ''}`}>
                      <fieldset disabled={!!useDynamicThinkingBudget}>
                        <div className="flex justify-between items-center">
                            <label htmlFor={advancedBudget ? "inGameGeminiThinkingBudgetAdvanced" : "inGameGeminiThinkingBudget"} className="font-medium text-gray-300 flex items-center gap-2">
                              {t("Gemini Thinking Budget")}
                              <button type="button" onClick={handleBudgetToggle} className="px-2 py-0.5 text-xs bg-gray-700/60 text-cyan-400 rounded-full hover:bg-gray-700 transition-colors" title={advancedBudget ? t("Switch to simple slider") : t("Switch to advanced input")}>
                                  {advancedBudget ? t("Simple") : t("Advanced")}
                              </button>
                            </label>
                            <span className="font-mono text-cyan-300">{geminiThinkingBudget}</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{t("Controls AI's 'thinking' token budget. Higher is better quality, lower is faster. 0 disables it.")}</p>
                          
                          {!advancedBudget ? (
                            <input
                                type="range"
                                id="inGameGeminiThinkingBudget"
                                min="0"
                                max="1000"
                                step="1"
                                value={geminiThinkingBudget || 0}
                                onChange={(e) => updateGameSettings({ geminiThinkingBudget: parseInt(e.target.value, 10) })}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                          ) : (
                            <input
                                type="number"
                                id="inGameGeminiThinkingBudgetAdvanced"
                                min="0"
                                max="32768"
                                step="1"
                                value={geminiThinkingBudget || 0}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    if (isNaN(value)) {
                                      updateGameSettings({ geminiThinkingBudget: 0 });
                                      return;
                                    }
                                    if (value > 32768) return;
                                    updateGameSettings({ geminiThinkingBudget: value });
                                }}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition font-mono"
                            />
                          )}
                      </fieldset>
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
                     <div className="space-y-2">
                        <label htmlFor="inGameYoutubeApiKey" className="block text-sm font-medium text-gray-300">{t("YouTube API Key (Optional)")}</label>
                        <input id="inGameYoutubeApiKey" name="youtubeApiKey" type="password" onChange={(e) => updateGameSettings({ youtubeApiKey: e.target.value })} value={youtubeApiKey} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Required for music feature")} />
                    </div>
                </div>
            </fieldset>
            
            <fieldset disabled={!isGameActive || isLoading}>
                <h3 className="text-xl font-bold text-cyan-400 my-4 narrative-text">{t("Game Rules")}</h3>
                <div className="p-4 bg-gray-900/30 rounded-lg border border-cyan-500/20 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                        <div>
                            <label className="font-medium text-gray-300">{t("Hard Mode")}</label>
                            <p className="text-xs text-gray-400">{t("Increases enemy health and action difficulty for a greater challenge and enhanced rewards.")}</p>
                        </div>
                        <label htmlFor="inGameHardMode" className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="inGameHardMode"
                                className="sr-only peer"
                                checked={!!hardMode}
                                onChange={(e) => updateGameSettings({ hardMode: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                     <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                        <div>
                            <label className="font-medium text-gray-300">{t("Notification Sound")}</label>
                            <p className="text-xs text-gray-400">{t("Play a sound when the GM's response is ready.")}</p>
                        </div>
                         <label htmlFor="inGameNotificationSound" className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="inGameNotificationSound"
                                name="notificationSound"
                                className="sr-only peer"
                                checked={!!notificationSound}
                                onChange={(e) => updateGameSettings({ notificationSound: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                     <div className="p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="font-medium text-gray-300">{t("Allow History Manipulation")}</label>
                                <p className="text-xs text-gray-400">{t("allowHistoryManipulationDescription")}</p>
                            </div>
                            <label htmlFor="inGameAllowHistoryManipulation" className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="inGameAllowHistoryManipulation"
                                    name="allowHistoryManipulation"
                                    className="sr-only peer"
                                    checked={!!allowHistoryManipulation}
                                    onChange={(e) => updateGameSettings({ allowHistoryManipulation: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                            </label>
                        </div>
                        {allowHistoryManipulation && (
                            <div className="space-y-4 pt-4 border-t border-cyan-500/20">
                                <div>
                                    <label htmlFor="inGameSuperInstructions" className="block text-sm font-medium text-gray-300 mb-2">{t("Player Super-Instructions")}</label>
                                    <p className="text-xs text-gray-400 mb-2">{t("These instructions override the GM's default behavior. Use with caution.")}</p>
                                    <textarea
                                        id="inGameSuperInstructions"
                                        value={localSuperInstructions}
                                        onChange={(e) => setLocalSuperInstructions(e.target.value)}
                                        className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[100px]"
                                    />
                                    <button onClick={handleSaveSuperInstructions} className="mt-2 w-full bg-cyan-600/20 text-cyan-200 hover:bg-cyan-600/40 font-semibold py-2 px-4 rounded-md transition-colors">
                                        {t("Save Super-Instructions")}
                                    </button>
                                </div>
                                <div>
                                    <label htmlFor="inGameWorldInformation" className="block text-sm font-medium text-gray-300 mb-2">{t("World Information")}</label>
                                    <textarea
                                        id="inGameWorldInformation"
                                        value={localWorldInfo}
                                        onChange={(e) => setLocalWorldInfo(e.target.value)}
                                        className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[100px]"
                                    />
                                    <button onClick={handleSaveWorldInfo} className="mt-2 w-full bg-cyan-600/20 text-cyan-200 hover:bg-cyan-600/40 font-semibold py-2 px-4 rounded-md transition-colors">
                                        {t("Save World Information")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </fieldset>

            <div>
              <h3 className="text-xl font-bold text-cyan-400 mb-4 narrative-text">{t('Game Management')}</h3>
              <div className="space-y-3">
                  <div className="p-4 bg-gray-900/30 rounded-lg">
                      <h4 className="font-semibold text-gray-300 mb-2">{t("Database Saves")}</h4>
                      <div className="space-y-2">
                        <button onClick={handleSaveToNewSlot} disabled={isLoading} className="w-full bg-cyan-600/20 text-cyan-200 hover:bg-cyan-600/40 font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50">{t("Save to New Slot")}</button>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                            {dbSaveSlots.length > 0 ? dbSaveSlots.map(slot => (
                                <div key={slot.slotId} className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-md">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white truncate">{slot.playerName} - {t("Lvl {level}", { level: slot.playerLevel })}</p>
                                        <p className="text-xs text-gray-400 truncate">{slot.locationName} - {t("Turn")} {slot.turnNumber}</p>
                                        <p className="text-xs text-gray-500">{new Date(slot.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className="flex-shrink-0 flex gap-2">
                                        <button onClick={() => setIsOverwriteConfirmOpen(slot.slotId)} className="p-2 bg-yellow-600/20 hover:bg-yellow-600/40 rounded text-yellow-300 transition-colors"><CloudArrowDownIcon className="w-4 h-4"/></button>
                                        <button onClick={() => onLoadFromSlot(slot.slotId)} className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded text-blue-300 transition-colors"><ArrowUpTrayIcon className="w-4 h-4"/></button>
                                        <button onClick={() => setIsDeleteConfirmOpen(slot.slotId)} className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded text-red-300 transition-colors"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            )) : <p className="text-center text-sm text-gray-500 py-4">{t("No saved games in the database yet.")}</p>}
                        </div>
                      </div>
                  </div>
                  <div className="p-4 bg-gray-900/30 rounded-lg">
                    <h4 className="font-semibold text-gray-300 mb-2">{t("File & Autosave")}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={onSave} className="bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-md transition-colors border border-gray-600 flex items-center justify-center gap-2"><ArrowDownTrayIcon className="w-5 h-5"/>{t("Save to File")}</button>
                      <button onClick={onLoad} className="bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-md transition-colors border border-gray-600 flex items-center justify-center gap-2"><ArrowUpTrayIcon className="w-5 h-5"/>{t("Load")}</button>
                    </div>
                     <button onClick={onLoadAutosave} disabled={!autosaveTimestamp} className="w-full mt-3 bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-md transition-colors border border-gray-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ClockIcon className="w-5 h-5"/>
                        <div>{t("Autosave")}: <span className="font-normal text-cyan-400/80">{formatTimestamp(autosaveTimestamp, t)}</span></div>
                     </button>
                  </div>
              </div>
            </div>

            <div className="pt-4"><AboutContent /></div>

            {isCustomModelModalOpen && (
                <Modal isOpen={isCustomModelModalOpen} onClose={() => setIsCustomModelModalOpen(false)} title={t('Custom Model Name')}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const newCustomModel = (e.currentTarget.elements.namedItem('customModelInput') as HTMLInputElement).value;
                        handleCustomModelSave(newCustomModel);
                    }}>
                        <input name="customModelInput" defaultValue={customModelName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder="e.g., gemini-2.5-flash" required autoFocus />
                        <button type="submit" className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">{t('Submit')}</button>
                    </form>
                </Modal>
            )}

            <ConfirmationModal isOpen={isDeleteConfirmOpen !== null} onClose={() => setIsDeleteConfirmOpen(null)} onConfirm={confirmDelete} title={t("Confirm Deletion")}>
                <p>{t("Are you sure you want to delete this save slot? This action cannot be undone.")}</p>
            </ConfirmationModal>
            <ConfirmationModal isOpen={isOverwriteConfirmOpen !== null} onClose={() => setIsOverwriteConfirmOpen(null)} onConfirm={confirmOverwrite} title={t("Confirm Overwrite")}>
                <p>{t("Are you sure you want to overwrite this save slot with your current progress?")}</p>
            </ConfirmationModal>
            <ConfirmationModal isOpen={isAdultConfirmOpen} onClose={() => setIsAdultConfirmOpen(false)} onConfirm={confirmAdultMode} title={t("Adult Mode (21+)")}>
                <p>{t("adult_mode_warning_p1")}</p>
                <p>{t("adult_mode_warning_p2")}</p>
                <p>{t("adult_mode_warning_p3")}</p>
                <p className="font-bold">{t("adult_mode_warning_p4")}</p>
            </ConfirmationModal>
        </div>
    );
}
