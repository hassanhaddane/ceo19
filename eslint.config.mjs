import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([...nextVitals, ...nextTs, {
 // Three.js and R3F intentionally mutate engine objects and ref-backed uniforms outside React render.
 files: ['src/components/signal/SignalObject.tsx', 'src/components/signal/SignalScene.tsx', 'src/components/signal/useSignalScroll.ts'],
 rules: { 'react-hooks/immutability': 'off' }
}, globalIgnores(['.next/**', '.review/**', 'next-env.d.ts'])]);
