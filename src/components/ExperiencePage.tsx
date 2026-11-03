import { NavigationAction } from './interactive/NavigationAction';
import { ActionLabel, ActionMark } from './interactive/ActionButton';
import type { ReactNode } from 'react';
import type { Locale } from '@/types/content';
import { dictionaries } from '@/i18n/dictionaries';
import { Footer } from './footer';

/** Server-rendered shell; detailed content never enters the public page tree. */
export function ExperiencePage({ locale, className, children }: { locale: Locale; className: string; children: ReactNode }) {
 return <><main id="main" tabIndex={-1} className={`experience-page ${className}`}>{children}<NavigationAction client className="experience-return" href={`/${locale}#home`}><ActionLabel>{dictionaries[locale].back}</ActionLabel><ActionMark/></NavigationAction></main><Footer locale={locale} copy={dictionaries[locale]}/></>;
}
