import { gallery } from './gallery.ts';
import { archiveAssets } from './archiveAssets.ts';

/** Curated positions, not random placement. x is the bounded camera path;
 * y/depth/roll establish an alternating rhythm around each principal photograph. */
const composition = [
 { id: 'street', x: 0, y: .18, depth: -230, roll: -4, scale: .84 },
 { id: 'portrait', x: .62, y: -.23, depth: -110, roll: 3, scale: .91 },
 { id: 'show-7', x: 1.25, y: .02, depth: 0, roll: -2, scale: 1 },
 { id: 'crowd', x: 1.91, y: .22, depth: -150, roll: 4, scale: .92 },
 { id: 'timals-2903', x: 2.51, y: -.2, depth: -240, roll: -3, scale: .9 },
 { id: 'bcp-6845', x: 3.15, y: .12, depth: -30, roll: 2, scale: 1 },
 { id: 'studio', x: 3.8, y: -.24, depth: -180, roll: -4, scale: .88 },
 { id: 'timals-2887', x: 4.46, y: .15, depth: -70, roll: 3, scale: 1 },
 { id: 'live', x: 5.06, y: -.18, depth: -230, roll: -2, scale: .91 },
 { id: 'stage-view', x: 5.73, y: .22, depth: -150, roll: 3, scale: .95 },
 { id: 'daylight', x: 6.36, y: -.15, depth: -90, roll: -3, scale: .88 },
 { id: 'facade', x: 7.01, y: .19, depth: -210, roll: 4, scale: .96 },
 { id: 'yellow-portrait', x: 7.65, y: -.17, depth: -100, roll: -2, scale: .91 },
] as const;
export const archiveWorld = composition.map(position => {
 const item = gallery.find(photo => photo.id === position.id)!;
 const asset = archiveAssets[position.id];
 return { ...position, item, asset, aspectRatio: asset.width / asset.height };
});
export const archiveStart = 2;
export function boundedCamera(value: number, length: number) { return Math.max(0, Math.min(Math.max(0, length - 1), value)); }
/** Fractional camera positions interpolate along the intentionally uneven path. */
export function cameraAnchor(value: number) {
 const camera = boundedCamera(value, archiveWorld.length), left = Math.floor(camera), right = Math.ceil(camera), t = camera - left;
 return { x: archiveWorld[left].x * (1 - t) + archiveWorld[right].x * t, y: archiveWorld[left].y * (1 - t) + archiveWorld[right].y * t };
}
export const archiveCopy = {
 en: { hint: 'Drag to explore', touch: 'Swipe to explore', previous: 'Previous photograph', next: 'Next photograph', exposure: 'Exposure flash', on: 'On', off: 'Off', view: 'View photograph', position: 'Photograph', help: 'Drag sideways, swipe, or use the left and right arrow keys. Scroll vertically to move to another scene.', room: 'Photographic archive', close: 'Close', opening: 'Opening photograph' },
 fr: { hint: 'Glisser pour explorer', touch: 'Balayer pour explorer', previous: 'Photographie précédente', next: 'Photographie suivante', exposure: 'Flash photo', on: 'Oui', off: 'Non', view: 'Voir la photographie', position: 'Photographie', help: 'Glissez horizontalement ou utilisez les flèches gauche et droite. Le défilement vertical permet de changer de scène.', room: 'Archives photographiques', close: 'Fermer', opening: 'Ouverture de la photographie' },
} as const;
