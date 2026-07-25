import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Layout, BookOpen, ClipboardCheck, BarChart2, LogOut, Settings, User, Bell, Check, Mail } from 'lucide-react';
import { authService } from '../services/authService';
import { getNotifications, getStudentInvites, respondToInvite, markAllNotificationsRead } from '../services/api';

const Navbar = () => {
   const navigate = useNavigate();
   const [notifications, setNotifications] = useState([]);
   const [invites, setInvites] = useState([]);
   const [showNotifDropdown, setShowNotifDropdown] = useState(false);

   const navItems = [
      { name: 'Dashboard', path: '/student/dashboard', icon: Layout },
      { name: 'Classroom', path: '/student/classroom', icon: BookOpen },
      { name: 'Assessment', path: '/student/assessment', icon: ClipboardCheck },
      { name: 'Report', path: '/student/report', icon: BarChart2 },
      { name: 'Profile', path: '/student/profile', icon: User },
   ];

   useEffect(() => {
      fetchNotificationsAndInvites();
   }, []);

   const fetchNotificationsAndInvites = async () => {
      try {
         const notifData = await getNotifications();
         setNotifications(notifData?.notifications || notifData || []);
      } catch (err) { setNotifications([]); }

      try {
         const inviteData = await getStudentInvites();
         setInvites(inviteData || []);
      } catch (err) { setInvites([]); }
   };

   const toggleDropdown = async () => {
      const nextState = !showNotifDropdown;
      setShowNotifDropdown(nextState);

      if (nextState && (notifications || []).some(n => !n.read)) {
         try {
            await markAllNotificationsRead();
            setNotifications(prev => (prev || []).map(n => ({ ...n, read: true })));
         } catch (err) {
            console.error("Failed to mark notifications read", err);
         }
      }
   };

   const handleLogout = async () => {
      await authService.logout();
      navigate('/login', { replace: true });
   };

   const handleAcceptInvite = async (inviteId) => {
      try {
         const res = await respondToInvite(inviteId, 'accepted');
         if (res.success) {
            fetchNotificationsAndInvites();
            window.location.reload();
         }
      } catch (err) { console.error(err); }
   };

   const unreadCount = (notifications || []).filter(n => !n.read).length + (invites || []).length;

   return (
      <nav className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-color)] shadow-sm px-4 md:px-8 py-3 flex items-center justify-between transition-colors">
         <div className="flex items-center gap-3 font-extrabold text-xl tracking-tight cursor-pointer" onClick={() => navigate('/student/dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
               <BookOpen size={22} />
            </div>
            <div className="flex items-center gap-1 text-lg md:text-xl font-black">
               <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ACLC</span>
               <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-bold border border-blue-500/20">Student</span>
            </div>
         </div>

         <div className="flex items-center gap-1 md:gap-2 bg-[var(--bg-secondary)]/50 p-1.5 rounded-2xl border border-[var(--border-color)]">
            {navItems.map((item) => (
               <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/student/dashboard'}
                  className={({ isActive }) =>
                     `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${isActive
                        ? 'bg-[var(--accent-primary)] text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
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
            {/* Notification Bell Dropdown Button */}
            <div className="relative">
               <button
                  onClick={toggleDropdown}
                  className="p-2.5 text-[var(--text-secondary)] hover:text-indigo-600 hover:bg-[var(--bg-secondary)] rounded-xl transition-all border border-transparent hover:border-[var(--border-color)] relative"
                  title="Notifications & Invites"
               >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                     <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                     </span>
                  )}
               </button>

               {/* Notifications Dropdown Panel */}
               {showNotifDropdown && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl shadow-2xl p-4 z-50 animate-fade-in-up">
                     <div className="flex justify-between items-center pb-3 border-b border-[var(--border-color)]">
                        <h3 className="font-extrabold text-sm text-[var(--text-primary)] flex items-center gap-2">
                           <Bell size={16} className="text-indigo-600" /> Notifications & Invites
                        </h3>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-600 font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
                     </div>

                     <div className="max-h-80 overflow-y-auto py-2 space-y-2">
                        {/* Pending Class Invites in Dropdown */}
                        {(invites || []).map((inv) => (
                           <div key={inv._id} className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-xs">
                              <div className="flex items-center gap-2 text-indigo-600 font-extrabold mb-1">
                                 <Mail size={14} /> Class Invitation Received!
                              </div>
                              <p className="font-bold text-[var(--text-primary)]">{inv.classId?.name || 'Classroom'}</p>
                              <p className="text-[10px] text-[var(--text-secondary)] font-medium">Instructor: {inv.teacherId?.name || 'Faculty'}</p>
                              <div className="flex gap-2 mt-2">
                                 <button onClick={() => handleAcceptInvite(inv._id)} className="flex-1 py-1.5 bg-indigo-600 text-white font-extrabold rounded-xl text-[11px] shadow-sm hover:bg-indigo-700 transition-colors">Accept & Join</button>
                              </div>
                           </div>
                        ))}

                        {/* Standard Notifications */}
                        {(notifications || []).map((notif, i) => (
                           <div key={i} className={`p-3 rounded-xl border text-xs transition-colors ${notif.read ? 'bg-[var(--bg-base)] border-[var(--border-color)] opacity-70' : 'bg-indigo-500/10 border-indigo-500/30'}`}>
                              <p className="font-medium text-[var(--text-primary)]">{notif.message}</p>
                              <span className="text-[10px] text-[var(--text-secondary)] font-semibold mt-1 block">
                                 {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Recently'}
                              </span>
                           </div>
                        ))}

                        {(invites || []).length === 0 && (notifications || []).length === 0 && (
                           <p className="text-center text-[var(--text-secondary)] py-6 text-xs italic">No new notifications or invites.</p>
                        )}
                     </div>
                  </div>
               )}
            </div>

            <button
               onClick={() => window.dispatchEvent(new Event('open-a11y-toolbar'))}
               className="p-2.5 text-[var(--text-secondary)] hover:text-indigo-600 hover:bg-[var(--bg-secondary)] rounded-xl transition-all border border-transparent hover:border-[var(--border-color)]"
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

export default Navbar;
