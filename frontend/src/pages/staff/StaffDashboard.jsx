import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffNavbar from '../../components/StaffNavbar';
import { useAuthStore } from '../../store/authStore';
import { Users, Plus, Brain, TrendingUp, Clock, CheckCircle, FileText, Activity, ShieldCheck, Upload } from 'lucide-react';
import { getStaffDashboardData } from '../../services/api';

const StaffDashboard = () => {
    const user = useAuthStore(s => s.user);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeLevels: 0,
        completionRate: 0,
        recentSubmissions: [],
        classPerformance: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const data = await getStaffDashboardData();
                if (data && data.stats) {
                    setStats(data.stats);
                }
            } catch (err) {
                console.error("Failed to load staff dashboard", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xl font-bold">Loading Faculty Portal...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
            <StaffNavbar />

            <main className="container mx-auto px-4 md:px-8 py-8 space-y-8 max-w-7xl animate-fade-in-up">

                {/* Welcome Hero Section */}
                <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-purple-500/30 relative overflow-hidden card-hover-lift">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
                            <ShieldCheck size={14} /> Faculty Dashboard
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                            Welcome back, {user?.name || 'Professor'}! 🎓
                        </h1>
                        <p className="opacity-90 text-sm md:text-base max-w-2xl font-medium">
                            Monitor student cognitive adaptability progress, create levels, and manage class invitations.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                                <Users size={22} className="text-purple-200" />
                                <div>
                                    <div className="text-2xl font-black">{stats.totalStudents || 0}</div>
                                    <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold">Enrolled Students</div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                                <Brain size={22} className="text-purple-200" />
                                <div>
                                    <div className="text-2xl font-black">{stats.activeLevels || 0}</div>
                                    <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold">Active Levels</div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3 col-span-2 md:col-span-1">
                                <TrendingUp size={22} className="text-purple-200" />
                                <div>
                                    <div className="text-2xl font-black">{stats.completionRate || 100}%</div>
                                    <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold">Class Engagement</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link to="/staff/create-level" className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)] hover:border-purple-500/50 transition-all group card-hover-lift">
                        <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus size={24} />
                        </div>
                        <h3 className="font-extrabold text-lg mb-1 text-[var(--text-primary)]">Create Level</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Design interactive gamified tasks</p>
                    </Link>

                    <Link to="/staff/upload-material" className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)] hover:border-blue-500/50 transition-all group card-hover-lift">
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload size={24} />
                        </div>
                        <h3 className="font-extrabold text-lg mb-1 text-[var(--text-primary)]">Upload Material</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Share study PDFs or media</p>
                    </Link>

                    <Link to="/staff/prelims" className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)] hover:border-emerald-500/50 transition-all group card-hover-lift">
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Brain size={24} />
                        </div>
                        <h3 className="font-extrabold text-lg mb-1 text-[var(--text-primary)]">Prelims Assessment</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Manage onboarding questions</p>
                    </Link>

                    <Link to="/staff/classes" className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)] hover:border-amber-500/50 transition-all group card-hover-lift">
                        <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <h3 className="font-extrabold text-lg mb-1 text-[var(--text-primary)]">Manage Classes</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Rosters & code invitations</p>
                    </Link>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* Recent Submissions / Activity */}
                    <div className="lg:col-span-2 bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-[var(--border-color)] p-6">
                        <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
                            <Clock size={20} className="text-purple-600" /> Live Student Submissions
                        </h2>
                        <div className="space-y-4">
                            {stats.recentSubmissions && stats.recentSubmissions.length > 0 ? stats.recentSubmissions.map((sub, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] hover:border-purple-500/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-purple-500/10 text-purple-600 rounded-full flex items-center justify-center font-bold">
                                            {sub.student ? sub.student.charAt(0).toUpperCase() : 'S'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-[var(--text-primary)]">{sub.student}</h4>
                                            <p className="text-xs text-[var(--text-secondary)]">Completed <span className="font-medium text-purple-600 dark:text-purple-400">{sub.task}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                            sub.status === 'Perfect' ? 'bg-emerald-500/10 text-emerald-600' :
                                            sub.status === 'Good' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'
                                        }`}>
                                            {sub.status || 'Submitted'}
                                        </span>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1">{sub.time || 'Recently'}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center p-8 text-sm text-[var(--text-secondary)]">
                                    No recent student activities logged yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Class Performance Overview */}
                    <div className="space-y-6">
                        <div className="bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-[var(--border-color)] p-6">
                            <h2 className="text-lg font-extrabold mb-4 text-[var(--text-primary)]">Class Cognitive Performance</h2>
                            <div className="space-y-4">
                                {stats.classPerformance && stats.classPerformance.length > 0 ? stats.classPerformance.map((cls, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-[var(--text-secondary)]">{cls.name}</span>
                                            <span className="text-purple-600 dark:text-purple-400 font-extrabold">{cls.score}%</span>
                                        </div>
                                        <div className="w-full bg-[var(--bg-base)] h-2.5 rounded-full overflow-hidden border border-[var(--border-color)]">
                                            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(5, cls.score)}%` }}></div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-xs text-[var(--text-secondary)] text-center py-4">
                                        No class performance analytics available yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20 p-6 card-hover-lift">
                            <h2 className="text-base font-extrabold text-amber-700 dark:text-amber-400 mb-2">Pending Voice Reviews 📝</h2>
                            <p className="text-xs text-[var(--text-secondary)] mb-4 font-medium">
                                Voice submissions from dysgraphia students are ready for your review.
                            </p>
                            <Link to="/staff/classes" className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-colors">
                                Open Class Manager
                            </Link>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
};

export default StaffDashboard;
