import type { Locale } from '@/types/content';
import { sceneCopy } from '@/data/artist';
import { PhotoStage } from '../gallery';

export function ArchiveExperience({ locale }: { locale: Locale }) {
 const copy = sceneCopy[locale];
 return <section tabIndex={-1} id="archive" className="v3-scene scene-archive" aria-labelledby="archive-title" data-scene-number="03"><header className="scene-heading"><h2 id="archive-title">{copy.archive}</h2></header><PhotoStage locale={locale} /></section>;
}
