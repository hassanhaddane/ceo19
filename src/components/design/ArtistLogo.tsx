import Image from 'next/image';
import { assets, assetUrl } from '@/data/assets';

/** Exact supplied PNG variants. CSS chooses the variant for the current surface. */
export function ArtistLogo({ className = '', sizes = '54px' }: { className?: string; sizes?: string }) {
 return <span className={`logo-mark primary-logo ${className}`}>
  <Image className="logo-variant-light" src={assetUrl(assets.primaryLogo)} alt="CEO1.9" width={1254} height={1254} sizes={sizes} loading="eager" />
  <Image className="logo-variant-dark" src={assetUrl(assets.primaryLogoDark)} alt="CEO1.9" width={1254} height={1254} sizes={sizes} loading="eager" />
 </span>;
}
