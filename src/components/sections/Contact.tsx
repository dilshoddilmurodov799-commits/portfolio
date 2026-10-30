import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { motion, useInView } from 'motion/react';
import { ArrowDownLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CONTACT, CV_URL } from '../../content/data';
import { gsap } from '../../lib/gsap';
import { onOpenContactForm } from '../../lib/contactForm';
import { EASE_EXPO } from '../../lib/motion';
import { messagesEnabled, sendMessage } from '../../lib/messages';
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery';
import { useSmoothScroll } from '../../providers/SmoothScroll';
import RoundButton from '../ui/RoundButton';
import { FadeIn } from '../ui/Reveal';
import { Threads } from '../reactbits/lazy';
import ScrollFloat from '../reactbits/ScrollFloat';
import StarBorder from '../reactbits/StarBorder';
import portrait from '../../assets/portrait-480.webp';

const EMBER: [number, number, number] = [1, 0.416, 0.239];

// Rows rise one after another when the form is revealed; the form itself stays put, so scrolling to it lands right.
const row = {
  hidden: { opacity: 0, y: 40 },
  shown: { opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE_EXPO } },
};

const input =
  'mt-4 w-full resize-none bg-transparent text-[clamp(1.05rem,1.4vw,1.25rem)] text-fg placeholder:text-fg-3 focus:outline-none focus-visible:outline-none';

