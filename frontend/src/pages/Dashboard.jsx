/**
 * PREMIUM DASHBOARD PAGE
 * With advanced effects from CodePen inspirations
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { gsap } from 'gsap';
import {
    Package,
    Search,
    FileText,
    Plus,
    TrendingUp,
    Clock,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    ArrowUpRight,
    Sparkles,
    Zap,
    Eye,
    Activity
} from 'lucide-react';
import {
    MorphingBlob,
    GradientFlowText,
    NeonText,
    GlitchText,
    TiltCard,
    GradientBorderCard,
    HolographicCard,
    PulseRings,
    ElasticButton,
    ParticleExplosion
} from '../effects';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalReported: 0,
        totalClaims: 0,
        pendingClaims: 0,
        resolvedItems: 0
    });
    const [recentItems, setRecentItems] = useState([]);
    const [recentClaims, setRecentClaims] = useState([]);

    // Refs
    const containerRef = useRef(null);

    // Fetch dashboard data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, itemsRes, claimsRes] = await Promise.all([
                    api.get('/v1/dashboard/stats').catch(() => ({ data: {} })),
                    api.get('/v1/items/my-items?limit=4').catch(() => ({ data: { items: [] } })),
                    api.get('/v1/claims/my-claims?limit=4').catch(() => ({ data: { claims: [] } }))
                ]);

                setStats(statsRes.data || {});
                setRecentItems(itemsRes.data.items || []);
                setRecentClaims(claimsRes.data.claims || []);
            } catch (error) {
                console.error('Dashboard fetch error:', error);
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
            // Header animation
            gsap.fromTo('.dashboard-header',
                { y: -50, opacity: 0, filter: 'blur(10px)' },
                { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }
            );

            // Stats cards stagger
            gsap.fromTo('.stat-card',
                { y: 60, opacity: 0, scale: 0.9, rotateX: 15 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotateX: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power4.out',
                    delay: 0.2
                }
            );

            // Animate stat numbers (counter effect)
            document.querySelectorAll('.stat-number').forEach((el) => {
                const target = parseInt(el.dataset.value) || 0;
                gsap.fromTo(el,
                    { innerText: 0 },
                    {
                        innerText: target,
                        duration: 2,
                        ease: 'power2.out',
                        snap: { innerText: 1 },
                        delay: 0.5
                    }
                );
            });

            // Quick actions
            gsap.fromTo('.quick-action',
                { x: -30, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.6, ease: 'power3.out' }
            );

            // Recent sections
            gsap.fromTo('.recent-section',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, delay: 0.8, ease: 'power3.out' }
            );

        }, containerRef);

        return () => ctx.revert();
    }, [loading]);

    const statCards = [
        {
            icon: Package,
            label: 'Items Reported',
            value: stats.totalReported || 0,
            color: '#0ea5e9',
            gradient: 'from-cyan-500 to-blue-500'
        },
        {
            icon: FileText,
            label: 'Total Claims',
            value: stats.totalClaims || 0,
            color: '#8b5cf6',
            gradient: 'from-violet-500 to-purple-500'
        },
        {
            icon: Clock,
            label: 'Pending',
            value: stats.pendingClaims || 0,
            color: '#f59e0b',
            gradient: 'from-amber-500 to-orange-500'
        },
        {
            icon: CheckCircle2,
            label: 'Resolved',
            value: stats.resolvedItems || 0,
            color: '#10b981',
            gradient: 'from-emerald-500 to-green-500'
        }
    ];

    const quickActions = [
        { icon: Plus, label: 'Report Item', path: '/report', gradient: 'from-cyan-500 to-blue-500' },
        { icon: Search, label: 'Browse Items', path: '/inventory', gradient: 'from-violet-500 to-purple-500' },
        { icon: FileText, label: 'My Claims', path: '/my-claims', gradient: 'from-amber-500 to-orange-500' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="relative">
                    <PulseRings size={100} color="#0ea5e9" />
                    <Sparkles className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-400" size={32} />
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-[#030712] text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4">
                    <MorphingBlob color1="#0ea5e9" color2="#8b5cf6" size={500} />
                </div>
                <div className="absolute bottom-0 right-1/4">
                    <MorphingBlob color1="#8b5cf6" color2="#ec4899" size={400} />
                </div>
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <Sidebar />

            <main className="pl-4 md:pl-8 pr-4 md:pr-8 py-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="dashboard-header mb-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black mb-2">
                                    Welcome,{' '}
                                    <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                                        {user?.fullName?.split(' ')[0] || 'User'}
                                    </span>
                                </h1>
                                <p className="text-slate-400 text-lg">
                                    <GlitchText text={`Your command center • ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`} />
                                </p>
                            </div>

                            {/* Activity indicator */}
                            <div className="flex items-center gap-3 px-5 py-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                <Activity size={20} className="text-green-400" />
                                <span className="text-sm text-slate-300">All systems online</span>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10" style={{ perspective: 1000 }}>
                        {statCards.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <TiltCard key={i} className="stat-card" intensity={0.3}>
                                    <div className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl overflow-hidden group">
                                        {/* Background glow */}
                                        <div
                                            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                                            style={{ background: `radial-gradient(circle at 50% 50%, ${stat.color}, transparent 70%)` }}
                                        />

                                        <div className="relative z-10">
                                            <div
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                                                style={{
                                                    background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`,
                                                    border: `1px solid ${stat.color}30`
                                                }}
                                            >
                                                <Icon size={28} style={{ color: stat.color }} />
                                            </div>

                                            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                                            <p
                                                className="stat-number text-4xl font-black text-white"
                                                data-value={stat.value}
                                            >
                                                {stat.value}
                                            </p>
                                        </div>
                                    </div>
                                </TiltCard>
                            );
                        })}
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <Zap size={24} className="text-amber-400" />
                            Quick Actions
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {quickActions.map((action, i) => {
                                const Icon = action.icon;
                                return (
                                    <ParticleExplosion key={i}>
                                        <ElasticButton
                                            onClick={() => navigate(action.path)}
                                            className={`quick-action group px-6 py-4 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center gap-3 shadow-lg`}
                                            style={{ boxShadow: `0 10px 30px -10px rgba(0,0,0,0.5)` }}
                                        >
                                            <Icon size={22} className="text-white" />
                                            <span className="font-bold text-white">{action.label}</span>
                                            <ArrowRight size={18} className="text-white/70 group-hover:translate-x-1 transition-transform" />
                                        </ElasticButton>
                                    </ParticleExplosion>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Sections */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Recent Items */}
                        <div className="recent-section">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Package size={24} className="text-cyan-400" />
                                    Recent Items
                                </h2>
                                <Link to="/inventory" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 group">
                                    View all
                                    <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Link>
                            </div>

                            <GradientBorderCard>
                                <div className="divide-y divide-slate-700/50">
                                    {recentItems.length > 0 ? (
                                        recentItems.map((item, i) => (
                                            <Link
                                                key={i}
                                                to={`/items/${item._id}`}
                                                className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors group"
                                            >
                                                <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden">
                                                    {item.images?.[0] ? (
                                                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={24} className="text-slate-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">{item.title}</h3>
                                                    <p className="text-sm text-slate-400 truncate">{item.location?.zone || 'Unknown location'}</p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.type === 'lost' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                                    }`}>
                                                    {item.type}
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <Package size={48} className="text-slate-600 mx-auto mb-4" />
                                            <p className="text-slate-400">No items reported yet</p>
                                            <Link to="/report" className="text-primary-400 text-sm hover:underline mt-2 inline-block">
                                                Report your first item →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </GradientBorderCard>
                        </div>

                        {/* Recent Claims */}
                        <div className="recent-section">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <FileText size={24} className="text-violet-400" />
                                    Recent Claims
                                </h2>
                                <Link to="/my-claims" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 group">
                                    View all
                                    <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Link>
                            </div>

                            <GradientBorderCard>
                                <div className="divide-y divide-slate-700/50">
                                    {recentClaims.length > 0 ? (
                                        recentClaims.map((claim, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4">
                                                <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center">
                                                    <FileText size={24} className="text-slate-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-white truncate">{claim.item?.title || 'Item Claim'}</h3>
                                                    <p className="text-sm text-slate-400">
                                                        {new Date(claim.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${claim.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                        claim.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                            'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {claim.status}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <FileText size={48} className="text-slate-600 mx-auto mb-4" />
                                            <p className="text-slate-400">No claims submitted yet</p>
                                            <Link to="/inventory" className="text-primary-400 text-sm hover:underline mt-2 inline-block">
                                                Browse items to claim →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </GradientBorderCard>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;