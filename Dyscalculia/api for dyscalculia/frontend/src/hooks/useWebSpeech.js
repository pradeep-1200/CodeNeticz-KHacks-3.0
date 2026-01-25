import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Custom hook for Web Speech API (Text-to-Speech)
 * Improved for voice clarity and robustness.
 */
export const useWebSpeech = ({ rate = 0.9, pitch = 1.0, volume = 1.0, lang = 'en-US' } = {}) => {
    const isSupported = 'speechSynthesis' in window;
    const currentUtterance = useRef(null);
    const [voices, setVoices] = useState([]);

    // 1. Load voices reliably (Chrome/Edge often load asynchronously)
    useEffect(() => {
        if (!isSupported) return;

        const loadVoices = () => {
            const available = window.speechSynthesis.getVoices();
            setVoices(available);
        };

        // Try immediately
        loadVoices();

        // Listen for async load
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [isSupported]);


    // 2. Smart Voice Selection Logic
    const getPreferredVoice = useCallback(() => {
        if (!voices.length) return null;

        // Priority 1: High quality "Google" voices (Chrome)
        const googleVoice = voices.find(v => v.name === "Google US English" || v.name === "Google UK English Female");
        if (googleVoice) return googleVoice;

        // Priority 2: Known good Windows/Mac voices
        const zira = voices.find(v => v.name.includes("Zira")); // Windows
        if (zira) return zira;

        const samantha = voices.find(v => v.name.includes("Samantha")); // macOS
        if (samantha) return samantha;

        // Priority 3: Any "Female" English voice (often clearer/softer for accessibility)
        const femaleEnglish = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));
        if (femaleEnglish) return femaleEnglish;

        // Fallback: Any English voice that isn't the sometimes-harsh "David"
        const anyEnglish = voices.find(v => v.lang.startsWith('en') && !v.name.includes("David"));

        return anyEnglish || voices[0];
    }, [voices]);


    const cancel = useCallback(() => {
        if (!isSupported) return;
        window.speechSynthesis.cancel();
    }, [isSupported]);

    const speak = useCallback((text) => {
        if (!isSupported || !text) return;

        // Ensure voices are loaded; if not, retry once after a tiny delay or just proceed with default
        if (voices.length === 0) {
            // If voices aren't loaded yet, getVoices() might return them now
            const freshVoices = window.speechSynthesis.getVoices();
            if (freshVoices.length > 0) setVoices(freshVoices);
        }

        cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;
        utterance.lang = lang;

        const selectedVoice = getPreferredVoice();
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            // console.log("Using voice:", selectedVoice.name);
        }

        currentUtterance.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [isSupported, rate, pitch, volume, lang, cancel, getPreferredVoice, voices]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cancel();
        };
    }, [cancel]);

    return { speak, cancel, isSupported };
};
