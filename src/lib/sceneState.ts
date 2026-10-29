/**
 * Mutable bridge between DOM scroll choreography and the WebGL scene.
 * Written by ScrollTriggers / pointer listeners, read inside useFrame —
 * deliberately not React state so nothing re-renders per frame.
 */
export const sceneState = {
  /** Pointer in normalized device coordinates (-1..1). */
  pointerX: 0,
  pointerY: 0,
  /** Raw Lenis velocity; decays inside the render loop. */
  velocity: 0,
  /** Formation index: 0 terrain → 1 sphere → 2 field → 3 ring. */
  morph: 0,
  /** 0..1 progress of scrolling out of the hero. */
  heroExit: 0,
  /** 0..1 progress through the pinned horizontal work reel. */
  flow: 0,
  /** 0..1 progress of the whole page. */
  scroll: 0,
  /** Called by DOM code when the scene must redraw in on-demand mode. */
  invalidate: () => {},
};
