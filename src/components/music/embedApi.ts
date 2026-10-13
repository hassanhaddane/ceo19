export interface EmbedControls { play: () => void; pause: () => void; }
export interface PlaybackUpdate { isPlaying: boolean; position: number | null; duration: number | null; }
interface SpotifyController { play():void; pause():void; destroy():void; addListener(name:string, callback:(event:{data:{isPaused:boolean;isBuffering:boolean;position:number;duration:number}})=>void):void; }
export interface SpotifyApi { createController(element:HTMLElement,options:{uri:string;width:string;height:number},callback:(controller:SpotifyController)=>void):void; }
export interface YoutubePlayer { playVideo():void;pauseVideo():void;destroy():void;getCurrentTime():number;getDuration():number; }
export interface YoutubeApi { Player:new(element:HTMLElement,options:{host?:string;videoId:string;width:string;height:string;playerVars:Record<string,number|string>;events:{onReady:()=>void;onError:()=>void;onStateChange:(event:{data:number})=>void}})=>YoutubePlayer; }
declare global { interface Window { onSpotifyIframeApiReady?: (api:SpotifyApi)=>void; onYouTubeIframeAPIReady?:()=>void; YT?:YoutubeApi; } }
let spotifyPromise:Promise<SpotifyApi>|null=null, youtubePromise:Promise<YoutubeApi>|null=null, spotifyApi:SpotifyApi|null=null;
function loadScript(src:string,onReady:(resolve:()=>void)=>void):Promise<void> {
 return new Promise((resolve,reject)=>{
  const script=document.createElement('script'); script.src=src; script.async=true;
  const timer=window.setTimeout(()=>{script.remove();reject(new Error('Embed API timed out'));},15000);
  script.onerror=()=>{clearTimeout(timer);script.remove();reject(new Error('Embed API unavailable'));};
  onReady(()=>{clearTimeout(timer);resolve();}); document.head.appendChild(script);
 });
}
export function loadSpotifyApi():Promise<SpotifyApi> {
 if(spotifyApi) return Promise.resolve(spotifyApi);
 if(!spotifyPromise) spotifyPromise=loadScript('https://open.spotify.com/embed/iframe-api/v1',resolve=>{
  window.onSpotifyIframeApiReady=api=>{spotifyApi=api;resolve();};
 }).then(()=>spotifyApi!).catch(error=>{spotifyPromise=null;throw error;});
 return spotifyPromise;
}
export function loadYoutubeApi():Promise<YoutubeApi> {
 if(window.YT?.Player) return Promise.resolve(window.YT);
 if(!youtubePromise) youtubePromise=loadScript('https://www.youtube.com/iframe_api',resolve=>{
  window.onYouTubeIframeAPIReady=()=>resolve();
 }).then(()=>window.YT!).catch(error=>{youtubePromise=null;throw error;});
 return youtubePromise;
}
