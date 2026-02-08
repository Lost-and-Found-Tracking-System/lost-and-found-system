/**
 * PREMIUM ITEM DETAILS PAGE
 * With advanced effects from CodePen inspirations
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { gsap } from 'gsap';
import {
    Package,
    MapPin,
    Calendar,
    Tag,
    User,
    Clock,
    ArrowLeft,
    FileText,
    MessageCircle,
    AlertTriangle,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Share2,
    Flag,
    Sparkles,
    Eye,
    Zap
} from 'lucide-react';
import {
    MorphingBlob,
    GlitchText,
    NeonText,
    TiltCard,
    GradientBorderCard,
    ElasticButton,
    PulseRings,
    ParticleExplosion,
    HolographicCard,
    RippleButton
} from '../effects';

const ItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState(0);
    const [error, setError] = useState('');

    const containerRef = useRef(null);
    const imageRef = useRef(null);

    // Fetch item details
    useEffect(() => {
        const fetchItem = async () => {
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

        fetchItem();
    }, [id]);

    // GSAP Animations
    useEffect(() => {
        if (loading || !item) return;

        const ctx = gsap.context(() => {
            // Image entrance
            gsap.fromTo('.item-image-container',
                { x: -80, opacity: 0, scale: 0.9 },
                { x: 0, opacity: 1, scale: 1, duration: 1, ease: 'power4.out' }
            );

            // Content entrance
            gsap.fromTo('.item-content',
                { x: 80, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' }
            );

            // Details stagger
            gsap.fromTo('.detail-row',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.4, ease: 'power3.out' }
            );

            // Action buttons
            gsap.fromTo('.action-btn',
                { y: 20, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, delay: 0.6, ease: 'back.out(2)' }
            );

            // Match suggestions
            gsap.fromTo('.match-card',
                { x: 50, opacity: 0, rotateY: 15 },
                { x: 0, opacity: 1, rotateY: 0, duration: 0.7, stagger: 0.1, delay: 0.8, ease: 'power3.out' }
            );

        }, containerRef);

        return () => ctx.revert();
    }, [loading, item]);

    // Image navigation
    const nextImage = () => {
        if (item?.images?.length > 1) {
            gsap.to(imageRef.current, {
                x: -20,
                opacity: 0,
                duration: 0.2,
                onComplete: () => {
                    setCurrentImage(prev => (prev + 1) % item.images.length);
                    gsap.fromTo(imageRef.current, { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 });
                }
            });
        }
    };

    const prevImage = () => {
        if (item?.images?.length > 1) {
            gsap.to(imageRef.current, {
                x: 20,
                opacity: 0,
                duration: 0.2,
                onComplete: () => {
                    setCurrentImage(prev => (prev - 1 + item.images.length) % item.images.length);
                    gsap.fromTo(imageRef.current, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 });
                }
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'reported': return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
            case 'matched': return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' };
            case 'claimed': return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
            case 'resolved': return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
            default: return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="relative">
                    <PulseRings size={100} color="#0ea5e9" />
                    <Package className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-400" size={32} />
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Item Not Found</h1>
                    <p className="text-slate-400 mb-6">The item you're looking for doesn't exist or has been removed.</p>
                    <Link to="/inventory">
                        <ElasticButton className="px-6 py-3 bg-primary-600 rounded-xl text-white font-bold">
                            Browse Items
                        </ElasticButton>
                    </Link>
                </div>
            </div>
        );
    }

    const statusColors = getStatusColor(item.status);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#030712] text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4">
                    <MorphingBlob color1="#0ea5e9" color2="#8b5cf6" size={500} />
                </div>
                <div className="absolute bottom-0 left-1/4">
                    <MorphingBlob color1="#8b5cf6" color2="#ec4899" size={400} />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <Sidebar />

            <main className="pl-4 md:pl-8 pr-4 md:pr-8 py-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Items</span>
                    </button>

                    <div className="grid lg:grid-cols-2 gap-10">
                        {/* Image Section */}
                        <div className="item-image-container" style={{ perspective: 1000 }}>
                            <TiltCard intensity={0.2}>
                                <HolographicCard className="overflow-hidden rounded-3xl">
                                    <div className="relative aspect-square bg-slate-900">
                                        {item.images?.length > 0 ? (
                                            <img
                                                ref={imageRef}
                                                src={item.images[currentImage]}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package size={120} className="text-slate-700" />
                                            </div>
                                        )}

                                        {/* Type Badge */}
                                        <div className={`absolute top-6 left-6 px-5 py-2 rounded-full text-sm font-bold ${item.type === 'lost'
                                                ? 'bg-red-500 text-white'
                                                : 'bg-emerald-500 text-white'
                                            }`}>
                                            {item.type?.toUpperCase()}
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`absolute top-6 right-6 px-4 py-2 rounded-full text-sm font-bold ${statusColors.bg} ${statusColors.text} ${statusColors.border} border backdrop-blur-sm`}>
                                            {item.status?.toUpperCase()}
                                        </div>

                                        {/* Image Navigation */}
                                        {item.images?.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                                                >
                                                    <ChevronLeft size={24} />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                                                >
                                                    <ChevronRight size={24} />
                                                </button>

                                                {/* Dots */}
                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                                    {item.images.map((_, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setCurrentImage(i)}
                                                            className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentImage
                                                                    ? 'bg-white w-8'
                                                                    : 'bg-white/40 hover:bg-white/60'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </HolographicCard>
                            </TiltCard>

                            {/* Thumbnail Strip */}
                            {item.images?.length > 1 && (
                                <div className="flex gap-3 mt-4">
                                    {item.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentImage(i)}
                                            className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === currentImage
                                                    ? 'border-primary-500 ring-2 ring-primary-500/30'
                                                    : 'border-slate-700 hover:border-slate-500'
                                                }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="item-content">
                            <h1 className="text-4xl font-black text-white mb-4">
                                {item.title}
                            </h1>

                            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                {item.description || 'No description provided for this item.'}
                            </p>

                            {/* Details Grid */}
                            <GradientBorderCard className="mb-8">
                                <div className="divide-y divide-slate-700/50">
                                    <div className="detail-row flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <MapPin size={20} className="text-cyan-400" />
                                            <span>Location</span>
                                        </div>
                                        <span className="font-semibold text-white">{item.location?.zone || 'Not specified'}</span>
                                    </div>

                                    <div className="detail-row flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Calendar size={20} className="text-violet-400" />
                                            <span>Date {item.type === 'lost' ? 'Lost' : 'Found'}</span>
                                        </div>
                                        <span className="font-semibold text-white">{new Date(item.date || item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>

                                    {item.category && (
                                        <div className="detail-row flex items-center justify-between p-4">
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <Tag size={20} className="text-amber-400" />
                                                <span>Category</span>
                                            </div>
                                            <span className="font-semibold text-white">{item.category}</span>
                                        </div>
                                    )}

                                    <div className="detail-row flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Clock size={20} className="text-emerald-400" />
                                            <span>Posted</span>
                                        </div>
                                        <span className="font-semibold text-white">{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <div className="detail-row flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Eye size={20} className="text-pink-400" />
                                            <span>Views</span>
                                        </div>
                                        <span className="font-semibold text-white">{item.views || 0}</span>
                                    </div>
                                </div>
                            </GradientBorderCard>

                            {/* Action Buttons */}
                            <div className="space-y-4">
                                {item.status === 'reported' && user && item.reportedBy !== user._id && (
                                    <ParticleExplosion className="w-full">
                                        <Link to={`/claims/submit/${item._id}`} className="w-full block">
                                            <ElasticButton className="action-btn w-full py-5 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 group shadow-lg shadow-primary-500/25">
                                                <FileText size={22} />
                                                <span>{item.type === 'lost' ? 'I Found This Item' : 'This is My Item'}</span>
                                                <Zap size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </ElasticButton>
                                        </Link>
                                    </ParticleExplosion>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <RippleButton className="action-btn py-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all">
                                        <Share2 size={18} />
                                        Share
                                    </RippleButton>
                                    <RippleButton className="action-btn py-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all">
                                        <Flag size={18} />
                                        Report
                                    </RippleButton>
                                </div>
                            </div>

                            {/* AI Match Indicator */}
                            {item.aiMatchScore && (
                                <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Sparkles size={24} className="text-purple-400" />
                                        <span className="font-bold text-white">AI Match Analysis</span>
                                    </div>
                                    <p className="text-slate-400 text-sm">
                                        Our AI has found potential matches for this item with a confidence score of{' '}
                                        <NeonText color="#a855f7">{item.aiMatchScore}%</NeonText>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ItemDetails;
