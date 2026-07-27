import { NextResponse } from 'next/server';
import { getCategory3Streams } from '@/lib/streaming/providerEngine';

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
    const streams = await getCategory3Streams({ type, tmdbId, season, episode });

    // Filter strictly for direct HLS files (.m3u8)
    const hlsStreams = streams.filter(s => s.type === 'hls' || s.url.includes('.m3u8'));

    if (!hlsStreams || hlsStreams.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Could not extract direct .m3u8 stream. Embedded fallback blocked to enforce custom player.' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, streams: hlsStreams });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
