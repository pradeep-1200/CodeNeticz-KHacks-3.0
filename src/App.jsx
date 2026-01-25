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
import Profile from './pages/student/Profile';
import PlayLevel from './pages/student/PlayLevel';
import TeacherLevelBuilder from './pages/teacher/LevelBuilder';
import LevelMap from './pages/student/LevelMap';
import StaffDashboard from './pages/staff/StaffDashboard';
import ClassManager from './pages/staff/ClassManager';
import UploadMaterial from './pages/staff/UploadMaterial';
import StaffReports from './pages/staff/StaffReports';

import { StickyProvider } from './context/StickyContext';
import { GamificationProvider } from './context/GamificationContext';
import StickyContainer from './components/sticky/StickyContainer';

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
    <GamificationProvider>
      <StickyProvider>
        <BrowserRouter>
          <TitleUpdater />
          {/* Global Accessibility Toolbar - Always Visible */}
          <AccessibilityToolbar />

          {/* Global Sticky Notes System */}
          <StickyContainer />

          <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 font-sans">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={<Dashboard />} />
              <Route path="/student/classroom" element={<Classroom />} />
              <Route path="/student/assessment" element={<AssessmentPage />} />
              <Route path="/student/learn-path" element={<LevelMap />} />
              <Route path="/student/play/:levelId" element={<PlayLevel />} />

              {/* Staff Routes */}
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/classes" element={<ClassManager />} />
              <Route path="/staff/upload-material" element={<UploadMaterial />} />

              <Route path="/staff/create-level" element={<TeacherLevelBuilder />} />
              <Route path="/staff/reports" element={<StaffReports />} />

              <Route path="/student/report" element={<Report />} />
              <Route path="/student/profile" element={<Profile />} />

              {/* Fallback */}
              <Route path="*" element={<Landing />} />
            </Routes>
          </div>
        </BrowserRouter>
      </StickyProvider>
    </GamificationProvider>
  );
}

export default App;
