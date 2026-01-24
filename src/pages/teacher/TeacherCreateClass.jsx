import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherNavbar from '../../components/TeacherNavbar';

export default function TeacherCreateClass() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        className: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/teacher/create-class', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert("Classroom created successfully!");
                navigate('/teacher/classroom');
            } else {
                setError(data.message || "Failed to create classroom");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to create classroom");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)]">
            <TeacherNavbar />
            <div className="p-8">
                <div className="max-w-2xl mx-auto bg-[var(--bg-primary)] p-8 rounded-2xl">
                    <h1 className="text-2xl font-bold mb-4">Create Classroom</h1>
                    <p className="text-[var(--text-secondary)] mb-6">Start a new class for your students</p>

                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Class Name</label>
                            <input
                                type="text"
                                className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="e.g. Grade 10 Mathematics"
                                value={formData.className}
                                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Description (Optional)</label>
                            <textarea
                                className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                placeholder="Brief description of the class subject and goals."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                            />
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/teacher/classroom')}
                                className="flex-1 py-3 border border-[var(--border-color)] bg-white text-[var(--text-primary)] rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Class'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}