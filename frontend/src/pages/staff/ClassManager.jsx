import React, { useState, useEffect } from 'react';
import StaffNavbar from '../../components/StaffNavbar';
import { 
   Users, Plus, Copy, Check, BookOpen, Mail, Send, ClipboardCheck, Calendar, 
   FileText, Mic, List, Type, X, Trophy, ChevronDown, ChevronRight, Eye, Home, 
   MoreVertical, Folder, ArrowLeft, UploadCloud, Sparkles, CheckCircle, AlertCircle, Download, Paperclip 
} from 'lucide-react';
import { 
   createClass, 
   getLevels, 
   getTeacherClasses, 
   inviteStudent, 
   getAssignmentsByClass,
   getClassSubmissions,
   createAssignment, 
   assignLevelToClass,
   getAnnouncementsByClass,
   createAnnouncement
} from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const ClassManager = () => {
    const user = useAuthStore(s => s.user);
    const [classes, setClasses] = useState([]);
    const [activeClass, setActiveClass] = useState(null); // null = Dashboard Grid View
    const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'classwork' | 'people' | 'grades'
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Modals State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', section: '', subject: '', room: '', capacity: 60 });
    const [copiedId, setCopiedId] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [showAssessModal, setShowAssessModal] = useState(false);
    const [availableLevels, setAvailableLevels] = useState([]);

    // Stream Announcements State
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncementText, setNewAnnouncementText] = useState('');
    const [showAnnouncementBox, setShowAnnouncementBox] = useState(false);

    // Assignment State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignmentData, setAssignmentData] = useState({ title: '', description: '', deadline: '', questions: [] });
    const [newQuestion, setNewQuestion] = useState({ type: 'text', questionText: '', options: [] });
    const [optionText, setOptionText] = useState('');

    // Detailed Class Assignments & Submissions
    const [detailedAssignments, setDetailedAssignments] = useState([]);
    const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);

    // Rich Submissions (with student names) — loaded when Grades tab opens
    // WHY separate: This hits /submissions endpoint which batch-fetches student names
    const [richSubmissions, setRichSubmissions] = useState([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);

    // Toast State
    const [toast, setToast] = useState(null);

    const bgGradients = [
        'from-purple-700 via-indigo-700 to-purple-900',
        'from-amber-600 via-orange-600 to-amber-700',
        'from-slate-700 via-blue-800 to-slate-900',
        'from-blue-600 via-cyan-700 to-blue-800',
        'from-emerald-700 via-teal-800 to-emerald-900',
    ];

    useEffect(() => {
        fetchClasses();
        fetchLevels();
    }, []);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchClasses = async () => {
        try {
            const data = await getTeacherClasses();
            setClasses(data?.classes || data || []);
        } catch (err) { 
            console.error(err); 
            setClasses([]); 
        }
    };

    const fetchLevels = async () => {
        try {
            const data = await getLevels();
            if (data && data.levels) setAvailableLevels(data.levels || []);
            else if (Array.isArray(data)) setAvailableLevels(data);
        } catch (err) { 
            console.error(err); 
            setAvailableLevels([]); 
        }
    };

    const openClassroom = async (cls) => {
        setActiveClass(cls);
        setActiveTab('stream');
        setRichSubmissions([]);
        fetchClassStreamData(cls._id);
    };

    const fetchClassStreamData = async (classId) => {
        try {
            const annData = await getAnnouncementsByClass(classId);
            setAnnouncements(annData.announcements || annData || []);
        } catch (e) { setAnnouncements([]); }

        try {
            const assignData = await getAssignmentsByClass(classId);
            setDetailedAssignments(assignData.assignments || assignData || []);
        } catch (e) { setDetailedAssignments([]); }
    };

    // fetchRichSubmissions: called only when Grades tab is opened.
    // WHY lazy load: avoids fetching student info on every tab switch.
    // The /submissions route does a batch User lookup for all studentIds —
    // so we get names + emails in 2 DB queries total (not N+1).
    const fetchRichSubmissions = async (classId) => {
        setSubmissionsLoading(true);
        try {
            const data = await getClassSubmissions(classId);
            setRichSubmissions(data.assignments || []);
        } catch (e) {
            console.error('Failed to fetch submissions:', e);
            setRichSubmissions([]);
        } finally {
            setSubmissionsLoading(false);
        }
    };

    const handleCreateClass = async (e) => {
        if (e) e.preventDefault();
        if (!newClass.name || !newClass.subject) return showToast("Please fill in all mandatory fields (*)", "error");
        try {
            const data = await createClass({ ...newClass, capacity: Number(newClass.capacity) });
            if (data.success || data.class) {
                showToast("Classroom created successfully!", "success");
                setShowCreateModal(false);
                setNewClass({ name: '', section: '', subject: '', room: '', capacity: 60 });
                fetchClasses();
            }
        } catch (err) { 
            showToast(err.response?.data?.error?.message || err.response?.data?.message || "Failed to create class", "error"); 
        }
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

    const handleInvite = async (e) => {
        if (e) e.preventDefault();
        const targetClassId = activeClass?._id;
        if (!inviteEmail || !targetClassId) return showToast("Student email is required (*)", "error");
        try {
            const data = await inviteStudent(inviteEmail, targetClassId);
            if (data.success) {
                showToast(`Invitation sent to ${inviteEmail}!`, "success");
                setShowInviteModal(false);
                setInviteEmail('');
            } else { 
                showToast(data.error?.message || data.message || "Failed to send invitation", "error"); 
            }
        } catch (err) { 
            showToast(err.response?.data?.error?.message || err.response?.data?.message || "Error sending invitation", "error"); 
        }
    };

    const handleAssignLevel = async (levelId) => {
        if (!activeClass) return;
        try {
            const data = await assignLevelToClass(activeClass._id, levelId);
            if (data.success) { 
                showToast("Game Level assigned to class!", "success"); 
                setShowAssessModal(false);
                fetchClassStreamData(activeClass._id); 
            } else {
                showToast(data.error?.message || data.message || "Failed to assign level", "error"); 
            }
        } catch (err) { 
            showToast(err.response?.data?.error?.message || err.response?.data?.message || "Error assigning level", "error"); 
        }
    };

    const handleCreateAssignment = async (e) => {
        if (e) e.preventDefault();
        if (!assignmentData.title || !assignmentData.deadline) return showToast("Title and Deadline are required (*)", "error");
        try {
            const data = await createAssignment({
                classId: activeClass._id,
                title: assignmentData.title,
                description: assignmentData.description,
                deadline: assignmentData.deadline,
                questions: assignmentData.questions || [],
                toolsAllowed: { dyslexia: true, dyscalculia: true }
            });
            if (data.success || data.assignment) {
                showToast("Assignment created & assigned!", "success");
                setShowAssignModal(false);
                setAssignmentData({ title: '', description: '', deadline: '', questions: [] });
                fetchClassStreamData(activeClass._id);
            } else {
                showToast(data.error?.message || data.message || "Failed to create assignment", "error");
            }
        } catch (err) { 
            showToast(err.response?.data?.error?.message || err.response?.data?.message || "Error creating assignment", "error"); 
        }
    };

    const addQuestion = () => {
        if (!newQuestion.questionText) return;
        setAssignmentData({
            ...assignmentData,
            questions: [...(assignmentData.questions || []), { ...newQuestion }]
        });
        setNewQuestion({ type: 'text', questionText: '', options: [] });
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedId(code);
        showToast("Class code copied!", "success");
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors flex flex-col font-sans">
            <StaffNavbar />

            {/* TOAST CONTAINER */}
            {toast && (
                <div className="fixed top-20 right-6 z-50 animate-bounce-subtle">
                    <div className={`px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md text-xs font-black ${
                        toast.type === 'success' 
                            ? 'bg-purple-600 text-white border-purple-400/50 shadow-purple-500/20' 
                            : toast.type === 'error'
                            ? 'bg-red-600 text-white border-red-400/50 shadow-red-500/20'
                            : 'bg-indigo-600 text-white border-indigo-400/50 shadow-indigo-500/20'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle size={18} /> : toast.type === 'error' ? <AlertCircle size={18} /> : <BookOpen size={18} />}
                        <span>{toast.message}</span>
                        <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80"><X size={14} /></button>
                    </div>
                </div>
            )}

            {/* BODY LAYOUT */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT SIDEBAR DRAWER */}
                <aside className={`w-64 bg-white dark:bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
                    <div className="p-4 space-y-1 text-sm font-semibold">
                        <button onClick={() => setActiveClass(null)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-r-full text-xs font-bold transition-colors ${!activeClass ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 font-extrabold' : 'text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                            <Home size={18} /> Home
                        </button>
                        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-r-full text-xs font-bold text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                            <Calendar size={18} /> Calendar
                        </button>

                        <div className="pt-4 border-t border-[var(--border-color)]">
                            <div className="px-4 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 flex items-center justify-between">
                                <span>My Classrooms ({classes.length})</span>
                                <button onClick={() => setShowCreateModal(true)} className="hover:text-purple-600"><Plus size={16} /></button>
                            </div>
                            {(classes || []).map((cls, idx) => (
                                <button 
                                    key={cls._id} 
                                    onClick={() => openClassroom(cls)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-r-full text-xs font-semibold truncate transition-colors ${activeClass?._id === cls._id ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 font-extrabold' : 'text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                                >
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black flex items-center justify-center text-[10px]">
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
                    {/* VIEW 1: STAFF DASHBOARD CLASSROOMS GRID             */}
                    {/* ---------------------------------------------------- */}
                    {!activeClass ? (
                        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                            
                            {/* Dashboard Header Bar */}
                            <div className="flex justify-between items-center bg-white dark:bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center font-black">
                                        <Users size={22} />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Faculty Classroom Portal</h1>
                                        <p className="text-xs text-[var(--text-secondary)] font-semibold">Manage student rosters, cognitive profiles, and stream assignments</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all hover:scale-105">
                                    <Plus size={20} /> Create New Class
                                </button>
                            </div>

                            {/* GOOGLE CLASSROOM CARD GRID */}
                            {(classes || []).length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] p-8">
                                    <Users size={56} className="mx-auto mb-4 text-purple-500/50" />
                                    <h3 className="text-xl font-extrabold mb-2">No Active Classrooms</h3>
                                    <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-md mx-auto font-medium">
                                        Create your first classroom to generate join codes and invite students.
                                    </p>
                                    <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-purple-600 text-white font-bold rounded-2xl text-xs hover:bg-purple-700 shadow-md">
                                        Create Classroom
                                    </button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(classes || []).map((cls, idx) => {
                                        const grad = bgGradients[idx % bgGradients.length];
                                        const teacherName = user?.name || 'Faculty';
                                        const teacherInitial = teacherName[0]?.toUpperCase() || 'T';

                                        return (
                                            <div 
                                                key={cls._id} 
                                                onClick={() => openClassroom(cls)}
                                                className="bg-white dark:bg-[var(--bg-surface)] rounded-3xl shadow-sm border border-[var(--border-color)] overflow-hidden hover:shadow-xl hover:border-purple-500/50 cursor-pointer transition-all flex flex-col group card-hover-lift"
                                            >
                                                {/* Header Banner */}
                                                <div className={`h-36 bg-gradient-to-r ${grad} p-5 text-white relative flex flex-col justify-between`}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-xl font-black group-hover:underline underline-offset-4 tracking-tight leading-tight">{cls.name}</h3>
                                                            <p className="text-white/80 text-xs font-semibold mt-0.5">{cls.section || cls.subject || 'Section'}</p>
                                                        </div>
                                                        <div onClick={(e) => { e.stopPropagation(); copyCode(cls.code); }} className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-xs font-mono font-bold cursor-pointer flex items-center gap-1 border border-white/20">
                                                            {cls.code} {copiedId === cls.code ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs font-medium text-white/90">Students: {(cls.students || []).length}</p>

                                                    {/* Overlapping Faculty Avatar */}
                                                    <div className="absolute -bottom-6 right-5 w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-700 text-white border-4 border-white dark:border-[var(--bg-surface)] font-black text-xl flex items-center justify-center shadow-lg">
                                                        {teacherInitial}
                                                    </div>
                                                </div>

                                                {/* Card Body & Quick Shortcuts */}
                                                <div className="p-5 pt-8 flex-1 flex flex-col justify-between space-y-4">
                                                    <div className="space-y-1 text-xs text-[var(--text-secondary)] font-semibold">
                                                        <div className="flex justify-between"><span>Subject:</span> <b className="text-[var(--text-primary)]">{cls.subject}</b></div>
                                                        <div className="flex justify-between"><span>Assigned Games:</span> <b className="text-[var(--text-primary)]">{(cls.assessments || []).length}</b></div>
                                                    </div>
                                                    <div className="border-t border-[var(--border-color)] pt-3 flex justify-between items-center text-xs font-extrabold text-purple-600 dark:text-purple-400">
                                                        <span>Open Classwork</span>
                                                        <ChevronRight size={16} />
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
                        /* VIEW 2: ACTIVE FACULTY CLASSROOM (STREAM, CLASSWORK, PEOPLE, GRADES) */
                        /* ---------------------------------------------------- */
                        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
                            
                            {/* Back Button */}
                            <button onClick={() => setActiveClass(null)} className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors">
                                <ArrowLeft size={16} /> Back to Dashboard
                            </button>

                            {/* TOP SUB-TAB NAVIGATION */}
                            <div className="flex border-b border-[var(--border-color)] bg-white dark:bg-[var(--bg-surface)] rounded-2xl p-1 shadow-sm font-bold text-xs">
                                <button 
                                    onClick={() => setActiveTab('stream')} 
                                    className={`flex-1 py-3 text-center rounded-xl transition-all ${activeTab === 'stream' ? 'bg-purple-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    Stream
                                </button>
                                <button 
                                    onClick={() => setActiveTab('classwork')} 
                                    className={`flex-1 py-3 text-center rounded-xl transition-all ${activeTab === 'classwork' ? 'bg-purple-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    Classwork
                                </button>
                                <button 
                                    onClick={() => setActiveTab('people')} 
                                    className={`flex-1 py-3 text-center rounded-xl transition-all ${activeTab === 'people' ? 'bg-purple-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    People ({(activeClass.students || []).length})
                                </button>
                                <button 
                                    onClick={() => { setActiveTab('grades'); fetchRichSubmissions(activeClass._id); }} 
                                    className={`flex-1 py-3 text-center rounded-xl transition-all ${activeTab === 'grades' ? 'bg-purple-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    Grades &amp; Submissions
                                </button>
                            </div>

                            {/* CLASSROOM HERO BANNER HEADER */}
                            <div className="h-44 md:h-52 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 rounded-3xl p-6 md:p-8 text-white relative shadow-lg flex flex-col justify-between overflow-hidden">
                                <div className="space-y-1 z-10">
                                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">{activeClass.name}</h1>
                                    <p className="text-purple-100 text-sm font-bold">{activeClass.subject} • Section {activeClass.section || 'General'}</p>
                                </div>
                                <div className="flex justify-between items-end z-10">
                                    <div className="text-xs font-semibold text-white/90">Instructor: {user?.name || 'Faculty'} • Room: {activeClass.room || 'Online'}</div>
                                    <div onClick={() => copyCode(activeClass.code)} className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-mono font-bold border border-white/20 cursor-pointer flex items-center gap-1.5 hover:bg-black/50 transition-colors">
                                        Class Code: {activeClass.code} <Copy size={12} />
                                    </div>
                                </div>
                            </div>

                            {/* ── TAB 1: STREAM ────────────────────────────────────────────── */}
                            {activeTab === 'stream' && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                   
                                   {/* LEFT COLUMN: CLASS CODE & UPCOMING */}
                                   <div className="md:col-span-1 space-y-4">
                                      <div className="bg-white dark:bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-2">
                                         <h3 className="font-extrabold text-xs uppercase text-[var(--text-secondary)] tracking-wider">Class Code</h3>
                                         <div className="text-2xl font-black text-purple-600 font-mono flex items-center justify-between">
                                            <span>{activeClass.code}</span>
                                            <button onClick={() => copyCode(activeClass.code)} className="p-1 hover:bg-purple-50 rounded-lg text-purple-600"><Copy size={16} /></button>
                                         </div>
                                      </div>

                                      <div className="bg-white dark:bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-3">
                                         <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Upcoming</h3>
                                         <p className="text-xs text-[var(--text-secondary)]">No work due soon!</p>
                                      </div>
                                   </div>

                                   {/* RIGHT COLUMN: ANNOUNCEMENT INPUT + STREAM FEED */}
                                   <div className="md:col-span-3 space-y-4">
                                      
                                      {/* New Announcement Box */}
                                      <div className="bg-white dark:bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
                                         {!showAnnouncementBox ? (
                                            <button onClick={() => setShowAnnouncementBox(true)} className="w-full flex items-center gap-3 text-xs text-[var(--text-secondary)] font-semibold p-3 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 transition-colors">
                                               <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">{user?.name ? user.name[0].toUpperCase() : 'F'}</div>
                                               <span>Announce something to your class...</span>
                                            </button>
                                         ) : (
                                            <form onSubmit={handlePostAnnouncement} className="space-y-3">
                                               <textarea 
                                                  required 
                                                  className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-purple-500 h-28" 
                                                  placeholder="Announce something to your class..." 
                                                  value={newAnnouncementText} 
                                                  onChange={e => setNewAnnouncementText(e.target.value)} 
                                               />
                                               <div className="flex justify-end gap-2">
                                                  <button type="button" onClick={() => setShowAnnouncementBox(false)} className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)]">Cancel</button>
                                                  <button type="submit" className="px-5 py-2 bg-purple-600 text-white font-extrabold rounded-xl text-xs shadow-md hover:bg-purple-700">Post Announcement</button>
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
                                                     <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-700 text-white font-black flex items-center justify-center text-sm shadow-sm">
                                                        {ann.authorId?.name ? ann.authorId.name[0].toUpperCase() : 'F'}
                                                     </div>
                                                     <div>
                                                        <h4 className="font-extrabold text-sm text-[var(--text-primary)]">{ann.authorId?.name || 'Faculty'}</h4>
                                                        <p className="text-[10px] text-[var(--text-secondary)] font-medium">{ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : 'Recently'}</p>
                                                     </div>
                                                  </div>
                                                  <button className="text-[var(--text-secondary)] p-1 hover:bg-gray-100 rounded-full"><MoreVertical size={16} /></button>
                                               </div>
                                               <p className="text-xs text-[var(--text-primary)] font-medium whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                                            </div>
                                         ))}

                                         {(detailedAssignments || []).map(assign => (
                                            <div key={assign._id} className="bg-white dark:bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setActiveTab('classwork')}>
                                               <div className="flex items-center gap-3">
                                                  <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl"><FileText size={20} /></div>
                                                  <div>
                                                     <h4 className="font-extrabold text-xs text-[var(--text-primary)]">You posted a new assignment: {assign.title}</h4>
                                                     <p className="text-[10px] text-[var(--text-secondary)]">Due: {assign.deadline ? new Date(assign.deadline).toLocaleDateString() : 'N/A'} • {(assign.submissions || []).length} submissions</p>
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
                                   <div className="bg-white dark:bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-6">
                                      <div className="flex justify-between items-center">
                                         <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)]">Classwork & Materials Management</h2>
                                         <div className="flex gap-2">
                                            <button onClick={() => setShowAssignModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-xl font-extrabold text-xs shadow-md flex items-center gap-1.5 hover:bg-purple-700">
                                               <Plus size={16} /> Create Assignment
                                            </button>
                                            <button onClick={() => setShowAssessModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-extrabold text-xs shadow-md flex items-center gap-1.5 hover:bg-emerald-700">
                                               <Trophy size={16} /> Assign Game Level
                                            </button>
                                         </div>
                                      </div>

                                      {(detailedAssignments || []).length === 0 ? <p className="text-xs text-[var(--text-secondary)] italic py-6">No assignments created yet. Click "+ Create Assignment" to get started.</p> : (
                                         <div className="space-y-4">
                                            {(detailedAssignments || []).map(assign => (
                                               <div key={assign._id} className="bg-[var(--bg-base)] p-5 rounded-2xl border border-[var(--border-color)] space-y-3">
                                                  <div className="flex justify-between items-start">
                                                     <div className="flex items-center gap-3">
                                                        <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl"><FileText size={20} /></div>
                                                        <div>
                                                           <h4 className="font-extrabold text-sm text-[var(--text-primary)]">{assign.title}</h4>
                                                           <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{assign.description || 'Assignment for enrolled students.'}</p>
                                                        </div>
                                                     </div>
                                                     <span className="text-xs font-extrabold text-purple-600 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                                        {(assign.submissions || []).length} Submissions
                                                     </span>
                                                  </div>
                                               </div>
                                            ))}
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
                                      <h2 className="text-xl font-black text-purple-600 border-b border-[var(--border-color)] pb-3">Teachers</h2>
                                      <div className="flex items-center gap-4 py-2">
                                         <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-md">
                                            {user?.name ? user.name[0].toUpperCase() : 'F'}
                                         </div>
                                         <div>
                                            <h3 className="font-extrabold text-sm text-[var(--text-primary)]">{user?.name || 'Faculty Member'}</h3>
                                            <p className="text-xs text-[var(--text-secondary)]">Primary Course Instructor</p>
                                         </div>
                                      </div>
                                   </div>

                                   {/* Enrolled Students Section */}
                                   <div className="bg-white dark:bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-4">
                                      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
                                         <h2 className="text-xl font-black text-purple-600">Enrolled Students ({(activeClass.students || []).length})</h2>
                                         <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-extrabold text-xs shadow-md flex items-center gap-1.5 hover:bg-blue-700">
                                            <Mail size={16} /> Invite Student
                                         </button>
                                      </div>
                                      <div className="space-y-2">
                                         {(activeClass.students || []).map(student => (
                                            <div key={student._id} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                               <div className="flex items-center gap-3">
                                                  <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-600 font-extrabold text-xs flex items-center justify-center">
                                                     {student.name ? student.name[0].toUpperCase() : 'S'}
                                                  </div>
                                                  <div>
                                                     <div className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-2">
                                                        {student.name}
                                                        {student.learningProfile && student.learningProfile !== 'DEFAULT' && (
                                                           <span className="text-[10px] bg-purple-500/10 text-purple-600 font-extrabold px-2 py-0.5 rounded-full border border-purple-500/20">
                                                              {student.learningProfile}
                                                           </span>
                                                        )}
                                                     </div>
                                                     <p className="text-[10px] text-[var(--text-secondary)]">{student.email}</p>
                                                  </div>
                                               </div>
                                               <div className="text-right text-xs">
                                                  <span className="text-[10px] text-[var(--text-secondary)] block font-bold">Prelims Score</span>
                                                  <b className="text-purple-600 font-black">{student.prelimsScore !== undefined ? `${student.prelimsScore}%` : 'N/A'}</b>
                                               </div>
                                            </div>
                                         ))}
                                         {(!activeClass.students || activeClass.students.length === 0) && (
                                             <p className="text-xs text-[var(--text-secondary)] italic py-4">No students enrolled yet. Click "Invite Student" to send email invitations.</p>
                                          )}
                                       </div>
                                    </div>

                                 </div>
                             )}
                            {activeTab === 'grades' && (
                                <div className="space-y-4">
                                   {/* Header */}
                                   <div className="flex items-center justify-between bg-white dark:bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm">
                                      <div>
                                         <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">Grades &amp; Submissions</h2>
                                         <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">All student work turned in — click Open Document to view the file directly.</p>
                                      </div>
                                      <button
                                         onClick={() => fetchRichSubmissions(activeClass._id)}
                                         className="px-4 py-2 text-xs font-extrabold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors flex items-center gap-2"
                                      >
                                         ↻ Refresh
                                      </button>
                                   </div>

                                   {/* Loading state */}
                                   {submissionsLoading && (
                                      <div className="flex items-center justify-center py-16">
                                         <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-xs font-bold text-[var(--text-secondary)]">Loading student submissions…</p>
                                         </div>
                                      </div>
                                   )}

                                   {/* Assignments with submissions */}
                                   {!submissionsLoading && (richSubmissions || []).map(assign => {
                                      const submissionCount = (assign.submissions || []).length;
                                      const lateCount = (assign.submissions || []).filter(s => s.status === 'late').length;
                                      return (
                                         <div key={assign._id} className="bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                                            {/* Assignment Header */}
                                            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-5 py-4 flex items-center justify-between">
                                               <div>
                                                  <h3 className="font-extrabold text-sm text-white">{assign.title}</h3>
                                                  <p className="text-[11px] text-purple-200 mt-0.5">
                                                     Due: {assign.deadline ? new Date(assign.deadline).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : 'No deadline'}
                                                  </p>
                                               </div>
                                               <div className="flex gap-2">
                                                  <span className="bg-white/20 text-white text-[11px] font-extrabold px-3 py-1 rounded-full">
                                                     {submissionCount} Turned In
                                                  </span>
                                                  {lateCount > 0 && (
                                                     <span className="bg-red-500/80 text-white text-[11px] font-extrabold px-3 py-1 rounded-full">
                                                        {lateCount} Late
                                                     </span>
                                                  )}
                                               </div>
                                            </div>

                                            {/* Submissions List */}
                                            <div className="divide-y divide-[var(--border-color)]">
                                               {submissionCount === 0 && (
                                                  <div className="p-8 text-center text-xs text-[var(--text-secondary)] italic">No submissions turned in yet for this assignment.</div>
                                               )}
                                               {(assign.submissions || []).map((sub, i) => (
                                                  <div key={i} className="p-4 flex gap-4 items-start hover:bg-purple-50/30 dark:hover:bg-purple-500/5 transition-colors">
                                                     {/* Student Avatar */}
                                                     <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                                                        {(sub.studentName || 'S')[0].toUpperCase()}
                                                     </div>

                                                     {/* Submission Details */}
                                                     <div className="flex-1 min-w-0 space-y-2">
                                                        {/* Student identity row */}
                                                        <div className="flex flex-wrap items-center gap-2">
                                                           <span className="font-extrabold text-sm text-[var(--text-primary)]">{sub.studentName || 'Unknown Student'}</span>
                                                           <span className="text-[11px] text-[var(--text-secondary)]">{sub.studentEmail}</span>
                                                           {sub.learningProfile && sub.learningProfile !== 'DEFAULT' && (
                                                              <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                                                 {sub.learningProfile}
                                                              </span>
                                                           )}
                                                           <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                                              sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                              sub.status === 'late'   ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                           }`}>
                                                              {sub.status === 'turned_in' ? '✓ Turned In' : sub.status === 'late' ? '⚠ Late' : '★ Graded'}
                                                           </span>
                                                           <span className="text-[10px] text-[var(--text-secondary)] ml-auto whitespace-nowrap">
                                                              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' }) : 'Recently'}
                                                           </span>
                                                        </div>

                                                        {/* Document attachment resolution */}
                                                        {(() => {
                                                           let rawUrl = sub.attachmentUrl || sub.attachment || (typeof sub.content === 'string' && (sub.content.startsWith('http') || sub.content.includes('/uploads/')) ? sub.content : null);
                                                           let docUrl = rawUrl;
                                                           if (docUrl && !docUrl.startsWith('http://') && !docUrl.startsWith('https://')) {
                                                              docUrl = `http://localhost:5000${docUrl.startsWith('/') ? '' : '/'}${docUrl}`;
                                                           }
                                                           const isContentUrl = typeof sub.content === 'string' && (sub.content.startsWith('http') || sub.content.includes('/uploads/'));
                                                           return (
                                                              <>
                                                                 {sub.content && !isContentUrl && (
                                                                    <div className="bg-gray-50 dark:bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl p-3 text-[11px] text-[var(--text-primary)] font-mono leading-relaxed max-h-24 overflow-y-auto">
                                                                       {sub.content}
                                                                    </div>
                                                                 )}

                                                                 {docUrl && (
                                                                    <div className="flex items-center gap-3 mt-1.5">
                                                                       <a
                                                                          href={docUrl}
                                                                          target="_blank"
                                                                          rel="noreferrer"
                                                                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-extrabold shadow-md hover:shadow-purple-500/30 transition-all cursor-pointer"
                                                                       >
                                                                          <Download size={14} />
                                                                          Open Document
                                                                       </a>
                                                                       <span className="text-[10px] text-[var(--text-secondary)] font-mono truncate max-w-xs">
                                                                          {sub.attachmentName || (docUrl.split('/').pop()) || 'Attached Document'}
                                                                       </span>
                                                                    </div>
                                                                 )}
                                                              </>
                                                           );
                                                        })()}
                                                     </div>
                                                  </div>
                                               ))}
                                            </div>
                                         </div>
                                      );
                                   })}
                                   {/* Empty state — no assignments at all */}
                                   {!submissionsLoading && richSubmissions.length === 0 && (
                                      <div className="text-center py-20 bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)]">
                                         <ClipboardCheck size={48} className="mx-auto mb-4 text-purple-500/40" />
                                         <h3 className="text-base font-extrabold text-[var(--text-primary)] mb-2">No Assignments Yet</h3>
                                         <p className="text-xs text-[var(--text-secondary)]">Create an assignment in the Classwork tab. Student submissions will appear here.</p>
                                      </div>
                                   )}
                                </div>
                            )}

                        </div>
                    )}

                </main>
            </div>

            {/* CREATE CLASS MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreateClass} className="bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-color)] p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up">
                        <h2 className="text-2xl font-black mb-2 text-[var(--text-primary)] tracking-tight">Create Classroom</h2>
                        <p className="text-xs text-[var(--text-secondary)] font-medium mb-6">Fill in class details. Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.</p>
                        
                        <div className="space-y-4 text-xs font-bold">
                            <div>
                                <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                    Classroom Name <span className="text-red-500">*</span>
                                </label>
                                <input required className="w-full p-3 bg-gray-50 dark:bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] outline-none focus:border-purple-500" placeholder="e.g. Literacy & Grammar 101" value={newClass.name} onChange={e => setNewClass({ ...newClass, name: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <input required className="w-full p-3 bg-gray-50 dark:bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] outline-none focus:border-purple-500" placeholder="e.g. English Literature" value={newClass.subject} onChange={e => setNewClass({ ...newClass, subject: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                    Section <span className="text-[var(--text-secondary)] font-normal text-[10px] lowercase">(optional)</span>
                                </label>
                                <input className="w-full p-3 bg-gray-50 dark:bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] outline-none focus:border-purple-500" placeholder="e.g. Section A" value={newClass.section} onChange={e => setNewClass({ ...newClass, section: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                    Room Number <span className="text-[var(--text-secondary)] font-normal text-[10px] lowercase">(optional)</span>
                                </label>
                                <input className="w-full p-3 bg-gray-50 dark:bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] outline-none focus:border-purple-500" placeholder="e.g. Hall 302 or Lab B" value={newClass.room} onChange={e => setNewClass({ ...newClass, room: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 text-[var(--text-secondary)] font-bold rounded-xl text-xs hover:bg-[var(--bg-base)]">Cancel</button>
                            <button type="submit" className="flex-1 py-3 bg-purple-600 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-purple-600/20 hover:bg-purple-700">Create Class</button>
                        </div>
                    </form>
                </div>
            )}

            {/* INVITE MODAL */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleInvite} className="bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-color)] p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in-up">
                        <h2 className="text-xl font-black mb-1 text-[var(--text-primary)]">Invite Student</h2>
                        <p className="text-xs text-[var(--text-secondary)] font-medium mb-4">Send classroom invite link directly to student email.</p>
                        
                        <div className="mb-4 text-xs font-bold">
                            <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                Student Email <span className="text-red-500">*</span>
                            </label>
                            <input required type="email" className="w-full p-3 bg-gray-50 dark:bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500" placeholder="name@student.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 py-2.5 text-[var(--text-secondary)] font-bold text-xs">Cancel</button>
                            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-extrabold rounded-xl text-xs hover:bg-blue-700 shadow-md">Send Invitation</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ASSIGN GAME MODAL */}
            {showAssessModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-3xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-black flex items-center gap-2 text-[var(--text-primary)]"><Trophy className="text-emerald-500" /> Assign Level Game</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {(availableLevels || []).length === 0 ? <p className="text-center text-[var(--text-secondary)] py-10 text-xs italic">No levels created yet.</p> : (availableLevels || []).map(l => (
                                <div key={l._id} className="border border-[var(--border-color)] p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-[var(--bg-base)] flex justify-between items-center transition-colors">
                                    <div>
                                        <div className="font-extrabold text-sm text-[var(--text-primary)]">{l.title}</div>
                                        <div className="text-[10px] bg-purple-500/10 text-purple-600 font-bold px-2 py-0.5 rounded-md inline-block uppercase mt-1">{l.difficulty || 'Easy'}</div>
                                    </div>
                                    <button onClick={() => handleAssignLevel(l._id)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm">Assign</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowAssessModal(false)} className="mt-4 w-full py-2.5 bg-gray-100 dark:bg-[var(--bg-base)] text-[var(--text-secondary)] rounded-xl font-bold text-xs">Close</button>
                    </div>
                </div>
            )}

            {/* CREATE ASSIGNMENT MODAL */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreateAssignment} className="bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-3xl w-full max-w-2xl h-[90vh] flex flex-col shadow-2xl animate-fade-in-up">
                        <h2 className="text-xl font-black mb-1 flex items-center gap-2 text-[var(--text-primary)]"><FileText className="text-purple-600" /> Create Written Assignment</h2>
                        <p className="text-xs text-[var(--text-secondary)] font-medium mb-4">Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.</p>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs font-bold">
                            <div>
                                <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                    Assignment Title <span className="text-red-500">*</span>
                                </label>
                                <input required className="w-full p-3 bg-gray-50 dark:bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-extrabold outline-none focus:border-purple-500" placeholder="e.g. Essay on Cognitive Perception" value={assignmentData.title} onChange={e => setAssignmentData({ ...assignmentData, title: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                    Due Deadline <span className="text-red-500">*</span>
                                </label>
                                <input required type="datetime-local" className="w-full p-3 bg-gray-50 dark:bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] outline-none focus:border-purple-500" value={assignmentData.deadline} onChange={e => setAssignmentData({ ...assignmentData, deadline: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                    Instructions / Description <span className="text-[var(--text-secondary)] font-normal text-[10px] lowercase">(optional)</span>
                                </label>
                                <textarea className="w-full p-3 bg-gray-50 dark:bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] h-20 outline-none focus:border-purple-500" placeholder="Write guidance or steps for students..." value={assignmentData.description} onChange={e => setAssignmentData({ ...assignmentData, description: e.target.value })} />
                            </div>

                            <div className="border-t border-[var(--border-color)] pt-3 space-y-2">
                                <h3 className="font-extrabold text-xs text-[var(--text-primary)] uppercase tracking-wider">Add Specific Question Items <span className="text-[var(--text-secondary)] font-normal text-[10px] lowercase">(optional)</span></h3>
                                <div className="flex gap-2">
                                    <select className="p-2.5 bg-gray-50 dark:bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none" value={newQuestion.type} onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value })}>
                                        <option value="text">Short Text</option>
                                        <option value="multiple_choice">Multiple Choice</option>
                                        <option value="voice">Voice Based</option>
                                    </select>
                                    <input
                                        className="flex-1 p-2.5 bg-gray-50 dark:bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none focus:border-purple-500"
                                        placeholder="Question Prompt"
                                        value={newQuestion.questionText}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addQuestion(); } }}
                                        onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                                    />
                                </div>
                                {newQuestion.type === 'multiple_choice' && (
                                    <div className="flex gap-2">
                                        <input className="flex-1 p-2.5 bg-gray-50 dark:bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none" placeholder="Type option & press Enter" value={optionText}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && optionText) {
                                                    e.preventDefault();
                                                    setNewQuestion({ ...newQuestion, options: [...(newQuestion.options || []), optionText] });
                                                    setOptionText('');
                                                }
                                            }}
                                            onChange={e => setOptionText(e.target.value)}
                                        />
                                        <div className="flex flex-wrap gap-1">
                                            {(newQuestion.options || []).map((o, i) => <span key={i} className="bg-purple-500/10 text-purple-600 px-2 py-1 rounded-lg text-[10px] font-extrabold border border-purple-500/20">{o}</span>)}
                                        </div>
                                    </div>
                                )}
                                <button type="button" onClick={addQuestion} className="w-full py-2 bg-gray-50 dark:bg-[var(--bg-base)] font-bold text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl hover:bg-purple-500/10 hover:text-purple-600 text-xs transition-colors">+ Add Question Item</button>

                                <div className="space-y-1.5 pt-2">
                                    {(assignmentData.questions || []).map((q, i) => (
                                        <div key={i} className="bg-gray-50 dark:bg-[var(--bg-base)] p-3 rounded-xl border border-[var(--border-color)] text-xs flex justify-between items-center">
                                            <div>
                                                <span className="font-extrabold uppercase text-[10px] text-purple-600 mr-2">{q.type}</span>
                                                <span className="text-[var(--text-primary)] font-medium">{q.questionText}</span>
                                            </div>
                                            <button type="button" onClick={() => setAssignmentData({ ...assignmentData, questions: (assignmentData.questions || []).filter((_, idx) => idx !== i) })} className="text-red-400 hover:text-red-500 p-1"><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 py-3 text-[var(--text-secondary)] font-bold rounded-xl text-xs">Cancel</button>
                            <button type="submit" className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs shadow-md">Create & Assign</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ClassManager;
