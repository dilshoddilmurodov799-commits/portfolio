import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { WORK } from '../../content/data';
import { gsap } from '../../lib/gsap';
import { EASE_QUART } from '../../lib/motion';
import ProjectArt from './ProjectArt';

const open = { duration: 0.4, ease: EASE_QUART };
const shut = { duration: 0.4, ease: [0.32, 0, 0.67, 0] as const };

interface WorkPreviewProps {
  /** Whether a project is under the pointer. */
  active: boolean;
  /** The project to show; kept after the pointer leaves so the preview closes on it. */
  index: number;
  /** Grid view only needs the cursor — the artwork is already on screen. */
  modal: boolean;
  label: string;
}

/**
 * A window that trails the pointer over the project list, slides between projects and leans
 * into horizontal movement, with a round "View" cursor riding slightly ahead of it.
 */
export default function WorkPreview({ active, index, modal, label }: WorkPreviewProps) {
  const frame = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [frame.current, cursor.current];
    const follow = els.map((el, i) => {
      const duration = i === 0 ? 0.8 : 0.5;
      return { x: gsap.quickTo(el, 'x', { duration, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration, ease: 'power3' }) };
    });
    const lean = gsap.quickTo(frame.current, 'rotate', { duration: 0.6, ease: 'power3' });
    let primed = false;
    let lastX = 0;
    let settle = 0;
    const move = (e: PointerEvent) => {
      if (!primed) {
        gsap.set(els, { x: e.clientX, y: e.clientY });
        primed = true;
      }
      follow.forEach((f) => {
        f.x(e.clientX);
        f.y(e.clientY);
      });
      lean(gsap.utils.clamp(-9, 9, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
      window.clearTimeout(settle);
      settle = window.setTimeout(() => lean(0), 90);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.clearTimeout(settle);
    };
  }, []);

  return (
    <>
      <div ref={frame} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[90]">
        <motion.div
          className="h-[min(25vw,350px)] w-[min(29vw,400px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1rem] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]"
          initial={{ scale: 0 }}
          animate={{ scale: active && modal ? 1 : 0 }}
          transition={active && modal ? open : shut}
        >
          <div className="h-full w-full transition-transform duration-500 ease-[var(--ease-quart)]" style={{ transform: `translateY(${index * -100}%)` }}>
            {WORK.map((item) => (
              <div key={item.id} className="relative h-full w-full" style={{ background: item.color }}>
                <ProjectArt kind={item.visual} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <div ref={cursor} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[90]">
        <motion.div
          className="grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-sm font-medium text-ink"
          initial={{ scale: 0 }}
          animate={{ scale: active ? 1 : 0 }}
          transition={active ? open : shut}
        >
          {label}
        </motion.div>
      </div>
    </>
  );
}
