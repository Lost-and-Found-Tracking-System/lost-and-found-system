/**
 * PREMIUM LANDING PAGE
 * Using ALL 39+ effects from CodePen inspirations
 * FUTURE-TECH aesthetic - Maximum visual impact
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    ArrowRight,
    Search,
    Package,
    Sparkles,
    ShieldCheck,
    MapPin,
    Zap,
    Eye,
    ChevronDown,
    Github,
    Globe,
    Users,
    Clock,
    CheckCircle
} from 'lucide-react';

// Import ALL premium effects
import {
    GlitchText,
    ParticleCursor,
    MorphingBlob,
    WaveText,
    AuroraBackground,
    NoiseOverlay,
    SpotlightCursor,
    ElasticButton,
    ScrambleLink,
    FloatingElement,
    GradientFlowText,
    Typewriter,
    InfiniteMarquee,
    RippleButton
} from '../effects/PremiumEffects';

import {
    MeteorShower,
    HolographicCard,
    CyberpunkGrid,
    NeonText,
    PulseRings,
    GradientBorderCard,
    ScrollProgress,
    TiltCard,
    AnimatedShapes,
    ParticleExplosion,
    GlowingOrb,
    BreathingCircle
} from '../effects/AdvancedEffects';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// HERO SECTION COMPONENT
// ============================================
const HeroSection = () => {
    const heroRef = useRef(null);
    const titleRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Staggered letter animation
            gsap.fromTo('.hero-letter',
                {
                    y: 200,
                    opacity: 0,
                    rotateX: -90,
                    scale: 0.5
                },
                {
                    y: 0,
                    opacity: 1,
                    rotateX: 0,
                    scale: 1,
                    duration: 1.2,
                    stagger: 0.05,
                    ease: 'back.out(1.7)',
                    delay: 0.5
                }
            );

            // Ampersand special animation
            gsap.fromTo('.hero-ampersand',
                { scale: 0, rotation: -180, opacity: 0 },
                {
                    scale: 1,
                    rotation: 0,
                    opacity: 1,
                    duration: 1.5,
                    ease: 'elastic.out(1, 0.5)',
                    delay: 1
                }
            );

            // Subtitle and CTA
            gsap.fromTo('.hero-subtitle',
                { y: 50, opacity: 0, filter: 'blur(20px)' },
                { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, delay: 1.5, ease: 'power3.out' }
            );

            gsap.fromTo('.hero-cta',
                { y: 40, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, delay: 1.8, ease: 'back.out(2)' }
            );

            // Badge
            gsap.fromTo('.hero-badge',
                { y: -30, opacity: 0, scale: 0.8 },
                { y: 0, opacity: 1, scale: 1, duration: 1, delay: 0.3, ease: 'back.out(1.7)' }
            );

        }, heroRef);

        return () => ctx.revert();
    }, []);

    const title = 'LOST';
    const subtitle = 'FOUND';

    return (
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Effects */}
            <MorphingBlob color1="#0ea5e9" color2="#8b5cf6" size={600} />
            <div className="absolute top-1/4 right-1/4">
                <MorphingBlob color1="#8b5cf6" color2="#ec4899" size={400} />
            </div>
            <div className="absolute bottom-1/4 left-1/4">
                <MorphingBlob color1="#06b6d4" color2="#0ea5e9" size={500} />
            </div>

            {/* Breathing Circles */}
            <div className="absolute top-1/3 right-1/3 opacity-20">
                <BreathingCircle size={300} color="#0ea5e9" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
                {/* Badge */}
                <div className="hero-badge inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-12">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-50" />
                        <div className="relative w-3 h-3 bg-green-400 rounded-full" />
                    </div>
                    <span className="text-sm font-semibold tracking-wide text-slate-300">
                        <GlitchText text="AMRITA CAMPUS • LIVE" />
                    </span>
                    <span className="px-2 py-0.5 bg-primary-500/20 text-primary-300 text-xs font-bold rounded-full">2026</span>
                </div>

                {/* Main Title */}
                <h1 className="mb-4" style={{ perspective: 1000 }}>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        {/* LOST */}
                        <div className="flex">
                            {title.split('').map((letter, i) => (
                                <span
                                    key={i}
                                    className="hero-letter inline-block text-[15vw] md:text-[12rem] font-black text-white leading-none"
                                    style={{
                                        textShadow: '0 0 100px rgba(14,165,233,0.5)',
                                        transformStyle: 'preserve-3d'
                                    }}
                                >
                                    {letter}
                                </span>
                            ))}
                        </div>

                        {/* Ampersand */}
                        <span className="hero-ampersand inline-block text-[15vw] md:text-[12rem] font-black leading-none">
                            <NeonText color="#0ea5e9">&</NeonText>
                        </span>

                        {/* FOUND */}
                        <div className="flex">
                            {subtitle.split('').map((letter, i) => (
                                <span
                                    key={i}
                                    className="hero-letter inline-block text-[15vw] md:text-[12rem] font-black leading-none"
                                    style={{
                                        background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #ec4899 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        textShadow: 'none',
                                        transformStyle: 'preserve-3d'
                                    }}
                                >
                                    {letter}
                                </span>
                            ))}
                        </div>
                    </div>
                </h1>

                {/* Subtitle with Typewriter */}
                <div className="hero-subtitle text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-16">
                    <Typewriter
                        texts={[
                            'The neural recovery system for your belongings',
                            'AI-powered item matching technology',
                            'Campus-wide tracking network',
                            'Secure verification system'
                        ]}
                        speed={80}
                        deleteSpeed={40}
                        pauseTime={2500}
                    />
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                    <ParticleExplosion>
                        <ElasticButton
                            onClick={() => window.location.href = '/login'}
                            className="hero-cta group relative px-12 py-5 bg-white text-black rounded-full font-bold text-lg overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Get Started
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </ElasticButton>
                    </ParticleExplosion>

                    <ElasticButton
                        onClick={() => window.location.href = '/inventory'}
                        className="hero-cta group px-12 py-5 rounded-full font-bold text-lg border-2 border-white/20 hover:border-white/40 backdrop-blur-sm hover:bg-white/5 transition-all"
                    >
                        <span className="flex items-center gap-3">
                            <Search size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                            Browse Items
                        </span>
                    </ElasticButton>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500 font-mono">Scroll</span>
                <div className="relative">
                    <PulseRings size={60} color="#0ea5e9" />
                    <ChevronDown size={24} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-400" />
                </div>
            </div>
        </section>
    );
};

