import { WORK_TINTS } from '../content/data';
import type { WorkVisualKind } from '../content/data';

/**
 * Case-study posters drawn on a canvas from real project data — schematic artwork,
 * never fake screenshots. They feed the WebGL carousel as ordinary image URLs.
 */
export interface CoverSpec {
  kind: WorkVisualKind;
  index: number;
  total: number;
  title: string;
  category: string;
  stack: readonly string[];
  period: string;
}

const W = 960;
const H = 1200;
const PAD = 60;
const SANS = '"Geist Variable", ui-sans-serif, system-ui, sans-serif';
const MONO = '"Geist Mono Variable", ui-monospace, monospace';

type Ctx = CanvasRenderingContext2D;

const rgba = (tint: string, a: number) => `rgba(${tint.split(' ').join(',')},${a})`;
const white = (a: number) => `rgba(242,241,238,${a})`;
const pad = (n: number) => String(n).padStart(2, '0');

function random(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function spacing(ctx: Ctx, value: string) {
  if ('letterSpacing' in ctx) (ctx as Ctx & { letterSpacing: string }).letterSpacing = value;
}

function backdrop(ctx: Ctx, tint: string) {
  ctx.fillStyle = '#0a0b0e';
  ctx.fillRect(0, 0, W, H);

  const bloom = ctx.createRadialGradient(W * 0.8, H * 0.16, 0, W * 0.8, H * 0.16, W * 1.05);
  bloom.addColorStop(0, rgba(tint, 0.42));
  bloom.addColorStop(0.42, rgba(tint, 0.1));
  bloom.addColorStop(1, rgba(tint, 0));
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, W, H);

  const floor = ctx.createLinearGradient(0, H * 0.55, 0, H);
  floor.addColorStop(0, 'rgba(10,11,14,0)');
  floor.addColorStop(1, 'rgba(10,11,14,0.92)');
  ctx.fillStyle = floor;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = white(0.045);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 48; x < W; x += 48) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, H);
  }
  for (let y = 48; y < H; y += 48) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(W, y + 0.5);
  }
  ctx.stroke();
}

function panel(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string, stroke: string) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function bar(ctx: Ctx, x: number, y: number, w: number, color: string, h = 10) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fillStyle = color;
  ctx.fill();
}

/** Two layered app windows: navigation, cards, a chart and a form wired to a primary action. */
function drawInterface(ctx: Ctx, tint: string) {
  panel(ctx, 120, 230, 650, 440, 26, 'rgba(255,255,255,0.035)', white(0.16));
  [0, 1, 2].forEach((i) => {
    ctx.beginPath();
    ctx.arc(152 + i * 22, 262, 6, 0, Math.PI * 2);
    ctx.fillStyle = white(0.22);
    ctx.fill();
  });
  bar(ctx, 232, 257, 180, white(0.1));
  ctx.fillStyle = white(0.08);
  ctx.fillRect(120, 292, 650, 1.5);
  ['70%', '52%', '64%', '44%', '58%'].forEach((w, i) => bar(ctx, 150, 326 + i * 36, (parseFloat(w) / 100) * 120, i === 1 ? rgba(tint, 0.8) : white(0.12)));
  for (let i = 0; i < 4; i++) {
    const cx = 310 + (i % 2) * 220;
    const cy = 320 + Math.floor(i / 2) * 170;
    panel(ctx, cx, cy, 200, 150, 16, i === 0 ? rgba(tint, 0.16) : 'rgba(255,255,255,0.03)', i === 0 ? rgba(tint, 0.6) : white(0.1));
    bar(ctx, cx + 20, cy + 24, 90, white(0.16), 8);
    if (i === 3) {
      ctx.beginPath();
      [0.7, 0.5, 0.62, 0.3, 0.42, 0.18].forEach((v, k) => {
        const px = cx + 20 + k * 32;
        const py = cy + 50 + v * 80;
        if (k) ctx.lineTo(px, py);
        else ctx.moveTo(px, py);
      });
      ctx.strokeStyle = rgba(tint, 0.95);
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      bar(ctx, cx + 20, cy + 104, i === 0 ? 120 : 70, i === 0 ? rgba(tint, 0.9) : white(0.08), 8);
    }
  }
  panel(ctx, 500, 560, 360, 260, 22, 'rgba(16,17,21,0.94)', white(0.2));
  bar(ctx, 530, 596, 120, white(0.2));
  [0, 1].forEach((i) => panel(ctx, 530, 630 + i * 58, 300, 42, 12, 'rgba(255,255,255,0.03)', white(0.12)));
  panel(ctx, 530, 752, 140, 42, 21, rgba(tint, 0.95), rgba(tint, 1));
}

