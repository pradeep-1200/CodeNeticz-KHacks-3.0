import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, ArrowLeft, User, Mail, Lock, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

const Register = () => {
    const navigate  = useNavigate();
    const user      = useAuthStore(s => s.user);

    // Already authenticated — skip registration and go straight to the dashboard
    if (user) {
        const dest = user.role === 'TEACHER' || user.role === 'ADMIN' ? '/staff/dashboard' : '/student/dashboard';
        return <Navigate to={dest} replace />;
    }

    const [error,    setError]    = useState('');
    const [loading,  setLoading]  = useState(false);
    const [success,  setSuccess]  = useState(false);   // shows success banner
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

    // Derive role hint based on typed domain
    const emailDomain = formData.email.includes('@') ? formData.email.split('@')[1] : '';
    const isTeacherHint = emailDomain.startsWith('staff.') || emailDomain === 'staff.com';
    const isStudentHint = emailDomain.startsWith('student.') || emailDomain === 'student.com';

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match'); return;
        }
        if (formData.password.length < 8 || formData.password.length > 30) {
            setError('Password must be 8–30 characters'); return;
        }
        setLoading(true);
        try {
            // Only creates the account — no tokens, no auth state update.
            await authService.register(formData.name, formData.email, formData.password);

            // Show success banner, then redirect to /login after 2 seconds.
            setSuccess(true);
            setTimeout(() => navigate('/login', { replace: true }), 2000);
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Success state ────────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)] text-[var(--text-primary)]">
                <div className="w-full max-w-md text-center space-y-6 animate-fade-in-up">
                    <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[var(--text-primary)] mb-2">Account Created!</h1>
                        <p className="text-sm text-[var(--text-secondary)] font-medium">
                            Your account has been created successfully.<br />
                            Redirecting you to the login page…
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <span className="animate-spin inline-block w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
                    </div>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        Go to Login <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        );
    }

    // ── Registration form ────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-hidden">
            
            {/* Ambient Lighting */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Back Button */}
            <Link 
                to="/" 
                className="absolute top-6 left-6 p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-purple-500/50 transition-all flex items-center gap-2 text-sm font-bold shadow-sm z-20"
            >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back to Home</span>
            </Link>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl shadow-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden relative z-10 animate-fade-in-up">
                
                {/* Left Side Brand Banner */}
                <div className="bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                            <BookOpen size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight leading-tight">
                            Join the Adaptive Learning Community
                        </h2>
                        <p className="text-purple-100 font-medium text-sm leading-relaxed">
                            Create your account to unlock personalized font spacing, automated text simplification, and speech-to-text dictation.
                        </p>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-100">
                            <ShieldCheck size={16} className="text-emerald-400" /> Automatic Role Provisioning
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-100">
                            <Sparkles size={16} className="text-amber-300" /> Adaptive Prelims Assessment Included
                        </div>
                    </div>
                </div>

                {/* Right Side Form Panel */}
                <div className="p-8 md:p-10 flex flex-col justify-between">
                    <div>
                        <div className="text-center md:text-left mb-6">
                            <h1 className="text-3xl font-black mb-1 tracking-tight text-[var(--text-primary)]">Create Account</h1>
                            <p className="text-xs md:text-sm text-[var(--text-secondary)] font-medium">
                                Role is auto-assigned based on your institution email
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 text-center animate-fade-in-up">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-extrabold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Full Name</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3.5 top-3.5 text-[var(--text-secondary)]" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-base)] text-[var(--text-primary)] font-medium text-sm focus:outline-none focus:border-purple-500 transition-all"
                                        placeholder="Alex Johnson"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-extrabold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Institution Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3.5 top-3.5 text-[var(--text-secondary)]" />
                                    <input
                                        type="email"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-base)] text-[var(--text-primary)] font-medium text-sm focus:outline-none focus:border-purple-500 transition-all"
                                        placeholder="name@student.com or name@staff.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                {emailDomain && (
                                    <div className="mt-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                        <Sparkles size={12} />
                                        {isTeacherHint ? 'Role detected: Faculty / Staff' : isStudentHint ? 'Role detected: Student' : 'Standard institutional registration'}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-extrabold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-3.5 top-3.5 text-[var(--text-secondary)]" />
                                        <input
                                            type="password"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-base)] text-[var(--text-primary)] font-medium text-sm focus:outline-none focus:border-purple-500 transition-all"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-extrabold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Confirm</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-3.5 top-3.5 text-[var(--text-secondary)]" />
                                        <input
                                            type="password"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-base)] text-[var(--text-primary)] font-medium text-sm focus:outline-none focus:border-purple-500 transition-all"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                id="register-submit"
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-2 text-white rounded-xl font-extrabold text-sm transition-all shadow-lg bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-purple-600/20"
                            >
                                {loading ? (
                                    <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <>Create My Account <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[var(--border-color)] text-center">
                        <Link to="/login" className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
