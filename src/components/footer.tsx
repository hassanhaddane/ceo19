import type { Locale } from '@/types/content';
import type { Dictionary } from '@/i18n/dictionaries';
import { artist } from '@/data/artist';
import { LogoMark } from './primitives';
import { NavigationAction } from './interactive/NavigationAction';
import { ActionLabel, ActionMark } from './interactive/ActionButton';
import { socials, channelProduction } from '@/data/socials';
import { professional } from '@/data/professional';
import { ContactResources } from '@/features/epk/ContactResources';
import { epkCopy } from '@/data/epk';
import { HkzMark } from './interaction/HkzMark';

export function Footer({ locale, copy, resources = false }: { locale: Locale; copy: Dictionary; resources?: boolean }) {
 const contact = epkCopy[locale];
 return <footer id="connect" tabIndex={-1} className="site-footer compact-footer" aria-label={locale === 'fr' ? 'Réseaux et contact' : 'Socials and contact'}>
  <div className="footer-identity"><strong>{artist.name}</strong><p className="metadata">{artist.origin[locale]}</p></div>
  <NavigationAction className="footer-brand" client href={`/${locale}#home`} aria-label={`${artist.name} — ${copy.nav.home}`}><LogoMark secondary sizes="(max-width: 600px) 60px, (max-width: 1240px) 10vw, 124px" /></NavigationAction>
  <nav className="footer-socials" aria-label={locale === 'fr' ? 'Réseaux sociaux' : 'Social links'}>{socials.map(social => <NavigationAction key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" data-analytics="social_click" data-id={social.id}><ActionLabel>{social.platform}</ActionLabel></NavigationAction>)}</nav>
  <NavigationAction className="footer-production" href={channelProduction.instagram} target="_blank" rel="noopener noreferrer" aria-label="HKZ PROD — Instagram"><HkzMark sizes="32px"/><ActionLabel>HKZ PROD</ActionLabel></NavigationAction>
  <nav className="footer-professional" aria-label={copy.contact}><NavigationAction href={`mailto:${professional.email}`} data-analytics="contact_click"><ActionLabel>{copy.contact}</ActionLabel></NavigationAction></nav>
  {resources && <div className="contact-brief">
   <NavigationAction href={`mailto:${professional.email}`} className="contact-mail" data-analytics="contact_click">{contact.contactCta}<ActionMark /></NavigationAction>
   <details className="contact-dossier"><summary>{locale === 'fr' ? 'Ressources artistiques' : 'Artist resources'}<ActionMark /></summary>
    <ContactResources locale={locale} />
   </details>
  </div>}
  <span className="metadata">© {new Date().getUTCFullYear()} {artist.name}</span>
 </footer>;
}
