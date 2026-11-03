import type { Locale } from '@/types/content';
import { ActionButton, ActionLabel, type ActionButtonProps } from './ActionButton';

/** Compact, semantic sound choices. The logos own the entrance composition. */
export function AudioChoice({ mode, locale, className = '', ...props }: Omit<ActionButtonProps, 'children' | 'family'> & { mode: 'sound' | 'silent'; locale: Locale }) {
 const fr = locale === 'fr', sound = mode === 'sound';
 const text = fr ? sound ? 'ACTIVER LE SON' : 'SANS LE SON' : sound ? 'PLAY SOUND' : 'WITHOUT SOUND';
 return <ActionButton {...props} className={`audio-choice audio-choice--${mode} ${className}`} family="entry" cursor={sound ? 'play' : 'enter'} aria-label={text}>
  <span className="audio-choice-visual ceo-action-visual">
   <svg className="audio-choice-glyph" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    {sound ? <g className="audio-choice-wave"><path d="M3 8v4"/><path d="M7.5 4v12"/><path d="M12 6v8"/><path d="M16.5 8v4"/></g> : <><path d="M3 10h4m6 0h4"/><path className="audio-choice-slash" d="m7 5 6 10"/></>}
   </svg>
   <span className="audio-choice-type"><ActionLabel>{text}</ActionLabel></span>
  </span>
 </ActionButton>;
}
