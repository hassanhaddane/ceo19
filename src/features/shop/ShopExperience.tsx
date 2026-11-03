import { ExperiencePage } from '@/components/ExperiencePage';
import { commerceState } from '@/lib/commerce/provider';
import { DropListContent } from '@/features/marketing/DropListContent';
import type { Locale } from '@/types/content';
import { ShopEarlyAccess } from './ShopEarlyAccess';
import { DropLab } from './DropLab';
import './shop.css';

/** The live branch cannot inherit demo merchandise or a demonstration purchase target. */
export function ShopExperience({ locale }: { locale: Locale }) {
 return <ExperiencePage locale={locale} className="shop-page shop-drop-lab">
  <div data-shop-mode={commerceState.mode}>
   {commerceState.mode === 'demo' ? <DropLab locale={locale} earlyAccess={<ShopEarlyAccess locale={locale}><DropListContent locale={locale}/></ShopEarlyAccess>}/> :
    <section className="shop-unavailable" data-commerce-status="unavailable"><p>CEO1.9 SHOP</p><h1>{locale === 'fr' ? 'Bientôt.' : 'Coming soon.'}</h1><p>{locale === 'fr' ? 'La boutique sera disponible prochainement.' : 'The store will be available soon.'}</p></section>}
  </div>
 </ExperiencePage>;
}
