import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import TeacherLanding from './pages/teacher/TeacherLanding';
import TeacherLogin from './pages/teacher/TeacherLogin';
import TeacherSignup from './pages/teacher/TeacherSignup';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCreateClass from './pages/teacher/TeacherCreateClass';
import TeacherClassroom from './pages/teacher/TeacherClassroom';
import TeacherUpload from './pages/teacher/TeacherUpload';
import TeacherAssessment from './pages/teacher/TeacherAssessment';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';
import TeacherProfile from './pages/teacher/TeacherProfile';
import StudentExploration from './pages/student/StudentExploration';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TeacherLogin />} />

          <Route path="teacher">
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="create-class" element={<TeacherCreateClass />} />
            <Route path="classroom/:id" element={<TeacherClassroom />} />
            <Route path="upload" element={<TeacherUpload />} />
            <Route path="assessment" element={<TeacherAssessment />} />
            <Route path="login" element={<TeacherLogin />} />
            <Route path="signup" element={<TeacherSignup />} />
            <Route path="analytics" element={<TeacherAnalytics />} />
            <Route path="profile" element={<TeacherProfile />} />
          </Route>
          <Route path="student/exploration" element={<StudentExploration />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
