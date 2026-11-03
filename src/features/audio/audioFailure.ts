/** Fixed diagnostic messages only: never publish arbitrary fetch/provider error text. */
export interface AudioFailure { code: string; message: string; }
export class AudioDiagnosticError extends Error {
 code: string;
 constructor(code: string, message: string) { super(message); this.code = code; this.name = 'AudioDiagnosticError'; }
}
export function audioFailure(error: unknown, fallback: string): AudioFailure {
 if (error instanceof AudioDiagnosticError) return { code: error.code, message: error.message };
 const name = error instanceof Error ? error.name : '';
 if (['NotAllowedError', 'NotSupportedError', 'EncodingError', 'AbortError', 'InvalidStateError', 'SecurityError'].includes(name)) {
  return { code: name, message: fallback };
 }
 return { code: 'AUDIO_ERROR', message: fallback };
}
