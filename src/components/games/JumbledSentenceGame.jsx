import React, { useState, useEffect } from 'react';
import { useGamification } from '../../context/GamificationContext';
import { Volume2, CheckCircle, RefreshCcw, ArrowRight } from 'lucide-react';

const JumbledSentenceGame = ({ sentence, onComplete }) => {
    const [words, setWords] = useState([]);
    const [userOrder, setUserOrder] = useState([]);
    const [isCorrect, setIsCorrect] = useState(false);
    const { addXP } = useGamification();

    useEffect(() => {
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
            if (onComplete) onComplete();
        } else {
            // Shake effect or feedback
            alert("Almost there! Try rearranging the words.");
        }
    };

    const speakWord = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border-4 border-dashed border-[var(--border-color)] shadow-inner">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--text-secondary)]">
                🧩 Arrange the words to form a meaningful sentence
            </h3>

            {/* Target Area (Container for chosen words) */}
            <div className="min-h-[100px] p-6 bg-[var(--bg-secondary)] rounded-2xl border-2 border-blue-200 dark:border-blue-900 flex flex-wrap gap-3 mb-8 shadow-sm">
                {userOrder.length === 0 && (
                    <div className="text-gray-400 font-medium italic animate-pulse">
                        Tap words below to build your sentence...
                    </div>
                )}
                {userOrder.map((word, index) => (
                    <button
                        key={`user-word-${word.id}`}
                        onClick={() => handleWordClick(word)}
                        className={`px-4 py-3 bg-[var(--note-blue)] text-blue-900 rounded-xl font-bold text-lg shadow-md hover:-translate-y-1 transition-all border-b-4 border-blue-300 flex items-center gap-2 ${isCorrect ? 'border-green-500 bg-green-100' : ''}`}
                    >
                        {word.text}
                        <Volume2 size={14} className="opacity-40" onClick={(e) => { e.stopPropagation(); speakWord(word.text); }} />
                    </button>
                ))}
            </div>

            {/* Word Bank */}
            <div className="flex flex-wrap gap-3 justify-center mb-10">
                {words.map((word) => {
                    const isUsed = userOrder.some(w => w.id === word.id);
                    return (
                        <button
                            key={`bank-word-${word.id}`}
                            disabled={isUsed || isCorrect}
                            onClick={() => handleWordClick(word)}
                            className={`px-5 py-3 rounded-xl font-bold text-lg transition-all border-b-4 ${isUsed
                                    ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                                    : 'bg-[var(--note-yellow)] text-yellow-900 border-yellow-300 hover:shadow-lg active:translate-y-1 active:border-b-0 shadow-md'
                                }`}
                        >
                            {word.text}
                        </button>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setUserOrder([])}
                    disabled={isCorrect}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                    <RefreshCcw size={18} /> Reset
                </button>

                {!isCorrect ? (
                    <button
                        onClick={checkAnswer}
                        disabled={userOrder.length !== words.length}
                        className={`px-8 py-3 rounded-xl font-bold text-xl shadow-lg transition-all flex items-center gap-2 ${userOrder.length === words.length
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Check My Work
                    </button>
                ) : (
                    <div className="flex items-center gap-4 animate-bounce">
                        <span className="text-green-600 font-bold text-2xl flex items-center gap-2">
                            <CheckCircle size={32} /> Perfect! +200 XP
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JumbledSentenceGame;
