import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Scale, CheckCircle2, XCircle, AlertTriangle, Sparkles, User, FileText, ChevronRight, ArrowLeft, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminClaims = () => {
    const [selectedClaim, setSelectedClaim] = useState(null);

    // Mock Claims Database
    const claims = [
        {
            id: 'CLM-001',
            item: 'MacBook Air M2',
            claimant: 'Rahul S.',
            status: 'CONFLICT',
            confidence: 94,
            proof: 'Describe a small dent on the bottom left corner and a sticker of a rocket.',
            time: '2h ago'
        },
        {
            id: 'CLM-002',
            item: 'Noise Headphones',
            claimant: 'Priya K.',
            status: 'PENDING',
            confidence: 82,
            proof: 'Left ear cup has a slightly loose hinge. Case is black.',
            time: '5h ago'
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <nav className="fixed top-0 w-full h-20 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/30 z-50 flex items-center px-6 md:px-12 justify-between">
                <Link to="/admin" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group font-bold text-sm tracking-tight uppercase">
                    <div className="p-2 bg-slate-900 rounded-xl group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    Nexus Governance
                </Link>
                <div className="flex items-center gap-4">
                    <History size={20} className="text-slate-600 cursor-pointer hover:text-white transition-all" />
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center font-black text-[10px]">AD</div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto pt-32 px-6 pb-20 relative z-10">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl border border-orange-500/20">
                            <Scale size={32} />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic text-shadow-glow">Resolution Pipeline</h1>
                    </div>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl">High-fidelity ownership arbitration. AI analysis provided for each claim conflict.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-12">
                        <div className="flex gap-4 mb-8">
                            <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-2">
                                <AlertTriangle size={14} /> 2 CONFLICTS DETECTED
                            </div>
                            <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                                12 PENDING RESOLUTION
                            </div>
                        </div>
                    </div>

                    {/* Claims List */}
                    <div className="lg:col-span-5 space-y-4">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">Active Claim Queue</h3>
                        {claims.map((claim) => (
                            <motion.div
                                key={claim.id}
                                onClick={() => setSelectedClaim(claim)}
                                whileHover={{ x: 5 }}
                                className={`p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden backdrop-blur-sm ${selectedClaim?.id === claim.id ? 'bg-primary-500/10 border-primary-500/50 shadow-xl shadow-primary-500/10' : 'bg-slate-900/40 border-slate-800/50 hover:border-slate-700'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-sm uppercase tracking-tight">{claim.item}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{claim.id}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[8px] font-black px-2 py-1 rounded-full border ${claim.status === 'CONFLICT' ? 'border-orange-500/30 text-orange-400 bg-orange-500/5' : 'border-blue-500/30 text-blue-400 bg-blue-500/5'} tracking-widest`}>
                                        {claim.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em]">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <User size={12} /> {claim.claimant}
                                    </div>
                                    <div className="flex items-center gap-2 text-primary-400">
                                        <Sparkles size={12} /> {claim.confidence}% MATCH
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Comparison UI */}
                    <div className="lg:col-span-7">
                        <AnimatePresence mode="wait">
                            {selectedClaim ? (
                                <motion.div
                                    key={selectedClaim.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-slate-900/40 border border-slate-800/50 rounded-[3rem] p-10 h-full backdrop-blur-xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8">
                                        <Sparkles className="text-primary-500/20" size={120} />
                                    </div>

                                    <div className="relative z-10 h-full flex flex-col">
                                        <div className="flex items-center gap-4 mb-8">
                                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Decision Matrix</h3>
                                            <div className="h-px flex-1 bg-slate-800"></div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 mb-10 text-shadow-none">
                                            <div className="space-y-6">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <FileText size={14} className="text-primary-500" /> Submitted Proof
                                                </p>
                                                <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-300 leading-relaxed italic">
                                                    "{selectedClaim.proof}"
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Sparkles size={14} className="text-primary-500" /> AI Neural Check
                                                </p>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Similarity Score</span>
                                                        <span className="text-lg font-black text-primary-400">{selectedClaim.confidence}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-[1px]">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${selectedClaim.confidence}%` }}
                                                            className="h-full bg-primary-500 rounded-full"
                                                        />
                                                    </div>
                                                    <p className="text-[8px] font-black text-green-500/70 uppercase tracking-[0.2em]">Verified: Detail Match confirmed by Neural Engine</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-10 border-t border-slate-800 flex gap-4">
                                            <button className="flex-1 py-5 bg-green-600/10 border border-green-500/20 text-green-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2 group shadow-xl">
                                                Approve Claim <CheckCircle2 size={16} />
                                            </button>
                                            <button className="flex-1 py-5 bg-red-600/10 border border-red-500/20 text-red-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 group shadow-xl">
                                                Reject Claim <XCircle size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-slate-900/20 border border-slate-800 border-dashed rounded-[3rem] p-20 text-center opacity-50 grayscale">
                                    <Scale size={80} className="text-slate-700 mb-6" />
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Awaiting Selection</h3>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SELECT A CLAIM FROM THE QUEUE TO INITIALIZE ARBITRATION</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminClaims;
