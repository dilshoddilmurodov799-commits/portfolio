import { motion } from 'motion/react';
import { LOCALES, useLanguage } from '../../contexts/LanguageContext';
import { cx } from '../../lib/cx';

/** Locale picker for dark surfaces (menu and footer). */
export default function LanguageSwitch({ id, className }: { id: string; className?: string }) {
  const { locale, setLocale, t } = useLanguage();
  return (
    <div role="group" aria-label={t.nav.language} className={cx('relative flex rounded-full border border-line p-1', className)}>
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => setLocale(code)}
            className="relative rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em]"
          >
            {active && (
              <motion.span
                layoutId={`lang-${id}`}
                className="absolute inset-0 rounded-full bg-paper"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className={cx('relative transition-colors duration-300', active ? 'text-ink' : 'text-fg-2 hover:text-fg')}>{code}</span>
          </button>
        );
      })}
    </div>
  );
}
