import { assets } from './assets.ts';

/** Verified artist statement, moved from WORLD; no personal history or future releases. */
export const epkBiography = {
 en: 'Samadi, aka CEO1.9, is an independent Moroccan artist based in Fez. His universe connects contemporary international rap sounds with lyrics, references and images drawn from everyday Moroccan life. Officially launched in late 2025, the project develops an identity between contemporary rap, local culture, fashion and visual storytelling.',
 fr: 'Samadi, alias CEO1.9, est un artiste indépendant marocain basé à Fès. Son univers relie les sonorités du rap contemporain international à des paroles, des références et des images tirées du quotidien marocain. Lancé officiellement fin 2025, le projet développe une identité entre rap contemporain, culture locale, mode et narration visuelle.'
} as const;

export const epkPortrait = { src: assets.hero, alt: { en: 'CEO1.9 adjusting his chain in a blue-lit room', fr: 'CEO1.9 ajuste sa chaîne dans une pièce bleue' } } as const;

/** Display selection only. Downloads require an explicit entry in professional.pressImages. */
export const epkMedia = [
 { id: 'live', src: '/images/live.webp', width: 1800, height: 1800, label: { en: 'On stage', fr: 'Sur scène' }, alt: { en: 'CEO1.9 holding a microphone on stage under blue light', fr: 'CEO1.9 tient un micro sur scène sous une lumière bleue' } },
 { id: 'bcp-session', src: '/media/archive/bcp-6845.webp', width: 900, height: 1600, label: { en: 'BCP D’ARGENT / photo session', fr: 'BCP D’ARGENT / séance photo' }, alt: { en: 'CEO1.9 beside a yellow bus during the BCP D’ARGENT photo session', fr: 'CEO1.9 près d’un bus jaune lors de la séance photo BCP D’ARGENT' } },
] as const;

/** IDs resolve against the shared, supplied official video catalogue. */
export const epkVideoIds = ['bcp-dargent', 'machi-batel', 'original'] as const;

/** No metric is publishable without the actual source and its reference date. */
export const epkSources = {
 historicalPdf: { filename: 'CEO 1.9 — EPK Media.pdf', available: false, note: 'Named in docs/source-asset-inventory.json; file not present in the current checkout. No figures transcribed from memory.' },
} as const;

export const epkOpportunities = [
 { id: 'media', label: { en: 'Media', fr: 'Médias' }, detail: { en: 'Features, interviews, press & editorial coverage.', fr: 'Portraits, interviews, presse et couverture éditoriale.' } },
 { id: 'label', label: { en: 'Label', fr: 'Label' }, detail: { en: 'Artist development, distribution discussions & project support.', fr: 'Développement artistique, échanges sur la distribution et soutien au projet.' } },
 { id: 'brands', label: { en: 'Brands', fr: 'Marques' }, detail: { en: 'Creative partnerships, campaigns & visual collaborations.', fr: 'Partenariats créatifs, campagnes et collaborations visuelles.' } },
 { id: 'live', label: { en: 'Live', fr: 'Live' }, detail: { en: 'Booking inquiries & festival programming.', fr: 'Demandes de booking et programmation de festivals.' } },
] as const;

export const epkCopy = {
 en: {
  label: 'EPK / Media', intro: 'Independent artist / Morocco', biography: 'About', origin: 'Based in', identity: 'Independent Moroccan artist', launch: 'Official project launch', discography: 'Music', catalogue: 'Selected discography', media: 'Selected visuals', mediaNote: 'Press-resolution images and usage permissions are available on request.', requestImages: 'Request press images', download: 'Download', videos: 'Selected videos', watch: 'Watch', coverNote: 'Cover artwork / official video link', timeline: 'Milestones', press: 'Press / Media', pressNote: 'For editorial conversations and future collaborations.', production: 'Production by', productionNote: 'Individual release credits and live production requirements are available on request.', contact: 'Contact', contactCta: 'Start a conversation', kit: 'EPK / PDF', kitNote: 'For the press dossier and supporting materials, contact the artist directly.', kitRequest: 'Request EPK', copyEmail: 'Copy email', copied: 'Email copied', copyFallback: 'Select and copy the email address above.',
 },
 fr: {
  label: 'EPK / Médias', intro: 'Artiste indépendant / Maroc', biography: 'À propos', origin: 'Basé à', identity: 'Artiste indépendant marocain', launch: 'Lancement officiel du projet', discography: 'Musique', catalogue: 'Discographie sélectionnée', media: 'Visuels sélectionnés', mediaNote: 'Images haute définition et autorisations d’utilisation disponibles sur demande.', requestImages: 'Demander les visuels presse', download: 'Télécharger', videos: 'Vidéos sélectionnées', watch: 'Voir', coverNote: 'Pochette / lien vers la vidéo officielle', timeline: 'Repères', press: 'Presse / Médias', pressNote: 'Pour les échanges éditoriaux et les collaborations à venir.', production: 'Production par', productionNote: 'Crédits par titre et besoins de production live disponibles sur demande.', contact: 'Contact', contactCta: 'Parlons de votre projet', kit: 'EPK / PDF', kitNote: 'Pour le dossier de presse et les documents complémentaires, contactez directement l’artiste.', kitRequest: 'Demander l’EPK', copyEmail: 'Copier l’email', copied: 'Email copié', copyFallback: 'Sélectionnez et copiez l’adresse email ci-dessus.',
 },
} as const;
