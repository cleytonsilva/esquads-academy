export interface ScrollRevealConfig {
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  duration?: number;
  delay?: number;
  distance?: number;
  threshold?: number;
  once?: boolean;
  easing?: string;
  stagger?: number;
}

export const defaultConfigs = {
  default: {
    direction: 'up' as const,
    duration: 0.8,
    delay: 0,
    distance: 30,
    threshold: 0.15,
    once: true,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  hero: {
    direction: 'up' as const,
    duration: 1,
    delay: 200,
    distance: 50,
    threshold: 0.1,
    once: true,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  card: {
    direction: 'scale' as const,
    duration: 0.6,
    delay: 0,
    distance: 0,
    threshold: 0.2,
    once: true,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  fromLeft: {
    direction: 'left' as const,
    duration: 0.8,
    delay: 0,
    distance: 60,
    threshold: 0.15,
    once: true,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  fromRight: {
    direction: 'right' as const,
    duration: 0.8,
    delay: 0,
    distance: 60,
    threshold: 0.15,
    once: true,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  staggered: {
    direction: 'up' as const,
    duration: 0.6,
    delay: 0,
    distance: 30,
    threshold: 0.15,
    once: true,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    stagger: 100,
  },
} as const;

export interface ScrollRevealState {
  isVisible: boolean;
  hasAnimated: boolean;
}

