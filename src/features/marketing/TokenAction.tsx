'use client';
import { useState } from 'react';
import { ShopAction } from '@/components/interactive/ShopAction';
import { marketingCopy } from '@/data/marketing';
import type { Locale } from '@/types/content';
export function TokenAction({ locale, token, kind }: { locale: Locale; token: string; kind: 'confirm' | 'unsubscribe' }) {
 const copy = marketingCopy[locale];
 const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
 async function act() {
  if (state === 'busy') return;
  setState('busy');
  try {
   const response = await fetch(`/api/marketing/${kind}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
   const result = await response.json();
   if (!response.ok || result[kind === 'confirm' ? 'confirmed' : 'unsubscribed'] !== true) throw new Error('not_processed');
   setState('done'); window.history.replaceState(null, '', window.location.pathname);
  } catch { setState('error'); }
 }
 return <div className="marketing-token-action">{state === 'done' ? <p role="status">{kind === 'confirm' ? copy.confirmed : copy.unsubscribed}</p> : <><ShopAction type="button" className="epk-button" disabled={state === 'busy' || !token} onClick={act}>{state === 'busy' ? copy.sending : kind === 'confirm' ? copy.confirmAction : copy.unsubscribeAction}</ShopAction>{(state === 'error' || !token) && <p role="alert">{kind === 'confirm' ? copy.confirmError : copy.unsubscribeError}</p>}</>}</div>;
}
