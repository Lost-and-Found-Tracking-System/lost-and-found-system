import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
    Search,
    Filter,
    Grid,
    List,
    MapPin,
    Calendar,
    Loader2,
    Package,
} from 'lucide-react';

const CATEGORIES = [
    'All', 'Electronics', 'Documents', 'Accessories', 'Clothing',
    'Books', 'Keys', 'Bags', 'Sports Equipment', 'Other'
];

const ItemInventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [filters, setFilters] = useState({
        search: '',
        category: 'All',
        type: 'all', // all, lost, found
    });

    useEffect(() => {
        fetchItems();
    }, [filters.category, filters.type]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.category !== 'All') {
                params.append('category', filters.category);
            }
            if (filters.type !== 'all') {
                params.append('submissionType', filters.type);
            }
            params.append('limit', '50');

            const res = await api.get(`/v1/items?${params.toString()}`);
            setItems(res.data);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item => {
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
                item.itemAttributes?.description?.toLowerCase().includes(searchLower) ||
                item.itemAttributes?.category?.toLowerCase().includes(searchLower) ||
                item.trackingId?.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'bg-green-500/10 text-green-400 border-green-500/30';
            case 'matched': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'submitted': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    const getTypeColor = (type) => {
        return type === 'lost' 
            ? 'bg-red-500/10 text-red-400' 
            : 'bg-green-500/10 text-green-400';
    };

    return (
        <div className="min-h-screen bg-[#020617] p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Item Inventory</h1>
                        <p className="text-slate-400 mt-1">Browse all reported lost and found items</p>
                    </div>
                    <Link
                        to="/report"
                        className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                    >
                        Report Item
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 min-w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="flex gap-2">
                            {['all', 'lost', 'found'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilters({ ...filters, type })}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        filters.type === type
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* View Mode */}
                        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${
                                    viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400'
                                }`}
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${
                                    viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400'
                                }`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Category Pills */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilters({ ...filters, category: cat })}
                                className={`px-3 py-1 rounded-full text-sm transition-all ${
                                    filters.category === cat
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Count */}
                <p className="text-slate-400 mb-4">
                    Showing {filteredItems.length} items
                </p>

                {/* Loading */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
                        <p className="text-slate-400">Try adjusting your filters or search terms</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredItems.map((item) => (
                            <Link
                                key={item._id}
                                to={`/item/${item._id}`}
                                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-primary-500/50 transition-all group"
                            >
                                {/* Type Badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium uppercase ${getTypeColor(item.submissionType)}`}>
                                        {item.submissionType}
                                    </span>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                </div>

                                {/* Category */}
                                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                                    {item.itemAttributes?.category || 'Item'}
                                </h3>

                                {/* Description */}
                                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                                    {item.itemAttributes?.description || 'No description'}
                                </p>

                                {/* Meta */}
                                <div className="space-y-2 text-sm text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        {new Date(item.timeMetadata?.lostOrFoundAt || item.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} />
                                        {item.location?.zoneId?.zoneName || 'Campus'}
                                    </div>
                                </div>

                                {/* Tracking ID */}
                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <code className="text-xs text-slate-600">{item.trackingId}</code>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="space-y-3">
                        {filteredItems.map((item) => (
                            <Link
                                key={item._id}
                                to={`/item/${item._id}`}
                                className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-primary-500/50 transition-all"
                            >
                                <div className={`px-3 py-1 rounded-lg text-xs font-medium uppercase ${getTypeColor(item.submissionType)}`}>
                                    {item.submissionType}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-medium truncate">
                                        {item.itemAttributes?.category} - {item.itemAttributes?.description?.slice(0, 50)}...
                                    </h3>
                                    <p className="text-slate-500 text-sm">{item.trackingId}</p>
                                </div>
                                <div className="text-slate-500 text-sm">
                                    {new Date(item.timeMetadata?.lostOrFoundAt || item.createdAt).toLocaleDateString()}
                                </div>
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemInventory;
