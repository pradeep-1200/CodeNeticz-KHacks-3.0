import React, { useState, useEffect } from 'react';
import { getMaterials } from '../../services/api';
import Navbar from '../../components/Navbar';
import StudyMaterial from '../../components/StudyMaterial';
import { 
  Accessibility, CheckCircle, Clock, Lock, 
  ChevronRight, Users, BookOpen, AlertCircle 
} from 'lucide-react';

const Classroom = () => {
  // State to simulate invite flow (part B)
  // Set to false initially to show the "Accept Invite" flow as requested in Part B,
  // or set to true to show the Full Classroom immediately. 
  // I will default to false so the user can experience the "Accept" action.
  const [isJoined, setIsJoined] = useState(true); 
  
  const [activeTab, setActiveTab] = useState('feed');

  const classroomData = {
    title: "Data Structures – Section A",
    teacher: "Prof. Alan Turing",
    progress: "Stage 2 / 5",
    level: "Level 2: Queue & Stack",
    description: "Master the fundamentals of organizing data efficiently.",
    members: 34
  };

  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      const data = await getMaterials();
      setMaterials(data);
    };
    fetchMaterials();
  }, []);

  const feedItems = [
    { id: 1, text: "📢 Welcome to the Linked Lists module! Please check the study materials for new videos.", date: "Oct 24, 10:00 AM" },
    { id: 2, text: "⏰ Assignment 3 is due tomorrow at 11:59 PM. Don't forget to submit your GitHub links.", date: "Oct 23, 2:00 PM" },
    { id: 3, text: "🎉 Great job on the Array assessment everyone! The class average was 85%.", date: "Oct 21, 9:30 AM" },
  ];

  const students = [
    { id: 1, name: "Alice Johnson", initials: "AJ" },
    { id: 2, name: "Bob Smith", initials: "BS" },
    { id: 3, name: "Charlie Davis", initials: "CD" },
    { id: 4, name: "Dana Lee", initials: "DL" },
    { id: 5, name: "Ethan Hunt", initials: "EH" },
  ];

  const stages = [
    { id: 1, name: "Basics of Arrays", status: "completed" },
    { id: 2, name: "Linked Lists & Pointers", status: "current" },
    { id: 3, name: "Stacks & Queues", status: "locked" },
    { id: 4, name: "Trees & Graphs", status: "locked" },
  ];

  // Part B: Teacher Invite Acceptance UI
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
        <Navbar />
        <main className="container mx-auto px-4 h-[calc(100vh-80px)] flex flex-col items-center justify-center">
          <div className="max-w-md w-full bg-[var(--bg-primary)] rounded-3xl p-8 shadow-xl border border-[var(--border-color)] text-center">
            
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
              <Users size={32} />
            </div>

            <h2 className="text-2xl font-bold mb-2">Class Invitation</h2>
            <p className="text-[var(--text-secondary)] mb-8">
              You have been invited to join <span className="font-bold text-[var(--text-primary)]">{classroomData.title}</span> by <span className="font-bold text-[var(--text-primary)]">{classroomData.teacher}</span>.
            </p>

            <div className="bg-[var(--bg-secondary)] p-4 rounded-xl mb-8 flex items-center gap-4 text-left">
               <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                  <BookOpen size={24} className="text-blue-500"/>
               </div>
               <div>
                  <h3 className="font-bold text-sm">{classroomData.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">{classroomData.members} Students • {classroomData.teacher}</p>
               </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setIsJoined(true)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-500/20"
              >
                Accept Invite
              </button>
              <button className="w-full py-3.5 bg-transparent hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-semibold transition-colors">
                Decline
              </button>
            </div>
            
            <p className="mt-6 text-xs text-[var(--text-secondary)] flex items-center justify-center gap-2">
               <Lock size={12} /> This class is private and secure.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Main Classroom UI
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN (Header + Feed) - Spans 8 cols */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. CLASS HEADER */}
            <header className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
               {/* Decorative Circles */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
               
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                     <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/30">
                        <Users size={12} /> {classroomData.members} Students
                     </span>
                     <button className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-colors text-white" title="Accessibility Options">
                        <Accessibility size={20} />
                     </button>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">{classroomData.title}</h1>
                  <p className="text-indigo-100 text-lg font-medium mb-6">Teacher: {classroomData.teacher}</p>

                  <div className="flex items-center gap-4">
                     <div className="flex-1 bg-black/20 h-2 rounded-full overflow-hidden backdrop-blur-sm max-w-xs">
                        <div className="bg-green-400 h-full w-2/5 rounded-full"></div>
                     </div>
                     <span className="text-sm font-bold">{classroomData.progress}</span>
                  </div>
               </div>
            </header>

            {/* Navigation Tabs (Mobile mostly, or section switcher) */}
            <div className="flex border-b border-[var(--border-color)] space-x-6 overflow-x-auto scrolbar-hide">
               {['Feed', 'Study Materials', 'People'].map((tab) => {
                  const tabKey = tab === 'Feed' ? 'feed' : tab === 'Study Materials' ? 'materials' : 'people';
                  return (
                  <button 
                     key={tab}
                     className={`pb-3 text-sm font-bold capitalize border-b-2 transition-colors ${
                        activeTab === tabKey
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                     }`}
                     onClick={() => setActiveTab(tabKey)}
                  >
                     {tab}
                  </button>
                  );
               })}
            </div>

            {/* 2. STUDY MATERIAL FEED */}
            <section className="space-y-6">
               <h2 className="sr-only">Content</h2>
               
               {/* FEED TAB CONTENT */}
               {activeTab === 'feed' && feedItems.map((item) => (
                  <div key={item.id} className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)] flex gap-4">
                     <div className="p-3 h-fit bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                        <Users size={20} />
                     </div>
                     <div>
                        <p className="font-medium text-[var(--text-primary)] text-lg mb-2">{item.text}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{item.date}</p>
                     </div>
                  </div>
               ))}

               {/* MATERIALS TAB CONTENT */}
               {activeTab === 'materials' && materials.map((item) => (
                  <StudyMaterial key={item.id} material={item} />
               ))}

               {/* PEOPLE TAB CONTENT */}
               {activeTab === 'people' && (
                  <div className="bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
                     {/* Teacher Section */}
                     <div className="p-6 border-b border-[var(--border-color)]">
                        <h3 className="text-blue-600 font-bold uppercase tracking-wider text-xs mb-4">Teacher</h3>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                             {classroomData.teacher.split(' ').slice(-1)[0][0]}
                           </div>
                           <span className="font-bold text-[var(--text-primary)] text-lg">{classroomData.teacher}</span>
                        </div>
                     </div>
                     {/* Student Section */}
                     <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                           <h3 className="text-blue-600 font-bold uppercase tracking-wider text-xs">Classmates</h3>
                           <span className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2 py-1 rounded">{classroomData.members} Students</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {students.map((student) => (
                             <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
                               <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                                 {student.initials}
                               </div>
                               <span className="font-medium text-[var(--text-primary)]">{student.name}</span>
                             </div>
                           ))}
                           <div className="flex items-center gap-3 p-3 rounded-xl text-[var(--text-secondary)] italic">
                              And 29 others...
                           </div>
                        </div>
                     </div>
                  </div>
               )}
               
               <div className="flex justify-center pt-4">
                  <button className="px-6 py-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full text-sm font-semibold text-[var(--text-secondary)] transition-colors">
                     Load earlier posts...
                  </button>
               </div>
            </section>
          </div>

          {/* RIGHT COLUMN (Sidebar) - Spans 4 cols */}
          <aside className="lg:col-span-4 space-y-8">
             
             {/* 4. CLASS PROGRESS SIDEBAR */}
             <div className="bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border-color)] shadow-sm sticky top-24">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-bold text-lg">Your Journey</h3>
                   <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
                      {classroomData.level}
                   </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-4 -mt-4 italic">
                  Progress adapts based on how you learn, not how fast you finish.
                </p>

                <div className="space-y-4">
                   {stages.map((stage) => (
                      <div 
                        key={stage.id} 
                        className={`p-4 rounded-xl border transition-all ${
                           stage.status === 'bg-white' 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' // Active? No logic for active yet
                              : stage.status === 'current'
                                 ? 'bg-[var(--bg-secondary)] border-blue-500 ring-1 ring-blue-500' // Current
                                 : stage.status === 'completed'
                                    ? 'bg-[var(--bg-secondary)] border-[var(--border-color)] opacity-75' // Completed
                                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] opacity-50' // Locked
                        }`}
                      >
                         <div className="flex items-center gap-3">
                            <div className={`
                               w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                               ${stage.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                 stage.status === 'current' ? 'bg-blue-100 text-blue-700' : 
                                 'bg-[var(--border-color)] text-[var(--text-secondary)]'}
                            `}>
                               {stage.status === 'completed' ? <CheckCircle size={16}/> : 
                                stage.status === 'locked' ? <Lock size={14}/> : stage.id}
                            </div>
                            <div className="flex-1">
                               <p className={`text-sm font-bold ${stage.status === 'locked' ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                                  {stage.name}
                               </p>
                               {stage.status === 'current' && (
                                  <span className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-1">
                                     <Clock size={10} /> In Progress
                                  </span>
                               )}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
                   <h4 className="font-bold text-sm mb-3 text-[var(--text-secondary)] uppercase tracking-wider">Upcoming</h4>
                   <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                      <div className="flex items-start gap-3">
                         <AlertCircle size={20} className="text-orange-500 mt-0.5" />
                         <div>
                            <p className="text-sm font-bold text-orange-800 dark:text-orange-200">Assignment Due</p>
                            <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">Stack Implementation (Tomorrow, 11:59 PM)</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

          </aside>

        </div>
      </main>
    </div>
  );
};

export default Classroom;
