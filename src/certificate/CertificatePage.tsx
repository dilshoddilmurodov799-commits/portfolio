import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CERTIFICATES, certificatePath } from '../content/data';
import type { Certificate } from '../content/data';
import { describeCertificate } from '../content/certificates';
import { useLeaveClick } from '../hooks/useLeaveClick';
import { EASE_EXPO } from '../lib/motion';
import Asterisk from '../components/ui/Asterisk';
import PageLink from '../components/ui/PageLink';
import RoundButton from '../components/ui/RoundButton';
import SplitText from '../components/reactbits/SplitText';

/** Back on the main site, ?curtain=journey makes its opening scene announce the section. */
const JOURNEY = '/?curtain=journey#journey';
const pad = (n: number) => String(n).padStart(2, '0');
// Same frame and outline buttons as a project's case study (components/work/CaseStudy.tsx).
const frame = 'relative overflow-hidden rounded-[clamp(1rem,1.6vw,1.5rem)] ring-1 ring-inset ring-white/[0.06]';
const outline = 'h-12 border border-line px-5 text-sm transition-colors duration-300 hover:text-ink focus-visible:text-ink';
const wide = 'mx-auto max-w-[calc(1400px_+_2*var(--gutter))] px-[var(--gutter)]';

/** One certificate, laid out like a project's case study: the curtain opens onto it and leaves for the next. */
export default function CertificatePage({ cert }: { cert?: Certificate }) {
  const { t } = useLanguage();
  const back = useLeaveClick(JOURNEY, t.nav.journey);
  const index = cert ? CERTIFICATES.indexOf(cert) : -1;
  const info = cert && describeCertificate(cert, t);
  const next = CERTIFICATES[(index + 1) % CERTIFICATES.length];
  const nextName = describeCertificate(next, t).name;

  useEffect(() => {
    document.title = `${info?.name ?? t.certificate.label} — Dilshod Dilmurodov`;
  }, [info?.name, t]);

  const meta = info
    ? [
        { k: t.certificate.issuer, v: info.org },
        { k: t.certificate.date, v: info.date },
        ...(info.detail ? [{ k: t.certificate.result, v: info.detail }] : []),
      ]
    : [];

  return (
    <div className="min-h-svh bg-ink">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-ink from-40% to-transparent px-[var(--gutter)] pb-8 pt-[clamp(1rem,2.6vw,2rem)]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <RoundButton href={JOURNEY} onClick={back} className={outline}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            {t.certificate.back}
          </RoundButton>
          {cert && (
            <p className="text-sm text-fg-3 tabular">
              <span className="text-fg">{pad(index + 1)}</span> / {pad(CERTIFICATES.length)}
            </p>
          )}
        </div>
      </div>

      <header className="px-[var(--gutter)] pt-[clamp(2rem,8vh,6rem)]">
        <div className="mx-auto max-w-[1400px]">
          <p className="label flex items-center gap-2">
            <Asterisk className="size-3 text-accent" />
            {t.certificate.label}
          </p>
          <SplitText
            as="h1"
            text={info?.name ?? t.certificate.missing}
            className="mt-6 max-w-[14ch] text-[clamp(3rem,9vw,9.5rem)] leading-[0.95] tracking-[-0.05em]"
          />
          {meta.length > 0 && (
            <dl className="mt-[clamp(3rem,8vh,5rem)] grid gap-8 border-t border-line pt-8 sm:grid-cols-3">
              {meta.map((m) => (
                <div key={m.k}>
                  <dt className="label">{m.k}</dt>
                  <dd className="mt-3 text-[15px]">{m.v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      {/* Main preview. Unlike a project there is no cropped "closer look": it would cut text and enlarge personal details. */}
      {cert && info && (
        <>
          <motion.div
            className={`${wide} mt-[clamp(3rem,8vh,5rem)]`}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, ease: EASE_EXPO, delay: 0.55 }}
          >
            <a
              href={cert.image}
              target="_blank"
              rel="noopener"
              aria-label={t.certificate.full}
              className={`${frame} flex justify-center bg-ink-3 p-[clamp(1rem,4vw,4rem)]`}
            >
              <img
                src={cert.image}
                width={cert.width}
                height={cert.height}
                alt={`${info.name} — ${info.org}`}
                fetchPriority="high"
                decoding="async"
                className="h-auto max-h-[75svh] w-auto max-w-full rounded-lg"
              />
            </a>
            <div className="mt-6 flex flex-wrap gap-3">
              <RoundButton href={cert.image} target="_blank" rel="noopener" className={outline}>
                {t.certificate.full}
              </RoundButton>
            </div>
          </motion.div>
        </>
      )}

      {/* Next certificate */}
      <PageLink
        href={certificatePath(next.id)}
        label={nextName}
        className="group mt-[clamp(5rem,14vh,9rem)] block w-full border-t border-line px-[var(--gutter)] py-[clamp(4rem,12vh,8rem)] text-left"
      >
        <span className="mx-auto block max-w-[1400px]">
          <span className="label block">{t.certificate.next}</span>
          <span className="mt-6 flex items-center justify-between gap-6 text-[clamp(2.5rem,7vw,7rem)] leading-none tracking-[-0.045em]">
            <span className="transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-x-4">{nextName}</span>
            <ArrowUpRight
              aria-hidden="true"
              strokeWidth={1.25}
              className="size-[0.7em] shrink-0 text-accent transition-transform duration-700 ease-[var(--ease-expo)] group-hover:rotate-45"
            />
          </span>
        </span>
      </PageLink>
    </div>
  );
}
