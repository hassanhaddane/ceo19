'use client';

import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { supportsWebGL2 } from '@/lib/webglSupport';
import { useSignalMotion } from '@/lib/signalMotion';
import { useEntryExperience } from '../visuals/VisualExperience';
import type { EntitySignal } from './entitySignal';

const EntityCanvas = dynamic(() => import('./EntityCanvas'), { ssr: false });

class EntityBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
 state = { failed: false };
 static getDerivedStateFromError() { return { failed: true }; }
 componentDidCatch() { this.props.onFailure(); }
 render() { return this.state.failed ? null : this.props.children; }
}

export function EntityLayer({ signal }: { signal: EntitySignal }) {
 const host = useRef<HTMLDivElement>(null);
 const entered = useEntryExperience()?.entered ?? true;
 const motion = useSignalMotion();
 const [load, setLoad] = useState(false);
 const [inView, setInView] = useState(false);
 const [uncovered, setUncovered] = useState(false);
 const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');

 useEffect(() => {
  const element = host.current;
  if (!motion || !entered || !element) return;
  const visibility = () => setUncovered(!document.hidden && !document.querySelector('dialog[open]'));
  const dialogs = new MutationObserver(visibility);
  dialogs.observe(document.body, { attributes: true, attributeFilter: ['open'], subtree: true });
  const viewport = new IntersectionObserver(([entry]) => {
   setInView(entry.isIntersecting);
   if (!entry.isIntersecting) return;
   if (supportsWebGL2()) setLoad(true);
   else setStatus('fallback');
  });
  viewport.observe(element);
  document.addEventListener('visibilitychange', visibility);
  visibility();
  return () => {
   document.removeEventListener('visibilitychange', visibility);
   dialogs.disconnect();
   viewport.disconnect();
  };
 }, [entered, motion]);

 const ready = useCallback(() => setStatus('ready'), []);
 const fail = useCallback(() => setStatus('fallback'), []);
 return <div ref={host} className="entity-stage" data-entity={motion && load ? status : 'fallback'} aria-hidden="true">
  {entered && motion && load && status !== 'fallback' && <EntityBoundary onFailure={fail}>
   <EntityCanvas signal={signal} active={inView && uncovered && entered} onReady={ready} onFailure={fail} />
  </EntityBoundary>}
 </div>;
}
