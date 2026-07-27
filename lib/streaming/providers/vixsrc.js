import { fetchHtml } from '../utils/http.js';
import { parseRegex, formatStream } from '../utils/extractor.js';

export async function scrape({ type, tmdbId, season, episode }) {
  const baseUrl = 'https://vixsrc.to';
  const targetUrl = type === 'movie' 
    ? `${baseUrl}/embed/movie/${tmdbId}`
    : `${baseUrl}/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`;

  try {
    const html = await fetchHtml(targetUrl, { Referer: baseUrl });
    
    // Extract the raw .m3u8 source URL from the page script
    const masterPlaylist = parseRegex(html, /file:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);

    if (masterPlaylist) {
      return [
        formatStream({
          providerName: 'vixsrc',
          title: 'Vixsrc Direct Stream',
          url: masterPlaylist,
          quality: '1080p ABR',
          type: 'hls', // <-- Instructs frontend to use hls.js on HTML5 <video>
          headers: { Referer: baseUrl }
        })
      ];
    }
  } catch (err) {
    console.error(`[Vixsrc Scrape Failed]: ${err.message}`);
  }

  return [];
}
