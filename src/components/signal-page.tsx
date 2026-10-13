import type { Locale } from '@/types/content';
import { HomeExperience } from './editorial/HomeExperience';
import { WorldExperience } from './editorial/WorldExperience';
import { ConnectExperience } from './editorial/ConnectExperience';
import { Motion } from './motion';
import { SignalExperience } from './signal/SignalExperience';
import { TransmissionsExperience } from './transmissions/TransmissionsExperience';
import { ArchiveExperience } from './media/ArchiveExperience';
export function SignalPage({ locale }: { locale: Locale }) {
 return <main id="main" className="signal-page" tabIndex={-1}>
 <SignalExperience locale={locale} />
 <Motion />
 <HomeExperience locale={locale}/>
 <TransmissionsExperience locale={locale} />
 <ArchiveExperience locale={locale}/>
 <WorldExperience locale={locale}/>
 <ConnectExperience locale={locale}/>
 </main>;
}
