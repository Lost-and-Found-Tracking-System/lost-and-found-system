import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
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
    X,
    MessageSquare,
    Shield,
    Check,
    MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { usePageTransition, useMagneticHover } from '../../hooks/useGSAPAnimations';

const STATUS_FILTERS = [
    { value: 'all', label: 'All Claims' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'conflict', label: 'Conflicts' },
];

const ClaimsManagement = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [claims, setClaims] = useState([]);
    const [totalClaims, setTotalClaims] = useState(0);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedClaimId, setExpandedClaimId] = useState(null);
    const [decisionForm, setDecisionForm] = useState({ claimId: null, decision: '', remarks: '' });
    const [submittingDecision, setSubmittingDecision] = useState(false);

    const containerRef = useRef(null);
    const listRef = useRef(null);

    usePageTransition(containerRef);

    useEffect(() => {
        const fetchClaims = async () => {
            setLoading(true);
            setError('');
            try {
                const params = new URLSearchParams();
                if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
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

    // Animation for list items when they change
    useEffect(() => {
        if (!loading && listRef.current) {
            const ctx = gsap.context(() => {
                gsap.fromTo('.claim-card',
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
                );
            }, listRef.current);
            return () => ctx.revert();
        }
    }, [loading, claims]);

    // Handle expand animation
    const toggleExpanded = (claimId) => {
        if (expandedClaimId === claimId) {
            // Closing
            const el = document.getElementById(`details-${claimId}`);
            if (el) {
                gsap.to(el, { height: 0, opacity: 0, duration: 0.3, onComplete: () => setExpandedClaimId(null) });
            } else {
                setExpandedClaimId(null);
            }
            setDecisionForm({ claimId: null, decision: '', remarks: '' });
        } else {
            setExpandedClaimId(claimId);
            setDecisionForm({ claimId, decision: '', remarks: '' });
            // Animation handled by Effect or inline if needed, but standard React render is fine for open
        }
    };

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

            setClaims((prev) => prev.map((claim) =>
                claim._id === decisionForm.claimId
                    ? { ...claim, status: decisionForm.decision, resolvedAt: new Date() }
                    : claim
            ));

            setExpandedClaimId(null);
            setDecisionForm({ claimId: null, decision: '', remarks: '' });
        } catch (err) {
            console.error('Failed to submit decision:', err);
            setError(err.response?.data?.error || 'Failed to submit decision');
        } finally {
            setSubmittingDecision(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const config = {
            approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: CheckCircle },
            rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: XCircle },
            pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: Clock },
            conflict: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', icon: AlertTriangle },
            withdrawn: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', icon: X }
        };
        const style = config[status] || config.pending;
        const Icon = style.icon;

        return (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${style.bg} ${style.border}`}>
                <Icon size={14} className={style.text} />
                <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>{status}</span>
            </div>
        );
    };

    const filteredClaims = claims.filter((claim) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            claim.itemId?.trackingId?.toLowerCase().includes(query) ||
            claim.claimantId?.profile?.fullName?.toLowerCase().includes(query) ||
            claim.claimantId?.profile?.email?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="flex bg-[#020617] min-h-screen">
            <AdminSidebar />
            <div ref={containerRef} className="flex-1 overflow-hidden flex flex-col h-screen">
                {/* Header */}
                <div className="p-8 pb-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-black text-white">Claims Management</h1>
                            <p className="text-slate-400 mt-1">Review, approve, or reject ownership claims</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-slate-300 font-mono text-sm flex items-center gap-2">
                                <Shield size={16} />
                                <span>{totalClaims} Total</span>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by ID, Name, or Email..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {STATUS_FILTERS.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setStatusFilter(filter.value)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${statusFilter === filter.value
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 flex items-center gap-3 animate-pulse">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-300 flex items-center gap-3">
                            <CheckCircle size={20} />
                            {success}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 size={48} className="text-primary-500 animate-spin mb-4" />
                            <p className="text-slate-500">Loading claims...</p>
                        </div>
                    ) : filteredClaims.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText size={40} className="text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No claims found</h3>
                            <p className="text-slate-400">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        <div ref={listRef} className="space-y-4 max-w-5xl mx-auto">
                            {filteredClaims.map((claim) => {
                                const isExpanded = expandedClaimId === claim._id;
                                return (
                                    <div
                                        key={claim._id}
                                        className={`claim-card bg-slate-900/40 backdrop-blur-sm border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-primary-500/50 shadow-2xl shadow-black/50 rounded-3xl my-6 bg-slate-900/80' : 'border-slate-800 rounded-2xl hover:border-slate-700 hover:bg-slate-800/40'
                                            }`}
                                    >
                                        {/* Simplified Header Row */}
                                        <div
                                            onClick={() => toggleExpanded(claim._id)}
                                            className="p-5 cursor-pointer flex items-center gap-6"
                                        >
                                            <div className="flex-shrink-0">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${claim.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                        claim.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'
                                                    }`}>
                                                    {claim.status === 'pending' ? <Clock size={24} /> :
                                                        claim.status === 'approved' ? <CheckCircle size={24} /> : <FileText size={24} />}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                                <div>
                                                    <p className="text-white font-bold truncate">{claim.itemId?.itemAttributes?.category || 'Unknown Item'}</p>
                                                    <p className="text-slate-500 text-xs font-mono mt-0.5">{claim.itemId?.trackingId}</p>
                                                </div>
                                                <div className="hidden md:block">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                                                            <User size={12} />
                                                        </div>
                                                        <span className="text-slate-300 text-sm truncate">{claim.claimantId?.profile?.fullName || 'Unknown User'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-end gap-3">
                                                    <StatusBadge status={claim.status} />
                                                    <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                        <ChevronDown size={20} className="text-slate-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div id={`details-${claim._id}`} className="border-t border-slate-800/50 bg-slate-950/30">
                                                <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                                                    {/* Left: Info */}
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                <Package size={16} /> Item Details
                                                            </h4>
                                                            <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 space-y-3">
                                                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                                                    <span className="text-slate-400 text-sm">Description</span>
                                                                    <span className="text-white text-sm font-medium text-right max-w-[60%]">{claim.itemId?.itemAttributes?.description || 'N/A'}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-400 text-sm">Reported Date</span>
                                                                    <span className="text-white text-sm">{new Date(claim.submittedAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center pt-2">
                                                                    <span className="text-slate-400 text-sm">Confidence Match</span>
                                                                    <div className={`px-2 py-1 rounded text-xs font-bold ${claim.confidenceTier === 'full' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                                                        }`}>
                                                                        {claim.confidenceTier?.toUpperCase() || 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                <MessageSquare size={16} /> Proof of Ownership
                                                            </h4>
                                                            <div className="space-y-3">
                                                                {claim.ownershipProofs?.map((proof, idx) => (
                                                                    <div key={idx} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                                                                        <span className="text-primary-400 text-xs font-bold mb-1 block">Proof #{idx + 1}</span>
                                                                        <p className="text-slate-300 text-sm leading-relaxed">{proof}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right: Actions */}
                                                    <div className="flex flex-col h-full">
                                                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                            <Shield size={16} /> Admin Decision
                                                        </h4>

                                                        <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 flex-1 flex flex-col">
                                                            {claim.status === 'pending' ? (
                                                                <div className="flex-1 flex flex-col gap-4">
                                                                    <div className="flex gap-3">
                                                                        <button
                                                                            onClick={() => setDecisionForm({ ...decisionForm, decision: 'approved' })}
                                                                            className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2 ${decisionForm.decision === 'approved'
                                                                                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                                                    : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'
                                                                                }`}
                                                                        >
                                                                            <CheckCircle size={20} />
                                                                            Approve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setDecisionForm({ ...decisionForm, decision: 'rejected' })}
                                                                            className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2 ${decisionForm.decision === 'rejected'
                                                                                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20'
                                                                                    : 'bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500/10'
                                                                                }`}
                                                                        >
                                                                            <XCircle size={20} />
                                                                            Reject
                                                                        </button>
                                                                    </div>

                                                                    <div className="flex-1">
                                                                        <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Remarks / Reason</label>
                                                                        <textarea
                                                                            value={decisionForm.remarks}
                                                                            onChange={(e) => setDecisionForm({ ...decisionForm, remarks: e.target.value })}
                                                                            placeholder="Enter required remarks..."
                                                                            className="w-full h-full min-h-[100px] bg-slate-950 border border-slate-700/50 rounded-xl p-4 text-white focus:outline-none focus:border-primary-500 resize-none"
                                                                        />
                                                                    </div>

                                                                    <button
                                                                        onClick={handleDecisionSubmit}
                                                                        disabled={submittingDecision || !decisionForm.decision || !decisionForm.remarks.trim()}
                                                                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                    >
                                                                        {submittingDecision ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Confirm Decision'}
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${claim.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                                                        }`}>
                                                                        {claim.status === 'approved' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                                                                    </div>
                                                                    <h3 className="text-xl font-bold text-white capitalize mb-1">{claim.status}</h3>
                                                                    <p className="text-slate-500 text-sm mb-4">
                                                                        Resolved on {new Date(claim.resolvedAt).toLocaleDateString()}
                                                                    </p>
                                                                    {claim.adminNotes && (
                                                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 w-full">
                                                                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Admin Remarks</p>
                                                                            <p className="text-slate-300 text-sm italic">"{claim.adminNotes}"</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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

export default ClaimsManagement;