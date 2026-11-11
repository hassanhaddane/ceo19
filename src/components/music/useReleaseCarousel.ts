'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type MouseEvent } from 'react';
import { gsap } from 'gsap';
import { releases } from '@/data/releases';
import { carouselPose, carouselSlot, carouselTravel } from '@/lib/carouselGeometry';
import { acquireSceneGesture } from '@/lib/sceneNavigation';
import { useSignalMotion } from '@/lib/signalMotion';
import type { Release } from '@/types/content';
import type { ReleaseBlend } from './releaseBlend';
import { releaseWorld } from '@/data/releaseWorlds';
import { preloadReleaseBackground } from './releasePreload';

const travelProfiles = {
 signal: { seconds: .66, ease: 'power2.inOut' },
 impact: { seconds: .62, ease: 'power4.inOut' },
 haze: { seconds: .9, ease: 'sine.inOut' },
 crew: { seconds: .77, ease: 'power2.inOut' },
 split: { seconds: .72, ease: 'power3.inOut' },
 paper: { seconds: .81, ease: 'power3.inOut' },
} as const;
type Intent = ({ step: number } | { index: number }) & { focus?: boolean; dragOffset?: number };
type Transition = { center: number; target: number | null; travel: number; run: number };
const wrap = (index: number) => (index % releases.length + releases.length) % releases.length;

/** One scalar and one timeline own every sleeve and the environment mix.
 * While moving, keep only the latest extra intent. The committed release changes
 * after its artwork reaches the center, so its actions cannot point at another sleeve. */
