import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { MILESTONES } from '../../content/data';
import { certificateAt, describeCertificate } from '../../content/certificates';
import type { MilestoneType } from '../../content/data';
import { useSmoothScroll } from '../../providers/SmoothScroll';
import { cx } from '../../lib/cx';
import PageLink from '../ui/PageLink';
import SectionHeading from '../ui/SectionHeading';
import { FadeIn } from '../ui/Reveal';
import HoloCard from '../reactbits/HoloCard';

const YEARS = [...new Set(MILESTONES.map((m) => m.year))];

const DOTS: Record<MilestoneType, string> = {
  work: 'bg-accent',
  education: 'bg-paper',
  certification: 'bg-[#8fa3ff]',
  community: 'bg-[#e9c46a]',
  event: 'bg-mist',
};

/** Polished-metal fill for the big year digits. */
const CHROME = 'bg-[linear-gradient(180deg,#ffffff_0%,#d9d8d4_38%,#6e6f72_62%,#c9c8c4_100%)] bg-clip-text text-transparent';

/** Odometer-style year: each digit column slides to its value. */
function YearRoller({ year }: { year: number }) {
  return (
    <span aria-hidden="true" className="flex h-[1em] overflow-hidden leading-none tabular">
      {String(year)
        .split('')
        .map((digit, i) => (
          <span
            key={i}
            className="flex flex-col transition-transform duration-[1.1s] ease-[var(--ease-expo)]"
            style={{ transform: `translateY(${-Number(digit)}em)`, transitionDelay: `${i * 60}ms` }}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className={cx('h-[1em]', CHROME)}>
                {n}
              </span>
            ))}
          </span>
        ))}
    </span>
  );
}

export default function Journey() {
  const { t } = useLanguage();
  const { scrollTo } = useSmoothScroll();
  const [year, setYear] = useState(YEARS[0]);
  const groups = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setYear(Number((entry.target as HTMLElement).dataset.year));
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    groups.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="journey" aria-labelledby="journey-title" className="px-[var(--gutter)] py-[clamp(6rem,14vh,10rem)]">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading
          id="journey-title"
          label={t.journey.label}
          title={t.journey.title}
          aside={
            <p className="text-sm text-fg-3">
              <span className="tabular text-fg">{MILESTONES.length}</span> {t.journey.milestonesLabel}
            </p>
          }
        />

        <div className="mt-16 lg:mt-24 lg:grid lg:grid-cols-12 lg:gap-8">
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-[20vh]">
              <p className="text-[clamp(6rem,10.5vw,11rem)] tracking-[-0.06em]">
                <YearRoller year={year} />
              </p>
              <nav aria-label={t.journey.jump} className="mt-8">
                <ul className="flex gap-1">
                  {YEARS.map((y) => (
                    <li key={y}>
                      <button
                        type="button"
                        aria-current={y === year ? 'true' : undefined}
                        onClick={() => scrollTo(`#year-${y}`, { offset: -window.innerHeight * 0.2 })}
                        className={cx(
                          'rounded-full border px-4 py-2 text-xs tabular transition-colors duration-300',
                          y === year ? 'border-paper bg-paper text-ink' : 'border-line text-fg-3 hover:text-fg',
                        )}
                      >
                        {y}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          <div className="lg:col-span-8">
            {YEARS.map((y, gi) => (
              <div
                key={y}
                id={`year-${y}`}
                data-year={y}
                ref={(el) => {
                  groups.current[gi] = el;
                }}
                className="pb-14 last:pb-0 lg:pb-16"
              >
                <h3 className={cx('mb-5 text-[clamp(3.5rem,16vw,6rem)] leading-none tracking-[-0.06em] tabular lg:sr-only', CHROME)}>{y}</h3>
                <ol className="grid gap-3">
                  {MILESTONES.filter((m) => m.year === y).map((m) => {
                    const copy = t.journey.items[m.id as keyof typeof t.journey.items];
                    return (
                      <FadeIn key={m.id} as="li">
                        <HoloCard className="rounded-[clamp(1rem,1.4vw,1.25rem)] bg-ink-2">
                          <article className="p-[clamp(1.5rem,2.8vw,2.5rem)]">
                            <header className="flex items-center justify-between gap-4 text-sm">
                              <p className="text-fg-2 tabular">
                                {t.journey.months[m.month - 1]} {m.year}
                              </p>
                              <p className="label flex items-center gap-2">
                                <span aria-hidden="true" className={cx('size-1.5 rounded-full', DOTS[m.type])} />
                                {t.journey.types[m.type]}
                              </p>
                            </header>
                            <h4 className="mt-[clamp(1.75rem,3.5vw,3rem)] max-w-[22ch] text-[clamp(1.6rem,2.8vw,2.6rem)] leading-[1.05] tracking-[-0.035em]">
                              {copy.title}
                            </h4>
                            <p className="mt-2 text-sm text-fg-3">{copy.org}</p>
                            {copy.detail && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-fg-2">{copy.detail}</p>}
                            {m.links && m.links.length > 0 && (
                              <ul className="relative z-[1] mt-5 flex flex-wrap gap-x-6 gap-y-2">
                                {m.links.map((href, li) => {
                                  // Certificates open their own page through the curtain; other links open in a new tab.
                                  const cert = certificateAt(href);
                                  const link = { href, className: 'group/link inline-flex items-center gap-1.5 text-sm font-medium' };
                                  const children = (
                                    <>
                                      <span className="link-line">{copy.links[li] ?? new URL(href).hostname}</span>
                                      <ArrowUpRight
                                        aria-hidden="true"
                                        className="size-3.5 transition-transform duration-500 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                                      />
                                    </>
                                  );
                                  return (
                                    <li key={href}>
                                      {cert ? (
                                        <PageLink {...link} label={describeCertificate(cert, t).name}>
                                          {children}
                                        </PageLink>
                                      ) : (
                                        <a {...link} target="_blank" rel="noopener noreferrer">
                                          {children}
                                        </a>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </article>
                        </HoloCard>
                      </FadeIn>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
