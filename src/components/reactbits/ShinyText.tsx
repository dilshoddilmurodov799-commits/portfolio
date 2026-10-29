// Adapted from ReactBits — ShinyText (https://reactbits.dev, MIT + Commons Clause).
// A band of light sweeps across muted text on a loop.
import { cx } from '../../lib/cx';

export default function ShinyText({ text, speed = 4, className }: { text: string; speed?: number; className?: string }) {
  return (
    <span className={cx('shiny-text', className)} style={{ animationDuration: `${speed}s` }}>
      {text}
    </span>
  );
}
