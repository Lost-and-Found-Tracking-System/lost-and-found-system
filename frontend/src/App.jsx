/**
 * @module App
 * @description Root application component — configures React Router, AuthProvider,
 * and declares all public, protected, and admin routes.
 */

import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import ItemDetails from './pages/ItemDetails';
import ItemInventory from './pages/ItemInventory';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import MyClaims from './pages/MyClaims';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Register from './pages/Register';
import ReportItem from './pages/ReportItem';
import SubmitClaim from './pages/SubmitClaim';
import VisitorRegister from './pages/VisitorRegister';

// Admin Pages
import AIConfig from './pages/admin/AIConfig';
import AiMatches from './pages/admin/AiMatches';
import ClaimsManagement from './pages/admin/Claims';
import AdminDashboard from './pages/admin/Dashboard';
import RoleManagement from './pages/admin/RoleManagement';
import ZoneManagement from './pages/admin/ZoneManagement';

/**
 * Route guard that redirects unauthenticated users to `/login`
 * and unauthorised roles to `/dashboard`.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Child route element
 * @param {string[]} [props.allowedRoles=[]] - Roles permitted to access this route
 */
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

/**
 * Route guard for public pages — redirects authenticated users to their
 * dashboard (admin or regular) to prevent re-visiting login/register.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Child route element
 */
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
                path="/admin/ai-matches"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'delegated_admin']}>
                        <AiMatches />
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