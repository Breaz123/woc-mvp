// Animation utilities and constants for consistent, smooth animations
// Using optimized easing curves for buttery smooth motion

// Smooth easing curves (cubic bezier)
const easeOut = [0.16, 1, 0.3, 1]; // Custom ease-out for smooth deceleration
const easeInOut = [0.4, 0, 0.2, 1]; // Material Design ease
const easeSpring = [0.34, 1.56, 0.64, 1]; // Spring-like for bouncy feel

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

export const slideInRight = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Transition presets with optimized timings and easing
export const transitionFast = {
  duration: 0.25,
  ease: easeOut,
};

export const transitionNormal = {
  duration: 0.4,
  ease: easeOut,
};

export const transitionSlow = {
  duration: 0.6,
  ease: easeOut,
};

export const transitionSpring = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

// Stagger container for lists with smooth delays
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

// Hover animations with smooth spring physics
export const hoverScale = {
  scale: 1.02,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 25,
  },
};

export const hoverLift = {
  y: -4,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 25,
  },
};

// Card animations with smooth lift and shadow
export const cardHover = {
  y: -6,
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 25,
  },
};

