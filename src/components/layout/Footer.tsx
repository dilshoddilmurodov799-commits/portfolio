import { useLayoutEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { SOCIALS } from '../../content/data';
import { useLocalTime } from '../../hooks/useLocalTime';
import DecryptedText from '../reactbits/DecryptedText';
import VariableProximity from '../reactbits/VariableProximity';
import LanguageSwitch from './LanguageSwitch';

const external = (href: string) => (href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {});
const WORDMARK = 'Dilshod Dilmurodov';
/** Rest weight of the wordmark; letters swell from here toward the pointer. */
const REST = 300;

/** Font size that makes the wordmark span its box exactly, measured at the rest weight. */
function useFitSize() {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);
  useLayoutEffect(() => {
    const el = box.current;
    const ctx = document.createElement('canvas').getContext('2d');
    if (!el || !ctx) return;
    const measure = () => {
      ctx.font = `${REST} 100px "Geist Variable", sans-serif`;
      if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-5px';
      setSize((el.clientWidth / ctx.measureText(WORDMARK).width) * 100 * 0.97);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, []);
  return { box, size };
}

export default function Footer() {
  const { t } = useLanguage();
  const time = useLocalTime();
  const { box, size } = useFitSize();

  return (
    <footer className="overflow-hidden bg-ink-2 px-[var(--gutter)] pt-[clamp(2rem,5vh,4rem)]">
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

      {/* Closing wordmark, cropped by the bottom edge; letters thicken toward the pointer. */}
      <div ref={box} className="mx-auto mt-[clamp(3rem,8vh,6rem)] max-w-[1400px]">
        <p
          className="translate-y-[14%] whitespace-nowrap leading-[0.8] tracking-[-0.05em] text-paper"
          style={size ? { fontSize: size } : { visibility: 'hidden' }}
        >
          <VariableProximity text={WORDMARK} containerRef={box} from={REST} to={850} radius={Math.max(160, size * 1.4)} />
        </p>
      </div>
    </footer>
  );
}
