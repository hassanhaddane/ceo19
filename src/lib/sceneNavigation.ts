'use client';
import { useSyncExternalStore } from 'react';
import type { SectionId } from '@/types/content';
import { scenes } from '@/data/artist';

export const sceneOrder: readonly SectionId[] = scenes.map(scene => scene.id);
export function sceneFromHash(hash: string): SectionId | null {
 const id = hash.replace(/^#/, '');
 if (sceneOrder.includes(id as SectionId)) return id as SectionId;
 if (/^(release-|film-)/.test(id) || ['channels', 'transmissions', 'visuals'].includes(id)) return 'music';
 if (id.startsWith('archive-')) return 'archive';
 return null;
}
export interface SceneState {
 active: SectionId; settled: SectionId; previous: SectionId;
 phase: 'idle' | 'scrolling'; compact: boolean; enabled: boolean; menuOpen: boolean;
}
const initial: SceneState = { active: 'home', settled: 'home', previous: 'home', phase: 'idle', compact: false, enabled: false, menuOpen: false };
let state = initial;
const listeners = new Set<() => void>();
export function subscribeSceneState(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function publishScene(patch: Partial<SceneState>) {
 if (Object.entries(patch).every(([key, value]) => state[key as keyof SceneState] === value)) return;
 state = { ...state, ...patch }; listeners.forEach(listener => listener());
}
export function getSceneState() { return state; }
export function useSceneState() { return useSyncExternalStore(subscribeSceneState, getSceneState, () => initial); }
export const sceneNavigateEvent = 'ceo:scene-navigate';
export const sceneSettledEvent = 'ceo:scene-settled';
export function navigateScene(id: SectionId, history: 'push' | 'replace' = 'push') {
 window.dispatchEvent(new CustomEvent(sceneNavigateEvent, { detail: { id, history } }));
}

type Gesture = { owner: string; element: HTMLElement };
let gesture: Gesture | null = null;
export function getSceneGesture() { return gesture; }
/** Only an axis-resolved drag owns navigation. Release it on up/cancel/blur/unmount. */
export function acquireSceneGesture(owner: string, element: HTMLElement) {
 const claim = { owner, element }; gesture = claim;
 document.documentElement.dataset.sceneGesture = owner;
 window.dispatchEvent(new Event('ceo:gesture-change'));
 return () => {
  if (gesture !== claim) return;
  gesture = null; delete document.documentElement.dataset.sceneGesture;
  window.dispatchEvent(new Event('ceo:gesture-change'));
 };
}
/** A scrollable panel gets first refusal; at its edge document navigation is available. */
export function ownsVerticalScroll(target: EventTarget | null, direction: number) {
 if (!(target instanceof Element)) return false;
 if (target.closest('dialog[open],input,textarea,select,[contenteditable="true"],iframe,video')) return true;
 let element = target.closest<HTMLElement>('[data-scroll-owner]');
 while (element) {
  if (element.scrollHeight > element.clientHeight + 2 && (direction > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 2 : element.scrollTop > 2)) return true;
  element = element.parentElement?.closest<HTMLElement>('[data-scroll-owner]') ?? null;
 }
 return false;
}
