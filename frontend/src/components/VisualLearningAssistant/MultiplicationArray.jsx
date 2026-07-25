/**
 * MultiplicationArray — Visual Learning Assistant
 *
 * vizData: { rows: 4, columns: 6 }
 *
 * Renders exactly rows × columns grid. Row-by-row reveal.
 * Student counts all objects — answer never shown.
 */

import React, { useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';

function fallbackNums(text) {
    const nums = [...(text || '').matchAll(/\b(\d+)\b/g)]
        .map(m => parseInt(m[1], 10))
        .filter(n => n >= 2 && n <= 12);
    return nums.length >= 2 ? [nums[0], nums[1]] : [3, 4];
}

const CELL_SYMBOL = '⭐';

const MultiplicationArray = ({ vizData = null, question = '', description = '' }) => {
    const rawRows = vizData && typeof vizData.rows    === 'number' ? vizData.rows    : null;
    const rawCols = vizData && typeof vizData.columns === 'number' ? vizData.columns : null;

    const [fbR, fbC] = fallbackNums(question || description);
    const r = Math.min(Math.max(rawRows ?? fbR, 1), 12);
    const c = Math.min(Math.max(rawCols ?? fbC, 1), 12);

    const [visibleRows, setVisibleRows] = useState(1);
    const allVisible = visibleRows >= r;

    return (
        <div className="space-y-3" role="img" aria-label={`${r} rows of ${c} stars — multiplication array`}>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wide">
                    {r} rows × {c} columns
                </span>
                <button type="button" onClick={() => setVisibleRows(1)}
                    className="ml-auto flex items-center gap-1 text-[10px] font-bold text-[var(--text-secondary)] hover:text-indigo-600 transition-colors"
                    aria-label="Reset grid">
                    <RotateCcw size={10} /> Reset
                </button>
            </div>

            {/* Grid */}
            <div className="space-y-1 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl">
                {Array.from({ length: r }, (_, ri) => (
                    <div key={ri}
                        className={`flex gap-1 transition-all duration-300 ${ri < visibleRows ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        style={{ height: ri < visibleRows ? 'auto' : '0px', overflow: 'hidden' }}
                        aria-label={`Row ${ri + 1}: ${c} stars`}>
                        {Array.from({ length: c }, (_, ci) => (
                            <span key={ci} className="text-xl leading-tight" role="presentation" aria-hidden="true">
                                {CELL_SYMBOL}
                            </span>
                        ))}
                        <span className="ml-2 text-[10px] font-bold text-indigo-400 self-center">
                            × {ri + 1}
                        </span>
                    </div>
                ))}
            </div>

            {visibleRows > 1 && (
                <p className="text-xs font-semibold text-[var(--text-secondary)]">
                    {visibleRows} row{visibleRows > 1 ? 's' : ''} × {c} = {visibleRows * c} so far
                </p>
            )}

            {!allVisible ? (
                <button type="button" onClick={() => setVisibleRows(v => Math.min(v + 1, r))}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 border border-indigo-500/30 rounded-2xl text-xs font-bold transition-all"
                    aria-label={`Show row ${visibleRows + 1}`}>
                    <ChevronDown size={13} /> Show row {visibleRows + 1}
                </button>
            ) : (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                    <p className="text-xs font-bold text-emerald-600">
                        All {r} rows visible — count every {CELL_SYMBOL}. What is {r} × {c}?
                    </p>
                </div>
            )}
        </div>
    );
};

export default MultiplicationArray;
