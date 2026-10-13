export type InteractionKind = 'channel'|'camera'|'cinema'|'walls'|'language'|'pulse'|'print'|'close'|'studio';
export interface Interaction { kind:InteractionKind; label?:string; }
export const interactionEvent='ceo:interaction';
/** No navigation interception or simulated playback. A visual response to a real action. */
export function signalInteraction(kind:InteractionKind,label?:string) {
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent<Interaction>(interactionEvent,{detail:{kind,label}}));
}
