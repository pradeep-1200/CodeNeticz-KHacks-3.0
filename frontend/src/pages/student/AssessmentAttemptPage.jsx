/**
 * AssessmentAttemptPage — Phase 4
 *
 * The full assessment-taking experience for students.
 * Renders questions, timer, palette, auto-save, and final submit.
 *
 * Accessibility Profile is loaded from AssessmentContext
 * but NEVER displayed. Labels like Dyslexia are NEVER shown.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAssessment } from '../../context/AssessmentContext';
import {
    startAssessmentAttempt,
    saveAssessmentProgress,
    submitAssessmentAttempt
} from '../../services/api';
import {
    ChevronLeft, ChevronRight, Clock, CheckCircle2,
    AlertCircle, Loader2, Send, BookOpen, Flag
} from 'lucide-react';

// ── Phase 5: Accessibility Engine ─────────────────────────────
import {
    QuestionRenderer,
    AnswerInput,
    SupportTools,
    HighContrastWrapper,
    useAccessibilityEngine
} from '../../components/accessibility/AccessibilityEngine';

// ── Phase 6: AI Math Assistant ─────────────────────────────────
import MathAssistantButton from '../../components/mathAssistant/MathAssistantButton';

// ── Sub-components ─────────────────────────────────────────────

/** Countdown timer — fires onExpire when time runs out */
const AssessmentTimer = ({ durationMinutes, startedAt, onExpire }) => {
    const [secondsLeft, setSecondsLeft] = useState(null);

    useEffect(() => {
        const totalSeconds = durationMinutes * 60;
        const elapsed = startedAt
            ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
            : 0;
        const initial = Math.max(0, totalSeconds - elapsed);
        setSecondsLeft(initial);
        if (initial === 0) { onExpire(); return; }

        const interval = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) { clearInterval(interval); onExpire(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [durationMinutes, startedAt]);

    if (secondsLeft === null) return null;
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    const isWarning = secondsLeft <= 300; // last 5 minutes

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-black text-sm transition-colors ${
            isWarning
                ? 'bg-red-500/10 text-red-600 border-red-500/30 animate-pulse'
                : 'bg-[var(--bg-base)] text-[var(--text-primary)] border-[var(--border-color)]'
        }`}>
            <Clock size={16} />
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
    );
};

/** Question palette — shows answered/unanswered status for each question */
const QuestionPalette = ({ total, currentIndex, answers, onJump }) => (
    <div className="bg-[var(--bg-surface)] p-4 rounded-3xl border border-[var(--border-color)] shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-1.5">
            <BookOpen size={12} /> Question Palette
        </h3>
        <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: total }, (_, i) => {
                const qId = answers._ids?.[i];
                const isAnswered = qId && answers[qId]?.trim() !== '';
                const isCurrent  = i === currentIndex;
                return (
                    <button
                        key={i}
                        onClick={() => onJump(i)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all border ${
                            isCurrent
                                ? 'bg-indigo-600 text-white border-indigo-600 scale-110 shadow-md'
                                : isAnswered
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-indigo-400/50'
                        }`}
                    >
                        {i + 1}
                    </button>
                );
            })}
        </div>
        <div className="flex gap-3 mt-3 text-[10px] font-bold text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30 inline-block" />
                Answered
            </span>
            <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-[var(--bg-base)] border border-[var(--border-color)] inline-block" />
                Not answered
            </span>
        </div>
    </div>
);

