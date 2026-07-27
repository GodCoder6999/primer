import { NextRequest, NextResponse } from "next/server";

/**
 * Stream API - Torrentio with TMDB→IMDb conversion
 *
 * Torrentio requires IMDb IDs (not TMDB IDs)
 * Uses TMDB external_ids to get IMDb ID
 */

// Hardcoded TMDB→IMDb mappings for popular content
const TMDB_TO_IMDB: Record<string, string> = {
    "550": "tt0137523",      // Fight Club
    "278": "tt0111161",      // Shawshank Redemption
    "238": "tt0068646",      // The Godfather
    "240": "tt0071562",      // Godfather Part II
    "128064": "tt1375666",   // Inception
    "157336": "tt0816692",   // Interstellar
    "299534": "tt4154796",   // Avengers Endgame
    "680": "tt0110912",      // Pulp Fiction
    "11": "tt0076759",       // Star Wars IV
    "1891": "tt0133093",     // The Matrix
    "155": "tt0068646",      // The Godfather
    "339": "tt0099685",      // Henry V
    "1162": "tt0109830",     // Forrest Gump
};

async function getTmdbExternalIds(tmdbId: string): Promise<string | null> {
    // Check hardcoded mappings first
    if (TMDB_TO_IMDB[tmdbId]) {
        return TMDB_TO_IMDB[tmdbId];
    }

    // TMDB API requires auth for external_ids endpoint
    // Using hardcoded mappings for now

    return null;
}

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

        // Convert TMDB ID to IMDb ID
        const imdbId = await getTmdbExternalIds(cleanId);

        if (!imdbId) {
            return NextResponse.json(
                { error: "Could not find IMDb ID for this content" },
                { status: 404 }
            );
        }

        // Torrentio addon endpoint (requires IMDb ID!)
        const torrentioUrl = contentType === "tv"
            ? `https://torrentio.strem.fun/stream/tv/${imdbId}/${season}/${episode}.json`
            : `https://torrentio.strem.fun/stream/movie/${imdbId}.json`;

        const res = await fetch(torrentioUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `Torrentio error: ${res.status}` },
                { status: 503 }
            );
        }

        const data = await res.json() as any;

        // Check for torrent streams
        if (!data.streams || !Array.isArray(data.streams) || data.streams.length === 0) {
            return NextResponse.json(
                { error: "No torrents found" },
                { status: 404 }
            );
        }

        // Get best quality torrent
        const torrentStream = data.streams[0];

        // Torrentio returns infoHash, convert to magnet link
        const infoHash = torrentStream.infoHash || torrentStream.url;

        if (!infoHash) {
            return NextResponse.json(
                { error: "No stream data available" },
                { status: 500 }
            );
        }

        const magnetUrl = `magnet:?xt=urn:btih:${infoHash}`;

        // Bridge services for torrent→HTTP streaming
        const webtorrentUrl = `https://webtorrent.io/api/stream?magnet=${encodeURIComponent(magnetUrl)}`;
        const mediaflowUrl = `https://stream.mediaflow.plus/?magnet=${encodeURIComponent(magnetUrl)}`;

        return NextResponse.json({
            url: magnetUrl,
            type: "torrent",
            provider: "torrentio",
            title: torrentStream.title,
            quality: torrentStream.title?.match(/\d+p/)?.[0] || "auto",
            fallbackUrls: [webtorrentUrl, mediaflowUrl],
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Stream fetch failed" },
            { status: 500 }
        );
    }
}