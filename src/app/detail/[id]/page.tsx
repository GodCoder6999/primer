'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';

export default function DetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';
  const type = searchParams.get('type') || (season && episode ? 'tv' : 'movie');

  const [streamData, setStreamData] = useState<{ url?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchStream() {
      try {
        const res = await fetch(`/api/stream?tmdbId=${id}&type=${type}&season=${season}&episode=${episode}`);
        const data = await res.json();

        if (data.success && data.streams && data.streams.length > 0) {
          setStreamData(data.streams[0]);
        } else {
          setError(data.error || 'No streams found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch stream.');
      } finally {
        setLoading(false);
      }
    }

    fetchStream();
  }, [id, type, season, episode]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl animate-pulse">Loading stream...</p>
      </div>
    );
  }

  if (error || !streamData?.url) {
    return (
      <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-center gap-2">
        <p className="text-xl font-bold">Stream Unavailable</p>
        <p className="text-sm text-gray-400">{error || 'Could not resolve a valid media source.'}</p>
      </div>
    );
  }

  return (
    <main className="w-full h-screen bg-black overflow-hidden">
      <VideoPlayer
        streamUrl={streamData.url}
        title="House of the Dragon"
      />
    </main>
  );
}
