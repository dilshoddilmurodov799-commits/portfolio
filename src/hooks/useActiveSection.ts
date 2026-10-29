import { useEffect, useState } from 'react';
import { SECTION_IDS } from '../content/data';
import type { SectionId } from '../content/data';

/** Tracks which primary section crosses the middle of the viewport. */
export function useActiveSection() {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));
        const current = SECTION_IDS.find((id) => visible.get(id)) ?? null;
        setActive(current);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return active;
}
