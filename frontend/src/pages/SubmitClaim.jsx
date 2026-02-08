/**
 * PREMIUM SUBMIT CLAIM PAGE
 * With advanced effects from CodePen inspirations
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { gsap } from 'gsap';
import {
    ArrowLeft,
    Upload,
    FileText,
    CheckCircle,
    Loader2,
    AlertCircle,
    Shield,
    Plus,
    X,
    Package,
    Sparkles,
    Camera
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
    WaveText,
    HolographicCard
} from '../effects';

const SubmitClaim = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [proofs, setProofs] = useState(['']);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

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

    // GSAP Animations
    useEffect(() => {
        if (loading || !item) return;

        const ctx = gsap.context(() => {
            gsap.fromTo('.claim-header',
                { y: -40, opacity: 0, filter: 'blur(10px)' },
                { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }
            );

            gsap.fromTo('.item-preview',
                { x: -60, opacity: 0, scale: 0.95 },
                { x: 0, opacity: 1, scale: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' }
            );

            gsap.fromTo('.claim-form',
                { x: 60, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' }
            );

            gsap.fromTo('.form-field',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.5, ease: 'power2.out' }
            );

        }, containerRef);

        return () => ctx.revert();
    }, [loading, item]);

    const addProof = () => {
        setProofs([...proofs, '']);
        // Animate new field
        setTimeout(() => {
            gsap.fromTo('.proof-field:last-child',
                { y: 20, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }
            );
        }, 50);
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

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const maxFiles = 5 - images.length;

        files.slice(0, maxFiles).forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target.result]);
            };
            reader.readAsDataURL(file);
            setImages(prev => [...prev, file]);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validProofs = proofs.filter(p => p.trim());
        if (validProofs.length === 0) {
            setError('Please provide at least one proof of ownership');
            gsap.to('.claim-form', {
                x: [-15, 15, -10, 10, -5, 5, 0],
                duration: 0.6,
                ease: 'power2.inOut'
            });
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('itemId', itemId);
            validProofs.forEach((proof, i) => {
                formData.append('ownershipProofs', proof);
            });
            images.forEach(image => {
                formData.append('proofImages', image);
            });

            await api.post('/v1/claims', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess(true);
            gsap.to('.claim-form', {
                scale: 0.95,
                opacity: 0,
                y: -30,
                duration: 0.5,
                ease: 'power2.in'
            });
        } catch (error) {
            console.error('Failed to submit claim:', error);
            setError(error.response?.data?.error || 'Failed to submit claim');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="relative">
                    <PulseRings size={100} color="#0ea5e9" />
                    <FileText className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-400" size={32} />
                </div>
            </div>
        );
    }

    if (error && !item) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Item Not Found</h1>
                    <p className="text-slate-400 mb-6">The item you're trying to claim doesn't exist.</p>
                    <Link to="/inventory">
                        <ElasticButton className="px-6 py-3 bg-primary-600 rounded-xl text-white font-bold">
                            Browse Items
                        </ElasticButton>
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="text-center">
                    <div className="relative inline-block mb-8">
                        <PulseRings size={120} color="#10b981" />
                        <CheckCircle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400" size={48} />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4">
                        <NeonText color="#10b981">Claim Submitted!</NeonText>
                    </h1>
                    <p className="text-slate-400 text-lg mb-8">Your claim is being reviewed by our team.</p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/my-claims">
                            <ElasticButton className="px-6 py-3 bg-emerald-600 rounded-xl text-white font-bold">
                                View My Claims
                            </ElasticButton>
                        </Link>
                        <Link to="/inventory">
                            <ElasticButton className="px-6 py-3 bg-slate-700 rounded-xl text-white font-bold">
                                Browse More
                            </ElasticButton>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-[#030712] text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4">
                    <MorphingBlob color1="#0ea5e9" color2="#8b5cf6" size={500} />
                </div>
                <div className="absolute bottom-1/4 right-1/4">
                    <MorphingBlob color1="#8b5cf6" color2="#ec4899" size={400} />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <Sidebar />

            <main className="pl-4 md:pl-8 pr-4 md:pr-8 py-8 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>

                    {/* Header */}
                    <div className="claim-header text-center mb-10">
                        <div className="inline-flex items-center justify-center mb-4">
                            <div className="p-4 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-2xl shadow-2xl shadow-emerald-500/30">
                                <Shield size={36} className="text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-2">
                            <GlitchText text="Submit Claim" />
                        </h1>
                        <p className="text-slate-400 text-lg">Verify ownership to claim this item</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-10">
                        {/* Item Preview */}
                        <div className="item-preview">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Package size={20} className="text-cyan-400" />
                                Item Details
                            </h2>

                            <TiltCard intensity={0.2}>
                                <HolographicCard className="overflow-hidden rounded-2xl">
                                    <div className="aspect-video bg-slate-900 relative">
                                        {item?.images?.[0] ? (
                                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package size={64} className="text-slate-700" />
                                            </div>
                                        )}
                                        <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold ${item?.type === 'lost' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                                            }`}>
                                            {item?.type?.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-2xl font-bold text-white mb-3">{item?.title}</h3>
                                        <p className="text-slate-400 mb-4 line-clamp-3">{item?.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span>{item?.location?.zone}</span>
                                            <span>•</span>
                                            <span>{new Date(item?.date || item?.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </HolographicCard>
                            </TiltCard>

                            {/* Tips */}
                            <div className="mt-6 p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <Sparkles size={20} className="text-amber-400" />
                                    <span className="font-bold text-white">Tips for a successful claim</span>
                                </div>
                                <ul className="text-slate-400 text-sm space-y-2">
                                    <li>• Be specific about unique features or marks</li>
                                    <li>• Mention when and where you lost it</li>
                                    <li>• Upload photos showing your ownership</li>
                                    <li>• Include purchase receipts if available</li>
                                </ul>
                            </div>
                        </div>

                        {/* Claim Form */}
                        <div className="claim-form">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-violet-400" />
                                Ownership Proofs
                            </h2>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <GradientBorderCard className="mb-6">
                                    <div className="space-y-4">
                                        {proofs.map((proof, index) => (
                                            <div key={index} className="proof-field form-field flex items-start gap-3">
                                                <div className="flex-1">
                                                    <textarea
                                                        value={proof}
                                                        onChange={(e) => updateProof(index, e.target.value)}
                                                        placeholder={`Proof ${index + 1}: Describe how you can prove ownership...`}
                                                        rows={3}
                                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                                                    />
                                                </div>
                                                {proofs.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProof(index)}
                                                        className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addProof}
                                        className="form-field mt-4 w-full py-3 border border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-primary-500 hover:text-primary-400 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} />
                                        Add another proof
                                    </button>
                                </GradientBorderCard>

                                {/* Proof Images */}
                                <div className="form-field mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                        <Camera size={18} className="text-cyan-400" />
                                        Proof Images (Optional)
                                    </h3>

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-600 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-500/5 transition-all group"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <Upload size={32} className="text-slate-400 mx-auto mb-3 group-hover:text-primary-400 transition-colors" />
                                        <p className="text-white font-medium">Upload proof images</p>
                                        <p className="text-slate-500 text-sm">Photos of receipts, packaging, etc.</p>
                                    </div>

                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-4 gap-3 mt-4">
                                            {imagePreviews.map((preview, i) => (
                                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                                                    <img src={preview} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(i)}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <ParticleExplosion className="w-full">
                                    <ElasticButton
                                        type="submit"
                                        disabled={submitting}
                                        className="form-field w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 size={22} className="animate-spin" />
                                                Submitting Claim...
                                            </>
                                        ) : (
                                            <>
                                                <Shield size={22} />
                                                Submit Claim
                                            </>
                                        )}
                                    </ElasticButton>
                                </ParticleExplosion>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SubmitClaim;
