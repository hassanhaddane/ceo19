'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Color, Group, LinearFilter, LinearMipmapLinearFilter, MathUtils, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, ShaderMaterial, SRGBColorSpace, Texture, Vector3 } from 'three';
import { releasePaletteSamples } from '@/data/releaseWorlds';
import { releases } from '@/data/releases';
import type { AudioManager } from '@/features/audio/AudioManager';
import { useSoundManager } from '@/features/audio/SoundProvider';
import type { ReleaseBlend } from '../music/releaseBlend';
import { useMusic } from '../music/MusicProvider';
import { entityBass } from './entityAudio';
import { buildEntityShards, buildPortalFrame, logoSpan } from './entityGeometry';
import { createEntityMaterial, createRiftLight } from './entityShaders';
import type { EntitySignal } from './entitySignal';

type ViewportPose = { x: number; y: number; height: number; dolly: number; orbit: number; roll: number };
const desktop: ViewportPose[] = [
 { x: .235, y: .075, height: .78, dolly: 7.4, orbit: .18, roll: -.068 },
 { x: .177, y: .085, height: .72, dolly: 6.1, orbit: -.12, roll: .045 },
 { x: .09, y: -.018, height: .71, dolly: 9.2, orbit: .28, roll: -.04 },
 { x: .266, y: .018, height: .51, dolly: 7.8, orbit: -.10, roll: .035 },
];
const mobile: ViewportPose[] = [
 { x: .13, y: .335, height: .33, dolly: 7.9, orbit: .13, roll: -.06 },
 { x: 0, y: .075, height: .37, dolly: 6.8, orbit: -.09, roll: .025 },
 { x: .01, y: .002, height: .39, dolly: 8.9, orbit: .18, roll: -.035 },
 { x: .18, y: .074, height: .29, dolly: 7.9, orbit: -.11, roll: .04 },
];
const portalProfiles = [
 { fold: -.19, skew: .24, depth: .42, flare: .16 },
 { fold: .23, skew: -.26, depth: .24, flare: .32 },
 { fold: -.34, skew: -.07, depth: .58, flare: .07 },
 { fold: .18, skew: .34, depth: .47, flare: .24 },
 { fold: .36, skew: -.29, depth: .36, flare: .35 },
 { fold: -.08, skew: .12, depth: .28, flare: .20 },
] as const;

type StageProps = { signal: EntitySignal; active: boolean; onReady: () => void; onFailure: () => void };
type RigProps = StageProps & { atlas: HTMLImageElement; releaseBlend: ReleaseBlend; maxDpr: number; sound: AudioManager };
const mix = MathUtils.lerp;
const damp = MathUtils.damp;
const unit = (n: number) => MathUtils.clamp(n, 0, 1);
const origin = new Vector3();
const signatureInk = new Color('#3572a3');
const releaseInks = releases.map(item => new Color(releasePaletteSamples[item.id as keyof typeof releasePaletteSamples]?.color ?? '#3572a3'));

function createRigState(signal: EntitySignal, maxDpr: number) {
 return {
  p: signal.frame.progress, seam: 0, x: 0, y: 0, age: 0, entry: 0, bass: 0,
  frames: 0, delta: 0, quality: maxDpr, right: new Vector3(), up: new Vector3(),
 };
}

function EntityRig({ signal, active, atlas, releaseBlend, maxDpr, sound, onReady, onFailure }: RigProps) {
 const root = useRef<Group>(null);
 const frameMesh = useRef<Mesh>(null);
 const lightMesh = useRef<Mesh>(null);
 const meshes = useRef<(Mesh | null)[]>([]);
 const radio = useRef<HTMLAudioElement | null>(null);
 const warmup = useRef(0);
 const invalidate = useThree(state => state.invalidate);
 const gl = useThree(state => state.gl);
 const rig = useRef<ReturnType<typeof createRigState> | null>(null);
 if (rig.current === null) rig.current = createRigState(signal, maxDpr);

 const { shards, prints, surface, light, lightPlane, frameShape, frameSurface } = useMemo(() => {
  const prints = new Texture(atlas);
  prints.colorSpace = SRGBColorSpace;
  prints.magFilter = LinearFilter;
  prints.minFilter = LinearMipmapLinearFilter;
  prints.needsUpdate = true;
  return {
   shards: buildEntityShards(), prints, surface: createEntityMaterial(prints), light: createRiftLight(),
   lightPlane: new PlaneGeometry(7.1, 6.3), frameShape: buildPortalFrame(),
   frameSurface: new MeshBasicMaterial({ color: '#72aada', transparent: true, depthWrite: false, toneMapped: false }),
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
  frameShape.dispose();
  frameSurface.dispose();
  prints.dispose();
 }, [shards, surface, light, lightPlane, frameShape, frameSurface, prints]);
 useEffect(() => {
  const wake = () => { if (active) invalidate(); };
  const detachMotion = signal.subscribe(wake);
  const detachSound = sound.subscribe(wake);
  const detachRelease = releaseBlend.subscribe(wake);
  invalidate();
  return () => { detachMotion(); detachSound(); detachRelease(); };
 }, [active, invalidate, signal, sound, releaseBlend]);
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
   frame.seam = damp(frame.seam, input.seam, 12, dt);
   frame.x = damp(frame.x, input.x, 7, dt);
   frame.y = damp(frame.y, input.y, 7, dt);
   frame.bass = damp(frame.bass, entityBass(radio.current, sound.getSnapshot()), 19, dt);
  }
  const compact = state.size.width < 768;
  const path = compact ? mobile : desktop;
  const chapter = Math.min(2, Math.floor(frame.p));
  const progress = unit(frame.p - chapter);
  const from = path[chapter], to = path[chapter + 1];
  const home = 1 - unit(frame.p);
  const music = Math.max(0, 1 - Math.abs(frame.p - 1));
  const archive = Math.max(0, 1 - Math.abs(frame.p - 2));
  const finish = unit(frame.p - 2);
  const entry = 1 - Math.pow(1 - frame.entry, 3);
  const fracture = frame.seam * .49 + (1 - entry) * home * .96;
  const release = releaseBlend.frame;
  const change = Math.sin(release.progress * Math.PI) * music;
  const previousPortal = portalProfiles[release.from], nextPortal = portalProfiles[release.to];
  const fold = mix(previousPortal.fold, nextPortal.fold, release.progress);
  const skew = mix(previousPortal.skew, nextPortal.skew, release.progress);
  const depth = mix(previousPortal.depth, nextPortal.depth, release.progress);
  const flare = mix(previousPortal.flare, nextPortal.flare, release.progress);
  const yaw = mix(from.orbit, to.orbit, progress) + frame.x * .26 + music * fold * .38 + change * release.direction * .14;
  const pitch = .09 + frame.y * .14 - archive * .13;
  const z = mix(from.dolly, to.dolly, progress) - frame.seam * .48 - change * .44 - music * depth * .52;
  const camera = state.camera as PerspectiveCamera;
  camera.position.set(Math.sin(yaw) * z, Math.sin(pitch) * z, Math.cos(yaw) * z);
  camera.lookAt(origin);
  camera.updateMatrixWorld();
  const height = 2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.length();
  frame.right.setFromMatrixColumn(camera.matrixWorld, 0);
  frame.up.setFromMatrixColumn(camera.matrixWorld, 1);
  group.position.copy(frame.right).multiplyScalar(mix(from.x, to.x, progress) * height * camera.aspect)
   .addScaledVector(frame.up, (mix(from.y, to.y, progress) + home * (1 - input.homeVisibility) * .16) * height);
  group.scale.setScalar(height * mix(from.height, to.height, progress) / logoSpan);
  group.rotation.set(-frame.y * .27 + archive * .06, -frame.x * .45 + home * .20 - finish * .18,
   mix(from.roll, to.roll, progress) - (1 - entry) * home * .24);

  const frameObject = frameMesh.current;
  if (frameObject) {
   frameObject.visible = music + archive > .03;
   frameObject.position.set(0, 0, -1.55 - change * .4);
   frameObject.rotation.set(-.06 + archive * .23, fold * music + archive * .24, change * .14);
   frameObject.scale.set(1 + archive * (compact ? .11 : .96), 1 + archive * (compact ? .25 : -.23) - (compact ? music * .20 : 0), 1);
   if (frameObject.material instanceof MeshBasicMaterial) frameObject.material.opacity = music * .48 + archive * .21;
  }
  shards.forEach((shard, index) => {
   const mesh = meshes.current[index];
   if (!mesh) return;
   const angle = (index + .38) / shards.length * Math.PI * 2 + fold + change * .62;
   const a = Math.cos(angle), b = Math.sin(angle);
   // Four folded jaws leave the actual sleeve and the DOM controls open in the centre.
   const jaws = 1 / Math.max(Math.abs(a), Math.abs(b));
   const musicX = a * jaws * (2.53 + flare * Math.sin(index * 2.4)) + b * skew;
   const musicY = b * jaws * (2.08 + flare * Math.cos(index * 1.7)) * (compact && b < 0 ? .57 : 1);
   const column = index % 8;
   const row = index < 8 ? 1 : -1;
   const archiveX = (column - 3.5) * (compact ? .72 : 1.43) + row * .32;
   const archiveY = row * ((compact ? 2.78 : 1.54) + Math.sin(column * 1.6) * (compact ? .14 : .29)) + (compact ? 0 : .19);
   const tear = (index % 2 ? 1 : -1) * fracture;
   mesh.position.set(
    shard.x * (home + finish) + musicX * music + archiveX * archive + (shard.x * .67 + tear * .5) * fracture,
    shard.y * (home + finish) + musicY * music + archiveY * archive + (shard.y * .52 + tear * .42) * fracture,
    Math.sin(index * 2.39) * (fracture * 1.45 + change * .68) - music * (.32 + (index % 4) * depth) - archive * (index % 4) * .34,
   );
   mesh.rotation.set(tear * .6 + b * music * .36 + row * archive * .39,
    tear * .94 + a * music * .66 + archive * (column - 3.5) * .16, tear * .48 + music * (.18 - angle * .12) + row * archive * .11);
   const width = home + finish + music * (compact ? .65 : .76) + archive * .84;
   mesh.scale.set(width, width, 1 + fracture * 1.46 + frame.bass * .18 + finish * .47);
  });

  const uniforms = surfaceMaterial.uniforms;
  uniforms.uTime.value = frame.age;
  uniforms.uSeam.value = fracture;
  uniforms.uBass.value = frame.bass;
  uniforms.uVisibility.value = 1 - home * (1 - input.homeVisibility) * .99;
  uniforms.uMusic.value = music;
  uniforms.uArchive.value = archive;
  uniforms.uFinish.value = finish;
  uniforms.uPrevious.value = release.from;
  uniforms.uPlate.value = release.to;
  uniforms.uBlend.value = release.progress;
  uniforms.uInk.value.copy(releaseInks[release.from]).lerp(releaseInks[release.to], release.progress);
  lightMaterial.uniforms.uInk.value.copy(signatureInk).lerp(uniforms.uInk.value, music * .7);
  lightMaterial.uniforms.uPower.value = uniforms.uVisibility.value * (.34 + fracture * .64 + frame.bass * .63 + finish * .17);
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
   Math.abs(frame.x - input.x) + Math.abs(frame.y - input.y);
  const audioState = sound.getSnapshot();
  if (frame.entry < 1 || travel > .001 ||
   frame.bass > .001 || (audioState.isPlaying && !audioState.muted && audioState.volume > 0)) invalidate();
 });

 return <group ref={root} dispose={null}>
  <mesh ref={lightMesh} position={[0, 0, -1.65]} geometry={lightPlane} material={light} />
  <mesh ref={frameMesh} geometry={frameShape} material={frameSurface} />
  {shards.map(({ geometry }, index) => <mesh key={index}
   ref={mesh => { meshes.current[index] = mesh; }} geometry={geometry} material={surface} />)}
 </group>;
}

export default function EntityCanvas(props: StageProps) {
 const { releaseBlend } = useMusic();
 const sound = useSoundManager();
 return <CanvasHost {...props} releaseBlend={releaseBlend} sound={sound} />;
}

const CanvasHost = memo(function CanvasHost(props: StageProps & { releaseBlend: ReleaseBlend; sound: AudioManager }) {
 const [atlas, setAtlas] = useState<HTMLImageElement | null>(null);
 const [device] = useState(() => {
  const small = matchMedia('(max-width:767px)').matches;
  const constrained = small || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
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
