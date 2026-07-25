import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, ArrowLeft, Accessibility, Lock, Mail, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from || null; // where we came from (ProtectedRoute redirect)

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await authService.login(email, password);

      // Navigate to where they were trying to go, or to role-appropriate dashboard
      if (from) return navigate(from, { replace: true });
      navigate(user.role === 'TEACHER' || user.role === 'ADMIN' ? '/staff/dashboard' : '/student/dashboard', { replace: true });
    } catch (err) {
      // Never render raw API/network errors: they may disclose implementation details.
      setError(
        err.response?.status === 401
          ? 'Invalid email or password. Please try again.'
          : 'We could not sign you in right now. Please try again shortly.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/50 transition-all flex items-center gap-2 text-sm font-bold shadow-sm z-20"
        aria-label="Back to home"
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl shadow-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden relative z-10 animate-fade-in-up">
        
        {/* Left Side Brand Banner */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="space-y-4">
             <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <BookOpen size={24} />
             </div>
             <h2 className="text-3xl font-black tracking-tight leading-tight">
                Adaptive Cognitive Learning Classroom
             </h2>
             <p className="text-indigo-100 font-medium text-sm leading-relaxed">
                Empowering students with Dyslexia, Dyscalculia, and Dysgraphia through AI-driven personalized accessibility tools.
             </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/10">
             <div className="flex items-center gap-2 text-xs font-bold text-indigo-100">
                <ShieldCheck size={16} className="text-emerald-400" /> Institution Role Auto-Detection
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-indigo-100">
                <Sparkles size={16} className="text-amber-300" /> Bionic Reader & Voice Dictation Hub
             </div>
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="text-center md:text-left mb-6">
              <h1 className="text-3xl font-black mb-1 tracking-tight text-[var(--text-primary)]">Welcome Back</h1>
              <p className="text-xs md:text-sm text-[var(--text-secondary)] font-medium">Sign in to access your personalized classroom</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 text-center animate-fade-in-up" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="block text-xs font-extrabold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3.5 text-[var(--text-secondary)]" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-base)] text-[var(--text-primary)] font-medium text-sm focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="student@institution.edu or staff@institution.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-extrabold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-3.5 text-[var(--text-secondary)]" />
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-base)] text-[var(--text-primary)] font-medium text-sm focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-4 mt-2 rounded-xl font-extrabold text-sm text-white transition-all shadow-lg bg-indigo-600 hover:bg-indigo-700 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-indigo-600/20"
              >
                {loading ? (
                  <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>{<User size={18} />} Sign In</>
                )}
              </button>

              <div className="text-center pt-2">
                <Link to="/register" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  Don't have an account? Create one here
                </Link>
              </div>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-[var(--border-color)]">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2.5 rounded-xl bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-color)]">
              <Accessibility size={16} className="text-indigo-500 shrink-0" />
              <span>Full accessibility toolbar and speech controls included</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
