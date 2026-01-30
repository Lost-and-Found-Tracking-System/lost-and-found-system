import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Settings2, Sliders, History, AlertCircle, BarChart, ShieldAlert, ArrowLeft, RefreshCw, Cpu, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const AIConfig = () => {
    const [weights, setWeights] = useState({
        visual: 85,
        text: 70,
        location: 90,
        time: 50
    });

    const [threshold, setThreshold] = useState(75);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <nav className="fixed top-0 w-full h-20 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/30 z-50 flex items-center px-6 md:px-12 justify-between">
                <Link to="/admin" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group font-bold text-sm tracking-tight uppercase">
                    <div className="p-2 bg-slate-900 rounded-xl group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    HQ Nucleus
                </Link>
                <div className="flex items-center gap-4">
                    <RefreshCw size={18} className="text-primary-500 animate-spin" style={{ animationDuration: '4s' }} />
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest px-4 py-2 bg-primary-500/10 rounded-xl border border-primary-500/20">ENGINE v4.2.0 LIVE</span>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto pt-32 px-6 pb-20 relative z-10">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-primary-500/10 text-primary-400 rounded-2xl border border-primary-500/20">
                            <Settings2 size={32} />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Neural Governance</h1>
                    </div>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl">Calibrate the AI's decision-making logic and match weighting vectors.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Weight Controls */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-[3rem] p-10 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                                    <Sliders className="text-primary-500" size={24} /> Weight Vectors
                                </h3>
                                <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                                    <History size={14} /> View History
                                </button>
                            </div>

                            <div className="space-y-12">
                                {Object.entries(weights).map(([key, val]) => (
                                    <div key={key} className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <span className="text-sm font-black text-white uppercase tracking-tight">{key} Correlation</span>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Adjustment to {key}-based matching precision</p>
                                            </div>
                                            <span className="text-2xl font-black text-primary-400 font-mono">{val}%</span>
                                        </div>
                                        <div className="relative h-6 flex items-center">
                                            <div className="absolute inset-0 h-1.5 bg-slate-950 rounded-full my-auto"></div>
                                            <input
                                                type="range"
                                                className="w-full h-1.5 bg-transparent appearance-none cursor-pointer accent-primary-500 relative z-10"
                                                value={val}
                                                onChange={(e) => setWeights({ ...weights, [key]: e.target.value })}
                                            />
                                            <motion.div
                                                className="absolute left-0 h-1.5 bg-primary-500 rounded-full my-auto"
                                                style={{ width: `${val}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-[3rem] p-10 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                                        <ShieldAlert size={20} />
                                    </div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Auto-Rejection Threshold</h4>
                                </div>
                                <div className="flex items-end justify-between mb-4">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-[150px]">Score required to trigger a match alert</p>
                                    <span className="text-4xl font-black text-white">{threshold}%</span>
                                </div>
                                <input
                                    type="range"
                                    className="w-full bg-slate-950 h-2 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                    value={threshold}
                                    onChange={(e) => setThreshold(e.target.value)}
                                />
                            </div>

                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-[3rem] p-10 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
                                        <Sparkles size={20} />
                                    </div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Neural Version History</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">v4.2.0 (Active)</span>
                                        <span className="text-[8px] font-bold text-green-500">OPTIMIZED</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-950/20 rounded-xl border border-slate-900 opacity-50">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">v4.1.9</span>
                                        <span className="text-[8px] font-bold text-slate-700">ARCHIVED</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats & Metadata */}
                    <aside className="lg:col-span-4 space-y-8">
                        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] space-y-8 shadow-2xl">
                            <h3 className="text-lg font-black text-white underline decoration-primary-500 decoration-4 underline-offset-8">Engine Status</h3>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-950 rounded-2xl text-primary-500">
                                        <Cpu size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cluster Workload</p>
                                        <p className="text-xl font-black text-white">0.05ms <span className="text-[10px] text-green-500 ml-2">NORMAL</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-950 rounded-2xl text-primary-500">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vector index</p>
                                        <p className="text-xl font-black text-white">1,240,492 <span className="text-[10px] text-slate-500 ml-2">NODES</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-800 space-y-4">
                                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800/50">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Rollback Point</span>
                                    <RefreshCw size={14} className="text-slate-600 hover:text-white transition-all cursor-pointer" />
                                </div>
                                <button className="w-full py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2">
                                    Propagate Changes <Sparkles size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 bg-orange-500/5 border border-orange-500/20 rounded-[2.5rem] flex gap-5 items-start">
                            <AlertCircle className="text-orange-400 shrink-0" size={24} />
                            <div className="space-y-2">
                                <p className="text-xs font-black text-white uppercase tracking-widest">Cautionary Note</p>
                                <p className="text-xs text-orange-200/60 font-medium leading-relaxed">
                                    Adjusting thresholds below <strong>60%</strong> may result in a significant increase in manual review overhead (estimated +240%).
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default AIConfig;
