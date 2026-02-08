/**
 * ADVANCED PREMIUM EFFECTS - PART 2
 * More implementations from CodePen effects
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';

// ============================================
// 21. DNA HELIX LOADER (isladjan style)
// ============================================
export const DNALoader = ({ size = 100 }) => {
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <div className="dna-helix">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="dna-strand" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="dna-dot dna-dot-1" />
                        <div className="dna-connector" />
                        <div className="dna-dot dna-dot-2" />
                    </div>
                ))}
            </div>
            <style>{`
                .dna-helix {
                    display: flex;
                    align-items: center;
                    height: 100%;
                    perspective: 500px;
                }
                .dna-strand {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    animation: dna-rotate 1.5s ease-in-out infinite;
                }
                .dna-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #0ea5e9;
                }
                .dna-dot-2 {
                    background: #8b5cf6;
                }
                .dna-connector {
                    width: 2px;
                    height: 20px;
                    background: linear-gradient(to bottom, #0ea5e9, #8b5cf6);
                }
                @keyframes dna-rotate {
                    0%, 100% { transform: rotateY(0deg) scale(1); }
                    50% { transform: rotateY(180deg) scale(0.5); }
                }
            `}</style>
        </div>
    );
};

// ============================================
// 22. GLOWING ORB (osmosupply style)
// ============================================
export const GlowingOrb = ({ color = '#0ea5e9', size = 200, pulseSpeed = 2 }) => {
    const orbRef = useRef(null);

    useEffect(() => {
        gsap.to(orbRef.current, {
            scale: 1.2,
            opacity: 0.8,
            duration: pulseSpeed,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }, [pulseSpeed]);

    return (
        <div
            ref={orbRef}
            className="rounded-full"
            style={{
                width: size,
                height: size,
                background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
                boxShadow: `0 0 60px ${color}40, 0 0 120px ${color}20, 0 0 180px ${color}10`,
                filter: 'blur(1px)'
            }}
        />
    );
};

// ============================================
// 23. SPLIT REVEAL TEXT (cbolson style)
// ============================================
export const SplitRevealText = ({ text, className = '' }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const topHalf = container.querySelector('.top-half');
        const bottomHalf = container.querySelector('.bottom-half');

        gsap.fromTo([topHalf, bottomHalf],
            { clipPath: 'inset(50% 0)' },
            {
                clipPath: 'inset(0% 0)',
                duration: 1.2,
                ease: 'power4.out',
                stagger: 0.1,
                scrollTrigger: {
                    trigger: container,
                    start: 'top 80%'
                }
            }
        );
    }, []);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="top-half" style={{ clipPath: 'inset(50% 0)' }}>{text}</div>
            <div
                className="bottom-half absolute top-0 left-0"
                style={{ clipPath: 'inset(50% 0)', transform: 'scaleY(-1) translateY(100%)' }}
            >
                {text}
            </div>
        </div>
    );
};

// ============================================
// 24. METEOR SHOWER (VoXelo style)
// ============================================
export const MeteorShower = () => {
    const meteors = useMemo(() =>
        [...Array(20)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: Math.random() * 2 + 1
        })), []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {meteors.map(meteor => (
                <div
                    key={meteor.id}
                    className="meteor"
                    style={{
                        left: `${meteor.left}%`,
                        animationDelay: `${meteor.delay}s`,
                        animationDuration: `${meteor.duration}s`
                    }}
                />
            ))}
            <style>{`
                .meteor {
                    position: absolute;
                    top: -100px;
                    width: 2px;
                    height: 80px;
                    background: linear-gradient(to bottom, rgba(14,165,233,0.8), transparent);
                    transform: rotate(45deg);
                    animation: meteor-fall linear infinite;
                }
                @keyframes meteor-fall {
                    0% {
                        transform: translateY(0) translateX(0) rotate(45deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) translateX(100px) rotate(45deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

// ============================================
// 25. HOLOGRAPHIC CARD (aleksa-rakocevic style)
// ============================================
export const HolographicCard = ({ children, className = '' }) => {
    const cardRef = useRef(null);
    const [position, setPosition] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e) => {
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPosition({ x, y });

        const rotateX = (y - 50) * 0.2;
        const rotateY = (x - 50) * -0.2;

        gsap.to(cardRef.current, {
            rotateX,
            rotateY,
            duration: 0.3,
            ease: 'power2.out'
        });
    };

    const handleMouseLeave = () => {
        gsap.to(cardRef.current, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.5,
            ease: 'power2.out'
        });
    };

    return (
        <div
            ref={cardRef}
            className={`relative overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transformStyle: 'preserve-3d',
                perspective: 1000
            }}
        >
            {/* Holographic overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                    background: `
                        linear-gradient(
                            ${position.x}deg,
                            transparent 0%,
                            rgba(255,0,100,0.1) 20%,
                            rgba(0,255,200,0.1) 40%,
                            rgba(100,0,255,0.1) 60%,
                            transparent 80%
                        )
                    `,
                    mixBlendMode: 'overlay'
                }}
            />
            {/* Shine effect */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.3), transparent 50%)`,
                    mixBlendMode: 'overlay'
                }}
            />
            {children}
        </div>
    );
};

// ============================================
// 26. MATRIX RAIN (JavaScriptJunkie style)
// ============================================
export const MatrixRain = ({ opacity = 0.1 }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);

        const draw = () => {
            ctx.fillStyle = `rgba(3, 7, 18, 0.05)`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#0ea5e9';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }

            animationId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ opacity }}
        />
    );
};

// ============================================
// 27. BREATHING CIRCLE (thebabydino style)
// ============================================
export const BreathingCircle = ({ size = 200, color = '#0ea5e9' }) => {
    return (
        <div
            className="relative"
            style={{
                width: size,
                height: size
            }}
        >
            {[0, 1, 2].map(i => (
                <div
                    key={i}
                    className="absolute inset-0 rounded-full"
                    style={{
                        border: `2px solid ${color}`,
                        opacity: 0.3 - i * 0.1,
                        animation: `breathe 4s ease-in-out infinite ${i * 0.5}s`
                    }}
                />
            ))}
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `radial-gradient(circle, ${color}20, transparent 70%)`,
                    animation: 'breathe 4s ease-in-out infinite'
                }}
            />
            <style>{`
                @keyframes breathe {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

// ============================================
// 28. CYBERPUNK GRID (filipz style)
// ============================================
export const CyberpunkGrid = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        linear-gradient(90deg, rgba(14,165,233,0.03) 1px, transparent 1px),
                        linear-gradient(rgba(14,165,233,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                    transform: 'perspective(500px) rotateX(60deg)',
                    transformOrigin: 'top',
                    height: '200%',
                    animation: 'grid-scroll 20s linear infinite'
                }}
            />
            <div
                className="absolute bottom-0 left-0 right-0 h-1/2"
                style={{
                    background: 'linear-gradient(transparent, #030712 80%)'
                }}
            />
            <style>{`
                @keyframes grid-scroll {
                    0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
                    100% { transform: perspective(500px) rotateX(60deg) translateY(50px); }
                }
            `}</style>
        </div>
    );
};

