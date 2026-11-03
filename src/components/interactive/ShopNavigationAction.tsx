import { ActionLabel, ActionLink, ActionMark, type ActionLinkProps } from './ActionButton';

/** A separate printed destination, outside the artist scene index. */
export function ShopNavigationAction({ className = '', ...props }: Omit<ActionLinkProps, 'children'>) {
 return <ActionLink {...props} client family="shop" className={`shop-navigation-action ${className}`} aria-label="Shop" aria-haspopup="dialog">
  <span className="ceo-action-visual"><ActionLabel>SHOP</ActionLabel><ActionMark/></span>
 </ActionLink>;
}
