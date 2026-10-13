'use client';
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
/** Procedural studio reflections, baked once. No remote HDR, frame loop or extra scene model. */
export function SignalEnvironment() {
 const get = useThree(state => state.get);
 useEffect(() => {
  const { gl, scene } = get();
  const room = new RoomEnvironment(), generator = new PMREMGenerator(gl);
  const target = generator.fromScene(room, .04);
  const previous = scene.environment;
  scene.environment = target.texture;
  room.dispose(); generator.dispose();
  return () => { scene.environment = previous; target.dispose(); };
 }, [get]);
 return null;
}
