import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WORK, WORK_KINDS } from '../../content/data';
import type { WorkKind } from '../../content/data';
import { useDialog } from '../../hooks/useDialog';
import { useDesktop, useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery';
import { EASE_EXPO } from '../../lib/motion';
import { cx } from '../../lib/cx';
import RoundButton from '../ui/RoundButton';
import SplitText from '../reactbits/SplitText';
import ProjectGrid from './ProjectGrid';
import ViewToggle from './ViewToggle';
import type { View } from './ViewToggle';
import WorkPreview from './WorkPreview';
import { localizeWork } from './localize';

type Filter = 'all' | WorkKind;

interface ArchiveProps {
  open: boolean;
  /** A project page is open on top: the hover preview must stand down. */
  covered: boolean;
  onClose: () => void;
  onOpen: (index: number) => void;
}

const ALL = WORK.map((_, i) => i);
const countOf = (filter: Filter) => (filter === 'all' ? WORK.length : WORK.filter((w) => (w.kinds as readonly WorkKind[]).includes(filter)).length);

/** Every project on one screen — filterable, as a table or as cards. */
function Page({ covered, onClose, onOpen }: Omit<ArchiveProps, 'open'>) {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const desktop = useDesktop();
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<Filter>('all');
  const [chosen, setChosen] = useState<View>('list');
  const [hover, setHover] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  useDialog(ref, true, onClose);

  const canList = fine && desktop;
  const view = canList ? chosen : 'grid';
  const items = filter === 'all' ? ALL : ALL.filter((i) => (WORK[i].kinds as readonly WorkKind[]).includes(filter));
  const point = (i: number | null) => {
    setHover(i);
    if (i !== null) setShown(i);
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-title"
      data-lenis-prevent=""
      className="fixed inset-0 z-[86] overflow-y-auto overscroll-contain bg-ink"
    >
      <div className="sticky top-0 z-10 bg-gradient-to-b from-ink from-40% to-transparent px-[var(--gutter)] pb-8 pt-[clamp(1rem,2.6vw,2rem)]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <span data-autofocus="" tabIndex={-1} className="sr-only" />
          <RoundButton onClick={onClose} className="h-12 border border-line px-5 text-sm transition-colors duration-300 hover:text-ink focus-visible:text-ink">
            <ArrowLeft aria-hidden="true" className="size-4" />
            {t.work.back}
          </RoundButton>
          <p className="text-sm text-fg-3 tabular">
            <span className="text-fg">{items.length}</span> / {WORK.length}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[calc(1400px_+_2*var(--gutter))] px-[var(--gutter)] pb-[clamp(6rem,14vh,10rem)] pt-[clamp(2rem,8vh,6rem)]">
        <p className="label">{t.work.label}</p>
        <SplitText id="archive-title" text={t.work.archiveTitle} className="mt-6 text-[clamp(3rem,9vw,9.5rem)] leading-[0.95] tracking-[-0.05em]" />

        <div className="mt-[clamp(3rem,8vh,5rem)] flex flex-wrap items-center justify-between gap-6">
          <div role="group" aria-label={t.work.archiveTitle} className="flex flex-wrap gap-2">
            {(['all', ...WORK_KINDS] as const).map((f) => (
              <RoundButton
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={cx(
                  'h-[clamp(3.25rem,4.5vw,4rem)] border px-[clamp(1.25rem,2.4vw,2rem)] text-[15px] transition-colors duration-300',
                  filter === f ? 'border-paper bg-paper text-ink' : 'border-line hover:text-ink',
                )}
              >
                {t.work.filters[f]}
                <sup className="text-[10px] tabular">{countOf(f)}</sup>
              </RoundButton>
            ))}
          </div>
          {canList && <ViewToggle view={view} onChange={setChosen} />}
        </div>

        <div className="mt-[clamp(3rem,8vh,5rem)]">
          {view === 'list' ? (
            <div>
              <div aria-hidden="true" className="label hidden grid-cols-12 gap-6 px-[clamp(0rem,2vw,2rem)] pb-5 lg:grid">
                <span className="col-span-5">{t.work.project}</span>
                <span className="col-span-3">{t.work.role}</span>
                <span className="col-span-2">{t.work.stack}</span>
                <span className="col-span-2 text-right">{t.work.year}</span>
              </div>
              <ul className="border-b border-line" onPointerLeave={() => point(null)}>
                <AnimatePresence initial={false} mode="popLayout">
                  {items.map((i) => {
                    const { copy, stack, period } = localizeWork(WORK[i], t);
                    return (
                      <motion.li
                        key={WORK[i].id}
                        layout
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.6, ease: EASE_EXPO }}
                        className="border-t border-line"
                      >
                        <button
                          type="button"
                          aria-haspopup="dialog"
                          onClick={() => onOpen(i)}
                          onPointerEnter={() => point(i)}
                          onFocus={() => point(i)}
                          onBlur={() => point(null)}
                          className="group grid w-full grid-cols-12 items-center gap-6 px-[clamp(0rem,2vw,2rem)] py-[clamp(2rem,3.5vw,3rem)] text-left"
                        >
                          <span className="col-span-5 text-[clamp(1.75rem,3vw,3rem)] leading-[1.05] tracking-[-0.04em] transition-[translate,color] duration-500 ease-[var(--ease-expo)] group-hover:-translate-x-2.5 group-hover:text-fg-3">
                            {copy.title}
                          </span>
                          <span className="col-span-3 text-[15px] text-fg-2">{copy.role}</span>
                          <span className="col-span-2 text-[15px] text-fg-2">{stack.slice(0, 2).join(', ')}</span>
                          <span className="col-span-2 text-right text-[15px] tabular transition-[translate] duration-500 ease-[var(--ease-expo)] group-hover:translate-x-2.5">
                            {period}
                          </span>
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </div>
          ) : (
            <ProjectGrid items={items} onOpen={onOpen} onHover={point} />
          )}
        </div>
      </div>

      {fine && !reduced && <WorkPreview active={hover !== null && !covered} index={shown} modal={view === 'list'} label={t.work.view} />}
    </div>
  );
}

export default function Archive({ open, ...rest }: ArchiveProps) {
  return open ? <Page {...rest} /> : null;
}
