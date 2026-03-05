/**
 * @module pages/ReportItem
 * @description Multi-step item reporting form for lost/found items with image upload and zone selection.
 */

import { gsap } from 'gsap';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Calendar,
    CheckCircle,
    Loader2,
    MapPin,
    Package,
    Sparkles,
    Upload,
    X
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
    ElasticButton,
    GlitchText,
    MorphingBlob,
    NeonText,
    ParticleExplosion,
    PulseRings,
    TiltCard,
    WaveText
} from '../effects';
import api from '../services/api';

const categories = [
    'Electronics', 'Documents', 'Accessories', 'Clothing',
    'Keys', 'Bags', 'Books', 'Sports Equipment', 'Appliances',
    'Storage Device', 'Identification', 'Computing Device', 'Other'
];

const steps = [
    { num: 1, label: 'Type' },
    { num: 2, label: 'Details' },
    { num: 3, label: 'Location' },
    { num: 4, label: 'Images' }
];

const ReportItem = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [embeddingResult, setEmbeddingResult] = useState(null);

    // Category validation state
    const [categoryValidation, setCategoryValidation] = useState(null);
    const [validatingCategory, setValidatingCategory] = useState(false);
    const validationTimerRef = useRef(null);

    // Image upload + YOLO validation state
    const [uploadedImageUrls, setUploadedImageUrls] = useState([]); // [{url, publicId}]
    const [imageWarnings, setImageWarnings] = useState([]);          // string | null per image
    const [validationResults, setValidationResults] = useState([]);  // Full AI response per image
    const [uploadingImages, setUploadingImages] = useState(new Set()); // indices currently uploading

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

    // AI Validation derived state (uses index 0 since we only allow 1 image)
    const imageStatus = uploadingImages.has(0) ? 'validating' : (uploadedImageUrls[0] ? (imageWarnings[0] ? 'flagged' : 'clean') : 'idle');
    const validationWarning = imageWarnings[0];
    const validationDetail = validationResults[0];

    // Helper to render validation UI
    const renderValidationFeedback = () => {
        if (imageStatus === 'validating') {
            return (
                <div className="flex items-center space-x-2 text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    <span className="font-semibold">AI is analyzing your photo...</span>
                </div>
            );
        }

        const counts = validationDetail?.labelCounts || {};
        const countEntries = Object.entries(counts);

        console.log('[Frontend] Rendering validation feedback. Detail:', validationDetail);

        return (
            <div className="space-y-4">
                <div className="pb-3 border-b border-slate-700/50">
                    <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-3 flex items-center gap-2">
                        <Sparkles size={14} /> AI Detection Results
                    </p>
                    {countEntries.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {countEntries.map(([label, count]) => (
                                <div key={label} className="px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/30 text-xs text-white font-medium flex items-center">
                                    <span className="bg-primary-500 text-white px-1.5 rounded mr-2 font-bold">{count}x</span>
                                    {label.replace(/_/g, ' ')}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 text-xs italic">
                            No objects identified by the YOLO models.
                        </div>
                    )}
                </div>

                {imageStatus === 'clean' && (
                    <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/20">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-bold">Valid Photo - Match Confirmed</span>
                    </div>
                )}

                {validationWarning && (
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-200 text-sm flex items-start space-x-2 shadow-inner">
                        <AlertCircle size={16} className="mt-0.5 text-orange-400 shrink-0" />
                        <span className="font-medium text-[13px] leading-relaxed">{validationWarning}</span>
                    </div>
                )}
            </div>
        );
    };

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

    // Debounced title-category validation via Groq AI
    const validateCategoryMatch = useCallback((title, category, description) => {
        // Clear any pending timer
        if (validationTimerRef.current) {
            clearTimeout(validationTimerRef.current);
        }

        // Reset if either field is empty
        if (!title.trim() || !category) {
            setCategoryValidation(null);
            setValidatingCategory(false);
            return;
        }

        setValidatingCategory(true);

        // Debounce: wait 600ms after user stops typing
        validationTimerRef.current = setTimeout(async () => {
            try {
                // Pass all categories to backend to check if "Other" should be promoted
                // Use a long timeout since Groq API + MiniLM can take 30-90s
                const res = await api.post('/v1/items/validate-category', {
                    title,
                    category,
                    description,
                    allCategories: categories
                }, { timeout: 180000 });
                setCategoryValidation(res.data);
            } catch (err) {
                console.error('Category validation error:', err);
                const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
                // Show a timed-out state instead of silently showing nothing
                setCategoryValidation(isTimeout
                    ? { confidence: -1, isValid: false, timedOut: true, title, category }
                    : null
                );
            } finally {
                setValidatingCategory(false);
            }
        }, 600);
    }, [categories]);

    // Trigger validation when title, category or description changes
    useEffect(() => {
        if (step === 2) {
            validateCategoryMatch(formData.title, formData.category, formData.description);
        }
        return () => {
            if (validationTimerRef.current) {
                clearTimeout(validationTimerRef.current);
            }
        };
    }, [formData.title, formData.category, formData.description, step, validateCategoryMatch]);

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

    // Handle image upload: upload to Cloudinary immediately, then run YOLO duplicate check
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        // Only 1 photo allowed
        const maxFiles = 1 - formData.images.length;

        if (maxFiles <= 0) {
            setError('Only 1 photo is allowed. Remove the existing photo first.');
            return;
        }

        const validFiles = files.slice(0, maxFiles).filter(file => {
            if (!file.type.startsWith('image/')) {
                setError('Please upload only image files');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;
        setError('');

        // For each file: add preview immediately, then upload + validate
        for (const file of validFiles) {
            // 1. Add local preview and a placeholder slot
            const previewUrl = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = ev => resolve(ev.target.result);
                reader.readAsDataURL(file);
            });

            // Capture the index this image will occupy
            const idx = await new Promise(resolveIdx => {
                setFormData(prev => {
                    const newIdx = prev.images.length;
                    resolveIdx(newIdx);
                    return { ...prev, images: [...prev.images, file] };
                });
            });

            setImagePreviews(prev => [...prev, previewUrl]);
            setUploadedImageUrls(prev => { const a = [...prev]; a[idx] = null; return a; });
            setImageWarnings(prev => { const a = [...prev]; a[idx] = null; return a; });
            setValidationResults(prev => { const a = [...prev]; a[idx] = null; return a; });
            setUploadingImages(prev => new Set(prev).add(idx));

            // 2. Upload to Cloudinary
            try {
                const imgFormData = new FormData();
                imgFormData.append('image', file);
                const uploadRes = await api.post('/v1/uploads/image', imgFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                const { url, publicId } = uploadRes.data.image;

                setUploadedImageUrls(prev => {
                    const a = [...prev];
                    a[idx] = { url, publicId };
                    return a;
                });

                // 3. YOLO semantic duplicate-object check (only if category + title are set)
                if (formData.category) {
                    try {
                        const yoloRes = await api.post('/v1/items/validate-image', {
                            imageUrl: url,
                            category: formData.category,
                            title: formData.title || '',
                            description: formData.description || '',
                        }, { timeout: 120000 });

                        setImageWarnings(prev => {
                            const a = [...prev];
                            a[idx] = (yoloRes.data.hasDuplicates || !yoloRes.data.itemDetected)
                                ? yoloRes.data.warning
                                : null;
                            return a;
                        });

                        setValidationResults(prev => {
                            const a = [...prev];
                            a[idx] = yoloRes.data;
                            return a;
                        });
                    } catch {
                        // YOLO check failing is non-fatal
                    }
                }
            } catch (uploadErr) {
                console.error('Image upload failed:', uploadErr);
                setError('One or more images failed to upload. Please try again.');
                // Remove the failed slot
                setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
                setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                setUploadedImageUrls(prev => prev.filter((_, i) => i !== idx));
                setImageWarnings(prev => prev.filter((_, i) => i !== idx));
                setValidationResults(prev => prev.filter((_, i) => i !== idx));
            } finally {
                setUploadingImages(prev => { const s = new Set(prev); s.delete(idx); return s; });
            }
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
        setImageWarnings(prev => prev.filter((_, i) => i !== index));
        setValidationResults(prev => prev.filter((_, i) => i !== index));
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
            // Find the selected zone to get its ID
            const selectedZone = zones.find(z => z.zoneName === formData.location.zone);
            if (!selectedZone) {
                setError('Please select a valid zone');
                setLoading(false);
                return;
            }

            // Images are already uploaded — collect their URLs from state
            const uploadedImageUrls_final = (uploadedImageUrls || [])
                .filter(Boolean)
                .map(entry => entry.url);
            console.log('Pre-uploaded image URLs:', uploadedImageUrls_final);

            // Build the payload in the format the backend expects
            const payload = {
                submissionType: formData.type, // 'lost' or 'found'
                itemAttributes: {
                    category: formData.category,
                    description: formData.description || `${formData.title} - ${formData.category} item`,
                    color: '',
                    material: '',
                    size: ''
                },
                location: {
                    type: 'Point',
                    coordinates: selectedZone.geoBoundary?.coordinates?.[0]?.[0] || [76.925, 10.903],
                    zoneId: selectedZone._id
                },
                timeMetadata: {
                    lostOrFoundAt: new Date(formData.date).toISOString(),
                    reportedAt: new Date().toISOString()
                },
                isAnonymous: false,
                images: uploadedImageUrls_final
            };

            // Ensure description meets minimum length requirement (10 chars)
            if (payload.itemAttributes.description.length < 10) {
                payload.itemAttributes.description = `${formData.title || 'Item'} - ${formData.category} reported on campus`;
            }

            console.log('Submitting payload:', JSON.stringify(payload, null, 2));

            // Submit the item as JSON (not FormData)
            const response = await api.post('/v1/items', payload);
            setEmbeddingResult(response.data?.embeddingResult || null);

            setSuccess(true);

            // Success animation — fade out the form card but do NOT auto-navigate
            // so the user can read the embedding success message first
            gsap.to('.form-container', {
                scale: 0.95,
                opacity: 0,
                y: -30,
                duration: 0.5,
                ease: 'power2.in',
            });

        } catch (err) {
            console.error('Submit error:', err.response?.data || err);
            // Show detailed validation errors if available
            const details = err.response?.data?.details;
            if (details && Array.isArray(details)) {
                setError(details.join(', '));
            } else {
                setError(err.response?.data?.error || 'Failed to report item');
            }
            gsap.to('.form-container', {
                x: [-15, 15, -10, 10, -5, 5, 0],
                duration: 0.6,
                ease: 'power2.inOut'
            });
        } finally {
            setLoading(false);
        }
    };



    if (success) {
        const hybrid = embeddingResult?.hybridEmbedding || [];
        const text = embeddingResult?.textEmbedding || [];
        const yolo = embeddingResult?.yoloResult || {};
        const detectedObjects = yolo.objects || [];
        const previewVals = hybrid.length > 0 ? hybrid : text;
        const firstVals = previewVals.slice(0, 8);

        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="relative inline-block mb-6">
                            <PulseRings size={120} color="#10b981" />
                            <CheckCircle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400" size={48} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-3">
                            <NeonText color="#10b981">Item Reported!</NeonText>
                        </h1>
                        <p className="text-slate-400 text-lg">Your report has been saved and is pending review.</p>
                    </div>

                    {/* Vectorisation Card */}
                    <div
                        style={{
                            background: 'rgba(15,23,42,0.75)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(16,185,129,0.25)',
                            boxShadow: '0 0 40px -10px rgba(16,185,129,0.3)'
                        }}
                        className="rounded-3xl p-8 mb-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Sparkles size={22} className="text-emerald-400" />
                            <h2 className="text-xl font-bold text-white">Vectorisation Complete</h2>
                            <span className="ml-auto text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                ✓ Embedded
                            </span>
                        </div>

                        {embeddingResult ? (
                            <div className="space-y-5">
                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: 'Hybrid Dim', value: hybrid.length || '—', color: '#a78bfa' },
                                        { label: 'Text Dim', value: text.length || '—', color: '#38bdf8' },
                                        { label: 'Proc. Time', value: embeddingResult.processingTimeMs ? `${embeddingResult.processingTimeMs} ms` : '—', color: '#34d399' },
                                    ].map(stat => (
                                        <div key={stat.label}
                                            className="rounded-xl p-4 text-center"
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                                        >
                                            <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Detected Objects */}
                                {detectedObjects.length > 0 && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">YOLO Detected Objects</p>
                                        <div className="flex flex-wrap gap-2">
                                            {detectedObjects.map((obj, i) => (
                                                <span key={i}
                                                    className="px-3 py-1 rounded-lg text-xs font-medium text-white"
                                                    style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
                                                >
                                                    {obj.label} ({(obj.confidence * 100).toFixed(1)}%)
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Embedding Preview */}
                                {firstVals.length > 0 && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                                            {hybrid.length > 0 ? 'Hybrid (OpenCLIP)' : 'Text (TF-IDF)'} Embedding — first {firstVals.length} of {previewVals.length} dims
                                        </p>
                                        <div className="rounded-xl p-4 font-mono text-sm overflow-x-auto"
                                            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}
                                        >
                                            <span className="text-violet-400">[</span>
                                            {firstVals.map((v, i) => (
                                                <span key={i}>
                                                    <span className="text-teal-300">{Number(v).toFixed(6)}</span>
                                                    {i < firstVals.length - 1 && <span className="text-slate-600">, </span>}
                                                </span>
                                            ))}
                                            <span className="text-slate-500"> …</span>
                                            <span className="text-violet-400">]</span>
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-slate-600 italic">
                                    Embeddings are stored in the database and used for AI similarity matching.
                                </p>
                            </div>
                        ) : (
                            <div className="text-slate-500 text-sm italic">
                                No image was uploaded — text embedding only. AI processing will run in the background.
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="text-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-105"
                        >
                            Go to Dashboard
                        </button>
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

                                        {/* AI Category Validation Feedback */}
                                        {validatingCategory && formData.title && formData.category && (
                                            <div className="form-field p-4 bg-slate-800/40 border border-slate-700 rounded-xl flex items-center gap-3">
                                                <Loader2 size={18} className="animate-spin text-primary-400" />
                                                <span className="text-slate-400 text-sm">AI is verifying title-category match... (may take 30-60s)</span>
                                            </div>
                                        )}

                                        {categoryValidation && !validatingCategory && (
                                            categoryValidation.timedOut ? (
                                                <div className="form-field p-4 bg-slate-800/40 border border-amber-500/30 rounded-xl flex items-center gap-3 text-amber-400">
                                                    <AlertCircle size={20} />
                                                    <span className="text-sm">AI validation timed out. You can still submit — the category match could not be verified.</span>
                                                </div>
                                            ) : (
                                                <div className={`form-field p-4 rounded-xl flex items-center gap-3 border ${categoryValidation.confidence > 70
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                    : categoryValidation.confidence >= 35
                                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                                                    }`}>
                                                    {categoryValidation.confidence > 70 ? (
                                                        <CheckCircle size={20} />
                                                    ) : (
                                                        <AlertCircle size={20} />
                                                    )}
                                                    <div>
                                                        <span className="text-sm font-medium">
                                                            {categoryValidation.confidence === 100 && formData.category.toLowerCase() === 'other'
                                                                ? '★ Superb choice! "Other" is the perfect category as no other matches were found.'
                                                                : categoryValidation.confidence > 70
                                                                    ? '✓ Great match! Title and category align well.'
                                                                    : categoryValidation.confidence >= 35
                                                                        ? '⚠ Intermediate match. This title might fit, but consider other categories.'
                                                                        : '✗ Poor match. Title and category seem mismatched.'
                                                            }
                                                        </span>
                                                        <span className="block text-xs mt-1 opacity-70">
                                                            AI confidence: {Number(categoryValidation.confidence).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        )}

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
                                                    <option key={zone._id} value={zone.zoneName}>{zone.zoneName}</option>
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
                                            Upload a clear photo of the item to help our AI identify it.
                                            {formData.images.length > 0 && (
                                                <span className="ml-2 text-emerald-400 font-semibold">
                                                    ✓ Photo uploaded
                                                </span>
                                            )}
                                        </p>

                                        {/* AI Validation Feedback */}
                                        {formData.images.length > 0 && (
                                            <div className="form-field p-4 bg-slate-800/40 border border-slate-700 rounded-xl">
                                                {renderValidationFeedback()}
                                            </div>
                                        )}

                                        {/* Upload Area — only shown when no image yet */}
                                        {formData.images.length === 0 && (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="form-field border-2 border-dashed border-slate-600 rounded-2xl p-10 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-500/5 transition-all group"
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                                <div className="inline-flex p-5 bg-slate-800/50 rounded-2xl mb-4 group-hover:bg-primary-500/20 transition-colors">
                                                    <Upload size={32} className="text-slate-400 group-hover:text-primary-400 transition-colors" />
                                                </div>
                                                <p className="text-white font-semibold mb-2">Click to upload photo</p>
                                                <p className="text-slate-500 text-sm">PNG, JPG up to 5MB • 1 photo only</p>
                                            </div>
                                        )}

                                        {/* Image Previews */}
                                        {imagePreviews.length > 0 && (
                                            <div className="form-field space-y-3">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                                    {imagePreviews.map((preview, i) => (
                                                        <div key={i} className="flex flex-col gap-1">
                                                            {/* Thumbnail */}
                                                            <div className={`relative aspect-square rounded-xl overflow-hidden group border-2 transition-all ${imageWarnings[i]
                                                                ? 'border-amber-500/70'
                                                                : uploadingImages.has(i)
                                                                    ? 'border-primary-500/50'
                                                                    : uploadedImageUrls[i]
                                                                        ? 'border-emerald-500/40'
                                                                        : 'border-slate-700'
                                                                }`}>
                                                                <img src={preview} alt="" className="w-full h-full object-cover" />

                                                                {/* Uploading overlay */}
                                                                {uploadingImages.has(i) && (
                                                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
                                                                        <Loader2 size={20} className="animate-spin text-primary-400" />
                                                                        <span className="text-xs text-white/80">Analyzing…</span>
                                                                    </div>
                                                                )}

                                                                {/* Uploaded + clean badge */}
                                                                {!uploadingImages.has(i) && uploadedImageUrls[i] && !imageWarnings[i] && (
                                                                    <div className="absolute top-1.5 left-1.5 bg-emerald-500 rounded-full p-0.5">
                                                                        <CheckCircle size={12} className="text-white" />
                                                                    </div>
                                                                )}

                                                                {/* Warning badge */}
                                                                {imageWarnings[i] && (
                                                                    <div className="absolute top-1.5 left-1.5 bg-amber-500 rounded-full p-0.5">
                                                                        <AlertCircle size={12} className="text-white" />
                                                                    </div>
                                                                )}

                                                                {/* Remove button */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeImage(i)}
                                                                    className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <X size={11} />
                                                                </button>
                                                            </div>

                                                            {/* Per-image warning text */}
                                                            {imageWarnings[i] && (
                                                                <p className="text-xs text-amber-400 leading-tight px-0.5">
                                                                    ⚠ {imageWarnings[i]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Summary warning if any image has duplicates */}
                                                {imageWarnings.some(Boolean) && (
                                                    <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-start gap-3 text-amber-400">
                                                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-sm font-semibold">AI Validation Warning</p>
                                                            <p className="text-xs mt-1 opacity-80">
                                                                Our AI has flagged a potential issue with your photo.
                                                                For best matching results, please review the specific warning
                                                                above and consider replacing the photo if it doesn't clearly
                                                                show only your reported item.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* AI Tip */}
                                        <div className="form-field p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Sparkles size={20} className="text-purple-400" />
                                                <span className="font-bold text-white">AI Tip</span>
                                            </div>
                                            <p className="text-slate-400 text-sm">
                                                Upload <strong className="text-white">1 clear photo</strong> of the item.
                                                Our AI scans it immediately — it will warn you if multiple similar objects
                                                are detected or if the photo doesn't appear to match your reported item.
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