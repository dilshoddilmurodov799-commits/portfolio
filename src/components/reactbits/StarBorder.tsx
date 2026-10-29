// Adapted from ReactBits — StarBorder (https://reactbits.dev, MIT + Commons Clause).
// Two soft lights travel along the top and bottom edges of a pill in opposite directions.
import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

interface StarBorderProps {
  children: ReactNode;
  className?: string;
  /** Classes for the pill itself — give it the surface colour it sits on. */
  innerClassName?: string;
  color?: string;
  speed?: string;
}

export default function StarBorder({ children, className, innerClassName, color = 'var(--color-accent)', speed = '5s' }: StarBorderProps) {
  const light = { background: `radial-gradient(circle, ${color}, transparent 10%)`, animationDuration: speed };
  return (
    <span className={cx('relative inline-block overflow-hidden rounded-full py-px', className)}>
      <span aria-hidden="true" className="star-border-bottom" style={light} />
      <span aria-hidden="true" className="star-border-top" style={light} />
      <span className={cx('relative z-[1] block rounded-full border border-line', innerClassName)}>{children}</span>
    </span>
  );
}
