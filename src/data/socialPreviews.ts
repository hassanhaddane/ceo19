import { socials } from './socials.ts';
import { releases } from './releases.ts';
import { videos } from './videos.ts';
import { lyricFragments } from './lyrics.ts';
import type { Localized } from '@/types/content';

/** Curated source-backed text. No network refresh, inferred posts or platform metrics. */
export const socialPreviewData = socials.map(social => ({
 ...social, provenance: 'curated' as const,
 frames: social.id === 'instagram' ? [
  { title: '@CEO_1.9', detail: 'CEO1.9', url: social.url },
  { title: 'CEO1.9', detail: 'FEZ / MOROCCO', url: social.url },
 ] : social.id === 'tiktok' ? [
  { title: '@CEO1.9', detail: 'CEO1.9', url: social.url },
  { title: 'ORIGINAL', detail: lyricFragments.original[2], url: social.url },
  { title: 'BCP D’ARGENT', detail: lyricFragments['bcp-dargent'][1], url: social.url },
 ] : social.id === 'youtube' ? videos.map(video => ({ title: video.title, detail: 'CEO1.9', url: video.url }))
 : releases.map(release => ({ title: release.title, detail: release.featuredArtist ? `CEO1.9 feat. ${release.featuredArtist}` : 'CEO1.9', url: release.spotifyUrl ?? social.url })),
}));
export const previewLabels: Record<string, Localized> = {
 instagram: { en: 'Artist information', fr: 'Informations artiste' },
 tiktok: { en: 'Artist fragments', fr: 'Fragments de l’artiste' },
 youtube: { en: 'Official videos', fr: 'Vidéos officielles' },
 spotify: { en: 'Release catalogue', fr: 'Catalogue musical' },
};
export const connectCopy = {
 en: { title: 'CONNECT', curated: 'Curated preview', platforms: 'Choose a platform preview', previous: 'Previous preview', next: 'Next preview', open: 'Open', channel: 'Official account', video: 'Open video', release: 'Open release', production: 'PRODUCTION BY', contact: 'PRESS / BOOKING / COLLABORATIONS', press: 'Press / contact', epk: 'Download EPK' },
 fr: { title: 'CONTACT', curated: 'Sélection éditoriale', platforms: 'Choisir un aperçu de plateforme', previous: 'Aperçu précédent', next: 'Aperçu suivant', open: 'Ouvrir', channel: 'Compte officiel', video: 'Voir la vidéo', release: 'Écouter la sortie', production: 'PRODUCTION BY', contact: 'PRESSE / BOOKING / COLLABORATIONS', press: 'Presse / contact', epk: 'Télécharger l’EPK' },
} as const;
