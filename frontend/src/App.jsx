import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PayVendor from './pages/PayVendor';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={!user ? <Login onLogin={login} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register onLogin={login} /> : <Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={
          <ProtectedRoute user={user} onLogout={logout}>
            <Dashboard user={user} />
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute user={user} onLogout={logout}>
            <Wallet user={user} />
          </ProtectedRoute>
        } />
        <Route path="/vendor" element={
          <ProtectedRoute user={user} onLogout={logout} requiredRole="vendor">
            <VendorDashboard user={user} />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute user={user} onLogout={logout} requiredRole="admin">
            <AdminDashboard user={user} />
          </ProtectedRoute>
        } />

        <Route path="/pay/vendor/:vendorId" element={
          <ProtectedRoute user={user} onLogout={logout}>
            <PayVendor user={user} />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute user={user} onLogout={logout}>
            <Analytics user={user} />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute user={user} onLogout={logout}>
            <Profile user={user} onProfileUpdate={handleProfileUpdate} />
          </ProtectedRoute>
        } />

        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
