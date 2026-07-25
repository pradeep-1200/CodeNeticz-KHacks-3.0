/**
 * VisualLearningAssistant — Phase 7
 *
 * Replaces MathExplanation.jsx.
 * Renders the full AI Visual Learning panel from the structured JSON
 * returned by /api/v1/ai/math-assistant.
 *
 * Layout:
 *   ┌─ Concept + Difficulty badges ─────────────────────────┐
 *   │  Title                                                │
 *   ├─ Tab bar: [Visual Guide] [Full Visual] [Practice] ───┤
 *   │  Tab content (animated)                              │
 *   └───────────────────────────────────────────────────────┘
 *
 * Rules:
 *  - Never reveals the final answer
 *  - Never selects an MCQ option
 *  - All interactivity is student-driven
 *  - Respects largeText and highContrast from AccessibilityEngine
 */

import React, { useState } from 'react';
import { Eye, BarChart3, PenLine } from 'lucide-react';
import InteractiveHintPanel  from './InteractiveHintPanel';
import MathVisualizer        from './MathVisualizer';
import { useAccessibilityEngine } from '../accessibility/AccessibilityEngine';

// ── Practice Section ───────────────────────────────────────────
const PracticeSection = ({ practiceQuestion }) => {
    const [answer, setAnswer]   = useState('');
    const [tried,  setTried]    = useState(false);

    if (!practiceQuestion) return null;

    const handleTry = () => { if (answer.trim()) setTried(true); };
    const handleReset = () => { setAnswer(''); setTried(false); };

    return (
        <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
                <PenLine size={14} className="text-purple-500" aria-hidden="true" />
                <span className="text-xs font-black text-purple-600 uppercase tracking-wide">
                    Try a similar problem
                </span>
                <span className="ml-auto text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-base)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                    Practice only
                </span>
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)] leading-relaxed">
                {practiceQuestion}
            </p>
            {!tried ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleTry()}
                        placeholder="Your answer..."
                        aria-label="Practice answer input"
                        className="flex-1 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-purple-400/60 transition-colors"
                    />
                    <button
                        type="button"
                        onClick={handleTry}
                        disabled={!answer.trim()}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-40"
                        aria-label="Submit practice answer"
                    >
                        Try it
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-start gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <p className="text-xs font-bold text-emerald-600">
                            You wrote:{' '}
                            <span className="text-[var(--text-primary)]">"{answer}"</span>
                        </p>
                    </div>
                    <p className="text-[10px] font-semibold text-[var(--text-secondary)] text-center">
                        Practice only — this does not affect your assessment.
                    </p>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="w-full py-1.5 text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center justify-center gap-1 transition-colors"
                    >
                        ↩ Try again
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Tab definitions ────────────────────────────────────────────
const TABS = [
    { id: 'guide',    label: 'Visual Guide', icon: Eye },
    { id: 'visual',   label: 'Full Visual',  icon: BarChart3 },
    { id: 'practice', label: 'Practice',     icon: PenLine }
];

// ── Main Component ─────────────────────────────────────────────
const VisualLearningAssistant = ({ data, question }) => {
    const [activeTab, setActiveTab] = useState('guide');
    const a11y = useAccessibilityEngine();

    if (!data) return null;

    const { concept, difficulty, visualization, vizData = null, title, steps = [], practiceQuestion } = data;

    const difficultyStyle =
        difficulty === 'Easy'   ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
        difficulty === 'Medium' ? 'bg-amber-500/10  text-amber-600  border-amber-500/20'  :
                                  'bg-red-500/10    text-red-600    border-red-500/20';

    return (
        <div className="space-y-4" role="region" aria-label="Visual Learning Assistant">

            {/* ── Header badges ─────────────────────────────── */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 rounded-full text-[11px] font-black uppercase tracking-wider">
                        {concept}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${difficultyStyle}`}>
                        {difficulty}
                    </span>
                </div>

                {title && (
                    <h3 className={`font-black text-[var(--text-primary)] ${a11y.largeText ? 'text-lg' : 'text-base'}`}>
                        {title}
                    </h3>
                )}
            </div>

            {/* ── Tab bar ───────────────────────────────────── */}
            <div
                className="flex gap-1 bg-[var(--bg-base)] p-1 rounded-2xl border border-[var(--border-color)] overflow-x-auto"
                role="tablist"
                aria-label="Learning sections"
            >
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        id={`tab-${id}`}
                        aria-selected={activeTab === id}
                        aria-controls={`panel-${id}`}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                            activeTab === id
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                        <Icon size={12} aria-hidden="true" /> {label}
                    </button>
                ))}
            </div>

            {/* ── Tab panels ────────────────────────────────── */}
            <div className="min-h-[180px]">

                {/* Visual Guide — step-by-step with inline visuals */}
                <div
                    id="panel-guide"
                    role="tabpanel"
                    aria-labelledby="tab-guide"
                    hidden={activeTab !== 'guide'}
                >
                    {activeTab === 'guide' && (
                        <InteractiveHintPanel
                            steps={steps}
                            visualizationType={visualization}
                            vizData={vizData}
                            question={question}
                        />
                    )}
                </div>

                {/* Full Visual — standalone visualization in full size */}
                <div
                    id="panel-visual"
                    role="tabpanel"
                    aria-labelledby="tab-visual"
                    hidden={activeTab !== 'visual'}
                >
                    {activeTab === 'visual' && (
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-[var(--text-secondary)]">
                                Study this diagram to understand the concept, then return to your question.
                            </p>
                            <MathVisualizer
                                type={visualization}
                                vizData={vizData}
                                question={question}
                                description={steps[0]?.description || ''}
                            />
                        </div>
                    )}
                </div>

                {/* Practice */}
                <div
                    id="panel-practice"
                    role="tabpanel"
                    aria-labelledby="tab-practice"
                    hidden={activeTab !== 'practice'}
                >
                    {activeTab === 'practice' && (
                        <PracticeSection practiceQuestion={practiceQuestion} />
                    )}
                </div>
            </div>

            {/* ── Footer reminder ───────────────────────────── */}
            <p className="text-[10px] font-semibold text-center text-[var(--text-secondary)]">
                This assistant teaches the concept — it never answers your question for you.
            </p>
        </div>
    );
};

export default VisualLearningAssistant;
