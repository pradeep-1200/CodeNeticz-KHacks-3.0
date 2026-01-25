import React, { useState } from 'react';
import { useGamification } from '../../context/GamificationContext';
import { Volume2, CheckCircle, XCircle, Info } from 'lucide-react';

const QuizGame = ({ question, options, correctAnswer, hint, type = 'mcq' }) => {
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
        } else {
            setStatus('wrong');
            // Allow retry after a small delay
            setTimeout(() => {
                setStatus('idle');
                setSelected(null);
            }, 1000);
        }
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Question Card */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border-4 border-b-8 border-[var(--border-color)] relative">
                <button
                    onClick={() => speak(question)}
                    className="absolute top-4 right-4 p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                >
                    <Volume2 size={24} />
                </button>

                <h2 className="text-3xl font-bold text-[var(--text-primary)] leading-tight mb-4 pr-12">
                    {question}
                </h2>

                {hint && (
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors"
                    >
                        <Info size={16} /> {showHint ? hint : "Need a hint?"}
                    </button>
                )}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option) => (
                    <button
                        key={option}
                        disabled={status === 'correct'}
                        onClick={() => handleSelect(option)}
                        className={`p-6 rounded-2xl text-left border-4 border-b-8 font-bold text-xl transition-all relative overflow-hidden ${selected === option
                                ? status === 'correct'
                                    ? 'bg-green-100 border-green-500 text-green-700'
                                    : 'bg-red-100 border-red-500 text-red-700 animate-shake'
                                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-400'
                            }`}
                    >
                        <div className="flex justify-between items-center">
                            <span>{option}</span>
                            {selected === option && status === 'correct' && <CheckCircle className="text-green-600" />}
                            {selected === option && status === 'wrong' && <XCircle className="text-red-600" />}
                        </div>
                    </button>
                ))}
            </div>

            {/* Feedback Footer */}
            {status === 'correct' && (
                <div className="bg-green-500 p-6 rounded-2xl text-white flex justify-between items-center shadow-lg transform scale-105 transition-transform duration-300">
                    <div>
                        <h4 className="text-2xl font-black">You are amazing!</h4>
                        <p className="font-bold opacity-90">+150 XP earned!</p>
                    </div>
                    <CheckCircle size={48} className="animate-bounce" />
                </div>
            )}
        </div>
    );
};

export default QuizGame;
