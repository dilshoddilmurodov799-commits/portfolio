import { useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WORK } from '../../content/data';
import { useDialog } from '../../hooks/useDialog';
import { EASE_EXPO } from '../../lib/motion';
import Asterisk from '../ui/Asterisk';
import RoundButton from '../ui/RoundButton';
import { FadeIn } from '../ui/Reveal';
import SplitText from '../reactbits/SplitText';
import ProjectArt from './ProjectArt';
import { localizeWork } from './localize';

type WorkItem = (typeof WORK)[number];

interface CaseStudyProps {
  item: WorkItem | null;
  index: number;
  onClose: () => void;
  onNext: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');
const frame = 'relative overflow-hidden rounded-[clamp(1rem,1.6vw,1.5rem)] ring-1 ring-inset ring-white/[0.06]';
const outline = 'h-12 border border-line px-5 text-sm transition-colors duration-300 hover:text-ink focus-visible:text-ink';

/** A project's own screen: the curtain opens onto it, and closes it again on the way back. */
function Page({ item, index, onClose, onNext }: { item: WorkItem; index: number; onClose: () => void; onNext: () => void }) {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const { copy, stack, period } = localizeWork(item, t);
  const next = WORK[(index + 1) % WORK.length];
  useDialog(ref, true, onClose);

  const meta = [
    { k: t.work.role, v: copy.role },
    { k: t.work.period, v: period },
    { k: t.work.stack, v: stack.join(' · ') },
  ];

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-title"
      data-lenis-prevent=""
      className="fixed inset-0 z-[86] overflow-y-auto overscroll-contain bg-ink"
    >
      <div className="sticky top-0 z-10 bg-gradient-to-b from-ink from-40% to-transparent px-[var(--gutter)] pb-8 pt-[clamp(1rem,2.6vw,2rem)]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <span data-autofocus="" tabIndex={-1} className="sr-only" />
          <RoundButton onClick={onClose} className={outline}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            {t.work.back}
          </RoundButton>
          <p className="text-sm text-fg-3 tabular">
            <span className="text-fg">{pad(index + 1)}</span> / {pad(WORK.length)}
          </p>
        </div>
      </div>

      <header className="px-[var(--gutter)] pt-[clamp(2rem,8vh,6rem)]">
        <div className="mx-auto max-w-[1400px]">
          <p className="label flex items-center gap-2">
            <Asterisk className="size-3 text-accent" />
            {copy.category}
          </p>
          <SplitText id="case-title" text={copy.title} className="mt-6 max-w-[14ch] text-[clamp(3rem,9vw,9.5rem)] leading-[0.95] tracking-[-0.05em]" />
          <dl className="mt-[clamp(3rem,8vh,5rem)] grid gap-8 border-t border-line pt-8 sm:grid-cols-3">
            {meta.map((m) => (
              <div key={m.k}>
                <dt className="label">{m.k}</dt>
                <dd className="mt-3 text-[15px]">{m.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Main preview */}
      <motion.div
        className="mx-auto mt-[clamp(3rem,8vh,5rem)] max-w-[calc(1400px_+_2*var(--gutter))] px-[var(--gutter)]"
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.3, ease: EASE_EXPO, delay: 0.55 }}
      >
        <div className={`${frame} aspect-[4/3] md:aspect-[16/9]`} style={{ background: item.color }}>
          <ProjectArt kind={item.visual} className="lg:inset-x-[10%]" />
        </div>
      </motion.div>

      <section className="mx-auto grid max-w-[calc(1400px_+_2*var(--gutter))] gap-12 px-[var(--gutter)] py-[clamp(4rem,12vh,8rem)] lg:grid-cols-12 lg:gap-8">
        <FadeIn as="p" className="text-[clamp(1.4rem,2.4vw,2.25rem)] leading-[1.3] tracking-[-0.02em] lg:col-span-7">
          {copy.summary}
        </FadeIn>
        <FadeIn as="div" className="lg:col-span-4 lg:col-start-9">
          <h3 className="label">{t.work.challenge}</h3>
          <p className="mt-5 text-[clamp(1.05rem,1.3vw,1.2rem)] leading-relaxed">{copy.problem}</p>
          {item.repo && (
            <RoundButton href={item.repo} target="_blank" rel="noopener noreferrer" wrapperClassName="mt-8" className={outline}>
              {t.work.source}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </RoundButton>
          )}
        </FadeIn>
      </section>

      {/* The engineering story, revealed as you read on: what was built, then the decisions behind it. */}
      <section className="mx-auto grid max-w-[calc(1400px_+_2*var(--gutter))] gap-12 px-[var(--gutter)] md:grid-cols-2 lg:gap-8">
        {[
          { label: t.work.built, points: copy.details },
          { label: t.work.approach, points: copy.approach },
        ].map((group, g) => (
          <FadeIn key={group.label} as="div" delay={g * 0.1}>
            <h3 className="label">{group.label}</h3>
            <ul className="mt-5 border-b border-line">
              {group.points.map((point, i) => (
                <li key={i} className="flex gap-5 border-t border-line py-5 text-[15px] leading-relaxed text-fg-2">
                  <span className="pt-0.5 text-sm text-accent tabular">{pad(i + 1)}</span>
                  {point}
                </li>
              ))}
            </ul>
          </FadeIn>
        ))}
      </section>

      {copy.outcome && (
        <FadeIn as="div" className="mx-auto mt-[clamp(4rem,10vh,7rem)] max-w-[calc(1400px_+_2*var(--gutter))] px-[var(--gutter)]">
          <h3 className="label">{t.work.outcome}</h3>
          <p className="mt-5 max-w-[28ch] text-[clamp(1.75rem,3.4vw,3.25rem)] leading-[1.1] tracking-[-0.03em]">{copy.outcome}</p>
        </FadeIn>
      )}

      {/* Next project */}
      <button
        type="button"
        onClick={onNext}
        className="group mt-[clamp(5rem,14vh,9rem)] block w-full border-t border-line px-[var(--gutter)] py-[clamp(4rem,12vh,8rem)] text-left"
      >
        <span className="mx-auto block max-w-[1400px]">
          <span className="label block">{t.work.next}</span>
          <span className="mt-6 flex items-center justify-between gap-6 text-[clamp(2.5rem,7vw,7rem)] leading-none tracking-[-0.045em]">
            <span className="transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-x-4">{t.work.items[next.id].title}</span>
            <ArrowUpRight
              aria-hidden="true"
              strokeWidth={1.25}
              className="size-[0.7em] shrink-0 text-accent transition-transform duration-700 ease-[var(--ease-expo)] group-hover:rotate-45"
            />
          </span>
        </span>
      </button>
    </div>
  );
}

export default function CaseStudy({ item, index, onClose, onNext }: CaseStudyProps) {
  return item ? <Page key={item.id} item={item} index={index} onClose={onClose} onNext={onNext} /> : null;
}
