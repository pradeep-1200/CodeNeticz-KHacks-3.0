import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import {
   Accessibility, CheckCircle, Clock, Lock,
   ChevronRight, Users, BookOpen, AlertCircle, Plus, Mail, Bell, FileText, Upload, Mic, MicOff, Play
} from 'lucide-react';
import { transcribeAudio } from '../../services/api';

const Classroom = () => {
   const STUDENT_ID = "65b2a3c4e8f1a2b3c4d5e6f7";

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
      fetchNotifications();
   }, []);

   const fetchStudentData = async () => {
      try {
         const res = await fetch(`http://localhost:5000/api/classes/student/${STUDENT_ID}`);
         if (res.ok) {
            const data = await res.json();
            if (data.success) setClasses(data.classes);
         }
      } catch (err) { console.error(err); }

      try {
         const res = await fetch(`http://localhost:5000/api/classes/student/${STUDENT_ID}/invites`);
         if (res.ok) {
            const data = await res.json();
            if (data.success) setInvites(data.invites);
         }
      } catch (err) { console.error(err); }
   };

   const fetchNotifications = async () => {
      try {
         const res = await fetch(`http://localhost:5000/api/notifications/${STUDENT_ID}`);
         if (res.ok) {
            const data = await res.json();
            if (data.success) setNotifications(data.notifications);
         }
      } catch (err) { console.error(err); }
   };

   const handleJoin = async () => { /* ... existing ... */
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
         } else { alert(data.message); }
      } catch (err) { alert("Error joining"); }
   };

   const handleInviteResponse = async (inviteId, status) => { /* ... existing ... */
      try {
         const res = await fetch('http://localhost:5000/api/classes/invite/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inviteId, status })
         });
         const data = await res.json();
         if (data.success) fetchStudentData();
      } catch (err) { console.error(err); }
   };

   const openClassDetails = async (cls) => {
      setSelectedClass(cls);
      try {
         const res = await fetch(`http://localhost:5000/api/assignments/class/${cls._id}`);
         const data = await res.json();
         if (data.success) setClassAssignments(data.assignments);
      } catch (err) { console.error(err); }
   };

   const handleVoiceRecord = async (index) => {
      if (recordingIndex === index) {
         setRecordingIndex(null); // Stop recording logic handled by MediaRecorder in real app
         return;
      }
      setRecordingIndex(index);

      // Simulate recording/transcription
      try {
         if (!navigator.mediaDevices) return alert("Microphone not supported");
         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
         const mediaRecorder = new MediaRecorder(stream);
         const audioChunks = [];

         mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
         mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const result = await transcribeAudio(audioBlob);
            if (result.success) {
               setQuestionAnswers(prev => ({ ...prev, [index]: result.text }));
            } else {
               alert("Transcription failed: " + result.message);
            }
            setRecordingIndex(null);
         };

         mediaRecorder.start();
         setTimeout(() => mediaRecorder.stop(), 5000); // Record for 5 seconds simplified
      } catch (e) {
         console.error(e);
         alert("Mic error");
         setRecordingIndex(null);
      }
   };

   const handleTurnIn = async (assignmentId, hasQuestions) => {
      let content = submissionText;

      if (hasQuestions) {
         // Format answers
         content = JSON.stringify(questionAnswers);
      }

      if (!content) return alert("Please answer the questions.");

      try {
         const res = await fetch('http://localhost:5000/api/assignments/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               assignmentId,
               studentId: STUDENT_ID,
               content
            })
         });
         const data = await res.json();
         if (data.success) {
            alert("Assignment Turned In!");
            setSubmissionText('');
            setQuestionAnswers({});
            const res2 = await fetch(`http://localhost:5000/api/assignments/class/${selectedClass._id}`);
            const data2 = await res2.json();
            if (data2.success) setClassAssignments(data2.assignments);
         }
      } catch (err) { alert("Submission failed"); }
   };

   const hasNotification = (classId) => {
      return notifications.some(n => !n.read && n.link && n.link.includes(classId));
   };

   return (
      <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)]">
         <Navbar />
         <main className="container mx-auto px-6 py-8">
            {/* Header ... */}
            <div className="flex justify-between items-center mb-8">
               <h1 className="text-3xl font-black flex items-center gap-3">
                  My Classroom
                  {notifications.some(n => !n.read) && (
                     <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                        {notifications.filter(n => !n.read).length} New
                     </span>
                  )}
               </h1>
               <button onClick={() => setShowJoinModal(true)} className="px-6 py-3 bg-[var(--accent-primary)] text-white rounded-xl font-bold shadow-lg flex items-center gap-2"><Plus size={20} /> Join Class</button>
            </div>

            {/* INVITES */}
            {invites.length > 0 && (
               <div className="mb-10">
                  <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2"><Mail size={16} /> Invitations</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                     {invites.map(invite => (
                        <div key={invite._id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-blue-200 flex justify-between items-center">
                           <div><h3 className="font-bold text-lg">{invite.classId?.name}</h3><p className="text-sm text-[var(--text-secondary)]">{invite.teacherId?.name}</p></div>
                           <div className="flex gap-2"><button onClick={() => handleInviteResponse(invite._id, 'accepted')} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm">Accept</button><button onClick={() => handleInviteResponse(invite._id, 'rejected')} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg font-bold text-sm">Decline</button></div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* CLASSES GRID */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {classes.map(cls => (
                  <div key={cls._id} onClick={() => openClassDetails(cls)} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden hover:shadow-md transition-all cursor-pointer group relative">
                     {hasNotification(cls._id) && <div className="absolute top-3 right-3 w-4 h-4 bg-red-500 border-2 border-white rounded-full shadow-md z-10 animate-bounce"></div>}
                     <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 relative">
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:underline">{cls.name}</h3><p className="text-blue-100 text-sm">{cls.section}</p>
                     </div>
                     <div className="p-6"><p className="text-sm text-[var(--text-secondary)] mb-4 font-medium">Teacher: {cls.teacherId?.name || "Staff"}</p><div className="flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 p-2 rounded-lg justify-center border border-purple-100">Click to View Assignments</div></div>
                  </div>
               ))}
            </div>

            {/* CLASS DETAIL MODAL */}
            {selectedClass && (
               <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                  <div className="bg-[var(--bg-primary)] w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                     <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 relative flex-shrink-0 flex justify-between items-center">
                        <div><h2 className="text-2xl font-black text-white">{selectedClass.name}</h2><p className="text-blue-100 font-medium">{selectedClass.subject}</p></div>
                        <button onClick={() => setSelectedClass(null)} className="text-white/80 hover:text-white font-bold bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">Close</button>
                     </div>

                     <div className="flex flex-1 overflow-hidden">
                        <div className="w-1/4 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] p-6 overflow-y-auto">
                           <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-4">Materials & Games</h3>
                           {selectedClass.assessments?.map(a => (
                              <div key={a._id} className="p-3 bg-green-50 rounded-xl mb-3 border border-green-100">
                                 <div className="flex justify-between items-start mb-2"><span className="font-bold text-green-900 text-sm">{a.title}</span><span className="text-xs bg-green-200 text-green-800 px-1 rounded">{a.difficulty}</span></div>
                                 <a href={`/student/play/${a._id}`} className="block text-center text-xs font-bold bg-green-600 text-white py-1 rounded hover:bg-green-700">PLAY LEVEL</a>
                              </div>
                           ))}
                        </div>

                        <div className="w-3/4 p-8 overflow-y-auto bg-[var(--bg-primary)]">
                           <h3 className="text-2xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-2"><FileText className="text-purple-600" /> Assignments</h3>
                           {classAssignments.length === 0 ? <div className="text-center py-10 text-slate-400 italic">No assignments yet</div> : (
                              <div className="space-y-8">
                                 {classAssignments.map(assign => {
                                    const mySubmission = assign.submissions?.find(s => s.studentId === STUDENT_ID);
                                    const isTurnedIn = !!mySubmission;
                                    return (
                                       <div key={assign._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border-color)] p-6 shadow-sm">
                                          <div className="flex justify-between mb-4">
                                             <div><h4 className="text-xl font-bold">{assign.title}</h4><p className="text-sm mt-1">Due: {new Date(assign.deadline).toLocaleDateString()}</p></div>
                                             {isTurnedIn ? <span className="text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full text-xs h-fit">Turned In</span> : <span className="text-amber-600 font-bold bg-amber-100 px-3 py-1 rounded-full text-xs h-fit">Assigned</span>}
                                          </div>
                                          <div className="bg-[var(--bg-secondary)] p-4 rounded-xl text-sm mb-6 whitespace-pre-wrap">{assign.description}</div>

                                          {/* Tools Button */}
                                          {assign.toolsAllowed?.dyslexia && (
                                             <div className="flex gap-2 mb-4">
                                                <button onClick={() => window.open('/dyslexia', '_blank')} className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200"><Accessibility size={14} /> Dyslexia Tools</button>
                                                <button onClick={() => window.open('/dyscalculia-tool', '_blank')} className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-200"><Accessibility size={14} /> Dyscalculia Tools</button>
                                             </div>
                                          )}

                                          {!isTurnedIn ? (
                                             <div className="border-t pt-4">
                                                {/* Render Specific Questions if any */}
                                                {assign.questions && assign.questions.length > 0 ? (
                                                   <div className="space-y-4 mb-4">
                                                      {assign.questions.map((q, idx) => (
                                                         <div key={idx} className="bg-gray-50 p-4 rounded-xl">
                                                            <p className="font-bold text-sm mb-2">{idx + 1}. {q.questionText}</p>
                                                            {q.type === 'text' && (
                                                               <input className="w-full p-2 border rounded" placeholder="Your answer..." onChange={e => setQuestionAnswers({ ...questionAnswers, [idx]: e.target.value })} />
                                                            )}
                                                            {q.type === 'multiple_choice' && (
                                                               <div className="space-y-1">
                                                                  {q.options.map((opt, oIdx) => (
                                                                     <label key={oIdx} className="flex items-center gap-2 text-sm cursor-pointer p-1 hover:bg-gray-100 rounded">
                                                                        <input type="radio" name={`q_${assign._id}_${idx}`} value={opt} onChange={e => setQuestionAnswers({ ...questionAnswers, [idx]: e.target.value })} />
                                                                        {opt}
                                                                     </label>
                                                                  ))}
                                                               </div>
                                                            )}
                                                            {q.type === 'voice' && (
                                                               <div className="flex items-center gap-2">
                                                                  <button onClick={() => handleVoiceRecord(idx)} className={`p-2 rounded-full ${recordingIndex === idx ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-600 text-white'}`}>
                                                                     {recordingIndex === idx ? <MicOff size={16} /> : <Mic size={16} />}
                                                                  </button>
                                                                  <span className="text-xs font-bold text-gray-500">{questionAnswers[idx] ? "Answer Recorded" : (recordingIndex === idx ? "Recording..." : "Tap to Record")}</span>
                                                                  {questionAnswers[idx] && <span className="text-xs bg-green-100 text-green-700 px-2 rounded">Saved</span>}
                                                               </div>
                                                            )}
                                                         </div>
                                                      ))}
                                                   </div>
                                                ) : (
                                                   <textarea className="w-full p-3 bg-[var(--bg-secondary)] border rounded-xl min-h-[100px] text-sm mb-3" placeholder="Type your answer here..." value={submissionText} onChange={e => setSubmissionText(e.target.value)} />
                                                )}
                                                <button onClick={() => handleTurnIn(assign._id, !!assign.questions?.length)} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"><Upload size={18} /> Turn In</button>
                                             </div>
                                          ) : (
                                             <div className="border-t pt-4 text-center text-gray-500 text-sm font-bold">Assignment Submitted</div>
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
            {/* JOIN MODAL logic unchanged... */}
            {showJoinModal && (
               <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                     <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">Join Class</h2>
                     <div className="space-y-2 mb-6"><label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Enter Class Code</label><input className="w-full text-center text-3xl font-black p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white outline-none tracking-widest uppercase" placeholder="AB12CD" maxLength={6} value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} /></div>
                     <div className="flex gap-3"><button onClick={() => setShowJoinModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">Close</button><button onClick={handleJoin} className="flex-1 py-3 bg-[var(--accent-primary)] text-white font-bold rounded-xl shadow-lg">Join Now</button></div>
                  </div>
               </div>
            )}
         </main>
      </div>
   );
};

export default Classroom;
