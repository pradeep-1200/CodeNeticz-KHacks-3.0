import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, UserCircle } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/';

  const handleLogout = () => {
    // In a real app, clear auth tokens here
    navigate('/');
  };

  return (
    <header className="app-header">
      <Link to={isLoginPage ? "/" : "/teacher/dashboard"} className="logo-link">
        <div className="logo">Adaptive Cognitive Learning</div>
      </Link>
      <nav className="nav-links">
        {!isLoginPage && (
          <>
            <Link to="/teacher/dashboard" className="nav-item">Dashboard</Link>
            <Link to="/teacher/profile" className="nav-item" title="Profile">
              <UserCircle size={24} />
            </Link>
            <button
              onClick={handleLogout}
              className="nav-item"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Logout"
            >
              <LogOut size={24} />
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
