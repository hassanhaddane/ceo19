import type { Locale } from '@/types/content';
import { Gallery } from '../gallery';
import { SignalSlot } from '../signal/SignalSlot';
import { Architecture,Punchline } from '../world/Architecture';
import { nightCopy,punchlines } from '@/data/nightWorld';
export function ArchiveExperience({locale}:{locale:Locale}) {return <section id="archive" className="night-scene scene-archive" data-world="street-print" aria-labelledby="archive-title"><Architecture/><Punchline>{punchlines.archive}</Punchline><div className="scene-content archive-wall-heading"><h2 id="archive-title">ARCHIVE <span>1.9</span></h2><span className="metadata">{nightCopy[locale].archive}</span></div><div className="scene-content archive-wall"><Gallery locale={locale}/></div><SignalSlot section="archive"/></section>;}
