// Adapted from ReactBits — RotatingText (https://reactbits.dev, MIT + Commons Clause).
// Cycles phrases; characters leave upward and arrive from below with a stagger.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import { EASE_EXPO } from '../../lib/motion';
import { cx } from '../../lib/cx';

interface RotatingTextProps {
  texts: readonly string[];
  interval?: number;
  className?: string;
}

export default function RotatingText({ texts, interval = 2600, className }: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || texts.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % texts.length), interval);
    return () => window.clearInterval(id);
  }, [texts, interval, reduced]);

  const current = texts[index % texts.length];

  return (
    <motion.span layout className={cx('relative inline-flex overflow-hidden', className)} transition={{ layout: { duration: 0.5, ease: EASE_EXPO } }}>
      <span className="sr-only">{texts.join(', ')}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={current} aria-hidden="true" className="inline-flex whitespace-pre">
          {Array.from(current).map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-120%', opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE_EXPO, delay: i * 0.018 }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
