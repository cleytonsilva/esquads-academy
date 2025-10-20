import { useEffect, useRef, useState } from 'react';
import { ScrollRevealConfig, ScrollRevealState, defaultConfigs } from '../types/scroll-reveal';

export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  config: Partial<ScrollRevealConfig> = {},
  configPreset?: keyof typeof defaultConfigs
) {
  const elementRef = useRef<T>(null);
  const [state, setState] = useState<ScrollRevealState>({
    isVisible: false,
    hasAnimated: false,
  });

  const finalConfig = {
    ...(configPreset ? defaultConfigs[configPreset] : defaultConfigs.default),
    ...config,
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observerOptions = {
      threshold: finalConfig.threshold,
      rootMargin: '0px 0px -50px 0px',
    } as IntersectionObserverInit;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setState((prev) => {
            if (finalConfig.once && prev.hasAnimated) {
              return prev;
            }
            return {
              isVisible: true,
              hasAnimated: true,
            };
          });

          if (finalConfig.once) {
            observer.unobserve(element);
          }
        } else if (!finalConfig.once) {
          setState((prev) => ({
            ...prev,
            isVisible: false,
          }));
        }
      });
    }, observerOptions);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [finalConfig.threshold, finalConfig.once]);

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all';
    // Use standard Tailwind duration classes
    const durationClass = finalConfig.duration! <= 0.3 ? 'duration-300' : 
                         finalConfig.duration! <= 0.5 ? 'duration-500' : 
                         finalConfig.duration! <= 0.7 ? 'duration-700' : 'duration-1000';
    
    // Use standard Tailwind delay classes
    const delayClass = finalConfig.delay && finalConfig.delay > 0 ? 
                      finalConfig.delay <= 75 ? 'delay-75' :
                      finalConfig.delay <= 100 ? 'delay-100' :
                      finalConfig.delay <= 150 ? 'delay-150' :
                      finalConfig.delay <= 200 ? 'delay-200' :
                      finalConfig.delay <= 300 ? 'delay-300' :
                      finalConfig.delay <= 500 ? 'delay-500' :
                      finalConfig.delay <= 700 ? 'delay-700' : 'delay-1000' : '';
    
    const easingClass = 'ease-out';

    // Use standard Tailwind translate classes
    const translateDistance = finalConfig.distance! <= 4 ? '1' :
                             finalConfig.distance! <= 8 ? '2' :
                             finalConfig.distance! <= 12 ? '3' :
                             finalConfig.distance! <= 16 ? '4' :
                             finalConfig.distance! <= 24 ? '6' :
                             finalConfig.distance! <= 32 ? '8' :
                             finalConfig.distance! <= 48 ? '12' : '16';

    if (!state.isVisible) {
      switch (finalConfig.direction) {
        case 'up':
          return `${baseClasses} ${durationClass} ${delayClass} ${easingClass} opacity-0 translate-y-${translateDistance}`;
        case 'down':
          return `${baseClasses} ${durationClass} ${delayClass} ${easingClass} opacity-0 -translate-y-${translateDistance}`;
        case 'left':
          return `${baseClasses} ${durationClass} ${delayClass} ${easingClass} opacity-0 translate-x-${translateDistance}`;
        case 'right':
          return `${baseClasses} ${durationClass} ${delayClass} ${easingClass} opacity-0 -translate-x-${translateDistance}`;
        case 'scale':
          return `${baseClasses} ${durationClass} ${delayClass} ${easingClass} opacity-0 scale-95`;
        default:
          return `${baseClasses} ${durationClass} ${delayClass} ${easingClass} opacity-0 translate-y-${translateDistance}`;
      }
    } else {
      return `${baseClasses} ${durationClass} ${delayClass} ${easingClass} opacity-100 translate-x-0 translate-y-0 scale-100`;
    }
  };

  const getAnimationStyles = () => {
    if (finalConfig.easing && finalConfig.easing !== 'ease-out') {
      return {
        transitionTimingFunction: finalConfig.easing,
      } as React.CSSProperties;
    }
    return {} as React.CSSProperties;
  };

  return {
    ref: elementRef,
    isVisible: state.isVisible,
    hasAnimated: state.hasAnimated,
    animationClasses: getAnimationClasses(),
    animationStyles: getAnimationStyles(),
    config: finalConfig,
  };
}

export function useScrollRevealStagger<T extends HTMLElement = HTMLElement>(
  itemCount: number,
  config: Partial<ScrollRevealConfig> = {},
  configPreset?: keyof typeof defaultConfigs
) {
  const containerRef = useRef<T>(null);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  const finalConfig = {
    ...(configPreset ? defaultConfigs[configPreset] : defaultConfigs.staggered),
    ...config,
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observerOptions = {
      threshold: finalConfig.threshold,
      rootMargin: '0px 0px -50px 0px',
    } as IntersectionObserverInit;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleItems((prev) => new Set([...prev, i]));
            }, i * (finalConfig.stagger || 100));
          }

          if (finalConfig.once) {
            observer.unobserve(container);
          }
        } else if (!finalConfig.once) {
          setVisibleItems(new Set());
        }
      });
    }, observerOptions);

    observer.observe(container);

    return () => {
      observer.unobserve(container);
      observer.disconnect();
    };
  }, [itemCount, finalConfig.threshold, finalConfig.once, finalConfig.stagger]);

  const getItemClasses = (index: number) => {
    const baseClasses = 'transition-all';
    const durationClass = `duration-[${Math.round(finalConfig.duration! * 1000)}ms]`;
    const easingClass = 'ease-out';
    const isVisible = visibleItems.has(index);

    if (!isVisible) {
      switch (finalConfig.direction) {
        case 'up':
          return `${baseClasses} ${durationClass} ${easingClass} opacity-0 translate-y-[${finalConfig.distance}px]`;
        case 'scale':
          return `${baseClasses} ${durationClass} ${easingClass} opacity-0 scale-95`;
        default:
          return `${baseClasses} ${durationClass} ${easingClass} opacity-0 translate-y-[${finalConfig.distance}px]`;
      }
    } else {
      return `${baseClasses} ${durationClass} ${easingClass} opacity-100 translate-x-0 translate-y-0 scale-100`;
    }
  };

  return {
    containerRef,
    getItemClasses,
    visibleItems,
    config: finalConfig,
  };
}

