import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Layout, Users, PlusCircle, BarChart2, LogOut, Settings, BookOpen } from 'lucide-react';

const StaffNavbar = () => {
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', path: '/staff/dashboard', icon: Layout },
        { name: 'My Classes', path: '/staff/classes', icon: Users },
        { name: 'Reports', path: '/staff/reports', icon: BarChart2 },
        // "Level Builder" removed as requested "remove skill builder part". 
        // If they need to build levels, they can use the "Create Level" Quick Action on Dashboard or I can rename it. 
        // Assuming they want the nav item gone. 
        // But wait, if I remove it, they can't access it easily. 
        // The prompt said "remove the skill builder part in the staff end". 
        // Maybe they meant "Skill Builder" specifically. 
        // I'll keep "Create Level" via Dashboard but remove it from here to be safe and clean.
    ];

    return (
        <nav className="sticky top-0 z-40 bg-[var(--bg-primary)] border-b border-[var(--border-color)] shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl">
                <BookOpen size={28} className="text-purple-600" />
                <span className="hidden lg:inline text-purple-600">ACLC</span>
                <span className="hidden lg:inline text-slate-600"> Staff Portal</span>
            </div>

            <div className="flex items-center gap-2 md:gap-6 overflow-x-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === '/staff/dashboard'}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm md:text-base whitespace-nowrap ${isActive
                                ? 'bg-purple-100 text-purple-700 font-bold shadow-sm'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                            }`
                        }
                    >
                        <item.icon size={18} />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => window.dispatchEvent(new Event('open-a11y-toolbar'))}
                    className="p-2 text-[var(--text-secondary)] hover:text-purple-600 hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
                    title="Settings"
                >
                    <Settings size={20} />
                </button>
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors px-2"
                    title="Logout"
                >
                    <LogOut size={20} />
                    <span className="hidden md:inline">Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default StaffNavbar;
