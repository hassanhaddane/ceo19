'use client';
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Locale } from '@/types/content';
import { IntroSequence } from '../intro/IntroSequence';
import { VideoBackground } from './GlobalVisualBackground';
import { GlobalParallax } from './GlobalParallax';

// This flag belongs to this document's JS lifetime, never session/local storage.
let enteredThisDocument = false;
const EntryContext = createContext<{ replay: () => void; entered: boolean } | null>(null);
export function useEntryExperience() { return useContext(EntryContext); }
export function VisualExperience({ children, locale }: { children: ReactNode; locale: Locale }) {
 const pathname = usePathname(), router = useRouter(), shell = useRef<HTMLDivElement>(null);
 // Every new document offers the entrance once. Persistent layouts and remounts
 // during internal navigation reuse the completed document state.
 const publicRoute = pathname === `/${locale}`;
 const [phase, setPhase] = useState<'running' | 'closed'>(() => enteredThisDocument ? 'closed' : 'running');
 const [run, setRun] = useState(0), [revealing, setRevealing] = useState(false);
 const active = phase !== 'closed', completed = useRef(false);
 useLayoutEffect(() => {
  const element = shell.current; if (!active || !element) return;
  const bodyOverflow = document.body.style.overflow, rootOverflow = document.documentElement.style.overflow;
  const wasInert = element.inert;
  element.inert = true; element.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = 'hidden'; document.documentElement.style.overflow = 'hidden';
  return () => { element.inert = wasInert; element.removeAttribute('aria-hidden'); document.body.style.overflow = bodyOverflow; document.documentElement.style.overflow = rootOverflow; };
 }, [active]);
 const start = useCallback(() => {
  window.dispatchEvent(new Event('ceo:intro-start'));
 }, []);
 const finish = useCallback(() => {
  if (completed.current) return; completed.current = true; enteredThisDocument = true;
  document.documentElement.dataset.introHomeReveal = 'true';
  setPhase('closed'); setRevealing(false);
  requestAnimationFrame(() => {
   (document.getElementById('main') ?? document.querySelector<HTMLElement>('main'))?.focus({ preventScroll: true });
   window.dispatchEvent(new Event('ceo:entry-complete'));
  });
 }, []);
 const reveal = useCallback(() => setRevealing(true), []);
 const replay = useCallback(() => {
  completed.current = false; setRevealing(false); setRun(value => value + 1); setPhase('running');
  if (pathname !== `/${locale}`) router.push(`/${locale}#home`);
 }, [pathname, locale, router]);
 const value = useMemo(() => ({ replay, entered: !active }), [replay, active]);
 return <EntryContext.Provider value={value}>
  {publicRoute && <VideoBackground intro={active} />}
  {publicRoute && <GlobalParallax />}
  <div ref={shell} className="visual-site-shell" data-intro-state={active ? revealing ? 'revealing' : 'running' : 'closed'}>{children}</div>
  {active && <IntroSequence key={run} enabled locale={locale} onStart={start} onReveal={reveal} onComplete={finish} />}
 </EntryContext.Provider>;
}
