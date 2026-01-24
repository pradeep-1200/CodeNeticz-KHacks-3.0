
import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    Users,
    Activity,
    CheckCircle,
    TrendingUp,
    AlertCircle,
    Lightbulb,
    Clock,
    ArrowRight
} from 'lucide-react';
import '../../styles/TeacherAnalytics.css';

// --- Dummy Data ---

const CLASS_STATS = [
    { label: "Avg Class Score", value: "78%", change: "+5%", icon: <Activity />, color: "#1a73e8", bg: "#e8f0fe" },
    { label: "Engagement Rate", value: "85%", change: "+12%", icon: <Users />, color: "#137333", bg: "#e6f4ea" },
    { label: "Completion Rate", value: "92%", change: "+2%", icon: <CheckCircle />, color: "#e37400", bg: "#fef7e0" },
];

const ASSESSMENT_DATA = [
    { name: 'Unit 1', score: 65 },
    { name: 'Unit 2', score: 72 },
    { name: 'Unit 3', score: 78 },
    { name: 'Midterm', score: 82 },
    { name: 'Unit 4', score: 85 },
];

const IMPROVEMENT_DATA = [
    { week: 'W1', avg: 60 },
    { week: 'W2', avg: 65 },
    { week: 'W3', avg: 70 },
    { week: 'W4', avg: 72 },
    { week: 'W5', avg: 78 },
    { week: 'W6', avg: 82 },
];

const ENGAGEMENT_DATA = [
    { name: 'Highly Engaged', value: 45 },
    { name: 'Moderately Engaged', value: 35 },
    { name: 'Needs Support', value: 20 },
];

const PIE_COLORS = ['#1a73e8', '#fbbc04', '#ea4335'];

const STUDENTS = [
    {
        id: 1,
        name: "Alex Rivera",
        performance: "Needs Support",
        insights: ["Reading support suggested", "Alternate input preferred"],
        before: { score: 45, time: "45m" },
        after: { score: 72, time: "30m" },
        suggestions: ["Enable audio-first mode", "Allow voice-to-text answers"]
    },
    {
        id: 2,
        name: "Casey Smith",
        performance: "On Track",
        insights: ["Concept-based help enabled"],
        before: { score: 70, time: "40m" },
        after: { score: 85, time: "35m" },
        suggestions: ["Provide advanced challenge problems"]
    },
    {
        id: 3,
        name: "Jordan Lee",
        performance: "Excelling",
        insights: ["Fast learner", "Visual strength"],
        before: { score: 88, time: "20m" },
        after: { score: 95, time: "15m" },
        suggestions: ["Encourage peer mentoring"]
    },
    {
        id: 4,
        name: "Riley Chen",
        performance: "Needs Support",
        insights: ["Focus aid suggested", "Simplified view"],
        before: { score: 50, time: "50m" },
        after: { score: 75, time: "35m" },
        suggestions: ["Turn on 'Focus Mode' by default", "Break tasks into smaller chunks"]
    }
];

