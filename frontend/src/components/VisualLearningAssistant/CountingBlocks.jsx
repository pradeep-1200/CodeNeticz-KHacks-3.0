/**
 * CountingBlocks — Visual Learning Assistant
 *
 * Renders emoji blocks from AI-provided vizData.
 * vizData: { groups: [5, 1], symbol: "⭐" }
 *
 * Renders exactly groups[0] then groups[1] objects.
 * Never shows the total — student counts themselves.
 */

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

// ── Fallback context emoji picker ──────────────────────────────
function pickSymbol(text) {
    const q = (text || '').toLowerCase();
    if (/apple|fruit/i.test(q))     return '🍎';
    if (/ball/i.test(q))            return '⚽';
    if (/cookie|biscuit/i.test(q))  return '🍪';
    if (/book/i.test(q))            return '📚';
    if (/pencil/i.test(q))          return '✏️';
    if (/flower/i.test(q))          return '🌸';
    if (/star/i.test(q))            return '⭐';
    return '⭐';
}

// ── Fallback number extraction ─────────────────────────────────
function extractGroups(text) {
    const nums = [...(text || '').matchAll(/\b(\d+)\b/g)]
        .map(m => parseInt(m[1], 10))
        .filter(n => n > 0 && n <= 30);
    return nums.length >= 2 ? [nums[0], nums[1]] : [5, 3];
}

const CountingBlocks = ({ vizData = null, question = '', description = '' }) => {
    const [revealed, setRevealed] = useState(false);

    // Resolve groups and symbol from vizData or fallback
    const groups = vizData && Array.isArray(vizData.groups) && vizData.groups.length >= 2
        ? vizData.groups.map(n => Math.min(Math.max(parseInt(n) || 0, 0), 20))
        : extractGroups(question || description).map(n => Math.min(n, 20));

    const symbol = (vizData && vizData.symbol) || pickSymbol(question || description);

    const [groupA, groupB] = groups;

    return (
        <div className="space-y-4" role="img" aria-label={`${groupA} blocks plus ${groupB} blocks`}>
            <div className="flex flex-wrap items-center gap-4">
                {/* Group A */}
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wide text-center">
                        {groupA}
                    </p>
                    <div className="flex flex-wrap gap-1" style={{ maxWidth: `${Math.min(groupA, 10) * 32}px` }}>
                        {Array.from({ length: groupA }, (_, i) => (
                            <span key={i} className="text-2xl leading-tight select-none" role="presentation">
                                {symbol}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Operator */}
                <div className="text-3xl font-black text-indigo-400 shrink-0" aria-hidden="true">+</div>

                {/* Group B */}
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wide text-center">
                        {groupB}
                    </p>
                    <div className="flex flex-wrap gap-1" style={{ maxWidth: `${Math.min(groupB, 10) * 32}px` }}>
                        {Array.from({ length: groupB }, (_, i) => (
                            <span key={i} className="text-2xl leading-tight select-none" role="presentation">
                                {symbol}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {!revealed ? (
                <div className="flex items-center gap-2 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                    <p className="text-xs font-bold text-indigo-600">
                        Count all the {symbol} together — how many total?
                    </p>
                    <button type="button" onClick={() => setRevealed(true)}
                        className="ml-auto shrink-0 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 border border-indigo-500/30 rounded-xl text-[10px] font-bold transition-all"
                        aria-label="Show all blocks together">
                        Show together
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wide">
                        All together
                    </p>
                    <div className="flex flex-wrap gap-1 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                        {Array.from({ length: groupA }, (_, i) => (
                            <span key={`a${i}`} className="text-2xl leading-tight select-none" role="presentation">
                                {symbol}
                            </span>
                        ))}
                        <span className="text-xl font-black text-indigo-300 mx-1 self-center" aria-hidden="true">|</span>
                        {Array.from({ length: groupB }, (_, i) => (
                            <span key={`b${i}`} className="text-2xl leading-tight select-none" role="presentation">
                                {symbol}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs font-bold text-emerald-600">
                        Now count them all — what is the total?
                    </p>
                    <button type="button" onClick={() => setRevealed(false)}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-secondary)] hover:text-indigo-600 transition-colors">
                        <RotateCcw size={10} /> Reset
                    </button>
                </div>
            )}
        </div>
    );
};

export default CountingBlocks;
