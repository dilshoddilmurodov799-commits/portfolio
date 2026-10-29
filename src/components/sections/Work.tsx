import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WORK } from '../../content/data';
import { ScrollTrigger } from '../../lib/gsap';
import { useDesktop, useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery';
import { useCurtain } from '../../providers/Curtain';
import SectionHeading from '../ui/SectionHeading';
import RoundButton from '../ui/RoundButton';
import Archive from '../work/Archive';
import CaseStudy from '../work/CaseStudy';
import ProjectGrid from '../work/ProjectGrid';
import ViewToggle from '../work/ViewToggle';
import type { View } from '../work/ViewToggle';
import WorkPreview from '../work/WorkPreview';
import { localizeWork } from '../work/localize';

/** What is open over the page: the all-projects screen and/or one project. */
interface Route {
  archive: boolean;
  project: number | null;
}

const ALL = WORK.map((_, i) => i);
const indexOf = (id: string) => {
  const i = WORK.findIndex((w) => w.id === id);
  return i < 0 ? null : i;
};

/**
 * Addresses: #work/<id> is a project opened from this section, #projects the all-projects
 * screen, #projects/<id> a project opened from it — so links can be shared and Back retraces.
 */
function parseHash(): Route {
  const hash = window.location.hash;
  const archive = hash.match(/^#projects(?:\/(.+))?$/);
  if (archive) return { archive: true, project: archive[1] ? indexOf(archive[1]) : null };
  const work = hash.match(/^#work\/(.+)$/);
  return { archive: false, project: work ? indexOf(work[1]) : null };
}
const hashOf = ({ archive, project }: Route) =>
  project !== null ? `${archive ? '#projects' : '#work'}/${WORK[project].id}` : archive ? '#projects' : '#work';
/** How many of our own entries sit beneath the current one in this tab's history. */
const depth = () => (window.history.state as { depth?: number } | null)?.depth ?? 0;

export default function Work() {
  const { t } = useLanguage();
  const fine = useFinePointer();
  const desktop = useDesktop();
  const reduced = useReducedMotion();
  const { navigate } = useCurtain();
  const [chosen, setChosen] = useState<View>('list');
  const [hover, setHover] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  const [route, setRoute] = useState<Route>(parseHash);

  const label = useCallback(
    (r: Route) => (r.project !== null ? t.work.items[WORK[r.project].id].title : r.archive ? t.work.archiveTitle : t.nav.work),
    [t],
  );

  /** Moves to `next` behind the curtain; `push` adds a history entry so Back comes here again. */
  const go = useCallback(
    (next: Route, push: boolean) =>
      navigate(() => {
        setRoute(next);
        if (push) window.history.pushState({ depth: depth() + 1 }, '', hashOf(next));
        else window.history.replaceState({ depth: depth() }, '', hashOf(next));
      }, label(next)),
    [navigate, label],
  );

  const openProject = (i: number) => go({ ...route, project: i }, true);
  const nextProject = () => go({ ...route, project: ((route.project ?? 0) + 1) % WORK.length }, false);
  const close = useCallback(() => {
    // Our own entry is on top: going back retraces it (popstate runs the curtain).
    if (depth() > 0) return window.history.back();
    go(route.project !== null ? { ...route, project: null } : { archive: false, project: null }, false);
  }, [go, route]);

  // Browser back/forward: follow the address, through the curtain.
  useEffect(() => {
    const onPop = () => {
      const next = parseHash();
      navigate(() => setRoute(next), label(next));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [navigate, label]);

  // The hover list needs a mouse and room; touch and small screens always get the grid.
  const canList = fine && desktop;
  const view = canList ? chosen : 'grid';
  const point = (i: number | null) => {
    setHover(i);
    if (i !== null) setShown(i);
  };

  // Switching views changes the page height: let every trigger below re-measure.
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [view]);

  return (
    <section id="work" aria-labelledby="work-title" className="relative px-[var(--gutter)] pb-[clamp(6rem,14vh,10rem)] pt-[clamp(4rem,10vh,7rem)]">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading id="work-title" label={t.work.label} title={t.work.title} aside={canList && <ViewToggle view={view} onChange={setChosen} />} />

        <div className="mt-[clamp(3rem,8vh,6rem)]">
          {view === 'list' ? (
            <ul className="border-b border-line" onPointerLeave={() => point(null)}>
              {WORK.map((item, i) => {
                const { copy, period } = localizeWork(item, t);
                return (
                  <li key={item.id} className="border-t border-line">
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => openProject(i)}
                      onPointerEnter={() => point(i)}
                      onFocus={() => point(i)}
                      onBlur={() => point(null)}
                      className="group flex w-full items-center justify-between gap-8 px-[clamp(1rem,5vw,6.25rem)] py-[clamp(2.75rem,5vw,4.25rem)] text-left"
                    >
                      <span className="text-[clamp(2.5rem,5.2vw,5.5rem)] leading-[1.05] tracking-[-0.045em] transition-[translate,color] duration-500 ease-[var(--ease-expo)] group-hover:-translate-x-2.5 group-hover:text-fg-3">
                        {copy.title}
                      </span>
                      <span className="shrink-0 text-right text-[15px] transition-[translate] duration-500 ease-[var(--ease-expo)] group-hover:translate-x-2.5">
                        <span className="block">{copy.category}</span>
                        <span className="mt-1 block text-fg-3 tabular">{period}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ProjectGrid items={ALL} onOpen={openProject} onHover={point} />
          )}
        </div>

        <div className="mt-[clamp(3.5rem,9vh,6rem)] flex justify-center">
          <RoundButton
            onClick={() => go({ archive: true, project: null }, true)}
            aria-haspopup="dialog"
            className="h-[clamp(4rem,6vw,5.25rem)] border border-line px-[clamp(2rem,4vw,3.25rem)] text-[15px] transition-colors duration-300 hover:text-ink focus-visible:text-ink"
          >
            {t.work.seeAll}
            <sup className="text-[10px] tabular">{WORK.length}</sup>
          </RoundButton>
        </div>
      </div>

      {fine && !reduced && (
        <WorkPreview active={hover !== null && !route.archive && route.project === null} index={shown} modal={view === 'list'} label={t.work.view} />
      )}
      <Archive open={route.archive} covered={route.project !== null} onClose={close} onOpen={openProject} />
      <CaseStudy item={route.project === null ? null : WORK[route.project]} index={route.project ?? 0} onClose={close} onNext={nextProject} />
    </section>
  );
}
