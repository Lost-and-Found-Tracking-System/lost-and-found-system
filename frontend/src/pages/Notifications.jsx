import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff, MessageSquare, ShieldCheck, AlertTriangle, CheckCircle2, ArrowLeft, Trash2, Settings, MoreVertical, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'MATCH',
            title: 'Potential Match Detected',
            desc: 'A found item "Silver Laptop" correlates with your recent report.',
            time: '2m ago',
            unread: true,
            icon: Sparkles,
            color: 'text-primary-400',
            bg: 'bg-primary-500/10'
        },
        {
            id: 2,
            type: 'CLAIM',
            title: 'Claim Decision Reached',
            desc: 'Your claim for ID #TRK-102LA has been APPROVED.',
            time: '1h ago',
            unread: true,
            icon: ShieldCheck,
            color: 'text-green-400',
            bg: 'bg-green-500/10'
        },
        {
            id: 3,
            type: 'SYSTEM',
            title: 'Annual Security Update',
            desc: 'Mandatory 2FA will be enabled for all users starting March 1st.',
            time: '1d ago',
            unread: false,
            icon: AlertTriangle,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10'
        }
    ]);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    const deleteNotif = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <nav className="fixed top-0 w-full h-20 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/30 z-50 flex items-center px-6 md:px-12 justify-between">
                <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group font-bold text-sm tracking-tight uppercase">
                    <div className="p-2 bg-slate-900 rounded-xl group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    HQ Overview
                </Link>
                <div className="flex items-center gap-4">
                    <Settings size={20} className="text-slate-600 hover:text-white cursor-pointer transition-all" />
                    <div className="h-8 w-[1px] bg-slate-800"></div>
                    <span className="text-[10px] font-black text-white bg-primary-600 px-3 py-1 rounded-full uppercase tracking-tighter">
                        {notifications.filter(n => n.unread).length} New
                    </span>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto pt-32 px-6 pb-20 relative z-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-primary-500/10 text-primary-400 rounded-2xl border border-primary-500/20">
                                <Bell size={32} />
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Signal Center</h1>
                        </div>
                        <p className="text-slate-400 text-lg font-medium">Broadcasts, alerts, and verification status for your account.</p>
                    </div>
                    <button
                        onClick={markAllRead}
                        className="text-[10px] font-black text-primary-400 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-all p-4 bg-primary-500/5 rounded-2xl border border-primary-500/10"
                    >
                        <CheckCircle2 size={14} /> Clear All Indicators
                    </button>
                </header>

                <div className="space-y-4">
                    <AnimatePresence initial={false}>
                        {notifications.map((n) => (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`group p-8 rounded-[2.5rem] border transition-all relative overflow-hidden flex gap-8 items-start ${n.unread ? 'bg-slate-900 border-primary-500/30 shadow-2xl shadow-primary-500/5' : 'bg-slate-900/40 border-slate-800 opacity-60'}`}
                            >
                                {n.unread && (
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500"></div>
                                )}

                                <div className={`p-4 rounded-2xl shrink-0 ${n.bg} ${n.color}`}>
                                    <n.icon size={24} />
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{n.type} SIGNAL <span className="mx-2 opacity-30">•</span> {n.time}</p>
                                        <button
                                            onClick={() => deleteNotif(n.id)}
                                            className="p-2 text-slate-700 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-black text-white tracking-tight uppercase italic">{n.title}</h3>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed">{n.desc}</p>
                                </div>

                                <button className="self-center p-3 text-slate-700 hover:text-white transition-all">
                                    <MoreVertical size={20} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {notifications.length === 0 && (
                        <div className="text-center py-40 border-2 border-dashed border-slate-800 rounded-[3rem] grayscale opacity-30">
                            <BellOff size={80} className="mx-auto text-slate-700 mb-6" />
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Zero Interference</h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">NO ACTIVE SIGNALS WERE DETECTED IN YOUR FEED</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Notifications;
