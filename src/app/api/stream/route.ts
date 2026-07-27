import { NextRequest, NextResponse } from "next/server";

/**
 * Stream API - Free Streaming APIs with Failover
 *
 * Primary: ezvidapi (direct HLS)
 * Fallback: apiplayer, SuperEmbed
 * All free, no auth required, direct HTTP/HLS streams
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
                { error: "Invalid TMDB ID" },
                { status: 400 }
            );
        }

        console.log(`[Stream] Requesting: tmdb=${cleanId}, type=${contentType}`);

        // Try ezvidapi (best, direct HLS)
        try {
            console.log(`[Stream] Trying ezvidapi...`);
            const endpoint = contentType === "tv"
                ? `https://ezvidapi.com/api/tv/${cleanId}?season=${season}&episode=${episode}`
                : `https://ezvidapi.com/api/movie/${cleanId}`;

            const res = await fetch(endpoint, {
                signal: AbortSignal.timeout(10000),
            });

            if (res.ok) {
                const data = (await res.json()) as any;
                if (data.url && data.url.includes("m3u8")) {
                    console.log(`[Stream] ✓ ezvidapi SUCCESS`);
                    return NextResponse.json({
                        url: data.url,
                        type: "m3u8",
                        provider: "ezvidapi",
                        quality: "auto",
                    });
                }
            }
        } catch (err: any) {
            console.log(`[Stream] ezvidapi error: ${err?.message}`);
        }

        // Try apiplayer (great alternative)
        try {
            console.log(`[Stream] Trying apiplayer...`);
            const embedUrl = contentType === "tv"
                ? `https://apiplayer.ru/embed/tv/${cleanId}/${season}/${episode}`
                : `https://apiplayer.ru/embed/movie/${cleanId}`;

            const res = await fetch(embedUrl, {
                signal: AbortSignal.timeout(8000),
            });

            if (res.ok) {
                const html = await res.text();
                const m3u8Match = html.match(/https:\/\/[^\s"'<>]+\.m3u8/);

                if (m3u8Match) {
                    console.log(`[Stream] ✓ apiplayer SUCCESS`);
                    return NextResponse.json({
                        url: m3u8Match[0],
                        type: "m3u8",
                        provider: "apiplayer",
                        quality: "auto",
                    });
                }

                // Return embed URL if direct stream not found
                if (html.length > 0) {
                    console.log(`[Stream] apiplayer embed available`);
                    return NextResponse.json({
                        url: embedUrl,
                        type: "embed",
                        provider: "apiplayer",
                        quality: "auto",
                    });
                }
            }
        } catch (err: any) {
            console.log(`[Stream] apiplayer error: ${err?.message}`);
        }

        // Try SuperEmbed (backup)
        try {
            console.log(`[Stream] Trying SuperEmbed...`);
            const embedUrl = `https://www.superembed.stream/embed/movie/${cleanId}`;

            const res = await fetch(embedUrl, {
                signal: AbortSignal.timeout(8000),
            });

            if (res.ok) {
                console.log(`[Stream] ✓ SuperEmbed SUCCESS`);
                return NextResponse.json({
                    url: embedUrl,
                    type: "embed",
                    provider: "superembed",
                    quality: "auto",
                });
            }
        } catch (err: any) {
            console.log(`[Stream] SuperEmbed error: ${err?.message}`);
        }

        // All providers failed
        console.log(`[Stream] All providers exhausted`);
        return NextResponse.json(
            { error: "No streams available from any provider" },
            { status: 503 }
        );
    } catch (error: any) {
        console.error(`[Stream] Error:`, error);
        return NextResponse.json(
            { error: error?.message || "Stream fetch failed" },
            { status: 500 }
        );
    }
}
