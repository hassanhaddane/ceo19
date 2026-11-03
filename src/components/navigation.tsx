'use client';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { NavigationAction } from './interactive/NavigationAction';
import { UtilityButton, UtilityGlyph } from './interactive/UtilityAction';
import { ActionButton, ActionLabel, ActionMark } from './interactive/ActionButton';
import { SoundSettings } from '@/features/audio/SoundSettings';
import { usePathname, useRouter } from 'next/navigation';
import type { Locale, SectionId } from '@/types/content';
import type { Dictionary } from '@/i18n/dictionaries';
import { artist, scenes } from '@/data/artist';
import { professional } from '@/data/professional';
import { useMediaDialog } from './media/useMediaDialog';
import { LogoMark } from './primitives';
import { useEntryExperience } from './visuals/VisualExperience';
import { navigateScene, publishScene, useSceneState } from '@/lib/sceneNavigation';
import { isSignalMotionEnabled, resetSignalMotion, setSignalMotion, useSignalMotion, useSignalMotionPreference } from '@/lib/signalMotion';
import { visualEffects } from '@/lib/visualEffects';
import { experienceStart } from '@/lib/experienceRoutes';
import { shopEntry } from '@/lib/shopEntry';
import { ShopNavigationAction } from './interactive/ShopNavigationAction';

