import type { Locale } from '@/types/content';

/** Enter Shop at its main region from any scroll position. */
export function experienceStart(locale: Locale, page: 'shop') { return `/${locale}/${page}#main`; }
