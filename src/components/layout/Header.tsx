import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { SECTION_IDS } from '../../content/data';
import { useActiveSection } from '../../hooks/useActiveSection';
import { EASE_EXPO } from '../../lib/motion';
import { cx } from '../../lib/cx';
import AnchorLink from '../ui/AnchorLink';
import Asterisk from '../ui/Asterisk';
import Magnetic from '../ui/Magnetic';
import RollText from '../ui/RollText';

// Contact stands out from the other links as a filled accent pill.
const contactPill = 'rounded-full bg-accent text-ink transition-colors duration-300 hover:bg-paper';

/** Hero header: scrolls away with the page; the round menu button takes over below the fold. */
export default function Header({ ready, onMenu }: { ready: boolean; onMenu: () => void }) {
  const { t } = useLanguage();
  const active = useActiveSection();

  return (
    <motion.header
      className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-[var(--gutter)] pt-[clamp(1rem,2.6vw,2.25rem)] text-[15px] font-medium"
      initial={{ opacity: 0, y: -16 }}
      animate={ready ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1, ease: EASE_EXPO, delay: 0.5 }}
    >
      <AnchorLink to="top" aria-label={t.nav.home} className="group flex items-center gap-2.5 py-2">
        <Asterisk className="size-4 text-accent transition-transform duration-700 ease-[var(--ease-quart)] group-hover:rotate-180" />
        <RollText>Dilshod Dilmurodov</RollText>
      </AnchorLink>

      <nav aria-label={t.nav.navigation} className="hidden md:block">
        <ul className="flex items-center">
          {SECTION_IDS.map((id) => (
            <li key={id}>
              <Magnetic strength={0.4}>
                <AnchorLink
                  to={id}
                  curtain
                  aria-current={active === id ? 'location' : undefined}
                  className={cx(
                    'flex items-center gap-2 py-3',
                    id === 'contact' ? cx('ml-2 px-5', contactPill) : 'px-[clamp(0.6rem,1.1vw,1rem)]',
                  )}
                >
                  {id !== 'contact' && (
                    <span
                      aria-hidden="true"
                      className={cx('size-[5px] rounded-full bg-accent transition-transform duration-300', active === id ? 'scale-100' : 'scale-0')}
                    />
                  )}
                  <RollText>{t.nav[id]}</RollText>
                </AnchorLink>
              </Magnetic>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-3 max-[380px]:gap-2 md:hidden">
        <AnchorLink to="contact" curtain className={cx('px-4 py-2 text-sm max-[380px]:px-3', contactPill)}>
          {t.nav.contact}
        </AnchorLink>
        <button type="button" onClick={onMenu} aria-controls="site-menu" className="group flex items-center gap-2 py-3">
          <span aria-hidden="true" className="size-[5px] rounded-full bg-accent transition-transform duration-300 group-hover:scale-150 max-[380px]:hidden" />
          {t.nav.menuText}
        </button>
      </div>
    </motion.header>
  );
}
