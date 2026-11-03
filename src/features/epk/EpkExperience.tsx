import Image from 'next/image';
import { NavigationAction } from '@/components/interactive/NavigationAction';
import { RevealAction } from '@/components/interactive/RevealAction';
import { ActionLabel, ActionMark } from '@/components/interactive/ActionButton';
import { ExperiencePage } from '@/components/ExperiencePage';
import { HkzMark } from '@/components/interaction/HkzMark';
import { artist } from '@/data/artist';
import { assets, assetUrl } from '@/data/assets';
import { epkBiography, epkCopy, epkMedia, epkOpportunities, epkPortrait, epkVideoIds } from '@/data/epk';
import { professional } from '@/data/professional';
import { homeReleases } from '@/data/releases';
import { channelProduction } from '@/data/socials';
import { videos } from '@/data/videos';
import type { Locale } from '@/types/content';
import { CopyEmail, EditorialDepth } from './EpkInteractions';
import './epk.css';

const external = { target: '_blank', rel: 'noopener noreferrer' } as const;
const emailSubject = (subject: string) => `mailto:${professional.email}?subject=${encodeURIComponent(`CEO1.9 — ${subject}`)}`;

/** Editorial server content; only image depth and clipboard feedback need client code. */
export function EpkExperience({ locale }: { locale: Locale }) {
 const copy = epkCopy[locale];
 const index = [['biography', copy.biography], ['discography', copy.discography], ['media', copy.media], ['milestones', copy.timeline], ['press', copy.press], ['production', copy.production], ['contact', copy.contact]];
 return <ExperiencePage locale={locale} className="epk-page">
  <header className="epk-heading">
   <div className="epk-topline metadata"><span>{copy.label}</span><span>{artist.origin[locale]}</span></div>
   <div className="epk-hero-grid">
    <div className="epk-hero-type">
     <Image className="epk-official-logo" src={assetUrl(assets.primaryLogoDark)} alt="CEO1.9 — logo" width={1254} height={1254} sizes="100px" loading="eager"/>
     <p className="metadata">{copy.intro}</p><h1>{artist.name}</h1>
     <p className="epk-positioning" lang="en">LOCAL ROOTS.<br/>GLOBAL REACH.</p>
     <RevealAction className="epk-text-link" href="#contact">{copy.contactCta}</RevealAction>
    </div>
    <figure className="epk-hero-portrait"><EditorialDepth><Image src={assetUrl(epkPortrait.src)} alt={epkPortrait.alt[locale]} width={1440} height={1440} sizes="(max-width:767px) 90vw, 42vw" loading="eager"/></EditorialDepth><figcaption><span>CEO1.9 / Samadi</span><span>01</span></figcaption></figure>
   </div>
  </header>
  <nav className="epk-index" aria-label={copy.label}>{index.map(([id, label], i) => <NavigationAction href={`#${id}`} key={id}><span aria-hidden="true">0{i + 1}</span><ActionLabel>{label}</ActionLabel></NavigationAction>)}</nav>
  <section id="biography" className="epk-section epk-biography" aria-labelledby="biography-title">
   <div><p className="metadata">01 / {copy.biography}</p><h2 id="biography-title">Samadi.<br/>CEO1.9.</h2></div>
   <div><p className="epk-body">{epkBiography[locale]}</p><dl className="epk-facts"><div><dt>{copy.origin}</dt><dd>{artist.origin[locale]}</dd></div><div><dt>{copy.identity}</dt><dd>{artist.name}</dd></div></dl></div>
  </section>
  <section id="discography" className="epk-section" aria-labelledby="discography-title">
   <div className="epk-section-heading"><div><p className="metadata">02 / {copy.catalogue}</p><h2 id="discography-title">{copy.discography}</h2></div><span className="metadata">06 / CEO1.9</span></div>
   <ol className="epk-releases">{homeReleases.map(release => <li key={release.id}>
    {release.artwork && <Image src={assetUrl(release.artwork)} alt="" width={80} height={80} sizes="64px"/>}
    <div className="epk-release-title"><h3>{release.title}</h3>{release.featuredArtist && <span>feat. {release.featuredArtist}</span>}</div>
    <span className="epk-release-date">{release.date && <time dateTime={release.date}>{new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${release.date}T12:00:00Z`))}</time>}</span>
    <div className="epk-release-links">{release.spotifyUrl && <NavigationAction href={release.spotifyUrl} {...external} aria-label={`${release.title} — Spotify`}><ActionLabel>Spotify</ActionLabel></NavigationAction>}{release.youtubeUrl && <NavigationAction href={release.youtubeUrl} {...external} aria-label={`${release.title} — YouTube`}><ActionLabel>YouTube</ActionLabel></NavigationAction>}</div>
   </li>)}</ol>
   <div id="videos" className="epk-videos" aria-labelledby="videos-title"><h3 id="videos-title">{copy.videos}</h3><p className="epk-note">{copy.coverNote}</p><ul>{epkVideoIds.map(id => {
    const video = videos.find(item => item.id === id);
    const release = homeReleases.find(item => item.id === video?.releaseId);
    if (!video || !release?.artwork) return null;
    return <li key={video.id}><NavigationAction href={video.url} {...external} aria-label={`${copy.watch} ${video.title} — YouTube`}><div className="epk-video-image"><Image src={assetUrl(release.artwork)} alt="" width={480} height={480} sizes="(max-width:767px) 80px, 28vw"/><ActionMark/></div><div className="epk-video-caption"><h4>{video.title}</h4><span>{copy.watch} / YouTube</span></div></NavigationAction></li>;
   })}</ul></div>
  </section>
  <section id="media" className="epk-section" aria-labelledby="media-title">
   <p className="metadata">03 / {copy.media}</p><h2 id="media-title">{copy.media}</h2>
   <div className="epk-media">{epkMedia.map((item, i) => <figure key={item.id}><EditorialDepth><Image src={assetUrl(item.src)} alt={item.alt[locale]} width={item.width} height={item.height} sizes="(max-width:767px) 90vw, 45vw"/></EditorialDepth><figcaption><span>{item.label[locale]}</span><span>0{i + 2}</span></figcaption></figure>)}</div>
   <div className="epk-media-access"><p className="epk-note">{copy.mediaNote}</p><RevealAction className="epk-text-link" href={emailSubject('Press images')}>{copy.requestImages}</RevealAction></div>
   {professional.pressImages.length > 0 && <ul className="epk-approved-downloads">{professional.pressImages.map(item => <li key={item.id}><NavigationAction href={assetUrl(item.src)} download>{copy.download} / {item.alt[locale]} ↓</NavigationAction></li>)}</ul>}
  </section>
  <section id="milestones" className="epk-section epk-milestones" aria-labelledby="milestone-title">
   <div><p className="metadata">04 / {copy.timeline}</p><h2 id="milestone-title">{copy.timeline}</h2></div><div className="epk-milestone"><p>{artist.projectBegan[locale]}</p><span>{copy.launch} / CEO1.9</span></div>
  </section>
  <section id="press" className="epk-section epk-press" aria-labelledby="press-title">
   <p className="metadata">05 / {copy.press}</p><h2 id="press-title">{copy.press}</h2><p className="epk-body">{copy.pressNote}</p>
   <ul className="epk-opportunities">{epkOpportunities.map(item => <li key={item.id}><h3>{item.label[locale]}</h3><p>{item.detail[locale]}</p></li>)}</ul>
   <div className="epk-kit"><div><h3>{copy.kit}</h3>{!professional.epk && <p>{copy.kitNote}</p>}</div><RevealAction className="epk-button" href={professional.epk ? assetUrl(professional.epk) : emailSubject('EPK')} download={professional.epk ? true : undefined} data-analytics="epk_click">{professional.epk ? `${copy.download} EPK` : copy.kitRequest}</RevealAction></div>
  </section>
  <section id="production" className="epk-section epk-production" aria-labelledby="production-title">
   <div><p className="metadata">06 / {copy.production}</p><h2 id="production-title">HKZ PROD<span>HKZ GANGSTATION</span></h2><p className="epk-note">{copy.productionNote}</p><div className="epk-production-links"><NavigationAction href={channelProduction.instagram} {...external}><ActionLabel>Instagram</ActionLabel></NavigationAction><NavigationAction href={channelProduction.youtube} {...external}><ActionLabel>YouTube</ActionLabel></NavigationAction></div></div><HkzMark sizes="120px"/>
  </section>
  <section id="contact" className="epk-section epk-contact" aria-labelledby="contact-title">
   <p className="metadata">07 / {copy.contact}</p><h2 id="contact-title">{copy.contactCta}</h2><NavigationAction className="epk-email" href={`mailto:${professional.email}`} data-analytics="contact_click">{professional.email} <ActionMark/></NavigationAction><CopyEmail email={professional.email} label={copy.copyEmail} copied={copy.copied} fallback={copy.copyFallback}/>
  </section>
 </ExperiencePage>;
}
