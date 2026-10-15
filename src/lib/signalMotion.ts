'use client';
import { useSyncExternalStore } from 'react';
type Preference = 'full' | 'reduced' | 'system';
let override: boolean | null = null, query: MediaQueryList | null = null;
let initialized = false;
const preferenceKey = 'ceo19:motion:v3';
const listeners = new Set<() => void>();
const parse = (value: string | null) => value === 'full' || value === 'reduced' ? value === 'full' : null;
function applyPreference() {
 if (override === null) delete document.documentElement.dataset.motionPreference;
 else document.documentElement.dataset.motionPreference = override ? 'full' : 'reduced';
}
function initialize() {
 if (initialized) return;
 initialized = true;
 try { override = parse(localStorage.getItem(preferenceKey)); } catch { /* Restricted storage: try the former session preference. */ }
 if (override === null) {
  try {
   override = parse(sessionStorage.getItem(preferenceKey));
   if (override !== null) {
    // Preserve an existing explicit choice when upgrading from the tab-only setting.
    try { localStorage.setItem(preferenceKey, override ? 'full' : 'reduced'); sessionStorage.removeItem(preferenceKey); } catch { /* The existing session choice remains usable. */ }
   }
  } catch { /* Keep system behavior if neither storage API is available. */ }
 }
 applyPreference();
}
const notify = () => { applyPreference(); listeners.forEach(listener => listener()); };
const storageChanged = (event: StorageEvent) => {
 if (event.key !== preferenceKey && event.key !== null) return;
 // Session storage belongs to an individual tab; only persistent choices sync tabs.
 try { if (event.storageArea !== localStorage) return; } catch { return; }
 override = event.key === null ? null : parse(event.newValue); notify();
};
export function subscribeSignalMotion(listener: () => void) {
 initialize(); applyPreference(); // Reapply root attributes after a Strict Mode remount.
 if (listeners.size === 0) {
  query = window.matchMedia('(prefers-reduced-motion: reduce)'); query.addEventListener('change', notify);
  window.addEventListener('storage', storageChanged);
 }
 listeners.add(listener);
 return () => {
  listeners.delete(listener);
  if (listeners.size === 0) { query?.removeEventListener('change', notify); query = null; window.removeEventListener('storage', storageChanged); }
 };
}
/** An explicit visitor choice persists across tabs/reopening; the system remains the default. */
export function setSignalMotion(enabled: boolean) {
 initialize(); override = enabled;
 try { localStorage.setItem(preferenceKey, enabled ? 'full' : 'reduced'); sessionStorage.removeItem(preferenceKey); }
 catch { try { sessionStorage.setItem(preferenceKey, enabled ? 'full' : 'reduced'); } catch { /* The in-memory choice still works. */ } }
 notify();
}
export function resetSignalMotion() {
 initialize(); override = null;
 try { localStorage.removeItem(preferenceKey); } catch { /* Memory fallback. */ }
 try { sessionStorage.removeItem(preferenceKey); } catch { /* Memory fallback. */ }
 notify();
}
export function getSignalMotionPreference(): Preference { return override === null ? 'system' : override ? 'full' : 'reduced'; }
export function isSignalMotionEnabled() { return typeof window === 'undefined' ? false : override ?? !(query ?? window.matchMedia('(prefers-reduced-motion: reduce)')).matches; }
export function useSignalMotion() { return useSyncExternalStore(subscribeSignalMotion, isSignalMotionEnabled, () => false); }
export function useSignalMotionPreference() { return useSyncExternalStore(subscribeSignalMotion, getSignalMotionPreference, (): Preference => 'system'); }
