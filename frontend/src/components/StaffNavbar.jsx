import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Layout, Users, BarChart2, LogOut, Settings, BookOpen, Upload, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';

const StaffNavbar = () => {
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', path: '/staff/dashboard', icon: Layout },
        { name: 'My Classes', path: '/staff/classes', icon: Users },
        { name: 'Upload Material', path: '/staff/upload-material', icon: Upload },
        { name: 'Reports', path: '/staff/reports', icon: BarChart2 },
    ];

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login', { replace: true });
    };

    return (
        <nav className="sticky top-0 z-40 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-color)] shadow-sm px-4 md:px-8 py-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3 font-extrabold text-xl tracking-tight cursor-pointer" onClick={() => navigate('/staff/dashboard')}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                    <ShieldCheck size={22} />
                </div>
                <div className="flex items-center gap-1.5 font-black">
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">ACLC</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-bold border border-purple-500/20">Faculty Portal</span>
                </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 bg-[var(--bg-secondary)]/50 p-1.5 rounded-2xl border border-[var(--border-color)] overflow-x-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === '/staff/dashboard'}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${isActive
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-[1.02]'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                            }`
                        }
                    >
                        <item.icon size={17} />
                        <span className="hidden md:inline">{item.name}</span>
                    </NavLink>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => window.dispatchEvent(new Event('open-a11y-toolbar'))}
                    className="p-2.5 text-[var(--text-secondary)] hover:text-purple-600 hover:bg-[var(--bg-secondary)] rounded-xl transition-all border border-transparent hover:border-[var(--border-color)]"
                    title="Accessibility Controls"
                >
                    <Settings size={20} />
                </button>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-all text-sm font-bold border border-transparent hover:border-red-500/20"
                    title="Logout"
                >
                    <LogOut size={18} />
                    <span className="hidden md:inline">Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default StaffNavbar;
