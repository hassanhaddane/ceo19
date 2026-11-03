import Link from 'next/link';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { actionMotion, type ActionFamily } from './motion';

type ActionOptions = { family?: ActionFamily; cursor?: string };
export type ActionButtonProps = ComponentPropsWithRef<'button'> & ActionOptions;
export type ActionLinkProps = ComponentPropsWithRef<'a'> & ActionOptions & { href: string; client?: boolean };

/** Semantic primitives keep the original handler, ref and action timing intact. */
export function ActionButton({ family = 'utility', cursor, className = '', type = 'button', ...props }: ActionButtonProps) {
 return <button type={type} data-cursor={cursor ?? (family === 'shop' ? 'shop' : 'enter')} {...props} className={`ceo-action ceo-action--${family} ${className}`} data-ceo-action={family} data-ceo-motion={actionMotion.families[family].join(' ')} />;
}
export function ActionLink({ family = 'navigation', cursor, className = '', client = false, ...props }: ActionLinkProps) {
 const shared = { ...props, className: `ceo-action ceo-action--${family} ${className}`, 'data-ceo-action': family, 'data-ceo-motion': actionMotion.families[family].join(' '), 'data-cursor': cursor ?? (family === 'shop' ? 'shop' : 'enter') };
 return client ? <Link {...shared} prefetch={false}/> : <a {...shared}/>;
}
/** Only the original line is announced; the second line lives inside the hover mask. */
export function ActionLabel({ children }: { children: ReactNode }) { return <span className="ceo-action-label"><span className="ceo-label-original">{children}</span><span className="ceo-label-echo" aria-hidden="true">{children}</span></span>; }
export function ActionMark() {
 return <svg className="ceo-action-mark" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12"/></svg>;
}
