import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

/**
 * Advanced stream extractor backend.
 * Uses headless browser to extract actual stream URLs from embed players,
 * intercepting network requests to bypass embedded player UIs.
 *
 * GET /api/stream?tmdb=<id>&type=movie|tv&season=1&episode=1
 */

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/html, */*",
  "Accept-Language": "en-US,en;q=0.9",
};

const TIMEOUT_MS = 8000;

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

/** Extract streams from vidsrc.cc using headless browser */
async function tryVidsrcCcHeadless(
  tmdbId: number,
  type: "movie" | "tv",
  season: string,
  episode: string
): Promise<string> {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    const url =
      type === "tv"
        ? `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Capture network requests for stream URLs
    let streamUrl: string | null = null;
    page.on("response", (response) => {
      const url = response.url();
      if (url.includes(".m3u8") || url.includes(".mp4")) {
        streamUrl = url;
      }
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: TIMEOUT_MS });

    // Wait for stream to appear in DOM or network
    await page.waitForFunction(
      () => {
        const src = (document.querySelector("video source") as HTMLSourceElement)?.src;
        return !!src;
      },
      { timeout: TIMEOUT_MS }
    ).catch(() => null);

    // Extract from video element if available
    if (!streamUrl) {
      streamUrl = await page.evaluate(() => {
        const src = (document.querySelector("video source") as HTMLSourceElement)?.src;
        return src || null;
      });
    }

    if (!streamUrl) throw new Error("vidsrc.cc: no stream found");
    return streamUrl;
  } finally {
    if (browser) await browser.close().catch(() => null);
  }
}

/** Extract streams from embed.su using headless browser */
async function tryEmbedSuHeadless(
  tmdbId: number,
  type: "movie" | "tv",
  season: string,
  episode: string
): Promise<string> {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    const url =
      type === "tv"
        ? `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://embed.su/embed/movie/${tmdbId}`;

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    let streamUrl: string | null = null;
    page.on("response", (response) => {
      const url = response.url();
      if (url.includes(".m3u8") || url.includes(".mp4")) {
        streamUrl = url;
      }
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: TIMEOUT_MS });

    if (!streamUrl) {
      streamUrl = await page.evaluate(() => {
        const src = (document.querySelector("video source") as HTMLSourceElement)?.src;
        return src || null;
      });
    }

    if (!streamUrl) throw new Error("embed.su: no stream found");
    return streamUrl;
  } finally {
    if (browser) await browser.close().catch(() => null);
  }
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

  // Run providers in parallel — try fast APIs first, then headless browser extractions
  try {
    const streamUrl = await Promise.any([
      tryAutoEmbed(tmdbId, type, season, episode),
      tryVidsrcCcHeadless(tmdbId, type, season, episode),
      tryEmbedSuHeadless(tmdbId, type, season, episode),
    ]);

    const isHls = streamUrl.includes(".m3u8");
    return NextResponse.json(
      { url: streamUrl, type: isHls ? "m3u8" : "mp4" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const errors = err instanceof AggregateError ? err.errors : [err];
    const reasons = errors
      .map((e) => (e instanceof Error ? e.message : String(e)))
      .join(", ");
    console.warn(`[stream] All providers failed for tmdb=${tmdbId}: ${reasons}`);
    return NextResponse.json(
      { error: "No stream available for this title", debug: reasons },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }
}
