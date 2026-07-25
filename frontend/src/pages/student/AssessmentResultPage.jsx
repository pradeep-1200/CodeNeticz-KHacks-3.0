/**
 * AssessmentResultPage — Phase 8
 *
 * Shows the student their evaluated result after submission.
 * Displays: score, grade, AI feedback, strengths, weaknesses,
 * recommendations, and per-question breakdown.
 *
 * Polls for the result if evaluation is still processing.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getMyAssessmentResult } from '../../services/api';
import {
    CheckCircle2, XCircle, Clock, Trophy, TrendingUp,
    Lightbulb, AlertCircle, Loader2, ChevronDown, ChevronUp,
    BarChart2, ArrowRight, BookOpen, Sparkles, Target
} from 'lucide-react';
import {
    RadialBarChart, RadialBar, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';

// ── Grade colour map ───────────────────────────────────────────
const GRADE_STYLES = {
    'A+': { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30', ring: '#10b981' },
    'A':  { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30', ring: '#10b981' },
    'B':  { bg: 'bg-blue-500/10',    text: 'text-blue-600',    border: 'border-blue-500/30',    ring: '#3b82f6' },
    'C':  { bg: 'bg-indigo-500/10',  text: 'text-indigo-600',  border: 'border-indigo-500/30',  ring: '#6366f1' },
    'D':  { bg: 'bg-amber-500/10',   text: 'text-amber-600',   border: 'border-amber-500/30',   ring: '#f59e0b' },
    'F':  { bg: 'bg-red-500/10',     text: 'text-red-600',     border: 'border-red-500/30',     ring: '#ef4444' }
};

// ── Score Ring ─────────────────────────────────────────────────
const ScoreRing = ({ percentage, grade }) => {
    const style   = GRADE_STYLES[grade] || GRADE_STYLES['F'];
    const data    = [{ name: 'score', value: percentage, fill: style.ring }];

    return (
        <div className="relative w-40 h-40 mx-auto">
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                    startAngle={90} endAngle={-270} data={data} barSize={12}>
                    <RadialBar background={{ fill: 'var(--bg-base)' }} dataKey="value" cornerRadius={8} />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black ${style.text}`}>{grade}</span>
                <span className="text-sm font-bold text-[var(--text-secondary)]">{percentage}%</span>
            </div>
        </div>
    );
};

// ── Stat chip ──────────────────────────────────────────────────
const StatChip = ({ icon: Icon, label, value, color = 'indigo' }) => {
    const cls = {
        indigo:  'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        red:     'bg-red-500/10 text-red-600 border-red-500/20',
        amber:   'bg-amber-500/10 text-amber-600 border-amber-500/20'
    };
    return (
        <div className={`flex flex-col items-center gap-1 p-4 rounded-2xl border ${cls[color]}`}>
            <Icon size={20} />
            <span className="text-2xl font-black">{value}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</span>
        </div>
    );
};

// ── Question breakdown ─────────────────────────────────────────
const QuestionBreakdown = ({ questionAnalysis = [] }) => {
    const [expanded, setExpanded] = useState(null);

    if (questionAnalysis.length === 0) return null;

    return (
        <section className="space-y-3">
            <h2 className="text-lg font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
                <BarChart2 size={18} className="text-indigo-600" /> Question Breakdown
            </h2>
            <div className="space-y-2">
                {questionAnalysis.map((qa, i) => (
                    <div key={i}
                        className={`rounded-2xl border transition-all ${qa.isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                        <button
                            type="button"
                            onClick={() => setExpanded(expanded === i ? null : i)}
                            className="w-full flex items-center gap-3 p-4 text-left"
                            aria-expanded={expanded === i}>
                            {qa.isCorrect
                                ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                : <XCircle     size={16} className="text-red-500    shrink-0" />}
                            <span className="flex-1 text-sm font-semibold text-[var(--text-primary)] line-clamp-2 text-left">
                                Q{i + 1}. {qa.questionText}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    qa.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-700' :
                                    qa.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-700' :
                                    'bg-red-500/20 text-red-700'}`}>
                                    {qa.difficulty}
                                </span>
                                {expanded === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                        </button>

                        {expanded === i && (
                            <div className="px-4 pb-4 space-y-2 border-t border-[var(--border-color)] pt-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)]">
                                        <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] mb-1">Your Answer</p>
                                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                                            {qa.studentAnswer || <span className="italic text-[var(--text-secondary)]">Not answered</span>}
                                        </p>
                                    </div>
                                    {qa.isCorrect === false && qa.correctAnswer && (
                                        <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                                            <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Correct Answer</p>
                                            <p className="text-sm font-semibold text-[var(--text-primary)]">{qa.correctAnswer}</p>
                                        </div>
                                    )}
                                </div>
                                {qa.aiFeedback && (
                                    <div className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                                        <Sparkles size={13} className="text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-xs font-semibold text-[var(--text-secondary)]">{qa.aiFeedback}</p>
                                    </div>
                                )}
                                <div className="flex gap-2 flex-wrap">
                                    <span className="text-[10px] font-bold px-2 py-1 bg-indigo-500/10 text-indigo-600 rounded-full">
                                        {qa.concept}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-1 bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-full">
                                        {qa.marksAwarded}/{qa.maxMarks} mark{qa.maxMarks !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

// ── Concept accuracy chart ─────────────────────────────────────
const ConceptChart = ({ questionAnalysis = [] }) => {
    const conceptMap = {};
    for (const qa of questionAnalysis) {
        if (!conceptMap[qa.concept]) conceptMap[qa.concept] = { correct: 0, total: 0 };
        conceptMap[qa.concept].total++;
        if (qa.isCorrect) conceptMap[qa.concept].correct++;
    }
    const data = Object.entries(conceptMap).map(([concept, { correct, total }]) => ({
        concept: concept.length > 12 ? concept.slice(0, 12) + '…' : concept,
        accuracy: Math.round((correct / total) * 100),
        total
    })).sort((a, b) => b.accuracy - a.accuracy);

    if (data.length === 0) return null;

    return (
        <section className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm">
            <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                <Target size={18} className="text-indigo-600" /> Concept Accuracy
            </h2>
            <ResponsiveContainer width="100%" height={Math.max(120, data.length * 36)}>
                <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} fontSize={10} />
                    <YAxis type="category" dataKey="concept" width={80} fontSize={10} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                    <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                        {data.map((d, i) => (
                            <Cell key={i} fill={d.accuracy >= 70 ? '#10b981' : d.accuracy >= 40 ? '#6366f1' : '#ef4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </section>
    );
};

// ── Main Page ──────────────────────────────────────────────────
const AssessmentResultPage = () => {
    const { id: assessmentId } = useParams();
    const navigate = useNavigate();
    const [result,  setResult]  = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');
    const pollRef = useRef(null);
    const polls   = useRef(0);

    const loadResult = useCallback(async () => {
        try {
            const res = await getMyAssessmentResult(assessmentId);
            if (res.success && res.result) {
                setResult(res.result);
                setLoading(false);
                if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
            }
        } catch (err) {
            polls.current++;
            if (polls.current >= 12) { // 60 seconds
                setError(err?.response?.data?.message || 'Result not available yet. Your teacher may need to review it.');
                setLoading(false);
                if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
            }
        }
    }, [assessmentId]);

    useEffect(() => {
        loadResult();
        // Poll every 5 seconds while loading
        pollRef.current = setInterval(loadResult, 5000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [loadResult]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
                <Navbar />
                <main className="container mx-auto px-4 py-20 max-w-2xl text-center space-y-4">
                    <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto" />
                    <h2 className="text-xl font-black text-[var(--text-primary)]">Evaluating your answers…</h2>
                    <p className="text-sm text-[var(--text-secondary)] font-medium">
                        Our AI is analysing your responses. This usually takes a few seconds.
                    </p>
                </main>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
                <Navbar />
                <main className="container mx-auto px-4 py-20 max-w-2xl text-center space-y-4">
                    <AlertCircle size={48} className="mx-auto text-amber-500" />
                    <h2 className="text-xl font-black">Result Not Ready</h2>
                    <p className="text-sm text-[var(--text-secondary)] font-medium">{error || 'Your result is being processed.'}</p>
                    <button onClick={() => navigate('/student/assessment')}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm transition-colors shadow-md">
                        Back to Assessments
                    </button>
                </main>
            </div>
        );
    }

    const r           = result;
    const assessment  = r.assessmentId || {};
    const insights    = r.aiInsights   || {};
    const gradeStyle  = GRADE_STYLES[r.grade] || GRADE_STYLES['F'];
    const timeMins    = Math.floor((r.timeTakenSeconds || 0) / 60);
    const timeSecs    = (r.timeTakenSeconds || 0) % 60;

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
            <Navbar />

            <main className="container mx-auto px-4 md:px-8 py-8 max-w-4xl space-y-8 animate-fade-in-up">

                {/* ── Hero Score Card ─────────────────────────── */}
                <section className={`bg-[var(--bg-surface)] p-6 md:p-8 rounded-3xl border ${gradeStyle.border} shadow-sm`}>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <ScoreRing percentage={r.percentage} grade={r.grade} />

                        <div className="flex-1 space-y-3 text-center md:text-left">
                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 mb-1">
                                    {assessment.subject || 'Assessment'}
                                </p>
                                <h1 className="text-2xl font-black text-[var(--text-primary)] leading-tight">
                                    {assessment.title || 'Assessment Complete'}
                                </h1>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <StatChip icon={CheckCircle2} label="Correct"   value={r.correctAnswers}   color="emerald" />
                                <StatChip icon={XCircle}      label="Incorrect" value={r.incorrectAnswers} color="red"     />
                                <StatChip icon={Trophy}       label="Score"     value={`${r.obtainedMarks}/${r.totalMarks}`} color="indigo" />
                                <StatChip icon={Clock}        label="Time"      value={`${timeMins}m ${timeSecs}s`}          color="amber"  />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── AI Feedback ─────────────────────────────── */}
                {insights.overallFeedback && (
                    <section className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-6 rounded-3xl border border-indigo-500/20 space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-indigo-600" />
                            <h2 className="text-lg font-extrabold text-[var(--text-primary)]">AI Learning Insights</h2>
                        </div>
                        <p className="text-sm font-semibold text-[var(--text-secondary)] leading-relaxed">
                            {insights.overallFeedback}
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {/* Strengths */}
                            {(insights.strengths || []).length > 0 && (
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-wide text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Strengths
                                    </p>
                                    <ul className="space-y-1">
                                        {insights.strengths.map((s, i) => (
                                            <li key={i} className="text-xs font-semibold text-[var(--text-primary)] flex items-start gap-1.5">
                                                <span className="text-emerald-500 shrink-0 mt-0.5">●</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Areas to improve */}
                            {(insights.weaknesses || []).length > 0 && (
                                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-wide text-amber-600 flex items-center gap-1">
                                        <TrendingUp size={12} /> Areas to Improve
                                    </p>
                                    <ul className="space-y-1">
                                        {insights.weaknesses.map((w, i) => (
                                            <li key={i} className="text-xs font-semibold text-[var(--text-primary)] flex items-start gap-1.5">
                                                <span className="text-amber-500 shrink-0 mt-0.5">●</span> {w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Recommendations */}
                        {(insights.recommendations || []).length > 0 && (
                            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-wide text-blue-600 flex items-center gap-1">
                                    <Lightbulb size={12} /> Recommended Practice
                                </p>
                                <ul className="space-y-1">
                                    {insights.recommendations.map((rec, i) => (
                                        <li key={i} className="text-xs font-semibold text-[var(--text-secondary)] flex items-start gap-1.5">
                                            <ArrowRight size={11} className="text-blue-500 shrink-0 mt-0.5" /> {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                )}

                {/* ── Concept Chart ────────────────────────────── */}
                <ConceptChart questionAnalysis={r.questionAnalysis || []} />

                {/* ── Question Breakdown ───────────────────────── */}
                <QuestionBreakdown questionAnalysis={r.questionAnalysis || []} />

                {/* ── Actions ─────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => navigate('/student/assessment')}
                        className="flex-1 py-3.5 bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] font-extrabold rounded-2xl text-sm transition-colors hover:border-indigo-400/50 hover:text-indigo-600 flex items-center justify-center gap-2">
                        <BookOpen size={16} /> Back to Assessments
                    </button>
                    <button onClick={() => navigate('/student/report')}
                        className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm transition-colors shadow-md flex items-center justify-center gap-2">
                        <BarChart2 size={16} /> View Full Progress Report
                    </button>
                </div>

            </main>
        </div>
    );
};

export default AssessmentResultPage;
