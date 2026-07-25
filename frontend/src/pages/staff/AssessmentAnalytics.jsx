/**
 * AssessmentAnalytics — Phase 8
 *
 * Teacher's analytics dashboard for a single assessment.
 * Shows: class stats, grade distribution, question analytics,
 * per-student results, accessibility usage.
 *
 * Route: /staff/analytics/:assessmentId
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StaffNavbar from '../../components/StaffNavbar';
import { getAssessmentAnalytics } from '../../services/api';
import {
    Users, TrendingUp, Clock, Trophy, CheckCircle, XCircle,
    AlertCircle, Loader2, ChevronDown, ChevronUp, BarChart2,
    Brain, Accessibility, ArrowLeft, Target, Lightbulb
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

// ── Colour helpers ─────────────────────────────────────────────
const GRADE_COLORS = {
    'A+': '#10b981', A: '#22c55e', B: '#3b82f6', C: '#6366f1', D: '#f59e0b', F: '#ef4444'
};
const ACCURACY_COLOR = (pct) => pct >= 70 ? '#10b981' : pct >= 40 ? '#6366f1' : '#ef4444';

// ── Stat card ──────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = 'indigo' }) => {
    const cls = {
        indigo:  'bg-indigo-500/10 text-indigo-600',
        emerald: 'bg-emerald-500/10 text-emerald-600',
        red:     'bg-red-500/10 text-red-600',
        amber:   'bg-amber-500/10 text-amber-600',
        purple:  'bg-purple-500/10 text-purple-600'
    };
    return (
        <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${cls[color]}`}>
                <Icon size={20} />
            </div>
            <p className="text-2xl font-black text-[var(--text-primary)]">{value}</p>
            <p className="text-xs font-bold text-[var(--text-secondary)] mt-0.5">{label}</p>
            {sub && <p className="text-[10px] font-semibold text-[var(--text-secondary)] mt-0.5 opacity-70">{sub}</p>}
        </div>
    );
};

// ── Student results table ──────────────────────────────────────
const StudentResultsTable = ({ results = [], assessmentId }) => {
    const [sortKey,  setSortKey]  = useState('percentage');
    const [sortAsc,  setSortAsc]  = useState(false);
    const [expanded, setExpanded] = useState(null);

    const GRADE_STYLES = {
        'A+': 'bg-emerald-500/10 text-emerald-600',
        'A':  'bg-emerald-500/10 text-emerald-600',
        'B':  'bg-blue-500/10 text-blue-600',
        'C':  'bg-indigo-500/10 text-indigo-600',
        'D':  'bg-amber-500/10 text-amber-600',
        'F':  'bg-red-500/10 text-red-600'
    };

    const sorted = [...results].sort((a, b) => {
        const av = a[sortKey] ?? 0;
        const bv = b[sortKey] ?? 0;
        return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

    const SortBtn = ({ k, label }) => (
        <button type="button" onClick={() => { setSortKey(k); setSortAsc(sortKey === k ? !sortAsc : false); }}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {label}
            {sortKey === k && (sortAsc ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
        </button>
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-[var(--border-color)]">
                        <th className="text-left py-3 px-2 text-[10px] font-black uppercase tracking-wide text-[var(--text-secondary)]">Student</th>
                        <th className="py-3 px-2"><SortBtn k="percentage" label="Score" /></th>
                        <th className="py-3 px-2"><SortBtn k="correctAnswers" label="Correct" /></th>
                        <th className="py-3 px-2"><SortBtn k="timeTakenSeconds" label="Time" /></th>
                        <th className="py-3 px-2 text-[10px] font-black uppercase tracking-wide text-[var(--text-secondary)]">Grade</th>
                        <th className="py-3 px-2 text-[10px] font-black uppercase tracking-wide text-[var(--text-secondary)]">Tools</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((r, i) => {
                        const student = r.studentId || {};
                        const mins = Math.floor((r.timeTakenSeconds || 0) / 60);
                        const secs = (r.timeTakenSeconds || 0) % 60;
                        const usedTools = r.accessibilityUsage
                            ? Object.values(r.accessibilityUsage).filter(Boolean).length
                            : 0;
                        return (
                            <tr key={i}
                                className="border-b border-[var(--border-color)] hover:bg-[var(--bg-base)] transition-colors cursor-pointer"
                                onClick={() => setExpanded(expanded === i ? null : i)}>
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xs font-black shrink-0">
                                            {(student.name || '?')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--text-primary)]">{student.name || 'Student'}</p>
                                            {student.rollNumber && (
                                                <p className="text-[10px] text-[var(--text-secondary)]">{student.rollNumber}</p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <div className="w-16 h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all"
                                                style={{ width: `${r.percentage}%`, background: ACCURACY_COLOR(r.percentage) }} />
                                        </div>
                                        <span className="text-xs font-black text-[var(--text-primary)] w-8">{r.percentage}%</span>
                                    </div>
                                </td>
                                <td className="py-3 px-2 text-center text-xs font-bold text-[var(--text-primary)]">
                                    {r.correctAnswers}/{r.totalQuestions}
                                </td>
                                <td className="py-3 px-2 text-center text-xs font-bold text-[var(--text-secondary)]">
                                    {mins}m {secs}s
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${GRADE_STYLES[r.grade] || GRADE_STYLES['F']}`}>
                                        {r.grade}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                    {usedTools > 0 ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-500/10 text-purple-600 rounded-full">
                                            {usedTools} tool{usedTools > 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-[var(--text-secondary)]">—</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {results.length === 0 && (
                <p className="text-center py-8 text-sm text-[var(--text-secondary)]">No results yet.</p>
            )}
        </div>
    );
};

// ── Main Page ──────────────────────────────────────────────────
const AssessmentAnalytics = () => {
    const { assessmentId } = useParams();
    const navigate          = useNavigate();
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        getAssessmentAnalytics(assessmentId)
            .then(res => { if (res.success) setData(res); else setError(res.message || 'Failed to load'); })
            .catch(err => setError(err?.response?.data?.message || err.message || 'Failed to load analytics'))
            .finally(() => setLoading(false));
    }, [assessmentId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
                <StaffNavbar />
                <main className="container mx-auto px-4 py-20 flex flex-col items-center gap-4">
                    <Loader2 size={40} className="animate-spin text-indigo-600" />
                    <p className="text-sm font-semibold text-[var(--text-secondary)]">Loading analytics…</p>
                </main>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
                <StaffNavbar />
                <main className="container mx-auto px-4 py-20 max-w-2xl text-center space-y-4">
                    <AlertCircle size={48} className="mx-auto text-red-500" />
                    <p className="text-sm text-[var(--text-secondary)]">{error || 'Analytics not available.'}</p>
                    <button onClick={() => navigate(-1)}
                        className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-2xl text-sm transition-colors hover:bg-indigo-700">
                        Go Back
                    </button>
                </main>
            </div>
        );
    }

    const { assessment, classStats, questionStats, results } = data;

    // Grade distribution chart data
    const gradeData = Object.entries(classStats.gradeDist || {})
        .map(([grade, count]) => ({ grade, count, fill: GRADE_COLORS[grade] || '#94a3b8' }))
        .filter(d => d.count > 0);

    // Question accuracy chart data
    const qChartData = (questionStats || []).slice(0, 10).map((q, i) => ({
        name:     `Q${i + 1}`,
        accuracy: q.accuracy,
        attempts: q.totalAttempts
    }));

    // Accessibility usage data
    const a11yData = Object.entries(classStats.accessibilityUsage || {})
        .map(([tool, count]) => ({ tool: tool.replace(/([A-Z])/g, ' $1').trim(), count }))
        .filter(d => d.count > 0)
        .sort((a, b) => b.count - a.count);

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
            <StaffNavbar />

            <main className="container mx-auto px-4 md:px-8 py-8 max-w-7xl space-y-8 animate-fade-in-up">

                {/* ── Header ──────────────────────────────────── */}
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)}
                        className="p-2 rounded-xl hover:bg-[var(--bg-surface)] border border-[var(--border-color)] transition-colors">
                        <ArrowLeft size={18} className="text-[var(--text-secondary)]" />
                    </button>
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                            {assessment?.subject || 'Assessment'} · Analytics
                        </p>
                        <h1 className="text-2xl font-black text-[var(--text-primary)]">{assessment?.title || 'Assessment Analytics'}</h1>
                    </div>
                </div>

                {/* ── Class overview stats ─────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard icon={Users}      label="Attempted"    value={classStats.attempted}                   color="indigo"  />
                    <StatCard icon={TrendingUp} label="Avg Score"    value={`${classStats.avgScore}%`}              color="purple"  />
                    <StatCard icon={Trophy}     label="Highest"      value={`${classStats.highestScore}%`}          color="emerald" />
                    <StatCard icon={AlertCircle} label="Lowest"      value={`${classStats.lowestScore}%`}           color="red"     />
                    <StatCard icon={CheckCircle} label="Pass Rate"   value={`${classStats.passPercent}%`}           color="emerald" sub="≥ 50%" />
                    <StatCard icon={Clock}       label="Avg Time"    value={`${classStats.avgTimeMin}m`}            color="amber"   />
                </div>

                {/* ── Charts row ───────────────────────────────── */}
                <div className="grid lg:grid-cols-2 gap-6">

                    {/* Grade distribution */}
                    {gradeData.length > 0 && (
                        <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm">
                            <h2 className="text-base font-extrabold mb-4 flex items-center gap-2">
                                <Trophy size={16} className="text-amber-500" /> Grade Distribution
                            </h2>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={gradeData} dataKey="count" nameKey="grade"
                                        cx="50%" cy="50%" outerRadius={80} label={({ grade, count }) => `${grade}: ${count}`}
                                        labelLine={false}>
                                        {gradeData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Question accuracy */}
                    {qChartData.length > 0 && (
                        <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm">
                            <h2 className="text-base font-extrabold mb-4 flex items-center gap-2">
                                <Target size={16} className="text-indigo-600" /> Question Accuracy
                            </h2>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={qChartData} margin={{ left: -10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <XAxis dataKey="name" fontSize={10} />
                                    <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} fontSize={10} />
                                    <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                                    <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                                        {qChartData.map((d, i) => <Cell key={i} fill={ACCURACY_COLOR(d.accuracy)} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* ── Question details ─────────────────────────── */}
                {questionStats && questionStats.length > 0 && (
                    <section className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm space-y-4">
                        <h2 className="text-base font-extrabold flex items-center gap-2">
                            <BarChart2 size={16} className="text-indigo-600" /> Per-Question Breakdown
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                                        <th className="text-left py-2 px-2 font-black uppercase tracking-wide">#</th>
                                        <th className="text-left py-2 px-2 font-black uppercase tracking-wide">Question</th>
                                        <th className="py-2 px-2 font-black uppercase tracking-wide">Difficulty</th>
                                        <th className="py-2 px-2 font-black uppercase tracking-wide">Correct</th>
                                        <th className="py-2 px-2 font-black uppercase tracking-wide">Attempts</th>
                                        <th className="py-2 px-2 font-black uppercase tracking-wide">Accuracy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {questionStats.map((q, i) => (
                                        <tr key={i} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-base)] transition-colors">
                                            <td className="py-2.5 px-2 font-black text-[var(--text-secondary)]">{i + 1}</td>
                                            <td className="py-2.5 px-2 text-[var(--text-primary)] font-medium max-w-xs">
                                                <span className="line-clamp-2">{q.questionText}</span>
                                            </td>
                                            <td className="py-2.5 px-2 text-center">
                                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                                    q.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-700' :
                                                    q.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-700' :
                                                    'bg-red-500/20 text-red-700'}`}>
                                                    {q.difficulty}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-2 text-center font-bold text-emerald-600">{q.correctCount}</td>
                                            <td className="py-2.5 px-2 text-center font-bold text-[var(--text-secondary)]">{q.totalAttempts}</td>
                                            <td className="py-2.5 px-2 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <div className="w-12 h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full"
                                                            style={{ width: `${q.accuracy}%`, background: ACCURACY_COLOR(q.accuracy) }} />
                                                    </div>
                                                    <span className="font-black" style={{ color: ACCURACY_COLOR(q.accuracy) }}>
                                                        {q.accuracy}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* ── Accessibility usage ──────────────────────── */}
                {a11yData.length > 0 && (
                    <section className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm space-y-4">
                        <h2 className="text-base font-extrabold flex items-center gap-2">
                            <Accessibility size={16} className="text-purple-600" /> Accessibility Tool Usage
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {a11yData.map((item, i) => (
                                <div key={i} className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
                                    <p className="text-xs font-bold text-[var(--text-primary)] capitalize">{item.tool}</p>
                                    <p className="text-2xl font-black text-purple-600 mt-1">{item.count}</p>
                                    <p className="text-[10px] text-[var(--text-secondary)]">student{item.count !== 1 ? 's' : ''}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Student results table ────────────────────── */}
                <section className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm space-y-4">
                    <h2 className="text-base font-extrabold flex items-center gap-2">
                        <Users size={16} className="text-indigo-600" /> Student Results
                        <span className="ml-auto text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-base)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                            {results.length} submitted
                        </span>
                    </h2>
                    <StudentResultsTable results={results} assessmentId={assessmentId} />
                </section>

                {/* ── AI Learning Summary ──────────────────────── */}
                {results.some(r => r.aiInsights?.overallFeedback) && (
                    <section className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-6 rounded-3xl border border-indigo-500/20 space-y-4">
                        <h2 className="text-base font-extrabold flex items-center gap-2">
                            <Brain size={16} className="text-indigo-600" /> AI Learning Insights Summary
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {results.filter(r => r.aiInsights?.overallFeedback).slice(0, 4).map((r, i) => {
                                const student = r.studentId || {};
                                const insights = r.aiInsights || {};
                                return (
                                    <div key={i} className="p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xs font-black">
                                                {(student.name || '?')[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-[var(--text-primary)]">{student.name || 'Student'}</span>
                                            <span className="ml-auto text-[10px] font-black px-2 py-0.5 bg-indigo-500/10 text-indigo-600 rounded-full">{r.percentage}%</span>
                                        </div>
                                        <p className="text-xs font-semibold text-[var(--text-secondary)] leading-relaxed">
                                            {insights.overallFeedback?.slice(0, 180)}{insights.overallFeedback?.length > 180 ? '…' : ''}
                                        </p>
                                        {(insights.recommendations || []).length > 0 && (
                                            <p className="text-[10px] font-bold text-blue-600 flex items-start gap-1">
                                                <Lightbulb size={10} className="shrink-0 mt-0.5" />
                                                {insights.recommendations[0]}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

            </main>
        </div>
    );
};

export default AssessmentAnalytics;
