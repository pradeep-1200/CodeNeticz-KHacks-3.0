import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import Landing from './pages/Landing';
import Register from './pages/Register';
import UnifiedLogin from './pages/UnifiedLogin';
import Dashboard from './pages/student/Dashboard';
import Classroom from './pages/student/Classroom';
import AssessmentPage from './pages/student/AssessmentPage';
import Report from './pages/student/Report';
import Profile from './pages/student/Profile';

// Teacher imports
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherLogin from './pages/teacher/TeacherLogin';
import TeacherSignup from './pages/teacher/TeacherSignup';
import TeacherCreateClass from './pages/teacher/TeacherCreateClass';
import TeacherClassroomList from './pages/teacher/TeacherClassroomList';
import TeacherClassroom from './pages/teacher/TeacherClassroom';
import TeacherUpload from './pages/teacher/TeacherUpload';
import TeacherAssessment from './pages/teacher/TeacherAssessment';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';
import TeacherProfile from './pages/teacher/TeacherProfile';

import { AuthProvider } from './context/AuthContext';

// Import Global Styles
import './index.css';

const TitleUpdater = () => {
  const location = useLocation();
  useEffect(() => {
    const titles = {
      '/': 'Welcome - ACLC',
      '/login': 'Login - ACLC',
      '/register': 'Join - ACLC',
      '/student/dashboard': 'Dashboard - ACLC',
      '/student/classroom': 'Classroom - ACLC',
      '/student/assessment': 'Assessment - ACLC',
      '/student/report': 'Report - ACLC'
    };
    document.title = titles[location.pathname] || 'Adaptive Cognitive Learning Classroom';
  }, [location]);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TitleUpdater />
        {/* Global Accessibility Toolbar - Always Visible */}
        <AccessibilityToolbar />

        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 font-sans">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<UnifiedLogin />} />
            <Route path="/register" element={<Register />} />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<Dashboard />} />
            <Route path="/student/classroom" element={<Classroom />} />
            <Route path="/student/assessment" element={<AssessmentPage />} />
            <Route path="/student/report" element={<Report />} />
            <Route path="/student/profile" element={<Profile />} />

            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/login" element={<TeacherLogin />} />
            <Route path="/teacher/signup" element={<TeacherSignup />} />
            <Route path="/teacher/create-class" element={<TeacherCreateClass />} />
            <Route path="/teacher/classroom" element={<TeacherClassroomList />} />
            <Route path="/teacher/classroom/:id" element={<TeacherClassroom />} />
            <Route path="/teacher/upload" element={<TeacherUpload />} />
            <Route path="/teacher/assessment" element={<TeacherAssessment />} />
            <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
            <Route path="/teacher/profile" element={<TeacherProfile />} />

            {/* Fallback */}
            <Route path="*" element={<Landing />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
