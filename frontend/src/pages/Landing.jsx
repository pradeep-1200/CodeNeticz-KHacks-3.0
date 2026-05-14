import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Layout, ArrowRight, Volume2, Target, Accessibility, Settings } from 'lucide-react';

const Landing = () => {
  const openAccessibilityToolbar = () => {
     window.dispatchEvent(new Event('open-a11y-toolbar'));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      
      {/* Header */}
      <header className="p-6 flex flex-col md:flex-row justify-between items-center border-b border-[var(--border-color)] gap-4">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <BookOpen size={32} className="text-blue-600" />
          <span className="text-blue-600 text-center md:text-left">Adaptive Cognitive Learning</span>
          <span className="text-green-600">Classroom</span>
        </div>
        
        <div className="flex items-center gap-4">
           <Link 
             to="/login"
             className="px-5 py-2 text-blue-600 font-bold hover:bg-blue-50 rounded-full transition-colors"
           >
             Login
           </Link>
           <Link 
             to="/register"
             className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
           >
             Register
           </Link>
           <button
             onClick={openAccessibilityToolbar}
             className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
             title="Settings / Accessibility"
           >
             <Settings size={24} />
           </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-bold text-sm mb-2 border border-green-200">
             ✨ This platform supports audio learning, flexible reading, and personalized pacing.
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-[var(--text-primary)]">
            Accessible Learning <br />
            <span className="text-blue-600">For Everyone</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            A cognitive-friendly learning platform designed for students with diverse needs. 
            Experience inclusive education with adaptive tools, clear layouts, and supportive features.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
             <Link 
              to="/login"
              className="px-8 py-4 bg-blue-600 text-white text-lg rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              Get Started <ArrowRight />
            </Link>
             <button
              onClick={openAccessibilityToolbar}
              className="px-8 py-4 bg-white text-green-700 border-2 border-green-500 text-lg rounded-xl font-bold shadow-md hover:shadow-lg hover:bg-green-50 transition-all flex items-center gap-2"
            >
              <Accessibility size={20} /> Try Accessibility Tools
            </button>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
            {/* Visual Representation */}
            <div className="w-full max-w-md aspect-square bg-gradient-to-tr from-blue-50 to-green-50 rounded-[3rem] shadow-inner flex items-center justify-center relative overflow-hidden border border-white/50">
               <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
               <div className="bg-white p-8 rounded-2xl shadow-xl z-10 max-w-xs animate-bounce-slow border border-blue-100">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Users size={24} />
                     </div>
                     <div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-16 bg-gray-100 rounded"></div>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="h-3 w-full bg-gray-100 rounded"></div>
                     <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
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
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 dark:bg-blue-900 dark:text-blue-300">
                     <Volume2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Audio-First Learning</h3>
                  <p className="text-[var(--text-secondary)]">
                     Listen to your lessons with high-quality text-to-speech support for every page.
                  </p>
               </div>

               {/* Feature 2 */}
               <div className="p-8 bg-[var(--bg-primary)] rounded-2xl shadow-lg hover:-translate-y-2 transition-transform border border-transparent hover:border-[var(--border-color)]">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 dark:bg-green-900 dark:text-green-300">
                     <Target size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Adaptive Assessments</h3>
                  <p className="text-[var(--text-secondary)]">
                     Tests that adjust to your comfort level. No pressure, just progress.
                  </p>
               </div>

               {/* Feature 3 */}
               <div className="p-8 bg-[var(--bg-primary)] rounded-2xl shadow-lg hover:-translate-y-2 transition-transform border border-transparent hover:border-[var(--border-color)]">
                  <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 dark:bg-purple-900 dark:text-purple-300">
                     <Accessibility size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Accessibility-First</h3>
                  <p className="text-[var(--text-secondary)]">
                     Designed for high contrast, easy reading, and anxiety-free navigation.
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
