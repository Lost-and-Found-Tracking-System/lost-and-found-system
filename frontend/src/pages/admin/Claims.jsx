import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
    ArrowLeft,
    Check,
    X,
    Loader2,
    FileText,
    User,
    AlertCircle,
    Filter,
} from 'lucide-react';

const AdminClaims = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [filter, setFilter] = useState('pending');
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        fetchClaims();
    }, [filter]);

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? `?status=${filter}` : '';
            const res = await api.get(`/v1/admin/claims${params}`);
            setClaims(res.data.claims || []);
        } catch (error) {
            console.error('Failed to fetch claims:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async (claimId, decision) => {
        if (!remarks.trim()) {
            alert('Please provide remarks for your decision');
            return;
        }

        setProcessing(claimId);
        try {
            await api.put(`/v1/admin/claims/${claimId}/decision`, {
                decision,
                remarks,
            });
            
            // Update local state
            setClaims(claims.map(c => 
                c._id === claimId ? { ...c, status: decision } : c
            ));
            setSelectedClaim(null);
            setRemarks('');
        } catch (error) {
            console.error('Failed to process claim:', error);
            alert('Failed to process claim');
        } finally {
            setProcessing(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-500/10 text-green-400 border-green-500/30';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case 'conflict': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    const getConfidenceColor = (tier) => {
        switch (tier) {
            case 'full': return 'text-green-400';
            case 'partial': return 'text-yellow-400';
            case 'low': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link
                            to="/admin"
                            className="flex items-center gap-2 text-slate-400 hover:text-white mb-2 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Back to Admin
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Claims Management</h1>
                        <p className="text-slate-400 mt-1">Review and process ownership claims</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {['all', 'pending', 'approved', 'rejected', 'conflict'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                                filter === f
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Claims List */}
                {claims.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No claims found</h3>
                        <p className="text-slate-400">No claims matching your filter</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {claims.map((claim) => (
                            <div
                                key={claim._id}
                                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(claim.status)}`}>
                                                {claim.status}
                                            </span>
                                            <span className={`text-sm ${getConfidenceColor(claim.confidenceTier)}`}>
                                                Confidence: {claim.confidenceTier}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-white mb-2">
                                            Claim for: {claim.itemId?.trackingId || 'Item'}
                                        </h3>

                                        <div className="flex items-center gap-4 text-slate-400 text-sm mb-4">
                                            <div className="flex items-center gap-1">
                                                <User size={14} />
                                                {claim.claimantId?.profile?.fullName || 'Unknown'}
                                            </div>
                                            <span>•</span>
                                            <span>{new Date(claim.submittedAt).toLocaleDateString()}</span>
                                        </div>

                                        {/* Ownership Proofs */}
                                        <div className="mb-4">
                                            <p className="text-slate-400 text-sm mb-2">Ownership Proofs:</p>
                                            <div className="space-y-2">
                                                {claim.ownershipProofs?.map((proof, index) => (
                                                    <div key={index} className="p-3 bg-slate-800/50 rounded-lg text-slate-300 text-sm">
                                                        {proof}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {claim.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedClaim(claim._id)}
                                                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                                            >
                                                Review
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Decision Form */}
                                {selectedClaim === claim._id && (
                                    <div className="mt-4 pt-4 border-t border-slate-800">
                                        <textarea
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            placeholder="Enter your remarks for this decision..."
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 resize-none mb-4"
                                            rows={3}
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleDecision(claim._id, 'approved')}
                                                disabled={processing === claim._id}
                                                className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {processing === claim._id ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <Check size={18} />
                                                )}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleDecision(claim._id, 'rejected')}
                                                disabled={processing === claim._id}
                                                className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {processing === claim._id ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <X size={18} />
                                                )}
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedClaim(null);
                                                    setRemarks('');
                                                }}
                                                className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminClaims;