// ============================================
// 29. NEON TEXT (multiple pens)
// ============================================
export const NeonText = ({ children, color = '#0ea5e9', className = '' }) => {
    const [isOn, setIsOn] = useState(true);

    useEffect(() => {
        // Flicker effect
        const flicker = () => {
            if (Math.random() > 0.95) {
                setIsOn(false);
                setTimeout(() => setIsOn(true), 50 + Math.random() * 100);
            }
        };

        const interval = setInterval(flicker, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <span
            className={`inline-block transition-all duration-75 ${className}`}
            style={{
                color: isOn ? color : 'transparent',
                textShadow: isOn ? `
                    0 0 5px ${color},
                    0 0 10px ${color},
                    0 0 20px ${color},
                    0 0 40px ${color},
                    0 0 80px ${color}
                ` : 'none'
            }}
        >
            {children}
        </span>
    );
};

// ============================================
// 30. PULSE RINGS (soju22 style)
// ============================================
export const PulseRings = ({ color = '#0ea5e9', size = 200 }) => {
    return (
        <div
            className="relative"
            style={{ width: size, height: size }}
        >
            {[0, 1, 2, 3].map(i => (
                <div
                    key={i}
                    className="absolute inset-0 rounded-full"
                    style={{
                        border: `1px solid ${color}`,
                        animation: `pulse-ring 3s ease-out infinite ${i * 0.75}s`
                    }}
                />
            ))}
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                style={{ background: color }}
            />
            <style>{`
                @keyframes pulse-ring {
                    0% { transform: scale(0.3); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

// ============================================
// 31. FLOATING ICONS (sabosugi style)
// ============================================
export const FloatingIcons = ({ icons, className = '' }) => {
    return (
        <div className={`relative ${className}`}>
            {icons.map((Icon, i) => (
                <div
                    key={i}
                    className="absolute"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `float-icon ${3 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 2}s`
                    }}
                >
                    <Icon
                        size={24 + Math.random() * 16}
                        className="text-primary-400/30"
                    />
                </div>
            ))}
            <style>{`
                @keyframes float-icon {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(10deg); }
                }
            `}</style>
        </div>
    );
};

// ============================================
// 32. GRADIENT BORDER ANIMATION (cameronknight style)
// ============================================
export const GradientBorderCard = ({ children, className = '' }) => {
    return (
        <div className={`relative p-[2px] rounded-2xl overflow-hidden ${className}`}>
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(90deg, #0ea5e9, #8b5cf6, #ec4899, #0ea5e9)',
                    backgroundSize: '300% 100%',
                    animation: 'gradient-border 3s linear infinite'
                }}
            />
            <div className="relative bg-slate-900 rounded-2xl p-6">
                {children}
            </div>
            <style>{`
                @keyframes gradient-border {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 300% 50%; }
                }
            `}</style>
        </div>
    );
};

// ============================================
// 33. SCROLL PROGRESS BAR
// ============================================
export const ScrollProgress = ({ color = '#0ea5e9' }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            setProgress(scrollPercent);
        };

        window.addEventListener('scroll', updateProgress);
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 h-1 z-50">
            <div
                className="h-full transition-all duration-150"
                style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${color}, #8b5cf6)`,
                    boxShadow: `0 0 10px ${color}`
                }}
            />
        </div>
    );
};

