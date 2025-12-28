import { createContext, useContext, useRef } from "react";

// Create context
const AudioPlaybackContext = createContext(null);

// Provider
export function AudioPlaybackProvider({ children }) {
    // This will store the currently playing audio element
    const activeAudioRef = useRef(null);

    return (
        <AudioPlaybackContext.Provider value={{ activeAudioRef }}>
            {children}
        </AudioPlaybackContext.Provider>
    );
}

// Custom hook for easy usage
export function useAudioPlayback() {
    const context = useContext(AudioPlaybackContext);
    if (!context) {
        throw new Error(
            "useAudioPlayback must be used inside AudioPlaybackProvider"
        );
    }
    return context;
}
