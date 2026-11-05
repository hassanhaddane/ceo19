'use client';
import { ActionButton, ActionLabel } from '@/components/interactive/ActionButton';
import { UtilityButton } from '@/components/interactive/UtilityAction';
import type { Locale } from '@/types/content';
import type { ProductPresentation } from './types';
import { ProductFallback } from './ProductFallback';
export interface ProductNavigationItem { id: string; name: string; selectorLabel: string; presentation: ProductPresentation; }

export function ProductNavigation({ products, selected, locale, onSelect, onStep }: {
 products: readonly ProductNavigationItem[]; selected: number; locale: Locale; onSelect: (index: number) => void; onStep: (direction: number) => void;
}) {
 return <nav className="drop-product-navigation" aria-label={locale === 'fr' ? 'Concepts de produits' : 'Product concepts'}>
  <UtilityButton className="drop-step" onClick={() => onStep(-1)} aria-label={locale === 'fr' ? 'Concept précédent' : 'Previous concept'}><span aria-hidden="true" className="drop-step-mark"/><ActionLabel>{locale === 'fr' ? 'PRÉCÉDENT' : 'PREVIOUS'}</ActionLabel></UtilityButton>
  <div className="drop-selector">{products.map((product, index) => <ActionButton key={product.id} family="navigation" className="drop-product-choice" aria-label={product.name} aria-current={selected === index ? 'true' : undefined} onClick={() => onSelect(index)}><span className="drop-choice-preview" aria-hidden="true"><ProductFallback product={product.presentation} back={false} spread={false}/></span><span className="drop-choice-caption"><span className="drop-choice-number">0{index + 1}</span><span>{product.selectorLabel}</span></span></ActionButton>)}</div>
  <UtilityButton className="drop-step drop-step-next" onClick={() => onStep(1)} aria-label={locale === 'fr' ? 'Concept suivant' : 'Next concept'}><ActionLabel>{locale === 'fr' ? 'SUIVANT' : 'NEXT'}</ActionLabel><span aria-hidden="true" className="drop-step-mark"/></UtilityButton>
 </nav>;
}
