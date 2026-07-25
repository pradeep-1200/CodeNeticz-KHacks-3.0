import React, { useState } from 'react';
import { useGamification } from '../../context/GamificationContext';
import { Volume2, CheckCircle, XCircle, Info } from 'lucide-react';

const QuizGame = ({ question, options, correctAnswer, hint, type = 'mcq', onComplete }) => {
    const [selected, setSelected] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, correct, wrong
    const [showHint, setShowHint] = useState(false);
    const { addXP } = useGamification();

    const handleSelect = (option) => {
        if (status !== 'idle') return;

        setSelected(option);
        if (option === correctAnswer) {
            setStatus('correct');
            addXP(150);
            if (onComplete) onComplete(true);
        } else {
            setStatus('wrong');
            // Allow retry after a small delay
            setTimeout(() => {
                setStatus('idle');
                setSelected(null);
            }, 1200);
        }
    };

    const speak = (text) => {
        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Question Card */}
            <div className="bg-[var(--bg-surface)] p-8 rounded-3xl shadow-xl border-2 border-[var(--border-color)] relative">
                <button
                    onClick={() => speak(question)}
                    className="absolute top-6 right-6 p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full transition-all border border-indigo-500/20"
                    title="Read Question Aloud"
                >
                    <Volume2 size={22} />
                </button>

                <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] leading-tight mb-4 pr-14 tracking-tight">
                    {question}
                </h2>

                {hint && (
                    <div className="pt-2">
                        <button
                            onClick={() => setShowHint(!showHint)}
                            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/20"
                        >
                            <Info size={14} /> {showHint ? hint : "Need a hint?"}
                        </button>
                    </div>
                )}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(options || []).map((option) => {
                    const isSelected = selected === option;
                    let optionStyle = "bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-indigo-500/50 hover:bg-indigo-50/40 dark:hover:bg-slate-800/60";
                    
                    if (isSelected) {
                        if (status === 'correct') {
                            optionStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-md shadow-emerald-500/10 font-black";
                        } else if (status === 'wrong') {
                            optionStyle = "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 shadow-md shadow-rose-500/10 animate-shake font-black";
                        }
                    }

                    return (
                        <button
                            key={option}
                            disabled={status === 'correct'}
                            onClick={() => handleSelect(option)}
                            className={`p-6 rounded-2xl text-left border-2 font-bold text-lg md:text-xl transition-all relative overflow-hidden flex items-center justify-between ${optionStyle}`}
                        >
                            <span className="leading-snug pr-4">{option}</span>
                            {isSelected && status === 'correct' && <CheckCircle className="text-emerald-500 shrink-0" size={24} />}
                            {isSelected && status === 'wrong' && <XCircle className="text-rose-500 shrink-0" size={24} />}
                        </button>
                    );
                })}
            </div>

            {/* Feedback Banner */}
            {status === 'correct' && (
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-2xl text-white flex justify-between items-center shadow-xl border border-emerald-400/30 transform scale-102 transition-transform">
                    <div>
                        <h4 className="text-2xl font-black">Spot on! Excellent work!</h4>
                        <p className="font-extrabold text-emerald-100 mt-0.5">+150 XP earned!</p>
                    </div>
                    <CheckCircle size={44} className="animate-bounce text-emerald-200" />
                </div>
            )}
        </div>
    );
};

export default QuizGame;
