import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { 
  FileText, Video, Mic, Heart, MessageSquare, Send, 
  MoreVertical, Lock, Globe, Volume2, Scissors, Bookmark, 
  ThumbsUp, BarChart2, CheckCircle, Accessibility
} from 'lucide-react';

const Classroom = () => {
  const [activeTab, setActiveTab] = useState('materials');
  const [privateComment, setPrivateComment] = useState(false);
  const [commentText, setCommentText] = useState('');

  const materials = [
    { 
      id: 1, 
      title: 'Introduction to Photosynthesis', 
      desc: 'Watch this video to understand the basic process of turning light into energy.',
      type: 'video', 
      date: 'Oct 24', 
      likes: 12 
    },
    { 
      id: 2, 
      title: 'Chapter 4: Cell Structure.pdf', 
      desc: 'Read pages 12-15 covering mitochondria and nucleus functions.',
      type: 'pdf', 
      date: 'Oct 23', 
      likes: 5 
    },
    { 
      id: 3, 
      title: 'Audio Summary: Week 3', 
      desc: 'A quick recap of last week\'s biology lessons.',
      type: 'audio', 
      date: 'Oct 22', 
      likes: 8 
    },
  ];

  // Dummy Accessibility Actions
  const handleReadAloud = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Reading: " + text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 py-6 space-y-8 max-w-4xl">
        
        {/* A - Classroom Header */}
        <section className="bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
           <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-b border-[var(--border-color)]">
              <div className="flex flex-col gap-4">
                 <div className="inline-flex items-center gap-2 self-start px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                    <Accessibility size={12} /> Accessibility & audio support enabled
                 </div>
                 <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Biology 101: Life Sciences</h1>
                    <p className="text-lg text-[var(--text-secondary)] mt-1">Teacher: Mr. Anderson</p>
                 </div>
              </div>
           </div>
           
           {/* Section Tabs */}
           <div className="flex bg-[var(--bg-primary)] p-2 gap-2 overflow-x-auto">
              {['materials', 'assessments', 'progress'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm capitalize transition-all ${
                      activeTab === tab 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                   }`}
                 >
                    {tab}
                 </button>
              ))}
           </div>
        </section>

        {/* B - Study Materials Feed */}
        <section className="space-y-6">
           {activeTab === 'materials' && materials.map((item) => (
             <article key={item.id} className="bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] transition-all hover:shadow-md">
                
                {/* Card Header & Content */}
                <div className="p-6">
                   <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-4">
                         <div className={`p-3 rounded-full h-fit ${
                            item.type === 'video' ? 'bg-red-100 text-red-600' : 
                            item.type === 'pdf' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                         } dark:bg-slate-800`}>
                            {item.type === 'video' ? <Video size={24}/> : item.type === 'pdf' ? <FileText size={24}/> : <Mic size={24}/>}
                         </div>
                         <div>
                            <h3 className="font-bold text-xl text-[var(--text-primary)]">{item.title}</h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-2">Posted {item.date}</p>
                            <span className="inline-block px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded border border-[var(--border-color)] uppercase tracking-wide font-semibold">
                               {item.type}
                            </span>
                         </div>
                      </div>
                      <button className="text-[var(--text-secondary)] p-2 hover:bg-[var(--bg-secondary)] rounded-full">
                         <MoreVertical size={20}/>
                      </button>
                   </div>

                   <p className="text-[var(--text-primary)] mb-6 leading-relaxed">
                      {item.desc}
                   </p>

                   {/* Inline Accessibility Controls */}
                   <div className="flex flex-wrap gap-3 mb-6 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                      <button 
                        onClick={() => handleReadAloud(item.title + ". " + item.desc)}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-[var(--border-color)] rounded-lg text-sm font-semibold hover:border-blue-400 hover:text-blue-600 transition-colors"
                        title="Read this content aloud"
                      >
                         <Volume2 size={16}/> Read Aloud
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-[var(--border-color)] rounded-lg text-sm font-semibold hover:border-green-400 hover:text-green-600 transition-colors">
                         <Scissors size={16}/> Simplify Text
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-[var(--border-color)] rounded-lg text-sm font-semibold hover:border-purple-400 hover:text-purple-600 transition-colors">
                         <Bookmark size={16}/> Key Points
                      </button>
                   </div>
                </div>

                {/* C - Interaction System */}
                <div className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                   {/* Reactions Bar */}
                   <div className="px-6 py-3 flex items-center justify-between border-b border-[var(--border-color)]">
                      <div className="flex items-center gap-6">
                         <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-blue-600 font-bold text-sm transition-colors">
                            <ThumbsUp size={18} /> Like ({item.likes})
                         </button>
                         <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-blue-600 font-bold text-sm transition-colors">
                            <MessageSquare size={18} /> Comment
                         </button>
                      </div>
                   </div>

                   {/* Commment Input */}
                   <div className="p-6">
                      <div className="flex items-center gap-3">
                         <div className="flex-1 relative">
                            <input 
                               type="text" 
                               placeholder={privateComment ? "Message teacher privately..." : "Share with the class..."}
                               className="w-full pl-4 pr-12 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                               value={commentText}
                               onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300">
                               <Send size={16} />
                            </button>
                         </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                         <button 
                            onClick={() => setPrivateComment(!privateComment)}
                            className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                               privateComment ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                            }`}
                         >
                            {privateComment ? <Lock size={12}/> : <Globe size={12}/>}
                            {privateComment ? 'Private (Teacher Only)' : 'Public'}
                         </button>
                         <span className="text-xs text-[var(--text-secondary)] italic">
                            Tip: You can type or speak your comment.
                         </span>
                      </div>
                   </div>
                </div>

             </article>
           ))}

           {activeTab !== 'materials' && (
              <div className="p-12 text-center text-[var(--text-secondary)] bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]">
                 <p className="text-lg">Select 'Materials' to view class content.</p>
              </div>
           )}
        </section>

        {/* D - Progress Snapshot */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                 <BarChart2 size={32} className="text-white" />
              </div>
              <div>
                 <h3 className="text-xl font-bold">Your Progress</h3>
                 <p className="text-indigo-100 text-sm">Consistency matters more than speed.</p>
              </div>
           </div>
           
           <div className="flex-1 w-full md:max-w-xs">
              <div className="flex justify-between text-xs font-bold mb-2 text-indigo-100 uppercase tracking-widest">
                 <span>Materials Viewed</span>
                 <span>8/10</span>
              </div>
              <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden">
                 <div className="bg-green-400 h-full w-[80%] rounded-full"></div>
              </div>
           </div>
           
           <button className="px-6 py-2 bg-white text-indigo-700 font-bold rounded-lg shadow hover:bg-indigo-50 transition-colors text-sm">
              View Full Report
           </button>
        </section>

      </main>
    </div>
  );
};

export default Classroom;
