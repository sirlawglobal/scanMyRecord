"use client";

import { useEffect, useRef } from "react";

export type CoverMedia = { url: string; type: "image" | "video" };

/** First media item (the order admins set) decides the cover; falls back to the flat image list. */
export function pickCover(
  media: { url: string; type: "image" | "video" }[] | undefined,
  images: string[] | undefined,
): CoverMedia | null {
  const first = media?.find((item) => item.url);

  if (first) {
    return { url: first.url, type: first.type };
  }

  return images?.[0] ? { url: images[0], type: "image" } : null;
}

// Cloudinary can render a still frame of a video, which gives the card an
// instant poster before any video bytes are downloaded.
function posterFor(url: string): string | undefined {
  if (!url.includes("res.cloudinary.com") || !url.includes("/video/upload/")) {
    return undefined;
  }

  return url.replace("/video/upload/", "/video/upload/so_0,f_jpg,q_auto,w_800/").replace(/\.[a-z0-9]+$/i, ".jpg");
}

export default function ProjectCover({
  cover,
  title,
  fallbackLabel,
}: {
  cover: CoverMedia | null;
  title: string;
  fallbackLabel: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = cover?.type === "video";

  // Play muted while the card is on screen, pause when it scrolls away so a
  // page of cards never streams several videos at once off-screen.
  useEffect(() => {
    const video = videoRef.current;

    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay can be blocked (data saver, low power mode); the poster stays visible.
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [cover?.url]);

  if (!cover) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
        <span className="text-xs font-bold uppercase tracking-[0.22em] text-white/30">{fallbackLabel}</span>
      </div>
    );
  }

  if (!isVideo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cover.url}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    );
  }

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        src={`${cover.url}#t=0.1`}
        poster={posterFor(cover.url)}
        aria-label={`${title} video preview`}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        Video
      </span>
    </div>
  );
}
