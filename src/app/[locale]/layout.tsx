import '../globals.css';
import { InteractionSystem } from '@/components/interaction/InteractionSystem';
import '@/components/world/world.css';
import '@/components/home/home.css';
import '@/components/transmissions/transmissions.css';
import '@/components/world/closingScenes.css';
import '@/components/interaction/interaction.css';
import '@/components/channels/channels.css';
import '@/components/cinema/cinema.css';
import '@/components/world/diorama.css';
import '@/components/archive/darkroom.css';
import '@/components/connect/connect.css';
import '@/components/navigation/finale.css';
import { notFound } from 'next/navigation';
import { isLocale, locales } from '@/i18n/config';
import { dictionaries } from '@/i18n/dictionaries';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Analytics } from '@/components/Analytics';
import { Cursor } from '@/components/Cursor';
import { motion } from '@/lib/motion';
import type { CSSProperties } from 'react';
import { MusicProvider } from '@/components/music/MusicProvider';
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
 const { locale } = await params;
 if (!isLocale(locale)) notFound();
 return <html lang={locale} style={{'--menu-close':`${motion.menuClose}ms`,'--motion-snap':`${motion.snap}ms`,'--motion-glide':`${motion.glide}ms`,'--motion-impact':`${motion.impact}ms`,'--motion-cinematic':`${motion.cinematic}ms`,'--ease-snap':motion.snapEase,'--ease-cinematic':motion.cinematicEase,'--motion-micro':`${motion.micro}ms`,'--motion-interface':`${motion.interface}ms`,'--motion-editorial':`${motion.editorial}ms`,'--motion-page':`${motion.page}ms`,'--reveal-distance':`${motion.reveal}px`,'--hover-distance':`${motion.hover}px`,'--ease':motion.ease} as CSSProperties}><head><link rel="preload" href="/fonts/anton-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head><body><MusicProvider locale={locale}><Analytics locale={locale}/><Cursor locale={locale}/><InteractionSystem/><Navigation locale={locale} copy={dictionaries[locale]} />{children}<Footer locale={locale} copy={dictionaries[locale]} /></MusicProvider></body></html>;
}
