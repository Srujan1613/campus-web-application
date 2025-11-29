import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LectureHub from './pages/LectureHub';
import UploadLecture from './pages/UploadLecture';
import Chat from './pages/Chat';
import Alumni from './pages/Alumni';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

const Private = ({ children }) => localStorage.getItem('token') ? children : <Navigate to="/" />;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
        <Route path="/admin" element={<Private><AdminPanel /></Private>} />
           <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
           <Route path="/lectures" element={<Private><LectureHub /></Private>} />
           <Route path="/upload" element={<Private><UploadLecture /></Private>} />
           <Route path="/chat" element={<Private><Chat /></Private>} />
           <Route path="/alumni" element={<Private><Alumni /></Private>} />
           <Route path="/profile" element={<Private><Profile /></Private>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}