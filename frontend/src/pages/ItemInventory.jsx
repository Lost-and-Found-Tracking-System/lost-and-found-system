/**
 * @module pages/ItemInventory
 * @description Browsable item inventory with search, type/category filters, and grid/list views.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { gsap } from 'gsap';
import {
    Search,
    Filter,
    Package,
    MapPin,
    Calendar,
    Tag,
    Eye,
    ArrowUpRight,
    Loader2,
    X,
    Grid,
    List,
    Sparkles
} from 'lucide-react';
import {
    MorphingBlob,
    GlitchText,
    TiltCard,
    GradientBorderCard,
    ElasticButton,
    PulseRings,
    RippleButton,
    HolographicCard,
    ScrambleLink
} from '../effects';

const ItemInventory = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [filters, setFilters] = useState({
        type: searchParams.get('type') || '',
        category: searchParams.get('category') || '',
        status: searchParams.get('status') || '' // Empty = show all approved items
    });
    const [viewMode, setViewMode] = useState('grid');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const containerRef = useRef(null);
    const gridRef = useRef(null);

    // Fetch items
    const fetchItems = useCallback(async (reset = false) => {
        try {
            if (reset) {
                setPage(1);
                setItems([]);
            }

            const params = new URLSearchParams({
                page: reset ? 1 : page,
                limit: 12,
                ...(search && { q: search }),
                ...(filters.type && { submissionType: filters.type }),
                ...(filters.category && { category: filters.category }),
                ...(filters.status && { status: filters.status })
            });

            const res = await api.get(`/v1/items?${params}`);
            const newItems = res.data.items || [];

            if (reset) {
                setItems(newItems);
            } else {
                setItems(prev => [...prev, ...newItems]);
            }

            setHasMore(newItems.length === 12);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
        }
    }, [page, search, filters]);

    useEffect(() => {
        setLoading(true);
        fetchItems(true);
    }, [search, filters]);

    // GSAP Animations
    useEffect(() => {
        if (loading) return;

        const ctx = gsap.context(() => {
            // Header animation
            gsap.fromTo('.inventory-header',
                { y: -40, opacity: 0, filter: 'blur(10px)' },
                { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }
            );

            // Search bar
            gsap.fromTo('.search-container',
                { y: 30, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.6, delay: 0.2, ease: 'back.out(1.7)' }
            );

            // Filter pills
            gsap.fromTo('.filter-pill',
                { y: 20, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.05, delay: 0.4, ease: 'back.out(2)' }
            );

            // Grid items stagger
            gsap.fromTo('.item-card',
                { y: 60, opacity: 0, scale: 0.9, rotateX: 15 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotateX: 0,
                    duration: 0.7,
                    stagger: { amount: 0.5, from: 'start', grid: 'auto' },
                    delay: 0.3,
                    ease: 'power4.out'
                }
            );

        }, containerRef);

        return () => ctx.revert();
    }, [loading, items]);

    const categories = ['Electronics', 'Documents', 'Accessories', 'Clothing', 'Keys', 'Bags', 'Books', 'Other'];
    const types = [
        { id: '', label: 'All Items' },
        { id: 'lost', label: 'Lost' },
        { id: 'found', label: 'Found' }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        const newParams = new URLSearchParams(searchParams);
        if (searchInput) {
            newParams.set('search', searchInput);
        } else {
            newParams.delete('search');
        }
        setSearchParams(newParams);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setFilters({ type: '', category: '', status: '' });
        setSearchInput('');
        setSearch('');
        setSearchParams({});
    };

    const activeFiltersCount = [filters.type, filters.category].filter(Boolean).length + (search ? 1 : 0);

    if (loading && items.length === 0) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="relative">
                    <PulseRings size={100} color="#0ea5e9" />
                    <Package className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-400" size={32} />
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
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <Sidebar />

            <main className="ml-4 pl-8 md:pl-12 pr-4 md:pr-8 py-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="inventory-header mb-8">
                        <h1 className="text-4xl md:text-5xl font-black mb-2">
                            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                                Item Registry
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg">
                            <GlitchText text={`Browse ${items.length}+ items across campus`} />
                        </p>
                    </div>

                    {/* Search & Filters */}
                    <div className="search-container mb-8">
                        <form onSubmit={handleSearch} className="flex items-center gap-0 bg-slate-900/60 border border-slate-700/50 rounded-2xl backdrop-blur-xl overflow-hidden focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all mb-6">
                            <Search size={22} className="ml-6 text-slate-400 flex-shrink-0" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search items by name, description, or location..."
                                className="flex-1 px-4 py-5 bg-transparent text-lg text-white focus:outline-none placeholder:text-slate-500"
                            />
                            <RippleButton
                                type="submit"
                                className="px-8 py-3 mr-2 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl font-bold text-white flex-shrink-0"
                            >
                                Search
                            </RippleButton>
                        </form>

                        {/* Filter Pills */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Type Pills */}
                            {types.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => handleFilterChange('type', type.id)}
                                    className={`filter-pill px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${filters.type === type.id
                                        ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/25'
                                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}

                            <div className="w-px h-8 bg-slate-700 mx-2" />

                            {/* Category Pills */}
                            <button
                                onClick={() => handleFilterChange('category', '')}
                                className={`filter-pill px-4 py-2 rounded-full text-sm font-semibold transition-all ${!filters.category
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
                                    }`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleFilterChange('category', cat)}
                                    className={`filter-pill px-4 py-2 rounded-full text-sm font-semibold transition-all ${filters.category === cat
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}

                            {/* Clear Filters */}
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="filter-pill flex items-center gap-2 px-4 py-2.5 rounded-full text-sm text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                                >
                                    <X size={14} />
                                    Clear ({activeFiltersCount})
                                </button>
                            )}

                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-slate-800/50 text-slate-400'}`}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-slate-800/50 text-slate-400'}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Items Grid */}
                    {items.length > 0 ? (
                        <>
                            <div
                                ref={gridRef}
                                className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}
                                style={{ perspective: 1000 }}
                            >
                                {items.map((item, i) => (
                                    <Link key={item._id} to={`/item/${item._id}`}>
                                        <TiltCard className="item-card h-full" intensity={0.3}>
                                            <HolographicCard className="h-full">
                                                <div className={`bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl rounded-2xl overflow-hidden h-full group ${viewMode === 'list' ? 'flex' : ''}`}>
                                                    {/* Image */}
                                                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-40 h-40 flex-shrink-0' : 'aspect-square'}`}>
                                                        {item.images?.[0] ? (
                                                            <img
                                                                src={item.images[0]}
                                                                alt={item.itemAttributes?.category}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                                <Package size={48} className="text-slate-600" />
                                                            </div>
                                                        )}

                                                        {/* Type Badge */}
                                                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${item.submissionType === 'lost'
                                                            ? 'bg-red-500/90 text-white'
                                                            : 'bg-emerald-500/90 text-white'
                                                            }`}>
                                                            {item.submissionType?.toUpperCase()}
                                                        </div>

                                                        {/* Hover Overlay */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                                            <span className="text-white text-sm font-semibold flex items-center gap-2">
                                                                <Eye size={16} />
                                                                View Details
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-5">
                                                        <h3 className="font-bold text-white text-lg mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors">
                                                            {item.itemAttributes?.category || 'Unknown Item'}
                                                        </h3>

                                                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                                                            {item.itemAttributes?.description || 'No description provided'}
                                                        </p>

                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                                <MapPin size={14} className="text-cyan-400" />
                                                                <span className="truncate">{item.location?.zoneId?.zoneName || 'Unknown location'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                                <Calendar size={14} className="text-violet-400" />
                                                                <span>{new Date(item.timeMetadata?.lostOrFoundAt || item.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            {item.itemAttributes?.category && (
                                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                                    <Tag size={14} className="text-amber-400" />
                                                                    <span>{item.itemAttributes.category}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </HolographicCard>
                                        </TiltCard>
                                    </Link>
                                ))}
                            </div>

                            {/* Load More */}
                            {hasMore && (
                                <div className="text-center mt-12">
                                    <ElasticButton
                                        onClick={() => { setPage(prev => prev + 1); fetchItems(); }}
                                        className="px-8 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white font-bold hover:bg-slate-700/50 transition-all"
                                    >
                                        {loading ? (
                                            <Loader2 size={20} className="animate-spin mx-auto" />
                                        ) : (
                                            'Load More Items'
                                        )}
                                    </ElasticButton>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-20">
                            <div className="inline-flex p-6 bg-slate-800/30 rounded-3xl mb-6">
                                <Package size={64} className="text-slate-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">No items found</h2>
                            <p className="text-slate-400 mb-6 max-w-md mx-auto">
                                {search || filters.type || filters.category
                                    ? 'Try adjusting your search or filters'
                                    : 'Be the first to report an item in this category'}
                            </p>
                            <div className="flex justify-center gap-4">
                                {(search || filters.type || filters.category) && (
                                    <ElasticButton onClick={clearFilters} className="px-6 py-3 bg-slate-800 rounded-xl text-white">
                                        Clear Filters
                                    </ElasticButton>
                                )}
                                <Link to="/report">
                                    <ElasticButton className="px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl text-white font-bold">
                                        Report Item
                                    </ElasticButton>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ItemInventory;