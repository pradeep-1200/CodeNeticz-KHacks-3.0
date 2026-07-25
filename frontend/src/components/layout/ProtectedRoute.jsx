import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

/**
 * Guards a route based on authentication and optional role requirement.
 * Performs a silent token refresh on initial load if user info exists in store
 * but accessToken is missing in memory, preventing 401 errors on initial page load.
 */
const ProtectedRoute = ({ children, role }) => {
  const user        = useAuthStore(s => s.user);
  const accessToken = useAuthStore(s => s.accessToken);
  const clearAuth   = useAuthStore(s => s.clearAuth);
  const location    = useLocation();

  const [isInitializing, setIsInitializing] = useState(!accessToken && !!user);

  useEffect(() => {
    let isMounted = true;
    if (user && !accessToken) {
      authService.refresh()
        .then(() => {
          if (isMounted) setIsInitializing(false);
        })
        .catch(() => {
          if (isMounted) {
            clearAuth();
            setIsInitializing(false);
          }
        });
    } else {
      setIsInitializing(false);
    }
    return () => { isMounted = false; };
  }, [user, accessToken, clearAuth]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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
