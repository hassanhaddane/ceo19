'use client';
import {useEffect,useRef,useState} from 'react';
import {track} from '@/lib/analytics';
import {youtubeId} from '../music/musicSources';
import {loadYoutubeApi,type YoutubePlayer} from '../music/embedApi';
import type {Video} from '@/types/content';
/** Mounted only after Watch film; playback events come from the official player. */
export default function FilmPlayer({video,title,suspended=false,onStatus,onPlayback}:{video:Video;title:string;suspended?:boolean;onStatus?:(status:'ready'|'error')=>void;onPlayback?:(status:'playing'|'paused'|'loading'|'ready')=>void}){
 const playerRef=useRef<YoutubePlayer|null>(null);
 const playerReady=useRef(false);
 const hostRef=useRef<HTMLDivElement>(null);
 const suspendedRef=useRef(suspended);
 useEffect(()=>{suspendedRef.current=suspended;if(suspended&&playerReady.current&&hostRef.current?.isConnected)playerRef.current?.pauseVideo?.();},[suspended]);
 const [error,setError]=useState(false);
 useEffect(()=>{
  const host=hostRef.current,id=youtubeId(video.url);if(!host||!id)return;
  const target=document.createElement('div');host.appendChild(target);
  let readyTimer=0;
  let disposed=false,player:YoutubePlayer|undefined,playing=false;
  loadYoutubeApi().then(api=>{if(disposed)return;player=new api.Player(target,{host:'https://www.youtube-nocookie.com',videoId:id,width:'100%',height:'100%',playerVars:{autoplay:0,controls:1,playsinline:1,rel:0,origin:window.location.origin},events:{onReady:()=>{if(disposed)return;playerReady.current=true;clearTimeout(readyTimer);setError(false);host.querySelector('iframe')?.setAttribute('title',title);if(suspendedRef.current)player?.pauseVideo?.();onStatus?.('ready');},onError:()=>{if(!disposed){clearTimeout(readyTimer);setError(true);onStatus?.('error');} },onStateChange:event=>{if(disposed)return;if(event.data===1&&!playing)track('video_play',{id:video.id});playing=event.data===1;host.setAttribute('data-playing',String(playing));onPlayback?.(event.data===1?'playing':event.data===2||event.data===0?'paused':event.data===3?'loading':'ready');}}});playerRef.current=player;readyTimer=window.setTimeout(()=>{if(!disposed){setError(true);onStatus?.('error');}},15000);}).catch(()=>{if(!disposed){setError(true);onStatus?.('error');}});
  return()=>{disposed=true;clearTimeout(readyTimer);playerRef.current=null;if(host.isConnected&&playerReady.current)player?.pauseVideo?.();playerReady.current=false;player?.destroy();target.remove();};
 },[video.id,video.url,title,onStatus,onPlayback]);
 return <div className="film-player-host" ref={hostRef}>{error&&<a className="film-player-fallback" href={video.url} target="_blank" rel="noopener noreferrer">YouTube ↗</a>}</div>;
}
