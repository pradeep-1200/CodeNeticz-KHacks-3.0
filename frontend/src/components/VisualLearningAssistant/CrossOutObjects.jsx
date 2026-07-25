/**
 * CrossOutObjects — Visual Learning Assistant (Subtraction)
 *
 * vizData: { total: 9, remove: 4, symbol: "🍎" }
 *
 * Renders exactly `total` objects. Student clicks to cross out `remove` of them.
 * Never shows the numerical remainder — student counts remaining objects.
 */

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

function fallbackEmoji(text) {
    if (/apple|fruit/i.test(text))    return '🍎';
    if (/ball/i.test(text))           return '⚽';
    if (/cookie|biscuit/i.test(text)) return '🍪';
    if (/banana/i.test(text))         return '🍌';
    if (/book/i.test(text))           return '📚';
    if (/pencil/i.test(text))         return '✏️';
    if (/star/i.test(text))           return '⭐';
    return '🍎';
}

function fallbackNums(text) {
    const nums = [...(text || '').matchAll(/\b(\d+)\b/g)]
        .map(m => parseInt(m[1], 10))
        .filter(n => n > 0 && n <= 30);
    return nums.length >= 2 ? { total: nums[0], remove: nums[1] } : { total: 8, remove: 3 };
}

const CrossOutObjects = ({ vizData = null, question = '', description = '' }) => {
    const combined = (question + ' ' + description).trim();

    const total  = vizData && typeof vizData.total  === 'number' ? Math.min(vizData.total,  24) : Math.min(fallbackNums(combined).total,  24);
    const remove = vizData && typeof vizData.remove === 'number' ? Math.min(vizData.remove, total) : Math.min(fallbackNums(combined).remove, total);
    const symbol = (vizData && vizData.symbol) || fallbackEmoji(combined);

    const [crossedOut, setCrossedOut] = useState(new Set());

    const toggleCross = (i) => {
        setCrossedOut(prev => {
            const next = new Set(prev);
            if (next.has(i)) next.delete(i); else next.add(i);
            return next;
        });
    };

    const crossAll = () => setCrossedOut(new Set(Array.from({ length: remove }, (_, i) => i)));
    const resetAll = () => setCrossedOut(new Set());

    return (
        <div className="space-y-4" role="img" aria-label={`${total} objects, cross out ${remove}`}>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-wide">
                    {total} objects — cross out {remove}
                </span>
                <button type="button" onClick={resetAll}
                    className="ml-auto flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-[var(--text-secondary)] hover:text-red-600 transition-colors"
                    aria-label="Reset objects">
                    <RotateCcw size={10} /> Reset
                </button>
            </div>

            {/* Objects — click to cross out */}
            <div className="flex flex-wrap gap-2 p-3 bg-red-500/5 border border-red-500/15 rounded-2xl">
                {Array.from({ length: total }, (_, i) => (
                    <button key={i} type="button" onClick={() => toggleCross(i)}
                        aria-label={crossedOut.has(i) ? `Restore object ${i + 1}` : `Cross out object ${i + 1}`}
                        aria-pressed={crossedOut.has(i)}
                        className={`relative text-2xl leading-tight transition-all duration-200 rounded-lg p-0.5 focus:outline-none focus:ring-2 focus:ring-red-400 ${
                            crossedOut.has(i) ? 'opacity-25 scale-90' : 'hover:scale-110 hover:bg-red-500/10'
                        }`}>
                        {symbol}
                        {crossedOut.has(i) && (
                            <span className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-xl pointer-events-none" aria-hidden="true">
                                ✕
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Quick button */}
            {crossedOut.size === 0 && (
                <button type="button" onClick={crossAll}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 rounded-2xl text-xs font-bold transition-all">
                    Cross out {remove} objects
                </button>
            )}

            {crossedOut.size > 0 && (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                    <p className="text-xs font-bold text-emerald-600">
                        {crossedOut.size >= remove
                            ? `You crossed out ${crossedOut.size}. Count the ones still visible — how many remain?`
                            : `Crossed out: ${crossedOut.size} / ${remove}. Keep going!`}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CrossOutObjects;