// ============================================
// MARQUEE SECTION
// ============================================
const MarqueeSection = () => {
    const items = [
        'ELECTRONICS', 'DOCUMENTS', 'ACCESSORIES', 'KEYS', 'BAGS',
        'PHONES', 'LAPTOPS', 'WALLETS', 'ID CARDS', 'BOOKS'
    ];

    return (
        <section className="py-12 border-y border-white/5 bg-black/50 overflow-hidden">
            <InfiniteMarquee speed={30}>
                {items.map((item, i) => (
                    <span key={i} className="mx-8 text-4xl font-black text-white/5 hover:text-white/20 transition-colors">
                        {item}
                    </span>
                ))}
            </InfiniteMarquee>
        </section>
    );
};

// ============================================
// HOW IT WORKS - HORIZONTAL SCROLL
// ============================================
const HowItWorksSection = () => {
    const sectionRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray('.step-card');

            gsap.to(cards, {
                xPercent: -100 * (cards.length - 1),
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    pin: true,
                    scrub: 1,
                    snap: {
                        snapTo: 1 / (cards.length - 1),
                        duration: { min: 0.2, max: 0.5 },
                        ease: 'power2.inOut'
                    },
                    end: () => '+=' + (containerRef.current.offsetWidth * 0.75)
                }
            });

            // Animate each card's content
            cards.forEach((card, i) => {
                gsap.fromTo(card.querySelector('.step-icon'),
                    { scale: 0, rotation: -180 },
                    {
                        scale: 1,
                        rotation: 0,
                        duration: 1,
                        ease: 'back.out(2)',
                        scrollTrigger: {
                            trigger: card,
                            start: 'left 70%',
                            containerAnimation: gsap.getById('horizontal-scroll')
                        }
                    }
                );
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const steps = [
        {
            num: '01',
            icon: Package,
            title: 'REPORT',
            desc: 'Snap a photo, tag your location, submit in seconds. Our AI instantly catalogs your item.',
            color: '#0ea5e9'
        },
        {
            num: '02',
            icon: Sparkles,
            title: 'MATCH',
            desc: 'Neural networks compare 47 visual features to find potential matches across campus.',
            color: '#8b5cf6'
        },
        {
            num: '03',
            icon: ShieldCheck,
            title: 'VERIFY',
            desc: 'Multi-factor ownership verification with campus credentials and proof documents.',
            color: '#10b981'
        },
        {
            num: '04',
            icon: CheckCircle,
            title: 'REUNITE',
            desc: 'Collect your item from designated smart lockers with secure one-time codes.',
            color: '#f59e0b'
        }
    ];

    return (
        <section ref={sectionRef} className="h-screen bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-black to-black" />

            {/* Background Number */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[50vw] font-black text-white/[0.02] select-none">···</span>
            </div>

            <div ref={containerRef} className="flex h-full" style={{ width: '400vw' }}>
                {steps.map((step, i) => {
                    const Icon = step.icon;
                    return (
                        <div
                            key={i}
                            className="step-card w-screen h-full flex items-center justify-center px-8"
                        >
                            <HolographicCard className="w-full max-w-2xl p-12 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
                                <div className="text-center">
                                    {/* Step Number */}
                                    <span className="text-[10rem] font-black text-white/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
                                        {step.num}
                                    </span>

                                    {/* Icon */}
                                    <div
                                        className="step-icon inline-flex p-8 rounded-3xl mb-8 relative"
                                        style={{
                                            background: `linear-gradient(135deg, ${step.color}20, ${step.color}05)`,
                                            border: `1px solid ${step.color}30`
                                        }}
                                    >
                                        <Icon size={64} style={{ color: step.color }} />
                                        <GlowingOrb color={step.color} size={120} pulseSpeed={3} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-6xl font-black text-white mb-6">
                                        <WaveText text={step.title} />
                                    </h3>
                                    <p className="text-xl text-slate-400 leading-relaxed max-w-lg mx-auto">
                                        {step.desc}
                                    </p>
                                </div>
                            </HolographicCard>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

// ============================================
// FEATURES GRID
// ============================================
const FeaturesSection = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.feature-card',
                {
                    y: 100,
                    opacity: 0,
                    rotateX: 15,
                    scale: 0.9
                },
                {
                    y: 0,
                    opacity: 1,
                    rotateX: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 70%'
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const features = [
        {
            icon: Sparkles,
            title: 'AI Matching',
            desc: 'Deep learning models analyze 47 visual features',
            color: '#8b5cf6'
        },
        {
            icon: MapPin,
            title: 'Zone Tracking',
            desc: 'Real-time GPS location throughout campus',
            color: '#0ea5e9'
        },
        {
            icon: ShieldCheck,
            title: 'Verified Claims',
            desc: 'Multi-factor ownership verification',
            color: '#10b981'
        },
        {
            icon: Zap,
            title: 'Instant Alerts',
            desc: 'Push notifications for matches',
            color: '#f59e0b'
        },
        {
            icon: Users,
            title: 'Community',
            desc: 'Campus-wide helper network',
            color: '#ec4899'
        },
        {
            icon: Eye,
            title: 'Live Feed',
            desc: 'Real-time item stream',
            color: '#06b6d4'
        }
    ];

    return (
        <section ref={sectionRef} className="py-32 px-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.1),transparent_50%)]" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <h2 className="text-6xl md:text-8xl font-black text-white mb-6">
                        <GradientFlowText>FEATURES</GradientFlowText>
                    </h2>
                    <p className="text-xl text-slate-400 max-w-xl mx-auto">
                        Built with cutting-edge technology for maximum recovery rates
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: 1000 }}>
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <TiltCard
                                key={i}
                                className="feature-card"
                                intensity={0.5}
                            >
                                <GradientBorderCard className="h-full">
                                    <div className="p-8">
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                                            style={{
                                                background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}05)`,
                                                border: `1px solid ${feature.color}30`
                                            }}
                                        >
                                            <Icon size={32} style={{ color: feature.color }} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                                        <p className="text-slate-400">{feature.desc}</p>
                                    </div>
                                </GradientBorderCard>
                            </TiltCard>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// ============================================
// CTA SECTION
// ============================================
const CTASection = () => {
    return (
        <section className="py-32 px-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-950/20 to-transparent" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <h2 className="text-5xl md:text-7xl font-black text-white mb-8">
                    Ready to <NeonText color="#0ea5e9">find</NeonText> yours?
                </h2>
                <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                    Join the neural network. Never lose track of your belongings again.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <ParticleExplosion>
                        <RippleButton
                            onClick={() => window.location.href = '/register'}
                            className="px-12 py-5 bg-white text-black rounded-full font-bold text-lg"
                        >
                            Create Account
                        </RippleButton>
                    </ParticleExplosion>

                    <ElasticButton
                        onClick={() => window.location.href = '/register-visitor'}
                        className="px-12 py-5 rounded-full font-bold text-lg border-2 border-white/20 hover:border-white/40 text-white backdrop-blur-sm"
                    >
                        Visitor Access
                    </ElasticButton>
                </div>
            </div>
        </section>
    );
};

// ============================================
// FOOTER
// ============================================
const Footer = () => {
    return (
        <footer className="py-20 border-t border-white/5 bg-black/80">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl border border-primary-500/30">
                                <Package size={28} className="text-primary-400" />
                            </div>
                            <span className="text-3xl font-black">
                                L<NeonText color="#0ea5e9">&</NeonText>F
                            </span>
                        </div>
                        <p className="text-slate-400 max-w-sm">
                            The official neural recovery system for Amrita Vishwa Vidyapeetham.
                            Report, track, and recover your belongings.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Platform</h4>
                        <ul className="space-y-4">
                            {['Browse Items', 'Sign In', 'Register'].map((item, i) => (
                                <li key={i}>
                                    <ScrambleLink
                                        text={item}
                                        href={['inventory', 'login', 'register'][i]}
                                        className="text-slate-400 hover:text-primary-400 transition-colors"
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Support</h4>
                        <ul className="space-y-4">
                            {['Contact Admin', 'Privacy', 'Terms'].map((item, i) => (
                                <li key={i}>
                                    <ScrambleLink
                                        text={item}
                                        href="#"
                                        className="text-slate-400 hover:text-primary-400 transition-colors"
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/5">
                    <p className="text-slate-500 text-sm">© 2026 Amrita Lost & Found System</p>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <a href="#" className="p-3 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                            <Github size={20} />
                        </a>
                        <a href="#" className="p-3 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                            <Globe size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// ============================================
// MAIN LANDING PAGE
// ============================================
const LandingPage = () => {
    return (
        <div className="bg-[#030712] text-white overflow-x-hidden selection:bg-primary-500/30 relative">
            {/* Global Effects */}
            <ScrollProgress color="#0ea5e9" />
            <AuroraBackground />
            <CyberpunkGrid />
            <MeteorShower />
            <NoiseOverlay opacity={0.02} />
            <ParticleCursor />
            <SpotlightCursor />
            <AnimatedShapes />

            {/* Sections */}
            <HeroSection />
            <MarqueeSection />
            <HowItWorksSection />
            <FeaturesSection />
            <CTASection />
            <Footer />
        </div>
    );
};

export default LandingPage;
