/**
 * PREMIUM EFFECTS LIBRARY
 * Implementations inspired by 39 CodePen effects
 * All converted to React components
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

// ============================================
// 1. GLITCH TEXT EFFECT (petebarr style)
// ============================================
export const GlitchText = ({ text, className = '' }) => {
    const textRef = useRef(null);

    useEffect(() => {
        const el = textRef.current;
        if (!el) return;

        const glitchChars = '!<>-_\\/[]{}—=+*^?#________';

        const glitch = () => {
            const originalText = text;
            let iterations = 0;

            const interval = setInterval(() => {
                el.innerText = originalText
                    .split('')
                    .map((char, index) => {
                        if (index < iterations) return originalText[index];
                        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                    })
                    .join('');

                if (iterations >= originalText.length) {
                    clearInterval(interval);
                }
                iterations += 1 / 3;
            }, 30);

            return () => clearInterval(interval);
        };

        // Initial glitch
        const cleanup = glitch();

        // Glitch every few seconds
        const intervalId = setInterval(glitch, 5000);

        return () => {
            cleanup();
            clearInterval(intervalId);
        };
    }, [text]);

    return (
        <span
            ref={textRef}
            className={`font-mono ${className}`}
            data-text={text}
        >
            {text}
        </span>
    );
};

// ============================================
// 2. MAGNETIC CURSOR (filipz style)
// ============================================
export const MagneticCursor = ({ children, strength = 0.5 }) => {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleMouseMove = (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) * strength;
            const deltaY = (e.clientY - centerY) * strength;

            gsap.to(el, {
                x: deltaX,
                y: deltaY,
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        const handleMouseLeave = () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        };

        el.addEventListener('mousemove', handleMouseMove);
        el.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            el.removeEventListener('mousemove', handleMouseMove);
            el.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [strength]);

    return <div ref={ref} className="inline-block">{children}</div>;
};

// ============================================
// 3. PARTICLE CURSOR TRAIL (SandipDust style)
// ============================================
export const ParticleCursor = () => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const Particle = class {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 5 + 2;
                this.speedX = Math.random() * 3 - 1.5;
                this.speedY = Math.random() * 3 - 1.5;
                this.life = 1;
                this.color = `hsl(${Math.random() * 60 + 200}, 100%, 60%)`;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life -= 0.02;
                this.size *= 0.96;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.life;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();

                // Glow effect
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 15;
                ctx.fill();
                ctx.restore();
            }
        };

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
            for (let i = 0; i < 3; i++) {
                particlesRef.current.push(new Particle(e.clientX, e.clientY));
            }
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(3, 7, 18, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particlesRef.current = particlesRef.current.filter(p => p.life > 0);

            particlesRef.current.forEach(p => {
                p.update();
                p.draw();
            });

            animationId = requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};

// ============================================
// 4. MORPHING BLOB (creativeocean style)
// ============================================
export const MorphingBlob = ({ color1 = '#0ea5e9', color2 = '#8b5cf6', size = 400 }) => {
    const blobRef = useRef(null);

    useEffect(() => {
        const blob = blobRef.current;
        if (!blob) return;

        const tl = gsap.timeline({ repeat: -1 });

        tl.to(blob, {
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            duration: 4,
            ease: 'sine.inOut'
        })
            .to(blob, {
                borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
                duration: 4,
                ease: 'sine.inOut'
            })
            .to(blob, {
                borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%',
                duration: 4,
                ease: 'sine.inOut'
            });

        // Slow rotation
        gsap.to(blob, {
            rotation: 360,
            duration: 20,
            repeat: -1,
            ease: 'none'
        });

        return () => tl.kill();
    }, []);

    return (
        <div
            ref={blobRef}
            className="absolute blur-3xl opacity-30"
            style={{
                width: size,
                height: size,
                background: `linear-gradient(45deg, ${color1}, ${color2})`,
                borderRadius: '50%'
            }}
        />
    );
};

// ============================================
// 5. WAVE TEXT ANIMATION (multiple pens)
// ============================================
export const WaveText = ({ text, className = '', delay = 0 }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const chars = container.querySelectorAll('.wave-char');

        gsap.fromTo(chars,
            { y: 100, opacity: 0, rotateX: -90 },
            {
                y: 0,
                opacity: 1,
                rotateX: 0,
                duration: 0.8,
                stagger: 0.03,
                delay,
                ease: 'back.out(1.7)'
            }
        );

        // Continuous wave on hover
        const handleHover = () => {
            gsap.to(chars, {
                y: (i) => Math.sin(i * 0.5) * 10,
                duration: 0.3,
                stagger: 0.02,
                ease: 'sine.out'
            });
        };

        const handleLeave = () => {
            gsap.to(chars, {
                y: 0,
                duration: 0.5,
                stagger: 0.02,
                ease: 'elastic.out(1, 0.5)'
            });
        };

        container.addEventListener('mouseenter', handleHover);
        container.addEventListener('mouseleave', handleLeave);

        return () => {
            container.removeEventListener('mouseenter', handleHover);
            container.removeEventListener('mouseleave', handleLeave);
        };
    }, [delay]);

    return (
        <span ref={containerRef} className={`inline-flex ${className}`} style={{ perspective: 1000 }}>
            {text.split('').map((char, i) => (
                <span
                    key={i}
                    className="wave-char inline-block"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    );
};

// ============================================
// 6. 3D ROTATING TEXT CUBE (ste-vg style)
// ============================================
export const TextCube = ({ faces = ['LOST', 'FIND', 'TRACK', 'CLAIM'], size = 100 }) => {
    const cubeRef = useRef(null);
    const [currentFace, setCurrentFace] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFace(prev => (prev + 1) % 4);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!cubeRef.current) return;

        const rotations = [
            { rotateX: 0, rotateY: 0 },
            { rotateX: 0, rotateY: -90 },
            { rotateX: 0, rotateY: -180 },
            { rotateX: 0, rotateY: -270 }
        ];

        gsap.to(cubeRef.current, {
            ...rotations[currentFace],
            duration: 1,
            ease: 'power2.inOut'
        });
    }, [currentFace]);

    return (
        <div className="perspective-[1000px]" style={{ width: size * 2, height: size }}>
            <div
                ref={cubeRef}
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {faces.map((face, i) => (
                    <div
                        key={i}
                        className="absolute inset-0 flex items-center justify-center text-4xl font-black text-white bg-gradient-to-br from-primary-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10"
                        style={{
                            transform: `rotateY(${i * 90}deg) translateZ(${size}px)`,
                            backfaceVisibility: 'hidden'
                        }}
                    >
                        {face}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// 7. LIQUID DISTORTION TEXT (creativeocean style)
// ============================================
export const LiquidText = ({ children, className = '' }) => {
    const textRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!textRef.current) return;

        if (isHovered) {
            gsap.to(textRef.current, {
                filter: 'url(#liquid-filter)',
                duration: 0.3
            });
        } else {
            gsap.to(textRef.current, {
                filter: 'none',
                duration: 0.5
            });
        }
    }, [isHovered]);

    return (
        <>
            <svg className="absolute w-0 h-0">
                <defs>
                    <filter id="liquid-filter">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.01"
                            numOctaves="3"
                            result="noise"
                        >
                            <animate
                                attributeName="baseFrequency"
                                values="0.01;0.03;0.01"
                                dur="2s"
                                repeatCount="indefinite"
                            />
                        </feTurbulence>
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale="20"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>
            <span
                ref={textRef}
                className={className}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {children}
            </span>
        </>
    );
};

// ============================================
// 8. AURORA BACKGROUND (meodai style)
// ============================================
export const AuroraBackground = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="aurora-container absolute inset-0">
                <div className="aurora aurora-1" />
                <div className="aurora aurora-2" />
                <div className="aurora aurora-3" />
            </div>
            <style>{`
                .aurora {
                    position: absolute;
                    width: 200%;
                    height: 200%;
                    background: conic-gradient(
                        from 0deg,
                        transparent 0%,
                        rgba(14, 165, 233, 0.1) 10%,
                        transparent 20%,
                        rgba(139, 92, 246, 0.1) 30%,
                        transparent 40%
                    );
                    animation: aurora-rotate 30s linear infinite;
                    filter: blur(100px);
                }
                .aurora-1 { top: -50%; left: -50%; animation-duration: 25s; }
                .aurora-2 { top: -50%; left: -50%; animation-duration: 35s; animation-direction: reverse; opacity: 0.7; }
                .aurora-3 { top: -50%; left: -50%; animation-duration: 45s; opacity: 0.5; }
                @keyframes aurora-rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// ============================================
// 9. NOISE TEXTURE OVERLAY
// ============================================
export const NoiseOverlay = ({ opacity = 0.03 }) => {
    return (
        <div
            className="fixed inset-0 pointer-events-none z-[100]"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                opacity
            }}
        />
    );
};

// ============================================
// 10. SPOTLIGHT CURSOR (multiple pens)
// ============================================
export const SpotlightCursor = () => {
    const spotlightRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (spotlightRef.current) {
                gsap.to(spotlightRef.current, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={spotlightRef}
            className="fixed pointer-events-none z-40"
            style={{
                width: 600,
                height: 600,
                marginLeft: -300,
                marginTop: -300,
                background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 60%)',
                mixBlendMode: 'screen'
            }}
        />
    );
};

// ============================================
// 11. ELASTIC BUTTON (filipz style)
// ============================================
export const ElasticButton = ({ children, onClick, className = '' }) => {
    const buttonRef = useRef(null);

    const handleMouseDown = () => {
        gsap.to(buttonRef.current, {
            scale: 0.92,
            duration: 0.1
        });
    };

    const handleMouseUp = () => {
        gsap.to(buttonRef.current, {
            scale: 1,
            duration: 0.5,
            ease: 'elastic.out(1.2, 0.4)'
        });
    };

    const handleMouseMove = (e) => {
        const btn = buttonRef.current;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            rotateX: -y * 0.1,
            rotateY: x * 0.1,
            duration: 0.3,
            ease: 'power2.out'
        });
    };

    const handleMouseLeave = () => {
        gsap.to(buttonRef.current, {
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            duration: 0.7,
            ease: 'elastic.out(1, 0.3)'
        });
    };

    return (
        <button
            ref={buttonRef}
            className={className}
            onClick={onClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transformStyle: 'preserve-3d' }}
        >
            {children}
        </button>
    );
};

// ============================================
// 12. SCRAMBLE LINK HOVER (yudizsolutions style)
// ============================================
export const ScrambleLink = ({ text, href = '#', className = '' }) => {
    const linkRef = useRef(null);
    const originalText = useRef(text);

    const scramble = useCallback(() => {
        const el = linkRef.current;
        if (!el) return;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let iteration = 0;

        const interval = setInterval(() => {
            el.innerText = originalText.current
                .split('')
                .map((char, index) => {
                    if (index < iteration) return originalText.current[index];
                    if (char === ' ') return ' ';
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');

            if (iteration >= originalText.current.length) {
                clearInterval(interval);
            }
            iteration += 1 / 2;
        }, 30);
    }, []);

    return (
        <a
            ref={linkRef}
            href={href}
            className={`inline-block ${className}`}
            onMouseEnter={scramble}
        >
            {text}
        </a>
    );
};

// ============================================
// 13. PARALLAX FLOATING ELEMENTS
// ============================================
export const FloatingElement = ({ children, speed = 1, className = '' }) => {
    const elementRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX - window.innerWidth / 2) * 0.01 * speed;
            const y = (e.clientY - window.innerHeight / 2) * 0.01 * speed;

            gsap.to(elementRef.current, {
                x,
                y,
                duration: 1,
                ease: 'power2.out'
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [speed]);

    return (
        <div ref={elementRef} className={className}>
            {children}
        </div>
    );
};

// ============================================
// 14. STAGGERED REVEAL (blacklead-studio style)
// ============================================
export const StaggerReveal = ({ children, className = '' }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const items = el.children;

        gsap.fromTo(items,
            {
                y: 100,
                opacity: 0,
                scale: 0.8,
                rotateX: 45
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                rotateX: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 80%'
                }
            }
        );
    }, []);

    return (
        <div ref={containerRef} className={className} style={{ perspective: 1000 }}>
            {children}
        </div>
    );
};

// ============================================
// 15. GRADIENT FLOW TEXT
// ============================================
export const GradientFlowText = ({ children, className = '' }) => {
    return (
        <span
            className={`bg-clip-text text-transparent ${className}`}
            style={{
                backgroundImage: 'linear-gradient(90deg, #0ea5e9, #8b5cf6, #ec4899, #0ea5e9)',
                backgroundSize: '200% 100%',
                animation: 'gradient-flow 3s linear infinite'
            }}
        >
            {children}
            <style>{`
                @keyframes gradient-flow {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
            `}</style>
        </span>
    );
};

// ============================================
// 16. TYPEWRITER EFFECT
// ============================================
export const Typewriter = ({ texts, speed = 100, deleteSpeed = 50, pauseTime = 2000 }) => {
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const text = texts[currentIndex];

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (currentText.length < text.length) {
                    setCurrentText(text.slice(0, currentText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), pauseTime);
                }
            } else {
                if (currentText.length > 0) {
                    setCurrentText(currentText.slice(0, -1));
                } else {
                    setIsDeleting(false);
                    setCurrentIndex((prev) => (prev + 1) % texts.length);
                }
            }
        }, isDeleting ? deleteSpeed : speed);

        return () => clearTimeout(timeout);
    }, [currentText, currentIndex, isDeleting, texts, speed, deleteSpeed, pauseTime]);

    return (
        <span className="inline-flex items-center">
            {currentText}
            <span className="w-[3px] h-[1.2em] bg-primary-400 ml-1 animate-pulse" />
        </span>
    );
};

// ============================================
// 17. REVEAL ON SCROLL MASK
// ============================================
export const RevealMask = ({ children, className = '' }) => {
    const containerRef = useRef(null);
    const maskRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const mask = maskRef.current;
        if (!container || !mask) return;

        gsap.fromTo(mask,
            { scaleY: 1 },
            {
                scaleY: 0,
                transformOrigin: 'top',
                duration: 1,
                ease: 'power4.inOut',
                scrollTrigger: {
                    trigger: container,
                    start: 'top 80%'
                }
            }
        );
    }, []);

    return (
        <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
            {children}
            <div
                ref={maskRef}
                className="absolute inset-0 bg-[#030712] origin-top"
            />
        </div>
    );
};

// ============================================
// 18. 3D CARD FLIP
// ============================================
export const Card3D = ({ front, back, className = '' }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        gsap.to(cardRef.current, {
            rotateY: isFlipped ? 180 : 0,
            duration: 0.6,
            ease: 'power2.inOut'
        });
    }, [isFlipped]);

    return (
        <div
            className={`relative cursor-pointer ${className}`}
            style={{ perspective: 1000 }}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div
                ref={cardRef}
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div
                    className="absolute inset-0 backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    {front}
                </div>
                <div
                    className="absolute inset-0"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    {back}
                </div>
            </div>
        </div>
    );
};

// ============================================
// 19. RIPPLE EFFECT BUTTON
// ============================================
export const RippleButton = ({ children, onClick, className = '' }) => {
    const buttonRef = useRef(null);

    const createRipple = (e) => {
        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            background: rgba(255,255,255,0.5);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
        `;

        button.appendChild(ripple);

        gsap.to(ripple, {
            scale: 20,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => ripple.remove()
        });
    };

    return (
        <button
            ref={buttonRef}
            className={`relative overflow-hidden ${className}`}
            onClick={(e) => {
                createRipple(e);
                onClick?.(e);
            }}
        >
            {children}
        </button>
    );
};

// ============================================
// 20. INFINITE MARQUEE
// ============================================
export const InfiniteMarquee = ({ children, speed = 50, direction = 'left' }) => {
    return (
        <div className="overflow-hidden whitespace-nowrap">
            <div
                className="inline-flex"
                style={{
                    animation: `marquee ${speed}s linear infinite ${direction === 'right' ? 'reverse' : ''}`
                }}
            >
                <div className="flex">{children}</div>
                <div className="flex">{children}</div>
            </div>
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
};

export default {
    GlitchText,
    MagneticCursor,
    ParticleCursor,
    MorphingBlob,
    WaveText,
    TextCube,
    LiquidText,
    AuroraBackground,
    NoiseOverlay,
    SpotlightCursor,
    ElasticButton,
    ScrambleLink,
    FloatingElement,
    StaggerReveal,
    GradientFlowText,
    Typewriter,
    RevealMask,
    Card3D,
    RippleButton,
    InfiniteMarquee
};
