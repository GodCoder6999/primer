// Normalizes the raw mirrored CDN filenames into stable, readable paths.
// Card art  -> public/images/cards/card-NN.<real-ext>
// Hero art  -> public/images/hero/hero-NN.<real-ext>
// Title logo-> public/images/hero/logo-NN.<real-ext>
//
// Amazon's CDN returns a 200 HTML error page for some asset URLs, and serves
// AVIF/WebP payloads under .jpg/.png names. Everything is therefore sniffed by
// magic bytes: non-images are dropped and extensions are corrected.
//
// Usage: node scripts/organize-assets.mjs

import { readdir, mkdir, copyFile, stat, writeFile, open, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TITLES = join(ROOT, 'public/images/titles');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

/** Returns the real extension from magic bytes, or null if not an image. */
async function sniff(path) {
  const fh = await open(path, 'r');
  const { buffer } = await fh.read(Buffer.alloc(16), 0, 16, 0);
  await fh.close();
  const hex = buffer.toString('hex');
  const ascii = buffer.toString('latin1');
  if (hex.startsWith('ffd8ff')) return '.jpg';
  if (hex.startsWith('89504e47')) return '.png';
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') return '.webp';
  if (ascii.slice(4, 12) === 'ftypavif' || ascii.slice(4, 12) === 'ftypavis') return '.avif';
  if (hex.startsWith('47494638')) return '.gif';
  return null; // HTML error page, empty body, anything else
}

const files = await walk(TITLES);
const probed = [];
const rejected = [];
for (const path of files) {
  const ext = await sniff(path);
  const { size } = await stat(path);
  if (!ext) {
    rejected.push(path);
    continue;
  }
  probed.push({ path, ext, size });
}

// Purge the files that were never images so they can't be picked up again.
for (const bad of rejected) await rm(bad, { force: true });

/** Plain channel/brand logo art — large flat PNG/WebP with no photographic
 *  content. These were being mis-selected as card art (giant "prime" tiles). */
const isPlainLogo = (f) =>
  /channels-logo|logo-min-remaster/.test(f.path) && (f.ext === '.png' || f.ext === '.webp');

const cards = probed
  .filter((f) => f.path.includes('logos') && f.size > 8_000 && !isPlainLogo(f))
  .sort((a, b) => a.path.localeCompare(b.path));

const heroArt = probed
  .filter((f) => !f.path.includes('logos') && f.size > 40_000 && f.ext !== '.png')
  .sort((a, b) => b.size - a.size);

const heroLogos = probed
  .filter((f) => !f.path.includes('logos') && f.size > 5_000 && (f.ext === '.png' || f.ext === '.webp'))
  .sort((a, b) => a.path.localeCompare(b.path));

// Cleared once up front — heroes and title logos share public/images/hero, so
// clearing inside emit() would delete the group written just before it.
for (const dir of ['public/images/cards', 'public/images/hero']) {
  await rm(join(ROOT, dir), { recursive: true, force: true });
  await mkdir(join(ROOT, dir), { recursive: true });
}

async function emit(list, destDir, prefix) {
  await mkdir(join(ROOT, destDir), { recursive: true });
  const manifest = [];
  for (const [i, f] of list.entries()) {
    const name = `${prefix}-${String(i + 1).padStart(2, '0')}${f.ext}`;
    await copyFile(f.path, join(ROOT, destDir, name));
    manifest.push(`/${destDir.replace('public/', '')}/${name}`);
  }
  return manifest;
}

const cardPaths = await emit(cards, 'public/images/cards', 'card');
const heroPaths = await emit(heroArt, 'public/images/hero', 'hero');
const logoPaths = await emit(heroLogos, 'public/images/hero', 'logo');

await writeFile(
  join(ROOT, 'src/lib/asset-manifest.json'),
  JSON.stringify({ cards: cardPaths, heroes: heroPaths, heroLogos: logoPaths }, null, 2),
);

console.log(`rejected (not images): ${rejected.length}`);
console.log(`cards: ${cardPaths.length}\nheroes: ${heroPaths.length}\nheroLogos: ${logoPaths.length}`);
console.log('-> src/lib/asset-manifest.json');
