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

    // Filter to keep ONLY direct HLS or HTTP streams, dropping any accidental embeds
    const directStreams = streams.filter(s => s.type === 'hls' || s.url.includes('.m3u8'));

    if (!directStreams || directStreams.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No direct HLS streams could be scraped from providers.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, streams: directStreams });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
