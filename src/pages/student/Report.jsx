import React from 'react';
import Navbar from '../../components/Navbar';
import ProgressChart from '../../components/ProgressChart';
import { Award, Zap, Target, TrendingUp, CheckCircle, Info } from 'lucide-react';

const Report = () => {
  const improvementData = [
    { subject: 'Math', score: 65, improved: 85 },
    { subject: 'Science', score: 70, improved: 75 },
    { subject: 'History', score: 60, improved: 80 },
    { subject: 'English', score: 75, improved: 88 },
  ];

  const skillData = [
     { name: 'Week 1', progress: 40 },
     { name: 'Week 2', progress: 55 },
     { name: 'Week 3', progress: 60 },
     { name: 'Week 4', progress: 85 },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 py-8 space-y-8">
         
         <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div>
               <h1 className="text-3xl font-bold">Your Learning Journey</h1>
               <p className="text-[var(--text-secondary)]">See how far you've come!</p>
            </div>
            <div className="px-6 py-3 bg-[var(--bg-primary)] rounded-full border border-[var(--border-color)] shadow-sm flex items-center gap-2">
               <Award className="text-yellow-500" />
               <span className="font-bold">Current Streak: 5 Days</span>
            </div>
         </div>

         {/* Strength & Focus Cards */}
         <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl border border-green-200 dark:border-green-800">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-800 dark:text-green-300">
                  <Zap size={24}/> Top Strengths
               </h3>
               <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                     <CheckCircle size={18} className="text-green-600"/> 
                     <span>Visual Pattern Recognition</span>
                  </li>
                  <li className="flex items-center gap-2">
                     <CheckCircle size={18} className="text-green-600"/> 
                     <span>Auditory Listening Skills</span>
                  </li>
                  <li className="flex items-center gap-2">
                     <CheckCircle size={18} className="text-green-600"/> 
                     <span>Creative Problem Solving</span>
                  </li>
               </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-200 dark:border-blue-800">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  <Target size={24}/> Areas to Explore
               </h3>
               <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                     <Info size={18} className="text-blue-600"/> 
                     <span>Reading Comprehension Speed</span>
                  </li>
                  <li className="flex items-center gap-2">
                     <Info size={18} className="text-blue-600"/> 
                     <span>Complex Arithmetic</span>
                  </li>
               </ul>
            </div>
         </div>

         {/* Charts Section */}
         <div className="grid md:grid-cols-2 gap-8">
            
            {/* Subject Improvement */}
            <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
               <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <TrendingUp size={20}/> Subject Performance
               </h3>
               <div className="h-[300px] w-full">
                  <ProgressChart type="bar" data={improvementData} xKey="subject" dataKey="improved" color="var(--accent-primary)" />
               </div>
               <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
                  Showing your best scores across subjects.
               </p>
            </div>

            {/* Monthly Progress */}
            <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
               <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Award size={20}/> Monthly Growth
               </h3>
               <div className="h-[300px] w-full">
                  <ProgressChart type="area" data={skillData} xKey="name" dataKey="progress" color="#8b5cf6" />
               </div>
               <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
                  Consistent effort over the last 4 weeks.
               </p>
            </div>

         </div>

      </main>
    </div>
  );
};

export default Report;
