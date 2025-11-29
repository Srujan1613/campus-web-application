import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Alumni = () => {
  const [alumniList, setAlumniList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch alumni from backend
    axios.get('http://localhost:8080/api/users/alumni')
      .then(res => setAlumniList(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChat = () => {
    // Redirect to the "Alumni Connect" channel in your Chat app
    navigate('/chat?room=Alumni Connect');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Alumni Network</h1>
          <p className="text-gray-500">Connect with seniors for mentorship & referrals.</p>
        </div>
        {/* Hackathon Demo Button: Toggle yourself to Alumni */}
        <button 
          onClick={() => navigate('/profile')} 
          className="text-sm text-blue-600 underline"
        >
          Edit My Profile (Demo)
        </button>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumniList.length > 0 ? (
          alumniList.map((alum) => (
            <div key={alum._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-100">
              
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={alum.picture || "https://via.placeholder.com/50"} 
                  alt={alum.name} 
                  className="w-16 h-16 rounded-full border-2 border-blue-100"
                />
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{alum.name}</h3>
                  <p className="text-blue-600 text-sm font-medium">{alum.position}</p>
                  <p className="text-gray-400 text-xs">at {alum.company}</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Contact Info (Protected) */}
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 break-all">
                  <span className="font-bold text-gray-400 text-xs uppercase block mb-1">Email</span>
                  {alum.email}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={handleChat}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2"
                  >
                    💬 Ask for Mentorship
                  </button>
                  {alum.linkedin && (
                    <a 
                      href={alum.linkedin} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-3 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      in
                    </a>
                  )}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-400">
            <p className="text-xl">No Alumni found.</p>
            <p className="text-sm">Go to "Edit My Profile" to become the first one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alumni;