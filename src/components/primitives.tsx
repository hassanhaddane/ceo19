import Image from 'next/image';
import type { ReactNode, HTMLAttributes } from 'react';
import { assets, assetUrl } from '@/data/assets';

export function Arrow({ diagonal = false, className = '' }: { diagonal?: boolean; className?: string }) {
 return <svg className={`arrow ${className}`} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M3 12h18m-7-7 7 7-7 7'} stroke="currentColor" strokeWidth="1.4" /></svg>;
}
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) { return <div className={`container ${className}`}>{children}</div>; }
export function SectionLabel({ number, children }: { number: string; children: ReactNode }) { return <div className="section-label"><span>{number}</span><span className="label-line" /><span>{children}</span></div>; }
export function MassiveTitle({ id, children, className = '', as = 'h2', ...props }: { id?: string; children: ReactNode; className?: string; as?: 'h1' | 'h2' } & HTMLAttributes<HTMLHeadingElement>) { const Tag = as; return <Tag id={id} className={`massive-title ${className}`} {...props}>{children}</Tag>; }
export function EditorialText({ children, className = '' }: { children: ReactNode; className?: string }) { return <p className={`editorial-text ${className}`}>{children}</p>; }
export function Metadata({ children, className = '' }: { children: ReactNode; className?: string }) { return <span className={`metadata ${className}`}>{children}</span>; }
export function ArrowLink({ href, children, external = false, className = '' }: { href: string; children: ReactNode; external?: boolean; className?: string }) { return <a className={`arrow-link ${className}`} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}<Arrow diagonal={external} /></a>; }
export function MediaFrame({ src, alt, className = '', priority = false, sizes = '(max-width: 767px) 100vw, 50vw' }: { src: string; alt: string; className?: string; priority?: boolean; sizes?: string }) { return <div className={`media-frame ${className}`}><Image src={src} alt={alt} fill sizes={sizes} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} /></div>; }
export function Divider() { return <hr className="divider" />; }
/** Supplied transparent primary variants adapt to the surface; the secondary JPG is footer-only. */
export function LogoMark({ className = '', secondary = false, sizes = '54px' }: { className?: string; secondary?: boolean; sizes?: string }) {
 return <span className={`logo-mark ${secondary ? 'secondary-logo' : 'primary-logo'} ${className}`}>{secondary ? <Image src={assetUrl(assets.secondaryLogo)} alt="CEO1.9" width={1600} height={1600} sizes={sizes} loading="lazy"/> : <><Image className="logo-variant-light" src={assetUrl(assets.primaryLogo)} alt="CEO1.9" width={1254} height={1254} sizes={sizes} loading="eager"/><Image className="logo-variant-dark" src={assetUrl(assets.primaryLogoDark)} alt="CEO1.9" width={1254} height={1254} sizes={sizes} loading="eager"/></>}</span>;
}
