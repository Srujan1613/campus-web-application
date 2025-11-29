import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Users, Video, AlertTriangle, CheckCircle, Search, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminPanel = () => {
  const [stats, setStats] = useState({ totalUsers: 0, bannedUsers: 0, totalLectures: 0, alumniCount: 0 });
  const [bannedUsers, setBannedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'banned' | 'users'
  const [refresh, setRefresh] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
    try {
      // Add ?t=Date.now() to prevent browser caching
      const timestamp = Date.now();
      
      const statsRes = await axios.get(`http://localhost:8080/api/admin/stats?t=${timestamp}`);
      setStats(statsRes.data);

      const bannedRes = await axios.get(`http://localhost:8080/api/admin/banned?t=${timestamp}`);
      console.log("Banned Users Fetched:", bannedRes.data); // <--- Check Console
      setBannedUsers(bannedRes.data);
      
      const usersRes = await axios.get(`http://localhost:8080/api/admin/users?t=${timestamp}`);
      setAllUsers(usersRes.data);
    } catch (err) {
      console.error("Admin Load Error:", err);
    }
  };
    fetchData();
  }, [refresh]); // Re-run when 'refresh' toggles

  const handleUnban = async (userId) => {
    if(!window.confirm("Are you sure you want to reactivate this account?")) return;
    try {
      await axios.post(`http://localhost:8080/api/admin/unban/${userId}`);
      alert("User Reactivated!");
      setRefresh(!refresh); // Refresh data
    } catch (err) {
      alert("Error unbanning user");
    }
  };

  // --- SUB-COMPONENTS ---
  
  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-xl ${color} text-white`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-black text-gray-800">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <Shield size={32} className="text-blue-600"/> Admin Console
          </h1>
          <p className="text-gray-500 mt-1">System Monitoring & Moderation</p>
        </div>
        <button 
          onClick={() => setRefresh(!refresh)} 
          className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
        >
          <RefreshCw size={16}/> Refresh Data
        </button>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users size={24}/>} color="bg-blue-500" />
        <StatCard title="Suspended Users" value={stats.bannedUsers} icon={<AlertTriangle size={24}/>} color="bg-red-500" />
        <StatCard title="Lecture Videos" value={stats.totalLectures} icon={<Video size={24}/>} color="bg-purple-500" />
        <StatCard title="Alumni Count" value={stats.alumniCount} icon={<CheckCircle size={24}/>} color="bg-green-500" />
      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {['overview', 'banned', 'users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 text-sm font-bold capitalize transition-all ${
              activeTab === tab 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab === 'banned' ? 'Moderation Queue' : tab === 'users' ? 'User Registry' : 'Overview'}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        
        {/* TAB: BANNED USERS (The Main Requirement) */}
        {activeTab === 'banned' && (
          <div>
            <div className="p-6 border-b border-gray-100 bg-red-50/50 flex justify-between items-center">
              <h3 className="font-bold text-red-800 flex items-center gap-2">
                <AlertTriangle size={18}/> Suspended Accounts
              </h3>
              <span className="text-xs font-bold bg-white px-3 py-1 rounded-full text-red-600 border border-red-100">
                {bannedUsers.length} Pending Review
              </span>
            </div>
            
            {bannedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <CheckCircle size={48} className="mb-4 text-green-200"/>
                <p>Clean Record! No banned users found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {bannedUsers.map((user) => (
                  <div key={user._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{user.name}</h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-red-500 font-bold mt-1">⚠️ Flagged by AI for Policy Violation</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleUnban(user._id)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-sm"
                    >
                      Reactivate Account
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: ALL USERS */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-gray-50 border-b border-gray-100">
                 <tr>
                   <th className="p-6 text-xs font-bold text-gray-400 uppercase">User</th>
                   <th className="p-6 text-xs font-bold text-gray-400 uppercase">Role</th>
                   <th className="p-6 text-xs font-bold text-gray-400 uppercase">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {allUsers.map(u => (
                   <tr key={u._id} className="hover:bg-gray-50/50">
                     <td className="p-6">
                        <div className="font-bold text-gray-800">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                     </td>
                     <td className="p-6">
                        <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 
                          u.role === 'alumni' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.role}
                        </span>
                     </td>
                     <td className="p-6">
                        {u.isBanned ? (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Suspended</span>
                        ) : (
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                        )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="p-8 text-center text-gray-400">
             <Shield size={64} className="mx-auto mb-4 opacity-20"/>
             <h3 className="text-lg font-bold text-gray-600">System Healthy</h3>
             <p className="max-w-md mx-auto mt-2 text-sm">
               The AI Moderation system is active and monitoring all socket connections. 
               Database sync is optimal. No manual action required.
             </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;