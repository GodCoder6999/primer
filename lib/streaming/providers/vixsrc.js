import { fetchHtml } from '../utils/http.js';
import { parseRegex, formatStream } from '../utils/extractor.js';

export async function scrape({ type, tmdbId, season, episode }) {
  const baseUrl = 'https://vixsrc.to';
  const targetUrl = type === 'movie'
    ? `${baseUrl}/embed/movie/${tmdbId}`
    : `${baseUrl}/embed/tv/${tmdbId}/${season}/${episode}`;

  try {
    const html = await fetchHtml(targetUrl, { Referer: baseUrl });
    const masterPlaylist = parseRegex(html, /file:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);

    if (!masterPlaylist) return [];

    return [
      formatStream({
        providerName: 'vixsrc',
        title: 'Vixsrc Master Stream',
        url: masterPlaylist,
        quality: '1080p ABR',
        type: 'hls',
        headers: { Referer: baseUrl }
      })
    ];
  } catch (err) {
    console.error(`[Vixsrc Error]: ${err.message}`);
    return [];
  }
}
