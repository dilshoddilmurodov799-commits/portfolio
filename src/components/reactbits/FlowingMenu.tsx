// Adapted from ReactBits — FlowingMenu (https://reactbits.dev, MIT + Commons Clause).
// Hovering a row slides a band in from the edge the pointer crossed, carrying an endless
// marquee of that row's items; leaving sends it back out the way the pointer went.
// Without hover (touch screens) the rows take turns on their own while the list is on screen.
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
/** How long each row keeps its band when the rows take turns, in ms. */
const AUTO_HOLD = 3000;

/** Brings a row's band in from, or sends it out towards, an edge (-1 top, 1 bottom). */
function slide(band: HTMLDivElement | null, inner: HTMLDivElement | null, from: number, into: boolean) {
  const tl = gsap.timeline({ defaults: { duration: 0.6, ease: 'expo.out', overwrite: 'auto' } });
  if (into) tl.set(band, { yPercent: 101 * from }, 0).set(inner, { yPercent: -101 * from }, 0);
  tl.to(band, { yPercent: into ? 0 : 101 * from }, 0).to(inner, { yPercent: into ? 0 : -101 * from }, 0);
}

/** `active` set means the list drives this row (no hover): true stands in for the pointer being over it. */
function Row({ item, active }: { item: FlowingItem; active?: boolean }) {
  const row = useRef<HTMLLIElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const half = Array.from({ length: Math.ceil(MIN_PER_HALF / item.items.length) }, () => item.items).flat();

  useLayoutEffect(() => {
    gsap.set(band.current, { yPercent: 101 });
    gsap.set(inner.current, { yPercent: -101 });
  }, []);

  // Driven rows sweep downward: in from the top, out through the bottom, like a pointer moving down the list.
  useEffect(() => {
    if (active !== undefined) slide(band.current, inner.current, active ? -1 : 1, active);
  }, [active]);

  const edge = (e: PointerEvent<HTMLLIElement>) => {
    const r = row.current!.getBoundingClientRect();
    return e.clientY - r.top < r.height / 2 ? -1 : 1;
  };
  const hover =
    active === undefined && {
      onPointerEnter: (e: PointerEvent<HTMLLIElement>) => slide(band.current, inner.current, edge(e), true),
      onPointerLeave: (e: PointerEvent<HTMLLIElement>) => slide(band.current, inner.current, edge(e), false),
    };

  return (
    <li ref={row} className="relative overflow-hidden border-t border-line" {...hover}>
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
          <div className="flowing-marquee flex h-full w-max items-center text-[clamp(2rem,4vw,3.75rem)] leading-none tracking-[-0.04em]" style={{ animationDuration: `${half.length * 2.2}s`, animationPlayState: active === false ? 'paused' : undefined }}>
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

/** `auto`: no hover to wait for — while the list is on screen, its rows take turns as if hovered, on a loop. */
export default function FlowingMenu({ items, auto = false }: { items: FlowingItem[]; auto?: boolean }) {
  const list = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(-1);

  useEffect(() => {
    const el = list.current;
    if (!auto || !el) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(timer);
        if (!entry.isIntersecting) {
          setCurrent(-1);
          return;
        }
        setCurrent((i) => Math.max(i, 0));
        timer = window.setInterval(() => setCurrent((i) => (i + 1) % items.length), AUTO_HOLD);
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [auto, items.length]);

  return (
    <ul ref={list} className="border-b border-line">
      {items.map((item, i) => (
        <Row key={item.id} item={item} active={auto ? i === current : undefined} />
      ))}
    </ul>
  );
}
