/**
 * The site's light palette. Every light source — rays, laser, glass caustics, dithered
 * portrait, masked headings — draws from these few values so they read as one installation.
 */
export const LIGHT = {
  ink: '#07080a',
  paper: '#f2f1ee',
  warm: '#ffd9b5',
  ember: '#ff6a3d',
  cool: '#c7d2ff',
} as const;

/** Paint used inside masked headings: warm paper with slow ember and cool hot spots. */
export const LIGHT_MESH = [
  `radial-gradient(38% 70% at 18% 35%, ${LIGHT.warm} 0%, transparent 70%)`,
  `radial-gradient(26% 60% at 72% 58%, rgb(255 106 61 / 0.95) 0%, transparent 72%)`,
  `radial-gradient(30% 80% at 96% 20%, ${LIGHT.cool} 0%, transparent 70%)`,
  `linear-gradient(100deg, ${LIGHT.paper} 0%, #d8d3cb 55%, ${LIGHT.paper} 100%)`,
].join(', ');
