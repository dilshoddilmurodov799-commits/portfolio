// Adapted from ReactBits — SpotlightCard (https://reactbits.dev, MIT + Commons Clause).
// A soft light follows the pointer across the card.
import type { PointerEvent, ReactNode } from 'react';
import { cx } from '../../lib/cx';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

const track = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};

export default function SpotlightCard({ children, className, spotlightColor = 'rgb(255 106 61 / 0.18)' }: SpotlightCardProps) {
  return (
    <div className={cx('group/spot relative overflow-hidden', className)} onPointerMove={track}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{ background: `radial-gradient(520px circle at var(--mx, 50%) var(--my, 50%), ${spotlightColor}, transparent 70%)` }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
