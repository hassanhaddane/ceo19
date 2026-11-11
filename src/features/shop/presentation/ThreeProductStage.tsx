'use client';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { CanvasTexture, DataTexture, MathUtils, Path, RGBAFormat, Shape, SRGBColorSpace, TextureLoader, type Group, type Texture } from 'three';
import type { ProductViewerProps } from './ProductViewer';
import type { PresentationAsset, ProductPresentation } from './types';
import { fitCameraDistance, idleInspectionPose } from './inspection';
import { apparelWidth, apparelHeight, createApparelShell } from './apparelShell';
import { initialInspectionPose } from './InspectionController';

type StageProps = ProductViewerProps & { onReady: () => void; onFailure: () => void };
function useAsset(asset: PresentationAsset): Texture {
 const source = useLoader(TextureLoader, asset.src);
 const { invalidate } = useThree();
 const texture = useMemo(() => {
  const value = source.clone(); value.colorSpace = SRGBColorSpace;
  if (asset.region) { const r = asset.region; value.repeat.set(r.width, r.height); value.offset.set(r.x, r.y); }
  value.needsUpdate = true; return value;
 }, [source, asset]);
 useEffect(() => { invalidate(); return () => texture.dispose(); }, [texture, invalidate]);
 return texture;
}
function Graphic({ asset, color, scale, y = 0, z = .1 }: { asset: PresentationAsset; color: string; scale: number; y?: number; z?: number }) {
 const texture = useAsset(asset);
 return <mesh position={[0, y, z]}><planeGeometry args={[scale, scale]}/><meshBasicMaterial map={texture} color={color} transparent alphaTest={.03} depthWrite={false} toneMapped={false}/></mesh>;
}
function Apparel({ product }: { product: ProductPresentation }) {
 const [original, mask] = useLoader(TextureLoader, [product.frontAsset.src, product.graphicAsset.src]);
 const back = useAsset(product.backAsset!);
 const isHoodie = product.id === 'demo-hoodie';
 const geometry = useMemo(() => createApparelShell(isHoodie ? 'hoodie' : 'tshirt'), [isHoodie]);
 const front = useMemo(() => {
  const source = original.image as HTMLImageElement, logo = mask.image as HTMLImageElement;
  const canvas = document.createElement('canvas'), ink = document.createElement('canvas'), size = 512;
  canvas.width = canvas.height = ink.width = ink.height = size;
  const ctx = canvas.getContext('2d')!, print = ink.getContext('2d')!, r = product.frontAsset.region!;
  ctx.drawImage(source, r.x * source.width, (1 - r.y - r.height) * source.height, r.width * source.width, r.height * source.height, 0, 0, size, size);
  const width = product.graphicScale / apparelWidth * size, height = product.graphicScale / apparelHeight * size;
  print.drawImage(logo, (size - width) / 2, (size - height) / 2 - product.graphicOffsetY / apparelHeight * size, width, height);
  print.globalCompositeOperation = 'source-in';
  print.fillStyle = product.graphicColor; print.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'source-atop'; ctx.drawImage(ink, 0, 0);
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
  return texture;
 }, [original, mask, product]);
 useEffect(() => () => geometry.dispose(), [geometry]);
 useEffect(() => () => front.dispose(), [front]);
 return <mesh geometry={geometry} castShadow>
  <meshStandardMaterial attach="material-0" map={front} roughness={.94}/>
  <meshStandardMaterial attach="material-1" map={back} roughness={.94}/>
  <meshStandardMaterial attach="material-2" color={isHoodie ? '#282a2c' : '#d7d2c7'} roughness={1}/>
 </mesh>;
}
function cutShape(width: number, height: number, corner = .14) {
 const x = width / 2, y = height / 2;
 const s = new Shape(); s.moveTo(-x + corner, -y); s.lineTo(x - corner, -y); s.lineTo(x, -y + corner); s.lineTo(x, y - corner);
 s.lineTo(x - corner, y); s.lineTo(-x + corner, y); s.lineTo(-x, y - corner); s.lineTo(-x, -y + corner); s.closePath(); return s;
}
function Vinyl({ asset, index, spread, motion }: { asset: PresentationAsset; index: number; spread: boolean; motion: boolean }) {
 const group = useRef<Group>(null), { invalidate } = useThree();
 const shape = useMemo(() => {
  if (index === 1) { const circle = new Shape(); circle.absarc(0, 0, 1.5, 0, Math.PI * 2, false); return circle; }
  return index === 0 ? cutShape(2.85, 1.7, .09) : cutShape(2.65, 3.25, .12);
 }, [index]);
 useFrame((_, delta) => {
  const item = group.current; if (!item) return;
  const slot = index - 1, x = slot * (spread ? 1.1 : .42), angle = slot * (spread ? -.31 : -.12);
  item.position.x = motion ? MathUtils.damp(item.position.x, x, 9, Math.min(delta, .05)) : x;
  item.rotation.z = motion ? MathUtils.damp(item.rotation.z, angle, 9, Math.min(delta, .05)) : angle;
  if (Math.abs(item.position.x - x) > .001 || Math.abs(item.rotation.z - angle) > .001) invalidate();
 });
 return <group ref={group} position={[(index - 1) * .42, index === 1 ? .12 : -.12, index * .12]}>
  <mesh castShadow><extrudeGeometry args={[shape, { depth: .024, bevelEnabled: true, bevelSize: .025, bevelThickness: .015, bevelSegments: 2, steps: 1 }]}/><meshStandardMaterial color={index === 1 ? '#3572a3' : '#eae5d6'} roughness={.62} metalness={0}/></mesh>
  <Graphic asset={asset} color={index === 1 ? '#eae5d6' : '#173e60'} scale={index === 0 ? 1.43 : 2.02} y={-.02} z={.055}/>
 </group>;
}
function StickerStack({ product, spread, motion }: { product: ProductPresentation; spread: boolean; motion: boolean }) {
 return <group rotation={[0, -.05, 0]}>{[0, 1, 2].map(index => <Vinyl asset={product.graphicAsset} index={index} key={index} spread={spread} motion={motion}/>)}</group>;
}
function Keychain({ product }: { product: ProductPresentation }) {
 const shape = useMemo(() => {
  const s = cutShape(2.12, 2.85, .23), hole = new Path(); hole.absarc(0, 1.14, .12, 0, Math.PI * 2, true); s.holes.push(hole); return s;
 }, []);
 return <group position={[0, -.26, 0]}>
  <mesh position={[0, -.12, -.09]} castShadow><extrudeGeometry args={[shape, { depth: .16, bevelEnabled: true, bevelSize: .07, bevelThickness: .05, bevelSegments: 3, steps: 1, curveSegments: 24 }]}/><meshStandardMaterial color="#3572a3" roughness={.7} metalness={.08}/></mesh>
  <Graphic asset={product.graphicAsset} color={product.graphicColor} scale={1.48 * product.graphicScale} y={product.graphicOffsetY} z={.13}/>
  <mesh position={[0, 1.25, .02]} rotation={[0, Math.PI / 2, 0]} castShadow><torusGeometry args={[.23, .045, 8, 32]}/><meshStandardMaterial color="#8e9ca1" roughness={.48} metalness={.65}/></mesh>
  <mesh position={[0, 1.93, .015]} rotation={[.14, -.12, 0]} castShadow><torusGeometry args={[.49, .055, 10, 56]}/><meshStandardMaterial color="#9aa7aa" roughness={.38} metalness={.75}/></mesh>
 </group>;
}
function ContactShadow() {
 const texture = useMemo(() => {
  const size = 64, bytes = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
   const r = Math.hypot((x + .5) / size * 2 - 1, (y + .5) / size * 2 - 1);
   bytes[(y * size + x) * 4 + 3] = Math.round(Math.max(0, 1 - r) ** 2 * 160);
  }
  const value = new DataTexture(bytes, size, size, RGBAFormat); value.needsUpdate = true; return value;
 }, []);
 useEffect(() => () => texture.dispose(), [texture]);
 return <mesh position={[0, -2.19, -.35]}><planeGeometry args={[5.2, .85]}/><meshBasicMaterial map={texture} transparent opacity={.65} depthWrite={false} toneMapped={false}/></mesh>;
}
function StudioObject(props: StageProps) {
 const group = useRef<Group>(null), budget = useRef({ frames: 0, time: 0, reduced: false }), idleTime = useRef(0), resetVersion = useRef(-1);
 const { invalidate, setDpr, gl } = useThree();
 const { product, motion, active, controller, onReady, onFailure } = props;
 useEffect(() => { const detach = controller.attach(invalidate); onReady(); return detach; }, [invalidate, controller, onReady]);
 useEffect(() => {
  const lost = (event: Event) => { event.preventDefault(); onFailure(); };
  gl.domElement.addEventListener('webglcontextlost', lost);
  return () => gl.domElement.removeEventListener('webglcontextlost', lost);
 }, [gl, onFailure]);
 useEffect(() => { if (active) invalidate(); }, [active, motion, product, props.spread, props.zoom, invalidate]);
 useFrame(({ camera, size }, dt) => {
  if (!group.current || !active) return;
  const delta = Math.min(dt, .05), value = group.current;
  if (resetVersion.current !== controller.getResetVersion()) { resetVersion.current = controller.getResetVersion(); idleTime.current = 0; }
  const idle = motion && controller.isIdle();
  const paused = idle && controller.isHoverPaused();
  if (idle && !paused) idleTime.current += delta;
  const pose = idle ? idleInspectionPose(controller.getPose(), idleTime.current) : controller.getPose();
  const { yaw, pitch } = paused ? controller.getDisplayedPose() : pose;
  const pointer = controller.getPointer();
  value.rotation.y = motion ? MathUtils.damp(value.rotation.y, yaw, 11, delta) : yaw;
  value.rotation.x = motion ? MathUtils.damp(value.rotation.x, pitch, 11, delta) : pitch;
  const float = paused ? value.position.y : idle ? Math.sin(idleTime.current * .6) * .025 : 0;
  value.position.y = motion ? MathUtils.damp(value.position.y, float, 11, delta) : 0;
  controller.present({ yaw: value.rotation.y, pitch: value.rotation.x });
  const minimum = product.previewType === 'sticker-stack' ? 8.15 : product.previewType === 'keychain-3d' ? 7.25 : 7.15;
  const objectWidth = product.previewType === 'sticker-stack' ? props.spread ? 6.15 : 4.5 : product.previewType === 'keychain-3d' ? 2.7 : 4.4;
  const z = fitCameraDistance(size.width, size.height, objectWidth, minimum) / props.zoom;
  // Retreat before the fan expands; come closer only after the layers gather.
  camera.position.z = motion ? MathUtils.damp(camera.position.z, z, camera.position.z < z ? 14 : 5, delta) : z;
  camera.position.x = motion ? MathUtils.damp(camera.position.x, pointer.x * .16, 6, delta) : 0;
  camera.position.y = motion ? MathUtils.damp(camera.position.y, .05 + pointer.y * .08, 6, delta) : .05;
  camera.lookAt(0, 0, 0);
  const sample = budget.current;
  // Demand-rendered idle time is not a slow GPU frame.
  if (motion && dt < .15 && !sample.reduced && ++sample.frames <= 45) {
   sample.time += dt;
   if (sample.frames === 45 && sample.time / sample.frames > .032) { sample.reduced = true; setDpr(1); }
  }
  const unsettled = Math.abs(value.rotation.y - yaw) + Math.abs(value.rotation.x - pitch) + Math.abs(value.position.y - float)
   + Math.abs(camera.position.z - z) + Math.abs(camera.position.x - pointer.x * .16) + Math.abs(camera.position.y - (.05 + pointer.y * .08)) > .001;
  if (motion && ((idle && !paused) || unsettled)) invalidate();
 });
 return <group ref={group} key={product.id} rotation={[initialInspectionPose.pitch, initialInspectionPose.yaw, 0]}>
  {product.previewType === 'apparel-shell' ? <Apparel product={product}/> : product.previewType === 'sticker-stack' ? <StickerStack product={product} spread={props.spread} motion={motion}/> : <Keychain product={product}/>}
 </group>;
}
/** Imported only by Shop, after its client viewer mounts. No HDR/model requests. */
export default function ThreeProductStage(props: StageProps) {
 return <Canvas className="drop-three-canvas" camera={{ position: [0, .05, 7.4], fov: 37, near: .1, far: 30 }}
  dpr={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : Math.min(1.5, typeof window === 'undefined' ? 1 : window.devicePixelRatio)}
  frameloop={props.active ? 'demand' : 'never'} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
  fallback={null}>
  <ambientLight intensity={1.2}/><hemisphereLight args={['#eae5d6', '#173e60', 1.1]}/>
  <directionalLight position={[-3, 5, 5]} intensity={2} color="#faf9f4"/>
  <pointLight position={[3, 1, -2]} color="#3572a3" intensity={14} distance={12}/>
  <ContactShadow/>
  <Suspense fallback={null}><StudioObject {...props}/></Suspense>
 </Canvas>;
}
