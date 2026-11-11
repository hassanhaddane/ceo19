import type { ProductPresentation } from '../features/shop/presentation/types.ts';

type Copy = { en: string; fr: string };
export interface DemoProduct extends ProductPresentation {
 mode: 'demo';
 name: string;
 shortName: Copy;
 category: 'apparel' | 'graphics' | 'object';
 description: Copy;
 presentationLabel: Copy;
 backLabel: Copy;
}
const front = { x: 0, y: .07, width: .5, height: .86 };
const back = { x: .5, y: .07, width: .5, height: .86 };
const logo = '/brands/ceo-mask-256.webp';
/** Fictional presentation studies. This module never enters CommerceProvider/Shopify. */
export const demoCatalogue: readonly DemoProduct[] = [
 { id: 'demo-hoodie', mode: 'demo', name: 'CEO1.9 OVERSIZED HOODIE', shortName: { en: 'Oversized hoodie', fr: 'Hoodie oversize' }, category: 'apparel',
  previewType: 'apparel-shell', frontAsset: { src: '/media/drop-lab/hoodie-study.webp', region: front }, backAsset: { src: '/media/drop-lab/hoodie-study.webp', region: back }, model3dAsset: null,
  accent: '#3572a3', material: 'Matte heavyweight cotton concept', graphicColor: '#eae5d6', graphicScale: .83, graphicAsset: { src: logo }, graphicOffsetY: .51,
  description: { en: 'Heavyweight silhouette. An identity study.', fr: 'Silhouette dense. Une étude d’identité.' },
  presentationLabel: { en: '3D textile study', fr: 'Étude textile en 3D' }, backLabel: { en: 'Neutral back · prototype', fr: 'Dos neutre · prototype' } },
 { id: 'demo-tshirt', mode: 'demo', name: 'CEO1.9 GRAPHIC T-SHIRT', shortName: { en: 'Graphic T-shirt', fr: 'T-shirt graphique' }, category: 'apparel',
  previewType: 'apparel-shell', frontAsset: { src: '/media/drop-lab/tshirt-study.webp', region: front }, backAsset: { src: '/media/drop-lab/tshirt-study.webp', region: back }, model3dAsset: null,
  accent: '#a8c7df', material: 'Soft cotton jersey concept', graphicColor: '#173e60', graphicScale: 1.3, graphicAsset: { src: logo }, graphicOffsetY: .14,
  description: { en: 'Soft cotton. A louder signature.', fr: 'Coton doux. Une signature affirmée.' },
  presentationLabel: { en: '3D textile study', fr: 'Étude textile en 3D' }, backLabel: { en: 'Neutral back · prototype', fr: 'Dos neutre · prototype' } },
 { id: 'demo-stickers', mode: 'demo', name: 'CEO1.9 STICKER PACK', shortName: { en: 'Sticker pack', fr: 'Pack de stickers' }, category: 'graphics',
  previewType: 'sticker-stack', frontAsset: { src: logo }, backAsset: null, model3dAsset: null,
  accent: '#3572a3', material: 'Printed vinyl concept', graphicColor: '#eae5d6', graphicScale: 1, graphicAsset: { src: logo }, graphicOffsetY: 0,
  description: { en: 'Three surfaces. One unmistakable signature.', fr: 'Trois surfaces. Une signature unique.' },
  presentationLabel: { en: '3D layered graphic study', fr: 'Étude graphique en 3D' }, backLabel: { en: 'Unprinted backing · prototype', fr: 'Support non imprimé · prototype' } },
 { id: 'demo-keychain', mode: 'demo', name: 'CEO1.9 ACCESSORY / KEYCHAIN', shortName: { en: 'Signature keychain', fr: 'Porte-clés signature' }, category: 'object',
  previewType: 'keychain-3d', frontAsset: { src: logo }, backAsset: null, model3dAsset: null,
  accent: '#3572a3', material: 'Matte blue polymer / brushed ring concept', graphicColor: '#eae5d6', graphicScale: 1, graphicAsset: { src: logo }, graphicOffsetY: -.24,
  description: { en: 'An everyday object. A small statement.', fr: 'Un objet du quotidien. Un signe distinctif.' },
  presentationLabel: { en: 'Procedural 3D object concept', fr: 'Concept d’objet 3D procédural' }, backLabel: { en: 'Neutral reverse · prototype', fr: 'Revers neutre · prototype' } },
];
