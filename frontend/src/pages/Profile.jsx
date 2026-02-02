import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User,
    Mail,
    Phone,
    Building,
    Bell,
    Shield,
    Clock,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
    Monitor,
    Smartphone,
    MapPin,
    X,
} from 'lucide-react';
import api from '../services/api';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Profile form data
    const [profileData, setProfileData] = useState({
        fullName: '',
        phone: '',
        affiliation: '',
    });

    // Notification preferences
    const [notifPrefs, setNotifPrefs] = useState({
        channels: {
            email: true,
            push: true,
            sms: false,
        },
    });
    const [savingNotifPrefs, setSavingNotifPrefs] = useState(false);

    // Login activity
    const [loginActivity, setLoginActivity] = useState([]);
    const [loadingActivity, setLoadingActivity] = useState(true);

    // Initialize profile data from user context
    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName || '',
                phone: user.phone || '',
                affiliation: user.affiliation || '',
            });
        }
    }, [user]);

    // Fetch notification preferences
    useEffect(() => {
        const fetchNotifPrefs = async () => {
            try {
                const response = await api.get('/v1/users/notification-preferences');
                if (response.data) {
                    setNotifPrefs({
                        channels: {
                            email: response.data.channels?.email ?? response.data.emailEnabled ?? true,
                            push: response.data.channels?.push ?? response.data.pushEnabled ?? true,
                            sms: response.data.channels?.sms ?? response.data.smsEnabled ?? false,
                        },
                    });
                }
            } catch (err) {
                console.error('Failed to fetch notification preferences:', err);
            }
        };

        fetchNotifPrefs();
    }, []);

    // Fetch login activity
    useEffect(() => {
        const fetchLoginActivity = async () => {
            setLoadingActivity(true);
            try {
                const response = await api.get('/v1/users/login-activity');
                const activities = Array.isArray(response.data) ? response.data : [];
                setLoginActivity(activities.slice(0, 10)); // Last 10 activities
            } catch (err) {
                console.error('Failed to fetch login activity:', err);
            } finally {
                setLoadingActivity(false);
            }
        };

        fetchLoginActivity();
    }, []);

    // Handle profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await updateProfile({
                fullName: profileData.fullName,
                phone: profileData.phone || undefined,
                affiliation: profileData.affiliation || undefined,
            });
            setSuccess('Profile updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError(err.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // Handle notification preferences update
    const handleNotifPrefsUpdate = async () => {
        setSavingNotifPrefs(true);
        setError('');

        try {
            await api.put('/v1/users/notification-preferences', {
                channels: notifPrefs.channels,
            });
            setSuccess('Notification preferences updated');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Failed to update notification preferences:', err);
            setError(err.response?.data?.error || 'Failed to update notification preferences');
        } finally {
            setSavingNotifPrefs(false);
        }
    };

    // Toggle notification channel
    const toggleNotifChannel = (channel) => {
        setNotifPrefs((prev) => ({
            ...prev,
            channels: {
                ...prev.channels,
                [channel]: !prev.channels[channel],
            },
        }));
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get event type icon and color
    const getEventTypeStyle = (eventType) => {
        switch (eventType) {
            case 'success':
                return {
                    icon: CheckCircle,
                    color: 'text-green-400',
                    bg: 'bg-green-500/20',
                    label: 'Login Success',
                };
            case 'failure':
                return {
                    icon: AlertCircle,
                    color: 'text-red-400',
                    bg: 'bg-red-500/20',
                    label: 'Login Failed',
                };
            case 'logout':
                return {
                    icon: Shield,
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/20',
                    label: 'Logout',
                };
            default:
                return {
                    icon: Clock,
                    color: 'text-slate-400',
                    bg: 'bg-slate-500/20',
                    label: 'Unknown',
                };
        }
    };

    // Get device icon
    const getDeviceIcon = (deviceType) => {
        if (!deviceType) return Monitor;
        const lower = deviceType.toLowerCase();
        if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
            return Smartphone;
        }
        return Monitor;
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                            <p className="text-slate-400 text-sm mt-1">Manage your account settings</p>
                        </div>
                        <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-3">
                        <AlertCircle size={20} />
                        {error}
                        <button onClick={() => setError('')} className="ml-auto">
                            <X size={18} />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 flex items-center gap-3">
                        <CheckCircle size={20} />
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <User size={24} className="text-primary-500" />
                                <h2 className="text-lg font-semibold text-white">Personal Information</h2>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Full Name</label>
                                    <div className="relative">
                                        <User
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                        />
                                        <input
                                            type="text"
                                            value={profileData.fullName}
                                            onChange={(e) =>
                                                setProfileData((prev) => ({ ...prev, fullName: e.target.value }))
                                            }
                                            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>

                                {/* Email (Read-only) */}
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Email</label>
                                    <div className="relative">
                                        <Mail
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                        />
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-slate-500 text-xs mt-1">Email cannot be changed</p>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                        />
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) =>
                                                setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                                            }
                                            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                </div>

                                {/* Affiliation */}
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Affiliation</label>
                                    <div className="relative">
                                        <Building
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                        />
                                        <input
                                            type="text"
                                            value={profileData.affiliation}
                                            onChange={(e) =>
                                                setProfileData((prev) => ({ ...prev, affiliation: e.target.value }))
                                            }
                                            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                                            placeholder="e.g., CSE Department"
                                        />
                                    </div>
                                </div>

                                {/* Role (Read-only) */}
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Role</label>
                                    <div className="relative">
                                        <Shield
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                        />
                                        <input
                                            type="text"
                                            value={user?.role?.replace('_', ' ').toUpperCase() || 'STUDENT'}
                                            disabled
                                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-500 cursor-not-allowed capitalize"
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-medium rounded-xl transition-colors"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Notification Preferences */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Bell size={24} className="text-primary-500" />
                                <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
                            </div>

                            <div className="space-y-4">
                                {/* Email Notifications */}
                                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Mail size={20} className="text-slate-400" />
                                        <div>
                                            <p className="text-white font-medium">Email Notifications</p>
                                            <p className="text-slate-500 text-sm">Receive updates via email</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleNotifChannel('email')}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${
                                            notifPrefs.channels.email ? 'bg-primary-500' : 'bg-slate-700'
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                                notifPrefs.channels.email ? 'left-7' : 'left-1'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Push Notifications */}
                                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Bell size={20} className="text-slate-400" />
                                        <div>
                                            <p className="text-white font-medium">Push Notifications</p>
                                            <p className="text-slate-500 text-sm">Receive in-app notifications</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleNotifChannel('push')}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${
                                            notifPrefs.channels.push ? 'bg-primary-500' : 'bg-slate-700'
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                                notifPrefs.channels.push ? 'left-7' : 'left-1'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* SMS Notifications */}
                                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Phone size={20} className="text-slate-400" />
                                        <div>
                                            <p className="text-white font-medium">SMS Notifications</p>
                                            <p className="text-slate-500 text-sm">Receive updates via SMS</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleNotifChannel('sms')}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${
                                            notifPrefs.channels.sms ? 'bg-primary-500' : 'bg-slate-700'
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                                notifPrefs.channels.sms ? 'left-7' : 'left-1'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Save Notification Preferences */}
                                <button
                                    onClick={handleNotifPrefsUpdate}
                                    disabled={savingNotifPrefs}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 text-white font-medium rounded-xl transition-colors"
                                >
                                    {savingNotifPrefs ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Preferences
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Login Activity */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Clock size={24} className="text-primary-500" />
                                <h2 className="text-lg font-semibold text-white">Login Activity</h2>
                            </div>

                            {loadingActivity ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 size={24} className="animate-spin text-primary-500" />
                                </div>
                            ) : loginActivity.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No login activity found</p>
                            ) : (
                                <div className="space-y-3">
                                    {loginActivity.map((activity, index) => {
                                        const style = getEventTypeStyle(activity.eventType);
                                        const DeviceIcon = getDeviceIcon(activity.deviceType);

                                        return (
                                            <div
                                                key={activity._id || index}
                                                className="p-3 bg-slate-800/50 rounded-lg"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${style.bg}`}>
                                                        <style.icon size={16} className={style.color} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium ${style.color}`}>
                                                            {style.label}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                            <DeviceIcon size={12} />
                                                            <span className="truncate">
                                                                {activity.deviceType?.slice(0, 30) || 'Unknown device'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                            <MapPin size={12} />
                                                            <span>{activity.location || 'Unknown location'}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 mt-1">
                                                            {formatDate(activity.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
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