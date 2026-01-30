import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, History, Activity, TrendingUp, AlertCircle, ArrowLeft, BarChart3, Fingerprint, Globe, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const stats = [
        { label: 'Total Citizens', value: '1,284', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+12%' },
        { label: 'Active Sessions', value: '42', icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10', trend: 'Live' },
        { label: 'Conflict Matrix', value: '02', icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', trend: 'High' },
        { label: 'Neural Precision', value: '94%', icon: Sparkles, color: 'text-primary-400', bg: 'bg-primary-500/10', trend: 'Stable' },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            {/* Background Grain */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

            <nav className="fixed top-0 w-full h-20 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/30 z-50 flex items-center px-6 md:px-12 justify-between">
                <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group font-bold text-sm tracking-tight uppercase">
                    <div className="p-2 bg-slate-900 rounded-xl group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    HQ Dashboard
                </Link>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                        Admin Secure Mode
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto pt-32 px-6 pb-20 relative z-10">
                <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-primary-500/10 text-primary-400 rounded-2xl border border-primary-500/20">
                                <Fingerprint size={32} />
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Nexus Governance</h1>
                        </div>
                        <p className="text-slate-400 text-lg font-medium max-w-2xl">High-fidelity system monitoring and cryptographic role delegation.</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/admin/claims" className="px-8 py-4 bg-orange-600/10 border border-orange-500/20 rounded-2xl hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl">Resolutions</Link>
                        <Link to="/admin/ai-config" className="px-8 py-4 bg-primary-600/10 border border-primary-500/20 rounded-2xl hover:bg-primary-600 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl">AI Calibration</Link>
                        <Link to="/admin/roles" className="px-8 py-4 bg-slate-800 rounded-2xl hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest transition-all border border-white/5">Manage Roles</Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-slate-900/40 border border-slate-800/50 p-8 rounded-[2.5rem] backdrop-blur-sm group hover:border-primary-500/30 transition-all"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                                    <stat.icon size={24} />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.trend}</span>
                            </div>
                            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</h3>
                            <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <section className="lg:col-span-8 space-y-8">
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-[3rem] overflow-hidden">
                            <div className="p-8 border-b border-slate-800/50 flex justify-between items-center bg-slate-950/20">
                                <h2 className="text-xl font-black text-white flex items-center gap-3 italic uppercase tracking-tight">
                                    <History size={24} className="text-primary-400" /> Cryptographic Audit Trail
                                </h2>
                                <BarChart3 size={20} className="text-slate-600" />
                            </div>
                            <div className="divide-y divide-slate-800/50 bg-slate-950/10">
                                {[
                                    { user: 'Root Admin', action: 'Elevated Role: Jane Doe', target: 'Security Level 4', time: '2m ago' },
                                    { user: 'System-Auto', action: 'Zone Purge: Academic Block', target: 'Cleanup Protocol', time: '1h ago' },
                                    { user: 'Auditor_82', action: 'Modified Config: Zone Map', target: 'Coordinate Sync', time: '3h ago' },
                                ].map((log, i) => (
                                    <div key={i} className="p-6 hover:bg-primary-500/5 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-800 shadow-inner group-hover:text-primary-400 transition-colors">#{i + 1}</div>
                                            <div>
                                                <p className="text-sm font-black text-white tracking-tight uppercase italic">{log.action}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operator: {log.user} • {log.target}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-700 group-hover:text-slate-400 transition-colors">{log.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <aside className="lg:col-span-4 space-y-10">
                        <div className="bg-slate-900/40 border border-slate-800/50 p-10 rounded-[3rem] space-y-8">
                            <h3 className="text-lg font-black text-white italic uppercase tracking-tight flex items-center gap-3 underline decoration-primary-500 decoration-2 underline-offset-8">
                                <Activity size={20} className="text-green-500" /> Live Matrix
                            </h3>
                            <div className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-slate-950/50 transition-all">
                                        <div className="relative">
                                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-pulse"></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-white tracking-widest uppercase">NODE_SESSION_{1024 + i}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">IP: 192.168.1.{10 + i} • V6.02_STABLE</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-red-600/10 to-transparent border border-red-500/20 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 text-red-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
                                <AlertCircle size={14} /> Security Alert
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-bold">3 UNEXPECTED ACCESS ATTEMPTS DETECTED IN ZONE_B. PROTOCOL LOCKDOWN IS RECOMMENDED.</p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
