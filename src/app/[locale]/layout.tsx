import '../globals.css';
import '@/components/v3.css';
import '@/components/visuals/visuals.css';
import '@/components/scenes/scenes.css';
import '@/components/music/musicWorld.css';
import '@/components/cinema/cinema.css';
import '@/components/archive/spatialArchive.css';
import '@/components/world/worldArtwork.css';
import '@/components/connect/connectEditorial.css';
import { VisualExperience } from '@/components/visuals/VisualExperience';
import { notFound } from 'next/navigation';
import { isLocale, locales } from '@/i18n/config';
import { dictionaries } from '@/i18n/dictionaries';
import { Navigation } from '@/components/navigation';
import { Analytics } from '@/components/Analytics';
import { motion, v3Effects } from '@/lib/motion';
import type { CSSProperties } from 'react';
import { MusicProvider } from '@/components/music/MusicProvider';
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
 const { locale } = await params;
 if (!isLocale(locale)) notFound();
 return <html lang={locale} style={{'--v3-grain':v3Effects.grainOpacity,'--menu-close':`${motion.menuClose}ms`,'--motion-snap':`${motion.snap}ms`,'--motion-glide':`${motion.glide}ms`,'--motion-impact':`${motion.impact}ms`,'--motion-cinematic':`${motion.cinematic}ms`,'--ease-snap':motion.snapEase,'--ease-cinematic':motion.cinematicEase,'--motion-micro':`${motion.micro}ms`,'--motion-interface':`${motion.interface}ms`,'--motion-editorial':`${motion.editorial}ms`,'--motion-page':`${motion.page}ms`,'--reveal-distance':`${motion.reveal}px`,'--hover-distance':`${motion.hover}px`,'--ease':motion.ease} as CSSProperties}><head><link rel="preload" href="/fonts/anton-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head><body><VisualExperience locale={locale}><MusicProvider locale={locale}><Analytics locale={locale}/><Navigation locale={locale} copy={dictionaries[locale]} />{children}</MusicProvider></VisualExperience></body></html>;
}
