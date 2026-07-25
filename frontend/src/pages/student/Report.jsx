import React, { useState, useEffect } from 'react';
import { getReportData } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import InsightCard from '../../components/InsightCard';
import {
    TrendingUp, ArrowRight, Sparkles,
    Headphones, Type, CheckCircle2,
    MoveRight, BookOpen, Brain,
    ArrowUp, ArrowDown, Activity, Calendar
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis, Cell, Legend
} from 'recharts';

const Report = () => {
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        getReportData().then(setReportData).catch(err => console.error("Report load error", err));
    }, []);

    const beforeStats = reportData?.beforeStats || [];
    const afterStats = reportData?.afterStats || [];

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300 font-sans">
            <Navbar />

            <main className="container mx-auto px-4 md:px-6 py-8 space-y-8 max-w-5xl animate-fade-in-up">

                {/* 1. OVERVIEW HEADER */}
                <section className="bg-[var(--bg-surface)] p-8 rounded-3xl shadow-sm border border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-6 card-hover-lift">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-4xl border border-emerald-500/20 shadow-lg">
                            🌱
                        </div>
                        <div>
                            <h1 className="text-3xl font-black mb-2 text-[var(--text-primary)]">Your learning journey is improving</h1>
                            <div className="flex flex-wrap gap-4 text-[var(--text-secondary)] text-sm font-medium">
                                <span className="flex items-center gap-1"><span className="font-bold text-[var(--text-primary)]">Student:</span> {reportData?.userId?.name || 'Student'}</span>
                                <span className="hidden md:inline">•</span>
                                <span className="flex items-center gap-1"><span className="font-bold text-[var(--text-primary)]">Level:</span> {reportData?.userId?.levelTitle || 'Beginner'}</span>
                                <span className="hidden md:inline">•</span>
                                <span className="flex items-center gap-1"><span className="font-bold text-[var(--text-primary)]">Streak:</span> {reportData?.userId?.streak || 0} Days 🔥</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. BEFORE vs AFTER SNAPSHOT */}
                <section className="bg-[var(--bg-surface)] p-8 rounded-3xl shadow-sm border border-[var(--border-color)]">
                    <h2 className="text-xl font-extrabold mb-8 flex items-center gap-2 text-[var(--text-primary)] tracking-tight">
                        <TrendingUp className="text-indigo-600" /> Impact of Your Adaptive Tools
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-16 relative">
                        {/* Connector on desktop */}
                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-500/10 rounded-full items-center justify-center z-10 border border-indigo-500/20">
                            <MoveRight className="text-indigo-600" size={20} />
                        </div>

                        {/* BEFORE */}
                        <div className="space-y-6 opacity-80 hover:opacity-100 transition-all duration-500">
                            <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-color)] pb-2">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Before Support</span>
                            </div>

                            {(beforeStats || []).length === 0 ? (
                                <p className="text-xs text-[var(--text-secondary)] italic">No benchmark data recorded yet.</p>
                            ) : (
                                (beforeStats || []).map((stat, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-2 font-semibold">
                                            <span>{stat.label}</span>
                                            <span className="text-[var(--text-secondary)]">{stat.display}</span>
                                        </div>
                                        <div className="h-3 bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-color)]">
                                            <div
                                                className="h-full bg-slate-400"
                                                style={{ width: `${stat.value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* AFTER */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4 border-b border-emerald-500/30 pb-2">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                    After Support <Sparkles size={14} />
                                </span>
                            </div>

                            {(afterStats || []).length === 0 ? (
                                <p className="text-xs text-[var(--text-secondary)] italic">Complete activities to see post-support metrics.</p>
                            ) : (
                                (afterStats || []).map((stat, idx) => {
                                    const prevVal = beforeStats[idx]?.value || 0;
                                    const isImp = stat.value > prevVal;
                                    return (
                                        <div key={idx}>
                                            <div className="flex justify-between text-sm mb-2 font-bold">
                                                <span>{stat.label}</span>
                                                <span className="text-emerald-600 dark:text-emerald-400">{stat.display}</span>
                                            </div>
                                            <div className={`h-3 rounded-full overflow-hidden border ${isImp ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[var(--bg-base)] border-[var(--border-color)]'}`}>
                                                <div
                                                    className={`h-full relative overflow-hidden ${isImp ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-slate-400'}`}
                                                    style={{ width: `${stat.value}%` }}
                                                />
                                            </div>
                                            <div className={`text-xs mt-1 flex items-center gap-1 font-bold ${isImp ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-secondary)]'}`}>
                                                {isImp ? (
                                                    <><ArrowUp size={12} /> Improved by {stat.value - prevVal}%</>
                                                ) : (
                                                    <span className="flex items-center gap-1"><Activity size={12} /> Baseline active</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </section>

                {/* 3. ACTIVITY PROFILE */}
                {(reportData?.submissionHistory || []).length > 0 && (
                    <section className="grid md:grid-cols-2 gap-8">
                        <div className="bg-[var(--bg-surface)] p-8 rounded-3xl shadow-sm border border-[var(--border-color)]">
                            <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
                                <Activity className="text-amber-500" /> Activity Profile
                            </h2>

                            <div className="w-full mb-6" style={{ height: 200 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={reportData.submissionHistory}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                        <XAxis dataKey="date" hide />
                                        <YAxis hide />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            labelStyle={{ color: '#666' }}
                                        />
                                        <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div>
                                <h4 className="text-xs font-extrabold uppercase text-[var(--text-secondary)] mb-3">Submission Heatmap</h4>
                                <div className="flex gap-1.5 overflow-x-auto pb-2">
                                    {(reportData.submissionHistory || []).slice(-14).map((day, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-1 min-w-[20px]">
                                            <div
                                                className={`w-6 h-6 rounded-md transition-all hover:scale-110 ${
                                                    day.count === 0 ? 'bg-[var(--bg-base)] border border-[var(--border-color)]' :
                                                    day.count < 3 ? 'bg-emerald-500/30' :
                                                    day.count < 6 ? 'bg-emerald-500/60' : 'bg-emerald-500'
                                                }`}
                                                title={`${day.date}: ${day.count} submissions`}
                                            />
                                            <span className="text-[10px] text-[var(--text-secondary)] font-semibold">{day.date.split('-')[2]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-surface)] p-8 rounded-3xl shadow-sm border border-[var(--border-color)]">
                            <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
                                <TrendingUp className="text-purple-600" /> Performance Trend
                            </h2>

                            <div className="w-full" style={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={reportData.improvementData || []}
                                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                        <XAxis dataKey="subject" />
                                        <YAxis domain={[0, 100]} />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={3} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </section>
                )}

                {/* 4. LEARNING COMFORT INSIGHTS */}
                <section>
                    <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2 tracking-tight">
                        <Brain className="text-purple-600" /> Cognitive Comfort Insights
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <InsightCard
                            icon={Headphones}
                            title="Audio Support"
                            description="Audio support helped comprehension significantly during long reading passages."
                            bgClass="bg-purple-600"
                            colorClass="text-white"
                        />
                        <InsightCard
                            icon={CheckCircle2}
                            title="Question Format"
                            description="Breakdown of complex questions into smaller steps reduced error rate by 40%."
                            bgClass="bg-indigo-600"
                            colorClass="text-white"
                        />
                        <InsightCard
                            icon={Type}
                            title="Visual Clarity"
                            description="Increasing text spacing and font size improved reading speed and focus."
                            bgClass="bg-amber-600"
                            colorClass="text-white"
                        />
                    </div>
                </section>

                {/* 5. NEXT RECOMMENDED ACTIONS */}
                <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-xl overflow-hidden relative border border-indigo-500/30 card-hover-lift">
                    <div className="grid md:grid-cols-2 gap-8 relative z-10 w-full items-center">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black">Recommended Next Steps 🚀</h2>
                            <p className="text-indigo-200 text-sm font-medium">
                                Based on your progress, continue practicing with your adaptive tools in the classroom.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/student/classroom')}
                                className="flex-1 px-6 py-4 bg-white text-indigo-900 rounded-2xl font-extrabold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <BookOpen size={18} /> Go to Classroom
                            </button>
                            <button
                                onClick={() => navigate('/student/assessment')}
                                className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-extrabold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg border border-indigo-400/30"
                            >
                                <CheckCircle2 size={18} /> Start Practice
                            </button>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default Report;
