import { galleryManifest } from './gallery.ts';

/** The viewer and moving strip always address the same unique originals. */
export const archiveWorld = galleryManifest.map(photo => ({
 ...photo,
 item: { alt:photo.alt, caption:photo.caption, metadata:null },
 aspectRatio:photo.asset.width/photo.asset.height,
 crop:'contain' as const,
}));
export const archiveStart = 0;
export function archiveDepthGain(depth:number) { return Math.max(0,Math.min(1,(depth+210)/200)); }

/** Current recursive source audit, 16 October 2026. Optimized archive derivatives,
 * logos, social cards, maps and generated architecture are not source candidates.
 * 57 candidate files -> 54 exact-hash groups -> 49 distinct visual compositions. */
export const galleryDiscovery = {
 candidateFiles:57, exactHashGroups:54, uniqueImages:49, selectedImages:galleryManifest.length,
 repeatedCompositions:[
  ["/CEO19/BCP D'ARGENT images/IMG_6845.JPG",'/images/ceo_1.9_1788527054_3978775029635754889_7902047543.jpg','/images/editorial/street-bus.webp'],
  ["/CEO19/BCP D'ARGENT images/IMG_6940.JPG",'/images/ceo_1.9_1788527054_3978775072140836924_7902047543.jpg'],
  ['/CEO19/SHOW/CEO-13.jpg','/images/crowd.webp'],
 ],
 excludedGenerated:'/images/architecture/passage.webp',
} as const;
export const archiveCopy = {
 en: { hint:'Drag to explore', touch:'Swipe to explore', previous:'Previous photograph', next:'Next photograph', exposure:'Exposure flash', on:'On', off:'Off', view:'View photograph', position:'Photograph', help:'The photographs move automatically. Drag sideways, swipe, or use the left and right arrow keys. Enter or Space opens the selected photograph. Pause motion to stop the strip. Keyboard focus pauses movement. Scroll vertically to move to another scene.', room:'Photographic archive', close:'Close', opening:'Opening photograph', pause:'Pause motion', play:'Play motion', reduced:'Motion off', paused:'Paused', moving:'Moving' },
 fr: { hint:'Glisser pour explorer', touch:'Balayer pour explorer', previous:'Photographie précédente', next:'Photographie suivante', exposure:'Flash photo', on:'Oui', off:'Non', view:'Voir la photographie', position:'Photographie', help:'Les photographies défilent automatiquement. Glissez horizontalement ou utilisez les flèches gauche et droite. Entrée ou Espace ouvre la photographie sélectionnée. Le bouton de pause et le focus clavier suspendent le mouvement. Le défilement vertical permet de changer de scène.', room:'Archives photographiques', close:'Fermer', opening:'Ouverture de la photographie', pause:'Pause du défilement', play:'Lancer le défilement', reduced:'Mouvement désactivé', paused:'En pause', moving:'En mouvement' },
} as const;
