import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import StaffNavbar from '../../components/StaffNavbar';
import { Download, Calendar, Filter } from 'lucide-react';

const StaffReports = () => {
    // Mock Data (Replace with API data later)
    const assignmentData = [
        { name: 'Class 8-A', submitted: 24, pending: 4 },
        { name: 'Class 9-B', submitted: 18, pending: 12 },
        { name: 'Class 7-C', submitted: 30, pending: 2 },
        { name: 'Class 10-A', submitted: 20, pending: 5 },
    ];

    const performanceData = [
        { name: 'Week 1', avgScore: 65 },
        { name: 'Week 2', avgScore: 72 },
        { name: 'Week 3', avgScore: 78 },
        { name: 'Week 4', avgScore: 75 },
        { name: 'Week 5', avgScore: 82 },
    ];

    const difficultyDistribution = [
        { name: 'Easy', value: 40, color: '#4ade80' },
        { name: 'Medium', value: 35, color: '#60a5fa' },
        { name: 'Hard', value: 25, color: '#f472b6' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <StaffNavbar />

            <div className="container mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Class Performance Reports</h1>
                        <p className="text-slate-500">Analytics for assignments, attendance, and student progress</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-600 transition-colors">
                        <Download size={18} /> Export CSV
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold shadow-sm">
                        <Calendar size={16} /> Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg font-bold hover:bg-slate-50">
                        <Filter size={16} /> All Classes
                    </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">

                    {/* Assignment Submission Rates */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Assignment Submission Rates</h3>
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
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Average Class Performance</h3>
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

                    {/* Task Difficulty Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Task Difficulty Distribution</h3>
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

                    {/* Recent Alerts */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Student Alerts</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-4 items-start">
                                <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-red-800">Falling Behind</h4>
                                    <p className="text-sm text-red-600">3 students across 2 classes haven't submitted assignments for 2 weeks.</p>
                                </div>
                            </div>
                            <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex gap-4 items-start">
                                <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-green-800">Great Progress</h4>
                                    <p className="text-sm text-green-600">Class 8-A achieved 95% completion rate this week!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StaffReports;
