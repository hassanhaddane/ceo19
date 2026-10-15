'use client';
import { useEffect, useRef, useState, useCallback, type RefObject, type MouseEvent, type KeyboardEvent } from 'react';
import { animationStatus, registerAnimationProbe } from '@/lib/animationDiagnostics';
import { archiveWorld, archiveStart, boundedCamera, cameraAnchor } from '@/data/archiveWorld';
import { acquireSceneGesture } from '@/lib/sceneNavigation';
import { useSignalMotion } from '@/lib/signalMotion';
import { visualEffects } from '@/lib/visualEffects';

/** Camera and pointer interpolation live outside React. Only crossing a photo
 * boundary publishes state, so pointer frames never rerender the image tree. */
export function useSpatialArchive(stage: RefObject<HTMLDivElement | null>) {
 const motion = useSignalMotion();
 const [active, setActive] = useState(archiveStart), [compact, setCompact] = useState(false);
 const camera = useRef(archiveStart), suppressClick = useRef(false);
 const command = useRef<(index: number, remember?: boolean) => void>(() => {});
 const select = useCallback((index: number) => command.current(index, true), []);
 useEffect(() => {
  const element = stage.current; if (!element) return;
  let target = camera.current, current = target, px = 0, py = 0, tx = 0, ty = 0, frame = 0;
  let width = element.clientWidth, height = element.clientHeight, mobile = width < 700, inView = false;
  let down = false, dragging = false, pointerId = -1, startX = 0, startY = 0, startCamera = 0, lastX = 0, lastTime = 0, velocity = 0;
  let hover = -1, drawnHover = -1, hoverMix = 0, notified = Math.round(target);
  let release: (() => void) | undefined, wheelTimer: ReturnType<typeof setTimeout> | undefined;
  const clamp = (value: number) => boundedCamera(value, archiveWorld.length);
  const remember = () => { if (location.hash.startsWith('#archive')) history.replaceState(null, '', `#archive-${archiveWorld[Math.round(target)].id}`); };
  const draw = () => {
   frame = 0; if (document.hidden) return;
   current += (target - current) * (motion ? .115 : 1);
   px += (tx - px) * .1; py += (ty - py) * .1;
   hoverMix += ((hover >= 0 ? 1 : 0) - hoverMix) * .16;
   if (hover >= 0) drawnHover = hover;
   const anchor = cameraAnchor(current);
   const planes = element.querySelectorAll<HTMLElement>('[data-photo-plane]');
   planes.forEach((plane, index) => {
    const photo = archiveWorld[index], distance = Math.abs(index - current), emphasis = Math.max(0, 1 - distance);
    const visible = distance < (mobile ? 1.7 : 2.75);
    plane.style.visibility = visible ? 'inherit' : 'hidden';
    if (!visible) return;
    const hovered = index === drawnHover ? hoverMix : 0;
    const strength = motion && !mobile ? .8 : 0;
    const depth = mobile ? emphasis * 30 - distance * 90 : photo.depth * (1 - emphasis) - distance * 110 + emphasis * 100 + hovered * 65;
    const size = Math.min(height * .82, width * (mobile ? .78 : .36) / photo.aspectRatio) * (photo.scale * (1 - emphasis) + emphasis);
    const x = (photo.x - anchor.x) * width * (mobile ? .88 : .43) + px * (18 + emphasis * 35) * strength + (index === drawnHover ? 0 : Math.sign(index - drawnHover) * hoverMix * 10);
    const y = (photo.y - anchor.y) * height * (mobile ? .18 : .72) + py * (12 + emphasis * 26) * strength;
    const scale = mobile ? .78 + emphasis * .22 : .74 + emphasis * .26;
    plane.style.width = `${size * photo.aspectRatio}px`; plane.style.height = `${size}px`;
    plane.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${depth.toFixed(2)}px) rotateY(${((photo.x - anchor.x) * -9 + px * strength * 3) * (mobile ? .2 : 1)}deg) rotateZ(${photo.roll * (1 - emphasis) + px * strength * .7}deg) scale(${scale})`;
    plane.style.opacity = `${Math.max(.2, 1 - distance * .17)}`;
    plane.style.setProperty('--photo-light', `${.68 + emphasis * .32 + hovered * .18}`);
   });
   element.dataset.camera = current.toFixed(3);
   camera.current = current;
   const nearest = Math.round(current);
   if (notified !== nearest) { notified = nearest; setActive(nearest); }
   if (inView && (Math.abs(target - current) > .001 || Math.abs(tx - px) + Math.abs(ty - py) > .01 || Math.abs((hover >= 0 ? 1 : 0) - hoverMix) > .01)) frame = requestAnimationFrame(draw);
  };
  const wake = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(draw); };
  const go = (index: number, save = false) => { target = clamp(index); if (!inView || !motion) current = target; if (save) remember(); wake(); };
  command.current = go;
  const unlock = () => { release?.(); release = undefined; element.dataset.dragging = 'false'; if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId); pointerId = -1; };
  const start = (event: PointerEvent) => {
   if (!event.isPrimary || event.button !== 0) return;
   clearTimeout(wheelTimer); unlock(); down = true; dragging = false; suppressClick.current = false;
   startX = lastX = event.clientX; startY = event.clientY; startCamera = target; lastTime = performance.now(); velocity = 0;
  };
  const move = (event: PointerEvent) => {
   if (!down) {
    if (event.pointerType === 'mouse' && motion && !mobile) { const box = element.getBoundingClientRect(); tx = (event.clientX - box.left) / width * 2 - 1; ty = (event.clientY - box.top) / height * 2 - 1; wake(); }
    return;
   }
   const dx = event.clientX - startX, dy = event.clientY - startY;
   if (!dragging) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
    if (Math.abs(dy) > Math.abs(dx) * 1.15) { down = false; return; }
    if (Math.abs(dx) < Math.abs(dy) * 1.15) return;
    dragging = true; pointerId = event.pointerId; element.setPointerCapture(pointerId); release = acquireSceneGesture('archive', element); element.dataset.dragging = 'true'; hover = -1;
   }
   event.preventDefault();
   const now = performance.now(); velocity = velocity * .35 + (lastX - event.clientX) / Math.max(8, now - lastTime) * .65;
   target = clamp(startCamera - dx / (width * (mobile ? .67 : .38))); lastX = event.clientX; lastTime = now; wake();
  };
  const finish = () => {
   if (!down) return; down = false;
   if (dragging) {
    suppressClick.current = true;
    const momentum = motion && performance.now() - lastTime < 100 ? Math.max(-.65, Math.min(.65, velocity * .22)) : 0;
    go(Math.round(clamp(target + momentum)), true);
   }
   dragging = false; unlock();
  };
  const cancel = () => { clearTimeout(wheelTimer); suppressClick.current ||= dragging; down = false; dragging = false; unlock(); go(Math.round(target)); };
  const lostCapture = (event: PointerEvent) => {
   // Touch starts with implicit capture on the photograph button. Its loss
   // bubbles when capture transfers to the stage; that is not a cancelled drag.
   if (event.target === element && event.pointerId === pointerId && dragging) cancel();
  };
  const leave = () => { tx = ty = 0; hover = -1; if (down && !dragging) down = false; wake(); };
  const over = (event: PointerEvent) => { if (dragging || !motion || mobile || event.pointerType !== 'mouse') return; const plane = (event.target as Element).closest<HTMLElement>('[data-photo-plane]'); hover = plane ? Number(plane.dataset.photoPlane) : -1; wake(); };
  const wheel = (event: WheelEvent) => {
   if (event.ctrlKey || dragging) return;
   const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.1 || event.shiftKey;
   if (!horizontal) return;
   event.preventDefault(); event.stopPropagation();
   release ??= acquireSceneGesture('archive', element);
   const delta = (event.shiftKey ? event.deltaY || event.deltaX : event.deltaX) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? width : 1);
   target = clamp(target + delta / (width * .5)); wake();
   clearTimeout(wheelTimer); wheelTimer = setTimeout(() => { go(Math.round(target), true); unlock(); }, visualEffects.archive.wheelIdle);
  };
  const resize = () => { width = element.clientWidth; height = element.clientHeight; mobile = width < 700; setCompact(mobile); wake(); };
  const historyChange = () => { const id = location.hash.slice(9); const index = archiveWorld.findIndex(photo => photo.id === id); if (index >= 0) go(index); };
  const visibility = () => { if (document.hidden) { cancel(); cancelAnimationFrame(frame); frame = 0; } else wake(); };
  const intersection = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (!inView) { cancel(); cancelAnimationFrame(frame); frame = 0; } else wake(); }, { threshold: .1 }); intersection.observe(element);
  const observer = new ResizeObserver(resize); observer.observe(element);
  element.addEventListener('pointerdown', start); element.addEventListener('pointermove', move, { passive: false }); element.addEventListener('pointerover', over); element.addEventListener('pointerleave', leave);
  element.addEventListener('lostpointercapture', lostCapture); element.addEventListener('pointercancel', cancel); element.addEventListener('wheel', wheel, { passive: false });
  window.addEventListener('pointerup', finish); window.addEventListener('blur', cancel); window.addEventListener('hashchange', historyChange); window.addEventListener('popstate', historyChange); document.addEventListener('visibilitychange', visibility);
  resize(); historyChange(); wake();
  animationStatus('archive', 'ready');
  const unregister = registerAnimationProbe('archive', () => ({ renderer: 'DOM perspective', motion, inView, current, target, dragging, width, height, framePending: !!frame }));
  return () => {
   unregister(); animationStatus('archive', 'disposed');
   command.current = () => {}; down = false; unlock(); clearTimeout(wheelTimer); cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect();
   element.removeEventListener('pointerdown', start); element.removeEventListener('pointermove', move); element.removeEventListener('pointerover', over); element.removeEventListener('pointerleave', leave); element.removeEventListener('lostpointercapture', lostCapture); element.removeEventListener('pointercancel', cancel); element.removeEventListener('wheel', wheel);
   window.removeEventListener('pointerup', finish); window.removeEventListener('blur', cancel); window.removeEventListener('hashchange', historyChange); window.removeEventListener('popstate', historyChange); document.removeEventListener('visibilitychange', visibility);
  };
 }, [stage, motion]);
 const clickCapture = (event: MouseEvent) => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } };
 const keyboard = (event: KeyboardEvent) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault(); event.stopPropagation();
  const index = event.key === 'Home' ? 0 : event.key === 'End' ? archiveWorld.length - 1 : boundedCamera(Math.round(camera.current) + (event.key === 'ArrowRight' ? 1 : -1), archiveWorld.length);
  select(index); stage.current?.focus({ preventScroll: true });
 };
 return { active, compact, motion, select, clickCapture, keyboard };
}
