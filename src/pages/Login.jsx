import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, ArrowRight, Accessibility } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (userType === 'student') {
      navigate('/student/dashboard');
    } else {
      alert("Teacher dashboard not available in this demo.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] p-4">
      <div className="w-full max-w-md bg-[var(--bg-primary)] p-8 rounded-2xl shadow-xl border border-[var(--border-color)]">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Welcome Back</h1>
          <p className="text-[var(--text-secondary)]">Please login to access your classroom.</p>
        </div>

        {/* User Type Toggle */}
        <div className="flex p-1 bg-[var(--bg-secondary)] rounded-xl mb-2">
          <button
            type="button"
            onClick={() => setUserType('student')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              userType === 'student' 
                ? 'bg-[var(--accent-primary)] text-white shadow-md' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            I am a Student
          </button>
          <button
            type="button"
            onClick={() => setUserType('teacher')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              userType === 'teacher' 
                ? 'bg-[var(--accent-primary)] text-white shadow-md' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            I am a Teacher
          </button>
        </div>
        
        {/* Role Explanation */}
        <div className="text-center mb-6 text-sm text-[var(--text-secondary)] italic">
           {userType === 'student' ? 'Access your lessons, assessments, and progress.' : 'Manage classes, track student progress, and assignments.'}
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                className="w-full p-3 pl-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                className="w-full p-3 pl-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-[var(--accent-primary)] text-white rounded-xl font-bold text-lg hover:opacity-90 shadow-lg transition-all transform hover:scale-[1.02] flex justify-center items-center gap-2"
          >
             {userType === 'student' ? <User size={20}/> : <GraduationCap size={20}/>}
             Login as {userType === 'student' ? 'Student' : 'Teacher'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border-color)] text-center space-y-4">
          <button 
             onClick={() => navigate('/')}
             className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] font-semibold flex items-center justify-center gap-2 w-full py-2"
          >
             Continue as Guest (Read Only) <ArrowRight size={16} />
          </button>
          <p className="text-xs text-[var(--text-secondary)]">
             You can explore the platform before logging in.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-2 rounded-lg">
             <Accessibility size={14} /> All features support voice and visual adjustments.
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
