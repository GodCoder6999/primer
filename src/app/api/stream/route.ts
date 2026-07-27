import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const tmdbId = searchParams.get('tmdbId') || searchParams.get('id');
  const type = searchParams.get('type') || 'movie';
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';

  if (!tmdbId) {
    return NextResponse.json({ error: 'tmdbId is required' }, { status: 400 });
  }

  try {
    // 1. Convert TMDb ID to IMDb ID format required by Stremio-compatible addons like Comet
    // (You can use an external lookup or pass an IMDb ID directly from your frontend)
    const imdbId = `tt${tmdbId}`; 

    // 2. Query your Comet instance REST API endpoint
    const cometToken = process.TS_COMET_TOKEN || 'YOUR_COMET_SECRET_TOKEN';
    const cometUrl = `https://comet.elfhosted.com/${cometToken}/stream/${type}/${imdbId}.json`;

    const res = await fetch(cometUrl);
    const data = await res.json();

    if (!data || !data.streams || data.streams.length === 0) {
      return NextResponse.json({ success: false, error: 'No streams found from Comet.' }, { status: 404 });
    }

    // 3. Map Comet streams into your clean format
    const formattedStreams = data.streams.map((stream: any) => ({
      provider: 'comet',
      name: stream.title || stream.name || 'Comet Stream',
      type: stream.url.includes('.m3u8') ? 'hls' : 'http_range',
      url: stream.url
    }));

    return NextResponse.json({ success: true, streams: formattedStreams });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
