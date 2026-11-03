import type { Locale } from '@/types/content';
import { HomeExperience } from './editorial/HomeExperience';
import { Footer } from './footer';
import { dictionaries } from '@/i18n/dictionaries';
import { SceneFlow } from './scenes/SceneFlow';
import { SectionTransition } from './scenes/SceneTransitions';
import { MusicExperience } from './music/MusicExperience';
import { ArchiveExperience } from './media/ArchiveExperience';
export function SignalPage({ locale }: { locale: Locale }) {
 return <SceneFlow locale={locale}>
 <SectionTransition />
 <HomeExperience locale={locale}/>
 <MusicExperience locale={locale} />
 <ArchiveExperience locale={locale}/>
 <Footer locale={locale} copy={dictionaries[locale]}/>
 </SceneFlow>;
}
