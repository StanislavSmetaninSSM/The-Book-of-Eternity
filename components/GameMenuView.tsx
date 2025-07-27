


import React, { useState } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ClockIcon, CpuChipIcon, WrenchScrewdriverIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { GameSettings } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import ConfirmationModal from './ConfirmationModal';
import AboutContent from './AboutContent';

interface GameMenuViewProps {
    onSave: () => void;
    onLoad: () => void;
    onLoadAutosave: () => void;
    autosaveTimestamp: string | null;
    isGameActive: boolean;
    gameSettings: GameSettings | null;
    updateGameSettings: (newSettings: Partial<GameSettings>) => void;
    isLoading: boolean;
}

const formatTimestamp = (timestamp: string | null, t: (key: string) => string): string => {
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
    isLoading
}: GameMenuViewProps): React.ReactNode {
    const [isAdultConfirmOpen, setIsAdultConfirmOpen] = useState(false);
    const [isNonMagicConfirmOpen, setIsNonMagicConfirmOpen] = useState(false);
    const [advancedBudget, setAdvancedBudget] = useState(false);
    const { t } = useLocalization();
    
    if (!gameSettings) {
        // Render only the save/load part if gameSettings are not available yet
        // This case might happen briefly on load
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

    const { aiProvider, modelName, geminiThinkingBudget, nonMagicMode, useMultiStepRequests, adultMode, geminiApiKey, openRouterApiKey, allowHistoryManipulation, correctionModelName } = gameSettings;
    const isCustomModel = aiProvider === 'gemini' && !['gemini-2.5-flash', 'gemini-2.5-pro'].includes(modelName);

    const handleProviderChange = (provider: 'gemini' | 'openrouter') => {
        const newModelName = provider === 'gemini' 
            ? 'gemini-2.5-flash' 
            : 'google/gemini-flash-1.5';
        updateGameSettings({
            aiProvider: provider,
            modelName: newModelName
        });
    };

    const handleGeminiModelSelect = (model: string) => {
        if (model === 'CUSTOM') {
            updateGameSettings({ modelName: 'gemini-2.5-flash' }); // Start with a valid custom model
        } else {
            updateGameSettings({ modelName: model });
        }
    }
    
    const handleBudgetToggle = () => {
        setAdvancedBudget(prev => {
            const isSwitchingToAdvanced = !prev;
            if (isSwitchingToAdvanced) {
                // If current value is in the simple range, set to advanced default
                if (geminiThinkingBudget <= 200) {
                    updateGameSettings({ geminiThinkingBudget: 512 });
                }
            } else { // Switching back to simple
                if (geminiThinkingBudget > 200) {
                    updateGameSettings({ geminiThinkingBudget: 200 });
                }
            }
            return !prev;
        });
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

    const handleNonMagicModeClick = () => {
      if (isLoading) return;
      if (nonMagicMode) {
        updateGameSettings({ nonMagicMode: false });
      } else {
        setIsNonMagicConfirmOpen(true);
      }
    };

    const confirmNonMagicMode = () => {
        updateGameSettings({ nonMagicMode: true });
        setIsNonMagicConfirmOpen(false);
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-4 narrative-text">{t('Game Management')}</h3>
                <div className="space-y-3">
                    <button
                        onClick={onSave}
                        disabled={!isGameActive || isLoading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold text-cyan-200 bg-cyan-600/20 rounded-lg hover:bg-cyan-600/40 transition-colors border border-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        {t('Save to File')}
                    </button>
                    <button
                        onClick={onLoad}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold text-cyan-200 bg-cyan-600/20 rounded-lg hover:bg-cyan-600/40 transition-colors border border-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5" />
                        {t('Load from File')}
                    </button>
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-4 narrative-text">{t('Autosave')}</h3>
                <div className="bg-gray-900/40 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400 mb-3">
                        <ClockIcon className="w-5 h-5" />
                        <span className="text-sm font-semibold">{t('Last saved:')}</span>
                    </div>
                    <p className="font-mono text-lg text-cyan-300">{formatTimestamp(autosaveTimestamp, t)}</p>
                    <button
                        onClick={onLoadAutosave}
                        disabled={!autosaveTimestamp || isLoading}
                        className="w-full mt-4 flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold text-yellow-200 bg-yellow-600/20 rounded-lg hover:bg-yellow-600/40 transition-colors border border-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-600/20"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5" />
                        {t('Load Autosave')}
                    </button>
                </div>
            </div>
            <fieldset disabled={!isGameActive || isLoading} className="space-y-4">
                 <h3 className="text-xl font-bold text-cyan-400 mb-2 narrative-text flex items-center gap-2"><WrenchScrewdriverIcon className="w-6 h-6" /> {t('Game Rules')}</h3>
                 {allowHistoryManipulation && (
                    <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                        <div>
                            <label className="font-medium text-gray-300">{t("Non-Magic Mode")}</label>
                            <p className="text-xs text-gray-400">{t("Disables all magical elements for a realistic playthrough.")}</p>
                        </div>
                        <div onClick={handleNonMagicModeClick} className="relative inline-flex items-center cursor-pointer">
                            <input
                            type="checkbox"
                            id="nonMagicModeToggle"
                            name="nonMagicModeToggle"
                            className="sr-only peer"
                            checked={!!nonMagicMode}
                            disabled={isLoading}
                            readOnly
                            tabIndex={-1}
                            />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                        </div>
                    </div>
                 )}
            </fieldset>

             <fieldset disabled={!isGameActive || isLoading} className="space-y-4">
                <h3 className="text-xl font-bold text-cyan-400 mb-2 narrative-text flex items-center gap-2"><CpuChipIcon className="w-6 h-6" /> {t('AI Settings')}</h3>

                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                    <div>
                        <label htmlFor="multiStepToggle" className="font-medium text-gray-300">{t("Multi-Step Request Architecture")}</label>
                        <p className="text-xs text-gray-400">{t("Use a multi-step process for higher quality responses. Disabling may be faster but can reduce coherence.")}</p>
                    </div>
                    <label htmlFor="multiStepToggle" className="relative inline-flex items-center cursor-pointer">
                        <input
                        type="checkbox"
                        id="multiStepToggle"
                        name="multiStepToggle"
                        className="sr-only peer"
                        checked={useMultiStepRequests !== false} // default to true if undefined
                        onChange={(e) => updateGameSettings({ useMultiStepRequests: e.target.checked })}
                        disabled={isLoading}
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-yellow-500/20">
                    <div>
                        <label htmlFor="adultModeToggle" className="font-medium text-yellow-300">{t("Adult Mode (21+)")}</label>
                        <p className="text-xs text-gray-400">{t("Enables less restrictive, player-driven narrative content.")}</p>
                    </div>
                    <div onClick={handleAdultModeClick} className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="adultModeToggle"
                            name="adultModeToggle"
                            className="sr-only peer"
                            checked={!!adultMode}
                            disabled={isLoading}
                            readOnly
                            tabIndex={-1}
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-yellow-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t("AI Provider")}</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => handleProviderChange('gemini')} className={`p-3 rounded-md text-center transition-all border ${aiProvider === 'gemini' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}>
                            {t('Google Gemini')}
                        </button>
                        <button type="button" onClick={() => handleProviderChange('openrouter')} className={`p-3 rounded-md text-center transition-all border ${aiProvider === 'openrouter' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}>
                            {t('OpenRouter')}
                        </button>
                    </div>
                </div>
                
                {aiProvider === 'gemini' && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="geminiApiKeyIngame" className="block text-sm font-medium text-gray-300 mb-2">{t("Google Gemini API Key (Optional)")}</label>
                            <input id="geminiApiKeyIngame" name="geminiApiKey" type="password" onChange={(e) => updateGameSettings({ geminiApiKey: e.target.value })} value={geminiApiKey || ''} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Leave blank to use pre-configured key")} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t("AI Model")}</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button type="button" onClick={() => handleGeminiModelSelect('gemini-2.5-flash')} className={`p-3 rounded-md text-center transition-all border ${!isCustomModel && modelName === 'gemini-2.5-flash' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}>
                                    <span className="font-semibold">{t("Flash")}</span>
                                    <span className="block text-xs text-gray-400">{t("High Quality")}</span>
                                </button>
                                <button type="button" onClick={() => handleGeminiModelSelect('gemini-2.5-pro')} className={`p-3 rounded-md text-center transition-all border ${!isCustomModel && modelName === 'gemini-2.5-pro' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}>
                                    <span className="font-semibold">{t("Pro")}</span>
                                    <span className="block text-xs text-gray-400">{t("Superior Quality")}</span>
                                </button>
                                <button type="button" onClick={() => handleGeminiModelSelect('CUSTOM')} className={`p-3 rounded-md text-center transition-all border ${isCustomModel ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}>
                                    <span className="font-semibold">{t("Custom...")}</span>
                                    <span className="block text-xs text-gray-400">{t("Specify model")}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {aiProvider === 'gemini' && isCustomModel && (
                    <div className="p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                        <label htmlFor="customModelName" className="block text-sm font-medium text-gray-300 mb-2">{t("Custom Model Name")}</label>
                        <input id="customModelName" name="customModelName" type="text" onChange={(e) => updateGameSettings({ modelName: e.target.value })} value={modelName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder="e.g., gemini-2.5-flash" />
                    </div>
                )}

                {aiProvider === 'gemini' && (
                   <div className="p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20 mt-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor={advancedBudget ? "geminiThinkingBudgetIngameAdvanced" : "geminiThinkingBudgetIngame"} className="font-medium text-gray-300 flex items-center gap-2">
                                {t("Gemini Thinking Budget")}
                                <button type="button" onClick={handleBudgetToggle} className="px-2 py-0.5 text-xs bg-gray-700/60 text-cyan-400 rounded-full hover:bg-gray-700 transition-colors" title={advancedBudget ? t("Switch to simple slider") : t("Switch to advanced input")}>
                                    {advancedBudget ? t("Simple") : t("Advanced")}
                                </button>
                            </label>
                            {!advancedBudget && <span className="font-mono text-cyan-300">{geminiThinkingBudget}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{t("Controls AI's 'thinking' token budget. Higher is better quality, lower is faster. 0 disables it.")}</p>
                        
                        {!advancedBudget ? (
                            <input
                                type="range"
                                id="geminiThinkingBudgetIngame"
                                min="0"
                                max="200"
                                step="10"
                                value={geminiThinkingBudget}
                                onChange={(e) => updateGameSettings({ geminiThinkingBudget: parseInt(e.target.value, 10) })}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                disabled={isLoading}
                            />
                        ) : (
                            <input
                                type="number"
                                id="geminiThinkingBudgetIngameAdvanced"
                                min="0"
                                max="24576"
                                step="1"
                                value={geminiThinkingBudget}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    if (value > 24576) return;
                                    updateGameSettings({ geminiThinkingBudget: isNaN(value) ? 0 : value });
                                }}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition font-mono"
                                disabled={isLoading}
                            />
                        )}
                    </div>
                )}

                {aiProvider === 'openrouter' && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="openRouterApiKeyIngame" className="block text-sm font-medium text-gray-300 mb-2">{t("OpenRouter API Key (Optional)")}</label>
                            <input id="openRouterApiKeyIngame" name="openRouterApiKey" type="password" onChange={(e) => updateGameSettings({ openRouterApiKey: e.target.value })} value={openRouterApiKey || ''} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Leave blank to use pre-configured key")} />
                        </div>
                        <div className="p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                            <label htmlFor="openRouterModelName" className="block text-sm font-medium text-gray-300 mb-2">{t("OpenRouter Model")}</label>
                            <input id="openRouterModelName" name="openRouterModelName" type="text" onChange={(e) => updateGameSettings({ modelName: e.target.value })} value={modelName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("e.g., google/gemini-flash-1.5")} />
                        </div>
                    </div>
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
                                disabled={isLoading}
                                onChange={(e) => {
                                    const value = e.target.checked ? 'gemini-2.5-flash' : '';
                                    updateGameSettings({ correctionModelName: value });
                                }}
                            />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                        </label>
                    </div>
                ) : (
                    <div className="p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20 mt-2">
                        <label htmlFor="correctionModelNameIngame" className="font-medium text-gray-300 flex items-center gap-2">
                            {t("Correction Model (Optional)")}
                            <span className="text-gray-400 hover:text-white cursor-pointer" title={t("Correction Model Tooltip")}>
                                <InformationCircleIcon className="w-4 h-4" />
                            </span>
                        </label>
                        <p className="text-xs text-gray-400 mb-2">{t("Model to use for correcting JSON errors. Leave blank to use the primary model.")}</p>
                        <input
                            id="correctionModelNameIngame"
                            name="correctionModelName"
                            type="text"
                            onChange={(e) => updateGameSettings({ correctionModelName: e.target.value })}
                            value={correctionModelName || ''}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition"
                            placeholder={t("e.g., google/gemini-pro-1.5")}
                            disabled={isLoading}
                        />
                    </div>
                )}
            </fieldset>
            <div className="pt-4">
              <AboutContent />
            </div>
            <ConfirmationModal
                isOpen={isAdultConfirmOpen}
                onClose={() => setIsAdultConfirmOpen(false)}
                onConfirm={confirmAdultMode}
                title={t("Adult Mode (21+)")}
            >
                <p>{t("adult_mode_warning_p1")}</p>
                <p>{t("adult_mode_warning_p2")}</p>
                <p>{t("adult_mode_warning_p3")}</p>
                <p className="font-bold">{t("adult_mode_warning_p4")}</p>
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={isNonMagicConfirmOpen}
                onClose={() => setIsNonMagicConfirmOpen(false)}
                onConfirm={confirmNonMagicMode}
                title={t("non_magic_mode_title")}
            >
                <p>{t("non_magic_mode_warning_p1")}</p>
                <p>{t("non_magic_mode_warning_p2")}</p>
                <p className="font-bold">{t("non_magic_mode_warning_p3")}</p>
                <p>{t("non_magic_mode_warning_p4")}</p>
            </ConfirmationModal>
        </div>
    );
}