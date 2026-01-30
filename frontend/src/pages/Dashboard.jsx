import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    LayoutDashboard,
    Package,
    Search,
    Bell,
    User,
    LogOut,
    Plus,
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    Settings,
} from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalItems: 0,
        pendingClaims: 0,
        resolvedItems: 0,
    });
    const [myItems, setMyItems] = useState([]);
    const [myClaims, setMyClaims] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch user's items
            const itemsRes = await api.get('/v1/users/my-items');
            setMyItems(itemsRes.data.slice(0, 5)); // Show last 5

            // Fetch user's claims
            const claimsRes = await api.get('/v1/claims/user/my-claims');
            setMyClaims(claimsRes.data.slice(0, 5));

            // Fetch notifications
            const notifRes = await api.get('/v1/notifications?limit=5');
            setNotifications(notifRes.data.notifications || []);

            // Calculate stats
            setStats({
                totalItems: itemsRes.data.length,
                pendingClaims: claimsRes.data.filter(c => c.status === 'pending').length,
                resolvedItems: itemsRes.data.filter(i => i.status === 'resolved').length,
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'text-green-400 bg-green-400/10';
            case 'pending': return 'text-yellow-400 bg-yellow-400/10';
            case 'matched': return 'text-blue-400 bg-blue-400/10';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-xl font-black text-white">
                        LOST<span className="text-primary-500">&</span>FOUND
                    </h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-primary-500/10 text-primary-500 rounded-xl">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link to="/report" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">
                        <Plus size={20} />
                        Report Item
                    </Link>
                    <Link to="/inventory" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">
                        <Search size={20} />
                        Browse Items
                    </Link>
                    <Link to="/notifications" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">
                        <Bell size={20} />
                        Notifications
                        {notifications.filter(n => !n.isRead).length > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {notifications.filter(n => !n.isRead).length}
                            </span>
                        )}
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">
                        <User size={20} />
                        Profile
                    </Link>
                    {(user?.role === 'admin' || user?.role === 'delegated_admin') && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">
                            <Settings size={20} />
                            Admin Panel
                        </Link>
                    )}
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-auto"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white">
                        Welcome back, {user?.fullName || user?.name || 'User'}
                    </h2>
                    <p className="text-slate-400 mt-1">Here's what's happening with your items</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Package className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">My Items</p>
                                <p className="text-2xl font-bold text-white">{stats.totalItems}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/10 rounded-xl">
                                <Clock className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Pending Claims</p>
                                <p className="text-2xl font-bold text-white">{stats.pendingClaims}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Resolved</p>
                                <p className="text-2xl font-bold text-white">{stats.resolvedItems}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* My Items */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">My Recent Items</h3>
                            <Link to="/inventory" className="text-primary-400 text-sm hover:text-primary-300">
                                View All →
                            </Link>
                        </div>
                        {myItems.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No items reported yet</p>
                        ) : (
                            <div className="space-y-3">
                                {myItems.map((item) => (
                                    <Link
                                        key={item._id}
                                        to={`/item/${item._id}`}
                                        className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="p-2 bg-slate-700 rounded-lg">
                                            <FileText className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">
                                                {item.itemAttributes?.description?.slice(0, 30) || 'Item'}...
                                            </p>
                                            <p className="text-slate-500 text-sm">
                                                {item.submissionType} • {item.trackingId}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My Claims */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">My Claims</h3>
                        </div>
                        {myClaims.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No claims submitted yet</p>
                        ) : (
                            <div className="space-y-3">
                                {myClaims.map((claim) => (
                                    <div
                                        key={claim._id}
                                        className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl"
                                    >
                                        <div className="p-2 bg-slate-700 rounded-lg">
                                            <AlertCircle className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">
                                                Claim for {claim.itemId?.trackingId || 'Item'}
                                            </p>
                                            <p className="text-slate-500 text-sm">
                                                {new Date(claim.submittedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(claim.status)}`}>
                                            {claim.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