// ============================================
// 34. HOVER UNDERLINE (BalintFerenczy style)
// ============================================
export const HoverUnderline = ({ children, className = '' }) => {
    return (
        <span className={`relative inline-block group ${className}`}>
            {children}
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary-400 transition-all duration-300 group-hover:w-full" />
        </span>
    );
};

// ============================================
// 35. LOADING DOTS (daniel-mu-oz style)
// ============================================
export const LoadingDots = ({ color = '#0ea5e9' }) => {
    return (
        <div className="flex gap-1">
            {[0, 1, 2].map(i => (
                <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                        background: color,
                        animation: `bounce-dot 1.4s ease-in-out infinite ${i * 0.16}s`
                    }}
                />
            ))}
            <style>{`
                @keyframes bounce-dot {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

// ============================================
// 36. TILT CARD (filipz style)
// ============================================
export const TiltCard = ({ children, className = '', intensity = 1 }) => {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(card, {
            rotateX: (-y / 10) * intensity,
            rotateY: (x / 10) * intensity,
            scale: 1.02,
            duration: 0.3,
            ease: 'power2.out'
        });

        // Highlight effect
        card.style.setProperty('--x', `${(e.clientX - rect.left) / rect.width * 100}%`);
        card.style.setProperty('--y', `${(e.clientY - rect.top) / rect.height * 100}%`);
    };

    const handleMouseLeave = () => {
        gsap.to(cardRef.current, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)'
        });
    };

    return (
        <div
            ref={cardRef}
            className={`relative overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transformStyle: 'preserve-3d',
                perspective: 1000
            }}
        >
            {/* Highlight overlay */}
            <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.1), transparent 50%)'
                }}
            />
            {children}
        </div>
    );
};

