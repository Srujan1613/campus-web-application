import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  // Get user from local storage
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Campus Portal</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome back, {user?.name}!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Info Cards */}
             <div className="p-4 bg-blue-50 rounded border border-blue-100">
                <p className="text-sm text-blue-500">Email</p>
                <p className="font-medium">{user?.email}</p>
             </div>
             <div className="p-4 bg-green-50 rounded border border-green-100">
                <p className="text-sm text-green-500">Role</p>
                <p className="font-medium capitalize">{user?.role}</p>
             </div>
             <div className="p-4 bg-purple-50 rounded border border-purple-100">
                <p className="text-sm text-purple-500">Status</p>
                <p className="font-medium">Active Student</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;