import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../../services/api';
import Navbar from '../../components/Navbar';
import { User, Mail, Shield, Award, Calendar, Zap, TrendingUp } from 'lucide-react';

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

    if (!profile) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">Loading...</div>;

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300 font-sans">
            <Navbar />

            <main className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">

                {/* Header Card */}
                <div className="bg-[var(--bg-primary)] rounded-3xl p-8 shadow-lg border border-[var(--border-color)] mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">

                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-xl relative z-10">
                        <div className="w-full h-full bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                            {profile.name.charAt(0)}
                        </div>
                        <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-slate-800"></div>
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10">
                        <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                        <p className="text-[var(--text-secondary)] text-lg mb-4">{profile.levelTitle}</p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold flex items-center gap-2">
                                <Shield size={16} /> Student
                            </span>
                            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold flex items-center gap-2">
                                <Award size={16} /> Level {profile.level}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Personal Info */}
                    <div className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <User className="text-blue-500" /> Personal Information
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Full Name</label>
                                <p className="text-lg font-medium">{profile.name}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Email Address</label>
                                <p className="text-lg font-medium flex items-center gap-2">
                                    <Mail size={16} className="text-[var(--text-secondary)]" /> {profile.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="text-green-500" /> Current Stats
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/50">
                                <div className="text-orange-500 mb-2"><Zap size={24} /></div>
                                <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-100">{profile.xp}</h3>
                                <p className="text-xs text-orange-700 dark:text-orange-300">Total XP</p>
                            </div>
                            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-100 dark:border-pink-900/50">
                                <div className="text-pink-500 mb-2"><Calendar size={24} /></div>
                                <h3 className="text-2xl font-bold text-pink-900 dark:text-pink-100">{profile.streak}</h3>
                                <p className="text-xs text-pink-700 dark:text-pink-300">Day Streak</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-bold text-[var(--text-secondary)]">Progress to Level {profile.level + 1}</span>
                                <span className="font-bold text-blue-600">{Math.round((profile.xp / (profile.xp + profile.xpToNextLevel)) * 100)}%</span>
                            </div>
                            <div className="h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(profile.xp / (profile.xp + profile.xpToNextLevel)) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
};

export default Profile;
