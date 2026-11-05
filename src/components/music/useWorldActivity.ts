'use client';
import { useEffect, useState, type RefObject } from 'react';

/** Activity only, never a second motion preference. No animation-frame subscriptions. */
export function useWorldActivity(root: RefObject<HTMLDivElement | null>) {
 const [running, setRunning] = useState(false);
 useEffect(() => {
  const element = root.current;
  if (!element) return;
  let inView = false;
  const update = () => setRunning(inView && !document.hidden && !document.querySelector('dialog[open],.intro-sequence'));
  const intersection = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); }, { threshold: .1 });
  intersection.observe(element);
  const dialogs = new MutationObserver(update);
  dialogs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open', 'data-intro-state'] });
  document.addEventListener('visibilitychange', update);
  return () => { intersection.disconnect(); dialogs.disconnect(); document.removeEventListener('visibilitychange', update); };
 }, [root]);
 return running;
}
