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

    // Fallback embed if scraper yields no direct HLS link
    if (!streams || streams.length === 0) {
      const fallbackEmbed = type === 'tv'
        ? `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`
        : `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;

      return NextResponse.json({
        success: true,
        streams: [
          {
            provider: 'fallback_embed',
            name: 'External Embed Stream',
            type: 'embed', // <-- Frontend reads this to hide custom UI
            url: fallbackEmbed
          }
        ]
      });
    }

    return NextResponse.json({ success: true, streams });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
