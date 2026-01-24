import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import '../../styles/TeacherLogin.css'; // Reusing login styles for form consistency

export default function TeacherCreateClass() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        className: '',
        description: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/class/create', formData);
            alert("Classroom created successfully!");
            navigate('/teacher/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to create classroom");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1>Create Classroom</h1>
                    <p>Start a new class for your students</p>
                </div>

                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="className">Class Name</label>
                        <input
                            type="text"
                            id="className"
                            className="form-input"
                            placeholder="e.g. Grade 10 Mathematics"
                            value={formData.className}
                            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <textarea
                            id="description"
                            className="form-input"
                            placeholder="Brief description of the class subject and goals."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                            type="button"
                            className="nav-btn"
                            onClick={() => navigate('/teacher/dashboard')}
                            style={{ flex: 1, border: '1px solid var(--border-color)', backgroundColor: 'white' }}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="login-btn" style={{ flex: 1, margin: 0 }}>
                            Create Class
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
