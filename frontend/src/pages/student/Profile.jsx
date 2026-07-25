import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../../services/api';
import Navbar from '../../components/Navbar';
import { User, Mail, Shield, Award, Calendar, Zap, TrendingUp, Sparkles } from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            const data = await getDashboardData();
            if (data && data.profile) {
                setProfile(data.profile);
            }
        };
        loadProfile();
    }, []);

    if (!profile) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] font-bold text-[var(--text-secondary)]">Loading student profile...</div>;

    const currentXp = profile.xp || 0;
    const currentLevel = profile.level || 1;
    const xpToNext = profile.xpToNextLevel || (1000 - (currentXp % 1000));
    const progressPercent = Math.min(100, Math.round(((currentXp % 1000) / 1000) * 100));

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300 font-sans pb-20">
            <Navbar />

            <main className="container mx-auto px-4 md:px-6 py-8 max-w-4xl space-y-8 animate-fade-in-up">

                {/* Header Card */}
                <div className="bg-[var(--bg-surface)] rounded-3xl p-8 shadow-lg border border-[var(--border-color)] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden card-hover-lift">
                    {/* Decorative Blur */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-xl relative shrink-0">
                        <div className="w-full h-full bg-[var(--bg-surface)] rounded-full flex items-center justify-center text-4xl font-black text-indigo-600 dark:text-indigo-400 uppercase">
                            {profile.name?.charAt(0) || 'S'}
                        </div>
                        <div className="absolute bottom-1 right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-[var(--bg-surface)]"></div>
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10 space-y-3">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{profile.name}</h1>
                            <p className="text-[var(--text-secondary)] text-base font-semibold mt-0.5">{profile.levelTitle || 'Rising Scholar'}</p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-2.5">
                            <span className="px-3.5 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-extrabold flex items-center gap-1.5 border border-indigo-500/20">
                                <Shield size={14} /> Student Account
                            </span>
                            <span className="px-3.5 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-extrabold flex items-center gap-1.5 border border-purple-500/20">
                                <Award size={14} /> Level {currentLevel}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info & Stats Grid */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Personal Info */}
                    <div className="bg-[var(--bg-surface)] p-8 rounded-3xl shadow-sm border border-[var(--border-color)] space-y-6">
                        <h2 className="text-xl font-black flex items-center gap-2 text-[var(--text-primary)]">
                            <User className="text-indigo-500" size={22} /> Personal Details
                        </h2>

                        <div className="space-y-4">
                            <div className="p-4 bg-[var(--bg-base)] rounded-2xl border border-[var(--border-color)]">
                                <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1">Full Name</label>
                                <p className="text-base font-bold">{profile.name}</p>
                            </div>
                            <div className="p-4 bg-[var(--bg-base)] rounded-2xl border border-[var(--border-color)]">
                                <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1">Email Address</label>
                                <p className="text-base font-bold flex items-center gap-2">
                                    <Mail size={16} className="text-indigo-500" /> {profile.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Gamification Stats Card */}
                    <div className="bg-[var(--bg-surface)] p-8 rounded-3xl shadow-sm border border-[var(--border-color)] space-y-6">
                        <h2 className="text-xl font-black flex items-center gap-2 text-[var(--text-primary)]">
                            <TrendingUp className="text-emerald-500" size={22} /> Learning Performance
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                                <div className="text-amber-500 mb-2"><Zap size={24} fill="currentColor" /></div>
                                <h3 className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400">{currentXp}</h3>
                                <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mt-1">Total XP Earned</p>
                            </div>
                            <div className="p-5 bg-pink-500/10 rounded-2xl border border-pink-500/20">
                                <div className="text-pink-500 mb-2"><Calendar size={24} /></div>
                                <h3 className="text-2xl md:text-3xl font-black text-pink-600 dark:text-pink-400">{profile.streak || 0}</h3>
                                <p className="text-xs font-bold text-pink-700 dark:text-pink-300 mt-1">Active Day Streak</p>
                            </div>
                        </div>

                        <div className="p-4 bg-[var(--bg-base)] rounded-2xl border border-[var(--border-color)] space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-[var(--text-secondary)]">Level {currentLevel} → Level {currentLevel + 1}</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{progressPercent}%</span>
                            </div>
                            <div className="h-3 bg-[var(--bg-surface)] rounded-full overflow-hidden p-0.5 border border-[var(--border-color)]">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000" style={{ width: `${Math.max(5, progressPercent)}%` }}></div>
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)] font-semibold text-center">
                                {xpToNext} XP needed to reach Level {currentLevel + 1}
                            </p>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
};

export default Profile;
