'use client';
import { Bloom, EffectComposer, Noise } from '@react-three/postprocessing';
import { signalConfig } from './signalStates';
/** Kept off mobile and degraded devices. No permanent chromatic/glitch effects. */
export function SignalPostFX() {
 return <EffectComposer multisampling={0} depthBuffer={false}><Bloom intensity={signalConfig.bloom.intensity} luminanceThreshold={signalConfig.bloom.threshold} luminanceSmoothing={signalConfig.bloom.smoothing} mipmapBlur /><Noise opacity={signalConfig.grain} /></EffectComposer>;
}
