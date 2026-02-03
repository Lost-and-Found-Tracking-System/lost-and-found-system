import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import {
    ArrowLeft,
    Upload,
    FileText,
    Check,
    Loader2,
    AlertCircle,
} from 'lucide-react';

const SubmitClaim = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [proofs, setProofs] = useState(['']);

    useEffect(() => {
        fetchItem();
    }, [itemId]);

    const fetchItem = async () => {
        try {
            const res = await api.get(`/v1/items/${itemId}`);
            setItem(res.data);
        } catch (error) {
            console.error('Failed to fetch item:', error);
            setError('Item not found');
        } finally {
            setLoading(false);
        }
    };

    const addProof = () => {
        setProofs([...proofs, '']);
    };

    const updateProof = (index, value) => {
        const newProofs = [...proofs];
        newProofs[index] = value;
        setProofs(newProofs);
    };

    const removeProof = (index) => {
        if (proofs.length > 1) {
            setProofs(proofs.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validProofs = proofs.filter(p => p.trim());
        if (validProofs.length === 0) {
            setError('Please provide at least one proof of ownership');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/v1/claims', {
                itemId,
                ownershipProofs: validProofs,
            });
            setSuccess(true);
        } catch (error) {
            console.error('Failed to submit claim:', error);
            setError(error.response?.data?.error || 'Failed to submit claim');
        } finally {
            setSubmitting(false);
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

    if (success) {
        return (
            <>
                <Sidebar />
                <div className="min-h-screen bg-[#020617] flex items-center justify-center p-8">
                    <div className="max-w-md text-center">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Claim Submitted!</h2>
                        <p className="text-slate-400 mb-6">
                            Your claim has been submitted successfully. An administrator will review your claim and contact you soon.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/inventory')}
                                className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                            >
                                Browse More Items
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Sidebar />
            <div className="min-h-screen bg-[#020617] p-8">
                <div className="max-w-2xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">Submit a Claim</h1>
                        <p className="text-slate-400 mt-1">Provide proof of ownership to claim this item</p>
                    </div>

                    {/* Item Preview */}
                    {item && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Claiming Item</h3>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-800 rounded-xl">
                                    <FileText className="w-6 h-6 text-primary-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">{item.itemAttributes?.category}</p>
                                    <p className="text-slate-500 text-sm">{item.trackingId}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Claim Form */}
                    <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Proof of Ownership</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Describe how you can prove this item belongs to you. Include details like distinguishing features,
                            purchase receipts, photos, serial numbers, or any other evidence.
                        </p>

                        {/* Proof Inputs */}
                        <div className="space-y-4 mb-6">
                            {proofs.map((proof, index) => (
                                <div key={index} className="flex gap-2">
                                    <textarea
                                        value={proof}
                                        onChange={(e) => updateProof(index, e.target.value)}
                                        placeholder={`Proof ${index + 1}: Describe your evidence...`}
                                        className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 resize-none"
                                        rows={3}
                                    />
                                    {proofs.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeProof(index)}
                                            className="px-3 text-red-400 hover:text-red-300"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addProof}
                            className="w-full py-3 border border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-colors mb-6"
                        >
                            + Add Another Proof
                        </button>

                        {/* Error */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-2">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:bg-primary-500/50 transition-colors flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Upload size={20} />
                                    Submit Claim
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SubmitClaim;
