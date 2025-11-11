import React, { useState, useEffect, useMemo } from 'react';
import { PlayerCharacter, GameSettings, ImageCacheEntry } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { UserCircleIcon, ChevronUpIcon, ChevronDownIcon, BoltIcon } from '@heroicons/react/24/solid';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import ImageRenderer from './ImageRenderer';

interface PartyStatusProps {
    players: PlayerCharacter[];
    activePlayerIndex: number;
    gameSettings: GameSettings | null;
    onPassTurn: () => void;
    imageCache: Record<string, ImageCacheEntry>;
    onImageGenerated: (prompt: string, src: string, sourceProvider: ImageCacheEntry['sourceProvider'], sourceModel?: string) => void;
    onOpenImageModal: (displayPrompt: string, originalTextPrompt: string, onClearCustom?: () => void, onUpload?: (base64: string) => void) => void;
    isFullScreen?: boolean;
    onExpandFullScreen?: () => void;
    onCollapseFullScreen?: () => void;
    updatePlayerPortrait?: (playerId: string, portraitData: { prompt?: string | null; custom?: string | null; }) => void;
    isLoading?: boolean;
}

export const PartyStatus: React.FC<PartyStatusProps> = ({
    players,
    activePlayerIndex,
    gameSettings,
    onPassTurn,
    imageCache,
    onImageGenerated,
    onOpenImageModal,
    isFullScreen = false,
    onExpandFullScreen,
    onCollapseFullScreen,
    updatePlayerPortrait,
    isLoading
}) => {
    const { t } = useLocalization();
    const [isExpanded, setIsExpanded] = useState(true);

    if (!players || players.length === 0) {
        return null;
    }

    if (!isExpanded && !isFullScreen) {
        return (
            <div className="mb-4 pointer-events-auto animate-fade-in-down">
                <button
                    onClick={() => setIsExpanded(true)}
                    className="w-auto flex items-center gap-2 p-3 bg-[#212733] border border-gray-700/60 rounded-lg hover:bg-gray-800/70 transition-colors"
                    aria-expanded="false"
                    title={t('Expand Players Panel')}
                >
                    <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">{t('PLAYERS')}</span>
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                </button>
            </div>
        );
    }

    return (
        <div className={`bg-[#212733]/90 border border-gray-700/60 rounded-lg pointer-events-auto animate-fade-in-down transition-all duration-300 backdrop-blur-sm ${isFullScreen ? 'h-full flex flex-col w-full' : 'mb-4 max-w-7xl mx-auto w-full'}`}>
            <div className="w-full flex justify-between items-center p-3 flex-shrink-0">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">{isFullScreen ? t('Party Status') : t('PLAYERS')}</h3>
                <div className="flex items-center gap-2">
                    {!isFullScreen && onExpandFullScreen && (
                        <button onClick={(e) => { e.stopPropagation(); onExpandFullScreen(); }} className="p-1 text-gray-400 rounded-full hover:bg-gray-700/80" title={t('Expand Players Panel')}>
                            <ArrowsPointingOutIcon className="w-5 h-5" />
                        </button>
                    )}
                    {isFullScreen && onCollapseFullScreen && (
                        <button onClick={(e) => { e.stopPropagation(); onCollapseFullScreen(); }} className="p-1 text-gray-400 rounded-full hover:bg-gray-700/80" title={t('Collapse Players Panel')}>
                            <ArrowsPointingInIcon className="w-5 h-5" />
                        </button>
                    )}
                    {!isFullScreen && (
                        <button onClick={() => setIsExpanded(false)} className="p-1 text-gray-400 rounded-full hover:bg-gray-700/80" title={t('Collapse Players Panel')}>
                            <ChevronUpIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className={`p-4 border-t border-gray-700/60 ${isFullScreen ? 'flex-1 overflow-y-auto' : ''}`}>
                <div className="flex flex-wrap gap-4 justify-center">
                    {players.map((player, index) => {
                        const isActive = index === activePlayerIndex;
                        const healthPercentage = player.maxHealth > 0 ? (player.currentHealth / player.maxHealth) * 100 : 0;
                        const energyPercentage = player.maxEnergy > 0 ? (player.currentEnergy / player.maxEnergy) * 100 : 0;

                        let healthColorClass = 'bg-green-500';
                        if (healthPercentage < 35) healthColorClass = 'bg-red-500';
                        else if (healthPercentage < 75) healthColorClass = 'bg-yellow-500';

                        const imageSource = player.portrait || player.image_prompt;
                        const originalPrompt = player.image_prompt;

                        const handleOpenPortraitModal = () => {
                            if (!imageSource) return;

                            let onClearCustom: (() => void) | undefined;
                            let onUpload: ((base64: string) => void) | undefined;

                            if (updatePlayerPortrait) {
                                onClearCustom = () => updatePlayerPortrait(player.playerId, { custom: null });
                                onUpload = (base64) => updatePlayerPortrait(player.playerId, { custom: base64 });
                            }

                            onOpenImageModal(imageSource, originalPrompt || '', onClearCustom, onUpload);
                        };

                        return (
                            <div
                                key={player.playerId}
                                className={`relative p-3 rounded-lg border-2 transition-all duration-300 w-64 flex-shrink-0 ${isActive ? 'border-yellow-400 bg-yellow-900/20' : 'border-transparent bg-[#2A313E]'}`}
                            >
                                {isActive && (
                                    <div className="absolute -top-3 right-4 transform rotate-3 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-md shadow-lg z-10">
                                        {t('YOUR TURN')}
                                    </div>
                                )}
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 border-2 border-gray-600 cursor-pointer"
                                        onClick={handleOpenPortraitModal}
                                    >
                                        {imageSource ? (
                                            <ImageRenderer
                                                key={`${player.playerId}-${imageSource}`}
                                                prompt={imageSource}
                                                originalTextPrompt={originalPrompt || ''}
                                                alt={player.name}
                                                imageCache={imageCache}
                                                onImageGenerated={onImageGenerated}
                                                className="w-full h-full object-cover"
                                                width={1024}
                                                height={1024}
                                                model={gameSettings?.pollinationsImageModel}
                                                gameSettings={gameSettings}
                                                gameIsLoading={isLoading}
                                            />
                                        ) : (
                                            <UserCircleIcon className="w-12 h-12 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className={`font-bold truncate ${isActive ? 'text-yellow-200' : 'text-white'}`}>{player.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{t('Level {level} {charClass}', { level: player.level, charClass: t(player.class as any) })}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                                            <span>{t('Health')}</span>
                                            <span className="font-mono">{player.currentHealth} / {player.maxHealth}</span>
                                        </div>
                                        <div className="w-full bg-gray-900/50 rounded-full h-2.5">
                                            <div className={`${healthColorClass} h-2.5 rounded-full transition-all duration-300`} style={{ width: `${healthPercentage}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-300 mb-1 items-center">
                                            <span className="flex items-center gap-1"><BoltIcon className="w-3 h-3 text-blue-400" />{t('Energy')}</span>
                                            <span className="font-mono">{player.currentEnergy} / {player.maxEnergy}</span>
                                        </div>
                                        <div className="w-full bg-gray-900/50 rounded-full h-2.5">
                                            <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${energyPercentage}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};