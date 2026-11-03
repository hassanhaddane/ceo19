import { ActionButton, ActionLink, type ActionButtonProps, type ActionLinkProps } from './ActionButton';
type Props = ({ href: string } & ActionLinkProps) | ({ href?: never } & ActionButtonProps);
export function MusicAction({ cursor = 'play', ...props }: Props) {
 return props.href !== undefined ? <ActionLink {...props as ActionLinkProps} family="music" cursor={cursor}/> : <ActionButton {...props as ActionButtonProps} family="music" cursor={cursor}/>;
}
