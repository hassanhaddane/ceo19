let supported: boolean | undefined;

/** Probe once, before importing a renderer. An unsupported device keeps the static artwork. */
export function supportsWebGL2() {
 if (supported !== undefined) return supported;
 try {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', { alpha: true, powerPreference: 'low-power' });
  supported = Boolean(context);
  context?.getExtension('WEBGL_lose_context')?.loseContext();
 } catch {
  supported = false;
 }
 return supported;
}
