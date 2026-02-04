import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import {
    LayoutDashboard,
    Users,
    Package,
    FileText,
    Settings,
    Activity,
    Loader2,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    MapPin,
} from 'lucide-react';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalItems: 0,
        totalClaims: 0,
        pendingClaims: 0,
        resolvedItems: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/v1/admin/dashboard');
            setStats(res.data.stats);
            setRecentActivity(res.data.recentActivity || []);
        } catch (error) {
            console.error('Failed to fetch admin dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <AdminSidebar />
                <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
            </>
        );
    }

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
        { label: 'Total Items', value: stats.totalItems, icon: Package, color: 'green' },
        { label: 'Total Claims', value: stats.totalClaims, icon: FileText, color: 'purple' },
        { label: 'Pending Claims', value: stats.pendingClaims, icon: Clock, color: 'yellow' },
        { label: 'Resolved Items', value: stats.resolvedItems, icon: CheckCircle, color: 'emerald' },
    ];

    const navLinks = [
        { to: '/admin/claims', label: 'Manage Claims', icon: FileText, desc: 'Review and approve claims' },
        { to: '/admin/roles', label: 'User Management', icon: Users, desc: 'Manage user roles and access' },
        { to: '/admin/zones', label: 'Zone Management', icon: MapPin, desc: 'Manage campus zones and locations' },
        { to: '/admin/ai-config', label: 'AI Configuration', icon: Settings, desc: 'Configure AI matching settings' },
    ];

    return (
        <>
            <AdminSidebar />
            <div className="min-h-screen bg-[#020617] p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                            <p className="text-slate-400 mt-1">System overview and management</p>
                        </div>
                        <Link
                            to="/dashboard"
                            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
                        >
                            ← Back to User Dashboard
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                        {statCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 bg-${stat.color}-500/10 rounded-lg`}>
                                            <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-sm">{stat.label}</p>
                                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {navLinks.map((link, index) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={index}
                                    to={link.to}
                                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-primary-500/50 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary-500/10 rounded-xl group-hover:bg-primary-500/20 transition-colors">
                                            <Icon className="w-6 h-6 text-primary-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                                                {link.label}
                                            </h3>
                                            <p className="text-slate-500 text-sm">{link.desc}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="w-5 h-5 text-primary-400" />
                            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                        </div>
                        {recentActivity.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No recent activity</p>
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.slice(0, 10).map((activity, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl">
                                        <div className="p-2 bg-slate-700 rounded-lg">
                                            <TrendingUp className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm">{activity.action}</p>
                                            <p className="text-slate-500 text-xs">
                                                {activity.actorId?.profile?.fullName || 'System'} •{' '}
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;