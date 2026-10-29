// Adapted from ReactBits — ScrollVelocity (https://reactbits.dev, MIT + Commons Clause).
// Rows drift on their own, accelerate and flip direction with scroll velocity, and skew
// slightly under speed. The frame loop pauses while the band is off-screen.
import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import { cx } from '../../lib/cx';

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

interface RowProps {
  children: ReactNode;
  baseVelocity: number;
  outline: boolean;
  className?: string;
}

function VelocityRow({ children, baseVelocity, outline, className }: RowProps) {
  const root = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLSpanElement>(null);
  const [copyWidth, setCopyWidth] = useState(0);
  const inView = useInView(root, { margin: '20% 0px 20% 0px' });
  const reduced = useReducedMotion();

  const baseX = useMotionValue(0);
  const skewX = useMotionValue(0);
  const { scrollY } = useScroll();
  const smoothVelocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => (copyWidth ? `${wrap(-copyWidth, 0, v)}px` : '0px'));
  const direction = useRef(1);

  useLayoutEffect(() => {
    const el = copy.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCopyWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduced || !inView) return;
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    let moveBy = direction.current * baseVelocity * (Math.min(delta, 64) / 1000);
    moveBy += direction.current * moveBy * factor;
    baseX.set(baseX.get() + moveBy);
    const surge = Math.tanh(Math.abs(smoothVelocity.get()) / 1600);
    skewX.set(skewX.get() + (-Math.sign(moveBy) * 8 * surge - skewX.get()) * (1 - Math.exp(-delta / 110)));
  });

  return (
    <div ref={root} className="relative overflow-hidden">
      <motion.div className={cx('flex whitespace-nowrap', className)} style={{ x, skewX }}>
        {Array.from({ length: 4 }, (_, i) => (
          <span
            key={i}
            ref={i === 0 ? copy : undefined}
            aria-hidden={i > 0 ? true : undefined}
            className={cx('shrink-0 pr-[0.4em]', outline && 'text-outline-strong')}
          >
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

interface ScrollVelocityProps {
  rows: ReactNode[];
  velocity?: number;
  className?: string;
}

export default function ScrollVelocity({ rows, velocity = 60, className }: ScrollVelocityProps) {
  return (
    <div className="w-full [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      {rows.map((row, i) => (
        <VelocityRow key={i} baseVelocity={i % 2 ? -velocity : velocity} outline={i % 2 === 1} className={className}>
          {row}
        </VelocityRow>
      ))}
    </div>
  );
}
