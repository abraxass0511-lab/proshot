"use client";

import { useState, useRef, useCallback, useEffect, type ChangeEvent } from "react";
import { ImageSlider } from "./ImageSlider";
import {
  CATEGORIES,
  STYLES,
  BG_COLORS,
  getStyle,
  type CategoryId,
  type BgColor,
  type StyleDef,
} from "@/app/lib/styles";
import { PRINT_SIZES, generatePhotoSheet, type PrintSize } from "@/app/lib/photoSheet";

/* ------------------------------------------------------------------ */
/*  Types & Sample Data                                                */
/* ------------------------------------------------------------------ */

type ModelOption = "compare" | "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const DEMO_LIMIT = 2;
const LS_USES_KEY = "proshot_uses";
const LS_BYOK_KEY = "proshot_byok";

// Clean sample images for instant pre-upload demo slider
const SAMPLE_BEFORE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='600' height='800' fill='%23e2e8f0'/><circle cx='300' cy='320' r='140' fill='%23cbd5e1'/><circle cx='300' cy='280' r='90' fill='%23fda4af'/><path d='M150,750 C150,500 450,500 450,750 Z' fill='%2394a3b8'/><text x='300' y='720' font-family='sans-serif' font-size='26' font-weight='bold' fill='%23475569' text-anchor='middle'>일반 셀카 샘플</text></svg>";
const SAMPLE_AFTER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop offset='0%25' stop-color='%234f46e5'/><stop offset='100%25' stop-color='%237c3aed'/></linearGradient></defs><rect width='600' height='800' fill='url(%23bg)'/><circle cx='300' cy='320' r='140' fill='%23818cf8' opacity='0.4'/><circle cx='300' cy='280' r='90' fill='%23fecdd3'/><path d='M150,750 C150,500 450,500 450,750 Z' fill='%231e1b4b'/><text x='300' y='720' font-family='sans-serif' font-size='26' font-weight='bold' fill='%23ffffff' text-anchor='middle'>✨ AI 프로필 헤드샷</text></svg>";

