import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { EASE_QUART } from '../../lib/motion';
import { cx } from '../../lib/cx';
import RoundButton from '../ui/RoundButton';

interface MenuButtonProps {
  open: boolean;
  visible: boolean;
  onToggle: () => void;
}

/** Fixed round menu trigger: scales in below the fold, magnetic, and its two bars cross into an X. */
export default function MenuButton({ open, visible, onToggle }: MenuButtonProps) {
  const { t } = useLanguage();
  const bar = 'absolute left-0 h-px w-full bg-ink transition-all duration-500 ease-[var(--ease-expo)]';
  return (
    <motion.div
      className="fixed right-[var(--gutter)] top-[clamp(1rem,2.6vw,2.25rem)] z-[85]"
      initial={{ scale: 0 }}
      animate={{ scale: visible ? 1 : 0 }}
      transition={{ duration: 0.45, ease: EASE_QUART }}
    >
      <RoundButton
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? t.nav.close : t.nav.menu}
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        strength={0.4}
        className="size-[clamp(3.75rem,5.6vw,5rem)] bg-paper shadow-[0_12px_32px_-14px_rgb(0_0_0/0.8)]"
      >
        <span aria-hidden="true" className="relative block h-2.5 w-[clamp(1.25rem,1.9vw,1.6rem)]">
          <span className={cx(bar, open ? 'top-1/2 rotate-45' : 'top-0')} />
          <span className={cx(bar, open ? 'top-1/2 -rotate-45' : 'top-full')} />
        </span>
      </RoundButton>
    </motion.div>
  );
}
