import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Grid, List, MapPin, Clock, Tag, Loader2, Package, AlertCircle } from 'lucide-react';
import api from '../services/api';

const CATEGORIES = [
    'All',
    'Electronics',
    'Documents',
    'Accessories',
    'Clothing',
    'Books',
    'Keys',
    'Bags',
    'Sports Equipment',
    'Other',
];

const ItemInventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    // Filters
    const [filters, setFilters] = useState({
        q: '',
        submissionType: 'all',
        category: 'All',
        status: '',
    });

    // Debounced search
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, q: searchInput }));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Fetch items
    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            setError('');

            try {
                // Build query params
                const params = new URLSearchParams();
                
                if (filters.q) {
                    params.append('q', filters.q);
                }
                if (filters.submissionType && filters.submissionType !== 'all') {
                    params.append('submissionType', filters.submissionType);
                }
                if (filters.category && filters.category !== 'All') {
                    params.append('category', filters.category);
                }
                if (filters.status) {
                    params.append('status', filters.status);
                }
                params.append('page', pagination.page.toString());
                params.append('limit', pagination.limit.toString());

                const response = await api.get(`/v1/items?${params.toString()}`);
                
                // Backend returns { items, pagination }
                const data = response.data;
                
                if (data.items) {
                    setItems(data.items);
                    setPagination((prev) => ({
                        ...prev,
                        total: data.pagination?.total || 0,
                        totalPages: data.pagination?.totalPages || 0,
                    }));
                } else if (Array.isArray(data)) {
                    // Fallback if backend returns just array
                    setItems(data);
                } else {
                    setItems([]);
                }
            } catch (err) {
                console.error('Failed to fetch items:', err);
                setError(err.response?.data?.error || 'Failed to load items');
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [filters, pagination.page, pagination.limit]);

    // Handle category click
    const handleCategoryClick = (category) => {
        setFilters((prev) => ({ ...prev, category }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    // Handle type filter
    const handleTypeFilter = (type) => {
        setFilters((prev) => ({ ...prev, submissionType: type }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    // Get status badge style
    const getStatusBadge = (status) => {
        switch (status) {
            case 'resolved':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'matched':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'submitted':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'draft':
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    // Get type badge style
    const getTypeBadge = (type) => {
        return type === 'lost'
            ? 'bg-red-500/20 text-red-400 border-red-500/30'
            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Item Inventory</h1>
                            <p className="text-slate-400 text-sm mt-1">
                                Browse all reported lost and found items
                            </p>
                        </div>
                        <Link
                            to="/dashboard"
                            className="text-slate-400 hover:text-white text-sm"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search items..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="flex gap-2">
                            {['all', 'lost', 'found'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleTypeFilter(type)}
                                    className={`px-4 py-3 rounded-xl font-medium transition-colors capitalize ${
                                        filters.submissionType === type
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    {type === 'all' ? 'All' : type}
                                </button>
                            ))}
                        </div>

                        {/* View Toggle */}
                        <div className="flex bg-slate-800 rounded-xl p-1">
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
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategoryClick(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                    filters.category === category
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-3">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={40} className="animate-spin text-primary-500" />
                    </div>
                ) : items.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-20">
                        <Package size={60} className="mx-auto text-slate-600 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
                        <p className="text-slate-400">
                            {filters.q || filters.category !== 'All' || filters.submissionType !== 'all'
                                ? 'Try adjusting your filters'
                                : 'No items have been reported yet'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Results Count */}
                        <div className="mb-4 text-slate-400 text-sm">
                            Showing {items.length} of {pagination.total} items
                        </div>

                        {/* Grid View */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {items.map((item) => (
                                    <Link
                                        key={item._id}
                                        to={`/item/${item._id}`}
                                        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors group"
                                    >
                                        {/* Image or Placeholder */}
                                        <div className="h-40 bg-slate-800 flex items-center justify-center">
                                            {item.images && item.images.length > 0 ? (
                                                <img
                                                    src={item.images[0]}
                                                    alt={item.itemAttributes?.description}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Package size={40} className="text-slate-600" />
                                            )}
                                        </div>

                                        <div className="p-4">
                                            {/* Badges */}
                                            <div className="flex gap-2 mb-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeBadge(item.submissionType)}`}>
                                                    {item.submissionType?.toUpperCase()}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </div>

                                            {/* Category */}
                                            <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
                                                <Tag size={12} />
                                                {item.itemAttributes?.category || 'Uncategorized'}
                                            </div>

                                            {/* Description */}
                                            <p className="text-white text-sm line-clamp-2 mb-3">
                                                {item.itemAttributes?.description || 'No description'}
                                            </p>

                                            {/* Meta */}
                                            <div className="flex items-center justify-between text-xs text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {formatDate(item.timeMetadata?.lostOrFoundAt)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    {item.location?.zoneId?.zoneName || 'Unknown'}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            /* List View */
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <Link
                                        key={item._id}
                                        to={`/item/${item._id}`}
                                        className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
                                    >
                                        {/* Image or Placeholder */}
                                        <div className="w-20 h-20 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                            {item.images && item.images.length > 0 ? (
                                                <img
                                                    src={item.images[0]}
                                                    alt={item.itemAttributes?.description}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <Package size={24} className="text-slate-600" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getTypeBadge(item.submissionType)}`}>
                                                    {item.submissionType?.toUpperCase()}
                                                </span>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusBadge(item.status)}`}>
                                                    {item.status}
                                                </span>
                                                <span className="text-slate-500 text-xs">
                                                    {item.itemAttributes?.category}
                                                </span>
                                            </div>
                                            <p className="text-white text-sm truncate">
                                                {item.itemAttributes?.description || 'No description'}
                                            </p>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {formatDate(item.timeMetadata?.lostOrFoundAt)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    {item.location?.zoneId?.zoneName || 'Unknown'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tracking ID */}
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-xs text-slate-500">Tracking ID</div>
                                            <div className="text-sm text-primary-400 font-mono">
                                                {item.trackingId?.slice(-8) || 'N/A'}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-slate-400 px-4">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ItemInventory;