// Mapping style IDs to valid CSS filter strings for instant pre-generation slider preview
const STYLE_CSS_FILTERS: Record<string, string> = {
  corporate: "contrast(1.22) brightness(1.08) saturate(0.88) hue-rotate(-8deg)",
  studio: "brightness(1.15) contrast(1.1) saturate(1.1)",
  outdoor: "sepia(0.2) contrast(1.12) brightness(1.1) saturate(1.3)",
  id_photo: "contrast(1.18) brightness(1.12) saturate(0.95)",
  passport: "brightness(1.15) contrast(1.15) saturate(0.9)",
  student: "brightness(1.1) contrast(1.08) saturate(1.15)",
  yearbook: "sepia(0.35) contrast(1.1) brightness(1.05) hue-rotate(-15deg)",
  idol: "brightness(1.2) contrast(1.05) saturate(1.25)",
  kdrama: "contrast(1.25) brightness(1.05) sepia(0.15) saturate(1.1)",
  magazine: "contrast(1.3) brightness(1.1) saturate(1.2)",
  noir: "grayscale(1) contrast(1.35) brightness(1.05)",
  cartoon: "saturate(1.4) contrast(1.2) brightness(1.1)",
  custom: "contrast(1.15) brightness(1.1) saturate(1.2)",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function UploadCard() {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // Category & Style state
  const [activeCategory, setActiveCategory] = useState<CategoryId>("business");
  const [selectedStyleId, setSelectedStyleId] = useState<string>("corporate");
  const [selectedBgColor, setSelectedBgColor] = useState<BgColor>("white");
  const [customPrompt, setCustomPrompt] = useState<string>("");

  // Model & Async states
  const [targetModel, setTargetModel] = useState<ModelOption>("compare");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Result states for independent model outputs
  const [resultUrl31, setResultUrl31] = useState<string | null>(null);
  const [resultUrl20, setResultUrl20] = useState<string | null>(null);

  // Print Sheet Modal state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printImageTarget, setPrintImageTarget] = useState<string | null>(null);
  const [selectedPrintSize, setSelectedPrintSize] = useState<PrintSize>(PRINT_SIZES[1]); // 증명사진 default
  const [isSheetGenerating, setIsSheetGenerating] = useState(false);

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

  /* ---- Trigger File Selection Window ---- */
  const triggerFileInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  /* ---- Robust File Reader ---- */

  const validateAndRead = useCallback((file: File) => {
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        setPreview(base64);
        setFileName(file.name);
        setError(null);
      } else {
        setError("이미지 데이터를 불러오지 못했습니다. 다른 사진으로 시도해 주세요.");
      }
    };
    reader.onerror = () => {
      setError("파일을 읽는 중 오류가 발생했습니다. 다시 시도해 주세요.");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndRead(file);
    }
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
    if (inputRef.current) inputRef.current.value = "";
  };

  const isValid = preview !== null && error === null;
  const hasResults = resultUrl31 !== null || resultUrl20 !== null;

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

  const handleGenerateModel = async (modelToRun: ModelOption) => {
    if (!isValid || isLoading || !preview) return;

    if (activeCategory === "custom" && !customPrompt.trim()) {
      setError("커스텀 스타일 설명을 입력해 주세요.");
      return;
    }

    const isByok = byokKey.length > 0;

    if (!isByok && usesLeft <= 0) {
      setShowLimitModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);

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
          style: activeCategory === "custom" ? "custom" : selectedStyleId,
          targetModel: modelToRun,
          bgColor: selectedBgColor,
          customPrompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "헤드샷 생성 중 오류가 발생했습니다.");
        return;
      }

      if (data.compareMode) {
        if (data.imageUrl31) setResultUrl31(data.imageUrl31);
        if (data.imageUrl20) setResultUrl20(data.imageUrl20);
      } else if (data.selectedModel === "gemini-3.1-flash-image") {
        setResultUrl31(data.imageUrl);
      } else if (data.selectedModel === "gemini-3.1-flash-lite-image") {
        setResultUrl20(data.imageUrl);
      } else if (data.imageUrl) {
        setResultUrl31(data.imageUrl);
      } else {
        setError("결과 이미지를 받지 못했습니다. 다시 시도해 주세요.");
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
      setError("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.");
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

  /* ---- download helpers ---- */

  const handleDownloadImage = (url: string, modelLabel: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `proshot-headshot-${modelLabel}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPrintSheet = async () => {
    if (!printImageTarget) return;
    setIsSheetGenerating(true);
    try {
      const { dataUrl, count } = await generatePhotoSheet(printImageTarget, selectedPrintSize);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `proshot-print-sheet-${selectedPrintSize.id}-${count}pcs.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowPrintModal(false);
    } catch {
      setError("인쇄용 시트를 생성하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSheetGenerating(false);
    }
  };

  /* ---- action handlers ---- */

  const handleResetResults = () => {
    setResultUrl31(null);
    setResultUrl20(null);
    setError(null);
  };

  const currentStyleObj = getStyle(selectedStyleId) || STYLES[0];
  const activeCssFilter = STYLE_CSS_FILTERS[selectedStyleId] || "contrast(1.15) brightness(1.1)";
  const filteredStyles = STYLES.filter((s) => s.category === activeCategory);

  /* ---- render ---- */

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Hidden File Input (Always in DOM) */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

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
            {hasResults ? "✨ AI 프로필 완성과 비교" : "셀카를 업로드하세요"}
          </h3>
          <p className="text-sm text-slate-400">
            {hasResults
              ? "각 모델별 생성 결과를 확인하고 고화질 및 인쇄용 분할 시트로 저장하세요"
              : "정면 셀카 한 장이면 스튜디오급 사진이 완성됩니다"}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/*  STATE: Results Generated - Display Each Model's Image     */}
        {/* ══════════════════════════════════════════════════════════ */}
        {hasResults && preview ? (
          <div className="space-y-8 animate-reveal">
            {/* ── Real AI Generated Image Interactive Before/After Drag Slider ── */}
            <div className="space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  {"실시간 AI 생성 Before / After 드래그 비교"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {"드래그하여 비교"}
                </span>
              </div>
              <ImageSlider
                beforeImage={preview}
                afterImage={resultUrl31 || resultUrl20 || ""}
                beforeLabel={"원본 셀카"}
                afterLabel={resultUrl31 ? "Gemini 3.1 AI 헤드샷" : "Gemini 2.0 AI 헤드샷"}
              />
            </div>

            {/* ── Grid: Each Model's Individual Generated Image Card ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 1. Original Selfie */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {"원본 셀카"}
                  </span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 aspect-[3/4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt={"원본"} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* 2. Gemini 3.1 Flash Result Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    Gemini 3.1 Flash
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                    {"추천 · 최신"}
                  </span>
                </div>
                <div className="rounded-2xl overflow-hidden border-2 border-indigo-300 shadow-md bg-slate-50 aspect-[3/4] relative">
                  {resultUrl31 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resultUrl31} alt={"Gemini 3.1 Result"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50 text-center gap-3">
                      <p className="text-xs text-slate-400">{"아직 생성되지 않았습니다"}</p>
                      <button
                        type="button"
                        onClick={() => handleGenerateModel("gemini-3.1-flash-image")}
                        disabled={isLoading}
                        className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700 transition-all"
                      >
                        {"Gemini 3.1 생성하기"}
                      </button>
                    </div>
                  )}
                </div>
                {resultUrl31 && (
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadImage(resultUrl31, "gemini-3.1")}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-1.5"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {"Gemini 3.1 PNG 다운로드"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPrintImageTarget(resultUrl31);
                        setShowPrintModal(true);
                      }}
                      className="w-full py-2 rounded-xl text-xs font-semibold border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      {"🖨️ 4×6 증명사진 인화 시트 다운로드"}
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Gemini 3.1 Flash Lite Result Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Gemini 3.1 Lite
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                    {"경제적"}
                  </span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 aspect-[3/4] relative">
                  {resultUrl20 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resultUrl20} alt={"Gemini 3.1 Lite Result"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50 text-center gap-3">
                      <p className="text-xs text-slate-400">{"아직 생성되지 않았습니다"}</p>
                      <button
                        type="button"
                        onClick={() => handleGenerateModel("gemini-3.1-flash-lite-image")}
                        disabled={isLoading}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold shadow-md hover:bg-slate-900 transition-all"
                      >
                        {"Gemini 3.1 Lite 생성하기"}
                      </button>
                    </div>
                  )}
                </div>
                {resultUrl20 && (
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadImage(resultUrl20, "gemini-3.1-lite")}
                      className="w-full py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {"Gemini 2.0 PNG 다운로드"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPrintImageTarget(resultUrl20);
                        setShowPrintModal(true);
                      }}
                      className="w-full py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      {"🖨️ 4×6 증명사진 인화 시트 다운로드"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleGenerateModel("compare")}
                disabled={isLoading}
                className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                {"두 모델 모두 다시 생성"}
              </button>
              <button
                type="button"
                onClick={handleResetResults}
                className="flex-1 py-3.5 rounded-2xl text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="13.5" cy="6.5" r="2.5" />
                  <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z" />
                </svg>
                {"스타일 / 사진 다시 선택"}
              </button>
            </div>
          </div>
        ) : isLoading ? (
          /* ══════════════════════════════════════════════════════════ */
          /*  STATE: Loading Skeleton                                   */
          /* ══════════════════════════════════════════════════════════ */
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="h-3 w-12 rounded bg-slate-100" />
                <div className="rounded-2xl border border-slate-100 bg-slate-50 aspect-[3/4] overflow-hidden">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt={"원본"} className="w-full h-full object-cover opacity-50" />
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
                      {"AI가 고화질 헤드샷을 생성 중입니다..."}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {"15~30초 소요됩니다"}
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
          /* ══════════════════════════════════════════════════════════ */
          /*  STATE: Default - Upload + Always Visible Demo Slider      */
          /* ══════════════════════════════════════════════════════════ */
          <>
            {/* ── Interactive Before/After Drag Slider (Always visible before generation!) ── */}
            <div className="space-y-3 bg-gradient-to-br from-indigo-50/60 to-violet-50/40 p-4 sm:p-6 rounded-3xl border border-indigo-100/80">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-xs sm:text-sm font-bold text-indigo-900">
                    {preview
                      ? "↔️ 마우스나 손가락으로 드래그하여 스타일 미리보기를 느껴보세요!"
                      : "↔️ 마우스나 손가락으로 슬라이더를 움직여 AI 변환을 미리 체험해 보세요!"}
                  </span>
                </div>
                {preview && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                  >
                    {"다른 사진 선택"}
                  </button>
                )}
              </div>

              {/* Slider View: Clickable to trigger photo upload if no preview yet */}
              <div
                onClick={!preview ? triggerFileInput : undefined}
                className={`max-w-md mx-auto relative group ${!preview ? "cursor-pointer" : ""}`}
              >
                <ImageSlider
                  beforeImage={preview || SAMPLE_BEFORE}
                  afterImage={preview || SAMPLE_AFTER}
                  afterFilter={preview ? activeCssFilter : undefined}
                  beforeLabel={preview ? "원본 셀카" : "샘플 셀카"}
                  afterLabel={preview ? `${currentStyleObj.label} 완성 예시` : "✨ AI 헤드샷 샘플"}
                />
                {!preview && (
                  <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-indigo-900/20 transition-all rounded-2xl flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-indigo-600 shadow-md group-hover:scale-105 transition-transform flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      클릭하여 내 사진 업로드
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Action Bar & Drag-and-drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className="pt-2 flex flex-col items-center gap-2"
              >
                {!preview ? (
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="w-full max-w-md py-4 rounded-2xl bg-white border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50/50 text-indigo-700 font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>📸 내 셀카 사진 업로드하기</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 w-full max-w-md bg-emerald-50 border border-emerald-200 p-3 rounded-2xl animate-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{fileName} 업로드 완료!</span>
                    </div>
                    <p className="text-[11px] text-emerald-600 font-medium">
                      위 슬라이더에서 미리보기를 확인하고, 아래 버튼을 눌러 AI 생성을 진행하세요.
                    </p>
                  </div>
                )}
                <p className="text-[11px] text-slate-400">
                  {"JPG, PNG, WebP · 최대 15MB (클릭 또는 드래그앤드롭)"}
                </p>
              </div>
            </div>

            {/* AI Model Selection Tabs */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                {"AI 모델 선택"}
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                {[
                  { id: "compare", label: "\u26a1 두 모델 모두 생성", tag: "추천" },
                  { id: "gemini-3.1-flash-image", label: "Gemini 3.1 Flash", tag: "고품질" },
                  { id: "gemini-3.1-flash-lite-image", label: "Gemini 3.1 Lite", tag: "경제적" },
                ].map((m) => {
                  const isSel = targetModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setTargetModel(m.id as ModelOption)}
                      className={`
                        py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer
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

            {/* Category selection tabs (Business, ID/Passport, Fun/Concept, Custom) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">
                  {"프로필 스타일 테마"}
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                {CATEGORIES.map((cat) => {
                  const isSel = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.id);
                        if (cat.id !== "custom") {
                          const firstInCat = STYLES.find((s) => s.category === cat.id);
                          if (firstInCat) setSelectedStyleId(firstInCat.id);
                        }
                      }}
                      className={`
                        py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer
                        ${
                          isSel
                            ? "bg-white text-indigo-700 shadow-md shadow-slate-200/50"
                            : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                        }
                      `}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Prompt Input */}
              {activeCategory === "custom" ? (
                <div className="space-y-2 animate-in">
                  <label className="block text-xs font-semibold text-slate-600">
                    {"원하는 연출 및 스타일을 자유롭게 설명해주세요"}
                  </label>
                  <textarea
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="예: 해질녘 해변 배경에서 빈티지 가죽 자켓을 입은 멋진 포트레이트"
                    className="w-full p-4 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                  />
                </div>
              ) : (
                /* Preset Style Options Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in">
                  {filteredStyles.map((opt) => {
                    const isSelected = selectedStyleId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedStyleId(opt.id)}
                        className={`
                          relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer
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
                        <span className="text-2xl mb-1">{opt.emoji}</span>
                        <div>
                          <p className={`text-xs font-bold leading-tight ${isSelected ? "text-indigo-700" : "text-slate-700"}`}>
                            {opt.label}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                            {opt.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Background Color Selector (shown for ID photo styles) */}
              {activeCategory === "id" && currentStyleObj?.supportsBgColor && (
                <div className="space-y-2 pt-2 animate-in">
                  <label className="block text-xs font-semibold text-slate-600">
                    {"증명사진 배경색 선택"}
                  </label>
                  <div className="flex gap-3">
                    {BG_COLORS.map((bg) => {
                      const isSel = selectedBgColor === bg.id;
                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => setSelectedBgColor(bg.id)}
                          className={`
                            flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer
                            ${
                              isSel
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }
                          `}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-inner"
                            style={{ backgroundColor: bg.swatch }}
                          />
                          <span>{bg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="button"
              disabled={!isValid || isLoading}
              onClick={() => handleGenerateModel(targetModel)}
              className={`
                w-full py-4 rounded-2xl text-base font-bold transition-all duration-200
                flex items-center justify-center gap-2
                ${
                  isValid
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-300/40 hover:shadow-xl hover:shadow-indigo-300/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }
              `}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              {targetModel === "compare"
                ? "⚡ 두 모델 모두 생성하기"
                : `${targetModel === "gemini-3.1-flash-image" ? "Gemini 3.1" : "Gemini 2.0"} 헤드샷 생성`}
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
                  {"무료"} {usesLeft}/{DEMO_LIMIT}{"회 남음"}
                </span>
              </div>
            )}
            {byokSaved && (
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-500 font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {"내 API 키 사용 중 · 무제한"}
              </div>
            )}
          </>
        )}

        {/* Disclaimer */}
        <p className="text-[11px] text-center text-slate-300 leading-relaxed">
          {"업로드한 사진은 헤드샷 생성에만 사용되며, 처리 후 즉시 삭제됩니다."}
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  MODAL: Print Sheet Generator (4x6 photo paper tiling)    */}
      {/* ══════════════════════════════════════════════════════════ */}
      {showPrintModal && printImageTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPrintModal(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🖨️</span> 4×6 인화용 시트 다운로드
              </h3>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                4×6 인치 표준 인화지 규격에 300DPI 고화질 자르기 안내선과 함께 배치된 분할 시트를 생성합니다. 인쇄소나 사진 인화 키오스크에서 출력하세요.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">인쇄 규격 선택</label>
                <div className="space-y-2">
                  {PRINT_SIZES.map((size) => {
                    const isSel = selectedPrintSize.id === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSelectedPrintSize(size)}
                        className={`
                          w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer
                          ${
                            isSel
                              ? "border-indigo-500 bg-indigo-50/70 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }
                        `}
                      >
                        <div>
                          <p className={`text-sm font-bold ${isSel ? "text-indigo-900" : "text-slate-800"}`}>
                            {size.label}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{size.note}</p>
                        </div>
                        {isSel && (
                          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDownloadPrintSheet}
                disabled={isSheetGenerating}
                className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSheetGenerating ? (
                  <span>생성 중...</span>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>인화 시트 다운로드</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                {"무료 체험 2회를 모두 사용했어요"}
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
              {"무료 체험"} {DEMO_LIMIT}{"회가 모두 소진되었습니다. 아래 옵션 중 하나를 선택해 주세요."}
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
                    {"내 API 키로 계속 사용하기"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {"Google Gemini API 키 입력"}
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
                      {"API 키가 저장되었습니다"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearByok}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    {"키 삭제"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="password"
                    value={byokInput}
                    onChange={(e) => setByokInput(e.target.value)}
                    placeholder="AIzaSy... 또는 Gemini API 키"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleSaveByok}
                    disabled={!byokInput.trim()}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      byokInput.trim()
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200/50 cursor-pointer"
                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                    }`}
                  >
                    {"키 저장하고 계속하기"}
                  </button>
                </div>
              )}

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {"💡 입력하신 키는 브라우저에만 저장되며, 본인의 요청에만 사용됩니다. 서버에 기록되거나 저장되지 않습니다."}
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
                  {"정식 버전"}
                </p>
              </div>
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-xl text-sm font-semibold bg-slate-100 text-slate-300 cursor-not-allowed"
              >
                {"정식 버전 준비 중"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
