'use client';
import {useSyncExternalStore} from 'react';
const subscribe=()=>()=>{};
const getLocale=()=>window.location.pathname.startsWith('/fr/')?'fr':'en';
const getServerLocale=()=>'en' as const;
import {closingCopy} from '@/data/closingScenes';
import Link from 'next/link';
import Image from 'next/image';
import {Architecture} from '../world/Architecture';
import {LogoMark} from '../primitives';
export function NoSignal(){const locale=useSyncExternalStore(subscribe,getLocale,getServerLocale),copy=closingCopy[locale];return <main className="no-signal"><Link href={`/${locale}`} aria-label="CEO 1.9 — Home"><LogoMark/></Link><div className="no-signal-material" aria-hidden="true"><Image src="/images/architecture/passage.webp" alt="" fill sizes="65vw" loading="eager"/></div><Architecture variant="labyrinth"/><h1>NO SIGNAL</h1><span className="no-signal-number" aria-hidden="true">404</span><div className="no-signal-return"><p>PAS DE RESEAU</p><Link href={`/${locale}`}>{copy.returnHome}<svg width="24" height="12" viewBox="0 0 24 12" fill="none" aria-hidden="true"><path d="M1 6h21m-5-5 5 5-5 5" stroke="currentColor"/></svg></Link></div><p className="metadata">{locale==='fr'?'FÈS / MAROC / 019':'FEZ / MOROCCO / 019'}</p><span className="sr-only">{copy.missing}</span></main>;}
