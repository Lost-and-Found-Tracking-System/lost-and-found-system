import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, MapPin, Calendar, Tag, ChevronDown, Package, Clock, ShieldCheck, ArrowLeft, SlidersHorizontal, Grid, List as ListIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ItemInventory = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [filterOpen, setFilterOpen] = useState(false);

    // Mock Database
    const items = [
        { id: 'TRK-928XJ', title: 'MacBook Air M2', loc: 'Main Library', date: '2026-01-25', type: 'LOST', category: 'Electronics', color: 'bg-red-500' },
        { id: 'TRK-102LA', title: 'HydroFlask White', loc: 'Gym Area', date: '2026-01-27', type: 'FOUND', category: 'Accessories', color: 'bg-green-500' },
        { id: 'TRK-445PP', title: 'ID Card - 21CSE', loc: 'Block 2', date: '2026-01-28', type: 'FOUND', category: 'Essentials', color: 'bg-green-500' },
        { id: 'TRK-772QQ', title: 'Noise Headphones', loc: 'Canteen', date: '2026-01-24', type: 'LOST', category: 'Electronics', color: 'bg-red-500' },
        { id: 'TRK-881WW', title: 'Reading Glasses', loc: 'Garden area', date: '2026-01-26', type: 'LOST', category: 'Personal', color: 'bg-red-500' },
        { id: 'TRK-119OO', title: 'Key Bundle (3)', loc: 'Innovation Lab', date: '2026-01-28', type: 'FOUND', category: 'Essentials', color: 'bg-green-500' },
    ];

    const filteredItems = items.filter(i =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            {/* Background Grain */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

            <nav className="fixed top-0 w-full h-20 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/30 z-50 flex items-center px-6 md:px-12 justify-between">
                <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group font-bold text-sm tracking-tight uppercase">
                    <div className="p-2 bg-slate-900 rounded-xl group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    HQ Command
                </Link>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-3">
                        <Grid
                            size={20}
                            className={`cursor-pointer transition-colors ${viewMode === 'grid' ? 'text-primary-500' : 'text-slate-600 hover:text-slate-400'}`}
                            onClick={() => setViewMode('grid')}
                        />
                        <ListIcon
                            size={20}
                            className={`cursor-pointer transition-colors ${viewMode === 'list' ? 'text-primary-500' : 'text-slate-600 hover:text-slate-400'}`}
                            onClick={() => setViewMode('list')}
                        />
                    </div>
                    <div className="h-6 w-[1px] bg-slate-800"></div>
                    <button className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all">
                        <Package size={16} /> Global Report
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto pt-32 px-6 pb-20 relative z-10">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-primary-500/10 text-primary-400 rounded-2xl border border-primary-500/20">
                            <SlidersHorizontal size={32} />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Inventory Grid</h1>
                    </div>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl">Browse, filter, and track incidents across the campus safety network.</p>
                </header>

                {/* Sub-Nav / Search & Filter */}
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                        <input
                            type="text"
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-[2rem] pl-16 pr-8 py-5 text-white font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none transition-all placeholder:text-slate-600 uppercase tracking-widest text-xs"
                            placeholder="Search by Title, Category, or Tracking ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setFilterOpen(!filterOpen)}
                        className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] border transition-all font-black text-xs uppercase tracking-widest ${filterOpen ? 'bg-primary-600 border-primary-500 text-white shadow-xl shadow-primary-500/20' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <Filter size={18} /> Advanced Filters
                    </button>
                    <button className="flex items-center gap-3 px-8 py-5 bg-slate-900/50 border border-slate-800 rounded-[2rem] text-slate-400 font-black text-xs hover:text-white transition-all uppercase tracking-widest">
                        <ArrowUpDown size={18} /> Sort: Recent
                    </button>
                </div>

                <AnimatePresence>
                    {filterOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 48 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-10 bg-slate-950/40 border border-slate-800 rounded-[2.5rem] backdrop-blur-xl">
                                {[
                                    { label: 'Incident Class', options: ['All', 'Lost', 'Found'] },
                                    { label: 'Category', options: ['Electronics', 'Accessories', 'Essentials', 'Personal'] },
                                    { label: 'Time Horizon', options: ['Last 24h', 'Last Week', 'Last Month', 'All Time'] },
                                    { label: 'Zone Proximity', options: ['All Zones', 'Main Lab', 'Canteen', 'Hostel'] },
                                ].map((filter, i) => (
                                    <div key={i} className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{filter.label}</label>
                                        <div className="relative">
                                            <select className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-xs font-black text-white appearance-none outline-none focus:border-primary-500/50 transition-all uppercase tracking-widest cursor-pointer">
                                                {filter.options.map(opt => <option key={opt}>{opt}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid View */}
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    <AnimatePresence>
                        {filteredItems.map((item, i) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={`group bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] p-8 hover:bg-slate-900/60 hover:border-primary-500/30 transition-all cursor-pointer relative overflow-hidden backdrop-blur-sm ${viewMode === 'list' ? 'flex items-center gap-10' : ''}`}
                            >
                                <Link to={`/item/${item.id}`} className="absolute inset-0 z-10"></Link>
                                {/* Glow Effect */}
                                <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 transition-opacity group-hover:opacity-20 ${item.color}`}></div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 group-hover:bg-primary-500/10 group-hover:border-primary-500/20 transition-all">
                                        <Tag size={20} className="text-slate-500 group-hover:text-primary-400" />
                                    </div>
                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${item.color}/20 ${item.color.replace('bg-', 'text-')} tracking-[0.2em] uppercase italic bg-slate-950/50`}>
                                        {item.type}
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-mono text-primary-500 font-black tracking-tighter uppercase">{item.id}</span>
                                        <ShieldCheck size={12} className="text-primary-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic group-hover:translate-x-1 transition-transform mb-6 leading-tight">
                                        {item.title}
                                    </h3>

                                    <div className="flex flex-wrap gap-4 border-t border-slate-800/50 pt-6">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <MapPin size={12} className="text-primary-500" />
                                            <span>{item.loc}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <Clock size={12} className="text-primary-500" />
                                            <span>{item.date}</span>
                                        </div>
                                    </div>
                                </div>

                                {viewMode === 'list' && (
                                    <button className="px-8 py-3 bg-primary-600 rounded-xl text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/20 ml-auto">
                                        Details
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-40 bg-slate-900/20 border border-slate-800 border-dashed rounded-[4rem]">
                        <div className="mb-6 opacity-20 flex justify-center"><Search size={80} /></div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">No Signal Detected</h3>
                        <p className="text-slate-500 font-bold text-sm tracking-widest">NO ITEMS MATCHING YOUR SEARCH PARAMETERS WERE FOUND IN THE GRID.</p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-8 text-primary-500 font-black text-xs uppercase tracking-[0.3em] hover:text-white transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ItemInventory;
