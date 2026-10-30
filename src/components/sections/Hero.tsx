import { useLayoutEffect, useRef } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { gsap } from '../../lib/gsap';
import { openContactForm } from '../../lib/contactForm';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import { useLocalTime } from '../../hooks/useLocalTime';
import { cx } from '../../lib/cx';
import AnchorLink from '../ui/AnchorLink';
import Asterisk from '../ui/Asterisk';
import Magnetic from '../ui/Magnetic';
import RollText from '../ui/RollText';
import CircularText from '../reactbits/CircularText';
import portrait480 from '../../assets/portrait-480.webp';
import portrait843 from '../../assets/portrait-843.webp';

const NAME = 'Dilshod Dilmurodov';

function BandCopy({ absolute }: { absolute?: boolean }) {
  return (
    <p data-copy="" className={absolute ? 'absolute left-full top-0 flex items-center' : 'flex items-center'}>
      {NAME}
      <Asterisk className="spin-slow mx-[0.28em] size-[0.5em] shrink-0 text-accent" />
    </p>
  );
}

/** The two ways onward: straight to a conversation, or to the proof first. */
function Actions({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <div className={cx('flex flex-wrap items-center gap-3', className)}>
      <Magnetic>
        <AnchorLink
          to="contact"
          curtain
          onNavigate={openContactForm}
          className="group flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-medium text-ink transition-colors duration-300 hover:bg-paper"
        >
          <RollText>{t.contact.cta}</RollText>
          <ArrowUpRight aria-hidden="true" strokeWidth={2} className="size-4 transition-transform duration-500 ease-[var(--ease-expo)] group-hover:rotate-45" />
        </AnchorLink>
      </Magnetic>
      <Magnetic>
        <AnchorLink
          to="work"
          curtain
          className="group flex items-center gap-2 rounded-full border border-fg-3 px-6 py-3.5 text-[15px] transition-colors duration-300 hover:border-fg hover:bg-white/[0.05]"
        >
          <RollText>{t.hero.primary}</RollText>
          <ArrowDown aria-hidden="true" strokeWidth={2} className="size-4 transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0.5" />
        </AnchorLink>
      </Magnetic>
    </div>
  );
}

