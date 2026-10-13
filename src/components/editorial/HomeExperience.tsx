import Image from 'next/image';
import type { Locale } from '@/types/content';
import { homeCampaign } from '@/data/homeCampaign';
import { SignalSlot } from '../signal/SignalSlot';
import { HomeMotion } from '../home/HomeMotion';
/** One campaign opening and one compact printed continuation. All copy stays in the DOM. */
export function HomeExperience({ locale }: { locale: Locale }) {
 const copy = homeCampaign.copy[locale];
 return <section id="home" className="home-campaign" aria-labelledby="home-title">
  <div className="campaign-hero">
   <svg className="campaign-architecture" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true"><path d="M460 900V290Q460 130 610 130H820V50H1040V270H1310V680H1170V750H1050V900M410 900V630H360V440H410V250H490M70 780H270V650H325V545H385M510 580V360Q510 230 620 230H720V470H630V740H580V900" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
   <div className="campaign-type"><h1 id="home-title"><span>CEO</span><span>1.9</span></h1><p className="campaign-headline">{copy.headline.map(line => <span key={line}>{line}</span>)}</p></div>
   <div className="campaign-portal"><div className="campaign-portrait-depth"><figure className="campaign-portrait"><Image src={homeCampaign.portrait} alt={homeCampaign.alt[locale]} fill loading="eager" fetchPriority="high" sizes="(max-width:767px) 86vw, 57vw"/></figure></div><span className="campaign-portal-label metadata" aria-hidden="true">CEO 1.9 / FEZ</span></div>
   <SignalSlot section="home"/>
   <div className="campaign-meta metadata"><span>SIGNAL 1.9</span><span>{copy.origin}</span></div>
   <a className="campaign-enter" href="#channels" data-cursor="enter">{copy.enter}<svg width="12" height="23" viewBox="0 0 12 23" fill="none" aria-hidden="true"><path d="M6 1v20m-5-5 5 5 5-5" stroke="currentColor"/></svg></a>
  </div>
  <div className="campaign-passage" aria-hidden="true"><span>{homeCampaign.passage}</span></div>
  <div className="campaign-takeover">
   <div className="campaign-blue-field" aria-hidden="true"/>
   <span className="campaign-print" aria-hidden="true">{homeCampaign.print}</span>
   <h2>{copy.roots.map(line => <span key={line}>{line}</span>)}</h2>
   <figure className="campaign-takeover-photo"><Image src={homeCampaign.portrait} alt="" fill sizes="(max-width:767px) 35vw, 26vw"/></figure>
   <p className="campaign-destination">FEZ <span aria-hidden="true">→</span> WORLD</p>
  </div>
  <HomeMotion/>
 </section>;
}
