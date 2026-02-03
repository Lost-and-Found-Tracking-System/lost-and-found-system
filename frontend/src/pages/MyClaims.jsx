import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    ChevronRight,
    ArrowLeft,
    Package,
    MapPin,
    Calendar,
    MessageSquare,
    Home,
    PlusCircle,
    Search,
    Bell,
    User,
    LogOut,
    Shield,
} from 'lucide-react';
import api from '../services/api';
import LogoutConfirmModal from '../components/LogoutConfirmModal';

const MyClaims = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [claims, setClaims] = useState([]);
    const [error, setError] = useState('');
    const [expandedClaim, setExpandedClaim] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Fetch user's claims
    useEffect(() => {
        const fetchClaims = async () => {
            setLoading(true);
            try {
                const response = await api.get('/v1/claims/user/my-claims');
                setClaims(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error('Failed to fetch claims:', err);
                setError('Failed to load your claims');
            } finally {
                setLoading(false);
            }
        };

        fetchClaims();
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            navigate('/login');
        }
    };

    // Get status icon and color
    const getStatusInfo = (status) => {
        switch (status) {
            case 'approved':
                return {
                    icon: CheckCircle,
                    color: 'text-green-400',
                    bgColor: 'bg-green-500/20',
                    label: 'Approved',
                };
            case 'rejected':
                return {
                    icon: XCircle,
                    color: 'text-red-400',
                    bgColor: 'bg-red-500/20',
                    label: 'Rejected',
                };
            case 'pending':
            default:
                return {
                    icon: Clock,
                    color: 'text-yellow-400',
                    bgColor: 'bg-yellow-500/20',
                    label: 'Pending',
                };
        }
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Toggle expanded claim
    const toggleExpand = (claimId) => {
        setExpandedClaim(expandedClaim === claimId ? null : claimId);
    };

    // Sidebar items
    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: PlusCircle, label: 'Report Item', path: '/report' },
        { icon: Search, label: 'Browse Items', path: '/inventory' },
        { icon: FileText, label: 'My Claims', path: '/my-claims', active: true },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="p-2 bg-primary-500/20 rounded-lg">
                            <Package size={24} className="text-primary-500" />
                        </div>
                        <span className="text-xl font-bold text-white">L&F</span>
                    </Link>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                            <User size={20} className="text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{user?.fullName || 'User'}</p>
                            <p className="text-primary-400 text-xs truncate capitalize">
                                {user?.role || 'Student'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${item.active
                                    ? 'bg-primary-500/20 text-primary-400'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}

                    {/* Admin Link */}
                    {(user?.role === 'admin' || user?.role === 'delegated_admin') && (
                        <>
                            <div className="my-4 border-t border-slate-800" />
                            <Link
                                to="/admin"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                            >
                                <Shield size={20} />
                                <span>Admin Panel</span>
                            </Link>
                        </>
                    )}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-slate-900 border-b border-slate-800 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">My Claims</h1>
                            <p className="text-slate-400 text-sm mt-1">
                                Track the status of your submitted claims
                            </p>
                        </div>
                        <Link
                            to="/inventory"
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                        >
                            <Search size={18} />
                            Browse Items
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8">
                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-3">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={40} className="animate-spin text-primary-500" />
                        </div>
                    ) : claims.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
                            <FileText size={60} className="mx-auto text-slate-600 mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No Claims Yet</h3>
                            <p className="text-slate-400 mb-6">
                                You haven't submitted any claims. Browse found items and claim yours!
                            </p>
                            <Link
                                to="/inventory"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
                            >
                                <Search size={20} />
                                Browse Found Items
                            </Link>
                        </div>
                    ) : (
                        /* Claims List */
                        <div className="space-y-4">
                            {/* Stats Summary */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                                            <Clock size={20} className="text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-sm">Pending</p>
                                            <p className="text-xl font-bold text-white">
                                                {claims.filter((c) => c.status === 'pending').length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-500/20 rounded-lg">
                                            <CheckCircle size={20} className="text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-sm">Approved</p>
                                            <p className="text-xl font-bold text-white">
                                                {claims.filter((c) => c.status === 'approved').length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-500/20 rounded-lg">
                                            <XCircle size={20} className="text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-sm">Rejected</p>
                                            <p className="text-xl font-bold text-white">
                                                {claims.filter((c) => c.status === 'rejected').length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Claims Cards */}
                            {claims.map((claim) => {
                                const statusInfo = getStatusInfo(claim.status);
                                const StatusIcon = statusInfo.icon;
                                const isExpanded = expandedClaim === claim._id;

                                return (
                                    <div
                                        key={claim._id}
                                        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
                                    >
                                        {/* Claim Header - Clickable */}
                                        <button
                                            onClick={() => toggleExpand(claim._id)}
                                            className="w-full p-4 flex items-center gap-4 hover:bg-slate-800/50 transition-colors"
                                        >
                                            {/* Status Icon */}
                                            <div className={`p-3 rounded-xl ${statusInfo.bgColor}`}>
                                                <StatusIcon size={24} className={statusInfo.color} />
                                            </div>

                                            {/* Claim Info */}
                                            <div className="flex-1 text-left">
                                                <p className="text-white font-semibold">
                                                    {claim.itemId?.itemAttributes?.category || 'Item'} -{' '}
                                                    {claim.itemId?.trackingId || 'Unknown'}
                                                </p>
                                                <p className="text-slate-400 text-sm">
                                                    Submitted {formatDate(claim.submittedAt)}
                                                </p>
                                            </div>

                                            {/* Status Badge */}
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                                            >
                                                {statusInfo.label}
                                            </span>

                                            {/* Expand Icon */}
                                            <ChevronRight
                                                size={20}
                                                className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''
                                                    }`}
                                            />
                                        </button>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="px-4 pb-4 border-t border-slate-800">
                                                <div className="pt-4 space-y-4">
                                                    {/* Item Details */}
                                                    <div className="bg-slate-800/50 rounded-xl p-4">
                                                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                                            <Package size={16} className="text-primary-400" />
                                                            Item Details
                                                        </h4>
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div>
                                                                <span className="text-slate-500">Category:</span>
                                                                <span className="text-white ml-2">
                                                                    {claim.itemId?.itemAttributes?.category || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-500">Color:</span>
                                                                <span className="text-white ml-2">
                                                                    {claim.itemId?.itemAttributes?.color || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-500">Tracking ID:</span>
                                                                <span className="text-primary-400 ml-2 font-mono">
                                                                    {claim.itemId?.trackingId || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-500">Type:</span>
                                                                <span className="text-white ml-2 capitalize">
                                                                    {claim.itemId?.submissionType || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-400 text-sm mt-3">
                                                            {claim.itemId?.itemAttributes?.description || 'No description'}
                                                        </p>
                                                    </div>

                                                    {/* Your Claim */}
                                                    <div className="bg-slate-800/50 rounded-xl p-4">
                                                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                                            <MessageSquare size={16} className="text-primary-400" />
                                                            Your Ownership Proof
                                                        </h4>
                                                        <p className="text-slate-300 text-sm">
                                                            {claim.ownershipProof || 'No proof provided'}
                                                        </p>
                                                    </div>

                                                    {/* Admin Response (if any) */}
                                                    {claim.status !== 'pending' && claim.adminRemarks && (
                                                        <div
                                                            className={`rounded-xl p-4 ${claim.status === 'approved'
                                                                    ? 'bg-green-500/10 border border-green-500/30'
                                                                    : 'bg-red-500/10 border border-red-500/30'
                                                                }`}
                                                        >
                                                            <h4
                                                                className={`font-medium mb-2 flex items-center gap-2 ${claim.status === 'approved'
                                                                        ? 'text-green-400'
                                                                        : 'text-red-400'
                                                                    }`}
                                                            >
                                                                <Shield size={16} />
                                                                Admin Response
                                                            </h4>
                                                            <p
                                                                className={`text-sm ${claim.status === 'approved'
                                                                        ? 'text-green-300'
                                                                        : 'text-red-300'
                                                                    }`}
                                                            >
                                                                {claim.adminRemarks}
                                                            </p>
                                                            {claim.reviewedAt && (
                                                                <p className="text-slate-500 text-xs mt-2">
                                                                    Reviewed on {formatDate(claim.reviewedAt)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* View Item Button */}
                                                    {claim.itemId?._id && (
                                                        <Link
                                                            to={`/item/${claim.itemId._id}`}
                                                            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                                                        >
                                                            View Full Item Details
                                                            <ChevronRight size={18} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
};

export default MyClaims;