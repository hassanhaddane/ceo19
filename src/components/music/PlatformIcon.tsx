const icons: Record<string,string> = {Instagram:'instagram',TikTok:'tiktok',Spotify:'spotify',YouTube:'youtube','Apple Music':'applemusic',Deezer:'deezer'};
/** Brand glyphs from Simple Icons; original shapes are preserved. See public/icons/SOURCES.md. */
export function PlatformIcon({platform}: {platform:string}) {
 return icons[platform] ? <span className="music-platform-icon" style={{maskImage:`url(/icons/${icons[platform]}.svg)`}} aria-hidden="true" /> : <span aria-hidden="true">↗</span>;
}
