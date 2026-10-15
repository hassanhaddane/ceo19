'use client';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import type { Locale, SectionId } from '@/types/content';
import type { Dictionary } from '@/i18n/dictionaries';
import { artist, scenes } from '@/data/artist';
import { professional } from '@/data/professional';
import { useMediaDialog } from './media/useMediaDialog';
import { LogoMark } from './primitives';
import { useEntryExperience } from './visuals/VisualExperience';
import { FezArchitecture } from './visuals/FezArchitecture';
import { navigateScene, publishScene, useSceneState } from '@/lib/sceneNavigation';
import { isSignalMotionEnabled, resetSignalMotion, setSignalMotion, useSignalMotion, useSignalMotionPreference } from '@/lib/signalMotion';
import { visualEffects } from '@/lib/visualEffects';

export function Navigation({ locale, copy }: { locale: Locale; copy: Dictionary }) {
 const pathname = usePathname(), scene = useSceneState(), motion = useSignalMotion();
 const motionPreference = useSignalMotionPreference();
 const motionLabel = locale === 'fr' ? 'Mouvement complet' : 'Full motion';
 const motionStatus = motion ? (locale === 'fr' ? 'Animations activées.' : 'Motion enabled.') : motionPreference === 'system' ? (locale === 'fr' ? 'Animations réduites selon le réglage de votre appareil.' : 'Reduced motion follows your device setting.') : (locale === 'fr' ? 'Animations réduites par votre choix.' : 'Reduced motion is your saved choice.');
 const [open, setOpen] = useState(false), [closing, setClosing] = useState(false);
 const entry = useEntryExperience();
 const { dialog: menuRef, openerRef } = useMediaDialog(open);
 const trigger = useRef<HTMLButtonElement>(null), nav = useRef<HTMLElement>(null), marker = useRef<HTMLSpanElement>(null);
 const animations = useRef<Animation[]>([]), timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
 const closingRef = useRef(false);
 useEffect(() => {
  const update = () => {
   const active = nav.current?.querySelector<HTMLElement>('[aria-current]');
   if (!active || !marker.current) return;
   marker.current.style.width = `${active.offsetWidth}px`;
   marker.current.style.transform = `translateX(${active.offsetLeft}px)`;
  };
  let disposed = false;
  const frame = requestAnimationFrame(update);
  // Font swaps and the compact-header transition both change intrinsic link geometry.
  const observer = new ResizeObserver(update);
  if (nav.current) { observer.observe(nav.current); nav.current.querySelectorAll('a').forEach(link => observer.observe(link)); }
  void document.fonts.ready.then(() => { if (!disposed) update(); });
  document.fonts.addEventListener('loadingdone', update); window.addEventListener('resize', update);
  return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); document.fonts.removeEventListener('loadingdone', update); window.removeEventListener('resize', update); };
 }, [scene.active, scene.compact, locale, pathname]);
 useEffect(() => {
  if (!open) return;
  document.documentElement.dataset.menuOpen = 'true'; publishScene({ menuOpen: true });
  const element = menuRef.current;
  if (element && isSignalMotionEnabled()) {
   animations.current.push(element.animate([{ clipPath: visualEffects.menu.aperture }, { clipPath: visualEffects.menu.full }], { duration: visualEffects.menu.open, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }));
   element.querySelectorAll<HTMLElement>('.menu-links a').forEach((link, index) => animations.current.push(link.animate([{ translate: '0 34px', opacity: 0 }, { translate: '0 0', opacity: 1 }], { duration: 520, delay: 120 + index * 42, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' })));
  }
  return () => {
   delete document.documentElement.dataset.menuOpen; publishScene({ menuOpen: false });
   animations.current.forEach(animation => animation.cancel()); animations.current = [];
   clearTimeout(timer.current);
  };
 }, [open, menuRef]);
 useEffect(() => {
  if (motion || !open || closingRef.current) return;
  animations.current.forEach(animation => animation.cancel()); animations.current = [];
 }, [motion, open]);
 function close(after?: () => void) {
  if (closingRef.current) return;
  closingRef.current = true; setClosing(true);
  const element = menuRef.current;
  const finish = () => {
   delete document.documentElement.dataset.menuOpen;
   // Release the native top layer before returning focus to the revealed header.
   menuRef.current?.close();
   closingRef.current = false; setClosing(false); setOpen(false);
   requestAnimationFrame(() => { if (after) after(); else trigger.current?.focus({ preventScroll: true }); });
  };
  if (!element || !motion || document.hidden) { finish(); return; }
  const from = getComputedStyle(element).clipPath;
  animations.current.forEach(animation => animation.cancel()); animations.current = [];
  animations.current.push(element.animate([{ clipPath: from }, { clipPath: visualEffects.menu.aperture }], { duration: visualEffects.menu.close, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }));
  timer.current = setTimeout(finish, visualEffects.menu.close);
 }
 function menuNavigate(event: MouseEvent<HTMLAnchorElement>, id: SectionId) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || pathname !== `/${locale}`) return;
  event.preventDefault(); close(() => navigateScene(id));
 }
 return <>
  <a className="skip-link" href="#main">{copy.skip}</a>
  <header className="site-header floating-navigation" data-compact={scene.compact} data-scene={scene.active}>
   <a className="brand-link" data-cursor="enter" href={`/${locale}#home`} aria-label={`${artist.name} — ${copy.nav.home}`}><LogoMark /></a>
   <nav ref={nav} aria-label={copy.index} className="desktop-nav">{scenes.map(({ id }) => <a href={`/${locale}#${id}`} key={id} data-cursor="enter" aria-current={pathname === `/${locale}` && scene.active === id ? 'location' : undefined}>{copy.nav[id]}</a>)}<span ref={marker} className="navigation-marker" aria-hidden="true"/></nav>
   <div className="header-controls"><button type="button" className="motion-indicator" data-cursor="enter" aria-label={motionLabel} aria-pressed={motion} aria-describedby="motion-setting-status" title={motionStatus} onClick={() => setSignalMotion(!motion)}><i aria-hidden="true"/><span className="motion-label-desktop">{locale === 'fr' ? 'ANIM.' : 'MOTION'} {motion ? 'ON' : 'OFF'}</span><span className="motion-label-mobile" aria-hidden="true">FX {motion ? 'ON' : 'OFF'}</span></button><span id="motion-setting-status" className="sr-only" role="status">{motionStatus}</span><LanguageSwitcher locale={locale} label={copy.language} pathname={pathname}/><button ref={trigger} className="menu-toggle" data-cursor="enter" data-owned-interaction aria-haspopup="dialog" aria-expanded={open} aria-controls="site-menu" onClick={() => { openerRef.current = trigger.current; setOpen(true); }}><span>{copy.menu}</span><span className="menu-icon" aria-hidden="true"><i/><i/></span></button></div>
  </header>
  <dialog id="site-menu" ref={menuRef} className="menu-dialog architectural-menu" data-owned-interaction data-closing={closing} aria-labelledby="menu-title" onCancel={event => { event.preventDefault(); close(); }}>
   <div className="menu-atmosphere" aria-hidden="true"/><div className="menu-architecture"><FezArchitecture /></div>
   <div className="menu-top"><a href={`/${locale}#home`} data-cursor="enter" onClick={event => menuNavigate(event, 'home')}><LogoMark /></a><span id="menu-title" className="metadata">{artist.name} / {copy.index}</span><LanguageSwitcher locale={locale} label={copy.language} pathname={pathname}/><button className="menu-toggle" data-cursor="close" onClick={() => close()}>{copy.close}<span aria-hidden="true">×</span></button></div>
   <nav aria-label={copy.index} className="menu-links">{scenes.map(({ id }, index) => <a key={id} href={`/${locale}#${id}`} onClick={event => menuNavigate(event, id)} data-cursor="enter" aria-current={pathname === `/${locale}` && scene.active === id ? 'location' : undefined}><span className="metadata">0{index + 1}</span><span>{copy.nav[id]}</span><span className="menu-link-arrow" aria-hidden="true">↗</span></a>)}</nav>
   <div className="menu-bottom"><span className="metadata">{artist.origin[locale]}</span><button type="button" className="menu-motion" data-cursor="enter" aria-pressed={motion} aria-label={locale === 'fr' ? 'Mouvement complet' : 'Full motion'} onClick={() => setSignalMotion(!motion)}>{motion ? (locale === 'fr' ? 'Réduire le mouvement' : 'Reduce motion') : (locale === 'fr' ? 'Activer le mouvement' : 'Enable full motion')}</button>{motionPreference !== 'system' && <button type="button" className="menu-motion-reset" onClick={resetSignalMotion}>{locale === 'fr' ? 'Suivre le réglage de l’appareil' : 'Use device setting'}</button>}{entry && <button type="button" className="menu-replay" data-cursor="enter" onClick={() => close(entry.replay)}>{locale === 'fr' ? 'Revoir l’intro' : 'Replay intro'} ↗</button>}<a href={`/${locale}/press`}>{copy.press}</a><a href={`mailto:${professional.email}`}>{copy.contact}</a></div>
  </dialog>
 </>;
}
function LanguageSwitcher({ locale, label, pathname }: { locale: Locale; label: string; pathname: string }) {
 return <nav className="language-switch" aria-label={label}>{(['en', 'fr'] as const).map(language => {
  const href = `/${language}${pathname.replace(/^\/(en|fr)/, '')}`;
  return <a key={language} href={href} data-cursor="enter" data-analytics="language_change" data-id={language} hrefLang={language} lang={language} aria-current={locale === language ? 'page' : undefined} onClick={event => { event.currentTarget.href = `${href}${window.location.hash}`; }}>{language.toUpperCase()}</a>;
 })}</nav>;
}
