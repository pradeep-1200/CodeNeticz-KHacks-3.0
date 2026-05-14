import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffNavbar from '../../components/StaffNavbar';
import { Users, Plus, Brain, TrendingUp, Clock, CheckCircle, FileText, Activity } from 'lucide-react';

import { getStaffDashboardData } from '../../services/api';

const StaffDashboard = () => {
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
            <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xl font-bold">Loading Dashboard...</p>
            </div>
        );
    }
    // Use similar structure to student dashboard but tailored for staff
    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
            <StaffNavbar />

            <main className="container mx-auto px-6 py-8 space-y-8">

                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                    <h1 className="text-3xl font-black mb-2">Welcome back, Professor! 🎓</h1>
                    <p className="opacity-90 text-lg">Your students are doing great. You have 3 new notifications.</p>

                    <div className="flex gap-4 mt-6">
                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                            <Users size={24} />
                            <div>
                                <div className="text-2xl font-black">{stats.totalStudents}</div>
                                <div className="text-xs uppercase tracking-wider opacity-80">Students</div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                            <Brain size={24} />
                            <div>
                                <div className="text-2xl font-black">{stats.activeLevels}</div>
                                <div className="text-xs uppercase tracking-wider opacity-80">Active Levels</div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                            <TrendingUp size={24} />
                            <div>
                                <div className="text-2xl font-black">{stats.completionRate}%</div>
                                <div className="text-xs uppercase tracking-wider opacity-80">Completion Rate</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link to="/staff/create-level" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-300 transition-all group">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Create Level</h3>
                        <p className="text-sm text-slate-500">Design a new gamified lesson</p>
                    </Link>

                    <Link to="/staff/upload-material" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all group">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FileText size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Upload Material</h3>
                        <p className="text-sm text-slate-500">Share PDFs or Videos</p>
                    </Link>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-green-300 transition-all group cursor-pointer">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Activity size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Live Monitor</h3>
                        <p className="text-sm text-slate-500">Track student engagement</p>
                    </div>

                    <Link to="/staff/classes" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-300 transition-all group">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Manage Class</h3>
                        <p className="text-sm text-slate-500">Add or remove students</p>
                    </Link>
                </div>

                {/* Recent Activity Section */}
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-slate-400" /> Recent Student Activity
                        </h2>
                        <div className="space-y-4">
                            {stats.recentSubmissions && stats.recentSubmissions.length > 0 ? stats.recentSubmissions.map((sub, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                                            {sub.student.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{sub.student}</h4>
                                            <p className="text-sm text-slate-500">Completed <span className="font-medium text-purple-600">{sub.task}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${sub.status === 'Perfect' ? 'bg-green-100 text-green-700' :
                                            sub.status === 'Good' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {sub.status}
                                        </span>
                                        <p className="text-xs text-slate-400 mt-1">{sub.time}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center p-6 text-slate-500">No recent activity found.</div>
                            )}
                        </div>
                        <button className="w-full mt-6 py-3 text-sm font-bold text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">
                            View All Activity
                        </button>
                    </div>

                    {/* System Status / Quick Stats */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold mb-4">Class Performance</h2>
                            <div className="space-y-4">
                                {stats.classPerformance && stats.classPerformance.length > 0 ? stats.classPerformance.map((cls, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600 font-medium">{cls.name}</span>
                                            <span className={`text-${cls.color}-600 font-bold`}>{cls.score}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className={`bg-${cls.color}-500 h-full`} style={{ width: `${cls.score}%` }}></div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-sm text-slate-500">No class data available.</div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-sm border border-orange-100 p-6">
                            <h2 className="text-lg font-bold text-orange-800 mb-2">Pending Reviews 📝</h2>
                            <p className="text-sm text-orange-700 mb-4">There are 5 student voice submissions waiting for your manual review.</p>
                            <button className="px-4 py-2 bg-white text-orange-600 font-bold text-sm rounded-lg shadow-sm border border-orange-200 hover:bg-orange-50">
                                Review Now
                            </button>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default StaffDashboard;
