import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const response = await apiClient.get('/class/my-classes');
                setClassrooms(response.data || []);
            } catch (error) {
                console.error("Error fetching classrooms:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchClassrooms();
        }
    }, [user]);

    const activeClassId = classrooms.length > 0 ? classrooms[0]._id : null;
    const classCount = classrooms.length;
    const totalStudents = classrooms.reduce((acc, cls) => acc + (cls.students?.length || 0), 0);

    const cards = [
        {
            title: classCount > 1 ? "My Classrooms" : "My Classroom",
            description: classCount > 0
                ? `Manage students and materials for your ${classCount} active classroom${classCount > 1 ? 's' : ''}.`
                : "Create your first classroom to get started.",
            icon: <Layout size={28} color="#1a73e8" />,
            iconBg: "#e8f0fe",
            link: activeClassId ? `/teacher/classroom/${activeClassId}` : "/teacher/create-class",
            stats: [
                { value: totalStudents.toString(), label: "Students" },
                { value: classrooms.length.toString(), label: "Classes" }
            ]
        },
        {
            title: "Analytics & Reports",
            description: "Track student progress, identify learning gaps, and view engagement metrics.",
            icon: <BarChart2 size={28} color="#137333" />,
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
            icon: <FileText size={28} color="#b06000" />,
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
            icon: <Upload size={28} color="#5f6368" />,
            iconBg: "#f1f3f4",
            link: "/teacher/upload",
            stats: [
                { value: "15", label: "Files" },
                { value: "1.2GB", label: "Used" }
            ]
        }
    ];

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
            <div className="container mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
                    <p className="text-[var(--text-secondary)]">Welcome back, {user?.name?.split(' ')[0] || 'Teacher'}. Here's what's happening today.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {cards.map((card, index) => (
                        <Link to={card.link} key={index} className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-all block">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.iconBg }}>
                                    {card.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                                    <p className="text-[var(--text-secondary)] text-sm">{card.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-4">
                                    {card.stats.map((stat, idx) => (
                                        <div key={idx} className="text-center">
                                            <div className="text-lg font-bold">{stat.value}</div>
                                            <div className="text-xs text-[var(--text-secondary)]">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <ArrowRight size={20} className="text-[var(--text-secondary)]" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}