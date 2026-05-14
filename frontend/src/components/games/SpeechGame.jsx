import React, { useState, useEffect } from 'react';
import { useGamification } from '../../context/GamificationContext';
import { transcribeAudio } from '../../services/api';
import { Mic, Square, Volume2, CheckCircle, RefreshCcw, Loader2 } from 'lucide-react';

const SpeechGame = ({ promptText, expectedKeywords = [] }) => {
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
        }
    };

    const checkClarity = (text) => {
        // AI assists clarity, not correctness - logic
        // We look for any of the expected keywords
        const found = expectedKeywords.some(k => text.toLowerCase().includes(k.toLowerCase()));
        if (found || expectedKeywords.length === 0) {
            setStatus('correct');
            addXP(250);
        } else {
            setStatus('retry');
        }
    };

    const speakPrompt = () => {
        const utterance = new SpeechSynthesisUtterance(promptText);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border-4 border-[var(--border-color)]">
            <h3 className="text-2xl font-bold mb-6 text-center text-[var(--text-primary)]">
                🗣️ Say it out loud!
            </h3>

            <div className="flex flex-col items-center gap-8">
                {/* Prompt Card */}
                <div className="w-full p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 relative">
                    <button onClick={speakPrompt} className="absolute -top-3 -right-3 p-2 bg-blue-600 text-white rounded-full shadow-lg">
                        <Volume2 size={20} />
                    </button>
                    <p className="text-xl font-medium text-blue-900 dark:text-blue-100 italic text-center">
                        "{promptText}"
                    </p>
                </div>

                {/* Main Mic Button */}
                <div className="relative">
                    <button
                        onClick={toggleListening}
                        disabled={isProcessing || status === 'correct'}
                        className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isListening
                                ? 'bg-red-500 animate-pulse shadow-red-200'
                                : status === 'correct'
                                    ? 'bg-green-500 shadow-green-200'
                                    : 'bg-blue-600 hover:scale-105 shadow-blue-200'
                            } shadow-2xl disabled:opacity-50`}
                    >
                        {isProcessing ? (
                            <Loader2 size={48} className="text-white animate-spin" />
                        ) : isListening ? (
                            <Square size={48} className="text-white fill-current" />
                        ) : status === 'correct' ? (
                            <CheckCircle size={48} className="text-white" />
                        ) : (
                            <Mic size={48} className="text-white" />
                        )}
                    </button>
                </div>

                {/* Transcript Preview */}
                <div className="w-full">
                    {transcript && (
                        <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] text-center">
                            <label className="text-xs font-bold text-gray-400 uppercase">Voice Preview</label>
                            <p className="text-lg font-bold">{transcript}</p>
                        </div>
                    )}

                    {status === 'correct' && (
                        <div className="mt-6 text-center animate-bounce text-green-600 font-black text-2xl">
                            Perfect expression! +250 XP
                        </div>
                    )}

                    {status === 'retry' && (
                        <div className="mt-6 text-center text-orange-500 font-bold flex items-center justify-center gap-2">
                            <span className="p-2 bg-orange-50 rounded-lg italic">We didn't quite catch that. Try speaking a bit louder!</span>
                            <button onClick={() => setStatus('idle')} className="p-2 hover:bg-gray-100 rounded-full">
                                <RefreshCcw size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpeechGame;
