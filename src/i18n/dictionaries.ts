import { scenes } from '@/data/artist';
import type { Locale, SectionId } from '@/types/content';
export interface Dictionary {
 motion: string; motionOn: string; motionOff: string; enableMotion: string; disableMotion: string;
 heroLines: string[]; signalLabel: string;
 nav: Record<SectionId, string>; menu: string; close: string; index: string; skip: string; language: string;
 listen: string; watch: string; scroll: string; musicTitle: string; catalogue: string; featured: string; artworkPending: string;
 visualsTitle: string; visualNote: string; officialVideo: string; videoPending: string;
 archiveTitle: string; archiveNote: string; all: string; categories: Record<string, string>;
 worldLines: string[]; connectLines: string[]; press: string; contact: string; independent: string;
 bio: string; epkRequest: string; epkNote: string; back: string; fullImage: string; imageNav: string; previousImage: string; nextImage: string;
}
const sceneLabels = (locale: Locale) => Object.fromEntries(scenes.map(scene => [scene.id, scene.label[locale]])) as Record<SectionId, string>;
const en: Dictionary = {
 motion: 'Motion', motionOn: 'On', motionOff: 'Off', enableMotion: 'Enable motion', disableMotion: 'Disable motion',
 heroLines: ['A new signal', 'from Fez.'], signalLabel: 'CEO1.9',
 nav: sceneLabels('en'),
 menu: 'Menu', close: 'Close', index: 'Index', skip: 'Skip to content', language: 'Language',
 listen: 'Listen on Spotify', watch: 'Watch on YouTube', scroll: 'Explore the signal', musicTitle: 'The frequency.', catalogue: 'Selected catalogue', featured: 'Featured release', artworkPending: 'Artwork to follow',
 visualsTitle: 'In frame.', visualNote: 'Sound. Image. The same universe.', officialVideo: 'Official video', videoPending: 'Video artwork to follow',
 archiveTitle: 'The archive.', archiveNote: 'On stage. In the studio. In the streets.', all: 'All', categories: { portrait: 'Portraits', live: 'Live', studio: 'Studio', street: 'Street' },
 worldLines: ['Local roots.', 'Global', 'frequency.'], connectLines: ['Let’s', 'connect.'], press: 'Press / EPK', contact: 'Contact', independent: 'Independent artist',
 bio: 'Artist biography', epkRequest: 'Request the EPK', epkNote: 'For press materials, interviews and professional enquiries, contact the artist directly.', back: 'Back to CEO1.9', fullImage: 'View full image', imageNav: 'Use left and right arrow keys to browse images.', previousImage: 'Previous image', nextImage: 'Next image'
};
const fr: Dictionary = {
 motion: 'Animation', motionOn: 'Oui', motionOff: 'Non', enableMotion: 'Activer l’animation du signal', disableMotion: 'Désactiver l’animation du signal',
 heroLines: ['Un nouveau signal', 'de Fès.'], signalLabel: 'CEO1.9',
 nav: sceneLabels('fr'),
 menu: 'Menu', close: 'Fermer', index: 'Index', skip: 'Aller au contenu', language: 'Langue',
 listen: 'Écouter sur Spotify', watch: 'Voir sur YouTube', scroll: 'Explorer le signal', musicTitle: 'La fréquence.', catalogue: 'Discographie', featured: 'À l’écoute', artworkPending: 'Visuel à venir',
 visualsTitle: 'En image.', visualNote: 'Le son. L’image. Un même univers.', officialVideo: 'Clip officiel', videoPending: 'Visuel du clip à venir',
 archiveTitle: 'Les archives.', archiveNote: 'Sur scène. En studio. Dans la rue.', all: 'Tout', categories: { portrait: 'Portraits', live: 'Live', studio: 'Studio', street: 'Rue' },
 worldLines: ['Racines locales.', 'Portée', 'globale.'], connectLines: ['Entrons', 'en contact.'], press: 'Presse / EPK', contact: 'Contact', independent: 'Artiste indépendant',
 bio: 'Biographie de l’artiste', epkRequest: 'Demander l’EPK', epkNote: 'Pour les éléments presse, les interviews et les demandes professionnelles, contactez directement l’artiste.', back: 'Retour à CEO1.9', fullImage: 'Voir l’image entière', imageNav: 'Utilisez les flèches gauche et droite pour parcourir les images.', previousImage: 'Image précédente', nextImage: 'Image suivante'
};
export const dictionaries: Record<Locale, Dictionary> = { en, fr };
