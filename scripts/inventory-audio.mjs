import { readdir, stat } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Inventory only: filenames never imply a release match, duration or rights clearance.
const root = fileURLToPath(new URL('../', import.meta.url));
const skip = new Set(['node_modules', '.next', '.git', '.vercel']);
const files = [];
async function scan(directory) {
 for (const entry of await readdir(directory, { withFileTypes: true })) {
  if (skip.has(entry.name) || entry.isSymbolicLink()) continue;
  const path = resolve(directory, entry.name);
  if (entry.isDirectory()) await scan(path);
  else if (/\.(mp3|ogg|wav|m4a|aac|flac)$/i.test(entry.name)) {
   const name = relative(root, path).split(sep).join('/');
   files.push({ path: name, src: name.startsWith('public/') ? `/${name.slice(7)}` : null,
    bytes: (await stat(path)).size, duration: null, releaseId: null, rightsCleared: false, curated: false });
  }
 }
}
await scan(root);
console.log(JSON.stringify({ files: files.sort((a, b) => a.path.localeCompare(b.path)), count: files.length }, null, 2));
