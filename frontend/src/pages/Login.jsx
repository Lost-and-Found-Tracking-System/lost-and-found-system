/**
 * PREMIUM LOGIN PAGE
 * With advanced effects from CodePen inspirations
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import {
    MorphingBlob,
    AuroraBackground,
    NoiseOverlay,
    ElasticButton,
    GlitchText,
    NeonText,
    GradientBorderCard,
    TiltCard,
    ParticleExplosion
} from '../effects';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Refs
    const containerRef = useRef(null);
    const cardRef = useRef(null);
    const formRef = useRef(null);

    // GSAP Animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Card entrance with 3D effect
            gsap.fromTo(cardRef.current,
                {
                    y: 100,
                    opacity: 0,
                    rotateX: -20,
                    scale: 0.9,
                    filter: 'blur(20px)'
                },
                {
                    y: 0,
                    opacity: 1,
                    rotateX: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                    duration: 1.2,
                    delay: 0.3,
                    ease: 'power4.out'
                }
            );

            // Form fields stagger
            gsap.fromTo('.form-field',
                { x: -50, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    delay: 0.8,
                    ease: 'power3.out'
                }
            );

            // Button entrance
            gsap.fromTo('.login-btn',
                { y: 30, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.8, delay: 1.2, ease: 'back.out(2)' }
            );

            // Links entrance
            gsap.fromTo('.login-links a',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 1.4, ease: 'power2.out' }
            );

        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Card tilt effect
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(card, {
                rotateX: -y / 20,
                rotateY: x / 20,
                duration: 0.3,
                ease: 'power2.out'
            });

            // Spotlight effect
            card.style.setProperty('--x', `${(e.clientX - rect.left) / rect.width * 100}%`);
            card.style.setProperty('--y', `${(e.clientY - rect.top) / rect.height * 100}%`);
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.7,
                ease: 'elastic.out(1, 0.5)'
            });
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login({
                email: formData.email,
                password: formData.password
            });

            // Success animation
            gsap.to(cardRef.current, {
                scale: 0.95,
                opacity: 0,
                y: -50,
                duration: 0.5,
                ease: 'power2.in',
                onComplete: () => {
                    if (user.role === 'admin' || user.role === 'delegated_admin') {
                        navigate('/admin');
                    } else {
                        navigate('/dashboard');
                    }
                }
            });
        } catch (err) {
            setError(err.error || err.message || 'Invalid email or password');

            // Shake animation
            gsap.to(cardRef.current, {
                x: [-15, 15, -10, 10, -5, 5, 0],
                duration: 0.6,
                ease: 'power2.inOut'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Effects */}
            <AuroraBackground />
            <NoiseOverlay opacity={0.02} />

            {/* Morphing Blobs */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2">
                <MorphingBlob color1="#0ea5e9" color2="#8b5cf6" size={500} />
            </div>
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2">
                <MorphingBlob color1="#8b5cf6" color2="#ec4899" size={400} />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

            <div className="w-full max-w-md relative z-10" style={{ perspective: 1000 }}>
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <div className="p-4 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-2xl shadow-2xl shadow-primary-500/30">
                            <Sparkles size={32} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight">
                        <GlitchText text="L" /><NeonText color="#0ea5e9">&</NeonText><GlitchText text="F" />
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest">Neural Recovery System</p>
                </div>

                {/* Login Card */}
                <div
                    ref={cardRef}
                    className="relative rounded-3xl p-8 overflow-hidden"
                    style={{
                        transformStyle: 'preserve-3d',
                        background: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Spotlight overlay */}
                    <div
                        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                            background: 'radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(14,165,233,0.15), transparent 40%)'
                        }}
                    />

                    <h2 className="text-2xl font-bold text-white mb-6 relative z-10">Welcome Back</h2>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        {/* Email */}
                        <div className="form-field">
                            <label className="block text-slate-400 text-sm mb-2 font-medium">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-600"
                                    placeholder="you@amrita.edu"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-field">
                            <label className="block text-slate-400 text-sm mb-2 font-medium">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-12 pr-14 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-600"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <ParticleExplosion>
                            <ElasticButton
                                onClick={handleSubmit}
                                className="login-btn w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 group shadow-lg shadow-primary-500/25"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </ElasticButton>
                        </ParticleExplosion>
                    </form>

                    {/* Links */}
                    <div className="login-links mt-8 text-center space-y-3 relative z-10">
                        <Link to="/register" className="text-primary-400 hover:text-primary-300 text-sm block transition-colors">
                            Don't have an account? <span className="font-semibold">Register</span>
                        </Link>
                        <Link to="/register-visitor" className="text-slate-500 hover:text-slate-400 text-sm block transition-colors">
                            Visitor? Get temporary access
                        </Link>
                        <Link to="/" className="text-slate-500 hover:text-slate-400 text-sm flex items-center justify-center gap-2 transition-colors group">
                            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* Test Credentials */}
                <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                    <p className="text-slate-400 text-xs text-center mb-2 font-medium">Test Credentials (Development Only)</p>
                    <div className="text-slate-500 text-xs space-y-1">
                        <p><span className="text-slate-400">Student:</span> student@example.com / Student@123</p>
                        <p><span className="text-slate-400">Faculty:</span> faculty@example.com / Faculty@123</p>
                        <p><span className="text-slate-400">Admin:</span> admin@example.com / Admin@123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;