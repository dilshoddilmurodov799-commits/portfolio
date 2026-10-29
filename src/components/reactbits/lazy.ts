import { lazy } from 'react';

// WebGL effects mount after the preloader or below the fold — keep them out of the entry chunk.
export const DitherVeil = lazy(() => import('./DitherVeil'));
export const SideRays = lazy(() => import('./SideRays'));
export const FlexCarousel = lazy(() => import('./FlexCarousel'));
export const FluidGlass = lazy(() => import('./FluidGlass'));
export const LaserFlow = lazy(() => import('./LaserFlow'));
export const Threads = lazy(() => import('./Threads'));
