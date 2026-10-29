import type { ReactNode } from 'react';
import SplitText from '../reactbits/SplitText';
import { cx } from '../../lib/cx';

interface SectionHeadingProps {
  id: string;
  label: string;
  title: string;
  aside?: ReactNode;
  className?: string;
}

/** Every chapter opens the same way: a small label, then the title rising letter by letter. */
export default function SectionHeading({ id, label, title, aside, className }: SectionHeadingProps) {
  return (
    <header className={cx('grid gap-8 lg:grid-cols-12 lg:items-end', className)}>
      <div className="lg:col-span-8">
        <p className="label">{label}</p>
        <SplitText
          id={id}
          text={title}
          className="mt-5 text-[clamp(2.5rem,6vw,5.75rem)] font-normal leading-[1.02] tracking-[-0.045em]"
        />
      </div>
      {aside && <div className="lg:col-span-4 lg:justify-self-end">{aside}</div>}
    </header>
  );
}
