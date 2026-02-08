/**
 * PREMIUM REGISTER PAGE
 * With advanced effects from CodePen inspirations
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import {
    User,
    Mail,
    Lock,
    Phone,
    Eye,
    EyeOff,
    Loader2,
    ArrowRight,
    ArrowLeft,
    GraduationCap,
    Briefcase,
    CheckCircle,
    Sparkles
} from 'lucide-react';
import {
    MorphingBlob,
    AuroraBackground,
    NoiseOverlay,
    ElasticButton,
    GlitchText,
    NeonText,
    ParticleExplosion,
    WaveText
} from '../effects';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'student'
    });

    // Refs
    const containerRef = useRef(null);
    const cardRef = useRef(null);

    // Initial animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(cardRef.current,
                {
                    y: 100,
                    opacity: 0,
                    rotateX: -15,
                    scale: 0.9,
                    filter: 'blur(15px)'
                },
                {
                    y: 0,
                    opacity: 1,
                    rotateX: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                    duration: 1,
                    ease: 'power4.out'
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Step change animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.step-content',
                { x: 50, opacity: 0, filter: 'blur(10px)' },
                { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }
            );

            gsap.fromTo('.form-field',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [step]);

    // Card 3D tilt effect
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(card, {
                rotateX: -y / 25,
                rotateY: x / 25,
                duration: 0.3,
                ease: 'power2.out'
            });

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

    const validateStep1 = () => {
        if (!formData.fullName.trim()) {
            setError('Full name is required');
            return false;
        }
        if (!formData.email.includes('@')) {
            setError('Please enter a valid email');
            return false;
        }
        if (formData.phone && formData.phone.length < 10) {
            setError('Please enter a valid phone number');
            return false;
        }
        setError('');
        return true;
    };

    const validateStep2 = () => {
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        setError('');
        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleSubmit = async () => {
        setError('');
        setLoading(true);

        try {
            await register({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone || undefined,
                password: formData.password,
                role: formData.role
            });

            // Success animation
            gsap.to(cardRef.current, {
                scale: 0.95,
                opacity: 0,
                y: -50,
                duration: 0.5,
                ease: 'power2.in',
                onComplete: () => navigate('/dashboard')
            });
        } catch (err) {
            setError(err.error || err.message || 'Registration failed');
            gsap.to(cardRef.current, {
                x: [-15, 15, -10, 10, -5, 5, 0],
                duration: 0.6,
                ease: 'power2.inOut'
            });
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'student', label: 'Student', icon: GraduationCap, desc: 'Campus student' },
        { id: 'faculty', label: 'Faculty', icon: Briefcase, desc: 'Staff member' }
    ];

    return (
        <div ref={containerRef} className="min-h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Effects */}
            <AuroraBackground />
            <NoiseOverlay opacity={0.02} />

            {/* Morphing Blobs */}
            <div className="absolute top-1/3 left-1/4 -translate-x-1/2">
                <MorphingBlob color1="#8b5cf6" color2="#ec4899" size={500} />
            </div>
            <div className="absolute bottom-1/3 right-1/4 translate-x-1/2">
                <MorphingBlob color1="#0ea5e9" color2="#8b5cf6" size={400} />
            </div>

            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

            <div className="w-full max-w-lg relative z-10" style={{ perspective: 1000 }}>
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <div className="p-4 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl shadow-2xl shadow-purple-500/30">
                            <Sparkles size={32} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight">
                        <GlitchText text="JOIN" /> <NeonText color="#8b5cf6">US</NeonText>
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-mono">Create your account</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= s
                                        ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/30'
                                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                                    }`}
                            >
                                {step > s ? <CheckCircle size={18} /> : s}
                            </div>
                            {s < 3 && (
                                <div className={`w-12 h-0.5 transition-all duration-500 ${step > s ? 'bg-primary-500' : 'bg-slate-700'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
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
                            background: 'radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(139,92,246,0.15), transparent 40%)'
                        }}
                    />

                    {/* Error */}
                    {error && (
                        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="step-content relative z-10">
                        {/* Step 1: Personal Info */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-white mb-4">
                                    <WaveText text="Personal Information" />
                                </h2>

                                <div className="form-field">
                                    <label className="block text-slate-400 text-sm mb-2">Full Name</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label className="block text-slate-400 text-sm mb-2">Email</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                            placeholder="you@amrita.edu"
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label className="block text-slate-400 text-sm mb-2">Phone (Optional)</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Security */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-white mb-4">
                                    <WaveText text="Security Setup" />
                                </h2>

                                <div className="form-field">
                                    <label className="block text-slate-400 text-sm mb-2">Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-12 pr-14 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                            placeholder="8+ characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label className="block text-slate-400 text-sm mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                            placeholder="Repeat password"
                                        />
                                    </div>
                                </div>

                                {/* Password strength indicator */}
                                <div className="form-field">
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all ${formData.password.length >= i * 2
                                                        ? i <= 2 ? 'bg-red-500' : i === 3 ? 'bg-yellow-500' : 'bg-green-500'
                                                        : 'bg-slate-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Role Selection */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-white mb-4">
                                    <WaveText text="Select your role" />
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    {roles.map((role) => {
                                        const Icon = role.icon;
                                        const isSelected = formData.role === role.id;
                                        return (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: role.id })}
                                                className={`form-field p-6 rounded-2xl border-2 transition-all text-left ${isSelected
                                                        ? 'border-purple-500 bg-purple-500/10'
                                                        : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                                                    }`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isSelected ? 'bg-purple-500/20' : 'bg-slate-700/50'
                                                    }`}>
                                                    <Icon size={24} className={isSelected ? 'text-purple-400' : 'text-slate-400'} />
                                                </div>
                                                <h3 className="font-bold text-white">{role.label}</h3>
                                                <p className="text-sm text-slate-400">{role.desc}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 mt-8">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="flex-1 py-4 border border-slate-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                                >
                                    <ArrowLeft size={18} />
                                    Back
                                </button>
                            )}

                            {step < 3 ? (
                                <ParticleExplosion className="flex-1">
                                    <ElasticButton
                                        onClick={handleNext}
                                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 group shadow-lg shadow-purple-500/25"
                                    >
                                        Continue
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </ElasticButton>
                                </ParticleExplosion>
                            ) : (
                                <ParticleExplosion className="flex-1">
                                    <ElasticButton
                                        onClick={handleSubmit}
                                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-500/25"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <CheckCircle size={18} />
                                            </>
                                        )}
                                    </ElasticButton>
                                </ParticleExplosion>
                            )}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="mt-8 text-center relative z-10">
                        <Link to="/login" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">
                            Already have an account? <span className="font-semibold">Sign In</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;