function ContactForm() {
  const { t } = useLanguage();
  const f = t.contact.form;
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? '').trim();
    const msg = { name: get('name'), email: get('email'), org: get('org') || null, message: get('message') };

    // Without a message store (or if saving fails) the form composes an email in the visitor's own mail app.
    const mailto = () => {
      const body = [msg.message, '', `— ${msg.name}`, msg.email, msg.org].filter((line, i) => i < 2 || line).join('\n');
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(`${f.subject} ${msg.name}`)}&body=${encodeURIComponent(body)}`;
    };
    if (!messagesEnabled) return mailto();

    setStatus('sending');
    try {
      await sendMessage(msg);
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('failed');
      mailto();
    }
  };

  const fields = [
    { name: 'name', label: f.name, placeholder: f.namePh, type: 'text', required: true, autoComplete: 'name' },
    { name: 'email', label: f.email, placeholder: f.emailPh, type: 'email', required: true, autoComplete: 'email' },
    { name: 'org', label: f.org, placeholder: f.orgPh, type: 'text', required: false, autoComplete: 'organization' },
    { name: 'message', label: f.message, placeholder: f.messagePh, type: 'textarea', required: true, autoComplete: 'off' },
  ];

  return (
    <motion.form
      id="contact-form"
      onSubmit={submit}
      initial="hidden"
      animate="shown"
      transition={{ staggerChildren: 0.07 }}
      className="lg:col-span-8"
    >
      {fields.map((field, i) => (
        <motion.div
          key={field.name}
          variants={row}
          className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line py-[clamp(1.75rem,3.5vw,2.75rem)] transition-colors focus-within:border-fg sm:grid-cols-[4.5rem_1fr]"
        >
          <span className="pt-1.5 text-sm text-fg-3 tabular">0{i + 1}</span>
          <div>
            <label htmlFor={`cf-${field.name}`} className="block text-[clamp(1.3rem,2vw,1.75rem)] tracking-[-0.02em]">
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea id={`cf-${field.name}`} name={field.name} rows={4} required placeholder={field.placeholder} className={input} />
            ) : (
              <input
                id={`cf-${field.name}`}
                name={field.name}
                type={field.type}
                required={field.required}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                className={input}
              />
            )}
          </div>
        </motion.div>
      ))}
      <motion.div variants={row} className="relative h-[clamp(5rem,7vw,6rem)] border-t border-line">
        <p role="status" aria-live="polite" className="max-w-[45%] pt-6 text-[15px] leading-relaxed text-fg-2">
          {status === 'sent' ? f.sent : status === 'failed' ? f.failed : null}
        </p>
        <RoundButton
          type="submit"
          fill="var(--color-paper)"
          wrapperClassName="absolute right-[clamp(0rem,8vw,8rem)] top-0 -translate-y-1/2"
          className="size-[clamp(8rem,11vw,10rem)] bg-accent text-[15px] font-medium text-ink"
        >
          {status === 'sending' ? f.sending : f.send}
        </RoundButton>
      </motion.div>
    </motion.form>
  );
}

export default function Contact() {
  const { t } = useLanguage();
  const { scrollTo } = useSmoothScroll();
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  // The WebGL threads load as the section approaches, so their chunk never delays first paint.
  const near = useInView(root, { once: true, margin: '0px 0px 40% 0px' });
  const [first, ...rest] = t.contact.lines;
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => onOpenContactForm(() => setFormOpen(true)), []);

  // The top block rises out from under the closing curve, the button drifts and the arrow turns.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      const scrollTrigger = { trigger: el, start: 'top bottom', end: 'top top', scrub: true };
      gsap.fromTo('[data-rise]', { y: () => -window.innerHeight * 0.22 }, { y: 0, ease: 'none', scrollTrigger: { ...scrollTrigger, invalidateOnRefresh: true } });
      gsap.fromTo('[data-drift]', { x: 0 }, { x: 90, ease: 'none', scrollTrigger });
      gsap.fromTo('[data-turn]', { rotate: 90 }, { rotate: 0, ease: 'none', scrollTrigger });
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  const toForm = () => {
    // Render the form now, so there is something to focus and scroll to.
    flushSync(() => setFormOpen(true));
    document.getElementById('cf-name')?.focus({ preventScroll: true });
    scrollTo('#contact-form', { offset: -window.innerHeight * 0.15 });
  };

  return (
    <section id="contact" ref={root} aria-labelledby="contact-title" className="relative z-0 overflow-hidden bg-ink-2 pb-[clamp(4rem,10vh,7rem)]">
      {near && !reduced && (
        <Suspense fallback={null}>
          <Threads
            color={EMBER}
            amplitude={1.1}
            distance={0.25}
            mouse={fine}
            className="pointer-events-none absolute inset-x-0 top-[clamp(5rem,14vh,10rem)] h-[min(78vh,760px)] opacity-55 [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_70%,transparent)]"
          />
        </Suspense>
      )}

      <div data-rise="" className="relative mx-auto max-w-[1400px] px-[var(--gutter)] pt-[clamp(10rem,30vh,18rem)]">
        <h2 id="contact-title" className="text-[clamp(2.75rem,7.4vw,7.75rem)] leading-[1.02] tracking-[-0.045em]">
          <span className="flex items-center gap-[clamp(0.75rem,1.6vw,1.5rem)]">
            <span aria-hidden="true" className="relative size-[clamp(3.75rem,7vw,6.75rem)] shrink-0 overflow-hidden rounded-full bg-ink-3">
              <img src={portrait} alt="" className="absolute left-[-65%] top-[-3%] w-[210%] max-w-none" />
            </span>
            <ScrollFloat text={first} />
          </span>
          {rest.map((line) => (
            <ScrollFloat key={line} text={line} className="block" />
          ))}
        </h2>

        <div className="relative mt-[clamp(4rem,10vh,7rem)] border-b border-line">
          <div data-drift="" className="absolute right-[clamp(1rem,14vw,14rem)] top-0 -translate-y-1/2">
            <RoundButton onClick={toForm} aria-expanded={formOpen} fill="var(--color-paper)" className="size-[clamp(8.5rem,13vw,12rem)] bg-accent px-4 text-[15px] font-medium text-ink">
              {t.contact.cta}
            </RoundButton>
          </div>
          <ArrowDownLeft
            data-turn=""
            aria-hidden="true"
            strokeWidth={1.25}
            className="absolute bottom-[clamp(2rem,4vw,3.5rem)] right-0 hidden size-[clamp(1.75rem,2.4vw,2.25rem)] md:block"
          />
        </div>

        <div className="mt-[clamp(4.5rem,10vh,6.5rem)] flex flex-wrap gap-3">
          {[
            { label: CONTACT.email, href: `mailto:${CONTACT.email}` },
            { label: CONTACT.phone, href: CONTACT.phoneHref },
          ].map((pill) => (
            <RoundButton key={pill.href} href={pill.href} className="h-[clamp(3.5rem,5vw,4.5rem)] border border-line px-[clamp(1.5rem,3vw,2.5rem)] text-[15px] transition-colors duration-300 hover:text-ink focus-visible:text-ink">
              {pill.label}
            </RoundButton>
          ))}
        </div>
      </div>

      {/* The form and the details beside it stay hidden until a "Get in touch" button reveals them. */}
      {formOpen && (
        <div className="mx-auto grid max-w-[1400px] gap-16 px-[var(--gutter)] pt-[clamp(6rem,14vh,10rem)] lg:grid-cols-12 lg:gap-8">
          <ContactForm />
          <FadeIn as="div" className="space-y-10 lg:col-span-3 lg:col-start-10">
            <div>
              <p className="label">{t.contact.form.details}</p>
              <dl className="mt-5 space-y-4 text-[15px]">
                {t.about.facts.map((fact) => (
                  <div key={fact.k}>
                    <dt className="text-fg-3">{fact.k}</dt>
                    <dd className="mt-1">{fact.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <p className="label">{t.contact.form.cv}</p>
              <StarBorder className="mt-5" innerClassName="bg-ink-2">
                <a href={CV_URL} download="DilshodDilmurodovCV.pdf" className="block px-5 py-2.5 text-[15px]">
                  {t.hero.secondary}
                </a>
              </StarBorder>
            </div>
            <p className="max-w-xs text-[15px] leading-relaxed text-fg-2">{t.contact.intro}</p>
          </FadeIn>
        </div>
      )}
    </section>
  );
}
