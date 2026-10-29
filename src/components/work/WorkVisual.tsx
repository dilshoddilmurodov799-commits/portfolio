import type { CSSProperties, ReactNode } from 'react';
import { WORK_TINTS } from '../../content/data';
import type { WorkVisualKind } from '../../content/data';
import { cx } from '../../lib/cx';

/**
 * Abstract, layered compositions for each case study — schematic rather than fake screenshots.
 * Elements marked with data-layer get depth parallax from the Work reel and translateZ for hover tilt.
 */


function Layer({ depth, className, children }: { depth: number; className?: string; children: ReactNode }) {
  return (
    <div data-layer={depth} className={cx('absolute', className)} style={{ transform: `translateZ(${depth * 70}px)` }}>
      {children}
    </div>
  );
}

const Bar = ({ w, className }: { w: string; className?: string }) => (
  <span className={cx('block h-1.5 rounded-full bg-white/[0.12]', className)} style={{ width: w }} />
);

function Interface() {
  return (
    <>
      <Layer depth={0.3} className="inset-[14%_10%_20%_16%]">
        <div className="glass relative flex h-full flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2 rounded-full bg-white/20" />
            ))}
            <Bar w="28%" className="ml-4" />
          </div>
          <div className="flex flex-1 gap-4 p-4">
            <div className="hidden w-1/5 space-y-3 sm:block">
              {['80%', '60%', '72%', '50%', '66%'].map((w, i) => (
                <Bar key={i} w={w} className={i === 1 ? 'bg-white/30' : ''} />
              ))}
            </div>
            <div className="grid flex-1 grid-cols-2 grid-rows-[auto_1fr] gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-xl border border-line bg-white/[0.03] p-3">
                  <Bar w="40%" />
                  <span className="mt-3 block h-4 w-3/5 rounded bg-white/20" />
                </div>
              ))}
              <div className="col-span-2 rounded-xl border border-line bg-white/[0.03] p-3">
                <svg viewBox="0 0 200 60" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    d="M0 48 C20 44 30 30 50 34 S80 50 100 30 S140 8 160 18 S190 10 200 6"
                    fill="none"
                    stroke="rgb(var(--tint))"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path d="M0 48 C20 44 30 30 50 34 S80 50 100 30 S140 8 160 18 S190 10 200 6 V60 H0Z" fill="rgb(var(--tint) / 0.12)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Layer>
      <Layer depth={0.75} className="bottom-[9%] left-[7%] w-[42%]">
        <div className="glass relative rounded-2xl p-4">
          <p className="label mb-3 !text-[10px]">SQL · users</p>
          {['70%', '55%', '82%', '48%'].map((w, i) => (
            <div key={i} className="flex items-center gap-3 border-t border-line py-2">
              <span className="size-2 rounded-full" style={{ background: i === 0 ? 'rgb(var(--tint))' : 'rgb(255 255 255 / 0.2)' }} />
              <Bar w={w} />
            </div>
          ))}
        </div>
      </Layer>
      <Layer depth={1.1} className="right-[6%] top-[9%]">
        <div className="glass relative flex items-center gap-3 rounded-full py-2 pl-2 pr-4">
          <span className="flex h-6 w-11 items-center rounded-full p-0.5" style={{ background: 'rgb(var(--tint))' }}>
            <span className="ml-auto size-5 rounded-full bg-white" />
          </span>
          <span className="font-mono text-[11px] text-fg-2">&lt;Component /&gt;</span>
        </div>
      </Layer>
    </>
  );
}

function Bots() {
  const bubbles = [
    { side: 'l', w: '62%' },
    { side: 'r', w: '44%' },
    { side: 'l', w: '70%' },
    { side: 'l', w: '38%' },
    { side: 'r', w: '56%', tint: true },
    { side: 'l', w: '66%' },
    { side: 'r', w: '40%', tint: true },
  ];
  return (
    <>
      <Layer depth={0.3} className="inset-y-[10%] left-[12%] w-[38%] min-w-[160px]">
        <div className="glass relative flex h-full flex-col gap-3 overflow-hidden rounded-[28px] p-4 pt-8">
          <span className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-white/20" />
          {bubbles.map((b, i) => (
            <span
              key={i}
              className={cx('block h-7 rounded-2xl', b.side === 'r' ? 'self-end rounded-br-md' : 'rounded-bl-md')}
              style={{ width: b.w, background: b.tint ? 'rgb(var(--tint) / 0.75)' : 'rgb(255 255 255 / 0.1)' }}
            />
          ))}
          <div className="mt-auto flex items-center gap-2 rounded-full border border-line bg-white/[0.04] p-1.5 pl-4">
            <span className="block h-1.5 w-1/2 rounded-full bg-white/10" />
            <span className="ml-auto grid size-7 place-items-center rounded-full" style={{ background: 'rgb(var(--tint))' }}>
              <span className="size-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-ink" />
            </span>
          </div>
        </div>
      </Layer>
      <Layer depth={0.75} className="right-[9%] top-[22%] w-[38%]">
        <div className="glass relative space-y-0 rounded-2xl p-4 font-mono text-[11px] text-fg-2">
          {['/start', 'handler.py', '→ reply'].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <span className="flex flex-col items-center">
                <span className="size-2.5 rounded-full border" style={{ borderColor: 'rgb(var(--tint))', background: i === 1 ? 'rgb(var(--tint))' : 'transparent' }} />
                {i < 2 && <span className="h-6 w-px bg-white/15" />}
              </span>
              <span className={i < 2 ? '-mt-6' : ''}>{step}</span>
            </div>
          ))}
        </div>
      </Layer>
      <Layer depth={1.1} className="bottom-[12%] right-[14%]">
        <div className="glass relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium">
          <span className="size-1.5 rounded-full bg-accent" />
          Python
        </div>
      </Layer>
    </>
  );
}

