import React, { useState, useEffect } from 'react';
import { useGamification } from '../../context/GamificationContext';
import { Volume2, CheckCircle, RefreshCcw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const JumbledSentenceGame = ({ sentence, onComplete }) => {
    const toast = useToast();
    const [words, setWords] = useState([]);
    const [userOrder, setUserOrder] = useState([]);
    const [isCorrect, setIsCorrect] = useState(false);
    const { addXP } = useGamification();

    useEffect(() => {
        if (!sentence) return;
        const wordList = sentence.split(' ').map((text, id) => ({ id, text }));
        // Shuffle words
        const shuffled = [...wordList].sort(() => Math.random() - 0.5);
        setWords(shuffled);
        setUserOrder([]);
        setIsCorrect(false);
    }, [sentence]);

    const handleWordClick = (word) => {
        if (isCorrect) return;

        if (userOrder.some(w => w.id === word.id)) {
            setUserOrder(userOrder.filter(w => w.id !== word.id));
        } else {
            setUserOrder([...userOrder, word]);
        }
    };

    const checkAnswer = () => {
        const currentSentence = userOrder.map(w => w.text).join(' ');
        if (currentSentence === sentence) {
            setIsCorrect(true);
            addXP(200);
            if (onComplete) onComplete(true);
        } else {
            toast.warning("Almost there! Try rearranging the words into a complete sentence.");
        }
    };

    const speakWord = (text) => {
        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="p-6 md:p-8 bg-[var(--bg-surface)] rounded-3xl border-2 border-[var(--border-color)] shadow-xl space-y-6 animate-fade-in-up">
            <h3 className="text-lg md:text-xl font-black flex items-center gap-2 text-[var(--text-primary)] tracking-tight">
                🧩 Arrange the words to form a meaningful sentence
            </h3>

            {/* Target Area (Container for chosen words) */}
            <div className="min-h-[110px] p-6 bg-[var(--bg-base)] rounded-2xl border-2 border-indigo-500/30 flex flex-wrap items-center gap-3 shadow-inner">
                {userOrder.length === 0 && (
                    <div className="text-[var(--text-secondary)] font-semibold text-sm italic animate-pulse">
                        Tap the word tiles below to build your sentence...
                    </div>
                )}
                {userOrder.map((word) => (
                    <button
                        key={`user-word-${word.id}`}
                        onClick={() => handleWordClick(word)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-base shadow-sm transition-all border flex items-center gap-2 ${
                            isCorrect 
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/50' 
                                : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20'
                        }`}
                    >
                        {word.text}
                        <Volume2 size={14} className="opacity-60 hover:opacity-100" onClick={(e) => { e.stopPropagation(); speakWord(word.text); }} />
                    </button>
                ))}
            </div>

            {/* Word Bank */}
            <div className="flex flex-wrap gap-3 justify-center py-2">
                {words.map((word) => {
                    const isUsed = userOrder.some(w => w.id === word.id);
                    return (
                        <button
                            key={`bank-word-${word.id}`}
                            disabled={isUsed || isCorrect}
                            onClick={() => handleWordClick(word)}
                            className={`px-5 py-3 rounded-2xl font-bold text-base transition-all border ${
                                isUsed
                                    ? 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-color)] opacity-40 cursor-not-allowed'
                                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/30 hover:scale-105 active:scale-95 shadow-sm'
                            }`}
                        >
                            {word.text}
                        </button>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
                <button
                    onClick={() => setUserOrder([])}
                    disabled={isCorrect || userOrder.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-xl font-extrabold text-xs hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                >
                    <RefreshCcw size={14} /> Reset
                </button>

                {!isCorrect ? (
                    <button
                        onClick={checkAnswer}
                        disabled={userOrder.length !== words.length}
                        className={`px-8 py-3 rounded-2xl font-black text-sm shadow-lg transition-all ${
                            userOrder.length === words.length
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 active:scale-95'
                                : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-color)] cursor-not-allowed opacity-50'
                        }`}
                    >
                        Check Answer
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-lg animate-bounce">
                        <CheckCircle size={24} /> Perfect! +200 XP
                    </div>
                )}
            </div>
        </div>
    );
};

export default JumbledSentenceGame;
