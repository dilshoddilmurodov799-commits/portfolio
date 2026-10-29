import type { ReactNode } from 'react';
import type { WorkVisualKind } from '../../content/data';
import { cx } from '../../lib/cx';
import Asterisk from '../ui/Asterisk';
import portrait from '../../assets/portrait-480.webp';

/**
 * Schematic artwork for each project — drawn in CSS rather than faked as screenshots.
 * Everything is sized in container units, so one composition fits a 400px hover preview,
 * a grid card and a full-width case-study banner alike.
 */

const shadow = 'shadow-[0_2.5cqw_6cqw_-2cqw_rgb(20_21_23/0.35)]';
const Bar = ({ w, className }: { w: string; className?: string }) => (
  <span className={cx('block h-[1.1cqw] rounded-full', className)} style={{ width: w }} />
);
const Dots = ({ className }: { className?: string }) => (
  <span className="flex gap-[0.8cqw]">
    {[0, 1, 2].map((i) => (
      <span key={i} className={cx('size-[1.3cqw] rounded-full', className)} />
    ))}
  </span>
);

function Interface() {
  return (
    <div className={cx('absolute left-1/2 top-1/2 flex aspect-[16/10] w-[76%] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[1.6cqw] bg-white', shadow)}>
      <div className="flex items-center gap-[2cqw] border-b border-black/[0.06] px-[2.2cqw] py-[1.6cqw]">
        <Dots className="bg-black/10" />
        <span className="h-[2.2cqw] w-[36%] rounded-full bg-black/[0.05]" />
      </div>
      <div className="flex flex-1 gap-[2.4cqw] p-[2.4cqw]">
        <div className="w-[18%] space-y-[2cqw] pt-[0.8cqw]">
          {['84%', '62%', '74%', '52%', '68%'].map((w, i) => (
            <Bar key={i} w={w} className={i === 1 ? 'bg-accent' : 'bg-black/10'} />
          ))}
        </div>
        <div className="grid flex-1 grid-cols-3 grid-rows-[auto_1fr] gap-[1.6cqw]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-[1cqw] bg-black/[0.035] p-[1.6cqw]">
              <Bar w="46%" className="bg-black/10" />
              <span className={cx('mt-[1.6cqw] block h-[2.6cqw] w-[64%] rounded-[0.5cqw]', i === 0 ? 'bg-ink' : 'bg-black/20')} />
            </div>
          ))}
          <div className="col-span-3 rounded-[1cqw] bg-black/[0.035] p-[1.6cqw]">
            <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="h-full w-full">
              <path d="M0 50 C20 46 30 30 50 34 S80 52 100 32 S140 10 160 20 S190 12 200 6 V60 H0Z" fill="#ff6a3d" fillOpacity="0.12" />
              <path
                d="M0 50 C20 46 30 30 50 34 S80 52 100 32 S140 10 160 20 S190 12 200 6"
                fill="none"
                stroke="#ff6a3d"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bots() {
  const bubbles = [
    { me: false, w: '62%' },
    { me: true, w: '44%' },
    { me: false, w: '70%' },
    { me: false, w: '38%' },
    { me: true, w: '52%' },
  ];
  return (
    <>
      <div className="absolute left-[13%] top-[24%] w-[36%] rounded-[1.4cqw] bg-white/[0.06] p-[2.4cqw] font-mono text-[1.6cqw] leading-[1.9] text-white/50">
        {[
          ['def', ' handle(msg):'],
          ['  if', ' msg.text == "/start":'],
          ['    return', ' greet(msg)'],
          ['  return', ' route(msg)'],
        ].map(([k, rest], i) => (
          <p key={i} className="whitespace-pre">
            <span className="text-accent">{k}</span>
            {rest}
          </p>
        ))}
      </div>
      <div className={cx('absolute right-[16%] top-1/2 flex aspect-[9/17] h-[82%] -translate-y-1/2 flex-col overflow-hidden rounded-[3cqw] bg-white', shadow)}>
        <div className="flex items-center gap-[1.4cqw] border-b border-black/[0.06] px-[2.4cqw] py-[2cqw]">
          <span className="size-[4.2cqw] rounded-full bg-accent" />
          <span className="space-y-[0.9cqw]">
            <Bar w="9cqw" className="bg-ink" />
            <Bar w="6cqw" className="bg-black/15" />
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-[1.4cqw] bg-[#eef1f6] p-[2.4cqw]">
          {bubbles.map((b, i) => (
            <span
              key={i}
              className={cx('h-[4cqw] rounded-[1.6cqw]', b.me ? 'self-end bg-accent' : 'self-start bg-white')}
              style={{ width: b.w }}
            />
          ))}
          <span className="flex w-fit gap-[0.7cqw] rounded-[1.6cqw] bg-white px-[1.6cqw] py-[1.4cqw]">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-[1cqw] rounded-full bg-black/25" />
            ))}
          </span>
        </div>
      </div>
    </>
  );
}

