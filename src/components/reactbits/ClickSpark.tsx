// Adapted from ReactBits — ClickSpark (https://reactbits.dev, MIT + Commons Clause).
// Short lines burst outward from every click; one page-wide canvas that only animates while sparks live.
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useMediaQuery';

interface ClickSparkProps {
  color?: string;
  size?: number;
  radius?: number;
  count?: number;
  /** Milliseconds each burst lives. */
  duration?: number;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  start: number;
}

const easeOut = (t: number) => t * (2 - t);

export default function ClickSpark({ color = '#ff6a3d', size = 11, radius = 24, count = 8, duration = 420 }: ClickSparkProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx || reduced) return;
    let sparks: Spark[] = [];
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      el.width = window.innerWidth * dpr;
      el.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      sparks = sparks.filter((s) => now - s.start < duration);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (const s of sparks) {
        const eased = easeOut((now - s.start) / duration);
        const distance = eased * radius;
        const length = size * (1 - eased);
        const cos = Math.cos(s.angle);
        const sin = Math.sin(s.angle);
        ctx.beginPath();
        ctx.moveTo(s.x + distance * cos, s.y + distance * sin);
        ctx.lineTo(s.x + (distance + length) * cos, s.y + (distance + length) * sin);
        ctx.stroke();
      }
      raf = sparks.length ? requestAnimationFrame(draw) : 0;
    };
    const burst = (e: PointerEvent) => {
      const start = performance.now();
      for (let i = 0; i < count; i++) sparks.push({ x: e.clientX, y: e.clientY, angle: (2 * Math.PI * i) / count, start });
      if (!raf) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointerdown', burst, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', burst);
    };
  }, [color, size, radius, count, duration, reduced]);

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[96] h-full w-full" />;
}
