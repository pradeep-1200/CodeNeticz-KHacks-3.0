import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/student/Dashboard';
import Classroom from './pages/student/Classroom';
import AssessmentPage from './pages/student/AssessmentPage';
import Report from './pages/student/Report';

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
    <BrowserRouter>
      <TitleUpdater />
      {/* Global Accessibility Toolbar - Always Visible */}
      <AccessibilityToolbar />
      
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 font-sans">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<Dashboard />} />
          <Route path="/student/classroom" element={<Classroom />} />
          <Route path="/student/assessment" element={<AssessmentPage />} />
          <Route path="/student/report" element={<Report />} />
          
          {/* Fallback */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
