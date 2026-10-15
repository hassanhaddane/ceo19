import Link from 'next/link';
import type { Locale } from '@/types/content';
import type { Dictionary } from '@/i18n/dictionaries';
import { artist } from '@/data/artist';
import { socials } from '@/data/socials';
import { LogoMark } from './primitives';

export function Footer({ locale, copy, expanded = false }: { locale: Locale; copy: Dictionary; expanded?: boolean }) {
 return <footer className={`site-footer${expanded ? ' site-footer--expanded' : ''}`}><a href={`/${locale}#home`} aria-label={`${artist.name} — ${copy.nav.home}`}><LogoMark secondary sizes={expanded ? '42px' : '(max-width:767px) 70px, 90px'} /></a>{expanded ? <><span className="metadata footer-artist">CEO1.9</span><nav aria-label={locale === 'fr' ? 'Réseaux sociaux' : 'Social links'}>{socials.map(social => <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer">{social.platform}</a>)}</nav><nav className="footer-language" aria-label={locale === 'fr' ? 'Langue' : 'Language'}><Link href="/en#connect" aria-current={locale === 'en' ? 'page' : undefined}>EN</Link><Link href="/fr#connect" aria-current={locale === 'fr' ? 'page' : undefined}>FR</Link></nav></> : <span className="metadata">{artist.origin[locale]}</span>}<span className="metadata">© {new Date().getUTCFullYear()} {artist.name}</span></footer>;
}
