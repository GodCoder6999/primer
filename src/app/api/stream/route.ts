import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

async function getImdbId(rawId: string, type: string): Promise<string | null> {
  // If it's already a valid IMDb ID
  if (rawId.startsWith('tt')) {
    return rawId;
  }

  // Strip prefixes like 't' (e.g. 't17' -> '17')
  const cleanId = rawId.startsWith('t') ? rawId.substring(1) : rawId;

  // Try fetching official external mapping from TMDb if API key is available
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

  // Fallback ID estimation if external lookup is bypassed
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

    // Query Comet instance with valid IMDb ID
    const cometUrl = `https://comet.elfhosted.com/${cometToken}/stream/${type}/${imdbId}.json`;
    const res = await fetch(cometUrl);
    const data = await res.json();

    if (!data || !data.streams || data.streams.length === 0) {
      return NextResponse.json({ success: false, error: 'No cached debrid streams found from Comet for this title.' }, { status: 404 });
    }

    // Format streams cleanly for your HTML5 / hls.js custom player
    const formattedStreams = data.streams.map((stream: any) => ({
      provider: 'comet',
      name: stream.title || stream.name || 'Comet Stream',
      type: stream.url && stream.url.includes('.m3u8') ? 'hls' : 'http_range',
      url: stream.url
    })).filter((s: any) => s.url);

    return NextResponse.json({ success: true, streams: formattedStreams });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
