import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Loader2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    User,
    Package,
    Calendar,
    Shield,
    Home,
    Users,
    Sliders,
    LogOut,
    X,
    MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const STATUS_FILTERS = [
    { value: 'all', label: 'All Claims' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'conflict', label: 'Conflicts' },
];

const ClaimsManagement = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Claims data
    const [claims, setClaims] = useState([]);
    const [totalClaims, setTotalClaims] = useState(0);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Expanded claim for review
    const [expandedClaimId, setExpandedClaimId] = useState(null);

    // Decision form
    const [decisionForm, setDecisionForm] = useState({
        claimId: null,
        decision: '',
        remarks: '',
    });
    const [submittingDecision, setSubmittingDecision] = useState(false);

    // Fetch claims
    useEffect(() => {
        const fetchClaims = async () => {
            setLoading(true);
            setError('');

            try {
                const params = new URLSearchParams();
                if (statusFilter && statusFilter !== 'all') {
                    params.append('status', statusFilter);
                }
                params.append('limit', '50');

                const response = await api.get(`/v1/admin/claims?${params.toString()}`);
                const data = response.data;

                if (data.claims) {
                    setClaims(data.claims);
                    setTotalClaims(data.total || data.claims.length);
                } else if (Array.isArray(data)) {
                    setClaims(data);
                    setTotalClaims(data.length);
                } else {
                    setClaims([]);
                    setTotalClaims(0);
                }
            } catch (err) {
                console.error('Failed to fetch claims:', err);
                setError(err.response?.data?.error || 'Failed to load claims');
            } finally {
                setLoading(false);
            }
        };

        fetchClaims();
    }, [statusFilter]);

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            navigate('/login');
        }
    };

    // Filter claims by search
    const filteredClaims = claims.filter((claim) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const trackingId = claim.itemId?.trackingId?.toLowerCase() || '';
        const claimantName = claim.claimantId?.profile?.fullName?.toLowerCase() || '';
        const claimantEmail = claim.claimantId?.profile?.email?.toLowerCase() || '';
        return trackingId.includes(query) || claimantName.includes(query) || claimantEmail.includes(query);
    });

    // Toggle expanded claim
    const toggleExpanded = (claimId) => {
        if (expandedClaimId === claimId) {
            setExpandedClaimId(null);
            setDecisionForm({ claimId: null, decision: '', remarks: '' });
        } else {
            setExpandedClaimId(claimId);
            setDecisionForm({ claimId, decision: '', remarks: '' });
        }
    };

    // Handle decision submission
    const handleDecisionSubmit = async () => {
        if (!decisionForm.decision || !decisionForm.remarks.trim()) {
            setError('Please select a decision and provide remarks');
            return;
        }

        setSubmittingDecision(true);
        setError('');

        try {
            await api.put(`/v1/admin/claims/${decisionForm.claimId}/decision`, {
                decision: decisionForm.decision,
                remarks: decisionForm.remarks.trim(),
            });

            setSuccess(`Claim ${decisionForm.decision} successfully`);
            setTimeout(() => setSuccess(''), 3000);

            // Update local state
            setClaims((prev) =>
                prev.map((claim) =>
                    claim._id === decisionForm.claimId
                        ? { ...claim, status: decisionForm.decision, resolvedAt: new Date() }
                        : claim
                )
            );

            // Reset form
            setExpandedClaimId(null);
            setDecisionForm({ claimId: null, decision: '', remarks: '' });
        } catch (err) {
            console.error('Failed to submit decision:', err);
            setError(err.response?.data?.error || 'Failed to submit decision');
        } finally {
            setSubmittingDecision(false);
        }
    };

    // Get status badge style
    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return {
                    bg: 'bg-green-500/20',
                    text: 'text-green-400',
                    border: 'border-green-500/30',
                    icon: CheckCircle,
                };
            case 'rejected':
                return {
                    bg: 'bg-red-500/20',
                    text: 'text-red-400',
                    border: 'border-red-500/30',
                    icon: XCircle,
                };
            case 'pending':
                return {
                    bg: 'bg-yellow-500/20',
                    text: 'text-yellow-400',
                    border: 'border-yellow-500/30',
                    icon: Clock,
                };
            case 'conflict':
                return {
                    bg: 'bg-orange-500/20',
                    text: 'text-orange-400',
                    border: 'border-orange-500/30',
                    icon: AlertTriangle,
                };
            case 'withdrawn':
                return {
                    bg: 'bg-slate-500/20',
                    text: 'text-slate-400',
                    border: 'border-slate-500/30',
                    icon: X,
                };
            default:
                return {
                    bg: 'bg-slate-500/20',
                    text: 'text-slate-400',
                    border: 'border-slate-500/30',
                    icon: Clock,
                };
        }
    };

    // Get confidence tier badge
    const getConfidenceBadge = (tier) => {
        switch (tier) {
            case 'full':
                return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'High Confidence' };
            case 'partial':
                return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Partial Match' };
            case 'low':
                return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Low Confidence' };
            default:
                return { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Unknown' };
        }
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

    // Sidebar items
    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/admin' },
        { icon: FileText, label: 'Claims', path: '/admin/claims', active: true },
        { icon: Users, label: 'User Management', path: '/admin/roles' },
        { icon: Sliders, label: 'AI Configuration', path: '/admin/ai-config' },
    ];

    // Count pending claims
    const pendingCount = claims.filter((c) => c.status === 'pending').length;

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <Link to="/admin" className="flex items-center gap-2">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Shield size={24} className="text-yellow-500" />
                        </div>
                        <span className="text-xl font-bold text-white">Admin Panel</span>
                    </Link>
                </div>

                {/* Admin Info */}
                <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                            <Shield size={20} className="text-yellow-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{user?.fullName || 'Admin'}</p>
                            <p className="text-yellow-400 text-xs truncate capitalize">
                                {user?.role?.replace('_', ' ') || 'Administrator'}
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
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                item.active
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <item.icon size={20} />
                            <span className="flex-1">{item.label}</span>
                            {item.label === 'Claims' && pendingCount > 0 && (
                                <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full">
                                    {pendingCount}
                                </span>
                            )}
                        </Link>
                    ))}

                    <div className="my-4 border-t border-slate-800" />

                    <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <Home size={20} />
                        <span>User Dashboard</span>
                    </Link>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
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
                    <h1 className="text-2xl font-bold text-white">Claims Management</h1>
                    <p className="text-slate-400 text-sm mt-1">Review and process ownership claims</p>
                </header>

                {/* Content */}
                <div className="p-8">
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

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search
                                size={20}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by tracking ID or claimant..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2 flex-wrap">
                            {STATUS_FILTERS.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setStatusFilter(filter.value)}
                                    className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                                        statusFilter === filter.value
                                            ? 'bg-yellow-500 text-black'
                                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mb-4 text-slate-400 text-sm">
                        Showing {filteredClaims.length} of {totalClaims} claims
                    </div>

                    {/* Claims List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={40} className="animate-spin text-yellow-500" />
                        </div>
                    ) : filteredClaims.length === 0 ? (
                        <div className="text-center py-20">
                            <FileText size={60} className="mx-auto text-slate-600 mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No claims found</h3>
                            <p className="text-slate-400">
                                {statusFilter !== 'all'
                                    ? `No ${statusFilter} claims at the moment`
                                    : 'No claims have been submitted yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredClaims.map((claim) => {
                                const statusStyle = getStatusBadge(claim.status);
                                const confidenceStyle = getConfidenceBadge(claim.confidenceTier);
                                const isExpanded = expandedClaimId === claim._id;
                                const StatusIcon = statusStyle.icon;

                                return (
                                    <div
                                        key={claim._id}
                                        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
                                    >
                                        {/* Claim Header */}
                                        <div
                                            className="p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                                            onClick={() => toggleExpanded(claim._id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Status Icon */}
                                                <div className={`p-3 rounded-xl ${statusStyle.bg}`}>
                                                    <StatusIcon size={24} className={statusStyle.text} />
                                                </div>

                                                {/* Claim Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span
                                                            className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                                        >
                                                            {claim.status?.toUpperCase()}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 text-xs font-medium rounded-full ${confidenceStyle.bg} ${confidenceStyle.text}`}
                                                        >
                                                            {confidenceStyle.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-white font-medium mt-1">
                                                        {claim.itemId?.trackingId || 'Unknown Item'}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <User size={14} />
                                                            {claim.claimantId?.profile?.fullName ||
                                                                claim.claimantId?.profile?.email ||
                                                                'Unknown'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            {formatDate(claim.submittedAt)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Expand Icon */}
                                                <div className="text-slate-400">
                                                    {isExpanded ? (
                                                        <ChevronUp size={24} />
                                                    ) : (
                                                        <ChevronDown size={24} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="border-t border-slate-800 p-4 bg-slate-800/30">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Item Details */}
                                                    <div>
                                                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                                            <Package size={18} className="text-primary-400" />
                                                            Item Details
                                                        </h4>
                                                        <div className="bg-slate-900 rounded-lg p-4 space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-400">Tracking ID</span>
                                                                <span className="text-white font-mono">
                                                                    {claim.itemId?.trackingId || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-400">Category</span>
                                                                <span className="text-white">
                                                                    {claim.itemId?.itemAttributes?.category || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-400">Type</span>
                                                                <span className="text-white capitalize">
                                                                    {claim.itemId?.submissionType || 'N/A'}
                                                                </span>
                                                            </div>
                                                            {claim.itemId?.itemAttributes?.description && (
                                                                <div className="pt-2 border-t border-slate-800">
                                                                    <span className="text-slate-400 block mb-1">
                                                                        Description
                                                                    </span>
                                                                    <span className="text-white text-xs">
                                                                        {claim.itemId.itemAttributes.description}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Claimant Details */}
                                                    <div>
                                                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                                            <User size={18} className="text-blue-400" />
                                                            Claimant Details
                                                        </h4>
                                                        <div className="bg-slate-900 rounded-lg p-4 space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-400">Name</span>
                                                                <span className="text-white">
                                                                    {claim.claimantId?.profile?.fullName || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-400">Email</span>
                                                                <span className="text-white">
                                                                    {claim.claimantId?.profile?.email || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-400">Role</span>
                                                                <span className="text-white capitalize">
                                                                    {claim.claimantId?.role || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-400">Proof Score</span>
                                                                <span className="text-white">
                                                                    {claim.proofScore || 0}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Ownership Proofs */}
                                                {claim.ownershipProofs && claim.ownershipProofs.length > 0 && (
                                                    <div className="mt-4">
                                                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                                            <MessageSquare size={18} className="text-green-400" />
                                                            Ownership Proofs ({claim.ownershipProofs.length})
                                                        </h4>
                                                        <div className="bg-slate-900 rounded-lg p-4 space-y-2">
                                                            {claim.ownershipProofs.map((proof, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="p-3 bg-slate-800 rounded-lg text-sm text-slate-300"
                                                                >
                                                                    <span className="text-slate-500 text-xs">
                                                                        Proof #{index + 1}:
                                                                    </span>
                                                                    <p className="mt-1">{proof}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Decision Form (only for pending claims) */}
                                                {claim.status === 'pending' && (
                                                    <div className="mt-6 pt-4 border-t border-slate-700">
                                                        <h4 className="text-white font-medium mb-4">Make Decision</h4>

                                                        {/* Decision Buttons */}
                                                        <div className="flex gap-3 mb-4">
                                                            <button
                                                                onClick={() =>
                                                                    setDecisionForm((prev) => ({
                                                                        ...prev,
                                                                        decision: 'approved',
                                                                    }))
                                                                }
                                                                className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                                                                    decisionForm.decision === 'approved'
                                                                        ? 'bg-green-500 text-white'
                                                                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                                }`}
                                                            >
                                                                <CheckCircle size={20} />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    setDecisionForm((prev) => ({
                                                                        ...prev,
                                                                        decision: 'rejected',
                                                                    }))
                                                                }
                                                                className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                                                                    decisionForm.decision === 'rejected'
                                                                        ? 'bg-red-500 text-white'
                                                                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                                }`}
                                                            >
                                                                <XCircle size={20} />
                                                                Reject
                                                            </button>
                                                        </div>

                                                        {/* Remarks */}
                                                        <div className="mb-4">
                                                            <label className="block text-slate-400 text-sm mb-2">
                                                                Remarks *
                                                            </label>
                                                            <textarea
                                                                value={decisionForm.remarks}
                                                                onChange={(e) =>
                                                                    setDecisionForm((prev) => ({
                                                                        ...prev,
                                                                        remarks: e.target.value,
                                                                    }))
                                                                }
                                                                placeholder="Provide reason for your decision..."
                                                                rows={3}
                                                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 resize-none"
                                                            />
                                                        </div>

                                                        {/* Submit Decision */}
                                                        <button
                                                            onClick={handleDecisionSubmit}
                                                            disabled={
                                                                submittingDecision ||
                                                                !decisionForm.decision ||
                                                                !decisionForm.remarks.trim()
                                                            }
                                                            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500/50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            {submittingDecision ? (
                                                                <>
                                                                    <Loader2 size={20} className="animate-spin" />
                                                                    Submitting...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Shield size={20} />
                                                                    Submit Decision
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Already resolved info */}
                                                {claim.status !== 'pending' && claim.resolvedAt && (
                                                    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                                                        <p className="text-slate-400 text-sm">
                                                            Resolved on {formatDate(claim.resolvedAt)}
                                                            {claim.adminNotes && (
                                                                <span className="block mt-2 text-slate-300">
                                                                    Notes: {claim.adminNotes}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ClaimsManagement;