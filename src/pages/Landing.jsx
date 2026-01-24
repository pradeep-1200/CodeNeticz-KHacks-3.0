import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Layout, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 text-2xl font-bold text-[var(--accent-primary)]">
          <BookOpen size={32} />
          <span>ACLC</span>
        </div>
        <Link 
          to="/login"
          className="px-6 py-2 bg-[var(--accent-primary)] text-white rounded-full font-semibold hover:opacity-90 transition-all focus:ring-4 ring-blue-300"
        >
          Login
        </Link>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-[var(--text-primary)]">
            Accessible Learning <br />
            <span className="text-[var(--accent-primary)]">For Everyone</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            A cognitive-friendly learning platform designed for students with diverse needs. 
            Experience inclusive education with adaptive tools, clear layouts, and supportive features.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
             <Link 
              to="/login"
              className="px-8 py-4 bg-[var(--accent-primary)] text-white text-lg rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              Get Started <ArrowRight />
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
            {/* Abstract Visual Representation instead of Image for MVP */}
            <div className="w-full max-w-md aspect-square bg-gradient-to-tr from-blue-100 to-green-100 rounded-[3rem] shadow-inner flex items-center justify-center relative overflow-hidden dark:from-slate-800 dark:to-slate-700">
               <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/50"></div>
               <div className="bg-white p-8 rounded-2xl shadow-xl z-10 max-w-xs animate-bounce-slow dark:bg-slate-800 dark:border dark:border-slate-600">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        <Users size={24} />
                     </div>
                     <div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-2 dark:bg-slate-600"></div>
                        <div className="h-3 w-16 bg-gray-100 rounded dark:bg-slate-700"></div>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="h-3 w-full bg-gray-100 rounded dark:bg-slate-700"></div>
                     <div className="h-3 w-5/6 bg-gray-100 rounded dark:bg-slate-700"></div>
                  </div>
               </div>
            </div>
        </div>
      </main>

      {/* Feature Highlights */}
      <section className="bg-[var(--bg-secondary)] py-16 transition-colors duration-300">
         <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-[var(--text-primary)]">Why Choose Us?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
               {/* Feature 1 */}
               <div className="p-8 bg-[var(--bg-primary)] rounded-2xl shadow-lg hover:-translate-y-2 transition-transform border border-transparent hover:border-[var(--border-color)]">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 dark:bg-green-900 dark:text-green-300">
                     <Layout size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Clear Interface</h3>
                  <p className="text-[var(--text-secondary)]">
                     Distraction-free design with calmness in mind. High contrast and simple navigation.
                  </p>
               </div>

               {/* Feature 2 */}
               <div className="p-8 bg-[var(--bg-primary)] rounded-2xl shadow-lg hover:-translate-y-2 transition-transform border border-transparent hover:border-[var(--border-color)]">
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 dark:bg-blue-900 dark:text-blue-300">
                     <BookOpen size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Audio Learning</h3>
                  <p className="text-[var(--text-secondary)]">
                     Integrated text-to-speech and voice controls to help auditory learners.
                  </p>
               </div>

               {/* Feature 3 */}
               <div className="p-8 bg-[var(--bg-primary)] rounded-2xl shadow-lg hover:-translate-y-2 transition-transform border border-transparent hover:border-[var(--border-color)]">
                  <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 dark:bg-purple-900 dark:text-purple-300">
                     <Users size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Inclusive Design</h3>
                  <p className="text-[var(--text-secondary)]">
                     Built for everyone. Customizable text, colors, and controls to suit your needs.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="p-6 text-center text-[var(--text-secondary)] border-t border-[var(--border-color)]">
         <p>© 2026 Adaptive Cognitive Learning Classroom. Built for K Hacks.</p>
      </footer>
    </div>
  );
};

export default Landing;
