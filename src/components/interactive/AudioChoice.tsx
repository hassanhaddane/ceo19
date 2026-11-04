import type { Locale } from '@/types/content';
import { ActionButton, type ActionButtonProps } from './ActionButton';

/** Compact, semantic sound choices. The logos own the entrance composition. */
export function AudioChoice({ mode, locale, className = '', ...props }: Omit<ActionButtonProps, 'children' | 'family'> & { mode: 'sound' | 'silent'; locale: Locale }) {
 const fr = locale === 'fr', sound = mode === 'sound';
 const text = fr ? sound ? 'ACTIVER LE SON' : 'SANS LE SON' : sound ? 'PLAY SOUND' : 'WITHOUT SOUND';
 return <ActionButton {...props} className={`audio-choice audio-choice--${mode} ${className}`} family="entry" cursor={sound ? 'play' : 'enter'} aria-label={text}>
  <span className="audio-choice-visual ceo-action-visual">
   <span className="audio-choice-type"><span className="audio-choice-label"><span>{text}</span><span aria-hidden="true">{text}</span></span></span>
  </span>
 </ActionButton>;
}
