import { resolveEmbedToHls } from '@/lib/streaming/utils/embedResolver';
import { formatStream } from '@/lib/streaming/utils/extractor';

export async function scrape({
  type = 'movie',
  tmdbId,
  season = '1',
  episode = '1',
}: {
  type: string;
  tmdbId: string;
  season?: string;
  episode?: string;
}) {
  const baseUrl = 'https://vixsrc.to';
  const embedUrl =
    type === 'movie'
      ? `${baseUrl}/embed/movie/${tmdbId}`
      : `${baseUrl}/embed/tv/${tmdbId}/${season}/${episode}`;

  // Attempt to resolve the embed page directly into a raw .m3u8 stream
  const directHlsUrl = await resolveEmbedToHls(embedUrl);

  if (directHlsUrl) {
    return [
      formatStream({
        providerName: 'vixsrc',
        title: 'Vixsrc Converted HLS Stream',
        url: directHlsUrl,
        quality: '1080p ABR',
        type: 'hls',
        headers: { Referer: baseUrl },
      }),
    ];
  }

  // Return empty if conversion fails, ensuring the embed player is never outputted
  return [];
}
