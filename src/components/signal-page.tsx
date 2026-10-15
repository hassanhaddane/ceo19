import type { Locale } from '@/types/content';
import { HomeExperience } from './editorial/HomeExperience';
import { WorldExperience } from './editorial/WorldExperience';
import { ConnectExperience } from './editorial/ConnectExperience';
import { SceneFlow } from './scenes/SceneFlow';
import { SceneTransitions } from './scenes/SceneTransitions';
import { MusicExperience } from './music/MusicExperience';
import { ArchiveExperience } from './media/ArchiveExperience';
export function SignalPage({ locale }: { locale: Locale }) {
 return <SceneFlow locale={locale}>
 <SceneTransitions />
 <HomeExperience locale={locale}/>
 <MusicExperience locale={locale} />
 <ArchiveExperience locale={locale}/>
 <WorldExperience locale={locale}/>
 <ConnectExperience locale={locale}/>
 </SceneFlow>;
}
