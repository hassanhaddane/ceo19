import Image from 'next/image';
import { assets, assetUrl } from '@/data/assets';
import { artist, sceneCopy } from '@/data/artist';
import { featuredRelease, homeReleases } from '@/data/releases';
import { releaseAccess, streamingProfiles } from '@/lib/releaseAccess';
import type { Locale, Release } from '@/types/content';
import { MusicAction } from '../interactive/MusicAction';
import { NavigationAction } from '../interactive/NavigationAction';
import { UtilityLink } from '../interactive/UtilityAction';
import { ActionLabel, ActionMark } from '../interactive/ActionButton';
import { ParallaxLayer } from '../design/ScenePrimitives';
import { PlatformIcon } from '../music/PlatformIcon';

function StreamingLinks({ locale }: { locale: Locale }) {
 return <nav className="home-platforms" aria-label={locale === 'fr' ? 'Plateformes de CEO1.9' : 'CEO1.9 streaming platforms'}>
  {streamingProfiles.map(profile => <MusicAction key={profile.id} href={profile.url} target="_blank" rel="noopener noreferrer" aria-label={`${artist.name} — ${profile.platform}`}><PlatformIcon platform={profile.platform} /><ActionLabel>{profile.platform}</ActionLabel></MusicAction>)}
 </nav>;
}

function ReleaseRow({ release, locale }: { release: Release; locale: Locale }) {
 const access = releaseAccess(release);
 return <li className="home-release-row" data-release={release.id}>
  <NavigationAction className="home-release-title" href={`#release-${release.id}`} aria-label={`${release.title} — ${locale === 'fr' ? 'ouvrir dans Musique' : 'open in Music'}`}>
   {release.artwork && <Image src={assetUrl(release.artwork)} alt="" width={640} height={640} sizes="44px" />}
   <span>{release.title}{release.featuredArtist && <small>FT. {release.featuredArtist}</small>}</span>
  </NavigationAction>
  <div className="home-release-platforms">
   {access.play && <UtilityLink href={access.play} target="_blank" rel="noopener noreferrer" aria-label={access.playIsArtist ? `${artist.name} — Spotify` : `${release.title} — Spotify`} title={access.playIsArtist ? `${artist.name} — Spotify` : `${release.title} — Spotify`}><PlatformIcon platform="Spotify" /></UtilityLink>}
   {access.watch && <UtilityLink href={access.watch} target="_blank" rel="noopener noreferrer" aria-label={`${release.title} — YouTube`} title={`${release.title} — YouTube`}><PlatformIcon platform="YouTube" /></UtilityLink>}
  </div>
 </li>;
}

/** The photographic plane and release strip share one composition across viewports. */
export function HomeExperience({ locale }: { locale: Locale }) {
 const fr = locale === 'fr', access = releaseAccess(featuredRelease);
 const playLabel = access.playIsArtist ? (fr ? 'SPOTIFY ARTISTE' : 'ARTIST SPOTIFY') : (fr ? 'ÉCOUTER' : 'PLAY NOW');
 const watchLabel = fr ? 'VOIR LE CLIP' : 'WATCH NOW';
 return <section tabIndex={-1} id="home" className="v3-scene v4-home" aria-labelledby="home-title" data-scene-number="01">
  <div className="home-poster">
   <div className="home-portrait-cut" aria-hidden="true">
    <ParallaxLayer preset="photograph" className="home-portrait">
     <Image src={assetUrl(assets.hero)} alt="" fill sizes="(max-width:767px) 100vw, 65vw" fetchPriority="high" />
    </ParallaxLayer>
   </div>
   <div className="home-rift-edge" aria-hidden="true" />
   <div className="home-poster-type">
    <p className="metadata home-origin">{artist.name} <span aria-hidden="true">/</span> {sceneCopy[locale].origin}</p>
    <h1 id="home-title" lang="en"><span>THE BLUE</span><span>RIFT</span><span className="sr-only"> — {artist.name}</span></h1>
   </div>
   <NavigationAction className="home-scene-link" href="#music"><ActionLabel>{sceneCopy[locale].music}</ActionLabel><ActionMark/></NavigationAction>
  </div>
  <div className="home-release-strip">
   <div className="home-featured">
    <figure className="home-latest-artwork">{featuredRelease.artwork && <Image src={assetUrl(featuredRelease.artwork)} alt={featuredRelease.title} width={640} height={640} sizes="(max-width:767px) 64px, 84px" />}</figure>
    <div className="home-latest-copy"><p className="metadata">{fr ? 'DERNIÈRE SORTIE' : 'LATEST RELEASE'}</p><h2>{featuredRelease.title}</h2></div>
   </div>
   <div className="home-primary-actions">
    {access.play && <MusicAction className="home-play" href={access.play} target="_blank" rel="noopener noreferrer" aria-label={`${playLabel} — ${access.playIsArtist ? artist.name : featuredRelease.title} — Spotify`}><PlatformIcon platform="Spotify" /><ActionLabel>{playLabel}</ActionLabel><ActionMark/></MusicAction>}
    {access.watch && <MusicAction className="home-watch" href={access.watch} target="_blank" rel="noopener noreferrer" aria-label={`${watchLabel} — ${featuredRelease.title} — YouTube`}><PlatformIcon platform="YouTube" /><ActionLabel>{watchLabel}</ActionLabel><ActionMark/></MusicAction>}
   </div>
   <StreamingLinks locale={locale} />
  </div>
  <div className="home-catalogue">
   <div className="home-catalogue-heading"><h2>{sceneCopy[locale].music}</h2><NavigationAction href="#music"><ActionLabel>{sceneCopy[locale].explore}</ActionLabel><ActionMark/></NavigationAction></div>
   <ol aria-label={fr ? 'Les sorties de CEO1.9' : 'CEO1.9 releases'}>{homeReleases.map(release => <ReleaseRow key={release.id} release={release} locale={locale} />)}</ol>
  </div>
 </section>;
}
