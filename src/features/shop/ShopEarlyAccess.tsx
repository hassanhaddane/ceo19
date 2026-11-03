'use client';
import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useMediaDialog } from '@/components/media/useMediaDialog';
import { useEntryExperience } from '@/components/visuals/VisualExperience';
import { assets, assetUrl } from '@/data/assets';
import { shopCopy } from '@/data/shop';
import { shopEntry } from '@/lib/shopEntry';
import { useSignalMotion } from '@/lib/signalMotion';
import type { Locale } from '@/types/content';
import { ShopAction } from '@/components/interactive/ShopAction';
import { UtilityButton, UtilityGlyph } from '@/components/interactive/UtilityAction';

/** A native top-layer overlay centers a small panel in the visible viewport. */
export function ShopEarlyAccess({ locale, children }: { locale: Locale; children: ReactNode }) {
 const copy = shopCopy[locale], motion = useSignalMotion(), entry = useEntryExperience();
 const entered = entry?.entered ?? true, fr = locale === 'fr';
 const [open, setOpen] = useState(false);
 const trigger = useRef<HTMLButtonElement>(null);
 const { dialog, openerRef } = useMediaDialog(open);
 useEffect(() => {
  // A full document entry finishes its logo sequence before claiming the prompt.
  if (!entered) return;
  const accept = () => {
   if (!shopEntry.claim()) return;
   openerRef.current = document.querySelector<HTMLElement>('.header-shop-nav a') ?? trigger.current;
   setOpen(true);
  };
  const unsubscribe = shopEntry.subscribe(accept);
  accept();
  return unsubscribe;
 }, [entered, openerRef]);
 function dismiss() { shopEntry.dismiss(); setOpen(false); }
 useLayoutEffect(() => {
  if (!open) return;
  const element = dialog.current; if (!element) return;
  const viewport = window.visualViewport;
  let visibilityFrame = 0;
  const resize = () => {
   element.style.setProperty('--access-height', `${viewport?.height ?? innerHeight}px`);
   element.style.setProperty('--access-width', `${viewport?.width ?? innerWidth}px`);
   element.style.setProperty('--access-top', `${viewport?.offsetTop ?? 0}px`);
   element.style.setProperty('--access-left', `${viewport?.offsetLeft ?? 0}px`);
   cancelAnimationFrame(visibilityFrame);
   visibilityFrame = requestAnimationFrame(() => {
    const focused = document.activeElement, panel = element.querySelector<HTMLElement>('.shop-waitlist');
    if (!(focused instanceof HTMLElement) || !panel?.contains(focused) || !focused.closest('.waitlist-field')) return;
    const field = focused.getBoundingClientRect(), bounds = panel.getBoundingClientRect();
    const header = element.querySelector('.shop-waitlist-top')!.getBoundingClientRect();
    // Scroll only the panel: resizing for a keyboard must not move Shop behind it.
    if (field.bottom > bounds.bottom - 12) panel.scrollTop += field.bottom - bounds.bottom + 12;
    else if (field.top < header.bottom + 8) panel.scrollTop -= header.bottom + 8 - field.top;
   });
  };
  resize(); viewport?.addEventListener('resize', resize); viewport?.addEventListener('scroll', resize);
  window.addEventListener('resize', resize);
  element.querySelector<HTMLButtonElement>('.shop-waitlist-close')?.focus({ preventScroll: true });
  const panel = element.querySelector('.shop-waitlist');
  const animation = motion && panel ? panel.animate([
   { clipPath:'polygon(45% 46%,53% 44%,57% 49%,55% 54%,47% 56%,43% 51%)', opacity:.6 },
   { clipPath:'polygon(0 0,100% 0,100% 50%,100% 100%,0 100%,0 50%)', opacity:1 },
  ], { duration:380, easing:'cubic-bezier(.16,1,.3,1)' }) : null;
  return () => {
   cancelAnimationFrame(visibilityFrame); animation?.cancel(); viewport?.removeEventListener('resize', resize); viewport?.removeEventListener('scroll', resize); window.removeEventListener('resize', resize);
  };
 }, [open, dialog, motion]);
 return <>
  <ShopAction ref={trigger} className="shop-access" aria-haspopup="dialog" aria-controls="shop-waitlist" aria-expanded={open} onClick={() => { openerRef.current = trigger.current; setOpen(true); }}>{copy.action}</ShopAction>
  <dialog ref={dialog} id="shop-waitlist" className="shop-waitlist-overlay" data-motion={motion} data-owned-interaction aria-labelledby="shop-waitlist-title" aria-describedby="drop-list-subtitle" onCancel={event => { event.preventDefault(); dismiss(); }} onClick={event => { if (event.target === event.currentTarget) dismiss(); }}>
   <section className="shop-waitlist">
    <div className="shop-waitlist-top"><span className="shop-waitlist-brand"><Image src={assetUrl(assets.introLogo)} alt="CEO1.9" width={32} height={32}/><span>CEO1.9 / DROP LIST</span></span><UtilityButton className="shop-waitlist-close" onClick={dismiss} cursor="close" aria-label={copy.close}><UtilityGlyph kind="close"/></UtilityButton></div>
    <div className="shop-waitlist-body"><div className="shop-waitlist-intro"><h2 id="shop-waitlist-title">{fr ? 'ACCÈS ANTICIPÉ' : 'GET EARLY ACCESS'}</h2><p id="drop-list-subtitle" className="waitlist-subtitle">{fr ? 'Merch. Drops limités. Collaborations.' : 'Merch. Limited drops. Collaborations.'}</p></div><div id="shop-waitlist-description">{open ? children : null}</div></div>
   </section>
  </dialog>
 </>;
}
