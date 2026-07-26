// Mirrors the target site's assets into public/.
// Usage: node scripts/download-assets.mjs
// Reads the URL manifest produced during recon (recon-assets.json) plus the
// hard-coded font/favicon/logo lists below.

import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const CONCURRENCY = 4;

/** Amazon Ember, the site's typeface. woff2 + woff per weight. */
const FONTS = [
  ['https://m.media-amazon.com/images/I/5167G3DwWTL.woff2?amazonember_rg', 'fonts/AmazonEmber-Regular.woff2'],
  ['https://m.media-amazon.com/images/I/51Ja06DDSWL.woff?amazonember_rg', 'fonts/AmazonEmber-Regular.woff'],
  ['https://m.media-amazon.com/images/I/41dxSi+IUpL.woff2?amazonember_sbd', 'fonts/AmazonEmber-Medium.woff2'],
  ['https://m.media-amazon.com/images/I/513caHLRc+L.woff?amazonember_sbd', 'fonts/AmazonEmber-Medium.woff'],
  ['https://m.media-amazon.com/images/I/51J9qU3t-IL.woff2?amazonember_bd', 'fonts/AmazonEmber-Bold.woff2'],
  ['https://m.media-amazon.com/images/I/51f91HNnSFL.woff?amazonember_bd', 'fonts/AmazonEmber-Bold.woff'],
  ['https://m.media-amazon.com/images/I/515UizubSyL.woff2?amazonember_he', 'fonts/AmazonEmber-Heavy.woff2'],
  ['https://m.media-amazon.com/images/I/51wmERICL+L.woff?amazonember_he', 'fonts/AmazonEmber-Heavy.woff'],
];

const FAVICON_BASE = 'https://m.media-amazon.com/images/G/01/digital/video/DVUI/favicons';
const SEO = [
  [`${FAVICON_BASE}/favicon.png`, 'seo/favicon.png'],
  [`${FAVICON_BASE}/favicon-16x16.png`, 'seo/favicon-16x16.png'],
  [`${FAVICON_BASE}/favicon-32x32.png`, 'seo/favicon-32x32.png'],
  [`${FAVICON_BASE}/favicon-96x96.png`, 'seo/favicon-96x96.png'],
  [`${FAVICON_BASE}/favicon-128x128.png`, 'seo/favicon-128x128.png'],
  [`${FAVICON_BASE}/favicon-196x196.png`, 'seo/favicon-196x196.png'],
  [`${FAVICON_BASE}/apple-touch-icon.png`, 'seo/apple-touch-icon.png'],
  [`${FAVICON_BASE}/apple-touch-icon-57x57.png`, 'seo/apple-touch-icon-57x57.png'],
  [`${FAVICON_BASE}/apple-touch-icon-72x72.png`, 'seo/apple-touch-icon-72x72.png'],
  [`${FAVICON_BASE}/apple-touch-icon-114x114.png`, 'seo/apple-touch-icon-114x114.png'],
  [`${FAVICON_BASE}/apple-touch-icon-144x144.png`, 'seo/apple-touch-icon-144x144.png'],
  [`${FAVICON_BASE}/apple-touch-icon-152x152.png`, 'seo/apple-touch-icon-152x152.png'],
  ['https://m.media-amazon.com/images/G/01/primevideo/seo/primevideo-seo-logo.png', 'seo/og-image.png'],
];

const BRAND = [
  ['https://m.media-amazon.com/images/G/01/digital/video/web/logo-min-remaster.png', 'images/brand/prime-video-logo.png'],
  ['https://m.media-amazon.com/images/G/01/digital/video/merch/subs/benefit-id/m-r/Prime/logos/channels-logo-color._CB554929912_BR-6_AC_SX500_FMwebp_.png', 'images/brand/prime-channel-logo.png'],
];

/** Derive a stable local filename from an Amazon CDN URL.
 *  Amazon composites several distinct card images through URLs that share a
 *  path segment, so a short hash of the full URL is appended to keep them
 *  distinct — without it ~60 of 78 images collide onto the same filename. */
function localNameFor(url, i) {
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 8);
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] ?? `asset-${i}`;
    // Amazon encodes transforms after the first '.', e.g. <id>._UR3840,1440_.jpeg
    const id = last.split('._')[0].slice(0, 40).replace(/[^\w.-]/g, '_');
    let ext = extname(last.split('?')[0]).toLowerCase();
    if (!ext || ext.length > 6) ext = '.jpg';
    // group by the collection folder when present
    const folder = parts.length > 2 ? parts[parts.length - 2].replace(/[^\w-]/g, '_').slice(0, 40) : 'misc';
    return `images/titles/${folder}/${id}-${hash}${ext}`;
  } catch {
    return `images/titles/misc/asset-${i}-${hash}.jpg`;
  }
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function fetchOne([url, rel]) {
  const dest = join(PUBLIC, rel);
  if (await exists(dest)) return { rel, status: 'cached' };
  try {
    const res = await fetch(url, {
      headers: {
        // Amazon's CDN 403s requests without a browser-ish UA/referer.
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
        referer: 'https://www.primevideo.com/',
        accept: 'image/avif,image/webp,image/png,image/jpeg,font/woff2,*/*',
      },
    });
    if (!res.ok) return { rel, status: `HTTP ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) return { rel, status: 'empty' };
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    return { rel, status: 'ok', bytes: buf.length };
  } catch (err) {
    return { rel, status: `ERR ${err.message}` };
  }
}

async function runPool(jobs) {
  const results = [];
  let cursor = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      const r = await fetchOne(job);
      results.push(r);
      const tag = r.status === 'ok' ? `${(r.bytes / 1024).toFixed(0)}kb` : r.status;
      process.stdout.write(`  ${r.status === 'ok' || r.status === 'cached' ? '+' : '!'} ${r.rel} (${tag})\n`);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  let titleJobs = [];
  try {
    const manifest = JSON.parse(await readFile(join(ROOT, 'recon-assets.json'), 'utf8'));
    const seen = new Set();
    titleJobs = (manifest.images ?? [])
      .filter((u) => typeof u === 'string' && u.startsWith('http'))
      .map((u, i) => [u, localNameFor(u, i)])
      .filter(([, rel]) => !seen.has(rel) && seen.add(rel));
  } catch {
    console.log('! recon-assets.json not found — skipping title art');
  }

  const groups = [
    ['fonts', FONTS],
    ['seo / favicons', SEO],
    ['brand', BRAND],
    ['title art', titleJobs],
  ];

  const all = [];
  for (const [label, jobs] of groups) {
    if (!jobs.length) continue;
    console.log(`\n${label} (${jobs.length})`);
    all.push(...(await runPool(jobs)));
  }

  const ok = all.filter((r) => r.status === 'ok').length;
  const cached = all.filter((r) => r.status === 'cached').length;
  const failed = all.filter((r) => r.status !== 'ok' && r.status !== 'cached');
  console.log(`\ndownloaded ${ok}, cached ${cached}, failed ${failed.length}`);
  if (failed.length) for (const f of failed.slice(0, 15)) console.log(`  ! ${f.rel} — ${f.status}`);
}

main();
