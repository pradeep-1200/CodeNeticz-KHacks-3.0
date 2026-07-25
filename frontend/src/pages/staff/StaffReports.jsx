import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import StaffNavbar from '../../components/StaffNavbar';
import { Download, Calendar, Filter, AlertTriangle, CheckCircle, RefreshCw, Users, ShieldAlert, Edit2, Save } from 'lucide-react';
import { getStaffReportsData, overrideStudentSupportProfile } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const StaffReports = () => {
    const toast = useToast();
    const [reportData, setReportData] = useState({
        assignmentData: [],
        performanceData: [],
        difficultyDistribution: [],
        studentAlerts: [],
        studentsList: []
    });
    const [loading, setLoading] = useState(true);
    const [editingStudentId, setEditingStudentId] = useState(null);
    const [editForm, setEditForm] = useState({ reading: 'none', writing: 'none', math: 'none' });

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            const data = await getStaffReportsData();
            if (data && data.success) {
                setReportData({
                    assignmentData: data.assignmentData || [],
                    performanceData: data.performanceData || [],
                    difficultyDistribution: data.difficultyDistribution || [],
                    studentAlerts: data.studentAlerts || [],
                    studentsList: data.studentsList || []
                });
            }
        } catch (err) {
            console.error("Failed to load staff reports:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartEdit = (student) => {
        setEditingStudentId(student._id);
        setEditForm({
            reading: student.supportProfile?.reading || 'none',
            writing: student.supportProfile?.writing || 'none',
            math: student.supportProfile?.math || 'none'
        });
    };

    const handleSaveOverride = async (studentId) => {
        try {
            const res = await overrideStudentSupportProfile(studentId, {
                supportProfile: editForm
            });
            if (res.success) {
                toast.success("Student support profile updated!");
                setEditingStudentId(null);
                loadReports();
            }
        } catch (err) {
            console.error("Failed to override support profile:", err);
            toast.error("Error updating profile.");
        }
    };

    const assignmentData = reportData.assignmentData.length > 0 ? reportData.assignmentData : [
        { name: 'Class 8-A', submitted: 24, pending: 4 },
        { name: 'Class 9-B', submitted: 18, pending: 12 },
        { name: 'Class 7-C', submitted: 30, pending: 2 },
    ];

    const performanceData = reportData.performanceData.length > 0 ? reportData.performanceData : [
        { name: 'Week 1', avgScore: 65 },
        { name: 'Week 2', avgScore: 72 },
        { name: 'Week 3', avgScore: 78 },
        { name: 'Week 4', avgScore: 82 },
        { name: 'Week 5', avgScore: 88 },
    ];

    const difficultyDistribution = reportData.difficultyDistribution.length > 0 ? reportData.difficultyDistribution : [
        { name: 'Text & Doc Submissions', value: 40, color: '#4ade80' },
        { name: 'Multiple Choice (MCQ)', value: 35, color: '#60a5fa' },
        { name: 'Voice & Speech Tasks', value: 25, color: '#f472b6' },
    ];

    const studentAlerts = reportData.studentAlerts;
    const studentsList = reportData.studentsList;

    const getBadgeStyle = (band) => {
        if (band === 'full') return 'bg-red-500/10 text-red-600 border-red-500/30';
        if (band === 'mild') return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
    };

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors">
            <StaffNavbar />

            <div className="container mx-auto px-4 md:px-8 py-8 space-y-8 max-w-7xl animate-fade-in-up">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[var(--text-primary)]">Class Performance Reports</h1>
                        <p className="text-xs text-[var(--text-secondary)] font-medium">Real-time analytics for assignments, support-profile vectors, and student progress</p>
                    </div>
                    <button onClick={loadReports} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md transition-all">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Analytics
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-extrabold text-xs shadow-sm">
                        <Calendar size={16} /> Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-xl font-bold text-xs hover:bg-gray-50">
                        <Filter size={16} /> All Active Classrooms
                    </button>
                </div>

                {/* ── PHASE 1 — STUDENT SUPPORT PROFILE VECTOR PANEL ── */}
                <div className="bg-white dark:bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                                <Users size={20} className="text-indigo-600" /> Student Cognitive Support Profiles
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] font-medium">
                                Diagnostic support-profile vector (Reading, Writing, Math) generated by Prelims screener. Staff can override support bands below.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] text-xs font-black uppercase text-[var(--text-secondary)]">
                                    <th className="py-3 px-4">Student Name</th>
                                    <th className="py-3 px-4">Prelims Status</th>
                                    <th className="py-3 px-4">Reading Band</th>
                                    <th className="py-3 px-4">Writing Band</th>
                                    <th className="py-3 px-4">Math Band</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)] text-sm">
                                {studentsList.length > 0 ? studentsList.map((st) => {
                                    const isEditing = editingStudentId === st._id;
                                    const prof = st.supportProfile || { reading: 'none', writing: 'none', math: 'none' };

                                    return (
                                        <tr key={st._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                                            <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                                                {st.name}
                                                <div className="text-xs font-normal text-[var(--text-secondary)]">{st.email}</div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {st.isPrelimsCompleted ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                                        <CheckCircle size={12} /> Completed ({st.prelimsScore || 0}%)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>

                                            {/* Reading Band */}
                                            <td className="py-3.5 px-4">
                                                {isEditing ? (
                                                    <select
                                                        className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold"
                                                        value={editForm.reading}
                                                        onChange={(e) => setEditForm({ ...editForm, reading: e.target.value })}
                                                    >
                                                        <option value="none">none (≥80%)</option>
                                                        <option value="mild">mild (50-79%)</option>
                                                        <option value="full">full (&lt;50%)</option>
                                                    </select>
                                                ) : (
                                                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border uppercase ${getBadgeStyle(prof.reading)}`}>
                                                        {prof.reading}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Writing Band */}
                                            <td className="py-3.5 px-4">
                                                {isEditing ? (
                                                    <select
                                                        className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold"
                                                        value={editForm.writing}
                                                        onChange={(e) => setEditForm({ ...editForm, writing: e.target.value })}
                                                    >
                                                        <option value="none">none (≥80%)</option>
                                                        <option value="mild">mild (50-79%)</option>
                                                        <option value="full">full (&lt;50%)</option>
                                                    </select>
                                                ) : (
                                                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border uppercase ${getBadgeStyle(prof.writing)}`}>
                                                        {prof.writing}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Math Band */}
                                            <td className="py-3.5 px-4">
                                                {isEditing ? (
                                                    <select
                                                        className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold"
                                                        value={editForm.math}
                                                        onChange={(e) => setEditForm({ ...editForm, math: e.target.value })}
                                                    >
                                                        <option value="none">none (≥80%)</option>
                                                        <option value="mild">mild (50-79%)</option>
                                                        <option value="full">full (&lt;50%)</option>
                                                    </select>
                                                ) : (
                                                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border uppercase ${getBadgeStyle(prof.math)}`}>
                                                        {prof.math}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                {isEditing ? (
                                                    <button
                                                        onClick={() => handleSaveOverride(st._id)}
                                                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 ml-auto hover:bg-emerald-700"
                                                    >
                                                        <Save size={14} /> Save
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStartEdit(st)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                                                        title="Override support bands"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="6" className="py-6 text-center text-xs text-[var(--text-secondary)] font-medium">
                                            No student records found in class.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Assignment Submission Rates */}
                    <div className="bg-white dark:bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <h3 className="text-lg font-black text-[var(--text-primary)] mb-6">Assignment Submission Rates</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={assignmentData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="submitted" name="Submitted" fill="#9333ea" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="pending" name="Pending" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Average Performance Trend */}
                    <div className="bg-white dark:bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <h3 className="text-lg font-black text-[var(--text-primary)] mb-6">Average Class Performance Trend</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avgScore"
                                        name="Avg Score (%)"
                                        stroke="#2563eb"
                                        strokeWidth={4}
                                        dot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Task Difficulty / Format Distribution */}
                    <div className="bg-white dark:bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <h3 className="text-lg font-black text-[var(--text-primary)] mb-6">Task Type Distribution</h3>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={difficultyDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {difficultyDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Student Alerts from DB */}
                    <div className="bg-white dark:bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <h3 className="text-lg font-black text-[var(--text-primary)] mb-4">Real-time Student Alerts</h3>
                        <div className="space-y-4">
                            {studentAlerts.map((alertItem, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border flex gap-4 items-start ${
                                    alertItem.type === 'warning' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 text-red-800 dark:text-red-300' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                                }`}>
                                    <div className="mt-0.5">
                                        {alertItem.type === 'warning' ? <AlertTriangle size={18} className="text-red-500" /> : <CheckCircle size={18} className="text-emerald-500" />}
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-xs">{alertItem.title}</h4>
                                        <p className="text-xs font-medium mt-0.5 opacity-90">{alertItem.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StaffReports;
