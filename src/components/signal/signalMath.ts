export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (value: number) => { const t = clamp01(value); return t * t * (3 - 2 * t); };
export const damp = (a: number, b: number, speed: number, delta: number) => mix(a, b, 1 - Math.exp(-speed * delta));

/** CPU reference of the undeformed GPU mapping, also used for the static fallback. */
export function sampleBaseSurface(u: number, v: number, morph: number, lens = 0, architecture = 0, duality = 0): [number,number,number] {
 const theta = u*Math.PI*2, phi = v*Math.PI;
 const px = (u-.5)*3.7, py = (v-.5)*3;
 const pz = .34*Math.cos(px*.95)+.12*Math.sin(py*1.2+px*.4);
 const radius = .58+v*.86;
 const direction = [Math.sin(phi)*Math.cos(theta), -Math.cos(phi), Math.sin(phi)*Math.sin(theta)];
 const boxRadius = Math.pow(Math.pow(Math.abs(direction[0]/.55),12)+Math.pow(Math.abs(direction[1]/1.65),12)+Math.pow(Math.abs(direction[2]/.24),12),1/12);
 const monolith = direction.map(value=>value/Math.max(boxRadius,.00001));
 const ledge = smoothstep((monolith[1]-.12)/.1);
 monolith[0]=mix(monolith[0],monolith[0]*.6+.2,ledge);
 const x = mix(mix(px,monolith[0],architecture),1.35*Math.sin(phi)*Math.cos(theta),morph);
 const y = mix(mix(py,monolith[1],architecture),-1.35*Math.cos(phi),morph);
 const z = mix(mix(pz,monolith[2],architecture),1.35*Math.sin(phi)*Math.sin(theta),morph);
 const finalX=mix(x,Math.cos(theta)*radius,lens);
 return [finalX+(smoothstep((finalX+.06)/.12)*2-1)*duality*.38,mix(y,Math.sin(theta)*radius,lens),mix(z,.28*Math.cos(v*Math.PI),lens)+Math.cos(theta)*duality*.18];
}
