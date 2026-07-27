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
      // Ensure type is set to 'hls' when a direct .m3u8 link is found
return [
  {
    provider: 'vixsrc',
    name: 'Vixsrc Direct',
    type: 'hls', // <-- Tells frontend to use <video> + hls.js + Your Custom UI
    url: masterM3u8Url
  }
];
    }
  } catch (err) {
    console.error(`[Vixsrc Scrape Failed]: ${err.message}`);
  }

  return [];
}
