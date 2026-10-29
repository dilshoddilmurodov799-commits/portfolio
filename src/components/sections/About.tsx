import { useLanguage } from '../../contexts/LanguageContext';
import { CV_URL, STATS } from '../../content/data';
import HelpList from '../ui/HelpList';
import RoundButton from '../ui/RoundButton';
import { FadeIn } from '../ui/Reveal';
import Counter from '../reactbits/Counter';
import RotatingText from '../reactbits/RotatingText';
import ScrollReveal from '../reactbits/ScrollReveal';
import SpotlightCard from '../reactbits/SpotlightCard';

export default function About() {
  const { t } = useLanguage();

  return (
    <section id="about" aria-labelledby="about-title" className="relative px-[var(--gutter)] pb-[clamp(6rem,14vh,10rem)] pt-[clamp(7rem,18vh,12rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <h2 id="about-title" className="label">
              {t.about.label}
            </h2>
            <ScrollReveal text={t.about.statement} className="mt-6 text-[clamp(1.65rem,3.1vw,3rem)] leading-[1.28] tracking-[-0.025em]" />
          </div>
          <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between lg:col-span-3 lg:col-start-10 lg:flex-col lg:items-start lg:justify-start lg:pt-14">
            <FadeIn as="p" className="max-w-sm text-[clamp(1rem,1.1vw,1.1rem)] leading-relaxed text-fg-2">
              {t.hero.intro}
            </FadeIn>
            <RoundButton
              href={CV_URL}
              download="DilshodDilmurodovCV.pdf"
              wrapperClassName="shrink-0 lg:mt-10"
              className="size-[clamp(8.5rem,12vw,11rem)] bg-paper px-4 text-[15px] font-medium text-ink"
            >
              {t.hero.secondary}
            </RoundButton>
          </div>
        </div>

        {/* What I can help with fills the column the story paragraphs leave open. */}
        <div className="mt-[clamp(4rem,10vh,7rem)] grid gap-12 lg:grid-cols-3">
          <FadeIn as="div">
            <p className="label">{t.contact.help.label}</p>
            <HelpList className="mt-4 space-y-2 text-[clamp(1.1rem,1.4vw,1.35rem)] tracking-[-0.015em]" />
          </FadeIn>
          <div className="grid gap-8 text-[15px] leading-relaxed text-fg-2 md:grid-cols-2 lg:col-span-2 lg:gap-12">
            {t.about.paragraphs.map((paragraph, i) => (
              <FadeIn key={i} as="p" delay={i * 0.08}>
                {paragraph}
              </FadeIn>
            ))}
          </div>
        </div>

        <dl className="mt-[clamp(5rem,12vh,8rem)] grid grid-cols-2 border-t border-line lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col-reverse justify-end border-b border-line py-8 pr-4 even:pl-5 lg:border-b-0 lg:border-l lg:px-8 lg:py-10 lg:first:border-l-0 lg:first:pl-0 lg:even:pl-8"
            >
              <dt className="mt-4 max-w-[14rem] text-sm text-fg-3">{t.about.stats[i]}</dt>
              <dd className="flex items-baseline text-[clamp(3rem,6.5vw,6.5rem)] leading-none tracking-[-0.05em] tabular">
                {stat.prefix && <span className="text-fg-3">{stat.prefix}</span>}
                <Counter value={stat.value} />
                {stat.suffix && (
                  <span className={stat.suffix.length > 1 ? 'ml-1 text-[0.32em] tracking-[-0.02em] text-accent' : 'text-accent'}>{stat.suffix}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-[clamp(5rem,12vh,8rem)]">
          <p className="text-[clamp(1.5rem,2.4vw,2.25rem)] leading-none tracking-[-0.03em]">
            <RotatingText
              texts={t.about.heading.split('.').map((word) => word.trim()).filter(Boolean)}
              className="rounded-full bg-accent px-[0.55em] py-[0.2em] text-ink"
            />
          </p>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {t.about.principles.map((principle, i) => (
              <FadeIn key={principle.title} as="li" delay={i * 0.08} className="h-full">
                <SpotlightCard className="h-full rounded-[1.25rem] border border-line bg-ink-2 p-[clamp(1.5rem,2.6vw,2.5rem)]">
                  <span className="text-sm text-accent tabular">0{i + 1}</span>
                  <h3 className="mt-[clamp(3rem,6vw,5rem)] text-[clamp(1.75rem,2.6vw,2.5rem)] leading-none tracking-[-0.035em]">{principle.title}</h3>
                  <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-fg-2">{principle.text}</p>
                </SpotlightCard>
              </FadeIn>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
