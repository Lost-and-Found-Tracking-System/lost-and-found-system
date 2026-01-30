import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Save, ArrowLeft, Camera, Shield, BadgeCheck, ExternalLink, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '+91 9876543210',
        affiliation: user?.affiliation || 'CBE',
    });

    const handleSave = (e) => {
        e.preventDefault();
        alert('Profile sync complete (Local Mode)');
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            {/* Background Accents */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-[30%] h-1/4 bg-primary-600/5 blur-[100px] rounded-full"></div>
            </div>

            <nav className="fixed top-0 w-full h-20 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/30 z-50 flex items-center px-6 md:px-12 justify-between">
                <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group font-bold text-sm tracking-tight uppercase">
                    <div className="p-2 bg-slate-900 rounded-xl group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    Dashboard
                </Link>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black bg-primary-500/10 text-primary-400 px-3 py-1 rounded-full border border-primary-500/20 uppercase tracking-widest">
                        Profile Verified
                    </span>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto pt-32 px-6 pb-20 relative z-10">
                <header className="mb-16">
                    <h1 className="text-6xl font-black text-white tracking-tighter mb-4 italic uppercase">Identity Hub</h1>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl">Manage your institutional credentials and security configurations for the Campus Recovery Network.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4">
                        <div className="bg-slate-900/50 border border-slate-800/50 rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-6 sticky top-32">
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-primary-600 to-indigo-600 p-1 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <div className="w-full h-full rounded-[2.3rem] bg-slate-950 flex items-center justify-center text-5xl font-black border-8 border-slate-950 text-white">
                                        {user?.name?.[0]}
                                    </div>
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-3 bg-white text-slate-950 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                                    <Camera size={20} />
                                </button>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2 uppercase tracking-tight">
                                    {user?.name} <BadgeCheck className="text-primary-500" size={20} />
                                </h2>
                                <p className="text-primary-500 uppercase tracking-[0.3em] text-[10px] font-black">{user?.role} Associate</p>
                            </div>

                            <div className="w-full pt-6 space-y-3">
                                <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50 text-xs font-bold uppercase tracking-widest text-slate-400">
                                    <span>Campus ID</span>
                                    <span className="text-white">AM.EN.U4CSE21001</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50 text-xs font-bold uppercase tracking-widest text-slate-400">
                                    <span>Division</span>
                                    <span className="text-white">{user?.affiliation}</span>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                                <ExternalLink size={14} /> View Digital ID
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <form className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-[2.5rem] p-10 space-y-10" onSubmit={handleSave}>
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 text-white font-black tracking-tighter text-xl uppercase italic">
                                    <Shield size={24} className="text-primary-500" />
                                    Personal Credentials
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[
                                        { label: 'Display Name', icon: User, key: 'name', type: 'text' },
                                        { label: 'Institutional Email', icon: Mail, key: 'email', type: 'email', disabled: true },
                                        { label: 'Encryption Key (Phone)', icon: Phone, key: 'phone', type: 'tel' },
                                        { label: 'Zone Proximity', icon: MapPin, key: 'affiliation', type: 'select', options: ['CBE', 'BLR', 'AMRT'] },
                                    ].map((field) => (
                                        <div key={field.key} className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                <field.icon size={12} className="text-primary-500" /> {field.label}
                                            </label>
                                            {field.type === 'select' ? (
                                                <select
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none appearance-none"
                                                    value={formData[field.key]}
                                                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                >
                                                    {field.options.map(opt => <option key={opt} value={opt}>{opt} Campus</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    disabled={field.disabled}
                                                    className={`w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none transition-all ${field.disabled ? 'opacity-50 cursor-not-allowed border-dashed' : ''}`}
                                                    value={formData[field.key]}
                                                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-10 border-t border-slate-800">
                                    <div className="flex items-center gap-4 text-white font-black tracking-tighter text-xl uppercase italic mb-8">
                                        <Bell size={24} className="text-primary-500" />
                                        Signal Preferences
                                    </div>
                                    <div className="space-y-6">
                                        {[
                                            { label: 'Neural Match Alerts', desc: 'Notify when AI detects a potential item correlate' },
                                            { label: 'Claim Status Updates', desc: 'Real-time alerts for ownership arbitration verdicts' },
                                            { label: 'Campus Announcements', desc: 'Broad-spectrum updates from campus security' }
                                        ].map((pref, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-slate-950 rounded-[2rem] border border-slate-800">
                                                <div>
                                                    <p className="text-sm font-black text-white uppercase tracking-tight">{pref.label}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{pref.desc}</p>
                                                </div>
                                                <div className="w-12 h-6 bg-primary-600 rounded-full relative cursor-pointer shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-slate-800 flex flex-col sm:flex-row gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white font-black px-10 py-5 rounded-3xl transition-all shadow-2xl shadow-primary-500/20 uppercase tracking-widest text-xs group active:scale-95"
                                >
                                    <Save size={18} className="group-hover:rotate-12 transition-transform" />
                                    Synchronize Profile
                                </button>
                                <button type="button" className="px-10 py-5 bg-slate-800 text-slate-400 font-black rounded-3xl hover:bg-slate-700 hover:text-white transition-all uppercase tracking-widest text-xs active:scale-95">
                                    Reset Access
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
