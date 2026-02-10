/**
 * @module components/ScrollEffects
 * @description Barrel export for premium scroll-driven effect components.
 * Re-exports ParallaxSVGScroll, HyperScroll3D, HeroRevealScroll, and the
 * full PremiumScrollEffects library.
 */

// Parallax SVG Scroll (isladjan style - day to night transition)
export { default as ParallaxSVGScroll } from './ParallaxSVGScroll';

// Hyper Scroll 3D (brutal mode - flying cards)
export { default as HyperScroll3D, HyperCard } from './HyperScroll3D';

// Hero Reveal Scroll (Alice style - parallax falling)
export { default as HeroRevealScroll, SmoothScrollWrapper } from './HeroRevealScroll';

// Re-export from original file if exists
export * from './PremiumScrollEffects';
