/**
 * HintCard — Phase 6
 *
 * Unlocks hints one by one on request.
 * Never directly reveals the answer — hints guide thinking only.
 */

import React, { useState } from 'react';
import { Lightbulb, ChevronRight, Lock } from 'lucide-react';

const HintCard = ({ hints = [] }) => {
    const [unlocked, setUnlocked] = useState(0);

    if (hints.length === 0) return null;

    const handleUnlock = () => {
        if (unlocked < hints.length) setUnlocked(u => u + 1);
    };

    return (
        <div className="space-y-2">
            {/* Unlocked hints */}
            {hints.slice(0, unlocked).map((hint, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                    <div className="w-5 h-5 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <Lightbulb size={11} className="text-amber-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-wide text-amber-500 mb-0.5">
                            Hint {i + 1}
                        </p>
                        <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed">
                            {hint}
                        </p>
                    </div>
                </div>
            ))}

            {/* Locked hints preview */}
            {hints.slice(unlocked).map((_, i) => (
                <div key={unlocked + i}
                    className="flex items-center gap-2.5 p-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl opacity-50">
                    <Lock size={12} className="text-[var(--text-secondary)] shrink-0" />
                    <p className="text-[10px] font-bold text-[var(--text-secondary)]">
                        Hint {unlocked + i + 1} — locked
                    </p>
                </div>
            ))}

            {/* Unlock button */}
            {unlocked < hints.length ? (
                <button
                    type="button"
                    onClick={handleUnlock}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/30 rounded-2xl text-xs font-bold transition-all"
                >
                    <Lightbulb size={12} />
                    {unlocked === 0 ? 'Show first hint' : `Show hint ${unlocked + 1}`}
                    <ChevronRight size={11} />
                </button>
            ) : (
                <p className="text-[10px] font-bold text-center text-emerald-500 py-1">
                    All hints shown — now try solving it!
                </p>
            )}
        </div>
    );
};

export default HintCard;
