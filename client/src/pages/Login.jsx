import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSuccess = async (credentialResponse) => {
    setError(""); // Clear previous errors
    try {
      // 1. Send Google Token to YOUR Backend
      const res = await axios.post("http://localhost:8080/api/auth/google", {
        token: credentialResponse.credential
      });

      // 2. If Success (200 OK)
      const data = res.data;
      localStorage.setItem("token", data.token); // Save JWT
      localStorage.setItem("user", JSON.stringify(data.user)); // Save User Info
      
      // Redirect to Dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error("Login Error:", err);
      
      // 3. Handle Specific Backend Errors
      if (err.response && err.response.status === 403) {
        // This is your Domain Restriction or Ban message
        setError(err.response.data.message); 
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Campus Portal</h1>
          <p className="text-gray-500 mt-2">Exclusive Access for Students & Faculty</p>
        </div>

        {/* Google Button Container */}
        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError("Google Login Failed")}
            size="large"
            width="300"
          />
        </div>

        {/* Error Display Box */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded animate-pulse">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          Only @mlrit.ac.in emails allowed.
        </div>
      </div>
    </div>
  );
};

export default Login;