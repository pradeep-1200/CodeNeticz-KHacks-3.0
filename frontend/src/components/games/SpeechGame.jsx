import React, { useState } from 'react';
import { useGamification } from '../../context/GamificationContext';
import { transcribeAudio } from '../../services/api';
import { Mic, Square, Volume2, CheckCircle, RefreshCcw, Loader2 } from 'lucide-react';

const SpeechGame = ({ promptText, expectedKeywords = [], onComplete }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, correct, retry
    const { addXP } = useGamification();

    const toggleListening = async () => {
        if (isListening) {
            setIsListening(false);
            if (window.mediaRecorder && window.mediaRecorder.state !== 'inactive') {
                window.mediaRecorder.stop();
            }
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                window.mediaRecorder = mediaRecorder;
                const chunks = [];

                mediaRecorder.ondataavailable = e => chunks.push(e.data);
                mediaRecorder.onstop = async () => {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    setIsProcessing(true);

                    try {
                        const result = await transcribeAudio(blob);
                        if (result.success) {
                            setTranscript(result.text);
                            checkClarity(result.text);
                        }
                    } catch (err) {
                        console.error("STT Error", err);
                    } finally {
                        setIsProcessing(false);
                    }
                };

                mediaRecorder.start();
                setIsListening(true);
            } catch (err) {
                console.error("Mic error:", err);
            }
        }
    };

    const checkClarity = (text) => {
        const found = expectedKeywords.some(k => text.toLowerCase().includes(k.toLowerCase()));
        if (found || expectedKeywords.length === 0) {
            setStatus('correct');
            addXP(250);
            if (onComplete) onComplete(true);
        } else {
            setStatus('retry');
        }
    };

    const speakPrompt = () => {
        if ('speechSynthesis' in window && promptText) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(promptText);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="bg-[var(--bg-surface)] p-8 rounded-3xl shadow-xl border-2 border-[var(--border-color)] space-y-6 animate-fade-in-up">
            <h3 className="text-2xl font-black text-center text-[var(--text-primary)] tracking-tight">
                🗣️ Voice Fluency Practice
            </h3>

            <div className="flex flex-col items-center gap-8">
                {/* Prompt Card */}
                <div className="w-full p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 relative shadow-sm">
                    <button 
                        onClick={speakPrompt} 
                        className="absolute top-4 right-4 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition-all"
                        title="Listen to prompt"
                    >
                        <Volume2 size={18} />
                    </button>
                    <p className="text-lg md:text-xl font-bold text-indigo-950 dark:text-indigo-100 text-center leading-relaxed pr-10">
                        "{promptText}"
                    </p>
                </div>

                {/* Main Mic Button */}
                <div className="relative">
                    <button
                        onClick={toggleListening}
                        disabled={isProcessing || status === 'correct'}
                        className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                            isListening
                                ? 'bg-rose-500 animate-pulse shadow-rose-500/30'
                                : status === 'correct'
                                    ? 'bg-emerald-500 shadow-emerald-500/30'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-indigo-600/30'
                        } shadow-2xl disabled:opacity-50 text-white`}
                    >
                        {isProcessing ? (
                            <Loader2 size={40} className="animate-spin" />
                        ) : isListening ? (
                            <Square size={36} className="fill-current" />
                        ) : status === 'correct' ? (
                            <CheckCircle size={44} />
                        ) : (
                            <Mic size={44} />
                        )}
                    </button>
                </div>

                {/* Transcript Preview */}
                <div className="w-full space-y-3">
                    {transcript && (
                        <div className="p-4 bg-[var(--bg-base)] rounded-2xl border border-[var(--border-color)] text-center shadow-inner">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Voice Transcript</label>
                            <p className="text-base font-extrabold text-[var(--text-primary)]">{transcript}</p>
                        </div>
                    )}

                    {status === 'correct' && (
                        <div className="text-center animate-bounce text-emerald-600 dark:text-emerald-400 font-black text-xl flex items-center justify-center gap-2">
                            <CheckCircle size={24} /> Perfect expression! +250 XP
                        </div>
                    )}

                    {status === 'retry' && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold flex items-center justify-between">
                            <span>We didn't quite catch that. Try speaking a bit clearer!</span>
                            <button onClick={() => setStatus('idle')} className="p-1 hover:bg-amber-500/20 rounded-lg">
                                <RefreshCcw size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpeechGame;
