/**
 * VisualMathAid — Phase 5
 *
 * Activated automatically when numberSupport = true (visualMathAids = true).
 * Provides a visual representation area for mathematical questions.
 *
 * Phase 5 implementation:
 *  - Detects numbers and basic operators in the question text
 *  - Renders a placeholder visual aid panel with extracted numeric data
 *  - Reserved for Phase 6 AI-generated diagrams
 *
 * The "Visual Aid" button is shown — no label explaining WHY.
 */

import React, { useState, useMemo } from 'react';
import { BarChart3, X, Hash } from 'lucide-react';

/** Extract numbers and simple expressions from question text */
function extractMathElements(text) {
    if (!text) return { numbers: [], hasOperators: false };
    const numbers    = [...text.matchAll(/\b\d+(?:\.\d+)?\b/g)].map(m => parseFloat(m[0]));
    const hasOperators = /[+\-×÷*/=<>%]/.test(text);
    return { numbers: [...new Set(numbers)].slice(0, 8), hasOperators };
}

/** Renders a simple bar chart from extracted numbers */
const SimpleBarChart = ({ numbers }) => {
    const max = Math.max(...numbers, 1);
    const colors = [
        'bg-indigo-500', 'bg-blue-500', 'bg-purple-500',
        'bg-cyan-500', 'bg-teal-500', 'bg-violet-500',
        'bg-sky-500', 'bg-emerald-500'
    ];
    return (
        <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                Number Line Overview
            </p>
            <div className="flex items-end gap-2 h-16">
                {numbers.map((n, i) => {
                    const pct = Math.max(5, (n / max) * 100);
                    return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                            <span className="text-[9px] font-black text-[var(--text-secondary)]">{n}</span>
                            <div
                                className={`w-full rounded-t-md ${colors[i % colors.length]} opacity-80 transition-all duration-500`}
                                style={{ height: `${pct}%` }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const VisualMathAid = ({ questionText }) => {
    const [open, setOpen] = useState(false);

    const { numbers, hasOperators } = useMemo(
        () => extractMathElements(questionText),
        [questionText]
    );

    const hasMathContent = numbers.length > 0 || hasOperators;

    // If no math content detected, don't render
    if (!hasMathContent) return null;

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/30 rounded-xl text-xs font-bold transition-all"
            >
                <BarChart3 size={13} /> Visual Aid
            </button>
        );
    }

    return (
        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 size={14} className="text-blue-600" />
                    <span className="text-xs font-black text-blue-600 uppercase tracking-wide">Visual Aid</span>
                </div>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-6 h-6 rounded-lg hover:bg-blue-500/10 flex items-center justify-center text-[var(--text-secondary)]"
                >
                    <X size={12} />
                </button>
            </div>

            {/* Numbers visualization */}
            {numbers.length > 0 && (
                <SimpleBarChart numbers={numbers} />
            )}

            {/* Numbers list */}
            {numbers.length > 0 && (
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide flex items-center gap-1">
                        <Hash size={9} /> Numbers in this question
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {numbers.map((n, i) => (
                            <span
                                key={i}
                                className="px-2.5 py-1 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-xl text-xs font-black"
                            >
                                {n}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Phase 6 placeholder */}
            <div className="pt-2 border-t border-blue-500/10">
                <p className="text-[9px] font-semibold text-[var(--text-secondary)] italic">
                    Detailed diagram support coming soon.
                </p>
            </div>
        </div>
    );
};

export default VisualMathAid;
