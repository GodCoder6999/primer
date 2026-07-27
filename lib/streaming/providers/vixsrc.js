// lib/streaming/providers/vixsrc.js
import { fetchHtml } from '../utils/http.js';
import { parseRegex, formatStream } from '../utils/extractor.js';

export async function scrape({ type = 'tv', tmdbId, season = 1, episode = 1 }) {
  const baseUrl = 'https://vixsrc.to';
  const targetUrl = type === 'movie' 
    ? `${baseUrl}/embed/movie/${tmdbId}`
    : `${baseUrl}/embed/tv/${tmdbId}/${season}/${episode}`;

  try {
    const html = await fetchHtml(targetUrl, { Referer: baseUrl });
    const masterPlaylist = parseRegex(html, /file:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);

    if (masterPlaylist) {
      return [
        formatStream({
          providerName: 'vixsrc',
          title: 'Vixsrc Direct HLS',
          url: masterPlaylist,
          quality: '1080p ABR',
          type: 'hls',
          headers: { Referer: baseUrl }
        })
      ];
    }
  } catch (err) {
    console.warn(`[Vixsrc Scrape Failed]: ${err.message}`);
  }

  // Direct Embed Fallback if regex scraping fails
  return [
    formatStream({
      providerName: 'vixsrc_embed',
      title: 'Vixsrc Player',
      url: targetUrl,
      quality: '1080p Auto',
      type: 'embed',
      headers: { Referer: baseUrl }
    })
  ];
}
