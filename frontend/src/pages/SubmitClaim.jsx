import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShieldCheck, Upload, FileText, Camera, Send, ArrowLeft, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SubmitClaim = () => {
    const { itemId } = useParams();
    const [step, setStep] = useState(1);
    const [proofText, setProofText] = useState('');

    // Simulated Item Data
    const item = {
        id: itemId || 'TRK-928XJ',
        title: 'MacBook Air M2',
        loc: 'Main Library',
        category: 'Electronics'
    };

    const handleSubmit = () => {
        setStep(2);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <nav className="fixed top-0 w-full h-20 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/30 z-50 flex items-center px-6 md:px-12 justify-between">
                <Link to="/inventory" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group font-bold text-sm tracking-tight uppercase">
                    <div className="p-2 bg-slate-900 rounded-xl group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    Back to Grid
                </Link>
            </nav>

            <main className="max-w-4xl mx-auto pt-32 px-6 pb-20 relative z-10">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <header className="mb-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-primary-500/10 text-primary-400 rounded-2xl border border-primary-500/20">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Ownership Protocol</h1>
                                </div>
                                <p className="text-slate-400 text-lg font-medium max-w-2xl">Initiating ownership verification for <span className="text-white underline decoration-primary-500 underline-offset-4">{item.title}</span>.</p>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                <div className="md:col-span-12">
                                    <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex gap-4 items-start">
                                        <Info className="text-blue-400 shrink-0" size={20} />
                                        <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest leading-loose">
                                            Your claim will be analyzed by our match engine against the reporter's context.
                                            Include unique details (scratches, stickers, software names, serial numbers) that aren't visible in the thumbnail.
                                        </p>
                                    </div>
                                </div>

                                <div className="md:col-span-12 space-y-8">
                                    <div className="bg-slate-900/40 border border-slate-800/50 rounded-[3rem] p-10 space-y-8 backdrop-blur-sm">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Contextual Proof (Text)</label>
                                            <textarea
                                                rows="6"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none resize-none transition-all placeholder:text-slate-700 leading-relaxed"
                                                placeholder="Describe unique identifiers, contents, or setting..."
                                                value={proofText}
                                                onChange={(e) => setProofText(e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-8 text-center hover:border-primary-500/50 transition-all cursor-pointer group">
                                                <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                    <Upload size={20} className="text-slate-500 group-hover:text-primary-400" />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Attach Invoice / Bill</p>
                                            </div>
                                            <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-8 text-center hover:border-primary-500/50 transition-all cursor-pointer group">
                                                <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                    <Camera size={20} className="text-slate-500 group-hover:text-primary-400" />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ownership Photo (Stickers/Marks)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        className="w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:scale-[1.02] active:scale-[0.98] text-white font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 transition-all shadow-2xl shadow-primary-500/40 uppercase tracking-[0.3em] text-sm"
                                    >
                                        Seal & Submit Claim <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-xl mx-auto py-20 text-center space-y-10"
                        >
                            <div className="relative w-32 h-32 bg-primary-500/10 border-4 border-primary-500/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(14,165,233,0.3)]">
                                <CheckCircle2 size={56} className="text-primary-400" />
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Claim Registered</h2>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                    Your ownership request has been queued for security analysis.
                                    Notification will be dispatched to your Identity Hub once a verdict is reached.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Link to="/inventory" className="py-5 bg-slate-900 border border-slate-800 text-white font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-[0.2em] text-xs">
                                    Return to Inventory
                                </Link>
                                <Link to="/dashboard" className="py-5 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 transition-all uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary-500/20">
                                    Go to Dashboard
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default SubmitClaim;