export default function TeacherAnalytics() {
    const [selectedStudent, setSelectedStudent] = useState(STUDENTS[0]);

    return (
        <div className="analytics-container fade-in">
            <div className="analytics-header">
                <h1>Class Analytics & Reports</h1>
                <p>Overview of student performance, engagement, and adaptive learning impact.</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {CLASS_STATS.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon" style={{ color: stat.color, backgroundColor: stat.bg }}>
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <h3>{stat.label}</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                <span className="stat-value">{stat.value}</span>
                                <span className={`trend-indicator ${stat.change.startsWith('+') ? 'trend-up' : 'trend-down'}`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                {/* Left Column: Charts */}
                <div className="charts-section">

                    <div className="chart-card">
                        <div className="chart-header">
                            <h2 className="chart-title">Assessment Performance History</h2>
                            <TrendingUp size={20} color="#5f6368" />
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={ASSESSMENT_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#5f6368' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#5f6368' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                                        cursor={{ fill: '#f1f3f4' }}
                                    />
                                    <Bar dataKey="score" fill="#1a73e8" radius={[4, 4, 0, 0]} name="Avg Score" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-card">
                        <div className="chart-header">
                            <h2 className="chart-title">Improvement Over Time</h2>
                            <Activity size={20} color="#5f6368" />
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={IMPROVEMENT_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="week" tick={{ fill: '#5f6368' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#5f6368' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                                    />
                                    <Line type="monotone" dataKey="avg" stroke="#137333" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Class Avg" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-card">
                        <div className="chart-header">
                            <h2 className="chart-title">Class Engagement Distribution</h2>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={ENGAGEMENT_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {ENGAGEMENT_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Right Column: Student Insights */}
                <div className="insights-panel">

                    {/* Student List */}
                    <div className="student-list-card">
                        <div className="student-list-header">
                            Student List
                        </div>
                        <div className="student-list-content">
                            {STUDENTS.map(student => (
                                <div
                                    key={student.id}
                                    className={`student-item ${selectedStudent.id === student.id ? 'active' : ''}`}
                                    onClick={() => setSelectedStudent(student)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div
                                            style={{
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.8rem', fontWeight: 'bold', color: '#5f6368'
                                            }}>
                                            {student.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500', color: '#202124' }}>{student.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#5f6368' }}>{student.performance}</div>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} color="#dadce0" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Individual Student Detail */}
                    <div className="student-detail-card">
                        <div className="detail-header">
                            <div className="student-avatar-lg">
                                {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{selectedStudent.name}</h2>
                                <p style={{ color: '#5f6368', fontSize: '0.9rem' }}>Student ID: #{1000 + selectedStudent.id}</p>
                            </div>
                        </div>

                        <h4 style={{ marginBottom: '1rem', color: '#5f6368', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
                            Adaptive Insights
                        </h4>
                        <div className="insight-tags">
                            {selectedStudent.insights.map((insight, idx) => {
                                let className = 'insight-tag tag-concept';
                                if (insight.includes('Reading') || insight.includes('Focus')) className = 'insight-tag tag-support';
                                if (insight.includes('input')) className = 'insight-tag tag-input';

                                return (
                                    <span key={idx} className={className}>
                                        <AlertCircle size={14} />
                                        {insight}
                                    </span>
                                );
                            })}
                        </div>

                        <div className="comparison-box">
                            <h4 style={{ marginBottom: '1rem', color: '#202124', fontSize: '1rem' }}>Before vs After Adaptation</h4>

                            <div className="comparison-row">
                                <span className="comparison-label">Assessment Score</span>
                                <div>
                                    <span className="comparison-value">{selectedStudent.before.score}</span>
                                    <span style={{ margin: '0 0.5rem', color: '#dadce0' }}>→</span>
                                    <span className="comparison-value" style={{ color: '#137333' }}>{selectedStudent.after.score}</span>
                                    <span className="impact-badge">+{selectedStudent.after.score - selectedStudent.before.score}</span>
                                </div>
                            </div>

                            <div className="comparison-row">
                                <span className="comparison-label">Time Taken</span>
                                <div>
                                    <span className="comparison-value">{selectedStudent.before.time}</span>
                                    <span style={{ margin: '0 0.5rem', color: '#dadce0' }}>→</span>
                                    <span className="comparison-value" style={{ color: '#137333' }}>{selectedStudent.after.time}</span>
                                    <span className="impact-badge" style={{ background: '#e8f0fe', color: '#1967d2' }}>Faster</span>
                                </div>
                            </div>
                        </div>

                        <div className="suggestion-box">
                            <div className="suggestion-title">
                                <Lightbulb size={18} color="#fbbc04" />
                                Suggested Actions
                            </div>
                            {selectedStudent.suggestions.map((sagg, idx) => (
                                <div key={idx} className="suggestion-item">
                                    <div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', background: '#fbbc04', marginTop: '7px' }}></div>
                                    {sagg}
                                </div>
                            ))}
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
