/**
 * PREMIUM MY CLAIMS PAGE
 * With advanced effects from CodePen inspirations
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { gsap } from 'gsap';
import {
    FileText,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    Filter,
    ChevronDown,
    Calendar,
    MapPin
} from 'lucide-react';
import {
    MorphingBlob,
    GlitchText,
    TiltCard,
    GradientBorderCard,
    ElasticButton,
    PulseRings,
    HolographicCard
} from '../effects';

const MyClaims = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
    const containerRef = useRef(null);

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            const res = await api.get('/v1/claims/my-claims');
            setClaims(res.data.claims || res.data || []);
        } catch (error) {
            console.error('Failed to fetch claims:', error);
        } finally {
            setLoading(false);
        }
    };

    // GSAP animations
    useEffect(() => {
        if (loading) return;

        const ctx = gsap.context(() => {
            gsap.fromTo('.claims-header',
                { y: -40, opacity: 0, filter: 'blur(10px)' },
                { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }
            );

            gsap.fromTo('.claim-card',
                { y: 60, opacity: 0, scale: 0.95, rotateX: 10 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotateX: 0,
                    duration: 0.7,
                    stagger: 0.1,
                    delay: 0.2,
                    ease: 'power4.out'
                }
            );

            gsap.fromTo('.filter-pill',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.3, ease: 'back.out(2)' }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [loading, claims]);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return {
                    icon: Clock,
                    color: '#f59e0b',
                    bg: 'bg-amber-500/20',
                    border: 'border-amber-500/30',
                    text: 'text-amber-400',
                    label: 'Pending Review'
                };
            case 'approved':
                return {
                    icon: CheckCircle,
                    color: '#10b981',
                    bg: 'bg-emerald-500/20',
                    border: 'border-emerald-500/30',
                    text: 'text-emerald-400',
                    label: 'Approved'
                };
            case 'rejected':
                return {
                    icon: XCircle,
                    color: '#ef4444',
                    bg: 'bg-red-500/20',
                    border: 'border-red-500/30',
                    text: 'text-red-400',
                    label: 'Rejected'
                };
            default:
                return {
                    icon: AlertCircle,
                    color: '#64748b',
                    bg: 'bg-slate-500/20',
                    border: 'border-slate-500/30',
                    text: 'text-slate-400',
                    label: 'Unknown'
                };
        }
    };

    const filteredClaims = claims.filter(c => {
        if (filter === 'all') return true;
        return c.status === filter;
    });

    const statusCounts = {
        all: claims.length,
        pending: claims.filter(c => c.status === 'pending').length,
        approved: claims.filter(c => c.status === 'approved').length,
        rejected: claims.filter(c => c.status === 'rejected').length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="relative">
                    <PulseRings size={100} color="#8b5cf6" />
                    <FileText className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-400" size={32} />
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-[#030712] text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4">
                    <MorphingBlob color1="#8b5cf6" color2="#ec4899" size={500} />
                </div>
                <div className="absolute bottom-1/4 right-1/4">
                    <MorphingBlob color1="#0ea5e9" color2="#8b5cf6" size={400} />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <Sidebar />

            <main className="pl-4 md:pl-8 pr-4 md:pr-8 py-8 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="claims-header mb-8">
                        <h1 className="text-4xl md:text-5xl font-black mb-2">
                            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                                My Claims
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg">
                            <GlitchText text={`Track ${claims.length} claim${claims.length !== 1 ? 's' : ''} you've submitted`} />
                        </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        {[
                            { id: 'all', label: 'All Claims', color: 'from-primary-600 to-indigo-600' },
                            { id: 'pending', label: 'Pending', color: 'from-amber-500 to-orange-500' },
                            { id: 'approved', label: 'Approved', color: 'from-emerald-500 to-teal-500' },
                            { id: 'rejected', label: 'Rejected', color: 'from-red-500 to-rose-500' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`filter-pill px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${filter === f.id
                                        ? `bg-gradient-to-r ${f.color} text-white shadow-lg`
                                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
                                    }`}
                            >
                                {f.label}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${filter === f.id ? 'bg-white/20' : 'bg-slate-700'
                                    }`}>
                                    {statusCounts[f.id]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Claims List */}
                    {filteredClaims.length > 0 ? (
                        <div className="grid gap-6" style={{ perspective: 1000 }}>
                            {filteredClaims.map((claim) => {
                                const status = getStatusConfig(claim.status);
                                const StatusIcon = status.icon;

                                return (
                                    <TiltCard key={claim._id} className="claim-card" intensity={0.15}>
                                        <HolographicCard>
                                            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl">
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    {/* Item Image */}
                                                    <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                                                        {claim.item?.images?.[0] ? (
                                                            <img
                                                                src={claim.item.images[0]}
                                                                alt={claim.item.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package size={48} className="text-slate-600" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between gap-4 mb-4">
                                                            <div>
                                                                <h3 className="text-2xl font-bold text-white mb-2">
                                                                    {claim.item?.title || 'Claimed Item'}
                                                                </h3>
                                                                <p className="text-slate-400 line-clamp-2">
                                                                    {claim.item?.description || 'No description available'}
                                                                </p>
                                                            </div>

                                                            {/* Status Badge */}
                                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.bg} ${status.border} border`}>
                                                                <StatusIcon size={16} style={{ color: status.color }} />
                                                                <span className={`text-sm font-bold ${status.text}`}>
                                                                    {status.label}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Meta Info */}
                                                        <div className="flex flex-wrap items-center gap-6 mb-4 text-sm text-slate-400">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={16} className="text-violet-400" />
                                                                <span>Claimed: {new Date(claim.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            {claim.item?.location?.zone && (
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin size={16} className="text-cyan-400" />
                                                                    <span>{claim.item.location.zone}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Proofs Preview */}
                                                        {claim.ownershipProofs?.length > 0 && (
                                                            <div className="mb-4">
                                                                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Submitted Proofs:</p>
                                                                <p className="text-slate-300 text-sm line-clamp-2">
                                                                    {claim.ownershipProofs.join(' • ')}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-3">
                                                            <Link to={`/items/${claim.item?._id}`}>
                                                                <ElasticButton className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 flex items-center gap-2 transition-all">
                                                                    <Eye size={16} />
                                                                    View Item
                                                                </ElasticButton>
                                                            </Link>

                                                            {claim.status === 'approved' && (
                                                                <span className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                                                                    <CheckCircle size={16} />
                                                                    Contact admin for pickup
                                                                </span>
                                                            )}

                                                            {claim.status === 'rejected' && claim.rejectionReason && (
                                                                <span className="text-red-400 text-sm">
                                                                    Reason: {claim.rejectionReason}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </HolographicCard>
                                    </TiltCard>
                                );
                            })}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-20">
                            <div className="inline-flex p-6 bg-slate-800/30 rounded-3xl mb-6">
                                <FileText size={64} className="text-slate-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">No claims found</h2>
                            <p className="text-slate-400 mb-6 max-w-md mx-auto">
                                {filter !== 'all'
                                    ? `You don't have any ${filter} claims.`
                                    : 'You haven\'t submitted any claims yet. Browse items to make your first claim.'}
                            </p>
                            <Link to="/inventory">
                                <ElasticButton className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-bold">
                                    Browse Items
                                </ElasticButton>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyClaims;