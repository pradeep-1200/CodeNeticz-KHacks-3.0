/**
 * DivisionGroups — Visual Learning Assistant
 *
 * vizData: { total: 12, groups: 3 }
 *
 * Renders total objects split into groups equal groups.
 * Each group is revealed one by one — student discovers the per-group count.
 * Never shows the numerical quotient directly.
 */

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

const EMOJI = '🍎';
const MAX_PER_GROUP = 10;
const MAX_GROUPS    = 6;

function fallbackNums(text) {
    const nums = [...(text || '').matchAll(/\b(\d+)\b/g)]
        .map(m => parseInt(m[1], 10))
        .filter(n => n >= 2 && n <= 48);
    return nums.length >= 2 ? { total: nums[0], groups: nums[1] } : { total: 12, groups: 3 };
}

const DivisionGroups = ({ vizData = null, question = '', description = '' }) => {
    const fb = fallbackNums(question || description);

    const totalRaw  = vizData && typeof vizData.total  === 'number' ? vizData.total  : fb.total;
    const groupsRaw = vizData && typeof vizData.groups === 'number' ? vizData.groups : fb.groups;

    const g        = Math.min(Math.max(groupsRaw, 2), MAX_GROUPS);
    const perGroup = Math.floor(totalRaw / g);
    const perShow  = Math.min(perGroup, MAX_PER_GROUP);
    const displayed = g * perShow;

    const [revealed, setRevealed] = useState(0);

    return (
        <div className="space-y-4" role="img" aria-label={`${displayed} objects split into ${g} equal groups`}>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-wide">
                    {totalRaw} ÷ {g} — split into {g} equal groups
                </span>
                <button type="button" onClick={() => setRevealed(0)}
                    className="ml-auto flex items-center gap-1 text-[10px] font-bold text-[var(--text-secondary)] hover:text-blue-600 transition-colors"
                    aria-label="Reset groups">
                    <RotateCcw size={10} /> Reset
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from({ length: g }, (_, gi) => {
                    const show = gi < revealed;
                    return (
                        <div key={gi}
                            className={`p-2.5 rounded-2xl border transition-all duration-300 ${show ? 'bg-blue-500/10 border-blue-500/30' : 'bg-[var(--bg-base)] border-[var(--border-color)] opacity-50'}`}
                            role="group"
                            aria-label={`Group ${gi + 1}${show ? `: ${perShow} objects` : ': not yet revealed'}`}>
                            <p className="text-[9px] font-black text-blue-600 text-center mb-1.5">
                                Group {gi + 1}
                            </p>
                            <div className="flex flex-wrap gap-0.5 justify-center min-h-[32px]">
                                {show
                                    ? Array.from({ length: perShow }, (_, i) => (
                                        <span key={i} className="text-lg" role="presentation" aria-hidden="true">
                                            {EMOJI}
                                        </span>
                                    ))
                                    : <span className="text-[var(--text-secondary)] text-sm font-bold">?</span>
                                }
                            </div>
                        </div>
                    );
                })}
            </div>

            {revealed < g ? (
                <button type="button" onClick={() => setRevealed(v => v + 1)}
                    className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/30 rounded-2xl text-xs font-bold transition-all"
                    aria-label={`Reveal group ${revealed + 1}`}>
                    Reveal group {revealed + 1}
                </button>
            ) : (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                    <p className="text-xs font-bold text-emerald-600">
                        All {g} groups revealed! How many objects are in each group?
                        Check: {g} × that number should equal {totalRaw}.
                    </p>
                </div>
            )}
        </div>
    );
};

export default DivisionGroups;
