import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Tag,
    User,
    Clock,
    AlertCircle,
    CheckCircle,
    Loader2,
    FileText,
} from 'lucide-react';

const ItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/v1/items/${id}`);
            setItem(res.data);
        } catch (error) {
            console.error('Failed to fetch item:', error);
            setError('Item not found');
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'resolved':
                return { icon: CheckCircle, color: 'text-green-400 bg-green-500/10', label: 'Resolved' };
            case 'matched':
                return { icon: AlertCircle, color: 'text-blue-400 bg-blue-500/10', label: 'Matched' };
            case 'submitted':
                return { icon: Clock, color: 'text-yellow-400 bg-yellow-500/10', label: 'Active' };
            default:
                return { icon: FileText, color: 'text-slate-400 bg-slate-500/10', label: status };
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

    if (error || !item) {
        return (
            <>
                <Sidebar />
                <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Item Not Found</h2>
                        <p className="text-slate-400 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/inventory')}
                            className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
                        >
                            Back to Inventory
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const statusInfo = getStatusInfo(item.status);
    const StatusIcon = statusInfo.icon;

    return (
        <>
            <Sidebar />
            <div className="min-h-screen bg-[#020617] p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>

                    {/* Main Card */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-lg text-sm font-medium uppercase ${item.submissionType === 'lost'
                                                ? 'bg-red-500/10 text-red-400'
                                                : 'bg-green-500/10 text-green-400'
                                            }`}>
                                            {item.submissionType}
                                        </span>
                                        <span className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${statusInfo.color}`}>
                                            <StatusIcon size={14} />
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-white">
                                        {item.itemAttributes?.category || 'Item'}
                                    </h1>
                                    <p className="text-slate-500 mt-1">
                                        Tracking ID: <code className="text-primary-400">{item.trackingId}</code>
                                    </p>
                                </div>

                                {/* Claim Button */}
                                {item.submissionType === 'found' && item.status !== 'resolved' && (
                                    <Link
                                        to={`/claim/${item._id}`}
                                        className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                                    >
                                        Claim This Item
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Left Column - Details */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                                        <p className="text-slate-300 leading-relaxed">
                                            {item.itemAttributes?.description || 'No description provided'}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-3">Attributes</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {item.itemAttributes?.color && (
                                                <div className="bg-slate-800/50 rounded-xl p-4">
                                                    <p className="text-slate-500 text-sm">Color</p>
                                                    <p className="text-white font-medium">{item.itemAttributes.color}</p>
                                                </div>
                                            )}
                                            {item.itemAttributes?.material && (
                                                <div className="bg-slate-800/50 rounded-xl p-4">
                                                    <p className="text-slate-500 text-sm">Material</p>
                                                    <p className="text-white font-medium">{item.itemAttributes.material}</p>
                                                </div>
                                            )}
                                            {item.itemAttributes?.size && (
                                                <div className="bg-slate-800/50 rounded-xl p-4">
                                                    <p className="text-slate-500 text-sm">Size</p>
                                                    <p className="text-white font-medium">{item.itemAttributes.size}</p>
                                                </div>
                                            )}
                                            <div className="bg-slate-800/50 rounded-xl p-4">
                                                <p className="text-slate-500 text-sm">Category</p>
                                                <p className="text-white font-medium">{item.itemAttributes?.category}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Meta */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-3">Location & Time</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-slate-300">
                                                <div className="p-2 bg-slate-800 rounded-lg">
                                                    <MapPin size={18} className="text-primary-400" />
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-sm">Location</p>
                                                    <p>{item.location?.zoneId?.zoneName || 'Campus'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-300">
                                                <div className="p-2 bg-slate-800 rounded-lg">
                                                    <Calendar size={18} className="text-primary-400" />
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-sm">Date {item.submissionType}</p>
                                                    <p>{new Date(item.timeMetadata?.lostOrFoundAt).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-300">
                                                <div className="p-2 bg-slate-800 rounded-lg">
                                                    <Clock size={18} className="text-primary-400" />
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-sm">Reported on</p>
                                                    <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submitter Info */}
                                    {!item.isAnonymous && item.submittedBy && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-3">Reported By</h3>
                                            <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-4">
                                                <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                                                    <User size={20} className="text-primary-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {item.submittedBy?.profile?.fullName || 'Anonymous'}
                                                    </p>
                                                    <p className="text-slate-500 text-sm">
                                                        {item.submittedBy?.profile?.affiliation || 'Campus Member'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {item.isAnonymous && (
                                        <div className="bg-slate-800/50 rounded-xl p-4 text-slate-400 text-sm">
                                            This item was reported anonymously
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ItemDetails;
