// Adapted from ReactBits — TiltedCard (https://reactbits.dev, MIT + Commons Clause).
// The card leans toward the pointer in 3D and lifts slightly while hovered.
import { useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { motion, useSpring } from 'motion/react';
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery';
import { cx } from '../../lib/cx';

interface TiltedCardProps {
  children: ReactNode;
  className?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
}

const spring = { damping: 30, stiffness: 100, mass: 2 };

/** Renders spans so it can sit inside buttons and links. */
export default function TiltedCard({ children, className, rotateAmplitude = 9, scaleOnHover = 1.03 }: TiltedCardProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const rotateX = useSpring(0, spring);
  const rotateY = useSpring(0, spring);
  const scale = useSpring(1, spring);

  if (!fine || reduced) return <span className={cx('block', className)}>{children}</span>;

  const move = (e: PointerEvent<HTMLSpanElement>) => {
    const r = ref.current!.getBoundingClientRect();
    rotateX.set(((e.clientY - r.top) / r.height - 0.5) * -2 * rotateAmplitude);
    rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 2 * rotateAmplitude);
  };
  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  return (
    <span ref={ref} className={cx('block [perspective:900px]', className)} onPointerMove={move} onPointerEnter={() => scale.set(scaleOnHover)} onPointerLeave={reset}>
      <motion.span className="block h-full w-full [transform-style:preserve-3d]" style={{ rotateX, rotateY, scale }}>
        {children}
      </motion.span>
    </span>
  );
}
