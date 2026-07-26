// Builds the clone's catalogue from TMDB.
//
// Replaces the mirrored Amazon artwork with TMDB's, which also gives us the
// two aspect ratios the target uses but our mirror lacked:
//   • poster_path   -> true 2:3, for the portrait "Featured Originals" rows
//   • backdrop_path -> true 16:9, for cards and hero billboards
//
// Usage: node scripts/fetch-tmdb.mjs
// Requires TMDB_API_KEY in .env.local

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const env = await readFile(join(ROOT, '.env.local'), 'utf8').catch(() => '');
const API_KEY = (env.match(/TMDB_API_KEY=(.+)/) ?? [])[1]?.trim() || process.env.TMDB_API_KEY;
if (!API_KEY) {
  console.error('! TMDB_API_KEY missing — add it to .env.local');
  process.exit(1);
}

const API = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

async function tmdb(path, params = {}) {
  const url = new URL(API + path);
  url.searchParams.set('api_key', API_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return res.json();
}

// Genre id -> name, fetched once for each media type.
const genreNames = new Map();
for (const type of ['movie', 'tv']) {
  const { genres } = await tmdb(`/genre/${type}/list`);
  for (const g of genres) genreNames.set(g.id, g.name);
}

const BADGES = ['NEW SERIES', 'NEW EPISODE', 'NEW MOVIE', 'NEW SEASON', 'TOP 10', 'MOST LIKED', 'MOST REWATCHED'];

let seq = 0;
/** Map a TMDB result onto the clone's Title shape. */
function toTitle(r, i) {
  const isSeries = Boolean(r.name && !r.title);
  const date = r.release_date || r.first_air_date || '';
  return {
    id: `t${(seq += 1)}`,
    tmdbId: r.id,
    name: r.title || r.name || 'Untitled',
    // 16:9 card art; fall back to the poster when a backdrop is missing.
    cardImage: r.backdrop_path ? `${IMG}/w780${r.backdrop_path}` : `${IMG}/w500${r.poster_path}`,
    posterImage: r.poster_path ? `${IMG}/w500${r.poster_path}` : null,
    heroImage: r.backdrop_path ? `${IMG}/original${r.backdrop_path}` : null,
    synopsis: r.overview || 'No description available.',
    badge: i < 4 ? BADGES[i % BADGES.length] : undefined,
    entitlement: i % 5 === 0 ? 'subscription' : 'prime',
    year: date ? Number(date.slice(0, 4)) : undefined,
    isSeries,
    seasonLabel: isSeries ? 'Season 1' : undefined,
    genres: (r.genre_ids ?? []).map((g) => genreNames.get(g)).filter(Boolean).slice(0, 3),
    imdbRating: r.vote_average ? Math.round(r.vote_average * 10) / 10 : undefined,
    maturityRating: r.adult ? 'A' : 'U/A 13+',
    runtime: isSeries ? undefined : '2 h 8 min',
  };
}

const trim = (list, n = 14) => list.filter((r) => r.backdrop_path || r.poster_path).slice(0, n);

/** Row definitions: heading -> TMDB endpoint. */
const ROW_SPECS = [
  { id: 'top10', heading: 'Top 10 in India Today', variant: 'top10', path: '/trending/all/day' },
  { id: 'top-tv', heading: 'Top TV', path: '/tv/popular' },
  { id: 'drama-tv', heading: 'Drama TV', path: '/discover/tv', params: { with_genres: 18, sort_by: 'popularity.desc' } },
  { id: 'top-movies', heading: 'Top movies', path: '/movie/popular' },
  { id: 'drama-movies', heading: 'Drama movies', path: '/discover/movie', params: { with_genres: 18, sort_by: 'popularity.desc' } },
  { id: 'recent-tv', heading: 'Recently added TV', path: '/tv/on_the_air' },
  { id: 'featured', heading: 'Featured Originals', variant: 'portrait', path: '/movie/top_rated' },
  { id: 'action', heading: 'Action and adventure', path: '/discover/movie', params: { with_genres: 28 } },
  { id: 'comedy', heading: 'Comedy', path: '/discover/movie', params: { with_genres: 35 } },
  { id: 'docs', heading: 'Documentaries', path: '/discover/movie', params: { with_genres: 99 } },
  { id: 'kids', heading: 'Kids and family', path: '/discover/movie', params: { with_genres: 10751 } },
  { id: 'scifi', heading: 'Science fiction', path: '/discover/movie', params: { with_genres: 878 } },
  { id: 'horror', heading: 'Horror', path: '/discover/movie', params: { with_genres: 27 } },
  { id: 'romance', heading: 'Romance', path: '/discover/movie', params: { with_genres: 10749 } },
];

const rows = [];
for (const spec of ROW_SPECS) {
  const data = await tmdb(spec.path, spec.params);
  const titles = trim(data.results).map(toTitle);
  rows.push({
    id: spec.id,
    heading: spec.heading,
    variant: spec.variant ?? 'standard',
    seeMoreHref: spec.variant === 'top10' ? undefined : '/browse',
    titles,
  });
  process.stdout.write(`  + ${spec.heading} (${titles.length})\n`);
}

// ── Hero slides: trending titles that have both a backdrop and a logo.
const trending = await tmdb('/trending/all/week');
const heroSlides = [];
for (const r of trending.results.filter((x) => x.backdrop_path).slice(0, 8)) {
  const type = r.media_type === 'tv' || (r.name && !r.title) ? 'tv' : 'movie';
  let logo = null;
  try {
    const imgs = await tmdb(`/${type}/${r.id}/images`, { include_image_language: 'en,null' });
    const best = (imgs.logos ?? []).find((l) => l.file_path?.endsWith('.png')) ?? imgs.logos?.[0];
    if (best) logo = `${IMG}/w500${best.file_path}`;
  } catch { /* a missing logo is fine — the slide falls back to a text title */ }

  const t = toTitle(r, heroSlides.length);
  heroSlides.push({
    id: `h${heroSlides.length + 1}`,
    languageLine: 'English | Hindi | Tamil | Telugu',
    primaryCta: { label: 'Watch now', href: `/detail/${t.id}?autoplay=1&t=0` },
    entitlementNote: 'Watch with a Prime membership',
    title: { ...t, logoImage: logo },
  });
  if (heroSlides.length >= 5) break;
}
process.stdout.write(`  + ${heroSlides.length} hero slides\n`);

// ── Category tiles reuse row artwork.
const genreTiles = [
  ['Action and adventure', '/genre/action', 'action'],
  ['Anime', '/genre/anime', 'featured'],
  ['Comedy', '/genre/comedy', 'comedy'],
  ['Documentary', '/genre/documentary', 'docs'],
  ['Drama', '/genre/drama', 'drama-movies'],
  ['Fantasy', '/genre/fantasy', 'scifi'],
  ['Horror', '/genre/horror', 'horror'],
  ['Kids', '/kids', 'kids'],
  ['Mystery and thrillers', '/genre/suspense', 'top-movies'],
  ['Romance', '/genre/romance', 'romance'],
  ['Science fiction', '/genre/science-fiction', 'scifi'],
].map(([label, href, rowId], i) => ({
  label,
  href,
  image: rows.find((r) => r.id === rowId)?.titles[i % 10]?.cardImage ?? rows[0].titles[i].cardImage,
}));

const featuredCollectionTiles = [
  ['Home Premiere', '/collection/HCE_IN'],
  ['New Releases', '/collection/in_new_releases'],
  ['MX Player', '/collection/miniTV_Merch1'],
  ['Critically acclaimed', '/collection/INAwardsandNominations'],
  ['Kids', '/kids'],
].map(([label, href], i) => ({ label, href, image: rows[6].titles[i].cardImage }));

// ── Per-title detail: real credits, runtime, and (for series) real episodes.
// Without this every detail page shared one placeholder episode list whose
// stills came from unrelated shows.
// Keyed by `${type}:${tmdbId}` — the same TMDB title appears in several rows
// under different local ids, so keying by local id would leave every duplicate
// without credits or episodes.
const allTitles = [...rows.flatMap((r) => r.titles), ...heroSlides.map((h) => h.title)];
const seen = new Set();
const detailKey = (t) => `${t.isSeries ? 'tv' : 'movie'}:${t.tmdbId}`;
const unique = allTitles.filter((t) => !seen.has(detailKey(t)) && seen.add(detailKey(t)));

async function pool(items, limit, worker) {
  let i = 0;
  const runners = Array.from({ length: limit }, async () => {
    while (i < items.length) await worker(items[i++]);
  });
  await Promise.all(runners);
}

const details = {};
let done = 0;
await pool(unique, 8, async (t) => {
  const type = t.isSeries ? 'tv' : 'movie';
  try {
    const d = await tmdb(`/${type}/${t.tmdbId}`, { append_to_response: 'credits' });
    const crew = d.credits?.crew ?? [];
    const pick = (job) => crew.filter((c) => c.job === job).map((c) => c.name).slice(0, 3);

    let episodes = [];
    if (t.isSeries) {
      const seasonNo = d.seasons?.find((s) => s.season_number > 0)?.season_number ?? 1;
      const season = await tmdb(`/tv/${t.tmdbId}/season/${seasonNo}`);
      episodes = (season.episodes ?? []).slice(0, 8).map((e) => ({
        number: e.episode_number,
        name: e.name || `Episode ${e.episode_number}`,
        synopsis: e.overview || 'No description available.',
        runtime: e.runtime ? `${e.runtime}min` : '—',
        releaseDate: e.air_date
          ? new Date(e.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '',
        // Episode still, falling back to the show's backdrop.
        thumbnail: e.still_path ? `${IMG}/w500${e.still_path}` : t.cardImage,
      }));
      t.seasonLabel = `Season ${seasonNo}`;
    }

    details[detailKey(t)] = {
      seasonLabel: t.isSeries ? t.seasonLabel : undefined,
      runtime: d.runtime ? `${Math.floor(d.runtime / 60)} h ${d.runtime % 60} min` : undefined,
      genres: (d.genres ?? []).map((g) => g.name).slice(0, 3),
      directors: pick('Director').length ? pick('Director') : pick('Executive Producer'),
      producers: pick('Producer').length ? pick('Producer') : ['—'],
      cast: (d.credits?.cast ?? []).map((c) => c.name).slice(0, 8),
      studio: d.production_companies?.[0]?.name ?? '—',
      episodes,
    };
  } catch {
    details[detailKey(t)] = { episodes: [] };
  }
  if (++done % 40 === 0) process.stdout.write(`  … details ${done}/${unique.length}\n`);
});
process.stdout.write(`  + details for ${Object.keys(details).length} titles\n`);

const payload = {
  generatedAt: new Date().toISOString(),
  source: 'TMDB',
  rows,
  heroSlides,
  genreTiles,
  featuredCollectionTiles,
  details,
};

await writeFile(join(ROOT, 'src/lib/tmdb-catalog.json'), JSON.stringify(payload, null, 2));
console.log(`\n-> src/lib/tmdb-catalog.json (${rows.length} rows, ${rows.reduce((n, r) => n + r.titles.length, 0)} titles)`);
