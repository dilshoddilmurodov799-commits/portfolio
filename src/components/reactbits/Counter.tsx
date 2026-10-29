// Adapted from ReactBits — Counter (https://reactbits.dev, MIT + Commons Clause).
// Odometer digits: every place is a column of 0–9 riding one spring, so the ones roll
// through several full turns while the tens settle — once the number scrolls into view.
import { useEffect, useRef } from 'react';
import type { MotionValue } from 'motion/react';
import { motion, useInView, useSpring, useTransform } from 'motion/react';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import { cx } from '../../lib/cx';

function Numeral({ mv, n }: { mv: MotionValue<number>; n: number }) {
  const y = useTransform(mv, (latest) => {
    let offset = (10 + n - (latest % 10)) % 10;
    if (offset > 5) offset -= 10;
    return `${offset}em`;
  });
  return (
    <motion.span className="absolute inset-0 flex items-center justify-center" style={{ y }}>
      {n}
    </motion.span>
  );
}

function Digit({ place, value, instant }: { place: number; value: number; instant: boolean }) {
  const spring = useSpring(0, { stiffness: 55, damping: 18, mass: 1 });
  useEffect(() => {
    const target = Math.floor(value / place);
    if (instant) spring.jump(target);
    else spring.set(target);
  }, [spring, value, place, instant]);
  return (
    <span className="relative -mr-[0.05em] inline-block h-[1em] w-[1ch] overflow-hidden">
      {Array.from({ length: 10 }, (_, n) => (
        <Numeral key={n} mv={spring} n={n} />
      ))}
    </span>
  );
}

export default function Counter({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const reduced = useReducedMotion();
  const digits = String(value).length;
  const places = Array.from({ length: digits }, (_, i) => 10 ** (digits - 1 - i));

  return (
    <span ref={ref} className={cx('inline-flex', className)}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="inline-flex">
        {places.map((place) => (
          <Digit key={place} place={place} value={inView || reduced ? value : 0} instant={reduced} />
        ))}
      </span>
    </span>
  );
}
