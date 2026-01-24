
import React, { useState } from 'react';
import {
    BookOpen,
    MessageSquare,
    Users,
    FileText,
    Plus,
    MoreVertical,
    Copy,
    CheckCircle,
    Clock
} from 'lucide-react';
import '../../styles/TeacherClassroom.css';

// --- Dummy Data ---

const MOCK_CLASS_INFO = {
    name: "Mathematics - Grade 10",
    code: "MATH-10-2024-X",
    subject: "Mathematics",
    teacher: "Sarah Johnson"
};

const MOCK_MATERIALS = [
    {
        id: 1,
        title: "Introduction to Calculus",
        type: "PDF",
        subject: "Math",
        topic: "Calculus",
        difficulty: "Medium",
        date: "2024-03-15",
        accessibility: {
            simplified: true,
            readAloud: true,
            highContrast: false
        }
    },
    {
        id: 2,
        title: "Algebra Fundamentals",
        type: "Video",
        subject: "Math",
        topic: "Algebra",
        difficulty: "Easy",
        date: "2024-03-10",
        accessibility: {
            simplified: true,
            readAloud: true,
            highContrast: true
        }
    },
    {
        id: 3,
        title: "Geometry Practice Sheet",
        type: "Worksheet",
        subject: "Math",
        topic: "Geometry",
        difficulty: "Hard",
        date: "2024-03-12",
        accessibility: {
            simplified: false,
            readAloud: false,
            highContrast: true
        }
    }
];

const MOCK_DISCUSSIONS = [
    {
        id: 1,
        author: "Sarah Johnson",
        isTeacher: true,
        content: "Welcome to the new semester! Please check the materials tab for the syllabus.",
        date: "2 days ago",
        replies: []
    },
    {
        id: 2,
        author: "Alex Rivera",
        isTeacher: false,
        content: "When is the first assessment due?",
        date: "1 day ago",
        replies: []
    }
];

const MOCK_STUDENTS = [
    { id: 1, name: "Alex Rivera", status: "Joined", progress: 75 },
    { id: 2, name: "Casey Smith", status: "Joined", progress: 45 },
    { id: 3, name: "Jordan Lee", status: "Joined", progress: 90 },
    { id: 4, name: "Riley Chen", status: "Pending", progress: 0 },
    { id: 5, name: "Taylor Kim", status: "Joined", progress: 60 },
];

export default function TeacherClassroom() {
    const [activeTab, setActiveTab] = useState('materials');
    const [materials, setMaterials] = useState(MOCK_MATERIALS);

    // Handlers
    const handleCopyCode = () => {
        navigator.clipboard.writeText(MOCK_CLASS_INFO.code);
        alert(`Class code ${MOCK_CLASS_INFO.code} copied to clipboard`);
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
            <div className="materials-actions">
                <button className="upload-btn" aria-label="Upload new material">
                    <Plus size={20} />
                    <span>Upload Material</span>
                </button>
            </div>

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
                                <MoreVertical size={20} color="#5f6368" />
                            </button>
                        </div>

                        <div>
                            <h3 className="card-title">{material.title}</h3>
                            <p className="card-subtitle">{material.type} • {material.date}</p>
                        </div>

                        <div>
                            <span className="badge badge-topic">{material.topic}</span>
                            <span className={`badge ${material.difficulty === 'Hard' ? 'badge-difficulty' : 'badge-topic'}`}
                                style={material.difficulty === 'Hard' ? {} : { backgroundColor: '#e8f0fe', color: '#1967d2' }}>
                                {material.difficulty}
                            </span>
                        </div>

                        <div className="access-controls">
                            <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#5f6368', textTransform: 'uppercase' }}>Accessibility Preview</p>

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
                    {MOCK_DISCUSSIONS.map(post => (
                        <div key={post.id} className="comment-card">
                            <div className="comment-header">
                                <div className="avatar" style={{ backgroundColor: post.isTeacher ? '#1a73e8' : '#e37400' }}>
                                    {post.author.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className="author-name">{post.author}</span>
                                        {post.isTeacher && <span className="teacher-badge">Teacher</span>}
                                    </div>
                                    <span className="comment-date">{post.date}</span>
                                </div>
                            </div>
                            <p className="comment-body">{post.content}</p>
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f3f4' }}>
                                <input
                                    type="text"
                                    placeholder="Add class comment..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #dadce0',
                                        borderRadius: '20px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStudents = () => (
        <div className="tab-content fade-in">
            <div className="student-list">
                <div style={{ padding: '1rem 1.5rem', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex' }}>
                    <span style={{ flex: 1, fontWeight: 'bold', color: '#5f6368' }}>Name</span>
                    <span style={{ width: '150px', fontWeight: 'bold', color: '#5f6368' }}>Status</span>
                    <span style={{ width: '150px', fontWeight: 'bold', color: '#5f6368' }}>Progress</span>
                </div>
                {MOCK_STUDENTS.map(student => (
                    <div key={student.id} className="student-row">
                        <div className="student-info">
                            <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem', backgroundColor: '#5f6368' }}>
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
                            <span style={{ fontSize: '0.75rem', color: '#5f6368' }}>{student.progress}% completed</span>
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
            <p style={{ color: '#5f6368' }}>Create a new quiz or assignment to get started.</p>
            <button className="upload-btn" style={{ margin: '1rem auto' }}>
                <Plus size={20} /> Create Assessment
            </button>
        </div>
    );

    return (
        <div className="classroom-container">
            {/* Header Section */}
            <header className="class-header">
                <h1 className="class-title">{MOCK_CLASS_INFO.name}</h1>
                <div className="class-code">
                    <span>Class Code:</span>
                    <span style={{ fontWeight: 'bold', color: '#202124' }}>{MOCK_CLASS_INFO.code}</span>
                    <button
                        className="copy-btn"
                        onClick={handleCopyCode}
                        aria-label="Copy class code"
                        title="Copy Class Code"
                    >
                        <Copy size={18} style={{ marginLeft: '0.5rem' }} />
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
                <button
                    className={`tab-button ${activeTab === 'assessments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assessments')}
                    role="tab"
                    aria-selected={activeTab === 'assessments'}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <FileText size={20} />
                    Assessments
                </button>
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
                {activeTab === 'assessments' && renderAssessments()}
                {activeTab === 'discussions' && renderDiscussions()}
                {activeTab === 'students' && renderStudents()}
            </main>
        </div>
    );
}
