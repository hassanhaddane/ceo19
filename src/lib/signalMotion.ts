'use client';
import { useSyncExternalStore } from 'react';
import { legacyMotionPreferenceKey, motionPreferenceKey, readMotionPreference, type MotionPreference } from './motionPreference.ts';
let override: boolean | null = null, query: MediaQueryList | null = null;
let initialized = false;
const listeners = new Set<() => void>();
const systemReduced = () => (query ?? window.matchMedia('(prefers-reduced-motion: reduce)')).matches;
function applyPreference() {
 if (override === null) delete document.documentElement.dataset.motionPreference;
 else document.documentElement.dataset.motionPreference = override ? 'full' : 'reduced';
 document.documentElement.dataset.motionEnabled = String(override ?? !systemReduced());
}
function initialize() {
 if (initialized || typeof window === 'undefined') return;
 initialized = true;
 override = readMotionPreference(motionPreferenceKey, legacyMotionPreferenceKey);
 applyPreference();
}
const notify = () => { applyPreference(); listeners.forEach(listener => listener()); };
const storageChanged = (event: StorageEvent) => {
 if (![motionPreferenceKey, legacyMotionPreferenceKey, null].includes(event.key)) return;
 try { if (event.storageArea !== window.localStorage) return; } catch { return; }
 const parse = (value: string | null) => value === 'full' || value === 'true' ? true : value === 'reduced' || value === 'false' ? false : null;
 override = event.key === null ? null : event.key === motionPreferenceKey ? parse(event.newValue) : parse(window.localStorage.getItem(motionPreferenceKey)) ?? parse(event.newValue);
 notify();
};
export function subscribeSignalMotion(listener: () => void) {
 initialize(); applyPreference();
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
/** motionEnabled defaults to true; a system request reduces it unless explicitly overridden. */
export function setSignalMotion(motionEnabled: boolean) {
 initialize(); override = motionEnabled;
 const value = motionEnabled ? 'full' : 'reduced';
 try {
  window.localStorage.setItem(motionPreferenceKey, value);
  window.localStorage.removeItem(legacyMotionPreferenceKey);
  try { window.sessionStorage.removeItem(motionPreferenceKey); window.sessionStorage.removeItem(legacyMotionPreferenceKey); } catch {}
 } catch { try { window.sessionStorage.setItem(motionPreferenceKey, value); window.sessionStorage.removeItem(legacyMotionPreferenceKey); } catch {} }
 notify();
}
export function resetSignalMotion() {
 initialize(); override = null;
 for (const area of ['localStorage', 'sessionStorage'] as const) {
  try { window[area].removeItem(motionPreferenceKey); window[area].removeItem(legacyMotionPreferenceKey); } catch {}
 }
 notify();
}
export function getSignalMotionPreference(): MotionPreference { initialize(); return override === null ? 'system' : override ? 'full' : 'reduced'; }
export function isSignalMotionEnabled() {
 if (typeof window === 'undefined') return false;
 initialize(); return override ?? !systemReduced();
}
export function useSignalMotion() { return useSyncExternalStore(subscribeSignalMotion, isSignalMotionEnabled, () => false); }
export function useSignalMotionPreference() { return useSyncExternalStore(subscribeSignalMotion, getSignalMotionPreference, (): MotionPreference => 'system'); }
