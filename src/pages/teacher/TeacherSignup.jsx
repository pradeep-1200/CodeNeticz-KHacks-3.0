import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TeacherSignup() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        const result = await register({
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: "teacher"
        });

        if (result.success) {
            alert("Account created successfully! Please login with your new credentials.");
            navigate('/teacher/login');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] p-4">
            <div className="w-full max-w-md bg-[var(--bg-primary)] p-8 rounded-2xl shadow-xl border border-[var(--border-color)]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Create Teacher Account</h1>
                    <p className="text-[var(--text-secondary)]">Join the Adaptive Cognitive Learning Classroom</p>
                </div>

                {error && <div className="text-red-500 text-sm text-center mb-4 font-bold">{error}</div>}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none"
                            placeholder="Sarah Johnson"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none"
                            placeholder="teacher@school.edu"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--accent-hover)] shadow-lg transition-all">
                        Sign Up
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-[var(--text-secondary)]">Already have an account? <Link to="/teacher/login" className="text-[var(--accent-primary)] font-bold hover:underline">Login here</Link></p>
                </div>
            </div>
        </div>
    );
}