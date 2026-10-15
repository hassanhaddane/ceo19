/** Development-only, event-driven diagnostics. No polling or pointer-frame logging. */
type Probe = () => unknown;
const statuses: Record<string, { state: string; detail?: unknown }> = {};
const probes = new Map<string, Probe>();
const errors: { source: string; message: string }[] = [];
export function animationStatus(system: string, state: string, detail?: unknown) {
 if (process.env.NODE_ENV !== 'development') return;
 statuses[system] = { state, ...(detail === undefined ? {} : { detail }) };
}
export function animationError(source: string, error: unknown) {
 if (process.env.NODE_ENV !== 'development') return;
 const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
 errors.push({ source, message }); if (errors.length > 32) errors.shift();
 console.error(`[CEO1.9 animation:${source}]`, error);
}
export function registerAnimationProbe(name: string, probe: Probe) {
 if (process.env.NODE_ENV !== 'development') return () => {};
 probes.set(name, probe);
 return () => { if (probes.get(name) === probe) probes.delete(name); };
}
export function animationSnapshot() {
 return { systems: { ...statuses }, errors: [...errors], ...Object.fromEntries(Array.from(probes, ([name, probe]) => {
  try { return [name, probe()]; } catch (error) { return [name, { error: String(error) }]; }
 })) };
}
declare global {
 interface Window { __CEO19_ANIMATIONS__?: { snapshot: typeof animationSnapshot } }
}
