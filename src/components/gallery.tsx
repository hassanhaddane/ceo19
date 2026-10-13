'use client';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { closingCopy } from '@/data/closingScenes';
import { nightCopy } from '@/data/nightWorld';
import { gallery } from '@/data/gallery';
import type { Locale } from '@/types/content';
import { Arrow, Metadata } from './primitives';
import { useArchiveRail } from './archive/useArchiveRail';
import { mediaCopy } from './media/mediaCopy';
import { gallerySource, nextIndex, visualMetadata } from './media/archiveMath';
import { DarkroomViewer,type PhotoOrigin } from './archive/DarkroomViewer';
export function Gallery({locale}: {locale:Locale}) {
 const copy=mediaCopy[locale];
 const rail=useRef<HTMLDivElement>(null);
 const {page,keyboard,clickCapture,reset}=useArchiveRail(rail);
 const [category,setCategory]=useState('all');
 const [memory,setMemory]=useState(gallery[0]?.id);
 const [selected,setSelected]=useState<number|null>(null);
 const filtered=gallery.filter(item=>category==='all'||item.category===category);
 const openerRef=useRef<HTMLElement|null>(null);
 const [origin,setOrigin]=useState<PhotoOrigin|null>(null);
 const current=selected===null?null:filtered[selected];
 const categories=[...new Set(gallery.map(item=>item.category))];
 const move=(direction:number)=>{if(selected===null)return;const next=nextIndex(selected,direction,filtered.length);setMemory(filtered[next]?.id);setSelected(next);};
 return <>
 <div className="archive-wall-tools"><div className="editorial-archive-filter" role="group" aria-label={copy.archiveIndex}>{['all',...categories].map(key=><button type="button" key={key} data-interaction="silent" aria-pressed={category===key} onClick={()=>{setCategory(key);reset();}}>{key==='all'?copy.all:copy.categories[key as keyof typeof copy.categories]}</button>)}</div><div className="archive-rail-controls"><button type="button" aria-label={nightCopy[locale].previous} onClick={()=>page(-1)}><span className="previous-arrow"><Arrow/></span></button><button type="button" aria-label={nightCopy[locale].next} onClick={()=>page(1)}><Arrow/></button></div></div>
 <div ref={rail} className="editorial-archive" data-cursor="drag" role="region" tabIndex={0} aria-label={copy.archiveIndex} onKeyDown={keyboard} onClickCapture={clickCapture}>{filtered.map((item,index)=>{
  const source=gallerySource(item);
  const caption=item.caption?.[locale]??item.alt[locale];
  const number=String(gallery.indexOf(item)+1).padStart(3,'0');
  return <figure key={item.id} id={`archive-${item.id}`} className="archive-item" data-memory={memory===item.id} data-layout={item.layout??'square'} data-mobile={item.mobile??(index%3===1?'inset':'full')} data-paper={item.paper??false}>
   <div className="archive-print-label"><span className="archive-sequence-number" aria-hidden="true">{number}</span><span className="archive-registration" aria-hidden="true">+</span></div>
   <button type="button" className="archive-image-surface" data-interaction="silent" data-cursor="view" data-analytics="archive_open" data-id={item.id} aria-label={`${copy.viewImage}: ${caption}`} aria-haspopup="dialog" onClick={event=>{openerRef.current=event.currentTarget;const rect=event.currentTarget.getBoundingClientRect();setOrigin({left:rect.left,top:rect.top,width:rect.width,height:rect.height});setMemory(item.id);setSelected(index);}}>
    {source?<Image src={source} alt={item.alt[locale]} fill sizes="(max-width:767px) 72vw, 28vw" draggable={false} style={{objectPosition:item.crop??'50% 50%'}} loading="lazy"/>:<span className="archive-instagram-placeholder"><span>IG</span><Metadata>{copy.instagram} ↗</Metadata></span>}
    <span className="archive-expand-mark" aria-hidden="true"><Arrow diagonal/></span>
   </button>
   <figcaption><div><Metadata>{number} / {caption}</Metadata><div className="archive-item-metadata">{visualMetadata(item.metadata).map(value=><Metadata key={value}>{value}</Metadata>)}</div></div>{item.type==='instagram'&&<a href={item.postUrl} target="_blank" rel="noopener noreferrer" className="archive-instagram-link">{copy.instagram} ↗</a>}</figcaption>
  </figure>;
 })}</div>
 <div className="archive-contact-footer metadata"><span>{closingCopy[locale].archiveExplore}</span><span>{String(filtered.length).padStart(3,'0')} / CEO 1.9</span></div>
 <DarkroomViewer locale={locale} item={current??null} index={selected??0} count={filtered.length} origin={origin} opener={openerRef} onClose={()=>setSelected(null)} onMove={move}/>
 </>;
}
