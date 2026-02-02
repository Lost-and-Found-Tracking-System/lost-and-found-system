import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    Search,
    Bell,
    User,
    Settings,
    Plus,
    LogOut,
    AlertCircle,
    Loader2,
    FileText,
    Clock,
    CheckCircle,
} from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        myItems: 0,
        pendingClaims: 0,
        resolved: 0,
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
            const itemsRes = await api.get('/v1/items/user/my-items');
            setMyItems(itemsRes.data.slice(0, 5));

            // Fetch user's claims
            const claimsRes = await api.get('/v1/claims/user/my-claims');
            setMyClaims(claimsRes.data.slice(0, 5));

            // Fetch notifications
            const notifRes = await api.get('/v1/notifications');
            setNotifications(notifRes.data.slice(0, 5));

            // Calculate stats
            setStats({
                myItems: itemsRes.data.length,
                pendingClaims: claimsRes.data.filter(c => c.status === 'pending').length,
                resolved: itemsRes.data.filter(i => i.status === 'resolved').length,
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/login');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
            case 'resolved':
                return 'bg-green-500/20 text-green-400';
            case 'rejected':
                return 'bg-red-500/20 text-red-400';
            case 'pending':
            case 'submitted':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'matched':
                return 'bg-blue-500/20 text-blue-400';
            default:
                return 'bg-slate-500/20 text-slate-400';
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
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="p-2 bg-primary-500/20 rounded-lg">
                            <Package size={24} className="text-primary-500" />
                        </div>
                        <span className="text-xl font-bold text-white">L&F</span>
                    </Link>
                </div>

                {/* User Info */}
                <div className="mb-6 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                            <User size={20} className="text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{user?.fullName || 'User'}</p>
                            <p className="text-primary-400 text-xs truncate capitalize">{user?.role || 'Student'}</p>
                        </div>
                    </div>
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
                    <Link to="/my-claims" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">
                        <FileText size={20} />
                        My Claims
                        {stats.pendingClaims > 0 && (
                            <span className="ml-auto bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-medium">
                                {stats.pendingClaims}
                            </span>
                        )}
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
            <div className="flex-1 p-8 overflow-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary-500/20 rounded-xl">
                                <Package className="w-6 h-6 text-primary-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">My Items</p>
                                <p className="text-2xl font-bold text-white">{stats.myItems}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-500/20 rounded-xl">
                                <Clock className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Pending Claims</p>
                                <p className="text-2xl font-bold text-white">{stats.pendingClaims}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-500/20 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Resolved</p>
                                <p className="text-2xl font-bold text-white">{stats.resolved}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Link
                        to="/report"
                        className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-6 hover:from-primary-500 hover:to-primary-400 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Plus className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Report Lost/Found Item</h3>
                                <p className="text-white/70 text-sm">Submit a new item report</p>
                            </div>
                        </div>
                    </Link>
                    <Link
                        to="/inventory"
                        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-slate-700 transition-colors">
                                <Search className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Browse Items</h3>
                                <p className="text-slate-500 text-sm">Search for your lost items</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* My Items & Claims */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* My Items */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">My Items</h3>
                            <Link to="/inventory" className="text-primary-400 text-sm hover:text-primary-300">
                                View All
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
                                            <Package className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">
                                                {item.itemAttributes?.description?.substring(0, 30) || 'Item'}...
                                            </p>
                                            <p className="text-slate-500 text-sm">
                                                {item.itemAttributes?.category} • {new Date(item.createdAt).toLocaleDateString()}
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
                            <Link to="/my-claims" className="text-primary-400 text-sm hover:text-primary-300">
                                {myClaims.length} total
                            </Link>
                        </div>
                        {myClaims.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No claims submitted yet</p>
                        ) : (
                            <div className="space-y-3">
                                {myClaims.map((claim) => (
                                    <Link
                                        key={claim._id}
                                        to="/my-claims"
                                        className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="p-2 bg-slate-700 rounded-lg">
                                            <FileText className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">
                                                {claim.itemId?.trackingId || 'Item'}
                                            </p>
                                            <p className="text-slate-500 text-sm">
                                                {new Date(claim.submittedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(claim.status)}`}>
                                            {claim.status}
                                        </span>
                                    </Link>
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