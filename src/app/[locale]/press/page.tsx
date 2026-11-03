import { notFound, permanentRedirect } from 'next/navigation';
import { isLocale } from '@/i18n/config';

/** Permanent locale-preserving alias for the former professional route. */
export default async function Press({ params }: { params: Promise<{ locale: string }> }) {
 const { locale } = await params;
 if (!isLocale(locale)) notFound();
 permanentRedirect(`/${locale}/epk`);
}
