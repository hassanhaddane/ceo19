import type { Locale } from '@/types/content';
import { sceneCopy } from '@/data/artist';
import { Gallery } from '../gallery';

export function ArchiveExperience({ locale }: { locale: Locale }) {
 const copy = sceneCopy[locale];
 return <section tabIndex={-1} id="archive" className="v3-scene scene-archive" aria-labelledby="archive-title"><header className="scene-heading"><h2 id="archive-title">{copy.archive}</h2><span className="metadata">{copy.archiveNote}</span></header><Gallery locale={locale} /></section>;
}
