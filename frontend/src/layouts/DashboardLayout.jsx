import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { LayoutDashboard, BookOpen, Calendar, FileText, LogOut, Upload, Menu, X, ChevronRight, User, Compass, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile

  // Dynamic Theme Generation based on Role
  const getTheme = () => {
      const role = user?.role || 'student';
      switch(role) {
          case 'student': return {
              sidebarBg: 'bg-slate-900', // Deep Navy
              sidebarText: 'text-slate-400',
              sidebarTextActive: 'text-white',
              activeBg: 'bg-indigo-600', // Indigo Accent
              logoGradient: 'from-blue-500 to-indigo-500',
              accentColor: 'text-indigo-400',
              mobileHeader: 'bg-slate-900 text-white'
          };
          case 'faculty': return {
              sidebarBg: 'bg-teal-950', // Deep Teal
              sidebarText: 'text-teal-200/70',
              sidebarTextActive: 'text-white',
              activeBg: 'bg-teal-600', // Emerald Accent
              logoGradient: 'from-teal-400 to-emerald-400',
              accentColor: 'text-emerald-400',
              mobileHeader: 'bg-teal-950 text-white'
          };
          case 'admin': return {
              sidebarBg: 'bg-[#0f1014]', // Onyx
              sidebarText: 'text-slate-500',
              sidebarTextActive: 'text-white',
              activeBg: 'bg-violet-700', // Purple Accent
              logoGradient: 'from-violet-500 to-fuchsia-500',
              accentColor: 'text-violet-400',
              mobileHeader: 'bg-black text-white'
          };
          default: return {
              sidebarBg: 'bg-white',
              sidebarText: 'text-slate-500',
              sidebarTextActive: 'text-indigo-600',
              activeBg: 'bg-indigo-50',
              logoGradient: 'from-indigo-600 to-violet-600',
              accentColor: 'text-indigo-600',
              mobileHeader: 'bg-white text-slate-900'
          };
      }
  };
  const theme = getTheme();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore', href: '/explore', icon: Compass },
    { name: 'Achievements', href: '/achievements', icon: Trophy },
    { name: 'Assignments', href: '/assignments', icon: BookOpen },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Announcements', href: '/announcements', icon: FileText },
    { name: 'Resources', href: '/resources', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* Mobile Sidebar BackDrop */}
      <AnimatePresence>
        {sidebarOpen && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSidebarOpen(false)}
               className="lg:hidden fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm"
            />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        className={clsx(
            `fixed inset-y-0 left-0 z-30 w-72 ${theme.sidebarBg} shadow-xl lg:shadow-none lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`,
            !sidebarOpen && "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${theme.logoGradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                U
            </div>
            <span className="text-xl font-bold font-display text-white tracking-tight">
                UniPortal
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Profile Mini Card (Dark Mode styled) */}
        <div className="p-6">
            <Link to="/profile" className={`block group`}>
                <div className={`flex items-center p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group-hover:bg-white/10 transition-colors`}>
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${theme.logoGradient} flex items-center justify-center text-white font-bold shadow-inner`}>
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.accentColor}`}>{user?.role}</p>
                    </div>
                </div>
            </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 mt-2">Main Menu</p>
          {navigation.map((item) => {
             const Icon = item.icon;
             const isActive = location.pathname.startsWith(item.href);
             return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  "group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? `${theme.activeBg} text-white shadow-lg` 
                    : `${theme.sidebarText} hover:bg-white/5 hover:text-white`
                )}
              >
                <Icon className={clsx("mr-3 h-5 w-5 transition-colors", isActive ? "text-white" : "text-white/40 group-hover:text-white")} />
                {item.name}
                {isActive && <ChevronRight className="ml-auto w-4 h-4 text-white/50" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium ${theme.sidebarText} hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors duration-200`}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
         {/* Mobile Header */}
         <div className={`lg:hidden flex items-center justify-between px-4 py-3 border-b border-black/5 shadow-sm ${theme.mobileHeader}`}>
            <div className="flex items-center gap-2">
                 <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${theme.logoGradient} flex items-center justify-center text-white font-bold text-lg`}>U</div>
                 <span className="font-bold">UniPortal</span>
            </div>
            <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2 text-white/80 hover:text-white">
                <Menu className="w-6 h-6" />
            </button>
         </div>

          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
             <div className="max-w-7xl mx-auto">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Outlet />
                    </motion.div>
                 </AnimatePresence>
             </div>
          </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
