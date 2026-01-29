import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Map, Search, PlusCircle, Bell, ShieldCheck, LayoutGrid, Clock, Compass, BarChart3, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: 'Overview', icon: LayoutGrid, path: '/dashboard' },
        { label: 'Item Grid', icon: Search, path: '/inventory' },
        { label: 'Report Item', icon: PlusCircle, path: '/report' },
        { label: 'Signal Hub', icon: Bell, path: '/notifications' },
        { label: 'Security Hub', icon: ShieldCheck, path: '/profile' },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-primary-500/30">
            {/* Mesh Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Sidebar */}
            <nav className="fixed left-0 top-0 h-full w-20 md:w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col items-center md:items-start p-6 space-y-8 z-20 transition-all">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="p-2.5 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl shadow-lg shadow-primary-500/20">
                        <Search className="text-white" size={24} />
                    </div>
                    <span className="hidden md:block font-black text-xl text-white tracking-tighter uppercase italic">Amrita Lost</span>
                </div>

                <div className="w-full flex-1 space-y-1.5 focus-within:ring-0">
                    <p className="hidden md:block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Main Menu</p>
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all group relative ${location.pathname === item.path
                                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} className={`${location.pathname === item.path ? 'text-primary-400' : 'text-slate-500 group-hover:text-primary-400 transition-colors'}`} />
                            <span className="hidden md:block font-bold text-sm tracking-tight">{item.label}</span>
                            {location.pathname === item.path && (
                                <motion.div layoutId="activeNav" className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary-400 md:block hidden" />
                            )}
                        </Link>
                    ))}

                    {user?.role === 'admin' && (
                        <div className="pt-4 space-y-1.5">
                            <p className="hidden md:block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Administration</p>
                            <Link
                                to="/admin"
                                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-orange-500/5 text-orange-400 border border-orange-500/10 hover:bg-orange-500/10 transition-all group"
                            >
                                <ShieldCheck size={20} />
                                <span className="hidden md:block font-bold text-sm tracking-tight">Admin Governance</span>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="w-full space-y-4 pt-4 border-t border-slate-800/50">
                    <div className="p-2 hidden md:flex items-center gap-3 bg-slate-900/50 rounded-2xl border border-slate-800/30">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center font-black text-white shadow-inner">
                            {user?.name?.[0]}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black text-white truncate leading-tight uppercase tracking-tight">{user?.name}</p>
                            <p className="text-[10px] text-primary-500 font-bold uppercase tracking-widest">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 p-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden md:block">Sign Out</span>
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pl-20 md:pl-64 pt-10 px-6 md:px-16 relative z-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-8 h-[1px] bg-primary-600"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Overview Dashboard</span>
                        </div>
                        <h1 className="text-5xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent tracking-tighter">
                            Welcome, {user?.name.split(' ')[0]}
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium">Campus safety and item recovery at {user?.affiliation}.</p>
                    </motion.div>
                    <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur border border-slate-800 p-2 rounded-2xl">
                        <div className="flex -space-x-3 px-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-9 h-9 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                            ))}
                        </div>
                        <div className="h-8 w-[1px] bg-slate-800"></div>
                        <button className="p-2 text-slate-400 hover:text-white transition-colors">
                            <Bell size={20} />
                        </button>
                    </div>
                </header>

                {/* App Updates Ticker (Mover) */}
                <div className="mb-12 overflow-hidden bg-slate-900/50 border-y border-slate-800/50 py-3 backdrop-blur-sm">
                    <div className="flex whitespace-nowrap animate-marquee">
                        {[
                            '🚀 VERSION 2.0 LIVE: ENHANCED NEURAL MATCHING ENGINE DEPLOYED',
                            '🔒 SECURITY UPDATE: MULTI-FACTOR AUTHENTICATION NOW MANDATORY FOR ADMIRALS',
                            '📍 NEW ZONE ADDED: SOUTH CAMPUS RECREATION CENTER NOW TRACKED',
                            '⚡ SYSTEM PERFORMANCE: 99.9% UPTIME ACHIEVED THIS QUARTER',
                            '📢 NOTICE: LOST ITEMS FROM PREVIOUS SEMESTER WILL BE ARCHIVED SOON'
                        ].map((text, i) => (
                            <span key={i} className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 mx-12">
                                {text}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-8 space-y-10">
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 italic uppercase">
                                    <BarChart3 className="text-primary-500" size={32} />
                                    System Metrics
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-10 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-[3rem] space-y-6"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="p-4 bg-green-500/20 rounded-2xl text-green-400">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Global Success</span>
                                    </div>
                                    <div>
                                        <p className="text-6xl font-black text-white tracking-tighter">842</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">Items Recovered All-Time</p>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-green-500" />
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-10 bg-gradient-to-br from-primary-500/10 to-blue-500/5 border border-primary-500/20 rounded-[3rem] space-y-6"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="p-4 bg-primary-500/20 rounded-2xl text-primary-400">
                                            <Bell size={24} />
                                        </div>
                                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Recent Activity</span>
                                    </div>
                                    <div>
                                        <p className="text-6xl font-black text-white tracking-tighter">56</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">Items Reported Last Week</p>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} className="h-full bg-primary-500" />
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-10 bg-slate-900/50 border border-slate-800/50 rounded-[3rem] space-y-6 md:col-span-2"
                                >
                                    <div className="flex gap-12 items-center">
                                        <div className="flex-1">
                                            <p className="text-4xl font-black text-white tracking-tighter">12</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Pending Matches</p>
                                        </div>
                                        <div className="w-[2px] h-12 bg-slate-800"></div>
                                        <div className="flex-1">
                                            <p className="text-4xl font-black text-white tracking-tighter">4.2m</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Grid pings (24h)</p>
                                        </div>
                                        <div className="w-[2px] h-12 bg-slate-800"></div>
                                        <div className="flex-1">
                                            <p className="text-4xl font-black text-white tracking-tighter">124</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Users</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </section>
                    </div>

                    <aside className="xl:col-span-4 space-y-8">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-2xl shadow-primary-500/20 text-white relative overflow-hidden group cursor-pointer"
                        >
                            <Link to="/report" className="relative z-10 block">
                                <h3 className="text-2xl font-black mb-3 tracking-tight">Report Missing Item</h3>
                                <p className="text-primary-100/80 text-sm font-medium leading-relaxed mb-8">Deploy our neural matching engine to scan the campus database in real-time.</p>
                                <div className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-transform group-hover:scale-105 active:scale-95 shadow-xl">
                                    Initiate Scan <PlusCircle size={18} />
                                </div>
                            </Link>
                            <LayoutGrid size={180} className="absolute -right-12 -bottom-12 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
                        </motion.div>

                        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] space-y-6">
                            <h3 className="text-lg font-black text-white underline decoration-primary-500 decoration-4 underline-offset-8">Fast Stats</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Active Reports', val: '24', pct: 65, color: 'from-blue-500 to-primary-400' },
                                    { label: 'System Matches', val: '128', pct: 88, color: 'from-green-500 to-emerald-400' },
                                ].map((stat, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                            <span className="text-sm font-black text-white">{stat.val}</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-[2px]">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stat.pct}%` }}
                                                className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
