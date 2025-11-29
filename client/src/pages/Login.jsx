import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Animation Library

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:8080/api/auth/google", {
        token: credentialResponse.credential
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      
      {/* BACKGROUND ANIMATED BLOBS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30" 
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30" 
        />
      </div>

      {/* GLASS CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl text-center"
      >
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-xl mx-auto flex items-center justify-center shadow-lg mb-4">
             <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Campus<span className="text-blue-400">Sync</span></h1>
          <p className="text-blue-200 mt-2 text-sm font-medium">Exclusive Access for Students & Alumni</p>
        </div>

        <div className="bg-white/5 p-2 rounded-xl border border-white/10 mb-6">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError("Google Login Failed")}
            theme="filled_black"
            shape="pill"
            width="300"
          />
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg mt-4"
          >
            ⚠️ {error}
          </motion.div>
        )}

        <p className="mt-8 text-xs text-slate-400">
          Protected by Institutional Email Verification
        </p>
      </motion.div>
    </div>
  );
};

export default Login;