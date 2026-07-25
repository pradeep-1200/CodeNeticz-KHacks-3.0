/**
 * PlaceValueChart — Visual Learning Assistant
 *
 * vizData: { numbers: [24, 18] }
 *
 * Renders a place-value chart for each number in the array.
 * Student can switch between numbers using tab buttons.
 * Shows coloured blocks stacked per column: Hundreds/Tens/Ones and Tenths/Hundredths.
 * Never computes or reveals the answer.
 */

import React, { useState } from 'react';

function parsePlace(n) {
    const str  = String(n);
    const [wholePart = '0', decPart = ''] = str.split('.');
    const whole = Math.abs(parseInt(wholePart, 10)) || 0;
    return {
        hundreds:   Math.floor(whole / 100) % 10,
        tens:       Math.floor(whole / 10)  % 10,
        ones:       whole % 10,
        tenths:     decPart[0] ? parseInt(decPart[0], 10) : null,
        hundredths: decPart[1] ? parseInt(decPart[1], 10) : null,
        hasDecimal: decPart.length > 0,
        display:    str
    };
}

const COL = {
    hundreds:   { bg: 'bg-purple-500/20', border: 'border-purple-400', text: 'text-purple-700', block: '🟪' },
    tens:       { bg: 'bg-indigo-500/20', border: 'border-indigo-400', text: 'text-indigo-700', block: '🟦' },
    ones:       { bg: 'bg-blue-500/20',   border: 'border-blue-400',   text: 'text-blue-700',   block: '🟩' },
    tenths:     { bg: 'bg-teal-500/20',   border: 'border-teal-400',   text: 'text-teal-700',   block: '🟡' },
    hundredths: { bg: 'bg-green-500/20',  border: 'border-green-400',  text: 'text-green-700',  block: '🟠' },
};

const BlockStack = ({ count, style, label }) => {
    if (count === null || count === undefined) return null;
    return (
        <div className="flex flex-col items-center gap-1 min-w-[48px]">
            <div className="flex flex-col items-center gap-0.5 min-h-[60px] justify-end">
                {Array.from({ length: Math.min(count, 9) }, (_, i) => (
                    <span key={i} className="text-lg leading-tight" aria-hidden="true">{style.block}</span>
                ))}
                {count === 0 && (
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">0</span>
                )}
            </div>
            <div className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 font-black text-lg ${style.bg} ${style.border} ${style.text}`}>
                {count}
            </div>
            <p className="text-[9px] font-bold text-center text-[var(--text-secondary)] leading-tight max-w-[52px]">
                {label}
            </p>
        </div>
    );
};

function fallbackNumbers(text) {
    const raw = [...(text || '').matchAll(/\b(\d+(?:\.\d+)?)\b/g)].map(m => m[1]);
    return raw.length > 0 ? raw.slice(0, 2) : ['24', '18'];
}

const PlaceValueChart = ({ vizData = null, question = '', description = '' }) => {
    const rawNumbers = (vizData && Array.isArray(vizData.numbers) && vizData.numbers.length > 0)
        ? vizData.numbers.map(String)
        : fallbackNumbers(question + ' ' + description);

    const parsed     = rawNumbers.map(parsePlace);
    const hasDecimal = parsed.some(p => p.hasDecimal);
    const [showing, setShowing] = useState(0);
    const current = parsed[showing] || parsed[0];

    return (
        <div className="space-y-4" role="img" aria-label="Place value chart">
            {rawNumbers.length > 1 && (
                <div className="flex gap-2" role="tablist" aria-label="Number tabs">
                    {rawNumbers.map((n, i) => (
                        <button key={i} type="button" role="tab"
                            onClick={() => setShowing(i)} aria-selected={showing === i}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                                showing === i ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-indigo-400'
                            }`}>
                            {n}
                        </button>
                    ))}
                </div>
            )}

            <div className="overflow-x-auto">
                <div className="flex items-end gap-3 p-4 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl min-w-max">
                    {current.hundreds > 0 && (
                        <BlockStack count={current.hundreds} style={COL.hundreds} label="Hundreds" />
                    )}
                    <BlockStack count={current.tens}  style={COL.tens}  label="Tens" />
                    <BlockStack count={current.ones}  style={COL.ones}  label="Ones" />
                    {hasDecimal && (
                        <>
                            <div className="text-2xl font-black text-[var(--text-secondary)] mb-4" aria-hidden="true">.</div>
                            <BlockStack count={current.tenths}     style={COL.tenths}     label="Tenths" />
                            <BlockStack count={current.hundredths} style={COL.hundredths} label="Hundredths" />
                        </>
                    )}
                </div>
            </div>

            <p className="text-xs font-bold text-indigo-600">
                Each column shows the place value of each digit in {current.display}.
                Use this to understand the number before calculating.
            </p>
        </div>
    );
};

export default PlaceValueChart;
