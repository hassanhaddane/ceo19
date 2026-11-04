/** Shared by the parser-time bootstrap and the client store. No preference is written on read. */
export const motionPreferenceKey = 'ceo19:motion-preference';
export const legacyMotionPreferenceKey = 'ceo19:motion:v3';
export type MotionPreference = 'full' | 'reduced' | 'system';

export function readMotionPreference(key: string, legacyKey: string): boolean | null {
 for (const area of ['localStorage', 'sessionStorage'] as const) {
  try {
   const storage = window[area];
   for (const name of [key, legacyKey]) {
    const value = storage.getItem(name);
    if (value === 'full' || value === 'true') return true;
    if (value === 'reduced' || value === 'false') return false;
   }
  } catch { /* Restricted storage still permits a system/in-memory preference. */ }
 }
 return null;
}

/** A small, synchronous head script sets CSS state before the body can paint. */
export const motionPreferenceBootstrap = `(()=>{const preference=(${readMotionPreference.toString()})(${JSON.stringify(motionPreferenceKey)},${JSON.stringify(legacyMotionPreferenceKey)});const root=document.documentElement;if(preference!==null)root.dataset.motionPreference=preference?'full':'reduced';root.dataset.motionEnabled=String(preference??!window.matchMedia('(prefers-reduced-motion: reduce)').matches)})();`;
