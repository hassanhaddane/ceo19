'use client';
import { useEffect, useRef } from 'react';
import { loadSpotifyApi, loadYoutubeApi, type EmbedControls, type PlaybackUpdate } from './embedApi';
import { spotifyEntity, youtubeId, spotifyPlayback, type MusicSource } from './musicSources';
export default function EmbedPlayer({source,title,onControls,onUpdate,onStatus}: {source:MusicSource;title:string;onControls:(controls:EmbedControls|null)=>void;onUpdate:(update:PlaybackUpdate)=>void;onStatus:(status:'loading'|'ready'|'error')=>void}) {
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const parent=host.current; if(!parent) return;
  let disposed=false, destroy:(()=>void)|undefined, interval=0;
  const mount=document.createElement('div'); parent.appendChild(mount);
  const titleFrame=()=>{const frame=parent.querySelector('iframe');if(frame) frame.title=`${title} — ${source.kind}`;};
  const timeout=window.setTimeout(()=>{if(!disposed) onStatus('error');},18000);
  const ready=()=>{clearTimeout(timeout);if(!disposed){titleFrame();onStatus('ready');}};
  if(source.kind==='Spotify') {
   loadSpotifyApi().then(api=>{
    if(disposed) return;
    api.createController(mount,{uri:spotifyEntity(source.url)!,width:'100%',height:152},controller=>{
     if(disposed){controller.destroy();return;}
     destroy=()=>controller.destroy();
     onControls({play:()=>controller.play(),pause:()=>controller.pause()});
     controller.addListener('ready',ready);
     controller.addListener('playback_update',event=>{
      if(disposed) return;
      const data=event.data;
      onUpdate(spotifyPlayback(data));
     });
     titleFrame();
    });
   }).catch(()=>{if(!disposed) onStatus('error');});
  } else if(source.kind==='YouTube') {
   loadYoutubeApi().then(api=>{
    if(disposed) return;
    const player=new api.Player(mount,{videoId:youtubeId(source.url)!,width:'100%',height:'100%',playerVars:{autoplay:0,playsinline:1,origin:window.location.origin},events:{
     onReady:()=>{if(!disposed){onControls({play:()=>player.playVideo(),pause:()=>player.pauseVideo()});ready();}},
     onError:()=>{if(!disposed) onStatus('error');},
     onStateChange:event=>{
      if(disposed) return;
      const playing=event.data===1;
      onUpdate({isPlaying:playing,position:player.getCurrentTime(),duration:player.getDuration()||null});
      clearInterval(interval);
      if(playing) interval=window.setInterval(()=>onUpdate({isPlaying:true,position:player.getCurrentTime(),duration:player.getDuration()||null}),500);
     }
    }});
    destroy=()=>player.destroy();
   }).catch(()=>{if(!disposed) onStatus('error');});
  }
  return ()=>{disposed=true;clearTimeout(timeout);clearInterval(interval);onControls(null);destroy?.();mount.remove();};
 },[source,title,onControls,onUpdate,onStatus]);
 return <div className={`music-embed music-embed--${source.kind.toLowerCase()}`} ref={host} />;
}
