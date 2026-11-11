'use client';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRef, useState, type CSSProperties } from 'react';
import { archiveWorld, archiveCopy } from '@/data/archiveWorld';
import { useSpatialArchive } from './archive/useSpatialArchive';
import { visualEffects } from '@/lib/visualEffects';
import { ArchiveDocumentary } from './archive/ArchiveDocumentary';
import { useSceneState } from '@/lib/sceneNavigation';
import type { Locale } from '@/types/content';
import type { PhotoOrigin } from './archive/DarkroomViewer';
import { UtilityButton, UtilityGlyph } from './interactive/UtilityAction';
import { useEntryExperience } from './visuals/VisualExperience';
const DarkroomViewer=dynamic(()=>import('./archive/DarkroomViewer').then(module=>module.DarkroomViewer),{ssr:false});

export function PhotoStage({locale}:{locale:Locale}) {
 const stage=useRef<HTMLDivElement>(null),opener=useRef<HTMLElement|null>(null),lastFlash=useRef(-Infinity);
 const [selected,setSelected]=useState<number|null>(null),[origin,setOrigin]=useState<PhotoOrigin|null>(null);
 const [paused,setPaused]=useState(false),[exposure,setExposure]=useState(true),[flash,setFlash]=useState(false);
 const [sheet,setSheet]=useState(false);
 const scene=useSceneState();
 const entered=useEntryExperience()?.entered??true;
 const {active,compact,motion,nearby,focused,select,step,clickCapture,keyboard}=useSpatialArchive(stage,{paused,blocked:sheet||!entered||selected!==null||scene.menuOpen||scene.active!=='archive'});
 const copy=archiveCopy[locale],current=archiveWorld[active],fr=locale==='fr';
 const handleOpen=(index:number,button:HTMLButtonElement,now:number)=>{
  opener.current=button;const rect=button.getBoundingClientRect();
  setOrigin({left:rect.left,top:rect.top,width:rect.width,height:rect.height});
  const allowed=motion&&exposure&&now-lastFlash.current>visualEffects.archive.flashCooldown;
  setFlash(allowed);if(allowed)lastFlash.current=now;setSelected(index);
 };
 return <><ArchiveDocumentary paused={selected!==null||paused||focused}/><div className="spatial-archive" data-viewer-open={selected!==null} data-motion={motion} data-sensitive={!exposure||!motion} data-paused={paused} data-layout={sheet?'sheet':'room'}>
  {sheet && <div className="archive-contact-sheet" aria-label={fr?'Planche-contact':'Contact sheet'}>
   {archiveWorld.map((photo,index)=><button key={photo.id} type="button" aria-haspopup="dialog"
    className="archive-sheet-print" aria-label={`${copy.view}: ${photo.alt[locale]}`}
    onClick={event=>handleOpen(index,event.currentTarget,event.timeStamp)}>
    <Image src={photo.asset.path} alt="" fill sizes="(max-width:767px) 45vw, 24vw" />
    <span className="metadata">{String(index+1).padStart(2,'0')}</span>
   </button>)}
  </div>}
  <div className="spatial-stage" ref={stage} hidden={sheet} role="region" tabIndex={0} aria-label={copy.room} aria-describedby="archive-help" data-cursor="drag" data-scene-interaction="archive" onKeyDown={event=>{
   if((event.key==='Enter'||event.key===' ')&&event.target===event.currentTarget){
    event.preventDefault();
    const button=event.currentTarget.querySelector<HTMLButtonElement>('[data-active="true"] .spatial-photo-button');
    if(button)handleOpen(active,button,event.timeStamp);
   }else keyboard(event);
  }} onClickCapture={clickCapture}>
   {archiveWorld.map((photo,index)=><figure key={photo.id} className="spatial-photo" data-photo-plane={index} data-active={index===active} style={{'--photo-ratio':photo.aspectRatio} as CSSProperties}>
    <button type="button" data-photo-id={photo.id} data-ceo-action="utility" data-ceo-motion="cutout" data-view-label={locale==='fr'?'VOIR ↗':'VIEW ↗'} className="spatial-photo-button" data-cursor="view" aria-label={`${copy.view}: ${photo.alt[locale]}`} aria-haspopup="dialog" tabIndex={-1} onClick={event=>handleOpen(index,event.currentTarget,event.timeStamp)}>
     {nearby.includes(index)&&<Image src={photo.asset.path} alt={photo.alt[locale]} fill sizes={compact?'82vw':`(max-width:1200px) ${Math.round(photo.heightScale*photo.aspectRatio*53)}vw, ${Math.round(photo.heightScale*photo.aspectRatio*65)}svh`} loading="lazy" draggable={false} style={{objectFit:'contain'}}/>}
    </button>
   </figure>)}
  </div>
  <footer className="spatial-controls">
   <div className="spatial-caption" aria-live={paused||focused?'polite':'off'} aria-atomic="true"><span className="metadata">{String(active+1).padStart(2,'0')} / {String(archiveWorld.length).padStart(2,'0')}</span><span className="sr-only">{current.alt[locale]}</span></div>
   <div className="spatial-navigation" hidden={sheet}><UtilityButton aria-label={copy.previous} onClick={()=>step(-1)}><UtilityGlyph kind="previous"/></UtilityButton><span className="metadata">{compact?copy.touch:copy.hint}</span><UtilityButton aria-label={copy.next} onClick={()=>step(1)}><UtilityGlyph kind="next"/></UtilityButton></div>
   <div className="spatial-settings">
    <UtilityButton className="spatial-sheet-toggle metadata" aria-pressed={sheet} onClick={()=>setSheet(value=>!value)}>{fr?'Planche-contact':'Contact sheet'}</UtilityButton>
    <UtilityButton className="spatial-motion metadata" aria-label={!motion?copy.reduced:paused?copy.play:copy.pause} aria-pressed={paused} disabled={!motion} onClick={()=>setPaused(value=>!value)}><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">{paused||!motion?<path d="m6 3 10 7-10 7Z" fill="currentColor"/>:<path d="M7 3v14M13 3v14" fill="none" stroke="currentColor" strokeWidth="1.6"/>}</svg><span>{!motion?copy.reduced:paused?copy.play:copy.pause}</span></UtilityButton>
    <UtilityButton className="spatial-exposure metadata" aria-pressed={exposure&&motion} disabled={!motion} onClick={()=>setExposure(value=>!value)}>{copy.exposure}<span>{exposure&&motion?copy.on:copy.off}</span></UtilityButton>
   </div>
   <div className="spatial-progress" aria-hidden="true"><i/></div>
  </footer>
  <p id="archive-help" className="sr-only">{copy.help}</p>
  {selected!==null&&<DarkroomViewer locale={locale} index={selected} origin={origin} flash={flash} sensitivity={!exposure} opener={opener} onClose={()=>{select(selected);setSelected(null);}} onMove={setSelected}/>}
 </div></>;
}
export {PhotoStage as Gallery};
