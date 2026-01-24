import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FileText, Megaphone, Plus, Download, Calendar } from 'lucide-react';
import TeacherNavbar from '../../components/TeacherNavbar';

export default function TeacherClassroom() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('materials');
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClassData();
    }, [id]);

    const fetchClassData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/teacher/classes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setClassData(data.class);
        } catch (error) {
            console.error('Error fetching class data:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'materials', label: 'Materials', icon: FileText },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'students', label: 'Students', icon: Users }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)]">
                <TeacherNavbar />
                <div className="flex items-center justify-center h-64">
                    <div className="text-[var(--text-secondary)]">Loading classroom...</div>
                </div>
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)]">
                <TeacherNavbar />
                <div className="p-6">
                    <div className="text-center py-16">
                        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Class Not Found</h3>
                        <button
                            onClick={() => navigate('/teacher/classroom')}
                            className="text-emerald-600 hover:text-emerald-700"
                        >
                            Back to Classrooms
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)]">
            <TeacherNavbar />
            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/teacher/classroom')}
                            className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-[var(--text-secondary)]" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--text-primary)]">{classData.name}</h1>
                            <p className="text-[var(--text-secondary)] mt-1">{classData.description}</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)]">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-100 p-3 rounded-lg">
                                    <Users size={24} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{classData.students?.length || 0}</p>
                                    <p className="text-[var(--text-secondary)] text-sm">Students</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)]">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <FileText size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{classData.materials?.length || 0}</p>
                                    <p className="text-[var(--text-secondary)] text-sm">Materials</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)]">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <Megaphone size={24} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{classData.announcements?.length || 0}</p>
                                    <p className="text-[var(--text-secondary)] text-sm">Announcements</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                        <div className="flex border-b border-[var(--border-color)]">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? 'text-emerald-600 border-b-2 border-emerald-600'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                    }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {activeTab === 'materials' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Class Materials</h3>
                                        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                                            <Plus size={16} />
                                            Add Material
                                        </button>
                                    </div>
                                    {classData.materials?.length > 0 ? (
                                        <div className="space-y-3">
                                            {classData.materials.map((material, index) => (
                                                <div key={index} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={20} className="text-[var(--text-secondary)]" />
                                                        <div>
                                                            <p className="font-medium text-[var(--text-primary)]">{material.name}</p>
                                                            <p className="text-sm text-[var(--text-secondary)]">{material.type}</p>
                                                        </div>
                                                    </div>
                                                    <button className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors">
                                                        <Download size={16} className="text-[var(--text-secondary)]" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <FileText size={48} className="mx-auto text-[var(--text-secondary)] mb-3" />
                                            <p className="text-[var(--text-secondary)]">No materials uploaded yet</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'announcements' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Announcements</h3>
                                        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                                            <Plus size={16} />
                                            New Announcement
                                        </button>
                                    </div>
                                    {classData.announcements?.length > 0 ? (
                                        <div className="space-y-4">
                                            {classData.announcements.map((announcement, index) => (
                                                <div key={index} className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h4 className="font-medium text-[var(--text-primary)]">{announcement.title}</h4>
                                                        <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                                                            <Calendar size={12} />
                                                            {new Date(announcement.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <p className="text-[var(--text-secondary)]">{announcement.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Megaphone size={48} className="mx-auto text-[var(--text-secondary)] mb-3" />
                                            <p className="text-[var(--text-secondary)]">No announcements yet</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'students' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Students</h3>
                                        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                                            <Plus size={16} />
                                            Add Student
                                        </button>
                                    </div>
                                    {classData.students?.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {classData.students.map((student, index) => (
                                                <div key={index} className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                            <Users size={20} className="text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-[var(--text-primary)]">{student.name}</p>
                                                            <p className="text-sm text-[var(--text-secondary)]">{student.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Users size={48} className="mx-auto text-[var(--text-secondary)] mb-3" />
                                            <p className="text-[var(--text-secondary)]">No students enrolled yet</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}