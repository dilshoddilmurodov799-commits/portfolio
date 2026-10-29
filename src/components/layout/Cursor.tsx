import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery';
import { EASE_EXPO } from '../../lib/motion';

type Kind = 'default' | 'link' | 'view' | 'drag' | 'hidden';
interface CursorState {
  kind: Kind;
  label: string;
}

const SIZE: Record<Kind, number> = { default: 30, link: 58, view: 104, drag: 88, hidden: 30 };

function CursorFollower() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 420, damping: 38, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 420, damping: 38, mass: 0.6 });
  const [state, setState] = useState<CursorState>({ kind: 'hidden', label: '' });
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('has-cursor');
    const update = (next: CursorState) =>
      setState((prev) => (prev.kind === next.kind && prev.label === next.label ? prev : next));

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as Element).closest<HTMLElement>('[data-cursor], a, button, [role="button"]');
      if (!el) return update({ kind: 'default', label: '' });
      const kind = (el.dataset.cursor as Kind | undefined) ?? 'link';
      update({ kind, label: el.dataset.cursorLabel ?? '' });
    };
    const onLeave = () => update({ kind: 'hidden', label: '' });
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    return () => {
      root.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      root.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [x, y]);

  const { kind, label } = state;
  const solid = kind === 'view';
  const showLabel = (kind === 'view' || kind === 'drag') && label;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      <motion.div className="absolute left-0 top-0" style={{ x: sx, y: sy }}>
        <motion.div
          className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
          animate={{
            width: SIZE[kind],
            height: SIZE[kind],
            opacity: kind === 'hidden' ? 0 : 1,
            scale: pressed ? 0.86 : 1,
            backgroundColor: solid ? 'rgba(242,241,238,1)' : kind === 'link' ? 'rgba(255,255,255,0.08)' : kind === 'drag' ? 'rgba(20,21,24,0.55)' : 'rgba(255,255,255,0)',
            borderColor: solid ? 'rgba(242,241,238,0)' : kind === 'link' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.28)',
          }}
          transition={{ duration: 0.5, ease: EASE_EXPO }}
          style={{ borderWidth: 1, borderStyle: 'solid', backdropFilter: kind === 'drag' ? 'blur(10px)' : undefined }}
        >
          {showLabel && (
            <motion.span
              key={label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE_EXPO }}
              className={`font-mono text-[11px] uppercase tracking-[0.16em] ${solid ? 'text-ink' : 'text-fg'}`}
            >
              {label}
            </motion.span>
          )}
        </motion.div>
      </motion.div>
      <motion.div className="absolute left-0 top-0" style={{ x, y }}>
        <motion.div
          className="size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg mix-blend-difference"
          animate={{ opacity: kind === 'hidden' || solid || kind === 'drag' ? 0 : 1, scale: kind === 'link' ? 0.5 : 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </div>
  );
}

/** Desktop-only cursor: dot + trailing ring that morphs for links, project previews and draggable areas. */
export default function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  return fine && !reduced ? <CursorFollower /> : null;
}
