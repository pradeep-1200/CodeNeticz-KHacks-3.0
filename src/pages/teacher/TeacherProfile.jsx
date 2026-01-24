import React, { useState, useEffect } from 'react';
import TeacherNavbar from '../../components/TeacherNavbar';
import { User, Mail, Shield, Award, Calendar, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TeacherProfile = () => {
    const { user } = useAuth();

    if (!user) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">Loading...</div>;

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300 font-sans">
            <TeacherNavbar />

            <main className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">

                {/* Header Card */}
                <div className="bg-[var(--bg-primary)] rounded-3xl p-8 shadow-lg border border-[var(--border-color)] mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">

                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 p-1 shadow-xl relative z-10">
                        <div className="w-full h-full bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl font-bold text-green-600 dark:text-green-400">
                            {user.name.charAt(0)}
                        </div>
                        <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-slate-800"></div>
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10">
                        <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
                        <p className="text-[var(--text-secondary)] text-lg mb-4">Teacher</p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-2">
                                <Shield size={16} /> Teacher
                            </span>
                            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold flex items-center gap-2">
                                <Award size={16} /> Educator
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Personal Info */}
                    <div className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <User className="text-green-500" /> Personal Information
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Full Name</label>
                                <p className="text-lg font-medium">{user.name}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Email Address</label>
                                <p className="text-lg font-medium flex items-center gap-2">
                                    <Mail size={16} className="text-[var(--text-secondary)]" /> {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Teaching Stats */}
                    <div className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="text-green-500" /> Teaching Stats
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/50">
                                <div className="text-green-500 mb-2"><Award size={24} /></div>
                                <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">3</h3>
                                <p className="text-xs text-green-700 dark:text-green-300">Active Classes</p>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                <div className="text-blue-500 mb-2"><Calendar size={24} /></div>
                                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">45</h3>
                                <p className="text-xs text-blue-700 dark:text-blue-300">Total Students</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-bold text-[var(--text-secondary)]">Student Engagement</span>
                                <span className="font-bold text-green-600">85%</span>
                            </div>
                            <div className="h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                                <div className="h-full bg-green-600 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
};

export default TeacherProfile;