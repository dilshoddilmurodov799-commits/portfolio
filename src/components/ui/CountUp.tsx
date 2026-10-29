import { useEffect, useLayoutEffect, useRef } from 'react';
import { animate, useInView } from 'motion/react';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import { EASE_EXPO } from '../../lib/motion';

/** Counts from zero once visible; writes to the DOM directly instead of re-rendering. */
export default function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (ref.current && !inView) ref.current.textContent = reduced ? String(value) : '0';
  }, [inView, reduced, value]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduced) {
      el.textContent = String(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 2,
      ease: EASE_EXPO,
      onUpdate: (v) => (el.textContent = String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, value, reduced]);

  return (
    <>
      <span className="sr-only">{value}</span>
      <span ref={ref} aria-hidden="true" className={className} />
    </>
  );
}
