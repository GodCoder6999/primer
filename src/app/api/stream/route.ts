import { NextRequest, NextResponse } from "next/server";

// Standard direct test streams for native player verification
const TEST_STREAMS: Record<string, string> = {
    // Direct HLS (.m3u8) stream
    hls: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    // Direct MP4 stream (Big Buck Bunny)
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const rawTmdbId = searchParams.get("tmdb") || "";
        const type = searchParams.get("type") || "movie";
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

        // Providers to try in order - using AutoEmbed for reliable iframe embedding
        const endpoints = [
            // AutoEmbed (designed for embedding streaming content)
            type === "tv"
                ? `https://autoembed.cc/embed/tv/${cleanId}/${season}/${episode}`
                : `https://autoembed.cc/embed/movie/${cleanId}`,
            // 2Embed (alternative reliable source)
            type === "tv"
                ? `https://2embed.cc/embed/${cleanId}/s${season}e${episode}`
                : `https://2embed.cc/embed/${cleanId}`,
            // Smashystream fallback
            type === "tv"
                ? `https://embed.smashystream.com/playernew/tmdb/tv-${cleanId}-${season}-${episode}`
                : `https://embed.smashystream.com/playernew/tmdb/movie-${cleanId}`,
        ];

        for (const url of endpoints) {
            try {
                const res = await fetch(url, {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        Referer: "https://autoembed.cc/",
                    },
                    signal: AbortSignal.timeout(5000),
                });

                if (!res.ok) {
                    errors.push(`${url}: HTTP ${res.status}`);
                    continue;
                }

                // Try parsing as JSON first
                try {
                    const data = await res.json();

                    // Stremio Addon Response Format (streams array)
                    if (data?.streams && Array.isArray(data.streams)) {
                        const directStream = data.streams.find(
                            (s: any) =>
                                s.url && (s.url.includes(".m3u8") || s.url.includes(".mp4"))
                        ) || data.streams[0];

                        if (directStream?.url) {
                            return NextResponse.json({ m3u8Url: directStream.url, provider: "stremio" });
                        }
                    }

                    // Generic JSON response formats
                    if (data?.url || data?.streamUrl || data?.link) {
                        return NextResponse.json({
                            m3u8Url: data.url || data.streamUrl || data.link,
                            provider: "api-json",
                        });
                    }

                    errors.push(`${url}: No stream URL in JSON response`);
                } catch (jsonErr) {
                    // Response is HTML - iframe service is working (returns HTML page)
                    // For AutoEmbed/2Embed/Smashystream, return the embed URL as the stream source
                    // These services handle stream extraction internally when embedded
                    return NextResponse.json({
                        m3u8Url: url,
                        isEmbedUrl: true,
                        provider: url.includes("autoembed")
                            ? "autoembed"
                            : url.includes("2embed")
                            ? "2embed"
                            : "smashystream",
                    });
                }
            } catch (err: any) {
                errors.push(`${url}: ${err.message}`);
            }
        }

        // GUARANTEED FALLBACK: If public extractors return empty/fail, return working HLS stream
        return NextResponse.json({
            m3u8Url: TEST_STREAMS.hls,
            isFallback: true,
            errors: errors,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}