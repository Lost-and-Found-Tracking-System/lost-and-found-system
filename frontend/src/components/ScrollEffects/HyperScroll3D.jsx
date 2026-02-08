/**
 * HYPER SCROLL 3D - Based on the "brutal mode" CodePen
 * 3D perspective scroll with cards flying through space
 * Features: HUD, velocity-based effects, star warping, chromatic aberration
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

const HyperScroll3D = ({ items = [], className = '' }) => {
    const viewportRef = useRef(null);
    const worldRef = useRef(null);
    const itemsRef = useRef([]);
    const stateRef = useRef({ scroll: 0, velocity: 0, targetSpeed: 0, mouseX: 0, mouseY: 0 });
    const [fps, setFps] = useState(60);
    const [velocity, setVelocity] = useState(0);
    const [coord, setCoord] = useState(0);

    const CONFIG = {
        itemCount: items.length || 15,
        starCount: 100,
        zGap: 800,
        camSpeed: 2.5
    };
    const loopSize = CONFIG.itemCount * CONFIG.zGap;

    useEffect(() => {
        let lastTime = 0;
        let animationId;
        let scrollY = 0;

        const handleScroll = () => {
            const newScroll = window.scrollY;
            stateRef.current.targetSpeed = (newScroll - scrollY) * 0.5;
            scrollY = newScroll;
            stateRef.current.scroll = newScroll;
        };

        const handleMouseMove = (e) => {
            stateRef.current.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            stateRef.current.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        const animate = (time) => {
            const delta = time - lastTime;
            lastTime = time;

            if (time % 10 < 1) setFps(Math.round(1000 / delta));

            // Smooth velocity
            stateRef.current.velocity += (stateRef.current.targetSpeed - stateRef.current.velocity) * 0.1;
            stateRef.current.targetSpeed *= 0.95;

            setVelocity(Math.abs(stateRef.current.velocity).toFixed(2));
            setCoord(stateRef.current.scroll.toFixed(0));

            // Camera tilt
            const tiltX = stateRef.current.mouseY * 5 - stateRef.current.velocity * 0.5;
            const tiltY = stateRef.current.mouseX * 5;

            if (worldRef.current) {
                worldRef.current.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            }

            // Dynamic perspective (warp effect)
            const baseFov = 1000;
            const fov = baseFov - Math.min(Math.abs(stateRef.current.velocity) * 10, 600);
            if (viewportRef.current) {
                viewportRef.current.style.perspective = `${fov}px`;
            }

            // Update items
            const cameraZ = stateRef.current.scroll * CONFIG.camSpeed;

            itemsRef.current.forEach((item, index) => {
                if (!item.el) return;

                const baseZ = -index * CONFIG.zGap;
                let relZ = baseZ + cameraZ;
                let vizZ = ((relZ % loopSize) + loopSize) % loopSize;
                if (vizZ > 500) vizZ -= loopSize;

                // Opacity based on distance
                let alpha = 1;
                if (vizZ < -3000) alpha = 0;
                else if (vizZ < -2000) alpha = (vizZ + 3000) / 1000;
                if (vizZ > 100) alpha = 1 - ((vizZ - 100) / 400);
                if (alpha < 0) alpha = 0;

                item.el.style.opacity = alpha;

                if (alpha > 0) {
                    const floatY = Math.sin(time * 0.001 + item.x) * 10;
                    item.el.style.transform = `translate3d(${item.x}px, ${item.y + floatY}px, ${vizZ}px) rotateZ(${item.rot}deg)`;

                    // RGB split on fast scroll
                    if (Math.abs(stateRef.current.velocity) > 2) {
                        const offset = stateRef.current.velocity * 1.5;
                        item.el.style.textShadow = `${offset}px 0 #ff003c, ${-offset}px 0 #00f3ff`;
                    } else {
                        item.el.style.textShadow = 'none';
                    }
                }
            });

            animationId = requestAnimationFrame(animate);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);
        animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, [loopSize, CONFIG.zGap, CONFIG.camSpeed]);

    // Initialize items
    useEffect(() => {
        itemsRef.current = items.map((_, i) => {
            const angle = (i / items.length) * Math.PI * 6;
            return {
                x: Math.cos(angle) * (window.innerWidth * 0.25),
                y: Math.sin(angle) * (window.innerHeight * 0.2),
                rot: (Math.random() - 0.5) * 30,
                el: null
            };
        });
    }, [items]);

    return (
        <div className={`hyper-scroll-container ${className}`}>
            {/* Overlays */}
            <div className="scanlines" />
            <div className="vignette" />
            <div className="noise-overlay" />

            {/* HUD */}
            <div className="hud">
                <div className="hud-top">
                    <span>SYS.READY</span>
                    <div className="hud-line" />
                    <span>FPS: <strong>{fps}</strong></span>
                </div>
                <div className="hud-side">
                    SCROLL VELOCITY // <strong>{velocity}</strong>
                </div>
                <div className="hud-bottom">
                    <span>COORD: <strong>{coord}</strong></span>
                    <div className="hud-line" />
                    <span>VER 2.0</span>
                </div>
            </div>

            {/* 3D World */}
            <div ref={viewportRef} className="viewport">
                <div ref={worldRef} className="world">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            ref={el => {
                                if (itemsRef.current[i]) itemsRef.current[i].el = el;
                            }}
                            className="hyper-item"
                        >
                            {item}
                        </div>
                    ))}

                    {/* Stars */}
                    {[...Array(CONFIG.starCount)].map((_, i) => (
                        <div
                            key={`star-${i}`}
                            className="star"
                            style={{
                                left: `${(Math.random() - 0.5) * 200}%`,
                                top: `${(Math.random() - 0.5) * 200}%`,
                                transform: `translateZ(${-Math.random() * loopSize}px)`
                            }}
                        />
                    ))}
                </div>
            </div>

            <style>{`
                .hyper-scroll-container {
                    position: relative;
                    background: #030303;
                    color: #e0e0e0;
                    font-family: 'Syncopate', sans-serif;
                    overflow: hidden;
                    cursor: crosshair;
                }

                .scanlines {
                    position: fixed;
                    inset: 0;
                    background: linear-gradient(to bottom,
                        rgba(255, 255, 255, 0),
                        rgba(255, 255, 255, 0) 50%,
                        rgba(0, 0, 0, 0.2) 50%,
                        rgba(0, 0, 0, 0.2));
                    background-size: 100% 4px;
                    pointer-events: none;
                    z-index: 10;
                }

                .vignette {
                    position: fixed;
                    inset: 0;
                    background: radial-gradient(circle, transparent 40%, #000 120%);
                    z-index: 11;
                    pointer-events: none;
                }

                .noise-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 12;
                    opacity: 0.07;
                    pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                }

                .hud {
                    position: fixed;
                    inset: 2rem;
                    z-index: 20;
                    pointer-events: none;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                }

                .hud-top, .hud-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .hud strong {
                    color: #00f3ff;
                }

                .hud-line {
                    flex: 1;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.2);
                    margin: 0 1rem;
                    position: relative;
                }

                .hud-line::after {
                    content: '';
                    position: absolute;
                    right: 0;
                    top: -2px;
                    width: 5px;
                    height: 5px;
                    background: #ff003c;
                }

                .hud-side {
                    align-self: flex-start;
                    margin-top: auto;
                    margin-bottom: auto;
                    writing-mode: vertical-rl;
                    transform: rotate(180deg);
                }

                .viewport {
                    position: fixed;
                    inset: 0;
                    perspective: 1000px;
                    overflow: hidden;
                    z-index: 1;
                }

                .world {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform-style: preserve-3d;
                    will-change: transform;
                }

                .hyper-item {
                    position: absolute;
                    left: 0;
                    top: 0;
                    backface-visibility: hidden;
                    transform-origin: center center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .star {
                    position: absolute;
                    width: 2px;
                    height: 2px;
                    background: white;
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
};

// Card component for use with HyperScroll3D
export const HyperCard = ({ id, title, children, className = '' }) => (
    <div className={`hyper-card ${className}`}>
        <div className="hyper-card-header">
            <span className="hyper-card-id">ID-{id}</span>
            <div className="hyper-card-dot" />
        </div>
        <h2 className="hyper-card-title">{title}</h2>
        {children}
        <style>{`
            .hyper-card {
                width: 320px;
                min-height: 400px;
                background: rgba(10, 10, 10, 0.4);
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 2rem;
                display: flex;
                flex-direction: column;
                backdrop-filter: blur(8px);
                box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5), 0 20px 50px rgba(0, 0, 0, 0.5);
                transform: translate(-50%, -50%);
                transition: all 0.3s;
            }

            .hyper-card:hover {
                border-color: #ff003c;
                box-shadow: 0 0 30px rgba(255, 0, 60, 0.2);
            }

            .hyper-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 1rem;
                margin-bottom: 1rem;
            }

            .hyper-card-id {
                font-family: 'JetBrains Mono', monospace;
                color: #ff003c;
                font-size: 0.8rem;
            }

            .hyper-card-dot {
                width: 10px;
                height: 10px;
                background: #ff003c;
            }

            .hyper-card-title {
                font-size: 2.5rem;
                line-height: 0.9;
                margin: 0;
                text-transform: uppercase;
                font-weight: 700;
                color: #fff;
            }
        `}</style>
    </div>
);

export default HyperScroll3D;
