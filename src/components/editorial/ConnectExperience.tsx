'use client';
import Link from 'next/link';
import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { Locale } from '@/types/content';
import { socialPreviewData, previewLabels, connectCopy } from '@/data/socialPreviews';
import { channelProduction } from '@/data/socials';
import { professional } from '@/data/professional';
import { dictionaries } from '@/i18n/dictionaries';
import { visualEffects } from '@/lib/visualEffects';
import { useSignalMotion } from '@/lib/signalMotion';
import { PlatformIcon } from '../music/PlatformIcon';
import { HkzMark } from '../interaction/HkzMark';
import { Footer } from '../footer';

export function ConnectExperience({ locale }: { locale: Locale }) {
 const [platform, setPlatform] = useState(0), [positions, setPositions] = useState<Record<string, number>>({});
 const tabs = useRef<(HTMLButtonElement | null)[]>([]), motion = useSignalMotion();
 const social = socialPreviewData[platform], index = positions[social.id] ?? 0, frame = social.frames[index], copy = connectCopy[locale];
 const move = (direction: number) => setPositions(current => ({ ...current, [social.id]: (index + direction + social.frames.length) % social.frames.length }));
 const keyboard = (event: KeyboardEvent) => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault(); event.stopPropagation();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? socialPreviewData.length - 1 : (platform + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + socialPreviewData.length) % socialPreviewData.length;
  setPlatform(next); tabs.current[next]?.focus({ preventScroll: true });
 };
 return <section id="connect" tabIndex={-1} className="v3-scene connect-editorial" aria-labelledby="connect-title" data-platform={social.id} data-motion={motion} style={Object.fromEntries(Object.entries(visualEffects.connect).map(([key, value]) => [`--connect-${key}`, `${value}ms`])) as CSSProperties}>
  <header className="connect-editorial-heading" data-parallax="detail"><h2 id="connect-title">{copy.title}</h2><span className="metadata">CEO1.9 / FEZ</span></header>
  <div className="connect-editorial-body">
   <div className="connect-preview" data-parallax="detail" role="tabpanel" id="connect-preview" aria-labelledby={`connect-platform-${social.id}`}>
    <div className="connect-preview-label"><span className="metadata">{copy.curated}</span><span className="metadata">{String(index + 1).padStart(2, '0')} / {String(social.frames.length).padStart(2, '0')}</span></div>
    <div className="connect-preview-frame" key={`${social.id}-${index}`}>
     <div className="connect-preview-gesture" aria-hidden="true"><i /><i /><i /><i /><i /></div>
     <span className="metadata">{previewLabels[social.id][locale]}</span><h3>{frame.title}</h3><p>{frame.detail}</p>
    </div>
    <div className="connect-preview-navigation"><button type="button" aria-label={copy.previous} onClick={() => move(-1)}>←</button><div className="connect-story-progress" aria-hidden="true">{social.frames.map((_, i) => <i key={i} data-active={i === index} />)}</div><button type="button" aria-label={copy.next} onClick={() => move(1)}>→</button></div>
    <div className="connect-preview-links"><a href={frame.url} target="_blank" rel="noopener noreferrer" data-analytics="social_click" data-id={social.id}>{social.id === 'youtube' ? copy.video : social.id === 'spotify' ? copy.release : `${copy.open} ${social.platform}`} <span aria-hidden="true">↗</span></a>{['youtube', 'spotify'].includes(social.id) && <a href={social.url} target="_blank" rel="noopener noreferrer">{copy.channel} ↗</a>}</div>
   </div>
   <div className="connect-platform-zones" data-parallax="photograph" role="tablist" aria-label={copy.platforms} onKeyDown={keyboard}>{socialPreviewData.map((item, i) => <button type="button" key={item.id} ref={element => { tabs.current[i] = element; }} id={`connect-platform-${item.id}`} role="tab" aria-selected={platform === i} aria-controls="connect-preview" tabIndex={platform === i ? 0 : -1} className={`connect-platform connect-platform--${item.id}`} onPointerEnter={event => { if (event.pointerType === 'mouse') setPlatform(i); }} onFocus={() => setPlatform(i)} onClick={() => setPlatform(i)} data-cursor="view"><span className="connect-platform-index metadata">{String(i + 1).padStart(2, '0')}</span><PlatformIcon platform={item.platform} /><span className="connect-platform-name">{item.platform}<small>{item.handle}</small></span><span className="connect-platform-indicator" aria-hidden="true">↗</span></button>)}</div>
  </div>
  <div className="connect-editorial-base">
   <section className="connect-production" aria-label="HKZ PROD"><HkzMark /><div><span className="metadata">{copy.production}</span><h3>HKZ PROD</h3></div><nav aria-label="HKZ PROD"><a href={channelProduction.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href={channelProduction.youtube} target="_blank" rel="noopener noreferrer">YouTube ↗</a></nav></section>
   <div className="connect-professional"><span className="metadata">{copy.contact}</span><a href={`mailto:${professional.email}`} data-analytics="contact_click">{professional.email} ↗</a><div><Link href={`/${locale}/press`}>{copy.press} ↗</Link>{professional.epk && <a href={professional.epk} download data-analytics="epk_click">{copy.epk} ↓</a>}</div></div>
  </div>
  <Footer locale={locale} copy={dictionaries[locale]} expanded />
 </section>;
}
