import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Camera, MapPin, Send, AlertTriangle, ArrowLeft, ChevronRight, CheckCircle2, Shield, Loader2, Sparkles, Copy, Upload, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CampusMap from '../components/CampusMap';

const ReportItem = () => {
    const [step, setStep] = useState(1);
    const [itemType, setItemType] = useState('lost');
    const [selectedZone, setSelectedZone] = useState(null);
    const [isClubSubmission, setIsClubSubmission] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [trackingId, setTrackingId] = useState('');
    const [showSimilarity, setShowSimilarity] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Electronics',
        date: new Date().toISOString().split('T')[0],
        clubName: '',
    });

    const generateTrackingId = () => `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const handleAutoSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, title: val });
        if (val.length > 5) setShowSimilarity(true);
        else setShowSimilarity(false);
        handleAutoSave();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedZone) {
            alert('CRITICAL: Pinpoint the location on the map to proceed.');
            return;
        }
        setTrackingId(generateTrackingId());
        setStep(3);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            {/* Mesh Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-primary-600/5 blur-[120px] rounded-full"></div>
            </div>

            <nav className="fixed top-0 w-full h-20 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/30 z-50 flex items-center px-6 md:px-12 justify-between">
                <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group font-bold text-sm tracking-tight uppercase">
                    <div className="p-2 bg-slate-900 rounded-xl group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    Exit Incident
                </Link>
                <div className="flex items-center gap-4">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${step >= s ? 'bg-primary-600 border-primary-500 text-white' : 'border-slate-800 text-slate-600'
                                }`}>
                                {step > s ? <CheckCircle2 size={14} /> : s}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest hidden md:block ${step >= s ? 'text-white' : 'text-slate-600'}`}>
                                {s === 1 ? 'Details' : 'Location'}
                            </span>
                            {s === 1 && <ChevronRight size={14} className="text-slate-800" />}
                        </div>
                    ))}
                </div>
            </nav>

            <main className="max-w-6xl mx-auto pt-32 px-6 pb-20 relative z-10">
                <AnimatePresence mode="wait">
                    {step < 3 && (
                        <motion.div
                            key="reporting"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-primary-500/10 text-primary-400 rounded-2xl border border-primary-500/20">
                                            <Shield size={32} />
                                        </div>
                                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Neural Report</h1>
                                    </div>
                                    <p className="text-slate-400 text-lg font-medium max-w-2xl">Initialize an incident report on the campus grid. AI classification will begin upon submission.</p>
                                </div>

                                <div className="flex gap-2 p-1.5 bg-slate-900/80 backdrop-blur-md rounded-[2rem] border border-slate-800 w-full md:w-[400px] shadow-2xl overflow-hidden shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setItemType('lost')}
                                        className={`flex-1 py-4 rounded-[1.6rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${itemType === 'lost' ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-slate-500 hover:text-white'
                                            }`}
                                    >
                                        <Package size={14} /> Lost
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setItemType('found')}
                                        className={`flex-1 py-4 rounded-[1.6rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${itemType === 'found' ? 'bg-green-600 text-white shadow-xl shadow-green-500/20' : 'text-slate-500 hover:text-white'
                                            }`}
                                    >
                                        <CheckCircle2 size={14} /> Found
                                    </button>
                                </div>
                            </header>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                                <div className="lg:col-span-6 space-y-8">
                                    <div className="bg-slate-900/40 border border-slate-800/50 rounded-[3rem] p-10 space-y-8 backdrop-blur-sm relative">
                                        {/* Auto-save Indicator */}
                                        <div className="absolute top-6 right-10 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                                            {isSaving ? <><Loader2 size={10} className="animate-spin" /> Syncing...</> : 'Draft Saved'}
                                        </div>

                                        <div className="space-y-3 relative">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Item Title</label>
                                            <input
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none transition-all placeholder:text-slate-700"
                                                placeholder="e.g. Silver iPad Pro 12.9"
                                                value={formData.title}
                                                onChange={handleTitleChange}
                                            />

                                            {/* AI Similarity Suggestion */}
                                            <AnimatePresence>
                                                {showSimilarity && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="absolute -bottom-16 left-0 right-0 z-20 bg-primary-600/10 border border-primary-500/30 backdrop-blur-xl p-3 rounded-xl flex items-center gap-3"
                                                    >
                                                        <Sparkles className="text-primary-400" size={16} />
                                                        <span className="text-[10px] font-black text-white uppercase tracking-tight">AI Signal: Matching item found in Canteen (94% confidence)</span>
                                                        <button className="ml-auto text-[9px] font-black text-primary-400 hover:text-white underline uppercase">View</button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="space-y-3 pt-6">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Contextual Description</label>
                                            <textarea
                                                rows="4"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none resize-none transition-all placeholder:text-slate-700 leading-relaxed"
                                                placeholder="Distinguishing marks, specific location details..."
                                                value={formData.description}
                                                onChange={(e) => { setFormData({ ...formData, description: e.target.value }); handleAutoSave(); }}
                                            />
                                        </div>

                                        {/* Club Submission Toggle */}
                                        <div className="pt-4 border-t border-slate-800 space-y-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsClubSubmission(!isClubSubmission)}
                                                className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${isClubSubmission ? 'text-primary-400' : 'text-slate-500 hover:text-white'} transition-colors`}
                                            >
                                                <Building2 size={16} /> Submit on behalf of Club/Dept?
                                            </button>

                                            <AnimatePresence>
                                                {isClubSubmission && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="space-y-4 overflow-hidden"
                                                    >
                                                        <input
                                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold outline-none"
                                                            placeholder="Official Organization Name"
                                                            value={formData.clubName}
                                                            onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                                                        />
                                                        <div className="border-2 border-dashed border-slate-800 rounded-3xl p-6 text-center hover:border-primary-500/50 transition-all cursor-pointer">
                                                            <Upload className="mx-auto text-slate-600 mb-2" />
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Attach Signed Authorization (PDF/JPG)</p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-6 space-y-8">
                                    <div className="flex items-center justify-between px-4">
                                        <h3 className="text-lg font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                                            <MapPin size={24} className="text-primary-500" />
                                            Active Grid Selection
                                        </h3>
                                        {selectedZone && (
                                            <span className="text-[10px] font-black bg-green-500 text-white px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                                                LOCKED: {selectedZone.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="rounded-[4rem] overflow-hidden border-8 border-slate-900 shadow-2xl relative">
                                        <CampusMap onZoneSelect={setSelectedZone} selectedZone={selectedZone} />
                                    </div>

                                    <div className="p-8 bg-primary-950/20 border border-primary-800/30 rounded-[2.5rem] flex gap-6 items-start">
                                        <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-400">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xs font-black text-white uppercase tracking-widest leading-none">Broadcast Warning</p>
                                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                                Initiating this report will notify the security protocol for <strong>{selectedZone?.name || 'the specified zone'}</strong>. False reporting is subject to campus disciplinary action.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        className="w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:scale-[1.02] active:scale-[0.98] text-white font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 transition-all shadow-2xl shadow-primary-500/40 uppercase tracking-[0.3em] text-sm"
                                    >
                                        Submit Incident Report <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-xl mx-auto py-20 text-center space-y-10"
                        >
                            <div className="relative inline-block">
                                <motion.div
                                    className="absolute inset-0 bg-green-500 blur-[80px] opacity-20"
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                />
                                <div className="relative w-32 h-32 bg-green-500/10 border-4 border-green-500/30 rounded-full flex items-center justify-center mx-auto">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                        className="absolute inset-0 border-t-4 border-green-500 rounded-full"
                                    />
                                    <CheckCircle2 size={56} className="text-green-500" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Dispatch Complete</h2>
                                <p className="text-slate-400 text-lg font-medium">Incident registered in the global campus ledger. Your tracking ID is now active.</p>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 bg-primary-600/10 text-primary-400 text-[8px] font-black uppercase tracking-widest border-l border-b border-primary-500/20">Cryptographic Tag</div>
                                <div className="flex flex-col items-center">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-2">Tracking ID</p>
                                    <div className="flex items-center gap-6">
                                        <span className="text-4xl font-black text-white tracking-[0.2em] font-mono">{trackingId}</span>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(trackingId)}
                                            className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-2xl"
                                        >
                                            <Copy size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Link to="/dashboard" className="inline-flex py-4 px-10 border border-slate-800 text-slate-400 font-black rounded-2xl hover:bg-slate-800 hover:text-white transition-all uppercase tracking-widest text-xs">
                                Return to Command Center
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ReportItem;
