/**
 * GeometryVisualizer — Visual Learning Assistant
 *
 * vizData: { shape: "rectangle", dimensions: { length: 8, width: 5 } }
 *
 * Renders exact SVG shape with AI-provided measurements labelled.
 * Never calculates the answer — only displays the shape.
 */

import React, { useState } from 'react';

// ── Shape SVG renderers — all take `dims` object ──────────────

const RectangleSVG = ({ dims }) => {
    const l = dims.length ?? dims.l ?? 6;
    const w = dims.width  ?? dims.w ?? 4;
    return (
        <svg width="190" height="120" viewBox="0 0 190 120" aria-hidden="true">
            <rect x="15" y="15" width="160" height="82" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2.5" rx="2" />
            <text x="95" y="114" textAnchor="middle" fontSize="12" fill="#4f46e5" fontWeight="bold">
                length = {l}
            </text>
            <text x="5" y="60" textAnchor="middle" fontSize="12" fill="#4f46e5" fontWeight="bold"
                transform="rotate(-90 5 60)">
                width = {w}
            </text>
        </svg>
    );
};

const SquareSVG = ({ dims }) => {
    const s = dims.side ?? dims.s ?? 5;
    return (
        <svg width="150" height="150" viewBox="0 0 150 150" aria-hidden="true">
            <rect x="15" y="15" width="120" height="120" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2.5" />
            <text x="75" y="148" textAnchor="middle" fontSize="12" fill="#4f46e5" fontWeight="bold">side = {s}</text>
            <text x="4"  y="78" textAnchor="middle" fontSize="12" fill="#4f46e5" fontWeight="bold"
                transform="rotate(-90 4 78)">side = {s}</text>
        </svg>
    );
};

const TriangleSVG = ({ dims }) => {
    const b = dims.base   ?? dims.b ?? 6;
    const h = dims.height ?? dims.h ?? 4;
    return (
        <svg width="170" height="140" viewBox="0 0 170 140" aria-hidden="true">
            <polygon points="85,10 10,130 160,130" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2.5" />
            <text x="85" y="138" textAnchor="middle" fontSize="12" fill="#4f46e5" fontWeight="bold">base = {b}</text>
            <text x="24" y="80"  fontSize="12" fill="#4f46e5" fontWeight="bold">h = {h}</text>
            <line x1="85" y1="10" x2="85" y2="130"
                stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
            <text x="90" y="74" fontSize="10" fill="#6366f1">height</text>
        </svg>
    );
};

const CircleSVG = ({ dims }) => {
    const r = dims.radius ?? dims.r ?? 5;
    return (
        <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
            <circle cx="70" cy="70" r="58" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2.5" />
            <line x1="70" y1="70" x2="128" y2="70" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="70" cy="70" r="3" fill="#6366f1" />
            <text x="100" y="63" fontSize="12" fill="#4f46e5" fontWeight="bold">r = {r}</text>
            <text x="100" y="76" fontSize="10" fill="#6366f1">radius</text>
        </svg>
    );
};

const CubeSVG = ({ dims }) => {
    const s = dims.side ?? dims.s ?? 4;
    return (
        <svg width="150" height="140" viewBox="0 0 150 140" aria-hidden="true">
            <rect x="15" y="35" width="85" height="85" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
            <polygon points="15,35 55,5 140,5 100,35" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" />
            <polygon points="100,35 140,5 140,90 100,120" fill="#a5b4fc" stroke="#6366f1" strokeWidth="2" />
            <text x="55" y="135" textAnchor="middle" fontSize="12" fill="#4f46e5" fontWeight="bold">side = {s}</text>
        </svg>
    );
};

const SHAPE_RENDERERS = {
    rectangle: RectangleSVG,
    square:    SquareSVG,
    triangle:  TriangleSVG,
    circle:    CircleSVG,
    cube:      CubeSVG
};

const FORMULAS = {
    rectangle: { area: 'Area = length × width', perimeter: 'Perimeter = 2 × (length + width)' },
    square:    { area: 'Area = side²',           perimeter: 'Perimeter = 4 × side' },
    triangle:  { area: 'Area = ½ × base × height', perimeter: 'Add all three sides' },
    circle:    { area: 'Area = π × r²',          perimeter: 'Circumference = 2 × π × r' },
    cube:      { volume: 'Volume = side³',        area: 'Surface Area = 6 × side²' }
};

function fallbackShape(text) {
    const t = (text || '').toLowerCase();
    if (/circle|radius/i.test(t))   return 'circle';
    if (/triangle/i.test(t))        return 'triangle';
    if (/square/i.test(t))          return 'square';
    if (/cube/i.test(t))            return 'cube';
    return 'rectangle';
}

function fallbackDims(text) {
    const nums = [...(text || '').matchAll(/\b(\d+(?:\.\d+)?)\b/g)]
        .map(m => parseFloat(m[1])).filter(n => n > 0 && n < 1000);
    return nums.length >= 2 ? { length: nums[0], width: nums[1] } : { length: 6, width: 4 };
}

function detectPurpose(text) {
    const t = (text || '').toLowerCase();
    if (/area/i.test(t))       return 'area';
    if (/perimeter/i.test(t))  return 'perimeter';
    if (/volume/i.test(t))     return 'volume';
    return 'area';
}

const GeometryVisualizer = ({ vizData = null, question = '', description = '' }) => {
    const combined = (description + ' ' + question).trim();

    const shape = (vizData && typeof vizData.shape === 'string')
        ? vizData.shape.toLowerCase()
        : fallbackShape(combined);

    const dims = (vizData && vizData.dimensions && typeof vizData.dimensions === 'object')
        ? vizData.dimensions
        : fallbackDims(combined);

    const purpose  = detectPurpose(combined);
    const Renderer = SHAPE_RENDERERS[shape] || RectangleSVG;
    const formulas = FORMULAS[shape] || {};
    const formula  = formulas[purpose] || formulas.area || '';

    const [showFormula, setShowFormula] = useState(false);

    return (
        <div className="space-y-3" role="img" aria-label={`${shape} diagram`}>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wide">
                {shape.charAt(0).toUpperCase() + shape.slice(1)} — {purpose}
            </span>

            <div className="flex justify-center p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl">
                <Renderer dims={dims} />
            </div>

            <button type="button" onClick={() => setShowFormula(v => !v)}
                aria-expanded={showFormula}
                className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 border border-amber-500/20 rounded-2xl text-xs font-bold transition-all">
                {showFormula ? 'Hide formula' : 'Show formula hint'}
            </button>

            {showFormula && formula && (
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                    <p className="text-xs font-bold text-amber-700">{formula}</p>
                    <p className="text-[10px] font-semibold text-[var(--text-secondary)] mt-1">
                        Substitute the measurements shown in the diagram and calculate.
                    </p>
                </div>
            )}
        </div>
    );
};

export default GeometryVisualizer;
