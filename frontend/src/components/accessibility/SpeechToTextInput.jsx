/**
 * SpeechToTextInput — Phase 5
 *
 * Wraps any textarea with a microphone button that converts
 * spoken words into text using the Web Speech Recognition API.
 *
 * Activated automatically when writingSupport = true.
 * Students can always manually edit the text after transcription.
 * Gracefully degrades when the browser does not support Speech Recognition.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

// Normalize browser API
const SpeechRecognition =
    typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

const isSupported = !!SpeechRecognition;

/**
 * Props:
 *  value        — current textarea value (controlled)
 *  onChange     — called with new string value
 *  rows         — textarea rows (default 4)
 *  placeholder  — textarea placeholder
 *  maxLength    — textarea maxLength
 *  largeText    — boolean — increases font/padding when largeText profile is on
 */
const SpeechToTextInput = ({
    value,
    onChange,
    rows = 4,
    placeholder = 'Type or speak your answer...',
    maxLength = 5000,
    largeText = false
}) => {
    const [listening, setListening]   = useState(false);
    const [interim,   setInterim]     = useState('');
    const [error,     setError]       = useState('');
    const recognitionRef              = useRef(null);
    const baseValueRef                = useRef(value); // value when mic was activated

    // Keep ref in sync
    useEffect(() => { if (!listening) baseValueRef.current = value; }, [value, listening]);

    const startListening = useCallback(() => {
        if (!isSupported) return;
        setError('');

        const rec = new SpeechRecognition();
        rec.continuous      = true;
        rec.interimResults  = true;
        rec.lang            = 'en-US';
        recognitionRef.current = rec;

        rec.onstart = () => {
            baseValueRef.current = value;
            setListening(true);
        };

        rec.onresult = (event) => {
            let finalTranscript   = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) finalTranscript   += t + ' ';
                else                          interimTranscript += t;
            }

            setInterim(interimTranscript);

            if (finalTranscript) {
                const newValue = (baseValueRef.current + finalTranscript).trimStart();
                baseValueRef.current = newValue;
                onChange(newValue);
                setInterim('');
            }
        };

        rec.onerror = (event) => {
            if (event.error === 'no-speech') return; // silent — user just paused
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow microphone use in your browser settings.');
            } else {
                setError('Voice recognition error. Please try again.');
            }
            setListening(false);
            setInterim('');
        };

        rec.onend = () => { setListening(false); setInterim(''); };

        rec.start();
    }, [value, onChange]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setListening(false);
        setInterim('');
    }, []);

    // Cleanup on unmount
    useEffect(() => () => recognitionRef.current?.abort(), []);

    const textSizeClass = largeText ? 'text-base' : 'text-sm';
    const paddingClass  = largeText ? 'p-5'       : 'p-4';

    return (
        <div className="space-y-2">
            <div className="relative">
                <textarea
                    className={`w-full ${paddingClass} pr-14 bg-[var(--bg-base)] border rounded-2xl ${textSizeClass} font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-indigo-500/60 resize-none transition-colors ${
                        listening ? 'border-indigo-500/60 ring-1 ring-indigo-500/20' : 'border-[var(--border-color)]'
                    }`}
                    rows={rows}
                    placeholder={placeholder}
                    value={listening && interim ? value + interim : value}
                    onChange={e => {
                        if (!listening) onChange(e.target.value);
                    }}
                    maxLength={maxLength}
                    readOnly={listening}
                    aria-label="Answer input"
                />

                {/* Mic button — positioned inside textarea */}
                {isSupported && (
                    <button
                        type="button"
                        onClick={listening ? stopListening : startListening}
                        title={listening ? 'Stop recording' : 'Speak your answer'}
                        aria-label={listening ? 'Stop recording' : 'Speak your answer'}
                        className={`absolute right-3 bottom-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all border ${
                            listening
                                ? 'bg-red-500 text-white border-red-500 animate-pulse shadow-lg shadow-red-500/30'
                                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-indigo-400/50 hover:text-indigo-600'
                        }`}
                    >
                        {listening ? <MicOff size={14} /> : <Mic size={14} />}
                    </button>
                )}
            </div>

            {/* Listening indicator */}
            {listening && (
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                    <span className="flex gap-0.5 items-end h-3">
                        {[1,2,3,4].map(i => (
                            <span
                                key={i}
                                className="w-0.5 bg-indigo-500 rounded-full animate-bounce"
                                style={{ height: `${6 + i * 2}px`, animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </span>
                    Listening... Speak now
                </div>
            )}

            {/* Error */}
            {error && (
                <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
                    <MicOff size={12} /> {error}
                </p>
            )}

            {/* Fallback notice — only shown when API is unsupported */}
            {!isSupported && (
                <p className="text-[10px] font-semibold text-[var(--text-secondary)]">
                    Voice input is not supported in this browser. Type your answer instead.
                </p>
            )}
        </div>
    );
};

export default SpeechToTextInput;
