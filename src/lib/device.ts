export type Tier = 'high' | 'medium' | 'low';

export interface Quality {
  tier: Tier;
  particles: number;
  dpr: [number, number];
}

const QUALITY: Record<Tier, Quality> = {
  high: { tier: 'high', particles: 22000, dpr: [1, 1.75] },
  medium: { tier: 'medium', particles: 14000, dpr: [1, 1.5] },
  low: { tier: 'low', particles: 6500, dpr: [1, 1.5] },
};

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Picks a particle budget from cheap device signals; null when WebGL is unavailable. */
export function detectQuality(): Quality | null {
  if (!hasWebGL()) return null;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

  if (coarse || width < 768 || memory <= 2) return QUALITY.low;
  if (width < 1280 || cores < 8 || memory <= 4) return QUALITY.medium;
  return QUALITY.high;
}

let cached: Quality | null | undefined;

/** Device tier, detected once per session and shared by every effect that needs a budget. */
export function getQuality() {
  if (cached === undefined) cached = detectQuality();
  return cached;
}
