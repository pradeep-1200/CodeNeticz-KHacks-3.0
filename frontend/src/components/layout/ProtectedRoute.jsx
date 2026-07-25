import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * Guards a route based on authentication and optional role requirement.
 * Unauthenticated users are redirected to /login with the intended path saved.
 * Wrong-role users are redirected to their correct dashboard.
 *
 * Usage:
 *   <Route path="/student/dashboard" element={<ProtectedRoute role="STUDENT"><Dashboard /></ProtectedRoute>} />
 *   <Route path="/staff/dashboard"   element={<ProtectedRoute role="TEACHER"><StaffDashboard /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children, role }) => {
  const user        = useAuthStore(s => s.user);
  const location    = useLocation();

  // Not authenticated at all
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Wrong role
  if (role && user.role !== role) {
    const redirect = user.role === 'TEACHER' || user.role === 'ADMIN'
      ? '/staff/dashboard'
      : '/student/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
