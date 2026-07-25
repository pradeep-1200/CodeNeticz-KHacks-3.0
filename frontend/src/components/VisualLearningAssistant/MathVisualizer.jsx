/**
 * MathVisualizer — Visual Learning Assistant
 *
 * Central dispatcher. Receives the AI-returned `visualization` type key
 * AND the `vizData` object with all pre-extracted numbers.
 *
 * Every component receives vizData as its primary data source.
 * question/description are passed only as additional context for
 * emoji/symbol picking and final-step prompts.
 *
 * NO component should extract numbers from question text if vizData is present.
 */

import React from 'react';

import CountingBlocks        from './CountingBlocks';
import NumberLine            from './NumberLine';
import CrossOutObjects       from './CrossOutObjects';
import MultiplicationArray   from './MultiplicationArray';
import DivisionGroups        from './DivisionGroups';
import FractionCircle        from './FractionCircle';
import FractionBar           from './FractionBar';
import PlaceValueChart       from './PlaceValueChart';
import HundredGrid           from './HundredGrid';
import GeometryVisualizer    from './GeometryVisualizer';
import WordProblemVisualizer from './WordProblemVisualizer';

// ── Balance Scale (inline — Algebra) ──────────────────────────
const BalanceScale = ({ vizData = null, question = '' }) => {
    // vizData: { variable, knownValue, total }
    const varName  = (vizData && vizData.variable)   || (() => {
        const m = (question || '').match(/([a-zA-Z])\s*[\+\-\*\/]/);
        return m ? m[1] : 'x';
    })();
    const total    = (vizData && typeof vizData.total      === 'number') ? vizData.total      : (() => {
        const nums = [...(question || '').matchAll(/\b(\d+)\b/g)].map(m => parseInt(m[1]));
        return nums[1] ?? 10;
    })();
    const known    = (vizData && typeof vizData.knownValue === 'number') ? vizData.knownValue : (() => {
        const nums = [...(question || '').matchAll(/\b(\d+)\b/g)].map(m => parseInt(m[1]));
        return nums[0] ?? 3;
    })();

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wide">Balance scale</p>
            <svg width="210" height="115" viewBox="0 0 210 115" aria-hidden="true">
                <line x1="20" y1="42" x2="190" y2="42" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                <polygon points="105,42 93,90 117,90" fill="#6366f1" />
                {/* Left pan */}
                <line x1="46" y1="42" x2="46" y2="64" stroke="#6366f1" strokeWidth="1.5" />
                <ellipse cx="46" cy="70" rx="26" ry="9" fill="#c7d2fe" stroke="#6366f1" strokeWidth="1.5" />
                <text x="46" y="74" textAnchor="middle" fontSize="14" fill="#4f46e5" fontWeight="bold">{varName}</text>
                {/* Right pan */}
                <line x1="164" y1="42" x2="164" y2="64" stroke="#6366f1" strokeWidth="1.5" />
                <ellipse cx="164" cy="70" rx="26" ry="9" fill="#c7d2fe" stroke="#6366f1" strokeWidth="1.5" />
                <text x="164" y="74" textAnchor="middle" fontSize="14" fill="#4f46e5" fontWeight="bold">{total}</text>
                <text x="46"  y="99" textAnchor="middle" fontSize="9" fill="#6b7280">Unknown</text>
                <text x="164" y="99" textAnchor="middle" fontSize="9" fill="#6b7280">Total = {total}</text>
            </svg>
            <p className="text-xs font-bold text-indigo-600">
                Both sides must balance. What value of {varName} makes them equal to {total}?
            </p>
        </div>
    );
};

// ── Dispatcher ─────────────────────────────────────────────────
const MathVisualizer = ({ type, vizData = null, question = '', description = '' }) => {
    const shared = { vizData, question, description };

    const map = {
        counting_blocks:       <CountingBlocks       {...shared} />,
        number_line:           <NumberLine           {...shared} backward={false} />,
        number_line_backward:  <NumberLine           {...shared} backward={true} />,
        cross_out_objects:     <CrossOutObjects      {...shared} />,
        multiplication_array:  <MultiplicationArray  {...shared} />,
        array_grid:            <MultiplicationArray  {...shared} />,   // alias
        equal_groups:          <DivisionGroups       {...shared} />,
        fraction_circle:       <FractionCircle       {...shared} />,
        fraction_bar:          <FractionBar          {...shared} />,
        place_value:           <PlaceValueChart      {...shared} />,
        place_value_chart:     <PlaceValueChart      {...shared} />,   // alias
        hundred_grid:          <HundredGrid          {...shared} />,
        geometry:              <GeometryVisualizer   {...shared} />,
        geometry_svg:          <GeometryVisualizer   {...shared} />,   // alias
        word_problem_objects:  <WordProblemVisualizer {...shared} />,
        balance_scale:         <BalanceScale         vizData={vizData} question={question} />
    };

    const visual = map[type];

    if (!visual) {
        return (
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl">
                <CountingBlocks {...shared} />
            </div>
        );
    }

    return (
        <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl overflow-x-auto">
            {visual}
        </div>
    );
};

export default MathVisualizer;
