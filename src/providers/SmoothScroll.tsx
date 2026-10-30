import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useMediaQuery';

type Target = string | number | HTMLElement;

interface SmoothScrollValue {
  scrollTo: (target: Target, options?: { offset?: number; immediate?: boolean }) => void;
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollValue | null>(null);

const easeInOutExpo = (t: number) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  // Stacked dialogs (and the intro) each hold the lock; scrolling resumes when the last lets go.
  const locks = useRef(0);

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  const scrollTo = useCallback<SmoothScrollValue['scrollTo']>((target, options = {}) => {
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    const lenis = lenisRef.current;
    if (lenis && el != null) {
      // Lenis re-measures the page a moment after its height changes; measure now so new content is reachable.
      lenis.resize();
      lenis.scrollTo(el, { offset: options.offset ?? 0, immediate: options.immediate, duration: 1.6, easing: easeInOutExpo, force: true });
      return;
    }
    if (typeof el === 'number') window.scrollTo({ top: el });
    else el?.scrollIntoView();
  }, []);

  const value = useMemo<SmoothScrollValue>(
    () => ({
      scrollTo,
      stop: () => {
        locks.current += 1;
        lenisRef.current?.stop();
        document.documentElement.style.overflow = 'hidden';
      },
      start: () => {
        locks.current = Math.max(0, locks.current - 1);
        if (locks.current) return;
        lenisRef.current?.start();
        document.documentElement.style.overflow = '';
      },
    }),
    [scrollTo],
  );

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSmoothScroll() {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) throw new Error('useSmoothScroll must be used within SmoothScrollProvider');
  return ctx;
}
