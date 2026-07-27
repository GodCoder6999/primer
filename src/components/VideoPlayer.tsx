'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface Stream {
  type: 'hls' | 'http_range' | 'embed';
  url: string;
  headers?: Record<string, string>;
}

export default function CustomVideoPlayer({ stream }: { stream: Stream | null }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream || stream.type === 'embed') return;

    // 1. Direct HLS (.m3u8) Playback using hls.js
    if (stream.type === 'hls' && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(stream.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => console.log('Autoplay blocked'));
      });

      return () => {
        hls.destroy();
      };
    } 
    // 2. Native Safari / Mobile HLS support
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream.url;
    } 
    // 3. Direct MP4 playback
    else {
      video.src = stream.url;
    }
  }, [stream]);

  if (!stream) {
    return <div className="text-white text-center p-8">Loading stream...</div>;
  }

  // Fallback: If only an embed iframe exists, hide custom controls to avoid overlapping
  if (stream.type === 'embed') {
    return (
      <div className="relative w-full h-screen bg-black">
        <iframe
          src={stream.url}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
      </div>
    );
  }

  // Proper Custom Player Structure
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden group">
      {/* 1. Raw HTML5 Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={() => {
          if (videoRef.current) {
            videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
          }
        }}
      />

      {/* 2. Your Single Custom UI Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none group-hover:opacity-100 transition-opacity">
        {/* Top Header / X-Ray */}
        <div className="pointer-events-auto flex items-center justify-between text-white">
          <h1 className="text-2xl font-bold">Disclosure Day</h1>
        </div>

        {/* Center Play/Pause Controls */}
        <div className="pointer-events-auto flex items-center justify-center gap-8">
          <button 
            onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }}
            className="text-white text-2xl p-4 bg-black/40 rounded-full hover:bg-black/70"
          >
            ↺ 10
          </button>
          
          <button 
            onClick={() => {
              if (videoRef.current) {
                isPlaying ? videoRef.current.pause() : videoRef.current.play();
              }
            }}
            className="text-white text-4xl p-6 bg-black/50 rounded-full hover:bg-black/80"
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          <button 
            onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }}
            className="text-white text-2xl p-4 bg-black/40 rounded-full hover:bg-black/70"
          >
            ↻ 10
          </button>
        </div>

        {/* Bottom Timeline Controls */}
        <div className="pointer-events-auto w-full flex items-center gap-4">
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
            className="w-full accent-red-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
