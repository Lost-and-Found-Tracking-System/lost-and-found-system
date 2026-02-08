import { useEffect, useRef, useLayoutEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// 1. PAGE TRANSITION - Blur + Scale Entry
// ============================================
export const usePageTransition = (containerRef, selector = '.animate-in') => {
    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const elements = gsap.utils.toArray(selector);

            gsap.fromTo(elements,
                {
                    y: 60,
                    opacity: 0,
                    filter: 'blur(20px)',
                    scale: 0.9
                },
                {
                    y: 0,
                    opacity: 1,
                    filter: 'blur(0px)',
                    scale: 1,
                    duration: 1,
                    stagger: 0.08,
                    ease: 'power4.out',
                    clearProps: 'filter,scale'
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [containerRef, selector]);
};

// ============================================
// 2. SCROLL REVEAL - Various Styles
// ============================================
export const useScrollReveal = (containerRef, selector = '.reveal', options = {}) => {
    const { direction = 'up', distance = 60, duration = 0.8 } = options;

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const elements = gsap.utils.toArray(selector);

            const fromVars = {
                opacity: 0,
                scale: 0.95,
                ...(direction === 'up' && { y: distance }),
                ...(direction === 'down' && { y: -distance }),
                ...(direction === 'left' && { x: distance }),
                ...(direction === 'right' && { x: -distance }),
            };

            elements.forEach((el) => {
                gsap.fromTo(el, fromVars, {
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0,
                    duration,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    }
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, [containerRef, selector, direction, distance, duration]);
};

// ============================================
// 3. MAGNETIC HOVER - Element follows cursor
// ============================================
export const useMagneticHover = (ref, strength = 40) => {
    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseMove = (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(element, {
                x: x * (strength / 100),
                y: y * (strength / 100),
                rotateX: -y * 0.1,
                rotateY: x * 0.1,
                duration: 0.5,
                ease: 'power3.out'
            });
        };

        const handleMouseLeave = () => {
            gsap.to(element, {
                x: 0,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                duration: 1,
                ease: 'elastic.out(1, 0.3)'
            });
        };

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [ref, strength]);
};

// ============================================
// 4. 3D TILT - Card perspective effect
// ============================================
export const use3DTilt = (ref, selector = '.tilt-card', intensity = 1) => {
    useEffect(() => {
        if (!ref.current) return;

        const cards = ref.current.querySelectorAll(selector);

        const handleMouseMove = (e, card) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(card, {
                transformPerspective: 1000,
                rotateX: (-y / 10) * intensity,
                rotateY: (x / 10) * intensity,
                scale: 1.05,
                duration: 0.5,
                ease: 'power2.out'
            });

            // Update CSS variables for spotlight
            card.style.setProperty('--mouse-x', `${(e.clientX - rect.left) / rect.width * 100}%`);
            card.style.setProperty('--mouse-y', `${(e.clientY - rect.top) / rect.height * 100}%`);
        };

        const handleMouseLeave = (card) => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                duration: 0.7,
                ease: 'elastic.out(1, 0.5)'
            });
        };

        cards.forEach((card) => {
            card.addEventListener('mousemove', (e) => handleMouseMove(e, card));
            card.addEventListener('mouseleave', () => handleMouseLeave(card));
        });

        return () => {
            cards.forEach((card) => {
                card.removeEventListener('mousemove', (e) => handleMouseMove(e, card));
                card.removeEventListener('mouseleave', () => handleMouseLeave(card));
            });
        };
    }, [ref, selector, intensity]);
};

// ============================================
// 5. STAGGER ANIMATION - Grid/List items
// ============================================
export const useStaggerAnimation = (containerRef, selector = '.stagger-item', options = {}) => {
    const { duration = 0.6, stagger = 0.08, fromY = 50, fromOpacity = 0, fromScale = 0.95 } = options;

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const items = gsap.utils.toArray(selector);

            gsap.fromTo(items,
                { y: fromY, opacity: fromOpacity, scale: fromScale },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration,
                    stagger: {
                        each: stagger,
                        from: 'start'
                    },
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [containerRef, selector, duration, stagger, fromY, fromOpacity, fromScale]);
};

