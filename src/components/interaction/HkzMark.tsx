import Image from 'next/image';
import { assets, assetUrl } from '@/data/assets';
/** Artist-supplied original logo, displayed intact with its original white ground. */
export function HkzMark({className='',sizes='90px',eager=false}:{className?:string;sizes?:string;eager?:boolean}) {
 return <Image className={`hkz-mark ${className}`} src={assetUrl(assets.productionLogo)} alt="HKZ PROD" width={160} height={160} sizes={sizes} loading={eager?'eager':'lazy'}/>;
}
