import type { PointerEvent, ReactNode } from 'react';
import RollText from './RollText';
import { cx } from '../../lib/cx';

interface ButtonProps {
  children: string;
  href?: string;
  onClick?: () => void;
  variant?: 'solid' | 'glass';
  icon?: ReactNode;
  download?: boolean | string;
  external?: boolean;
  className?: string;
  ariaLabel?: string;
}

// The fill circle grows from wherever the pointer entered or left.
function trackEdge(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
}

export default function Button({ children, href, onClick, variant = 'glass', icon, download, external, className, ariaLabel }: ButtonProps) {
  const classes = cx('btn', variant === 'solid' ? 'btn-solid' : 'glass', className);
  const content = (
    <>
      <RollText>{children}</RollText>
      {icon && <span aria-hidden="true" className="grid size-5 place-items-center">{icon}</span>}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        onClick={onClick}
        onPointerEnter={trackEdge}
        onPointerLeave={trackEdge}
        download={download}
        aria-label={ariaLabel}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={classes} onClick={onClick} onPointerEnter={trackEdge} onPointerLeave={trackEdge} aria-label={ariaLabel}>
      {content}
    </button>
  );
}
