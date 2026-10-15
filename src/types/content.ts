export type Locale = 'en' | 'fr';
export type Localized<T = string> = Record<Locale, T>;
export type SectionId = 'home' | 'music' | 'archive' | 'world' | 'connect';
export interface Artist { name: string; firstName: string; origin: Localized; biography: Localized; positioning: Localized; projectBegan: Localized; }
export interface PlatformLink { platform: string; url: string; }
export interface Release { id: string; title: string; date: string | null; featuredArtist: string | null; artwork: string | null; platforms: PlatformLink[]; duration: number | null; credits: string[] | null; audioPreviewUrl?: string | null; spotifyUrl?: string | null; youtubeUrl?: string | null; }
export interface Video {
 id: string; title: string; url: string; poster: string | null; releaseId: string | null;
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
