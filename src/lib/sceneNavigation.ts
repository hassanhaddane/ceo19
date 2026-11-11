'use client';
import { useSyncExternalStore } from 'react';
import type { SceneChapter } from './sceneTargets';
export type { SceneChapter } from './sceneTargets';

export interface SceneState {
 active: SceneChapter; settled: SceneChapter; previous: SceneChapter;
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
export function navigateScene(id: SceneChapter, history: 'push' | 'replace' = 'push') {
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