export default function Hero({ ready }: { ready: boolean }) {
  const { t } = useLanguage();
  const time = useLocalTime();
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Entrance: plays as the opening scene lifts off.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (reduced) return;
      if (!ready) {
        gsap.set('[data-intro]', { autoAlpha: 0, y: 40 });
        gsap.set('[data-band]', { yPercent: 110 });
        gsap.set('[data-portrait]', { autoAlpha: 0, scale: 1.06 });
        return;
      }
      gsap.to('[data-portrait]', { autoAlpha: 1, scale: 1, duration: 2, delay: 0.2 });
      gsap.to('[data-intro]', { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.08, delay: 0.45 });
      gsap.to('[data-band]', { yPercent: 0, duration: 1.6, delay: 0.3 });
    }, el);
    return () => ctx.revert();
  }, [ready, reduced]);

  // The name band drifts on its own and turns around whenever the scroll direction does.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      let xPercent = 0;
      let direction = -1;
      const copies = gsap.utils.toArray<HTMLElement>('[data-copy]');
      const tick = () => {
        if (xPercent <= -100) xPercent = 0;
        else if (xPercent > 0) xPercent = -100;
        gsap.set(copies, { xPercent });
        xPercent += 0.045 * direction * gsap.ticker.deltaRatio();
      };
      gsap.ticker.add(tick);

      const scrollTrigger = { trigger: el, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('[data-track]', {
        x: -260,
        ease: 'none',
        scrollTrigger: { ...scrollTrigger, scrub: 0.25, onUpdate: (self) => void (direction = self.direction * -1) },
      });
      gsap.to('[data-drift]', { yPercent: 10, ease: 'none', scrollTrigger });
      return () => gsap.ticker.remove(tick);
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="home" ref={root} aria-labelledby="hero-title" className="relative h-[100svh] min-h-[560px] overflow-hidden [--band-bottom:clamp(1.5rem,7svh,4.5rem)] [--band-size:clamp(5.5rem,15.5vw,15rem)] bg-[linear-gradient(to_bottom,#2c2c30,#1c1c1f_55%,var(--color-ink))]">
      <h1 id="hero-title" className="sr-only">
        {NAME} — {t.nav.role}
      </h1>

      <div data-drift="" className="absolute inset-0">
        <div data-portrait="" className="absolute inset-0">
          {/* A single soft light behind the shoulders so the black t-shirt keeps its silhouette */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[30%] aspect-square w-[min(120vh,150vw)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(242_241_238/0.13),rgb(242_241_238/0.04)_55%,transparent)]"
          />
          {/* Taller than the hero: the head sits near the top and the body fades out before the fold. */}
          <div className="absolute inset-x-0 top-[8svh] flex h-[112svh] justify-center md:top-[3svh] md:h-[128svh]">
            <img
              src={portrait843}
              srcSet={`${portrait480} 480w, ${portrait843} 843w`}
              sizes="(min-width: 768px) 75vh, 100vw"
              width={941}
              height={1671}
              alt={t.hero.portraitAlt}
              fetchPriority="high"
              className="h-full w-auto max-w-none object-contain object-top [mask-image:linear-gradient(to_bottom,#000_55%,transparent_82%)] md:[mask-image:linear-gradient(to_bottom,#000_50%,transparent_76%)]"
            />
          </div>
        </div>
      </div>

      {/* Below lg the portrait runs behind the copy: darken its lower half so the text stays readable. */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-ink from-35% to-transparent lg:hidden" />

      {/* Where I am, what I build, and the ways in: anchored just above the name band, so the two never meet. */}
      <div
        data-intro=""
        className="absolute bottom-[calc(var(--band-bottom)_+_var(--band-size)*1.1_+_2.5rem)] left-[var(--gutter)] hidden w-[min(26rem,34vw)] lg:block"
      >
        <p className="label flex items-center gap-2.5 tabular">
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
          {t.hero.location} · {time} GMT+5
        </p>
        <p className="mt-5 text-balance text-[clamp(1.5rem,2.1vw,2.1rem)] leading-[1.12] tracking-[-0.03em]">{t.hero.pitchLead}</p>
        <Actions className="mt-8" />
      </div>

      {/* Role — on smaller screens it carries the pitch and the ways in too */}
      <div
        data-intro=""
        className="absolute bottom-[clamp(9.5rem,24svh,15rem)] left-[var(--gutter)] right-[var(--gutter)] lg:bottom-auto lg:left-auto lg:top-[38%] lg:w-auto"
      >
        <AnchorLink
          to="about"
          aria-label={t.hero.scroll}
          className="group relative mb-[clamp(1.25rem,4vh,3rem)] hidden size-[clamp(6rem,8vw,8rem)] place-items-center lg:grid"
        >
          <CircularText text={`${t.nav.role.toUpperCase()} • `} className="absolute inset-0 text-[clamp(0.6rem,0.75vw,0.72rem)] font-medium tracking-[0.12em]" />
          <ArrowDown
            aria-hidden="true"
            strokeWidth={1.5}
            className="size-[clamp(1.1rem,1.5vw,1.4rem)] text-accent transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-1"
          />
        </AnchorLink>
        <p className="text-[clamp(1.75rem,2.9vw,2.75rem)] leading-[1.12] tracking-[-0.025em]">
          <span className="block">{t.hero.roleTop}</span>
          <span className="block text-fg-2">{t.hero.roleBottom}</span>
        </p>
        <div className="lg:hidden">
          {/* On short phones the line would cover the face; About opens with the same message right below. */}
          <p className="mt-4 text-[15px] leading-relaxed text-fg-2 [@media(max-height:700px)]:hidden">{t.hero.pitchLead}</p>
          <Actions className="mt-6" />
        </div>
      </div>

      {/* Name band */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-[var(--band-bottom)] overflow-hidden">
        <div data-band="">
          <div data-track="" className="relative w-max whitespace-nowrap text-[length:var(--band-size)] font-medium leading-[1.1] tracking-[-0.035em]">
            <BandCopy />
            <BandCopy absolute />
          </div>
        </div>
      </div>
    </section>
  );
}
