/**
 * @module pages/ItemDetails
 * @description Item detail view with image gallery, claim submission, and status timeline.
 */

import { gsap } from 'gsap';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Camera,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    FileText,
    Loader2,
    MapPin,
    Package,
    Send,
    Sparkles,
    Tag,
    X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
    ElasticButton,
    GradientBorderCard,
    HolographicCard,
    MorphingBlob,
    NeonText,
    PulseRings,
    TiltCard
} from '../effects';
import api from '../services/api';

const ItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState(0);
    const [error, setError] = useState('');
    const [claimReason, setClaimReason] = useState('');
    const [claimImages, setClaimImages] = useState([]);
    const [claimImagePreviews, setClaimImagePreviews] = useState([]);
    const [claimSubmitting, setClaimSubmitting] = useState(false);
    const [claimSuccess, setClaimSuccess] = useState(false);
    const [claimError, setClaimError] = useState('');
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);

    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const claimFileInputRef = useRef(null);

    // Fetch item details
    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await api.get(`/v1/items/${id}`);
                setItem(res.data);

                // Fetch AI Matches
                setLoadingMatches(true);
                const matchesRes = await api.get(`/v1/items/${id}/matches`);
                setMatches(matchesRes.data);
            } catch (error) {
                console.error('Failed to fetch item details or matches:', error);
                setError('Item not found');
            } finally {
                setLoadingMatches(false);
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

    // Handle claim image selection
    const handleClaimImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (claimImages.length + files.length > 3) {
            setClaimError('Maximum 3 images allowed');
            return;
        }
        setClaimError('');
        setClaimImages(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setClaimImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeClaimImage = (index) => {
        URL.revokeObjectURL(claimImagePreviews[index]);
        setClaimImages(prev => prev.filter((_, i) => i !== index));
        setClaimImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Raise a claim directly
    const handleRaiseClaim = async () => {
        if (!claimReason.trim()) {
            setClaimError('Please provide a reason for your claim.');
            return;
        }
        setClaimSubmitting(true);
        setClaimError('');
        try {
            // Upload images first if any
            const imageUrls = [];
            for (const file of claimImages) {
                const formData = new FormData();
                formData.append('image', file);
                const uploadRes = await api.post('/v1/uploads/image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrls.push(uploadRes.data.image.url);
            }

            const proofs = [claimReason.trim(), ...imageUrls];
            await api.post('/v1/claims', {
                itemId: id,
                ownershipProofs: proofs
            });
            setClaimSuccess(true);
        } catch (err) {
            setClaimError(err.response?.data?.message || 'Failed to submit claim. Please try again.');
        } finally {
            setClaimSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'reported':
            case 'submitted': return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
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
                                                alt={item.itemAttributes?.category || 'Item'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package size={120} className="text-slate-700" />
                                            </div>
                                        )}

                                        {/* Type Badge */}
                                        <div className={`absolute top-6 left-6 px-5 py-2 rounded-full text-sm font-bold ${item.submissionType === 'lost'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-emerald-500 text-white'
                                            }`}>
                                            {item.submissionType?.toUpperCase()}
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
                                {item.itemAttributes?.category || 'Unknown Item'}
                            </h1>

                            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                {item.itemAttributes?.description || 'No description provided for this item.'}
                            </p>

                            {/* Details Grid */}
                            <GradientBorderCard className="mb-8">
                                <div className="divide-y divide-slate-700/50">
                                    <div className="detail-row flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <MapPin size={20} className="text-cyan-400" />
                                            <span>Location</span>
                                        </div>
                                        <span className="font-semibold text-white">{item.location?.zoneId?.zoneName || 'Not specified'}</span>
                                    </div>

                                    <div className="detail-row flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Calendar size={20} className="text-violet-400" />
                                            <span>Date {item.submissionType === 'lost' ? 'Lost' : 'Found'}</span>
                                        </div>
                                        <span className="font-semibold text-white">{new Date(item.timeMetadata?.lostOrFoundAt || item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>

                                    {item.itemAttributes?.category && (
                                        <div className="detail-row flex items-center justify-between p-4">
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <Tag size={20} className="text-amber-400" />
                                                <span>Category</span>
                                            </div>
                                            <span className="font-semibold text-white">{item.itemAttributes.category}</span>
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

                            {/* Raise a Claim */}
                            <div className="space-y-4">
                                {(item.status === 'reported' || item.status === 'submitted') && user && !claimSuccess && (
                                    <GradientBorderCard className="">
                                        <div className="p-5 space-y-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <FileText size={20} className="text-primary-400" />
                                                {item.submissionType === 'lost' ? 'I Found This Item' : 'Claim This Item'}
                                            </h3>
                                            <p className="text-slate-400 text-sm">
                                                {item.submissionType === 'lost'
                                                    ? 'If you found this item, raise a claim with a brief description of how you can identify it.'
                                                    : 'If this is your item, raise a claim with proof of ownership (e.g., unique marks, serial number, purchase details).'}
                                            </p>
                                            <textarea
                                                value={claimReason}
                                                onChange={(e) => setClaimReason(e.target.value)}
                                                placeholder="Describe your proof of ownership or how you can identify this item..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                                            />

                                            {/* Image Upload */}
                                            <div>
                                                <label className="text-sm text-slate-400 mb-2 block">Upload proof images (optional, max 3)</label>
                                                <input
                                                    ref={claimFileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleClaimImageChange}
                                                    className="hidden"
                                                />
                                                <div className="flex flex-wrap gap-3">
                                                    {claimImagePreviews.map((preview, i) => (
                                                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 group">
                                                            <img src={preview} alt="Proof" className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeClaimImage(i)}
                                                                className="absolute top-1 right-1 p-0.5 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {claimImages.length < 3 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => claimFileInputRef.current?.click()}
                                                            className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-primary-500 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-primary-400 transition-colors"
                                                        >
                                                            <Camera size={20} />
                                                            <span className="text-[10px]">Add</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {claimError && (
                                                <div className="flex items-center gap-2 text-red-400 text-sm">
                                                    <AlertTriangle size={16} />
                                                    {claimError}
                                                </div>
                                            )}
                                            <ElasticButton
                                                onClick={handleRaiseClaim}
                                                disabled={claimSubmitting}
                                                className="action-btn w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {claimSubmitting ? (
                                                    <Loader2 size={22} className="animate-spin" />
                                                ) : (
                                                    <>
                                                        <Send size={20} />
                                                        <span>Raise Claim</span>
                                                    </>
                                                )}
                                            </ElasticButton>
                                        </div>
                                    </GradientBorderCard>
                                )}

                                {claimSuccess && (
                                    <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CheckCircle size={24} className="text-emerald-400" />
                                            <span className="font-bold text-emerald-400 text-lg">Claim Submitted!</span>
                                        </div>
                                        <p className="text-slate-400 text-sm mb-4">
                                            Your claim has been submitted with <span className="text-white font-semibold">pending</span> status. An admin will review it shortly.
                                        </p>
                                        <Link to="/my-claims">
                                            <ElasticButton className="px-6 py-3 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-semibold hover:bg-emerald-600/30 transition-all">
                                                View My Claims
                                            </ElasticButton>
                                        </Link>
                                    </div>
                                )}

                                {!user && (item.status === 'reported' || item.status === 'submitted') && (
                                    <div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-center">
                                        <p className="text-slate-400 mb-3">Sign in to raise a claim for this item</p>
                                        <Link to="/login">
                                            <ElasticButton className="px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl text-white font-bold">
                                                Sign In
                                            </ElasticButton>
                                        </Link>
                                    </div>
                                )}

                            </div>

                            {/* AI Match Analysis */}
                            {(item.aiMatchScore || matches.length > 0) && (
                                <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Sparkles size={24} className="text-purple-400" />
                                        <span className="font-bold text-white">AI Match Analysis & FAISS Search</span>
                                    </div>

                                    {item.aiMatchScore && (
                                        <p className="text-slate-400 text-sm mb-6">
                                            Our AI has found potential matches for this item with an overall confidence score of{' '}
                                            <NeonText color="#a855f7">{item.aiMatchScore}%</NeonText>
                                        </p>
                                    )}

                                    {matches.length > 0 ? (
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Top correlated records via FAISS</h4>
                                            <div className="grid gap-4">
                                                {matches.map((match, idx) => {
                                                    const matchedItem = item.submissionType === 'lost' ? match.foundItemId : match.lostItemId;
                                                    if (!matchedItem) return null;

                                                    return (
                                                        <Link
                                                            key={match._id}
                                                            to={`/inventory/${matchedItem._id}`}
                                                            className="match-card group p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/50 transition-all flex items-center gap-4"
                                                        >
                                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                                                                {matchedItem.images?.length > 0 ? (
                                                                    <img src={matchedItem.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Package size={24} className="text-slate-700" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-grow min-w-0">
                                                                <h5 className="font-bold text-white truncate">{matchedItem.itemAttributes?.category || 'Uncategorized'}</h5>
                                                                <p className="text-slate-400 text-xs truncate">{matchedItem.itemAttributes?.description}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs text-slate-500 mb-1">Correlation</div>
                                                                <div className="font-mono font-bold text-purple-400">
                                                                    {Math.round(match.similarityScore)}%
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        !loadingMatches && <p className="text-slate-500 text-sm italic">No semantic match pairs found in database for this item yet.</p>
                                    )}
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
