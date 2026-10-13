import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { pageMetadata,artistSchema } from '@/lib/seo';
import { SignalPage } from '@/components/signal-page';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
 const { locale } = await params;
 if (!isLocale(locale)) return {};
 return pageMetadata(locale);
}
export default async function ArtistPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(artistSchema(locale)).replace(/</g,'\\u003c')}}/><SignalPage locale={locale}/></>; }
