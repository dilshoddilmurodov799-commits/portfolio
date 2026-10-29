import { useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { motion, useSpring } from 'motion/react';
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery';
import { cx } from '../../lib/cx';

interface MagneticProps {
  children: ReactNode;
  /** Fraction of the pointer offset the element follows. */
  strength?: number;
  className?: string;
}

const spring = { stiffness: 170, damping: 15, mass: 0.6 };

/** Pulls its content toward the pointer while hovered; inert on touch and reduced motion. */
export default function Magnetic({ children, strength = 0.32, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  if (!fine || reduced) return <div className={cx('inline-block', className)}>{children}</div>;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = ref.current!.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset} className={cx('inline-block', className)}>
      {children}
    </motion.div>
  );
}
