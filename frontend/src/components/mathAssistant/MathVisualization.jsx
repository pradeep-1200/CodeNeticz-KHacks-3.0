/**
 * MathVisualization — Phase 6
 *
 * Renders a context-appropriate visual aid based on the
 * visualization type returned by the math assistant engine.
 *
 * Types: number_line, number_line_backward, array_grid,
 *        equal_groups, fraction_circle, place_value_chart,
 *        hundred_grid, shape_diagram, balance_scale, object_groups
 *
 * All visuals are pure SVG/DOM — no external libraries.
 */

import React, { useMemo } from 'react';

// ── Number Line ────────────────────────────────────────────────
const NumberLine = ({ question, backward = false }) => {
    const nums = [...(question || '').matchAll(/\b(\d+)\b/g)]
        .map(m => parseInt(m[1])).filter(n => n <= 100).slice(0, 2);
    const [a = 5, b = 3] = nums;
    const end   = Math.min((a + b) + 4, 30);
    const start = Math.max(0, backward ? a - b - 2 : 0);
    const range = end - start;
    const w     = 320;
    const step  = w / Math.max(range, 1);

    const markers = [];
    for (let i = start; i <= end; i++) {
        markers.push(i);
    }

    const posOf = (n) => ((n - start) / range) * w;
    const jumpStart = backward ? a : a;
    const jumpEnd   = backward ? a - b : a + b;

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                {backward ? 'Count Backward' : 'Count Forward'}
            </p>
            <svg width="100%" viewBox={`0 0 ${w + 20} 64`} className="overflow-visible">
                {/* Axis line */}
                <line x1="10" y1="32" x2={w + 10} y2="32" stroke="currentColor" strokeWidth="2" className="text-indigo-300" />
                {/* Arrow */}
                <polygon points={`${w + 10},28 ${w + 20},32 ${w + 10},36`} className="fill-indigo-400" />

                {/* Jump arc */}
                <path
                    d={`M ${posOf(jumpStart) + 10} 32 Q ${(posOf(jumpStart) + posOf(jumpEnd)) / 2 + 10} 8 ${posOf(jumpEnd) + 10} 32`}
                    fill="none" stroke={backward ? '#ef4444' : '#6366f1'} strokeWidth="2" strokeDasharray="4 2"
                />
                <text x={(posOf(jumpStart) + posOf(jumpEnd)) / 2 + 10} y="6" textAnchor="middle"
                    fontSize="9" fill={backward ? '#ef4444' : '#6366f1'} fontWeight="bold">
                    {backward ? `−${b}` : `+${b}`}
                </text>

                {/* Tick marks */}
                {markers.map((n) => (
                    <g key={n}>
                        <line x1={posOf(n) + 10} y1="26" x2={posOf(n) + 10} y2="38"
                            stroke="currentColor" strokeWidth={n === jumpStart || n === jumpEnd ? 2 : 1}
                            className={n === jumpStart || n === jumpEnd ? 'text-indigo-600' : 'text-gray-400'} />
                        {(n % Math.max(1, Math.floor(range / 8)) === 0 || n === jumpStart || n === jumpEnd) && (
                            <text x={posOf(n) + 10} y="52" textAnchor="middle"
                                fontSize="8" className="fill-current text-[var(--text-secondary)]"
                                fontWeight={n === jumpStart || n === jumpEnd ? 'bold' : 'normal'}>
                                {n}
                            </text>
                        )}
                    </g>
                ))}

                {/* Start dot */}
                <circle cx={posOf(jumpStart) + 10} cy="32" r="5" fill="#6366f1" />
                {/* End dot */}
                <circle cx={posOf(jumpEnd) + 10} cy="32" r="5" fill={backward ? '#ef4444' : '#22c55e'} />
            </svg>
        </div>
    );
};

