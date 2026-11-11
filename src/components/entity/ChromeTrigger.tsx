'use client';

import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import type { Locale } from '@/types/content';
import { ArtistLogo } from '../design/ArtistLogo';

type Burst = { run: number; x: number; y: number };

export function ChromeTrigger({ locale }: { locale: Locale }) {
 const [burst, setBurst] = useState<Burst | null>(null);

 useEffect(() => {
  if (!burst) return;
  const timeout = setTimeout(() => setBurst(null), 1650);
  return () => clearTimeout(timeout);
 }, [burst]);

 function releaseSmoke(event: MouseEvent<HTMLButtonElement>) {
  const box = event.currentTarget.getBoundingClientRect();
  setBurst(current => ({
   run: (current?.run ?? 0) + 1,
   x: event.detail ? event.clientX : box.left + box.width / 2,
   y: event.detail ? event.clientY : box.top + box.height / 2,
  }));
 }

 return <>
  <button className="home-entity-anchor" data-entity-anchor="home" type="button"
   aria-label={locale === 'fr' ? 'Déclencher la fumée' : 'Release smoke'}
   onClick={releaseSmoke}>
   <ArtistLogo sizes="(max-width:767px) 92px, 166px" />
  </button>
  {burst && createPortal(<div key={burst.run} className="entity-smoke" aria-hidden="true"
   style={{ '--smoke-x': `${burst.x}px`, '--smoke-y': `${burst.y}px` } as CSSProperties}>
   <i /><i /><i /><i />
  </div>, document.body)}
 </>;
}
