import React, { useState, useEffect } from 'react';
import StaffNavbar from '../../components/StaffNavbar';
import { Users, Plus, Copy, Check, BookOpen, Mail, Send, ClipboardCheck } from 'lucide-react';

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

    // ... handleInvite ...

    const handleUploadMaterial = async () => {
        if (!materialFile || !selectedClassId) return alert("Please select a file.");
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', materialFile);
        formData.append('title', materialTitle || materialFile.name);
        formData.append('classId', selectedClassId);

        try {
            const res = await fetch('http://localhost:5000/api/materials/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                alert("Material uploaded and assigned successfully!");
                setShowMaterialModal(false);
                setMaterialFile(null);
                setMaterialTitle('');
                fetchClasses(); // Refresh to show new material count if we displayed it
            } else {
                alert("Upload failed: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Upload failed due to server error.");
        } finally {
            setIsUploading(false);
        }
    };

    // Mock Teacher ID (In real app, get from Auth Context)
    const TEACHER_ID = "65b2a3c4e8f1a2b3c4d5e6f7";

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/classes/teacher/${TEACHER_ID}`);
            const data = await res.json();
            if (data.success) {
                setClasses(data.classes);
            }
        } catch (err) {
            console.error("Failed to fetch classes", err);
        }
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
            }
        } catch (err) {
            alert("Failed to create class");
        }
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
                alert("Invitation sent successfully!");
                setShowInviteModal(false);
                setInviteEmail('');
            } else {
                alert("Failed to invite: " + data.message);
            }
        } catch (err) {
            alert("Error sending invitation");
        }
    };

    const fetchLevels = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/levels');
            const data = await res.json();
            if (data.success) setAvailableLevels(data.levels);
        } catch (err) { console.error(err); }
    };

    const handleAssignLevel = async (levelId) => {
        try {
            const res = await fetch('http://localhost:5000/api/classes/assign-level', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId: selectedClassId, levelId })
            });
            const data = await res.json();
            if (data.success) {
                alert("Level assigned successfully!");
                fetchClasses(); // Refresh
            } else {
                alert(data.message);
            }
        } catch (err) { alert("Error assigning level"); }
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
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">My Classes</h1>
                        <p className="text-slate-500">Manage your students and classrooms</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} /> Create New Class
                    </button>
                </div>

                {classes.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <Users size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-600">No classes yet</h3>
                        <p className="text-slate-400">Create your first class to get started!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map(cls => (
                            <div key={cls._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                                {/* GCR Style Header */}
                                <div className="h-24 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 relative">
                                    <div className="flex justify-between items-start">
                                        <div className="text-white">
                                            <h3 className="text-xl font-bold hover:underline cursor-pointer">{cls.name}</h3>
                                            <p className="text-purple-100 text-sm">{cls.section ? `Sec ${cls.section} • ` : ''}{cls.subject}</p>
                                        </div>
                                        <div
                                            onClick={() => copyCode(cls.code)}
                                            className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-white text-xs font-mono font-bold cursor-pointer hover:bg-white/30 transition-colors flex items-center gap-1"
                                            title="Copy Code"
                                        >
                                            {cls.code} <Copy size={10} />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-6 right-4">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-slate-100 text-purple-600">
                                            <Users size={24} />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 pt-8 flex-1 flex flex-col">
                                    {/* Stats Row */}
                                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                                        {/* Show student count or avatars */}
                                        <div className="flex -space-x-2">
                                            {[...Array(Math.min(3, cls.students.length || 0))].map((_, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[8px]">S</div>
                                            ))}
                                            {(cls.students.length || 0) > 3 && <div className="w-6 h-6 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[8px]">+{cls.students.length - 3}</div>}
                                            {(cls.students.length || 0) === 0 && <span>No Students</span>}
                                        </div>
                                        <span>{cls.materials?.length || 0} Materials</span>
                                    </div>

                                    {/* Stream / Classwork List */}
                                    <div className="flex-1 space-y-2 mb-4">
                                        {(!cls.materials?.length && !cls.assessments?.length) && (
                                            <div className="text-center py-6 text-slate-300 italic text-sm">
                                                Nothing posted yet
                                            </div>
                                        )}

                                        {/* List Materials */}
                                        {cls.materials && cls.materials.slice(0, 3).map(m => (
                                            <div key={m._id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-sm group/item hover:border-purple-200 transition-colors">
                                                <div className={`p-1.5 rounded ${m.type === 'pdf' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                                                    <BookOpen size={14} />
                                                </div>
                                                <span className="truncate flex-1 font-medium text-slate-700">{m.title}</span>
                                                <a href={m.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline opacity-0 group-hover/item:opacity-100">View</a>
                                            </div>
                                        ))}

                                        {/* List Assessments */}
                                        {cls.assessments && cls.assessments.slice(0, 2).map(a => (
                                            <div key={a._id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100 text-sm">
                                                <ClipboardCheck size={14} className="text-green-600" />
                                                <span className="truncate flex-1 font-medium text-green-800">{a.title}</span>
                                            </div>
                                        ))}

                                        {(cls.materials?.length > 3 || cls.assessments?.length > 2) && (
                                            <div className="text-xs text-center text-slate-400 font-bold cursor-pointer hover:text-purple-500">View All...</div>
                                        )}
                                    </div>

                                    {/* Action Footer */}
                                    <div className="border-t border-slate-100 pt-3 grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => { setSelectedClassId(cls._id || cls.id); setShowMaterialModal(true); }}
                                            className="col-span-1 py-2 flex flex-col items-center justify-center gap-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-bold"
                                            title="Post Material"
                                        >
                                            <BookOpen size={16} /> Post
                                        </button>
                                        <button
                                            onClick={() => { setSelectedClassId(cls._id || cls.id); setShowAssessModal(true); }}
                                            className="col-span-1 py-2 flex flex-col items-center justify-center gap-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs font-bold"
                                            title="Assign Task"
                                        >
                                            <ClipboardCheck size={16} /> Task
                                        </button>
                                        <button
                                            onClick={() => { setSelectedClassId(cls._id || cls.id); setShowInviteModal(true); }}
                                            className="col-span-1 py-2 flex flex-col items-center justify-center gap-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold"
                                            title="Invite"
                                        >
                                            <Mail size={16} /> Invite
                                        </button>
                                    </div>
                                </div>
                            </div >
                        ))}
                    </div >
                )}
            </div >

            {/* Material Upload Modal */}
            {/* Material Upload Modal */}
            {
                showMaterialModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                                <BookOpen size={20} className="text-indigo-500" /> Assign Material
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1">File Title (Optional)</label>
                                    <input
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                                        placeholder="Lecture 1 Slides"
                                        value={materialTitle}
                                        onChange={e => setMaterialTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1">Select Document/File</label>
                                    <input
                                        type="file"
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        onChange={e => setMaterialFile(e.target.files[0])}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowMaterialModal(false)} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button
                                    onClick={handleUploadMaterial}
                                    disabled={isUploading}
                                    className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {isUploading ? "Uploading..." : "Upload & Assign"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Invite Modal */}
            {
                showInviteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2"><Send size={20} className="text-blue-500" /> Invite Student</h2>
                            <label className="block text-sm font-bold text-slate-500 mb-2">Student Email Address</label>
                            <input
                                type="email"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold mb-6 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="student@example.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setShowInviteModal(false)} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button onClick={handleInvite} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Send Invite</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Assessment Modal */}
            {
                showAssessModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <ClipboardCheck size={24} className="text-green-600" /> Assign Assessment
                                </h2>
                                <button onClick={() => setShowAssessModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                    <Plus size={24} className="rotate-45 text-slate-400" />
                                </button>
                            </div>

                            <div className="overflow-y-auto flex-1 pr-2 space-y-3">
                                {availableLevels.length === 0 ? (
                                    <p className="text-center text-slate-500 py-8">No levels available. Create one first!</p>
                                ) : availableLevels.map(level => {
                                    const isAssigned = classes.find(c => c._id === selectedClassId)?.assessments?.some(a => a._id === level._id);
                                    return (
                                        <div key={level._id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50">
                                            <div>
                                                <h4 className="font-bold text-slate-800">{level.title}</h4>
                                                <span className="text-xs uppercase font-bold text-slate-400">{level.difficulty} • {level.xpReward} XP</span>
                                            </div>
                                            {isAssigned ? (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                    <Check size={12} /> Assigned
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleAssignLevel(level._id)}
                                                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800"
                                                >
                                                    Assign
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Create Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <h2 className="text-2xl font-black text-slate-800 mb-6">Create New Class</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1">Class Name</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="e.g. Grade 10 English"
                                        value={newClass.name}
                                        onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1">Subject</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="e.g. Literature"
                                        value={newClass.subject}
                                        onChange={e => setNewClass({ ...newClass, subject: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1">Section (Optional)</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="e.g. A"
                                        value={newClass.section}
                                        onChange={e => setNewClass({ ...newClass, section: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-all"
                                >
                                    Create Class
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ClassManager;
