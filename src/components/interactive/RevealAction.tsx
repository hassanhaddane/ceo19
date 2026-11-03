import { ActionLink, ActionLabel, ActionMark, type ActionLinkProps } from './ActionButton';
/** Editorial resources use the same print cut, at a quieter scale than Shop. */
export function RevealAction({ children, className = '', ...props }: ActionLinkProps) {
 return <ActionLink {...props} family="music" cursor="view" className={`ceo-reveal-action ${className}`}><ActionLabel>{children}</ActionLabel><ActionMark/></ActionLink>;
}
