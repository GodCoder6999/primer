import { NextRequest, NextResponse } from "next/server";

/**
 * Stream API using Torrentio addon + torrent-to-HTTP bridge
 *
 * Torrentio: Proven working Stremio addon for torrents
 * Returns magnet links, converted to playable streams via:
 * - WebTorrent (client-side streaming)
 * - TorrentStreaming services (server-side bridges)
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

        // Torrentio addon - PRIMARY PROVIDER
        try {
            const torrentioUrl = contentType === "tv"
                ? `https://torrentio.strem.fun/stream/tv/${cleanId}/${season}/${episode}.json`
                : `https://torrentio.strem.fun/stream/movie/${cleanId}.json`;

            const res = await fetch(torrentioUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
                signal: AbortSignal.timeout(5000),
            });

            if (res.ok) {
                const data = await res.json() as any;

                // Torrentio returns array of torrent streams
                if (data.streams && Array.isArray(data.streams) && data.streams.length > 0) {
                    // Get best quality torrent (usually first one)
                    const torrentStream = data.streams[0];

                    if (torrentStream.url || torrentStream.infoHash) {
                        // Convert magnet to playable stream URL
                        // Using TorrentStream bridge service
                        const magnetOrHash = torrentStream.url || torrentStream.infoHash;

                        // Option 1: Use WebTorrent-based streaming service
                        const webtorrentUrl = `https://webtorrent.io/api/stream?magnet=${encodeURIComponent(magnetOrHash)}`;

                        // Option 2: Use MediaFlow torrent streaming
                        const mediaflowUrl = `https://stream.mediaflow.plus/?magnet=${encodeURIComponent(magnetOrHash)}`;

                        return NextResponse.json({
                            url: magnetOrHash, // Return magnet or hash
                            type: "torrent",
                            provider: "torrentio",
                            title: torrentStream.title,
                            quality: torrentStream.title?.match(/\d+p/) || "auto",
                            // Alternative streaming URLs if torrent fails
                            fallbackUrls: [webtorrentUrl, mediaflowUrl],
                        });
                    }
                }
                errors.push("Torrentio: No streams found for ID");
            } else {
                errors.push(`Torrentio: HTTP ${res.status}`);
            }
        } catch (err: any) {
            errors.push(`Torrentio: ${err.message}`);
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