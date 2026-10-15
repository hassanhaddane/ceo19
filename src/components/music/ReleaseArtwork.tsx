import Image from 'next/image';
import { artist } from '@/data/artist';
import type { Locale, Release } from '@/types/content';
import { musicCopy } from './musicCopy';
export function ReleaseArtwork({release,locale,compact=false}: {release:Release;locale:Locale;compact?:boolean}) {
 return <div className={`frequency-artwork ${compact ? 'frequency-artwork--compact' : ''}`}>
 {release.artwork ? <Image src={release.artwork} alt={`${release.title} — ${artist.name}`} fill sizes={compact ? '56px' : '(max-width:767px) 90vw, 32vw'} /> : <div className="frequency-artwork-placeholder"><span className="metadata">{artist.name} / {musicCopy[locale].concept}</span><span className="frequency-artwork-number" aria-hidden="true">CEO1.9</span><span className="metadata">{musicCopy[locale].pending}</span></div>}
 </div>;
}
