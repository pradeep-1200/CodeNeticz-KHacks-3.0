import React from 'react';
import Navbar from '../../components/Navbar';
import { 
  Award, TrendingUp, BookOpen, Mic, Type, 
  ArrowRight, Sparkles, Brain, Layout 
} from 'lucide-react';

const Report = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 py-8 space-y-8 max-w-5xl">
         
         {/* A - Student Overview */}
         <section className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-sm border border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-4xl border-4 border-white dark:border-slate-800 shadow-lg">
                   🎓
                </div>
                <div>
                   <h1 className="text-2xl font-bold mb-1">Student</h1>
                   <p className="text-[var(--text-secondary)]">Class 5-B • Assessment Level 2</p>
                </div>
            </div>
            <div className="text-right">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full font-bold border border-green-200">
                  <Award size={18} /> You’re making steady progress. Keep going! 👍
               </div>
            </div>
         </section>

         {/* B - Learning Progress (Before vs After) */}
         <section className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-lg border border-[var(--border-color)]">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="text-blue-600"/> Improvement with Adaptive Support
             </h2>
             
             <div className="grid md:grid-cols-2 gap-12">
                {/* Before */}
                <div className="space-y-4 opacity-70">
                   <h3 className="font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Before Support Enabled</h3>
                   
                   <div>
                      <div className="flex justify-between text-sm mb-1">
                         <span>Reading Comfort</span>
                         <span>Low</span>
                      </div>
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                         <div className="w-[30%] h-full bg-gray-400"></div>
                      </div>
                   </div>

                   <div>
                      <div className="flex justify-between text-sm mb-1">
                         <span>Concept Clarity</span>
                         <span>Medium</span>
                      </div>
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                         <div className="w-[50%] h-full bg-gray-400"></div>
                      </div>
                   </div>
                </div>

                {/* After */}
                <div className="space-y-4">
                   <h3 className="font-bold text-green-600 uppercase text-xs tracking-wider flex items-center gap-2">
                      <Sparkles size={14}/> Current Progress
                   </h3>
                   
                   <div>
                      <div className="flex justify-between text-sm mb-1 font-bold">
                         <span>Reading Comfort</span>
                         <span className="text-green-600">High</span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-green-100">
                         <div className="w-[85%] h-full bg-gradient-to-r from-green-400 to-green-600"></div>
                      </div>
                   </div>

                   <div>
                      <div className="flex justify-between text-sm mb-1 font-bold">
                         <span>Concept Clarity</span>
                         <span className="text-green-600">Very High</span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-green-100">
                         <div className="w-[92%] h-full bg-gradient-to-r from-green-400 to-green-600"></div>
                      </div>
                   </div>
                </div>
             </div>
         </section>

         {/* C - Learning Preferences & Supports */}
         <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 px-2">
               <Brain className="text-purple-600"/> Your Learning Style
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-[var(--border-color)] shadow-sm hover:translate-y-[-2px] transition-transform">
                   <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <Layout size={24}/>
                   </div>
                   <h3 className="font-bold mb-2">Visual Learner</h3>
                   <p className="text-sm text-[var(--text-secondary)]">
                      You prefer simplified text layouts and clear spacing.
                   </p>
                </div>

                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-[var(--border-color)] shadow-sm hover:translate-y-[-2px] transition-transform">
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <Mic size={24}/>
                   </div>
                   <h3 className="font-bold mb-2">Voice Active</h3>
                   <p className="text-sm text-[var(--text-secondary)]">
                      You frequently use speech-to-text for answering.
                   </p>
                </div>

                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-[var(--border-color)] shadow-sm hover:translate-y-[-2px] transition-transform">
                   <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                      <Type size={24}/>
                   </div>
                   <h3 className="font-bold mb-2">Large Text</h3>
                   <p className="text-sm text-[var(--text-secondary)]">
                      You learn better with 120% text scale enabled.
                   </p>
                </div>
            </div>
         </section>

         {/* D - Next-Step Suggestions */}
         <section className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-8 text-white">
             <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                   <h2 className="text-2xl font-bold mb-2">Recommended Next Steps</h2>
                   <p className="text-indigo-200 max-w-xl">
                      Based on your recent activity, we suggest focusing on these areas to keep your momentum going.
                   </p>
                </div>
                <button className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 whitespace-nowrap">
                   Continue Learning <ArrowRight size={20}/>
                </button>
             </div>

             <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                   <span className="text-xs font-bold text-indigo-300 uppercase">Suggested Focus</span>
                   <p className="font-semibold text-lg mt-1">Short reading passages with audio support</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                   <span className="text-xs font-bold text-indigo-300 uppercase">Practice Mode</span>
                   <p className="font-semibold text-lg mt-1">Concept-based questions instead of timed tests</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                   <span className="text-xs font-bold text-indigo-300 uppercase">Try This</span>
                   <p className="font-semibold text-lg mt-1">Use voice answers for detailed explanations</p>
                </div>
             </div>
         </section>

      </main>
    </div>
  );
};

export default Report;