/** A conversation thread with a bot: commands in, confirmations out. */
function drawBots(ctx: Ctx, tint: string) {
  const bubbles = [
    { me: true, w: 200, text: '/start' },
    { me: false, w: 420, lines: 2 },
    { me: true, w: 260, text: '/remind 09:00' },
    { me: false, w: 340, lines: 1 },
    { me: false, w: 120, typing: true },
  ];
  let y = 210;
  ctx.font = `400 26px ${MONO}`;
  bubbles.forEach((b) => {
    const h = b.lines === 2 ? 108 : 70;
    const x = b.me ? W - PAD - 70 - b.w : PAD + 70;
    panel(ctx, x, y, b.w, h, 26, b.me ? 'rgba(255,255,255,0.04)' : rgba(tint, 0.16), b.me ? white(0.2) : rgba(tint, 0.55));
    if (b.text) {
      ctx.fillStyle = white(0.85);
      ctx.fillText(b.text, x + 28, y + 44);
    } else if (b.typing) {
      [0, 1, 2].forEach((i) => {
        ctx.beginPath();
        ctx.arc(x + 36 + i * 24, y + h / 2, 6, 0, Math.PI * 2);
        ctx.fillStyle = rgba(tint, 0.5 + i * 0.2);
        ctx.fill();
      });
    } else {
      for (let l = 0; l < (b.lines ?? 1); l++) bar(ctx, x + 28, y + 30 + l * 38, (b.w - 56) * (l ? 0.6 : 1), white(0.2));
    }
    if (!b.me) {
      ctx.beginPath();
      ctx.arc(PAD + 30, y + h - 22, 20, 0, Math.PI * 2);
      ctx.fillStyle = rgba(tint, 0.9);
      ctx.fill();
    }
    y += h + 26;
  });
}

/** Concentric rings of people around a single core — a community growing outward. */
function drawCommunity(ctx: Ctx, tint: string) {
  const cx = W / 2;
  const cy = 470;
  const rand = random(7);
  const rings = [
    { r: 110, n: 12 },
    { r: 200, n: 28 },
    { r: 290, n: 50 },
  ];
  const nodes: { x: number; y: number; ring: number }[] = [];
  rings.forEach((ring, ri) => {
    for (let i = 0; i < ring.n; i++) {
      const a = (i / ring.n) * Math.PI * 2 + ri * 0.4 + (rand() - 0.5) * 0.12;
      const r = ring.r + (rand() - 0.5) * 22;
      nodes.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.82, ring: ri });
    }
  });
  ctx.lineWidth = 1.2;
  nodes.forEach((node) => {
    const inner = node.ring === 0 ? [{ x: cx, y: cy }] : nodes.filter((n) => n.ring === node.ring - 1);
    const nearest = inner.reduce((a, b) => (Math.hypot(b.x - node.x, b.y - node.y) < Math.hypot(a.x - node.x, a.y - node.y) ? b : a));
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(nearest.x, nearest.y);
    ctx.strokeStyle = node.ring === 0 ? rgba(tint, 0.5) : white(0.1);
    ctx.stroke();
  });
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
  core.addColorStop(0, rgba(tint, 0.85));
  core.addColorStop(1, rgba(tint, 0));
  ctx.fillStyle = core;
  ctx.fillRect(cx - 120, cy - 120, 240, 240);
  nodes.forEach((node) => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.ring === 0 ? 9 : node.ring === 1 ? 7 : 5, 0, Math.PI * 2);
    ctx.fillStyle = node.ring === 0 ? rgba(tint, 1) : white(node.ring === 1 ? 0.7 : 0.45);
    ctx.fill();
  });
}

