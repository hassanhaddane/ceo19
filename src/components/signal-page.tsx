import type { Locale } from '@/types/content';
import { HomeExperience } from './editorial/HomeExperience';
import { Footer } from './footer';
import { dictionaries } from '@/i18n/dictionaries';
import { SceneFlow } from './scenes/SceneFlow';
import { ArtistLogo } from './design/ArtistLogo';
import { MusicExperience } from './music/MusicExperience';
import { ArchiveExperience } from './media/ArchiveExperience';
export function SignalPage({ locale }: { locale: Locale }) {
 return <SceneFlow locale={locale}>
 <div className="scene-spine" aria-hidden="true"><div className="scene-spine-camera"><div className="scene-spine-cut" /><ArtistLogo className="scene-spine-logo" sizes="200px" /></div></div>
 <HomeExperience locale={locale}/>
 <MusicExperience locale={locale} />
 <ArchiveExperience locale={locale}/>
 <Footer locale={locale} copy={dictionaries[locale]}/>
 </SceneFlow>;
}
