import React from 'react';
import { Link } from 'react-router-dom';
import {
    Layout,
    BarChart2,
    Upload,
    FileText,
    ArrowRight,
    Users,
    Clock
} from 'lucide-react';
import '../../styles/TeacherDashboard.css';

export default function TeacherDashboard() {
    const cards = [
        {
            title: "My Classroom",
            description: "Manage students, view materials, and facilitate discussions for Grade 10 Mathematics.",
            icon: <Layout size={28} color="#1a73e8" />,
            iconBg: "#e8f0fe",
            link: "/teacher/classroom/1",
            stats: [
                { value: "24", label: "Students" },
                { value: "3", label: "Pending" }
            ]
        },
        {
            title: "Analytics & Reports",
            description: "Track student progress, identify learning gaps, and view engagement metrics.",
            icon: <BarChart2 size={28} color="#ceead6" style={{ color: '#137333' }} />,
            iconBg: "#e6f4ea",
            link: "/teacher/analytics",
            stats: [
                { value: "85%", label: "Avg Score" },
                { value: "+12%", label: "Growth" }
            ]
        },
        {
            title: "Assessments",
            description: "Create and manage quizzes, assignments, and adaptive tests for your classes.",
            icon: <FileText size={28} color="#feefc3" style={{ color: '#b06000' }} />,
            iconBg: "#fef7e0",
            link: "/teacher/assessment",
            stats: [
                { value: "2", label: "Active" },
                { value: "1", label: "Draft" }
            ]
        },
        {
            title: "Upload Materials",
            description: "Upload PDFs, videos, and create adaptive learning content for your students.",
            icon: <Upload size={28} color="#e8eaed" style={{ color: '#5f6368' }} />,
            iconBg: "#f1f3f4",
            link: "/teacher/upload",
            stats: [
                { value: "15", label: "Files" },
                { value: "1.2GB", label: "Used" }
            ]
        }
    ];

    return (
        <div className="dashboard-container fade-in">
            <div className="dashboard-header">
                <div>
                    <h1>Teacher Dashboard</h1>
                    <p>Welcome back, Sarah. Here's what's happening today.</p>
                </div>
                <div className="dashboard-actions">
                    <button className="nav-btn" style={{ backgroundColor: 'white', color: 'var(--primary-blue)', border: '1px solid var(--border-color)' }}>
                        View Calendar
                    </button>
                </div>
            </div>

            <div className="dashboard-grid">
                {cards.map((card, index) => (
                    <Link to={card.link} key={index} className="dashboard-card">
                        <div className="card-icon-wrapper" style={{ backgroundColor: card.iconBg }}>
                            {card.icon}
                        </div>
                        <h3 className="card-title">{card.title}</h3>
                        <p className="card-description">{card.description}</p>

                        <div className="card-link">
                            Go to {card.title} <ArrowRight size={16} />
                        </div>

                        <div className="stat-row">
                            {card.stats.map((stat, idx) => (
                                <div key={idx} className="mini-stat">
                                    <span className="mini-stat-value">{stat.value}</span>
                                    <span className="mini-stat-label">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
