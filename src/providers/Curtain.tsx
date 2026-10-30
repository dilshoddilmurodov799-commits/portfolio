import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { gsap } from '../lib/gsap';
import { useLanguage } from '../contexts/LanguageContext';
import type { Locale } from '../contexts/LanguageContext';
import type { Dict } from '../content/locales/en';
import { useReducedMotion } from '../hooks/useMediaQuery';
import { useSmoothScroll } from './SmoothScroll';
import Asterisk from '../components/ui/Asterisk';

/** A section selector ('#work'), a scroll offset (0 for the top), or a change to make while covered. */
type Target = string | number | (() => void);

interface CurtainValue {
  /** True once the opening scene starts to lift. */
  ready: boolean;
  /** Covers the page, announces `label`, jumps to (or runs) `target` underneath and lifts again. */
  navigate: (target: Target, label: string) => void;
  /** Covers the page, announces `label` and goes to another page (`href`), whose opening scene takes over. */
  leave: (href: string, label: string) => void;
}

const CurtainContext = createContext<CurtainValue | null>(null);

// "Hello" around the world; the visitor's own language opens the sequence.
const GREETINGS = ['Hello', 'Salom', 'Привет', 'Hallo', 'Bonjour', 'Hola', 'Ciao', 'Olá', 'Merhaba', 'こんにちは', '안녕하세요', 'Hej'];
const FIRST: Record<Locale, string> = { en: 'Hello', uz: 'Salom', ru: 'Привет' };
const FIRST_HOLD = 1200;
const STEP = 210;
const LAST_HOLD = 700;
/** How long a section's name stays on screen between covering and lifting. */
const ANNOUNCE = 0.5;

const reducedAtLoad = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The orange sheet runs this far ahead of (covering) or behind (lifting) the black one. */
const LAG = 0.12;

/**
 * Two sheets — orange underneath, black on top — drive both the opening scene and every
 * section change. They enter from below with bowed leading edges and leave upward with their
 * trailing edges sagging, then flattening; the orange one is offset by LAG, so a curved band
 * of colour sweeps the screen. Same gesture each time: navigation continues the intro.
 */
