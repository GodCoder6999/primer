import { formatStream } from '../utils/extractor';

interface ScrapeParams {
  tmdbId: string;
  type?: string;
  season?: string;
  episode?: string;
  title?: string;
}

export async function scrape({ tmdbId, type = 'movie' }: ScrapeParams) {
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
  } catch (err: any) {
    console.error(`[Cuevana Error]: ${err.message}`);
    return [];
  }
}
