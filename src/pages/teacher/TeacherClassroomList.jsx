import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, BookOpen, Calendar } from 'lucide-react';
import TeacherNavbar from '../../components/TeacherNavbar';

export default function TeacherClassroomList() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/teacher/classes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setClasses(data.classes || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClassClick = (classId) => {
        navigate(`/teacher/classroom/${classId}`);
    };

    const handleCreateClass = () => {
        navigate('/teacher/create-class');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)]">
                <TeacherNavbar />
                <div className="flex items-center justify-center h-64">
                    <div className="text-[var(--text-secondary)]">Loading classes...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)]">
            <TeacherNavbar />
            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Classrooms</h1>
                            <p className="text-[var(--text-secondary)] mt-2">Manage your classes and students</p>
                        </div>
                        <button
                            onClick={handleCreateClass}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                            <Plus size={20} />
                            Create New Class
                        </button>
                    </div>

                    {classes.length === 0 ? (
                        <div className="text-center py-16">
                            <BookOpen size={64} className="mx-auto text-[var(--text-secondary)] mb-4" />
                            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Classes Yet</h3>
                            <p className="text-[var(--text-secondary)] mb-6">Create your first classroom to get started</p>
                            <button
                                onClick={handleCreateClass}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors"
                            >
                                Create Your First Class
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classes.map((classItem) => (
                                <div
                                    key={classItem._id}
                                    onClick={() => handleClassClick(classItem._id)}
                                    className="bg-[var(--bg-primary)] rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-[var(--border-color)] hover:border-emerald-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-emerald-100 p-3 rounded-lg">
                                            <BookOpen size={24} className="text-emerald-600" />
                                        </div>
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                            Active
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                                        {classItem.name}
                                    </h3>
                                    
                                    <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
                                        {classItem.description || 'No description available'}
                                    </p>
                                    
                                    <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                                        <div className="flex items-center gap-1">
                                            <Users size={16} />
                                            <span>{classItem.students?.length || 0} students</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={16} />
                                            <span>{new Date(classItem.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}