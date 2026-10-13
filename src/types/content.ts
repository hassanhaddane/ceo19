export type Locale = 'en' | 'fr';
export type Localized<T = string> = Record<Locale, T>;
export type SectionId = 'home' | 'music' | 'visuals' | 'archive' | 'world' | 'connect';
export interface Artist { name: string; firstName: string; origin: Localized; biography: Localized; positioning: Localized; projectBegan: Localized; }
export interface PlatformLink { platform: string; url: string; }
export type ChannelVisualMode = 'interrupted' | 'sharp' | 'haze' | 'cluster' | 'dual' | 'chrome';
export type ChannelMotionProfile = 'snap' | 'cut' | 'float' | 'heavy' | 'cinematic' | 'press';
export type CinemaEntry = 'offline' | 'impact' | 'haze' | 'shutter' | 'split' | 'poster';
export interface CinemaArtDirection {
 cinemaBackground:string; cinemaAccent:string; cinemaForeground:string; cinemaGlow:string;
 entry:CinemaEntry; entryDuration:number; exitDuration:number; punchline:string|null;
}
export interface ChannelArtDirection {
 channel?: string | null; mood?: Localized | null; accentColor?:string; backgroundColor?:string; foregroundColor?:string;
 visualMode?:ChannelVisualMode; punchlines?:string[]; motionProfile?:ChannelMotionProfile;
 textureMode?:'cut'|'metal'|'glass'|'fabric'|'shadow'|'paper'; videoId?:string|null;
 sceneImage?:{src:string;alt:Localized;crop?:string};
}
export interface Release extends ChannelArtDirection { id: string; title: string; date: string | null; featuredArtist: string | null; artwork: string | null; platforms: PlatformLink[]; duration: number | null; credits: string[] | null; audioPreviewUrl?: string | null; spotifyUrl?: string | null; youtubeUrl?: string | null; }
export interface Video {
 id: string; title: string; url: string; poster: string | null; releaseId: string | null;
 cinema?:Partial<CinemaArtDirection>;
 fallbackImage?: string | null; imageAlt?: Localized; crop?: string; metadata?: VisualMetadata | null;
}
export interface VisualMetadata { reference?: string | null; location?: string | null; year?: number | null; format?: string | null; }
export type ArchiveCategory = 'portrait' | 'live' | 'studio' | 'street' | 'shooting' | 'fez' | 'backstage' | 'fashion' | 'visual-stills' | 'instagram' | 'campaign' | 'lifestyle';
export type ArchiveLayout = 'portrait-small' | 'portrait-large' | 'landscape' | 'square' | 'full-width' | 'offset' | 'floating';
interface GalleryBase {
 id: string; alt: Localized; category: ArchiveCategory; caption: Localized | null;
 layout?: ArchiveLayout; placement?: {column:number;span:number;offset?:number}; mobile?: 'full' | 'inset' | 'edge';
 paper?: boolean; crop?: string; metadata?: VisualMetadata | null;
}
export interface GalleryImage extends GalleryBase { type: 'image'; src: string; }
export interface GalleryInstagram extends GalleryBase { type: 'instagram'; postUrl: string; fallbackImage: string | null; }
export type GalleryItem = GalleryImage | GalleryInstagram;
export interface Social extends PlatformLink { id: string; handle: string; }
export interface ProfessionalContact { email: string; epk: string | null; pressImages: {id:string;src:string;alt:Localized}[]; services: Localized<string[]>; }
