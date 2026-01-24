import React, { useState, useEffect } from 'react';
import TeacherNavbar from '../../components/TeacherNavbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, BookOpen, Award, Calendar, Target } from 'lucide-react';
import apiClient from '../../api/client';

const TeacherAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await apiClient.get('/teacher/analytics');
            setAnalyticsData(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            // Set mock data if API fails
            setAnalyticsData({
                overview: {
                    totalStudents: 45,
                    totalMaterials: 12,
                    totalAssessments: 8,
                    totalClasses: 3
                },
                studentProgress: [
                    { name: 'Week 1', completed: 20, pending: 5 },
                    { name: 'Week 2', completed: 35, pending: 10 },
                    { name: 'Week 3', completed: 40, pending: 5 },
                    { name: 'Week 4', completed: 45, pending: 0 }
                ],
                assessmentScores: [
                    { name: 'Quiz 1', average: 85 },
                    { name: 'Quiz 2', average: 78 },
                    { name: 'Quiz 3', average: 92 },
                    { name: 'Quiz 4', average: 88 }
                ],
                engagementMetrics: [
                    { name: 'Videos', engagement: 85 },
                    { name: 'PDFs', engagement: 70 },
                    { name: 'Quizzes', engagement: 95 },
                    { name: 'Assignments', engagement: 80 }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                <TeacherNavbar />
                <div className="p-8 text-center">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
            <TeacherNavbar />
            
            <main className="container mx-auto px-6 py-8 space-y-8">
                {/* Header */}
                <div className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-lg border border-[var(--border-color)]">
                    <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
                    <p className="text-[var(--text-secondary)]">
                        Track student progress, engagement metrics, and assessment performance.
                    </p>
                </div>

                {/* Overview Stats */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg"><Users size={24} /></div>
                            <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded">Total</span>
                        </div>
                        <h3 className="text-2xl font-bold">{analyticsData?.overview?.totalStudents || 0}</h3>
                        <p className="text-white/80 text-sm mt-1">Active Students</p>
                    </div>

                    <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900 dark:text-green-300"><BookOpen size={24} /></div>
                            <span className="text-2xl font-bold">{analyticsData?.overview?.totalMaterials || 0}</span>
                        </div>
                        <h3 className="font-semibold text-[var(--text-secondary)]">Materials</h3>
                        <p className="text-xs text-green-500 mt-1 font-medium">Uploaded</p>
                    </div>

                    <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900 dark:text-orange-300"><Award size={24} /></div>
                            <span className="text-2xl font-bold">{analyticsData?.overview?.totalAssessments || 0}</span>
                        </div>
                        <h3 className="font-semibold text-[var(--text-secondary)]">Assessments</h3>
                        <p className="text-xs text-orange-500 mt-1 font-medium">Created</p>
                    </div>

                    <div className="p-6 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900 dark:text-purple-300"><Target size={24} /></div>
                            <span className="text-2xl font-bold">{analyticsData?.overview?.totalClasses || 0}</span>
                        </div>
                        <h3 className="font-semibold text-[var(--text-secondary)]">Classes</h3>
                        <p className="text-xs text-purple-500 mt-1 font-medium">Active</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Student Progress Chart */}
                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-[var(--accent-primary)]" />
                            Student Progress
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData?.studentProgress || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'var(--bg-primary)', 
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px'
                                    }} 
                                />
                                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Assessment Scores */}
                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Award size={20} className="text-[var(--accent-primary)]" />
                            Assessment Scores
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analyticsData?.assessmentScores || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'var(--bg-primary)', 
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px'
                                    }} 
                                />
                                <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={3} name="Average Score" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Engagement Metrics */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Users size={20} className="text-[var(--accent-primary)]" />
                            Content Engagement
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analyticsData?.engagementMetrics || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="engagement"
                                >
                                    {(analyticsData?.engagementMetrics || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Recent Activity Summary */}
                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Calendar size={20} className="text-[var(--accent-primary)]" />
                            Recent Activity
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm">New student joined Math Class</span>
                                </div>
                                <span className="text-xs text-[var(--text-secondary)]">2 hours ago</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm">Quiz 4 completed by 15 students</span>
                                </div>
                                <span className="text-xs text-[var(--text-secondary)]">5 hours ago</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span className="text-sm">New material uploaded</span>
                                </div>
                                <span className="text-xs text-[var(--text-secondary)]">1 day ago</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm">Assessment created</span>
                                </div>
                                <span className="text-xs text-[var(--text-secondary)]">2 days ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherAnalytics;