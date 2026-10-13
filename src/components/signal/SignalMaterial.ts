import { Color, DoubleSide, MeshPhysicalMaterial, type IUniform } from 'three';
import type { Quality } from './signalStates';

export interface SignalUniforms { [key: string]: IUniform; uDuality: IUniform<number>; uArchitecture: IUniform<number>; uTime: IUniform<number>; uMorph: IUniform<number>; uLens: IUniform<number>; uNoiseAmplitude: IUniform<number>; uNoiseFrequency: IUniform<number>; uFrequency: IUniform<number>; uFragmentation: IUniform<number>; uWireframe: IUniform<number>; uNodes: IUniform<number>; uBlue: IUniform<Color>; }

// Coherent gradient noise. Quintic interpolation keeps deformation derivatives continuous.
const surfaceShader = /* glsl */ `
attribute vec2 signalTile;
uniform float uDuality, uArchitecture, uTime, uMorph, uLens, uNoiseAmplitude, uNoiseFrequency, uFrequency, uFragmentation;
varying vec2 vSignalUv;
uniform float uNoiseStrength, uNoiseSpeed;
vec3 signalGradient(vec3 p) {
 p = vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));
 return -1.0 + 2.0 * fract(sin(p)*43758.5453);
}
float signalNoise(vec3 p) {
 vec3 i = floor(p), f = fract(p), w = f*f*f*(f*(f*6.0-15.0)+10.0);
 return mix(mix(mix(dot(signalGradient(i),f),dot(signalGradient(i+vec3(1,0,0)),f-vec3(1,0,0)),w.x),
 mix(dot(signalGradient(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(signalGradient(i+vec3(1,1,0)),f-vec3(1,1,0)),w.x),w.y),
 mix(mix(dot(signalGradient(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(signalGradient(i+vec3(1,0,1)),f-vec3(1,0,1)),w.x),
 mix(dot(signalGradient(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(signalGradient(i+vec3(1,1,1)),f-vec3(1,1,1)),w.x),w.y),w.z);
}
vec3 signalSphere(vec2 st) {
 float theta = st.x * 6.28318530718;
 float phi = st.y * 3.14159265359;
 return 1.35 * vec3(sin(phi)*cos(theta), -cos(phi), sin(phi)*sin(theta));
}
vec3 signalSurface(vec2 st, vec2 tile) {
 // At fragmentation zero adjacent patches meet exactly, including the sphere seam.
 st = mix(st, tile, uFragmentation * 0.12);
 vec3 plane = vec3((st.x-.5)*3.7, (st.y-.5)*3.0, 0.0);
 plane.z = .34*cos(plane.x*.95)+.12*sin(plane.y*1.2+plane.x*.4);
 vec3 sphere = signalSphere(st);
 // A closed superellipsoid forms a bevelled architectural slab from the SAME UV vertices.
 vec3 directionBase = sphere / 1.35;
 // Ray projection onto a smooth box avoids unstable signed powers at the UV poles.
 vec3 q = abs(directionBase / vec3(.55,1.65,.24));
 float boxRadius = pow(pow(q.x,12.0)+pow(q.y,12.0)+pow(q.z,12.0),1.0/12.0);
 vec3 monolith = directionBase / max(boxRadius,.00001);
 float ledge = smoothstep(.12,.22,monolith.y);
 monolith.x = mix(monolith.x,monolith.x*.6+.2,ledge);
 vec3 p = mix(mix(plane, monolith, uArchitecture), sphere, uMorph);
 // The same UV strip folds into an annular optical surface; it is never replaced.
 float theta = st.x * 6.28318530718;
 float radius = 0.58 + st.y * 0.86;
 vec3 lens = vec3(cos(theta)*radius, sin(theta)*radius, .28*cos(st.y*3.14159265359));
 p = mix(p, lens, uLens);
 // Continuous waist separation: two lobes of the same surface, never two models.
 p.x += (smoothstep(-.06,.06,p.x)*2.0-1.0)*uDuality*.38;
 p.z += cos(st.x*6.28318530718)*uDuality*.18;
 vec3 noisePoint = p * uNoiseFrequency + vec3(0.0,0.0,uTime*uNoiseSpeed);
 float n = signalNoise(noisePoint);
 #ifndef SIGNAL_MOBILE
 n += .32 * signalNoise(noisePoint*1.9+vec3(4.7,1.2,0.0));
 #endif
 vec3 mixedDirection = mix(vec3(0,0,1), normalize(sphere), max(uMorph,uArchitecture)*(1.0-uLens));
 vec3 direction = length(mixedDirection) > .0001 ? normalize(mixedDirection) : normalize(sphere);
 p += direction * n * uNoiseAmplitude * uNoiseStrength;
 float wave = sin(st.x*25.0-uTime*.7)*.09 + sin(st.x*13.0+uTime*.45)*.065;
 p.z += wave * uFrequency;
 p.y *= 1.0 - .1*uFrequency;
 vec3 offset = signalGradient(vec3(tile*31.0, 7.0));
 p += offset * uFragmentation * .43;
 return p;
}
`;
const fragmentShader = /* glsl */ `
varying vec2 vSignalUv;
uniform vec3 uBlue;
uniform float uWireframe, uNodes;
`;

export function createSignalMaterial(quality: Quality, palette: { blue: string; black: string; cream: string; silver: string }, noiseStrength: number, noiseSpeed: number) {
 const uniforms: SignalUniforms = {
  uDuality: {value:0}, uArchitecture: { value: 0 }, uTime: { value: 0 }, uMorph: { value: 0 }, uLens: { value: 0 }, uNoiseAmplitude: { value: .22 },
  uNoiseFrequency: { value: 1.5 }, uFrequency: { value: 0 }, uFragmentation: { value: 0 },
  uWireframe: { value: 0 }, uNodes: { value: 0 }, uBlue: { value: new Color(palette.blue) }, uNoiseStrength: { value: noiseStrength }, uNoiseSpeed: { value: noiseSpeed }
 };
 const material = new MeshPhysicalMaterial({ color: palette.black, metalness: .68, roughness: .33, clearcoat: .28, clearcoatRoughness: .4, emissive: palette.blue, emissiveIntensity: .16, side: DoubleSide });
 material.customProgramCacheKey = () => `ceo-signal-channel-v3-${quality}`;
 material.onBeforeCompile = (shader) => {
  Object.assign(shader.uniforms, uniforms);
  shader.vertexShader = `${quality !== 'desktop' ? '#define SIGNAL_MOBILE\n' : ''}${surfaceShader}\n${shader.vertexShader}`;
  shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', /* glsl */ `
   vec3 center = signalSurface(uv, signalTile);
   vec3 du = signalSurface(uv+vec2(.0006,0),signalTile)-center;
   vec3 dv = signalSurface(uv+vec2(0,.0006),signalTile)-center;
   vec3 derived = cross(du,dv);
   vec3 objectNormal = length(derived) > .000000000001 ? normalize(derived) : (uMorph > .5 || uArchitecture > .5 ? normalize(signalSphere(uv)) : vec3(0,0,1));
   // Analytic box-gradient normals keep broad chrome faces polished at every quality level.
   // The inverse Jacobian accounts for the stepped architectural shoulder.
   vec3 ray = signalSphere(uv) / 1.35;
   vec3 halves = vec3(.55,1.65,.24);
   vec3 q = abs(ray / halves);
   float radius = pow(pow(q.x,12.0)+pow(q.y,12.0)+pow(q.z,12.0),1.0/12.0);
   vec3 slab = ray / max(radius,.00001);
   vec3 boxNormal = sign(ray) * pow(q,vec3(11.0)) / halves;
   float shoulderT = clamp((slab.y-.12)/.1,0.0,1.0);
   float shoulder = shoulderT*shoulderT*(3.0-2.0*shoulderT);
   float shoulderSlope = 6.0*shoulderT*(1.0-shoulderT)/.1;
   boxNormal.y -= boxNormal.x * (.2-.4*slab.x)*shoulderSlope / (1.0-.4*shoulder);
   boxNormal.x /= 1.0-.4*shoulder;
   objectNormal = normalize(mix(objectNormal,-normalize(boxNormal),uArchitecture*(1.0-uMorph)*(1.0-uLens)));
   #ifdef USE_TANGENT
    vec3 objectTangent = normalize(du);
   #endif
  `);
  shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = center; vSignalUv = uv;');
  shader.fragmentShader = `${fragmentShader}\n${shader.fragmentShader}`;
  shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', /* glsl */ `
   #include <emissivemap_fragment>
   float rim = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 3.0);
   totalEmissiveRadiance += uBlue * rim * .65;
   vec2 grid = abs(fract(vSignalUv*vec2(12.0,10.0)-.5)-.5) / max(fwidth(vSignalUv*vec2(12.0,10.0)),vec2(.0001));
   float trace = 1.0 - min(min(grid.x,grid.y),1.0);
   totalEmissiveRadiance += uBlue * trace * uWireframe;
   // Sparse UV junctions reveal the underlying signal structure; no extra network model.
   vec2 cell = fract(vSignalUv*vec2(8.0,6.0))-.5;
   float node = 1.0-smoothstep(.025,.06,length(cell));
   float sparse = step(.76,fract(sin(dot(floor(vSignalUv*vec2(8.0,6.0)),vec2(17.3,91.7)))*4375.3));
   totalEmissiveRadiance += uBlue * node * sparse * uNodes * 2.0;
  `);
 };
 return { material, uniforms, baseColor:new Color(palette.black), chromeColor:new Color(palette.silver) };
}