// ── Array Grid (Multiplication) ────────────────────────────────
const ArrayGrid = ({ question }) => {
    const nums = [...(question || '').matchAll(/\b(\d+)\b/g)]
        .map(m => parseInt(m[1])).filter(n => n >= 2 && n <= 12).slice(0, 2);
    const [rows = 3, cols = 4] = nums;
    const r = Math.min(rows, 10);
    const c = Math.min(cols, 10);

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                {r} rows × {c} columns
            </p>
            <div className="flex flex-col gap-1">
                {Array.from({ length: r }, (_, ri) => (
                    <div key={ri} className="flex gap-1">
                        {Array.from({ length: c }, (_, ci) => (
                            <div key={ci}
                                className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[9px] font-black text-indigo-600">
                                ●
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <p className="text-[10px] font-semibold text-indigo-600">
                Count the total: {r} × {c} = ?
            </p>
        </div>
    );
};

// ── Equal Groups (Division) ────────────────────────────────────
const EqualGroups = ({ question }) => {
    const nums = [...(question || '').matchAll(/\b(\d+)\b/g)]
        .map(m => parseInt(m[1])).filter(n => n >= 1 && n <= 50).slice(0, 2);
    const [total = 12, groups = 3] = nums;
    const g = Math.min(groups, 6);
    const perGroup = Math.floor(total / g);
    const display = Math.min(perGroup, 8);

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                {total} split into {g} equal groups
            </p>
            <div className="flex flex-wrap gap-2">
                {Array.from({ length: g }, (_, gi) => (
                    <div key={gi} className="p-2 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-1 min-w-[60px]">
                        <p className="text-[9px] font-bold text-blue-600 text-center">Group {gi + 1}</p>
                        <div className="flex flex-wrap gap-0.5 justify-center">
                            {Array.from({ length: display }, (_, i) => (
                                <span key={i} className="text-blue-500 text-xs">●</span>
                            ))}
                            {perGroup > display && <span className="text-[9px] text-blue-400">…</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Fraction Circle ────────────────────────────────────────────
const FractionCircle = ({ question }) => {
    const matches = [...(question || '').matchAll(/(\d+)\/(\d+)/g)];
    const num = matches[0] ? parseInt(matches[0][1]) : 1;
    const den = matches[0] ? parseInt(matches[0][2]) : 4;
    const n = Math.min(Math.max(num, 1), den);
    const d = Math.min(Math.max(den, 2), 12);
    const r = 48;
    const cx = 56;
    const cy = 56;

    const slices = Array.from({ length: d }, (_, i) => {
        const startAngle = (i / d) * 2 * Math.PI - Math.PI / 2;
        const endAngle   = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const large = (1 / d) > 0.5 ? 1 : 0;
        return { i, x1, y1, x2, y2, large, filled: i < n };
    });

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                {n}/{d} of the circle
            </p>
            <svg width="112" height="112" viewBox="0 0 112 112">
                {slices.map(({ i, x1, y1, x2, y2, large, filled }) => (
                    <path key={i}
                        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
                        fill={filled ? '#6366f1' : '#e0e7ff'}
                        stroke="white" strokeWidth="1.5"
                    />
                ))}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#6366f1" strokeWidth="1.5" />
            </svg>
            <p className="text-[10px] font-semibold text-indigo-600">
                {n} out of {d} parts shaded
            </p>
        </div>
    );
};

// ── Place Value Chart (Decimals) ────────────────────────────────
const PlaceValueChart = ({ question }) => {
    const nums = [...(question || '').matchAll(/\b(\d+\.?\d*)\b/g)]
        .map(m => m[1]).filter(s => s.includes('.')).slice(0, 1);
    const raw = nums[0] || '3.14';
    const [whole, decimal = '0'] = raw.split('.');
    const cols = [
        { label: 'Hundreds', val: Math.floor(parseInt(whole) / 100) % 10 || '-' },
        { label: 'Tens',     val: Math.floor(parseInt(whole) / 10) % 10 || '-' },
        { label: 'Ones',     val: parseInt(whole) % 10 },
        { label: '.',        val: '·', sep: true },
        { label: 'Tenths',   val: decimal[0] || 0 },
        { label: 'Hundredths', val: decimal[1] || 0 }
    ];

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">Place Value</p>
            <div className="flex gap-0.5">
                {cols.map((c, i) => (
                    <div key={i} className={`flex flex-col items-center ${c.sep ? 'px-0.5' : 'flex-1'}`}>
                        {!c.sep && (
                            <>
                                <div className={`w-full h-8 flex items-center justify-center rounded-t-lg font-black text-sm border-b-2 ${
                                    i < 3 ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-blue-100 text-blue-700 border-blue-300'
                                }`}>{c.val}</div>
                                <p className="text-[8px] font-semibold text-center text-[var(--text-secondary)] mt-1 leading-tight">{c.label}</p>
                            </>
                        )}
                        {c.sep && <div className="h-8 flex items-center font-black text-xl text-[var(--text-secondary)]">.</div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Hundred Grid (Percentages) ─────────────────────────────────
const HundredGrid = ({ question }) => {
    const match = (question || '').match(/(\d+)\s*%/);
    const pct = match ? Math.min(parseInt(match[1]), 100) : 25;

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                {pct}% of 100
            </p>
            <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(10, 1fr)', width: '160px' }}>
                {Array.from({ length: 100 }, (_, i) => (
                    <div key={i} className={`h-3.5 rounded-sm ${i < pct ? 'bg-indigo-500' : 'bg-indigo-100'}`} />
                ))}
            </div>
            <p className="text-[10px] font-semibold text-indigo-600">{pct} out of 100 squares filled</p>
        </div>
    );
};

// ── Shape Diagram (Geometry) ───────────────────────────────────
const ShapeDiagram = ({ question }) => {
    const q = (question || '').toLowerCase();
    const nums = [...question.matchAll(/\b(\d+)\b/g)].map(m => parseInt(m[1])).slice(0, 2);
    const [a = 5, b = 3] = nums;

    if (/circle/.test(q)) {
        return (
            <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="48" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
                <line x1="60" y1="60" x2="108" y2="60" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 2" />
                <text x="84" y="55" fontSize="10" fill="#6366f1" fontWeight="bold">r = {a}</text>
            </svg>
        );
    }
    if (/triangle/.test(q)) {
        return (
            <svg width="120" height="110" viewBox="0 0 120 110">
                <polygon points="60,10 10,100 110,100" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
                <text x="55" y="108" fontSize="9" fill="#6366f1" fontWeight="bold">base={a}</text>
                <text x="2"  y="62"  fontSize="9" fill="#6366f1" fontWeight="bold">h={b}</text>
            </svg>
        );
    }
    // Default: rectangle
    return (
        <svg width="140" height="90" viewBox="0 0 140 90">
            <rect x="10" y="10" width="120" height="70" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
            <text x="60" y="82"  textAnchor="middle" fontSize="9" fill="#6366f1" fontWeight="bold">length = {a}</text>
            <text x="2"  y="50"  textAnchor="middle" fontSize="9" fill="#6366f1" fontWeight="bold" transform="rotate(-90 2 50)">width = {b}</text>
        </svg>
    );
};

// ── Balance Scale (Algebra) ────────────────────────────────────
const BalanceScale = ({ question }) => {
    const match = question.match(/([a-z])\s*[+\-]\s*(\d+)\s*=\s*(\d+)/i);
    const varName = match ? match[1] : 'x';
    const num     = match ? match[2] : '?';
    const total   = match ? match[3] : '?';

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">Balance Scale</p>
            <svg width="180" height="100" viewBox="0 0 180 100">
                {/* Beam */}
                <line x1="20" y1="40" x2="160" y2="40" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                {/* Fulcrum */}
                <polygon points="90,40 80,80 100,80" fill="#6366f1" />
                {/* Left pan */}
                <line x1="40" y1="40" x2="40" y2="60" stroke="#6366f1" strokeWidth="1.5" />
                <ellipse cx="40" cy="65" rx="22" ry="7" fill="#c7d2fe" stroke="#6366f1" strokeWidth="1.5" />
                <text x="40" y="68" textAnchor="middle" fontSize="11" fill="#4f46e5" fontWeight="bold">{varName}</text>
                {/* Right pan */}
                <line x1="140" y1="40" x2="140" y2="60" stroke="#6366f1" strokeWidth="1.5" />
                <ellipse cx="140" cy="65" rx="22" ry="7" fill="#c7d2fe" stroke="#6366f1" strokeWidth="1.5" />
                <text x="140" y="68" textAnchor="middle" fontSize="11" fill="#4f46e5" fontWeight="bold">{total}</text>
                {/* Labels */}
                <text x="40"  y="88" textAnchor="middle" fontSize="8" fill="#6b7280">Unknown</text>
                <text x="140" y="88" textAnchor="middle" fontSize="8" fill="#6b7280">Total</text>
            </svg>
            <p className="text-[10px] font-semibold text-indigo-600">
                Both sides must be equal. What is {varName}?
            </p>
        </div>
    );
};

// ── Object Groups (Word Problems) ─────────────────────────────
const ObjectGroups = ({ question }) => {
    const nums = [...(question || '').matchAll(/\b(\d+)\b/g)]
        .map(m => parseInt(m[1])).filter(n => n > 0 && n <= 30).slice(0, 2);
    const [total = 10, remove = 4] = nums;
    const remaining = Math.max(0, total - remove);
    const emojis = ['🍎', '📦', '🎒', '🐑', '🍪', '⭐'];
    const emoji = emojis[total % emojis.length];

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                {total} objects — {remove} taken away
            </p>
            <div className="flex flex-wrap gap-1">
                {Array.from({ length: Math.min(total, 20) }, (_, i) => (
                    <span key={i} className={`text-lg ${i < remove ? 'opacity-20' : 'opacity-100'}`}
                        title={i < remove ? 'Removed' : 'Remaining'}>
                        {emoji}
                    </span>
                ))}
                {total > 20 && <span className="text-xs text-[var(--text-secondary)]">+{total - 20} more</span>}
            </div>
            <p className="text-[10px] font-semibold text-indigo-600">
                {remaining} remain — does that match your answer?
            </p>
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────
const MathVisualization = ({ type, question }) => {
    const q = question || '';
    const map = {
        number_line:          <NumberLine question={q} />,
        number_line_backward: <NumberLine question={q} backward />,
        array_grid:           <ArrayGrid question={q} />,
        equal_groups:         <EqualGroups question={q} />,
        fraction_circle:      <FractionCircle question={q} />,
        place_value_chart:    <PlaceValueChart question={q} />,
        hundred_grid:         <HundredGrid question={q} />,
        shape_diagram:        <ShapeDiagram question={q} />,
        balance_scale:        <BalanceScale question={q} />,
        object_groups:        <ObjectGroups question={q} />
    };

    const visual = map[type];
    if (!visual) return null;

    return (
        <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl overflow-x-auto">
            {visual}
        </div>
    );
};

export default MathVisualization;