// ============================================
// 6. COUNTER ANIMATION - Number roll up
// ============================================
export const useCounter = (ref, endValue, options = {}) => {
    const { duration = 2.5, delay = 0, suffix = '', prefix = '', decimals = 0 } = options;
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (!ref.current || hasAnimated) return;

        const element = ref.current;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);

                    gsap.fromTo(
                        { val: 0 },
                        { val: endValue },
                        {
                            duration,
                            delay,
                            ease: 'power2.out',
                            onUpdate: function () {
                                const value = decimals > 0
                                    ? this.targets()[0].val.toFixed(decimals)
                                    : Math.floor(this.targets()[0].val);
                                element.textContent = prefix + value + suffix;
                            }
                        }
                    );
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, endValue, duration, delay, suffix, prefix, decimals, hasAnimated]);
};

// ============================================
// 7. ELASTIC BUTTON - Press effect
// ============================================
export const useElasticPress = (ref) => {
    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleDown = () => {
            gsap.to(element, {
                scale: 0.92,
                duration: 0.15,
                ease: 'power2.out'
            });
        };

        const handleUp = () => {
            gsap.to(element, {
                scale: 1,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        };

        element.addEventListener('mousedown', handleDown);
        element.addEventListener('mouseup', handleUp);
        element.addEventListener('mouseleave', handleUp);

        return () => {
            element.removeEventListener('mousedown', handleDown);
            element.removeEventListener('mouseup', handleUp);
            element.removeEventListener('mouseleave', handleUp);
        };
    }, [ref]);
};

