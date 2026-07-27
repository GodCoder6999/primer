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
    const imdbId = `tt${tmdbId}`; 

    // Correctly reference process.env for environment variables
    const cometToken = process.env.COMET_TOKEN || process.env.TS_COMET_TOKEN || 'YOUR_COMET_SECRET_TOKEN';
    const cometUrl = `https://comet.elfhosted.com/${cometToken}/stream/${type}/${imdbId}.json`;

    const res = await fetch(cometUrl);
    const data = await res.json();

    if (!data || !data.streams || data.streams.length === 0) {
      return NextResponse.json({ success: false, error: 'No streams found from Comet.' }, { status: 404 });
    }

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
