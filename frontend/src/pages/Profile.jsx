import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    User,
    Mail,
    Phone,
    Building,
    Save,
    Loader2,
    Bell,
    Shield,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
} from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loginActivity, setLoginActivity] = useState([]);
    const [notifPrefs, setNotifPrefs] = useState({
        email: true,
        push: true,
        sms: false,
    });

    const [formData, setFormData] = useState({
        fullName: user?.fullName || user?.name || '',
        phone: user?.phone || '',
        affiliation: user?.affiliation || '',
    });

    useEffect(() => {
        fetchLoginActivity();
        fetchNotificationPrefs();
    }, []);

    const fetchLoginActivity = async () => {
        try {
            const res = await api.get('/v1/users/login-activity');
            setLoginActivity(res.data.slice(0, 10));
        } catch (error) {
            console.error('Failed to fetch login activity:', error);
        }
    };

    const fetchNotificationPrefs = async () => {
        try {
            const res = await api.get('/v1/users/notification-preferences');
            if (res.data?.channels) {
                setNotifPrefs(res.data.channels);
            }
        } catch (error) {
            console.error('Failed to fetch notification preferences:', error);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await updateProfile(formData);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleNotifPrefsUpdate = async () => {
        try {
            await api.put('/v1/users/notification-preferences', {
                channels: notifPrefs
            });
            setSuccess('Notification preferences updated!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Failed to update notification preferences');
        }
    };

    const getEventIcon = (eventType) => {
        switch (eventType) {
            case 'success': return <CheckCircle size={16} className="text-green-400" />;
            case 'failure': return <AlertCircle size={16} className="text-red-400" />;
            case 'logout': return <Shield size={16} className="text-blue-400" />;
            default: return <Clock size={16} className="text-slate-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] p-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                    <p className="text-slate-400 mt-1">Manage your account information and preferences</p>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                        {error}
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Profile Form */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <User size={20} className="text-primary-400" />
                            Personal Information
                        </h2>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-slate-600 text-xs mt-1">Email cannot be changed</p>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Affiliation</label>
                                <div className="relative">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        value={formData.affiliation}
                                        onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                                        placeholder="e.g., CSE Department"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:bg-primary-500/50 transition-colors flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    {/* Notification Preferences */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Bell size={20} className="text-primary-400" />
                                Notification Preferences
                            </h2>

                            <div className="space-y-4">
                                {[
                                    { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                                    { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                                    { key: 'sms', label: 'SMS Notifications', desc: 'Text message alerts' },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                        <div>
                                            <p className="text-white font-medium">{item.label}</p>
                                            <p className="text-slate-500 text-sm">{item.desc}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newPrefs = { ...notifPrefs, [item.key]: !notifPrefs[item.key] };
                                                setNotifPrefs(newPrefs);
                                            }}
                                            className={`w-12 h-6 rounded-full transition-colors ${
                                                notifPrefs[item.key] ? 'bg-primary-500' : 'bg-slate-700'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                                notifPrefs[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                                            }`} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleNotifPrefsUpdate}
                                className="w-full mt-4 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                            >
                                Update Preferences
                            </button>
                        </div>

                        {/* Login Activity */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Shield size={20} className="text-primary-400" />
                                Recent Login Activity
                            </h2>

                            {loginActivity.length === 0 ? (
                                <p className="text-slate-500 text-center py-4">No recent activity</p>
                            ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {loginActivity.map((activity, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                                            {getEventIcon(activity.eventType)}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm capitalize">{activity.eventType}</p>
                                                <p className="text-slate-500 text-xs truncate">{activity.deviceType}</p>
                                            </div>
                                            <p className="text-slate-500 text-xs">
                                                {new Date(activity.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
