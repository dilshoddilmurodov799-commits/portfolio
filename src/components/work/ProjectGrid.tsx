import { useLanguage } from '../../contexts/LanguageContext';
import { WORK } from '../../content/data';
import TiltedCard from '../reactbits/TiltedCard';
import ProjectArt from './ProjectArt';
import { localizeWork } from './localize';

interface ProjectGridProps {
  /** Indexes into WORK, in display order. */
  items: number[];
  onOpen: (index: number) => void;
  onHover: (index: number | null) => void;
}

/** Project cards — artwork that leans toward the pointer, then title, category and period. */
export default function ProjectGrid({ items, onOpen, onHover }: ProjectGridProps) {
  const { t } = useLanguage();
  return (
    <ul className="grid gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-[clamp(3.5rem,7vw,6rem)] md:grid-cols-2">
      {items.map((i) => {
        const item = WORK[i];
        const { copy, period } = localizeWork(item, t);
        return (
          <li key={item.id}>
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => onOpen(i)}
              onPointerEnter={() => onHover(i)}
              onPointerLeave={() => onHover(null)}
              className="group block w-full text-left"
            >
              <TiltedCard>
                <span
                  className="relative block aspect-[4/3] overflow-hidden rounded-[clamp(0.75rem,1.2vw,1.25rem)] ring-1 ring-inset ring-white/[0.06]"
                  style={{ background: item.color }}
                >
                  <ProjectArt kind={item.visual} />
                </span>
              </TiltedCard>
              <span className="mt-[clamp(1.5rem,2.5vw,2.25rem)] block text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.1] tracking-[-0.035em]">{copy.title}</span>
              <span className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-5 text-sm text-fg-2">
                <span>{copy.category}</span>
                <span className="tabular">{period}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
