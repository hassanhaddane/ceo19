import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { marketingCopy } from '@/data/marketing';
import { MarketingPage, marketingMetadata } from '@/features/marketing/MarketingPage';
import { TokenAction } from '@/features/marketing/TokenAction';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; return isLocale(locale) ? marketingMetadata(locale, '/shop/unsubscribe', 'CEO1.9 — Unsubscribe') : {}; }
export default async function UnsubscribePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string | string[] }> }) {
 const { locale } = await params; if (!isLocale(locale)) notFound(); const { token } = await searchParams;
 return <MarketingPage locale={locale} title={marketingCopy[locale].unsubscribeTitle}><p>{marketingCopy[locale].unsubscribeIntro}</p><TokenAction locale={locale} kind="unsubscribe" token={typeof token === 'string' && token.length <= 180 ? token : ''}/></MarketingPage>;
}
