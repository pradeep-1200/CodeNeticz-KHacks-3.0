
import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    MessageSquare,
    Users,
    FileText,
    Plus,
    MoreVertical,
    Copy,
    CheckCircle,
    Clock,
    Share2
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import '../../styles/TeacherClassroom.css';

// --- Default Data for Loading State ---
const LOADING_CLASS_INFO = {
    name: "Loading...",
    code: "...",
    subject: "...",
    teacher: "..."
};

export default function TeacherClassroom() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('materials');
    const [classInfo, setClassInfo] = useState(LOADING_CLASS_INFO);
    const [materials, setMaterials] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClassroomData = async () => {
            // If ID is 1 (from mock dashboard), don't fetch or handle gracefully
            if (id === '1') {
                // Keep mock for id 1 if needed, or better, user should have clicked a real class
                // For now, let's try to fetch invalid ID and handle error, or just return
            }

            try {
                const response = await apiClient.get(`/class/${id}`);
                const data = response.data;
                setClassInfo({
                    name: data.className,
                    code: data.joinCode,
                    subject: "General", // Schema adjustment might be needed
                    teacher: data.teacherId?.name || "Teacher",
                    joinLink: data.joinLink
                });
                setMaterials([]); // TODO: Fetch materials for class
                setStudents(data.students?.map(s => ({
                    id: s._id,
                    name: s.name,
                    status: 'Joined',
                    progress: 0
                })) || []);
            } catch (error) {
                console.error("Error fetching class:", error);
                // If failed, maybe fallback to mock if user clicked the "My Classroom" card
                // which currently hardcodes /classroom/1. 
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchClassroomData();
    }, [id]);

    // Handlers
    const handleCopyCode = () => {
        navigator.clipboard.writeText(classInfo.code);
        alert(`Class code ${classInfo.code} copied to clipboard`);
    };

    const handleToggleAccessibility = (materialId, setting) => {
        setMaterials(prev => prev.map(m => {
            if (m.id === materialId) {
                return {
                    ...m,
                    accessibility: {
                        ...m.accessibility,
                        [setting]: !m.accessibility[setting]
                    }
                };
            }
            return m;
        }));
    };

    // Render Functions
    const renderMaterials = () => (
        <div className="tab-content fade-in">

            <div className="materials-grid">
                {materials.map(material => (
                    <article key={material.id} className="material-card">
                        <div className="card-header">
                            <div className="card-icon">
                                <FileText size={24} />
                            </div>
                            <button
                                className="icon-btn"
                                aria-label="More options"
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <MoreVertical size={20} color="var(--text-secondary)" />
                            </button>
                        </div>

                        <div>
                            <h3 className="card-title">{material.title}</h3>
                            <p className="card-subtitle">{material.type} • {material.date}</p>
                        </div>

                        <div>
                            <span className="badge badge-topic">{material.topic}</span>
                            <span className={`badge ${material.difficulty === 'Hard' ? 'badge-difficulty' : 'badge-topic'}`}
                                style={material.difficulty === 'Hard' ? {} : { backgroundColor: 'var(--bg-blue-light)', color: 'var(--primary-blue-hover)' }}>
                                {material.difficulty}
                            </span>
                        </div>

                        <div className="access-controls">
                            <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Accessibility Preview</p>

                            <div className="access-toggle">
                                <span>Simplified View</span>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={material.accessibility.simplified}
                                        onChange={() => handleToggleAccessibility(material.id, 'simplified')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="access-toggle">
                                <span>Read Aloud</span>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={material.accessibility.readAloud}
                                        onChange={() => handleToggleAccessibility(material.id, 'readAloud')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="access-toggle">
                                <span>High Contrast</span>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={material.accessibility.highContrast}
                                        onChange={() => handleToggleAccessibility(material.id, 'highContrast')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );

    const renderDiscussions = () => (
        <div className="tab-content fade-in">
            <div className="discussion-stream">
                <div className="post-input-container">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Announce something to your class</h3>
                    <div className="post-input-area">
                        <div className="avatar">SJ</div>
                        <textarea
                            className="post-textarea"
                            placeholder="Type your announcement here..."
                            aria-label="Announcement text area"
                        ></textarea>
                    </div>
                    <div className="post-actions">
                        <button className="upload-btn" style={{ padding: '0.5rem 1.5rem', borderRadius: '4px' }}>Post</button>
                    </div>
                </div>

                <div className="comment-list">
                    {/* Discussions TODO */}
                    <p>No discussions yet.</p>
                </div>
            </div>
        </div>
    );

    const [newStudentEmail, setNewStudentEmail] = useState('');

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post(`/class/${id}/add-student`, { email: newStudentEmail });
            const addedStudent = response.data.student;
            setStudents([...students, {
                id: addedStudent._id,
                name: addedStudent.name,
                status: 'Joined',
                progress: 0
            }]);
            setNewStudentEmail('');
            alert('Student added successfully');
        } catch (error) {
            console.error("Error adding student:", error);
            alert(error.response?.data?.message || "Failed to add student");
        }
    };

    const renderStudents = () => (
        <div className="tab-content fade-in">
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--bg-light)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Add Student Manually</h3>
                <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="email"
                        placeholder="Student Email Address"
                        className="form-input"
                        style={{ flex: 1, padding: '8px' }}
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        required
                    />
                    <button type="submit" className="primary-btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        <Plus size={16} style={{ marginRight: '4px' }} /> Add
                    </button>
                </form>
            </div>

            <div className="student-list">
                <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-light)', borderBottom: '1px solid var(--border-color)', display: 'flex' }}>
                    <span style={{ flex: 1, fontWeight: 'bold', color: 'var(--text-secondary)' }}>Name</span>
                    <span style={{ width: '150px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Status</span>
                    <span style={{ width: '150px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Progress</span>
                </div>
                {students.map(student => (
                    <div key={student.id} className="student-row">
                        <div className="student-info">
                            <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem', backgroundColor: 'var(--text-secondary)' }}>
                                {student.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="student-name">{student.name}</span>
                        </div>
                        <div style={{ width: '150px' }}>
                            {student.status === 'Joined' ? (
                                <span className="student-status" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <CheckCircle size={16} /> Joined
                                </span>
                            ) : (
                                <span style={{ color: '#e37400', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
                                    <Clock size={16} /> Pending
                                </span>
                            )}
                        </div>
                        <div style={{ width: '150px' }}>
                            <div className="progress-indicator">
                                <div className="progress-bar" style={{ width: `${student.progress}%` }}></div>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{student.progress}% completed</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAssessments = () => (
        <div className="tab-content fade-in" style={{ textAlign: 'center', padding: '4rem' }}>
            <img
                src="https://www.gstatic.com/classroom/empty_states_home.svg"
                alt="No assessments"
                style={{ height: '200px', marginBottom: '1rem', opacity: 0.5 }}
            />
            <h3>No assessments scheduled</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Create a new quiz or assignment to get started.</p>
            <button className="upload-btn" style={{ margin: '1rem auto' }}>
                <Plus size={20} /> Create Assessment
            </button>
        </div>
    );

    return (
        <div className="classroom-container">
            {/* Header Section */}
            <header className="class-header">
                <h1 className="class-title">{classInfo.name}</h1>
                <div className="class-code">
                    <span>Class Code:</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{classInfo.code}</span>
                    <button
                        className="copy-btn"
                        onClick={handleCopyCode}
                        aria-label="Copy class code"
                        title="Copy Class Code"
                    >
                        <Copy size={18} style={{ marginLeft: '0.5rem' }} />
                    </button>
                    <button
                        className="copy-btn"
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: `Join ${classInfo.name}`,
                                    text: `Join my class on ACLC using code: ${classInfo.code}`,
                                    url: classInfo.joinLink || window.location.href // Fallback if joinLink not fetched yet
                                });
                            } else {
                                navigator.clipboard.writeText(classInfo.joinLink || `Join code: ${classInfo.code}`);
                                alert('Join link copied to clipboard!');
                            }
                        }}
                        aria-label="Share class"
                        title="Share Class Link"
                        style={{ marginLeft: '0.5rem', color: 'var(--primary-blue)' }}
                    >
                        <Share2 size={18} />
                    </button>
                </div>
            </header>

            {/* Navigation */}
            <nav className="tabs-nav" role="tablist">
                <button
                    className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('materials')}
                    role="tab"
                    aria-selected={activeTab === 'materials'}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <BookOpen size={20} />
                    Materials
                </button>
                {/* Assessments tab removed as per request */}
                <button
                    className={`tab-button ${activeTab === 'discussions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('discussions')}
                    role="tab"
                    aria-selected={activeTab === 'discussions'}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <MessageSquare size={20} />
                    Discussions
                </button>
                <button
                    className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                    role="tab"
                    aria-selected={activeTab === 'students'}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Users size={20} />
                    Students
                </button>
            </nav>

            {/* Content Area */}
            <main className="content-area">
                {activeTab === 'materials' && renderMaterials()}
                {activeTab === 'discussions' && renderDiscussions()}
                {activeTab === 'students' && renderStudents()}
            </main>
        </div>
    );
}
