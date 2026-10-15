'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Locale } from '@/types/content';
import { useSignalMotion } from '@/lib/signalMotion';
import { visualEffects } from '@/lib/visualEffects';
import { LogoMark } from '../primitives';
import { HkzMark } from '../interaction/HkzMark';
import { useMediaDialog } from '../media/useMediaDialog';
import { GlobalVisualBackground } from './GlobalVisualBackground';
import { SmokeBurst } from './SmokeBurst';
import { Lighter } from './Lighter';
import { GlobalParallax } from './GlobalParallax';
import { Cursor } from '../Cursor';
import { AnimationDiagnostics } from '../diagnostics/AnimationDiagnostics';

const SESSION_KEY = 'ceo19:intro:v3';
let enteredInMemory = false;
const EntryContext = createContext<{ replay: () => void; entered: boolean } | null>(null);
export function useEntryExperience() { return useContext(EntryContext); }
type EntryPhase = 'checking' | 'ready' | 'playing' | 'revealing' | 'closed';

export function VisualExperience({ children, locale }: { children: ReactNode; locale: Locale }) {
 const [phase, setPhase] = useState<EntryPhase>('checking');
 const [burst, setBurst] = useState(0);
 const pathname = usePathname(), router = useRouter(), motion = useSignalMotion();
 const active = phase !== 'closed' && phase !== 'checking';
 const { dialog } = useMediaDialog(active);
 const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
 const clearTimers = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
 useEffect(() => {
  // A failed storage API must never prevent entry. Server content remains usable without JS.
  let entered = enteredInMemory;
  try { entered ||= sessionStorage.getItem(SESSION_KEY) === 'entered'; } catch { /* Private/storage-blocked browsers use memory. */ }
  const timer = setTimeout(() => setPhase(entered ? 'closed' : 'ready'), 0);
  return () => { clearTimeout(timer); clearTimers(); };
 }, [clearTimers]);
 const showHome = useCallback(() => {
  if (pathname !== `/${locale}`) { router.push(`/${locale}#home`); return; }
  window.history.replaceState(null, '', `/${locale}#home`);
  window.scrollTo({ top: 0, behavior: 'instant' });
 }, [pathname, locale, router]);
 const finish = useCallback(() => {
  clearTimers(); enteredInMemory = true;
  try { sessionStorage.setItem(SESSION_KEY, 'entered'); } catch { /* Entry still completes. */ }
  setPhase('closed'); showHome();
  requestAnimationFrame(() => { document.getElementById('main')?.focus({ preventScroll: true }); window.dispatchEvent(new Event('ceo:entry-complete')); });
 }, [clearTimers, showHome]);
 const replay = useCallback(() => { clearTimers(); setPhase('ready'); }, [clearTimers]);
 const value = useMemo(() => ({ replay, entered: phase === 'closed' }), [replay, phase]);
 function ignite() {
  if (phase !== 'ready') return;
  setPhase('playing');
  setBurst(previous => previous + 1);
  if (motion) timers.current.push(setTimeout(() => { setPhase('revealing'); if (pathname === `/${locale}`) showHome(); }, visualEffects.entry.revealAt));
  timers.current.push(setTimeout(finish, motion ? visualEffects.entry.duration : visualEffects.entry.reduced));
 }
 return <EntryContext.Provider value={value}>
  <GlobalVisualBackground intro={active && phase !== 'revealing'} />
  <GlobalParallax />
  {process.env.NODE_ENV === 'development' && <AnimationDiagnostics />}
  <Cursor locale={locale} />
  <div className="visual-site-shell" data-entry-veiled={active && phase !== 'revealing'}>{children}</div>
  <dialog ref={dialog} className="entry-dialog" aria-labelledby="entry-title" data-owned-interaction data-phase={phase} data-motion={motion} style={{ '--entry-duration': `${visualEffects.entry.duration}ms` } as CSSProperties} onCancel={event => { event.preventDefault(); finish(); }}>
   <div className="entry-scrim" />
   <header className="entry-top"><span className="metadata">CEO1.9</span><button type="button" onClick={finish} className="entry-skip">{locale === 'fr' ? 'PASSER L’INTRO' : 'SKIP INTRO'}<span aria-hidden="true"> ↗</span></button></header>
   <div className="entry-center">
    <h1 id="entry-title" className="sr-only">CEO1.9 — LIGHT UP</h1>
    <LogoMark className="entry-logo" sizes="(max-width:767px) 160px, 190px" />
    <div className="entry-action"><Lighter /><button type="button" className="light-up" onClick={ignite} aria-disabled={phase !== 'ready'}><span>LIGHT UP</span><svg viewBox="0 0 30 30" aria-hidden="true"><path d="M5 25 25 5M5 5h20v20" fill="none" stroke="currentColor" strokeWidth="1.2"/></svg></button></div>
   </div>
   <footer className="entry-production"><HkzMark /><span className="metadata">PRODUCTION BY HKZ PROD</span></footer>
   <SmokeBurst trigger={phase === 'playing' || phase === 'revealing' ? burst : 0} />
   <p className="sr-only" role="status">{phase === 'playing' ? locale === 'fr' ? 'Entrée…' : 'Entering…' : ''}</p>
  </dialog>
 </EntryContext.Provider>;
}
