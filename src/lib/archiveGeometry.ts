/** Pixels per second at the preferred pace. The rendered cycle is constrained to
 * 40–70 seconds rather than speeding up small screens or crawling on large ones. */
export const AUTO_SCROLL_SPEED = 90;
export const ARCHIVE_IDLE_DELAY = 2800;
export const wrapArchive = (value:number,length:number) => length > 0 ? ((value%length)+length)%length : 0;
export const archiveCycleSpeed = (length:number) => length/Math.max(40,Math.min(70,length/AUTO_SCROLL_SPEED));
export const archiveLoopX = (center:number,camera:number,length:number,buffer:number) => wrapArchive(center-camera+buffer,length)-buffer;
export const shortestArchiveDistance = (from:number,to:number,length:number) => wrapArchive(to-from+length/2,length)-length/2;
interface Print { aspectRatio:number; heightScale:number; slot:number; shift:number; y:number; }
export function createArchiveLayout(photos:readonly Print[],width:number,height:number,compact:boolean) {
 const prints=photos.map(photo=>{
  const h=Math.min(height*(compact?.9:1),height*photo.heightScale*(compact?1.5:1),width*(compact?.82:.47)/photo.aspectRatio);
  return {width:h*photo.aspectRatio,height:h,center:0,y:photo.y*height*(compact?.36:1)};
 });
 const gap=compact?32:Math.max(30,Math.min(64,width*.035));
 let cursor=0;
 const slots=[...new Set(photos.map((photo,index)=>compact?index:photo.slot))].sort((a,b)=>a-b);
 for(const slot of slots){
  const members=prints.map((print,index)=>({print,index})).filter(({index})=>(compact?index:photos[index].slot)===slot);
  const extent=Math.max(...members.map(({print,index})=>print.width+Math.abs(compact?0:photos[index].shift*print.width)*2));
  for(const {print,index} of members)print.center=cursor+extent/2+(compact?0:photos[index].shift*print.width);
  cursor+=extent+gap;
 }
 return {prints,length:cursor,buffer:Math.max(...prints.map(print=>print.width))+100};
}
