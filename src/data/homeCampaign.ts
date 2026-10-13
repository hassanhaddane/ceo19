import type { Locale } from '@/types/content';
/** Authentic supplied portrait; campaign phrases are visual vocabulary, never claimed lyrics. */
export const homeCampaign = {
 portrait: '/images/portrait.webp',
 alt: { en: 'CEO 1.9 adjusting his silver chains in a blue-lit room', fr: 'CEO 1.9 ajustant ses chaînes en argent dans une pièce éclairée de bleu' },
 passage: 'PAS DE RÉSEAU',
 print: 'SMS HORS LIGNE',
 copy: {
  en: { headline: ['A new signal', 'from Fez.'], roots: ['Local roots.', 'Global', 'frequency.'], enter: 'Enter the signal', origin: 'FEZ / MOROCCO' },
  fr: { headline: ['Un nouveau signal', 'de Fès.'], roots: ['Racines locales.', 'Portée', 'globale.'], enter: 'Entrer dans le signal', origin: 'FÈS / MAROC' }
 } satisfies Record<Locale, { headline: string[]; roots: string[]; enter: string; origin: string }>,
 motion: { portraitTravel: 7, phraseTravel: 12, photoScale: 1.045, pointerTravel: 7 }
} as const;
