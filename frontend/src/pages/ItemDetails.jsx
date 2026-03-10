import { gsap } from 'gsap';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Camera,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Loader2,
    MapPin,
    Package,
    Send,
    X,
    Tag
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ElasticButton,
    PulseRings
} from '../effects';
import api from '../services/api';

const ItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isFromRecent = location.state?.fromRecent;

    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [claimReason, setClaimReason] = useState('');
    const [claimImages, setClaimImages] = useState([]);
    const [claimImagePreviews, setClaimImagePreviews] = useState([]);
    const [claimSubmitting, setClaimSubmitting] = useState(false);
    const [claimSuccess, setClaimSuccess] = useState(false);
    const [claimError, setClaimError] = useState('');

    const [userClaim, setUserClaim] = useState(null);

    const containerRef = useRef(null);
    const claimFileInputRef = useRef(null);

    // Fetch item details and user's claim
    useEffect(() => {
        const fetchItemAndClaim = async () => {
            try {
                const res = await api.get(`/v1/items/${id}`);
                setItem(res.data);

                if (user) {
                    try {
                        const claimsRes = await api.get('/v1/claims/user/my-claims');
                        const claims = claimsRes.data.claims || claimsRes.data || [];
                        const existingClaim = claims.find(c => (c.itemId?._id || c.itemId) === id);
                        if (existingClaim) {
                            setUserClaim(existingClaim);
                        }
                    } catch (err) {
                        console.error('Failed to fetch user claims:', err);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch item details:', error);
                setError('Item not found');
            } finally {
                setLoading(false);
            }
        };

        fetchItemAndClaim();
    }, [id, user]);

    // GSAP Animations
    useEffect(() => {
        if (loading || !item) return;

        const ctx = gsap.context(() => {
            gsap.fromTo('.item-image-container',
                { x: -50, opacity: 0, scale: 0.95 },
                { x: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
            );

            gsap.fromTo('.item-content-header',
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power3.out' }
            );

            gsap.fromTo('.detail-card',
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.3, ease: 'power3.out' }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [loading, item]);

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

    const handleRaiseClaim = async () => {
        if (!claimReason.trim()) {
            setClaimError('Please provide a reason for your claim.');
            return;
        }
        setClaimSubmitting(true);
        setClaimError('');
        try {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0c16] flex items-center justify-center">
                <div className="relative">
                    <PulseRings size={100} color="#3b82f6" />
                    <Package className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" size={32} />
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen bg-[#0a0c16] flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Item Not Found</h1>
                    <p className="text-slate-400 mb-6">The item you're looking for doesn't exist.</p>
                    <Link to="/inventory">
                        <ElasticButton className="px-6 py-3 bg-blue-600 rounded-xl text-white font-bold">
                            Browse Items
                        </ElasticButton>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-[#0a0c16] text-white overflow-x-hidden relative flex flex-col items-center">
            {/* Very faint background light from right like in the screenshot */}
            <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            <main className="w-full max-w-6xl px-6 py-8 relative z-10 flex flex-col">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group text-sm self-start"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Items</span>
                </button>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Image Section */}
                    <div className="item-image-container">
                        <div className="relative aspect-square bg-white rounded-[2rem] overflow-hidden">
                            {item.images?.length > 0 ? (
                                <img
                                    src={item.images[0]}
                                    alt={item.itemAttributes?.category || 'Item'}
                                    className="w-full h-full object-contain p-2"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package size={120} className="text-slate-300" />
                                </div>
                            )}

                            {/* Tags */}
                            <div className={`absolute top-6 left-6 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider ${item.submissionType === 'lost' ? 'bg-[#ff4e4e] text-white' : 'bg-emerald-500 text-white'}`}>
                                {item.submissionType?.toUpperCase() || 'LOST'}
                            </div>

                            <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider bg-[#d0e6ff] text-[#3b82f6]">
                                {(item.status === 'submitted' || item.status === 'reported') ? 'SUBMITTED' : item.status?.toUpperCase() || 'SUBMITTED'}
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col gap-6">
                        <div className="item-content-header">
                            <h1 className="text-4xl font-extrabold text-white mb-2">
                                {item.itemAttributes?.category || 'Electronics'}
                            </h1>
                            <p className="text-slate-400 text-[15px]">
                                {item.itemAttributes?.description || 'laptop'} - {item.itemAttributes?.category || 'Electronics item'}
                            </p>
                        </div>

                        {/* Details Card */}
                        <div className="detail-card rounded-2xl p-[1.5px] bg-gradient-to-br from-[#8b35f6] via-[#d946ef] to-transparent shadow-lg">
                            <div className="rounded-2xl bg-[#111422] p-6 lg:p-7">
                                <div className="divide-y divide-slate-800">
                                    <div className="flex items-center justify-between py-3.5 first:pt-0">
                                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                                            <MapPin size={16} className="text-cyan-400" />
                                            <span>Location</span>
                                        </div>
                                        <span className="font-semibold text-white text-sm">
                                            {item.location?.zoneId?.zoneName || 'AB1'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-3.5">
                                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                                            <Calendar size={16} className="text-purple-400" />
                                            <span>Date {item.submissionType === 'lost' ? 'Lost' : 'Found'}</span>
                                        </div>
                                        <span className="font-semibold text-white text-sm">
                                            {new Date(item.timeMetadata?.lostOrFoundAt || item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-3.5">
                                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                                            <Tag size={16} className="text-yellow-500" />
                                            <span>Category</span>
                                        </div>
                                        <span className="font-semibold text-white text-sm">
                                            {item.itemAttributes?.category || 'Electronics'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-3.5">
                                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                                            <Clock size={16} className="text-green-500" />
                                            <span>Posted</span>
                                        </div>
                                        <span className="font-semibold text-white text-sm">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-3.5 last:pb-0">
                                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                                            <Eye size={16} className="text-pink-400" />
                                            <span>Views</span>
                                        </div>
                                        <span className="font-semibold text-white text-sm">
                                            {item.views || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User's Existing Claim */}
                        {userClaim && (
                            <div className="detail-card rounded-2xl p-[1.5px] bg-gradient-to-br from-[#10b981] via-[#0ea5e9] to-transparent shadow-lg flex-1">
                                <div className="rounded-2xl bg-[#111422] p-6 lg:p-7 space-y-4 h-full flex flex-col">
                                    <h3 className="text-white font-bold text-[17px] flex items-center gap-2">
                                        <FileText size={18} className="text-[#10b981]" />
                                        Your Claim Details
                                    </h3>

                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${userClaim.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                            userClaim.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                            Status: {userClaim.status?.toUpperCase() || 'PENDING'}
                                        </span>
                                        <span className="text-slate-400 text-xs">
                                            Submitted: {new Date(userClaim.submittedAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {userClaim.status === 'rejected' && userClaim.rejectionReason && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <p className="text-red-400 text-sm"><span className="font-bold">Reason:</span> {userClaim.rejectionReason}</p>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-slate-300 mb-2">Proofs Provided:</h4>
                                        {userClaim.ownershipProofs?.filter(p => !p.startsWith('http')).length > 0 && (
                                            <p className="text-slate-400 text-sm mb-3">
                                                {userClaim.ownershipProofs.filter(p => !p.startsWith('http')).join(' • ')}
                                            </p>
                                        )}
                                        {userClaim.ownershipProofs?.filter(p => p.startsWith('http')).length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {userClaim.ownershipProofs.filter(p => p.startsWith('http')).map((url, i) => (
                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-400 transition-colors">
                                                        <img src={url} alt={`Proof ${i}`} className="w-full h-full object-cover" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Claim Card */}
                        {(item.status === 'reported' || item.status === 'submitted') && !claimSuccess && !userClaim && !isFromRecent && (
                            <div className="detail-card rounded-2xl p-[1.5px] bg-gradient-to-br from-[#8b35f6] via-[#d946ef] to-transparent shadow-lg flex-1">
                                <div className="rounded-2xl bg-[#111422] p-6 lg:p-7 space-y-4 h-full flex flex-col">
                                    <h3 className="text-white font-bold text-[17px] flex items-center gap-2">
                                        <FileText size={18} className="text-[#3b82f6]" />
                                        {item.submissionType === 'lost' ? 'I Found This Item' : 'Claim This Item'}
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-5 pr-4">
                                        {item.submissionType === 'lost'
                                            ? 'If you found this item, raise a claim with a brief description of how you can identify it.'
                                            : 'If this is your item, raise a claim with proof of ownership (e.g., unique marks, serial number, purchase details).'}
                                    </p>

                                    <textarea
                                        value={claimReason}
                                        onChange={(e) => setClaimReason(e.target.value)}
                                        placeholder="Describe your proof of ownership or how you can identify this item..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-[#191e2b] border border-transparent rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all resize-none mt-2"
                                    />

                                    <div className="mt-2 mb-2">
                                        <label className="text-xs text-slate-400 mb-3 block">Upload proof images (optional, max 3)</label>
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
                                                <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-700 group">
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
                                                    className="w-14 h-14 rounded-xl border border-dashed border-slate-600 bg-transparent flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-white hover:border-slate-500 transition-colors"
                                                >
                                                    <Camera size={14} />
                                                    <span className="text-[10px]">Add</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {claimError && (
                                        <div className="flex items-center gap-2 text-red-400 text-xs mt-2">
                                            <AlertTriangle size={14} />
                                            {claimError}
                                        </div>
                                    )}

                                    <div className="mt-auto pt-2">
                                        {!user ? (
                                            <Link to="/login" className="block w-full">
                                                <button type="button" className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity">
                                                    Sign in to Raise Claim
                                                </button>
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={handleRaiseClaim}
                                                disabled={claimSubmitting}
                                                className="w-full py-3.5 bg-gradient-to-r from-[#2563eb] to-[#6366f1] hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold text-white text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                                            >
                                                {claimSubmitting ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <>
                                                        <Send size={16} className="rotate-[-45deg] -mt-1" />
                                                        <span>Raise Claim</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {claimSuccess && (
                            <div className="p-6 bg-[#111422] border border-emerald-500/30 rounded-2xl flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle size={24} className="text-emerald-400" />
                                    <span className="font-bold text-emerald-400 text-lg">Claim Submitted!</span>
                                </div>
                                <p className="text-slate-400 text-sm mb-4">
                                    Your claim has been submitted with <span className="text-white font-semibold">pending</span> status. An admin will review it shortly.
                                </p>
                                <Link to="/my-claims">
                                    <button className="px-6 py-3 bg-emerald-600/20 rounded-xl text-emerald-400 font-semibold hover:bg-emerald-600/30 transition-all text-sm">
                                        View My Claims
                                    </button>
                                </Link>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
};

export default ItemDetails;
