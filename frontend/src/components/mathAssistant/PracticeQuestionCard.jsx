/**
 * PracticeQuestionCard — Phase 6
 *
 * Shows a similar practice question for the student to try.
 * Practice answers do NOT affect assessment marks.
 * The component tracks the student's practice answer locally only.
 */

import React, { useState } from 'react';
import { PenLine, CheckCircle2, RefreshCw } from 'lucide-react';

const PracticeQuestionCard = ({ practiceQuestion }) => {
    const [answer,  setAnswer]  = useState('');
    const [tried,   setTried]   = useState(false);

    if (!practiceQuestion) return null;

    const handleTry = () => {
        if (answer.trim()) setTried(true);
    };

    const handleReset = () => { setAnswer(''); setTried(false); };

    return (
        <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
                <PenLine size={14} className="text-purple-500" />
                <span className="text-xs font-black text-purple-600 uppercase tracking-wide">
                    Try a similar problem
                </span>
                <span className="ml-auto text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-base)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                    Practice only
                </span>
            </div>

            <p className="text-sm font-bold text-[var(--text-primary)] leading-relaxed">
                {practiceQuestion}
            </p>

            {!tried ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleTry()}
                        placeholder="Your answer..."
                        className="flex-1 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-purple-400/60 transition-colors"
                    />
                    <button
                        type="button"
                        onClick={handleTry}
                        disabled={!answer.trim()}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-40"
                    >
                        Check
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <p className="text-xs font-bold text-emerald-600">
                            You answered: <span className="text-[var(--text-primary)]">{answer}</span>
                        </p>
                    </div>
                    <p className="text-[10px] font-semibold text-[var(--text-secondary)] text-center">
                        This is practice only and does not affect your assessment.
                    </p>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="w-full py-1.5 text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center justify-center gap-1 transition-colors"
                    >
                        <RefreshCw size={10} /> Try again
                    </button>
                </div>
            )}
        </div>
    );
};

export default PracticeQuestionCard;
