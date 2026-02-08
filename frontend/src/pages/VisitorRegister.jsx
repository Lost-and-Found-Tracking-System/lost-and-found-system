import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { Phone, User, Mail, Loader2, Sparkles, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { use3DTilt, useMagneticHover } from '../hooks/useGSAPAnimations';

const VisitorRegister = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        phone: '',
        fullName: '',
        email: '',
        otp: '',
    });

    const [registrationResult, setRegistrationResult] = useState(null);

    // GSAP Refs
    const containerRef = useRef(null);
    const cardRef = useRef(null);
    const formRef = useRef(null);
    const buttonRef = useRef(null);

    use3DTilt(cardRef, '.tilt-card');
    useMagneticHover(buttonRef, 20);

    // Animate step changes
    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(formRef.current,
                { opacity: 0, x: 20, filter: 'blur(5px)' },
                { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [step]);

    // Initial load animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.stagger-in', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'back.out(1.7)'
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Step 1: Request OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        let phone = formData.phone.trim();
        if (!phone.startsWith('+')) {
            phone = (phone.length === 10 ? '+91' : '+') + phone;
        }

        try {
            const response = await api.post('/v1/auth/visitor/request-otp', { phone });
            setFormData({ ...formData, phone });
            setSuccess(`OTP sent to ${phone}. Valid for ${response.data.expiresIn / 60} minutes.`);

            // Animate out before changing step
            gsap.to(formRef.current, {
                x: -20,
                opacity: 0,
                duration: 0.3,
                onComplete: () => setStep(2)
            });
        } catch (err) {
            console.error('OTP request failed:', err);
            setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
            gsap.fromTo(cardRef.current, { x: -10 }, { x: 0, duration: 0.1, repeat: 5, yoyo: true });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await api.post('/v1/auth/visitor/verify', {
                phone: formData.phone,
                fullName: formData.fullName,
                email: formData.email || undefined,
                otp: formData.otp,
            });

            const { accessToken, userId, expiresAt } = response.data;

            if (accessToken) {
                localStorage.setItem('token', accessToken);
                const userData = {
                    id: userId,
                    fullName: formData.fullName,
                    email: formData.email || '',
                    phone: formData.phone,
                    role: 'visitor',
                    visitorExpiresAt: expiresAt,
                };
                localStorage.setItem('user', JSON.stringify(userData));
            }

            setRegistrationResult(response.data);

            // Animate out
            gsap.to(formRef.current, {
                scale: 0.9,
                opacity: 0,
                duration: 0.3,
                onComplete: () => setStep(3)
            });

            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2500);

        } catch (err) {
            console.error('Verification failed:', err);
            setError(err.response?.data?.error || 'Invalid or expired OTP. Please try again.');
            gsap.fromTo(cardRef.current, { x: -10 }, { x: 0, duration: 0.1, repeat: 5, yoyo: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
            <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8 stagger-in">
                    <div className="inline-flex p-3 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-2xl shadow-lg shadow-primary-500/30 mb-4 transform hover:scale-110 transition-transform duration-300">
                        <Sparkles size={28} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                        VISITOR<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400"> ACCESS</span>
                    </h1>
                    <p className="text-slate-400 text-lg">Secure Temporary Registration</p>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center justify-center gap-3 mb-8 stagger-in">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-2 rounded-full transition-all duration-500 ease-out ${s === step ? 'w-12 bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                                    s < step ? 'w-4 bg-green-500' : 'w-4 bg-slate-800'
                                }`}
                        />
                    ))}
                </div>

                {/* Main Card */}
                <div
                    ref={cardRef}
                    className="tilt-card bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden stagger-in"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Glass Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-center gap-3 animate-pulse">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {success && step !== 3 && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-200 text-sm flex items-center gap-3">
                            <CheckCircle size={20} className="flex-shrink-0" />
                            {success}
                        </div>
                    )}

                    <div ref={formRef} className="relative z-10">
                        {step === 1 && (
                            <form onSubmit={handleRequestOtp} className="space-y-6">
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2 ml-1">Mobile Number</label>
                                    <div className="relative group">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-mono text-lg"
                                            placeholder="+91 9876543210"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <p className="text-slate-500 text-xs mt-2 ml-1">We'll send a one-time password to verify.</p>
                                </div>

                                <button
                                    ref={buttonRef}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2 group"
                                >
                                    {loading ? <Loader2 size={24} className="animate-spin" /> : (
                                        <>
                                            Send Secure OTP
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyOtp} className="space-y-5">
                                <div className="text-center mb-6">
                                    <p className="text-slate-300">Enter the code sent to</p>
                                    <p className="text-primary-400 font-mono font-bold text-lg">{formData.phone}</p>
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        value={formData.otp}
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                        className="w-full py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-center text-3xl tracking-[1em] font-mono focus:outline-none focus:border-primary-500 transition-all"
                                        placeholder="••••••"
                                        maxLength={6}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors" />
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
                                            placeholder="Full Name"
                                            required
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
                                            placeholder="Email (Optional)"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="px-6 py-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-white font-bold rounded-xl transition-all"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <button
                                        ref={buttonRef}
                                        type="submit"
                                        disabled={loading || formData.otp.length !== 6}
                                        className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 size={24} className="animate-spin" /> : (
                                            <>
                                                Verify & Access
                                                <ShieldCheck size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 3 && (
                            <div className="text-center py-8">
                                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                    <div className="absolute inset-0 border-4 border-green-500/30 rounded-full animate-ping" />
                                    <CheckCircle size={48} className="text-green-500 relative z-10" />
                                </div>

                                <h2 className="text-3xl font-bold text-white mb-2">Access Granted</h2>
                                <p className="text-slate-400 mb-8">Redirecting you to the dashboard...</p>

                                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-left space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Temp ID:</span>
                                        <span className="text-white font-mono bg-slate-700/50 px-2 py-1 rounded">{registrationResult?.userId?.slice(-8)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Valid Until:</span>
                                        <span className="text-yellow-400 font-medium">24 Hours</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Links */}
                {step !== 3 && (
                    <div className="mt-8 text-center space-y-3 stagger-in opacity-0" style={{ animationDelay: '0.4s' }}>
                        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium text-sm transition-colors">
                            Already have an account? Sign In
                        </Link>
                        <div className="flex justify-center gap-4 text-xs text-slate-500">
                            <Link to="/" className="hover:text-white transition-colors">Home</Link>
                            <span>•</span>
                            <Link to="/register" className="hover:text-white transition-colors">Student Registration</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitorRegister;