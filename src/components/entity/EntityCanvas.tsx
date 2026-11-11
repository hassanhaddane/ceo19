'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Color, Group, LinearFilter, LinearMipmapLinearFilter, MathUtils, Mesh, PerspectiveCamera, PlaneGeometry, ShaderMaterial, SRGBColorSpace, Texture, Vector3 } from 'three';
import type { AudioManager } from '@/features/audio/AudioManager';
import { useSoundManager } from '@/features/audio/SoundProvider';
import { entityBass } from './entityAudio';
import { buildEntityShards, logoSpan } from './entityGeometry';
import { createEntityMaterial, createRiftLight } from './entityShaders';
import type { EntitySignal } from './entitySignal';

type ViewportPose = { x: number; y: number; height: number; dolly: number; orbit: number; roll: number };
const desktop: ViewportPose[] = [
 { x: .055, y: -.24, height: .23, dolly: 7.4, orbit: .18, roll: -.068 },
 { x: .177, y: .085, height: .72, dolly: 6.1, orbit: -.12, roll: .045 },
 { x: .09, y: -.018, height: .71, dolly: 9.2, orbit: .28, roll: -.04 },
 { x: .30, y: .018, height: .22, dolly: 7.8, orbit: -.10, roll: .035 },
];
const mobile: ViewportPose[] = [
 { x: .10, y: -.23, height: .20, dolly: 7.9, orbit: .13, roll: -.06 },
 { x: 0, y: .13, height: .33, dolly: 6.8, orbit: -.09, roll: .025 },
 { x: .01, y: .002, height: .39, dolly: 8.9, orbit: .18, roll: -.035 },
 { x: .32, y: .074, height: .16, dolly: 7.9, orbit: -.11, roll: .04 },
];
const tablet: ViewportPose[] = desktop.map((pose, index) =>
 index === 1 ? { ...pose, x: .19, y: .035, height: .48 } : pose,
);
type StageProps = { signal: EntitySignal; active: boolean; onReady: () => void; onFailure: () => void };
type RigProps = StageProps & { atlas: HTMLImageElement; maxDpr: number; sound: AudioManager };
const mix = MathUtils.lerp;
const damp = MathUtils.damp;
const unit = (n: number) => MathUtils.clamp(n, 0, 1);
const origin = new Vector3();
const signatureInk = new Color('#3572a3');

function createRigState(signal: EntitySignal, maxDpr: number) {
 return {
  p: signal.frame.progress, scrollAngle: signal.frame.scrollAngle, home: signal.frame.homeVisibility, finish: signal.frame.contactVisibility, seam: 0, x: 0, y: 0, age: 0, entry: 0, bass: 0,
  frames: 0, delta: 0, quality: maxDpr, right: new Vector3(), up: new Vector3(),
 };
}

function EntityRig({ signal, active, atlas, maxDpr, sound, onReady, onFailure }: RigProps) {
 const root = useRef<Group>(null);
 const lightMesh = useRef<Mesh>(null);
 const meshes = useRef<(Mesh | null)[]>([]);
 const radio = useRef<HTMLAudioElement | null>(null);
 const warmup = useRef(0);
 const invalidate = useThree(state => state.invalidate);
 const gl = useThree(state => state.gl);
 const rig = useRef<ReturnType<typeof createRigState> | null>(null);
 if (rig.current === null) rig.current = createRigState(signal, maxDpr);

 const { shards, prints, surface, light, lightPlane } = useMemo(() => {
  const prints = new Texture(atlas);
  prints.colorSpace = SRGBColorSpace;
  prints.magFilter = LinearFilter;
  prints.minFilter = LinearMipmapLinearFilter;
  prints.needsUpdate = true;
  return {
   shards: buildEntityShards(), prints, surface: createEntityMaterial(prints), light: createRiftLight(),
   lightPlane: new PlaneGeometry(7.1, 6.3),
  };
 }, [atlas]);

 useEffect(() => {
  radio.current = document.querySelector<HTMLAudioElement>('audio[data-background-music]');
  const onContextLost = (event: Event) => { event.preventDefault(); onFailure(); };
  gl.domElement.addEventListener('webglcontextlost', onContextLost);
  return () => gl.domElement.removeEventListener('webglcontextlost', onContextLost);
 }, [gl, onFailure]);
 useEffect(() => () => {
  for (const shard of shards) shard.geometry.dispose();
  surface.dispose();
  light.dispose();
  lightPlane.dispose();
  prints.dispose();
 }, [shards, surface, light, lightPlane, prints]);
 useEffect(() => {
  const wake = () => { if (active) invalidate(); };
  const detachMotion = signal.subscribe(wake);
  const detachSound = sound.subscribe(wake);
  invalidate();
  return () => { detachMotion(); detachSound(); };
 }, [active, invalidate, signal, sound]);
 useFrame((state, elapsed) => {
  const group = root.current;
  const frame = rig.current;
  const surfaceMaterial = meshes.current[0]?.material;
  const lightMaterial = lightMesh.current?.material;
  if (!group || !frame || !(surfaceMaterial instanceof ShaderMaterial) || !(lightMaterial instanceof ShaderMaterial)) return;
  if (warmup.current < 2) {
   warmup.current++;
   if (warmup.current === 2) {
    state.gl.domElement.setAttribute('data-entity-ready', 'true');
    onReady();
   } else invalidate();
  }
  const dt = Math.min(elapsed, .045);
  const input = signal.frame;
  if (active) {
   frame.age += dt;
   frame.entry = Math.min(1, frame.entry + dt / 1.35);
   frame.p = damp(frame.p, input.progress, 11, dt);
   frame.scrollAngle = damp(frame.scrollAngle, input.scrollAngle, 16, dt);
   frame.home = damp(frame.home, input.homeVisibility, 12, dt);
   frame.finish = damp(frame.finish, input.contactVisibility, 12, dt);
   frame.seam = damp(frame.seam, input.seam, 12, dt);
   frame.x = damp(frame.x, input.x, 7, dt);
   frame.y = damp(frame.y, input.y, 7, dt);
   frame.bass = damp(frame.bass, entityBass(radio.current, sound.getSnapshot()), 19, dt);
  }
  const compact = state.size.width < 768;
  const path = compact ? mobile : state.size.width < 1024 ? tablet : desktop;
  const chapter = Math.min(2, Math.floor(frame.p));
  const progress = unit(frame.p - chapter);
  const from = path[chapter], to = path[chapter + 1];
  const home = frame.home;
  const music = Math.max(0, 1 - Math.abs(frame.p - 1));
  const archive = Math.max(0, 1 - Math.abs(frame.p - 2));
  const finish = frame.finish;
  const intact = Math.max(home, finish);
  const dust = 1 - intact;
  const entry = 1 - Math.pow(1 - frame.entry, 3);
  const fracture = frame.seam * .21 + (1 - entry) * home * .33;
  const yaw = mix(from.orbit, to.orbit, progress) + frame.x * .18;
  const pitch = .09 + frame.y * .14 - archive * .13;
  const z = mix(from.dolly, to.dolly, progress) - frame.seam * .42;
  const camera = state.camera as PerspectiveCamera;
  camera.position.set(Math.sin(yaw) * z, Math.sin(pitch) * z, Math.cos(yaw) * z);
  camera.lookAt(origin);
  camera.updateMatrixWorld();
  const height = 2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.length();
  frame.right.setFromMatrixColumn(camera.matrixWorld, 0);
  frame.up.setFromMatrixColumn(camera.matrixWorld, 1);
  const anchor = input.homeAnchor && home > finish ? input.homeAnchor : input.contactAnchor;
  const viewport = anchor && intact > .005 ? state.gl.domElement.getBoundingClientRect() : null;
  const aligned = viewport && viewport.width > 0 && viewport.height > 0 ? viewport : null;
  const anchored = aligned ? intact : 0;
  const x = anchor && aligned ? (anchor.x - aligned.left) / aligned.width - .5 : 0;
  const y = anchor && aligned ? .5 - (anchor.y - aligned.top) / aligned.height : 0;
  const span = anchor && aligned ? anchor.span / aligned.height : 0;
  group.position.copy(frame.right).multiplyScalar(mix(mix(from.x, to.x, progress), x, anchored) * height * camera.aspect)
   .addScaledVector(frame.up, mix(mix(from.y, to.y, progress), y, anchored) * height);
  group.scale.setScalar(height * mix(mix(from.height, to.height, progress), span, anchored) / logoSpan);
  const nearestFront = Math.round(frame.scrollAngle / (Math.PI * 2)) * Math.PI * 2;
  const turn = mix(frame.scrollAngle, nearestFront, finish);
  group.rotation.set(-frame.y * .12 + archive * .06, turn - frame.x * .16,
   mix(from.roll, to.roll, progress) - (1 - entry) * home * .12);
  group.visible = intact > .008 || frame.seam > .008 || music + archive > .1;

  shards.forEach((shard, index) => {
   const mesh = meshes.current[index];
   if (!mesh) return;
   const angle = (index + .38) / shards.length * Math.PI * 2;
   const a = Math.cos(angle), b = Math.sin(angle);
   // Loose filings drift at the edges of the artwork and photographs.
   const jaws = 1 / Math.max(Math.abs(a), Math.abs(b));
   const musicX = a * jaws * (2.53 + .25 * Math.sin(index * 2.4));
   const musicY = b * jaws * (2.08 + .25 * Math.cos(index * 1.7)) * (compact && b < 0 ? .57 : 1);
   const column = index % 8;
   const row = index < 8 ? 1 : -1;
   const archiveX = (column - 3.5) * (compact ? .72 : 1.43) + row * .32;
   const archiveY = row * ((compact ? 2.78 : 1.54) + Math.sin(column * 1.6) * (compact ? .14 : .29)) + (compact ? 0 : .19);
   const tear = (index % 2 ? 1 : -1) * fracture;
   mesh.position.set(
    shard.x * intact + (musicX * music + archiveX * archive) * dust + (shard.x * .67 + tear * .5) * fracture,
    shard.y * intact + (musicY * music + archiveY * archive) * dust + (shard.y * .52 + tear * .42) * fracture,
    Math.sin(index * 2.39) * (fracture * 1.45) - music * (.32 + (index % 4) * .34) - archive * (index % 4) * .34,
   );
   mesh.rotation.set(tear * .6 + b * music * .36 + row * archive * .39,
    tear * .94 + a * music * .66 + archive * (column - 3.5) * .16, tear * .48 + music * (.18 - angle * .12) + row * archive * .11);
   const width = mix(compact ? .10 : .15, 1, intact);
   mesh.scale.set(width, width, 1 + fracture * 1.46 + frame.bass * .18 + finish * .47);
  });

  const uniforms = surfaceMaterial.uniforms;
  uniforms.uTime.value = frame.age;
  uniforms.uSeam.value = fracture;
  uniforms.uBass.value = frame.bass;
  uniforms.uVisibility.value = .075 + intact * .9;
  uniforms.uMusic.value = music;
  uniforms.uArchive.value = archive;
  uniforms.uFinish.value = finish;
  uniforms.uInk.value.copy(signatureInk);
  lightMaterial.uniforms.uInk.value.copy(signatureInk);
  lightMaterial.uniforms.uPower.value = uniforms.uVisibility.value * (.045 + fracture * .18 + frame.bass * .14 + finish * .10);
  lightMaterial.uniforms.uTime.value = frame.age;

  if (!active) return;
  if (elapsed < .09) {
   frame.frames++;
   frame.delta += elapsed;
   if (frame.frames === 48) {
    const average = frame.delta / frame.frames;
    const quality = MathUtils.clamp(frame.quality + (average > .024 ? -.18 : average < .016 ? .12 : 0), .72, maxDpr);
    if (quality !== frame.quality) state.setDpr(quality);
    frame.quality = quality;
    frame.frames = 0;
    frame.delta = 0;
   }
  }
  const travel = Math.abs(frame.p - input.progress) + Math.abs(frame.seam - input.seam) +
   Math.abs(frame.x - input.x) + Math.abs(frame.y - input.y) +
   Math.abs(frame.home - input.homeVisibility) + Math.abs(frame.finish - input.contactVisibility) +
   Math.abs(frame.scrollAngle - input.scrollAngle);
  const audioState = sound.getSnapshot();
  if (frame.entry < 1 || travel > .001 || intact > .52 ||
   frame.bass > .001 || (audioState.isPlaying && !audioState.muted && audioState.volume > 0)) invalidate();
 });

 return <group ref={root} dispose={null}>
  <mesh ref={lightMesh} position={[0, 0, -1.65]} geometry={lightPlane} material={light} />
  {shards.map(({ geometry }, index) => <mesh key={index}
   ref={mesh => { meshes.current[index] = mesh; }} geometry={geometry} material={surface} />)}
 </group>;
}

export default function EntityCanvas(props: StageProps) {
 const sound = useSoundManager();
 return <CanvasHost {...props} sound={sound} />;
}

const CanvasHost = memo(function CanvasHost(props: StageProps & { sound: AudioManager }) {
 const [atlas, setAtlas] = useState<HTMLImageElement | null>(null);
 const [device] = useState(() => {
  const small = matchMedia('(max-width:767px)').matches;
  const device = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  const constrained = small || device.connection?.saveData || (device.deviceMemory !== undefined && device.deviceMemory <= 4) ||
   (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
  return { maxDpr: Math.max(.8, Math.min(devicePixelRatio, constrained ? 1.08 : 1.55)), antialias: !constrained };
 });
 const { onFailure } = props;
 useEffect(() => {
  let disposed = false;
  const image = new Image();
  image.decoding = 'async';
  image.src = '/media/entity/imprints.webp';
  void image.decode().then(() => { if (!disposed) setAtlas(image); }).catch(() => { if (!disposed) onFailure(); });
  return () => { disposed = true; };
 }, [onFailure]);

 if (!atlas) return null;
 return <Canvas frameloop="demand" dpr={device.maxDpr} camera={{ fov: 37, near: .1, far: 42 }}
  gl={{ alpha: true, antialias: device.antialias, powerPreference: 'low-power' }}
  onCreated={({ gl }) => { gl.debug.onShaderError = onFailure; }}>
  <EntityRig {...props} atlas={atlas} maxDpr={device.maxDpr} />
 </Canvas>;
});
