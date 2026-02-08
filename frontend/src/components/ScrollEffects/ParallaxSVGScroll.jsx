/**
 * PARALLAX SVG SCROLL - Based on isladjan CodePen
 * Premium day-to-night scroll transition with mountains, sun, clouds, bats, stars
 * Converted to React JSX with GSAP ScrollTrigger
 */

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ParallaxSVGScroll = ({ children, height = 6000 }) => {
    const containerRef = useRef(null);
    const svgRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const speed = 100;

            // Initial states
            gsap.set("#h2-1", { opacity: 0 });
            gsap.set("#bg_grad", { attr: { cy: "-50" } });
            gsap.set(["#dinoL", "#dinoR"], { y: 80 });
            gsap.set("#dinoL", { x: -10 });

            // SCENE 1 - Hills parallax
            const scene1 = gsap.timeline();
            ScrollTrigger.create({
                animation: scene1,
                trigger: containerRef.current,
                start: "top top",
                end: "45% 100%",
                scrub: 3
            });

            scene1.to("#h1-1", { y: 3 * speed, x: 1 * speed, scale: 0.9, ease: "power1.in" }, 0);
            scene1.to("#h1-2", { y: 2.6 * speed, x: -0.6 * speed, ease: "power1.in" }, 0);
            scene1.to("#h1-3", { y: 1.7 * speed, x: 1.2 * speed }, 0.03);
            scene1.to("#h1-4", { y: 3 * speed, x: 1 * speed }, 0.03);
            scene1.to("#h1-5", { y: 2 * speed, x: 1 * speed }, 0.03);
            scene1.to("#h1-6", { y: 2.3 * speed, x: -2.5 * speed }, 0);
            scene1.to("#h1-7", { y: 5 * speed, x: 1.6 * speed }, 0);
            scene1.to("#h1-8", { y: 3.5 * speed, x: 0.2 * speed }, 0);
            scene1.to("#h1-9", { y: 3.5 * speed, x: -0.2 * speed }, 0);
            scene1.to("#cloudsBig-L", { y: 4.5 * speed, x: -0.2 * speed }, 0);
            scene1.to("#cloudsBig-R", { y: 4.5 * speed, x: -0.2 * speed }, 0);
            scene1.to("#cloudStart-L", { x: -300 }, 0);
            scene1.to("#cloudStart-R", { x: 300 }, 0);
            scene1.to("#info", { y: 8 * speed }, 0);

            // Bird animation
            gsap.fromTo("#bird",
                { opacity: 1 },
                {
                    y: -250,
                    x: 800,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "15% top",
                        end: "60% 100%",
                        scrub: 4,
                        onEnter: () => gsap.to("#bird", { scaleX: 1, rotation: 0 }),
                        onLeave: () => gsap.to("#bird", { scaleX: -1, rotation: -15 })
                    }
                }
            );

            // Clouds movement
            const clouds = gsap.timeline();
            ScrollTrigger.create({
                animation: clouds,
                trigger: containerRef.current,
                start: "top top",
                end: "70% 100%",
                scrub: 1
            });
            clouds.to("#cloud1", { x: 500 }, 0);
            clouds.to("#cloud2", { x: 1000 }, 0);
            clouds.to("#cloud3", { x: -1000 }, 0);
            clouds.to("#cloud4", { x: -700, y: 25 }, 0);

            // Sun motion & gradient changes
            const sun = gsap.timeline();
            ScrollTrigger.create({
                animation: sun,
                trigger: containerRef.current,
                start: "1% top",
                end: "2150 100%",
                scrub: 2
            });
            sun.fromTo("#bg_grad", { attr: { cy: "-50" } }, { attr: { cy: "330" } }, 0);
            sun.to("#bg_grad stop:nth-child(2)", { attr: { offset: "0.15" } }, 0);
            sun.to("#bg_grad stop:nth-child(3)", { attr: { offset: "0.18" } }, 0);
            sun.to("#bg_grad stop:nth-child(4)", { attr: { offset: "0.25" } }, 0);
            sun.to("#bg_grad stop:nth-child(5)", { attr: { offset: "0.46" } }, 0);
            sun.to("#bg_grad stop:nth-child(6)", { attr: { "stop-color": "#FF9171" } }, 0);

            // SCENE 2 - Night hills
            const scene2 = gsap.timeline();
            ScrollTrigger.create({
                animation: scene2,
                trigger: containerRef.current,
                start: "15% top",
                end: "40% 100%",
                scrub: 3
            });
            scene2.fromTo("#h2-1", { y: 500, opacity: 0 }, { y: 0, opacity: 1 }, 0);
            scene2.fromTo("#h2-2", { y: 500 }, { y: 0 }, 0.1);
            scene2.fromTo("#h2-3", { y: 700 }, { y: 0 }, 0.1);
            scene2.fromTo("#h2-4", { y: 700 }, { y: 0 }, 0.2);
            scene2.fromTo("#h2-5", { y: 800 }, { y: 0 }, 0.3);
            scene2.fromTo("#h2-6", { y: 900 }, { y: 0 }, 0.3);

            // Bats animation
            gsap.set("#bats", { transformOrigin: "50% 50%" });
            gsap.fromTo("#bats",
                { opacity: 1, y: 400, scale: 0 },
                {
                    y: 20,
                    scale: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "40% top",
                        end: "70% 100%",
                        scrub: 3,
                        onEnter: () => {
                            gsap.utils.toArray("#bats path").forEach((item, i) => {
                                gsap.to(item, {
                                    scaleX: 0.5,
                                    yoyo: true,
                                    repeat: 9,
                                    transformOrigin: "50% 50%",
                                    duration: 0.15,
                                    delay: 0.7 + i / 10
                                });
                            });
                            gsap.set("#bats", { opacity: 1 });
                        }
                    }
                }
            );

            // Sun color intensification
            const sun2 = gsap.timeline();
            ScrollTrigger.create({
                animation: sun2,
                trigger: containerRef.current,
                start: "2000 top",
                end: "5000 100%",
                scrub: 2
            });
            sun2.to("#sun", { attr: { offset: "1.4" } }, 0);
            sun2.to("#bg_grad stop:nth-child(2)", { attr: { offset: "0.7" } }, 0);
            sun2.to("#sun", { attr: { "stop-color": "#ffff00" } }, 0);
            sun2.to("#lg4 stop:nth-child(1)", { attr: { "stop-color": "#623951" } }, 0);
            sun2.to("#lg4 stop:nth-child(2)", { attr: { "stop-color": "#261F36" } }, 0);
            sun2.to("#bg_grad stop:nth-child(6)", { attr: { "stop-color": "#45224A" } }, 0);

            // SCENE 3 - Stars night
            gsap.set("#scene3", { y: 500, visibility: "visible" });
            const sceneTransition = gsap.timeline();
            ScrollTrigger.create({
                animation: sceneTransition,
                trigger: containerRef.current,
                start: "60% top",
                end: "bottom 100%",
                scrub: 3
            });
            sceneTransition.to("#h2-1", { y: -600, scale: 1.5, transformOrigin: "50% 50%" }, 0);
            sceneTransition.to("#bg_grad", { attr: { cy: "-80" } }, 0);
            sceneTransition.to("#bg2", { y: 0 }, 0);

            const scene3 = gsap.timeline();
            ScrollTrigger.create({
                animation: scene3,
                trigger: containerRef.current,
                start: "70% 50%",
                end: "bottom 100%",
                scrub: 3
            });
            scene3.fromTo("#h3-1", { y: 300 }, { y: -550 }, 0);
            scene3.fromTo("#h3-2", { y: 800 }, { y: -550 }, 0.03);
            scene3.fromTo("#h3-3", { y: 600 }, { y: -550 }, 0.06);
            scene3.fromTo("#h3-4", { y: 800 }, { y: -550 }, 0.09);
            scene3.fromTo("#h3-5", { y: 1000 }, { y: -550 }, 0.12);
            scene3.fromTo("#stars", { opacity: 0 }, { opacity: 0.5, y: -500 }, 0);
            scene3.fromTo("#arrow2", { opacity: 0 }, { opacity: 0.7, y: -710 }, 0.25);
            scene3.fromTo("#text2", { opacity: 0 }, { opacity: 0.7, y: -710 }, 0.3);
            scene3.to("#bg2-grad", { attr: { cy: 600 } }, 0);
            scene3.to("#bg2-grad", { attr: { r: 500 } }, 0);

            // Falling star
            gsap.set("#fstar", { y: -400 });
            const fstarTL = gsap.timeline();
            ScrollTrigger.create({
                animation: fstarTL,
                trigger: containerRef.current,
                start: "4200 top",
                end: "6000 bottom",
                scrub: 2,
                onEnter: () => gsap.set("#fstar", { opacity: 1 }),
                onLeave: () => gsap.set("#fstar", { opacity: 0 })
            });
            fstarTL.to("#fstar", { x: -700, y: -250, ease: "power2.out" }, 0);

            // Star twinkle animations
            const starIndices = [1, 3, 5, 8, 11, 15, 17, 18, 25, 28, 30, 35, 40, 45, 48];
            const delays = [0.8, 1.8, 1, 1.2, 0.5, 2, 1.1, 1.4, 1.1, 0.9, 1.3, 2, 0.8, 1.8, 1];
            starIndices.forEach((idx, i) => {
                gsap.fromTo(`#stars path:nth-of-type(${idx})`,
                    { opacity: 0.3 },
                    { opacity: 1, duration: 0.3, repeat: -1, repeatDelay: delays[i] }
                );
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <SVGScene ref={svgRef} />
            <div className="scroll-element" style={{ height: `${height}px` }}>
                {children}
            </div>
        </div>
    );
};

