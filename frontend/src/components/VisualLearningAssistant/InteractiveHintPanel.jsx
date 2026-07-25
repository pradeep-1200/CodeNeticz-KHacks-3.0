/**
 * InteractiveHintPanel — Visual Learning Assistant
 *
 * Renders the AI step sequence with:
 *  - Per-step visual rendering (when step type = "visual")
 *  - Per-step instruction text (when step type = "instruction")
 *  - Animated step-by-step reveal
 *  - Replay button
 *  - Never shows the final answer
 */

import React, { useState } from 'react';
import { ChevronRight, RotateCcw, CheckCircle2, Eye, BookOpen } from 'lucide-react';
import MathVisualizer from './MathVisualizer';

const InteractiveHintPanel = ({ steps = [], visualizationType, vizData = null, question = '' }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [finished, setFinished]       = useState(false);

    if (steps.length === 0) return null;

    const validSteps = steps.filter(s => s && s.description);
    const visibleSteps = validSteps.slice(0, currentStep + 1);
    const hasMore = currentStep < validSteps.length - 1;

    const handleNext = () => {
        if (hasMore) setCurrentStep(c => c + 1);
        else setFinished(true);
    };

    const handleReset = () => { setCurrentStep(0); setFinished(false); };

    const isLastStep = currentStep === validSteps.length - 1;

    return (
        <div className="space-y-3">
            {/* Steps */}
            <div className="space-y-3">
                {visibleSteps.map((step, i) => {
                    const isActive  = i === currentStep;
                    const isDone    = i < currentStep;
                    const isVisual  = step.type === 'visual';

                    return (
                        <div
                            key={i}
                            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                                isActive
                                    ? 'border-indigo-500/40 shadow-sm'
                                    : isDone
                                    ? 'border-emerald-500/20 opacity-80'
                                    : 'border-[var(--border-color)]'
                            }`}
                        >
                            {/* Step header */}
                            <div className={`flex items-center gap-3 px-4 py-3 ${
                                isActive ? 'bg-indigo-500/10' : isDone ? 'bg-emerald-500/5' : 'bg-[var(--bg-base)]'
                            }`}>
                                {/* Step number badge */}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    isDone
                                        ? 'bg-emerald-500/20 text-emerald-600'
                                        : isActive
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                                }`} aria-label={`Step ${i + 1}`}>
                                    {isDone ? '✓' : i + 1}
                                </div>

                                {/* Step type icon */}
                                {isVisual
                                    ? <Eye size={12} className="text-indigo-500 shrink-0" aria-hidden="true" />
                                    : <BookOpen size={12} className="text-amber-500 shrink-0" aria-hidden="true" />
                                }

                                {/* Step description */}
                                <p className={`text-sm font-semibold leading-snug flex-1 ${
                                    isActive
                                        ? 'text-[var(--text-primary)]'
                                        : 'text-[var(--text-secondary)]'
                                }`}>
                                    {step.description}
                                </p>
                            </div>

                            {/* Visual rendering — only for active visual-type steps */}
                            {isActive && isVisual && visualizationType && (
                                <div className="px-4 pb-4 pt-2 bg-[var(--bg-surface)]">
                                    <MathVisualizer
                                        type={visualizationType}
                                        vizData={vizData}
                                        question={question}
                                        description={step.description}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5 justify-center" role="progressbar"
                aria-valuenow={currentStep + 1} aria-valuemax={validSteps.length}
                aria-label={`Step ${currentStep + 1} of ${validSteps.length}`}>
                {validSteps.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                            i <= currentStep ? 'bg-indigo-500 w-4' : 'bg-indigo-200 w-1.5'
                        }`}
                        aria-hidden="true"
                    />
                ))}
            </div>

            {/* Navigation */}
            {finished ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" aria-hidden="true" />
                        <p className="text-xs font-bold text-emerald-600">
                            All steps complete — now solve it yourself!
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-indigo-600 transition-colors"
                        aria-label="Replay from step 1"
                    >
                        <RotateCcw size={11} /> Replay from beginning
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                        Step {currentStep + 1} of {validSteps.length}
                    </span>
                    <button
                        type="button"
                        onClick={handleNext}
                        className={`flex items-center gap-1.5 px-4 py-2.5 font-bold rounded-xl text-xs transition-colors shadow-sm ${
                            isLastStep
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                        aria-label={hasMore ? `Go to step ${currentStep + 2}` : 'Finish guided steps'}
                    >
                        {hasMore ? 'Next step' : 'Finish'}
                        <ChevronRight size={12} aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default InteractiveHintPanel;
