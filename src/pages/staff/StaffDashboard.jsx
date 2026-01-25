import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffNavbar from '../../components/StaffNavbar';
import { Users, Plus, Brain, TrendingUp, Clock, CheckCircle, FileText, Activity } from 'lucide-react';

// Mock Data for Dashboard (Replace with API later)
const DASHBOARD_STATS = {
    totalStudents: 124,
    activeLevels: 12,
    completionRate: 85,
    recentSubmissions: [
        { student: "Alex Johnson", task: "Intro to Nouns", status: "Perfect", time: "2 mins ago" },
        { student: "Sam Smith", task: "Speech Test", status: "Good", time: "15 mins ago" },
        { student: "Jordan Lee", task: "Math Quiz", status: "Needs Review", time: "1 hour ago" }
    ]
};

const StaffDashboard = () => {
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
                                <div className="text-2xl font-black">{DASHBOARD_STATS.totalStudents}</div>
                                <div className="text-xs uppercase tracking-wider opacity-80">Students</div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                            <Brain size={24} />
                            <div>
                                <div className="text-2xl font-black">{DASHBOARD_STATS.activeLevels}</div>
                                <div className="text-xs uppercase tracking-wider opacity-80">Active Levels</div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                            <TrendingUp size={24} />
                            <div>
                                <div className="text-2xl font-black">{DASHBOARD_STATS.completionRate}%</div>
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
                            {DASHBOARD_STATS.recentSubmissions.map((sub, i) => (
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
                            ))}
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
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600 font-medium">Class 8-A</span>
                                        <span className="text-green-600 font-bold">92%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-green-500 h-full w-[92%]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600 font-medium">Class 9-B</span>
                                        <span className="text-blue-600 font-bold">78%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full w-[78%]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600 font-medium">Class 7-C</span>
                                        <span className="text-orange-600 font-bold">64%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-orange-500 h-full w-[64%]"></div>
                                    </div>
                                </div>
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
