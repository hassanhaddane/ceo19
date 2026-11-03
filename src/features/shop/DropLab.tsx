'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { demoCatalogue } from '@/data/demoCatalogue';
import { useSignalMotion } from '@/lib/signalMotion';
import { useEntryExperience } from '@/components/visuals/VisualExperience';
import { UtilityButton } from '@/components/interactive/UtilityAction';
import { ActionLabel } from '@/components/interactive/ActionButton';
import type { Locale } from '@/types/content';
import { ProductNavigation } from './presentation/ProductNavigation';
import { ProductViewer } from './presentation/ProductViewer';
import { nextProduct, snapYaw } from './presentation/inspection';
import type { InspectionView } from './presentation/types';
import { InspectionController } from './presentation/InspectionController';
import './drop-lab.css';

/** Demo exhibition orchestration. No cart/checkout or Shopify types cross this boundary. */
export function DropLab({ locale, earlyAccess }: { locale: Locale; earlyAccess: ReactNode }) {
 const fr = locale === 'fr', motion = useSignalMotion(), entry = useEntryExperience();
 const [index, setIndex] = useState(0), [phase, setPhase] = useState<'stable' | 'out' | 'in'>('stable');
 const [view, setView] = useState<InspectionView>('front'), [spread, setSpread] = useState(false);
 const [available, setAvailable] = useState(true), [visible, setVisible] = useState(true), [blocked, setBlocked] = useState(true);
 const [mountedViewer, setMountedViewer] = useState(false);
 const region = useRef<HTMLElement>(null), requested = useRef(0), timers = useRef<ReturnType<typeof setTimeout>[]>([]);
 const [controller] = useState(() => new InspectionController());
 const product = demoCatalogue[index];
 const setInspection = useCallback((next: InspectionView) => {
  setView(next);
  if (next !== 'rotate') controller.setPose({ yaw: snapYaw(controller.getPose().yaw, next === 'back'), pitch: 0 });
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
 function select(next: number) {
  if (next === requested.current) return;
  requested.current = next; timers.current.forEach(clearTimeout); timers.current = [];
  const commit = () => {
   controller.reset();
   setIndex(next); setView('front'); setSpread(false); setPhase(motion ? 'in' : 'stable');
   if (motion) timers.current.push(setTimeout(() => setPhase('stable'), 560));
  };
  if (!motion) { commit(); return; }
  setPhase('out'); timers.current.push(setTimeout(commit, 180));
 }
 const selectors = demoCatalogue.map((item, i) => ({ id: item.id, name: item.name,
  selectorLabel: [fr ? 'HOODIE' : 'HOODIE', 'T-SHIRT', 'STICKERS', fr ? 'PORTE-CLÉS' : 'KEYCHAIN'][i] }));
 return <section ref={region} className="drop-lab" data-mode="demo" data-product={product.id} data-phase={phase} data-motion={motion}
  style={{ '--drop-accent': product.accent } as CSSProperties} aria-labelledby="drop-lab-title">
  <div className="drop-exhibition">
   <div className="drop-atmosphere" aria-hidden="true"/>
   <header className="drop-heading"><div><h1 id="drop-lab-title">DROP LAB</h1><p className="drop-demo-label"><span/>{fr ? 'DÉMO / PAS À VENDRE' : 'DEMO / NOT FOR SALE'}</p></div>
    <p className="drop-statement">{fr ? 'Une étude d’objets à venir.' : 'A study in future objects.'}<span>{fr ? 'Quatre concepts. Rien à vendre.' : 'Four concepts. Nothing for sale.'}</span></p>
   </header>
   <div className="drop-specimen-number" aria-hidden="true">0{index + 1}</div>
   <div className="drop-stage-area" data-phase={phase}>
    {mountedViewer ? <ProductViewer product={product} view={view} controller={controller} spread={spread} motion={motion} active={!blocked && visible} locale={locale} onView={setInspection} onAvailability={setAvailable}/>
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
     {(['front', 'back', 'rotate'] as const).map(item => <UtilityButton key={item} className="drop-view-button" aria-pressed={view === item} disabled={item === 'rotate' && !available} onClick={() => setInspection(item)}><ActionLabel>{fr ? item === 'front' ? 'FACE' : item === 'back' ? 'DOS' : 'ROTATION' : item.toUpperCase()}</ActionLabel></UtilityButton>)}
     <UtilityButton className="drop-reset" onClick={() => { setInspection('front'); setSpread(false); }} aria-label={fr ? 'Revenir de face' : 'Reset to front'}>RESET<span aria-hidden="true" className="drop-reset-mark"/></UtilityButton>
     {product.previewType === 'sticker-stack' && <UtilityButton className="drop-fan" aria-pressed={spread} onClick={() => setSpread(value => !value)}>{fr ? spread ? 'RÉUNIR' : 'DÉPLOYER' : spread ? 'GATHER' : 'FAN OUT'}</UtilityButton>}
    </div>
    <p id="drop-inspection-help" className="drop-inspection-help">{view === 'back' ? product.backLabel[locale] : !available ? fr ? 'Face / Dos : aperçu 2D' : 'Front / Back: 2D preview' : view === 'rotate' ? fr ? 'Glissez pour tourner · flèches au clavier' : 'Drag to rotate · arrow keys when focused' : fr ? 'Choisissez ROTATION pour explorer' : 'Select ROTATE to explore'}</p>
   </div>
  </div>
  <div className="drop-lab-footer"><ProductNavigation products={selectors} selected={index} locale={locale} onSelect={select} onStep={direction => select(nextProduct(requested.current, direction, demoCatalogue.length))}/><div className="drop-early-access">{earlyAccess}</div></div>
  <p className="drop-disclaimer">{fr ? 'CEO1.9 — Études de design uniquement. Aucun produit commercialisé. Les visuels ne préjugent pas d’une collection future.' : 'CEO1.9 — Design studies only. No released products. Concepts do not confirm a future collection.'}</p>
 </section>;
}
