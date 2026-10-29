import { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { SmoothScrollProvider, useSmoothScroll } from './providers/SmoothScroll';
import { CurtainProvider, useCurtain } from './providers/Curtain';
import { useScrolledPast } from './hooks/useScrolledPast';
import { SECTION_IDS } from './content/data';
import { ScrollTrigger } from './lib/gsap';
import Header from './components/layout/Header';
import MenuButton from './components/layout/MenuButton';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Marquee from './components/sections/Marquee';
import Work from './components/sections/Work';
import Skills from './components/sections/Skills';
import Journey from './components/sections/Journey';
import Gallery from './components/sections/Gallery';
import Contact from './components/sections/Contact';
import ClickSpark from './components/reactbits/ClickSpark';
import Noise from './components/reactbits/Noise';

// Old sub-pages now live as sections of the single-page experience.
const LEGACY_ROUTES: Record<string, string> = { '/projects': '#work', '/certificates': '#journey', '/resume': '#journey' };

/** Where to land once the opening scene lifts: an old route or a section hash. */
function initialTarget() {
  const legacy = LEGACY_ROUTES[window.location.pathname];
  if (legacy) return legacy;
  const hash = window.location.hash.slice(1);
  return (SECTION_IDS as readonly string[]).includes(hash) ? `#${hash}` : null;
}

function Shell() {
  const { t, locale } = useLanguage();
  const { scrollTo } = useSmoothScroll();
  const { ready } = useCurtain();
  const [menuOpen, setMenuOpen] = useState(false);
  const pastFold = useScrolledPast(0.3);
  // The grain stays off the hero so the portrait is shown untouched.
  const pastHero = useScrolledPast(0.85);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Copy length changes layout: recompute every trigger after locale switches and once fonts land.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, [locale, ready]);

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  useEffect(() => {
    const target = ready && initialTarget();
    if (!target) return;
    window.history.replaceState(null, '', '/');
    scrollTo(target, { immediate: true });
  }, [ready, scrollTo]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-paper focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-ink"
      >
        {t.nav.skip}
      </a>

      <Header ready={ready} onMenu={() => setMenuOpen(true)} />
      <Sidebar open={menuOpen} onClose={closeMenu} />
      <MenuButton open={menuOpen} visible={ready && (pastFold || menuOpen)} onToggle={() => setMenuOpen((open) => !open)} />

      <main id="main" tabIndex={-1} className="outline-none">
        <Hero ready={ready} />
        <About />
        <Marquee />
        <Work />
        <Skills />
        <Journey />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <ClickSpark />
      <Noise hidden={!pastHero} />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <SmoothScrollProvider>
        <CurtainProvider>
          <MotionConfig reducedMotion="user">
            <Shell />
          </MotionConfig>
        </CurtainProvider>
      </SmoothScrollProvider>
    </LanguageProvider>
  );
}
