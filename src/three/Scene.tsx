import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene as ThreeScene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { buildFormations } from './formations';
import { fragmentShader, vertexShader } from './shaders';
import { sceneState } from '../lib/sceneState';
import type { Quality } from '../lib/device';

interface SceneProps {
  quality: Quality;
  reduced: boolean;
}

const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * Fixed full-viewport particle field. One draw call: a single Points object whose vertex
 * shader blends four precomputed formations, driven by the shared sceneState.
 * Plain three.js (no reconciler) keeps this lazy chunk small and the loop fully under our control.
 */
export default function Scene({ quality, reduced }: SceneProps) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: false, alpha: true, depth: false, stencil: false, powerPreference: 'high-performance' });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new ThreeScene();
    const camera = new PerspectiveCamera(38, 1, 0.1, 60);
    camera.position.set(0, 0.9, 9);

    const f = buildFormations(quality.particles);
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(f.terrain, 3));
    geometry.setAttribute('aSphere', new BufferAttribute(f.sphere, 3));
    geometry.setAttribute('aField', new BufferAttribute(f.field, 3));
    geometry.setAttribute('aRing', new BufferAttribute(f.ring, 3));
    geometry.setAttribute('aRandom', new BufferAttribute(f.random, 4));

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: sceneState.morph },
        uPixelRatio: { value: 1 },
        uSize: { value: quality.tier === 'low' ? 3.1 : 2.5 },
        uOpacity: { value: 0 },
        uAspect: { value: 1 },
        uPointerStrength: { value: coarse ? 0.35 : 1 },
        uVelocity: { value: 0 },
        uHeroExit: { value: 0 },
        uScroll: { value: 0 },
        uFlow: { value: 0 },
        uPointer: { value: new Vector2(-10, -10) },
        uSphereCenter: { value: new Vector3(2.4, 0.1, 0) },
        uRingCenter: { value: new Vector3(0, 0.2, -1.5) },
        uRingScale: { value: 1 },
        uColor: { value: new Color('#dfe3ea') },
        uAccent: { value: new Color('#ff6a3d') },
      },
    });
    const u = material.uniforms;

    const points = new Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    let dpr = Math.min(window.devicePixelRatio || 1, quality.dpr[1]);
    let raf = 0;

    const resize = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (!width || !height) return;
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const aspect = camera.aspect;
      const wide = aspect > 1.1;
      // The sphere sits beside the About copy on wide screens, behind it on narrow ones.
      u.uAspect.value = aspect;
      u.uPixelRatio.value = dpr;
      // On wide screens the ring frames the contact CTA on the right; on narrow ones it haloes the headline.
      u.uSphereCenter.value.set(wide ? Math.min(2.6, 1.55 * aspect) : 0, wide ? 0.1 : 1.0, wide ? 0 : -2.5);
      u.uRingCenter.value.set(wide ? 2.15 * aspect : 0, wide ? 0.15 : 1.2, wide ? -1.5 : -4);
      u.uRingScale.value = wide ? 1 : 1.75;
      if (reduced) sceneState.invalidate();
    };

    // Pointer starts far off-screen so the magnetic lens only appears once the mouse moves.
    let pointerSeen = false;
    const s = { morph: sceneState.morph, px: -10, py: -10, velocity: 0, heroExit: 0, scroll: 0, flow: 0, intro: reduced ? 1 : 0 };

    const update = (dt: number) => {
      // Reduced motion renders on demand and jumps straight to the target state.
      const follow = (current: number, target: number, lambda: number) => (reduced ? target : damp(current, target, lambda, dt));
      s.morph = follow(s.morph, sceneState.morph, 2.4);
      s.heroExit = follow(s.heroExit, sceneState.heroExit, 4);
      s.scroll = follow(s.scroll, sceneState.scroll, 3);
      s.flow = follow(s.flow, sceneState.flow, 3);
      if (!reduced && pointerSeen) {
        s.px = damp(s.px, sceneState.pointerX, 3, dt);
        s.py = damp(s.py, sceneState.pointerY, 3, dt);
      }
      if (!reduced) {
        sceneState.velocity *= Math.exp(-5 * dt);
        s.velocity = damp(s.velocity, Math.max(-60, Math.min(60, sceneState.velocity)), 6, dt);
        s.intro = damp(s.intro, 1, 0.9, dt);
        u.uTime.value += dt;
      }

      // Pull the particles back while content-dense sections are on screen.
      const dim = smoothstep(1.35, 1.9, s.morph) * (1 - smoothstep(2.3, 2.85, s.morph));
      u.uMorph.value = s.morph;
      u.uHeroExit.value = s.heroExit;
      u.uScroll.value = s.scroll;
      u.uFlow.value = s.flow;
      u.uVelocity.value = s.velocity;
      u.uPointer.value.set(s.px, s.py);
      // On narrow screens the sphere sits behind the About copy, so it steps back further.
      const sphereBehindText = camera.aspect < 1.1 ? smoothstep(0.4, 1, s.morph) * (1 - smoothstep(1.3, 1.9, s.morph)) : 0;
      u.uOpacity.value = s.intro * (1 - dim * 0.55) * (1 - sphereBehindText * 0.55);

      // Camera: gentle pointer parallax, sinking toward the terrain as the hero scrolls away.
      // In the hero it looks down over the terrain; later formations get a level, centred view.
      const heroWeight = 1 - smoothstep(0, 1, s.morph);
      const px = pointerSeen ? s.px : 0;
      const py = pointerSeen ? s.py : 0;
      camera.position.x = follow(camera.position.x, px * 0.45, 2.5);
      camera.position.y = follow(camera.position.y, 0.3 + (0.6 - s.heroExit * 0.7) * heroWeight + py * 0.25, 2.5);
      camera.position.z = 9 - s.heroExit * 0.9 * heroWeight;
      camera.lookAt(0, -0.55 * heroWeight, 0);
    };

    // Adaptive resolution: step the pixel ratio down once if frames run long (ignores the first 3s).
    const perf = { elapsed: -3, frames: 0 };
    const adapt = (dt: number) => {
      perf.elapsed += dt;
      if (perf.elapsed < 0) return;
      perf.frames++;
      if (perf.elapsed < 2) return;
      if (perf.frames / perf.elapsed < 45 && dpr > quality.dpr[0]) {
        dpr = Math.max(quality.dpr[0], dpr - 0.25);
        resize();
      }
      perf.elapsed = 0;
      perf.frames = 0;
    };

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      update(dt);
      renderer.render(scene, camera);
      adapt(dt);
      raf = requestAnimationFrame(tick);
    };

    const renderOnce = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        update(0);
        renderer.render(scene, camera);
      });
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      if (reduced) renderOnce();
      else raf = requestAnimationFrame(tick);
    };

    const onPointer = (e: PointerEvent) => {
      if (!pointerSeen) {
        pointerSeen = true;
        s.px = (e.clientX / window.innerWidth) * 2 - 1;
        s.py = -(e.clientY / window.innerHeight) * 2 + 1;
      }
      sceneState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointerY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };

    if (reduced) sceneState.invalidate = renderOnce;
    else window.addEventListener('pointermove', onPointer, { passive: true });
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', start);
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', start);
      sceneState.invalidate = () => {};
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [quality, reduced]);

  return <div ref={host} className="scene-layer" aria-hidden="true" />;
}
