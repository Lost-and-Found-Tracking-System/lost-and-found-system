/**
 * HERO REVEAL SCROLL - Based on Alice in Wonderland CodePen
 * Parallax falling effect with hero reveal and floating objects
 * Perfect for dramatic page transitions
 */

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HeroRevealScroll = ({
    title = "DISCOVER",
    subtitle = "THE UNKNOWN",
    children,
    parallaxItems = [],
    className = ''
}) => {
    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const contentRef = useRef(null);
    const parallaxRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Split text reveal animation
            const splitItems = gsap.utils.toArray('.split-item');

            gsap.fromTo(splitItems,
                {
                    yPercent: 100,
                    clipPath: 'inset(100% 0 0 0)'
                },
                {
                    yPercent: 0,
                    clipPath: 'inset(0% 0 0 0)',
                    ease: 'power4.out',
                    duration: 1.5,
                    stagger: 0.2,
                    scrollTrigger: {
                        trigger: headerRef.current,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Content reveal with parallax
            const contentInner = contentRef.current?.querySelector('.content-inner');
            if (contentInner) {
                gsap.fromTo(contentInner,
                    {
                        yPercent: 30,
                        opacity: 0,
                        scale: 0.9
                    },
                    {
                        yPercent: 0,
                        opacity: 1,
                        scale: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: contentRef.current,
                            start: 'top 70%',
                            end: 'top 20%',
                            scrub: 1
                        }
                    }
                );
            }

            // Parallax items - falling effect
            const items = parallaxRef.current?.querySelectorAll('.parallax-item');
            if (items) {
                items.forEach((item, i) => {
                    const speed = parseFloat(item.dataset.speed) || (0.5 + Math.random() * 1.5);
                    const rotation = parseFloat(item.dataset.rotation) || (Math.random() - 0.5) * 720;

                    gsap.fromTo(item,
                        {
                            y: -200 - (i * 50),
                            rotation: 0,
                            opacity: 0,
                            scale: 0.5
                        },
                        {
                            y: 300 + (i * 100),
                            rotation: rotation,
                            opacity: 1,
                            scale: 1,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: containerRef.current,
                                start: 'top top',
                                end: 'bottom bottom',
                                scrub: speed
                            }
                        }
                    );
                });
            }

            // Background gradient shift
            gsap.to('.hero-bg-gradient', {
                '--gradient-position': '100%',
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: true
                }
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className={`hero-reveal-container ${className}`}>
            {/* Background gradient */}
            <div className="hero-bg-gradient" />

            {/* Header with split text */}
            <section ref={headerRef} className="hero-header">
                <div className="split-container">
                    <div className="split-item">
                        <span className="wide-text">{title}</span>
                    </div>
                    <div className="split-item" aria-hidden="true">
                        <span className="wide-text outline">{subtitle}</span>
                    </div>
                </div>
            </section>

            {/* Content with parallax reveal */}
            <section ref={contentRef} className="hero-content">
                <div className="content-inner">
                    {/* Parallax floating items */}
                    <div ref={parallaxRef} className="parallax-container">
                        {parallaxItems.map((item, i) => (
                            <div
                                key={i}
                                className="parallax-item"
                                data-speed={item.speed || 0.5 + Math.random()}
                                data-rotation={item.rotation || (Math.random() - 0.5) * 360}
                                style={{
                                    left: item.left || `${Math.random() * 80 + 10}%`,
                                    top: item.top || `${Math.random() * 60 + 20}%`,
                                    width: item.width || `${Math.random() * 100 + 50}px`,
                                    zIndex: item.zIndex || Math.floor(Math.random() * 10)
                                }}
                            >
                                {item.content}
                            </div>
                        ))}

                        {/* Default floating elements if none provided */}
                        {parallaxItems.length === 0 && (
                            <>
                                <div className="parallax-item floating-shape shape-1" data-speed="0.5" />
                                <div className="parallax-item floating-shape shape-2" data-speed="0.8" />
                                <div className="parallax-item floating-shape shape-3" data-speed="1.2" />
                                <div className="parallax-item floating-shape shape-4" data-speed="0.6" />
                                <div className="parallax-item floating-shape shape-5" data-speed="1.0" />
                            </>
                        )}
                    </div>

                    {/* Main content */}
                    <div className="content-text">
                        {children}
                    </div>
                </div>
            </section>

            <style>{`
                .hero-reveal-container {
                    position: relative;
                    min-height: 300vh;
                    overflow: hidden;
                }

                .hero-bg-gradient {
                    position: fixed;
                    inset: 0;
                    background: linear-gradient(
                        180deg,
                        #0f172a 0%,
                        #1e1b4b calc(var(--gradient-position, 0%) * 0.5),
                        #4c1d95 calc(var(--gradient-position, 0%)),
                        #0f172a 100%
                    );
                    z-index: -1;
                    transition: background 0.1s ease;
                }

                .hero-header {
                    position: sticky;
                    top: 0;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .split-container {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .split-item {
                    overflow: hidden;
                }

                .wide-text {
                    display: block;
                    font-size: clamp(3rem, 15vw, 12rem);
                    font-weight: 900;
                    letter-spacing: -0.05em;
                    line-height: 0.9;
                    text-transform: uppercase;
                    color: white;
                    text-align: center;
                }

                .wide-text.outline {
                    color: transparent;
                    -webkit-text-stroke: 2px rgba(255, 255, 255, 0.3);
                }

                .hero-content {
                    position: relative;
                    min-height: 200vh;
                    padding: 10vh 5vw;
                }

                .content-inner {
                    position: relative;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .parallax-container {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 1;
                }

                .parallax-item {
                    position: absolute;
                    will-change: transform;
                }

                .floating-shape {
                    border-radius: 50%;
                    opacity: 0.6;
                    filter: blur(1px);
                }

                .shape-1 {
                    left: 10%;
                    top: 20%;
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
                }

                .shape-2 {
                    left: 80%;
                    top: 30%;
                    width: 120px;
                    height: 120px;
                    background: linear-gradient(135deg, #8b5cf6, #ec4899);
                }

                .shape-3 {
                    left: 20%;
                    top: 60%;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #f59e0b, #ef4444);
                }

                .shape-4 {
                    left: 70%;
                    top: 70%;
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, #10b981, #0ea5e9);
                }

                .shape-5 {
                    left: 50%;
                    top: 40%;
                    width: 150px;
                    height: 150px;
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    opacity: 0.3;
                }

                .content-text {
                    position: relative;
                    z-index: 10;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 2rem;
                    padding: 4rem;
                    color: white;
                }

                @media (max-width: 768px) {
                    .wide-text {
                        font-size: clamp(2rem, 12vw, 6rem);
                    }
                    
                    .content-text {
                        padding: 2rem;
                    }
                }
            `}</style>
        </div>
    );
};

// Smooth scroll wrapper using Lenis-like behavior
export const SmoothScrollWrapper = ({ children, className = '' }) => {
    const wrapperRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        let current = 0;
        let target = 0;
        const ease = 0.08;
        let animationId;

        const lerp = (start, end, factor) => start + (end - start) * factor;

        const updateScroll = () => {
            target = window.scrollY;
            current = lerp(current, target, ease);

            if (contentRef.current) {
                contentRef.current.style.transform = `translateY(${-current}px)`;
            }

            animationId = requestAnimationFrame(updateScroll);
        };

        // Set body height
        if (wrapperRef.current && contentRef.current) {
            document.body.style.height = `${contentRef.current.scrollHeight}px`;
        }

        animationId = requestAnimationFrame(updateScroll);

        return () => {
            cancelAnimationFrame(animationId);
            document.body.style.height = '';
        };
    }, []);

    return (
        <div ref={wrapperRef} className={`smooth-scroll-wrapper ${className}`}>
            <div ref={contentRef} className="smooth-scroll-content">
                {children}
            </div>
            <style>{`
                .smooth-scroll-wrapper {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }

                .smooth-scroll-content {
                    will-change: transform;
                }
            `}</style>
        </div>
    );
};

export default HeroRevealScroll;
