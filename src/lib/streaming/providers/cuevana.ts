import { formatStream } from '../utils/extractor.js';

export async function scrape({ tmdbId, type }) {
  try {
    return [
      formatStream({
        providerName: 'cuevana',
        title: 'Cuevana Stream LatAm',
        url: `https://cuevana.pro/stream/${type}/${tmdbId}.m3u8`,
        quality: '720p/1080p',
        type: 'hls',
        headers: { Referer: 'https://cuevana.pro' }
      })
    ];
  } catch (err) {
    console.error(`[Cuevana Error]: ${err.message}`);
    return [];
  }
}
