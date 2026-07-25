/**
 * TextToSpeechButton — Phase 5
 *
 * Reads the given text aloud using the Web Speech API (SpeechSynthesis).
 * Activated automatically when readingSupport = true.
 * The student never sees a label explaining why this button is present.
 * Gracefully degrades when the browser lacks SpeechSynthesis support.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

const TextToSpeechButton = ({ text, className = '' }) => {
    const [speaking, setSpeaking]   = useState(false);
    const [loading, setLoading]     = useState(false);
    const utteranceRef              = useRef(null);

    // Cancel speech when text changes or component unmounts
    useEffect(() => {
        return () => { if (isSupported) window.speechSynthesis.cancel(); };
    }, [text]);

    const handleToggle = useCallback(() => {
        if (!isSupported) return;

        if (speaking) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
            return;
        }

        setLoading(true);
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text || '');
        utterance.rate   = 0.9;
        utterance.pitch  = 1;
        utterance.volume = 1;

        utterance.onstart = () => { setLoading(false); setSpeaking(true); };
        utterance.onend   = () => { setSpeaking(false); setLoading(false); };
        utterance.onerror = () => { setSpeaking(false); setLoading(false); };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [text, speaking]);

    // Not supported — render nothing
    if (!isSupported) return null;

    return (
        <button
            type="button"
            onClick={handleToggle}
            title={speaking ? 'Stop reading' : 'Read question aloud'}
            aria-label={speaking ? 'Stop reading' : 'Read question aloud'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                speaking
                    ? 'bg-indigo-500/15 text-indigo-600 border-indigo-500/40 hover:bg-indigo-500/25'
                    : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-indigo-400/50 hover:text-indigo-600'
            } ${className}`}
        >
            {loading
                ? <Loader2 size={13} className="animate-spin" />
                : speaking
                ? <VolumeX size={13} />
                : <Volume2 size={13} />
            }
            {speaking ? 'Stop' : 'Read'}
        </button>
    );
};

export default TextToSpeechButton;
