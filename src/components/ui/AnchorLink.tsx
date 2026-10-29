import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { SECTION_IDS } from '../../content/data';
import type { SectionId } from '../../content/data';
import { useSmoothScroll } from '../../providers/SmoothScroll';
import { useCurtain } from '../../providers/Curtain';

interface AnchorLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  onNavigate?: () => void;
  /** Travel behind the curtain, announcing the section by name, instead of scrolling there. */
  curtain?: boolean;
}

const isSection = (id: string): id is SectionId => (SECTION_IDS as readonly string[]).includes(id);

/** In-page link that routes through the smooth scroller (or the curtain) and keeps native href semantics. */
export default function AnchorLink({ to, onNavigate, curtain, onClick, children, ...rest }: AnchorLinkProps) {
  const { t } = useLanguage();
  const { scrollTo } = useSmoothScroll();
  const { navigate } = useCurtain();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    onNavigate?.();
    const target = to === 'top' ? 0 : `#${to}`;
    if (curtain) navigate(target, to === 'top' ? t.nav.homeLink : isSection(to) ? t.nav[to] : to);
    else scrollTo(target);
  };

  return (
    <a href={to === 'top' ? '#home' : `#${to}`} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
