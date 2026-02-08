/**
 * PREMIUM REPORT ITEM PAGE
 * Multi-step form with advanced effects
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { gsap } from 'gsap';
import {
    Package,
    Camera,
    MapPin,
    Calendar,
    Tag,
    FileText,
    Upload,
    X,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Loader2,
    Sparkles,
    AlertCircle,
    Image as ImageIcon
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
    WaveText
} from '../effects';

const ReportItem = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        type: '',
        title: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        location: { zone: '', building: '', details: '' },
        images: []
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [zones, setZones] = useState([]);

    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

    // Fetch zones
    useEffect(() => {
        const fetchZones = async () => {
            try {
                const res = await api.get('/v1/zones');
                setZones(res.data.zones || res.data || []);
            } catch (err) {
                console.error('Failed to fetch zones:', err);
            }
        };
        fetchZones();
    }, []);

    // Step transition animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.step-content',
                { x: 60, opacity: 0, filter: 'blur(10px)' },
                { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }
            );

            gsap.fromTo('.form-field',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, delay: 0.1, ease: 'power2.out' }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [step]);

    // Handle image upload
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const maxFiles = 5 - formData.images.length;

        if (files.length > maxFiles) {
            setError(`You can only upload ${maxFiles} more image(s)`);
            return;
        }

        files.slice(0, maxFiles).forEach(file => {
            if (!file.type.startsWith('image/')) {
                setError('Please upload only image files');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target.result]);
            };
            reader.readAsDataURL(file);

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, file]
            }));
        });

        setError('');
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Validation
    const validateStep = () => {
        switch (step) {
            case 1:
                if (!formData.type) {
                    setError('Please select item type');
                    return false;
                }
                break;
            case 2:
                if (!formData.title.trim()) {
                    setError('Please enter a title');
                    return false;
                }
                if (!formData.category) {
                    setError('Please select a category');
                    return false;
                }
                break;
            case 3:
                if (!formData.location.zone) {
                    setError('Please select a zone');
                    return false;
                }
                if (!formData.date) {
                    setError('Please select a date');
                    return false;
                }
                break;
        }
        setError('');
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        setError('');
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validateStep()) return;

        setLoading(true);
        setError('');

        try {
            const submitData = new FormData();
            submitData.append('type', formData.type);
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('date', formData.date);
            submitData.append('location', JSON.stringify(formData.location));

            formData.images.forEach(image => {
                submitData.append('images', image);
            });

            await api.post('/v1/items', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess(true);

            // Success animation
            gsap.to('.form-container', {
                scale: 0.95,
                opacity: 0,
                y: -30,
                duration: 0.5,
                ease: 'power2.in',
                onComplete: () => {
                    setTimeout(() => navigate('/dashboard'), 1500);
                }
            });

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to report item');
            gsap.to('.form-container', {
                x: [-15, 15, -10, 10, -5, 5, 0],
                duration: 0.6,
                ease: 'power2.inOut'
            });
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        'Electronics', 'Documents', 'Accessories', 'Clothing',
        'Keys', 'Bags', 'Books', 'Sports Equipment', 'Other'
    ];

    const steps = [
        { num: 1, label: 'Type' },
        { num: 2, label: 'Details' },
        { num: 3, label: 'Location' },
        { num: 4, label: 'Images' }
    ];

    if (success) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="text-center">
                    <div className="relative inline-block mb-8">
                        <PulseRings size={120} color="#10b981" />
                        <CheckCircle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400" size={48} />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4">
                        <NeonText color="#10b981">Success!</NeonText>
                    </h1>
                    <p className="text-slate-400 text-lg">Your item has been reported successfully.</p>
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
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center mb-4">
                            <div className="p-4 bg-gradient-to-tr from-primary-600 to-purple-600 rounded-2xl shadow-2xl shadow-primary-500/30">
                                <Package size={36} className="text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-2">
                            <GlitchText text="Report an Item" />
                        </h1>
                        <p className="text-slate-400 text-lg">Help reunite items with their owners</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        {steps.map((s, i) => (
                            <div key={s.num} className="flex items-center gap-3">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step > s.num
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                            : step === s.num
                                                ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/30'
                                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                                        }`}
                                >
                                    {step > s.num ? <CheckCircle size={20} /> : s.num}
                                </div>
                                <span className={`hidden sm:block text-sm font-medium ${step >= s.num ? 'text-white' : 'text-slate-500'}`}>
                                    {s.label}
                                </span>
                                {i < steps.length - 1 && (
                                    <div className={`hidden sm:block w-12 h-0.5 transition-all duration-500 ${step > s.num ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form Card */}
                    <TiltCard intensity={0.1}>
                        <div
                            className="form-container rounded-3xl p-8 md:p-10"
                            style={{
                                background: 'rgba(15, 23, 42, 0.6)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            {/* Error */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="step-content">
                                {/* Step 1: Type Selection */}
                                {step === 1 && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">
                                            <WaveText text="What type of item?" />
                                        </h2>

                                        <div className="grid grid-cols-2 gap-6">
                                            {[
                                                { id: 'lost', label: 'Lost Item', desc: 'I lost something', icon: '🔍', color: 'from-red-500 to-orange-500' },
                                                { id: 'found', label: 'Found Item', desc: 'I found something', icon: '🎉', color: 'from-emerald-500 to-teal-500' }
                                            ].map(type => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type: type.id })}
                                                    className={`form-field p-8 rounded-2xl border-2 text-left transition-all group ${formData.type === type.id
                                                            ? `border-transparent bg-gradient-to-br ${type.color}`
                                                            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                                                        }`}
                                                >
                                                    <span className="text-5xl mb-4 block">{type.icon}</span>
                                                    <h3 className={`text-xl font-bold mb-2 ${formData.type === type.id ? 'text-white' : 'text-white group-hover:text-primary-400'}`}>
                                                        {type.label}
                                                    </h3>
                                                    <p className={`text-sm ${formData.type === type.id ? 'text-white/80' : 'text-slate-400'}`}>
                                                        {type.desc}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Details */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white mb-6">
                                            <WaveText text="Item Details" />
                                        </h2>

                                        <div className="form-field">
                                            <label className="block text-slate-400 text-sm mb-2">Title *</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="e.g., Blue iPhone 15 Pro"
                                                className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label className="block text-slate-400 text-sm mb-2">Category *</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, category: cat })}
                                                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${formData.category === cat
                                                                ? 'bg-primary-600 text-white'
                                                                : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:border-slate-600'
                                                            }`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="form-field">
                                            <label className="block text-slate-400 text-sm mb-2">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Describe the item in detail (color, brand, distinguishing features...)"
                                                rows={4}
                                                className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Location & Date */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white mb-6">
                                            <WaveText text="Where & When?" />
                                        </h2>

                                        <div className="form-field">
                                            <label className="block text-slate-400 text-sm mb-2 flex items-center gap-2">
                                                <MapPin size={16} className="text-cyan-400" />
                                                Zone *
                                            </label>
                                            <select
                                                value={formData.location.zone}
                                                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, zone: e.target.value } })}
                                                className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                            >
                                                <option value="">Select a zone</option>
                                                {zones.map(zone => (
                                                    <option key={zone._id} value={zone.name}>{zone.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-field">
                                            <label className="block text-slate-400 text-sm mb-2">Building / Room (Optional)</label>
                                            <input
                                                type="text"
                                                value={formData.location.building}
                                                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, building: e.target.value } })}
                                                placeholder="e.g., AB1, Room 302"
                                                className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label className="block text-slate-400 text-sm mb-2 flex items-center gap-2">
                                                <Calendar size={16} className="text-violet-400" />
                                                Date {formData.type === 'lost' ? 'Lost' : 'Found'} *
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.date}
                                                max={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label className="block text-slate-400 text-sm mb-2">Additional Location Details</label>
                                            <textarea
                                                value={formData.location.details}
                                                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, details: e.target.value } })}
                                                placeholder="Any other details that might help locate the item..."
                                                rows={3}
                                                className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Images */}
                                {step === 4 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white mb-6">
                                            <WaveText text="Add Photos" />
                                        </h2>

                                        <p className="text-slate-400 mb-6">
                                            Upload up to 5 images to help identify the item. Clear photos increase the chance of recovery!
                                        </p>

                                        {/* Upload Area */}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="form-field border-2 border-dashed border-slate-600 rounded-2xl p-10 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-500/5 transition-all group"
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                            <div className="inline-flex p-5 bg-slate-800/50 rounded-2xl mb-4 group-hover:bg-primary-500/20 transition-colors">
                                                <Upload size={32} className="text-slate-400 group-hover:text-primary-400 transition-colors" />
                                            </div>
                                            <p className="text-white font-semibold mb-2">Click to upload or drag and drop</p>
                                            <p className="text-slate-500 text-sm">PNG, JPG up to 5MB each • Max 5 images</p>
                                        </div>

                                        {/* Image Previews */}
                                        {imagePreviews.length > 0 && (
                                            <div className="form-field grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                                {imagePreviews.map((preview, i) => (
                                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                                                        <img src={preview} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(i)}
                                                            className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* AI Tip */}
                                        <div className="form-field p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Sparkles size={20} className="text-purple-400" />
                                                <span className="font-bold text-white">AI Tip</span>
                                            </div>
                                            <p className="text-slate-400 text-sm">
                                                Our AI analyzes images to match lost and found items. Clear, well-lit photos of unique features significantly improve matching accuracy.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation */}
                                <div className="flex gap-4 mt-10">
                                    {step > 1 && (
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="flex-1 py-4 border border-slate-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                                        >
                                            <ArrowLeft size={18} />
                                            Back
                                        </button>
                                    )}

                                    {step < 4 ? (
                                        <ParticleExplosion className="flex-1">
                                            <ElasticButton
                                                onClick={handleNext}
                                                className="w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 group shadow-lg shadow-primary-500/25"
                                            >
                                                Continue
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </ElasticButton>
                                        </ParticleExplosion>
                                    ) : (
                                        <ParticleExplosion className="flex-1">
                                            <ElasticButton
                                                onClick={handleSubmit}
                                                disabled={loading}
                                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/25"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        Submit Report
                                                        <CheckCircle size={18} />
                                                    </>
                                                )}
                                            </ElasticButton>
                                        </ParticleExplosion>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TiltCard>
                </div>
            </main>
        </div>
    );
};

export default ReportItem;