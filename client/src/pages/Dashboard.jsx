import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, MessageSquare, ArrowRight, Zap, CheckCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  // Animation Variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const ActionCard = ({ title, desc, icon, color, gradient, path }) => (
    <motion.div 
      variants={itemVars}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={() => navigate(path)}
      className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-20`}></div>
      
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 text-white shadow-lg`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-800 text-xl mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">{desc}</p>
      
      <div className="flex items-center text-gray-900 font-bold text-sm">
        <span className="group-hover:mr-2 transition-all">Open Module</span> 
        <ArrowRight size={16} className="ml-2 opacity-0 group-hover:opacity-100 transition-all text-blue-600"/>
      </div>
    </motion.div>
  );

  return (
    <div className="p-8 md:p-12 h-full overflow-y-auto bg-white">
      {/* HEADER */}
      <motion.header 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12 flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Hello, {user?.name.split(' ')[0]}! <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-gray-500 text-lg">Your academic hub is ready. What's the focus for today?</p>
        </div>
        <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Session</p>
            <p className="text-xl font-bold text-blue-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric'})}</p>
        </div>
      </motion.header>

      {/* CARDS GRID */}
      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
      >
        <ActionCard 
          title="Lecture Hub" 
          desc="Access recorded sessions, generate AI transcripts, and use timeline navigation." 
          icon={<Video size={28}/>} 
          color="bg-purple-600"
          gradient="from-purple-400 to-pink-500"
          path="/lectures"
        />
        <ActionCard 
          title="Alumni Network" 
          desc="Bridge the gap. Find mentors, view profiles, and request referrals." 
          icon={<Users size={28}/>} 
          color="bg-blue-600"
          gradient="from-blue-400 to-indigo-500"
          path="/alumni"
        />
        <ActionCard 
          title="Community Forum" 
          desc="Real-time discussions monitored by our secure AI safety system." 
          icon={<MessageSquare size={28}/>} 
          color="bg-emerald-500"
          gradient="from-emerald-400 to-teal-500"
          path="/chat"
        />
      </motion.div>

      {/* SYSTEM STATUS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-50 rounded-3xl p-8 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6">
            <Activity size={24} className="text-blue-600"/>
            <h2 className="text-xl font-bold text-gray-800">System Health</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { label: "AI Content Moderation", status: "Active", color: "text-green-600", bg: "bg-green-100" },
                { label: "Video Processing", status: "Operational", color: "text-blue-600", bg: "bg-blue-100" },
                { label: "Database Latency", status: "14ms (Excellent)", color: "text-purple-600", bg: "bg-purple-100" }
            ].map((stat, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className={`w-3 h-3 rounded-full ${stat.color} ${stat.bg} shadow-[0_0_10px] shadow-current`}></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        <p className={`font-bold ${stat.color}`}>{stat.status}</p>
                    </div>
                </div>
            ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;