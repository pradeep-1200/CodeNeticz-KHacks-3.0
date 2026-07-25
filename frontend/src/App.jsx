import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Layout / Guards
import ProtectedRoute from './components/layout/ProtectedRoute';

// Accessibility
import AccessibilityToolbar from './components/AccessibilityToolbar';

// Pages — Public
import Landing  from './pages/Landing';
import Register from './pages/Register';
import Login    from './pages/Login';

// Pages — Student (Protected)
import Dashboard      from './pages/student/Dashboard';
import Classroom      from './pages/student/Classroom';
import AssessmentPage from './pages/student/AssessmentPage';
import DyscalculiaTool from './pages/student/DyscalculiaTool';
import Report         from './pages/student/Report';
import Profile        from './pages/student/Profile';
import PlayLevel      from './pages/student/PlayLevel';
import LevelMap       from './pages/student/LevelMap';
import PrelimsTest    from './pages/student/PrelimsTest';

// Pages — Staff/Teacher (Protected)
import StaffDashboard   from './pages/staff/StaffDashboard';
import ClassManager     from './pages/staff/ClassManager';
import UploadMaterial   from './pages/staff/UploadMaterial';
import StaffReports     from './pages/staff/StaffReports';
import TeacherLevelBuilder from './pages/teacher/LevelBuilder';
import PrelimsManager   from './pages/staff/PrelimsManager';
import StudentProfile   from './pages/staff/StudentProfile';

// Sticky notes system
import { StickyProvider }    from './context/StickyContext';
import StickyContainer       from './components/sticky/StickyContainer';

// A3 FIX: AdaptiveProvider was missing — Dashboard/PrelimsTest/Assessment all need it
import { AdaptiveProvider }  from './context/AdaptiveContext';

// Global Styles
import './index.css';

// ── Page title updater ─────────────────────────────────────────
const TitleUpdater = () => {
  const location = useLocation();
  useEffect(() => {
    const titles = {
      '/':                    'Welcome — ACLC',
      '/login':               'Login — ACLC',
      '/register':            'Join — ACLC',
      '/student/dashboard':   'Dashboard — ACLC',
      '/student/classroom':   'Classroom — ACLC',
      '/student/assessment':  'Assessment — ACLC',
      '/student/report':      'Progress Report — ACLC',
      '/student/profile':     'Profile — ACLC',
      '/student/learn-path':  'Learning Path — ACLC',
      '/student/prelims':     'Assessment — ACLC',
      '/staff/dashboard':     'Teacher Dashboard — ACLC',
      '/staff/classes':       'Class Manager — ACLC',
    };
    document.title = titles[location.pathname] || 'Adaptive Cognitive Learning Classroom';
  }, [location]);
  return null;
};

// ── 404 Page ──────────────────────────────────────────────────
const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg-base)] text-[var(--text-primary)]">
    <h1 className="text-6xl font-bold" style={{ color: 'var(--color-primary)' }}>404</h1>
    <p className="text-xl text-[var(--text-secondary)]">Page not found</p>
    <a href="/" className="px-6 py-3 rounded-xl font-semibold text-white" style={{ background: 'var(--color-primary)' }}>
      Go Home
    </a>
  </div>
);

// ── App ───────────────────────────────────────────────────────
function App() {
  return (
    <AdaptiveProvider>
      <StickyProvider>
      <BrowserRouter>
        <TitleUpdater />

        {/* Global Accessibility Toolbar — always visible */}
        <AccessibilityToolbar />

        {/* Global Sticky Notes */}
        <StickyContainer />

        <div
          className="min-h-screen transition-colors duration-300"
          style={{
            background: 'var(--bg-base)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)'
          }}
        >
          <Routes>
            {/* ── Public Routes ─────────────────────────────── */}
            <Route path="/"         element={<Landing />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ── Student Routes (auth required, STUDENT role) ── */}
            <Route path="/student/prelims"    element={<ProtectedRoute role="STUDENT"><PrelimsTest /></ProtectedRoute>} />
            <Route path="/student/dashboard"  element={<ProtectedRoute role="STUDENT"><Dashboard /></ProtectedRoute>} />
            <Route path="/student/classroom"  element={<ProtectedRoute role="STUDENT"><Classroom /></ProtectedRoute>} />
            <Route path="/student/assessment" element={<ProtectedRoute role="STUDENT"><AssessmentPage /></ProtectedRoute>} />
            <Route path="/student/learn-path" element={<ProtectedRoute role="STUDENT"><LevelMap /></ProtectedRoute>} />
            {/* FIXED: removed duplicate /student/learn-path route */}
            <Route path="/student/play/:levelId" element={<ProtectedRoute role="STUDENT"><PlayLevel /></ProtectedRoute>} />
            <Route path="/student/report"     element={<ProtectedRoute role="STUDENT"><Report /></ProtectedRoute>} />
            <Route path="/student/profile"    element={<ProtectedRoute role="STUDENT"><Profile /></ProtectedRoute>} />
            <Route path="/dyscalculia-tool"   element={<ProtectedRoute role="STUDENT"><DyscalculiaTool /></ProtectedRoute>} />

            {/* ── Staff/Teacher Routes (auth required, TEACHER role) ── */}
            <Route path="/staff/dashboard"      element={<ProtectedRoute role="TEACHER"><StaffDashboard /></ProtectedRoute>} />
            <Route path="/staff/classes"        element={<ProtectedRoute role="TEACHER"><ClassManager /></ProtectedRoute>} />
            <Route path="/staff/upload-material" element={<ProtectedRoute role="TEACHER"><UploadMaterial /></ProtectedRoute>} />
            <Route path="/staff/prelims"        element={<ProtectedRoute role="TEACHER"><PrelimsManager /></ProtectedRoute>} />
            <Route path="/staff/create-level"   element={<ProtectedRoute role="TEACHER"><TeacherLevelBuilder /></ProtectedRoute>} />
            <Route path="/staff/reports"        element={<ProtectedRoute role="TEACHER"><StaffReports /></ProtectedRoute>} />
            <Route path="/teacher/students/:studentId" element={<ProtectedRoute role="TEACHER"><StudentProfile /></ProtectedRoute>} />

            {/* ── 404 Fallback ─────────────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </StickyProvider>
  </AdaptiveProvider>
  );
}

export default App;
