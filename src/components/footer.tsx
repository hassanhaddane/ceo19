import type { Locale } from '@/types/content';
import type { Dictionary } from '@/i18n/dictionaries';
import { artist } from '@/data/artist';
import { LogoMark } from './primitives';
import { NavigationAction } from './interactive/NavigationAction';
import { ActionLabel } from './interactive/ActionButton';
import { socials, channelProduction } from '@/data/socials';
import { professional } from '@/data/professional';
import { experienceStart } from '@/lib/experienceRoutes';
import { HkzMark } from './interaction/HkzMark';

export function Footer({ locale, copy }: { locale: Locale; copy: Dictionary }) {
 return <footer id="connect" tabIndex={-1} className="site-footer compact-footer" aria-label={locale === 'fr' ? 'Réseaux et contact' : 'Socials and contact'}>
  <NavigationAction client href={`/${locale}#home`} aria-label={`${artist.name} — ${copy.nav.home}`}><LogoMark secondary sizes="40px" /></NavigationAction>
  <nav className="footer-socials" aria-label={locale === 'fr' ? 'Réseaux sociaux' : 'Social links'}>{socials.map(social => <NavigationAction key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" data-analytics="social_click" data-id={social.id}><ActionLabel>{social.platform}</ActionLabel></NavigationAction>)}</nav>
  <NavigationAction className="footer-production" href={channelProduction.instagram} target="_blank" rel="noopener noreferrer" aria-label="HKZ PROD — Instagram"><HkzMark sizes="32px"/><ActionLabel>HKZ PROD</ActionLabel></NavigationAction>
  <nav className="footer-professional" aria-label={copy.contact}><NavigationAction client href={experienceStart(locale,'epk')}><ActionLabel>{copy.press}</ActionLabel></NavigationAction><NavigationAction href={`mailto:${professional.email}`} data-analytics="contact_click"><ActionLabel>{copy.contact}</ActionLabel></NavigationAction></nav>
  <span className="metadata">© {new Date().getUTCFullYear()} {artist.name}</span>
 </footer>;
}
