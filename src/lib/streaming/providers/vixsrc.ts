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
  const targetUrl =
    type === 'movie'
      ? `${baseUrl}/embed/movie/${tmdbId}`
      : `${baseUrl}/embed/tv/${tmdbId}/${season}/${episode}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Referer: baseUrl,
      },
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const html = await res.text();
    
    // Regex targeting the raw .m3u8 master playlist source inside hoster scripts
    const match = html.match(/file:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);

    if (match && match[1]) {
      return [
        {
          provider: 'vixsrc',
          name: 'Vixsrc Direct HLS',
          type: 'hls',
          url: match[1],
          headers: { Referer: baseUrl },
        },
      ];
    }
  } catch (err: any) {
    console.warn(`[Vixsrc Scrape Failed]: ${err.message}`);
  }

  // STRICT RULE: Return empty array instead of fallback embed iframe
  return [];
}
