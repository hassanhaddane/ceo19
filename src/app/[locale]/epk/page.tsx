import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { pageMetadata } from '@/lib/seo';
import { EpkExperience } from '@/features/epk/EpkExperience';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
 const { locale } = await params;
 return isLocale(locale) ? pageMetadata(locale, '/epk') : {};
}
export default async function EpkPage({ params }: { params: Promise<{ locale: string }> }) {
 const { locale } = await params;
 if (!isLocale(locale)) notFound();
 return <EpkExperience locale={locale}/>;
}
