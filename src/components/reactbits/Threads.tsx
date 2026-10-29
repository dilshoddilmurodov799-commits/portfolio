// Adapted from ReactBits — Threads (https://reactbits.dev, MIT + Commons Clause).
// Forty noise-driven lines fan out across the canvas and drift; the pointer nudges their phase.
// Renders only while on screen.
import { useEffect, useRef } from 'react';
import { Color, Mesh, Program, Renderer, Triangle } from 'ogl';

interface ThreadsProps {
  /** RGB, 0–1. */
  color?: [number, number, number];
  amplitude?: number;
  distance?: number;
  mouse?: boolean;
  className?: string;
}

const vertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int LINE_COUNT = 40;
const float LINE_WIDTH = 7.0;
const float LINE_BLUR = 10.0;

float Perlin2D(vec2 P) {
  vec2 Pi = floor(P);
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
  Pt += vec2(26.0, 161.0).xyxy;
  Pt *= Pt;
  Pt = Pt.xzxz * Pt.yyww;
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));
  vec4 grad_x = hash_x - 0.49999;
  vec4 grad_y = hash_y - 0.49999;
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y) * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
  grad_results *= 1.4142135623730950;
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));
  return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
  return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, vec2 mouse, float time, float amplitude, float distance) {
  float split_point = 0.1 + perc * 0.4;
  float amplitude_normal = smoothstep(split_point, 0.7, st.x);
  float finalAmplitude = amplitude_normal * 0.5 * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);
  float time_scaled = time / 10.0 + (mouse.x - 0.5);
  float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;
  float xnoise = mix(
    Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
    Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
    st.x * 0.3
  );
  float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;
  float edge = LINE_BLUR * pixel(1.0, iResolution.xy) * blur;
  float line_start = smoothstep(y + width / 2.0 + edge, y, st.y);
  float line_end = smoothstep(y, y - width / 2.0 - edge, st.y);
  return clamp((line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))), 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float line_strength = 1.0;
  for (int i = 0; i < LINE_COUNT; i++) {
    float p = float(i) / float(LINE_COUNT);
    line_strength *= 1.0 - lineFn(uv, LINE_WIDTH * pixel(1.0, iResolution.xy) * (1.0 - p), p, uMouse, iTime, uAmplitude, uDistance);
  }
  float colorVal = 1.0 - line_strength;
  gl_FragColor = vec4(uColor * colorVal, colorVal);
}
`;

export default function Threads({ color = [1, 1, 1], amplitude = 1, distance = 0, mouse = false, className }: ThreadsProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio, 1.25) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    el.appendChild(gl.canvas);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Color(1, 1, 1) },
        uColor: { value: new Color(...color) },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      const res = program.uniforms.iResolution.value as Color;
      res.r = gl.canvas.width;
      res.g = gl.canvas.height;
      res.b = gl.canvas.width / gl.canvas.height;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();

    const target = [0.5, 0.5];
    const current = [0.5, 0.5];
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target[0] = (e.clientX - r.left) / r.width;
      target[1] = 1 - (e.clientY - r.top) / r.height;
    };
    if (mouse) window.addEventListener('pointermove', onMove, { passive: true });

    let raf = 0;
    const frame = (t: number) => {
      const m = program.uniforms.uMouse.value as Float32Array;
      current[0] += (target[0] - current[0]) * 0.05;
      current[1] += (target[1] - current[1]) * 0.05;
      m[0] = current[0];
      m[1] = current[1];
      program.uniforms.iTime.value = t * 0.001;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(frame);
    };
    // Only spend GPU time while the section is visible.
    const visibility = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(frame);
    });
    visibility.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      visibility.disconnect();
      observer.disconnect();
      window.removeEventListener('pointermove', onMove);
      el.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [color, amplitude, distance, mouse]);

  return <div ref={container} aria-hidden="true" className={className} />;
}
