// Adapted from ReactBits — ScrollReveal (https://reactbits.dev, MIT + Commons Clause).
// Words sharpen out of a blur and brighten as the block scrolls through the viewport,
// while the whole block levels out from a slight tilt.
import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useMediaQuery';

interface ScrollRevealProps {
  text: string;
  className?: string;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
}

export default function ScrollReveal({ text, className, baseOpacity = 0.12, baseRotation = 3, blurStrength = 5 }: ScrollRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { rotate: baseRotation, transformOrigin: '0% 50%' },
        { rotate: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom 60%', scrub: true } },
      );
      gsap.fromTo(
        '[data-word]',
        { opacity: baseOpacity, filter: `blur(${blurStrength}px)` },
        {
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'none',
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [text, reduced, baseOpacity, baseRotation, blurStrength]);

  return (
    <p ref={ref} className={className}>
      {text.split(' ').map((word, i) => (
        <span key={i}>
          <span data-word="" className="inline-block">
            {word}
          </span>{' '}
        </span>
      ))}
    </p>
  );
}
