import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Layout, Users, BarChart2, LogOut, Settings, BookOpen, Upload, ShieldCheck, Bell } from 'lucide-react';
import { authService } from '../services/authService';
import { getNotifications, markAllNotificationsRead } from '../services/api';

const StaffNavbar = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/staff/dashboard', icon: Layout },
        { name: 'My Classes', path: '/staff/classes', icon: Users },
        { name: 'Upload Material', path: '/staff/upload-material', icon: Upload },
        { name: 'Reports', path: '/staff/reports', icon: BarChart2 },
    ];

    useEffect(() => {
        fetchStaffNotifications();
    }, []);

    const fetchStaffNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data?.notifications || data || []);
        } catch (err) { setNotifications([]); }
    };

    const toggleNotifDropdown = async () => {
        const nextState = !showNotifDropdown;
        setShowNotifDropdown(nextState);

        if (nextState && (notifications || []).some(n => !n.read)) {
            try {
                await markAllNotificationsRead();
                setNotifications(prev => (prev || []).map(n => ({ ...n, read: true })));
            } catch (err) { console.error("Failed to mark notifications read", err); }
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login', { replace: true });
    };

    const unreadCount = (notifications || []).filter(n => !n.read).length;

    return (
        <nav className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-color)] shadow-sm px-4 md:px-8 py-3 flex items-center justify-between transition-colors">
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

            <div className="flex items-center gap-2 relative">
                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={toggleNotifDropdown}
                        className="p-2.5 text-[var(--text-secondary)] hover:text-purple-600 hover:bg-[var(--bg-secondary)] rounded-xl transition-all border border-transparent hover:border-[var(--border-color)] relative"
                        title="Faculty Notifications"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-purple-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifDropdown && (
                        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl shadow-2xl p-4 z-50 animate-fade-in-up">
                            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-color)]">
                                <h3 className="font-extrabold text-sm text-[var(--text-primary)] flex items-center gap-2">
                                    <Bell size={16} className="text-purple-600" /> Faculty Notifications
                                </h3>
                                <span className="text-[10px] bg-purple-500/10 text-purple-600 font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
                            </div>

                            <div className="max-h-80 overflow-y-auto py-2 space-y-2">
                                {(notifications || []).map((notif, i) => (
                                    <div key={i} className={`p-3 rounded-xl border text-xs transition-colors ${notif.read ? 'bg-[var(--bg-base)] border-[var(--border-color)] opacity-70' : 'bg-purple-500/10 border-purple-500/30'}`}>
                                        <p className="font-medium text-[var(--text-primary)]">{notif.message}</p>
                                        <span className="text-[10px] text-[var(--text-secondary)] font-semibold mt-1 block">
                                            {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Recently'}
                                        </span>
                                    </div>
                                ))}

                                {(notifications || []).length === 0 && (
                                    <p className="text-center text-[var(--text-secondary)] py-6 text-xs italic">No new notifications.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

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
