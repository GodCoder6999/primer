'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  streamUrl?: string;
  title?: string;
}

export default function VideoPlayer({ streamUrl, title = 'Disclosure Day' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    // Block any attempt to load an iframe embed URL into the custom player
    if (streamUrl.includes('/embed/') || streamUrl.includes('vidsrc')) {
      setHasError(true);
      return;
    }

    if (streamUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) setHasError(true);
        });

        return () => hls.destroy();
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      }
    } else {
      video.src = streamUrl;
    }
  }, [streamUrl]);

  if (!streamUrl || hasError || streamUrl.includes('/embed/')) {
    return (
      <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-center gap-2">
        <p className="text-xl font-bold">Custom Player Error</p>
        <p className="text-sm text-gray-400">Embedded players are disabled. Waiting for a valid direct .m3u8 stream...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden group">
      {/* Native HTML5 Video Driven Exclusively by Your Custom Code */}
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

      {/* Custom Prime Video Overlay Controls */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-black/80 via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {/* Top Header */}
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
            className="text-white text-xl p-3 bg-black/50 rounded-full hover:bg-black/85 transition"
          >
            ↺ 10
          </button>

          <button
            onClick={() => {
              if (videoRef.current) {
                isPlaying ? videoRef.current.pause() : videoRef.current.play();
              }
            }}
            className="text-white text-3xl p-5 bg-black/60 rounded-full hover:bg-black/90 transition"
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          <button
            onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }}
            className="text-white text-xl p-3 bg-black/50 rounded-full hover:bg-black/85 transition"
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
