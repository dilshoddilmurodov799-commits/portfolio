import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { SECTION_IDS, SOCIALS } from '../../content/data';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useDialog } from '../../hooks/useDialog';
import { EASE_QUART } from '../../lib/motion';
import AnchorLink from '../ui/AnchorLink';
import Magnetic from '../ui/Magnetic';
import DecryptedText from '../reactbits/DecryptedText';
import { cx } from '../../lib/cx';
import LanguageSwitch from './LanguageSwitch';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const LINKS = ['home', ...SECTION_IDS] as const;

const slide = {
  initial: { x: 80 },
  enter: (i: number) => ({ x: 0, transition: { duration: 0.8, ease: EASE_QUART, delay: 0.05 * i } }),
  exit: (i: number) => ({ x: 80, transition: { duration: 0.8, ease: EASE_QUART, delay: 0.05 * i } }),
};

/** The panel's left edge bows outward while it travels, then settles flat. */
function Curve() {
  const [h] = useState(() => window.innerHeight);
  const bowed = `M100 0 L100 ${h} Q-100 ${h / 2} 100 0`;
  const flat = `M100 0 L100 ${h} Q100 ${h / 2} 100 0`;
  return (
    <svg aria-hidden="true" className="absolute left-[-99px] top-0 h-full w-[100px] fill-ink-2">
      <motion.path
        initial={{ d: bowed }}
        animate={{ d: flat, transition: { duration: 1, ease: EASE_QUART } }}
        exit={{ d: bowed, transition: { duration: 0.8, ease: EASE_QUART } }}
      />
    </svg>
  );
}

function Panel({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const active = useActiveSection() ?? 'home';
  const [hovered, setHovered] = useState<string | null>(null);
  useDialog(ref, true, onClose);

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 z-[70] bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        onClick={onClose}
      />
      <motion.aside
        ref={ref}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.navigation}
        className="fixed right-0 top-0 z-[71] h-[100dvh] w-full bg-ink-2 sm:w-[min(540px,100vw)]"
        initial={{ x: 'calc(100% + 100px)' }}
        animate={{ x: '0%' }}
        exit={{ x: 'calc(100% + 100px)' }}
        transition={{ duration: 0.8, ease: EASE_QUART }}
      >
        <Curve />
        <div
          data-lenis-prevent=""
          className="flex h-full flex-col justify-between gap-12 overflow-y-auto px-[clamp(2.5rem,7vw,6.25rem)] pb-10 pt-[clamp(6.5rem,15vh,10rem)]"
        >
          <nav aria-label={t.nav.navigation}>
            <p className="label border-b border-line pb-6">{t.nav.navigation}</p>
            <ul className="mt-8" onPointerLeave={() => setHovered(null)}>
              {LINKS.map((id, i) => {
                const current = (hovered ?? active) === id;
                return (
                  <motion.li
                    key={id}
                    custom={i}
                    variants={slide}
                    initial="initial"
                    animate="enter"
                    exit="exit"
                    onPointerEnter={() => setHovered(id)}
                    className="relative flex items-center"
                  >
                    <motion.span
                      aria-hidden="true"
                      className="absolute -left-7 size-2.5 rounded-full bg-accent"
                      initial={{ scale: 0 }}
                      animate={{ scale: current ? 1 : 0 }}
                      transition={{ duration: 0.4, ease: EASE_QUART }}
                    />
                    <AnchorLink
                      to={id === 'home' ? 'top' : id}
                      curtain
                      onNavigate={onClose}
                      data-autofocus={i === 0 ? '' : undefined}
                      aria-current={active === id ? 'location' : undefined}
                      // Contact is set in the accent so it stands out from the other destinations.
                      className={cx(
                        'flex items-start gap-3 py-1 text-[clamp(2.4rem,5vw,3.75rem)] leading-[1.15] tracking-[-0.04em]',
                        id === 'contact' && 'text-accent',
                      )}
                    >
                      {id === 'home' ? t.nav.homeLink : t.nav[id]}
                      <span aria-hidden="true" className={cx('pt-[0.35em] text-xs tracking-normal tabular', id === 'contact' ? 'text-accent' : 'text-fg-3')}>
                        0{i + 1}
                      </span>
                    </AnchorLink>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          <motion.div
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.45 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <div>
              <p className="label">{t.nav.socials}</p>
              <ul className="mt-4 flex flex-wrap gap-x-7 gap-y-3 text-sm">
                {SOCIALS.map((s) => (
                  <li key={s.label}>
                    <Magnetic strength={0.4}>
                      <a href={s.href} className="link-line" {...(s.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                        <DecryptedText text={s.label} animateOn="hover" />
                      </a>
                    </Magnetic>
                  </li>
                ))}
              </ul>
            </div>
            <LanguageSwitch id="menu" className="w-fit" />
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
}

/** Slide-in navigation drawer; choosing a destination hands over to the curtain. */
export default function Sidebar({ open, onClose }: SidebarProps) {
  return <AnimatePresence mode="wait">{open && <Panel key="menu" onClose={onClose} />}</AnimatePresence>;
}