export function CurtainProvider({ children, opening }: { children: ReactNode; opening?: (t: Dict) => string }) {
  const { locale, t } = useLanguage();
  const { scrollTo, stop, start } = useSmoothScroll();
  const reduced = useReducedMotion();
  const [instant] = useState(reducedAtLoad);
  // Arriving through the curtain from another page: `opening` replaces the greetings.
  const [arrival] = useState(Boolean(opening));
  const [words] = useState(() => (opening ? [opening(t)] : [FIRST[locale], ...GREETINGS.filter((g) => g !== FIRST[locale])]));
  const [text, setText] = useState(words[0]);
  const [ready, setReady] = useState(instant);
  const busy = useRef(!instant);

  const root = useRef<HTMLDivElement>(null);
  // Index 0 is the orange sheet, 1 the black one on top of it.
  const sheets = useRef<(HTMLDivElement | null)[]>([]);
  const leads = useRef<(SVGSVGElement | null)[]>([]);
  const trails = useRef<(SVGSVGElement | null)[]>([]);
  const label = useRef<HTMLParagraphElement>(null);
  const meta = useRef<HTMLDivElement>(null);

  const lift = useCallback(() => {
    const h = sheets.current[1]!.offsetHeight;
    const tl = gsap
      .timeline({ onComplete: () => void (busy.current = false) })
      .to([label.current, meta.current], { autoAlpha: 0, y: -28, duration: 0.45, ease: 'power2.in' }, 0);
    // Black leaves first, orange trails behind it.
    [1, 0].forEach((i, order) => {
      const at = 0.1 + order * LAG;
      tl.fromTo(sheets.current[i], { y: 0 }, { y: -h, duration: 1, ease: 'power4.inOut' }, at).fromTo(
        trails.current[i],
        { scaleY: 1 },
        { scaleY: 0, duration: 0.85, ease: 'power3.inOut' },
        at + 0.15,
      );
    });
    return tl.set(root.current, { autoAlpha: 0 });
  }, []);

  // Opening scene: greetings flick past, then the sheet lifts off the hero.
  useEffect(() => {
    if (instant) return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    stop();

    let timer = 0;
    let cancelled = false;
    let exit: gsap.core.Timeline | undefined;
    // An arrival picks up where the last page's cover left off: name already up, no mark, and a
    // section-change pause (ANNOUNCE) instead of the long first hold — so the reveal doesn't stall.
    const fade = arrival
      ? gsap.set(label.current, { autoAlpha: 1, y: 0 })
      : gsap.fromTo([label.current, meta.current], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.9, delay: 0.2, ease: 'power3.out' });
    const fonts = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2000))]);

    const finish = () =>
      fonts.then(() => {
        if (cancelled) return;
        start();
        setReady(true);
        exit = lift();
      });
    const show = (i: number) => {
      setText(words[i]);
      const last = i === words.length - 1;
      timer = window.setTimeout(() => (last ? finish() : show(i + 1)), last ? LAST_HOLD : STEP);
    };
    timer = window.setTimeout(() => (arrival ? finish() : show(1)), arrival ? ANNOUNCE * 1000 : FIRST_HOLD);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      fade.kill();
      exit?.kill();
      start();
    };
  }, [instant, arrival, words, lift, stop, start]);

  /** Brings both sheets up over the page and announces `name` on them. */
  const cover = useCallback((name: string) => {
    busy.current = true;
    setText(name);
    const h = sheets.current[1]!.offsetHeight;
    const bow = leads.current[1]!.getBoundingClientRect().height;
    const tl = gsap.timeline().set(root.current, { autoAlpha: 1 }).set(label.current, { autoAlpha: 0, y: 28 });
    // Orange leads in, black follows over it.
    [0, 1].forEach((i) => {
      const at = i * LAG;
      tl.fromTo(sheets.current[i], { y: h + bow }, { y: 0, duration: 0.95, ease: 'power4.inOut' }, at).fromTo(
        leads.current[i],
        { scaleY: 1 },
        { scaleY: 0, duration: 0.8, ease: 'power3.inOut' },
        at + 0.15,
      );
    });
    return tl.to(label.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.55 + LAG);
  }, []);

  const navigate = useCallback<CurtainValue['navigate']>(
    (target, name) => {
      if (busy.current) return;
      const arrive = () => (typeof target === 'function' ? target() : scrollTo(target, { immediate: true }));
      if (reduced) {
        arrive();
        return;
      }
      cover(name).call(arrive).call(lift, undefined, `+=${ANNOUNCE}`);
    },
    [reduced, scrollTo, cover, lift],
  );

  const leave = useCallback<CurtainValue['leave']>(
    (href, name) => {
      const go = () => window.location.assign(href);
      if (reduced || busy.current) {
        go();
        return;
      }
      // Back/forward cache can bring this page back still covered: lift the sheets off it then.
      window.addEventListener(
        'pageshow',
        (e) => {
          if (e.persisted) lift();
        },
        { once: true },
      );
      cover(name).call(go);
    },
    [reduced, cover, lift],
  );

  const value = useMemo(() => ({ ready, navigate, leave }), [ready, navigate, leave]);

  return (
    <CurtainContext.Provider value={value}>
      {children}
      <div ref={root} aria-hidden="true" className="fixed inset-0 z-[95] overflow-hidden" style={instant ? { visibility: 'hidden' } : undefined}>
        {['bg-accent fill-accent', 'bg-ink fill-ink'].map((tone, i) => (
          <div
            key={tone}
            ref={(el) => void (sheets.current[i] = el)}
            className={`absolute inset-x-0 top-0 h-[100lvh] will-change-transform ${tone}`}
          >
            <svg
              ref={(el) => void (leads.current[i] = el)}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute bottom-[calc(100%-1px)] left-0 h-[28vh] w-full origin-bottom"
            >
              <path d="M0 100 Q50 0 100 100 Z" />
            </svg>
            <svg
              ref={(el) => void (trails.current[i] = el)}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute left-0 top-[calc(100%-1px)] h-[28vh] w-full origin-top"
            >
              <path d="M0 0 Q50 100 100 0 Z" />
            </svg>
            {i === 1 && (
              <div className="absolute inset-x-0 top-0 h-[100svh] px-[var(--gutter)]">
                <div className="grid h-full place-items-center">
                  <p ref={label} className="flex items-center gap-[0.35em] text-center text-[clamp(2.25rem,5.5vw,4rem)] leading-none tracking-[-0.03em] text-fg opacity-0">
                    <span className="size-[0.2em] shrink-0 rounded-full bg-accent" />
                    {text}
                  </p>
                </div>
                {/* Opening scene only: the mark in the corner */}
                <div ref={meta} className="absolute inset-0 opacity-0">
                  <p className="absolute left-[var(--gutter)] top-[clamp(1.25rem,3vw,2.25rem)] flex items-center gap-2.5 text-[15px] font-medium text-fg">
                    <Asterisk className="spin-slow size-4 text-accent" />
                    Dilshod Dilmurodov
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </CurtainContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCurtain() {
  const ctx = useContext(CurtainContext);
  if (!ctx) throw new Error('useCurtain must be used within CurtainProvider');
  return ctx;
}
