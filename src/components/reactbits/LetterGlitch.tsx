// Adapted from ReactBits — LetterGlitch (https://reactbits.dev, MIT + Commons Clause).
// A grid of code glyphs where a few letters at a time swap and fade between colours.
// Draws only while on screen; one static frame under reduced motion.
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useMediaQuery';

interface LetterGlitchProps {
  colors?: string[];
  /** Milliseconds between glitch steps. */
  speed?: number;
  className?: string;
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[]()<>/\\|=+-*&^%$#@!;:'.split('');
const DEFAULT_COLORS = ['#3a2a24', '#ff6a3d', '#55575b'];
const CHAR_W = 11;
const CHAR_H = 20;

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

interface Letter {
  char: string;
  from: number[];
  to: number[];
  t: number;
}

export default function LetterGlitch({ colors = DEFAULT_COLORS, speed = 60, className }: LetterGlitchProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const palette = colors.map(hexToRgb);
    const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
    let letters: Letter[] = [];
    let cols = 0;
    let raf = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const { width, height } = el.getBoundingClientRect();
      el.width = width * dpr;
      el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / CHAR_W);
      const rows = Math.ceil(height / CHAR_H);
      letters = Array.from({ length: cols * rows }, () => {
        const c = pick(palette);
        return { char: pick(GLYPHS), from: c, to: c, t: 1 };
      });
      draw();
    };
    const draw = () => {
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.font = '15px "Geist Mono Variable", monospace';
      ctx.textBaseline = 'top';
      letters.forEach((l, i) => {
        const k = Math.min(1, l.t);
        const rgb = l.from.map((v, j) => Math.round(v + (l.to[j] - v) * k));
        ctx.fillStyle = `rgb(${rgb.join(',')})`;
        ctx.fillText(l.char, (i % cols) * CHAR_W, Math.floor(i / cols) * CHAR_H);
      });
    };
    const frame = (now: number) => {
      if (now - last > speed) {
        last = now;
        const count = Math.max(1, Math.floor(letters.length * 0.03));
        for (let n = 0; n < count; n++) {
          const l = letters[Math.floor(Math.random() * letters.length)];
          if (!l) break;
          l.char = pick(GLYPHS);
          l.from = l.to;
          l.to = pick(palette);
          l.t = 0;
        }
      }
      letters.forEach((l) => l.t < 1 && (l.t += 0.06));
      draw();
      raf = requestAnimationFrame(frame);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(el);
    const visibility = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting && !reduced) raf = requestAnimationFrame(frame);
    });
    visibility.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      visibility.disconnect();
    };
  }, [colors, speed, reduced]);

  return <canvas ref={canvas} aria-hidden="true" className={className} />;
}
