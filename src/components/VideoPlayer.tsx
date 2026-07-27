'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  streamUrl?: string;
  title?: string;
  isEmbed?: boolean;
}

export default function VideoPlayer({ streamUrl, title = 'Disclosure Day', isEmbed }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-detect if the stream URL is an iframe embed or an m3u8 stream
  const isIframeEmbed =
    isEmbed ||
    (streamUrl && (streamUrl.includes('/embed/') || streamUrl.includes('vidsrc') || streamUrl.includes('vixsrc')));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl || isIframeEmbed) return;

    // Attach HLS stream to HTML5 video element using hls.js
    if (streamUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        return () => hls.destroy();
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      }
    } else {
      video.src = streamUrl;
    }
  }, [streamUrl, isIframeEmbed]);

  if (!streamUrl) {
    return (
      <div className="w-full h-screen bg-black text-white flex items-center justify-center">
        Loading stream...
      </div>
    );
  }

  // =========================================================================
  // CASE 1: EXTERNAL EMBED (Hide Custom Prime UI so 2 players don't overlap)
  // =========================================================================
  if (isIframeEmbed) {
    return (
      <div className="relative w-full h-screen bg-black">
        <iframe
          src={streamUrl}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      </div>
    );
  }

  // =========================================================================
  // CASE 2: DIRECT HLS STREAM (.m3u8) -> Render YOUR Custom Player & Controls
  // =========================================================================
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden group">
      {/* 1. Native HTML5 Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={() => {
          if (videoRef.current) {
            videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
          }
        }}
      />

      {/* 2. Custom Prime Video Overlay Controls */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-black/80 via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {/* Top Header / X-Ray */}
        <div className="flex items-center justify-between text-white pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xl">X-Ray</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">IMDb</span>
          </div>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>

        {/* Center Skip & Play Controls */}
        <div className="flex items-center justify-center gap-8 pointer-events-auto">
          <button
            onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }}
            className="text-white text-xl p-3 bg-black/50 rounded-full hover:bg-black/80"
          >
            ↺ 10
          </button>

          <button
            onClick={() => {
              if (videoRef.current) {
                isPlaying ? videoRef.current.pause() : videoRef.current.play();
              }
            }}
            className="text-white text-3xl p-5 bg-black/60 rounded-full hover:bg-black/90"
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          <button
            onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }}
            className="text-white text-xl p-3 bg-black/50 rounded-full hover:bg-black/80"
          >
            ↻ 10
          </button>
        </div>

        {/* Bottom Timeline Control */}
        <div className="w-full flex items-center gap-4 text-white text-sm pointer-events-auto">
          <input
            type="range"
            min={0}
            max={videoRef.current?.duration || 100}
            value={videoRef.current?.currentTime || 0}
            onChange={(e) => {
              if (videoRef.current) {
                videoRef.current.currentTime = Number(e.target.value);
              }
            }}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
