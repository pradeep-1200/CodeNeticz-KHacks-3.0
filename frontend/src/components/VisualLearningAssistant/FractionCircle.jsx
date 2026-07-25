/**
 * FractionCircle — Visual Learning Assistant
 *
 * vizData: { fractions: [{ numerator: 3, denominator: 4 }] }
 *
 * Renders exactly the fractions from vizData as SVG pie charts.
 * Multiple fractions = tabbed circles.
 * Never reveals the computed result.
 */

import React, { useState } from 'react';

function fallbackFractions(text) {
    const matches = [...(text || '').matchAll(/(\d+)\s*\/\s*(\d+)/g)];
    const fracs = matches.map(m => ({ numerator: parseInt(m[1], 10), denominator: parseInt(m[2], 10) }))
        .filter(f => f.denominator > 0 && f.numerator >= 0)
        .slice(0, 2);
    return fracs.length > 0 ? fracs : [{ numerator: 1, denominator: 4 }];
}

function svgSlices(numerator, denominator, r, cx, cy, fillColor) {
    const n = Math.min(Math.max(numerator, 0), denominator);
    const d = Math.max(denominator, 1);
    return Array.from({ length: d }, (_, i) => {
        const startAngle = (i / d) * 2 * Math.PI - Math.PI / 2;
        const endAngle   = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const large = (1 / d) > 0.5 ? 1 : 0;
        return (
            <path key={i}
                d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
                fill={i < n ? fillColor : '#e0e7ff'}
                stroke="white" strokeWidth="1.5" />
        );
    });
}

const FractionCircle = ({ vizData = null, question = '', description = '' }) => {
    const fractions = (vizData && Array.isArray(vizData.fractions) && vizData.fractions.length > 0)
        ? vizData.fractions.map(f => ({
            numerator:   parseInt(f.numerator)   || 0,
            denominator: parseInt(f.denominator) || 4
        }))
        : fallbackFractions(question + ' ' + description);

    const [tab, setTab] = useState(0);
    const f = fractions[tab] || fractions[0];
    const { numerator: num, denominator: den } = f;

    const r = 52, cx = 60, cy = 60;

    return (
        <div className="space-y-3" role="img" aria-label={`Fraction circle: ${num}/${den}`}>
            {fractions.length > 1 && (
                <div className="flex gap-2" role="tablist" aria-label="Fraction tabs">
                    {fractions.map((fr, i) => (
                        <button key={i} type="button" role="tab"
                            onClick={() => setTab(i)} aria-selected={tab === i}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                                tab === i ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-indigo-400'
                            }`}>
                            {fr.numerator}/{fr.denominator}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-6 flex-wrap">
                <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
                    {svgSlices(num, den, r, cx, cy, '#6366f1')}
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#6366f1" strokeWidth="2" />
                    <text x={cx} y={cy - 6}  textAnchor="middle" fontSize="13" fill="#4f46e5" fontWeight="bold">{num}</text>
                    <line  x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} stroke="#4f46e5" strokeWidth="1.5" />
                    <text x={cx} y={cy + 16} textAnchor="middle" fontSize="13" fill="#4f46e5" fontWeight="bold">{den}</text>
                </svg>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-indigo-500 shrink-0" aria-hidden="true" />
                        <p className="text-xs font-semibold text-[var(--text-primary)]">
                            {num} part{num !== 1 ? 's' : ''} shaded
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-indigo-100 border border-indigo-300 shrink-0" aria-hidden="true" />
                        <p className="text-xs font-semibold text-[var(--text-secondary)]">
                            {den - num} part{den - num !== 1 ? 's' : ''} unshaded
                        </p>
                    </div>
                    <p className="text-[10px] font-bold text-indigo-600">
                        Whole divided into {den} equal parts.
                    </p>
                </div>
            </div>

            <p className="text-xs font-bold text-indigo-600">
                {num}/{den} of the circle is shaded. Use this to work out your answer.
            </p>
        </div>
    );
};

export default FractionCircle;
