import { NextRequest, NextResponse } from "next/server";

/**
 * Stream API - Attempts multiple providers to find direct HLS/MP4 streams.
 *
 * IMPORTANT: Most free streaming APIs are unreliable due to:
 * - Frequent shutdowns and domain changes
 * - Geo-blocking and IP restrictions
 * - Server-side blocking of automated requests
 * - Legal takedowns and DMCA compliance
 *
 * Tested providers (currently non-functional):
 * - Nuviostream: Returns HTML (blocked)
 * - VidLink, RapidCloud, Upstream: 404 Not Found
 * - MovieStream API: Connection timeout/502
 * - Consumet: HTTP 451 (geo-blocked)
 *
 * Fallback: Test stream (Mux HLS) - Always available for demo
 *
 * Production recommendation:
 * 1. Use commercial streaming APIs (JustWatch, TmDB official)
 * 2. Self-host content via Jellyfin/Plex
 * 3. Implement embed providers (2embed, autoembed) via iframe
 */

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const rawTmdbId = searchParams.get("tmdb") || "";
        const contentType = searchParams.get("type") || "movie";
        const season = searchParams.get("season") || "1";
        const episode = searchParams.get("episode") || "1";

        const cleanId = rawTmdbId.replace(/\D/g, "");

        if (!cleanId) {
            return NextResponse.json(
                { error: "Invalid or missing TMDB ID" },
                { status: 400 }
            );
        }

        const errors: string[] = [];

        // Try working stream providers
        const providers = [
            // Nuviostream - Stremio addon format (returns actual m3u8 URLs)
            {
                name: "nuviostream",
                url: contentType === "tv"
                    ? `https://nuviostreams.hayd.uk/stream/series/tmdb:${cleanId}:${season}:${episode}.json`
                    : `https://nuviostreams.hayd.uk/stream/movie/tmdb:${cleanId}.json`,
                parser: (data: any) => data?.streams?.find((s: any) => s.url)?.url || data?.url,
            },
            // VidLink - Direct stream API
            {
                name: "vidlink",
                url: contentType === "tv"
                    ? `https://api.vidlink.pro/tv/${cleanId}/${season}/${episode}`
                    : `https://api.vidlink.pro/movie/${cleanId}`,
                parser: (data: any) => data?.sources?.[0]?.url || data?.url,
            },
            // RapidCloud - Direct streaming
            {
                name: "rapidcloud",
                url: contentType === "tv"
                    ? `https://rapidcloud.co/api/source/tv/${cleanId}/${season}/${episode}`
                    : `https://rapidcloud.co/api/source/movie/${cleanId}`,
                parser: (data: any) => data?.sources?.[0]?.url || data?.url,
            },
            // Upstream - Stream host
            {
                name: "upstream",
                url: contentType === "tv"
                    ? `https://upstream.to/api/source/tv/${cleanId}/${season}/${episode}`
                    : `https://upstream.to/api/source/movie/${cleanId}`,
                parser: (data: any) => data?.sources?.[0]?.url || data?.url,
            },
            // MovieStream API
            {
                name: "moviestream",
                url: contentType === "tv"
                    ? `https://moviestreamapi.com/api/tv/${cleanId}/season/${season}/episode/${episode}`
                    : `https://moviestreamapi.com/api/movie/${cleanId}`,
                parser: (data: any) => data?.url || data?.stream?.url || data?.link,
            },
        ];

        for (const provider of providers) {
            try {
                const res = await fetch(provider.url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Accept": "application/json",
                    },
                    signal: AbortSignal.timeout(4000),
                });

                if (res.ok) {
                    const data = await res.json() as any;
                    const streamUrl = provider.parser(data);

                    if (streamUrl && typeof streamUrl === "string" && streamUrl.length > 10) {
                        const streamType = streamUrl.includes(".m3u8") ? "m3u8" : "mp4";
                        return NextResponse.json({
                            url: streamUrl,
                            type: streamType,
                            provider: provider.name,
                        });
                    }
                }
                errors.push(`${provider.name}: HTTP ${res.status}`);
            } catch (err: any) {
                errors.push(`${provider.name}: ${err.message.substring(0, 30)}`);
            }
        }

        // Fallback to test stream
        const testUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
        return NextResponse.json({
            url: testUrl,
            type: "m3u8",
            provider: "test-fallback",
            errors: errors,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}