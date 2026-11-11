import { AdditiveBlending, Color, ShaderMaterial, Texture } from 'three';

const vertexShader = /* glsl */ `
 attribute vec2 logoUv;
 attribute vec3 printUv;
 uniform float uTime;
 uniform float uSeam;
 uniform float uBass;
 varying vec2 vStamp;
 varying vec3 vNormal;
 varying vec3 vView;
 varying vec3 vPrint;

 void main() {
  vStamp = logoUv;
  vPrint = printUv;
  float grain = sin(logoUv.x * 81.0 + logoUv.y * 53.0 + uTime * 3.4);
  vec3 p = position + normal * grain * (uSeam * .027 + uBass * .009);
  vec4 view = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = -view.xyz;
  gl_Position = projectionMatrix * view;
 }
`;

const fragmentShader = /* glsl */ `
 uniform sampler2D uPrints;
 uniform float uTime;
 uniform float uSeam;
 uniform float uBass;
 uniform float uVisibility;
 uniform float uMusic;
 uniform float uArchive;
 uniform float uFinish;
 uniform float uPlate;
 uniform float uPrevious;
 uniform float uBlend;
 uniform vec3 uInk;
 varying vec2 vStamp;
 varying vec3 vNormal;
 varying vec3 vView;
 varying vec3 vPrint;

 float grit(vec2 p) {
  vec3 k = fract(vec3(p.xyx) * .1031);
  k += dot(k, k.yzx + 33.33);
  return fract((k.x + k.y) * k.z);
 }
 float strip(float x, float position, float width) {
  return 1.0 - smoothstep(width * .28, width, abs(x - position));
 }
 vec3 imprint(float tile, vec2 uv) {
  vec2 cell = vec2(mod(tile, 4.0), 2.0 - floor(tile / 4.0));
  return texture2D(uPrints, (cell + clamp(uv, .012, .988)) / vec2(4.0, 3.0)).rgb;
 }

 void main() {
  vec3 n = normalize(vNormal);
  vec3 eye = normalize(vView);
  vec3 r = reflect(-eye, n);
  float facing = max(dot(n, eye), 0.0);
  float fresnel = pow(1.0 - facing, 2.6);
  float face = smoothstep(.48, .91, abs(n.z));
  float grain = grit(floor(vStamp * vec2(2440.0, 1480.0)));
  float milled = sin(vStamp.y * 1120.0 + grain * 1.8) * .038;
  float moving = sin(uTime * .58 + vStamp.y * 4.5) * .14;
  float silver = strip(dot(r, normalize(vec3(.63,.62,.26))), .38 + moving, .24);
  silver += strip(dot(r, normalize(vec3(-.72,.22,.48))), -.19, .19) * .62;
  float blue = strip(dot(r, normalize(vec3(-.38,.84,.22))), -.28, .38);
  float cut = strip(dot(vStamp, vec2(.74, .92)), .84 + moving, .055);

  float casePlate = smoothstep(.38,.44,vStamp.y) * (1.0 - smoothstep(.54,.61,vStamp.y));
  float glass = clamp(casePlate * .9 + uMusic * .55 + uArchive * .28, 0.0, .92);
  vec3 ink = mix(vec3(.05,.17,.34), uInk, uMusic * .65);
  vec3 raw = vec3(.034,.047,.065) + (grain - .5) * .025 + milled * .45;
  vec3 chrome = raw + vec3(.33,.43,.54) * silver * (.55 + face * .22)
   + ink * (blue * 1.12 + fresnel * .95);
  vec3 bend = refract(-eye, n, .72);
  vec2 refractedUV = vStamp + bend.xy * (.085 + uSeam * .045) + (grain - .5) * .012;
  vec3 sleeve = mix(imprint(uPrevious, refractedUV), imprint(uPlate, refractedUV), uBlend);
  vec3 photo = imprint(6.0 + floor(vPrint.z + .5), vPrint.xy + bend.xy * .085);
  vec3 blueGlass = ink * (.68 + blue * .8) + vec3(.12,.37,.64) * (fresnel + cut * .52);
  blueGlass += sleeve * uMusic * .55;
  vec3 color = mix(chrome, blueGlass, glass * face);
  color = mix(color, photo * .81 + ink * .19, uArchive * face * .75);
  color += (1.0 - face) * (vec3(.09,.24,.44) * (.37 + fresnel) + silver * vec3(.22,.38,.59));
  color += vec3(.19,.49,.91) * cut * (.16 + uSeam * .58 + uBass * .72 + uFinish * .18);
  color += vec3(.5,.72,.96) * uBass * (.1 + fresnel * .28);
  float alpha = uVisibility * (1.0 - uArchive * .23);
  if (alpha < .006) discard;
  gl_FragColor = vec4(color, alpha);
  #include <colorspace_fragment>
 }
`;

export function createEntityMaterial(prints: Texture) {
 return new ShaderMaterial({
  vertexShader, fragmentShader, transparent: true, toneMapped: false,
  uniforms: {
   uPrints: { value: prints }, uInk: { value: new Color('#4689c8') },
   uTime: { value: 0 }, uBass: { value: 0 }, uSeam: { value: 0 },
   uVisibility: { value: 1 }, uMusic: { value: 0 }, uArchive: { value: 0 }, uFinish: { value: 0 },
   uPrevious: { value: 5 }, uPlate: { value: 5 }, uBlend: { value: 1 },
  },
 });
}

export function createRiftLight() {
 return new ShaderMaterial({
  transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false,
  uniforms: { uPower: { value: .2 }, uTime: { value: 0 }, uInk: { value: new Color('#3572a3') } },
  vertexShader: /* glsl */ `
   varying vec2 vUv;
   void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
   uniform float uPower;
   uniform float uTime;
   uniform vec3 uInk;
   varying vec2 vUv;
   void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float bend = (p.y < -.26 ? -.13 : p.y > .35 ? .11 : .0);
    float axis = p.x + p.y * .56 + bend;
    float falloff = pow(max(0.0, 1.0 - abs(p.y)), 1.9) * pow(max(0.0, 1.0 - abs(p.x)), 1.5);
    float ray = exp(-abs(axis) * 22.0) * .54 + exp(-abs(axis) * 5.2) * .39;
    float rings = .81 + sin(p.y * 24.0 + p.x * 10.0 - uTime) * .19;
    gl_FragColor = vec4(uInk * 1.6, ray * rings * falloff * uPower);
    #include <colorspace_fragment>
   }
  `,
 });
}