// ============================================
// 37. ANIMATED BACKGROUND SHAPES
// ============================================
export const AnimatedShapes = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full opacity-10"
                    style={{
                        width: 200 + i * 100,
                        height: 200 + i * 100,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        background: i % 2 === 0
                            ? 'linear-gradient(135deg, #0ea5e9, #8b5cf6)'
                            : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        filter: 'blur(60px)',
                        animation: `float-shape ${20 + i * 5}s ease-in-out infinite ${i * 2}s`
                    }}
                />
            ))}
            <style>{`
                @keyframes float-shape {
                    0%, 100% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    25% {
                        transform: translate(50px, -30px) rotate(90deg);
                    }
                    50% {
                        transform: translate(-30px, 50px) rotate(180deg);
                    }
                    75% {
                        transform: translate(-50px, -20px) rotate(270deg);
                    }
                }
            `}</style>
        </div>
    );
};

// ============================================
// 38. TEXT SHADOW EFFECT (QwwQYRE style)
// ============================================
export const ShadowText = ({ children, className = '' }) => {
    return (
        <span
            className={className}
            style={{
                textShadow: `
                    1px 1px 0 #0ea5e9,
                    2px 2px 0 #0d9dc8,
                    3px 3px 0 #0b94b7,
                    4px 4px 0 #0a8ca6,
                    5px 5px 0 #088495,
                    6px 6px 0 #077c84,
                    7px 7px 10px rgba(0,0,0,0.5)
                `
            }}
        >
            {children}
        </span>
    );
};

// ============================================
// 39. PARTICLE EXPLOSION ON CLICK
// ============================================
export const ParticleExplosion = ({ children, className = '' }) => {
    const containerRef = useRef(null);

    const explode = (e) => {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle-explosion';
            particle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 6px;
                height: 6px;
                background: hsl(${Math.random() * 60 + 180}, 100%, 60%);
                border-radius: 50%;
                pointer-events: none;
            `;

            containerRef.current.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const velocity = 50 + Math.random() * 100;

            gsap.to(particle, {
                x: Math.cos(angle) * velocity,
                y: Math.sin(angle) * velocity,
                opacity: 0,
                scale: 0,
                duration: 0.6 + Math.random() * 0.4,
                ease: 'power2.out',
                onComplete: () => particle.remove()
            });
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative overflow-visible ${className}`}
            onClick={explode}
        >
            {children}
        </div>
    );
};

// ============================================
// 40. STACKED CARDS EFFECT
// ============================================
export const StackedCards = ({ cards, className = '' }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className={`relative ${className}`} style={{ perspective: 1000 }}>
            {cards.map((card, i) => {
                const distance = i - activeIndex;
                return (
                    <div
                        key={i}
                        className="absolute inset-0 cursor-pointer transition-all duration-500"
                        style={{
                            transform: `
                                translateZ(${-Math.abs(distance) * 50}px)
                                translateY(${distance * 20}px)
                                rotateX(${distance * -5}deg)
                                scale(${1 - Math.abs(distance) * 0.1})
                            `,
                            opacity: 1 - Math.abs(distance) * 0.3,
                            zIndex: cards.length - Math.abs(distance),
                            pointerEvents: i === activeIndex ? 'auto' : 'none'
                        }}
                        onClick={() => setActiveIndex((activeIndex + 1) % cards.length)}
                    >
                        {card}
                    </div>
                );
            })}
        </div>
    );
};

export default {
    DNALoader,
    GlowingOrb,
    SplitRevealText,
    MeteorShower,
    HolographicCard,
    MatrixRain,
    BreathingCircle,
    CyberpunkGrid,
    NeonText,
    PulseRings,
    FloatingIcons,
    GradientBorderCard,
    ScrollProgress,
    HoverUnderline,
    LoadingDots,
    TiltCard,
    AnimatedShapes,
    ShadowText,
    ParticleExplosion,
    StackedCards
};