function Community() {
  const ring = (count: number, r: number, offset = 0) =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + offset;
      return [100 + Math.cos(a) * r, 100 + Math.sin(a) * r] as const;
    });
  const inner = ring(7, 42, 0.3);
  const outer = ring(14, 82);
  return (
    <>
      <Layer depth={0.3} className="inset-[6%_30%_6%_6%]">
        <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
          {inner.map(([x, y], i) => (
            <line key={`c${i}`} x1="100" y1="100" x2={x} y2={y} stroke="rgb(255 255 255 / 0.14)" strokeWidth="0.6" />
          ))}
          {outer.map(([x, y], i) => {
            const [ix, iy] = inner[i % inner.length];
            return <line key={`o${i}`} x1={ix} y1={iy} x2={x} y2={y} stroke="rgb(255 255 255 / 0.08)" strokeWidth="0.5" />;
          })}
          <circle cx="100" cy="100" r="62" fill="none" stroke="rgb(255 255 255 / 0.06)" strokeDasharray="2 4" />
          {outer.map(([x, y], i) => (
            <circle key={`od${i}`} cx={x} cy={y} r="2.6" fill="rgb(255 255 255 / 0.35)" />
          ))}
          {inner.map(([x, y], i) => (
            <circle key={`id${i}`} cx={x} cy={y} r="4" fill="rgb(255 255 255 / 0.7)" />
          ))}
          <circle cx="100" cy="100" r="9" fill="rgb(var(--tint))" />
          <circle cx="100" cy="100" r="16" fill="none" stroke="rgb(var(--tint) / 0.5)" />
        </svg>
      </Layer>
      <Layer depth={0.75} className="bottom-[12%] right-[7%] w-[40%]">
        <div className="glass relative rounded-2xl p-4">
          <p className="label mb-3 !text-[10px]">Weekly sessions</p>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 28 }, (_, i) => (
              <span
                key={i}
                className="aspect-square rounded-[4px]"
                style={{ background: i % 7 === 2 || i % 7 === 5 ? 'rgb(var(--tint) / 0.8)' : 'rgb(255 255 255 / 0.07)' }}
              />
            ))}
          </div>
        </div>
      </Layer>
      <Layer depth={1.1} className="right-[10%] top-[12%]">
        <div className="glass relative rounded-2xl px-5 py-3">
          <p className="text-3xl font-medium tracking-[-0.04em]">
            90<span style={{ color: 'rgb(var(--tint))' }}>+</span>
          </p>
          <p className="label !text-[10px]">Members</p>
        </div>
      </Layer>
    </>
  );
}

function Portfolio() {
  const planes = ['Cursor', 'Content', 'Glass', 'Scene', 'Particles'];
  return (
    <div className="absolute inset-0 grid place-items-center [perspective:1400px]">
      <div className="relative h-[46%] w-[46%] [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(-38deg)]">
        {planes.map((name, i) => (
          <div
            key={name}
            data-layer={(planes.length - i) * 0.25}
            className="absolute inset-0"
            style={{ transform: `translateZ(${(planes.length - 1 - i) * 34 - 60}px)` }}
          >
            <div
              className="glass relative h-full w-full rounded-2xl"
              style={i === 0 ? { boxShadow: 'inset 0 0 0 1px rgb(var(--tint) / 0.7), 0 30px 60px -30px rgb(0 0 0 / 0.8)' } : undefined}
            >
              {name === 'Particles' && (
                <div
                  className="absolute inset-3 rounded-xl opacity-60"
                  style={{ backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.5) 1px, transparent 1px)', backgroundSize: '10px 10px' }}
                />
              )}
              {name === 'Content' && (
                <div className="absolute inset-4 space-y-2">
                  <span className="block h-3 w-1/2 rounded bg-white/25" />
                  <span className="block h-1.5 w-3/4 rounded-full bg-white/10" />
                  <span className="block h-1.5 w-2/3 rounded-full bg-white/10" />
                </div>
              )}
              {name === 'Cursor' && <span className="absolute left-[62%] top-[38%] size-3 rounded-full" style={{ background: 'rgb(var(--tint))' }} />}
            </div>
          </div>
        ))}
      </div>
      <ul className="absolute right-[7%] top-1/2 -translate-y-1/2 space-y-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-3">
        {planes.map((name, i) => (
          <li key={name} className="flex items-center gap-2">
            <span className="tabular">0{i + 1}</span>
            <span className="h-px w-4 bg-line-strong" />
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

const VISUALS: Record<WorkVisualKind, () => ReactNode> = {
  interface: Interface,
  bots: Bots,
  community: Community,
  portfolio: Portfolio,
};

export default function WorkVisual({ kind, className }: { kind: WorkVisualKind; className?: string }) {
  const Visual = VISUALS[kind];
  return (
    <div
      aria-hidden="true"
      className={cx('absolute inset-0 overflow-hidden bg-ink-2', className)}
      style={{ '--tint': WORK_TINTS[kind] } as CSSProperties}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 70% 30%, rgb(var(--tint) / 0.16), transparent 70%), radial-gradient(50% 50% at 10% 100%, rgb(255 255 255 / 0.04), transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(80% 70% at 50% 50%, #000, transparent)',
        }}
      />
      <div data-stage="" className="absolute inset-0 [transform-style:preserve-3d]">
        <Visual />
      </div>
    </div>
  );
}
