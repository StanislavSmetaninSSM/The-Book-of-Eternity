
import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ClockIcon, CpuChipIcon, WrenchScrewdriverIcon, InformationCircleIcon, TrashIcon, CloudArrowDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { GameSettings, DBSaveSlotInfo } from '../types';
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
    const [isNonMagicConfirmOpen, setIsNonMagicConfirmOpen] = useState(false);
    const [advancedBudget, setAdvancedBudget] = useState(false);
    const [localSuperInstructions, setLocalSuperInstructions] = React.useState(superInstructions);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<number | null>(null);
    const [isOverwriteConfirmOpen, setIsOverwriteConfirmOpen] = useState<number | null>(null);
    const { t } = useLocalization();

    useEffect(() => {
        setLocalSuperInstructions(superInstructions);
    }, [superInstructions]);

    useEffect(() => {
        refreshDbSaveSlots();
    }, [refreshDbSaveSlots]);
    
    const handleSaveSuperInstructions = () => {
        updateSuperInstructions(localSuperInstructions);
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

    const { aiProvider, modelName, geminiThinkingBudget, nonMagicMode, useMultiStepRequests, adultMode, geminiApiKey, openRouterApiKey, youtubeApiKey, allowHistoryManipulation, correctionModelName } = gameSettings;
    const isCustomModel = aiProvider === 'gemini' && !['gemini-2.5-flash', 'gemini-2.5-pro'].includes(modelName);

    const handleProviderChange = (provider: 'gemini' | 'openrouter') => {
        updateGameSettings({
            aiProvider: provider,
            modelName: provider === 'gemini' ? 'gemini-2.5-pro' : 'google/gemini-flash-1.5'
        });
    };

    const handleGeminiModelSelect = (model: string) => {
        if (model === 'CUSTOM') {
            if (!isCustomModel) {
                 updateGameSettings({ modelName: 'gemini-2.5-flash' });
            }
        } else {
            updateGameSettings({ modelName: model });
        }
    }
    
    const handleBudgetToggle = () => {
        setAdvancedBudget(prev => {
            const isSwitchingToAdvanced = !prev;
            if (isSwitchingToAdvanced) {
                if (geminiThinkingBudget <= 200) {
                    updateGameSettings({ geminiThinkingBudget: 512 });
                }
            } else {
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
                <h3 className="text-xl font-bold text-cyan-400 mb-4 narrative-text">{t('Database Saves')}</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {dbSaveSlots.map(slot => (
                        <div key={slot.slotId} className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/60 flex items-center gap-4 flex-wrap">
                            <div className="flex-1 min-w-[150px]">
                                <p className="font-bold text-lg text-white">{t('Slot')} {slot.slotId}</p>
                                <p className="text-sm text-gray-300 truncate">{slot.playerName} - {t('Lvl {level}', { level: slot.playerLevel })}</p>
                                <p className="text-xs text-gray-400 truncate">{slot.locationName} - {t('Turn')} {slot.turnNumber}</p>
                                <p className="text-xs text-cyan-400/80 mt-1">{new Date(slot.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => onLoadFromSlot(slot.slotId)} disabled={isLoading} className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-cyan-200 bg-cyan-600/20 rounded-md hover:bg-cyan-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ArrowUpTrayIcon className="w-4 h-4" /> {t('Load')}
                                </button>
                                <button onClick={() => setIsOverwriteConfirmOpen(slot.slotId)} disabled={isLoading || !isGameActive} className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-yellow-200 bg-yellow-600/20 rounded-md hover:bg-yellow-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    <CloudArrowDownIcon className="w-4 h-4" /> {t('Save')}
                                </button>
                                <button onClick={() => setIsDeleteConfirmOpen(slot.slotId)} disabled={isLoading} className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-600/20 rounded-md hover:bg-red-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    <TrashIcon className="w-4 h-4" /> {t('Delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                    {dbSaveSlots.length === 0 && (
                        <p className="text-center text-gray-500 py-4">{t('No saved games in the database yet.')}</p>
                    )}
                </div>
                <button onClick={handleSaveToNewSlot} disabled={!isGameActive || isLoading} className="w-full mt-3 flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold text-cyan-200 bg-cyan-600/20 rounded-lg hover:bg-cyan-600/40 transition-colors border border-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                    <CloudArrowDownIcon className="w-5 h-5" />
                    {t('Save to New Slot')}
                </button>
            </div>
            
            <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-4 narrative-text">{t('File & Autosave')}</h3>
                <div className="space-y-3">
                    <button onClick={onSave} disabled={!isGameActive || isLoading} className="w-full flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold text-gray-200 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ArrowDownTrayIcon className="w-5 h-5" /> {t('Save to File')}
                    </button>
                    <div className="flex items-start gap-2 p-2 text-xs text-yellow-400/80 bg-yellow-900/20 rounded-md border border-yellow-500/30">
                        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-500" />
                        <p>{t('save_file_api_key_warning')}</p>
                    </div>
                    <button onClick={onLoad} disabled={isLoading} className="w-full flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold text-gray-200 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ArrowUpTrayIcon className="w-5 h-5" /> {t('Load from File')}
                    </button>
                </div>
                <div className="bg-gray-900/40 p-4 rounded-lg text-center mt-4">
                    <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                        <ClockIcon className="w-5 h-5" />
                        <span className="text-sm font-semibold">{t('Autosave')}:</span>
                    </div>
                    <p className="font-mono text-base text-cyan-300">{formatTimestamp(autosaveTimestamp, t)}</p>
                    <button onClick={onLoadAutosave} disabled={!autosaveTimestamp || isLoading} className="w-full mt-3 flex items-center justify-center gap-3 px-4 py-2 text-sm font-semibold text-yellow-200 bg-yellow-600/20 rounded-lg hover:bg-yellow-600/40 transition-colors border border-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ArrowUpTrayIcon className="w-5 h-5" /> {t('Load Autosave')}
                    </button>
                </div>
            </div>

            <fieldset disabled={!isGameActive || isLoading} className="space-y-4">
                 <h3 className="text-xl font-bold text-cyan-400 mb-2 narrative-text flex items-center gap-2"><WrenchScrewdriverIcon className="w-6 h-6" /> {t('Game Rules')}</h3>
                 {allowHistoryManipulation && (
                    <>
                        <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                            <div>
                                <label className="font-medium text-gray-300">{t("Hard Mode")}</label>
                                <p className="text-xs text-gray-400">{t("Increases enemy health and action difficulty for a greater challenge and enhanced rewards.")}</p>
                            </div>
                            <label htmlFor="hardModeToggle" className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="hardModeToggle" name="hardModeToggle" className="sr-only peer" checked={!!gameSettings?.hardMode} onChange={(e) => updateGameSettings({ hardMode: e.target.checked })} disabled={isLoading} />
                                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                            <div>
                                <label className="font-medium text-gray-300">{t("Non-Magic Mode")}</label>
                                <p className="text-xs text-gray-400">{t("Disables all magical elements for a realistic playthrough.")}</p>
                            </div>
                            <div onClick={handleNonMagicModeClick} className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="nonMagicModeToggle" name="nonMagicModeToggle" className="sr-only peer" checked={!!nonMagicMode} disabled={isLoading} readOnly tabIndex={-1} />
                                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                            </div>
                        </div>
                    </>
                 )}
            </fieldset>

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

                {aiProvider === 'gemini' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 mt-4">{t("AI Model")}</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          key="flash"
                          type="button"
                          onClick={() => handleGeminiModelSelect('gemini-2.5-flash')}
                          className={`p-3 rounded-md text-center transition-all border ${!isCustomModel && modelName === 'gemini-2.5-flash' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                        >
                          <span className="font-semibold">{t("Flash")}</span>
                          <span className="block text-xs text-gray-400">{t("High Quality")}</span>
                        </button>
                         <button
                          key="pro"
                          type="button"
                          onClick={() => handleGeminiModelSelect('gemini-2.5-pro')}
                          className={`p-3 rounded-md text-center transition-all border ${!isCustomModel && modelName === 'gemini-2.5-pro' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                        >
                          <span className="font-semibold">{t("Pro")}</span>
                          <span className="block text-xs text-gray-400">{t("Superior Quality")}</span>
                        </button>
                        <button
                          key="custom"
                          type="button"
                          onClick={() => handleGeminiModelSelect('CUSTOM')}
                          className={`p-3 rounded-md text-center transition-all border ${isCustomModel ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                        >
                          <span className="font-semibold">{t("Custom...")}</span>
                          <span className="block text-xs text-gray-400">{t("Specify model")}</span>
                        </button>
                      </div>
                    </div>
                     {isCustomModel && (
                        <div className="p-2 bg-gray-900/30 rounded-lg">
                            <label htmlFor="customModelName" className="block text-sm font-medium text-gray-300 mb-2">{t("Custom Model Name")}</label>
                            <input id="customModelName" name="customModelName" type="text" onChange={(e) => updateGameSettings({ modelName: e.target.value })} value={modelName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder="e.g., gemini-2.5-flash" required />
                        </div>
                    )}
                  </>
                )}
                 {aiProvider === 'openrouter' && (
                    <div className="p-2 bg-gray-900/30 rounded-lg mt-4">
                      <label htmlFor="openRouterModelName" className="block text-sm font-medium text-gray-300 mb-2">{t("OpenRouter Model")}</label>
                      <input 
                          id="openRouterModelName" 
                          name="openRouterModelName" 
                          type="text" 
                          onChange={(e) => updateGameSettings({ modelName: e.target.value })}
                          value={modelName} 
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" 
                          placeholder={t("e.g., google/gemini-flash-1.5")} 
                          required 
                      />
                    </div>
                )}
                
                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                    <div>
                        <label htmlFor="multiStepToggle" className="font-medium text-gray-300">{t("Multi-Step Request Architecture")}</label>
                        <p className="text-xs text-gray-400">{t("Use a multi-step process for higher quality responses. Disabling may be faster but can reduce coherence.")}</p>
                    </div>
                    <label htmlFor="multiStepToggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="multiStepToggle" name="multiStepToggle" className="sr-only peer" checked={useMultiStepRequests !== false} onChange={(e) => updateGameSettings({ useMultiStepRequests: e.target.checked })} disabled={isLoading} />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-yellow-500/20">
                    <div>
                        <label htmlFor="adultModeToggle" className="font-medium text-yellow-300">{t("Adult Mode (21+)")}</label>
                        <p className="text-xs text-gray-400">{t("Enables less restrictive, player-driven narrative content.")}</p>
                    </div>
                    <div onClick={handleAdultModeClick} className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="adultModeToggle" name="adultModeToggle" className="sr-only peer" checked={!!adultMode} disabled={isLoading} readOnly tabIndex={-1} />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-yellow-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="youtubeApiKey" className="block text-sm font-medium text-gray-300">{t("YouTube API Key (Optional)")}</label>
                    <input id="youtubeApiKey" name="youtubeApiKey" type="password" onChange={(e) => updateGameSettings({ youtubeApiKey: e.target.value })} value={youtubeApiKey} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Required for music feature")} />
                </div>
            </fieldset>

            {allowHistoryManipulation && (
                <fieldset disabled={!isGameActive || isLoading}>
                    <h3 className="text-xl font-bold text-cyan-400 mb-2 narrative-text flex items-center gap-2"><WrenchScrewdriverIcon className="w-6 h-6" /> {t('Player Super-Instructions')}</h3>
                    <div className="bg-gray-900/30 p-3 rounded-lg border border-cyan-500/20">
                        <p className="text-xs text-gray-400 mb-2">{t("These instructions override the GM's default behavior. Use with caution.")}</p>
                        <textarea value={localSuperInstructions} onChange={(e) => setLocalSuperInstructions(e.target.value)} disabled={isLoading} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[100px]" />
                        <button onClick={handleSaveSuperInstructions} disabled={isLoading || localSuperInstructions === superInstructions} className="w-full mt-2 flex items-center justify-center gap-3 px-4 py-2 text-sm font-semibold text-cyan-200 bg-cyan-600/20 rounded-lg hover:bg-cyan-600/40 transition-colors border border-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                            {t('Save Super-Instructions')}
                        </button>
                    </div>
                </fieldset>
            )}

            <div className="pt-4"><AboutContent /></div>

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
            <ConfirmationModal isOpen={isNonMagicConfirmOpen} onClose={() => setIsNonMagicConfirmOpen(false)} onConfirm={confirmNonMagicMode} title={t("non_magic_mode_title")}>
                <p>{t("non_magic_mode_warning_p1")}</p>
                <p>{t("non_magic_mode_warning_p2")}</p>
                <p className="font-bold">{t("non_magic_mode_warning_p3")}</p>
                <p>{t("non_magic_mode_warning_p4")}</p>
            </ConfirmationModal>
        </div>
    );
}
