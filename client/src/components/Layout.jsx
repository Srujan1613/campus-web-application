import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Video, Users, MessageSquare, LogOut, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = () => {
  const location = useLocation(); // We need this to track URL changes
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Lecture Hub', path: '/lectures', icon: <Video size={20} /> },
    { name: 'Alumni Network', path: '/alumni', icon: <Users size={20} /> },
    { name: 'Community Chat', path: '/chat', icon: <MessageSquare size={20} /> },
    { name: 'Admin Console', path: '/admin', icon: <Shield size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-gray-900">
      
      {/* 1. SIDEBAR (Fixed) */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-4 left-4 bottom-4 w-72 bg-white rounded-3xl shadow-2xl flex flex-col border border-gray-100 z-50"
      >
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CampusSync.
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} className="block">
                <div className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive ? 'text-white shadow-lg shadow-blue-500/30' : 'text-gray-500 hover:bg-gray-50'
                }`}>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl"
                    />
                  )}
                  <span className="relative z-10">{item.icon}</span>
                  <span className="relative z-10 font-semibold tracking-wide text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                {user?.name?.charAt(0)}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
                <button onClick={() => { localStorage.clear(); navigate('/'); }} className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1">
                   <LogOut size={10} /> Sign Out
                </button>
             </div>
          </div>
        </div>
      </motion.div>

      {/* 2. CONTENT AREA */}
      <div className="ml-80 p-4 h-screen">
        {/* 🔥 THE FIX IS HERE: key={location.pathname} 
           This forces React to completely destroy the old component 
           and mount the new one whenever the URL changes.
        */}
        <div 
            key={location.pathname} 
            className="h-full bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative animate-fade-in"
        >
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default Layout;