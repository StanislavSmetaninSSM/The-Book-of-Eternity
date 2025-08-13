
// This module manages the notification sound for the game.

let audioContext: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;
let isInitializing = false;

/**
 * This function must be called from a user interaction context (like a button click)
 * to initialize the AudioContext and fetch the sound file. This is necessary to comply
 * with browser autoplay policies. It also plays a preview sound upon successful initialization.
 */
export const initializeAndPreviewSound = async () => {
    // Prevent re-initialization or multiple concurrent initializations
    if (typeof window === 'undefined' || isInitializing || audioContext) return;
    
    isInitializing = true;

    try {
        // Create a new AudioContext
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Browsers may suspend the AudioContext until a user gesture. We need to resume it.
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        
        // Fetch and decode the audio file only once and store it in the buffer.
        if (!audioBuffer) {
            const response = await fetch('/utils/sound-notification.wav');
            if (!response.ok) {
                throw new Error(`Failed to fetch sound file: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        }

        // Play a preview sound to confirm it's working and to fully unlock audio playback.
        playNotificationSound();

    } catch (e) {
        console.error("AudioContext initialization or sound decoding failed:", e);
        // Reset state on failure to allow the user to try again.
        audioContext = null;
        audioBuffer = null;
    } finally {
        isInitializing = false;
    }
};

/**
 * Plays the loaded notification sound. This can be called programmatically
 * after initializeAndPreviewSound has been successfully called once.
 */
export const playNotificationSound = () => {
    if (!audioContext || !audioBuffer) {
        console.warn("Sound not initialized. Call initializeAndPreviewSound() from a user interaction first.");
        return;
    }
    
    // Safety check to resume context if it gets suspended again.
    if (audioContext.state !== 'running') {
        audioContext.resume().then(() => {
            if (audioContext?.state === 'running') {
                playNotificationSound(); // Retry playing after resume.
            } else {
                 console.warn("AudioContext could not be resumed. Cannot play sound.");
            }
        });
        return;
    }

    try {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    } catch(e) {
        console.error("Error playing notification sound:", e);
    }
};