export function FloatingNavigation({ locale, copy }: { locale: Locale; copy: Dictionary }) {
 const pathname = usePathname(), router = useRouter(), scene = useSceneState(), motion = useSignalMotion();
 const motionPreference = useSignalMotionPreference();
 const motionLabel = locale === 'fr' ? 'Mouvement complet' : 'Full motion';
 const motionStatus = motion ? (locale === 'fr' ? 'Animations activées.' : 'Motion enabled.') : motionPreference === 'system' ? (locale === 'fr' ? 'Animations réduites selon le réglage de votre appareil.' : 'Reduced motion follows your device setting.') : (locale === 'fr' ? 'Animations réduites par votre choix.' : 'Reduced motion is your saved choice.');
 const [open, setOpen] = useState(false), [closing, setClosing] = useState(false);
 const entry = useEntryExperience();
 const { dialog: menuRef, openerRef } = useMediaDialog(open);
 const trigger = useRef<HTMLButtonElement>(null), nav = useRef<HTMLElement>(null), marker = useRef<HTMLSpanElement>(null);
 const animations = useRef<Animation[]>([]), timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
 const closingRef = useRef(false);
 const departureTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
 useEffect(() => {
  delete document.documentElement.dataset.archiveDeparting;
  return () => { clearTimeout(departureTimer.current); delete document.documentElement.dataset.archiveDeparting; };
 }, [pathname]);
 function shopNavigate(event: MouseEvent<HTMLAnchorElement>, fromMenu = false) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const origin = { x: (rect.left + rect.width / 2) / innerWidth, y: (rect.top + rect.height / 2) / innerHeight };
  if (fromMenu) {
   event.preventDefault(); close(() => { shopEntry.request(origin); if (pathname !== `/${locale}/shop`) router.push(experienceStart(locale,'shop')); });
   return;
  }
  shopEntry.request(origin);
  if (pathname === `/${locale}/shop`) { event.preventDefault(); return; }
  if (pathname === `/${locale}` && scene.active === 'archive' && motion) {
   event.preventDefault(); clearTimeout(departureTimer.current); document.documentElement.setAttribute('data-archive-departing', 'true');
   departureTimer.current = setTimeout(() => router.push(experienceStart(locale,'shop')), 240);
  }
 }
 useEffect(() => {
  const update = () => {
   const active = nav.current?.querySelector<HTMLElement>('[aria-current]');
   if (!active || !marker.current) return;
   marker.current.style.width = '24px';
   marker.current.style.transform = `translateX(${active.offsetLeft + active.offsetWidth / 2 - 12}px)`;
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
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (pathname !== `/${locale}`) { close(); return; }
  event.preventDefault(); close(() => navigateScene(id));
 }
 return <>
  <a className="skip-link" href="#main">{copy.skip}</a>
  <header className="site-header floating-navigation" data-compact={pathname !== `/${locale}` || scene.compact} data-scene={scene.active} data-surface={pathname.endsWith('/epk') ? 'cream' : pathname.endsWith('/shop') ? 'dark' : scenes.find(item => item.id === scene.active)?.navigationSurface}>
   <nav ref={nav} aria-label={copy.index} className="desktop-nav">{scenes.map(({ id, number }) => <NavigationAction client href={`/${locale}#${id}`} key={id} onClick={event => {
    if (pathname === `/${locale}` && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); navigateScene(id); }
   }} data-cursor="enter" aria-current={pathname === `/${locale}` && scene.active === id ? 'location' : undefined}><span className="navigation-number" aria-hidden="true">{number}</span><span className="navigation-label"><ActionLabel>{copy.nav[id]}</ActionLabel></span></NavigationAction>)}<span ref={marker} className="navigation-marker" aria-hidden="true"/></nav>
   <NavigationAction client className="brand-link" data-cursor="enter" href={`/${locale}#home`} onClick={event => {
    if (pathname === `/${locale}` && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); navigateScene('home'); }
   }} aria-label={`${artist.name} — ${copy.nav.home}`}><LogoMark /></NavigationAction>
   <div className="header-controls"><SoundSettings locale={locale}/><LanguageSwitcher locale={locale} label={copy.language} pathname={pathname}/><ActionButton family="navigation" ref={trigger} className="menu-toggle" data-cursor="enter" data-owned-interaction aria-label={copy.menu} aria-haspopup="dialog" aria-expanded={open} aria-controls="site-menu" onClick={() => { openerRef.current = trigger.current; setOpen(true); }}><span className="header-menu-label"><span className="header-menu-desktop">INDEX</span><span className="header-menu-mobile">MENU</span></span><span className="menu-toggle-mark" aria-hidden="true"><i/><i/></span></ActionButton><nav aria-label="Shop" className="header-shop-nav"><ShopNavigationAction href={experienceStart(locale,'shop')} onClick={event => shopNavigate(event)} aria-current={pathname === `/${locale}/shop` ? 'page' : undefined}/></nav></div>
  </header>
  <dialog id="site-menu" ref={menuRef} className="menu-dialog architectural-menu" data-owned-interaction data-closing={closing} aria-labelledby="menu-title" onCancel={event => { event.preventDefault(); close(); }}>
   <div className="menu-atmosphere" aria-hidden="true"/>
   <div className="menu-top"><NavigationAction client href={`/${locale}#home`} data-cursor="enter" onClick={event => menuNavigate(event, 'home')}><LogoMark /></NavigationAction><span id="menu-title" className="metadata">{artist.name} / {copy.index}</span><LanguageSwitcher locale={locale} label={copy.language} pathname={pathname}/><UtilityButton className="menu-toggle" data-cursor="close" onClick={() => close()}>{copy.close}<UtilityGlyph kind="close"/></UtilityButton></div>
   <nav aria-label={copy.index} className="menu-links">{scenes.map(({ id, number }) => <NavigationAction client key={id} href={`/${locale}#${id}`} onClick={event => menuNavigate(event, id)} data-cursor="enter" aria-current={pathname === `/${locale}` && scene.active === id ? 'location' : undefined}><span className="metadata">{number}</span><ActionLabel>{copy.nav[id]}</ActionLabel></NavigationAction>)}<ShopNavigationAction href={experienceStart(locale,'shop')} onClick={event => shopNavigate(event, true)} aria-current={pathname === `/${locale}/shop` ? 'page' : undefined}/></nav>
   <div className="menu-bottom"><SoundSettings locale={locale}/><span id="motion-setting-status" className="sr-only" role="status">{motionStatus}</span><span className="metadata">{artist.origin[locale]}</span><details className="menu-preferences"><summary>{locale === 'fr' ? 'EXPÉRIENCE' : 'EXPERIENCE'}</summary><div><UtilityButton type="button" className="menu-motion" aria-describedby="motion-setting-status" data-cursor="enter" aria-pressed={motion} aria-label={motionLabel} onClick={() => setSignalMotion(!motion)}>{motion ? (locale === 'fr' ? 'Réduire le mouvement' : 'Reduce motion') : (locale === 'fr' ? 'Activer le mouvement' : 'Enable full motion')}</UtilityButton>{motionPreference !== 'system' && <UtilityButton type="button" className="menu-motion-reset" onClick={resetSignalMotion}>{locale === 'fr' ? 'Suivre le réglage de l’appareil' : 'Use device setting'}</UtilityButton>}{entry && <UtilityButton type="button" className="menu-replay" data-cursor="enter" onClick={() => close(entry.replay)}><ActionLabel>{locale === 'fr' ? 'Revoir l’intro' : 'Replay intro'}</ActionLabel><ActionMark/></UtilityButton>}</div></details><NavigationAction client href={experienceStart(locale,'epk')} onClick={() => close()} aria-current={pathname === `/${locale}/epk` ? 'page' : undefined}>{copy.press}</NavigationAction><NavigationAction href={`mailto:${professional.email}`}><ActionLabel>{copy.contact}</ActionLabel></NavigationAction></div>
  </dialog>
 </>;
}
function LanguageSwitcher({ locale, label, pathname }: { locale: Locale; label: string; pathname: string }) {
 return <nav className="language-switch" aria-label={label}>{(['en', 'fr'] as const).map(language => {
  const href = `/${language}${pathname.replace(/^\/(en|fr)/, '')}`;
  return <NavigationAction key={language} href={href} data-cursor="enter" data-analytics="language_change" data-id={language} hrefLang={language} lang={language} aria-current={locale === language ? 'page' : undefined} onClick={event => { event.currentTarget.href = `${href}${window.location.search}${window.location.hash}`; }}><ActionLabel>{language.toUpperCase()}</ActionLabel></NavigationAction>;
 })}</nav>;
}

export { FloatingNavigation as Navigation };
