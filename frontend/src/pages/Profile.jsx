/**
 * PREMIUM PROFILE PAGE
 * With advanced effects from CodePen inspirations
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { gsap } from 'gsap';
import {
    User,
    Mail,
    Phone,
    Shield,
    Edit3,
    Save,
    X,
    Camera,
    CheckCircle,
    Loader2,
    AlertCircle,
    Calendar,
    Package,
    FileText,
    Activity,
    Award
} from 'lucide-react';
import {
    MorphingBlob,
    GlitchText,
    NeonText,
    TiltCard,
    GradientBorderCard,
    ElasticButton,
    PulseRings,
    ParticleExplosion,
    HolographicCard
} from '../effects';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        itemsReported: 0,
        claimsSubmitted: 0,
        itemsResolved: 0
    });

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || ''
    });

    const containerRef = useRef(null);

    // Fetch user stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/v1/dashboard/stats');
                setStats(res.data || {});
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
    }, []);

    // GSAP animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.profile-header',
                { y: -40, opacity: 0, filter: 'blur(10px)' },
                { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }
            );

            gsap.fromTo('.profile-avatar',
                { scale: 0, rotate: -180 },
                { scale: 1, rotate: 0, duration: 1, delay: 0.2, ease: 'elastic.out(1, 0.5)' }
            );

            gsap.fromTo('.profile-card',
                { y: 60, opacity: 0, rotateX: 15 },
                { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.1, delay: 0.3, ease: 'power4.out' }
            );

            gsap.fromTo('.stat-item',
                { y: 30, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, delay: 0.5, ease: 'back.out(2)' }
            );

            // Animate stat numbers
            document.querySelectorAll('.stat-value').forEach(el => {
                const target = parseInt(el.dataset.value) || 0;
                gsap.fromTo(el,
                    { innerText: 0 },
                    { innerText: target, duration: 2, snap: { innerText: 1 }, delay: 0.8, ease: 'power2.out' }
                );
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await api.patch('/v1/users/profile', formData);
            updateUser(res.data.user);
            setSuccess('Profile updated successfully!');
            setEditing(false);

            // Success animation
            gsap.fromTo('.success-msg',
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(2)' }
            );
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return { color: '#f59e0b', bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30' };
            case 'delegated_admin': return { color: '#8b5cf6', bg: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30' };
            case 'faculty': return { color: '#10b981', bg: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' };
            default: return { color: '#0ea5e9', bg: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' };
        }
    };

    const roleConfig = getRoleColor(user?.role);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#030712] text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4">
                    <MorphingBlob color1="#0ea5e9" color2="#8b5cf6" size={500} />
                </div>
                <div className="absolute bottom-1/4 right-1/4">
                    <MorphingBlob color1="#8b5cf6" color2="#ec4899" size={400} />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <Sidebar />

            <main className="pl-4 md:pl-8 pr-4 md:pr-8 py-8 relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="profile-header text-center mb-12">
                        {/* Avatar */}
                        <div className="profile-avatar relative inline-block mb-6">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-5xl font-black shadow-2xl shadow-primary-500/30">
                                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className={`absolute -bottom-2 -right-2 p-3 rounded-full bg-gradient-to-br ${roleConfig.bg} ${roleConfig.border} border shadow-lg`}>
                                <Shield size={20} style={{ color: roleConfig.color }} />
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black mb-2">
                            <GlitchText text={user?.fullName || 'User'} />
                        </h1>
                        <p className="text-slate-400 text-lg capitalize">
                            <NeonText color={roleConfig.color}>{user?.role?.replace('_', ' ') || 'Student'}</NeonText>
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-10">
                        {[
                            { icon: Package, label: 'Items Reported', value: stats.totalReported || 0, color: '#0ea5e9' },
                            { icon: FileText, label: 'Claims Made', value: stats.totalClaims || 0, color: '#8b5cf6' },
                            { icon: CheckCircle, label: 'Resolved', value: stats.resolvedItems || 0, color: '#10b981' }
                        ].map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <TiltCard key={i} className="stat-item" intensity={0.3}>
                                    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl text-center">
                                        <div
                                            className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                                            style={{
                                                background: `linear-gradient(135deg, ${stat.color}20, transparent)`,
                                                border: `1px solid ${stat.color}30`
                                            }}
                                        >
                                            <Icon size={24} style={{ color: stat.color }} />
                                        </div>
                                        <p className="stat-value text-3xl font-black text-white mb-1" data-value={stat.value}>
                                            {stat.value}
                                        </p>
                                        <p className="text-slate-400 text-sm">{stat.label}</p>
                                    </div>
                                </TiltCard>
                            );
                        })}
                    </div>

                    {/* Messages */}
                    {success && (
                        <div className="success-msg mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-3">
                            <CheckCircle size={20} />
                            <span>{success}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Profile Card */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="profile-card" style={{ perspective: 1000 }}>
                            <TiltCard intensity={0.15}>
                                <GradientBorderCard>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <User size={20} className="text-cyan-400" />
                                            Personal Information
                                        </h2>
                                        {!editing ? (
                                            <ElasticButton
                                                onClick={() => setEditing(true)}
                                                className="p-2.5 bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors"
                                            >
                                                <Edit3 size={18} />
                                            </ElasticButton>
                                        ) : (
                                            <div className="flex gap-2">
                                                <ElasticButton
                                                    onClick={() => { setEditing(false); setFormData({ fullName: user?.fullName, phone: user?.phone }); }}
                                                    className="p-2.5 bg-slate-800 rounded-xl text-slate-300 hover:text-white"
                                                >
                                                    <X size={18} />
                                                </ElasticButton>
                                                <ElasticButton
                                                    onClick={handleSave}
                                                    disabled={loading}
                                                    className="p-2.5 bg-emerald-600 rounded-xl text-white"
                                                >
                                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                                </ElasticButton>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">Full Name</label>
                                            {editing ? (
                                                <input
                                                    type="text"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                                />
                                            ) : (
                                                <p className="text-white font-medium">{user?.fullName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">Phone</label>
                                            {editing ? (
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="Add phone number"
                                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                                />
                                            ) : (
                                                <p className="text-white font-medium">{user?.phone || 'Not provided'}</p>
                                            )}
                                        </div>
                                    </div>
                                </GradientBorderCard>
                            </TiltCard>
                        </div>

                        {/* Account Info */}
                        <div className="profile-card" style={{ perspective: 1000 }}>
                            <TiltCard intensity={0.15}>
                                <GradientBorderCard>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                                        <Shield size={20} className="text-violet-400" />
                                        Account Details
                                    </h2>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">Email</label>
                                            <div className="flex items-center gap-3">
                                                <Mail size={18} className="text-slate-500" />
                                                <p className="text-white font-medium">{user?.email}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">Role</label>
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${roleConfig.bg} ${roleConfig.border} border`}>
                                                <Shield size={16} style={{ color: roleConfig.color }} />
                                                <span className="capitalize font-semibold" style={{ color: roleConfig.color }}>
                                                    {user?.role?.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">Member Since</label>
                                            <div className="flex items-center gap-3">
                                                <Calendar size={18} className="text-slate-500" />
                                                <p className="text-white font-medium">
                                                    {user?.createdAt
                                                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })
                                                        : 'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </GradientBorderCard>
                            </TiltCard>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;