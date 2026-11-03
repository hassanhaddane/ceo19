import { ActionButton, ActionLink, type ActionButtonProps, type ActionLinkProps } from './ActionButton';
export function UtilityButton(props: ActionButtonProps) { return <ActionButton {...props} family="utility"/>; }
export function UtilityLink(props: ActionLinkProps) { return <ActionLink {...props} family="utility"/>; }
export function UtilityGlyph({ kind }: { kind: 'next' | 'previous' | 'close' | 'expand' | 'minimize' }) {
 const path = kind === 'close' ? 'm5 5 14 14M19 5 5 19' : kind === 'expand' ? 'M12 4v16M4 12h16' : kind === 'minimize' ? 'M4 12h16' : 'M18 4v16M5 5l9 7-9 7V5Z';
 return <svg className="ceo-utility-glyph" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" style={kind === 'previous' ? { rotate: '180deg' } : undefined}><path d={path}/></svg>;
}
