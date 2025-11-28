import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LectureHub from './pages/LectureHub'; // <--- IMPORT THIS
import UploadLecture from './pages/UploadLecture'; // <--- IMPORT THIS

// Simple Guard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route 
          path="/dashboard" 
          element={<PrivateRoute><Dashboard /></PrivateRoute>} 
        />
        
        {/* NEW ROUTES */}
        <Route 
          path="/lectures" 
          element={<PrivateRoute><LectureHub /></PrivateRoute>} 
        />
        <Route 
          path="/upload" 
          element={<PrivateRoute><UploadLecture /></PrivateRoute>} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;