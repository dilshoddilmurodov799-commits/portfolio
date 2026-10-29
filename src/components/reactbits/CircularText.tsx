// Adapted from ReactBits — CircularText (https://reactbits.dev, MIT + Commons Clause).
// Letters set around a circle that turns continuously and speeds up while hovered.
import { useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue } from 'motion/react';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import { cx } from '../../lib/cx';

interface CircularTextProps {
  text: string;
  /** Seconds per full turn at rest. */
  spinDuration?: number;
  /** Speed multiplier while the pointer is over the ring. */
  hoverSpeed?: number;
  className?: string;
}

export default function CircularText({ text, spinDuration = 18, hoverSpeed = 4, className }: CircularTextProps) {
  const reduced = useReducedMotion();
  const rotate = useMotionValue(0);
  const speed = useRef(1);
  const target = useRef(1);
  const letters = Array.from(text);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    speed.current += (target.current - speed.current) * 0.06;
    rotate.set((rotate.get() + (360 / spinDuration) * (delta / 1000) * speed.current) % 360);
  });

  return (
    <motion.span
      aria-hidden="true"
      className={cx('block rounded-full', className)}
      style={{ rotate }}
      onPointerEnter={() => (target.current = hoverSpeed)}
      onPointerLeave={() => (target.current = 1)}
    >
      {letters.map((letter, i) => (
        <span key={i} className="absolute inset-0 text-center" style={{ transform: `rotate(${(360 / letters.length) * i}deg)` }}>
          {letter}
        </span>
      ))}
    </motion.span>
  );
}
