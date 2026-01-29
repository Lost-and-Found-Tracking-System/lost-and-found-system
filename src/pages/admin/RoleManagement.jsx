import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, UserPlus, Search, MoreVertical, ArrowLeft, Key, UserCheck, Scale, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const RoleManagement = () => {
    const [activeTab, setActiveTab] = useState('citizens');

    const users = [
        { id: 1, name: 'Alice Johnson', email: 'alice@amrita.edu', role: 'student', status: 'AUTHORIZED', class: 'Level 1' },
        { id: 2, name: 'Dr. Bob Smith', email: 'bob@amrita.edu', role: 'faculty', status: 'AUTHORIZED', class: 'Level 3' },
        { id: 3, name: 'Visitor_9281', email: 'visitor@guest.net', role: 'visitor', status: 'EXPIRED', class: 'Level 0' },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <nav className="fixed top-0 w-full h-20 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/30 z-50 flex items-center px-6 md:px-12 justify-between">
                <Link to="/admin" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group font-bold text-sm tracking-tight uppercase">
                    <div className="p-2 bg-slate-900 rounded-xl group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    HQ Admin
                </Link>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all">
                        <UserPlus size={16} /> New Delegate
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto pt-32 px-6 pb-20 relative z-10">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-primary-500/10 text-primary-400 rounded-2xl border border-primary-500/20">
                                <Key size={32} />
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic text-shadow-glow">Access Control</h1>
                        </div>
                        <p className="text-slate-400 text-lg font-medium">Provision security clearances and manage the campus trust hierarchy.</p>
                    </div>
                </header>

                <div className="flex gap-2 p-1.5 bg-slate-900 rounded-[1.5rem] mb-12 w-fit border border-slate-800 shadow-2xl">
                    {['citizens', 'hierarchies', 'audit'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/30' : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-slate-900/40 border border-slate-800/50 rounded-[3rem] overflow-hidden backdrop-blur-sm shadow-2xl">
                    <div className="p-8 border-b border-slate-800/50 flex justify-between items-center bg-slate-950/20 flex-wrap gap-6">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                            <input
                                className="w-full bg-slate-950 border border-slate-800/50 rounded-2xl pl-12 pr-6 py-3.5 text-xs font-bold text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none transition-all placeholder:text-slate-700 uppercase tracking-widest"
                                placeholder="Scan Registry Identity..."
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="px-4 py-2 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <Scale size={14} className="text-primary-500" /> Integrity Score 99.4%
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-950/40 text-slate-600 text-[9px] uppercase font-black tracking-[0.3em]">
                                    <th className="px-8 py-6 border-b border-slate-800/50">Nexus Identity</th>
                                    <th className="px-8 py-6 border-b border-slate-800/50">Clearance Level</th>
                                    <th className="px-8 py-6 border-b border-slate-800/50">Affiliation</th>
                                    <th className="px-8 py-6 border-b border-slate-800/50 text-right">Operation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 bg-slate-950/10">
                                {users.map((u) => (
                                    <tr key={u.id} className="group hover:bg-primary-500/5 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-slate-400 shadow-inner group-hover:scale-105 transition-transform group-hover:border-primary-500/30">
                                                    {u.name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-black text-white italic uppercase tracking-tight text-sm flex items-center gap-2">
                                                        {u.name} <UserCheck size={14} className="text-primary-500" />
                                                    </div>
                                                    <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 group-hover:text-primary-400/50 transition-colors">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black text-white uppercase italic tracking-tighter">{u.role}</div>
                                                <div className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.3em]">{u.class}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${u.status === 'AUTHORIZED' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500 opacity-50'}`}></div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.status}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:bg-primary-500/10 hover:text-primary-400 transition-all text-slate-600 group-hover:border-primary-500/20">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 bg-slate-950/40 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            <Info size={14} /> Total Population: 1,284 Access Nodes
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3].map(p => (
                                <button key={p} className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${p === 1 ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-900 text-slate-600 hover:text-white border border-slate-800'}`}>{p}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RoleManagement;
