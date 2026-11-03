export interface ShopAccessOrigin { x: number; y: number; }
export interface ShopAccessIntent { source: 'navigation' | 'direct'; origin: ShopAccessOrigin; }
type VisitStorage = Pick<Storage, 'getItem' | 'setItem'>;
const dismissalKey = 'ceo19:shop:waitlist-dismissed:v1';

/** Only navigation intent and this tab's dismissal; never contact data or consent. */
export class ShopEntryCoordinator {
 private pending: ShopAccessIntent | null = null;
 private prompted = false;
 private dismissed = false;
 private listeners = new Set<() => void>();
 private storage: () => VisitStorage | null;
 constructor(storage: () => VisitStorage | null) { this.storage = storage; }
 request(origin: ShopAccessOrigin) {
  this.pending = { source: 'navigation', origin: {
   x: Number.isFinite(origin.x) ? Math.max(0, Math.min(1, origin.x)) : .85,
   y: Number.isFinite(origin.y) ? Math.max(0, Math.min(1, origin.y)) : .05,
  } };
  this.listeners.forEach(listener => listener());
 }
 claim(): ShopAccessIntent | null {
  if (this.pending) { const intent = this.pending; this.pending = null; this.prompted = true; return intent; }
  if (this.prompted || this.dismissed) return null;
  try { if (this.storage()?.getItem(dismissalKey) === 'true') return null; } catch { /* In-memory visit policy still applies. */ }
  this.prompted = true;
  return { source: 'direct', origin: { x: .85, y: .05 } };
 }
 dismiss() {
  this.dismissed = true;
  try { this.storage()?.setItem(dismissalKey, 'true'); } catch { /* Dismissal remains effective in this document. */ }
 }
 subscribe(listener: () => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
}
export const shopEntry = new ShopEntryCoordinator(() => typeof window === 'undefined' ? null : window.sessionStorage);
