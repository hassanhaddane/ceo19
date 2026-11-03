import type { Locale } from '@/types/content';
export function IntroFallback({ locale }: { locale: Locale }) {
 return <p className="intro-fallback" role="status">{locale === 'fr' ? 'Chargement des visuels' : 'Loading visuals'}<span aria-hidden="true">…</span></p>;
}
