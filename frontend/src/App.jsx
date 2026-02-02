import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import VisitorRegister from './pages/VisitorRegister';
import Dashboard from './pages/Dashboard';
import ReportItem from './pages/ReportItem';
import ItemInventory from './pages/ItemInventory';
import ItemDetails from './pages/ItemDetails';
import SubmitClaim from './pages/SubmitClaim';
import MyClaims from './pages/MyClaims';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import RoleManagement from './pages/admin/RoleManagement';
import ZoneManagement from './pages/admin/ZoneManagement';
import ClaimsManagement from './pages/admin/Claims';
import AIConfig from './pages/admin/AIConfig';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (user) {
        if (user.role === 'admin' || user.role === 'delegated_admin') {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />
            <Route
                path="/register-visitor"
                element={
                    <PublicRoute>
                        <VisitorRegister />
                    </PublicRoute>
                }
            />

            {/* Protected User Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/report"
                element={
                    <ProtectedRoute>
                        <ReportItem />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/inventory"
                element={
                    <ProtectedRoute>
                        <ItemInventory />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/item/:id"
                element={
                    <ProtectedRoute>
                        <ItemDetails />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/claim/:itemId"
                element={
                    <ProtectedRoute>
                        <SubmitClaim />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/my-claims"
                element={
                    <ProtectedRoute>
                        <MyClaims />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/notifications"
                element={
                    <ProtectedRoute>
                        <Notifications />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            {/* Admin Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'delegated_admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/roles"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'delegated_admin']}>
                        <RoleManagement />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/zones"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'delegated_admin']}>
                        <ZoneManagement />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/claims"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'delegated_admin']}>
                        <ClaimsManagement />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/ai-config"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'delegated_admin']}>
                        <AIConfig />
                    </ProtectedRoute>
                }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;