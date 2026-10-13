import type { Locale } from '@/types/content';
export const locales = ['en', 'fr'] as const;
export const defaultLocale: Locale = 'en';
export function isLocale(value: string): value is Locale { return locales.includes(value as Locale); }
export function dateLabel(date: string | null): string {
 if (!date) return '—';
 const [year, month, day] = date.split('-');
 return `${day}.${month}.${year.slice(2)}`;
}
