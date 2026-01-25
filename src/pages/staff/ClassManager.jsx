import React, { useState, useEffect } from 'react';
import StaffNavbar from '../../components/StaffNavbar';
import { Users, Plus, Copy, Check, BookOpen, Mail, Send, ClipboardCheck, Calendar, FileText, Mic, List, Type, X, Trophy, ChevronDown, ChevronRight, Eye } from 'lucide-react';

const ClassManager = () => {
    const [classes, setClasses] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', section: '', subject: '' });
    const [copiedId, setCopiedId] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [materialFile, setMaterialFile] = useState(null);
    const [materialTitle, setMaterialTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
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

    // Mock Teacher ID
    const TEACHER_ID = "65b2a3c4e8f1a2b3c4d5e6f7";

    useEffect(() => {
        fetchClasses();
        fetchLevels();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/classes/teacher/${TEACHER_ID}`);
            const data = await res.json();
            if (data.success) setClasses(data.classes);
        } catch (err) { console.error(err); }
    };

    const fetchLevels = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/levels');
            const data = await res.json();
            if (data.success) setAvailableLevels(data.levels);
        } catch (err) { console.error(err); }
    };

    const fetchClassAssignments = async (classId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/assignments/class/${classId}`);
            const data = await res.json();
            if (data.success) setDetailedAssignments(data.assignments);
        } catch (err) { console.error(err); }
    };

    const openClassDetails = (cls) => {
        setSelectedDetailedClass(cls);
        fetchClassAssignments(cls._id);
    };

    const handleCreate = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/classes/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newClass, teacherId: TEACHER_ID })
            });
            const data = await res.json();
            if (data.success) {
                setClasses([...classes, data.class]);
                setShowCreateModal(false);
                setNewClass({ name: '', section: '', subject: '' });
                fetchClasses();
            }
        } catch (err) { alert("Failed to create class"); }
    };

    const handleInvite = async () => {
        if (!inviteEmail || !selectedClassId) return;
        try {
            const res = await fetch('http://localhost:5000/api/classes/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, classId: selectedClassId, teacherId: TEACHER_ID })
            });
            const data = await res.json();
            if (data.success) {
                alert("Invitation sent!");
                setShowInviteModal(false);
                setInviteEmail('');
            } else { alert(data.message); }
        } catch (err) { alert("Error sending invitation"); }
    };

    const handleUploadMaterial = async () => {
        if (!materialFile || !selectedClassId) return alert("Select a file");
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', materialFile);
        formData.append('title', materialTitle || materialFile.name);
        formData.append('classId', selectedClassId);
        try {
            const res = await fetch('http://localhost:5000/api/materials/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                alert("Material uploaded!");
                setShowMaterialModal(false);
                fetchClasses();
            } else alert(data.message);
        } catch (e) { alert("Upload error"); }
        setIsUploading(false);
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

    const handleCreateAssignment = async () => {
        if (!assignmentData.title || !assignmentData.deadline) return alert("Title/Deadline required");
        try {
            const res = await fetch('http://localhost:5000/api/assignments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId: selectedClassId,
                    title: assignmentData.title,
                    description: assignmentData.description,
                    deadline: assignmentData.deadline,
                    questions: assignmentData.questions,
                    toolsAllowed: { dyslexia: true, dyscalculia: true }
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Assignment created!");
                setShowAssignModal(false);
                setAssignmentData({ title: '', description: '', deadline: '', questions: [] });
                // If we are in detail view, refresh it
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
            questions: [...assignmentData.questions, { ...newQuestion }]
        });
        setNewQuestion({ type: 'text', questionText: '', options: [] });
    };

    const handleCreateLevel = async () => {
        if (!newLevel.title) return alert("Title required");
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
                options: newTask.options.split(',').map(s => s.trim()).filter(Boolean),
                correctAnswer: newTask.options.split(',')[0],
                promptText: newTask.text // for speech
            }
        };
        setNewLevel({ ...newLevel, tasks: [...newLevel.tasks, task] });
        setNewTask({ type: 'quiz', text: '', options: '' });
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedId(code);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <StaffNavbar />
            <div className="container mx-auto px-6 py-8">
                {/* Header ... */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">My Classes</h1>
                        <p className="text-slate-500">Manage your students and classrooms</p>
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 flex items-center gap-2">
                        <Plus size={20} /> Create New Class
                    </button>
                </div>

                {/* Class Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map(cls => (
                        <div key={cls._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <div className="h-24 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 relative group cursor-pointer" onClick={() => openClassDetails(cls)}>
                                <div className="flex justify-between items-start">
                                    <div className="text-white">
                                        <h3 className="text-xl font-bold group-hover:underline underline-offset-4">{cls.name}</h3>
                                        <p className="text-purple-100 text-sm">{cls.section}</p>
                                    </div>
                                    <div onClick={(e) => { e.stopPropagation(); copyCode(cls.code); }} className="bg-white/20 px-2 py-1 rounded text-white text-xs font-mono font-bold cursor-pointer">{cls.code} <Copy size={10} /></div>
                                </div>
                                <div className="absolute bottom-2 right-4 text-xs font-bold text-white bg-black/20 px-2 py-1 rounded">View Details <ChevronRight size={10} className="inline" /></div>
                            </div>
                            <div className="p-4 pt-4 flex-1 flex flex-col">
                                <div className="flex-1 space-y-2 mb-4">
                                    <div className="text-sm text-slate-600 flex justify-between"><span>Students:</span> <b>{cls.students.length}</b></div>
                                    <div className="text-sm text-slate-600 flex justify-between"><span>Games Assigned:</span> <b>{cls.assessments?.length || 0}</b></div>
                                </div>
                                <div className="border-t border-slate-100 pt-3 grid grid-cols-3 gap-2">
                                    <button onClick={() => { setSelectedClassId(cls._id); setShowMaterialModal(true); }} className="col-span-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold flex flex-col items-center"><BookOpen size={16} /> Post</button>
                                    <button onClick={() => { setSelectedClassId(cls._id); setShowAssessModal(true); }} className="col-span-1 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold flex flex-col items-center"><Trophy size={16} /> Game</button>
                                    <button onClick={() => { setSelectedClassId(cls._id); setShowInviteModal(true); }} className="col-span-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold flex flex-col items-center"><Mail size={16} /> Invite</button>
                                    <button onClick={() => { setSelectedClassId(cls._id); setShowAssignModal(true); }} className="col-span-3 mt-1 py-2 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2"><FileText size={16} /> Create Assignment</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* DETAILED CLASS MODAL */}
            {selectedDetailedClass && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-2xl font-black">{selectedDetailedClass.name}</h2>
                                <p className="text-purple-100">{selectedDetailedClass.subject} • Sec {selectedDetailedClass.section}</p>
                            </div>
                            <button onClick={() => setSelectedDetailedClass(null)} className="text-white/80 hover:text-white font-bold bg-black/20 px-4 py-2 rounded-lg">Close</button>
                        </div>

                        <div className="flex border-b">
                            <button onClick={() => setActiveTab('students')} className={`flex-1 py-4 font-bold text-center ${activeTab === 'students' ? 'border-b-4 border-purple-600 text-purple-700 bg-purple-50' : 'text-slate-500 hover:bg-slate-50'}`}>Students ({selectedDetailedClass.students.length})</button>
                            <button onClick={() => setActiveTab('assignments')} className={`flex-1 py-4 font-bold text-center ${activeTab === 'assignments' ? 'border-b-4 border-purple-600 text-purple-700 bg-purple-50' : 'text-slate-500 hover:bg-slate-50'}`}>Assignments ({detailedAssignments.length})</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                            {/* STUDENTS TAB */}
                            {activeTab === 'students' && (
                                <div className="space-y-4">
                                    {selectedDetailedClass.students.length === 0 ? <div className="text-center py-10 text-slate-400">No students enrolled yet.</div> :
                                        selectedDetailedClass.students.map(student => (
                                            <div key={student._id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">{student.name[0]}</div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800">{student.name}</h3>
                                                        <p className="text-xs text-slate-500">{student.email}</p>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Enrolled</div>
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* ASSIGNMENTS TAB */}
                            {activeTab === 'assignments' && (
                                <div className="space-y-4">
                                    {detailedAssignments.length === 0 ? <div className="text-center py-10 text-slate-400">No assignments created.</div> :
                                        detailedAssignments.map(assign => (
                                            <div key={assign._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                                <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => setExpandedAssignmentId(expandedAssignmentId === assign._id ? null : assign._id)}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><FileText size={20} /></div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-800">{assign.title}</h3>
                                                            <p className="text-xs text-slate-500">Due: {new Date(assign.deadline).toLocaleDateString()} • {assign.submissions?.length || 0} turned in</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown size={20} className={`text-slate-400 transition-transform ${expandedAssignmentId === assign._id ? 'rotate-180' : ''}`} />
                                                </div>

                                                {/* Expand Submissions */}
                                                {expandedAssignmentId === assign._id && (
                                                    <div className="border-t bg-slate-50 p-4">
                                                        <h4 className="font-bold text-xs uppercase text-slate-500 mb-3">Student Submissions</h4>
                                                        <div className="space-y-2">
                                                            {assign.submissions?.map((sub, idx) => {
                                                                // Find student info from class list
                                                                const student = selectedDetailedClass.students.find(s => s._id === sub.studentId);
                                                                return (
                                                                    <div key={idx} className="bg-white p-3 rounded border flex justify-between items-start">
                                                                        <div>
                                                                            <div className="font-bold text-sm text-slate-800">{student?.name || 'Unknown Student'}</div>
                                                                            <div className="text-xs text-slate-500 mb-1">Status: {sub.status}</div>
                                                                            <div className="text-sm bg-gray-100 p-2 rounded text-slate-700 font-mono mt-1">{sub.content}</div>
                                                                        </div>
                                                                        <div className="text-xs text-slate-400">{new Date(sub.submittedAt).toLocaleDateString()}</div>
                                                                    </div>
                                                                );
                                                            })}
                                                            {(!assign.submissions || assign.submissions.length === 0) && (
                                                                <div className="text-xs text-slate-400 italic">No submissions yet.</div>
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

            {/* Other modals (Create, Invite, Assess, Assign, LevelCreator) - kept same */}
            {/* ... (Existing modals logic) ... */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create Class</h2>
                        <input className="w-full p-2 border rounded mb-2" placeholder="Name" value={newClass.name} onChange={e => setNewClass({ ...newClass, name: e.target.value })} />
                        <input className="w-full p-2 border rounded mb-2" placeholder="Subject" value={newClass.subject} onChange={e => setNewClass({ ...newClass, subject: e.target.value })} />
                        <input className="w-full p-2 border rounded mb-4" placeholder="Section" value={newClass.section} onChange={e => setNewClass({ ...newClass, section: e.target.value })} />
                        <div className="flex gap-2"><button onClick={() => setShowCreateModal(false)} className="flex-1 py-2 bg-gray-100 rounded">Cancel</button><button onClick={handleCreate} className="flex-1 py-2 bg-purple-600 text-white rounded">Create</button></div>
                    </div>
                </div>
            )}

            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">Invite Student</h2>
                        <input className="w-full p-2 border rounded mb-4" placeholder="Email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                        <div className="flex gap-2"><button onClick={() => setShowInviteModal(false)} className="flex-1 py-2 bg-gray-100 rounded">Cancel</button><button onClick={handleInvite} className="flex-1 py-2 bg-blue-600 text-white rounded">Send</button></div>
                    </div>
                </div>
            )}

            {showAssessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-lg h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Trophy className="text-green-600" /> Assign Game Level</h2>
                            <button onClick={() => { setShowAssessModal(false); setShowLevelCreator(true); }} className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1"><Plus size={12} /> Create Level</button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {availableLevels.length === 0 ? <p className="text-center text-gray-400 py-10">No levels created yet.</p> : availableLevels.map(l => (
                                <div key={l._id} className="border p-4 rounded-xl hover:bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <div className="font-bold">{l.title}</div>
                                        <div className="text-xs bg-gray-200 px-2 rounded inline-block">{l.difficulty}</div>
                                    </div>
                                    <button onClick={() => handleAssignLevel(l._id)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Assign</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowAssessModal(false)} className="mt-4 w-full py-2 bg-gray-100 rounded font-bold">Close</button>
                    </div>
                </div>
            )}

            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-2xl h-[90vh] flex flex-col">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FileText className="text-purple-600" /> Create Assignment</h2>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            <input className="w-full p-2 border rounded font-bold" placeholder="Assignment Title" value={assignmentData.title} onChange={e => setAssignmentData({ ...assignmentData, title: e.target.value })} />
                            <textarea className="w-full p-2 border rounded h-20" placeholder="Description/Instructions..." value={assignmentData.description} onChange={e => setAssignmentData({ ...assignmentData, description: e.target.value })} />
                            <input type="datetime-local" className="w-full p-2 border rounded" value={assignmentData.deadline} onChange={e => setAssignmentData({ ...assignmentData, deadline: e.target.value })} />

                            <div className="border-t pt-4">
                                <h3 className="font-bold text-sm mb-2">Add Questions</h3>
                                <div className="flex gap-2 mb-2">
                                    <select className="p-2 border rounded" value={newQuestion.type} onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value })}>
                                        <option value="text">Short Answer</option>
                                        <option value="multiple_choice">Multiple Choice (Q/A)</option>
                                        <option value="voice">Voice Based</option>
                                    </select>
                                    <input
                                        className="flex-1 p-2 border rounded"
                                        placeholder="Question Text"
                                        value={newQuestion.questionText}
                                        onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
                                        onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                                    />
                                </div>
                                {newQuestion.type === 'multiple_choice' && (
                                    <div className="flex gap-2 mb-2">
                                        <input className="flex-1 p-2 border rounded bg-gray-50 text-sm" placeholder="Add Option and press Enter" value={optionText}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && optionText) {
                                                    setNewQuestion({ ...newQuestion, options: [...newQuestion.options, optionText] });
                                                    setOptionText('');
                                                }
                                            }}
                                            onChange={e => setOptionText(e.target.value)}
                                        />
                                        <div className="flex flex-wrap gap-1">
                                            {newQuestion.options.map((o, i) => <span key={i} className="bg-blue-100 text-blue-800 px-2 rounded text-xs flex items-center">{o}</span>)}
                                        </div>
                                    </div>
                                )}
                                <button onClick={addQuestion} className="w-full py-2 bg-slate-100 font-bold text-slate-600 rounded hover:bg-slate-200">+ Add Question</button>

                                <div className="mt-4 space-y-2">
                                    {assignmentData.questions.map((q, i) => (
                                        <div key={i} className="bg-gray-50 p-3 rounded border text-sm flex justify-between">
                                            <div>
                                                <span className="font-bold uppercase text-xs text-purple-600 mr-2">
                                                    {q.type === 'text' ? 'Short Answer' : q.type === 'multiple_choice' ? 'Multiple Choice' : 'Voice'}
                                                </span>
                                                {q.questionText}
                                            </div>
                                            <button onClick={() => setAssignmentData({ ...assignmentData, questions: assignmentData.questions.filter((_, idx) => idx !== i) })}><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button onClick={() => setShowAssignModal(false)} className="flex-1 py-3 bg-gray-100 rounded font-bold">Cancel</button>
                            <button onClick={handleCreateAssignment} className="flex-1 py-3 bg-purple-600 text-white rounded font-bold">Create & Assign</button>
                        </div>
                    </div>
                </div>
            )}

            {showLevelCreator && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-xl h-[80vh] flex flex-col">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Trophy className="text-orange-500" /> Create Game Level</h2>
                        <div className="flex-1 overflow-y-auto space-y-4">
                            <input className="w-full p-2 border rounded" placeholder="Level Title (e.g. Basic Arithmetic)" value={newLevel.title} onChange={e => setNewLevel({ ...newLevel, title: e.target.value })} />
                            <select className="w-full p-2 border rounded" value={newLevel.difficulty} onChange={e => setNewLevel({ ...newLevel, difficulty: e.target.value })}>
                                <option value="easy">Level 1 - Easy (100 XP)</option>
                                <option value="medium">Level 2 - Medium (300 XP)</option>
                                <option value="hard">Level 3 - Hard (500 XP)</option>
                            </select>

                            <div className="border-t pt-4">
                                <h3 className="font-bold text-sm mb-2">Add Tasks</h3>
                                <div className="space-y-2 mb-2">
                                    <select className="w-full p-2 border rounded" value={newTask.type} onChange={e => setNewTask({ ...newTask, type: e.target.value })}>
                                        <option value="quiz">Quiz</option>
                                        <option value="speech">Speech Challenge</option>
                                    </select>
                                    <input className="w-full p-2 border rounded" placeholder="Question / Prompt" value={newTask.text} onChange={e => setNewTask({ ...newTask, text: e.target.value })} />
                                    {newTask.type === 'quiz' && (
                                        <input className="w-full p-2 border rounded bg-gray-50" placeholder="Options (comma separated, first is correct)" value={newTask.options} onChange={e => setNewTask({ ...newTask, options: e.target.value })} />
                                    )}
                                    <button onClick={addTaskToLevel} className="w-full py-2 bg-orange-100 text-orange-700 font-bold rounded">+ Add Task</button>
                                </div>
                                <div className="space-y-2">
                                    {newLevel.tasks.map((t, i) => (
                                        <div key={i} className="bg-gray-50 p-2 rounded border text-sm">
                                            <span className="font-bold uppercase text-xs mr-2">{t.type}</span> {t.props.question || t.props.promptText}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button onClick={() => setShowLevelCreator(false)} className="flex-1 py-3 bg-gray-100 rounded font-bold">Cancel</button>
                            <button onClick={handleCreateLevel} className="flex-1 py-3 bg-green-600 text-white rounded font-bold">Save Level</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassManager;
