/**
 * WordProblemVisualizer — Visual Learning Assistant
 *
 * vizData: { symbol: "🍎", groups: [7, 3], operation: "add" }
 *
 * Renders the exact quantities from vizData as emoji objects.
 * Step-by-step reveal — never shows the final count.
 */

import React, { useState } from 'react';

const MAX_PER_GROUP = 15;

function fallbackFromText(text) {
    const nums = [...(text || '').matchAll(/\b(\d+)\b/g)]
        .map(m => parseInt(m[1], 10))
        .filter(n => n > 0 && n <= 30);
    const op = /sold|gave|lost|remove|take|eaten|left|remaining|spent/i.test(text) ? 'subtract'
        : /times|groups|multiply/i.test(text) ? 'multiply'
        : /share|split|each|divide/i.test(text) ? 'divide'
        : 'add';
    const sym = /apple/i.test(text) ? '🍎'
        : /ball/i.test(text) ? '⚽'
        : /book/i.test(text) ? '📚'
        : /cookie/i.test(text) ? '🍪'
        : /pencil/i.test(text) ? '✏️'
        : /flower/i.test(text) ? '🌸'
        : '🍎';
    return {
        symbol: sym,
        groups: nums.length >= 2 ? [nums[0], nums[1]] : [5, 3],
        operation: op
    };
}

const WordProblemVisualizer = ({ vizData = null, question = '', description = '' }) => {
    const combined = (question + ' ' + description).trim();
    const resolved = (vizData && Array.isArray(vizData.groups) && vizData.groups.length >= 2)
        ? {
            symbol:    vizData.symbol    || '🍎',
            groups:    vizData.groups.map(n => Math.min(parseInt(n) || 0, MAX_PER_GROUP)),
            operation: vizData.operation || 'add'
        }
        : fallbackFromText(combined);

    const { symbol, groups, operation } = resolved;
    const [a, b] = groups;

    const [step, setStep] = useState(0);

    const COLOR_MAP = {
        indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/30',  text: 'text-indigo-600' },
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-600' },
        red:     { bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-600' },
        blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    text: 'text-blue-600' },
    };

    const steps = [
        { label: `Start with ${a}`, count: a, color: 'indigo', crossed: false },
        ...(operation === 'add'
            ? [{ label: `Add ${b} more`, count: b, color: 'emerald', crossed: false }]
            : operation === 'subtract'
            ? [{ label: `Take away ${b}`, count: b, color: 'red', crossed: true }]
            : operation === 'multiply'
            ? [{ label: `${a} groups of ${b}`, count: b, color: 'blue', crossed: false }]
            : [{ label: `Split into ${b} groups`, count: b, color: 'blue', crossed: false }]
        )
    ];

    const finalPrompt = operation === 'subtract'
        ? `Count the ${symbol} that are NOT crossed out — how many remain?`
        : `Count all the ${symbol} together — what is the total?`;

    return (
        <div className="space-y-4" role="img" aria-label="Word problem visualizer">
            {/* Question echo */}
            <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl">
                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wide mb-1">The problem</p>
                <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed">{question}</p>
            </div>

            {/* Visual steps */}
            {steps.slice(0, step + 1).map((s, i) => {
                const c = COLOR_MAP[s.color] || COLOR_MAP.indigo;
                return (
                    <div key={i} className={`p-3 rounded-2xl border space-y-2 ${c.bg} ${c.border}`}>
                        <p className={`text-[10px] font-black uppercase tracking-wide ${c.text}`}>{s.label}</p>
                        <div className="flex flex-wrap gap-1">
                            {Array.from({ length: s.count }, (_, j) => (
                                <span key={j}
                                    className={`text-2xl leading-tight ${s.crossed ? 'opacity-25' : 'opacity-100'}`}
                                    role="presentation" aria-hidden="true">
                                    {symbol}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            })}

            {step < steps.length - 1 ? (
                <button type="button" onClick={() => setStep(s => s + 1)}
                    className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 border border-indigo-500/30 rounded-2xl text-xs font-bold transition-all">
                    Show next step →
                </button>
            ) : (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                    <p className="text-xs font-bold text-emerald-600">{finalPrompt}</p>
                </div>
            )}

            {step > 0 && (
                <button type="button" onClick={() => setStep(0)}
                    className="text-[10px] font-bold text-[var(--text-secondary)] hover:text-indigo-600 transition-colors">
                    ↩ Start over
                </button>
            )}
        </div>
    );
};

export default WordProblemVisualizer;
