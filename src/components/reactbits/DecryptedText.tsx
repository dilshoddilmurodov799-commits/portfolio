// Adapted from ReactBits — DecryptedText (https://reactbits.dev, MIT + Commons Clause).
// Characters scramble, then resolve left to right — on entering the viewport or on hover.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { useReducedMotion } from '../../hooks/useMediaQuery';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>';

interface DecryptedTextProps {
  text: string;
  animateOn?: 'view' | 'hover';
  /** Milliseconds per frame. */
  speed?: number;
  className?: string;
}

export default function DecryptedText({ text, animateOn = 'view', speed = 38, className }: DecryptedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduced = useReducedMotion();
  // Scrambled frame tagged with the text it belongs to, so a locale switch never shows stale glyphs.
  const [frame, setFrame] = useState<{ text: string; value: string } | null>(null);
  const shown = frame && frame.text === text ? frame.value : text;
  const timer = useRef<number | undefined>(undefined);

  const run = useCallback(() => {
    if (reduced) return;
    window.clearInterval(timer.current);
    let revealed = 0;
    timer.current = window.setInterval(() => {
      revealed += Math.max(1, text.length / 14);
      if (revealed >= text.length) {
        window.clearInterval(timer.current);
        setFrame(null);
        return;
      }
      setFrame({
        text,
        value: Array.from(text, (char, i) =>
          i < revealed || char === ' ' ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        ).join(''),
      });
    }, speed);
  }, [text, speed, reduced]);

  useEffect(() => {
    if (animateOn === 'view' && inView) run();
    return () => window.clearInterval(timer.current);
  }, [animateOn, inView, run, text]);

  return (
    <span ref={ref} className={className} onPointerEnter={animateOn === 'hover' ? run : undefined}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
