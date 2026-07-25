import React, { useState, useEffect } from 'react';
import StaffNavbar from '../../components/StaffNavbar';
import { Users, Plus, Copy, Check, BookOpen, Mail, Send, ClipboardCheck, Calendar, FileText, Mic, List, Type, X, Trophy, ChevronDown, ChevronRight, Eye } from 'lucide-react';
import { createClass, getLevels, getTeacherClasses } from '../../services/api';

const ClassManager = () => {
    const [classes, setClasses] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', section: '', subject: '', room: '', capacity: 60 });
    const [copiedId, setCopiedId] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [showPrelimsModal, setShowPrelimsModal] = useState(false);
    const [prelimQuestion, setPrelimQuestion] = useState({ question: '', type: 'text', correctAnswer: '', disabilityMarker: 'DEFAULT' });
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [showAssessModal, setShowAssessModal] = useState(false);
    const [availableLevels, setAvailableLevels] = useState([]);

    // Assignment State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignmentData, setAssignmentData] = useState({ title: '', description: '', deadline: '', questions: [] });
    const [newQuestion, setNewQuestion] = useState({ type: 'text', questionText: '', options: [] });
    const [optionText, setOptionText] = useState('');

    // Level Creation State
    const [showLevelCreator, setShowLevelCreator] = useState(false);
    const [newLevel, setNewLevel] = useState({ title: '', difficulty: 'easy', tasks: [] });
    const [newTask, setNewTask] = useState({ type: 'quiz', text: '', options: '' });

    // Detailed Class View State
    const [selectedDetailedClass, setSelectedDetailedClass] = useState(null);
    const [detailedAssignments, setDetailedAssignments] = useState([]);
    const [activeTab, setActiveTab] = useState('students'); // 'students' or 'assignments'
    const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);

    useEffect(() => {
        fetchClasses();
        fetchLevels();
    }, []);

    const fetchClasses = async () => {
        try {
            const data = await getTeacherClasses();
            setClasses(data || []);
        } catch (err) { console.error(err); setClasses([]); }
    };

    const fetchLevels = async () => {
        try {
            const data = await getLevels();
            if (data && data.levels) setAvailableLevels(data.levels || []);
            else if (Array.isArray(data)) setAvailableLevels(data);
        } catch (err) { console.error(err); setAvailableLevels([]); }
    };

    const fetchClassAssignments = async (classId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/assignments/class/${classId}`);
            const data = await res.json();
            if (data.success) setDetailedAssignments(data.assignments || []);
        } catch (err) { console.error(err); setDetailedAssignments([]); }
    };

    const openClassDetails = (cls) => {
        setSelectedDetailedClass(cls);
        fetchClassAssignments(cls._id);
    };

    const handleCreate = async (e) => {
        if (e) e.preventDefault();
        if (!newClass.name || !newClass.subject) return alert("Please fill in all mandatory fields (*)");
        try {
            const data = await createClass({ ...newClass, capacity: Number(newClass.capacity) });
            if (data.success) {
                setClasses([...(classes || []), data.class]);
                setShowCreateModal(false);
                setNewClass({ name: '', section: '', subject: '', room: '', capacity: 60 });
                fetchClasses();
            }
        } catch (err) { alert(err.response?.data?.message || "Failed to create class"); }
    };

    const handleInvite = async (e) => {
        if (e) e.preventDefault();
        if (!inviteEmail || !selectedClassId) return alert("Student email is required (*)");
        try {
            const res = await fetch('http://localhost:5000/api/classes/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, classId: selectedClassId })
            });
            const data = await res.json();
            if (data.success) {
                alert("Invitation sent!");
                setShowInviteModal(false);
                setInviteEmail('');
            } else { alert(data.message); }
        } catch (err) { alert("Error sending invitation"); }
    };

    const handlePostPrelims = async (e) => {
        if (e) e.preventDefault();
        if (!prelimQuestion.question || !prelimQuestion.correctAnswer) return alert("Please fill in all mandatory fields (*)");
        try {
            const { addPrelimsQuestion } = await import('../../services/api');
            await addPrelimsQuestion(prelimQuestion);
            alert("Prelims Question Posted!");
            setShowPrelimsModal(false);
            setPrelimQuestion({ question: '', type: 'text', correctAnswer: '', disabilityMarker: 'DEFAULT' });
        } catch (e) {
            alert("Error posting prelims question");
        }
    };

    const handleAssignLevel = async (levelId) => {
        try {
            const res = await fetch('http://localhost:5000/api/classes/assign-level', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId: selectedClassId, levelId })
            });
            const data = await res.json();
            if (data.success) { alert("Assigned!"); fetchClasses(); } else alert(data.message);
        } catch (e) { alert("Error assigning"); }
    };

    const handleCreateAssignment = async (e) => {
        if (e) e.preventDefault();
        if (!assignmentData.title || !assignmentData.deadline) return alert("Title and Deadline are required (*)");
        try {
            const res = await fetch('http://localhost:5000/api/assignments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId: selectedClassId,
                    title: assignmentData.title,
                    description: assignmentData.description,
                    deadline: assignmentData.deadline,
                    questions: assignmentData.questions || [],
                    toolsAllowed: { dyslexia: true, dyscalculia: true }
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Assignment created!");
                setShowAssignModal(false);
                setAssignmentData({ title: '', description: '', deadline: '', questions: [] });
                if (selectedDetailedClass && selectedDetailedClass._id === selectedClassId) {
                    fetchClassAssignments(selectedClassId);
                }
            } else alert(data.message);
        } catch (e) { alert("Error creating assignment"); }
    };

    const addQuestion = () => {
        if (!newQuestion.questionText) return;
        setAssignmentData({
            ...assignmentData,
            questions: [...(assignmentData.questions || []), { ...newQuestion }]
        });
        setNewQuestion({ type: 'text', questionText: '', options: [] });
    };

    const handleCreateLevel = async (e) => {
        if (e) e.preventDefault();
        if (!newLevel.title) return alert("Level Title is required (*)");
        try {
            const res = await fetch('http://localhost:5000/api/levels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newLevel,
                    xpReward: newLevel.difficulty === 'easy' ? 100 : newLevel.difficulty === 'medium' ? 300 : 500
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Game Level Created!");
                setShowLevelCreator(false);
                fetchLevels();
                setNewLevel({ title: '', difficulty: 'easy', tasks: [] });
            } else alert(data.message);
        } catch (e) { alert("Error creating level"); }
    };

    const addTaskToLevel = () => {
        if (!newTask.text) return;
        const task = {
            type: newTask.type,
            props: {
                question: newTask.text,
                options: (newTask.options || '').split(',').map(s => s.trim()).filter(Boolean),
                correctAnswer: (newTask.options || '').split(',')[0],
                promptText: newTask.text
            }
        };
        setNewLevel({ ...newLevel, tasks: [...(newLevel.tasks || []), task] });
        setNewTask({ type: 'quiz', text: '', options: '' });
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedId(code);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors">
            <StaffNavbar />
            <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl animate-fade-in-up">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Classroom Management</h1>
                        <p className="text-xs md:text-sm text-[var(--text-secondary)] font-medium">Manage student rosters, game assignments, and code invitations</p>
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-extrabold shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all hover:scale-105">
                        <Plus size={20} /> Create New Class
                    </button>
                </div>

                {/* Class Grid */}
                {(classes || []).length === 0 ? (
                    <div className="text-center py-16 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] p-8">
                        <Users size={48} className="mx-auto mb-4 text-purple-500/50" />
                        <h3 className="text-xl font-extrabold mb-2">No Active Classrooms</h3>
                        <p className="text-xs md:text-sm text-[var(--text-secondary)] mb-6 max-w-md mx-auto font-medium">
                            Create your first classroom to generate join codes and manage cognitive support profiles.
                        </p>
                        <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-purple-600 text-white font-bold rounded-2xl text-xs hover:bg-purple-700 transition-colors">
                            Create First Class
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(classes || []).map(cls => (
                            <div key={cls._id} className="bg-[var(--bg-surface)] rounded-3xl shadow-sm border border-[var(--border-color)] overflow-hidden hover:border-purple-500/50 transition-all flex flex-col card-hover-lift">
                                <div className="h-28 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 p-5 relative group cursor-pointer" onClick={() => openClassDetails(cls)}>
                                    <div className="flex justify-between items-start">
                                        <div className="text-white">
                                            <h3 className="text-xl font-black group-hover:underline underline-offset-4 tracking-tight">{cls.name}</h3>
                                            <p className="text-purple-100 text-xs font-semibold">{cls.section || cls.subject || 'Section'}</p>
                                        </div>
                                        <div onClick={(e) => { e.stopPropagation(); copyCode(cls.code); }} className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-xs font-mono font-bold cursor-pointer flex items-center gap-1 border border-white/20 transition-all">
                                            {cls.code} {copiedId === cls.code ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-3 right-4 text-xs font-extrabold text-white bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">View Details <ChevronRight size={12} className="inline" /></div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-2 text-xs font-semibold">
                                        <div className="text-[var(--text-secondary)] flex justify-between"><span>Enrolled Students:</span> <b className="text-[var(--text-primary)] font-extrabold">{cls.students?.length || 0}</b></div>
                                        <div className="text-[var(--text-secondary)] flex justify-between"><span>Assigned Games:</span> <b className="text-[var(--text-primary)] font-extrabold">{cls.assessments?.length || 0}</b></div>
                                    </div>
                                    <div className="border-t border-[var(--border-color)] pt-3 grid grid-cols-3 gap-2">
                                        <button onClick={() => { setSelectedClassId(cls._id); setShowPrelimsModal(true); }} className="col-span-1 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-colors"><BookOpen size={16} /> Prelims</button>
                                        <button onClick={() => { setSelectedClassId(cls._id); setShowAssessModal(true); }} className="col-span-1 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-colors"><Trophy size={16} /> Game</button>
                                        <button onClick={() => { setSelectedClassId(cls._id); setShowInviteModal(true); }} className="col-span-1 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-colors"><Mail size={16} /> Invite</button>
                                        <button onClick={() => { setSelectedClassId(cls._id); setShowAssignModal(true); }} className="col-span-3 mt-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all"><FileText size={16} /> Create Assignment</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* DETAILED CLASS MODAL */}
            {selectedDetailedClass && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-6 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-2xl font-black">{selectedDetailedClass.name}</h2>
                                <p className="text-purple-100 text-xs font-medium">{selectedDetailedClass.subject} • Section {selectedDetailedClass.section || 'General'}</p>
                            </div>
                            <button onClick={() => setSelectedDetailedClass(null)} className="text-white/80 hover:text-white font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs backdrop-blur-sm transition-colors">Close</button>
                        </div>

                        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-base)]">
                            <button onClick={() => setActiveTab('students')} className={`flex-1 py-3.5 font-extrabold text-xs text-center border-b-2 transition-all ${activeTab === 'students' ? 'border-purple-600 text-purple-600 bg-[var(--bg-surface)]' : 'border-transparent text-[var(--text-secondary)]'}`}>Students ({(selectedDetailedClass.students || []).length})</button>
                            <button onClick={() => setActiveTab('assignments')} className={`flex-1 py-3.5 font-extrabold text-xs text-center border-b-2 transition-all ${activeTab === 'assignments' ? 'border-purple-600 text-purple-600 bg-[var(--bg-surface)]' : 'border-transparent text-[var(--text-secondary)]'}`}>Assignments ({(detailedAssignments || []).length})</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-base)]">
                            {/* STUDENTS TAB */}
                            {activeTab === 'students' && (
                                <div className="space-y-3">
                                    {(selectedDetailedClass.students || []).length === 0 ? <div className="text-center py-10 text-[var(--text-secondary)] italic text-sm">No students enrolled in this classroom yet.</div> :
                                        (selectedDetailedClass.students || []).map(student => (
                                            <div key={student._id} className="bg-[var(--bg-surface)] p-4 rounded-2xl shadow-sm border border-[var(--border-color)] flex justify-between items-center">
                                                <div className="flex flex-col sm:flex-row gap-4 sm:items-center w-full justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-purple-500/10 text-purple-600 rounded-full flex items-center justify-center font-black">{student.name ? student.name[0].toUpperCase() : 'S'}</div>
                                                        <div>
                                                            <h3 className="font-extrabold text-sm text-[var(--text-primary)] flex items-center gap-2">
                                                                {student.name}
                                                                {student.learningProfile && student.learningProfile !== 'DEFAULT' && (
                                                                    <span className="text-[10px] bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full uppercase font-extrabold border border-purple-500/20">
                                                                        {student.learningProfile}
                                                                    </span>
                                                                )}
                                                            </h3>
                                                            <p className="text-xs text-[var(--text-secondary)] font-medium">{student.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase">Prelims Score</span>
                                                            <span className={`font-black text-sm ${student.prelimsScore >= 80 ? 'text-emerald-600' : student.prelimsScore >= 50 ? 'text-blue-600' : 'text-amber-600'}`}>
                                                                {student.prelimsScore !== undefined ? `${student.prelimsScore}%` : 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-bold border border-emerald-500/20">Active</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* ASSIGNMENTS TAB */}
                            {activeTab === 'assignments' && (
                                <div className="space-y-3">
                                    {(detailedAssignments || []).length === 0 ? <div className="text-center py-10 text-[var(--text-secondary)] italic text-sm">No assignments created yet.</div> :
                                        (detailedAssignments || []).map(assign => (
                                            <div key={assign._id} className="bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
                                                <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-[var(--bg-base)] transition-colors" onClick={() => setExpandedAssignmentId(expandedAssignmentId === assign._id ? null : assign._id)}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 bg-purple-500/10 text-purple-600 rounded-xl"><FileText size={20} /></div>
                                                        <div>
                                                            <h3 className="font-extrabold text-sm text-[var(--text-primary)]">{assign.title}</h3>
                                                            <p className="text-xs text-[var(--text-secondary)]">Due: {assign.deadline ? new Date(assign.deadline).toLocaleDateString() : 'N/A'} • {(assign.submissions || []).length} submissions</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown size={18} className={`text-[var(--text-secondary)] transition-transform ${expandedAssignmentId === assign._id ? 'rotate-180' : ''}`} />
                                                </div>

                                                {/* Submissions List */}
                                                {expandedAssignmentId === assign._id && (
                                                    <div className="border-t border-[var(--border-color)] bg-[var(--bg-base)] p-4 space-y-3">
                                                        <h4 className="font-extrabold text-xs uppercase text-[var(--text-secondary)]">Student Submissions</h4>
                                                        <div className="space-y-2">
                                                            {(assign.submissions || []).map((sub, idx) => {
                                                                const student = (selectedDetailedClass.students || []).find(s => s._id === sub.studentId);
                                                                return (
                                                                    <div key={idx} className="bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-color)] flex justify-between items-start text-xs">
                                                                        <div>
                                                                            <div className="font-bold text-[var(--text-primary)]">{student?.name || 'Enrolled Student'}</div>
                                                                            <div className="text-[10px] text-[var(--text-secondary)]">Status: {sub.status || 'Submitted'}</div>
                                                                            <div className="bg-[var(--bg-base)] p-2 rounded-lg text-[var(--text-primary)] font-mono text-[11px] mt-1 border border-[var(--border-color)]">{sub.content}</div>
                                                                        </div>
                                                                        <div className="text-[10px] text-[var(--text-secondary)] font-semibold">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Recently'}</div>
                                                                    </div>
                                                                );
                                                            })}
                                                            {(!assign.submissions || assign.submissions.length === 0) && (
                                                                <div className="text-xs text-[var(--text-secondary)] italic">No student submissions turned in yet.</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE CLASS MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreate} className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up">
                        <h2 className="text-2xl font-black mb-2 text-[var(--text-primary)] tracking-tight">Create Classroom</h2>
                        <p className="text-xs text-[var(--text-secondary)] font-medium mb-6">Fill in class details. Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.</p>
                        
                        <div className="space-y-4 text-xs font-bold">
                            <div>
                                <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                    Classroom Name <span className="text-red-500">*</span>
                                </label>
                                <input required className="w-full p-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] outline-none focus:border-purple-500" placeholder="e.g. Literacy & Grammar 101" value={newClass.name} onChange={e => setNewClass({ ...newClass, name: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <input required className="w-full p-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] outline-none focus:border-purple-500" placeholder="e.g. English Literature" value={newClass.subject} onChange={e => setNewClass({ ...newClass, subject: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                    Section <span className="text-[var(--text-secondary)] font-normal text-[10px] lowercase">(optional)</span>
                                </label>
                                <input className="w-full p-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] outline-none focus:border-purple-500" placeholder="e.g. Section A" value={newClass.section} onChange={e => setNewClass({ ...newClass, section: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                    Room Number <span className="text-[var(--text-secondary)] font-normal text-[10px] lowercase">(optional)</span>
                                </label>
                                <input className="w-full p-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] outline-none focus:border-purple-500" placeholder="e.g. Hall 302 or Lab B" value={newClass.room} onChange={e => setNewClass({ ...newClass, room: e.target.value })} />
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
                    <form onSubmit={handleInvite} className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in-up">
                        <h2 className="text-xl font-black mb-1 text-[var(--text-primary)]">Invite Student</h2>
                        <p className="text-xs text-[var(--text-secondary)] font-medium mb-4">Send classroom invite link directly to student email.</p>
                        
                        <div className="mb-4 text-xs font-bold">
                            <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                Student Email <span className="text-red-500">*</span>
                            </label>
                            <input required type="email" className="w-full p-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500" placeholder="name@student.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
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
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-3xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-black flex items-center gap-2 text-[var(--text-primary)]"><Trophy className="text-emerald-500" /> Assign Level Game</h2>
                            <button onClick={() => { setShowAssessModal(false); setShowLevelCreator(true); }} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1 shadow-sm"><Plus size={12} /> New Level</button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {(availableLevels || []).length === 0 ? <p className="text-center text-[var(--text-secondary)] py-10 text-xs italic">No levels created yet.</p> : (availableLevels || []).map(l => (
                                <div key={l._id} className="border border-[var(--border-color)] p-4 rounded-2xl hover:bg-[var(--bg-base)] flex justify-between items-center transition-colors">
                                    <div>
                                        <div className="font-extrabold text-sm text-[var(--text-primary)]">{l.title}</div>
                                        <div className="text-[10px] bg-purple-500/10 text-purple-600 font-bold px-2 py-0.5 rounded-md inline-block uppercase mt-1">{l.difficulty || 'Easy'}</div>
                                    </div>
                                    <button onClick={() => handleAssignLevel(l._id)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm">Assign</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowAssessModal(false)} className="mt-4 w-full py-2.5 bg-[var(--bg-base)] text-[var(--text-secondary)] rounded-xl font-bold text-xs">Close</button>
                    </div>
                </div>
            )}

            {/* CREATE ASSIGNMENT MODAL */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreateAssignment} className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-3xl w-full max-w-2xl h-[90vh] flex flex-col shadow-2xl animate-fade-in-up">
                        <h2 className="text-xl font-black mb-1 flex items-center gap-2 text-[var(--text-primary)]"><FileText className="text-purple-600" /> Create Written Assignment</h2>
                        <p className="text-xs text-[var(--text-secondary)] font-medium mb-4">Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.</p>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs font-bold">
                            <div>
                                <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                    Assignment Title <span className="text-red-500">*</span>
                                </label>
                                <input required className="w-full p-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-extrabold outline-none focus:border-purple-500" placeholder="e.g. Essay on Cognitive Perception" value={assignmentData.title} onChange={e => setAssignmentData({ ...assignmentData, title: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                    Due Deadline <span className="text-red-500">*</span>
                                </label>
                                <input required type="datetime-local" className="w-full p-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] outline-none focus:border-purple-500" value={assignmentData.deadline} onChange={e => setAssignmentData({ ...assignmentData, deadline: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                    Instructions / Description <span className="text-[var(--text-secondary)] font-normal text-[10px] lowercase">(optional)</span>
                                </label>
                                <textarea className="w-full p-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] h-20 outline-none focus:border-purple-500" placeholder="Write guidance or steps for students..." value={assignmentData.description} onChange={e => setAssignmentData({ ...assignmentData, description: e.target.value })} />
                            </div>

                            <div className="border-t border-[var(--border-color)] pt-3 space-y-2">
                                <h3 className="font-extrabold text-xs text-[var(--text-primary)] uppercase tracking-wider">Add Specific Question Items <span className="text-[var(--text-secondary)] font-normal text-[10px] lowercase">(optional)</span></h3>
                                <div className="flex gap-2">
                                    <select className="p-2.5 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none" value={newQuestion.type} onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value })}>
                                        <option value="text">Short Text</option>
                                        <option value="multiple_choice">Multiple Choice</option>
                                        <option value="voice">Voice Based</option>
                                    </select>
                                    <input
                                        className="flex-1 p-2.5 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none focus:border-purple-500"
                                        placeholder="Question Prompt"
                                        value={newQuestion.questionText}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addQuestion(); } }}
                                        onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                                    />
                                </div>
                                {newQuestion.type === 'multiple_choice' && (
                                    <div className="flex gap-2">
                                        <input className="flex-1 p-2.5 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none" placeholder="Type option & press Enter" value={optionText}
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
                                <button type="button" onClick={addQuestion} className="w-full py-2 bg-[var(--bg-base)] font-bold text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl hover:bg-purple-500/10 hover:text-purple-600 text-xs transition-colors">+ Add Question Item</button>

                                <div className="space-y-1.5 pt-2">
                                    {(assignmentData.questions || []).map((q, i) => (
                                        <div key={i} className="bg-[var(--bg-base)] p-3 rounded-xl border border-[var(--border-color)] text-xs flex justify-between items-center">
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