export function useReleaseCarousel(selected: Release, blend: ReleaseBlend, onCommit: (release: Release, originHash: string) => void, onIntent: () => void) {
 const motion = useSignalMotion();
 const initial = releases.indexOf(selected);
 const [view, setView] = useState<Transition>({ center: initial, target: null, travel: 0, run: 0 });
 const transport = useRef({ center: initial, target: null as number | null, pending: null as Intent | null, focus: false, run: 0, origin: initial, destination: initial, dragOffset: 0, originHash: '' });
 const position = useRef({ value: initial });
 const stageRef = useRef<HTMLDivElement>(null), worldRef = useRef<HTMLDivElement>(null);
 const geometry = useRef({ size: 0, spread: 0, slides: [] as HTMLElement[] });
 const afterFrame = useRef(0);
 const gesture = useRef<{ x: number; y: number; release?: () => void; dragged: boolean } | null>(null);
 const suppressClick = useRef(false), wheel = useRef({ amount: 0, last: 0, locked: false });
 const callbacks = useRef({ onCommit, onIntent });
 useLayoutEffect(() => { callbacks.current = { onCommit, onIntent }; }, [onCommit, onIntent]);
 const draw = useCallback(() => {
  const { size, spread, slides } = geometry.current;
  for (const [index, element] of slides.entries()) {
   const slot = carouselSlot(index, position.current.value, releases.length), pose = carouselPose(slot, size, spread);
   const distance = Math.min(Math.abs(slot), 2);
   element.style.transform = `translate3d(${pose.x}px,${pose.y}px,${-distance * size * .15}px) rotateY(${pose.rotation}deg) scale(${pose.scale})`;
   element.style.setProperty('--sleeve-distance', String(distance));
   element.style.opacity = String(pose.opacity);
   element.style.zIndex = String(pose.zIndex);
   element.style.visibility = pose.opacity > .001 ? 'visible' : 'hidden';
   element.style.pointerEvents = Math.abs(slot) <= 1.05 ? 'auto' : 'none';
   element.dataset.slot = slot.toFixed(4);
   element.dataset.position = Math.abs(slot) < .001 ? 'center' : Math.abs(slot + 1) < .001 ? 'previous' : Math.abs(slot - 1) < .001 ? 'next' : 'moving';
   element.setAttribute('aria-hidden', String(pose.opacity <= .001));
   const button = element.querySelector('button'), label = element.querySelector<HTMLElement>('.carousel-side-title');
   if (button) button.tabIndex = Math.abs(slot) <= 1.01 ? 0 : -1;
   if (label) label.style.opacity = String(Math.min(1, Math.abs(slot)));
  }
 }, []);
 const request = useCallback((intent: Intent) => {
  cancelAnimationFrame(afterFrame.current);
  callbacks.current.onIntent();
  const state = transport.current;
  if (state.target !== null) { state.pending = intent; return; }
  const travel = 'step' in intent ? Math.sign(intent.step) : carouselTravel(state.center, intent.index, releases.length);
  if (!travel) return;
  state.origin = position.current.value; state.destination = state.origin + travel; state.dragOffset = intent.dragOffset ?? 0;
  state.originHash = location.hash;
  state.target = wrap(state.center + travel); state.focus = !!intent.focus; state.run++;
  setView({ center: state.center, target: state.target, travel, run: state.run });
 }, []);
 // Externally selected releases (Home/player) use the same transport, never a second position owner.
 useEffect(() => {
  const index = releases.indexOf(selected), state = transport.current;
  if (index !== state.center && index !== state.target) request({ index });
 }, [selected, request]);
 useLayoutEffect(() => {
  const stage = stageRef.current; if (!stage) return;
  const measure = () => {
   const slides = Array.from(stage.querySelectorAll<HTMLElement>('.carousel-slide'));
   const size = slides[0]?.offsetWidth ?? 0;
   geometry.current = { slides, size, spread: innerWidth < 768 ? size * .8 : Math.min(stage.clientWidth * .36, size * 1.05) };
   draw();
  };
  const observer = new ResizeObserver(measure); observer.observe(stage); measure();
  return () => { observer.disconnect(); cancelAnimationFrame(afterFrame.current); };
 }, [draw]);
 useLayoutEffect(() => {
  const state = transport.current, root = worldRef.current;
  if (view.target === null) {
   root?.style.setProperty('--release-progress', '0');
   blend.write(view.center, view.center, 0, 1);
   draw(); return;
  }
  const from = view.center, to = view.target, direction = Math.sign(view.travel);
  void preloadReleaseBackground(releases[to].id);
  const treatment = travelProfiles[releaseWorld(releases[to].id).motionPreset];
  blend.write(from, to, 0, direction);
  const destination = state.destination;
  const complete = () => {
   position.current.value = destination; draw();
   stageRef.current?.style.setProperty('--carousel-drag', '0px');
   if (stageRef.current) stageRef.current.dataset.dragging = 'false';
   const center = view.target!;
   state.center = center; state.target = null;
   callbacks.current.onCommit(releases[center], state.originHash);
   setView({ center, target: null, travel: 0, run: view.run });
   if (state.focus) geometry.current.slides[center]?.querySelector('button')?.focus({ preventScroll: true });
   const pending = state.pending; state.pending = null;
   if (pending) afterFrame.current = requestAnimationFrame(() => request(pending));
  };
  let disposed = false;
  let timeline: gsap.core.Timeline | null = null;
  const begin = () => {
   if (disposed || timeline) return;
   timeline = gsap.timeline({ onComplete: complete });
   timeline.to(position.current, {
   value: destination, duration: motion ? treatment.seconds : 0, ease: treatment.ease,
   onUpdate: () => {
    draw();
    const progress = Math.min(1, Math.abs((position.current.value - state.origin) / view.travel));
    root?.style.setProperty('--release-progress', String(progress));
    blend.write(from, to, progress, direction);
    stageRef.current?.style.setProperty('--carousel-drag', `${state.dragOffset * (1 - progress)}px`);
   },
   });
  };
  const images = Array.from(root?.querySelectorAll<HTMLImageElement>('[data-layer="incoming"] img') ?? []);
  const cover = geometry.current.slides[view.target]?.querySelector('img');
  if (cover) images.push(cover);
  // The photo warmup can improve the cut, but a slow derivative cannot lock the selector.
  let deadline: ReturnType<typeof setTimeout> | undefined;
  if (images.every(image => image.complete && image.naturalWidth > 0) || !motion) begin();
  else {
   deadline = setTimeout(begin, 180);
   void Promise.allSettled(images.map(image => image.decode())).then(() => { clearTimeout(deadline); begin(); });
  }
  return () => { disposed = true; clearTimeout(deadline); timeline?.kill(); };
 }, [view.run, view.center, view.target, view.travel, motion, draw, request, blend]);
 const move = useCallback((step: number, focus = false) => request({ step, focus }), [request]);
 const select = useCallback((release: Release, focus = false) => request({ index: releases.indexOf(release), focus }), [request]);
 useEffect(() => {
  const stage = stageRef.current; if (!stage) return;
  const horizontal = (event: WheelEvent) => {
   if (event.ctrlKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.2) return;
   event.preventDefault(); event.stopPropagation();
   const now = performance.now(), input = wheel.current;
   if (now - input.last > 230) { input.amount = 0; input.locked = false; }
   input.last = now;
   if (input.locked) return;
   input.amount += event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientWidth : 1);
   if (Math.abs(input.amount) > 75) { input.locked = true; move(Math.sign(input.amount)); }
  };
  stage.addEventListener('wheel', horizontal, { passive: false });
  return () => stage.removeEventListener('wheel', horizontal);
 }, [move]);
 const cancelGesture = useCallback(() => {
  gesture.current?.release?.(); gesture.current = null;
  const stage = stageRef.current;
  if (stage) { stage.dataset.dragging = 'false'; stage.style.setProperty('--carousel-drag', '0px'); }
 }, []);
 useEffect(() => {
  const hidden = () => { if (document.hidden) cancelGesture(); };
  const pointerUp = () => { if (gesture.current) cancelGesture(); };
  window.addEventListener('pointerup', pointerUp); window.addEventListener('blur', cancelGesture); document.addEventListener('visibilitychange', hidden);
  return () => { cancelGesture(); window.removeEventListener('pointerup', pointerUp); window.removeEventListener('blur', cancelGesture); document.removeEventListener('visibilitychange', hidden); };
 }, [cancelGesture]);
 function onPointerDown(event: PointerEvent<HTMLDivElement>) {
  if (event.button !== 0 || !event.isPrimary || transport.current.target !== null || (event.target as Element).closest('.carousel-arrow')) return;
  suppressClick.current = false;
  gesture.current = { x: event.clientX, y: event.clientY, dragged: false };
 }
 function onPointerMove(event: PointerEvent<HTMLDivElement>) {
  const stage = stageRef.current; if (!stage) return;
  const start = gesture.current;
  if (start) {
   const dx = event.clientX - start.x, dy = event.clientY - start.y;
   if (!start.dragged && Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    start.dragged = true; start.release = acquireSceneGesture('music', stage);
    stage.setPointerCapture(event.pointerId); stage.dataset.dragging = 'true';
   }
   if (start.dragged) {
    stage.style.setProperty('--carousel-drag', `${Math.max(-48, Math.min(48, dx * .3))}px`);
    stage.style.setProperty('--carousel-tilt-x', '0deg'); stage.style.setProperty('--carousel-tilt-y', '0deg');
   }
   return;
  }
  if (!motion || event.pointerType !== 'mouse') return;
  const rect = stage.getBoundingClientRect(), size = geometry.current.size;
  const x = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / size));
  const y = Math.max(-1, Math.min(1, (event.clientY - rect.top - size / 2) / size));
  stage.style.setProperty('--carousel-tilt-x', `${-y * 5.5}deg`);
  stage.style.setProperty('--carousel-tilt-y', `${x * 8}deg`);
 }
 function onPointerUp(event: PointerEvent<HTMLDivElement>) {
  const start = gesture.current;
  const stage = stageRef.current;
  const dx = start ? event.clientX - start.x : 0;
  const offset = Number.parseFloat(stage?.style.getPropertyValue('--carousel-drag') ?? '0') || 0;
  cancelGesture();
  if (start?.dragged) {
   suppressClick.current = true;
   if (Math.abs(dx) > 42 && stage) {
    // Keep the release position continuous under the pointer. The transport folds
    // this displacement into its own progress instead of snapping the track back.
    stage.dataset.dragging = 'true'; stage.style.setProperty('--carousel-drag', `${offset}px`);
    request({ step: dx < 0 ? 1 : -1, dragOffset: offset });
   }
  }
 }
 function onPointerLeave() {
  if (gesture.current) return;
  stageRef.current?.style.setProperty('--carousel-tilt-x', '0deg');
  stageRef.current?.style.setProperty('--carousel-tilt-y', '0deg');
 }
 function keyboard(event: KeyboardEvent) {
  const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
  if (step) { event.preventDefault(); move(step, true); }
  else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); request({ index: event.key === 'Home' ? 0 : releases.length - 1, focus: true }); }
 }
 return {
  activeRelease: releases[view.center], incomingRelease: view.target === null ? null : releases[view.target],
  busy: view.target !== null, direction: Math.sign(view.travel) || 1, stageRef, worldRef, select, move, keyboard,
  stageEvents: { onPointerDown, onPointerMove, onPointerUp, onPointerLeave, onPointerCancel: cancelGesture, onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => {
   // Touch capture transfers from the inner artwork to the stage. Its bubbling
   // lost-capture event must not cancel the drag the stage has just acquired.
   if (event.target === event.currentTarget && gesture.current) cancelGesture();
  },
   onClickCapture: (event: MouseEvent) => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } } },
 };
}
