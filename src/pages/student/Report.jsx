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
        getReportData().then(setReportData);
    }, []);

    const beforeStats = reportData?.beforeStats || [];
    const afterStats = reportData?.afterStats || [];

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300 font-sans">
            <Navbar />

            <main className="container mx-auto px-4 md:px-6 py-8 space-y-8 max-w-5xl">

                {/* 1. OVERVIEW HEADER */}
                <section className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-sm border border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in-up">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-4xl border-4 border-white dark:border-slate-800 shadow-lg">
                            🌱
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Your learning journey is improving</h1>
                            <div className="flex flex-wrap gap-4 text-slate-700 dark:text-gray-300 text-sm">
                                <span className="flex items-center gap-1"><span className="font-semibold text-slate-900 dark:text-white">Student:</span> {reportData?.userId?.name || 'Loading...'}</span>
                                <span className="hidden md:inline">•</span>
                                <span className="flex items-center gap-1"><span className="font-semibold text-slate-900 dark:text-white">Level:</span> {reportData?.userId?.levelTitle || 'Beginner'}</span>
                                <span className="hidden md:inline">•</span>
                                <span className="flex items-center gap-1"><span className="font-semibold text-slate-900 dark:text-white">Streak:</span> {reportData?.userId?.streak || 0} Days 🔥</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. BEFORE vs AFTER SNAPSHOT */}
                <section className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-lg border border-[var(--border-color)]">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" /> Impact of Your Tools
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-16 relative">
                        {/* Connector on desktop */}
                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-50 dark:bg-slate-700 rounded-full items-center justify-center z-10">
                            <MoveRight className="text-blue-500" size={20} />
                        </div>

                        {/* BEFORE */}
                        <div className="space-y-6 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-color)] pb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Before Support</span>
                            </div>

                            {beforeStats.map((stat, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>{stat.label}</span>
                                        <span className="text-[var(--text-secondary)]">{stat.display}</span>
                                    </div>
                                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-slate-400"
                                            style={{ width: `${stat.value}%` }}
                                            role="progressbar"
                                            aria-valuenow={stat.value}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                            aria-label={`${stat.label} before support`}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* AFTER */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 flex items-center gap-2">
                                    After Support <Sparkles size={14} />
                                </span>
                            </div>

                            {afterStats.map((stat, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-2 font-semibold">
                                        <span>{stat.label}</span>
                                        <span className="text-green-700 dark:text-green-400">{stat.display}</span>
                                    </div>
                                    <div className={`h-3 rounded-full overflow-hidden border ${stat.value > beforeStats[idx].value ? 'bg-green-50 border-green-100 dark:bg-green-900/30 dark:border-green-900' : 'bg-gray-100 border-gray-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                                        <div
                                            className={`h-full relative overflow-hidden ${stat.value > beforeStats[idx].value ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-slate-400'}`}
                                            style={{ width: `${stat.value}%` }}
                                            role="progressbar"
                                            aria-valuenow={stat.value}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                            aria-label={`${stat.label} after support`}
                                        >
                                            {stat.value > beforeStats[idx].value && <div className="absolute inset-0 bg-white/30 animate-pulse-slow"></div>}
                                        </div>
                                    </div>
                                    <div className={`text-xs mt-1 flex items-center gap-1 font-medium ${stat.value > beforeStats[idx].value ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {stat.value > beforeStats[idx].value
                                            ? <><ArrowUp size={12} /> Improved by {stat.value - beforeStats[idx].value}%</>
                                            : <span className="flex items-center gap-1"><Activity size={12} /> No change yet</span>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. LEETCODE STYLE GRAPHS */}
                {reportData?.submissionHistory && (
                    <section className="grid md:grid-cols-2 gap-8">
                        {/* A. Submission Heatmap & Activity Line */}
                        <div className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-lg border border-[var(--border-color)]">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Activity className="text-orange-500" /> Activity Profile
                            </h2>

                            {/* Line Chart */}
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
                                        <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* GitHub/LeetCode Style Heatmap (Mini Calendar) */}
                            <div>
                                <h4 className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-3">Submission Heatmap (Last 14 Days)</h4>
                                <div className="flex gap-1 overflow-x-auto pb-2">
                                    {reportData.submissionHistory.slice(-14).map((day, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-1 min-w-[20px]">
                                            <div
                                                className={`w-6 h-6 rounded-md transition-all hover:scale-110 ${day.count === 0 ? 'bg-gray-100 dark:bg-slate-800' :
                                                    day.count < 3 ? 'bg-green-200 dark:bg-green-900/50' :
                                                        day.count < 6 ? 'bg-green-400 dark:bg-green-700' :
                                                            'bg-green-600 dark:bg-green-500'
                                                    }`}
                                                title={`${day.date}: ${day.count} submissions`}
                                            ></div>
                                            <span className="text-[10px] text-[var(--text-secondary)]">{day.date.split('-')[2]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* B. Problem Difficulty Donut */}
                        {/* B. Subject Score Line Chart */}
                        <div className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-lg border border-[var(--border-color)]">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <TrendingUp className="text-purple-500" /> Performance Trend
                            </h2>

                            <div className="w-full" style={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={reportData.improvementData || []}
                                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="subject" />
                                        <YAxis domain={[0, 100]} />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-center mt-4 text-xs text-[var(--text-secondary)] italic">
                                * Trends update dynamically as you complete assessments.
                            </div>
                        </div>
                    </section>
                )}

                {/* 3. LEARNING COMFORT INSIGHTS */}
                <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 px-1">
                        <Brain className="text-purple-600" /> Learning Comfort Insights
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
                            bgClass="bg-blue-600"
                            colorClass="text-white"
                        />
                        <InsightCard
                            icon={Type}
                            title="Visual Clarity"
                            description="Increasing text spacing and font size improved reading speed and focus."
                            bgClass="bg-orange-600"
                            colorClass="text-white"
                        />
                    </div>
                </section>

                {/* 4. NEXT RECOMMENDED ACTIONS */}
                <section className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-xl overflow-hidden relative">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="grid md:grid-cols-2 gap-12 relative z-10 w-full">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Recommended for You 🚀</h2>
                                <p className="text-indigo-200">
                                    Based on your progress, here are the best ways to continue improving.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-start gap-3">
                                    <BookOpen className="text-cyan-300 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-bold text-sm">Try Simplified Study Materials</h4>
                                        <p className="text-xs text-indigo-200 mt-1">Focus on core concepts with removed distractions.</p>
                                    </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-start gap-3">
                                    <Headphones className="text-pink-300 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-bold text-sm">Use Audio-First Learning</h4>
                                        <p className="text-xs text-indigo-200 mt-1">Listen to lessons before reading to boost retention.</p>
                                    </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-start gap-3">
                                    <Brain className="text-emerald-300 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-bold text-sm">Practice Concept-Based Questions</h4>
                                        <p className="text-xs text-indigo-200 mt-1">Reinforce your understanding with targeted questions.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center items-center md:items-start space-y-4">
                            <p className="font-semibold text-lg text-center md:text-left mb-2">Ready to move forward?</p>

                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                <button
                                    onClick={() => navigate('/student/classroom')}
                                    className="flex-1 px-6 py-4 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <BookOpen size={20} /> Go to Classroom
                                </button>
                                <button
                                    onClick={() => navigate('/student/assessment')}
                                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg border border-indigo-500"
                                >
                                    <CheckCircle2 size={20} /> Start Practice Test
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default Report;
