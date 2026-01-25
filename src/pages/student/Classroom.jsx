import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import {
   Accessibility, CheckCircle, Clock, Lock,
   ChevronRight, Users, BookOpen, AlertCircle, Plus, Mail
} from 'lucide-react';

const Classroom = () => {
   // Mock Student ID (In real app, from Auth Context)
   const STUDENT_ID = "65b2a3c4e8f1a2b3c4d5e6f7"; // Replace with real ID from login

   const [classes, setClasses] = useState([]);
   const [invites, setInvites] = useState([]);
   const [activeTab, setActiveTab] = useState('classes');
   const [joinCode, setJoinCode] = useState('');
   const [showJoinModal, setShowJoinModal] = useState(false);

   useEffect(() => {
      fetchStudentData();
   }, []);

   const fetchStudentData = async () => {
      // Fetch Joined Classes
      try {
         const res = await fetch(`http://localhost:5000/api/classes/student/${STUDENT_ID}`);
         if (res.ok) {
            const data = await res.json();
            if (data.success) setClasses(data.classes);
         } else {
            console.error("Failed to fetch classes:", res.status);
         }
      } catch (err) { console.error("Network error fetching classes", err); }

      // Fetch Pending Invites
      try {
         const res = await fetch(`http://localhost:5000/api/classes/student/${STUDENT_ID}/invites`);
         if (res.ok) {
            const data = await res.json();
            if (data.success) setInvites(data.invites);
         }
      } catch (err) { console.error("Network error fetching invites", err); }
   };

   const handleJoin = async () => {
      try {
         const res = await fetch('http://localhost:5000/api/classes/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: joinCode, studentId: STUDENT_ID })
         });
         const data = await res.json();
         if (data.success) {
            alert("Joined successfully!");
            setShowJoinModal(false);
            setJoinCode('');
            fetchStudentData();
         } else {
            alert(data.message);
         }
      } catch (err) { alert("Error joining"); }
   };

   const handleInviteResponse = async (inviteId, status) => {
      try {
         const res = await fetch('http://localhost:5000/api/classes/invite/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inviteId, status })
         });
         const data = await res.json();
         if (data.success) {
            fetchStudentData();
         }
      } catch (err) { console.error(err); }
   };

   return (
      <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)]">
         <Navbar />
         <main className="container mx-auto px-6 py-8">

            {/* Header Actions */}
            <div className="flex justify-between items-center mb-8">
               <h1 className="text-3xl font-black">My Classroom</h1>
               <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-6 py-3 bg-[var(--accent-primary)] text-white rounded-xl font-bold shadow-lg hover:bg-[var(--accent-hover)] transition-all flex items-center gap-2"
               >
                  <Plus size={20} /> Join Class
               </button>
            </div>

            {/* PENDING INVITES SECTION */}
            {invites.length > 0 && (
               <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                  <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                     <Mail size={16} /> Course Invitations
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                     {invites.map(invite => (
                        <div key={invite._id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-blue-200 dark:border-blue-900 flex justify-between items-center">
                           <div>
                              <h3 className="font-bold text-lg text-[var(--text-primary)]">{invite.classId?.name}</h3>
                              <p className="text-sm text-[var(--text-secondary)]">{invite.classId?.subject} • {invite.teacherId?.name}</p>
                           </div>
                           <div className="flex gap-2">
                              <button
                                 onClick={() => handleInviteResponse(invite._id, 'accepted')}
                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700"
                              >
                                 Accept
                              </button>
                              <button
                                 onClick={() => handleInviteResponse(invite._id, 'rejected')}
                                 className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg font-bold text-sm hover:bg-slate-200"
                              >
                                 Decline
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* CLASSES GRID */}
            {classes.length === 0 ? (
               <div className="text-center py-20 bg-[var(--bg-primary)] rounded-3xl border border-dashed border-[var(--border-color)]">
                  <BookOpen size={48} className="mx-auto text-[var(--text-secondary)] mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-[var(--text-secondary)]">No classes joined yet</h3>
                  <p className="text-[var(--text-secondary)] opacity-70">Enter a code or accept an invite to get started.</p>
               </div>
            ) : (
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map(cls => (
                     <div key={cls._id} className="bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 relative">
                           <h3 className="text-xl font-bold text-white mb-1 group-hover:underline decoration-2 underline-offset-4">{cls.name}</h3>
                           <p className="text-blue-100 text-sm">{cls.section ? `Sec ${cls.section} • ` : ''}{cls.subject}</p>
                           <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                              <BookOpen size={20} />
                           </div>
                        </div>
                        <div className="p-6">
                           <p className="text-sm text-[var(--text-secondary)] mb-4 font-medium">Teacher: {cls.teacherId?.name || "Staff"}</p>
                           <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider border-t border-[var(--border-color)] pt-4">
                              <span>Assignments: {cls.assessments?.length || 0}</span>
                              <span>Materials: {cls.materials?.length || 0}</span>
                              <span>Students: {cls.students?.length || 1}</span>
                           </div>

                           {/* Materials List */}
                           {cls.materials && cls.materials.length > 0 && (
                              <div className="mt-4 space-y-2 border-t border-[var(--border-color)] pt-2">
                                 <div className="text-xs font-bold text-[var(--text-secondary)] uppercase">Learning Materials</div>
                                 {cls.materials.map(m => (
                                    <a
                                       key={m._id}
                                       href={m.url}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-lg border border-[var(--border-color)] hover:border-blue-400 transition-colors group/item"
                                    >
                                       <div className={`p-2 rounded-lg ${m.type === 'pdf' ? 'bg-red-50 text-red-500' :
                                          m.type === 'video' ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-500'
                                          }`}>
                                          {m.type === 'pdf' ? <BookOpen size={16} /> : <div className="font-black text-xs">VID</div>}
                                       </div>
                                       <div className="flex-1 overflow-hidden">
                                          <p className="font-bold text-sm text-[var(--text-primary)] truncate">{m.title}</p>
                                          <p className="text-xs text-[var(--text-secondary)] truncate">{m.desc || 'No description'}</p>
                                       </div>
                                       <div className="opacity-0 group-hover/item:opacity-100 text-blue-500">
                                          <ChevronRight size={16} />
                                       </div>
                                    </a>
                                 ))}
                              </div>
                           )}

                           {/* Assessments List */}
                           {cls.assessments && cls.assessments.length > 0 && (
                              <div className="mt-4 space-y-2">
                                 {cls.assessments.map(a => (
                                    <div key={a._id} className="flex justify-between items-center p-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                                       <div>
                                          <p className="font-bold text-sm text-[var(--text-primary)]">{a.title}</p>
                                          <p className="text-xs text-[var(--text-secondary)]">{a.difficulty} • {a.xpReward} XP</p>
                                       </div>
                                       <a
                                          href={`/student/play/${a._id}`}
                                          className="px-3 py-1 bg-[var(--game-primary)] text-white text-xs font-bold rounded-md hover:scale-105 transition-transform"
                                       >
                                          PLAY
                                       </a>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* JOIN MODAL */}
            {showJoinModal && (
               <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                     <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">Join Class</h2>

                     <div className="space-y-2 mb-6">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Enter Class Code</label>
                        <input
                           className="w-full text-center text-3xl font-black p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white outline-none tracking-widest uppercase transition-colors"
                           placeholder="AB12CD"
                           maxLength={6}
                           value={joinCode}
                           onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        />
                        <p className="text-xs text-center text-slate-400">Ask your teacher for this code</p>
                     </div>

                     <div className="flex gap-3">
                        <button onClick={() => setShowJoinModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">Close</button>
                        <button onClick={handleJoin} className="flex-1 py-3 bg-[var(--accent-primary)] text-white font-bold rounded-xl hover:bg-[var(--accent-hover)] shadow-lg">Join Now</button>
                     </div>
                  </div>
               </div>
            )}
         </main>
      </div>
   );
};

export default Classroom;
