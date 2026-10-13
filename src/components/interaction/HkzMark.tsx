import Image from 'next/image';
/** Artist-supplied original logo, displayed intact with its original white ground. */
export function HkzMark({className=''}:{className?:string}) {
 return <Image className={`hkz-mark ${className}`} src="/brands/hkz.png" alt="HKZ — Hiphop Kulture Zone" width={148} height={148} sizes="90px"/>;
}
