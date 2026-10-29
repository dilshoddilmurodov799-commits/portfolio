import { useLanguage } from '../../contexts/LanguageContext';
import { MARQUEE_STACK } from '../../content/data';
import Asterisk from '../ui/Asterisk';
import ScrollVelocity from '../reactbits/ScrollVelocity';

/** A breath between chapters: two bands that answer the speed and direction of the scroll. */
export default function Marquee() {
  const { t } = useLanguage();
  const row = (items: readonly string[]) =>
    items.map((item) => (
      <span key={item} className="inline-flex items-center">
        {item}
        <Asterisk className="mx-[0.35em] size-[0.42em] text-accent" />
      </span>
    ));

  return (
    <section aria-label={t.marquee.join(', ')} className="overflow-hidden py-[clamp(3rem,8vh,6rem)]">
      <div aria-hidden="true">
        <ScrollVelocity
          rows={[row(t.marquee), row(MARQUEE_STACK)]}
          velocity={55}
          className="text-[clamp(3rem,8.5vw,8.5rem)] font-medium leading-[1.05] tracking-[-0.045em]"
        />
      </div>
    </section>
  );
}
