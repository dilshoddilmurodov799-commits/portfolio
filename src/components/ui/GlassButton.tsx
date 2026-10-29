import type { ReactNode } from 'react';
import LiquidGlass from './LiquidGlass';
import RollText from './RollText';
import { cx } from '../../lib/cx';

interface GlassButtonProps {
  children: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  download?: string;
  external?: boolean;
  className?: string;
}

/** Primary call to action: a liquid-glass pill whose light core warms to ember on hover. */
export default function GlassButton({ children, icon, href, onClick, download, external, className }: GlassButtonProps) {
  const body = (
    <LiquidGlass tier="control" className="flex h-14 items-center gap-4 pl-6 pr-2">
      <span className="relative z-[1] text-[15px] font-medium tracking-tight">
        <RollText>{children}</RollText>
      </span>
      <span
        aria-hidden="true"
        className="relative z-[1] grid size-10 place-items-center rounded-full bg-fg text-ink shadow-[0_0_0_0_rgb(255_106_61/0)] transition-[background-color,box-shadow,transform] duration-500 ease-[var(--ease-expo)] group-hover:scale-105 group-hover:bg-accent group-hover:shadow-[0_0_28px_4px_rgb(255_106_61/0.45)] group-focus-visible:bg-accent"
      >
        {icon}
      </span>
    </LiquidGlass>
  );
  const classes = cx('group inline-flex rounded-full', className);
  if (href) {
    return (
      <a href={href} download={download} className={classes} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {body}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {body}
    </button>
  );
}
