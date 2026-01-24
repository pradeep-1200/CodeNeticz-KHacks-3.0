import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TeacherNavbar from '../../components/TeacherNavbar';
import {
    Layout,
    BarChart2,
    Upload,
    FileText,
    ArrowRight,
    Users,
    Clock,
    BookOpen,
    TrendingUp,
    CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [classrooms, setClassrooms] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classroomsRes, materialsRes, assessmentsRes] = await Promise.all([
                    apiClient.get('/class/my-classes').catch(() => ({ data: [] })),
                    apiClient.get('/teacher/materials').catch(() => ({ data: [] })),
                    apiClient.get('/teacher/assessments').catch(() => ({ data: [] }))
                ]);
                
                setClassrooms(classroomsRes.data || []);
                setMaterials(materialsRes.data || []);
                setAssessments(assessmentsRes.data || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const classCount = classrooms.length;
    const totalStudents = classrooms.reduce((acc, cls) => acc + (cls.students?.length || 0), 0);
    const materialsCount = materials.length;
    const assessmentsCount = assessments.length;

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                <TeacherNavbar />
                <div className="p-8 text-center">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
            <TeacherNavbar />

            <main className="container mx-auto px-6 py-8 space-y-8">
                {/* Welcome Section */}
                <div className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-lg border border-[var(--border-color)]">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Teacher'}! 👋</h1>
                    <p className="text-[var(--text-secondary)]">
                        Manage your classes, create engaging content, and track student progress.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-6">
                    {/* Active Classes */}
                    <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg"><Layout size={24} /></div>
                            <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded">{classCount} Classes</span>
                        </div>
                        <h3 className="text-2xl font-bold">{totalStudents} Students</h3>
                        <p className="text-white/80 text-sm mt-1">Across all your classrooms</p>
                        <div className="w-full bg-black/20 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-yellow-400 h-full" style={{ width: `${Math.min((totalStudents / 50) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                    {/* Materials */}
                    <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900 dark:text-blue-300"><BookOpen size={24} /></div>
                            <span className="text-2xl font-bold">{materialsCount}</span>
                        </div>
                        <h3 className="font-semibold text-[var(--text-secondary)]">Materials</h3>
                        <p className="text-xs text-[var(--accent-primary)] mt-1 font-medium">Ready to share</p>
                    </div>

                    {/* Assessments */}
                    <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900 dark:text-orange-300"><FileText size={24} /></div>
                            <span className="text-2xl font-bold">{assessmentsCount}</span>
                        </div>
                        <h3 className="font-semibold text-[var(--text-secondary)]">Assessments</h3>
                        <p className="text-xs text-orange-500 mt-1 font-medium">Created</p>
                    </div>

                    {/* Engagement */}
                    <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900 dark:text-green-300"><TrendingUp size={24} /></div>
                            <span className="text-2xl font-bold">85%</span>
                        </div>
                        <h3 className="font-semibold text-[var(--text-secondary)]">Engagement</h3>
                        <p className="text-xs text-green-500 mt-1 font-medium">This week</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Clock size={20} className="text-[var(--text-secondary)]"/> Quick Actions
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link to="/teacher/create-class" className="p-6 bg-[var(--bg-primary)] rounded-xl shadow border border-[var(--border-color)] hover:border-emerald-500 transition-all group flex flex-col gap-3">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors dark:bg-emerald-900 dark:text-emerald-200">
                                    <Layout size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">My Classrooms</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Manage students and content</p>
                                </div>
                            </Link>

                            <Link to="/teacher/upload" className="p-6 bg-[var(--bg-primary)] rounded-xl shadow border border-[var(--border-color)] hover:border-emerald-500 transition-all group flex flex-col gap-3">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors dark:bg-emerald-900 dark:text-emerald-200">
                                    <Upload size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Upload Materials</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Add new learning content</p>
                                </div>
                            </Link>

                            <Link to="/teacher/assessment" className="p-6 bg-[var(--bg-primary)] rounded-xl shadow border border-[var(--border-color)] hover:border-emerald-500 transition-all group flex flex-col gap-3">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors dark:bg-emerald-900 dark:text-emerald-200">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Create Assessment</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Build quizzes and tests</p>
                                </div>
                            </Link>

                            <Link to="/teacher/analytics" className="p-6 bg-[var(--bg-primary)] rounded-xl shadow border border-[var(--border-color)] hover:border-emerald-500 transition-all group flex flex-col gap-3">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors dark:bg-emerald-900 dark:text-emerald-200">
                                    <BarChart2 size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">View Analytics</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Track student progress</p>
                                </div>
                            </Link>
                        </div>

                        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">Recent Activity</h2>
                            <div className="space-y-4">
                                {materials.slice(0, 3).map((material, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center dark:bg-slate-800">
                                            <CheckCircle size={18} className="text-green-500"/>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-[var(--text-primary)]">
                                                Uploaded: {material.title}
                                            </h4>
                                            <p className="text-xs text-[var(--text-secondary)]">{material.date}</p>
                                        </div>
                                    </div>
                                ))}
                                {materials.length === 0 && (
                                    <p className="text-center text-[var(--text-secondary)]">No recent activity.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Teaching Tip */}
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl shadow-lg border border-emerald-100 dark:from-slate-800 dark:to-slate-700">
                            <h2 className="text-xl font-bold mb-4 text-emerald-800 dark:text-emerald-300">Teaching Tip 💡</h2>
                            <p className="text-slate-700 mb-4 text-sm dark:text-slate-300">
                                Use varied content types to engage different learning styles. Mix videos, PDFs, and interactive assessments.
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
                            <h3 className="font-bold text-lg mb-4">This Week</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-secondary)]">Materials Uploaded</span>
                                    <span className="font-bold">{materials.filter(m => new Date(m.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length || 2}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-secondary)]">Assessments Created</span>
                                    <span className="font-bold">{assessments.filter(a => new Date(a.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length || 1}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-secondary)]">Student Engagement</span>
                                    <span className="font-bold text-green-600">85%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}