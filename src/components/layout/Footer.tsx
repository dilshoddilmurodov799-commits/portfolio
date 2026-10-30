import { useLanguage } from '../../contexts/LanguageContext';
import { SOCIALS } from '../../content/data';
import { useLocalTime } from '../../hooks/useLocalTime';
import DecryptedText from '../reactbits/DecryptedText';
import LanguageSwitch from './LanguageSwitch';

const external = (href: string) => (href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {});

export default function Footer() {
  const { t } = useLanguage();
  const time = useLocalTime();

  return (
    <footer className="bg-ink-2 px-[var(--gutter)] py-[clamp(2rem,5vh,4rem)]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex gap-[clamp(2rem,4vw,3.5rem)]">
          <div>
            <p className="label">{t.contact.version}</p>
            <p className="mt-3 text-sm">
              {new Date().getFullYear()} {t.contact.edition}
            </p>
          </div>
          <div>
            <p className="label">{t.hero.localTime}</p>
            <p className="mt-3 text-sm tabular">{time} GMT+5</p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-[clamp(2rem,4vw,3.5rem)]">
          <div>
            <p className="label">{t.nav.socials}</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="link-line" {...external(s.href)}>
                    <DecryptedText text={s.label} animateOn="hover" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <LanguageSwitch id="footer" />
        </div>
      </div>
    </footer>
  );
}
