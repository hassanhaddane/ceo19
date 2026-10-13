import Link from 'next/link';
import type {Locale} from '@/types/content';
import {socials} from '@/data/socials';
import {professional} from '@/data/professional';
import {closingCopy} from '@/data/closingScenes';
import {dictionaries} from '@/i18n/dictionaries';
import {SignalSlot} from '../signal/SignalSlot';
import {Architecture} from '../world/Architecture';
import {SocialWorld} from '../connect/SocialWorld';
import {ProductionStamp} from '../channels/ProductionStamp';
import {ExitLink} from '../interaction/ExitLink';
export function ConnectExperience({locale}:{locale:Locale}){
 const copy=closingCopy[locale];
 return <section id="connect" className="night-scene social-ending" data-world="street-print" data-locale={locale} aria-labelledby="connect-title">
 <Architecture variant="labyrinth"/>
 <div className="connect-poster scene-content"><header className="social-heading"><h2 id="connect-title">{copy.connect[0]}<span>{copy.connect[1]}</span></h2><svg className="connect-paths" viewBox="0 0 600 550" fill="none" aria-hidden="true"><g stroke="currentColor"><path data-passage-line d="M240 330H380V100H595M240 330H435V430H595"/><path data-passage-line d="M240 330V190H320V290H595"/></g><circle cx="240" cy="330" r="4" fill="currentColor"/></svg><span className="connect-signature" aria-hidden="true">019</span><SignalSlot section="connect"/></header><div className="social-zones">{socials.map(social=><SocialWorld key={social.id} social={social}/>)}</div></div>
 <div className="connect-base scene-content"><ProductionStamp locale={locale} variant="closing"/><div className="closing-contact"><span className="metadata">{copy.contact}</span><a href={`mailto:${professional.email}`} data-interaction="print" data-analytics="contact_click" data-cursor="enter">{professional.email}</a></div><Link className="connect-press" href={`/${locale}/press`} data-analytics="epk_click" data-interaction="walls" data-cursor="enter">{dictionaries[locale].press}<span aria-hidden="true">↗</span></Link></div>
 <footer className="closing-footer scene-content"><a href={`/${locale}#home`} data-cursor="enter">CEO 1.9</a><span>{locale==='fr'?'FÈS / MAROC':'FEZ / MOROCCO'}</span><nav aria-label={locale==='en'?'Language':'Langue'}>{(['en','fr'] as const).map(language=><ExitLink world="language" key={language} href={`/${language}#connect`} hrefLang={language} lang={language} aria-current={locale===language?'page':undefined} data-analytics="language_change" data-id={language}>{language.toUpperCase()}</ExitLink>)}</nav><span>© {new Date().getFullYear()} CEO 1.9</span></footer>
 </section>;
}
