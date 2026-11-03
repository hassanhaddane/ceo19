import type { Locale } from '@/types/content';

/** Explicit entry anchor prevents a tall editorial page inheriting a footer scroll position. */
export function experienceStart(locale:Locale,page:'epk'|'shop'){return `/${locale}/${page}#main`;}

/** Hashes cannot be redirected by the server. Replace obsolete biography bookmarks
 * so Back returns to the preceding destination rather than the alias. */
export function legacyProfessionalDestination(locale: Locale, hash: string): string | null {
 return ['#world', '#world-title', '#world-biography-label'].includes(hash)
  ? `/${locale}/epk#biography` : null;
}
