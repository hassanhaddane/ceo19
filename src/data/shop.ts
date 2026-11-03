import type { ArtistCollaboration } from '../lib/commerce/types.ts';

/** Deliberately empty. Future possibilities are not launched collections or products. */
export const artistCollaborations: readonly ArtistCollaboration[] = [];
export const futureShopCategories = [
 { id: 'merch', label: { en: 'Merch', fr: 'Merch' } },
 { id: 'stickers', label: { en: 'Stickers', fr: 'Stickers' } },
 { id: 'objects', label: { en: 'Objects / Gadgets', fr: 'Objets / Gadgets' } },
 { id: 'collaborations', label: { en: 'Artist collaborations', fr: 'Collaborations artistiques' } },
 { id: 'drops', label: { en: 'Limited drops', fr: 'Drops limités' } },
] as const;
export const shopCopy = {
 en: { title: 'CEO1.9 SHOP', subtitle: 'MERCH / OBJECTS / COLLABS', future: 'Future possibilities', availability: 'No products available. No release date announced.', action: 'Get early access', accessTitle: ['GET EARLY', 'ACCESS.'], gesture: 'Drag the print', artwork: 'Interactive SOON print', close: 'Close', waitlistLabel: 'CEO1.9 / DROP LIST', keepExploring: 'Back to DROP LAB' },
 fr: { title: 'CEO1.9 SHOP', subtitle: 'MERCH / OBJETS / COLLABS', future: 'Possibilités à venir', availability: 'Aucun produit disponible. Aucune date annoncée.', action: 'Accès anticipé', accessTitle: ['ACCÈS', 'ANTICIPÉ.'], gesture: 'Faites glisser l’affiche', artwork: 'Affiche SOON interactive', close: 'Fermer', waitlistLabel: 'CEO1.9 / DROP LIST', keepExploring: 'Retour au DROP LAB' },
} as const;
