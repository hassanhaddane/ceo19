import { notFound, permanentRedirect } from 'next/navigation';
import { isLocale } from '@/i18n/config';

export default async function ContactAlias({ params }: { params: Promise<{ locale: string }> }) {
 const { locale } = await params;
 if (!isLocale(locale)) notFound();
 permanentRedirect(`/${locale}#connect`);
}
