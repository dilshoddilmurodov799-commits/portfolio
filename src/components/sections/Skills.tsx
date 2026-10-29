import { useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { SKILLS } from '../../content/data';
import type { SkillGroup } from '../../content/data';
import { useFinePointer } from '../../hooks/useMediaQuery';
import { FadeIn } from '../ui/Reveal';
import FlowingMenu from '../reactbits/FlowingMenu';
import LetterGlitch from '../reactbits/LetterGlitch';
import VariableProximity from '../reactbits/VariableProximity';

const GROUPS: SkillGroup[] = ['frontend', 'backend', 'data', 'workflow'];

const pill = 'rounded-full border border-line px-4 py-2 text-sm transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-ink';

/** "JavaScript, HTML, CSS +5" */
const summarize = (labels: string[]) => labels.slice(0, 3).join(', ') + (labels.length > 3 ? ` +${labels.length - 3}` : '');

export default function Skills() {
  const { t } = useLanguage();
  const fine = useFinePointer();
  const head = useRef<HTMLElement>(null);

  const rows = [
    ...GROUPS.map((group) => ({
      id: group,
      title: t.skills.groups[group],
      items: SKILLS.filter((s) => s.group === group).map((s) => ({
        label: s.label,
        note: s.evidence.length ? s.evidence.map((e) => t.skills.evidence[e]).join(' · ') : t.skills.toolkit,
      })),
    })),
    { id: 'beyond', title: t.skills.beyond, items: t.skills.soft.map((label) => ({ label, note: undefined })) },
  ].map((row, i) => ({ ...row, index: `0${i + 1}` }));

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
          {fine ? (
            // Hover a row: its stack flows past on an orange band.
            <FlowingMenu
              items={rows.map((row) => ({
                id: row.id,
                index: row.index,
                title: row.title,
                meta: summarize(row.items.map((item) => item.label)),
                items: row.items.map((item) => item.label),
              }))}
            />
          ) : (
            <ul className="border-b border-line">
              {rows.map((row) => (
                <FadeIn key={row.id} as="li" className="grid gap-6 border-t border-line py-[clamp(2rem,4vw,3.25rem)]">
                  <div className="flex items-baseline gap-5">
                    <span className="text-sm text-fg-3 tabular">{row.index}</span>
                    <h3 className="text-[clamp(2rem,4vw,3.75rem)] leading-none tracking-[-0.04em]">{row.title}</h3>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {row.items.map((item) => (
                      <li key={item.label} title={item.note} className={pill}>
                        {item.label}
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
