import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import api from '../../services/api';

const ZONE_TYPES = [
    { value: 'building', label: 'Building', icon: Building },
    { value: 'outdoor', label: 'Outdoor', icon: Trees },
];

const ZoneManagement = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Zones data
    const [zones, setZones] = useState([]);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingZone, setEditingZone] = useState(null);
    const [formData, setFormData] = useState({
        zoneName: '',
        description: '',
        zoneType: 'building',
    });

    // Fetch zones
    useEffect(() => {
        fetchZones();
    }, []);

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

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            navigate('/login');
        }
    };

    // Open form for new zone
    const handleAddNew = () => {
        setEditingZone(null);
        setFormData({
            zoneName: '',
            description: '',
            zoneType: 'building',
        });
        setShowForm(true);
        setError('');
    };

    // Open form for editing
    const handleEdit = (zone) => {
        setEditingZone(zone);
        setFormData({
            zoneName: zone.zoneName,
            description: zone.description || '',
            zoneType: zone.zoneType || 'building',
        });
        setShowForm(true);
        setError('');
    };

    // Cancel form
    const handleCancel = () => {
        setShowForm(false);
        setEditingZone(null);
        setFormData({ zoneName: '', description: '', zoneType: 'building' });
        setError('');
    };

    // Save zone (create or update)
    const handleSave = async () => {
        if (!formData.zoneName.trim()) {
            setError('Zone name is required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            // Create default geoBoundary (can be enhanced with actual map picker later)
            const defaultCoords = [76.925, 10.903]; // Amrita Coimbatore center
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
                // Update existing zone
                await api.put(`/v1/zones/${editingZone._id}`, zoneData);
                setSuccess('Zone updated successfully');
            } else {
                // Create new zone
                await api.post('/v1/zones', zoneData);
                setSuccess('Zone created successfully');
            }

            // Refresh zones list
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

    // Delete zone
    const handleDelete = async (zone) => {
        if (!window.confirm(`Are you sure you want to delete "${zone.zoneName}"?`)) {
            return;
        }

        try {
            await api.delete(`/v1/zones/${zone._id}`);
            setSuccess('Zone deleted successfully');
            await fetchZones();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Failed to delete zone:', err);
            setError(err.response?.data?.error || 'Failed to delete zone');
        }
    };

    return (
        <>
            <AdminSidebar />
            <div className="min-h-screen bg-slate-950">
                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    {/* Header */}
                    <header className="bg-slate-900 border-b border-slate-800 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Zone Management</h1>
                                <p className="text-slate-400 text-sm mt-1">Manage campus zones and locations</p>
                            </div>
                            <button
                                onClick={handleAddNew}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl transition-colors"
                            >
                                <Plus size={20} />
                                Add Zone
                            </button>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="p-8">
                        {/* Messages */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-3">
                                <AlertCircle size={20} />
                                {error}
                                <button onClick={() => setError('')} className="ml-auto">
                                    <X size={18} />
                                </button>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 flex items-center gap-3">
                                <CheckCircle size={20} />
                                {success}
                            </div>
                        )}

                        {/* Add/Edit Form */}
                        {showForm && (
                            <div className="mb-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    {editingZone ? 'Edit Zone' : 'Add New Zone'}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Zone Name */}
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">Zone Name *</label>
                                        <input
                                            type="text"
                                            value={formData.zoneName}
                                            onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                            placeholder="e.g., AB-1 (Academic Block 1)"
                                        />
                                    </div>

                                    {/* Zone Type */}
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">Zone Type</label>
                                        <div className="flex gap-3">
                                            {ZONE_TYPES.map((type) => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, zoneType: type.value })}
                                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${formData.zoneType === type.value
                                                        ? 'bg-yellow-500 text-black'
                                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                        }`}
                                                >
                                                    <type.icon size={18} />
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <label className="block text-slate-400 text-sm mb-2">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 resize-none"
                                            rows={2}
                                            placeholder="Optional description of this zone"
                                        />
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500/50 text-black font-semibold rounded-xl transition-colors"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                {editingZone ? 'Update Zone' : 'Create Zone'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Zones List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 size={40} className="animate-spin text-yellow-500" />
                            </div>
                        ) : zones.length === 0 ? (
                            <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
                                <MapPin size={60} className="mx-auto text-slate-600 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No Zones Created</h3>
                                <p className="text-slate-400 mb-6">
                                    Create campus zones so users can report lost/found items with locations
                                </p>
                                <button
                                    onClick={handleAddNew}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl transition-colors"
                                >
                                    <Plus size={20} />
                                    Create First Zone
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {zones.map((zone) => {
                                    const TypeIcon = zone.zoneType === 'outdoor' ? Trees : Building;

                                    return (
                                        <div
                                            key={zone._id}
                                            className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-3 rounded-xl ${zone.zoneType === 'outdoor'
                                                    ? 'bg-green-500/20'
                                                    : 'bg-blue-500/20'
                                                    }`}>
                                                    <TypeIcon size={24} className={
                                                        zone.zoneType === 'outdoor'
                                                            ? 'text-green-400'
                                                            : 'text-blue-400'
                                                    } />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-semibold truncate">
                                                        {zone.zoneName}
                                                    </h4>
                                                    <p className="text-slate-500 text-sm capitalize">
                                                        {zone.zoneType || 'building'}
                                                    </p>
                                                    {zone.description && (
                                                        <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                                                            {zone.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800">
                                                <button
                                                    onClick={() => handleEdit(zone)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(zone)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Info */}
                        {zones.length > 0 && (
                            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
                                <p className="text-slate-400 text-sm">
                                    <span className="text-white font-medium">{zones.length}</span> zones configured.
                                    Users can select these locations when reporting lost or found items.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default ZoneManagement;