import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Zap, Globe, Github, ArrowRight, Package, Search, Fingerprint, Map } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-primary-500/30 selection:text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-600/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute top-[20%] right-[5%] w-[30%] h-[30%] bg-blue-600/5 blur-[100px] rounded-full"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[30%] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '8s' }}></div>
                <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full h-24 bg-slate-950/40 backdrop-blur-2xl border-b border-white/5 z-50 flex items-center px-6 md:px-16 justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-xl shadow-lg shadow-primary-500/20">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-black text-white tracking-tighter uppercase italic">Amrita <span className="text-primary-500">Nexus</span></span>
                </div>

                <div className="hidden lg:flex items-center gap-10">
                    {['Network', 'Governance', 'Security', 'About'].map((item) => (
                        <a key={item} href="#" className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-[0.3em] transition-all">{item}</a>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    <Link to="/login" className="text-[10px] font-black text-white uppercase tracking-widest hover:text-primary-400 transition-all">Portal Login</Link>
                    <Link to="/register-visitor" className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all">Register Visitor</Link>
                </div>
            </nav>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="min-h-screen pt-48 pb-32 px-6 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8 max-w-5xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                            <Zap size={12} className="fill-primary-400" /> Neural Match Engine v4.2 Live
                        </div>

                        <h1 className="text-7xl md:text-9xl font-black text-white tracking-[ -0.05em] leading-[0.85] uppercase italic">
                            RECOVERY <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-white to-blue-500">REDEFINED</span>
                        </h1>

                        <p className="text-slate-400 text-lg md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
                            A secure, AI-powered ecosystem for campus property management.
                            Utilizing neural matching and cryptographic identification to reunite lost property with precision.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
                            <Link to="/login" className="w-full sm:w-auto px-12 py-6 bg-primary-600 hover:bg-primary-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 group transition-all shadow-2xl shadow-primary-500/40">
                                Launch Portal <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                            <Link to="/inventory" className="w-full sm:w-auto px-12 py-6 bg-slate-900/50 border border-slate-800 hover:bg-slate-800 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all">
                                <Search size={20} /> Browse Grid
                            </Link>
                        </div>
                    </motion.div>

                    {/* Stats strip */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-32 w-full max-w-6xl pt-16 border-t border-white/5"
                    >
                        {[
                            { label: 'Neural Matches', value: '4.8k+' },
                            { label: 'Campus Nodes', value: '12' },
                            { label: 'Active Users', value: '25k+' },
                            { label: 'Security Level', value: 'ECC' },
                        ].map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{stat.label}</p>
                                <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                            </div>
                        ))}
                    </motion.div>
                </section>

                {/* Features Section */}
                <section className="py-32 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-20 space-y-4">
                            <h2 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.5em]">The Ecosystem</h2>
                            <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic">Engineered for Trust</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: 'AI Similarity',
                                    desc: 'Neural engine analyzes visual and contextual metadata to detect matches before you even search.',
                                    icon: Fingerprint,
                                    color: 'text-primary-500'
                                },
                                {
                                    title: 'Secure Claims',
                                    desc: 'Encrypted proof-of-ownership protocol ensures items only go to their rightful owners.',
                                    icon: ShieldCheck,
                                    color: 'text-green-500'
                                },
                                {
                                    title: 'Zone Tracking',
                                    desc: 'Precise campus geolocation nodes allow for organized discovery and collection points.',
                                    icon: Map,
                                    color: 'text-orange-500'
                                },
                                {
                                    title: 'Live Signals',
                                    desc: 'Real-time broadcast system for urgent lost property and system-wide announcements.',
                                    icon: Globe,
                                    color: 'text-blue-500'
                                },
                                {
                                    title: 'Vault Identity',
                                    desc: 'Institutional identity integration ensures zero-leak data privacy and verified reporting.',
                                    icon: Package,
                                    color: 'text-purple-500'
                                },
                                {
                                    title: 'Audit Ready',
                                    desc: 'Full transparency via cryptographic logs for every claim, transfer, and resolution.',
                                    icon: Github,
                                    color: 'text-slate-400'
                                }
                            ].map((feat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -10 }}
                                    className="p-10 bg-slate-900/30 border border-slate-800/50 rounded-[3rem] backdrop-blur-sm space-y-6 hover:border-primary-500/30 transition-all group"
                                >
                                    <div className={`p-4 bg-slate-950 rounded-2xl w-fit ${feat.color} border border-white/5`}>
                                        <feat.icon size={28} />
                                    </div>
                                    <h4 className="text-2xl font-black text-white tracking-tight uppercase italic">{feat.title}</h4>
                                    <p className="text-slate-500 font-bold text-sm leading-relaxed group-hover:text-slate-400 transition-colors uppercase tracking-tight">{feat.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-40 px-6">
                    <div className="max-w-4xl mx-auto p-16 md:p-24 bg-gradient-to-tr from-primary-600 to-indigo-700 rounded-[4rem] text-center space-y-10 relative overflow-hidden shadow-[0_40px_100px_rgba(14,165,233,0.2)]">
                        {/* Decorative circle */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32"></div>

                        <div className="space-y-4 relative z-10">
                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-[ -0.05em] uppercase italic leading-none">Ready to Recover?</h2>
                            <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                                Join 25,000+ students and faculty in the most advanced campus safety network ever built.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center relative z-10">
                            <Link to="/login" className="w-full sm:w-auto px-12 py-6 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">Launch Nexus</Link>
                            <Link to="/register-visitor" className="w-full sm:w-auto px-12 py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all">Guest Entry</Link>
                        </div>
                    </div>
                </section>

                <footer className="py-20 px-6 border-t border-white/5 text-center">
                    <div className="flex flex-col items-center gap-8">
                        <div className="flex items-center gap-3 grayscale opacity-30">
                            <Sparkles size={24} className="text-white" />
                            <span className="text-xl font-black text-white tracking-tighter uppercase italic">Amrita Nexus</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">© 2026 Campus Safety Network • Neural Layer v4.2.0</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default LandingPage;
