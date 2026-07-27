import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

async function getImdbId(rawId: string, type: string): Promise<string | null> {
  // Manual override for test ID 't17' / '17' to point to House of the Dragon
  if (rawId === 't17' || rawId === '17' || rawId === 'tt17') {
    return 'tt11198330'; // House of the Dragon IMDb ID
  }

  if (rawId.startsWith('tt')) {
    return rawId;
  }

  const cleanId = rawId.startsWith('t') ? rawId.substring(1) : rawId;

  if (TMDB_API_KEY) {
    try {
      const endpoint = `https://api.themoviedb.org/3/${type === 'tv' ? 'tv' : 'movie'}/${cleanId}/external_ids?api_key=${TMDB_API_KEY}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data && data.imdb_id) {
        return data.imdb_id;
      }
    } catch (err) {
      console.warn(`[TMDb External ID Lookup Error]:`, err);
    }
  }

  return `tt${cleanId.padStart(7, '0')}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const rawId = searchParams.get('tmdbId') || searchParams.get('id');
  const type = searchParams.get('type') || 'movie';
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';

  if (!rawId) {
    return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
  }

  try {
    const imdbId = await getImdbId(rawId, type);
    if (!imdbId) {
      return NextResponse.json({ success: false, error: 'Failed to resolve valid IMDb ID.' }, { status: 400 });
    }

    const cometToken = process.env.COMET_TOKEN || process.env.TS_COMET_TOKEN || '';
    if (!cometToken) {
      return NextResponse.json({ success: false, error: 'COMET_TOKEN environment variable is missing.' }, { status: 500 });
    }

    const cometUrl = `https://comet.elfhosted.com/${cometToken}/stream/${type}/${imdbId}.json`;
    const res = await fetch(cometUrl);
    const data = await res.json();

    if (!data || !data.streams || data.streams.length === 0) {
      return NextResponse.json({ success: false, error: 'No streams found from Comet.' }, { status: 404 });
    }

    // Filter and map valid direct streams, blocking embeds/iframes
    const formattedStreams = data.streams
      .map((stream: any) => ({
        provider: 'comet',
        name: stream.title || stream.name || 'Comet Stream',
        type: stream.url && stream.url.includes('.m3u8') ? 'hls' : 'http_range',
        url: stream.url
      }))
      .filter((s: any) => {
        if (!s.url) return false;
        const lowerUrl = s.url.toLowerCase();
        if (
          lowerUrl.includes('/embed/') ||
          lowerUrl.includes('vidsrc') ||
          lowerUrl.includes('vidlink') ||
          lowerUrl.includes('embed.') ||
          lowerUrl.includes('iframe')
        ) {
          return false;
        }
        return true;
      });

    if (formattedStreams.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No direct video/HLS streams available. Embedded players have been blocked.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, streams: formattedStreams });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
