'use client';
import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import {Color, type DirectionalLight} from 'three';
import {channelWorlds} from '@/data/channelWorlds';
import { damp, mix } from './signalMath';
import { resolveSignalState } from './signalStates';
import type { SignalRuntime } from './useSignalScroll';
import type { Palette } from './SignalObject';
export function SignalLights({ runtime, palette }: { runtime: RefObject<SignalRuntime>; palette: Palette }) {
 const key = useRef<DirectionalLight>(null), blue = useRef<DirectionalLight>(null);
 const channelLight=useMemo(()=>new Color(palette.blue),[palette]);
 const baseBlue=useMemo(()=>new Color(palette.blue),[palette]);
 const colors=useMemo(()=>Object.fromEntries(Object.entries(channelWorlds).map(([id,world])=>[id,new Color(!world.accentColor||world.accentColor.startsWith('var(')?palette.blue:world.accentColor)])),[palette]);
 useFrame((_,delta) => {
  const { from,to,progress,channelId } = runtime.current;
  if (key.current) key.current.intensity = damp(key.current.intensity,mix(resolveSignalState(from,channelId).keyLight,resolveSignalState(to,channelId).keyLight,progress),3,Math.min(delta,.05));
  if(blue.current) { channelLight.copy(baseBlue).lerp(colors[channelId??'']??baseBlue,mix(from==='music'?1:0,to==='music'?1:0,progress)); blue.current.color.lerp(channelLight,1-Math.exp(-3*Math.min(delta,.05))); }
  if (blue.current) blue.current.intensity = damp(blue.current.intensity,mix(resolveSignalState(from,channelId).blueLight,resolveSignalState(to,channelId).blueLight,progress),3,Math.min(delta,.05));
 });
 return <><ambientLight intensity={.4} color={palette.cream} /><directionalLight ref={key} position={[-4,5,5]} intensity={4.5} color={palette.cream} /><directionalLight ref={blue} position={[5,-2,3]} intensity={4} color={palette.blue} /><directionalLight position={[0,4,-4]} intensity={3.2} color={palette.blue} /></>;
}
