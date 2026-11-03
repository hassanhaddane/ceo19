import Image from 'next/image';
import { assetUrl } from '@/data/assets';
import { artist } from '@/data/artist';
import { featuredRelease, homeReleases } from '@/data/releases';
import { releaseAccess, streamingProfiles } from '@/lib/releaseAccess';
import type { Locale, Release } from '@/types/content';
import { MusicAction } from '../interactive/MusicAction';
import { NavigationAction } from '../interactive/NavigationAction';
import { UtilityLink } from '../interactive/UtilityAction';
import { ActionLabel, ActionMark } from '../interactive/ActionButton';
import { IrregularBlueGradient, ParallaxLayer } from '../design/ScenePrimitives';
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

/** Responsive composition, server-rendered catalogue, one persistent film in the layout. */
export function HomeExperience({ locale }: { locale: Locale }) {
 const fr = locale === 'fr', access = releaseAccess(featuredRelease);
 const playLabel = access.playIsArtist ? (fr ? 'SPOTIFY ARTISTE' : 'ARTIST SPOTIFY') : (fr ? 'ÉCOUTER' : 'PLAY NOW');
 return <section tabIndex={-1} id="home" className="v3-scene v4-home" aria-labelledby="home-title" data-scene-number="01">
  <h1 id="home-title" className="sr-only">{artist.name}</h1>
  <ParallaxLayer preset="atmosphere" className="home-atmosphere"><IrregularBlueGradient /></ParallaxLayer>
  <div className="home-desktop-access">
   <div className="home-desktop-music">
    {access.play && <NavigationAction className="home-featured-access" href={access.play} target="_blank" rel="noopener noreferrer"><span>{featuredRelease.title}</span><span>{playLabel} <ActionMark/></span></NavigationAction>}
    <StreamingLinks locale={locale} />
   </div>
   <NavigationAction className="home-scene-link" href="#music"><ActionLabel>{fr ? 'MUSIQUE' : 'MUSIC'}</ActionLabel><ActionMark/></NavigationAction>
  </div>
  <div className="home-mobile-hub">
   <div className="home-mobile-lead">
    <ParallaxLayer preset="photograph" className="home-cover-layer">
     <figure className="home-latest-artwork">{featuredRelease.artwork && <Image src={assetUrl(featuredRelease.artwork)} alt={`${featuredRelease.title} — ${artist.name}`} width={640} height={640} sizes="(max-width:767px) 72vw, 1px" loading="eager" fetchPriority="high" />}</figure>
    </ParallaxLayer>
    <div className="home-latest-copy"><p className="metadata">{fr ? 'DERNIÈRE SORTIE' : 'LATEST RELEASE'}</p><h2>{featuredRelease.title}</h2></div>
    <div className="home-primary-actions">
     {access.play && <MusicAction className="home-play" href={access.play} target="_blank" rel="noopener noreferrer" aria-label={`${playLabel} — ${access.playIsArtist ? artist.name : featuredRelease.title} — Spotify`}><PlatformIcon platform="Spotify" /><ActionLabel>{playLabel}</ActionLabel><ActionMark/></MusicAction>}
     {access.watch && <MusicAction className="home-watch" href={access.watch} target="_blank" rel="noopener noreferrer" aria-label={`${fr ? 'VOIR LE CLIP' : 'WATCH NOW'} — ${featuredRelease.title} — YouTube`}><PlatformIcon platform="YouTube" /><ActionLabel>{fr ? 'VOIR LE CLIP' : 'WATCH NOW'}</ActionLabel><ActionMark/></MusicAction>}
    </div>
    <div className="home-mobile-utilities"><StreamingLinks locale={locale} /></div>
   </div>
   <div className="home-catalogue">
    <div className="home-catalogue-heading"><h2>{fr ? 'MUSIQUE' : 'MUSIC'}</h2><NavigationAction href="#music"><ActionLabel>{fr ? 'EXPLORER' : 'EXPLORE'}</ActionLabel><ActionMark/></NavigationAction></div>
    <ol aria-label={fr ? 'Les sorties de CEO1.9' : 'CEO1.9 releases'}>{homeReleases.map(release => <ReleaseRow key={release.id} release={release} locale={locale} />)}</ol>
   </div>
   <NavigationAction className="home-scene-link" href="#music"><ActionLabel>{fr ? 'MUSIQUE' : 'MUSIC'}</ActionLabel><ActionMark/></NavigationAction>
  </div>
 </section>;
}
