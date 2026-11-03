import type { Metadata } from 'next';
import { ExperiencePage } from '@/components/ExperiencePage';
import { pageMetadata } from '@/lib/seo';
import type { Locale } from '@/types/content';
import type { ReactNode } from 'react';
import './marketing.css';
export function marketingMetadata(locale: Locale, path: string, title: string): Metadata {
 const base = pageMetadata(locale, path);
 return { ...base, title, description: locale === 'fr' ? 'Vos choix et les données de la drop list CEO1.9.' : 'Your choices and data in the CEO1.9 drop list.', robots: { index: false, follow: false }, referrer: 'no-referrer', openGraph: { ...base.openGraph, title }, twitter: { ...base.twitter, title } };
}
export function MarketingPage({ locale, title, children }: { locale: Locale; title: string; children: ReactNode }) {
 return <ExperiencePage locale={locale} className="marketing-page"><p className="metadata">CEO1.9 / SHOP</p><h1>{title}</h1>{children}</ExperiencePage>;
}
