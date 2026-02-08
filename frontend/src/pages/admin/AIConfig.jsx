import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { usePageTransition } from '../../hooks/useGSAPAnimations';
import {
    ArrowLeft,
    Save,
    Loader2,
    Sliders,
    Cpu,
    RefreshCw,
    Zap,
    BrainCircuit,
    Eye,
    Map,
    Clock
} from 'lucide-react';

const AIConfig = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [config, setConfig] = useState({
        thresholds: { autoApprove: 90, partialMatch: 70 },
        weights: { text: 70, image: 85, location: 90, time: 50 },
    });

    const containerRef = useRef(null);
    const panelsRef = useRef(null);

    usePageTransition(containerRef);

    useEffect(() => {
        fetchConfig();
    }, []);

    // Animate panels on load
    useEffect(() => {
        if (!loading && panelsRef.current) {
            gsap.fromTo(panelsRef.current.children,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
            );
        }
    }, [loading]);

    const fetchConfig = async () => {
        try {
            const res = await api.get('/v1/admin/ai-config');
            if (res.data) {
                setConfig({
                    thresholds: res.data.thresholds || config.thresholds,
                    weights: res.data.weights || config.weights,
                });
            }
        } catch (error) {
            console.error('Failed to fetch AI config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await api.put('/v1/admin/ai-config', config);
            setSuccess('Configuration saved successfully!');
            setTimeout(() => setSuccess(''), 3000);

            // Pulse animation on save
            gsap.fromTo('.save-button',
                { scale: 0.95 },
                { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' }
            );

        } catch (error) {
            console.error('Failed to save config:', error);
            setError('Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleThresholdChange = (key, value) => {
        setConfig(prev => ({
            ...prev,
            thresholds: { ...prev.thresholds, [key]: parseInt(value) }
        }));
    };

    const handleWeightChange = (key, value) => {
        setConfig(prev => ({
            ...prev,
            weights: { ...prev.weights, [key]: parseInt(value) }
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#020617]">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex bg-[#020617] min-h-screen">
            <AdminSidebar />
            <div ref={containerRef} className="flex-1 p-8 overflow-y-auto h-screen custom-scrollbar">
                <div className="max-w-5xl mx-auto pb-20">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <Link to="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-2 transition-colors">
                                <ArrowLeft size={16} /> Back to Dashboard
                            </Link>
                            <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                                <BrainCircuit className="text-purple-500" size={40} />
                                AI Engine Config
                            </h1>
                            <p className="text-slate-400 mt-2 text-lg">Tune algorithm precision and matching heuristics</p>
                        </div>
                        <div className="hidden md:block">
                            <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center gap-2">
                                <Zap size={16} className="text-purple-400" />
                                <span className="text-purple-300 font-mono text-sm">Engine Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    {success && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-300 animate-in fade-in slide-in-from-top-2">{success}</div>}
                    {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 animate-in fade-in slide-in-from-top-2">{error}</div>}

                    <div ref={panelsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Thresholds Panel */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <Sliders className="text-blue-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Confidence Thresholds</h2>
                                    <p className="text-slate-500 text-sm">Set strictness for automated decisions</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="relative group">
                                    <div className="flex justify-between mb-4">
                                        <label className="text-slate-300 font-medium">Auto-Approve</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-blue-400 font-mono">{config.thresholds.autoApprove}%</span>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300"
                                            style={{ width: `${config.thresholds.autoApprove}%` }}
                                        />
                                        <input
                                            type="range"
                                            min="50"
                                            max="100"
                                            value={config.thresholds.autoApprove}
                                            onChange={(e) => handleThresholdChange('autoApprove', e.target.value)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-slate-500 text-xs mt-3">Matches above this score are instantly verified without human review.</p>
                                </div>

                                <div className="relative group">
                                    <div className="flex justify-between mb-4">
                                        <label className="text-slate-300 font-medium">Partial Match (Review)</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-yellow-400 font-mono">{config.thresholds.partialMatch}%</span>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative">
                                        <div
                                            className="h-full bg-gradient-to-r from-yellow-600 to-orange-400 rounded-full transition-all duration-300"
                                            style={{ width: `${config.thresholds.partialMatch}%` }}
                                        />
                                        <input
                                            type="range"
                                            min="30"
                                            max="90"
                                            value={config.thresholds.partialMatch}
                                            onChange={(e) => handleThresholdChange('partialMatch', e.target.value)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-slate-500 text-xs mt-3">Matches in this range are flagged for manual admin approval.</p>
                                </div>
                            </div>
                        </div>

                        {/* Weights Panel */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-purple-500/10 rounded-xl">
                                    <RefreshCw className="text-purple-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Feature Weights</h2>
                                    <p className="text-slate-500 text-sm">Adjust importance of data points</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { key: 'text', label: 'Description Text', icon: Cpu, color: 'blue' },
                                    { key: 'image', label: 'Visual Similarity', icon: Eye, color: 'purple' },
                                    { key: 'location', label: 'Geolocation', icon: Map, color: 'emerald' },
                                    { key: 'time', label: 'Time Window', icon: Clock, color: 'amber' },
                                ].map((feature) => (
                                    <div key={feature.key} className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <feature.icon size={16} className={`text-${feature.color}-400`} />
                                                <span className="font-medium">{feature.label}</span>
                                            </div>
                                            <span className={`text-${feature.color}-400 font-mono font-bold`}>{config.weights[feature.key]}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                                            <div
                                                className={`h-full bg-${feature.color}-500 rounded-full transition-all duration-300`}
                                                style={{ width: `${config.weights[feature.key]}%` }}
                                            />
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={config.weights[feature.key]}
                                                onChange={(e) => handleWeightChange(feature.key, e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 flex items-center justify-between bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                        <div className="text-sm text-slate-500">
                            <span className="text-white font-medium">Auto-save inactive.</span> Please confirm changes manually.
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="save-button px-8 py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-slate-200 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                            {saving ? 'Updating Engine...' : 'Apply Configuration'}
                        </button>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default AIConfig;
