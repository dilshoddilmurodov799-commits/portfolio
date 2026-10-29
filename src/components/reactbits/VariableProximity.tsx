// Adapted from ReactBits — VariableProximity (https://reactbits.dev, MIT + Commons Clause).
// Letters near the pointer swell along the variable font's weight axis.
import { Fragment, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useAnimationFrame } from 'motion/react';
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery';

interface VariableProximityProps {
  text: string;
  /** Area that wakes the effect; letters reset once the pointer is a radius away from it. */
  containerRef: RefObject<HTMLElement | null>;
  from?: number;
  to?: number;
  radius?: number;
  className?: string;
}

export default function VariableProximity({ text, containerRef, from = 400, to = 850, radius = 150, className }: VariableProximityProps) {
  const letters = useRef<(HTMLSpanElement | null)[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const resting = useRef(true);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const active = fine && !reduced;

  useEffect(() => {
    if (!active) return;
    const move = (e: PointerEvent) => void (pointer.current = { x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [active]);

  useAnimationFrame(() => {
    const p = pointer.current;
    const box = containerRef.current?.getBoundingClientRect();
    if (!active || !p || !box) return;
    const near = p.x > box.left - radius && p.x < box.right + radius && p.y > box.top - radius && p.y < box.bottom + radius;
    if (!near) {
      if (!resting.current) letters.current.forEach((el) => el && (el.style.fontVariationSettings = `'wght' ${from}`));
      resting.current = true;
      return;
    }
    resting.current = false;
    letters.current.forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const n = Math.max(0, 1 - Math.hypot(p.x - (r.left + r.width / 2), p.y - (r.top + r.height / 2)) / radius);
      el.style.fontVariationSettings = `'wght' ${from + (to - from) * n * n * (3 - 2 * n)}`;
    });
  });

  const words = text.split(' ');
  // Index of each word's first letter in the flat list of letter refs.
  const starts = words.map((_, w) => words.slice(0, w).join('').length);
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <Fragment key={w}>
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((char, c) => {
                const i = starts[w] + c;
                return (
                  <span key={i} ref={(el) => void (letters.current[i] = el)} className="inline-block" style={{ fontVariationSettings: `'wght' ${from}` }}>
                    {char}
                  </span>
                );
              })}
            </span>
            {w < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </span>
  );
}
