import { useLayoutEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HIGHLIGHTS, WORK } from '../../content/data';
import { gsap } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import ProjectArt from '../work/ProjectArt';

const card = 'relative ring-1 ring-inset ring-white/[0.06] aspect-[4/3] w-[clamp(15rem,26vw,26rem)] shrink-0 overflow-hidden rounded-[clamp(0.6rem,1vw,1rem)] md:aspect-[16/10]';

/**
 * Two rows of cards drift in opposite directions as the page scrolls past, then the black
 * page closes over the raised contact section with a shrinking curved edge.
 */
export default function Gallery() {
  const { t } = useLanguage();
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      const scrollTrigger = { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true };
      const travel = () => window.innerWidth * 0.1;
      gsap.fromTo('[data-row="0"]', { x: 0 }, { x: travel, ease: 'none', scrollTrigger });
      gsap.fromTo('[data-row="1"]', { x: 0 }, { x: () => -travel(), ease: 'none', scrollTrigger });
      gsap.fromTo(
        '[data-curve]',
        { scaleY: 1 },
        { scaleY: 0, ease: 'none', scrollTrigger: { trigger: '[data-curve-anchor]', start: 'top bottom', end: '+=90%', scrub: true } },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} aria-label={t.work.highlights} className="relative overflow-x-clip bg-ink pb-[clamp(5rem,12vh,9rem)] pt-[clamp(2rem,5vh,4rem)]">
      <div className="overflow-x-clip">
        <ul data-row="0" className="-ml-[12vw] flex w-max gap-[clamp(0.75rem,2vw,2rem)]">
          {[...WORK, ...WORK].map((item, i) => (
            <li key={i} className={card} style={{ background: item.color }}>
              <ProjectArt kind={item.visual} />
              <span className="sr-only">{t.work.items[item.id].title}</span>
            </li>
          ))}
        </ul>
        <ul data-row="1" className="-ml-[30vw] mt-[clamp(0.75rem,2vw,2rem)] flex w-max gap-[clamp(0.75rem,2vw,2rem)]">
          {[...HIGHLIGHTS, ...HIGHLIGHTS].map((item, i) => {
            const copy = t.journey.items[item.id];
            return (
              <li
                key={i}
                className={`${card} flex flex-col justify-between p-[clamp(1.25rem,2.4vw,2.25rem)] ${item.dark ? 'text-paper' : 'text-ink'}`}
                style={{ background: item.color }}
              >
                <span className={`text-sm ${item.dark ? 'text-paper/55' : 'text-ink/60'}`}>{copy.org}</span>
                <span className="text-[clamp(1.6rem,2.8vw,2.75rem)] leading-[1.05] tracking-[-0.04em]">{copy.title}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* The page bows down over the contact section and pulls back as it scrolls in. */}
      <div data-curve-anchor="" aria-hidden="true" className="absolute inset-x-0 bottom-0 z-[1] h-0">
        <div
          data-curve=""
          className="absolute -top-px left-[-10%] h-[clamp(8rem,32vw,34rem)] w-[120%] origin-top rounded-b-[50%] border-b border-line bg-ink shadow-[0_60px_50px_-20px_rgb(0_0_0/0.7)]"
        />
      </div>
    </section>
  );
}
