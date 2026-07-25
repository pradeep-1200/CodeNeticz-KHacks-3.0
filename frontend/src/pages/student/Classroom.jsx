import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import {
   Accessibility, CheckCircle, Clock, Lock,
   ChevronRight, Users, BookOpen, AlertCircle, Plus, Mail, Bell, FileText, Upload, Mic, MicOff, Play
} from 'lucide-react';
import { transcribeAudio, getStudentClasses, getStudentInvites, getNotifications, joinClass, respondToInvite, getAssignmentsByClass, submitAssignment } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const Classroom = () => {
   const user = useAuthStore(s => s.user);
   const [classes, setClasses] = useState([]);
   const [invites, setInvites] = useState([]);
   const [notifications, setNotifications] = useState([]);
   const [joinCode, setJoinCode] = useState('');
   const [showJoinModal, setShowJoinModal] = useState(false);

   // Detail Modal State
   const [selectedClass, setSelectedClass] = useState(null);
   const [classAssignments, setClassAssignments] = useState([]);

   // Submission State
   const [submissionText, setSubmissionText] = useState('');
   const [questionAnswers, setQuestionAnswers] = useState({}); // { questionIndex: answer }
   const [recordingIndex, setRecordingIndex] = useState(null); // Index of question being recorded

   useEffect(() => {
      fetchStudentData();
      fetchNotificationsData();
   }, []);

   const fetchStudentData = async () => {
      try {
         const classData = await getStudentClasses();
         setClasses(classData || []);
      } catch (err) { console.error('Classes fetch error:', err); setClasses([]); }

      try {
         const inviteData = await getStudentInvites();
         setInvites(inviteData || []);
      } catch (err) { console.error('Invites fetch error:', err); setInvites([]); }
   };

   const fetchNotificationsData = async () => {
      try {
         const data = await getNotifications();
         setNotifications(data?.notifications || data || []);
      } catch (err) { console.error('Notifications fetch error:', err); setNotifications([]); }
   };

   const handleJoin = async () => {
      try {
         const data = await joinClass(joinCode);
         if (data.success) {
            alert("Joined classroom successfully!");
            setShowJoinModal(false);
            setJoinCode('');
            fetchStudentData();
         } else { alert(data.message || 'Failed to join classroom'); }
      } catch (err) { alert(err.response?.data?.message || err.message || "Error joining class"); }
   };

   const handleInviteResponse = async (inviteId, status) => {
      try {
         const data = await respondToInvite(inviteId, status);
         if (data.success) fetchStudentData();
      } catch (err) { console.error(err); }
   };

   const openClassDetails = async (cls) => {
      setSelectedClass(cls);
      try {
         const data = await getAssignmentsByClass(cls._id);
         setClassAssignments(data.assignments || data || []);
      } catch (err) { console.error(err); setClassAssignments([]); }
   };

   const handleVoiceRecord = async (index) => {
      if (recordingIndex === index) {
         setRecordingIndex(null);
         return;
      }
      setRecordingIndex(index);

      try {
         if (!navigator.mediaDevices) return alert("Microphone not supported on this device/browser");
         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
         const mediaRecorder = new MediaRecorder(stream);
         const audioChunks = [];

         mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
         mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            try {
               const result = await transcribeAudio(audioBlob);
               if (result.success && result.text) {
                  setQuestionAnswers(prev => ({ ...prev, [index]: result.text }));
               } else {
                  alert("Transcription error: " + (result.message || 'Could not transcribe'));
               }
            } catch (err) {
               console.error("STT API failed:", err);
            }
            setRecordingIndex(null);
         };

         mediaRecorder.start();
         setTimeout(() => mediaRecorder.stop(), 5000);
      } catch (e) {
         console.error(e);
         alert("Mic access error");
         setRecordingIndex(null);
      }
   };

   const handleTurnIn = async (assignmentId, hasQuestions) => {
      let content = submissionText;

      if (hasQuestions) {
         content = JSON.stringify(questionAnswers);
      }

      if (!content) return alert("Please answer the questions before turning in.");

      try {
         const data = await submitAssignment({ assignmentId, content });
         if (data.success) {
            alert("Assignment Turned In!");
            setSubmissionText('');
            setQuestionAnswers({});
            if (selectedClass) {
               const data2 = await getAssignmentsByClass(selectedClass._id);
               setClassAssignments(data2.assignments || data2 || []);
            }
         }
      } catch (err) { alert(err.response?.data?.message || err.message || "Submission failed"); }
   };

   const hasNotification = (classId) => {
      return (notifications || []).some(n => !n.read && n.link && n.link.includes(classId));
   };

   return (
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors">
         <Navbar />
         <main className="container mx-auto px-4 md:px-8 py-8 max-w-7xl animate-fade-in-up">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
               <div>
                  <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                     My Classroom
                     {(notifications || []).some(n => !n.read) && (
                        <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full animate-pulse font-bold">
                           {(notifications || []).filter(n => !n.read).length} New
                        </span>
                     )}
                  </h1>
                  <p className="text-xs md:text-sm text-[var(--text-secondary)] font-medium mt-1">
                     Enrolled classes, study materials, and assignments
                  </p>
               </div>
               <button 
                  onClick={() => setShowJoinModal(true)} 
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-extrabold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all hover:scale-105"
               >
                  <Plus size={20} /> Join Class Code
               </button>
            </div>

            {/* INVITES */}
            {(invites || []).length > 0 && (
               <div className="mb-10">
                  <h2 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                     <Mail size={16} className="text-indigo-600" /> Pending Invitations
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                     {(invites || []).map(invite => (
                        <div key={invite._id} className="bg-[var(--bg-surface)] p-5 rounded-2xl shadow-sm border border-indigo-500/30 flex justify-between items-center card-hover-lift">
                           <div>
                              <h3 className="font-extrabold text-lg">{invite.classId?.name || 'Classroom Invite'}</h3>
                              <p className="text-xs text-[var(--text-secondary)]">Instructor: {invite.teacherId?.name || 'Faculty'}</p>
                           </div>
                           <div className="flex gap-2">
                              <button onClick={() => handleInviteResponse(invite._id, 'accepted')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm">Accept</button>
                              <button onClick={() => handleInviteResponse(invite._id, 'rejected')} className="px-4 py-2 bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-xl font-bold text-xs hover:bg-red-500/10 hover:text-red-500 transition-colors">Decline</button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* CLASSES GRID */}
            {(classes || []).length === 0 ? (
               <div className="text-center py-16 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] p-8">
                  <BookOpen size={48} className="mx-auto mb-4 text-indigo-500/50" />
                  <h3 className="text-xl font-extrabold mb-2">No Enrolled Classes Yet</h3>
                  <p className="text-xs md:text-sm text-[var(--text-secondary)] mb-6 max-w-md mx-auto font-medium">
                     Ask your teacher for a class code or check back after an invitation is sent to your email.
                  </p>
                  <button onClick={() => setShowJoinModal(true)} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl text-xs hover:bg-indigo-700 transition-colors">
                     Enter Class Code
                  </button>
               </div>
            ) : (
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(classes || []).map(cls => (
                     <div 
                        key={cls._id} 
                        onClick={() => openClassDetails(cls)} 
                        className="bg-[var(--bg-surface)] rounded-3xl shadow-sm border border-[var(--border-color)] overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer group relative card-hover-lift"
                     >
                        {hasNotification(cls._id) && <div className="absolute top-3 right-3 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full shadow-md z-10 animate-ping" />}
                        <div className="h-28 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-6 relative flex flex-col justify-between">
                           <div>
                              <h3 className="text-xl font-black text-white group-hover:underline tracking-tight">{cls.name}</h3>
                              <p className="text-indigo-100 text-xs font-semibold">{cls.section || cls.subject || 'Section'}</p>
                           </div>
                        </div>
                        <div className="p-6 space-y-4">
                           <p className="text-xs text-[var(--text-secondary)] font-semibold">Teacher: <span className="text-[var(--text-primary)]">{cls.teacherId?.name || "Faculty Staff"}</span></p>
                           <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 p-2.5 rounded-xl justify-center border border-indigo-500/20">
                              View Coursework & Assignments →
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* CLASS DETAIL MODAL */}
            {selectedClass && (
               <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[var(--bg-surface)] w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl border border-[var(--border-color)] overflow-hidden flex flex-col animate-fade-in-up">
                     <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 relative flex-shrink-0 flex justify-between items-center text-white">
                        <div>
                           <h2 className="text-2xl font-black">{selectedClass.name}</h2>
                           <p className="text-indigo-100 text-xs font-semibold">{selectedClass.subject || selectedClass.section}</p>
                        </div>
                        <button onClick={() => setSelectedClass(null)} className="text-white/80 hover:text-white font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm text-xs transition-colors">
                           Close
                        </button>
                     </div>

                     <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                        
                        {/* Sidebar: Level Games */}
                        <div className="w-full md:w-1/3 bg-[var(--bg-base)] border-r border-[var(--border-color)] p-6 overflow-y-auto">
                           <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-4">Assigned Levels & Games</h3>
                           {(selectedClass.assessments || []).length === 0 ? (
                              <p className="text-xs text-[var(--text-secondary)] italic">No games assigned for this class yet.</p>
                           ) : (
                              (selectedClass.assessments || []).map(a => (
                                 <div key={a._id} className="p-4 bg-[var(--bg-surface)] rounded-2xl mb-3 border border-[var(--border-color)]">
                                    <div className="flex justify-between items-start mb-2">
                                       <span className="font-bold text-sm text-[var(--text-primary)]">{a.title}</span>
                                       <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md uppercase">{a.difficulty || 'Easy'}</span>
                                    </div>
                                    <a href={`/student/play/${a._id}`} className="block text-center text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl transition-colors shadow-sm mt-2">
                                       PLAY LEVEL
                                    </a>
                                 </div>
                              ))
                           )}
                        </div>

                        {/* Main Body: Assignments */}
                        <div className="w-full md:w-2/3 p-6 md:p-8 overflow-y-auto bg-[var(--bg-surface)]">
                           <h3 className="text-xl font-extrabold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                              <FileText className="text-indigo-600" /> Class Assignments
                           </h3>
                           
                           {(classAssignments || []).length === 0 ? (
                              <div className="text-center py-12 text-[var(--text-secondary)] italic text-sm">
                                 No written assignments posted for this classroom yet.
                              </div>
                           ) : (
                              <div className="space-y-6">
                                 {(classAssignments || []).map(assign => {
                                    const userId = user?.id || user?._id;
                                    const mySubmission = (assign.submissions || []).find(s => s.studentId === userId);
                                    const isTurnedIn = !!mySubmission;
                                    
                                    return (
                                       <div key={assign._id} className="bg-[var(--bg-base)] rounded-2xl border border-[var(--border-color)] p-6 shadow-sm">
                                          <div className="flex justify-between items-start mb-3">
                                             <div>
                                                <h4 className="text-lg font-bold text-[var(--text-primary)]">{assign.title}</h4>
                                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Due: {assign.deadline ? new Date(assign.deadline).toLocaleDateString() : 'No Deadline'}</p>
                                             </div>
                                             {isTurnedIn ? (
                                                <span className="text-emerald-600 bg-emerald-500/10 font-extrabold px-3 py-1 rounded-full text-xs border border-emerald-500/20">Turned In</span>
                                             ) : (
                                                <span className="text-amber-600 bg-amber-500/10 font-extrabold px-3 py-1 rounded-full text-xs border border-amber-500/20">Assigned</span>
                                             )}
                                          </div>
                                          
                                          <div className="bg-[var(--bg-surface)] p-4 rounded-xl text-xs text-[var(--text-secondary)] mb-4 whitespace-pre-wrap font-medium border border-[var(--border-color)]">
                                             {assign.description}
                                          </div>

                                          {!isTurnedIn ? (
                                             <div className="border-t border-[var(--border-color)] pt-4 space-y-4">
                                                {(assign.questions || []).length > 0 ? (
                                                   <div className="space-y-4">
                                                      {(assign.questions || []).map((q, idx) => (
                                                         <div key={idx} className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-color)] space-y-2">
                                                            <p className="font-bold text-xs text-[var(--text-primary)]">{idx + 1}. {q.questionText}</p>
                                                            
                                                            {q.type === 'text' && (
                                                               <input className="w-full p-2.5 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500" placeholder="Type your answer..." onChange={e => setQuestionAnswers({ ...questionAnswers, [idx]: e.target.value })} />
                                                            )}
                                                            
                                                            {q.type === 'multiple_choice' && (
                                                               <div className="space-y-1.5 pt-1">
                                                                  {(q.options || []).map((opt, oIdx) => (
                                                                     <label key={oIdx} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer p-1.5 hover:bg-[var(--bg-base)] rounded-lg">
                                                                        <input type="radio" name={`q_${assign._id}_${idx}`} value={opt} onChange={e => setQuestionAnswers({ ...questionAnswers, [idx]: e.target.value })} />
                                                                        {opt}
                                                                     </label>
                                                                  ))}
                                                               </div>
                                                            )}
                                                            
                                                            {q.type === 'voice' && (
                                                               <div className="flex items-center gap-3 pt-1">
                                                                  <button onClick={() => handleVoiceRecord(idx)} className={`p-2.5 rounded-full text-white transition-all ${recordingIndex === idx ? 'bg-red-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                                                     {recordingIndex === idx ? <MicOff size={16} /> : <Mic size={16} />}
                                                                  </button>
                                                                  <span className="text-xs font-bold text-[var(--text-secondary)]">
                                                                     {questionAnswers[idx] ? "Voice Answer Recorded" : (recordingIndex === idx ? "Recording audio..." : "Tap mic to speak answer")}
                                                                  </span>
                                                                  {questionAnswers[idx] && <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded">Saved</span>}
                                                               </div>
                                                            )}
                                                         </div>
                                                      ))}
                                                   </div>
                                                ) : (
                                                   <textarea className="w-full p-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl min-h-[100px] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500" placeholder="Type your answer here..." value={submissionText} onChange={e => setSubmissionText(e.target.value)} />
                                                )}
                                                
                                                <button onClick={() => handleTurnIn(assign._id, !!(assign.questions || []).length)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
                                                   <Upload size={16} /> Turn In Assignment
                                                </button>
                                             </div>
                                          ) : (
                                             <div className="border-t border-[var(--border-color)] pt-4 text-center text-emerald-600 font-bold text-xs">
                                                ✓ Assignment Submitted Successfully
                                             </div>
                                          )}
                                       </div>
                                    );
                                 })}
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* JOIN MODAL */}
            {showJoinModal && (
               <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-fade-in-up">
                     <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6 text-center tracking-tight">Join Classroom</h2>
                     <div className="space-y-2 mb-6">
                        <label className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wide">Enter Class Code</label>
                        <input className="w-full text-center text-3xl font-black p-4 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] focus:border-indigo-500 outline-none tracking-widest uppercase" placeholder="AB12CD" maxLength={6} value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} />
                     </div>
                     <div className="flex gap-3">
                        <button onClick={() => setShowJoinModal(false)} className="flex-1 py-3 text-[var(--text-secondary)] font-bold hover:bg-[var(--bg-base)] rounded-xl text-xs transition-colors">Cancel</button>
                        <button onClick={handleJoin} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/20 transition-all">Join Now</button>
                     </div>
                  </div>
               </div>
            )}

         </main>
      </div>
   );
};

export default Classroom;
