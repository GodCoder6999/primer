"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export interface NativeVideoPlayerProps {
    src: string;
    poster?: string;
    title?: string;
    isEmbedUrl?: boolean;
}

export const NativeVideoPlayer: React.FC<NativeVideoPlayerProps> = ({
    src,
    poster,
    title,
    isEmbedUrl = false,
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!src) return;

        setLoading(true);
        setError(null);

        // Embed URL - use iframe instead of video tag
        if (isEmbedUrl) {
            const iframe = iframeRef.current;
            if (iframe) {
                iframe.src = src;
                iframe.onload = () => setLoading(false);
                iframe.onerror = () => {
                    setError("Failed to load embedded player.");
                    setLoading(false);
                };
            }
            return;
        }

        // Video URL - use HTML5 video player
        const video = videoRef.current;
        if (!video) return;

        // Destroy any existing HLS instance before loading a new URL
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        const isHls = src.includes(".m3u8");

        if (isHls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });

            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setLoading(false);
            });

            hls.on(Hls.Events.ERROR, (_evt, data) => {
                if (data.fatal) {
                    setError("Failed to load native HLS stream.");
                    setLoading(false);
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl") || !isHls) {
            // Native MP4 or Native Safari HLS support
            video.src = src;

            const handleLoaded = () => setLoading(false);
            const handleError = () => {
                setError("Error loading video source.");
                setLoading(false);
            };

            video.addEventListener("loadeddata", handleLoaded);
            video.addEventListener("error", handleError);

            return () => {
                video.removeEventListener("loadeddata", handleLoaded);
                video.removeEventListener("error", handleError);
            };
        } else {
            setError("HLS playback is not supported in this browser.");
            setLoading(false);
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [src, isEmbedUrl]);

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-neutral-800 shadow-2xl group">
            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-10">
                    <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full mb-3" />
                    <p className="text-sm font-medium">Loading stream...</p>
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-red-500 z-10 p-4 text-center">
                    <p className="text-sm font-semibold">{error}</p>
                </div>
            )}

            {/* Embedded Player (for AutoEmbed, 2Embed, etc.) */}
            {isEmbedUrl ? (
                <iframe
                    ref={iframeRef}
                    className="w-full h-full border-none"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                />
            ) : (
                /* HTML5 Video Element */
                <video
                    ref={videoRef}
                    controls
                    autoPlay
                    playsInline
                    poster={poster}
                    className="w-full h-full object-contain"
                >
                    Your browser does not support HTML5 video playback.
                </video>
            )}

            {/* Optional Overlay Title */}
            {title && (
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="text-white text-sm font-medium drop-shadow">{title}</p>
                </div>
            )}
        </div>
    );
};

export default NativeVideoPlayer;