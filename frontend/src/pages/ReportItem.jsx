import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CampusMap from '../components/CampusMap';
import {
    Package,
    MapPin,
    Calendar,
    FileText,
    Upload,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
    Save,
    AlertCircle,
} from 'lucide-react';

const CATEGORIES = [
    'Electronics', 'Documents', 'Accessories', 'Clothing',
    'Books', 'Keys', 'Bags', 'Sports Equipment', 'Other'
];

const ReportItem = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [trackingId, setTrackingId] = useState('');
    const [zones, setZones] = useState([]);

    const [formData, setFormData] = useState({
        submissionType: 'lost',
        itemAttributes: {
            category: '',
            color: '',
            material: '',
            size: '',
            description: '',
        },
        location: {
            type: 'Point',
            coordinates: [0, 0],
            zoneId: '',
        },
        timeMetadata: {
            lostOrFoundAt: new Date().toISOString().split('T')[0],
            reportedAt: new Date().toISOString(),
        },
        isAnonymous: false,
        images: [],
    });

    // Fetch zones and draft on mount
    useEffect(() => {
        fetchZones();
        fetchDraft();
    }, []);

    const fetchZones = async () => {
        try {
            const res = await api.get('/v1/zones');
            setZones(res.data);
        } catch (error) {
            console.error('Failed to fetch zones:', error);
        }
    };

    const fetchDraft = async () => {
        try {
            const res = await api.get('/v1/items/drafts/me');
            if (res.data && res.data.partialData) {
                setFormData(prev => ({ ...prev, ...res.data.partialData }));
            }
        } catch (error) {
            // No draft exists, that's fine
        }
    };

    const saveDraft = async () => {
        setSavingDraft(true);
        try {
            await api.post('/v1/items/drafts', { partialData: formData });
            setSuccess('Draft saved!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Failed to save draft:', error);
        } finally {
            setSavingDraft(false);
        }
    };

    const handleZoneSelect = (zone) => {
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                zoneId: zone.id,
                coordinates: zone.coordinates || [0, 0],
            }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            // Validate required fields
            if (!formData.itemAttributes.category) {
                throw new Error('Please select a category');
            }
            if (!formData.itemAttributes.description || formData.itemAttributes.description.length < 10) {
                throw new Error('Description must be at least 10 characters');
            }
            if (!formData.location.zoneId) {
                throw new Error('Please select a location');
            }

            const res = await api.post('/v1/items', {
                ...formData,
                timeMetadata: {
                    lostOrFoundAt: new Date(formData.timeMetadata.lostOrFoundAt).toISOString(),
                    reportedAt: new Date().toISOString(),
                }
            });

            setTrackingId(res.data.trackingId);
            
            // Delete draft after successful submission
            try {
                await api.delete('/v1/items/drafts/me');
            } catch (e) {
                // Ignore draft deletion errors
            }

            setStep(4); // Success step
        } catch (error) {
            console.error('Submit error:', error);
            setError(error.response?.data?.error || error.message || 'Failed to submit item');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">What happened?</h3>
            
            {/* Lost or Found */}
            <div className="flex gap-4">
                {['lost', 'found'].map((type) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, submissionType: type }))}
                        className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                            formData.submissionType === type
                                ? 'bg-primary-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        I {type} something
                    </button>
                ))}
            </div>

            {/* Category */}
            <div>
                <label className="block text-slate-400 text-sm mb-2">Category *</label>
                <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setFormData(prev => ({
                                ...prev,
                                itemAttributes: { ...prev.itemAttributes, category: cat }
                            }))}
                            className={`py-2 px-3 rounded-lg text-sm transition-all ${
                                formData.itemAttributes.category === cat
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-slate-400 text-sm mb-2">Description * (min 10 characters)</label>
                <textarea
                    value={formData.itemAttributes.description}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        itemAttributes: { ...prev.itemAttributes, description: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 resize-none"
                    rows={4}
                    placeholder="Describe the item in detail..."
                />
            </div>

            {/* Additional Attributes */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-slate-400 text-sm mb-2">Color</label>
                    <input
                        type="text"
                        value={formData.itemAttributes.color}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            itemAttributes: { ...prev.itemAttributes, color: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        placeholder="e.g., Black"
                    />
                </div>
                <div>
                    <label className="block text-slate-400 text-sm mb-2">Material</label>
                    <input
                        type="text"
                        value={formData.itemAttributes.material}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            itemAttributes: { ...prev.itemAttributes, material: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        placeholder="e.g., Leather"
                    />
                </div>
                <div>
                    <label className="block text-slate-400 text-sm mb-2">Size</label>
                    <input
                        type="text"
                        value={formData.itemAttributes.size}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            itemAttributes: { ...prev.itemAttributes, size: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        placeholder="e.g., Medium"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Where and When?</h3>

            {/* Location */}
            <div>
                <label className="block text-slate-400 text-sm mb-2">Location *</label>
                <CampusMap
                    zones={zones}
                    selectedZone={formData.location.zoneId}
                    onZoneSelect={handleZoneSelect}
                />
            </div>

            {/* Date */}
            <div>
                <label className="block text-slate-400 text-sm mb-2">Date {formData.submissionType} *</label>
                <input
                    type="date"
                    value={formData.timeMetadata.lostOrFoundAt}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        timeMetadata: { ...prev.timeMetadata, lostOrFoundAt: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                />
            </div>

            {/* Anonymous */}
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="anonymous" className="text-slate-400">
                    Submit anonymously (your identity will be hidden from other users)
                </label>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Review & Submit</h3>

            <div className="bg-slate-800/50 rounded-xl p-6 space-y-4">
                <div className="flex justify-between">
                    <span className="text-slate-400">Type</span>
                    <span className="text-white capitalize">{formData.submissionType}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Category</span>
                    <span className="text-white">{formData.itemAttributes.category}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Description</span>
                    <span className="text-white text-right max-w-xs truncate">{formData.itemAttributes.description}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Location</span>
                    <span className="text-white">
                        {zones.find(z => z._id === formData.location.zoneId)?.zoneName || 'Selected'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Date</span>
                    <span className="text-white">{formData.timeMetadata.lostOrFoundAt}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Anonymous</span>
                    <span className="text-white">{formData.isAnonymous ? 'Yes' : 'No'}</span>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}
        </div>
    );

    const renderSuccess = () => (
        <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Item Reported Successfully!</h3>
            <p className="text-slate-400 mb-6">Your tracking ID is:</p>
            <div className="bg-slate-800 rounded-xl p-4 inline-block mb-8">
                <code className="text-2xl text-primary-400 font-mono">{trackingId}</code>
            </div>
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
                    Browse Items
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Report an Item</h1>
                    <p className="text-slate-400 mt-1">Help us help you find your belongings</p>
                </div>

                {/* Progress Steps */}
                {step < 4 && (
                    <div className="flex items-center gap-4 mb-8">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                    step >= s ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-500'
                                }`}>
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div className={`flex-1 h-1 rounded ${step > s ? 'bg-primary-500' : 'bg-slate-800'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderSuccess()}

                    {/* Navigation */}
                    {step < 4 && (
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
                            <div className="flex gap-2">
                                {step > 1 && (
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <ChevronLeft size={20} />
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={saveDraft}
                                    disabled={savingDraft}
                                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                                >
                                    {savingDraft ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save Draft
                                </button>
                            </div>

                            {success && <span className="text-green-400 text-sm">{success}</span>}

                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:bg-primary-500/50 transition-colors flex items-center gap-2"
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                                    {loading ? 'Submitting...' : 'Submit Report'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportItem;
