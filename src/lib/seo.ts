import type {Metadata} from 'next';
import type {Locale} from '@/types/content';
import {artist} from '@/data/artist';
import {socials} from '@/data/socials';
/** No unconfirmed production domain: set SITE_URL before public launch. */
export const siteUrl=new URL(process.env.SITE_URL||'http://localhost:3000');
export const indexable=!!process.env.SITE_URL&&siteUrl.protocol==='https:'&&process.env.VERCEL_ENV!=='preview';
export const descriptions={en:'CEO 1.9 is an independent Moroccan artist from Fez, connecting contemporary rap, street culture, fashion and visual storytelling.',fr:'CEO 1.9, artiste indépendant marocain de Fès, relie rap contemporain, culture de rue, mode et narration visuelle.'};
export function pageMetadata(locale:Locale,path=''):Metadata{
 const title=path?`CEO 1.9 — ${locale==='fr'?'Presse / EPK':'Press / EPK'}`:'CEO 1.9 — Official Website',url=new URL(`/${locale}${path}`,siteUrl).href;
 return {metadataBase:siteUrl,title,description:descriptions[locale],alternates:{canonical:url,languages:{en:new URL(`/en${path}`,siteUrl).href,fr:new URL(`/fr${path}`,siteUrl).href,'x-default':new URL(`/en${path}`,siteUrl).href}},robots:{index:indexable,follow:indexable},icons:{icon:'/icon.svg'},openGraph:{title,description:descriptions[locale],url,siteName:artist.name,locale:locale==='fr'?'fr_FR':'en_US',alternateLocale:locale==='fr'?'en_US':'fr_FR',type:'website',images:[{url:'/images/seo/ceo19-social.jpg',width:1200,height:630,alt:'CEO 1.9 — Fez → World'}]},twitter:{card:'summary_large_image',title,description:descriptions[locale],images:['/images/seo/ceo19-social.jpg']}};
}
export function artistSchema(locale:Locale){return {'@context':'https://schema.org','@type':'Person',name:artist.name,givenName:artist.firstName,description:descriptions[locale],sameAs:socials.map(s=>s.url),homeLocation:{'@type':'Place',name:artist.origin[locale]},...(indexable?{url:new URL(`/${locale}`,siteUrl).href}:{})};}
