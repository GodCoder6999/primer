import { NextRequest, NextResponse } from "next/server";

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

        // MovieStreamAPI - primary provider (multiple endpoints)
        const moviestreamEndpoints = [
            contentType === "tv"
                ? `https://moviestreamapi.com/api/tv/${cleanId}/season/${season}/episode/${episode}`
                : `https://moviestreamapi.com/api/movie/${cleanId}`,
            contentType === "tv"
                ? `https://api.moviestream.com/tv/${cleanId}/s${season}e${episode}`
                : `https://api.moviestream.com/movie/${cleanId}`,
        ];

        for (const endpoint of moviestreamEndpoints) {
            try {
                const res = await fetch(endpoint, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Accept": "application/json",
                    },
                    signal: AbortSignal.timeout(5000),
                });

                if (res.ok) {
                    const data = await res.json() as any;

                    const streamUrl =
                        data.url ||
                        data.stream?.url ||
                        data.sources?.[0]?.url ||
                        data.link ||
                        data.m3u8 ||
                        data.hls?.url ||
                        data.playback_url ||
                        data.result?.url;

                    if (streamUrl && typeof streamUrl === "string") {
                        // Detect stream type from URL
                        const streamType = streamUrl.includes(".m3u8") ? "m3u8" : "mp4";

                        return NextResponse.json({
                            url: streamUrl,
                            type: streamType,
                            provider: "moviestreamapi",
                        });
                    }
                }
                errors.push(`MovieStream: HTTP ${res.status}`);
            } catch (err: any) {
                errors.push(`MovieStream: ${err.message}`);
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