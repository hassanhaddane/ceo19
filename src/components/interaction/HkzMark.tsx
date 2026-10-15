import Image from 'next/image';
import { assets, assetUrl } from '@/data/assets';
/** Artist-supplied original logo, displayed intact with its original white ground. */
export function HkzMark({className=''}:{className?:string}) {
 return <Image className={`hkz-mark ${className}`} src={assetUrl(assets.productionLogo)} alt="HKZ PROD" width={160} height={160} sizes="90px"/>;
}
