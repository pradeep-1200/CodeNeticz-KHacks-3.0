import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useGamification } from '../../context/GamificationContext';
import { useAuthStore } from '../../store/authStore';
import { useAdaptive } from '../../context/AdaptiveContext';
import { getDashboardData, respondToInvite } from '../../services/api';
import { 
   BookOpen, Bell, Star, TrendingUp, ArrowRight, CheckCircle, Clock, 
   Accessibility, BarChart2, ClipboardCheck, Flame, Trophy, Play, Sparkles, Mic, Target, Mail, Check, X
} from 'lucide-react';

const Dashboard = () => {
   const [data, setData] = useState(null);
   const { stats } = useGamification();
   const { isPrelimsCompleted, profile } = useAdaptive();
   const user = useAuthStore(s => s.user);
   const navigate = useNavigate();
   const gStats = stats || { xp: 0, level: 1, streak: 0, completedLevels: [] };

   useEffect(() => {
      loadData();
   }, []);

   const loadData = async () => {
      try {
         const result = await getDashboardData();
         setData(result);
      } catch (err) {
         console.error("Dashboard fetch error:", err);
      }
   };

   const handleInviteAction = async (inviteId, status) => {
      try {
         const res = await respondToInvite(inviteId, status);
         if (res.success) {
            alert(status === 'accepted' ? "Classroom joined!" : "Invitation declined.");
            loadData();
         }
      } catch (err) {
         console.error(err);
      }
   };

   const dashboardData = data?.stats || { activeClasses: { count: 0 }, pendingInvites: { count: 0 }, weeklyGoal: { progress: 0 } };
   const pendingInvitesList = data?.pendingInvitesList || [];
   const activeClassesList = data?.activeClassesList || [];
   const recentActivity = data?.recentActivity || [];
   const dailyTip = data?.dailyTip || { title: "Daily Study Tip", content: "Break down complex tasks into smaller 15-minute chunks for better cognitive retention!" };

   const currentXp = gStats.xp || user?.xp || 0;
   const currentLevel = gStats.level || user?.level || 1;
   const currentStreak = gStats.streak || user?.streak || 0;
   const xpProgress = (currentXp % 1000) / 10; // 0 to 100%

   return (
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
         <Navbar />

         <main className="container mx-auto px-4 md:px-8 py-8 space-y-8 max-w-7xl animate-fade-in-up">
            
            {/* PENDING CLASSROOM INVITATION BANNER */}
            {(pendingInvitesList || []).length > 0 && (
               <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-purple-500/20 border-2 border-amber-500/40 p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-4">
                  <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 font-extrabold text-sm uppercase tracking-wider">
                     <Mail size={20} /> Action Required: Class Invitation Received
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                     {(pendingInvitesList || []).map(invite => (
                        <div key={invite._id} className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-color)] flex justify-between items-center shadow-md">
                           <div>
                              <h3 className="font-extrabold text-lg text-[var(--text-primary)]">{invite.classId?.name || 'Classroom Invite'}</h3>
                              <p className="text-xs text-[var(--text-secondary)]">Subject: {invite.classId?.subject || 'General'} • Instructor: {invite.teacherId?.name || 'Faculty'}</p>
                           </div>
                           <div className="flex gap-2">
                              <button onClick={() => handleInviteAction(invite._id, 'accepted')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-md transition-all hover:scale-105">
                                 <Check size={14} /> Accept & Join
                              </button>
                              <button onClick={() => handleInviteAction(invite._id, 'rejected')} className="px-3 py-2 bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-red-500/10 hover:text-red-500 font-bold rounded-xl text-xs transition-colors">
                                 Decline
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Prelims Assessment Banner (If not completed) */}
            {!isPrelimsCompleted && (
               <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-white/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 card-hover-lift">
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="space-y-2 max-w-2xl">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
                        <Target size={14} /> Personalized AI Learning
                     </span>
                     <h2 className="text-2xl md:text-3xl font-black tracking-tight">Set Up Your Cognitive Adaptive Environment</h2>
                     <p className="text-indigo-100 font-medium text-sm md:text-base">
                        Take our 3-minute Prelims Assessment to auto-tune your text-spacing, voice controls, and color contrast.
                     </p>
                  </div>
                  <button 
                     onClick={() => navigate('/student/prelims')}
                     className="w-full md:w-auto px-8 py-4 bg-white text-indigo-700 font-extrabold rounded-2xl shadow-xl hover:bg-indigo-50 hover:scale-105 transition-all whitespace-nowrap text-base flex items-center justify-center gap-2"
                  >
                     <Sparkles size={18} /> Start Assessment
                  </button>
               </div>
            )}

            {/* Welcome & Gamified Banner Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* Hero Banner */}
               <div className="lg:col-span-2 bg-[var(--bg-surface)] p-6 md:p-8 rounded-3xl shadow-lg border border-[var(--border-color)] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 relative overflow-hidden card-hover-lift">
                  <div className="space-y-3 z-10">
                     <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <Sparkles size={14} /> Welcome back
                     </div>
                     <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                        Keep pushin', {user?.name || 'Champ'}! 👋
                     </h1>
                     <p className="text-[var(--text-secondary)] font-medium text-base md:text-lg max-w-lg">
                        Your personalized learning journey is active. Ready for your next interactive level?
                     </p>
                     
                     <div className="flex flex-wrap gap-3 pt-2">
                        <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-2xl font-extrabold border border-amber-500/20 text-sm">
                           <Flame size={20} fill="currentColor" /> {currentStreak} Day Streak
                        </div>
                        <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-2xl font-extrabold border border-indigo-500/20 text-sm">
                           <Trophy size={20} /> {currentXp} total XP
                        </div>
                     </div>
                  </div>

                  <Link
                     to="/student/learn-path"
                     className="w-full md:w-auto px-8 py-5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-green-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border border-emerald-400/30 whitespace-nowrap z-10"
                  >
                     <Play fill="currentColor" size={24} /> PLAY & LEARN
                  </Link>
               </div>

               {/* Level Card */}
               <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white rounded-3xl shadow-xl border border-indigo-400/30 flex flex-col justify-between relative overflow-hidden card-hover-lift">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl shadow-inner border border-white/20">
                        <Star size={28} fill="currentColor" className="text-amber-300" />
                     </div>
                     <span className="text-xs font-black bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-white/20">
                        Level {currentLevel}
                     </span>
                  </div>

                  <div>
                     <h3 className="text-2xl md:text-3xl font-black mb-1 tracking-tight">
                        {currentXp >= 1000 ? "Advanced Scholar" : "Rising Star"}
                     </h3>
                     <p className="text-indigo-100 font-medium text-sm mb-4">
                        Earn {1000 - (currentXp % 1000)} more XP to level up!
                     </p>
                     
                     <div className="w-full bg-black/30 h-3.5 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
                        <div 
                           className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-1000 shadow-sm" 
                           style={{ width: `${Math.max(5, xpProgress)}%` }}
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Metric Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-6 bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-[var(--border-color)] card-hover-lift">
                  <div className="flex justify-between items-start mb-3">
                     <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl"><BookOpen size={24} /></div>
                     <span className="text-3xl font-black">{dashboardData.activeClasses?.count || 0}</span>
                  </div>
                  <h3 className="font-extrabold text-[var(--text-primary)]">Enrolled Classes</h3>
                  <p className="text-xs text-blue-600 font-bold mt-1">Active coursework</p>
               </div>

               <div className="p-6 bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-[var(--border-color)] card-hover-lift">
                  <div className="flex justify-between items-start mb-3">
                     <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl"><Bell size={24} /></div>
                     <span className="text-3xl font-black">{dashboardData.pendingInvites?.count || 0}</span>
                  </div>
                  <h3 className="font-extrabold text-[var(--text-primary)]">Class Invitations</h3>
                  <p className="text-xs text-amber-600 font-bold mt-1">
                     {dashboardData.pendingInvites?.count > 0 ? 'Pending acceptance' : 'Up to date'}
                  </p>
               </div>

               <div className="p-6 bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-[var(--border-color)] card-hover-lift">
                  <div className="flex justify-between items-start mb-3">
                     <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl"><TrendingUp size={24} /></div>
                     <span className="text-3xl font-black">{dashboardData.weeklyGoal?.progress || 0}%</span>
                  </div>
                  <h3 className="font-extrabold text-[var(--text-primary)]">Weekly Goal Progress</h3>
                  <p className="text-xs text-emerald-600 font-bold mt-1">Target 100 XP/week</p>
               </div>
            </div>

            {/* ENROLLED CLASSES QUICK DISPLAY */}
            {(activeClassesList || []).length > 0 && (
               <div>
                  <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 tracking-tight">
                     <BookOpen size={20} className="text-indigo-600" /> Enrolled Classrooms
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                     {(activeClassesList || []).map(cls => (
                        <div key={cls._id} onClick={() => navigate('/student/classroom')} className="bg-[var(--bg-surface)] p-5 rounded-2xl shadow-sm border border-[var(--border-color)] hover:border-indigo-500/50 cursor-pointer transition-all card-hover-lift">
                           <h3 className="font-black text-lg text-[var(--text-primary)] mb-1">{cls.name}</h3>
                           <p className="text-xs text-[var(--text-secondary)] font-semibold">Subject: {cls.subject}</p>
                           <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-3 flex items-center gap-1">
                              View Classwork <ArrowRight size={12} />
                           </p>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Quick Actions & Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

               <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-xl font-extrabold flex items-center gap-2 tracking-tight">
                     <Clock size={20} className="text-indigo-600" /> Navigation Shortcuts
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <Link to="/student/classroom" className="p-5 bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:border-blue-500/50 transition-all group flex flex-col justify-between gap-4 card-hover-lift">
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                           <BookOpen size={24} />
                        </div>
                        <div>
                           <h3 className="font-bold text-lg text-[var(--text-primary)]">Classroom</h3>
                           <p className="text-xs text-[var(--text-secondary)]">View materials & tasks</p>
                        </div>
                     </Link>

                     <Link to="/student/assessment" className="p-5 bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:border-purple-500/50 transition-all group flex flex-col justify-between gap-4 card-hover-lift">
                        <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                           <ClipboardCheck size={24} />
                        </div>
                        <div>
                           <h3 className="font-bold text-lg text-[var(--text-primary)]">Assessment</h3>
                           <p className="text-xs text-[var(--text-secondary)]">Test knowledge</p>
                        </div>
                     </Link>

                     <Link to="/student/report" className="p-5 bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:border-emerald-500/50 transition-all group flex flex-col justify-between gap-4 card-hover-lift">
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                           <BarChart2 size={24} />
                        </div>
                        <div>
                           <h3 className="font-bold text-lg text-[var(--text-primary)]">Progress Report</h3>
                           <p className="text-xs text-[var(--text-secondary)]">Analytics & Trends</p>
                        </div>
                     </Link>
                  </div>

                  <div className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)]">
                     <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                        <CheckCircle size={20} className="text-emerald-500" /> Recent Activity Feed
                     </h2>
                     <div className="space-y-3">
                        {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                           <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] hover:border-indigo-500/30 transition-all">
                              <div className="w-9 h-9 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                 <CheckCircle size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-sm text-[var(--text-primary)] truncate">
                                    {activity.title || activity.description || 'Completed Activity'}
                                 </h4>
                                 <p className="text-xs text-[var(--text-secondary)]">{activity.time || 'Recently'}</p>
                              </div>
                           </div>
                        )) : (
                           <div className="text-center py-6 text-sm text-[var(--text-secondary)]">
                              No recent activities logged yet. Take a quiz or finish a lesson!
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Right Side Assistive & Adaptive Cards */}
               <div className="space-y-6">
                  
                  {/* Daily Tip Card */}
                  <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 rounded-2xl border border-indigo-500/20 card-hover-lift">
                     <h2 className="text-lg font-black mb-2 text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                        💡 {dailyTip.title || 'Daily Learning Tip'}
                     </h2>
                     <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                        {dailyTip.content || dailyTip.tip || "Keep learning every day!"}
                     </p>
                  </div>

                  {/* Accessibility Quick Access */}
                  <div className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)] card-hover-lift">
                     <div className="w-10 h-10 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center mb-3">
                        <Accessibility size={22} />
                     </div>
                     <h3 className="font-extrabold text-lg mb-1">Accessibility Controls</h3>
                     <p className="text-xs text-[var(--text-secondary)] mb-4">
                        Adjust text size, line spacing, dark mode, or voice tools anytime.
                     </p>
                     <button
                        onClick={() => window.dispatchEvent(new Event('open-a11y-toolbar'))}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                     >
                        Open Control Panel
                     </button>
                  </div>

               </div>

            </div>

         </main>
      </div>
   );
};

export default Dashboard;
