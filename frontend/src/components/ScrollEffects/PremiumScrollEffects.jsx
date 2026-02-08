/**
 * Premium Scroll Effects Library
 * Inspired by CodePen examples - converted to React with GSAP
 * 
 * Features from:
 * - Option 1: SVG Parallax + Scene Transitions  
 * - Option 2: 3D Hyper Scroll + HUD Overlays
 * - Option 3: Text Reveal + Parallax Images
 */

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// POST-PROCESSING OVERLAYS (Option 2 Style)
// ============================================

export const ScanlineOverlay = ({ intensity = 0.15, lineHeight = 4 }) => (
    <div
        className="scanline-overlay"
        style={{
            position: 'fixed',
            inset: 0,
            background: `linear-gradient(to bottom,
        rgba(255, 255, 255, 0),
        rgba(255, 255, 255, 0) 50%,
        rgba(0, 0, 0, ${intensity}) 50%,
        rgba(0, 0, 0, ${intensity}))`,
            backgroundSize: `100% ${lineHeight}px`,
            pointerEvents: 'none',
            zIndex: 9998,
            mixBlendMode: 'overlay'
        }}
    />
);

export const VignetteOverlay = ({ intensity = 120 }) => (
    <div
        className="vignette-overlay"
        style={{
            position: 'fixed',
            inset: 0,
            background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,0.7) ${intensity}%)`,
            pointerEvents: 'none',
            zIndex: 9997
        }}
    />
);

export const NoiseOverlay = ({ opacity = 0.03 }) => (
    <div
        className="noise-overlay"
        style={{
            position: 'fixed',
            inset: 0,
            opacity,
            pointerEvents: 'none',
            zIndex: 9996,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            animation: 'noise 0.5s steps(10) infinite'
        }}
    />
);

// ============================================
// 3D PERSPECTIVE CONTAINER (Option 2 Style)
// ============================================

export const Perspective3DContainer = ({
    children,
    basePerspective = 1000,
    mouseInfluence = 5,
    scrollVelocityEffect = true
}) => {
    const containerRef = useRef(null);
    const worldRef = useRef(null);
    const [velocity, setVelocity] = useState(0);

    useEffect(() => {
        const container = containerRef.current;
        const world = worldRef.current;
        if (!container || !world) return;

        let mouseX = 0, mouseY = 0;
        let scrollVel = 0;

        const handleMouseMove = (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        const handleScroll = () => {
            scrollVel = Math.min(Math.abs(window.scrollY - (scrollVel || 0)), 50);
            setVelocity(scrollVel);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll, { passive: true });

        const animate = () => {
            const tiltX = mouseY * mouseInfluence;
            const tiltY = mouseX * mouseInfluence;

            gsap.to(world, {
                rotateX: tiltX,
                rotateY: tiltY,
                duration: 0.5,
                ease: 'power2.out'
            });

            if (scrollVelocityEffect) {
                const dynamicPerspective = basePerspective - Math.min(scrollVel * 10, 400);
                container.style.perspective = `${dynamicPerspective}px`;
            }

            requestAnimationFrame(animate);
        };

        const raf = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(raf);
        };
    }, [basePerspective, mouseInfluence, scrollVelocityEffect]);

    return (
        <div
            ref={containerRef}
            style={{
                perspective: `${basePerspective}px`,
                perspectiveOrigin: 'center center',
                transformStyle: 'preserve-3d'
            }}
        >
            <div
                ref={worldRef}
                style={{
                    transformStyle: 'preserve-3d',
                    willChange: 'transform'
                }}
            >
                {children}
            </div>
        </div>
    );
};

// ============================================
// PARALLAX LAYERS (Option 1 Style)
// ============================================

export const ParallaxLayer = ({
    children,
    speed = 0.5,
    direction = 'vertical',
    className = ''
}) => {
    const layerRef = useRef(null);

    useEffect(() => {
        const el = layerRef.current;
        if (!el) return;

        const multiplier = direction === 'horizontal' ? { x: speed * 100, y: 0 } : { x: 0, y: speed * 100 };

        gsap.to(el, {
            x: multiplier.x,
            y: multiplier.y,
            ease: 'none',
            scrollTrigger: {
                trigger: el.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(st => {
                if (st.trigger === el.parentElement) st.kill();
            });
        };
    }, [speed, direction]);

    return (
        <div ref={layerRef} className={`parallax-layer ${className}`}>
            {children}
        </div>
    );
};

// ============================================
// TEXT SPLIT REVEAL (Option 3 Style)
// ============================================

export const SplitTextReveal = ({
    text,
    className = '',
    direction = 'up',
    stagger = 0.05,
    duration = 0.8
}) => {
    const containerRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || hasAnimated.current) return;

        const chars = container.querySelectorAll('.split-char');

        const fromVars = {
            up: { y: '100%', opacity: 0 },
            down: { y: '-100%', opacity: 0 },
            left: { x: '100%', opacity: 0 },
            right: { x: '-100%', opacity: 0 }
        };

        gsap.set(chars, fromVars[direction]);

        ScrollTrigger.create({
            trigger: container,
            start: 'top 80%',
            onEnter: () => {
                if (hasAnimated.current) return;
                hasAnimated.current = true;
                gsap.to(chars, {
                    y: 0,
                    x: 0,
                    opacity: 1,
                    duration,
                    stagger,
                    ease: 'power3.out'
                });
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(st => {
                if (st.trigger === container) st.kill();
            });
        };
    }, [direction, stagger, duration]);

    return (
        <div ref={containerRef} className={`split-text-container ${className}`}>
            {text.split('').map((char, i) => (
                <span
                    key={i}
                    className="split-char"
                    style={{
                        display: 'inline-block',
                        overflow: 'hidden'
                    }}
                >
                    <span style={{ display: 'inline-block' }}>
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                </span>
            ))}
        </div>
    );
};

// ============================================
// HERO REVEAL SECTION (Option 3 Style)
// ============================================

export const HeroReveal = ({
    children,
    splitText,
    backgroundColor = 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%)'
}) => {
    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        const header = headerRef.current;
        const content = contentRef.current;
        if (!section || !header || !content) return;

        // Pin the header while scrolling through content
        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            pin: header,
            pinSpacing: false
        });

        // Reveal content with clip-path
        gsap.fromTo(content,
            { clipPath: 'inset(100% 0 0 0)' },
            {
                clipPath: 'inset(0% 0 0 0)',
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: '50% top',
                    scrub: 1
                }
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach(st => {
                if (st.trigger === section) st.kill();
            });
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="hero-reveal-section"
            style={{
                position: 'relative',
                minHeight: '200vh',
                background: backgroundColor
            }}
        >
            <header
                ref={headerRef}
                className="hero-reveal-header"
                style={{
                    position: 'relative',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                }}
            >
                {splitText && (
                    <SplitTextReveal
                        text={splitText}
                        className="hero-split-text"
                        duration={1.2}
                        stagger={0.03}
                    />
                )}
            </header>
            <div
                ref={contentRef}
                className="hero-reveal-content"
                style={{
                    position: 'relative',
                    background: backgroundColor,
                    zIndex: 2
                }}
            >
                {children}
            </div>
        </section>
    );
};

// ============================================
// FLOATING CARDS IN 3D SPACE (Option 2 Style)
// ============================================

export const Floating3DCard = ({
    children,
    index = 0,
    depth = 0,
    rotationRange = 15,
    floatAmplitude = 10
}) => {
    const cardRef = useRef(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        // Initial position based on index (spiral pattern)
        const angle = (index / 10) * Math.PI * 2;
        const radius = 100 + (index * 30);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const baseRotation = (Math.random() - 0.5) * rotationRange;

        gsap.set(card, {
            x,
            y,
            z: depth,
            rotateZ: baseRotation,
            transformPerspective: 1000
        });

        // Floating animation
        gsap.to(card, {
            y: `+=${floatAmplitude}`,
            rotateY: baseRotation + 5,
            duration: 2 + Math.random() * 2,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
        });

        return () => {
            gsap.killTweensOf(card);
        };
    }, [index, depth, rotationRange, floatAmplitude]);

    return (
        <div
            ref={cardRef}
            className="floating-3d-card"
            style={{
                position: 'absolute',
                transformStyle: 'preserve-3d',
                willChange: 'transform'
            }}
        >
            {children}
        </div>
    );
};

// ============================================
// SCROLL-LINKED GRADIENT BACKGROUND (Option 1 Style)
// ============================================

export const ScrollGradientBackground = ({
    gradientStops = [
        { position: 0, colors: ['#667eea', '#764ba2'] },
        { position: 0.5, colors: ['#f093fb', '#f5576c'] },
        { position: 1, colors: ['#0f0c29', '#302b63', '#24243e'] }
    ]
}) => {
    const bgRef = useRef(null);

    useEffect(() => {
        const bg = bgRef.current;
        if (!bg) return;

        const updateGradient = () => {
            const scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

            // Find which gradient stops we're between
            let lowerStop = gradientStops[0];
            let upperStop = gradientStops[gradientStops.length - 1];

            for (let i = 0; i < gradientStops.length - 1; i++) {
                if (scrollProgress >= gradientStops[i].position && scrollProgress <= gradientStops[i + 1].position) {
                    lowerStop = gradientStops[i];
                    upperStop = gradientStops[i + 1];
                    break;
                }
            }

            // Interpolate between stops
            const localProgress = (scrollProgress - lowerStop.position) / (upperStop.position - lowerStop.position);

            const gradient = `linear-gradient(135deg, 
        ${lowerStop.colors.map((c, i) => {
                const upper = upperStop.colors[i] || upperStop.colors[upperStop.colors.length - 1];
                return interpolateColor(c, upper, localProgress);
            }).join(', ')})`;

            bg.style.background = gradient;
        };

        window.addEventListener('scroll', updateGradient, { passive: true });
        updateGradient();

        return () => window.removeEventListener('scroll', updateGradient);
    }, [gradientStops]);

    return (
        <div
            ref={bgRef}
            className="scroll-gradient-bg"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                transition: 'background 0.3s ease-out'
            }}
        />
    );
};

// Helper function for color interpolation
function interpolateColor(color1, color2, factor) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);

    return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// ============================================
// VELOCITY-BASED EFFECTS (Option 2 Style)
// ============================================

export const useScrollVelocity = () => {
    const [velocity, setVelocity] = useState(0);
    const lastScroll = useRef(0);
    const lastTime = useRef(Date.now());

    useEffect(() => {
        const handleScroll = () => {
            const now = Date.now();
            const dt = now - lastTime.current;
            const ds = window.scrollY - lastScroll.current;

            if (dt > 0) {
                const newVelocity = (ds / dt) * 1000; // pixels per second
                setVelocity(prev => prev + (newVelocity - prev) * 0.1); // Smooth
            }

            lastScroll.current = window.scrollY;
            lastTime.current = now;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return velocity;
};

export const ChromaticAberration = ({ intensity = 1 }) => {
    const velocity = useScrollVelocity();
    const offset = Math.abs(velocity) * 0.02 * intensity;

    if (offset < 0.5) return null;

    return (
        <div
            className="chromatic-aberration"
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 9995,
                boxShadow: `
          inset ${offset}px 0 0 rgba(255, 0, 0, 0.1),
          inset ${-offset}px 0 0 rgba(0, 255, 255, 0.1)
        `
            }}
        />
    );
};

// ============================================
// SCROLL PROGRESS INDICATOR
// ============================================

export const ScrollProgressBar = ({
    position = 'top',
    height = 3,
    color = 'linear-gradient(90deg, #00f3ff, #ff003c)'
}) => {
    const barRef = useRef(null);

    useEffect(() => {
        const bar = barRef.current;
        if (!bar) return;

        const updateProgress = () => {
            const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            bar.style.transform = `scaleX(${progress})`;
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return (
        <div
            ref={barRef}
            className="scroll-progress-bar"
            style={{
                position: 'fixed',
                [position]: 0,
                left: 0,
                width: '100%',
                height: `${height}px`,
                background: color,
                transformOrigin: 'left center',
                transform: 'scaleX(0)',
                zIndex: 9999
            }}
        />
    );
};

// ============================================
// STAGGERED SECTION REVEAL
// ============================================

export const StaggeredReveal = ({
    children,
    staggerDelay = 0.1,
    animation = 'fadeUp'
}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const items = container.children;

        const animations = {
            fadeUp: { from: { y: 60, opacity: 0 }, to: { y: 0, opacity: 1 } },
            fadeIn: { from: { opacity: 0, scale: 0.95 }, to: { opacity: 1, scale: 1 } },
            slideLeft: { from: { x: 100, opacity: 0 }, to: { x: 0, opacity: 1 } },
            slideRight: { from: { x: -100, opacity: 0 }, to: { x: 0, opacity: 1 } },
            scaleUp: { from: { scale: 0.8, opacity: 0 }, to: { scale: 1, opacity: 1 } }
        };

        const anim = animations[animation] || animations.fadeUp;

        gsap.set(items, anim.from);

        ScrollTrigger.create({
            trigger: container,
            start: 'top 80%',
            onEnter: () => {
                gsap.to(items, {
                    ...anim.to,
                    duration: 0.8,
                    stagger: staggerDelay,
                    ease: 'power3.out'
                });
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(st => {
                if (st.trigger === container) st.kill();
            });
        };
    }, [staggerDelay, animation]);

    return (
        <div ref={containerRef} className="staggered-reveal-container">
            {children}
        </div>
    );
};

export default {
    ScanlineOverlay,
    VignetteOverlay,
    NoiseOverlay,
    Perspective3DContainer,
    ParallaxLayer,
    SplitTextReveal,
    HeroReveal,
    Floating3DCard,
    ScrollGradientBackground,
    useScrollVelocity,
    ChromaticAberration,
    ScrollProgressBar,
    StaggeredReveal
};
