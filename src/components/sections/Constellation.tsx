import { memo, useEffect, useRef } from 'react';
import { SKILLS, SKILL_EDGES } from '../../content/data';
import { useReducedMotion } from '../../hooks/useMediaQuery';

interface ConstellationProps {
  active: string | null;
  onActivate: (id: string | null) => void;
  dragLabel: string;
}

const INDEX = new Map(SKILLS.map((s, i) => [s.id, i]));
const EDGES = SKILL_EDGES.map(([a, b]) => [INDEX.get(a)!, INDEX.get(b)!] as const);
const NEIGHBOURS = SKILLS.map((_, i) => new Set(EDGES.flatMap(([a, b]) => (a === i ? [b] : b === i ? [a] : []))));
const ACCENT = '255,106,61';

// Even Fibonacci distribution; index order maps to height, so the stack reads in layers.
const POSITIONS = SKILLS.map((_, i) => {
  const y = 1 - ((i + 0.5) / SKILLS.length) * 2;
  const r = Math.sqrt(1 - y * y);
  const theta = i * 2.39996;
  return [Math.cos(theta) * r, y * 0.9, Math.sin(theta) * r] as const;
});

/**
 * A rotating 3D graph of the stack. Nodes are real buttons (focusable, labelled) positioned
 * every frame from a projected sphere; edges are drawn on one 2D canvas behind them.
 */
