"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ImageSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  afterFilter?: string;
}

export function ImageSlider({
  beforeImage,
  afterImage,
  beforeLabel = "\uc6d0\ubcf8",
  afterLabel = "AI \ud5e4\ub4dc\uc0f7",
  className = "",
  afterFilter = "",
}: ImageSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Keep track of container width for accurate clipping
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl border border-slate-200 shadow-xl bg-slate-900 aspect-[3/4] cursor-ew-resize ${className}`}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
      role="slider"
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Before and After image comparison slider"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          setSliderPosition((prev) => Math.max(0, prev - 5));
        } else if (e.key === "ArrowRight") {
          setSliderPosition((prev) => Math.min(100, prev + 5));
        }
      }}
    >
      {/* ── After Image (Full width background) ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterImage}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: afterFilter || undefined }}
      />

      {/* ── Before Image (Clipped overlay) ── */}
      <div
        className="absolute top-0 bottom-0 left-0 overflow-hidden z-10"
        style={{ width: `${sliderPosition}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="absolute top-0 left-0 h-full object-cover max-w-none"
          style={{ width: containerWidth ? `${containerWidth}px` : "100%" }}
        />
      </div>

      {/* ── Label Badges ── */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          {beforeLabel}
        </span>
      </div>
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/90 backdrop-blur-md text-white text-xs font-semibold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-indigo-200 animate-pulse" />
          {afterLabel}
        </span>
      </div>

      {/* ── Slider Divider Bar & Handle ── */}
      <div
        className="absolute top-0 bottom-0 z-30 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)]"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-slate-800 shadow-2xl flex items-center justify-center border-2 border-indigo-500 hover:scale-110 active:scale-95 transition-transform cursor-ew-resize">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" className="-translate-x-1" />
            <polyline points="15 18 9 12 15 6" className="translate-x-1" />
          </svg>
        </div>
      </div>
    </div>
  );
}