/** A particle sphere over a dotted terrain — the formations this site's WebGL scene morphs between. */
function drawPortfolio(ctx: Ctx, tint: string) {
  const cx = W / 2;
  const cy = 440;
  const R = 250;
  const n = 1500;
  const tilt = 0.45;
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.399963;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const py = y * Math.cos(tilt) - z * Math.sin(tilt);
    const pz = y * Math.sin(tilt) + z * Math.cos(tilt);
    const depth = (pz + 1) / 2;
    ctx.beginPath();
    ctx.arc(cx + x * R, cy + py * R, 1.2 + depth * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = depth > 0.72 ? rgba(tint, 0.35 + depth * 0.6) : white(0.08 + depth * 0.4);
    ctx.fill();
  }
  ctx.strokeStyle = rgba(tint, 0.45);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, R * 1.45, R * 0.3, -0.18, 0, Math.PI * 2);
  ctx.stroke();
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 34; col++) {
      const x = 40 + col * 27;
      const y = 790 + row * 18 + Math.sin(col * 0.5 + row) * 8;
      ctx.fillStyle = white(0.05 + row * 0.02);
      ctx.fillRect(x, y, 3, 3);
    }
  }
}

const MOTIFS: Record<WorkVisualKind, (ctx: Ctx, tint: string) => void> = {
  interface: drawInterface,
  bots: drawBots,
  community: drawCommunity,
  portfolio: drawPortfolio,
};

function wrap(ctx: Ctx, text: string, max: number) {
  const lines: string[] = [];
  let line = '';
  text.split(' ').forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = word;
    } else line = next;
  });
  if (line) lines.push(line);
  return lines;
}

function typeset(ctx: Ctx, spec: CoverSpec, tint: string) {
  ctx.textBaseline = 'alphabetic';
  ctx.font = `400 22px ${MONO}`;
  spacing(ctx, '3px');
  ctx.fillStyle = white(0.6);
  ctx.textAlign = 'left';
  ctx.fillText(`${pad(spec.index + 1)} / ${pad(spec.total)}`, PAD, 92);
  ctx.textAlign = 'right';
  ctx.fillText(spec.category.toUpperCase(), W - PAD, 92);

  ctx.textAlign = 'left';
  let size = 104;
  ctx.font = `500 ${size}px ${SANS}`;
  spacing(ctx, `${-size * 0.045}px`);
  let lines = wrap(ctx, spec.title, W - PAD * 2);
  while (lines.length > 3 || lines.some((l) => ctx.measureText(l).width > W - PAD * 2)) {
    size -= 6;
    ctx.font = `500 ${size}px ${SANS}`;
    spacing(ctx, `${-size * 0.045}px`);
    lines = wrap(ctx, spec.title, W - PAD * 2);
  }
  const lead = size * 0.95;
  const base = H - 168;
  ctx.fillStyle = '#f2f1ee';
  lines.forEach((line, i) => ctx.fillText(line, PAD - 4, base - (lines.length - 1 - i) * lead));

  ctx.fillStyle = white(0.14);
  ctx.fillRect(PAD, H - 128, W - PAD * 2, 1.5);
  ctx.font = `400 22px ${MONO}`;
  spacing(ctx, '2px');
  ctx.fillStyle = white(0.62);
  ctx.fillText(spec.stack.join(' · '), PAD, H - 80);
  ctx.textAlign = 'right';
  ctx.fillText(spec.period, W - PAD, H - 80);
  ctx.beginPath();
  ctx.arc(W - PAD - 6, 140, 6, 0, Math.PI * 2);
  ctx.fillStyle = rgba(tint, 1);
  ctx.fill();
}

function toUrl(canvas: HTMLCanvasElement) {
  return new Promise<string>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error('Encoding failed'))), 'image/webp', 0.9),
  );
}

/** Renders one poster per project; callers own (and must revoke) the returned object URLs. */
export async function renderCovers(specs: CoverSpec[]) {
  await Promise.all([document.fonts.load(`500 104px ${SANS}`), document.fonts.load(`400 22px ${MONO}`)]).catch(() => undefined);
  return Promise.all(
    specs.map((spec) => {
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return Promise.reject(new Error('2D canvas unavailable'));
      const tint = WORK_TINTS[spec.kind];
      backdrop(ctx, tint);
      MOTIFS[spec.kind](ctx, tint);
      typeset(ctx, spec, tint);
      return toUrl(canvas);
    }),
  );
}
