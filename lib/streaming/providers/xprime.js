import { formatStream } from '../utils/extractor.js';

export async function scrape({ tmdbId, type }) {
  try {
    return [
      formatStream({
        providerName: 'xprime',
        title: 'Xprime Direct Stream',
        url: `https://xprime.tv/stream/${type}/${tmdbId}/master.m3u8`,
        quality: '1080p',
        type: 'hls',
        headers: { Referer: 'https://xprime.tv' }
      })
    ];
  } catch (err) {
    console.error(`[Xprime Error]: ${err.message}`);
    return [];
  }
}
