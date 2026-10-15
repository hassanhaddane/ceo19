import { geniusEntry } from '../data/lyrics.ts';
import { visualEffects } from './visualEffects.ts';

const escape = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
/** Fixed document for a preconfigured song, never provider HTML injected into the app. */
export function geniusEmbedDocument(releaseId: string): string | null {
 const entry = geniusEntry(releaseId); if (!entry) return null;
 const { songId, url } = entry;
 return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"><style>html,body{margin:0;background:#eee9db;color:#070b10;font:15px/1.65 sans-serif}body{padding:18px}a{color:#245781}.rg_embed{max-width:none!important;width:auto!important;margin:0!important}.rg_embed_body{font-size:16px!important}</style></head><body><div id="rg_embed_link_${songId}" class="rg_embed_link" data-song-id="${songId}"><a href="${escape(url)}" rel="noopener noreferrer">Open lyrics on Genius</a></div><script>
const report=status=>parent.postMessage({type:'ceo:genius',songId:${songId},status},'*');
let ready=false;
function inspect(){if(!ready&&document.querySelector('.rg_embed_body')){ready=true;report('ready');}}
const observer=new MutationObserver(inspect);observer.observe(document.body,{childList:true,subtree:true});
setTimeout(()=>{inspect();if(!ready)report('error');observer.disconnect();},${visualEffects.lyrics.timeout});
addEventListener('pagehide',()=>observer.disconnect());
</script><script src="https://genius.com/songs/${songId}/embed.js" crossorigin="anonymous" onload="inspect()" onerror="report('error')"></script></body></html>`;
}

export function isGeniusEmbedMessage(event: { source: unknown; data: unknown }, expectedSource: unknown, releaseId: string): event is { source: unknown; data: { type: 'ceo:genius'; songId: number; status: 'ready' | 'error' } } {
 const entry = geniusEntry(releaseId);
 if (!entry || !expectedSource || event.source !== expectedSource || !event.data || typeof event.data !== 'object') return false;
 const data = event.data as Record<string, unknown>;
 return data.type === 'ceo:genius' && data.songId === entry.songId && (data.status === 'ready' || data.status === 'error');
}
