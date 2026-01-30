import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import VisitorRegister from './pages/VisitorRegister';
import AdminDashboard from './pages/admin/Dashboard';
import RoleManagement from './pages/admin/RoleManagement';
import ReportItem from './pages/ReportItem';
import ItemInventory from './pages/ItemInventory';
import SubmitClaim from './pages/SubmitClaim';
import AdminClaims from './pages/admin/Claims';
import AIConfig from './pages/admin/AIConfig';
import Notifications from './pages/Notifications';
import ItemDetails from './pages/ItemDetails';
import LandingPage from './pages/LandingPage';
import './index.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-primary-500 font-black uppercase tracking-widest animate-pulse">Initializing Neural Link...</div>;
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register-visitor" element={<VisitorRegister />} />

                    {/* User Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/report" element={<ProtectedRoute><ReportItem /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/inventory" element={<ProtectedRoute><ItemInventory /></ProtectedRoute>} />
                    <Route path="/claim/:itemId" element={<ProtectedRoute><SubmitClaim /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                    {/* Admin Protected Routes */}
                    <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'delegated_admin']}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={['admin', 'delegated_admin']}><RoleManagement /></ProtectedRoute>} />
                    <Route path="/admin/claims" element={<ProtectedRoute allowedRoles={['admin', 'delegated_admin']}><AdminClaims /></ProtectedRoute>} />
                    <Route path="/admin/ai-config" element={<ProtectedRoute allowedRoles={['admin', 'delegated_admin']}><AIConfig /></ProtectedRoute>} />

                    <Route path="/item/:id" element={<ProtectedRoute><ItemDetails /></ProtectedRoute>} />
                    
                    {/* Catch all - redirect to home */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
