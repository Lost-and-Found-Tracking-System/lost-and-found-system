import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    Loader2,
    Info,
    AlertCircle,
    Package,
    FileText,
} from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalUnread, setTotalUnread] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/v1/notifications?limit=50');
            setNotifications(res.data.notifications || []);
            setTotalUnread(res.data.totalUnread || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/v1/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true, readAt: new Date() } : n
            ));
            setTotalUnread(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/v1/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true, readAt: new Date() })));
            setTotalUnread(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/v1/notifications/${id}`);
            const notif = notifications.find(n => n._id === id);
            setNotifications(notifications.filter(n => n._id !== id));
            if (notif && !notif.isRead) {
                setTotalUnread(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'match': return Package;
            case 'status': return FileText;
            case 'proof_request': return AlertCircle;
            case 'announcement': return Bell;
            default: return Info;
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'match': return 'text-green-400 bg-green-500/10';
            case 'status': return 'text-blue-400 bg-blue-500/10';
            case 'proof_request': return 'text-orange-400 bg-orange-500/10';
            case 'announcement': return 'text-purple-400 bg-purple-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    if (loading) {
        return (
            <>
                <Sidebar />
                <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
            </>
        );
    }

    return (
        <>
            <Sidebar />
            <div className="min-h-screen bg-[#020617] p-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Notifications</h1>
                            <p className="text-slate-400 mt-1">
                                {totalUnread > 0 ? `${totalUnread} unread notifications` : 'All caught up!'}
                            </p>
                        </div>
                        {totalUnread > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
                            >
                                <CheckCheck size={18} />
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    {notifications.length === 0 ? (
                        <div className="text-center py-20">
                            <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
                            <p className="text-slate-400">You're all caught up! Check back later.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notif) => {
                                const Icon = getIcon(notif.type);
                                return (
                                    <div
                                        key={notif._id}
                                        className={`bg-slate-900/50 border rounded-2xl p-5 transition-all ${notif.isRead
                                                ? 'border-slate-800'
                                                : 'border-primary-500/50 bg-primary-500/5'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${getIconColor(notif.type)}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-slate-500 uppercase tracking-wide">
                                                        {notif.type?.replace('_', ' ')}
                                                    </span>
                                                    {!notif.isRead && (
                                                        <span className="w-2 h-2 bg-primary-500 rounded-full" />
                                                    )}
                                                </div>
                                                <p className="text-white">{notif.content}</p>
                                                <p className="text-slate-500 text-sm mt-1">
                                                    {new Date(notif.sentAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!notif.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notif._id)}
                                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notif._id)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Back Link */}
                    <div className="mt-8 text-center">
                        <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Notifications;
