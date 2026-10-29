import { cx } from '../../lib/cx';
import DecryptedText from '../reactbits/DecryptedText';

export default function SectionLabel({ index, children, className }: { index: string; children: string; className?: string }) {
  return (
    <p className={cx('label flex items-center gap-3', className)}>
      <span className="text-fg tabular">({index})</span>
      <span aria-hidden="true" className="h-px w-10 bg-line-strong" />
      <DecryptedText text={children} />
    </p>
  );
}
