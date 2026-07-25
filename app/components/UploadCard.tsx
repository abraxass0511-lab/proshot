"use client";

import { useState, useRef, useCallback, useEffect, type ChangeEvent } from "react";
import { ImageSlider } from "./ImageSlider";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type StyleOption = "corporate" | "studio" | "outdoor";
type ModelOption = "compare" | "gemini-3.1-flash-image" | "gemini-2.0-flash-exp";

interface StyleCard {
  value: StyleOption;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
const DEMO_LIMIT = 2;
const LS_USES_KEY = "proshot_uses";
const LS_BYOK_KEY = "proshot_byok";
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

/* ------------------------------------------------------------------ */
/*  Style cards data                                                   */
/* ------------------------------------------------------------------ */

const STYLE_OPTIONS: StyleCard[] = [
  {
    value: "corporate",
    label: "\ube44\uc988\ub2c8\uc2a4 \uc815\uc7a5",
    desc: "\uc804\ubb38\uc801\uc778 \ud504\ub85c\ud544",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    value: "studio",
    label: "\uc2a4\ud29c\ub514\uc624",
    desc: "\uae54\ub054\ud55c \ubc30\uacbd",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    value: "outdoor",
    label: "\uc57c\uc678 \uc790\uc5f0\uad11",
    desc: "\ub530\ub73b\ud55c \ubd84\uc704\uae30",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function UploadCard() {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [style, setStyle] = useState<StyleOption>("corporate");
  const [targetModel, setTargetModel] = useState<ModelOption>("compare");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Result state
  const [resultUrl31, setResultUrl31] = useState<string | null>(null);
  const [resultUrl20, setResultUrl20] = useState<string | null>(null);
  const [singleResultUrl, setSingleResultUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Demo limit & BYOK state
  const [usesLeft, setUsesLeft] = useState(DEMO_LIMIT);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [byokKey, setByokKey] = useState<string>("");
  const [byokInput, setByokInput] = useState<string>("");
  const [byokSaved, setByokSaved] = useState(false);

  // Load counters & BYOK from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_USES_KEY);
      const used = stored ? parseInt(stored, 10) : 0;
      setUsesLeft(Math.max(0, DEMO_LIMIT - used));

      const savedKey = localStorage.getItem(LS_BYOK_KEY);
      if (savedKey) {
        setByokKey(savedKey);
        setByokInput(savedKey);
        setByokSaved(true);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  /* ---- helpers ---- */

  const validateAndRead = useCallback((file: File) => {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("\uc9c0\uc6d0\ub418\uc9c0 \uc54a\ub294 \ud30c\uc77c \ud615\uc2dd\uc785\ub2c8\ub2e4. JPG, PNG, WebP \uc774\ubbf8\uc9c0\ub9cc \uc5c5\ub85c\ub4dc \uac00\ub2a5\ud569\ub2c8\ub2e4.");
      setPreview(null);
      setFileName("");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setError(`\ud30c\uc77c \ud06c\uae30\uac00 \ub108\ubb34 \ud07d\ub2c8\ub2e4 (${sizeMB}MB). 8MB \uc774\ud558\uc758 \uc774\ubbf8\uc9c0\ub97c \uc120\ud0dd\ud574 \uc8fc\uc138\uc694.`);
      setPreview(null);
      setFileName("");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setFileName(file.name);
    };
    reader.onerror = () => {
      setError("\ud30c\uc77c\uc744 \uc77d\ub294 \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4. \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndRead(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndRead(file);
    },
    [validateAndRead],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const clearImage = () => {
    setPreview(null);
    setFileName("");
    setError(null);
    setResultUrl31(null);
    setResultUrl20(null);
    setSingleResultUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isValid = preview !== null && error === null;
  const hasResults = resultUrl31 || resultUrl20 || singleResultUrl;

  /* ---- BYOK helpers ---- */

  const handleSaveByok = () => {
    const trimmed = byokInput.trim();
    if (!trimmed) return;
    try {
      localStorage.setItem(LS_BYOK_KEY, trimmed);
    } catch { /* ignore */ }
    setByokKey(trimmed);
    setByokSaved(true);
    setShowLimitModal(false);
  };

  const handleClearByok = () => {
    try {
      localStorage.removeItem(LS_BYOK_KEY);
    } catch { /* ignore */ }
    setByokKey("");
    setByokInput("");
    setByokSaved(false);
  };

  /* ---- API call ---- */

  const handleGenerate = async () => {
    if (!isValid || isLoading || !preview) return;

    const isByok = byokKey.length > 0;

    if (!isByok && usesLeft <= 0) {
      setShowLimitModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultUrl31(null);
    setResultUrl20(null);
    setSingleResultUrl(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (isByok) {
        headers["x-gemini-key"] = byokKey;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          imageBase64: preview,
          style,
          targetModel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "\ud5e4\ub4dc\uc0f7 \uc0dd\uc131 \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.");
        return;
      }

      if (data.compareMode) {
        setResultUrl31(data.imageUrl31 || null);
        setResultUrl20(data.imageUrl20 || null);
      } else if (data.imageUrl) {
        setSingleResultUrl(data.imageUrl);
      } else {
        setError("\uacb0\uacfc \uc774\ubbf8\uc9c0\ub97c \ubc1b\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4. \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.");
        return;
      }

      // Increment demo counter only for non-BYOK requests
      if (!isByok) {
        try {
          const stored = localStorage.getItem(LS_USES_KEY);
          const newCount = (stored ? parseInt(stored, 10) : 0) + 1;
          localStorage.setItem(LS_USES_KEY, String(newCount));
          setUsesLeft(Math.max(0, DEMO_LIMIT - newCount));
        } catch { /* ignore */ }
      }
    } catch {
      setError("\ub124\ud2b8\uc6cc\ud06c \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4. \uc778\ud130\ub137 \uc5f0\uacb0\uc744 \ud655\uc778\ud574 \uc8fc\uc138\uc694.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---- error toast auto-dismiss ---- */

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setToast(error);
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  /* ---- download helper ---- */

  const handleDownloadImage = (url: string, suffix: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `proshot-headshot-${suffix}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ---- action handlers ---- */

  const handleRetry = () => {
    setResultUrl31(null);
    setResultUrl20(null);
    setSingleResultUrl(null);
    setError(null);
    handleGenerate();
  };

  const handleChangeStyle = () => {
    setResultUrl31(null);
    setResultUrl20(null);
    setSingleResultUrl(null);
    setError(null);
  };

  /* ---- render ---- */

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Error Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-red-600 text-white shadow-2xl shadow-red-200/40 max-w-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p className="text-sm font-medium leading-snug">{toast}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-auto flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
            {hasResults ? "\u2728 \ud5e4\ub4dc\uc0f7 \uc644\uc131!" : "\uc140\uce74\ub97c \uc5c5\ub85c\ub4dc\ud558\uc138\uc694"}
          </h3>
          <p className="text-sm text-slate-400">
            {hasResults
              ? "\ubaa8\ub378\ubcc4 \uacb0\uacfc\ub97c \ube44\uad50\ud558\uace0 \ub9c8\uc74c\uc5d0 \ub4dc\ub294 \uc0ac\uc9c4\uc744 \ub2e4\uc6b4\ub85c\ub4dc\ud558\uc138\uc694"
              : "\uc815\uba74 \uc140\uce74 \ud55c \uc7a5\uc774\uba74 \ucda9\ubd84\ud569\ub2c8\ub2e4"}
          </p>
        </div>

        {/* STATE: Result - Interactive Slider + Cards */}
        {hasResults && preview ? (
          <div className="space-y-8 animate-reveal">
            {/* ── Interactive Before/After Drag Slider ── */}
            <div className="space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  {"\ub4dc\ub798\uadf8\ud558\uc5ec Before / After \ube44\uad50"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {"\uc0ac\uc6b9\uc790 \uc9c1\uc124 \uc2ac\ub77c\uc774\ub354"}
                </span>
              </div>
              <ImageSlider
                beforeImage={preview}
                afterImage={resultUrl31 || resultUrl20 || singleResultUrl || ""}
                beforeLabel={"\uc6d0\ubcf8 \uc140\uce74"}
                afterLabel={resultUrl31 ? "Gemini 3.1 AI \ud5e4\ub4dc\uc0f7" : "AI \ud5e4\ub4dc\uc0f7"}
              />
            </div>

            {/* Grid layout depending on comparison or single mode */}
            {resultUrl31 && resultUrl20 ? (
              /* ── 3-Column Comparison View ── */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Original */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {"\uc6d0\ubcf8 \uc140\uce74"}
                    </span>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 aspect-[3/4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt={"\uc6d0\ubcf8"} className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* 2. Gemini 3.1 Flash Image (New & Recommended) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                      Gemini 3.1 Flash
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                      {"\ucd9c\ucc9c \u00b7 \ucd5c\uc2e0"}
                    </span>
                  </div>
                  <div className="rounded-2xl overflow-hidden border-2 border-indigo-400 shadow-lg shadow-indigo-100/50 bg-slate-50 aspect-[3/4] relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resultUrl31} alt={"Gemini 3.1 Flash Result"} className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadImage(resultUrl31, "gemini-3.1")}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {"3.1 \uacb0\uacfc \ub2e4\uc6b4\ub85c\ub4dc"}
                  </button>
                </div>

                {/* 3. Gemini 2.0 Flash Exp (Legacy) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Gemini 2.0 Flash
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                      {"\uc2e4\ud5d8\uc6a9"}
                    </span>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 aspect-[3/4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resultUrl20} alt={"Gemini 2.0 Flash Result"} className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadImage(resultUrl20, "gemini-2.0")}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {"2.0 \uacb0\uacfc \ub2e4\uc6b4\ub85c\ub4dc"}
                  </button>
                </div>
              </div>
            ) : (
              /* ── Single View ── */
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {"\uc6d0\ubcf8"}
                  </span>
                  <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 aspect-[3/4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt={"\uc6d0\ubcf8"} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
                    {"AI \ud5e4\ub4dc\uc0f7"}
                  </span>
                  <div className="rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-md bg-slate-50 aspect-[3/4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={singleResultUrl || resultUrl31 || resultUrl20 || ""} alt={"AI 생성 헤드샷"} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleRetry}
                disabled={isLoading}
                className="flex-1 py-3.5 rounded-2xl text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                {"\ub2e4\uc2dc \uc0dd\uc131\ud558\uae30"}
              </button>
              <button
                type="button"
                onClick={handleChangeStyle}
                className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="13.5" cy="6.5" r="2.5" />
                  <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z" />
                </svg>
                {"\uc2a4\ud0c0\uc77c/ 모델 \ubc14\uafb8\uae30"}
              </button>
            </div>
          </div>
        ) : isLoading ? (
          /* STATE: Loading Skeleton */
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="h-3 w-12 rounded bg-slate-100" />
                <div className="rounded-2xl border border-slate-100 bg-slate-50 aspect-[3/4] overflow-hidden">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt={"\uc6d0\ubcf8"} className="w-full h-full object-cover opacity-50" />
                  ) : (
                    <div className="w-full h-full animate-pulse bg-slate-100" />
                  )}
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <div className="h-3 w-28 rounded bg-indigo-100" />
                <div className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 aspect-[16/9] sm:aspect-auto sm:h-[calc(100%-1.5rem)] flex flex-col items-center justify-center p-6 gap-3">
                  <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <div className="text-center">
                    <p className="text-sm font-bold text-indigo-600">
                      {targetModel === "compare"
                        ? "Gemini 3.1과 2.0 두 모델이 사진을 만드난 중..."
                        : "AI가 헤드샷을 만드는 중..."}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {"\ubaa8\ub378 \ube44\uad50 \uc0dd\uc131 \uc2dc 15~30\ucd08 \uc18c\uc694\ub429\ub2c8\ub2e4"}
                    </p>
                  </div>
                  <div className="w-48 h-1 rounded-full bg-indigo-100 overflow-hidden mt-1">
                    <div className="h-full bg-indigo-500 rounded-full animate-loading-bar" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* STATE: Default - Upload + Model Picker + Style Picker */
          <>
            {/* Upload area */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative group cursor-pointer rounded-2xl border-2 border-dashed
                transition-all duration-300 overflow-hidden
                ${
                  isDragging
                    ? "border-indigo-400 bg-indigo-50/80 scale-[1.01]"
                    : preview
                      ? "border-transparent bg-slate-50"
                      : "border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/40"
                }
              `}
            >
              {preview ? (
                <div className="relative aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt={"\uc5c5\ub85c\ub4dc\ub41c \uc140\uce74"}
                    className="max-h-full max-w-full rounded-xl object-contain shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-white text-sm font-semibold bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                      {"\ub2e4\ub978 \uc0ac\uc9c4 \uc120\ud0dd"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImage();
                    }}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-white transition-all duration-200"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block text-xs text-slate-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full truncate max-w-full shadow-sm">
                      {"\ud83d\udcce"} {fileName}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    {"\ud074\ub9ad \ub610\ub294 \ub4dc\ub798\uadf8\ud558\uc5ec \uc5c5\ub85c\ub4dc"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {"JPG, PNG, WebP \u00b7 \ucd5c\ub300 8MB"}
                  </p>
                </div>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Model Selection Tabs */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                {"AI \ubaa8\ub378 \uc120\ud0dd"}
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                {[
                  { id: "compare", label: "\u26a1 \ub450 \ubaa8\ub378 \ube44\uad50", tag: "\ucd94\ucc9c" },
                  { id: "gemini-3.1-flash-image", label: "Gemini 3.1 Flash", tag: "\ucd5c\uc2e0" },
                  { id: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash", tag: "\uc2e4\ud5d8\uc6a9" },
                ].map((m) => {
                  const isSel = targetModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setTargetModel(m.id as ModelOption)}
                      className={`
                        py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5
                        ${
                          isSel
                            ? "bg-white text-indigo-600 shadow-md shadow-slate-200/50"
                            : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                        }
                      `}
                    >
                      {m.label}
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${isSel ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"}`}>
                        {m.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style picker */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                {"\ud504\ub85c\ud544 \uc2a4\ud0c0\uc77c \uc120\ud0dd"}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {STYLE_OPTIONS.map((opt) => {
                  const isSelected = style === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStyle(opt.value)}
                      className={`
                        relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2
                        transition-all duration-200 text-center
                        ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50/80 shadow-md shadow-indigo-100/50"
                            : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-sm">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${isSelected ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                        {opt.icon}
                      </div>
                      <div>
                        <p className={`text-xs font-bold leading-tight ${isSelected ? "text-indigo-700" : "text-slate-700"}`}>
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="button"
              disabled={!isValid || isLoading}
              onClick={handleGenerate}
              className={`
                w-full py-4 rounded-2xl text-base font-bold transition-all duration-200
                flex items-center justify-center gap-2
                ${
                  isValid
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-300/40 hover:shadow-xl hover:shadow-indigo-300/50 hover:scale-[1.01] active:scale-[0.99]"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }
              `}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              {targetModel === "compare" ? "\ub450 \ubaa8\ub378 \ube44\uad50 \uc0dd\uc131" : "\ud5e4\ub4dc\uc0f7 \uc0dd\uc131"}
            </button>

            {/* Demo uses indicator */}
            {!byokSaved && (
              <div className="flex items-center justify-center gap-1.5">
                <div className="flex gap-1">
                  {Array.from({ length: DEMO_LIMIT }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${i < usesLeft ? "bg-indigo-400" : "bg-slate-200"}`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-slate-400">
                  {"\ubb34\ub8cc"} {usesLeft}/{DEMO_LIMIT}{"\ud68c \ub0a8\uc74c"}
                </span>
              </div>
            )}
            {byokSaved && (
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-500 font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {"\ub0b4 API \ud0a4 \uc0ac\uc6a9 \uc911 \u00b7 \ubb34\uc81c\ud55c"}
              </div>
            )}
          </>
        )}

        {/* Disclaimer */}
        <p className="text-[11px] text-center text-slate-300 leading-relaxed">
          {"\uc5c5\ub85c\ub4dc\ud55c \uc0ac\uc9c4\uc740 \ud5e4\ub4dc\uc0f7 \uc0dd\uc131\uc5d0\ub9cc \uc0ac\uc6a9\ub418\uba70, \ucc98\ub9ac \ud6c4 \uc989\uc2dc \uc0ad\uc81c\ub429\ub2c8\ub2e4."}
        </p>
      </div>

      {/* Demo limit modal */}
      {showLimitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLimitModal(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {"\ubb34\ub8cc \uccb4\ud5d8 2\ud68c\ub97c \ubaa8\ub450 \uc0ac\uc6a9\ud588\uc5b4\uc694"}
              </h3>
              <button
                type="button"
                onClick={() => setShowLimitModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              {"\ubb34\ub8cc \uccb4\ud5d8"} {DEMO_LIMIT}{"\ud68c\uac00 \ubaa8\ub450 \uc18c\uc9c4\ub418\uc5c8\uc2b5\ub2c8\ub2e4. \uc544\ub798 \uc635\uc158 \uc911 \ud558\ub098\ub97c \uc120\ud0dd\ud574 \uc8fc\uc138\uc694."}
            </p>

            {/* Option A - BYOK */}
            <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {"\ub0b4 API \ud0a4\ub85c \uacc4\uc18d \uc0ac\uc6a9\ud588\uae30"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {"Google Gemini API \ud0a4 \uc785\ub825"}
                  </p>
                </div>
              </div>

              {byokSaved ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm text-emerald-700 font-medium">
                      {"API \ud0a4\uac00 \uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearByok}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    {"\ud0a4 \uc0ad\uc81c"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="password"
                    value={byokInput}
                    onChange={(e) => setByokInput(e.target.value)}
                    placeholder="AIzaSy... \ub610\ub294 Gemini API \ud0a4"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleSaveByok}
                    disabled={!byokInput.trim()}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      byokInput.trim()
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200/50"
                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                    }`}
                  >
                    {"\ud0a4 \uc800\uc7a5\ud558\uace0 \uacc4\uc18d\ud558\uae30"}
                  </button>
                </div>
              )}

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {"\ud83d\udca1 \uc785\ub825\ud558\uc2e0 \ud0a4\ub294 \ube0c\ub77c\uc6b0\uc800\uc5d0\ub9cc \uc800\uc7a5\ub418\uba70, \ubcf8\uc778\uc758 \uc694\uccad\uc5d0\ub9cc \uc0ac\uc6a9\ub429\ub2c8\ub2e4. \uc11c\ubc84\uc5d0 \uae30\ub85d\ub418\uac70\ub098 \uc800\uc7a5\ub418\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4."}
              </p>
            </div>

            {/* Option B - Paid (placeholder) */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-400">
                  {"\uc815\uc2dd \ubc84\uc804"}
                </p>
              </div>
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-xl text-sm font-semibold bg-slate-100 text-slate-300 cursor-not-allowed"
              >
                {"\uc815\uc2dd \ubc84\uc804 \uc900\ube44 \uc911"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
