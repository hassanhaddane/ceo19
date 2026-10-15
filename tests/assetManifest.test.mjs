import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, stat } from 'node:fs/promises';
import { publicAssets } from '../src/data/assets.ts';

test('every declared public asset exists with exact filename case and current byte count', async () => {
 for (const asset of publicAssets) {
  let directory = new URL('../public/', import.meta.url);
  for (const segment of asset.path.slice(1).split('/')) {
   assert.ok((await readdir(directory)).includes(segment), `Missing or case-mismatched asset: ${asset.path}`);
   directory = new URL(`${encodeURIComponent(segment)}/`, directory);
  }
  const file = new URL(`../public${asset.path}`, import.meta.url);
  assert.equal((await stat(file)).size, asset.bytes, `Stale asset inventory: ${asset.path}`);
 }
});
