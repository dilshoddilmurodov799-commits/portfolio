import type { CSSProperties, ReactNode } from 'react';
import GlassSurface from '../reactbits/GlassSurface';
import { cx } from '../../lib/cx';

export type GlassTier = 'chip' | 'control' | 'panel';

// One refraction recipe per tier: small surfaces bend light hard, large ones stay calm and legible.
type Recipe = { blur: number; distortionScale: number; backgroundOpacity: number; saturation: number; greenOffset: number; blueOffset: number };
const TIERS: Record<GlassTier, Recipe> = {
  chip: { blur: 9, distortionScale: -70, backgroundOpacity: 0.46, saturation: 1.2, greenOffset: 3, blueOffset: 6 },
  control: { blur: 10, distortionScale: -120, backgroundOpacity: 0.3, saturation: 1.4, greenOffset: 5, blueOffset: 10 },
  panel: { blur: 14, distortionScale: -80, backgroundOpacity: 0.38, saturation: 1.3, greenOffset: 4, blueOffset: 8 },
};

interface LiquidGlassProps {
  children: ReactNode;
  tier?: GlassTier;
  radius?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * ReactBits GlassSurface laid underneath arbitrary content, so any element can sit on
 * refracting liquid glass (SVG displacement on Chromium, frosted fallback elsewhere).
 */
export default function LiquidGlass({ children, tier = 'control', radius = 999, className, style }: LiquidGlassProps) {
  return (
    <span className={cx('relative isolate', className)} style={{ borderRadius: radius, ...style }}>
      <GlassSurface width="100%" height="100%" borderRadius={radius} className="!absolute inset-0 !z-0" {...TIERS[tier]} />
      {children}
    </span>
  );
}
