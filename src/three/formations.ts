/**
 * Precomputes the four particle formations the scene morphs between.
 * Every particle owns one slot in each formation; the vertex shader blends them.
 */
export interface Formations {
  terrain: Float32Array;
  sphere: Float32Array;
  field: Float32Array;
  ring: Float32Array;
  /** x: stagger, y: phase / depth bias, z: size, w: accent selector */
  random: Float32Array;
}

export function buildFormations(count: number): Formations {
  // Deterministic PRNG so the composition is identical on every visit.
  let seed = 1337;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = () => {
    const u = Math.max(rand(), 1e-6);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };

  const terrain = new Float32Array(count * 3);
  const sphere = new Float32Array(count * 3);
  const field = new Float32Array(count * 3);
  const ring = new Float32Array(count * 3);
  const random = new Float32Array(count * 4);

  const cols = Math.ceil(Math.sqrt(count * 1.5));
  const rows = Math.ceil(count / cols);
  const shellCount = Math.floor(count * 0.78);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Terrain: jittered grid on the XZ plane; height is animated in the shader.
    const c = i % cols;
    const r = Math.floor(i / cols);
    terrain[i3] = (c / (cols - 1) - 0.5) * 30 + (rand() - 0.5) * 0.1;
    terrain[i3 + 1] = 0;
    terrain[i3 + 2] = 4 - (r / Math.max(rows - 1, 1)) * 22 + (rand() - 0.5) * 0.1;

    // Sphere: Fibonacci shell plus a sparse volumetric core.
    if (i < shellCount) {
      const y = 1 - (i / (shellCount - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const R = 1.65 + gauss() * 0.02;
      sphere[i3] = Math.cos(theta) * radius * R;
      sphere[i3 + 1] = y * R;
      sphere[i3 + 2] = Math.sin(theta) * radius * R;
    } else {
      const u = rand() * 2 - 1;
      const phi = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const R = 1.45 * Math.cbrt(rand());
      sphere[i3] = Math.cos(phi) * s * R;
      sphere[i3 + 1] = u * R;
      sphere[i3 + 2] = Math.sin(phi) * s * R;
    }

    // Field: a calm, deep volume the camera drifts through.
    field[i3] = (rand() - 0.5) * 28;
    field[i3 + 1] = (rand() - 0.5) * 24;
    field[i3 + 2] = 3 - rand() * 24;

    // Ring: a dense torus with a thin outer orbit.
    const a = rand() * Math.PI * 2;
    const outer = rand() < 0.14;
    const rr = outer ? 2.55 + gauss() * 0.025 : 1.7 + gauss() * 0.17;
    ring[i3] = Math.cos(a) * rr;
    ring[i3 + 1] = Math.sin(a) * rr;
    ring[i3 + 2] = gauss() * (outer ? 0.02 : 0.13);

    const i4 = i * 4;
    random[i4] = rand();
    random[i4 + 1] = rand();
    random[i4 + 2] = rand();
    random[i4 + 3] = rand();
  }

  return { terrain, sphere, field, ring, random };
}
