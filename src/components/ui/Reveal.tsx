import { motion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import { EASE_EXPO } from '../../lib/motion';
import { cx } from '../../lib/cx';

const TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p, div: motion.div, span: motion.span, li: motion.li };
type Tag = keyof typeof TAGS;

const container = (stagger: number, delay: number) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});
const rise = {
  hidden: { y: '115%' },
  show: { y: '0%', transition: { duration: 1.15, ease: EASE_EXPO } },
};

interface RevealLinesProps {
  lines: readonly string[];
  id?: string;
  style?: CSSProperties;
  renderLine?: (line: string, index: number) => ReactNode;
  as?: Tag;
  className?: string;
  lineClassName?: string;
  stagger?: number;
  delay?: number;
}

/** Each line rises out of its own mask when the block scrolls into view. */
export function RevealLines({ lines, id, style, renderLine, as = 'h2', className, lineClassName, stagger = 0.09, delay = 0 }: RevealLinesProps) {
  const MotionTag = TAGS[as];
  return (
    <MotionTag
      id={id}
      style={style}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      variants={container(stagger, delay)}
    >
      {lines.map((line, i) => (
        <span key={`${i}-${line}`} className={cx('mask-line', lineClassName)}>
          <motion.span className="block will-change-transform" variants={rise}>
            {renderLine ? renderLine(line, i) : line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE_EXPO } },
};

/** Words drift up and fade in one after another — for short paragraphs. */
export function RevealWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ');
  return (
    <motion.p
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={container(0.012, delay)}
    >
      {words.map((word, i) => (
        <motion.span key={i} className="inline-block" variants={fadeUp}>
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </motion.p>
  );
}

/** Generic fade-up wrapper. */
export function FadeIn({ children, className, delay = 0, as = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: Tag }) {
  const MotionTag = TAGS[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.1, ease: EASE_EXPO, delay }}
    >
      {children}
    </MotionTag>
  );
}
