import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { usePageTransition, useMagneticHover } from '../../hooks/useGSAPAnimations';
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
    Briefcase,
    GraduationCap,
    Lock,
    SearchX
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

    const containerRef = useRef(null);
    const listRef = useRef(null);

    usePageTransition(containerRef);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    useEffect(() => {
        if (!loading && listRef.current) {
            gsap.fromTo(listRef.current.children,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
            );
        }
    }, [users, loading]);

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
            alert('Please select a role and provide a reason'); // Customize with toast later
            return;
        }

        setSaving(true);
        try {
            await api.put(`/v1/admin/users/${userId}/role`, {
                role: newRole,
                reason: reason,
            });

            // Animate card update
            const card = document.getElementById(`user-card-${userId}`);
            if (card) {
                gsap.fromTo(card,
                    { scale: 1.02, borderColor: '#3b82f6' },
                    { scale: 1, borderColor: '#1e293b', duration: 0.5 }
                );
            }

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

    const getRoleConfig = (role) => {
        switch (role) {
            case 'admin': return { icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
            case 'delegated_admin': return { icon: Lock, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
            case 'faculty': return { icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
            case 'student': return { icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
            case 'visitor': return { icon: User, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
            default: return { icon: User, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
        }
    };

    return (
        <div className="flex bg-[#020617] min-h-screen">
            <AdminSidebar />
            <div ref={containerRef} className="flex-1 p-8 overflow-y-auto h-screen custom-scrollbar">
                <div className="max-w-7xl mx-auto pb-20">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <Link to="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-2 transition-colors">
                                <ArrowLeft size={16} /> Back to Dashboard
                            </Link>
                            <h1 className="text-4xl font-black text-white tracking-tighter">User Permissions</h1>
                            <p className="text-slate-400 mt-2 text-lg">Manage roles and access levels across the platform</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-slate-300 font-mono text-sm">
                                {users.length} Users Total
                            </div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-0 z-10 bg-[#020617]/80 backdrop-blur-xl p-4 -mx-4 rounded-3xl border border-slate-800/50">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all font-medium"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {['all', 'student', 'faculty', 'visitor', 'admin'].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`px-5 py-3 rounded-xl font-bold capitalize transition-all whitespace-nowrap ${roleFilter === role
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    {role.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Users Grid */}
                    {loading ? (
                        <div className="flex justify-center py-32">
                            <Loader2 size={48} className="text-primary-500 animate-spin" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-32 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl">
                            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <SearchX size={40} className="text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
                            <p className="text-slate-400">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredUsers.map((user) => {
                                const roleConfig = getRoleConfig(user.role);
                                const RoleIcon = roleConfig.icon;
                                const isEditing = editingUser === user._id;

                                return (
                                    <div
                                        id={`user-card-${user._id}`}
                                        key={user._id}
                                        className={`relative bg-slate-900/40 backdrop-blur-sm border transition-all duration-300 rounded-3xl overflow-hidden group ${isEditing ? 'border-primary-500 shadow-2xl shadow-primary-500/10 scale-[1.02] z-10' : 'border-slate-800 hover:border-slate-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50'
                                            }`}
                                    >
                                        <div className="p-6">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-lg">
                                                        {user.profile?.fullName?.charAt(0) || <User />}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white font-bold truncate max-w-[180px]">{user.profile?.fullName || 'Unknown User'}</h3>
                                                        <p className="text-slate-500 text-xs truncate max-w-[180px]">{user.profile?.email}</p>
                                                    </div>
                                                </div>
                                                <div className={`p-2 rounded-xl ${roleConfig.bg} ${roleConfig.color} border ${roleConfig.border}`}>
                                                    <RoleIcon size={20} />
                                                </div>
                                            </div>

                                            {/* Attributes */}
                                            <div className="grid grid-cols-2 gap-3 mb-6">
                                                <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
                                                    <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Status</span>
                                                    <span className={`text-sm font-bold capitalize ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                                                        {user.status}
                                                    </span>
                                                </div>
                                                <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
                                                    <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Joined</span>
                                                    <span className="text-sm font-bold text-slate-300">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions / Edit Form */}
                                            {!isEditing ? (
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(user._id);
                                                        setNewRole(user.role);
                                                        // clear reason
                                                        setReason('');
                                                    }}
                                                    className="w-full py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Edit2 size={16} />
                                                    Modify Access
                                                </button>
                                            ) : (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                                    <div>
                                                        <label className="text-xs text-slate-400 font-bold uppercase mb-1.5 block ml-1">New Role</label>
                                                        <select
                                                            value={newRole}
                                                            onChange={(e) => setNewRole(e.target.value)}
                                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 cursor-pointer appearance-none"
                                                        >
                                                            <option value="student">Student</option>
                                                            <option value="faculty">Faculty</option>
                                                            <option value="visitor">Visitor</option>
                                                            <option value="delegated_admin">Delegated Admin</option>
                                                            <option value="admin">System Admin</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs text-slate-400 font-bold uppercase mb-1.5 block ml-1">Reason for Change</label>
                                                        <input
                                                            type="text"
                                                            value={reason}
                                                            onChange={(e) => setReason(e.target.value)}
                                                            placeholder="Required for audit logs..."
                                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 placeholder-slate-600"
                                                            autoFocus
                                                        />
                                                    </div>

                                                    <div className="flex gap-3 pt-2">
                                                        <button
                                                            onClick={() => setEditingUser(null)}
                                                            className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleRoleChange(user._id)}
                                                            disabled={saving || !reason.trim()}
                                                            className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleManagement;
