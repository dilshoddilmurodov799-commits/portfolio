import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useMediaQuery';

/** Words brighten one by one, tied directly to scroll position. */
export default function ScrubWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-word]',
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: 'top 82%', end: 'bottom 48%', scrub: true },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, [text, reduced]);

  return (
    <p ref={ref} className={className}>
      {text.split(' ').map((word, i) => (
        <span key={i} data-word="">
          {word}{' '}
        </span>
      ))}
    </p>
  );
}
