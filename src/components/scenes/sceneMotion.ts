import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import type { SceneChapter } from '@/lib/sceneNavigation';

type Chapter = { id: SceneChapter; element: HTMLElement };
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value: number) => {
 const t = clamp(value);
 return t * t * (3 - 2 * t);
};

/** A single trigger reads native scroll. Only presentation variables are scrubbed. */
export function createSceneMotion(main: HTMLElement, chapters: Chapter[]) {
 gsap.registerPlugin(ScrollTrigger);
 const pointer = matchMedia('(hover:hover) and (pointer:fine)');
 const sizes = chapters.map(chapter => ({ ...chapter, top: 0, bottom: 0 }));
 let height = 0, documentEnd = 0, mobile = false, refreshFrame = 0;
 const read = () => {
  height = document.documentElement.clientHeight;
  documentEnd = Math.max(0, document.documentElement.scrollHeight - height);
  mobile = main.clientWidth < 768;
  const y = scrollY;
  for (const chapter of sizes) {
   const rect = chapter.element.getBoundingClientRect();
   chapter.top = rect.top + y;
   chapter.bottom = rect.bottom + y;
  }
 };
 const draw = (y: number) => {
  const center = y + height * .5;
  const range = height * (mobile ? .29 : .38);
  let travel = 0, opening = 0;
  for (const [index, chapter] of sizes.entries()) {
   const distance = chapter.top - center;
   if (index > 0) {
    const turn = smooth(.5 - distance / (range * 2));
    travel += turn;
    opening = Math.max(opening, 4 * turn * (1 - turn));
   }
   if (chapter.bottom < y - range || chapter.top > y + height + range) continue;
   const drift = clamp((y - chapter.top) / height, -1, 1);
   const arrival = index === 0 ? 1 : smooth(1 - (chapter.top - y) / (height * .74));
   chapter.element.style.setProperty('--chapter-drift', drift.toFixed(3));
   chapter.element.style.setProperty('--chapter-arrival', arrival.toFixed(3));
  }
  main.style.setProperty('--rift-travel', travel.toFixed(3));
  main.style.setProperty('--rift-opening', (opening * smooth((documentEnd - y) / (height * .18))).toFixed(3));
 };
 read();
 const clock = { position: 0 };
 const animation = gsap.to(clock, {
  position: () => Math.max(1, ScrollTrigger.maxScroll(window)),
  ease: 'none',
  onUpdate: () => draw(clock.position),
  scrollTrigger: {
   trigger: main,
   start: 0,
   end: () => Math.max(1, ScrollTrigger.maxScroll(window)),
   scrub: true,
   invalidateOnRefresh: true,
   onRefreshInit: read,
   onRefresh: () => draw(scrollY),
  },
 });
 const camera = { x: 0, y: 0 };
 const writeCamera = () => {
  main.style.setProperty('--camera-x', camera.x.toFixed(3));
  main.style.setProperty('--camera-y', camera.y.toFixed(3));
 };
 const moveX = gsap.quickTo(camera, 'x', { duration: .62, ease: 'power3.out', onUpdate: writeCamera });
 const moveY = gsap.quickTo(camera, 'y', { duration: .62, ease: 'power3.out', onUpdate: writeCamera });
 const reset = () => { moveX(0); moveY(0); };
 const move = (event: PointerEvent) => {
  if (!pointer.matches || event.pointerType !== 'mouse' || mobile) return;
  moveX(event.clientX / innerWidth - .5);
  moveY(event.clientY / innerHeight - .5);
 };
 const observer = new ResizeObserver(() => {
  if (!refreshFrame) refreshFrame = requestAnimationFrame(() => {
   refreshFrame = 0;
   animation.scrollTrigger?.refresh();
  });
 });
 observer.observe(main);
 for (const chapter of sizes) observer.observe(chapter.element);
 draw(scrollY);
 main.dataset.cinematic = 'true';
 main.addEventListener('pointermove', move, { passive: true });
 main.addEventListener('pointerleave', reset);
 pointer.addEventListener('change', reset);
 return {
  dispose() {
   observer.disconnect();
   cancelAnimationFrame(refreshFrame);
   animation.scrollTrigger?.kill();
   animation.kill();
   moveX.tween.kill();
   moveY.tween.kill();
   main.removeEventListener('pointermove', move);
   main.removeEventListener('pointerleave', reset);
   pointer.removeEventListener('change', reset);
   delete main.dataset.cinematic;
   for (const property of ['--rift-travel', '--rift-opening', '--camera-x', '--camera-y']) main.style.removeProperty(property);
   for (const { element } of sizes) {
    element.style.removeProperty('--chapter-drift');
    element.style.removeProperty('--chapter-arrival');
   }
  },
 };
}
