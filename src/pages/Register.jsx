import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, GraduationCap, ArrowRight, CheckCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { registerUser } from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState(null); // 'student' | 'teacher'
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        classCode: ''
    });

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setError('');

        try {
            const response = await registerUser({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: role
            });

            if (response.success) {
                navigate('/student/dashboard');
            } else {
                setError(response.message || "Registration failed");
            }
        } catch (err) {
            setError("Registration failed. Please check your connection.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
            <div className="w-full max-w-lg bg-[var(--bg-secondary)] rounded-2xl shadow-xl border border-[var(--border-color)] overflow-hidden relative">

                <div className="absolute top-4 left-4 z-10">
                    <Link to="/" className="p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/20 block">
                        <ArrowLeft size={24} />
                    </Link>
                </div>

                {/* Header */}
                <div className="bg-[var(--accent-primary)] p-6 text-white text-center">
                    <h1 className="text-2xl font-bold">Join the Classroom</h1>
                    <p className="opacity-90 mt-1">Create your accessible learning account</p>
                </div>

                <div className="p-8">

                    {/* Step 1: Role Selection */}
                    {!role ? (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-center text-[var(--text-primary)]">Who are you?</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setRole('student')}
                                    className="p-6 rounded-xl border-2 border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:bg-blue-50 transition-all flex flex-col items-center gap-3 text-center group"
                                >
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <User size={32} />
                                    </div>
                                    <span className="font-bold text-lg text-[var(--text-primary)]">Student</span>
                                </button>

                                <button
                                    onClick={() => setRole('teacher')}
                                    className="p-6 rounded-xl border-2 border-[var(--border-color)] hover:border-[var(--success-color)] hover:bg-green-50 transition-all flex flex-col items-center gap-3 text-center group"
                                >
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <GraduationCap size={32} />
                                    </div>
                                    <span className="font-bold text-lg text-[var(--text-primary)]">Teacher</span>
                                </button>
                            </div>

                            <p className="text-center text-[var(--text-secondary)] text-sm">
                                Select a role to continue.
                            </p>

                            <div className="pt-4 border-t border-[var(--border-color)] text-center">
                                <Link to="/login" className="text-[var(--accent-primary)] font-bold hover:underline">
                                    Already have an account? Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Step 2: Details Form */
                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="text-center mb-6">
                                <span className="inline-block px-3 py-1 bg-gray-100 text-[var(--text-secondary)] rounded-full text-sm font-bold mb-2">
                                    Registering as {role === 'student' ? 'Student' : 'Teacher'}
                                </span>
                                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Basic Details</h2>
                            </div>

                            {error && <div className="text-red-500 text-sm text-center mb-4 font-bold">{error}</div>}

                            <div>
                                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none"
                                    placeholder="e.g. Alex Johnson"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Password</label>
                                    <input
                                        type="password"
                                        className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Confirm</label>
                                    <input
                                        type="password"
                                        className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {role === 'student' && (
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                                        Class Code <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none"
                                        value={formData.classCode}
                                        onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-4 mt-4 bg-[var(--accent-primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--accent-hover)] transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                Create my account <ArrowRight size={20} />
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole(null)}
                                className="w-full py-2 text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)]"
                            >
                                Go Back
                            </button>

                            <div className="flex items-center justify-center gap-2 text-xs text-[var(--success-color)] mt-2 font-bold bg-green-50 p-2 rounded-lg">
                                <ShieldCheck size={14} /> Your learning adapts to you. Safe & Secure.
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Register;
