/**
 * PREMIUM NOTIFICATIONS PAGE
 * With advanced effects from CodePen inspirations
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { gsap } from 'gsap';
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    Trash2,
    Package,
    FileText,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Sparkles,
    Filter
} from 'lucide-react';
import {
    MorphingBlob,
    GlitchText,
    TiltCard,
    GradientBorderCard,
    ElasticButton,
    PulseRings,
    RippleButton,
    HolographicCard
} from '../effects';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const containerRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/v1/notifications');
            setNotifications(res.data.notifications || res.data || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // GSAP animations
    useEffect(() => {
        if (loading) return;

        const ctx = gsap.context(() => {
            gsap.fromTo('.notif-header',
                { y: -40, opacity: 0, filter: 'blur(10px)' },
                { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }
            );

            gsap.fromTo('.notif-item',
                { x: -50, opacity: 0, scale: 0.95 },
                {
                    x: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.06,
                    delay: 0.2,
                    ease: 'power3.out'
                }
            );

            gsap.fromTo('.filter-btn',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.3, ease: 'back.out(2)' }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [loading, notifications]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/v1/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/v1/notifications/read-all');
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        // Animate out
        const element = document.querySelector(`[data-notif-id="${id}"]`);
        if (element) {
            await gsap.to(element, {
                x: 100,
                opacity: 0,
                height: 0,
                duration: 0.3,
                ease: 'power2.in'
            });
        }

        try {
            await api.delete(`/v1/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'claim_approved':
                return { icon: CheckCircle, color: '#10b981', bg: 'bg-emerald-500/20' };
            case 'claim_rejected':
                return { icon: XCircle, color: '#ef4444', bg: 'bg-red-500/20' };
            case 'new_claim':
                return { icon: FileText, color: '#8b5cf6', bg: 'bg-violet-500/20' };
            case 'item_matched':
                return { icon: Sparkles, color: '#f59e0b', bg: 'bg-amber-500/20' };
            case 'new_item':
                return { icon: Package, color: '#0ea5e9', bg: 'bg-cyan-500/20' };
            default:
                return { icon: Bell, color: '#64748b', bg: 'bg-slate-500/20' };
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="relative">
                    <PulseRings size={100} color="#0ea5e9" />
                    <Bell className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-400" size={32} />
                </div>
            </div>
        );
    }

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
                    <div className="notif-header mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black mb-2">
                                    <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                                        Notifications
                                    </span>
                                </h1>
                                <p className="text-slate-400 text-lg">
                                    <GlitchText text={`${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`} />
                                </p>
                            </div>

                            {unreadCount > 0 && (
                                <ElasticButton
                                    onClick={markAllAsRead}
                                    className="px-5 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 hover:text-white flex items-center gap-2 transition-all"
                                >
                                    <CheckCheck size={18} />
                                    Mark all read
                                </ElasticButton>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 mb-8">
                        {[
                            { id: 'all', label: 'All', count: notifications.length },
                            { id: 'unread', label: 'Unread', count: unreadCount },
                            { id: 'read', label: 'Read', count: notifications.length - unreadCount }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`filter-btn px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${filter === f.id
                                        ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/25'
                                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
                                    }`}
                            >
                                {f.label}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${filter === f.id ? 'bg-white/20' : 'bg-slate-700'
                                    }`}>
                                    {f.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Notifications List */}
                    {filteredNotifications.length > 0 ? (
                        <div className="space-y-4">
                            {filteredNotifications.map((notification) => {
                                const { icon: Icon, color, bg } = getNotificationIcon(notification.type);

                                return (
                                    <div
                                        key={notification._id}
                                        data-notif-id={notification._id}
                                        className="notif-item"
                                    >
                                        <TiltCard intensity={0.1}>
                                            <div className={`p-5 rounded-2xl bg-slate-900/60 border backdrop-blur-xl transition-all group ${notification.read
                                                    ? 'border-slate-700/50'
                                                    : 'border-primary-500/30 bg-primary-500/5'
                                                }`}>
                                                <div className="flex items-start gap-4">
                                                    {/* Icon */}
                                                    <div
                                                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
                                                        style={{ border: `1px solid ${color}30` }}
                                                    >
                                                        <Icon size={24} style={{ color }} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <h3 className={`font-semibold mb-1 ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                                                                    {notification.title}
                                                                </h3>
                                                                <p className="text-slate-400 text-sm">
                                                                    {notification.message}
                                                                </p>
                                                            </div>

                                                            {/* Unread indicator */}
                                                            {!notification.read && (
                                                                <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse flex-shrink-0" />
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between mt-4">
                                                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                                                <Clock size={12} />
                                                                {new Date(notification.createdAt).toLocaleString()}
                                                            </span>

                                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {!notification.read && (
                                                                    <button
                                                                        onClick={() => markAsRead(notification._id)}
                                                                        className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-primary-400 transition-colors"
                                                                        title="Mark as read"
                                                                    >
                                                                        <Check size={16} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => deleteNotification(notification._id)}
                                                                    className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TiltCard>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-20">
                            <div className="inline-flex p-6 bg-slate-800/30 rounded-3xl mb-6">
                                <BellOff size={64} className="text-slate-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">No notifications</h2>
                            <p className="text-slate-400 max-w-md mx-auto">
                                {filter === 'unread'
                                    ? 'You\'re all caught up! No unread notifications.'
                                    : 'You don\'t have any notifications yet. They\'ll appear here when you receive updates.'}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Notifications;
