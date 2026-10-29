// Adapted from ReactBits — SplitText (https://reactbits.dev, MIT + Commons Clause).
// Characters rise out of each word's mask one after another, untilting as they land.
import { Fragment } from 'react';
import { motion } from 'motion/react';
import { EASE_EXPO } from '../../lib/motion';

const TAGS = { h2: motion.h2, h3: motion.h3, p: motion.p };

const container = { hidden: {}, show: { transition: { staggerChildren: 0.022 } } };
const char = {
  hidden: { yPercent: 115, rotate: 8 },
  show: { yPercent: 0, rotate: 0, transition: { duration: 1, ease: EASE_EXPO } },
};

interface SplitTextProps {
  text: string;
  as?: keyof typeof TAGS;
  id?: string;
  className?: string;
}

export default function SplitText({ text, as = 'h2', id, className }: SplitTextProps) {
  const Tag = TAGS[as];
  const words = text.split(' ');
  return (
    <Tag id={id} className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -10% 0px' }} variants={container}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <Fragment key={w}>
            <span className="-mb-[0.14em] inline-block overflow-hidden whitespace-nowrap pb-[0.14em] align-top">
              {Array.from(word).map((c, i) => (
                <motion.span key={i} className="inline-block origin-bottom-left" variants={char}>
                  {c}
                </motion.span>
              ))}
            </span>
            {w < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
