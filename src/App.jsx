import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import TeacherLanding from './pages/teacher/TeacherLanding';
import TeacherLogin from './pages/teacher/TeacherLogin';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherClassroom from './pages/teacher/TeacherClassroom';
import TeacherUpload from './pages/teacher/TeacherUpload';
import TeacherAssessment from './pages/teacher/TeacherAssessment';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />

        <Route path="teacher">
          <Route index element={<TeacherLanding />} />
          <Route path="login" element={<TeacherLogin />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="classroom/:id" element={<TeacherClassroom />} />
          <Route path="upload" element={<TeacherUpload />} />
          <Route path="assessment" element={<TeacherAssessment />} />
          <Route path="analytics" element={<TeacherAnalytics />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
