/**
 * HundredGrid — Visual Learning Assistant (Percentages)
 *
 * vizData: { percentage: 40 }
 *
 * Renders exactly `percentage` cells filled in a 10×10 grid.
 * Student hovers to explore. Never shows any calculated value.
 */

import React, { useState } from 'react';

function fallbackPercentage(text) {
    const match = (text || '').match(/(\d+)\s*%/);
    if (match) return Math.min(Math.max(parseInt(match[1], 10), 0), 100);
    return 25;
}

const HundredGrid = ({ vizData = null, question = '', description = '' }) => {
    const pct = (vizData && typeof vizData.percentage === 'number')
        ? Math.min(Math.max(Math.round(vizData.percentage), 0), 100)
        : fallbackPercentage(question + ' ' + description);

    const [hovered, setHovered] = useState(null);

    return (
        <div className="space-y-3" role="img" aria-label={`100-square grid showing ${pct}%`}>
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wide">
                    {pct}% of 100
                </span>
                <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                    Hover cells to explore
                </span>
            </div>

            <div className="grid gap-0.5" role="grid" aria-label="100 square grid"
                style={{ gridTemplateColumns: 'repeat(10, 1fr)', width: '200px' }}>
                {Array.from({ length: 100 }, (_, i) => {
                    const filled    = i < pct;
                    const isHovered = hovered !== null && i <= hovered;
                    return (
                        <div key={i} role="gridcell"
                            aria-label={`Cell ${i + 1}${filled ? ' (filled)' : ''}`}
                            className={`h-4 rounded-sm cursor-pointer transition-all duration-100 ${
                                isHovered ? 'bg-emerald-500 scale-110'
                                    : filled ? 'bg-indigo-500' : 'bg-indigo-100'
                            }`}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                            onFocus={() => setHovered(i)}
                            onBlur={() => setHovered(null)}
                            tabIndex={0} />
                    );
                })}
            </div>

            <div className="flex gap-3 items-center">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-indigo-500" aria-hidden="true" />
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">{pct} filled</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-indigo-100 border border-indigo-300" aria-hidden="true" />
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">{100 - pct} empty</span>
                </div>
            </div>

            {hovered !== null && (
                <p className="text-xs font-bold text-emerald-600">
                    {hovered + 1}% — that is {hovered + 1} out of 100 squares.
                </p>
            )}

            <p className="text-xs font-bold text-indigo-600">
                {pct}% means {pct} out of every 100. Use this grid to work through your question.
            </p>
        </div>
    );
};

export default HundredGrid;
