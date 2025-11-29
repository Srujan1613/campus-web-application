import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [role, setRole] = useState(user?.role || 'student');
  const [company, setCompany] = useState(user?.company || '');
  const [position, setPosition] = useState(user?.position || '');

  const handleSave = async () => {
    try {
      await axios.put('http://localhost:8080/api/users/profile', {
        userId: user._id,
        role,
        company,
        position
      });
      alert("Profile Updated! Log out and back in to see changes fully.");
      navigate('/alumni');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Edit Profile (Demo)</h2>
      
      <label className="block mb-2 text-sm font-bold">Role</label>
      <select 
        value={role} 
        onChange={(e) => setRole(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="student">Student</option>
        <option value="alumni">Alumni</option>
        <option value="admin">Admin</option>
      </select>

      {role === 'alumni' && (
        <>
          <label className="block mb-2 text-sm font-bold">Company</label>
          <input 
            className="w-full p-2 border rounded mb-4" 
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google"
          />
          
          <label className="block mb-2 text-sm font-bold">Position</label>
          <input 
            className="w-full p-2 border rounded mb-4" 
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Software Engineer"
          />
        </>
      )}

      <button 
        onClick={handleSave} 
        className="w-full bg-green-600 text-white p-2 rounded font-bold"
      >
        Save Changes
      </button>
    </div>
  );
};

export default Profile;