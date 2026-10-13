'use client';
import { lazy, Suspense, useEffect, useState, type RefObject } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei/core/PerformanceMonitor';
import { SignalObject, type Palette } from './SignalObject';
import { SignalEnvironment } from './SignalEnvironment';
import { SignalLights } from './SignalLights';
const SignalPostFX = lazy(() => import('./SignalPostFX').then(module => ({default:module.SignalPostFX})));

import { signalConfig, type Quality } from './signalStates';
import type { SignalRuntime } from './useSignalScroll';

function Lifecycle({ onFailure }: { onFailure: () => void }) {
 const gl = useThree((state) => state.gl);
 useEffect(() => {
  const lost = (event: Event) => { event.preventDefault(); onFailure(); };
  gl.domElement.addEventListener('webglcontextlost',lost);
  const previous = gl.debug.onShaderError;
  gl.debug.onShaderError = () => onFailure();
  return () => { gl.domElement.removeEventListener('webglcontextlost',lost); gl.debug.onShaderError = previous; };
 },[gl,onFailure]);
 return null;
}
export default function SignalScene({ runtime, palette, mobile, visible, onReady, onFailure }: { runtime: RefObject<SignalRuntime>; palette: Palette; mobile: boolean; visible: boolean; onReady: () => void; onFailure: () => void }) {
 const [quality,setQuality] = useState<Quality>(mobile ? 'mobile' : 'desktop');
 const [dpr,setDpr] = useState(mobile ? 1 : Math.min(window.devicePixelRatio,1.5));
 return <Canvas camera={{position:[0,0,mobile ? 8.8 : 7.5], fov:35, near:.1, far:30}} dpr={dpr} frameloop={visible ? 'always' : 'never'} gl={{alpha:true,antialias:false,powerPreference:'high-performance',stencil:false}} onCreated={({gl}) => { gl.setClearColor(0,0); gl.domElement.dataset.signalInstance = crypto.randomUUID(); onReady(); }} fallback={null}>
  <Lifecycle onFailure={onFailure} /><SignalEnvironment/>
  <PerformanceMonitor bounds={() => [38,58]} flipflops={2} onChange={({factor}) => { setDpr(Math.min(window.devicePixelRatio,Math.max(.8,signalConfig.quality[quality].maxDpr*factor))); if(factor < .35 && !mobile) setQuality('low'); }} onFallback={() => { setDpr(.85); if(!mobile) setQuality('low'); }}>
   <SignalObject runtime={runtime} quality={quality} palette={palette} />
   <SignalLights runtime={runtime} palette={palette} />
   {quality === 'desktop' && <Suspense fallback={null}><SignalPostFX /></Suspense>}
  </PerformanceMonitor>
 </Canvas>;
}
