/**
 * MathExplanation — Phase 6
 *
 * Renders the full structured AI response inside the modal.
 * Orchestrates: explanation text, visualization, steps, hints,
 * and practice question as tabbed sections.
 */

import React, { useState } from 'react';
import { BookOpen, BarChart3, ListOrdered, Lightbulb, PenLine } from 'lucide-react';
import MathVisualization    from './MathVisualization';
import StepViewer           from './StepViewer';
import HintCard             from './HintCard';
import PracticeQuestionCard from './PracticeQuestionCard';

const TABS = [
    { id: 'explain',   label: 'Explain',   icon: BookOpen },
    { id: 'visual',    label: 'Visual',    icon: BarChart3 },
    { id: 'steps',     label: 'Steps',     icon: ListOrdered },
    { id: 'hints',     label: 'Hints',     icon: Lightbulb },
    { id: 'practice',  label: 'Practice',  icon: PenLine }
];

const MathExplanation = ({ data, question }) => {
    const [activeTab, setActiveTab] = useState('explain');

    if (!data) return null;

    return (
        <div className="space-y-4">
            {/* Concept badge */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 rounded-full text-[11px] font-black uppercase tracking-wider">
                    {data.concept}
                </span>
                <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                    data.difficulty === 'Easy'   ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                    data.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                    'bg-red-500/10 text-red-600 border-red-500/20'
                }`}>
                    {data.difficulty}
                </span>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 bg-[var(--bg-base)] p-1 rounded-2xl border border-[var(--border-color)] overflow-x-auto">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                            activeTab === id
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                        <Icon size={12} /> {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="min-h-[160px]">
                {activeTab === 'explain' && (
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                            {data.explanation}
                        </p>
                        <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-wide text-blue-500 mb-1">Your question</p>
                            <p className="text-xs font-semibold text-[var(--text-primary)]">{question}</p>
                        </div>
                        <p className="text-[10px] font-semibold text-[var(--text-secondary)]">
                            Use the Steps and Hints tabs to work through the solution yourself.
                        </p>
                    </div>
                )}

                {activeTab === 'visual' && (
                    <MathVisualization type={data.visualization} question={question} />
                )}

                {activeTab === 'steps' && (
                    <StepViewer steps={data.steps} />
                )}

                {activeTab === 'hints' && (
                    <HintCard hints={data.hints} />
                )}

                {activeTab === 'practice' && (
                    <PracticeQuestionCard practiceQuestion={data.practiceQuestion} />
                )}
            </div>
        </div>
    );
};

export default MathExplanation;
