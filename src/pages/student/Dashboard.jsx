import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { BookOpen, Bell, Star, TrendingUp, ArrowRight, CheckCircle, Clock } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-lg border border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl font-bold mb-2">Welcome back, Student! 👋</h1>
             <p className="text-[var(--text-secondary)]">You are making great progress. Ready to learn something new today?</p>
          </div>
          <div className="flex gap-4">
             <Link to="/student/classroom" className="px-6 py-3 bg-[var(--accent-primary)] text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2">
                <BookOpen size={20}/> Go to Classroom
             </Link>
             <Link to="/student/assessment" className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                <CheckCircle size={20}/> Take Assessment
             </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
           
           {/* Current Level */}
           <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-white/20 rounded-lg"><Star size={24} /></div>
                 <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded">Level 5</span>
              </div>
              <h3 className="text-2xl font-bold">Intermediate</h3>
              <p className="text-white/80 text-sm mt-1">1200 XP to next level</p>
              <div className="w-full bg-black/20 h-2 rounded-full mt-4 overflow-hidden">
                 <div className="bg-yellow-400 h-full w-[70%]"></div>
              </div>
           </div>

           {/* Joined Classes */}
           <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900 dark:text-blue-300"><BookOpen size={24} /></div>
                 <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="font-semibold text-[var(--text-secondary)]">Active Classes</h3>
              <p className="text-xs text-[var(--accent-primary)] mt-1 font-medium">+1 new material</p>
           </div>

           {/* Pending Invites */}
           <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900 dark:text-orange-300"><Bell size={24} /></div>
                 <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold text-[var(--text-secondary)]">Pending Invites</h3>
              <p className="text-xs text-orange-500 mt-1 font-medium">Action required</p>
           </div>

           {/* Progress Summary */}
           <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900 dark:text-green-300"><TrendingUp size={24} /></div>
                 <span className="text-2xl font-bold">85%</span>
              </div>
              <h3 className="font-semibold text-[var(--text-secondary)]">Weekly Goal</h3>
              <p className="text-xs text-green-500 mt-1 font-medium">On track</p>
           </div>
        </div>

        {/* Content Section */}
        <div className="grid md:grid-cols-3 gap-8">
           
           {/* Recent Activity */}
           <div className="md:col-span-2 bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <Clock size={20} className="text-[var(--text-secondary)]"/> Recent Activity
              </h2>
              <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors border border-transparent hover:border-[var(--border-color)]">
                       <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center dark:bg-slate-800">
                          {i === 1 ? <BookOpen size={20} className="text-blue-500"/> : i === 2 ? <CheckCircle size={20} className="text-green-500"/> : <Star size={20} className="text-yellow-500"/>}
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-[var(--text-primary)]">
                             {i === 1 ? "Mathematics: Algebra Basics" : i === 2 ? "Completed Assessment: Science" : "Earned Badge: Early Bird"}
                          </h4>
                          <p className="text-sm text-[var(--text-secondary)]">2 hours ago</p>
                       </div>
                       <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)]">
                          <ArrowRight size={20} />
                       </button>
                    </div>
                 ))}
              </div>
           </div>

           {/* Quick Actions / Tips */}
           <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700">
                 <h2 className="text-xl font-bold mb-4">Daily Tip 💡</h2>
                 <p className="text-[var(--text-secondary)] mb-4">
                    Taking breaks improves focus! Try the "20-20-20" rule: Every 20 minutes, look at something 20 feet away for 20 seconds.
                 </p>
                 <button className="w-full py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-600 rounded-lg font-semibold text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors">
                    Read More
                 </button>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
