import { NextRequest, NextResponse } from "next/server";

/**
 * Stream API - Torrentio only
 *
 * Torrentio: Proven-working Stremio addon for torrents
 * Returns magnet links + stream bridges
 *
 * Returns 404 if no torrents available for given content
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

        // Torrentio addon endpoint
        const torrentioUrl = contentType === "tv"
            ? `https://torrentio.strem.fun/stream/tv/${cleanId}/${season}/${episode}.json`
            : `https://torrentio.strem.fun/stream/movie/${cleanId}.json`;

        const res = await fetch(torrentioUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `Torrentio unavailable: ${res.status}` },
                { status: 503 }
            );
        }

        const data = await res.json() as any;

        // Check for torrent streams
        if (!data.streams || !Array.isArray(data.streams) || data.streams.length === 0) {
            return NextResponse.json(
                { error: "No torrents found for this content" },
                { status: 404 }
            );
        }

        // Get best quality torrent
        const torrentStream = data.streams[0];

        if (!torrentStream.url && !torrentStream.infoHash) {
            return NextResponse.json(
                { error: "Invalid torrent data" },
                { status: 500 }
            );
        }

        const magnetOrHash = torrentStream.url || torrentStream.infoHash;

        // Bridge services for torrent→HTTP streaming
        const webtorrentUrl = `https://webtorrent.io/api/stream?magnet=${encodeURIComponent(magnetOrHash)}`;
        const mediaflowUrl = `https://stream.mediaflow.plus/?magnet=${encodeURIComponent(magnetOrHash)}`;

        return NextResponse.json({
            url: magnetOrHash,
            type: "torrent",
            provider: "torrentio",
            title: torrentStream.title,
            quality: torrentStream.title?.match(/\d+p/)?.[0] || "unknown",
            fallbackUrls: [webtorrentUrl, mediaflowUrl],
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Stream fetch failed" },
            { status: 500 }
        );
    }
}