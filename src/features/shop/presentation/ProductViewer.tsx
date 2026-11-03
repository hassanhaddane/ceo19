'use client';
import dynamic from 'next/dynamic';
import { Component, useCallback, useRef, useState, type ReactNode, type PointerEvent } from 'react';
import type { Locale } from '@/types/content';
import { dragPose } from './inspection';
import { ProductFallback } from './ProductFallback';
import type { InspectionView, ProductPresentation } from './types';
import type { InspectionController } from './InspectionController';

const ThreeProductStage = dynamic(() => import('./ThreeProductStage'), { ssr: false });
export interface ProductViewerProps {
 product: ProductPresentation; view: InspectionView; controller: InspectionController;
 spread: boolean; motion: boolean; active: boolean; locale: Locale;
 onView: (view: InspectionView) => void; onAvailability: (available: boolean) => void;
}
class ViewerBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
 state = { failed: false };
 static getDerivedStateFromError() { return { failed: true }; }
 componentDidCatch() { this.props.onFailure(); }
 render() { return this.state.failed ? null : this.props.children; }
}
/** Input and fallback remain outside WebGL. A renderer failure cannot break navigation. */
export function ProductViewer(props: ProductViewerProps) {
 const { product, view, controller, motion, locale, onView, onAvailability } = props;
 const [readyProduct, setReadyProduct] = useState<string | null>(null), [failed, setFailed] = useState(false);
 const ready = readyProduct === product.id;
 const drag = useRef<{ id: number; x: number; y: number; yaw: number; pitch: number; locked: boolean } | null>(null);
 const handleReady = useCallback(() => { setReadyProduct(product.id); onAvailability(true); }, [onAvailability, product.id]);
 const handleFailure = useCallback(() => { setReadyProduct(null); setFailed(true); onAvailability(false); onView('front'); }, [onAvailability, onView]);
 function release(event: PointerEvent<HTMLDivElement>) {
  if (drag.current && event.currentTarget.hasPointerCapture(drag.current.id)) event.currentTarget.releasePointerCapture(drag.current.id);
  drag.current = null; delete event.currentTarget.dataset.dragging;
 }
 return <div className="drop-viewer" data-viewer-mode={failed ? '2d' : ready ? 'webgl' : 'loading'} data-inspection={view}
  role="img" aria-label={locale === 'fr' ? 'Prototype interactif. Utilisez les commandes Face, Dos et Rotation.' : 'Interactive prototype. Use the Front, Back and Rotate controls.'}
  tabIndex={failed ? -1 : 0} aria-describedby="drop-inspection-help" data-owned-interaction data-cursor={view === 'rotate' && !failed ? 'drag' : 'view'}
  onKeyDown={event => {
   if (event.key === 'Home') { event.preventDefault(); onView('front'); }
   if (!failed && view === 'rotate' && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault(); event.stopPropagation(); const pose = controller.getPose(); controller.setPose({ ...pose, yaw: pose.yaw + (event.key === 'ArrowLeft' ? -.24 : .24) });
   }
  }}
  onPointerDown={event => {
   if (failed || view !== 'rotate' || !event.isPrimary || event.button !== 0) return;
   const pose = controller.getPose(); drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: pose.yaw, pitch: pose.pitch, locked: false };
  }}
  onPointerMove={event => {
   const bounds = event.currentTarget.getBoundingClientRect(), current = drag.current;
   if (current && current.id === event.pointerId) {
    const dx = event.clientX - current.x, dy = event.clientY - current.y;
    if (!current.locked && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
     current.locked = true; event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.dataset.dragging = 'true';
    }
    if (current.locked) { event.preventDefault(); controller.setPose(dragPose(current.yaw, current.pitch, dx, dy, bounds.width)); }
   } else if (event.pointerType === 'mouse' && motion) {
    controller.setPointer({ x: (event.clientX - bounds.left) / bounds.width - .5, y: (event.clientY - bounds.top) / bounds.height - .5 });
   }
  }} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} onPointerLeave={() => controller.setPointer({ x: 0, y: 0 })}>
  <ProductFallback product={product} back={view === 'back'} spread={props.spread} hidden={ready && !failed}/>
  {!failed && <ViewerBoundary onFailure={handleFailure}><ThreeProductStage {...props} onReady={handleReady} onFailure={handleFailure}/></ViewerBoundary>}
  {failed && <span className="drop-viewer-fallback-note">{locale === 'fr' ? 'Aperçu 2D · 3D indisponible sur cet appareil' : '2D preview · 3D unavailable on this device'}</span>}
 </div>;
}
