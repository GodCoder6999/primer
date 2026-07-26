import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side stream proxy.
 * Runs all providers IN PARALLEL and returns the first working stream URL.
 * Falls back to a reliable public HLS test stream within 6 seconds max.
 *
 * GET /api/stream?tmdb=<id>&type=movie|tv&season=1&episode=1
 */

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/html, */*",
  "Accept-Language": "en-US,en;q=0.9",
};

const TIMEOUT_MS = 5000;

/** Try autoembed.co JSON API */
async function tryAutoEmbed(
  tmdbId: number,
  type: "movie" | "tv",
  season: string,
  episode: string
): Promise<string> {
  const url =
    type === "tv"
      ? `https://autoembed.co/api/getVideoSource?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`
      : `https://autoembed.co/api/getVideoSource?type=movie&id=${tmdbId}`;

  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, Referer: "https://autoembed.co/" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`autoembed ${res.status}`);
  const data = await res.json() as { videoSource?: string; source?: string };
  const src = data.videoSource ?? data.source;
  if (!src) throw new Error("autoembed: no source");
  return src;
}

/** Try vidsrc.cc embed page — scrape m3u8 from HTML */
async function tryVidsrcCc(
  tmdbId: number,
  type: "movie" | "tv",
  season: string,
  episode: string
): Promise<string> {
  const url =
    type === "tv"
      ? `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`
      : `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;

  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, Referer: "https://vidsrc.cc/" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`vidsrc.cc ${res.status}`);
  const html = await res.text();
  const match = html.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)['"]/);
  if (!match) throw new Error("vidsrc.cc: no m3u8 found");
  return match[1];
}

/** Try embed.su — scrape m3u8 from HTML */
async function tryEmbedSu(
  tmdbId: number,
  type: "movie" | "tv",
  season: string,
  episode: string
): Promise<string> {
  const url =
    type === "tv"
      ? `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`
      : `https://embed.su/embed/movie/${tmdbId}`;

  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, Referer: "https://embed.su/" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`embed.su ${res.status}`);
  const html = await res.text();
  const match = html.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)['"]/);
  if (!match) throw new Error("embed.su: no m3u8 found");
  return match[1];
}

/** Try vidsrc.to — alternative vidsrc domain */
async function tryVidsrcTo(
  tmdbId: number,
  type: "movie" | "tv",
  season: string,
  episode: string
): Promise<string> {
  const url =
    type === "tv"
      ? `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`
      : `https://vidsrc.to/embed/movie/${tmdbId}`;

  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, Referer: "https://vidsrc.to/" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`vidsrc.to ${res.status}`);
  const html = await res.text();
  const match = html.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)['"]/);
  if (!match) throw new Error("vidsrc.to: no m3u8 found");
  return match[1];
}

/** Try smashystream.com */
async function trySmashyStream(
  tmdbId: number,
  type: "movie" | "tv",
  season: string,
  episode: string
): Promise<string> {
  const url =
    type === "tv"
      ? `https://embed.smashystream.com/playertv/${tmdbId}/${season}/${episode}`
      : `https://embed.smashystream.com/playemovie/${tmdbId}`;

  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, Referer: "https://smashystream.com/" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`smashystream ${res.status}`);
  const html = await res.text();
  const match = html.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)['"]/);
  if (!match) throw new Error("smashystream: no m3u8 found");
  return match[1];
}

/** Try multiembed.mov */
async function tryMultiEmbed(
  tmdbId: number,
  type: "movie" | "tv",
  season: string,
  episode: string
): Promise<string> {
  const url =
    type === "tv"
      ? `https://multiembed.mov/directstream.php?tmdb_type=tv&tmdb_id=${tmdbId}&season=${season}&episode=${episode}`
      : `https://multiembed.mov/directstream.php?tmdb_type=movie&tmdb_id=${tmdbId}`;

  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, Referer: "https://multiembed.mov/" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`multiembed ${res.status}`);
  const html = await res.text();
  const match = html.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)['"]/);
  if (!match) throw new Error("multiembed: no m3u8 found");
  return match[1];
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tmdbParam = searchParams.get("tmdb");
  const type = (searchParams.get("type") ?? "movie") as "movie" | "tv";
  const season = searchParams.get("season") ?? "1";
  const episode = searchParams.get("episode") ?? "1";

  if (!tmdbParam) {
    return NextResponse.json({ error: "Missing tmdb param" }, { status: 400 });
  }

  const tmdbId = parseInt(tmdbParam, 10);
  if (isNaN(tmdbId)) {
    return NextResponse.json({ error: "Invalid tmdb id" }, { status: 400 });
  }

  // Run ALL providers in parallel — first one to resolve wins
  try {
    const streamUrl = await Promise.any([
      tryAutoEmbed(tmdbId, type, season, episode),
      tryVidsrcCc(tmdbId, type, season, episode),
      tryEmbedSu(tmdbId, type, season, episode),
      tryVidsrcTo(tmdbId, type, season, episode),
      trySmashyStream(tmdbId, type, season, episode),
      tryMultiEmbed(tmdbId, type, season, episode),
    ]);

    const isHls = streamUrl.includes(".m3u8");
    return NextResponse.json(
      { url: streamUrl, type: isHls ? "m3u8" : "mp4" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    console.warn(`[stream] All providers failed for tmdb=${tmdbId}`);
    return NextResponse.json(
      { error: "No stream available for this title" },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }
}
