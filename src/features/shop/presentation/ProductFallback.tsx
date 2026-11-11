import type { CSSProperties } from 'react';
import { useId } from 'react';
import type { ProductPresentation, PresentationAsset } from './types';

function atlasStyle(asset: PresentationAsset): CSSProperties {
 const r = asset.region;
 return { backgroundImage: `url("${asset.src}")`, backgroundSize: r ? `${100 / r.width}% ${100 / r.height}%` : 'contain',
  backgroundPosition: r ? `${r.x / (1 - r.width) * 100}% ${r.y / (1 - r.height) * 100}%` : 'center' };
}
/** Honest 2D fallback and loading poster. Front/back never reuse mirrored artwork. */
export function ProductFallback({ product, back, spread, hidden = false }: { product: ProductPresentation; back: boolean; spread: boolean; hidden?: boolean }) {
 const apparel = product.previewType === 'apparel-shell';
 const id = useId(), ring = `drop-ring-${id}`, polymer = `drop-polymer-${id}`;
 return <div className="drop-fallback" data-hidden={hidden} aria-hidden="true">
  {apparel ? <div className="drop-fallback-garment" style={atlasStyle(back && product.backAsset ? product.backAsset : product.frontAsset)}>
   {!back && <div className="drop-fallback-print" style={{ '--print-size': `${product.graphicScale * 24.4}%`, top: `${(0.5 - product.graphicOffsetY / 4.7) * 100}%`, backgroundColor: product.graphicColor, maskImage: `url("${product.graphicAsset.src}")` } as CSSProperties}/>}
  </div> : product.previewType === 'sticker-stack' ? <div className="drop-fallback-stickers" data-spread={spread}>{[0, 1, 2].map(i => <div key={i} className="drop-fallback-sticker" style={{ '--sticker': i } as CSSProperties}>{!back && <span style={{ maskImage: `url("${product.graphicAsset.src}")` }}/>}</div>)}</div>
   : <svg className="drop-fallback-keychain" viewBox="0 0 500 680"><defs><linearGradient id={ring} x2="1" y2="1"><stop stopColor="#a8b2ba"/><stop offset=".4" stopColor="#53636b"/><stop offset="1" stopColor="#d0d3ce"/></linearGradient><linearGradient id={polymer} x2="1" y2="1"><stop stopColor="#4387b5"/><stop offset="1" stopColor="#173e60"/></linearGradient></defs><ellipse cx="250" cy="622" rx="100" ry="13" fill="#000" opacity=".35"/><circle cx="250" cy="105" r="66" fill="none" stroke={`url(#${ring})`} strokeWidth="12"/><path d="M145 180 175 150H325L355 180V510L325 540H175L145 510Z" fill={`url(#${polymer})`} stroke="#73a1c3" strokeWidth="2"/><circle cx="250" cy="183" r="13" fill="#080a0c"/><ellipse cx="250" cy="167" rx="15" ry="40" fill="none" stroke="#88999e" strokeWidth="7"/>{!back && <image href={product.graphicAsset.src} x="173" y="260" width="154" height="154"/>}</svg>}
 </div>;
}
