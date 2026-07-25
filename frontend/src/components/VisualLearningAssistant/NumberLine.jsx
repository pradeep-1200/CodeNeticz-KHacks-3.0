/**
 * NumberLine — Visual Learning Assistant
 *
 * Renders an exact number line from AI-provided vizData.
 * vizData schema:
 *   { start, jumps: number[], direction: "forward"|"backward",
 *     rangeMin, rangeMax, rangeStep }
 *
 * Example for 77 + 23:
 *   start=77, jumps=[20,3], direction="forward", rangeMin=75, rangeMax=105, rangeStep=5
 *   Renders: 75 80 85 90 95 100 105  •77 →jump+20→ 97 →jump+3→ 100
 *
 * Falls back to regex extraction ONLY if vizData is absent.
 */

import React, { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

// ── Fallback: extract numbers from text ───────────────────────
function extractNums(text) {
    return [...(text || '').matchAll(/\b(\d+)\b/g)]
        .map(m => parseInt(m[1], 10))
        .filter(n => n >= 0 && n <= 9999);
}

// ── Derive range from vizData or fallback values ───────────────
function resolveParams(vizData, question, description, backward) {
    if (vizData && typeof vizData.start === 'number' && Array.isArray(vizData.jumps)) {
        return {
            start:     vizData.start,
            jumps:     vizData.jumps.filter(j => typeof j === 'number' && j > 0),
            rangeMin:  typeof vizData.rangeMin === 'number' ? vizData.rangeMin : null,
            rangeMax:  typeof vizData.rangeMax === 'number' ? vizData.rangeMax : null,
            rangeStep: typeof vizData.rangeStep === 'number' ? vizData.rangeStep : 5,
            backward:  vizData.direction === 'backward' || backward
        };
    }
    // Fallback
    const nums = extractNums(question).length >= 2 ? extractNums(question) : extractNums(description);
    const [a = 5, b = 3] = nums;
    return { start: a, jumps: [b], rangeMin: null, rangeMax: null, rangeStep: 1, backward };
}

const NumberLine = ({ vizData = null, question = '', description = '', backward = false }) => {
    const [jumpStep, setJumpStep] = useState(0); // how many jumps revealed
    const [reset,    setReset]    = useState(false);

    const { start, jumps, rangeMin, rangeMax, rangeStep, backward: bwd } =
        resolveParams(vizData, question, description, backward);

    // Build cumulative waypoints: start → after jump1 → after jump2 → …
    const waypoints = [start];
    for (const j of jumps) {
        const last = waypoints[waypoints.length - 1];
        waypoints.push(bwd ? last - j : last + j);
    }

    const finalPos  = waypoints[waypoints.length - 1];
    const direction = bwd ? -1 : 1;

    // Determine axis range
    const allPoints = waypoints;
    const dataMin   = Math.min(...allPoints);
    const dataMax   = Math.max(...allPoints);

    const axisMin = rangeMin !== null
        ? rangeMin
        : Math.floor((dataMin - rangeStep) / rangeStep) * rangeStep;
    const axisMax = rangeMax !== null
        ? rangeMax
        : Math.ceil((dataMax + rangeStep) / rangeStep) * rangeStep;

    const axisRange = Math.max(axisMax - axisMin, 1);

    // SVG geometry
    const W      = 320;
    const PAD    = 12;
    const posOf  = (n) => PAD + ((n - axisMin) / axisRange) * (W - PAD * 2);

    // Build tick array
    const ticks = [];
    for (let v = axisMin; v <= axisMax; v += rangeStep) {
        ticks.push(v);
    }
    // Always ensure waypoints appear in ticks for labelling
    for (const wp of waypoints) {
        if (!ticks.includes(wp)) ticks.push(wp);
    }
    ticks.sort((a, b) => a - b);

    const revealedJumps = jumpStep; // number of jumps shown so far
    const currentPos    = waypoints[Math.min(revealedJumps, waypoints.length - 1)];
    const hasMoreJumps  = revealedJumps < jumps.length;

    const arcColor  = bwd ? '#ef4444' : '#6366f1';
    const dotColors = ['#6366f1', '#f59e0b', '#22c55e', '#a855f7'];

    const handleNext = () => setJumpStep(s => Math.min(s + 1, jumps.length));
    const handleReset = () => setJumpStep(0);

    return (
        <div className="space-y-3" role="img"
            aria-label={`Number line: start at ${start}, ${bwd ? 'subtract' : 'add'} ${jumps.join(' then ')}`}>

            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wide">
                    {bwd ? 'Count backward' : 'Count forward'} on the number line
                </span>
                <div className="ml-auto flex gap-2">
                    {hasMoreJumps ? (
                        <button type="button" onClick={handleNext}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 border border-indigo-500/30 rounded-xl text-[10px] font-bold transition-all"
                            aria-label={`Show jump ${revealedJumps + 1}`}>
                            <Play size={11} /> Jump {revealedJumps + 1}
                        </button>
                    ) : (
                        <button type="button" onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-xl text-[10px] font-bold transition-all hover:border-indigo-400"
                            aria-label="Reset number line">
                            <RotateCcw size={11} /> Reset
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <svg
                    width="100%"
                    viewBox={`0 0 ${W + 20} 90`}
                    className="overflow-visible"
                    style={{ minWidth: `${Math.max(260, ticks.length * 24)}px` }}
                    aria-hidden="true"
                >
                    {/* Axis line */}
                    <line x1={PAD} y1="52" x2={W + 8} y2="52"
                        stroke="#c7d2fe" strokeWidth="2" />
                    {/* Arrow head */}
                    <polygon points={`${W + 8},48 ${W + 20},52 ${W + 8},56`} fill="#a5b4fc" />

                    {/* Jump arcs — reveal one at a time */}
                    {Array.from({ length: revealedJumps }, (_, ji) => {
                        const fromPt = waypoints[ji];
                        const toPt   = waypoints[ji + 1];
                        const fx = posOf(fromPt);
                        const tx = posOf(toPt);
                        const mx = (fx + tx) / 2;
                        const color = bwd ? '#ef4444' : dotColors[ji % dotColors.length];
                        const jumpVal = jumps[ji];
                        const sign = bwd ? '−' : '+';
                        return (
                            <g key={ji}>
                                <path
                                    d={`M ${fx} 52 Q ${mx} 18 ${tx} 52`}
                                    fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="5 3"
                                />
                                <text x={mx} y="12" textAnchor="middle" fontSize="11"
                                    fill={color} fontWeight="bold">
                                    {sign}{jumpVal}
                                </text>
                            </g>
                        );
                    })}

                    {/* Tick marks */}
                    {ticks.map((n) => {
                        const x       = posOf(n);
                        const isWP    = waypoints.includes(n) && n !== start;
                        const isStart = n === start;
                        const isKey   = isStart || (waypoints.includes(n) && waypoints.indexOf(n) <= revealedJumps);
                        return (
                            <g key={n}>
                                <line x1={x} y1={isKey ? 44 : 47}
                                    x2={x} y2={isKey ? 60 : 57}
                                    stroke={isKey ? '#6366f1' : '#d1d5db'}
                                    strokeWidth={isKey ? 2.5 : 1} />
                                <text x={x} y="72"
                                    textAnchor="middle"
                                    fontSize={isKey ? '10' : '8'}
                                    fontWeight={isKey ? 'bold' : 'normal'}
                                    fill={isKey ? '#4f46e5' : '#9ca3af'}>
                                    {n}
                                </text>
                            </g>
                        );
                    })}

                    {/* Start dot */}
                    <circle cx={posOf(start)} cy="52" r="7" fill="#6366f1" />
                    <text x={posOf(start)} y="40" textAnchor="middle"
                        fontSize="9" fill="#4f46e5" fontWeight="bold">start</text>

                    {/* Intermediate waypoint dots */}
                    {Array.from({ length: revealedJumps }, (_, ji) => {
                        const wp = waypoints[ji + 1];
                        const isLast = ji + 1 === jumps.length;
                        return (
                            <circle key={ji}
                                cx={posOf(wp)} cy="52" r={isLast ? 8 : 6}
                                fill={isLast ? '#22c55e' : '#f59e0b'}
                                stroke="white" strokeWidth="1.5" />
                        );
                    })}
                </svg>
            </div>

            {/* Status text */}
            <p className="text-xs font-bold text-indigo-600">
                {revealedJumps === 0
                    ? `Start at ${start}. Press "Jump 1" to begin.`
                    : hasMoreJumps
                    ? `After ${revealedJumps} jump${revealedJumps > 1 ? 's' : ''}, you are at ${currentPos}. Press "Jump ${revealedJumps + 1}" to continue.`
                    : `You've made all ${jumps.length} jump${jumps.length > 1 ? 's' : ''}. Where did you land? Count the position!`}
            </p>
        </div>
    );
};

export default NumberLine;
