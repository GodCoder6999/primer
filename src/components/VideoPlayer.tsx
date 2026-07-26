"use client";

import React, { useEffect, useState } from "react";
import NativeVideoPlayer from "./NativeVideoPlayer";

export interface TitleProps {
  id?: string | number;
  tmdbId?: string | number;
  isSeries?: boolean;
}

export interface VideoPlayerProps {
  title: TitleProps;
  season?: number | string;
  episode?: number | string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  title,
  season = 1,
  episode = 1,
}) => {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isEmbedUrl, setIsEmbedUrl] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const targetId = String(title?.tmdbId || title?.id || "").replace(/\D/g, "");
  const isTv = Boolean(title?.isSeries);

  useEffect(() => {
    if (!targetId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchStream() {
      try {
        const query = new URLSearchParams({
          tmdb: targetId,
          type: isTv ? "tv" : "movie",
          season: String(season),
          episode: String(episode),
        });

        const res = await fetch(`/api/stream?${query.toString()}`);
        const data = await res.json();

        if (!res.ok || !data.m3u8Url) {
          throw new Error(data.error || "No valid stream URL returned");
        }

        if (isMounted) {
          setStreamUrl(data.m3u8Url);
          setIsEmbedUrl(data.isEmbedUrl || false);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load stream");
          setLoading(false);
        }
      }
    }

    fetchStream();

    return () => {
      isMounted = false;
    };
  }, [targetId, isTv, season, episode]);

  if (loading) {
    return (
      <div className="w-full aspect-video bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col items-center justify-center text-neutral-400">
        <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-medium">Resolving stream link...</p>
      </div>
    );
  }

  if (error || !streamUrl) {
    return (
      <div className="w-full aspect-video bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-500 font-semibold mb-2">Extraction Error</p>
        <p className="text-neutral-400 text-sm max-w-md">{error || "Unable to extract direct stream."}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <NativeVideoPlayer
        src={streamUrl}
        isEmbedUrl={isEmbedUrl}
        title={`Playing ID: ${targetId} ${isTv ? `S${season}:E${episode}` : ""}`}
      />
    </div>
  );
};

// Provides both default and named export to ensure compatibility
export default VideoPlayer;