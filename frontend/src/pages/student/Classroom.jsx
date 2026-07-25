import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import {
   BookOpen, Bell, FileText, Plus, Mail, ChevronRight, Users, CheckCircle, 
   AlertCircle, X, Check, Calendar, Home, CheckSquare, MoreVertical, Folder, 
   UserCheck, MessageSquare, Send, Sparkles, Volume2, Mic, Clock, Download, ArrowLeft, ExternalLink, HelpCircle, UploadCloud, Paperclip
} from 'lucide-react';
import { 
   transcribeAudio, 
   getStudentClasses, 
   getStudentInvites, 
   getNotifications, 
   joinClass, 
   respondToInvite, 
   getAssignmentsByClass, 
   submitAssignment,
   getAnnouncementsByClass,
   createAnnouncement
} from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const Classroom = () => {
   const user = useAuthStore(s => s.user);
   const [classes, setClasses] = useState([]);
   const [invites, setInvites] = useState([]);
   const [notifications, setNotifications] = useState([]);
   const [joinCode, setJoinCode] = useState('');
   const [showJoinModal, setShowJoinModal] = useState(false);
   const [sidebarOpen, setSidebarOpen] = useState(true);

   // Selected Classroom Active View
   const [activeClass, setActiveClass] = useState(null); // null = Dashboard Grid View
   const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'classwork' | 'people'
   
   // Stream Announcements State
   const [announcements, setAnnouncements] = useState([]);
   const [newAnnouncementText, setNewAnnouncementText] = useState('');
   const [showAnnouncementBox, setShowAnnouncementBox] = useState(false);

   // Classwork Assignments State
   const [classAssignments, setClassAssignments] = useState([]);
   const [submissionText, setSubmissionText] = useState('');
   const [submissionFile, setSubmissionFile] = useState(null);
   const [questionAnswers, setQuestionAnswers] = useState({});
   const [recordingIndex, setRecordingIndex] = useState(null);

   // Toast State
   const [toast, setToast] = useState(null);

   const bgGradients = [
      'from-amber-600 via-orange-600 to-amber-700',
      'from-slate-700 via-blue-800 to-slate-900',
      'from-purple-700 via-indigo-700 to-purple-900',
      'from-blue-600 via-cyan-700 to-blue-800',
      'from-emerald-700 via-teal-800 to-emerald-900',
   ];

   useEffect(() => {
      fetchStudentData();
      fetchNotificationsData();
   }, []);

   const showToast = (message, type = 'info') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
   };

   const fetchStudentData = async () => {
      try {
         const classData = await getStudentClasses();
         setClasses(classData?.classes || classData || []);
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

   const openClassroom = async (cls) => {
      setActiveClass(cls);
      setActiveTab('stream');
      fetchClassStreamData(cls._id);
   };

   const fetchClassStreamData = async (classId) => {
      try {
         const annData = await getAnnouncementsByClass(classId);
         setAnnouncements(annData.announcements || annData || []);
      } catch (e) { setAnnouncements([]); }

      try {
         const assignData = await getAssignmentsByClass(classId);
         setClassAssignments(assignData.assignments || assignData || []);
      } catch (e) { setClassAssignments([]); }
   };

   const handlePostAnnouncement = async (e) => {
      if (e) e.preventDefault();
      if (!newAnnouncementText.trim()) return showToast("Announcement text cannot be empty", "error");
      try {
         const data = await createAnnouncement({
            classId: activeClass._id,
            content: newAnnouncementText.trim()
         });
         if (data.success || data.announcement) {
            showToast("Announcement posted to class stream!", "success");
            setNewAnnouncementText('');
            setShowAnnouncementBox(false);
            fetchClassStreamData(activeClass._id);
         }
      } catch (err) {
         showToast(err.response?.data?.message || "Failed to post announcement", "error");
      }
   };

   const handleJoin = async (e) => {
      if (e) e.preventDefault();
      if (!joinCode.trim()) return showToast("Please enter a classroom code", "error");
      try {
         const data = await joinClass(joinCode.trim());
         if (data.success) {
            showToast(data.message || "Joined classroom successfully!", "success");
            setShowJoinModal(false);
            setJoinCode('');
            fetchStudentData();
         } else { 
            showToast(data.message || 'Failed to join classroom', "error"); 
         }
      } catch (err) { 
         const errorMsg = err.response?.data?.message || err.message || "Error joining class";
         showToast(errorMsg, "error"); 
      }
   };

   const handleInviteResponse = async (inviteId, status) => {
      try {
         const data = await respondToInvite(inviteId, status);
         if (data.success) {
            showToast(status === 'accepted' ? "Classroom joined successfully!" : "Invitation declined", status === 'accepted' ? "success" : "info");
            fetchStudentData();
         }
      } catch (err) { 
         showToast("Error processing invitation", "error"); 
      }
   };

   const handleVoiceRecord = async (index) => {
      if (recordingIndex === index) {
         setRecordingIndex(null);
         return;
      }
      setRecordingIndex(index);

      try {
         if (!navigator.mediaDevices) return showToast("Microphone not supported on this device", "error");
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
                  showToast("Voice transcribed!", "success");
               } else {
                  showToast("Transcription error: " + (result.message || 'Could not transcribe'), "error");
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
         showToast("Microphone access denied", "error");
         setRecordingIndex(null);
      }
   };

   const handleTurnIn = async (assignmentId, hasQuestions) => {
      let content = submissionText;
      if (hasQuestions) content = JSON.stringify(questionAnswers);

      if (!content && !submissionFile) {
         return showToast("Please answer questions or attach a document file before turning in.", "error");
      }

      try {
         const formData = new FormData();
         formData.append('assignmentId', assignmentId);
         if (content) formData.append('content', content);
         if (submissionFile) formData.append('file', submissionFile);

         const data = await submitAssignment(formData);
         if (data.success) {
            showToast("Assignment Turned In with Document Attachment!", "success");
            setSubmissionText('');
            setSubmissionFile(null);
            setQuestionAnswers({});
            if (activeClass) fetchClassStreamData(activeClass._id);
         }
      } catch (err) { showToast(err.response?.data?.message || err.message || "Submission failed", "error"); }
   };

   return (
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors flex flex-col font-sans">
         <Navbar />

         {/* TOAST CONTAINER */}
         {toast && (
            <div className="fixed top-20 right-6 z-50 animate-bounce-subtle">
               <div className={`px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md text-xs font-black ${
                  toast.type === 'success' 
                     ? 'bg-emerald-600 text-white border-emerald-400/50 shadow-emerald-500/20' 
                     : toast.type === 'error'
                     ? 'bg-red-600 text-white border-red-400/50 shadow-red-500/20'
                     : 'bg-blue-600 text-white border-blue-400/50 shadow-blue-500/20'
               }`}>
                  {toast.type === 'success' ? <CheckCircle size={18} /> : toast.type === 'error' ? <AlertCircle size={18} /> : <Bell size={18} />}
                  <span>{toast.message}</span>
                  <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80"><X size={14} /></button>
               </div>
            </div>
         )}

         {/* GOOGLE CLASSROOM BODY LAYOUT */}
         <div className="flex-1 flex overflow-hidden">

            {/* LEFT SIDEBAR DRAWER */}
            <aside className={`w-64 bg-white dark:bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
               <div className="p-4 space-y-1 text-sm font-semibold">
                  <button onClick={() => setActiveClass(null)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-r-full text-xs font-bold transition-colors ${!activeClass ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-extrabold' : 'text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                     <Home size={18} /> Home
                  </button>
                  <button className="w-full flex items-center gap-4 px-4 py-3 rounded-r-full text-xs font-bold text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                     <Calendar size={18} /> Calendar
                  </button>
                  
                  <div className="pt-4 border-t border-[var(--border-color)]">
                     <div className="px-4 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 flex items-center justify-between">
                        <span>Enrolled ({classes.length})</span>
                     </div>
                     {(classes || []).map((cls, idx) => (
                        <button 
                           key={cls._id} 
                           onClick={() => openClassroom(cls)}
                           className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-r-full text-xs font-semibold truncate transition-colors ${activeClass?._id === cls._id ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-extrabold' : 'text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                        >
                           <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black flex items-center justify-center text-[10px]">
                              {cls.name[0].toUpperCase()}
                           </div>
                           <span className="truncate">{cls.name}</span>
                        </button>
                     ))}
                  </div>
               </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
               
               {/* ---------------------------------------------------- */}
               {/* VIEW 1: GOOGLE CLASSROOM DASHBOARD GRID              */}
               {/* ---------------------------------------------------- */}
               {!activeClass ? (
                  <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                     
                     {/* Dashboard Header Bar */}
                     <div className="flex justify-between items-center bg-white dark:bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
                              <BookOpen size={22} />
                           </div>
                           <div>
                              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Google Classroom Dashboard</h1>
                              <p className="text-xs text-[var(--text-secondary)] font-semibold">Active enrolled courses, study streams, and teachers</p>
                           </div>
                        </div>
                        <button onClick={() => setShowJoinModal(true)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105">
                           <Plus size={18} /> Join Class
                        </button>
                     </div>

                     {/* PENDING INVITES */}
                     {(invites || []).length > 0 && (
                        <div className="bg-amber-500/10 border-2 border-amber-500/30 p-6 rounded-3xl space-y-3">
                           <h2 className="text-xs font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider flex items-center gap-2">
                              <Mail size={16} /> Pending Classroom Invitations
                           </h2>
                           <div className="grid md:grid-cols-2 gap-4">
                              {(invites || []).map(inv => (
                                 <div key={inv._id} className="bg-white dark:bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-color)] flex justify-between items-center shadow-sm">
                                    <div>
                                       <h3 className="font-extrabold text-sm text-[var(--text-primary)]">{inv.classId?.name || 'Classroom Invite'}</h3>
                                       <p className="text-xs text-[var(--text-secondary)]">Instructor: {inv.teacherId?.name || 'Faculty'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                       <button onClick={() => handleInviteResponse(inv._id, 'accepted')} className="px-4 py-2 bg-blue-600 text-white font-extrabold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-sm">Accept</button>
                                       <button onClick={() => handleInviteResponse(inv._id, 'rejected')} className="px-3 py-2 bg-gray-100 dark:bg-slate-800 text-[var(--text-secondary)] font-bold text-xs rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors">Decline</button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* CLASS CARDS GRID (MATCHING GOOGLE CLASSROOM UI) */}
                     {(classes || []).length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] p-8">
                           <BookOpen size={56} className="mx-auto mb-4 text-blue-500/50" />
                           <h3 className="text-xl font-extrabold mb-2">No Enrolled Classes</h3>
                           <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-md mx-auto font-medium">
                              Join a class using the 6-character code from your instructor or check pending email invites.
                           </p>
                           <button onClick={() => setShowJoinModal(true)} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl text-xs hover:bg-blue-700 shadow-md">
                              Enter Class Code
                           </button>
                        </div>
                     ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {(classes || []).map((cls, idx) => {
                              const grad = bgGradients[idx % bgGradients.length];
                              const teacherName = cls.teacherId?.name || 'Faculty';
                              const teacherInitial = teacherName[0]?.toUpperCase() || 'T';

                              return (
                                 <div 
                                    key={cls._id} 
                                    onClick={() => openClassroom(cls)}
                                    className="bg-white dark:bg-[var(--bg-surface)] rounded-3xl shadow-sm border border-[var(--border-color)] overflow-hidden hover:shadow-xl hover:border-blue-500/50 cursor-pointer transition-all flex flex-col group card-hover-lift"
                                 >
                                    {/* Card Header Banner */}
                                    <div className={`h-36 bg-gradient-to-r ${grad} p-5 text-white relative flex flex-col justify-between`}>
                                       <div className="flex justify-between items-start">
                                          <div>
                                             <h3 className="text-xl font-black group-hover:underline underline-offset-4 tracking-tight leading-tight">{cls.name}</h3>
                                             <p className="text-white/80 text-xs font-semibold mt-0.5">{cls.section || cls.subject || 'Section'}</p>
                                          </div>
                                          <button onClick={(e) => { e.stopPropagation(); }} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10">
                                             <MoreVertical size={18} />
                                          </button>
                                       </div>
                                       <p className="text-xs font-medium text-white/90">{teacherName}</p>

                                       {/* Overlapping Teacher Avatar */}
                                       <div className="absolute -bottom-6 right-5 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white border-4 border-white dark:border-[var(--bg-surface)] font-black text-xl flex items-center justify-center shadow-lg">
                                          {teacherInitial}
                                       </div>
                                    </div>

                                    {/* Card Body & Quick Shortcuts */}
                                    <div className="p-5 pt-8 flex-1 flex flex-col justify-between space-y-4">
                                       <div className="text-xs text-[var(--text-secondary)] font-medium">
                                          Due soon: <span className="text-[var(--text-primary)] font-bold">No work due soon</span>
                                       </div>
                                       <div className="border-t border-[var(--border-color)] pt-3 flex justify-end items-center gap-3 text-[var(--text-secondary)]">
                                          <button title="Class Folder" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"><Folder size={18} /></button>
                                          <button title="Submissions" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"><FileText size={18} /></button>
                                       </div>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     )}
                  </div>
               ) : (
                  /* ---------------------------------------------------- */
                  /* VIEW 2: ACTIVE CLASSROOM (STREAM, CLASSWORK, PEOPLE) */
                  /* ---------------------------------------------------- */
                  <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
                     
                     {/* Back Button */}
                     <button onClick={() => setActiveClass(null)} className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors">
                        <ArrowLeft size={16} /> Back to Dashboard
                     </button>

                     {/* TOP SUB-TAB NAVIGATION (STREAM | CLASSWORK | PEOPLE) */}
                     <div className="flex border-b border-[var(--border-color)] bg-white dark:bg-[var(--bg-surface)] rounded-2xl p-1 shadow-sm font-bold text-xs">
                        <button 
                           onClick={() => setActiveTab('stream')} 
                           className={`flex-1 py-3 text-center rounded-xl transition-all ${activeTab === 'stream' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                           Stream
                        </button>
                        <button 
                           onClick={() => setActiveTab('classwork')} 
                           className={`flex-1 py-3 text-center rounded-xl transition-all ${activeTab === 'classwork' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                           Classwork
                        </button>
                        <button 
                           onClick={() => setActiveTab('people')} 
                           className={`flex-1 py-3 text-center rounded-xl transition-all ${activeTab === 'people' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                           People
                        </button>
                     </div>

                     {/* CLASSROOM HERO BANNER HEADER */}
                     <div className="h-44 md:h-52 bg-gradient-to-r from-orange-500 via-amber-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white relative shadow-lg flex flex-col justify-between overflow-hidden">
                        <div className="space-y-1 z-10">
                           <h1 className="text-3xl md:text-4xl font-black tracking-tight">{activeClass.name}</h1>
                           <p className="text-orange-100 text-sm font-bold">{activeClass.subject} • Section {activeClass.section || 'General'}</p>
                        </div>
                        <div className="flex justify-between items-end z-10">
                           <div className="text-xs font-semibold text-white/90">Instructor: {activeClass.teacherId?.name || 'Faculty'}</div>
                           <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-mono font-bold border border-white/20">Code: {activeClass.code}</div>
                        </div>
                     </div>

                     {/* ── TAB 1: STREAM ────────────────────────────────────────────── */}
                     {activeTab === 'stream' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                           
                           {/* LEFT COLUMN: UPCOMING WORK CARD */}
                           <div className="md:col-span-1 space-y-4">
                              <div className="bg-white dark:bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-3">
                                 <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Upcoming</h3>
                                 <p className="text-xs text-[var(--text-secondary)]">Woohoo, no work due soon!</p>
                                 <button onClick={() => setActiveTab('classwork')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">View all</button>
                              </div>
                           </div>

                           {/* RIGHT COLUMN: ANNOUNCEMENT INPUT + STREAM FEED */}
                           <div className="md:col-span-3 space-y-4">
                              
                              {/* New Announcement Box */}
                              <div className="bg-white dark:bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
                                 {!showAnnouncementBox ? (
                                    <button onClick={() => setShowAnnouncementBox(true)} className="w-full flex items-center gap-3 text-xs text-[var(--text-secondary)] font-semibold p-3 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 transition-colors">
                                       <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">{user?.name ? user.name[0].toUpperCase() : 'U'}</div>
                                       <span>Announce something to your class...</span>
                                    </button>
                                 ) : (
                                    <form onSubmit={handlePostAnnouncement} className="space-y-3">
                                       <textarea 
                                          required 
                                          className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-blue-500 h-28" 
                                          placeholder="Announce something to your class..." 
                                          value={newAnnouncementText} 
                                          onChange={e => setNewAnnouncementText(e.target.value)} 
                                       />
                                       <div className="flex justify-end gap-2">
                                          <button type="button" onClick={() => setShowAnnouncementBox(false)} className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)]">Cancel</button>
                                          <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-extrabold rounded-xl text-xs shadow-md hover:bg-blue-700">Post</button>
                                       </div>
                                    </form>
                                 )}
                              </div>

                              {/* STREAM FEED ITEMS */}
                              <div className="space-y-3">
                                 {(announcements || []).map((ann, i) => (
                                    <div key={ann._id || i} className="bg-white dark:bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-3">
                                       <div className="flex justify-between items-start">
                                          <div className="flex items-center gap-3">
                                             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                                                {ann.authorId?.name ? ann.authorId.name[0].toUpperCase() : 'A'}
                                             </div>
                                             <div>
                                                <h4 className="font-extrabold text-sm text-[var(--text-primary)]">{ann.authorId?.name || 'Classroom Faculty'}</h4>
                                                <p className="text-[10px] text-[var(--text-secondary)] font-medium">{ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : 'Recently'}</p>
                                             </div>
                                          </div>
                                          <button className="text-[var(--text-secondary)] p-1 hover:bg-gray-100 rounded-full"><MoreVertical size={16} /></button>
                                       </div>
                                       <p className="text-xs text-[var(--text-primary)] font-medium whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                                    </div>
                                 ))}

                                 {(classAssignments || []).map(assign => (
                                    <div key={assign._id} className="bg-white dark:bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setActiveTab('classwork')}>
                                       <div className="flex items-center gap-3">
                                          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl"><FileText size={20} /></div>
                                          <div>
                                             <h4 className="font-extrabold text-xs text-[var(--text-primary)]">{activeClass.teacherId?.name || 'Faculty'} posted a new assignment: {assign.title}</h4>
                                             <p className="text-[10px] text-[var(--text-secondary)]">{assign.deadline ? new Date(assign.deadline).toLocaleDateString() : 'Recently'}</p>
                                          </div>
                                       </div>
                                       <MoreVertical size={16} className="text-[var(--text-secondary)]" />
                                    </div>
                                 ))}
                              </div>

                           </div>
                        </div>
                     )}

                     {/* ── TAB 2: CLASSWORK ─────────────────────────────────────────── */}
                     {activeTab === 'classwork' && (
                        <div className="space-y-6">
                           <div className="bg-white dark:bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-4">
                              <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)]">Assigned Classwork & Study Materials</h2>
                              
                              {(classAssignments || []).length === 0 ? <p className="text-xs text-[var(--text-secondary)] italic">No assignments posted for this class yet.</p> : (
                                 <div className="space-y-4">
                                    {(classAssignments || []).map(assign => {
                                       const isTurnedIn = (assign.submissions || []).some(s => s.studentId === user?.id || s.studentId === user?._id);
                                       return (
                                          <div key={assign._id} className="bg-[var(--bg-base)] p-5 rounded-2xl border border-[var(--border-color)] space-y-4">
                                             <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                   <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl"><FileText size={20} /></div>
                                                   <div>
                                                      <h4 className="font-extrabold text-sm text-[var(--text-primary)]">{assign.title}</h4>
                                                      <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{assign.description || 'Complete the assignment steps below.'}</p>
                                                   </div>
                                                </div>
                                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase ${isTurnedIn ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'}`}>
                                                   {isTurnedIn ? 'Turned In' : 'Assigned'}
                                                </span>
                                             </div>

                                             {(assign.questions || []).length > 0 && (
                                                <div className="space-y-3 border-t border-[var(--border-color)] pt-3">
                                                   {(assign.questions || []).map((q, idx) => (
                                                      <div key={idx} className="bg-white dark:bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-color)] text-xs space-y-2">
                                                         <div className="font-extrabold text-[var(--text-primary)] flex items-center justify-between">
                                                            <span>Question {idx + 1}: {q.questionText}</span>
                                                            <span className="text-[10px] uppercase text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-md font-extrabold">{q.type}</span>
                                                         </div>
                                                         {q.type === 'voice' ? (
                                                            <div className="flex items-center gap-2">
                                                               <button type="button" onClick={() => handleVoiceRecord(idx)} className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${recordingIndex === idx ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                                                                  <Mic size={14} /> {recordingIndex === idx ? 'Recording...' : 'Record Answer'}
                                                               </button>
                                                               {questionAnswers[idx] && <span className="text-emerald-600 font-bold text-xs flex items-center gap-1"><Check size={12} /> Recorded</span>}
                                                            </div>
                                                         ) : (
                                                            <input type="text" placeholder="Type your answer..." className="w-full p-2.5 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-blue-500 font-medium" value={questionAnswers[idx] || ''} onChange={e => setQuestionAnswers({ ...questionAnswers, [idx]: e.target.value })} />
                                                         )}
                                                      </div>
                                                   ))}
                                                </div>
                                             )}

                                             {/* DOCUMENT FILE UPLOAD ATTACHMENT SECTION */}
                                             {!isTurnedIn && (
                                                <div className="space-y-3 border-t border-[var(--border-color)] pt-3">
                                                   <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                                                      <Paperclip size={14} /> Attach Document Submission (PDF, DOCX, TXT, PNG, JPG, WebM)
                                                   </label>
                                                   <div className="flex items-center gap-3">
                                                      <label className="px-4 py-2 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-blue-500 rounded-xl text-xs font-bold text-[var(--text-primary)] cursor-pointer flex items-center gap-2 shadow-sm transition-all">
                                                         <UploadCloud size={16} className="text-blue-600" />
                                                         <span>{submissionFile ? submissionFile.name : "Choose Document File"}</span>
                                                         <input 
                                                            type="file" 
                                                            hidden 
                                                            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webm,.pptx"
                                                            onChange={(e) => setSubmissionFile(e.target.files[0])} 
                                                         />
                                                      </label>
                                                      {submissionFile && (
                                                         <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                                                            <span>{(submissionFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                                            <button type="button" onClick={() => setSubmissionFile(null)} className="text-red-500 hover:opacity-80"><X size={14} /></button>
                                                         </div>
                                                      )}
                                                   </div>

                                                   {(!assign.questions || assign.questions.length === 0) && (
                                                      <textarea 
                                                         className="w-full p-3 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] h-20 outline-none focus:border-blue-500" 
                                                         placeholder="Add comments or text notes for your submission..." 
                                                         value={submissionText} 
                                                         onChange={e => setSubmissionText(e.target.value)} 
                                                      />
                                                   )}

                                                   <button onClick={() => handleTurnIn(assign._id, (assign.questions || []).length > 0)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2">
                                                      <CheckCircle size={16} /> Turn In Assignment
                                                   </button>
                                                </div>
                                             )}
                                          </div>
                                       );
                                    })}
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {/* ── TAB 3: PEOPLE ────────────────────────────────────────────── */}
                     {activeTab === 'people' && (
                        <div className="space-y-6">
                           
                           {/* Teachers Section */}
                           <div className="bg-white dark:bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-4">
                              <h2 className="text-xl font-black text-blue-600 border-b border-[var(--border-color)] pb-3">Teachers</h2>
                              <div className="flex items-center gap-4 py-2">
                                 <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                                    {activeClass.teacherId?.name ? activeClass.teacherId.name[0].toUpperCase() : 'T'}
                                 </div>
                                 <div>
                                    <h3 className="font-extrabold text-sm text-[var(--text-primary)]">{activeClass.teacherId?.name || 'Course Instructor'}</h3>
                                    <p className="text-xs text-[var(--text-secondary)]">Primary Faculty • {activeClass.subject}</p>
                                 </div>
                              </div>
                           </div>

                           {/* Classmates Section */}
                           <div className="bg-white dark:bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-4">
                              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
                                 <h2 className="text-xl font-black text-blue-600">Classmates</h2>
                                 <span className="text-xs font-bold text-[var(--text-secondary)]">{(activeClass.students || []).length} Students</span>
                              </div>
                              <div className="space-y-2">
                                 {(activeClass.students || []).map(student => (
                                    <div key={student._id} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                       <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 font-extrabold text-xs flex items-center justify-center">
                                             {student.name ? student.name[0].toUpperCase() : 'S'}
                                          </div>
                                          <span className="font-bold text-xs text-[var(--text-primary)]">{student.name}</span>
                                       </div>
                                       {student.learningProfile && student.learningProfile !== 'DEFAULT' && (
                                          <span className="text-[10px] bg-purple-500/10 text-purple-600 font-extrabold px-2.5 py-0.5 rounded-full border border-purple-500/20">
                                             {student.learningProfile}
                                          </span>
                                       )}
                                    </div>
                                 ))}
                              </div>
                           </div>

                        </div>
                     )}

                  </div>
               )}

            </main>
         </div>

         {/* JOIN CLASS MODAL */}
         {showJoinModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <form onSubmit={handleJoin} className="bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-color)] p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in-up">
                  <h2 className="text-xl font-black mb-2 text-[var(--text-primary)]">Join Classroom</h2>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mb-4">Enter the 6-character class code provided by your instructor.</p>
                  
                  <div className="mb-4 text-xs font-bold">
                     <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        Class Code <span className="text-red-500">*</span>
                     </label>
                     <input required type="text" className="w-full p-3 bg-gray-50 dark:bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-center font-mono font-black text-lg tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-blue-500 uppercase" placeholder="e.g. A1B2C3" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
                  </div>

                  <div className="flex gap-3">
                     <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 py-2.5 text-[var(--text-secondary)] font-bold text-xs">Cancel</button>
                     <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-extrabold rounded-xl text-xs hover:bg-blue-700 shadow-md">Join Class</button>
                  </div>
               </form>
            </div>
         )}
      </div>
   );
};

export default Classroom;