// ============================================
// 8. MODAL ANIMATION - In/Out transitions
// ============================================
export const useModalAnimation = () => {
    const animateIn = useCallback((modalRef, overlayRef) => {
        const tl = gsap.timeline();

        if (overlayRef?.current) {
            tl.fromTo(overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
        }

        if (modalRef?.current) {
            tl.fromTo(modalRef.current,
                { scale: 0.85, opacity: 0, y: 40, filter: 'blur(10px)' },
                { scale: 1, opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'back.out(1.7)' },
                '-=0.15'
            );
        }

        return tl;
    }, []);

    const animateOut = useCallback((modalRef, overlayRef, onComplete) => {
        const tl = gsap.timeline({ onComplete });

        if (modalRef?.current) {
            tl.to(modalRef.current, {
                scale: 0.9,
                opacity: 0,
                y: 30,
                filter: 'blur(10px)',
                duration: 0.3,
                ease: 'power3.in'
            });
        }

        if (overlayRef?.current) {
            tl.to(overlayRef.current,
                { opacity: 0, duration: 0.25, ease: 'power2.in' },
                '-=0.15'
            );
        }

        return tl;
    }, []);

    return { animateIn, animateOut };
};

// ============================================
// 9. HORIZONTAL SCROLL - Pinned section
// ============================================
export const useHorizontalScroll = (containerRef, trackRef, options = {}) => {
    const { scrub = 1, snap = true } = options;

    useLayoutEffect(() => {
        if (!containerRef.current || !trackRef.current) return;

        const ctx = gsap.context(() => {
            const track = trackRef.current;
            const slides = gsap.utils.toArray(track.children);

            const snapConfig = snap ? {
                snapTo: 1 / (slides.length - 1),
                duration: { min: 0.2, max: 0.5 },
                ease: 'power2.inOut'
            } : false;

            gsap.to(slides, {
                xPercent: -100 * (slides.length - 1),
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    pin: true,
                    scrub,
                    snap: snapConfig,
                    end: () => '+=' + (track.offsetWidth - window.innerWidth)
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, [containerRef, trackRef, scrub, snap]);
};

// ============================================
// 10. PARALLAX LAYERS - Depth effect
// ============================================
export const useParallax = (containerRef, selector = '[data-parallax]') => {
    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const layers = gsap.utils.toArray(selector);

            layers.forEach((layer) => {
                const speed = parseFloat(layer.dataset.parallax) || 0.5;

                gsap.to(layer, {
                    y: () => window.innerHeight * speed * -1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, [containerRef, selector]);
};

// ============================================
// 11. SPOTLIGHT CURSOR - Glow follows mouse
// ============================================
export const useSpotlightCursor = (containerRef) => {
    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        const handleMove = (e) => {
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            container.style.setProperty('--spotlight-x', `${x}%`);
            container.style.setProperty('--spotlight-y', `${y}%`);
        };

        container.addEventListener('mousemove', handleMove);

        return () => container.removeEventListener('mousemove', handleMove);
    }, [containerRef]);
};

// ============================================
// 12. TEXT REVEAL - Line by line
// ============================================
export const useTextReveal = (containerRef, selector = '.text-reveal') => {
    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const texts = gsap.utils.toArray(selector);

            texts.forEach((text) => {
                gsap.fromTo(text,
                    { opacity: 0.1, y: 30, filter: 'blur(5px)' },
                    {
                        opacity: 1,
                        y: 0,
                        filter: 'blur(0px)',
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: text,
                            start: 'top 85%',
                            end: 'top 40%',
                            scrub: 0.5
                        }
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, [containerRef, selector]);
};

// ============================================
// 13. CARD LIFT - Hover lift effect
// ============================================
export const useCardLift = (ref, selector = '.lift-card') => {
    useEffect(() => {
        if (!ref.current) return;

        const cards = ref.current.querySelectorAll(selector);

        const handleEnter = (card) => {
            gsap.to(card, {
                y: -12,
                scale: 1.02,
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                duration: 0.4,
                ease: 'power2.out'
            });
        };

        const handleLeave = (card) => {
            gsap.to(card, {
                y: 0,
                scale: 1,
                boxShadow: '0 0 0 rgba(0,0,0,0)',
                duration: 0.4,
                ease: 'power2.out'
            });
        };

        cards.forEach((card) => {
            card.addEventListener('mouseenter', () => handleEnter(card));
            card.addEventListener('mouseleave', () => handleLeave(card));
        });

        return () => {
            cards.forEach((card) => {
                card.removeEventListener('mouseenter', () => handleEnter(card));
                card.removeEventListener('mouseleave', () => handleLeave(card));
            });
        };
    }, [ref, selector]);
};

// ============================================
// 14. SPLIT TEXT - Character animation
// ============================================
export const useSplitText = (ref, options = {}) => {
    const { type = 'chars', stagger = 0.03, duration = 0.8, ease = 'power3.out' } = options;

    useLayoutEffect(() => {
        if (!ref.current) return;

        const element = ref.current;
        const originalText = element.textContent;

        // Split into spans
        if (type === 'chars') {
            element.innerHTML = originalText.split('').map((char) =>
                `<span class="split-char" style="display:inline-block;opacity:0;transform:translateY(50px)">${char === ' ' ? '&nbsp;' : char}</span>`
            ).join('');
        } else {
            element.innerHTML = originalText.split(' ').map((word) =>
                `<span class="split-word" style="display:inline-block;opacity:0;transform:translateY(30px)">${word}&nbsp;</span>`
            ).join('');
        }

        const items = element.querySelectorAll(type === 'chars' ? '.split-char' : '.split-word');

        gsap.to(items, {
            opacity: 1,
            y: 0,
            duration,
            stagger,
            ease,
            delay: 0.2
        });

        return () => {
            element.textContent = originalText;
        };
    }, [ref, type, stagger, duration, ease]);
};

// ============================================
// 15. MORPHING BLOB - Background shapes
// ============================================
export const useMorphingBlob = (ref) => {
    useEffect(() => {
        if (!ref.current) return;

        const blob = ref.current;

        const tl = gsap.timeline({ repeat: -1, yoyo: true });

        tl.to(blob, {
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            duration: 3,
            ease: 'sine.inOut'
        })
            .to(blob, {
                borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
                duration: 3,
                ease: 'sine.inOut'
            })
            .to(blob, {
                borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%',
                duration: 3,
                ease: 'sine.inOut'
            });

        return () => tl.kill();
    }, [ref]);
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
export const refreshScrollTriggers = () => {
    ScrollTrigger.refresh();
};

export const killAllAnimations = () => {
    gsap.killTweensOf('*');
    ScrollTrigger.getAll().forEach((t) => t.kill());
};

// ============================================
// DEFAULT EXPORT
// ============================================
export default {
    usePageTransition,
    useScrollReveal,
    useMagneticHover,
    use3DTilt,
    useStaggerAnimation,
    useCounter,
    useElasticPress,
    useModalAnimation,
    useHorizontalScroll,
    useParallax,
    useSpotlightCursor,
    useTextReveal,
    useCardLift,
    useSplitText,
    useMorphingBlob,
    refreshScrollTriggers,
    killAllAnimations
};
