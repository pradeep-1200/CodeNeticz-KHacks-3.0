/**
 * FractionBar — Visual Learning Assistant
 *
 * vizData: { fractions: [{ numerator, denominator }, { numerator, denominator }] }
 *
 * Renders one or two exact fraction bars side by side.
 * Useful for comparison and addition problems.
 * Never reveals the computed answer.
 */

import React from 'react';

const COLORS = ['#6366f1', '#22c55e'];
const LABELS = ['First fraction', 'Second fraction'];

function fallbackFractions(text) {
    const matches = [...(text || '').matchAll(/(\d+)\s*\/\s*(\d+)/g)];
    const fracs = matches.map(m => ({ numerator: parseInt(m[1]), denominator: parseInt(m[2]) }))
        .filter(f => f.denominator > 1 && f.numerator >= 0)
        .slice(0, 2);
    return fracs.length > 0 ? fracs : [{ numerator: 1, denominator: 2 }];
}

const FractionBar = ({ vizData = null, question = '', description = '' }) => {
    const fractions = (vizData && Array.isArray(vizData.fractions) && vizData.fractions.length > 0)
        ? vizData.fractions.map(f => ({
            numerator:   Math.max(0, parseInt(f.numerator)   || 0),
            denominator: Math.max(1, parseInt(f.denominator) || 2)
        }))
        : fallbackFractions(question + ' ' + description);

    return (
        <div className="space-y-4" role="img" aria-label="Fraction bars">
            {fractions.map((f, idx) => {
                const { numerator: num, denominator: den } = f;
                const pct = `${(Math.min(num, den) / den) * 100}%`;
                const color = COLORS[idx] || COLORS[0];
                return (
                    <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wide">
                                {LABELS[idx] || `Fraction ${idx + 1}`}
                            </span>
                            <span className="text-sm font-black px-2 py-0.5 rounded-lg border"
                                style={{ color, borderColor: color + '50', background: color + '18' }}>
                                {num}/{den}
                            </span>
                        </div>
                        <div className="relative h-8 w-full rounded-xl overflow-hidden border"
                            style={{ borderColor: color + '40', background: color + '12' }}
                            role="progressbar" aria-valuenow={num} aria-valuemin={0} aria-valuemax={den}
                            aria-label={`${num} out of ${den}`}>
                            <div className="absolute left-0 top-0 bottom-0 rounded-xl transition-all duration-700"
                                style={{ width: pct, background: color + 'cc' }} />
                            {/* Segment dividers */}
                            {Array.from({ length: den - 1 }, (_, i) => (
                                <div key={i} className="absolute top-0 bottom-0 w-px bg-white/60"
                                    style={{ left: `${((i + 1) / den) * 100}%` }} aria-hidden="true" />
                            ))}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[11px] font-black text-white drop-shadow-sm">{num}/{den}</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-semibold text-[var(--text-secondary)]">
                            {num} out of {den} equal parts
                        </p>
                    </div>
                );
            })}

            {fractions.length >= 2 && (
                <p className="text-xs font-bold text-indigo-600 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl">
                    Compare the two bars — which is longer? Use this to work out your answer.
                </p>
            )}
        </div>
    );
};

export default FractionBar;
