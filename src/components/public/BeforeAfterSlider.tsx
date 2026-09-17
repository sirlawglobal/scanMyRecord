"use client";

import { useCallback, useRef, useState } from "react";

type BeforeAfterSliderProps = {
  beforeUrl: string;
  afterUrl: string;
  title: string;
};

export default function BeforeAfterSlider({ beforeUrl, afterUrl, title }: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPercent(Math.min(100, Math.max(0, ratio)));
  }, []);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    setIsDragging(true);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    updateFromClientX(event.clientX);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    updateFromClientX(event.clientX);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    setIsDragging(false);
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      setPercent((p) => Math.max(0, p - 5));
    } else if (event.key === "ArrowRight") {
      setPercent((p) => Math.min(100, p + 5));
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-3xl shadow-elevated"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* After image — full base layer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={afterUrl} alt={`${title} — after`} className="pointer-events-none absolute inset-0 h-full w-full object-cover" draggable={false} />
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
        After
      </span>

      {/* Before image — clipped overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beforeUrl} alt={`${title} — before`} className="h-full w-full object-cover" draggable={false} />
        <span className="absolute left-3 top-3 rounded-full bg-navy-950/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
          Before
        </span>
      </div>

      {/* Divider + drag handle */}
      <div
        className="absolute inset-y-0 z-10 flex w-0 -translate-x-1/2 cursor-ew-resize items-center justify-center"
        style={{ left: `${percent}%` }}
      >
        <div className="absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" />
        <div
          role="slider"
          tabIndex={0}
          aria-label={`Comparison slider for ${title}`}
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          onKeyDown={handleKeyDown}
          className="relative flex h-10 w-10 cursor-ew-resize items-center justify-center rounded-full border-2 border-white bg-navy-900/90 text-white shadow-xl transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold-400"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 7L3 12l5 5M16 7l5 5-5 5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
