
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useLocalization } from './LocalizationContext';

interface SpeechContextType {
    speak: (text: string) => void;
    cancel: () => void;
    isSpeaking: boolean;
    currentlySpeakingText: string | null;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

export const SpeechProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentlySpeakingText, setCurrentlySpeakingText] = useState<string | null>(null);
    const { language } = useLocalization();
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const cancel = useCallback(() => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        // The onend event handler will clean up the state
    }, []);

    const speak = useCallback((text: string) => {
        if (!('speechSynthesis' in window)) {
            console.error("Speech Synthesis not supported by this browser.");
            alert("Speech Synthesis not supported by this browser.");
            return;
        }

        const currentSpeech = window.speechSynthesis;
        
        // If the requested text is the one currently speaking, it's a toggle to stop it.
        if (currentSpeech.speaking && currentlySpeakingText === text) {
            cancel();
            return;
        }
        
        // If something else is speaking, cancel it before starting the new one.
        if (currentSpeech.speaking) {
            currentSpeech.cancel();
        }

        // The onend event for the cancelled speech will fire, resetting state.
        // We use a short timeout to ensure the state is clean before speaking new text.
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utteranceRef.current = utterance;

            const langCode = language === 'ru' ? 'ru-RU' : 'en-US';
            utterance.lang = langCode;
            
            const voices = currentSpeech.getVoices();
            const voice = voices.find(v => v.lang === langCode);
            if (voice) {
                utterance.voice = voice;
            }

            utterance.onstart = () => {
                setIsSpeaking(true);
                setCurrentlySpeakingText(text);
            };

            const cleanup = () => {
                setIsSpeaking(false);
                setCurrentlySpeakingText(null);
                utteranceRef.current = null;
            };

            utterance.onend = cleanup;
            utterance.onerror = (event) => {
                console.error("SpeechSynthesisUtterance.onerror", event);
                cleanup();
            };

            currentSpeech.speak(utterance);
        }, 100);

    }, [language, currentlySpeakingText, cancel]);

    // Pre-load voices. This is a common pattern for the Web Speech API.
    useEffect(() => {
        const synth = window.speechSynthesis;
        if (!synth) return;
        
        const loadVoices = () => {
            synth.getVoices();
        };

        // Voices may load asynchronously.
        synth.onvoiceschanged = loadVoices;
        // Also call it once, in case they are already loaded.
        loadVoices();

        return () => {
            synth.onvoiceschanged = null;
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return (
        <SpeechContext.Provider value={{ speak, cancel, isSpeaking, currentlySpeakingText }}>
            {children}
        </SpeechContext.Provider>
    );
};

export const useSpeech = (): SpeechContextType => {
    const context = useContext(SpeechContext);
    if (context === undefined) {
        throw new Error('useSpeech must be used within a SpeechProvider');
    }
    return context;
};
