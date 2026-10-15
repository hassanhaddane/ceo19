'use client';
import { useSyncExternalStore } from 'react';
import { closingCopy } from '@/data/closingScenes';
import Link from 'next/link';
import { LogoMark } from '../primitives';
const subscribe = () => () => {};
const getLocale = () => window.location.pathname.startsWith('/fr') ? 'fr' : 'en';
const getServerLocale = () => 'en' as const;
export function NoSignal() {
 const locale = useSyncExternalStore(subscribe, getLocale, getServerLocale), copy = closingCopy[locale];
 return <main className="no-signal"><Link href={`/${locale}`} aria-label="CEO1.9 — Home"><LogoMark /></Link><h1>404</h1><p>{copy.missing}</p><div className="no-signal-return"><Link href={`/${locale}`}>{copy.returnHome}</Link></div></main>;
}
