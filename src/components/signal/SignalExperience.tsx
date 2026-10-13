'use client';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import { useSignalMotion, setSignalMotion } from '@/lib/signalMotion';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { SectionId, Locale } from '@/types/content';
import type { Palette } from './SignalObject';
import { useMusic } from '../music/MusicProvider';
import { dictionaries } from '@/i18n/dictionaries';
import { signalConfig, signalStates } from './signalStates';
import { useSignalScroll, type SignalRuntime } from './useSignalScroll';
const Scene = dynamic(() => import('./SignalScene'),{ssr:false});
class SignalBoundary extends Component<{ children: ReactNode; onFailure: () => void },{ failed: boolean }> {
 state = { failed:false };
 static getDerivedStateFromError() { return {failed:true}; }
 componentDidCatch() { this.props.onFailure(); }
 render() { return this.state.failed ? null : this.props.children; }
}
export function SignalExperience({ locale }: { locale: Locale }) {
 const copy = dictionaries[locale];
 const [settingsTarget,setSettingsTarget] = useState<HTMLElement | null>(null);
 useEffect(() => { const frame=requestAnimationFrame(()=>setSettingsTarget(document.getElementById('signal-motion-settings'))); return()=>cancelAnimationFrame(frame); },[]);
 const { isPlaying, selectedRelease } = useMusic();
 const enabled = useSignalMotion();
 const runtime = useRef<SignalRuntime>({from:'home',to:'home',progress:0,x:.75,y:.5,width:600,height:600,pointerX:0,pointerY:0,playing:false});
 const [section,setSection] = useState<SectionId>('home');
 const [environment,setEnvironment] = useState<{palette: Palette; mobile: boolean} | null>(null);
 const [visible,setVisible] = useState(true);
 const [ready,setReady] = useState(false);
 const [failed,setFailed] = useState(false);
 const onReady = useCallback(() => setReady(true),[]);
 const onFailure = useCallback(() => {setFailed(true);setReady(false);},[]);
 useSignalScroll(runtime,setSection);
 useEffect(() => { runtime.current.playing = isPlaying; },[isPlaying]);
 useEffect(() => {
  const screen = window.matchMedia('(max-width: 767px)');
  let disposed = false, timer = 0;
  const initialize = () => {
   if(disposed || !enabled) { setEnvironment(null); setReady(false); return; }
   const probe = document.createElement('canvas');
   const context = probe.getContext('webgl2');
   if(!context) {onFailure();return;}
   context.getExtension('WEBGL_lose_context')?.loseContext();
   const css = getComputedStyle(document.documentElement);
   setEnvironment({mobile:screen.matches,palette:{silver:css.getPropertyValue(signalConfig.colorTokens.silver).trim(),blue:css.getPropertyValue(signalConfig.colorTokens.blue).trim(),black:css.getPropertyValue(signalConfig.colorTokens.black).trim(),cream:css.getPropertyValue(signalConfig.colorTokens.cream).trim()}});
  };
  // DOM content and static sampled surface render first; WebGL initializes after the first paint.
  timer = window.setTimeout(initialize,160);
  const screenChange = () => {setReady(false);initialize();};
  screen.addEventListener('change',screenChange);
  const visibility = () => setVisible(!document.hidden && !document.querySelector('dialog[open]'));
  const dialogs = new MutationObserver(visibility);
  document.querySelectorAll('dialog').forEach(dialog => dialogs.observe(dialog,{attributes:true,attributeFilter:['open']}));
  visibility(); document.addEventListener('visibilitychange',visibility);
  const pointer = (event: PointerEvent) => {
   if(!enabled || document.hidden || screen.matches || event.pointerType !== 'mouse') return;
   runtime.current.hover=!!(event.target as Element)?.closest('[data-signal-response]');
   runtime.current.pointerX = Math.max(-1,Math.min(1,event.clientX/window.innerWidth*2-1));
   runtime.current.pointerY = Math.max(-1,Math.min(1,event.clientY/window.innerHeight*2-1));
  };
  const resetPointer=()=>{runtime.current.hover=false;runtime.current.pointerX=0;runtime.current.pointerY=0;};
  window.addEventListener('pointermove',pointer,{passive:true});window.addEventListener('blur',resetPointer);
  return () => {disposed=true;clearTimeout(timer);screen.removeEventListener('change',screenChange);document.removeEventListener('visibilitychange',visibility);dialogs.disconnect();window.removeEventListener('pointermove',pointer);window.removeEventListener('blur',resetPointer);};
 },[onFailure,enabled]);
 const mode = section === 'music' ? selectedRelease.id === 'bcp-dargent' ? 'raw' : 'digital' : signalStates[section].mode;
 return <><div className={`signal-backdrop signal-backdrop--${mode}`} style={{transitionDuration:`${signalConfig.backgroundDuration}ms`}} aria-hidden="true" /><div className="signal-stage" data-section={section} data-rendering={ready && visible && !failed} data-ready={ready && !failed} data-mode={mode} data-status={failed ? 'fallback' : ready ? 'webgl' : 'static'} aria-hidden="true">{environment && !failed && <SignalBoundary onFailure={onFailure}><Scene key={environment.mobile ? 'mobile' : 'desktop'} runtime={runtime} palette={environment.palette} mobile={environment.mobile} visible={visible} onReady={onReady} onFailure={onFailure} /></SignalBoundary>}</div>{settingsTarget && createPortal(<button className="signal-motion-control" type="button" aria-pressed={enabled} aria-label={enabled ? copy.disableMotion : copy.enableMotion} disabled={failed} onClick={() => setSignalMotion(!enabled)}>{copy.motion} / {enabled && !failed ? copy.motionOn : copy.motionOff}</button>,settingsTarget)}</>;
}
