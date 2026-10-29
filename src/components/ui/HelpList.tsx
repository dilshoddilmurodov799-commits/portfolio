import { useLanguage } from '../../contexts/LanguageContext';
import Asterisk from './Asterisk';

/** What visitors can get in touch about, bulleted with accent asterisks. */
export default function HelpList({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <ul className={className}>
      {t.contact.help.items.map((item) => (
        <li key={item} className="flex items-center gap-2.5">
          <Asterisk className="size-[0.7em] shrink-0 text-accent" />
          {item}
        </li>
      ))}
    </ul>
  );
}