// SVG Scene Component with all gradients and elements
const SVGScene = React.forwardRef((props, ref) => (
    <svg
        ref={ref}
        className="parallax fixed inset-0 w-full h-screen z-[3]"
        viewBox="0 0 750 500"
        preserveAspectRatio="xMidYMax slice"
    >
        <defs>
            {/* Scene 1 Gradients */}
            <linearGradient id="grad1" x1="-154.32" y1="263.27" x2="-154.32" y2="374.3" gradientTransform="matrix(-1, 0, 0, 1.36, 231.36, -100.14)" gradientUnits="userSpaceOnUse">
                <stop offset="0.07" stopColor="#9c536b" />
                <stop offset="0.98" stopColor="#d98981" />
            </linearGradient>
            <radialGradient id="bg_grad" cx="375" cy="-30" r="318.69" gradientUnits="userSpaceOnUse">
                <stop offset="0.1" stopColor="#F5C54E" id="sun" />
                <stop offset="0.1" stopColor="#FFDBA6" />
                <stop offset="0.0" stopColor="#F7BB93" />
                <stop offset="0.0" stopColor="#F2995E" />
                <stop offset="0.0" stopColor="#f07560" />
                <stop offset="0.8" stopColor="#FFAB93" />
            </radialGradient>

            {/* Scene 2 Gradients */}
            <linearGradient id="lg4" x1="641.98" y1="274.9" x2="638.02" y2="334.36" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#2c2c50" />
                <stop offset="1" stopColor="#434375" />
            </linearGradient>
            <linearGradient id="lg8" x1="375.59" y1="381.01" x2="373.3" y2="507.08" xlinkHref="#lg4" />

            {/* Scene 3 Gradients */}
            <radialGradient id="bg2-grad" cx="365.22" cy="500" r="631.74" gradientTransform="translate(750 552.6) rotate(180) scale(1 1.11)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="hsla(349, 94%, 75%, 1)" />
                <stop offset="0.12" stopColor="hsla(342, 49%, 62%, 1)" />
                <stop offset="0.33" stopColor="hsla(281, 33%, 48%, 1)" />
                <stop offset="0.55" stopColor="hsla(261, 37%, 32%, 1)" />
                <stop offset="0.78" stopColor="hsla(240, 33%, 17%, 1)" />
            </radialGradient>

            <radialGradient id="fstar-grad" cx="1362.39" cy="-53.7" r="39.39" gradientTransform="matrix(0.89, -0.45, -0.45, -0.89, -473.7, 640.57)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#fff" />
                <stop offset="0.72" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
        </defs>

        {/* Background */}
        <rect id="bg" width="750" height="500" opacity="0.8" fill="url(#bg_grad)" />

        {/* Clouds */}
        <g id="clouds" fill="#fefefe">
            <path id="cloud4" transform="translate(600 0)" d="M402.34,341.68c9.9-10.24,23.76-7.43,36.05-5.48C448,332,458.88,329,468.9,334c-.95-7.91,8.65-14.92,15.9-11.61" />
            <path id="cloud3" transform="translate(600 0)" d="M382.94,363.16c-7-10.5-18.72-9.06-28.19-4.53" />
            <path id="cloud2" transform="translate(-600 0)" d="M506.86,233.56c9.62-3.21,23.27-4,33.88-2.17" />
            <path id="cloud1" transform="translate(-600 0)" d="M402.18,271.3c-7.57-7.46-18.46-7.52-28.05-5.3" />
        </g>

        {/* Scene 2 - Night */}
        <g id="scene2">
            <g id="bats" style={{ opacity: 0 }}>
                <path d="M486.65,187a9.22,9.22,0,0,1-4.29,6.38" fill="#112129" />
                <path d="M390.93,226.87c2.22,2.08,2,4.89.48,7.24" fill="#112129" />
            </g>
            <g id="hills2">
                <path id="h2-6" d="M524.28,418.82c6.36,0,80.19-14.81,103.12-36.53" fill="url(#lg4)" />
                <path id="h2-2" d="M749.55,500V398.27l-38.48-6.67" fill="url(#lg8)" />
                <path id="h2-1" style={{ opacity: 0 }} d="M746.51,371.43c-.18-1,1.74,1.28,2.2.27" fill="#1d1d3a" />
            </g>
        </g>

        {/* Scene 3 - Stars */}
        <g id="scene3" style={{ visibility: "hidden" }}>
            <rect id="bg2" y="-59.8" width="750" height="612.4" transform="translate(750 492.8) rotate(180)" fill="url(#bg2-grad)" />
            <g id="fstar">
                <circle cx="768.6" cy="78.72" r="39.39" transform="translate(64.22 396.2) rotate(-30.11)" fill="url(#fstar-grad)" style={{ mixBlendMode: "overlay" }} />
            </g>
            <g id="stars" fill="#fff" style={{ opacity: 0 }}>
                {[...Array(50)].map((_, i) => (
                    <circle key={i} cx={Math.random() * 750} cy={Math.random() * 300} r={Math.random() * 1.5 + 0.5} />
                ))}
            </g>
            <g id="hills3" transform="translate(0, -110)">
                <polygon id="arrow2" points="395.5 482.2 393.4 484.3 375.2 466.1 357 484.3 354.9 482.2 375.2 461.9 395.5 482.2" style={{ fill: "#fff", stroke: "#231f20", strokeWidth: 0.5 }} />
                <path id="text2" d="m271.8,526.2c8.4,7,22.4-4.5,8.1-9.8" style={{ fill: "#fff" }} />
                <polygon id="h3-5" points="756.3 330.5 750.6 327 742.4 331.1" fill="#fd75a8" style={{ mixBlendMode: "multiply" }} />
            </g>
        </g>

        {/* Scene 1 - Day hills */}
        <g id="scene1">
            <g id="hills1">
                <path id="cloudStart-L" style={{ fill: "#fff", opacity: 0 }} d="m71.1,92.9c-.1,0-.3.2-.4.3" />
                <path id="cloudStart-R" style={{ fill: "#fff", opacity: 0 }} d="m710.3,103c0,1,1.2,1.6,2.2,1.2" />
                <path id="cloudsBig-L" d="m286.9,293.2c-94.4,24-191.8,46.4-288.9,41.9v-162.1" style={{ fill: "#fff", opacity: 0.5 }} />
                <path id="cloudsBig-R" d="m797.3,100.5l26.8,179.4c-163.5,24.8-334,76.2-497.6,41.2" style={{ fill: "#fff", opacity: 0.5 }} />
                <path id="h1-9" d="M696.36,409H75V335.47c10.19-.52,20.5-.36,30.05-3.65" fill="url(#grad1)" />
                <g id="info">
                    <polygon id="arrow" points="353.93 368.91 356.06 366.79 374.26 385 392.47 366.79 394.59 368.91 374.26 389.24 353.93 368.91" fill="#fff" stroke="#231f20" strokeWidth="0.5" />
                </g>
                <path id="bird" style={{ opacity: 0 }} d="M110.61,428.6c-2.5,2.06-13.64-.79-17.86.84" fill="#16122b" />
            </g>
        </g>
    </svg>
));

SVGScene.displayName = 'SVGScene';

export default ParallaxSVGScroll;
