import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import {
    MapPin,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    Loader2,
    AlertCircle,
    CheckCircle,
    Building,
    Trees,
    Compass
} from 'lucide-react';
import api from '../../services/api';
import { usePageTransition, useMagneticHover, use3DTilt } from '../../hooks/useGSAPAnimations';

const ZONE_TYPES = [
    { value: 'building', label: 'Building', icon: Building, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { value: 'outdoor', label: 'Outdoor', icon: Trees, color: 'text-green-400', bg: 'bg-green-500/10' },
];

const ZoneManagement = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [zones, setZones] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingZone, setEditingZone] = useState(null);
    const [formData, setFormData] = useState({
        zoneName: '',
        description: '',
        zoneType: 'building',
    });

    const containerRef = useRef(null);
    const formRef = useRef(null);
    const listRef = useRef(null);

    usePageTransition(containerRef);

    useEffect(() => {
        fetchZones();
    }, []);

    // Animate form open/close
    useEffect(() => {
        if (showForm && formRef.current) {
            gsap.fromTo(formRef.current,
                { height: 0, opacity: 0, scale: 0.95 },
                { height: 'auto', opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.2)' }
            );
        }
    }, [showForm]);

    // Animate list update
    useEffect(() => {
        if (!loading && listRef.current) {
            gsap.fromTo(listRef.current.children,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
            );
        }
    }, [zones, loading]);

    const fetchZones = async () => {
        setLoading(true);
        try {
            const response = await api.get('/v1/zones');
            setZones(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Failed to fetch zones:', err);
            setError('Failed to load zones');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setEditingZone(null);
        setFormData({ zoneName: '', description: '', zoneType: 'building' });
        setShowForm(true);
        setError('');
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEdit = (zone) => {
        setEditingZone(zone);
        setFormData({
            zoneName: zone.zoneName,
            description: zone.description || '',
            zoneType: zone.zoneType || 'building',
        });
        setShowForm(true);
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        if (formRef.current) {
            gsap.to(formRef.current, {
                height: 0, opacity: 0, scale: 0.95, duration: 0.3, onComplete: () => setShowForm(false)
            });
        } else {
            setShowForm(false);
        }
        setEditingZone(null);
        setFormData({ zoneName: '', description: '', zoneType: 'building' });
        setError('');
    };

    const handleSave = async () => {
        if (!formData.zoneName.trim()) {
            setError('Zone name is required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const defaultCoords = [76.925, 10.903];
            const offset = 0.001;

            const zoneData = {
                zoneName: formData.zoneName.trim(),
                description: formData.description.trim(),
                zoneType: formData.zoneType,
                geoBoundary: {
                    type: 'Polygon',
                    coordinates: [[
                        [defaultCoords[0] - offset, defaultCoords[1] - offset],
                        [defaultCoords[0] + offset, defaultCoords[1] - offset],
                        [defaultCoords[0] + offset, defaultCoords[1] + offset],
                        [defaultCoords[0] - offset, defaultCoords[1] + offset],
                        [defaultCoords[0] - offset, defaultCoords[1] - offset],
                    ]]
                }
            };

            if (editingZone) {
                await api.put(`/v1/zones/${editingZone._id}`, zoneData);
                setSuccess('Zone updated successfully');
            } else {
                await api.post('/v1/zones', zoneData);
                setSuccess('Zone created successfully');
            }

            await fetchZones();
            handleCancel();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Failed to save zone:', err);
            setError(err.response?.data?.error || 'Failed to save zone');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (zone) => {
        if (!window.confirm(`Are you sure you want to delete "${zone.zoneName}"?`)) return;

        // Animate removal first
        const el = document.getElementById(`zone-${zone._id}`);
        if (el) {
            await gsap.to(el, { scale: 0.8, opacity: 0, duration: 0.3 });
        }

        try {
            await api.delete(`/v1/zones/${zone._id}`);
            setZones(prev => prev.filter(z => z._id !== zone._id));
            setSuccess('Zone deleted');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Failed to delete zone:', err);
            setError(err.response?.data?.error || 'Failed to delete zone');
            // Revert visuals if failed (implied fetchZones or manual revert)
            await fetchZones();
        }
    };

    return (
        <div className="flex bg-[#020617] min-h-screen">
            <AdminSidebar />
            <div ref={containerRef} className="flex-1 p-8 overflow-y-auto h-screen custom-scrollbar">
                <div className="max-w-6xl mx-auto pb-20">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter">Campus Zones</h1>
                            <p className="text-slate-400 mt-2 text-lg">Define locations ensuring accurate item reporting</p>
                        </div>
                        {!showForm && (
                            <button
                                onClick={handleAddNew}
                                className="group relative px-6 py-4 bg-primary-600 rounded-2xl font-bold text-white overflow-hidden shadow-lg shadow-primary-500/20 hover:scale-105 transition-transform"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex items-center gap-2">
                                    <Plus size={22} />
                                    <span>Create New Zone</span>
                                </div>
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Messages */}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 flex items-center gap-3 animate-pulse">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-300 flex items-center gap-3">
                                <CheckCircle size={20} />
                                {success}
                            </div>
                        )}

                        {/* Form */}
                        {showForm && (
                            <div ref={formRef} className="overflow-hidden">
                                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative">
                                    <div className="absolute top-0 right-0 p-6 opacity-5">
                                        <Compass size={120} />
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        {editingZone ? <Edit2 size={20} className="text-primary-400" /> : <Plus size={20} className="text-primary-400" />}
                                        {editingZone ? 'Edit Zone Details' : 'Configure New Zone'}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                        <div>
                                            <label className="block text-slate-400 text-sm font-bold mb-2 ml-1">Zone Name</label>
                                            <input
                                                type="text"
                                                value={formData.zoneName}
                                                onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all placeholder-slate-600"
                                                placeholder="e.g., Central Library"
                                                autoFocus
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-sm font-bold mb-2 ml-1">Zone Type</label>
                                            <div className="flex gap-3">
                                                {ZONE_TYPES.map((type) => (
                                                    <button
                                                        key={type.value}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, zoneType: type.value })}
                                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all border ${formData.zoneType === type.value
                                                            ? `bg-primary-500 text-white border-primary-400 shadow-lg shadow-primary-500/20`
                                                            : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-600'
                                                            }`}
                                                    >
                                                        <type.icon size={18} />
                                                        {type.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-slate-400 text-sm font-bold mb-2 ml-1">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 resize-none h-24"
                                                placeholder="Optional details about this area..."
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-800/50">
                                        <button
                                            onClick={handleCancel}
                                            className="px-6 py-3 bg-slate-800/50 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors font-medium border border-transparent hover:border-slate-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            {editingZone ? 'Update Zone' : 'Save Zone'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* List */}
                        {loading ? (
                            <div className="py-20 flex justify-center">
                                <Loader2 size={40} className="text-primary-500 animate-spin" />
                            </div>
                        ) : zones.length === 0 ? (
                            <div className="text-center py-32 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl">
                                <MapPin size={64} className="mx-auto text-slate-700 mb-6" />
                                <h3 className="text-2xl font-bold text-white mb-2">No Zones Configured</h3>
                                <p className="text-slate-400 max-w-md mx-auto mb-8">
                                    Start by adding your first campus zone to enable location-based item tracking.
                                </p>
                                <button
                                    onClick={handleAddNew}
                                    className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 transition-colors"
                                >
                                    Create First Zone
                                </button>
                            </div>
                        ) : (
                            <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {zones.map((zone) => {
                                    const typeConfig = ZONE_TYPES.find(t => t.value === zone.zoneType) || ZONE_TYPES[0];
                                    const TypeIcon = typeConfig.icon;

                                    return (
                                        <div
                                            key={zone._id}
                                            id={`zone-${zone._id}`} // For delete animation
                                            className="group relative bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
                                        >
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(zone)}
                                                    className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-primary-500 hover:text-white transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(zone)}
                                                    className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="mb-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${typeConfig.bg} border border-white/5`}>
                                                    <TypeIcon size={28} className={typeConfig.color} />
                                                </div>
                                                <h3 className="text-xl font-bold text-white truncate pr-16">{zone.zoneName}</h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-800 text-slate-400`}>
                                                        {typeConfig.label}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-slate-500 text-sm line-clamp-2 h-10 mb-4">
                                                {zone.description || 'No description provided.'}
                                            </p>

                                            <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500 font-mono">
                                                <span>ID: {zone._id.slice(-6)}</span>
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    <span>Coords Configured</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZoneManagement;