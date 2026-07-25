/**
 * StepViewer — Phase 6
 *
 * Reveals step-by-step guidance one step at a time.
 * NEVER reveals the final answer — last step always prompts
 * the student to solve it themselves.
 */

import React, { useState } from 'react';
import { ChevronRight, RotateCcw, CheckCircle2 } from 'lucide-react';

const StepViewer = ({ steps = [] }) => {
    const [current, setCurrent] = useState(0);
    const [done, setDone]       = useState(false);

    if (steps.length === 0) return null;

    const visibleSteps = steps.slice(0, current + 1);
    const hasMore      = current < steps.length - 1;

    const handleNext = () => {
        if (hasMore) setCurrent(c => c + 1);
        else setDone(true);
    };

    const handleReset = () => { setCurrent(0); setDone(false); };

    return (
        <div className="space-y-3">
            {/* Step list */}
            <div className="space-y-2">
                {visibleSteps.map((step, i) => (
                    <div
                        key={i}
                        className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                            i === current
                                ? 'bg-indigo-500/10 border-indigo-500/30'
                                : 'bg-[var(--bg-base)] border-[var(--border-color)] opacity-70'
                        }`}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${
                            i < current ? 'bg-emerald-500/20 text-emerald-600' : 'bg-indigo-500/20 text-indigo-600'
                        }`}>
                            {i < current ? '✓' : i + 1}
                        </div>
                        <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">{step}</p>
                    </div>
                ))}
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5 justify-center">
                {steps.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${
                        i <= current ? 'bg-indigo-500 w-4' : 'bg-indigo-200 w-1.5'
                    }`} />
                ))}
            </div>

            {/* Controls */}
            {done ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <p className="text-xs font-bold text-emerald-600">
                            All steps shown. Now try solving it yourself!
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="w-full py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-indigo-600 flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <RotateCcw size={11} /> Show from beginning
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                        Step {current + 1} of {steps.length}
                    </span>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                    >
                        {hasMore ? 'Next step' : 'Finish'} <ChevronRight size={12} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default StepViewer;
