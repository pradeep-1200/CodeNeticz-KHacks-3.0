import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TeacherLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await login(email, password);

        if (result.success) {
            navigate('/teacher/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] p-4">
            <div className="w-full max-w-md bg-[var(--bg-primary)] p-8 rounded-2xl shadow-xl border border-[var(--border-color)]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Teacher Login</h1>
                    <p className="text-[var(--text-secondary)]">Sign in to your teacher dashboard</p>
                </div>

                {error && <div className="text-red-500 text-sm text-center mb-4 font-bold">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none"
                            placeholder="teacher@school.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--accent-hover)] shadow-lg transition-all">
                        Sign In
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-[var(--text-secondary)]">Don't have an account? <Link to="/teacher/signup" className="text-[var(--accent-primary)] font-bold hover:underline">Register now</Link></p>
                </div>
            </div>
        </div>
    );
}