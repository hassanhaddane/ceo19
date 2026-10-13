import type { PlatformLink, Release } from '@/types/content';
export type SourceKind = 'preview' | 'Spotify' | 'YouTube';
export interface MusicSource { kind: SourceKind; url: string; }
export function releaseLinks(release: Release): PlatformLink[] {
 const links=new Map(release.platforms.map(link=>[link.platform,link]));
 if(release.spotifyUrl) links.set('Spotify',{platform:'Spotify',url:release.spotifyUrl});
 if(release.youtubeUrl) links.set('YouTube',{platform:'YouTube',url:release.youtubeUrl});
 return [...links.values()];
}
export function spotifyEntity(url: string): string | null {
 try { const u=new URL(url); if(u.hostname !== 'open.spotify.com') return null;
 const match=u.pathname.match(/\/(track|album|artist|playlist|episode)\/([A-Za-z0-9]+)\/?$/);
 return match ? `spotify:${match[1]}:${match[2]}` : null;
 } catch { return null; }
}
export function youtubeId(url: string): string | null {
 try { const u=new URL(url); const id=u.hostname === 'youtu.be' ? u.pathname.slice(1) : ['www.youtube.com','youtube.com'].includes(u.hostname) ? u.searchParams.get('v') : null;
 return id && /^[\w-]{11}$/.test(id) ? id : null;
 } catch { return null; }
}
export function playableSources(release: Release): MusicSource[] {
 const sources: MusicSource[]=[];
 if(release.audioPreviewUrl) sources.push({kind:'preview',url:release.audioPreviewUrl});
 for(const link of releaseLinks(release)) {
  if(link.platform === 'Spotify' && spotifyEntity(link.url)) sources.push({kind:'Spotify',url:link.url});
  if(link.platform === 'YouTube' && youtubeId(link.url)) sources.push({kind:'YouTube',url:link.url});
 }
 return sources;
}
export function timeLabel(seconds: number | null): string {
 if(seconds === null || !Number.isFinite(seconds)) return '—:—';
 const value=Math.max(0,Math.floor(seconds)); return `${Math.floor(value/60)}:${String(value%60).padStart(2,'0')}`;
}

/** Only reported, incomplete, unbuffered playback can energize the Signal. */
export function spotifyPlayback(data: {isPaused?:boolean;isBuffering?:boolean;position?:number;duration?:number}) {
 const position=typeof data.position==='number'&&Number.isFinite(data.position)?Math.max(0,data.position)/1000:null;
 const duration=typeof data.duration==='number'&&Number.isFinite(data.duration)&&data.duration>0?data.duration/1000:null;
 const ended=position!==null&&duration!==null&&position>=duration;
 return {isPlaying:data.isPaused===false&&data.isBuffering!==true&&!ended,position,duration};
}
