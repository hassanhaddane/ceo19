'use client';
import { useSyncExternalStore } from 'react';
import { closingCopy } from '@/data/closingScenes';
import { NavigationAction } from '../interactive/NavigationAction';
import { LogoMark } from '../primitives';
const subscribe = () => () => {};
const getLocale = () => window.location.pathname.startsWith('/fr') ? 'fr' : 'en';
const getServerLocale = () => 'en' as const;
export function NoSignal() {
 const locale = useSyncExternalStore(subscribe, getLocale, getServerLocale), copy = closingCopy[locale];
 return <main className="no-signal"><NavigationAction client href={`/${locale}`} aria-label="CEO1.9 — Home"><LogoMark /></NavigationAction><h1>404</h1><p>{copy.missing}</p><div className="no-signal-return"><NavigationAction client href={`/${locale}`}>{copy.returnHome}</NavigationAction></div></main>;
}