function Community() {
  const tones = ['bg-ink', 'bg-mist', 'bg-white', 'bg-accent', 'bg-[#cfc6ab]', 'bg-ink', 'bg-white', 'bg-mist'];
  return (
    <>
      <p className="absolute left-[10%] top-1/2 -translate-y-1/2 text-[17cqw] font-medium leading-none tracking-[-0.06em] text-ink">90+</p>
      <div className="absolute right-[10%] top-1/2 grid w-[40%] -translate-y-1/2 grid-cols-4 gap-[1.6cqw]">
        {Array.from({ length: 16 }, (_, i) => (
          <span
            key={i}
            className={cx('aspect-square rounded-full ring-[0.5cqw] ring-[#e9e4d8]', tones[(i * 5) % tones.length], i === 6 && 'scale-110')}
          />
        ))}
      </div>
    </>
  );
}

function Portfolio() {
  return (
    <div className={cx('absolute left-1/2 top-1/2 flex aspect-[16/10] w-[76%] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[1.6cqw] bg-ink', shadow)}>
      <div className="flex items-center gap-[2cqw] border-b border-white/[0.06] px-[2.2cqw] py-[1.5cqw]">
        <Dots className="bg-white/15" />
        <span className="h-[2.2cqw] w-[36%] rounded-full bg-white/[0.06]" />
      </div>
      <div className="relative flex-1 overflow-hidden">
        <span className="absolute left-1/2 top-[30%] aspect-square w-[90%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(242_241_238/0.14),transparent)]" />
        <img
          src={portrait}
          alt=""
          className="absolute bottom-0 left-1/2 h-[94%] w-auto max-w-none -translate-x-1/2 [mask-image:linear-gradient(to_bottom,#000_62%,transparent_96%)]"
        />
        <span className="absolute left-[3%] right-[3%] top-[4%] flex items-center justify-between text-[1.5cqw] font-medium text-paper">
          <span className="flex items-center gap-[0.8cqw]">
            <Asterisk className="size-[1.6cqw] text-accent" />
            Dilshod Dilmurodov
          </span>
          <span className="flex gap-[2cqw]">
            <span>Work</span>
            <span>About</span>
            <span>Contact</span>
          </span>
        </span>
        <p className="absolute bottom-[6%] left-[-4%] flex items-center whitespace-nowrap text-[9.5cqw] font-medium leading-none tracking-[-0.035em] text-paper">
          Dilshod Dilmurodov
          <Asterisk className="mx-[0.28em] size-[0.5em] text-accent" />
        </p>
      </div>
    </div>
  );
}

const ART: Record<WorkVisualKind, () => ReactNode> = {
  interface: Interface,
  bots: Bots,
  community: Community,
  portfolio: Portfolio,
};

export default function ProjectArt({ kind, className }: { kind: WorkVisualKind; className?: string }) {
  const Art = ART[kind];
  return (
    <div aria-hidden="true" className={cx('@container absolute inset-0 overflow-hidden', className)}>
      <Art />
    </div>
  );
}
