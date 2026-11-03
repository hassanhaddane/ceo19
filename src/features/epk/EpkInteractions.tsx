'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSignalMotion } from '@/lib/signalMotion';
import { UtilityButton } from '@/components/interactive/UtilityAction';
import { ActionLabel, ActionMark } from '@/components/interactive/ActionButton';

/** Route-local, event-driven depth. CSS damps a bounded 8px movement; no animation loop. */
export function EditorialDepth({ children }: { children: ReactNode }) {
 const frame = useRef<HTMLDivElement>(null);
 const motion = useSignalMotion();
 useEffect(() => {
  const element = frame.current;
  if (!element || !motion) return;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reset = () => { element.style.removeProperty('--epk-x'); element.style.removeProperty('--epk-y'); };
  const move = (event: PointerEvent) => {
   if (!finePointer.matches) return;
   const bounds = element.getBoundingClientRect();
   const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
   const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
   element.style.setProperty('--epk-x', `${x * 8}px`);
   element.style.setProperty('--epk-y', `${y * 8}px`);
  };
  element.addEventListener('pointermove', move, { passive: true });
  element.addEventListener('pointerleave', reset);
  finePointer.addEventListener('change', reset);
  return () => { element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', reset); finePointer.removeEventListener('change', reset); reset(); };
 }, [motion]);
 return <div ref={frame} className="epk-depth">{children}</div>;
}

export function CopyEmail({ email, label, copied, fallback }: { email: string; label: string; copied: string; fallback: string }) {
 const [status, setStatus] = useState('');
 async function copy() {
  try { await navigator.clipboard.writeText(email); setStatus(copied); }
  catch { setStatus(fallback); }
 }
 return <div className="epk-copy"><UtilityButton onClick={copy}><ActionLabel>{label}</ActionLabel><ActionMark/></UtilityButton><span role="status" aria-live="polite">{status}</span></div>;
}
