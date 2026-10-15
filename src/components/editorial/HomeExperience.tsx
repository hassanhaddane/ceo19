import type { Locale } from '@/types/content';
import { artist } from '@/data/artist';
import { LogoMark } from '../primitives';
import { FezArchitecture } from '../visuals/FezArchitecture';

/** The shared film is the hero; lettering and passage are separate depth planes. */
export function HomeExperience({ locale }: { locale: Locale }) {
 const lines = locale === 'fr' ? ['UN NOUVEAU SIGNAL', 'DEPUIS FÈS.'] : ['A NEW SIGNAL', 'FROM FEZ.'];
 return <section tabIndex={-1} id="home" className="v3-scene home-campaign moving-home" aria-labelledby="home-title">
  <div className="hero-atmosphere" data-parallax="atmosphere" aria-hidden="true" />
  <div className="hero-passage" data-parallax="architecture"><FezArchitecture /></div>
  <div className="hero-composition" data-parallax="type">
   <h1 id="home-title" aria-label={`${artist.name} — ${lines.join(' ')}`}>{lines.map(line => <span className="hero-title-line" key={line}>{line}</span>)}</h1>
  </div>
  <div className="hero-editorial" data-parallax="detail"><span className="metadata">{artist.name}</span><span className="metadata">{locale === 'fr' ? 'FÈS / MAROC' : 'FEZ / MOROCCO'}</span></div>
  <a href="#music" className="hero-scroll-cue" data-cursor="enter"><span>{locale === 'fr' ? 'DÉFILER' : 'SCROLL'}</span><svg width="14" height="26" viewBox="0 0 14 26" aria-hidden="true"><path d="M7 1v23m-5-6 5 6 5-6" stroke="currentColor" fill="none"/></svg></a>
  <div className="hero-signature" data-parallax="detail"><LogoMark sizes="(max-width:767px) 48px, 64px" /></div>
 </section>;
}