/** Renders the appropriate input for each question type */
const QuestionInput = ({ question, value, onChange }) => {
    const p    = useAccessibilityEngine();
    const type = question.type || 'mcq';

    // MCQ / multiple_choice — radio buttons
    if (type === 'mcq' || type === 'multiple_choice') {
        const opts = question.options || [];
        const optClass = p.largeText ? 'p-5 text-base' : 'p-4 text-sm';
        return (
            <div className="space-y-3">
                {opts.length === 0 && (
                    <p className="text-xs text-[var(--text-secondary)] italic">No options available.</p>
                )}
                {opts.map((opt, idx) => (
                    <label
                        key={idx}
                        className={`flex items-start gap-3 rounded-2xl border cursor-pointer transition-all group ${optClass} ${
                            value === opt
                                ? 'bg-indigo-500/10 border-indigo-500/40 text-[var(--text-primary)]'
                                : 'bg-[var(--bg-base)] border-[var(--border-color)] hover:border-indigo-400/40 hover:bg-indigo-500/5'
                        }`}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            value === opt ? 'border-indigo-500 bg-indigo-500' : 'border-[var(--border-color)] group-hover:border-indigo-400'
                        }`}>
                            {value === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={`font-semibold leading-relaxed ${p.largeText ? 'text-base' : 'text-sm'}`}>{opt}</span>
                        <input type="radio" className="sr-only" checked={value === opt} onChange={() => onChange(opt)} />
                    </label>
                ))}
            </div>
        );
    }

    // True / False
    if (type === 'true_false' || (question.options?.length === 2 &&
        question.options.map(o => o.toLowerCase()).join(',') === 'true,false')) {
        const btnClass = p.largeText ? 'py-5 text-base' : 'py-4 text-sm';
        return (
            <div className="flex gap-4">
                {['True', 'False'].map(opt => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onChange(opt)}
                        className={`flex-1 rounded-2xl font-black border transition-all ${btnClass} ${
                            value === opt
                                ? opt === 'True'
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40'
                                    : 'bg-red-500/10 text-red-600 border-red-500/40'
                                : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-indigo-400/40'
                        }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        );
    }

    // Text / Short / Long / Voice — delegated to AnswerInput (Speech-to-Text aware)
    return (
        <AnswerInput
            question={question}
            value={value}
            onChange={onChange}
        />
    );
};

/** Confirm submit modal */
const SubmitConfirmModal = ({ assessment, answers, onConfirm, onCancel, submitting }) => {
    const total    = assessment?.questions?.length || 0;
    const answered = Object.values(answers).filter(v => v?.trim() !== '').length;
    const unanswered = total - answered;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-6 animate-fade-in-up">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto">
                        <Send size={28} className="text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-black text-[var(--text-primary)]">Submit Assessment?</h2>
                    <p className="text-sm text-[var(--text-secondary)] font-medium">
                        This action cannot be undone. Make sure you have reviewed all your answers.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3 text-center">
                        <p className="text-2xl font-black text-emerald-600">{answered}</p>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">Answered</p>
                    </div>
                    <div className={`border rounded-2xl p-3 text-center ${unanswered > 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-[var(--bg-base)] border-[var(--border-color)]'}`}>
                        <p className={`text-2xl font-black ${unanswered > 0 ? 'text-amber-500' : 'text-[var(--text-secondary)]'}`}>{unanswered}</p>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">Unanswered</p>
                    </div>
                </div>

                {unanswered > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold text-amber-600">
                            You have {unanswered} unanswered {unanswered === 1 ? 'question' : 'questions'}. You can still submit.
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={submitting}
                        className="flex-1 py-3 bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-color)] font-bold rounded-2xl text-sm transition-colors hover:border-indigo-400/40 disabled:opacity-50"
                    >
                        Review Answers
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={submitting}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/** Success screen shown after submission */
const SubmittedScreen = ({ assessmentTitle, assessmentId, navigate }) => (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center p-4">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-10 rounded-3xl max-w-md w-full text-center space-y-6 shadow-xl animate-fade-in-up">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-black text-[var(--text-primary)]">Submitted!</h1>
                <p className="text-sm font-semibold text-[var(--text-secondary)]">
                    Your answers for <span className="text-[var(--text-primary)]">"{assessmentTitle}"</span> have been recorded.
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Your results are being evaluated. This usually takes a few seconds.
                </p>
            </div>
            <div className="space-y-2">
                <button
                    onClick={() => navigate(`/student/assessment/${assessmentId}/result`)}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm transition-colors shadow-md"
                >
                    View My Result
                </button>
                <button
                    onClick={() => navigate('/student/assessment')}
                    className="w-full py-2.5 bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold rounded-2xl text-sm transition-colors hover:border-indigo-400/50 hover:text-indigo-600"
                >
                    Back to Assessments
                </button>
            </div>
        </div>
    </div>
);

// ── Main Page Component ────────────────────────────────────────
const AssessmentAttemptPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { startAttempt, clearAttempt } = useAssessment();

    // ── Phase 5: Accessibility profile flags ──────────────────
    // useAccessibilityEngine is safe to call here — returns DEFAULT_PROFILE
    // until startAttempt populates AssessmentContext with the real profile.
    const a11y = useAccessibilityEngine();

    // ── State ─────────────────────────────────────────────────
    const [assessment, setAssessment]     = useState(null);
    const [submission, setSubmission]     = useState(null);
    const [answers, setAnswers]           = useState({});        // { [questionId]: string }
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');
    const [showConfirm, setShowConfirm]   = useState(false);
    const [submitting, setSubmitting]     = useState(false);
    const [submitted, setSubmitted]       = useState(false);
    const [autoSaving, setAutoSaving]     = useState(false);
    const [lastSaved, setLastSaved]       = useState(null);

    const autoSaveTimer = useRef(null);
    const isMounted     = useRef(true);

    // ── Load + Start attempt on mount ─────────────────────────
    useEffect(() => {
        isMounted.current = true;
        initAttempt();
        return () => {
            isMounted.current = false;
            if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
            clearAttempt();
        };
    }, [id]);

    const initAttempt = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await startAssessmentAttempt(id);
            if (!res.success) throw new Error(res.message || 'Could not start assessment');

            const asmnt = res.assessment;
            const sub   = res.submission;
            // Normalize the profile: if the API returns a Mongoose-serialized object
            // all keys should be present and boolean. Guard against null/undefined.
            const prof  = res.accessibilityProfile && typeof res.accessibilityProfile === 'object'
                ? res.accessibilityProfile
                : {};

            // Pre-populate answers from resumed attempt
            const savedMap = {};
            if (sub?.answers?.length) {
                sub.answers.forEach(a => { savedMap[a.questionId] = a.answer; });
            }

            if (isMounted.current) {
                setAssessment(asmnt);
                setSubmission(sub);
                setAnswers(savedMap);
                // Phase 5: store profile in AssessmentContext so accessibility
                // engine components (QuestionRenderer, AnswerInput, SupportTools)
                // can read it. This must be called BEFORE setLoading(false) so
                // the context is populated before the question card renders.
                startAttempt(asmnt, sub, prof);
            }
        } catch (err) {
            console.error('initAttempt error:', err);
            if (isMounted.current) {
                const msg = err?.response?.data?.message || err.message || 'Failed to load assessment.';
                setError(msg);
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    // ── Auto-save every 30 seconds ─────────────────────────────
    useEffect(() => {
        if (!assessment || submitted) return;
        autoSaveTimer.current = setInterval(() => { triggerAutoSave(); }, 30000);
        return () => clearInterval(autoSaveTimer.current);
    }, [assessment, answers, submitted]);

    const buildAnswerPayload = useCallback(() => {
        if (!assessment) return [];
        return assessment.questions.map(q => ({
            questionId:   q._id,
            questionText: q.question,
            questionType: q.type,
            answer:       answers[q._id] || ''
        }));
    }, [assessment, answers]);

    const triggerAutoSave = useCallback(async () => {
        if (!assessment || submitting || submitted) return;
        try {
            setAutoSaving(true);
            await saveAssessmentProgress(id, buildAnswerPayload());
            if (isMounted.current) setLastSaved(new Date());
        } catch (e) {
            // Silent fail on auto-save
        } finally {
            if (isMounted.current) setAutoSaving(false);
        }
    }, [assessment, answers, submitting, submitted, id, buildAnswerPayload]);

    // ── Answer update + auto-save on question change ───────────
    const handleAnswerChange = useCallback((questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    }, []);

    const handleNavigate = useCallback(async (targetIndex) => {
        // Save before navigating
        await triggerAutoSave();
        setCurrentIndex(targetIndex);
    }, [triggerAutoSave]);

    // ── Timer expiry — auto-submit ────────────────────────────
    const handleTimerExpire = useCallback(async () => {
        if (submitted || submitting) return;
        try {
            setSubmitting(true);
            await submitAssessmentAttempt(id, buildAnswerPayload());
            if (isMounted.current) setSubmitted(true);
        } catch (e) {
            console.error('Auto-submit failed:', e);
        } finally {
            if (isMounted.current) setSubmitting(false);
        }
    }, [id, submitted, submitting, buildAnswerPayload]);

    // ── Manual submit ─────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        try {
            setSubmitting(true);
            const payload = buildAnswerPayload();
            await submitAssessmentAttempt(id, payload);
            clearAttempt();
            if (isMounted.current) { setSubmitted(true); setShowConfirm(false); }
        } catch (err) {
            console.error('Submit error:', err);
            const msg = err?.response?.data?.message || 'Submission failed. Please try again.';
            if (isMounted.current) setError(msg);
            setShowConfirm(false);
        } finally {
            if (isMounted.current) setSubmitting(false);
        }
    }, [id, buildAnswerPayload, clearAttempt]);

    // ── Render: loading ───────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
                <Navbar />
                <main className="container mx-auto px-4 py-16 max-w-4xl flex flex-col items-center gap-4">
                    <Loader2 size={40} className="text-indigo-600 animate-spin" />
                    <p className="text-sm font-semibold text-[var(--text-secondary)]">Loading assessment...</p>
                </main>
            </div>
        );
    }

    // ── Render: error ─────────────────────────────────────────
    if (error || !assessment) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
                <Navbar />
                <main className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-red-500/20 text-center space-y-4">
                        <AlertCircle size={48} className="mx-auto text-red-500/60" />
                        <h2 className="text-xl font-black">Unable to Start Assessment</h2>
                        <p className="text-sm text-[var(--text-secondary)] font-medium">{error || 'Assessment not available.'}</p>
                        <button
                            onClick={() => navigate(`/student/assessment/${id}`)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm transition-colors shadow-md"
                        >
                            Go Back
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // ── Render: submitted ─────────────────────────────────────
    if (submitted) {
        return <SubmittedScreen assessmentTitle={assessment.title} assessmentId={id} navigate={navigate} />;
    }

    const questions    = assessment.questions || [];
    const totalQ       = questions.length;
    const currentQ     = questions[currentIndex];
    const currentQId   = currentQ?._id;
    const currentAnswer = answers[currentQId] || '';

    // Build palette answers helper with IDs order
    const paletteAnswers = { ...answers, _ids: questions.map(q => q._id) };
    const answeredCount  = questions.filter(q => (answers[q._id] || '').trim() !== '').length;

    // ── Render: attempt screen ────────────────────────────────
    return (
        <HighContrastWrapper>
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
            <Navbar />

            {/* ── Top Bar ─────────────────────────────────── */}
            <div className="sticky top-0 z-30 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-color)] shadow-sm">
                <div className="container mx-auto px-4 md:px-8 py-3 max-w-7xl flex items-center justify-between gap-4">
                    {/* Title */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                            {assessment.subject || 'Assessment'}
                        </p>
                        <h1 className="text-sm md:text-base font-black text-[var(--text-primary)] truncate leading-tight">
                            {assessment.title}
                        </h1>
                    </div>

                    {/* Timer + status */}
                    <div className="flex items-center gap-3 shrink-0">
                        {autoSaving && (
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                                <Loader2 size={10} className="animate-spin" /> Saving...
                            </span>
                        )}
                        {!autoSaving && lastSaved && (
                            <span className="text-[10px] font-bold text-emerald-500 hidden md:block">
                                Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                        <AssessmentTimer
                            durationMinutes={assessment.duration || 30}
                            startedAt={submission?.startedAt}
                            onExpire={handleTimerExpire}
                        />
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl transition-colors shadow-md"
                        >
                            <Send size={13} /> Submit
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Body ────────────────────────────────────── */}
            <main className="container mx-auto px-4 md:px-8 py-6 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ── Question Panel ─────────────────── */}
                    <div className="flex-1 space-y-5">
                        {/* Progress bar */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-[var(--text-secondary)]">
                                Question {currentIndex + 1} of {totalQ}
                            </span>
                            <div className="flex-1 h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs font-black text-emerald-600">{answeredCount}/{totalQ}</span>
                        </div>

                        {/* Question card */}
                        <div className="bg-[var(--bg-surface)] p-6 md:p-8 rounded-3xl border border-[var(--border-color)] shadow-sm space-y-6 animate-fade-in-up">
                            {/* Question number badge */}
                            <div className="flex items-start gap-4">
                                <div className={`bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center font-black shrink-0 ${a11y.largeText ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm'}`}>
                                    Q{currentIndex + 1}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                                        {currentQ?.type === 'mcq' || currentQ?.type === 'multiple_choice'
                                            ? 'Multiple Choice'
                                            : currentQ?.type === 'true_false'
                                            ? 'True / False'
                                            : currentQ?.type === 'text' || currentQ?.type === 'short_answer'
                                            ? 'Short Answer'
                                            : 'Answer'}
                                    </p>
                                    {/* Phase 5: QuestionRenderer (TTS + keyword highlight) */}
                                    <QuestionRenderer question={currentQ} />
                                </div>
                            </div>

                            {/* Phase 5: Step-by-step hints + Visual math aids */}
                            {currentQ && <SupportTools question={currentQ} />}

                            {/* Phase 6: AI Math Assistant — auto-shown for math Qs when numberSupport=true */}
                            {currentQ && <MathAssistantButton question={currentQ} />}

                            {/* Fallback static hint (shown when numberSupport is OFF but hint exists) */}
                            {currentQ?.hint && !a11y.stepByStepHints && (
                                <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                                    <Flag size={13} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs font-semibold text-amber-600">{currentQ.hint}</p>
                                </div>
                            )}

                            {/* Input */}
                            {currentQ && (
                                <QuestionInput
                                    question={currentQ}
                                    value={currentAnswer}
                                    onChange={(val) => handleAnswerChange(currentQId, val)}
                                />
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between gap-3">
                            <button
                                onClick={() => handleNavigate(Math.max(0, currentIndex - 1))}
                                disabled={currentIndex === 0}
                                className="flex items-center gap-2 px-5 py-3 bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-indigo-400/40 hover:text-indigo-600 font-bold rounded-2xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>

                            {currentIndex < totalQ - 1 ? (
                                <button
                                    onClick={() => handleNavigate(currentIndex + 1)}
                                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-colors shadow-md"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20"
                                >
                                    <Send size={16} /> Submit Assessment
                                </button>
                            )}
                        </div>

                        {/* Mobile submit button */}
                        <div className="block md:hidden">
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm transition-colors shadow-md flex items-center justify-center gap-2"
                            >
                                <Send size={16} /> Submit Assessment
                            </button>
                        </div>
                    </div>

                    {/* ── Sidebar (palette) ──────────────── */}
                    <div className="lg:w-64 xl:w-72 space-y-4 shrink-0">
                        <QuestionPalette
                            total={totalQ}
                            currentIndex={currentIndex}
                            answers={paletteAnswers}
                            onJump={(i) => handleNavigate(i)}
                        />

                        {/* Summary card */}
                        <div className="bg-[var(--bg-surface)] p-4 rounded-3xl border border-[var(--border-color)] shadow-sm space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">Progress</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-[var(--text-secondary)]">Answered</span>
                                    <span className="font-black text-emerald-600">{answeredCount} / {totalQ}</span>
                                </div>
                                <div className="h-2 bg-[var(--bg-base)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: totalQ > 0 ? `${(answeredCount / totalQ) * 100}%` : '0%' }}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                            >
                                <Send size={12} /> Submit Assessment
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Submit Confirmation Modal ────────────── */}
            {showConfirm && (
                <SubmitConfirmModal
                    assessment={assessment}
                    answers={answers}
                    onConfirm={handleSubmit}
                    onCancel={() => setShowConfirm(false)}
                    submitting={submitting}
                />
            )}
        </div>
        </HighContrastWrapper>
    );
};

export default AssessmentAttemptPage;
