import { LayoutGrid, List } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cx } from '../../lib/cx';
import RoundButton from '../ui/RoundButton';

export type View = 'list' | 'grid';

/** Round list/grid switch; the active view is filled. */
export default function ViewToggle({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  const { t } = useLanguage();
  return (
    <div role="group" aria-label={`${t.work.list} / ${t.work.grid}`} className="flex gap-3">
      {(['list', 'grid'] as const).map((v) => (
        <RoundButton
          key={v}
          onClick={() => onChange(v)}
          aria-pressed={view === v}
          aria-label={t.work[v]}
          className={cx(
            'size-[4.25rem] border transition-colors duration-300',
            view === v ? 'border-paper bg-paper text-ink' : 'border-line text-fg hover:text-ink',
          )}
        >
          {v === 'list' ? <List aria-hidden="true" className="size-5" strokeWidth={1.5} /> : <LayoutGrid aria-hidden="true" className="size-5" strokeWidth={1.5} />}
        </RoundButton>
      ))}
    </div>
  );
}
