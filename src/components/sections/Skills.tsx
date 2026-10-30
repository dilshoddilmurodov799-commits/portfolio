import { useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CAPABILITIES } from '../../content/data';
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery';
import { FadeIn } from '../ui/Reveal';
import FlowingMenu from '../reactbits/FlowingMenu';
import LetterGlitch from '../reactbits/LetterGlitch';
import VariableProximity from '../reactbits/VariableProximity';

const pill = 'rounded-full border border-line px-4 py-2 text-sm transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-ink';

export default function Skills() {
  const { t } = useLanguage();
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const head = useRef<HTMLElement>(null);

  // Each row says what I do for you; its band carries the tools behind it.
  const rows = CAPABILITIES.map((capability, i) => ({
    id: capability.id,
    index: `0${i + 1}`,
    title: t.skills.capabilities[capability.id].title,
    meta: t.skills.capabilities[capability.id].text,
    items: 'stack' in capability ? [...capability.stack] : t.skills.soft,
  }));

  return (
    <section id="skills" aria-labelledby="skills-title" className="px-[var(--gutter)] py-[clamp(6rem,14vh,10rem)]">
      <div className="mx-auto max-w-[1400px]">
        <header ref={head} className="relative">
          <LetterGlitch className="pointer-events-none absolute -inset-x-[var(--gutter)] -inset-y-[clamp(3rem,8vh,6rem)] h-[calc(100%_+_2*clamp(3rem,8vh,6rem))] w-[calc(100%_+_2*var(--gutter))] opacity-30 [mask-image:radial-gradient(60%_70%_at_30%_50%,#000,transparent)]" />
          <p className="label relative">{t.skills.label}</p>
          <FadeIn className="relative">
            <h2 id="skills-title" className="mt-5 text-[clamp(2.5rem,6vw,5.75rem)] leading-[1.02] tracking-[-0.045em]">
              <VariableProximity text={t.skills.title} containerRef={head} />
            </h2>
          </FadeIn>
        </header>

        <div className="mt-[clamp(3rem,8vh,6rem)]">
          {fine || !reduced ? (
            // Hover a row: its stack flows past on an orange band. Touch screens can't hover, so there
            // the rows take turns on their own; with reduced motion they get the static list instead.
            <FlowingMenu auto={!fine} items={rows} />
          ) : (
            <ul className="border-b border-line">
              {rows.map((row) => (
                <FadeIn key={row.id} as="li" className="grid gap-6 border-t border-line py-[clamp(2rem,4vw,3.25rem)]">
                  <div className="flex items-baseline gap-5">
                    <span className="text-sm text-fg-3 tabular">{row.index}</span>
                    <h3 className="text-[clamp(2rem,4vw,3.75rem)] leading-none tracking-[-0.04em]">{row.title}</h3>
                  </div>
                  <p className="max-w-xl text-[15px] leading-relaxed text-fg-2">{row.meta}</p>
                  <ul className="flex flex-wrap gap-2">
                    {row.items.map((label) => (
                      <li key={label} className={pill}>
                        {label}
                      </li>
                    ))}
                  </ul>
                </FadeIn>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
