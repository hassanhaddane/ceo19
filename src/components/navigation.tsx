'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
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
import { experienceStart } from '@/lib/experienceRoutes';
import { shopEntry } from '@/lib/shopEntry';
import { ShopNavigationAction } from './interactive/ShopNavigationAction';
import { createMenuController } from './navigation/MenuController';

export function FloatingNavigation({ locale, copy }: { locale: Locale; copy: Dictionary }) {
 const pathname = usePathname(), router = useRouter(), scene = useSceneState(), motion = useSignalMotion();
 const motionPreference = useSignalMotionPreference();
 const motionLabel = locale === 'fr' ? 'Animations' : 'Motion';
 const motionStatus = motion ? (locale === 'fr' ? 'Animations activées.' : 'Motion enabled.') : motionPreference === 'system' ? (locale === 'fr' ? 'Animations réduites selon le réglage de votre appareil.' : 'Reduced motion follows your device setting.') : (locale === 'fr' ? 'Animations réduites par votre choix.' : 'Reduced motion is your saved choice.');
 const [open, setOpen] = useState(false), [closing, setClosing] = useState(false);
 const entry = useEntryExperience();
 const { dialog: menuRef, openerRef } = useMediaDialog(open);
 const trigger = useRef<HTMLButtonElement>(null), nav = useRef<HTMLElement>(null), marker = useRef<HTMLSpanElement>(null);
 const menuController = useRef<ReturnType<typeof createMenuController> | null>(null);
 const closeAction = useRef<(() => void) | undefined>(undefined);
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
 const finishClose = useCallback(() => {
  const after = closeAction.current; closeAction.current = undefined;
  menuRef.current?.close();
  closingRef.current = false; setClosing(false); setOpen(false);
  requestAnimationFrame(() => { if (after) after(); else trigger.current?.focus({ preventScroll: true }); });
 }, [menuRef]);
 useLayoutEffect(() => {
  if (!open) return;
  const element = menuRef.current;
  if (!element) return;
  document.documentElement.dataset.menuOpen = 'true'; publishScene({ menuOpen: true });
  if (isSignalMotionEnabled()) {
   const controller = createMenuController({
    sheet: element.querySelector('.menu-paper'), cut: element.querySelector('.menu-cut-track'),
    items: element.querySelectorAll('.menu-links > a'), signature: element.querySelector('.menu-editorial-marker'),
    scope: element, onClosed: finishClose, onStage: stage => { element.dataset.menuStage = stage; },
   });
   menuController.current = controller; controller.open();
  } else element.dataset.menuStage = 'open';
  const visibility = () => { if (document.hidden) menuController.current?.settle(); };
  document.addEventListener('visibilitychange', visibility);
  return () => {
   document.removeEventListener('visibilitychange', visibility);
   menuController.current?.dispose(); menuController.current = null;
   delete document.documentElement.dataset.menuOpen; publishScene({ menuOpen: false });
   closeAction.current = undefined;
  };
 }, [open, menuRef, finishClose]);
 useLayoutEffect(() => {
  if (!open || motion) return;
  if (closingRef.current) finishClose();
  else menuController.current?.settle();
 }, [motion, open, finishClose]);
 useLayoutEffect(() => {
  if (!open) return;
  const element = menuRef.current, index = element?.querySelector<HTMLElement>('.menu-links');
  const signature = element?.querySelector<HTMLElement>('.menu-editorial-marker');
  if (!index || !signature) return;
  const links = Array.from(index.querySelectorAll<HTMLElement>('a'));
  let selected = links.find(link => link.hasAttribute('aria-current')) ?? links[0];
  const position = () => {
   if (!selected) return;
   signature.style.height = `${Math.max(20, selected.offsetHeight * .5)}px`;
   signature.style.translate = `0 ${selected.offsetTop + selected.offsetHeight * .25}px`;
  };
  const emphasize = (link?: HTMLElement) => {
   selected = link ?? links.find(item => item.hasAttribute('aria-current')) ?? links[0];
   index.dataset.preview = String(!!link);
   links.forEach(item => { item.dataset.emphasized = String(item === link); });
   position();
  };
  const over = (event: Event) => {
   if (event instanceof PointerEvent && event.pointerType !== 'mouse') return;
   const link = event.target instanceof Element ? event.target.closest<HTMLElement>('.menu-links > a') : null;
   if (link) emphasize(link);
  };
  const leave = () => {
   const focused = document.activeElement instanceof HTMLElement && links.includes(document.activeElement) ? document.activeElement : undefined;
   emphasize(focused);
  };
  const blur = (event: FocusEvent) => { if (!(event.relatedTarget instanceof Node) || !index.contains(event.relatedTarget)) emphasize(); };
  position();
  const observer = new ResizeObserver(position); links.forEach(link => observer.observe(link));
  index.addEventListener('pointerover', over); index.addEventListener('pointerleave', leave);
  index.addEventListener('focusin', over); index.addEventListener('focusout', blur);
  return () => { observer.disconnect(); index.removeEventListener('pointerover', over); index.removeEventListener('pointerleave', leave); index.removeEventListener('focusin', over); index.removeEventListener('focusout', blur); };
 }, [open, menuRef, scene.active, pathname]);
 function close(after?: () => void) {
  if (closingRef.current) return;
  closeAction.current = after; closingRef.current = true; setClosing(true);
  if (!menuController.current || !isSignalMotionEnabled() || document.hidden) finishClose();
  else menuController.current.close();
 }
 function menuNavigate(event: MouseEvent<HTMLAnchorElement>, id: SectionId) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (pathname !== `/${locale}`) { event.preventDefault(); close(() => router.push(`/${locale}#${id}`)); return; }
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
  <dialog id="site-menu" ref={menuRef} onClick={event => { if (event.target === event.currentTarget || event.target instanceof Element && event.target.classList.contains('menu-paper')) close(); }} className="menu-dialog architectural-menu" data-owned-interaction data-closing={closing} aria-labelledby="menu-title" onCancel={event => { event.preventDefault(); close(); }}>
   <div className="menu-paper" aria-hidden="true"/><div className="menu-cut-track" aria-hidden="true"><span/></div>
   <div className="menu-top"><NavigationAction client href={`/${locale}#home`} data-cursor="enter" onClick={event => menuNavigate(event, 'home')}><LogoMark /></NavigationAction><span id="menu-title" className="metadata">{artist.name} / {copy.index}</span><LanguageSwitcher locale={locale} label={copy.language} pathname={pathname}/><UtilityButton className="menu-toggle" data-cursor="close" onClick={() => close()}>{copy.close}<UtilityGlyph kind="close"/></UtilityButton></div>
   <nav aria-label={copy.index} className="menu-links">{scenes.map(({ id, number }) => <NavigationAction client key={id} href={`/${locale}#${id}`} onClick={event => menuNavigate(event, id)} data-cursor="enter" aria-current={pathname === `/${locale}` && scene.active === id ? 'location' : undefined}><span className="metadata">{number}</span><ActionLabel>{copy.nav[id]}</ActionLabel></NavigationAction>)}<ShopNavigationAction href={experienceStart(locale,'shop')} onClick={event => shopNavigate(event, true)} aria-current={pathname === `/${locale}/shop` ? 'page' : undefined}/><span className="menu-editorial-marker" aria-hidden="true"/></nav>
   <div className="menu-bottom">
    <div className="menu-settings-row"><SoundSettings locale={locale}/><UtilityButton type="button" className="menu-motion" aria-describedby="motion-setting-status" data-cursor="enter" aria-pressed={motion} aria-label={motionLabel} onClick={() => setSignalMotion(!motion)}>MOTION {motion ? 'ON' : 'OFF'}</UtilityButton></div>
    <span id="motion-setting-status" className="sr-only" role="status">{motionStatus}</span>
    <details className="menu-preferences"><summary>{locale === 'fr' ? 'EXPÉRIENCE' : 'EXPERIENCE'}</summary><div>
     {motionPreference !== 'system' && <UtilityButton type="button" className="menu-motion-reset" onClick={resetSignalMotion}>{locale === 'fr' ? 'Suivre le réglage de l’appareil' : 'Use device setting'}</UtilityButton>}
     {entry && <UtilityButton type="button" className="menu-replay" data-cursor="enter" onClick={() => close(entry.replay)}><ActionLabel>{locale === 'fr' ? 'Revoir l’intro' : 'Replay intro'}</ActionLabel><ActionMark/></UtilityButton>}
    </div></details>
    <NavigationAction client href={experienceStart(locale,'epk')} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); close(() => router.push(experienceStart(locale,'epk'))); } }} aria-current={pathname === `/${locale}/epk` ? 'page' : undefined}>{copy.press}</NavigationAction>
    <NavigationAction href={`mailto:${professional.email}`}><ActionLabel>{copy.contact}</ActionLabel></NavigationAction>
   </div>
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
