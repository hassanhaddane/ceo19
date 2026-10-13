import type { GalleryItem, VisualMetadata } from '@/types/content';
const rhythm=[{column:1,span:6,offset:0},{column:8,span:5,offset:140},{column:2,span:4,offset:0},{column:7,span:5,offset:100}];
export function archivePlacement(item:GalleryItem,index:number) {
 const value=item.placement??rhythm[index%rhythm.length];
 const span=Math.max(1,Math.min(12,Math.round(value.span)));
 return {column:Math.max(1,Math.min(13-span,Math.round(value.column))),span,offset:Math.max(0,value.offset??0)};
}
export function gallerySource(item:GalleryItem):string|null {return item.type==='image'?item.src:item.fallbackImage;}
export function visualMetadata(metadata:VisualMetadata|null|undefined):string[] {
 return metadata?[metadata.reference,metadata.location,metadata.year==null?null:String(metadata.year),metadata.format].filter((value):value is string=>typeof value==='string'&&value.length>0):[];
}
export function nextIndex(index:number,direction:number,length:number){return length>0?((index+direction)%length+length)%length:0;}
