/**
 * Animation Presets 2026
 * Reanimated 3 Animation System
 */

import { withSpring, withTiming, withDelay, withSequence, Easing } from 'react-native-reanimated';
import type { AnimatedProps } from 'react-native-reanimated';

// Spring Configs
export const SpringConfig = {
  gentle: { damping: 15, stiffness: 120, mass: 1 },
  bouncy: { damping: 10, stiffness: 200, mass: 1 },
  snappy: { damping: 20, stiffness: 300, mass: 1 },
  slow: { damping: 20, stiffness: 80, mass: 1.5 },
};

// Timing Configs
export const TimingConfig = {
  fast: { duration: 200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
  normal: { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
  slow: { duration: 500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
};

// Animation Presets
export const Animations = {
  // Fade In
  fadeIn: (delay = 0) =>
    delay > 0
      ? withDelay(delay, withTiming(1, TimingConfig.normal))
      : withTiming(1, TimingConfig.normal),
  
  fadeInFrom: (delay = 0) =>
    delay > 0
      ? withDelay(delay, withTiming(1, TimingConfig.normal))
      : withTiming(1, TimingConfig.normal),

  // Fade Out
  fadeOut: () => withTiming(0, TimingConfig.fast),

  // Scale In
  scaleIn: (delay = 0) =>
    withSpring(1, SpringConfig.bouncy),

  // Scale Out
  scaleOut: () => withTiming(0.95, TimingConfig.fast),

  // Slide Up
  slideUp: (delay = 0) =>
    withSpring(0, SpringConfig.gentle),

  // Slide Down
  slideDown: (delay = 0) =>
    withSpring(0, SpringConfig.gentle),

  // Slide In from Right
  slideInRight: (delay = 0) =>
    withSpring(0, SpringConfig.snappy),

  // Card Press
  cardPress: () => withSpring(0.97, SpringConfig.snappy),
  cardRelease: () => withSpring(1, SpringConfig.bouncy),

  // Button Bounce
  buttonPress: () => withSpring(0.95, SpringConfig.snappy),
  buttonRelease: () => withSpring(1, SpringConfig.bouncy),

  // Refresh Bounce
  refreshBounce: () =>
    withSequence(
      withSpring(-8, SpringConfig.gentle),
      withSpring(0, SpringConfig.bouncy)
    ),
};

// Stagger Helper
export const stagger = (index: number, baseDelay = 50) => index * baseDelay;

// Common animation values
export const InitialValues = {
  opacity: 0,
  translateY: 20,
  scale: 0.95,
  translateX: 0,
};

export default Animations;