function Constellation({ active, onActivate, dragLabel }: ConstellationProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);
  const activeRef = useRef<number | null>(null);
  const requestFrame = useRef<() => void>(() => {});
  const reduced = useReducedMotion();

  useEffect(() => {
    activeRef.current = active ? (INDEX.get(active) ?? null) : null;
    requestFrame.current();
  }, [active]);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!el || !cv || !ctx) return;

    let width = 0;
    let height = 0;
    let rx = 0;
    let ry = 0;
    let raf = 0;
    let visible = false;
    let last = performance.now();
    let angleY = 0.5;
    let angleX = -0.22;
    let spin = 0;
    let dragging = false;
    let moved = 0;
    let prevX = 0;
    let prevY = 0;
    const pointer = { x: -1e4, y: -1e4 };
    const projected = SKILLS.map(() => ({ x: 0, y: 0, depth: 0 }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = el.clientWidth;
      height = el.clientHeight;
      // Elliptical projection uses the full box, so narrow screens get vertical room instead of overlap.
      rx = Math.min(width * (width < 640 ? 0.3 : 0.4), height * 0.62);
      ry = height * 0.4;
      cv.width = width * dpr;
      cv.height = height * dpr;
      cv.style.width = `${width}px`;
      cv.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      const dt = Math.min((time - last) / 1000, 1 / 20);
      last = time;
      // Rotation all but stops while a node is active so it doesn't drift from the pointer.
      const autoSpin = reduced ? 0 : activeRef.current === null ? 0.12 : 0.015;
      if (!dragging) {
        angleY += autoSpin * dt + spin * dt;
        spin *= Math.exp(-2.5 * dt);
      }

      const cy = Math.cos(angleY), sy = Math.sin(angleY);
      const cx = Math.cos(angleX), sx = Math.sin(angleX);
      const focal = 3.2;
      const current = activeRef.current;
      const linked = current === null ? null : NEIGHBOURS[current];

      SKILLS.forEach((_, i) => {
        const [px, py, pz] = POSITIONS[i];
        const x1 = px * cy + pz * sy;
        const z1 = -px * sy + pz * cy;
        const y2 = py * cx - z1 * sx;
        const z2 = py * sx + z1 * cx;
        const scale = focal / (focal - z2);
        let x = width / 2 + x1 * rx * scale;
        let y = height / 2 - y2 * ry * scale;

        // Gentle magnetic pull toward a nearby pointer.
        const dx = pointer.x - x;
        const dy = pointer.y - y;
        const d = Math.hypot(dx, dy);
        if (d < 150) {
          const pull = (1 - d / 150) * 0.18;
          x += dx * pull;
          y += dy * pull;
        }
        const depth = (z2 + 1) / 2;
        projected[i] = { x, y, depth };

        const node = nodes.current[i];
        if (!node) return;
        const isActive = current === i;
        const isLinked = linked?.has(i) ?? false;
        const dimmed = current !== null && !isActive && !isLinked;
        const s = isActive ? Math.max(1.05, 0.72 + depth * 0.38) : 0.72 + depth * 0.38;
        node.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
        node.style.opacity = String(isActive ? 1 : dimmed ? 0.18 : 0.35 + depth * 0.65);
        node.style.zIndex = String(isActive ? 200 : Math.round(depth * 100));
        node.dataset.state = isActive ? 'active' : isLinked ? 'linked' : 'idle';
      });

      ctx.clearRect(0, 0, width, height);
      EDGES.forEach(([a, b], e) => {
        const pa = projected[a];
        const pb = projected[b];
        const hot = current !== null && (a === current || b === current);
        const depth = (pa.depth + pb.depth) / 2;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.lineWidth = hot ? 1.2 : 1;
        ctx.strokeStyle = hot
          ? `rgba(${ACCENT},${0.55 + depth * 0.4})`
          : `rgba(255,255,255,${(current === null ? 0.05 : 0.025) + depth * 0.1})`;
        ctx.stroke();

        if (hot && !reduced) {
          // A signal travels outward from the active node.
          const from = a === current ? pa : pb;
          const to = a === current ? pb : pa;
          const t = (time * 0.0005 + e * 0.17) % 1;
          ctx.beginPath();
          ctx.arc(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${ACCENT},${1 - t})`;
          ctx.fill();
        }
      });

      if (visible && !reduced) raf = requestAnimationFrame(draw);
    };

    const frame = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    requestFrame.current = frame;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.x = e.pointerType === 'mouse' ? e.clientX - r.left : -1e4;
      pointer.y = e.pointerType === 'mouse' ? e.clientY - r.top : -1e4;
      if (dragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        moved += Math.abs(dx) + Math.abs(dy);
        angleY += dx * 0.006;
        angleX = Math.max(-0.9, Math.min(0.9, angleX + dy * 0.004));
        spin = dx * 0.35;
        prevX = e.clientX;
        prevY = e.clientY;
        if (moved > 4) el.setPointerCapture?.(e.pointerId);
      }
      if (reduced) frame();
    };
    const endDrag = (e: PointerEvent) => {
      dragging = false;
      if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    const onLeave = (e: PointerEvent) => {
      pointer.x = pointer.y = -1e4;
      if (e.pointerType === 'mouse') onActivate(null);
      if (reduced) frame();
    };
    // Swallow the click that ends a drag so it doesn't select a node.
    const onClickCapture = (e: MouseEvent) => {
      if (moved > 6) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const ro = new ResizeObserver(() => {
      resize();
      frame();
    });
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = performance.now();
      if (visible) frame();
      else cancelAnimationFrame(raf);
    });
    io.observe(el);

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('click', onClickCapture, true);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      requestFrame.current = () => {};
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', endDrag);
      el.removeEventListener('pointercancel', endDrag);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, [reduced, onActivate]);

  return (
    <div
      ref={wrap}
      data-cursor="drag"
      data-cursor-label={dragLabel}
      className="relative h-[540px] touch-pan-y select-none overflow-x-clip sm:h-[560px] lg:h-[640px]"
    >
      <canvas ref={canvas} aria-hidden="true" className="absolute inset-0" />
      {SKILLS.map((skill, i) => (
        <button
          key={skill.id}
          ref={(node) => {
            nodes.current[i] = node;
          }}
          type="button"
          data-cursor="link"
          aria-pressed={active === skill.id}
          aria-describedby="skill-info"
          onPointerEnter={(e) => e.pointerType === 'mouse' && onActivate(skill.id)}
          onFocus={() => onActivate(skill.id)}
          onClick={() => onActivate(skill.id)}
          className="group absolute left-0 top-0 will-change-transform"
        >
          <span className="glass skill-node relative flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-medium tracking-tight sm:px-3.5 sm:py-2 sm:text-[13px]">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-fg-3 transition-colors duration-500 group-data-[state=active]:bg-accent group-data-[state=linked]:bg-accent"
            />
            {skill.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default memo(Constellation);
