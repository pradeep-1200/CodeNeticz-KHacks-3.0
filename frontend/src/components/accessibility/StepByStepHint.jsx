/**
 * StepByStepHint — Phase 5
 *
 * Activated automatically when numberSupport = true (stepByStepHints = true).
 * Provides one logical step at a time from the question's hint field.
 * If the hint contains multiple sentences, reveals them one by one.
 *
 * Students see a "Show Hint" button — no label explaining WHY they see it.
 */

import React, { useState, useMemo } from 'react';
import { Lightbulb, ChevronRight, RotateCcw } from 'lucide-react';

const StepByStepHint = ({ hint }) => {
    const [step, setStep]       = useState(0);
    const [visible, setVisible] = useState(false);

    // Split hint into individual steps on sentence boundaries or newlines
    const steps = useMemo(() => {
        if (!hint) return [];
        return hint
            .split(/(?<=[.!?])\s+|\n+/)
            .map(s => s.trim())
            .filter(Boolean);
    }, [hint]);

    if (!hint || steps.length === 0) return null;

    const currentStep  = steps[step];
    const hasMore      = step < steps.length - 1;
    const isLast       = step === steps.length - 1;

    const handleNext = () => { if (hasMore) setStep(s => s + 1); };
    const handleReset = () => { setStep(0); setVisible(false); };

    if (!visible) {
        return (
            <button
                type="button"
                onClick={() => setVisible(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/30 rounded-xl text-xs font-bold transition-all"
            >
                <Lightbulb size={13} /> Show Hint
            </button>
        );
    }

    return (
        <div className="space-y-2">
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
                {/* Step indicator */}
                {steps.length > 1 && (
                    <div className="flex gap-1">
                        {steps.map((_, i) => (
                            <span
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors ${
                                    i <= step ? 'bg-amber-500' : 'bg-amber-500/20'
                                }`}
                            />
                        ))}
                    </div>
                )}

                {/* Current step */}
                <div className="flex items-start gap-2">
                    <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 leading-relaxed">
                        {currentStep}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    {hasMore && (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-wide"
                        >
                            Next hint <ChevronRight size={10} />
                        </button>
                    )}
                    {isLast && (
                        <span className="text-[10px] font-bold text-amber-500">All hints shown</span>
                    )}
                    <button
                        type="button"
                        onClick={handleReset}
                        className="ml-auto text-[10px] font-bold text-[var(--text-secondary)] hover:text-amber-600 flex items-center gap-0.5"
                    >
                        <RotateCcw size={9} /> Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StepByStepHint;
