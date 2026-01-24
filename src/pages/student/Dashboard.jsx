import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { BookOpen, Bell, Star, TrendingUp, ArrowRight, CheckCircle, Clock, Accessibility, BarChart2, ClipboardCheck } from 'lucide-react';
import { getDashboardData } from '../../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
       const result = await getDashboardData();
       setData(result);
    };
    loadData();
  }, []);

  const profile = data?.profile || { level: 5, levelTitle: "Intermediate", xp: 0, streak: 0 };
  const stats = data?.stats || { activeClasses: 0, pendingInvites: 0, weeklyGoal: 0 };
  const recentActivity = data?.recentActivity || [];
  const dailyTip = data?.dailyTip || { title: "Daily Tip", content: "Loading..." };
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-lg border border-[var(--border-color)]">
           <h1 className="text-3xl font-bold mb-2">Welcome back, Student! 👋</h1>
           <p className="text-[var(--text-secondary)]">
              Learn at your own pace. Adjust the experience anytime using the accessibility tools.
           </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
           
           {/* Current Level */}
           <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-white/20 rounded-lg"><Star size={24} /></div>
                 <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded">Level {profile.level}</span>
              </div>
              <h3 className="text-2xl font-bold">{profile.levelTitle}</h3>
              <p className="text-white/80 text-sm mt-1">You’re improving step by step.</p>
              <div className="w-full bg-black/20 h-2 rounded-full mt-4 overflow-hidden">
                 <div className="bg-yellow-400 h-full" style={{ width: `${(profile.xp / (profile.xp + profile.xpToNextLevel || 100)) * 100}%` }}></div>
              </div>
           </div>

           {/* Joined Classes */}
           <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900 dark:text-blue-300"><BookOpen size={24} /></div>
                 <span className="text-2xl font-bold">{stats.activeClasses}</span>
              </div>
              <h3 className="font-semibold text-[var(--text-secondary)]">Active Classes</h3>
              <p className="text-xs text-[var(--accent-primary)] mt-1 font-medium">+1 new material</p>
           </div>

           {/* Pending Invites */}
           <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900 dark:text-orange-300"><Bell size={24} /></div>
                 <span className="text-2xl font-bold">{stats.pendingInvites}</span>
              </div>
              <h3 className="font-semibold text-[var(--text-secondary)]">Pending Invites</h3>
              <p className="text-xs text-orange-500 mt-1 font-medium">Action required</p>
           </div>

           {/* Progress Summary */}
           <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900 dark:text-green-300"><TrendingUp size={24} /></div>
                 <span className="text-2xl font-bold">{stats.weeklyGoal}%</span>
              </div>
              <h3 className="font-semibold text-[var(--text-secondary)]">Weekly Goal</h3>
              <p className="text-xs text-green-500 mt-1 font-medium">On track</p>
           </div>
        </div>

        {/* Content Section */}
        <div className="grid md:grid-cols-3 gap-8">
           
           {/* Quick Actions (Replaces Recent Activity larger view for MVP focus) */}
           <div className="md:col-span-2 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                 <Clock size={20} className="text-[var(--text-secondary)]"/> Quick Actions
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
                              <CheckCircle size={18} className="text-green-500"/>
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

           {/* Sidebar */}
           <div className="space-y-6">
              
              {/* Daily Tip */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl shadow-lg border border-green-100 dark:from-slate-800 dark:to-slate-700">
                 <h2 className="text-xl font-bold mb-4 text-green-800 dark:text-green-300">{dailyTip.title || 'Daily Tip'} 💡</h2>
                 <p className="text-slate-700 mb-4 text-sm dark:text-slate-300">
                    {dailyTip.content || dailyTip.tip || "Keep learning every day!"}
                 </p>
              </div>

              {/* Accessibility Reminder Card */}
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
