import { NextResponse } from 'next/server';
import { getCategory3Streams } from '@/lib/streaming/providerEngine';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'movie';
  const tmdbId = searchParams.get('tmdbId');
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');

  if (!tmdbId) {
    return NextResponse.json({ error: 'Missing required parameter: tmdbId' }, { status: 400 });
  }

  try {
    const streams = await getCategory3Streams({ type, tmdbId, season, episode });
    return NextResponse.json({ success: true, count: streams.length, streams });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
