'use client';

import React, { use, useEffect, useState } from 'react';
import VideoPlayer from '@/components/VideoPlayer';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; season?: string; episode?: string }>;
}

export default function DetailPage({ params, searchParams }: PageProps) {
  const { id } = use(params);
  const resolvedSearchParams = use(searchParams);

  const [streamData, setStreamData] = useState<{ url: string; isEmbed: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStream() {
      try {
        setLoading(true);
        const mediaType = resolvedSearchParams.type || 'movie';
        const season = resolvedSearchParams.season || '1';
        const episode = resolvedSearchParams.episode || '1';

        const res = await fetch(
          `/api/stream?tmdbId=${id}&type=${mediaType}&season=${season}&episode=${episode}`
        );
        const data = await res.json();

        if (data.streams && data.streams.length > 0) {
          const selected = data.streams[0];
          setStreamData({
            url: selected.url,
            isEmbed: selected.type === 'embed' || selected.url.includes('/embed/')
          });
        }
      } catch (err) {
        console.error('Failed to load stream:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStream();
  }, [id, resolvedSearchParams]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black text-white flex items-center justify-center">
        Loading stream...
      </div>
    );
  }

  return (
    <main className="w-full h-screen bg-black">
      <VideoPlayer
        streamUrl={streamData?.url}
        isEmbed={streamData?.isEmbed}
        title="House of the Dragon"
      />
    </main>
  );
}
