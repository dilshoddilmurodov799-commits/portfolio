// Adapted from ReactBits — ProfileCard's holographic foil and GlareHover's sweep
// (https://reactbits.dev, MIT + Commons Clause). A rainbow foil and a glare spot follow the
// pointer, the edge lights up nearest it, and a streak of light crosses the card when it
// first scrolls into view and again on every hover. Styling lives in `.holo` (globals.css).
import { useEffect, useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { motion, useInView, useSpring } from 'motion/react';
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery';
import { cx } from '../../lib/cx';

interface HoloCardProps {
  children: ReactNode;
  className?: string;
  /** Maximum lean, in degrees, toward the pointer. */
  tilt?: number;
}

const spring = { damping: 30, stiffness: 140, mass: 1 };

export default function HoloCard({ children, className, tilt = 5 }: HoloCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const sweep = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const rotateX = useSpring(0, spring);
  const rotateY = useSpring(0, spring);

  const shine = () => {
    if (reduced) return;
    sweep.current?.animate([{ backgroundPosition: '150% 150%' }, { backgroundPosition: '-50% -50%' }], {
      duration: 1100,
      easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
    });
  };

  useEffect(() => {
    if (inView) shine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--px', `${px * 100}%`);
    el.style.setProperty('--py', `${py * 100}%`);
    if (fine && !reduced) {
      rotateX.set((0.5 - py) * tilt);
      rotateY.set((px - 0.5) * tilt * 1.4);
    }
  };
  const leave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cx('holo relative isolate overflow-hidden', className)}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      onPointerMove={move}
      onPointerEnter={shine}
      onPointerLeave={leave}
    >
      {children}
      <span aria-hidden="true" className="holo-foil" />
      <span aria-hidden="true" className="holo-glare" />
      <span ref={sweep} aria-hidden="true" className="holo-sweep" />
      <span aria-hidden="true" className="holo-edge" />
    </motion.div>
  );
}
