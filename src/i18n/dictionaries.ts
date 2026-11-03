import { scenes } from '@/data/artist';
import type { Locale, SectionId } from '@/types/content';
/** Shared navigation and professional copy only. Scene-owned copy stays with its scene. */
export interface Dictionary {
 nav: Record<SectionId, string>; menu: string; close: string; index: string; skip: string; language: string;
 press: string; contact: string; independent: string; epkRequest: string; epkNote: string; back: string;
}
const sceneLabels = (locale: Locale) => Object.fromEntries(scenes.map(scene => [scene.id, scene.label[locale]])) as Record<SectionId, string>;
export const dictionaries: Record<Locale, Dictionary> = {
 en: {
  nav: sceneLabels('en'), menu: 'Menu', close: 'Close', index: 'Index', skip: 'Skip to content', language: 'Language',
  press: 'EPK / Media', contact: 'Contact', independent: 'Independent artist', epkRequest: 'Request the EPK',
  epkNote: 'For press materials, interviews and professional enquiries, contact the artist directly.', back: 'Back to CEO1.9',
 },
 fr: {
  nav: sceneLabels('fr'), menu: 'Menu', close: 'Fermer', index: 'Index', skip: 'Aller au contenu', language: 'Langue',
  press: 'EPK / Médias', contact: 'Contact', independent: 'Artiste indépendant', epkRequest: 'Demander l’EPK',
  epkNote: 'Pour les éléments presse, les interviews et les demandes professionnelles, contactez directement l’artiste.', back: 'Retour à CEO1.9',
 },
};
