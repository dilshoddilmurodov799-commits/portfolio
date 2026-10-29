// Ashima / Stefan Gustavson 3D simplex noise (MIT).
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uPixelRatio;
uniform float uSize;
uniform float uOpacity;
uniform float uAspect;
uniform float uPointerStrength;
uniform float uVelocity;
uniform float uHeroExit;
uniform float uScroll;
uniform float uFlow;
uniform vec2 uPointer;
uniform vec3 uSphereCenter;
uniform vec3 uRingCenter;
uniform float uRingScale;

attribute vec3 aSphere;
attribute vec3 aField;
attribute vec3 aRing;
attribute vec4 aRandom;

varying float vAlpha;
varying float vAccent;

${noise}

vec3 rotY(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z); }
vec3 rotZ(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(c*p.x - s*p.y, s*p.x + c*p.y, p.z); }

// Staggered 0..1 progress for the transition that starts at formation k.
float stage(float k){
  float p = clamp(uMorph - k, 0., 1.);
  return smoothstep(0., 1., clamp(p * 1.6 - aRandom.x * 0.6, 0., 1.));
}

void main(){
  float t = uTime;

  // 0 — Terrain: a slow landscape flowing toward the viewer.
  vec3 terrain = position;
  terrain.z = mod(terrain.z + t * 0.35 + uHeroExit * 7. + 18., 22.) - 18.;
  float h = snoise(vec3(terrain.x * .15, terrain.z * .15, t * .05)) * .95
          + snoise(vec3(terrain.x * .45, terrain.z * .45, t * .08 + 4.)) * .22;
  terrain.y = -2.05 + h * smoothstep(4., -6., terrain.z) + h * .25;

  // 1 — Sphere: breathing core, slowly rotating.
  vec3 sp = aSphere;
  sp *= 1. + snoise(sp * .9 + t * .14) * .07;
  sp = rotY(sp, t * .07) + uSphereCenter;

  // 2 — Field: deep volume, drifts with page and reel progress.
  vec3 fd = aField;
  fd.y = mod(fd.y + uScroll * 30. * (.35 + aRandom.y * .65) + 12., 24.) - 12.;
  fd.x = mod(fd.x - uFlow * 16. * (.4 + aRandom.y * .6) + 14., 28.) - 14.;
  fd.xy += .18 * vec2(sin(t * .21 + aRandom.y * 6.28), cos(t * .17 + aRandom.x * 6.28));

  // 3 — Ring: differential orbit, inner particles travel faster.
  vec3 rg = aRing * uRingScale;
  rg = rotZ(rg, t * (.3 / max(length(aRing.xy), .5)));
  rg.z += sin(t * .6 + aRandom.y * 6.28) * .07;
  rg += uRingCenter;

  float s0 = stage(0.);
  float s1 = stage(1.);
  float s2 = stage(2.);
  vec3 pos = mix(terrain, sp, s0);
  pos = mix(pos, fd, s1);
  pos = mix(pos, rg, s2);

  // Particles swirl through curl-ish noise mid-transition rather than travelling in straight lines.
  float swirl = sin(3.14159 * s0) + sin(3.14159 * s1) + sin(3.14159 * s2);
  vec3 q = pos * .28 + vec3(0., t * .18, 0.);
  vec3 drift = vec3(snoise(q), snoise(q + 31.4), snoise(q + 17.7));
  pos += drift * (swirl * .9 + .035 + min(abs(uVelocity), 40.) * .006);
  pos.y += uVelocity * .01 * (.25 + aRandom.y);

  vec4 mv = modelViewMatrix * vec4(pos, 1.);
  gl_Position = projectionMatrix * mv;

  // Magnetic pointer: push particles away in screen space with a soft falloff.
  vec2 ndc = gl_Position.xy / gl_Position.w;
  vec2 d = ndc - uPointer;
  d.x *= uAspect;
  float dist = length(d);
  float force = smoothstep(.36, 0., dist) * uPointerStrength;
  vec2 dir = d / max(dist, 1e-4);
  dir.x /= uAspect;
  gl_Position.xy += dir * force * .065 * gl_Position.w;

  float depth = -mv.z;
  // The terrain is seen from further away than the other formations: give it more weight.
  float size = uSize * mix(.55, 1.65, aRandom.z * aRandom.z) * uPixelRatio * mix(1.7, 1., s0);
  gl_PointSize = max(size * (8. / depth) * (1. + force * .7), 1.);

  float a = smoothstep(34., 7., depth) * smoothstep(.8, 2.6, depth);
  float terrainFade = smoothstep(-18., -12., terrain.z) * smoothstep(4., 1.5, terrain.z) * smoothstep(15., 9., abs(terrain.x));
  a *= mix(terrainFade, 1., s0);
  float fieldFade = smoothstep(12., 8.5, abs(fd.y)) * smoothstep(14., 10.5, abs(fd.x));
  a *= mix(1., fieldFade, s1 * (1. - s2));

  vAlpha = min(a * mix(1.9, 1., s0), 1.) * uOpacity;
  vAccent = step(.968, aRandom.w) + force * .55;
}
`;

export const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uAccent;
varying float vAlpha;
varying float vAccent;

void main(){
  float d = length(gl_PointCoord - .5);
  float disc = smoothstep(.5, 0., d);
  disc *= disc;
  float alpha = disc * vAlpha;
  if (alpha < .003) discard;
  gl_FragColor = vec4(mix(uColor, uAccent, clamp(vAccent, 0., 1.)), alpha);
}
`;
