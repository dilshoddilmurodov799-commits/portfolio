// Adapted from ReactBits — FlowingMenu (https://reactbits.dev, MIT + Commons Clause).
// Hovering a row slides a band in from the edge the pointer crossed, carrying an endless
// marquee of that row's items; leaving sends it back out the way the pointer went.
import { Fragment, useLayoutEffect, useRef } from 'react';
import type { PointerEvent } from 'react';
import { gsap } from '../../lib/gsap';
import Asterisk from '../ui/Asterisk';

export interface FlowingItem {
  id: string;
  index: string;
  title: string;
  /** Short line shown at rest on the right of the row. */
  meta: string;
  items: string[];
}

/** Each half of the marquee repeats the items until it is comfortably wider than the row. */
const MIN_PER_HALF = 8;

function Row({ item }: { item: FlowingItem }) {
  const row = useRef<HTMLLIElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const half = Array.from({ length: Math.ceil(MIN_PER_HALF / item.items.length) }, () => item.items).flat();

  useLayoutEffect(() => {
    gsap.set(band.current, { yPercent: 101 });
    gsap.set(inner.current, { yPercent: -101 });
  }, []);

  const edge = (e: PointerEvent<HTMLLIElement>) => {
    const r = row.current!.getBoundingClientRect();
    return e.clientY - r.top < r.height / 2 ? -1 : 1;
  };
  const slide = (from: number, into: boolean) => {
    const tl = gsap.timeline({ defaults: { duration: 0.6, ease: 'expo.out', overwrite: 'auto' } });
    if (into) tl.set(band.current, { yPercent: 101 * from }, 0).set(inner.current, { yPercent: -101 * from }, 0);
    tl.to(band.current, { yPercent: into ? 0 : 101 * from }, 0).to(inner.current, { yPercent: into ? 0 : -101 * from }, 0);
  };

  return (
    <li
      ref={row}
      className="relative overflow-hidden border-t border-line"
      onPointerEnter={(e) => slide(edge(e), true)}
      onPointerLeave={(e) => slide(edge(e), false)}
    >
      <div className="flex items-center justify-between gap-8 px-[clamp(1rem,5vw,6.25rem)] py-[clamp(2.25rem,4.2vw,3.5rem)]">
        <div className="flex items-baseline gap-5">
          <span className="text-sm text-fg-3 tabular">{item.index}</span>
          <h3 className="text-[clamp(2rem,4vw,3.75rem)] leading-none tracking-[-0.04em]">{item.title}</h3>
        </div>
        <p className="text-right text-[15px] text-fg-3">{item.meta}</p>
      </div>
      <ul className="sr-only">
        {item.items.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>

      <div ref={band} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-accent text-ink">
        <div ref={inner} className="h-full">
          <div className="flowing-marquee flex h-full w-max items-center text-[clamp(2rem,4vw,3.75rem)] leading-none tracking-[-0.04em]" style={{ animationDuration: `${half.length * 2.2}s` }}>
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center">
                {half.map((label, i) => (
                  <Fragment key={i}>
                    <span className="whitespace-nowrap">{label}</span>
                    <Asterisk className="mx-[0.45em] size-[0.42em] shrink-0" />
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function FlowingMenu({ items }: { items: FlowingItem[] }) {
  return (
    <ul className="border-b border-line">
      {items.map((item) => (
        <Row key={item.id} item={item} />
      ))}
    </ul>
  );
}
