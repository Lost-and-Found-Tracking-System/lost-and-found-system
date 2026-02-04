import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import {
    ArrowLeft,
    Users,
    Shield,
    User,
    Loader2,
    Search,
    Edit2,
    X,
    Check,
} from 'lucide-react';

const RoleManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [editingUser, setEditingUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = roleFilter !== 'all' ? `?role=${roleFilter}` : '';
            const res = await api.get(`/v1/admin/users${params}`);
            setUsers(res.data.users || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId) => {
        if (!newRole || !reason.trim()) {
            alert('Please select a role and provide a reason');
            return;
        }

        setSaving(true);
        try {
            await api.put(`/v1/admin/users/${userId}/role`, {
                role: newRole,
                reason: reason,
            });

            // Update local state
            setUsers(users.map(u =>
                u._id === userId ? { ...u, role: newRole } : u
            ));
            setEditingUser(null);
            setNewRole('');
            setReason('');
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('Failed to update role');
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(user => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            user.profile?.fullName?.toLowerCase().includes(searchLower) ||
            user.profile?.email?.toLowerCase().includes(searchLower) ||
            user.institutionalId?.toLowerCase().includes(searchLower)
        );
    });

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'delegated_admin': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
            case 'faculty': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
            case 'student': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'visitor': return 'bg-green-500/10 text-green-400 border-green-500/30';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-400';
            case 'suspended': return 'text-red-400';
            case 'expired': return 'text-slate-500';
            default: return 'text-slate-400';
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

    return (
        <>
            <AdminSidebar />
            <div className="min-h-screen bg-[#020617] p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            to="/admin"
                            className="flex items-center gap-2 text-slate-400 hover:text-white mb-2 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Back to Admin
                        </Link>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Users className="text-primary-400" />
                            User Management
                        </h1>
                        <p className="text-slate-400 mt-1">Manage user roles and access permissions</p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        {/* Search */}
                        <div className="relative flex-1 min-w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                            />
                        </div>

                        {/* Role Filter */}
                        <div className="flex gap-2">
                            {['all', 'student', 'faculty', 'admin', 'visitor'].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${roleFilter === role
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left p-4 text-slate-400 font-medium">User</th>
                                    <th className="text-left p-4 text-slate-400 font-medium">Role</th>
                                    <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                                    <th className="text-left p-4 text-slate-400 font-medium">Joined</th>
                                    <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-slate-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <React.Fragment key={user._id}>
                                            <tr className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                                                            <User size={18} className="text-primary-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">
                                                                {user.profile?.fullName || 'Unknown'}
                                                            </p>
                                                            <p className="text-slate-500 text-sm">
                                                                {user.profile?.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getRoleColor(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`capitalize ${getStatusColor(user.status)}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-400">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setEditingUser(user._id);
                                                            setNewRole(user.role);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Edit Row */}
                                            {editingUser === user._id && (
                                                <tr className="bg-slate-800/50">
                                                    <td colSpan={5} className="p-4">
                                                        <div className="flex items-end gap-4">
                                                            <div className="flex-1">
                                                                <label className="block text-slate-400 text-sm mb-2">New Role</label>
                                                                <select
                                                                    value={newRole}
                                                                    onChange={(e) => setNewRole(e.target.value)}
                                                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                                                >
                                                                    <option value="student">Student</option>
                                                                    <option value="faculty">Faculty</option>
                                                                    <option value="visitor">Visitor</option>
                                                                    <option value="delegated_admin">Delegated Admin</option>
                                                                    <option value="admin">Admin</option>
                                                                </select>
                                                            </div>
                                                            <div className="flex-[2]">
                                                                <label className="block text-slate-400 text-sm mb-2">Reason for Change</label>
                                                                <input
                                                                    type="text"
                                                                    value={reason}
                                                                    onChange={(e) => setReason(e.target.value)}
                                                                    placeholder="Enter reason for role change..."
                                                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => handleRoleChange(user._id)}
                                                                disabled={saving}
                                                                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                                                            >
                                                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingUser(null);
                                                                    setNewRole('');
                                                                    setReason('');
                                                                }}
                                                                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RoleManagement;
