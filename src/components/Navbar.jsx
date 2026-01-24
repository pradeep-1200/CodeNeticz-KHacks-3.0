import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Layout, BookOpen, ClipboardCheck, BarChart2, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: Layout },
    { name: 'Classroom', path: '/student/classroom', icon: BookOpen },
    { name: 'Assessment', path: '/student/assessment', icon: ClipboardCheck },
    { name: 'Report', path: '/student/report', icon: BarChart2 },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[var(--bg-primary)] border-b border-[var(--border-color)] shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
       <div className="flex items-center gap-2 font-bold text-xl">
          <BookOpen size={28} className="text-blue-600"/>
          <span className="hidden lg:inline text-blue-600">Adaptive Cognitive Learning</span>
          <span className="hidden lg:inline text-green-600">Classroom</span>
          <span className="lg:hidden text-blue-600">ACLC</span>
       </div>

       <div className="flex items-center gap-2 md:gap-6 overflow-x-auto">
          {navItems.map((item) => (
             <NavLink
               key={item.name}
               to={item.path}
               end={item.path === '/student/dashboard'}
               className={({ isActive }) => 
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm md:text-base whitespace-nowrap ${
                     isActive 
                     ? 'bg-[var(--accent-primary)] text-white shadow-md' 
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
             className="p-2 text-[var(--text-secondary)] hover:text-blue-600 hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
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

export default Navbar;
