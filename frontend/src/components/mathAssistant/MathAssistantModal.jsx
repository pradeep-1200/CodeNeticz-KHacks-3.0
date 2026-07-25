/**
 * MathAssistantModal — Phase 7 (AI Visual Learning)
 *
 * Full-screen modal that contains the AI Visual Learning Assistant.
 * Fetches structured JSON from the backend on open, renders
 * VisualLearningAssistant with dynamic visualizations.
 *
 * Replaces the Phase 6 tabbed text-based explanation with a fully
 * visual, interactive learning experience.
 *
 * RULES:
 *  - Never reveals the correct answer
 *  - Never selects an option for the student
 *  - Never modifies the student's response
 *  - Does NOT submit the assessment
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, AlertCircle, BrainCircuit, RefreshCw } from 'lucide-react';
import { getMathAssistance } from '../../services/api';
import VisualLearningAssistant from '../VisualLearningAssistant/VisualLearningAssistant';

const MathAssistantModal = ({
    isOpen,
    onClose,
    question,           // full question object from assessment
    accessibilityProfile
}) => {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');

    const fetchAssistance = useCallback(async () => {
        if (!question?.question) return;
        try {
            setLoading(true);
            setError('');
            setData(null);

            const res = await getMathAssistance({
                question:             question.question,
                questionType:         question.type  || '',
                options:              question.options || [],
                studentAnswer:        '',   // never send current answer
                accessibilityProfile: accessibilityProfile || {}
            });

            if (!res.success) throw new Error(res.message || 'Failed to load assistance');
            if (!res.isMath) {
                setError('This question does not appear to be a mathematics problem.');
                return;
            }
            setData(res);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Could not load the visual explanation.');
        } finally {
            setLoading(false);
        }
    }, [question, accessibilityProfile]);

    // Fetch whenever the modal opens or the question changes
    useEffect(() => {
        if (isOpen) fetchAssistance();
        else { setData(null); setError(''); }
    }, [isOpen, question?._id]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handle = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handle);
        return () => document.removeEventListener('keydown', handle);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vla-title"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] animate-fade-in-up">

                {/* ── Header ──────────────────────────────── */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border-color)] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-500/10 rounded-2xl flex items-center justify-center" aria-hidden="true">
                            <BrainCircuit size={18} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 id="vla-title" className="text-base font-black text-[var(--text-primary)] leading-tight">
                                Visual Learning Assistant
                            </h2>
                            <p className="text-[10px] font-semibold text-[var(--text-secondary)]">
                                Understand the concept — solve it yourself
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close visual learning assistant"
                        className="w-8 h-8 rounded-xl hover:bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-secondary)] transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* ── Body ────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

                    {/* Question preview */}
                    <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl">
                        <p className="text-[10px] font-black uppercase tracking-wide text-[var(--text-secondary)] mb-1">
                            Current question
                        </p>
                        <p className="text-sm font-bold text-[var(--text-primary)] leading-relaxed line-clamp-3">
                            {question?.question || '—'}
                        </p>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center gap-3 py-10">
                            <div className="relative">
                                <Loader2 size={36} className="text-indigo-600 animate-spin" aria-hidden="true" />
                                <span className="sr-only">Loading visual explanation…</span>
                            </div>
                            <p className="text-sm font-semibold text-[var(--text-secondary)]">
                                Preparing your visual explanation…
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-red-600">{error}</p>
                                <button
                                    type="button"
                                    onClick={fetchAssistance}
                                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                                >
                                    <RefreshCw size={11} /> Try again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Visual Learning Content */}
                    {!loading && !error && data && (
                        <VisualLearningAssistant
                            data={data}
                            question={question?.question || ''}
                        />
                    )}
                </div>

                {/* ── Footer ──────────────────────────────── */}
                <div className="px-5 pb-5 pt-3 border-t border-[var(--border-color)] shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm transition-colors shadow-md"
                    >
                        Back to Question
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MathAssistantModal;
