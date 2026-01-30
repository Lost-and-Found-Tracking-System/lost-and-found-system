import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
    ArrowLeft,
    Save,
    Loader2,
    Sliders,
    Cpu,
    RefreshCw,
} from 'lucide-react';

const AIConfig = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [config, setConfig] = useState({
        thresholds: {
            autoApprove: 90,
            partialMatch: 70,
        },
        weights: {
            text: 70,
            image: 85,
            location: 90,
            time: 50,
        },
    });

    useEffect(() => {
        fetchConfig();
    }, []);

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
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/admin"
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-2 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Admin
                    </Link>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Cpu className="text-primary-400" />
                        AI Configuration
                    </h1>
                    <p className="text-slate-400 mt-1">Configure AI matching thresholds and feature weights</p>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                        {error}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Thresholds */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Sliders size={20} className="text-primary-400" />
                            Match Thresholds
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-slate-400">Auto-Approve Threshold</label>
                                    <span className="text-primary-400 font-mono">{config.thresholds.autoApprove}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="100"
                                    value={config.thresholds.autoApprove}
                                    onChange={(e) => handleThresholdChange('autoApprove', e.target.value)}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                />
                                <p className="text-slate-600 text-xs mt-1">
                                    Matches above this threshold are auto-approved
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-slate-400">Partial Match Threshold</label>
                                    <span className="text-yellow-400 font-mono">{config.thresholds.partialMatch}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="30"
                                    max="90"
                                    value={config.thresholds.partialMatch}
                                    onChange={(e) => handleThresholdChange('partialMatch', e.target.value)}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                />
                                <p className="text-slate-600 text-xs mt-1">
                                    Matches above this require manual review
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Feature Weights */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <RefreshCw size={20} className="text-primary-400" />
                            Feature Weights
                        </h2>

                        <div className="space-y-6">
                            {[
                                { key: 'text', label: 'Text Similarity', color: 'blue' },
                                { key: 'image', label: 'Image Similarity', color: 'purple' },
                                { key: 'location', label: 'Location Proximity', color: 'green' },
                                { key: 'time', label: 'Time Correlation', color: 'orange' },
                            ].map((feature) => (
                                <div key={feature.key}>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-slate-400">{feature.label}</label>
                                        <span className={`text-${feature.color}-400 font-mono`}>
                                            {config.weights[feature.key]}%
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={config.weights[feature.key]}
                                        onChange={(e) => handleWeightChange(feature.key, e.target.value)}
                                        className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-${feature.color}-500`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:bg-primary-500/50 transition-colors flex items-center gap-2"
                    >
                        {saving ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Save size={20} />
                        )}
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-slate-800/50 rounded-xl text-slate-400 text-sm">
                    <p className="font-medium text-white mb-2">How AI Matching Works:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>The AI compares lost and found items using multiple features</li>
                        <li>Each feature is weighted according to the settings above</li>
                        <li>Matches above the auto-approve threshold are automatically suggested</li>
                        <li>Partial matches require human review before processing</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AIConfig;
