import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useGamification } from '../../context/GamificationContext';
import { BookOpen, Bell, Star, TrendingUp, ArrowRight, CheckCircle, Clock, Accessibility, BarChart2, ClipboardCheck, Flame, Trophy, Play } from 'lucide-react';
import { getDashboardData } from '../../services/api';

const Dashboard = () => {
   const [data, setData] = useState(null);
   const { stats } = useGamification();
   const gStats = stats || { xp: 0, level: 1, streak: 0, completedLevels: [] };

   useEffect(() => {
      const loadData = async () => {
         const result = await getDashboardData();
         setData(result);
      };
      loadData();
   }, []);

   const dashboardData = data?.stats || { activeClasses: { count: 0 }, pendingInvites: { count: 0 }, weeklyGoal: { progress: 0 } };
   const recentActivity = data?.recentActivity || [];
   const dailyTip = data?.dailyTip || { title: "Daily Tip", content: "Loading..." };

   // Calculate next level to play
   const nextLevel = (gStats?.completedLevels?.length || 0) + 1;

   return (
      <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
         <Navbar />

         <main className="container mx-auto px-6 py-8 space-y-8">

            {/* Welcome & Gamified Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 bg-[var(--bg-primary)] p-8 rounded-3xl shadow-xl border-4 border-b-8 border-[var(--border-color)] flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-2">
                     <h1 className="text-4xl font-black mb-2">Keep it up, Champ! 👋</h1>
                     <p className="text-[var(--text-secondary)] font-medium text-lg">
                        Ready for the next challenge? You're on a roll.
                     </p>
                     <div className="flex gap-4 mt-6">
                        <div className="flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-2xl font-black border-2 border-orange-200">
                           <Flame size={24} fill="currentColor" /> {gStats.streak} Day Streak
                        </div>
                        <div className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-2xl font-black border-2 border-blue-200">
                           <Trophy size={24} /> {gStats.xp} XP
                        </div>
                     </div>
                  </div>

                  <Link
                     to="/student/learn-path"
                     className="w-full md:w-auto px-10 py-5 bg-[var(--game-primary)] text-white rounded-3xl font-black text-2xl shadow-xl border-b-8 border-[#46a302] hover:scale-105 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-3"
                  >
                     <Play fill="currentColor" /> PLAY & LEARN
                  </Link>
               </div>

               <div className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl shadow-xl border-4 border-b-8 border-indigo-700">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-3 bg-white/20 rounded-2xl shadow-inner"><Star size={32} fill="currentColor" /></div>
                     <span className="text-xl font-black bg-white/20 px-4 py-1 rounded-full uppercase tracking-widest text-sm">Level {gStats.level}</span>
                  </div>
                  <h3 className="text-3xl font-black mb-2 uppercase tracking-wide">{gStats.xp >= 1000 ? "Advanced Learner" : "Rising Star"}</h3>
                  <p className="text-white/80 font-bold mb-4">Master {1000 - (gStats.xp % 1000)} more XP to reach Level {gStats.level + 1}!</p>
                  <div className="w-full bg-black/20 h-4 rounded-full overflow-hidden border-2 border-white/10 shadow-inner">
                     <div className="bg-yellow-400 h-full transition-all duration-1000" style={{ width: `${(gStats.xp % 1000) / 10}%` }}></div>
                  </div>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
               {/* Joined Classes */}
               <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900 dark:text-blue-300"><BookOpen size={24} /></div>
                     <span className="text-2xl font-bold">{dashboardData.activeClasses?.count || 0}</span>
                  </div>
                  <h3 className="font-semibold text-[var(--text-secondary)]">Active Classes</h3>
                  <p className="text-xs text-[var(--accent-primary)] mt-1 font-medium">+1 new material</p>
               </div>

               {/* Pending Invites */}
               <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-2 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900 dark:text-orange-300"><Bell size={24} /></div>
                     <span className="text-2xl font-bold">{dashboardData.pendingInvites?.count || 0}</span>
                  </div>
                  <h3 className="font-semibold text-[var(--text-secondary)]">Pending Invites</h3>
                  <p className="text-xs text-orange-500 mt-1 font-medium">Action required</p>
               </div>

               {/* Progress Summary */}
               <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900 dark:text-green-300"><TrendingUp size={24} /></div>
                     <span className="text-2xl font-bold">{dashboardData.weeklyGoal?.progress || 0}%</span>
                  </div>
                  <h3 className="font-semibold text-[var(--text-secondary)]">Weekly Goal</h3>
                  <p className="text-xs text-green-500 mt-1 font-medium">On track</p>
               </div>
            </div>

            {/* Content Section */}
            <div className="grid md:grid-cols-3 gap-8">

               <div className="md:col-span-2 space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                     <Clock size={20} className="text-[var(--text-secondary)]" /> Quick Actions
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <Link to="/student/classroom" className="p-6 bg-[var(--bg-primary)] rounded-xl shadow border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all group flex flex-col gap-3">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors dark:bg-blue-900 dark:text-blue-200">
                           <BookOpen size={24} />
                        </div>
                        <div>
                           <h3 className="font-bold text-lg">My Classroom</h3>
                           <p className="text-sm text-[var(--text-secondary)]">Continue your lessons</p>
                        </div>
                     </Link>

                     <Link to="/student/assessment" className="p-6 bg-[var(--bg-primary)] rounded-xl shadow border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all group flex flex-col gap-3">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors dark:bg-purple-900 dark:text-purple-200">
                           <ClipboardCheck size={24} />
                        </div>
                        <div>
                           <h3 className="font-bold text-lg">Take Assessment</h3>
                           <p className="text-sm text-[var(--text-secondary)]">Test your knowledge</p>
                        </div>
                     </Link>

                     <Link to="/student/report" className="p-6 bg-[var(--bg-primary)] rounded-xl shadow border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all group flex flex-col gap-3">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors dark:bg-green-900 dark:text-green-200">
                           <BarChart2 size={24} />
                        </div>
                        <div>
                           <h3 className="font-bold text-lg">View Report</h3>
                           <p className="text-sm text-[var(--text-secondary)]">Check your progress</p>
                        </div>
                     </Link>
                  </div>

                  <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
                     <h2 className="text-xl font-bold mb-4 flex items-center gap-2">Recent Activity</h2>
                     <div className="space-y-4">
                        {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                           <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center dark:bg-slate-800">
                                 <CheckCircle size={18} className="text-green-500" />
                              </div>
                              <div className="flex-1">
                                 <h4 className="font-bold text-[var(--text-primary)]">
                                    {activity.title}
                                 </h4>
                                 <p className="text-xs text-[var(--text-secondary)]">{activity.time || 'Recently'}</p>
                              </div>
                           </div>
                        )) : <p className="text-center text-[var(--text-secondary)]">No recent activity.</p>}
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl shadow-lg border border-green-100 dark:from-slate-800 dark:to-slate-700">
                     <h2 className="text-xl font-bold mb-4 text-green-800 dark:text-green-300">{dailyTip.title || 'Daily Tip'} 💡</h2>
                     <p className="text-slate-700 mb-4 text-sm dark:text-slate-300">
                        {dailyTip.content || dailyTip.tip || "Keep learning every day!"}
                     </p>
                  </div>

                  <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
                     <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 dark:bg-indigo-900 dark:text-indigo-200">
                        <Accessibility size={20} />
                     </div>
                     <h3 className="font-bold text-lg mb-2">Learn Your Way</h3>
                     <p className="text-sm text-[var(--text-secondary)]">
                        You can listen instead of read, speak instead of type, and learn your way.
                     </p>
                     <button
                        onClick={() => window.dispatchEvent(new Event('open-a11y-toolbar'))}
                        className="mt-4 text-sm font-bold text-[var(--accent-primary)] hover:underline"
                     >
                        Open Tools
                     </button>
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
};

export default Dashboard;
