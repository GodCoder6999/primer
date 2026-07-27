// app/api/stream/route.js
import { NextResponse } from 'next/server';
import { getCategory3Streams } from '@/lib/streaming/providerEngine';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Extract parameters
  const type = searchParams.get('type') || 'tv'; // default or detected
  const tmdbId = searchParams.get('tmdbId') || searchParams.get('id') || '94997'; // 94997 = House of the Dragon TMDB ID
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';

  try {
    const streams = await getCategory3Streams({ type, tmdbId, season, episode });

    // Fallback embed sources if third-party scrapers return empty on Vercel IPs
    if (!streams || streams.length === 0) {
      const fallbackUrl = type === 'tv' 
        ? `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`
        : `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;

      return NextResponse.json({
        success: true,
        count: 1,
        streams: [
          {
            provider: 'vidsrc_fallback',
            name: 'Direct Multi-Server Embed',
            title: `House of the Dragon S${season}E${episode} [Auto Multi-Quality]`,
            type: 'embed',
            url: fallbackUrl
          }
        ]
      });
    }

    return NextResponse.json({ success: true, count: streams.length, streams });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
