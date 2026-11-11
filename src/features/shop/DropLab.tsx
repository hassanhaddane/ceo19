'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { demoCatalogue } from '@/data/demoCatalogue';
import { useSignalMotion } from '@/lib/signalMotion';
import { useEntryExperience } from '@/components/visuals/VisualExperience';
import { UtilityButton } from '@/components/interactive/UtilityAction';
import { ActionLabel } from '@/components/interactive/ActionButton';
import type { Locale } from '@/types/content';
import { ProductNavigation } from './presentation/ProductNavigation';
import { ProductViewer } from './presentation/ProductViewer';
import { clampInspectionZoom, inspectionZoom, nextProduct, snapYaw } from './presentation/inspection';
import type { InspectionView } from './presentation/types';
import { InspectionController } from './presentation/InspectionController';
import './drop-lab.css';

/** Demo exhibition orchestration. No cart/checkout or Shopify types cross this boundary. */
export function DropLab({ locale, earlyAccess }: { locale: Locale; earlyAccess: ReactNode }) {
 const fr = locale === 'fr', motion = useSignalMotion(), entry = useEntryExperience();
 const [index, setIndex] = useState(0), [phase, setPhase] = useState<'stable' | 'out' | 'in'>('stable');
 const [view, setView] = useState<InspectionView>('rotate'), [spread, setSpread] = useState(false), [zoom, setZoom] = useState(1);
 const [available, setAvailable] = useState(true), [visible, setVisible] = useState(true), [blocked, setBlocked] = useState(true);
 const [mountedViewer, setMountedViewer] = useState(false);
 const region = useRef<HTMLElement>(null), requested = useRef(0), committed = useRef(0), exchanging = useRef(false), timers = useRef<ReturnType<typeof setTimeout>[]>([]);
 const [direction, setDirection] = useState(1);
 const [controller] = useState(() => new InspectionController());
 const product = demoCatalogue[index];
 const setInspection = useCallback((next: InspectionView) => {
  setView(next);
  if (next !== 'rotate') controller.setPose({ yaw: snapYaw(controller.getDisplayedPose().yaw, next === 'back'), pitch: 0 });
 }, [controller]);
 useEffect(() => {
  const update = () => {
   const suspended = document.hidden || !!document.querySelector('dialog[open]') || !!document.querySelector('.intro-sequence');
   setBlocked(suspended); if (!suspended) setMountedViewer(true);
  };
  const observer = new MutationObserver(update); observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open', 'data-intro-state'] });
  document.addEventListener('visibilitychange', update);
  const intersection = new IntersectionObserver(([item]) => setVisible(item.isIntersecting), { threshold: .05 });
  if (region.current) intersection.observe(region.current);
  const frame = requestAnimationFrame(update);
  return () => { cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); document.removeEventListener('visibilitychange', update); };
 }, [entry?.entered]);
 useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);
 useLayoutEffect(() => {
  if (motion || !exchanging.current) return;
  timers.current.forEach(clearTimeout); timers.current = []; exchanging.current = false;
  committed.current = requested.current; controller.reset();
  setIndex(requested.current); setView('rotate'); setSpread(false); setZoom(1); setPhase('stable');
 }, [motion, controller]);
 function select(next: number) {
  if (next === requested.current) return;
  setDirection(next > committed.current ? 1 : -1);
  requested.current = next; timers.current.forEach(clearTimeout); timers.current = [];
  const commit = () => {
   controller.reset();
   committed.current = next; setIndex(next); setView('rotate'); setSpread(false); setZoom(1); setPhase(motion ? 'in' : 'stable');
   if (motion) timers.current.push(setTimeout(() => { exchanging.current = false; setPhase('stable'); }, 560));
  };
  if (!motion) { commit(); return; }
  exchanging.current = true; setPhase('out'); timers.current.push(setTimeout(commit, 340));
 }
 const selectors = demoCatalogue.map((item, i) => ({ id: item.id, name: item.name,
  presentation: item, selectorLabel: ['HOODIE', 'T-SHIRT', 'STICKERS', fr ? 'ACCESSOIRE' : 'ACCESSORY'][i] }));
 return <section ref={region} className="drop-lab" data-mode="demo" data-product={product.id} data-phase={phase} data-motion={motion}
  style={{ '--drop-accent': product.accent, '--exchange-direction': direction } as CSSProperties} aria-labelledby="drop-lab-title">
  <div className="drop-exhibition">
   <div className="drop-atmosphere" aria-hidden="true"/>
   <header className="drop-heading"><div><h1 id="drop-lab-title">DROP LAB</h1><p className="drop-demo-label"><span/>{fr ? 'DÉMO / PAS À VENDRE' : 'DEMO / NOT FOR SALE'} <b>SOON</b></p></div>
    <p className="drop-statement">{fr ? 'Une étude d’objets à venir.' : 'A study in future objects.'}<span>{fr ? 'Quatre concepts. Rien à vendre.' : 'Four concepts. Nothing for sale.'}</span></p>
   </header>
   <div className="drop-specimen-number" aria-hidden="true">0{index + 1}</div>
   <div className="drop-stage-area" data-phase={phase}>
    {mountedViewer ? <ProductViewer product={product} view={view} controller={controller} spread={spread} zoom={zoom} onZoom={setZoom} motion={motion} active={!blocked && visible} locale={locale} onView={setInspection} onAvailability={setAvailable}/>
     : <div className="drop-viewer-pending" aria-hidden="true"/>}
   </div>
   <div className="drop-product-details" aria-live="polite" aria-atomic="true">
    <p className="drop-category"><span>0{index + 1}</span> / {product.category === 'apparel' ? fr ? 'TEXTILE' : 'APPAREL' : product.category === 'graphics' ? fr ? 'GRAPHISME' : 'GRAPHICS' : fr ? 'OBJET' : 'OBJECT'}</p>
    <h2>{product.shortName[locale]}</h2><p className="drop-description">{product.description[locale]}</p>
    <p className="drop-presentation-label">{product.presentationLabel[locale]}</p>
    <span className="sr-only">{fr ? 'Prototype de design non disponible à l’achat.' : 'Design prototype. Not available to purchase.'}</span>
   </div>
   <div className="drop-inspection">
    <div className="drop-view-controls" role="group" aria-label={fr ? 'Vues du prototype' : 'Prototype views'}>
     {(['front', 'back'] as const).map(item => <UtilityButton key={item} className="drop-view-button" aria-pressed={view === item} onClick={() => setInspection(item)}><ActionLabel>{fr ? item === 'front' ? 'FACE' : 'DOS' : item.toUpperCase()}</ActionLabel></UtilityButton>)}
     <UtilityButton className="drop-reset" onClick={() => { controller.reset(true); setView('rotate'); setSpread(false); setZoom(1); }} aria-label={fr ? 'Réinitialiser la vue' : 'Reset product view'}>RESET<span aria-hidden="true" className="drop-reset-mark"/></UtilityButton>
     {product.previewType === 'sticker-stack' && <UtilityButton className="drop-fan" aria-pressed={spread} onClick={() => setSpread(value => !value)}>{fr ? spread ? 'RÉUNIR' : 'DÉPLOYER' : spread ? 'GATHER' : 'FAN OUT'}</UtilityButton>}
    </div>
    {available && <div className="drop-zoom" role="group" aria-label={fr ? 'Zoom du prototype' : 'Product zoom'}>
     <UtilityButton disabled={zoom <= inspectionZoom.min} onClick={() => setZoom(value => clampInspectionZoom(value - inspectionZoom.step))} aria-label={fr ? 'Réduire le zoom' : 'Zoom out'}>−</UtilityButton>
     <output aria-live="polite">{Math.round(zoom * 100)}%</output>
     <UtilityButton disabled={zoom >= inspectionZoom.max} onClick={() => setZoom(value => clampInspectionZoom(value + inspectionZoom.step))} aria-label={fr ? 'Agrandir le zoom' : 'Zoom in'}>+</UtilityButton>
    </div>}
    <p id="drop-inspection-help" className="drop-inspection-help">{!available ? fr ? 'Face / Dos : aperçu 2D' : 'Front / Back: 2D preview' : fr ? 'Glissez pour tourner · pincez pour zoomer' : 'Drag to rotate · pinch to zoom'}</p>
    {view === 'back' && <span className="sr-only">{product.backLabel[locale]}</span>}
   </div>
  </div>
  <div className="drop-lab-footer"><ProductNavigation products={selectors} selected={index} locale={locale} onSelect={select} onStep={direction => select(nextProduct(requested.current, direction, demoCatalogue.length))}/><div className="drop-early-access">{earlyAccess}</div></div>
  <p className="drop-disclaimer">{fr ? 'CEO1.9 — Études de design uniquement. Aucun produit commercialisé. Les visuels ne préjugent pas d’une collection future.' : 'CEO1.9 — Design studies only. No released products. Concepts do not confirm a future collection.'}</p>
 </section>;
}
