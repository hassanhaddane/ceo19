import { ActionButton, ActionLabel, ActionLink, ActionMark, type ActionButtonProps, type ActionLinkProps } from './ActionButton';
type Props = ({ href: string } & ActionLinkProps) | ({ href?: never } & ActionButtonProps);
export function ShopAction({ children, ...props }: Props) {
 const content = <><span className="ceo-action-visual"><ActionLabel>{children}</ActionLabel><ActionMark/></span></>;
 return props.href !== undefined ? <ActionLink {...props as ActionLinkProps} family="shop">{content}</ActionLink> : <ActionButton {...props as ActionButtonProps} family="shop">{content}</ActionButton>;
}
