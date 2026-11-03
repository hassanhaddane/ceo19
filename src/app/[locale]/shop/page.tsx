import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { pageMetadata } from '@/lib/seo';
import { ShopExperience } from '@/features/shop/ShopExperience';
import { SHOP_MODE } from '@/lib/commerce/provider';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
 const { locale } = await params;
 if (!isLocale(locale)) return {};
 const metadata = pageMetadata(locale, '/shop');
 if (SHOP_MODE === 'demo') return metadata;
 const title = 'CEO1.9 — Shop';
 const description = locale === 'fr' ? 'La boutique CEO1.9 sera disponible prochainement.' : 'The CEO1.9 store will be available soon.';
 return { ...metadata, title, description, openGraph: { ...metadata.openGraph, title, description }, twitter: { ...metadata.twitter, title, description } };
}
export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
 const { locale } = await params;
 if (!isLocale(locale)) notFound();
 return <ShopExperience locale={locale}/>;
}
