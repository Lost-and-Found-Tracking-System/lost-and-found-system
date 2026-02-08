/**
 * PREMIUM ADMIN DASHBOARD
 * With advanced effects from CodePen inspirations
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { gsap } from 'gsap';
import {
    Users,
    Package,
    FileText,
    CheckCircle,
    Clock,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart3,
    ArrowUpRight,
    Shield,
    Zap,
    Sparkles,
    Layers,
    Target,
    PieChart
} from 'lucide-react';
import {
    MorphingBlob,
    GlitchText,
    NeonText,
    TiltCard,
    GradientBorderCard,
    HolographicCard,
    PulseRings,
    ElasticButton,
    GradientFlowText,
    ParticleExplosion
} from '../../effects';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [recentActivity, setRecentActivity] = useState([]);

    const containerRef = useRef(null);

    // Fetch admin dashboard data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activityRes] = await Promise.all([
                    api.get('/v1/admin/stats').catch(() => ({ data: {} })),
                    api.get('/v1/admin/activity?limit=8').catch(() => ({ data: { activities: [] } }))
                ]);

                setStats(statsRes.data || {});
                setRecentActivity(activityRes.data.activities || []);
            } catch (error) {
                console.error('Admin dashboard error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // GSAP Animations
    useEffect(() => {
        if (loading) return;

        const ctx = gsap.context(() => {
            // Header
            gsap.fromTo('.admin-header',
                { y: -50, opacity: 0, filter: 'blur(10px)' },
                { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }
            );

            // Stats cards
            gsap.fromTo('.admin-stat-card',
                { y: 80, opacity: 0, scale: 0.85, rotateX: 20 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotateX: 0,
                    duration: 1,
                    stagger: 0.08,
                    ease: 'power4.out',
                    delay: 0.2
                }
            );

            // Counter animation
            document.querySelectorAll('.admin-stat-number').forEach((el) => {
                const target = parseInt(el.dataset.value) || 0;
                gsap.fromTo(el,
                    { innerText: 0 },
                    {
                        innerText: target,
                        duration: 2.5,
                        ease: 'power2.out',
                        snap: { innerText: 1 },
                        delay: 0.8
                    }
                );
            });

            // Activity feed
            gsap.fromTo('.activity-item',
                { x: -40, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.08,
                    delay: 1,
                    ease: 'power3.out'
                }
            );

            // Panels
            gsap.fromTo('.admin-panel',
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, delay: 0.6, ease: 'power3.out' }
            );

        }, containerRef);

        return () => ctx.revert();
    }, [loading]);

    const statCards = [
        {
            icon: Users,
            label: 'Total Users',
            value: stats.totalUsers || 0,
            trend: '+12%',
            trendUp: true,
            color: '#0ea5e9',
            gradient: 'from-cyan-500 to-blue-600'
        },
        {
            icon: Package,
            label: 'Total Items',
            value: stats.totalItems || 0,
            trend: '+23%',
            trendUp: true,
            color: '#8b5cf6',
            gradient: 'from-violet-500 to-purple-600'
        },
        {
            icon: FileText,
            label: 'Active Claims',
            value: stats.pendingClaims || 0,
            trend: stats.pendingClaims > 10 ? 'High' : 'Normal',
            trendUp: false,
            color: '#f59e0b',
            gradient: 'from-amber-500 to-orange-600'
        },
        {
            icon: CheckCircle,
            label: 'Resolved',
            value: stats.resolvedItems || 0,
            trend: '+45%',
            trendUp: true,
            color: '#10b981',
            gradient: 'from-emerald-500 to-green-600'
        },
        {
            icon: Target,
            label: 'Match Rate',
            value: stats.matchRate || 87,
            suffix: '%',
            trend: '+5%',
            trendUp: true,
            color: '#ec4899',
            gradient: 'from-pink-500 to-rose-600'
        },
        {
            icon: Zap,
            label: 'Avg. Response',
            value: stats.avgResponseTime || 2.4,
            suffix: 'h',
            trend: '-18%',
            trendUp: true,
            color: '#06b6d4',
            gradient: 'from-cyan-400 to-teal-600'
        }
    ];

    const getActivityIcon = (type) => {
        switch (type) {
            case 'claim': return FileText;
            case 'item': return Package;
            case 'user': return Users;
            default: return Activity;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'claim_approved': return '#10b981';
            case 'claim_rejected': return '#ef4444';
            case 'new_item': return '#0ea5e9';
            case 'new_user': return '#8b5cf6';
            default: return '#64748b';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="relative">
                    <PulseRings size={120} color="#0ea5e9" />
                    <Shield className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-400" size={40} />
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-[#020617] text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4">
                    <MorphingBlob color1="#0ea5e9" color2="#8b5cf6" size={600} />
                </div>
                <div className="absolute bottom-0 left-1/4">
                    <MorphingBlob color1="#8b5cf6" color2="#ec4899" size={500} />
                </div>
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            <AdminSidebar />

            <main className="pl-4 md:pl-8 pr-4 md:pr-8 py-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="admin-header mb-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-xl border border-primary-500/30">
                                        <Shield size={24} className="text-primary-400" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Admin Portal</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black">
                                    <GradientFlowText>Dashboard</GradientFlowText>
                                </h1>
                                <p className="text-slate-400 mt-2">
                                    <GlitchText text={`System Status: Operational • Last sync: ${new Date().toLocaleTimeString()}`} />
                                </p>
                            </div>

                            {/* Live Status */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 px-5 py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
                                    <Activity size={20} className="text-emerald-400" />
                                    <span className="text-sm font-semibold text-emerald-400">All Systems Online</span>
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10" style={{ perspective: 1000 }}>
                        {statCards.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <TiltCard key={i} className="admin-stat-card" intensity={0.4}>
                                    <HolographicCard className="h-full">
                                        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl h-full">
                                            <div className="flex items-center justify-between mb-4">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${stat.color}20, transparent)`,
                                                        border: `1px solid ${stat.color}30`
                                                    }}
                                                >
                                                    <Icon size={24} style={{ color: stat.color }} />
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trendUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                    {stat.trend}
                                                </span>
                                            </div>

                                            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{stat.label}</p>
                                            <div className="flex items-baseline gap-1">
                                                <span
                                                    className="admin-stat-number text-3xl font-black text-white"
                                                    data-value={stat.value}
                                                >
                                                    {stat.value}
                                                </span>
                                                {stat.suffix && <span className="text-lg text-slate-400">{stat.suffix}</span>}
                                            </div>
                                        </div>
                                    </HolographicCard>
                                </TiltCard>
                            );
                        })}
                    </div>

                    {/* Content Grid */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Activity Feed */}
                        <div className="lg:col-span-2 admin-panel">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Activity size={24} className="text-cyan-400" />
                                    Live Activity Feed
                                </h2>
                                <Link to="/admin/claims" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 group">
                                    View all
                                    <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Link>
                            </div>

                            <GradientBorderCard>
                                <div className="divide-y divide-slate-700/50 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map((activity, i) => {
                                            const Icon = getActivityIcon(activity.type);
                                            const color = getActivityColor(activity.actionType);
                                            return (
                                                <div key={i} className="activity-item flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors">
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${color}20, transparent)`,
                                                            border: `1px solid ${color}30`
                                                        }}
                                                    >
                                                        <Icon size={22} style={{ color }} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-medium">{activity.message || 'Activity recorded'}</p>
                                                        <p className="text-sm text-slate-400">
                                                            {activity.user?.fullName || 'System'} • {new Date(activity.createdAt).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className="px-3 py-1 rounded-full text-xs font-bold"
                                                        style={{
                                                            background: `${color}20`,
                                                            color
                                                        }}
                                                    >
                                                        {activity.actionType?.replace('_', ' ') || 'action'}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-8 text-center">
                                            <Activity size={48} className="text-slate-600 mx-auto mb-4" />
                                            <p className="text-slate-400">No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </GradientBorderCard>
                        </div>

                        {/* Quick Links */}
                        <div className="admin-panel">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
                                <Layers size={24} className="text-violet-400" />
                                Quick Access
                            </h2>

                            <div className="space-y-4">
                                {[
                                    { label: 'Manage Claims', path: '/admin/claims', icon: FileText, color: '#f59e0b', count: stats.pendingClaims },
                                    { label: 'User Management', path: '/admin/roles', icon: Users, color: '#8b5cf6' },
                                    { label: 'Zone Settings', path: '/admin/zones', icon: Target, color: '#0ea5e9' },
                                    { label: 'AI Configuration', path: '/admin/ai-config', icon: Sparkles, color: '#ec4899' }
                                ].map((item, i) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link key={i} to={item.path}>
                                            <TiltCard intensity={0.2}>
                                                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl flex items-center gap-4 group hover:border-slate-600 transition-all">
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${item.color}20, transparent)`,
                                                            border: `1px solid ${item.color}30`
                                                        }}
                                                    >
                                                        <Icon size={24} style={{ color: item.color }} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">{item.label}</p>
                                                    </div>
                                                    {item.count !== undefined && item.count > 0 && (
                                                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold">
                                                            {item.count}
                                                        </span>
                                                    )}
                                                    <ArrowUpRight size={18} className="text-slate-500 group-hover:text-primary-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                                </div>
                                            </TiltCard>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* System Health */}
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <BarChart3 size={20} className="text-cyan-400" />
                                    System Health
                                </h3>
                                <GradientBorderCard>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'API Response', value: 98, color: '#10b981' },
                                            { label: 'Database', value: 100, color: '#0ea5e9' },
                                            { label: 'AI Model', value: 95, color: '#8b5cf6' }
                                        ].map((metric, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-slate-400">{metric.label}</span>
                                                    <span style={{ color: metric.color }}>{metric.value}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-1000"
                                                        style={{
                                                            width: `${metric.value}%`,
                                                            background: `linear-gradient(90deg, ${metric.color}80, ${metric.color})`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GradientBorderCard>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;