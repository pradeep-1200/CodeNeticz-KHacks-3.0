import React, { useState, useEffect } from 'react';
import { Plus, List, FileText, Calendar, Clock, Save, X, Check } from 'lucide-react';
import '../../styles/TeacherUpload.css'; // Reuse container styles

import apiClient from '../../api/client';

export default function TeacherAssessment() {
    const [isCreating, setIsCreating] = useState(false);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newAssessment, setNewAssessment] = useState({
        title: '',
        date: '',
        questions: '',
        type: 'Quiz'
    });

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        try {
            const response = await apiClient.get('/assessment');
            setAssessments(response.data);
        } catch (error) {
            console.error("Error fetching assessments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setIsCreating(true);
    };

    const handleCancelClick = () => {
        setIsCreating(false);
        setNewAssessment({ title: '', date: '', questions: '', type: 'Quiz' });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const assessmentData = {
                title: newAssessment.title,
                dueDate: newAssessment.date,
                questions: parseInt(newAssessment.questions) || 0,
                type: newAssessment.type
            };

            await apiClient.post('/assessment', assessmentData);
            fetchAssessments(); // Refresh list
            setIsCreating(false);
            setNewAssessment({ title: '', date: '', questions: '', type: 'Quiz' });
        } catch (error) {
            alert("Failed to create assessment");
            console.error(error);
        }
    };

    return (
        <div className="upload-container fade-in">
            <div className="section-title">
                <h1>Assessments</h1>
                {!isCreating && (
                    <button className="primary-btn" onClick={handleCreateClick}>
                        <Plus size={20} />
                        Create Assessment
                    </button>
                )}
            </div>

            {isCreating ? (
                <div className="upload-card fade-in" style={{ textAlign: 'left' }}>
                    <h2 style={{ marginBottom: '20px' }}>New Assessment Details</h2>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group">
                            <label>Assessment Title</label>
                            <input
                                type="text"
                                required
                                className="form-input"
                                placeholder="e.g., Chapter 1 Quiz"
                                value={newAssessment.title}
                                onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    required
                                    className="form-input"
                                    value={newAssessment.date}
                                    onChange={(e) => setNewAssessment({ ...newAssessment, date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Number of Questions</label>
                                <input
                                    type="number"
                                    required
                                    className="form-input"
                                    placeholder="e.g., 10"
                                    value={newAssessment.questions}
                                    onChange={(e) => setNewAssessment({ ...newAssessment, questions: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Assessment Type</label>
                            <select
                                className="form-input"
                                value={newAssessment.type}
                                onChange={(e) => setNewAssessment({ ...newAssessment, type: e.target.value })}
                            >
                                <option>Quiz</option>
                                <option>Exam</option>
                                <option>Homework</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                            <button type="button" className="nav-btn" onClick={handleCancelClick} style={{ border: '1px solid var(--border-color)', background: 'white', color: 'var(--text-primary)' }}>
                                Cancel
                            </button>
                            <button type="submit" className="primary-btn">
                                <Save size={18} />
                                Save Draft
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="file-list" style={{ marginTop: '20px' }}>
                    {loading ? <p>Loading assessments...</p> : assessments.map((assessment) => (
                        <AssessmentItem
                            key={assessment._id}
                            title={assessment.title}
                            status={assessment.status}
                            date={assessment.dueDate}
                            questions={assessment.questionCount}
                        />
                    ))}
                    {!loading && assessments.length === 0 && <p>No assessments found.</p>}
                </div>
            )}
        </div>
    );
}

const AssessmentItem = ({ title, status, date, questions }) => (
    <div className="file-item">
        <div className="file-info">
            <div className="file-icon" style={{ background: '#e8f0fe', color: '#1967d2' }}>
                <FileText />
            </div>
            <div className="file-details">
                <h4 style={{ fontSize: '1rem' }}>{title}</h4>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {new Date(date).toLocaleDateString()}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><List size={14} /> {questions} Questions</span>
                </div>
            </div>
        </div>
        <div style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            background: status === 'Active' ? '#e6f4ea' : (status === 'Draft' ? '#f1f3f4' : '#fef7e0'),
            color: status === 'Active' ? '#137333' : (status === 'Draft' ? '#5f6368' : '#b06000')
        }}>
            {status}
        </div>
    </div>
);
