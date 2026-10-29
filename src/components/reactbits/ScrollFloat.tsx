// Adapted from ReactBits — ScrollFloat (https://reactbits.dev, MIT + Commons Clause).
// Characters rise out of a mask, stretched tall and narrow, and spring back to shape —
// scrubbed to the scroll position.
import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import { cx } from '../../lib/cx';

export default function ScrollFloat({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-char]',
        { opacity: 0, yPercent: 120, scaleY: 2.3, scaleX: 0.7, transformOrigin: '50% 0%' },
        {
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          ease: 'back.inOut(2)',
          stagger: 0.03,
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom 62%', scrub: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [text, reduced]);

  const words = text.split(' ');
  return (
    <span ref={ref} className={cx('inline-block overflow-hidden pb-[0.12em] align-bottom', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <span key={w} className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, c) => (
              <span key={c} data-char="" className="inline-block">
                {char}
              </span>
            ))}
            {w < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </span>
  );
}
