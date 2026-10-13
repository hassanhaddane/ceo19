'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {ExitLink} from './interaction/ExitLink';
import {useSignalMotion} from '@/lib/signalMotion';
import {motion} from '@/lib/motion';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/types/content';
import type { Dictionary } from '@/i18n/dictionaries';
import { artist } from '@/data/artist';
import { professional } from '@/data/professional';
import { useMediaDialog } from './media/useMediaDialog';
import { LogoMark } from './primitives';
import { Architecture } from './world/Architecture';
import { nightScenes,nightCopy,type SceneId } from '@/data/nightWorld';
const sections = nightScenes.map(scene=>scene.id);
export function Navigation({ locale, copy }: { locale: Locale; copy: Dictionary }) {
 const pathname = usePathname();
 const [open, setOpen] = useState(false);
 const [closing,setClosing]=useState(false);
 const enabled=useSignalMotion(),destination=useRef<string|null>(null);
 const [active, setActive] = useState<SceneId>('home');
 const {dialog:menuRef,openerRef}=useMediaDialog(open);
 const trigger = useRef<HTMLButtonElement>(null);

 useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
   const visible = entries.find((entry) => entry.isIntersecting);
   if (visible) setActive(visible.target.id as SceneId);
  }, { rootMargin: '-15% 0px -65% 0px' });
  sections.forEach((id) => { const section = document.getElementById(id); if (section) observer.observe(section); });
  return () => observer.disconnect();
 }, [pathname]);
 useEffect(()=>{if(!closing)return;const timer=window.setTimeout(()=>{setOpen(false);setClosing(false);const href=destination.current;destination.current=null;if(href)window.location.assign(href);},enabled?motion.menuClose:100);return()=>clearTimeout(timer);},[closing,enabled]);
 function close() { if(!closing)setClosing(true); }
 function navigate(event:React.MouseEvent<HTMLAnchorElement>) {if(closing){event.preventDefault();return;}if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();destination.current=event.currentTarget.href;close();}
 return <>
  <a className="skip-link" href="#main">{copy.skip}</a>
  <header className="site-header">
   <a className="brand-link" href={`/${locale}#home`} aria-label={`${artist.name} — ${copy.nav.home}`}><LogoMark /></a>
   <nav aria-label={copy.index} className="desktop-nav">{sections.map((id) => <a href={`/${locale}#${id}`} key={id} aria-current={pathname===`/${locale}`&&active===id?'location':undefined}>{nightCopy[locale].nav[id]}</a>)}</nav>
   <div className="header-controls">
    <LanguageSwitcher locale={locale} label={copy.language} pathname={pathname} />
    <button ref={trigger} className="menu-toggle" data-cursor="enter" data-interaction="silent" data-owned-interaction aria-haspopup="dialog" aria-expanded={open} aria-controls="site-menu" onClick={() => {openerRef.current=trigger.current;setClosing(false);setOpen(true);}}><span>{copy.menu}</span><span className="menu-icon" aria-hidden="true"><i /><i /></span></button>
   </div>
  </header>
  <dialog id="site-menu" ref={menuRef} className="menu-dialog" data-owned-interaction data-motion={enabled} data-closing={closing} aria-labelledby="menu-title" onCancel={event=>{event.preventDefault();close();}}>
   <div className="menu-material" aria-hidden="true"><Image src="/images/architecture/passage.webp" alt="" fill sizes="100vw"/></div><div className="menu-doors" aria-hidden="true"><div className="menu-wall menu-wall--left"/><div className="menu-wall menu-wall--right"/></div><div className="menu-graphics" aria-hidden="true"><span className="menu-ambient">019</span><Architecture variant="stair"/></div><div className="menu-top"><a href={`/${locale}#home`} onClick={navigate}><LogoMark /></a><span id="menu-title" className="metadata">{copy.index} / {artist.name}</span><LanguageSwitcher locale={locale} label={copy.language} pathname={pathname} /><button className="menu-toggle" data-cursor="close" data-interaction="silent" data-owned-interaction aria-disabled={closing} onClick={close}>{copy.close}<span aria-hidden="true">×</span></button></div>
   <nav aria-label={copy.index} className="menu-links">{sections.map((id, index) => <a key={id} href={`/${locale}#${id}`} onClick={navigate} data-cursor="enter" data-interaction="silent" data-owned-interaction aria-current={pathname===`/${locale}`&&active===id?'location':undefined}><span className="metadata">0{index+1}</span><span>{nightCopy[locale].nav[id]}</span></a>)}</nav>
   <div className="menu-bottom"><span id="signal-motion-settings"/><span className="metadata">{artist.origin[locale]}</span><a href={`/${locale}/press`} onClick={navigate}>{copy.press}</a><a href={`mailto:${professional.email}`}>{copy.contact}</a></div>
  </dialog>
 </>;
}

function LanguageSwitcher({ locale, label, pathname }: { locale: Locale; label: string; pathname: string }) {
 return <nav className="language-switch" aria-label={label}>{(['en','fr'] as const).map((language) => {
  const href = `/${language}${pathname.replace(/^\/(en|fr)/, '')}`;
  return <ExitLink world="language" key={language} href={href} data-analytics="language_change" data-id={language} hrefLang={language} lang={language} aria-current={locale === language ? 'page' : undefined} onClick={(event) => { event.currentTarget.href = `${href}${window.location.hash}`; }}>{language.toUpperCase()}</ExitLink>;
 })}</nav>;
}
