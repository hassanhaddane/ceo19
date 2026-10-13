export type AnalyticsEvent='music_play'|'spotify_click'|'youtube_click'|'social_click'|'video_play'|'archive_open'|'contact_click'|'epk_click'|'language_change';
export type AnalyticsProperties={id?:string;platform?:string;locale?:string;source?:string};
type Provider=(event:AnalyticsEvent,properties:AnalyticsProperties)=>void;
let provider:Provider|null=null;
/** Optional provider adapter. No SDK, cookies or outbound requests are enabled by default. */
export function setAnalyticsProvider(adapter:Provider|null){provider=adapter;}
export function track(event:AnalyticsEvent,properties:AnalyticsProperties={}){
 if(typeof window==='undefined')return;
 try {if(provider)provider(event,properties);else window.dispatchEvent(new CustomEvent('ceo:analytics',{detail:{event,properties}}));}catch{/* Analytics must never interrupt artist content or media controls. */}
}
export function linkEvent(href:string):AnalyticsEvent|null {
 if(href.startsWith('mailto:'))return 'contact_click';
 try {const host=new URL(href).hostname;if(host==='open.spotify.com')return 'spotify_click';if(host==='www.youtube.com'||host==='youtube.com'||host==='youtu.be')return 'youtube_click';if(host==='www.instagram.com'||host==='www.tiktok.com')return 'social_click';}catch{/* Relative links are handled by explicit attributes. */}
 return null;
}
