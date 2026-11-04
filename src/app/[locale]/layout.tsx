import '../globals.css';
import '@/components/v3.css';
import '@/components/visuals/visuals.css';
import '@/components/scenes/scenes.css';
import '@/components/music/musicWorld.css';
import '@/components/cinema/cinema.css';
import '@/components/archive/spatialArchive.css';
import '@/components/v4.css';
import '@/components/editorial/home.css';
import '@/components/site-shell.css';
import '@/components/intro/intro.css';
import '@/components/interactive/interactive.css';
import '@/components/navigation/navigation.css';
import { MagneticSurface } from '@/components/interactive/MagneticSurface';
import { interactionTokens } from '@/components/interactive/motion';
import { VisualExperience } from '@/components/visuals/VisualExperience';
import { notFound } from 'next/navigation';
import { isLocale, locales } from '@/i18n/config';
import { dictionaries } from '@/i18n/dictionaries';
import { FloatingNavigation } from '@/components/navigation';
import { Analytics } from '@/components/Analytics';
import { motion } from '@/lib/motion';
import { motionPreferenceBootstrap } from '@/lib/motionPreference';
import type { CSSProperties } from 'react';
import { SoundProvider } from '@/features/audio/SoundProvider';
import { MusicProvider } from '@/components/music/MusicProvider';
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
 const { locale } = await params;
 if (!isLocale(locale)) notFound();
 return <html suppressHydrationWarning lang={locale} data-scroll-behavior="smooth" style={{...interactionTokens,'--menu-close':`${motion.menuClose}ms`,'--motion-snap':`${motion.snap}ms`,'--motion-glide':`${motion.glide}ms`,'--motion-impact':`${motion.impact}ms`,'--motion-cinematic':`${motion.cinematic}ms`,'--ease-snap':motion.snapEase,'--ease-cinematic':motion.cinematicEase,'--motion-micro':`${motion.micro}ms`,'--motion-interface':`${motion.interface}ms`,'--motion-editorial':`${motion.editorial}ms`,'--motion-page':`${motion.page}ms`,'--reveal-distance':`${motion.reveal}px`,'--hover-distance':`${motion.hover}px`,'--ease':motion.ease} as CSSProperties}><head><script id="ceo19-motion-preference" dangerouslySetInnerHTML={{ __html: motionPreferenceBootstrap }}/><link rel="preload" href="/fonts/barlow-condensed-latin-800-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head><body><SoundProvider><MagneticSurface locale={locale}/><VisualExperience locale={locale}><MusicProvider locale={locale}><Analytics locale={locale}/><FloatingNavigation locale={locale} copy={dictionaries[locale]} />{children}</MusicProvider></VisualExperience></SoundProvider></body></html>;
}
