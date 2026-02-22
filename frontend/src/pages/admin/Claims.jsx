/**
 * @module pages/admin/Claims
 * @description Admin claims management page for reviewing ownership claims and item reports.
 */
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
    MoreHorizontal,
    Camera
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

const VIEW_TABS = [
    { value: 'claims', label: 'Ownership Claims' },
    { value: 'reports', label: 'Item Reports' },
];

const REPORT_FILTERS = [
    { value: 'pending', label: 'Pending Review' },
    { value: 'submitted', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

const ClaimsManagement = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [claims, setClaims] = useState([]);
    const [items, setItems] = useState([]);
    const [totalClaims, setTotalClaims] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState('all');
    const [reportFilter, setReportFilter] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedClaimId, setExpandedClaimId] = useState(null);
    const [expandedItemId, setExpandedItemId] = useState(null);
    const [decisionForm, setDecisionForm] = useState({ claimId: null, decision: '', remarks: '' });
    const [itemDecisionForm, setItemDecisionForm] = useState({ itemId: null, decision: '', remarks: '' });
    const [submittingDecision, setSubmittingDecision] = useState(false);
    const [activeTab, setActiveTab] = useState('reports'); // Default to reports tab

    const containerRef = useRef(null);
    const listRef = useRef(null);

    usePageTransition(containerRef);

    // Fetch claims
    useEffect(() => {
        if (activeTab !== 'claims') return;

        const fetchClaims = async () => {
            setLoading(true);
            setError('');
            try {
                const params = new URLSearchParams();
                if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
                params.append('limit', '50');

                const response = await api.get(`/v1/admin/claims?${params.toString()}`);
                console.log('API Response:', response.data);
                const data = response.data;

                if (data.claims) {
                    setClaims(data.claims);
                    setTotalClaims(data.total || data.claims.length);
                    console.log('Set claims from data.claims:', data.claims.length);
                } else if (Array.isArray(data)) {
                    setClaims(data);
                    setTotalClaims(data.length);
                    console.log('Set claims from array:', data.length);
                } else {
                    setClaims([]);
                    setTotalClaims(0);
                    console.warn('Unexpected data format:', data);
                }
            } catch (err) {
                console.error('Failed to fetch claims:', err);
                setError(err.response?.data?.error || 'Failed to load claims');
            } finally {
                setLoading(false);
            }
        };

        fetchClaims();
    }, [statusFilter, activeTab]);

    // Fetch pending item reports
    useEffect(() => {
        if (activeTab !== 'reports') return;

        const fetchItems = async () => {
            setLoading(true);
            setError('');
            try {
                const params = new URLSearchParams();
                params.append('status', reportFilter);
                params.append('limit', '50');

                const response = await api.get(`/v1/admin/items?${params.toString()}`);
                console.log('Items API Response:', response.data);
                const data = response.data;

                if (data.items) {
                    setItems(data.items);
                    setTotalItems(data.total || data.items.length);
                } else if (Array.isArray(data)) {
                    setItems(data);
                    setTotalItems(data.length);
                } else {
                    setItems([]);
                    setTotalItems(0);
                }
            } catch (err) {
                console.error('Failed to fetch items:', err);
                setError(err.response?.data?.error || 'Failed to load item reports');
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [reportFilter, activeTab]);

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

    const handleItemDecisionSubmit = async () => {
        if (!itemDecisionForm.decision) {
            setError('Please select a decision');
            return;
        }

        setSubmittingDecision(true);
        setError('');

        try {
            await api.put(`/v1/admin/items/${itemDecisionForm.itemId}/review`, {
                decision: itemDecisionForm.decision,
                remarks: itemDecisionForm.remarks.trim() || 'No remarks provided',
            });

            setSuccess(`Item report ${itemDecisionForm.decision} successfully`);
            setTimeout(() => setSuccess(''), 3000);

            setItems((prev) => prev.map((item) =>
                item._id === itemDecisionForm.itemId
                    ? { ...item, status: itemDecisionForm.decision === 'approved' ? 'submitted' : 'rejected', reviewedAt: new Date() }
                    : item
            ));

            // Remove the item from the list if we're viewing pending and it was just approved/rejected
            if (reportFilter === 'pending') {
                setItems((prev) => prev.filter((item) => item._id !== itemDecisionForm.itemId));
                setTotalItems((prev) => prev - 1);
            }

            setExpandedItemId(null);
            setItemDecisionForm({ itemId: null, decision: '', remarks: '' });
        } catch (err) {
            console.error('Failed to submit item decision:', err);
            setError(err.response?.data?.error || 'Failed to submit decision');
        } finally {
            setSubmittingDecision(false);
        }
    };

    const toggleExpandedItem = (itemId) => {
        if (expandedItemId === itemId) {
            setExpandedItemId(null);
            setItemDecisionForm({ itemId: null, decision: '', remarks: '' });
        } else {
            setExpandedItemId(itemId);
            setItemDecisionForm({ itemId, decision: '', remarks: '' });
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
            (claim.itemId?.trackingId || '').toLowerCase().includes(query) ||
            (claim.claimantId?.profile?.fullName || '').toLowerCase().includes(query) ||
            (claim.claimantId?.profile?.email || '').toLowerCase().includes(query)
        );
    });

    const filteredItems = items.filter((item) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            (item.trackingId || '').toLowerCase().includes(query) ||
            (item.itemAttributes?.category || '').toLowerCase().includes(query) ||
            (item.itemAttributes?.description || '').toLowerCase().includes(query) ||
            (item.submittedBy?.profile?.fullName || '').toLowerCase().includes(query)
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
                            <p className="text-slate-400 mt-1">Review, approve, or reject ownership claims and item reports</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-slate-300 font-mono text-sm flex items-center gap-2">
                                <Shield size={16} />
                                <span>{activeTab === 'claims' ? totalClaims : totalItems} Total</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Tabs */}
                    <div className="flex gap-2 mb-4 border-b border-slate-800 pb-4">
                        {VIEW_TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => {
                                    setActiveTab(tab.value);
                                    setSearchQuery('');
                                    setExpandedClaimId(null);
                                    setExpandedItemId(null);
                                }}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.value
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                {tab.label}
                                {tab.value === 'reports' && (
                                    <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={activeTab === 'claims' ? "Search by ID, Name, or Email..." : "Search by ID, Category, or Description..."}
                                className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {activeTab === 'claims' ? (
                                STATUS_FILTERS.map((filter) => (
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
                                ))
                            ) : (
                                REPORT_FILTERS.map((filter) => (
                                    <button
                                        key={filter.value}
                                        onClick={() => setReportFilter(filter.value)}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${reportFilter === filter.value
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))
                            )}
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
                            <p className="text-slate-500">Loading {activeTab === 'claims' ? 'claims' : 'item reports'}...</p>
                        </div>
                    ) : activeTab === 'reports' ? (
                        /* Item Reports View */
                        filteredItems.length === 0 ? (
                            <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Package size={40} className="text-slate-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No item reports found</h3>
                                <p className="text-slate-400">
                                    {reportFilter === 'pending'
                                        ? 'All item reports have been reviewed.'
                                        : 'Try adjusting your filters or search query.'}
                                </p>
                            </div>
                        ) : (
                            <div ref={listRef} className="space-y-4 max-w-5xl mx-auto">
                                {filteredItems.map((item) => {
                                    const isExpanded = expandedItemId === item._id;
                                    return (
                                        <div
                                            key={item._id}
                                            className={`claim-card bg-slate-900/40 backdrop-blur-sm border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-primary-500/50 shadow-2xl shadow-black/50 rounded-3xl my-6 bg-slate-900/80' : 'border-slate-800 rounded-2xl hover:border-slate-700 hover:bg-slate-800/40'
                                                }`}
                                        >
                                            {/* Item Header Row */}
                                            <div
                                                onClick={() => toggleExpandedItem(item._id)}
                                                className="p-5 cursor-pointer flex items-center gap-6"
                                            >
                                                <div className="flex-shrink-0">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                        item.status === 'submitted' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {item.status === 'pending' ? <Clock size={24} /> :
                                                            item.status === 'submitted' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                                    <div>
                                                        <p className="text-white font-bold truncate">{item.itemAttributes?.category || 'Unknown Category'}</p>
                                                        <p className="text-slate-500 text-xs font-mono mt-0.5">{item.trackingId}</p>
                                                    </div>
                                                    <div className="hidden md:block">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`px-2 py-1 rounded text-xs font-bold ${item.submissionType === 'lost' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                                {item.submissionType?.toUpperCase()}
                                                            </div>
                                                            <span className="text-slate-400 text-sm truncate">
                                                                {item.submittedBy?.profile?.fullName || (item.isAnonymous ? 'Anonymous' : 'Unknown')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-end gap-3">
                                                        <StatusBadge status={item.status === 'submitted' ? 'approved' : item.status} />
                                                        <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                            <ChevronDown size={20} className="text-slate-500" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Item Details */}
                                            {isExpanded && (
                                                <div id={`details-item-${item._id}`} className="border-t border-slate-800/50 bg-slate-950/30">
                                                    <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                                                        {/* Left: Info */}
                                                        <div className="space-y-6">
                                                            <div>
                                                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                    <Package size={16} /> Item Details
                                                                </h4>
                                                                <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 space-y-3">
                                                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                                                        <span className="text-slate-400 text-sm">Category</span>
                                                                        <span className="text-white text-sm font-medium">{item.itemAttributes?.category}</span>
                                                                    </div>
                                                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                                                        <span className="text-slate-400 text-sm">Description</span>
                                                                        <span className="text-white text-sm font-medium text-right max-w-[60%]">{item.itemAttributes?.description || 'N/A'}</span>
                                                                    </div>
                                                                    {item.itemAttributes?.color && (
                                                                        <div className="flex justify-between border-b border-slate-800 pb-2">
                                                                            <span className="text-slate-400 text-sm">Color</span>
                                                                            <span className="text-white text-sm">{item.itemAttributes.color}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                                                        <span className="text-slate-400 text-sm">Type</span>
                                                                        <span className={`text-sm font-bold ${item.submissionType === 'lost' ? 'text-red-400' : 'text-emerald-400'}`}>
                                                                            {item.submissionType?.toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                                                        <span className="text-slate-400 text-sm">Location/Zone</span>
                                                                        <span className="text-white text-sm">{item.location?.zoneId?.zoneName || 'Unknown'}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-400 text-sm">Reported Date</span>
                                                                        <span className="text-white text-sm">{new Date(item.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Images if any */}
                                                            {item.images && item.images.length > 0 && (
                                                                <div>
                                                                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                        <Camera size={16} /> Images
                                                                    </h4>
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        {item.images.map((img, idx) => (
                                                                            <img key={idx} src={img} alt={`Item ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-slate-700" />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Submitter Info */}
                                                            <div>
                                                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                    <User size={16} /> Submitted By
                                                                </h4>
                                                                <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
                                                                    {item.isAnonymous ? (
                                                                        <p className="text-slate-400">Anonymous submission</p>
                                                                    ) : (
                                                                        <div className="space-y-2">
                                                                            <p className="text-white font-medium">{item.submittedBy?.profile?.fullName || 'Unknown'}</p>
                                                                            <p className="text-slate-400 text-sm">{item.submittedBy?.profile?.email || ''}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right: Actions */}
                                                        <div className="flex flex-col h-full">
                                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                <Shield size={16} /> Admin Review
                                                            </h4>

                                                            <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 flex-1 flex flex-col">
                                                                {item.status === 'pending' ? (
                                                                    <div className="flex-1 flex flex-col gap-4">
                                                                        <div className="flex gap-3">
                                                                            <button
                                                                                onClick={() => setItemDecisionForm({ ...itemDecisionForm, decision: 'approved' })}
                                                                                className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2 ${itemDecisionForm.decision === 'approved'
                                                                                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                                                    : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'
                                                                                    }`}
                                                                            >
                                                                                <CheckCircle size={20} />
                                                                                Approve
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setItemDecisionForm({ ...itemDecisionForm, decision: 'rejected' })}
                                                                                className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2 ${itemDecisionForm.decision === 'rejected'
                                                                                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20'
                                                                                    : 'bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500/10'
                                                                                    }`}
                                                                            >
                                                                                <XCircle size={20} />
                                                                                Reject
                                                                            </button>
                                                                        </div>

                                                                        <div className="flex-1">
                                                                            <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Remarks (Optional)</label>
                                                                            <textarea
                                                                                value={itemDecisionForm.remarks}
                                                                                onChange={(e) => setItemDecisionForm({ ...itemDecisionForm, remarks: e.target.value })}
                                                                                placeholder="Enter optional remarks..."
                                                                                className="w-full h-full min-h-[100px] bg-slate-950 border border-slate-700/50 rounded-xl p-4 text-white focus:outline-none focus:border-primary-500 resize-none"
                                                                            />
                                                                        </div>

                                                                        <button
                                                                            onClick={handleItemDecisionSubmit}
                                                                            disabled={submittingDecision || !itemDecisionForm.decision}
                                                                            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                        >
                                                                            {submittingDecision ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Confirm Decision'}
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${item.status === 'submitted' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                                                            }`}>
                                                                            {item.status === 'submitted' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                                                                        </div>
                                                                        <h3 className="text-xl font-bold text-white capitalize mb-1">
                                                                            {item.status === 'submitted' ? 'Approved' : item.status}
                                                                        </h3>
                                                                        <p className="text-slate-500 text-sm mb-4">
                                                                            Reviewed on {item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : 'N/A'}
                                                                        </p>
                                                                        {item.adminNotes && (
                                                                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 w-full">
                                                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Admin Remarks</p>
                                                                                <p className="text-slate-300 text-sm italic">"{item.adminNotes}"</p>
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
                        )
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