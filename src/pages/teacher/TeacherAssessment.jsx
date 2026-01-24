import React, { useState, useEffect } from 'react';
import TeacherNavbar from '../../components/TeacherNavbar';
import { Plus, FileText, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';

const TeacherAssessment = () => {
    const [assessments, setAssessments] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        type: 'mcq',
        audioText: '',
        difficulty: 'easy',
        hint: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        try {
            const response = await apiClient.get('/teacher/assessments');
            setAssessments(response.data || []);
        } catch (error) {
            console.error('Error fetching assessments:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const response = await apiClient.post('/teacher/create-assessment', formData);
            
            if (response.data.success) {
                setStatus({ type: 'success', message: 'Assessment created successfully!' });
                setFormData({
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: '',
                    type: 'mcq',
                    audioText: '',
                    difficulty: 'easy',
                    hint: ''
                });
                setShowCreateForm(false);
                fetchAssessments();
            }
        } catch (error) {
            console.error('Error creating assessment:', error);
            setStatus({ 
                type: 'error', 
                message: error.response?.data?.message || 'Failed to create assessment' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
            <TeacherNavbar />
            
            <main className="container mx-auto px-6 py-8 space-y-8">
                {/* Header */}
                <div className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-lg border border-[var(--border-color)]">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Assessments</h1>
                            <p className="text-[var(--text-secondary)]">
                                Create and manage quizzes, tests, and assignments for your students.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            Create Assessment
                        </button>
                    </div>
                </div>

                {/* Status Message */}
                {status && (
                    <div className={`p-4 rounded-lg flex items-center gap-2 ${
                        status.type === 'success' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {status.message}
                    </div>
                )}

                {/* Create Assessment Form */}
                {showCreateForm && (
                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold mb-6">Create New Assessment</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Question Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => handleInputChange('type', e.target.value)}
                                        className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    >
                                        <option value="mcq">Multiple Choice</option>
                                        <option value="audio">Audio Question</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                        className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Question</label>
                                <textarea
                                    value={formData.question}
                                    onChange={(e) => handleInputChange('question', e.target.value)}
                                    className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] h-24 resize-none"
                                    placeholder="Enter your question here..."
                                    required
                                />
                            </div>

                            {formData.type === 'audio' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Audio Text (for text-to-speech)</label>
                                    <textarea
                                        value={formData.audioText}
                                        onChange={(e) => handleInputChange('audioText', e.target.value)}
                                        className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] h-20 resize-none"
                                        placeholder="Text that will be converted to audio..."
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">Answer Options</label>
                                <div className="space-y-3">
                                    {formData.options.map((option, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <span className="w-8 h-8 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center text-sm font-medium">
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                                className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Correct Answer</label>
                                <select
                                    value={formData.correctAnswer}
                                    onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                                    className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    required
                                >
                                    <option value="">Select correct answer</option>
                                    {formData.options.map((option, index) => (
                                        option && (
                                            <option key={index} value={option}>
                                                {String.fromCharCode(65 + index)}: {option}
                                            </option>
                                        )
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Hint (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.hint}
                                    onChange={(e) => handleInputChange('hint', e.target.value)}
                                    className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    placeholder="Provide a helpful hint for students..."
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Creating...' : 'Create Assessment'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-6 py-3 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Assessments List */}
                <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
                    <h2 className="text-xl font-bold mb-6">Created Assessments</h2>
                    
                    <div className="space-y-4">
                        {assessments.length > 0 ? assessments.map((assessment, index) => (
                            <div key={index} className="p-4 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <FileText size={20} className="text-[var(--accent-primary)]" />
                                            <h3 className="font-semibold">{assessment.question}</h3>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                assessment.type === 'mcq' 
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                                            }`}>
                                                {assessment.type === 'mcq' ? 'Multiple Choice' : 'Audio'}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                assessment.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                                                assessment.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                                                'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                            }`}>
                                                {assessment.difficulty.charAt(0).toUpperCase() + assessment.difficulty.slice(1)}
                                            </span>
                                            <span>Correct: {assessment.correctAnswer}</span>
                                        </div>
                                        {assessment.hint && (
                                            <p className="text-sm text-[var(--text-secondary)] mt-2 italic">Hint: {assessment.hint}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-[var(--text-secondary)]">
                                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No assessments created yet</p>
                                <p className="text-sm">Create your first assessment to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherAssessment;