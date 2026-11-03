import type { HTMLAttributes, ReactNode } from 'react';
import type { ParallaxLayer as LayerPreset } from '@/lib/visualEffects';

/** Static blue print field; no continuously running shader or new animation loop. */
export function IrregularBlueGradient({ className = '' }: { className?: string }) {
 return <div className={`irregular-blue-gradient ${className}`} aria-hidden="true" />;
}
export function CinematicMask({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
 return <div className={`cinematic-mask ${className}`} {...props}>{children}</div>;
}
export function EditorialTypography({ as: Tag = 'h2', children, className = '', ...props }: HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' }) {
 return <Tag className={`editorial-typography ${className}`} {...props}>{children}</Tag>;
}
/** Uses the existing shared scheduler; this component never creates its own loop. */
export function ParallaxLayer({ preset, children, className = '' }: { preset: LayerPreset; children?: ReactNode; className?: string }) {
 return <div className={className} data-parallax={preset}>{children}</div>;
}
