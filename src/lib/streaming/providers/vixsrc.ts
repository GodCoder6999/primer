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

    // 1. Check standard file variable patterns
    let m3u8Match = html.match(/file:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i) ||
                    html.match(/source\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i) ||
                    html.match(/src:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);

    // 2. Check if packed/eval obfuscated payload exists using [\s\S]*? (safe for all ES targets)
    if (!m3u8Match && html.includes('eval(function(p,a,c,k,e,d)')) {
      const packedMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?\(\)\)/);
      if (packedMatch) {
        const unpackedM3u8 = html.match(/(https?:\/\/[^\s"'#]+\.m3u8[^\s"'#]*)/i);
        if (unpackedM3u8) {
          m3u8Match = [unpackedM3u8[1], unpackedM3u8[1]];
        }
      }
    }

    if (m3u8Match && m3u8Match[1]) {
      return [
        {
          provider: 'vixsrc',
          name: 'Vixsrc Direct HLS',
          type: 'hls',
          url: m3u8Match[1],
          headers: { Referer: baseUrl },
        },
      ];
    }
  } catch (err: any) {
    console.warn(`[Vixsrc Deep Scrape Error]: ${err.message}`);
  }

  return [];
}
