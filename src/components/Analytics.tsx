'use client';
import {useEffect,useRef} from 'react';
import {useMusic} from './music/MusicProvider';
import {linkEvent,track,type AnalyticsEvent} from '@/lib/analytics';
import type {Locale} from '@/types/content';
export function Analytics({locale}:{locale:Locale}){
 const {isPlaying,activeTrack,source}=useMusic();
 const previous=useRef(false);
 useEffect(()=>{if(isPlaying&&!previous.current)track('music_play',{id:activeTrack.id,source:source?.kind,locale});previous.current=isPlaying;},[isPlaying,activeTrack.id,source?.kind,locale]);
 useEffect(()=>{
  const click=(event:MouseEvent)=>{const element=(event.target as Element)?.closest<HTMLElement>('[data-analytics],a');if(!element)return;const name=element.dataset.analytics as AnalyticsEvent|undefined??linkEvent(element.getAttribute('href')??'');if(name)track(name,{id:element.dataset.id,locale});};
  document.addEventListener('click',click);return()=>document.removeEventListener('click',click);
 },[locale]);
 return null;
}
