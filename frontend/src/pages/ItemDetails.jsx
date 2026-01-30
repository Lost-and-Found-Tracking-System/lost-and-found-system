import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Tag, ShieldCheck, Sparkles, AlertTriangle, User, History, Share2, Printer, Map as MapIcon, ChevronRight } from 'lucide-react';

const ItemDetails = () => {
    const { id } = useParams();

    // Mock Item Data
    const item = {
        id: id || 'TRK-928XJ',
        title: 'MacBook Air M2',
        status: 'DISCOVERED',
        type: 'FOUND',
        loc: 'Main Library, 2nd Floor (Reading Room)',
        date: 'Jan 25, 2026',
        category: 'Electronics',
        reporter: 'Aravind M. (Librarian)',
        description: 'Laptop found near the window seating area. Midnight blue color, M2 chip, 13-inch. Attached is a small sticker of a rocket ship on the bottom left corner.',
        aiConfidence: 96,
        timeline: [
            { event: 'Initial Discovery', time: 'Jan 25, 09:42 AM', desc: 'Item logged by staff node 82.' },
            { event: 'AI Induction', time: 'Jan 25, 09:43 AM', desc: 'Neural similarity vectors generated.' },
            { event: 'Secure Vaulting', time: 'Jan 25, 10:15 AM', desc: 'Item moved to Central Security Safe.' }
        ]
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            {/* Navbar */}
            <nav className="fixed top-0 w-full h-20 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/30 z-50 flex items-center px-6 md:px-12 justify-between">
                <Link to="/inventory" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group font-bold text-sm tracking-tight uppercase">
                    <div className="p-2 bg-slate-900 rounded-xl group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    Grid Overview
                </Link>
                <div className="flex items-center gap-4">
                    <button className="p-3 text-slate-500 hover:text-white transition-all"><Share2 size={18} /></button>
                    <button className="p-3 text-slate-500 hover:text-white transition-all"><Printer size={18} /></button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto pt-32 px-6 pb-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Media & Stats */}
                    <div className="lg:col-span-5 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-square bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent p-12 flex flex-col justify-end">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em]">Official Capture</span>
                                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{item.title}</h2>
                                </div>
                            </div>
                            <div className="w-full h-full flex items-center justify-center text-slate-800 italic font-black text-2xl uppercase tracking-[0.2em] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20">
                                [ NO IMAGE ATTACHED ]
                            </div>
                        </motion.div>

                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-[3rem] p-8 space-y-6">
                            <div className="flex justify-between items-center pb-6 border-b border-slate-800/50">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">System Identity</h3>
                                <span className="text-primary-500 font-mono text-xs font-black uppercase">{item.id}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Incident Class</p>
                                    <p className={`text-sm font-black uppercase italic ${item.type === 'FOUND' ? 'text-green-400' : 'text-primary-400'}`}>{item.type}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Category</p>
                                    <p className="text-sm font-black text-white uppercase italic">{item.category}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-primary-500/10 border border-primary-500/20 rounded-[2.5rem] flex gap-5 items-start">
                            <Sparkles size={24} className="text-primary-400 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">AI Confidence Match <span className="px-2 py-0.5 bg-primary-500 text-[8px] rounded-full text-white">{item.aiConfidence}%</span></p>
                                <p className="text-[10px] text-primary-200/60 font-medium leading-relaxed uppercase tracking-tight">
                                    Our matching engine reports a high correlation between your profile and this item's metadata.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Info & Actions */}
                    <div className="lg:col-span-7 space-y-10">
                        <header className="space-y-6">
                            <div className="flex flex-wrap gap-4">
                                <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <MapPin size={12} className="text-primary-400" /> {item.loc}
                                </div>
                                <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Calendar size={12} className="text-primary-400" /> {item.date}
                                </div>
                            </div>
                            <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">Item <br /> Intelligence</h1>
                        </header>

                        <section className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Description / Clues</h3>
                            <div className="bg-slate-900/30 border border-slate-800/50 rounded-[2.5rem] p-10 text-lg font-medium text-slate-300 leading-relaxed border-l-4 border-l-primary-500">
                                "{item.description}"
                            </div>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900/30 border border-slate-800/50 rounded-[2.5rem] p-8 space-y-4">
                                <div className="flex items-center gap-3">
                                    <User size={18} className="text-slate-500" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reporting Entity</p>
                                </div>
                                <p className="font-black text-white uppercase italic text-sm">{item.reporter}</p>
                            </div>
                            <div className="bg-slate-900/30 border border-slate-800/50 rounded-[2.5rem] p-8 space-y-4">
                                <div className="flex items-center gap-3">
                                    <History size={18} className="text-slate-500" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Incident Timeline</p>
                                </div>
                                <div className="space-y-3">
                                    {item.timeline.map((event, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1 opacity-50"></div>
                                            <p className="text-[9px] font-medium text-slate-400 leading-tight uppercase tracking-tighter"><span className="text-white font-black">{event.event}</span> — {event.time}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <div className="pt-8 space-y-4">
                            <Link to={`/claim/${item.id}`} className="w-full h-24 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-xl shadow-primary-500/20 group active:scale-[0.98]">
                                Initiate Claim Pipeline <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                            <div className="flex gap-4">
                                <button className="flex-1 py-5 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-all">
                                    <AlertTriangle size={14} /> Report Discrepancy
                                </button>
                                <button className="flex-1 py-5 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-all">
                                    <MapIcon size={14} /> View Map Proximity
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ItemDetails;
