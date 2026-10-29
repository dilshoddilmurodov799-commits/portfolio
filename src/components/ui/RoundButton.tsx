import { useLayoutEffect, useRef } from 'react';
import type { MouseEventHandler, ReactNode } from 'react';
import { gsap } from '../../lib/gsap';
import { cx } from '../../lib/cx';
import Magnetic from './Magnetic';

interface RoundButtonProps {
  children: ReactNode;
  /** Classes for the button itself: size, surface, border, type. */
  className?: string;
  /** Classes for the magnetic wrapper — use it to position the button. */
  wrapperClassName?: string;
  /** Colour of the circle that rises through the button on hover. */
  fill?: string;
  strength?: number;
  href?: string;
  download?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit';
  onClick?: MouseEventHandler<HTMLElement>;
  tabIndex?: number;
  'aria-label'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-pressed'?: boolean;
  'aria-hidden'?: boolean;
}

/**
 * Magnetic pill or circle. On hover a circle of `fill` rises from below; on leave it keeps
 * travelling up and out, so the colour always exits the way it came in.
 */
export default function RoundButton({
  children,
  className,
  wrapperClassName,
  fill = 'var(--color-accent)',
  strength = 0.3,
  href,
  type = 'button',
  ...rest
}: RoundButtonProps) {
  const circle = useRef<HTMLSpanElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const timeout = useRef(0);

  useLayoutEffect(() => {
    const tl = gsap
      .timeline({ paused: true })
      .to(circle.current, { top: '-25%', width: '150%', duration: 0.4, ease: 'power3.in' }, 'enter')
      .to(circle.current, { top: '-150%', width: '125%', duration: 0.25, ease: 'power3.out' }, 'exit');
    timeline.current = tl;
    return () => {
      tl.kill();
      window.clearTimeout(timeout.current);
    };
  }, []);

  const enter = () => {
    window.clearTimeout(timeout.current);
    timeline.current?.tweenFromTo('enter', 'exit');
  };
  const leave = () => {
    timeout.current = window.setTimeout(() => timeline.current?.play(), 300);
  };

  const shared = {
    className: cx('relative isolate inline-flex items-center justify-center overflow-hidden rounded-full', className),
    onPointerEnter: enter,
    onPointerLeave: leave,
    onFocus: enter,
    onBlur: leave,
  };
  const inner = (
    <>
      <span
        ref={circle}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full h-[150%] w-full -translate-x-1/2 rounded-full"
        style={{ background: fill }}
      />
      <span className="relative z-[1] inline-flex items-center justify-center gap-2 text-center">{children}</span>
    </>
  );

  return (
    <Magnetic strength={strength} className={wrapperClassName}>
      {href ? (
        <a href={href} {...rest} {...shared}>
          {inner}
        </a>
      ) : (
        <button type={type} {...rest} {...shared}>
          {inner}
        </button>
      )}
    </Magnetic>
  );
}
