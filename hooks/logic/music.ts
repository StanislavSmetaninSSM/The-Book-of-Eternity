
import React from 'react';
import { getMusicSuggestionFromAi } from '../../utils/gemini';
import { formatError } from '../../utils/errorUtils';

type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

export const createMusicManager = (
    {
        gameContextRef,
        setError,
        t,
        setGameLog,
        setMusicVideoIds,
        setIsMusicLoading,
        setIsMusicPlayerVisible,
        previousMusicQueries
    }: {
        gameContextRef: React.MutableRefObject<any>,
        setError: React.Dispatch<React.SetStateAction<string | null>>,
        t: TFunction,
        setGameLog: React.Dispatch<React.SetStateAction<string[]>>,
        setMusicVideoIds: React.Dispatch<React.SetStateAction<string[] | null>>,
        setIsMusicLoading: React.Dispatch<React.SetStateAction<boolean>>,
        setIsMusicPlayerVisible: React.Dispatch<React.SetStateAction<boolean>>,
        previousMusicQueries: React.MutableRefObject<string[]>
    }
) => {
    const fetchMusicSuggestion = async () => {
        if (!gameContextRef.current) return;

        const youtubeApiKey = gameContextRef.current.gameSettings.youtubeApiKey;
        if (!youtubeApiKey) {
            setError(t("youtube_api_key_missing_error"));
            return;
        }

        setIsMusicLoading(true);
        setError(null);
        try {
          const suggestion = await getMusicSuggestionFromAi(gameContextRef.current, youtubeApiKey, previousMusicQueries.current);
          if (suggestion && suggestion.videoIds && suggestion.videoIds.length > 0) {
            setMusicVideoIds(suggestion.videoIds);
            previousMusicQueries.current.push(suggestion.searchQuery);
            if (previousMusicQueries.current.length > 10) {
                previousMusicQueries.current.shift();
            }
            setGameLog(prev => [t("music_suggestion_reasoning", {reasoning: suggestion.reasoning}), ...prev]);
            setIsMusicPlayerVisible(true);
          } else {
            setGameLog(prev => [t("music_suggestion_failed"), ...prev]);
          }
        } catch (e: any) {
          console.error("Failed to get music suggestion:", e);
          const formattedError = formatError(e);
          setError(t("music_suggestion_error", { error: formattedError }));
        } finally {
          setIsMusicLoading(false);
        }
    };

    const clearMusic = () => {
        setMusicVideoIds(null);
        setIsMusicPlayerVisible(false);
        previousMusicQueries.current = [];
    };

    return {
        fetchMusicSuggestion,
        clearMusic
    };
};
