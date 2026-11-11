import type { ReactNode } from 'react';
import type { ParallaxLayer as LayerPreset } from '@/lib/visualEffects';

/** Uses the existing shared scheduler; this component never creates its own loop. */
export function ParallaxLayer({ preset, children, className = '' }: { preset: LayerPreset; children?: ReactNode; className?: string }) {
 return <div className={className} data-parallax={preset}>{children}</div>;
}
