/**
 * @module pages/admin/AiMatches
 * @description Admin page for viewing and managing all AI-generated match pairs.
 */
import {
    ArrowLeft,
    ExternalLink,
    Filter,
    Loader2,
    Package,
    Search,
    Sparkles,
    Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { TiltCard } from '../../effects';
import { usePageTransition } from '../../hooks/useGSAPAnimations';
import api from '../../services/api';

const AiMatches = () => {
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState([]);
    const [stats, setStats] = useState({ totalMatches: 0, highConfidence: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    const containerRef = useRef(null);

    usePageTransition(containerRef);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/v1/admin/ai-matches');
            setMatches(res.data || []);

            // Calculate some basic stats
            const highConf = (res.data || []).filter(m => m.similarityScore > 85).length;
            setStats({
                totalMatches: (res.data || []).length,
                highConfidence: highConf
            });
        } catch (error) {
            console.error('Failed to fetch AI matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMatches = matches.filter(match => {
        const lostTitle = match.lostItemId?.itemAttributes?.category?.toLowerCase() || '';
        const foundTitle = match.foundItemId?.itemAttributes?.category?.toLowerCase() || '';
        return lostTitle.includes(searchTerm.toLowerCase()) || foundTitle.includes(searchTerm.toLowerCase());
    });

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
            <div ref={containerRef} className="flex-1 p-8 overflow-y-auto h-screen custom-scrollbar relative">
                <div className="max-w-6xl mx-auto pb-20">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <Link to="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-2 transition-colors">
                                <ArrowLeft size={16} /> Back to Dashboard
                            </Link>
                            <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                                <Sparkles className="text-purple-500" size={40} />
                                Meta-FAISS Registry
                            </h1>
                            <p className="text-slate-400 mt-2 text-lg">Top correlated lost & found item pairs discovered via semantic embedding</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Pairs</p>
                                <p className="text-2xl font-black text-white">{stats.totalMatches}</p>
                            </div>
                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                                <p className="text-xs text-purple-400 uppercase font-bold mb-1">High Conf.</p>
                                <p className="text-2xl font-black text-purple-400">{stats.highConfidence}</p>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search by item category or title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition-all"
                            />
                        </div>
                        <button className="px-6 py-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 hover:text-white flex items-center gap-2 transition-all">
                            <Filter size={20} />
                            <span>Filters</span>
                        </button>
                    </div>

                    {/* Matches Table */}
                    <div className="grid gap-6">
                        {filteredMatches.length > 0 ? (
                            filteredMatches.map((match, idx) => (
                                <TiltCard key={match._id} intensity={0.1}>
                                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 hover:border-purple-500/40 transition-all grid md:grid-cols-[1fr_auto_1fr] items-center gap-8">

                                        {/* Lost Item */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                                                {match.lostItemId?.images?.[0] ? (
                                                    <img src={match.lostItemId.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : <Package className="w-full h-full p-6 text-slate-700" />}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1 block">Lost Item</span>
                                                <h3 className="font-bold text-white text-lg truncate">{match.lostItemId?.itemAttributes?.category || 'Unknown'}</h3>
                                                <p className="text-slate-500 text-sm truncate">{match.lostItemId?.itemAttributes?.description}</p>
                                                <Link to={`/item/${match.lostItemId?._id}`} className="text-xs text-primary-400 hover:text-primary-300 mt-2 flex items-center gap-1">
                                                    View Details <ExternalLink size={10} />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Match Score */}
                                        <div className="flex flex-col items-center">
                                            <div className="relative w-24 h-24">
                                                <svg className="w-full h-full -rotate-90">
                                                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                                                    <circle
                                                        cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="4" fill="transparent"
                                                        className={match.similarityScore > 85 ? 'text-purple-500' : 'text-blue-500'}
                                                        strokeDasharray={264}
                                                        strokeDashoffset={264 - (264 * match.similarityScore) / 100}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-2xl font-black text-white leading-none">{Math.round(match.similarityScore)}%</span>
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Match</span>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-center">
                                                <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    FAISS Correlation
                                                </div>
                                            </div>
                                        </div>

                                        {/* Found Item */}
                                        <div className="flex items-center gap-4 justify-end text-right">
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1 block text-right">Found Item</span>
                                                <h3 className="font-bold text-white text-lg truncate">{match.foundItemId?.itemAttributes?.category || 'Unknown'}</h3>
                                                <p className="text-slate-500 text-sm truncate">{match.foundItemId?.itemAttributes?.description}</p>
                                                <Link to={`/item/${match.foundItemId?._id}`} className="text-xs text-primary-400 hover:text-primary-300 mt-2 flex items-center gap-1 justify-end">
                                                    View Details <ExternalLink size={10} />
                                                </Link>
                                            </div>
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                                                {match.foundItemId?.images?.[0] ? (
                                                    <img src={match.foundItemId.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : <Package className="w-full h-full p-6 text-slate-700" />}
                                            </div>
                                        </div>

                                    </div>
                                </TiltCard>
                            ))
                        ) : (
                            <div className="p-20 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
                                <Zap size={48} className="text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 text-lg">No semantic matches indexed yet. AI core is standing by.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiMatches;
