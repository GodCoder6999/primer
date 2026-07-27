import { NextRequest, NextResponse } from "next/server";

/**
 * Stream API - Torrentio with TMDB→IMDb conversion
 *
 * Torrentio requires IMDb IDs (not TMDB IDs)
 * Fetches IMDb IDs from TMDB API for any TMDB ID
 */

// Cache IMDb IDs to avoid repeated API calls
const imdbIdCache: Record<string, string> = {
    "550": "tt0137523",      // Fight Club
    "278": "tt0111161",      // Shawshank Redemption
    "238": "tt0068646",      // The Godfather
    "1275779": "tt15047880", // Disclosure Day
};

async function getTmdbExternalIds(tmdbId: string, isSeries: boolean): Promise<string | null> {
    // Check cache first
    if (imdbIdCache[tmdbId]) {
        return imdbIdCache[tmdbId];
    }

    try {
        const apiKey = process.env.TMDB_API_KEY;
        if (!apiKey) {
            console.error("TMDB_API_KEY not configured");
            return null;
        }

        // Fetch IMDb ID from TMDB API
        const endpoint = isSeries
            ? `https://api.themoviedb.org/3/tv/${tmdbId}/external_ids?api_key=${apiKey}`
            : `https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${apiKey}`;

        const res = await fetch(endpoint, {
            signal: AbortSignal.timeout(3000),
        });

        if (!res.ok) {
            console.error(`TMDB API error: ${res.status} for TMDB ID ${tmdbId}`);
            return null;
        }

        const data = (await res.json()) as any;
        const imdbId = data.imdb_id;

        if (imdbId) {
            // Cache for future requests
            imdbIdCache[tmdbId] = imdbId;
            return imdbId;
        }

        return null;
    } catch (error) {
        console.error(`Failed to fetch IMDb ID for TMDB ${tmdbId}:`, error);
        return null;
    }
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

        // Try Stremio addons that provide HTTP streams (not torrents)
        // Using various sources for better coverage
        const addonEndpoints = [
            // Popcorntime streams
            `https://popcorntime.strem.fun/stream/movie/${cleanId}.json`,
            // YIFY streams
            `https://mediafusion.strem.fun/stream/movie/${cleanId}.json`,
            // ElfHosted streams
            `https://mflix.elfhosted.com/stream/movie/${cleanId}.json`,
        ];

        for (const addonUrl of addonEndpoints) {
            try {
                const res = await fetch(addonUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    },
                    signal: AbortSignal.timeout(3000),
                });

                if (!res.ok) continue;

                const data = await res.json() as any;

                // Look for HTTP/HLS streams (not torrents)
                const httpStreams = data.streams?.filter((s: any) =>
                    s.url && (s.url.startsWith("http") || s.url.includes(".m3u8"))
                ) || [];

                if (httpStreams.length > 0) {
                    const stream = httpStreams[0];
                    return NextResponse.json({
                        url: stream.url,
                        type: stream.url.includes(".m3u8") ? "m3u8" : "mp4",
                        provider: addonUrl.split("/")[2],
                        title: stream.title,
                        quality: stream.title?.match(/\d+p/)?.[0] || "auto",
                    });
                }
            } catch {}
        }

        // Fallback: Try Torrentio with IMDb ID conversion
        const isSeries = contentType === "tv";
        const imdbId = await getTmdbExternalIds(cleanId, isSeries);

        if (!imdbId) {
            return NextResponse.json(
                { error: "No streams available" },
                { status: 404 }
            );
        }

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
                { error: `No streams found` },
                { status: 503 }
            );
        }

        const data = await res.json() as any;

        if (!data.streams || !Array.isArray(data.streams) || data.streams.length === 0) {
            return NextResponse.json(
                { error: "No streams available" },
                { status: 404 }
            );
        }

        // Filter streams: exclude 2160p/4K and >4GB (webtor works best with 480p-1080p, <4GB)
        const filteredStreams = data.streams.filter((s: any) => {
            const title = s.title || "";
            const is4k = /2160p|4k|uhd/i.test(title);
            const sizeMatch = title.match(/([\d.]+)\s*(?:gb|mb)/i);
            const sizeGB = sizeMatch ? parseFloat(sizeMatch[1]) : 0;
            const isTooLarge = /GB/i.test(sizeMatch?.[0] || "") && sizeGB > 4;

            return !is4k && !isTooLarge;
        });

        const torrentStreams = filteredStreams.length > 0 ? filteredStreams : data.streams;
        const torrentStream = torrentStreams[0];
        const infoHash = torrentStream.infoHash || torrentStream.url;

        if (!infoHash) {
            return NextResponse.json(
                { error: "No stream data available" },
                { status: 500 }
            );
        }

        const magnetUrl = `magnet:?xt=urn:btih:${infoHash}`;

        // Try Instant.io API for reliable magnet streaming
        try {
            const instantUrl = `https://instant.io/get?magnet=${encodeURIComponent(magnetUrl)}&timeout=60`;
            const instantRes = await fetch(instantUrl, {
                signal: AbortSignal.timeout(5000),
            });

            if (instantRes.ok) {
                const instantData = await instantRes.json() as any;
                if (instantData.url) {
                    return NextResponse.json({
                        url: instantData.url,
                        type: "mp4",
                        provider: "torrentio + instant.io",
                        title: torrentStream.title,
                        quality: torrentStream.title?.match(/\d+p/)?.[0] || "auto",
                    });
                }
            }
        } catch (err) {
            console.log("Instant.io unavailable, trying alternatives");
        }

        // Try Webtor.io API for direct HTTP streaming
        try {
            const webtorUrl = `https://api.webtor.io/stream/get?magnet=${encodeURIComponent(magnetUrl)}&timeout=30000`;
            const webtorRes = await fetch(webtorUrl, {
                signal: AbortSignal.timeout(5000),
            });

            if (webtorRes.ok) {
                const webtorData = await webtorRes.json() as any;
                if (webtorData.url) {
                    return NextResponse.json({
                        url: webtorData.url,
                        type: "m3u8",
                        provider: "torrentio + webtor",
                        title: torrentStream.title,
                        quality: torrentStream.title?.match(/\d+p/)?.[0] || "auto",
                    });
                }
            }
        } catch (err) {
            console.log("Webtor API unavailable");
        }

        // Try webtorrent bridge
        try {
            const webtorrentUrl = `https://webtorrent.io/api/stream?magnet=${encodeURIComponent(magnetUrl)}`;
            const wtRes = await fetch(webtorrentUrl, {
                signal: AbortSignal.timeout(3000),
            });
            if (wtRes.ok) {
                return NextResponse.json({
                    url: webtorrentUrl,
                    type: "m3u8",
                    provider: "torrentio + webtorrent",
                    title: torrentStream.title,
                    quality: torrentStream.title?.match(/\d+p/)?.[0] || "auto",
                });
            }
        } catch {}

        // Try mediaflow bridge
        try {
            const mediaflowUrl = `https://stream.mediaflow.plus/?magnet=${encodeURIComponent(magnetUrl)}`;
            const mfRes = await fetch(mediaflowUrl, {
                signal: AbortSignal.timeout(3000),
            });
            if (mfRes.ok) {
                return NextResponse.json({
                    url: mediaflowUrl,
                    type: "m3u8",
                    provider: "torrentio + mediaflow",
                    title: torrentStream.title,
                    quality: torrentStream.title?.match(/\d+p/)?.[0] || "auto",
                });
            }
        } catch {}

        // Fallback: return magnet link (torrent client required)
        // To enable direct playback: integrate Real Debrid API (paid) or AllDebrid API (paid)
        return NextResponse.json({
            url: magnetUrl,
            type: "torrent",
            provider: "torrentio",
            title: torrentStream.title,
            quality: torrentStream.title?.match(/\d+p/)?.[0] || "auto",
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Stream fetch failed" },
            { status: 500 }
        );
    }
}