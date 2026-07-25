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
} from "@/app/lib/styles";
import { PRINT_SIZES, generatePhotoSheet, type PrintSize } from "@/app/lib/photoSheet";

/* ------------------------------------------------------------------ */
/*  Types & Sample Data                                                */
/* ------------------------------------------------------------------ */

type ModelOption = "compare" | "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image";

const LS_ACCESS_PW_KEY = "proshot_access_pw";

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

  // Access Password Auth state
  const [accessPw, setAccessPw] = useState<string | null>(null);
  const [accessInput, setAccessInput] = useState<string>("");
  const [accessError, setAccessError] = useState<string | null>(null);
  const [isAccessLoading, setIsAccessLoading] = useState<boolean>(false);

  // Category & Style state
  const [activeCategory, setActiveCategory] = useState<CategoryId>("business");
  const [selectedStyleId, setSelectedStyleId] = useState<string>("corporate");
  const [selectedBgColor, setSelectedBgColor] = useState<BgColor>("white");
  const [customPrompt, setCustomPrompt] = useState<string>("");

  // Model & Async states
  const [targetModel, setTargetModel] = useState<ModelOption>("compare");
  const [error, setError] = useState<string | null>(null);
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

  // Load saved password from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_ACCESS_PW_KEY);
      if (saved) {
        setAccessPw(saved);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  /* ---- Access Password verification ---- */
  const handleAccessLogin = async () => {
    if (!accessInput.trim()) return;
    setIsAccessLoading(true);
    setAccessError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "GET",
        headers: { "x-access-password": accessInput.trim() },
      });
      if (res.ok) {
        const pw = accessInput.trim();
        setAccessPw(pw);
        try {
          localStorage.setItem(LS_ACCESS_PW_KEY, pw);
        } catch { /* ignore */ }
        setAccessInput("");
      } else {
        setAccessError("비밀번호가 올바르지 않습니다.");
      }
    } catch {
      setAccessError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsAccessLoading(false);
    }
  };

  const handleAccessLogout = () => {
    try {
      localStorage.removeItem(LS_ACCESS_PW_KEY);
    } catch { /* ignore */ }
    setAccessPw(null);
  };

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
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndRead(file);
    },
    [validateAndRead],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
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

  /* ---- API call ---- */
  const handleGenerateModel = async (modelToRun: ModelOption) => {
    if (!isValid || isLoading || !preview) return;

    if (activeCategory === "custom" && !customPrompt.trim()) {
      setError("커스텀 스타일 설명을 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessPw) {
        headers["x-access-password"] = accessPw;
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
        if (res.status === 401) {
          handleAccessLogout();
        }
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
    <div id="upload" className="w-full max-w-4xl mx-auto">
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
              className="ml-auto flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  PASSWORD AUTH GATE: Rendered when user is NOT authenticated */}
      {/* ══════════════════════════════════════════════════════════ */}
      {!accessPw ? (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-indigo-100 shadow-2xl shadow-indigo-100/50 p-8 sm:p-12 text-center space-y-6 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">접근 비밀번호 입력</h3>
            <p className="text-sm text-slate-500 mt-1">ProShot 서비스 이용을 위해 비밀번호를 입력해주세요.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAccessLogin();
            }}
            className="space-y-4"
          >
            <input
              type="password"
              value={accessInput}
              onChange={(e) => setAccessInput(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center font-medium placeholder:text-slate-300"
            />
            {accessError && (
              <p className="text-xs font-semibold text-rose-500">{accessError}</p>
            )}
            <button
              type="submit"
              disabled={!accessInput.trim() || isAccessLoading}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all duration-200 cursor-pointer ${
                accessInput.trim() && !isAccessLoading
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200/50"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isAccessLoading ? "확인 중..." : "인증하고 시작하기"}
            </button>
          </form>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════ */
        /*  MAIN TOOL INTERFACE: Rendered when user IS authenticated  */
        /* ══════════════════════════════════════════════════════════ */
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center relative">
            <div className="absolute right-0 top-0">
              <button
                type="button"
                onClick={handleAccessLogout}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 px-2.5 py-1 rounded-full cursor-pointer"
                title="비밀번호 다시 입력하기"
              >
                🔒 인증됨 (로그아웃)
              </button>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              {hasResults ? "✨ AI 프로필 완성과 비교" : "셀카를 업로드하세요"}
            </h3>
            <p className="text-sm text-slate-400">
              {hasResults
                ? "각 모델별 생성 결과를 확인하고 고화질 및 인쇄용 분할 시트로 저장하세요"
                : "정면 셀카 한 장이면 스튜디오급 사진이 완성됩니다"}
            </p>
          </div>

          {/* RESULTS MODE */}
          {hasResults && preview ? (
            <div className="space-y-8 animate-reveal">
              {/* Before/After Drag Slider */}
              <div className="space-y-2 max-w-md mx-auto">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    {"실시간 AI 생성 Before / After 드래그 비교"}
                  </span>
                  <span className="text-[11px] text-slate-400">{"드래그하여 비교"}</span>
                </div>
                <ImageSlider
                  beforeImage={preview}
                  afterImage={resultUrl31 || resultUrl20 || ""}
                  beforeLabel={"원본 셀카"}
                  afterLabel={resultUrl31 ? "Gemini 3.1 AI 헤드샷" : "Gemini 3.1 Lite 헤드샷"}
                />
              </div>

              {/* Grid: Each Model's Individual Generated Image Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Original Selfie */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{"원본 셀카"}</span>
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
                      {"추천 · 고품질"}
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
                          className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
                        >
                          {"Gemini 3.1 Flash 생성하기"}
                        </button>
                      </div>
                    )}
                  </div>
                  {resultUrl31 && (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => handleDownloadImage(resultUrl31, "gemini-3.1-flash")}
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {"PNG 다운로드"}
                      </button>
                      {currentStyleObj.printable && (
                        <button
                          type="button"
                          onClick={() => {
                            setPrintImageTarget(resultUrl31);
                            setShowPrintModal(true);
                          }}
                          className="w-full py-2 rounded-xl text-[11px] font-bold border border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {"🖨️ 인화 시트 만들기"}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Gemini 3.1 Lite Result Card */}
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
                          className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold shadow-md hover:bg-slate-900 transition-all cursor-pointer"
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
                        className="w-full py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {"PNG 다운로드"}
                      </button>
                      {currentStyleObj.printable && (
                        <button
                          type="button"
                          onClick={() => {
                            setPrintImageTarget(resultUrl20);
                            setShowPrintModal(true);
                          }}
                          className="w-full py-2 rounded-xl text-[11px] font-bold border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {"🖨️ 인화 시트 만들기"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetResults}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  {"다른 스타일로 다시 생성하기"}
                </button>
                <button
                  type="button"
                  onClick={clearImage}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  {"다른 사진으로 새로 시작"}
                </button>
              </div>
            </div>
          ) : (
            /* UPLOAD & CONTROLS MODE */
            <div className="space-y-6">
              {/* Image Upload Area */}
              {!preview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={triggerFileInput}
                  className="group relative rounded-3xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 p-8 sm:p-10 text-center transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Instant Sample Slider Preview before uploading */}
                  <div className="space-y-4 max-w-sm mx-auto cursor-default" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        {"미리보기 예시 (슬라이더를 움직여 보세요)"}
                      </span>
                    </div>
                    <ImageSlider
                      beforeImage={SAMPLE_BEFORE}
                      afterImage={SAMPLE_AFTER}
                      beforeLabel={"일반 셀카"}
                      afterLabel={`✨ ${currentStyleObj.label}`}
                      afterFilter={activeCssFilter}
                    />
                  </div>

                  <div className="mt-6 space-y-2 pointer-events-none">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {"내 사진 클릭 또는 드래그하여 업로드"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {"JPG, PNG, WebP · 최대 15MB"}
                    </p>
                  </div>
                </div>
              ) : (
                /* Uploaded Image Preview */
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-w-xs mx-auto aspect-[3/4] shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="업로드 이미지" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-between p-4">
                    <button
                      type="button"
                      onClick={clearImage}
                      className="self-end px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-sm transition-colors cursor-pointer"
                    >
                      {"사진 변경"}
                    </button>
                    <p className="text-xs text-white/90 truncate font-medium">{fileName}</p>
                  </div>
                </div>
              )}

              {/* Model selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  {"AI 모델 선택"}
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                  {[
                    { id: "compare", label: "⚡ 두 모델 모두 생성", tag: "추천" },
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
                              ? "bg-white text-indigo-600 shadow-md shadow-slate-200/50 scale-[1.02]"
                              : "text-slate-500 hover:text-slate-800"
                          }
                        `}
                      >
                        <span>{m.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSel ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"}`}>
                          {m.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category tabs */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  {"스타일 카테고리"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSel = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id);
                          const firstStyle = STYLES.find((s) => s.category === cat.id);
                          if (firstStyle) setSelectedStyleId(firstStyle.id);
                        }}
                        className={`
                          p-3 rounded-2xl text-left border transition-all duration-200 cursor-pointer
                          ${
                            isSel
                              ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-base">{cat.emoji}</span>
                          <span className={`text-xs font-bold ${isSel ? "text-indigo-900" : "text-slate-800"}`}>
                            {cat.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{cat.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Styles sub-options */}
              {activeCategory !== "custom" ? (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    {"상세 스타일"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {filteredStyles.map((style) => {
                      const isSel = selectedStyleId === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setSelectedStyleId(style.id)}
                          className={`
                            p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer
                            ${
                              isSel
                                ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20 shadow-sm"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }
                          `}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{style.emoji}</span>
                              {style.label}
                            </span>
                            {isSel && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{style.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Custom prompt input */
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    {"원하는 스타일 설명"}
                  </label>
                  <textarea
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="예: 해변 노을 배경의 스포티한 룩, 90년대 헐리우드 배우 느낌"
                    className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-300"
                  />
                </div>
              )}

              {/* Background color selection if style supports it */}
              {currentStyleObj.supportsBgColor && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    {"배경 색상"}
                  </label>
                  <div className="flex gap-2">
                    {BG_COLORS.map((bg) => {
                      const isSel = selectedBgColor === bg.id;
                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => setSelectedBgColor(bg.id)}
                          className={`
                            px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer
                            ${
                              isSel
                                ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }
                          `}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-inner"
                            style={{ backgroundColor: bg.swatch }}
                          />
                          {bg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit / Generate Button */}
              <div className="pt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => handleGenerateModel(targetModel)}
                  disabled={!isValid || isLoading}
                  className={`
                    w-full py-4 rounded-2xl font-bold text-base shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
                    ${
                      isValid && !isLoading
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-200/60 hover:shadow-indigo-300/80 hover:scale-[1.01]"
                        : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                    }
                  `}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{"AI가 고화질 헤드샷을 생성 중입니다..."}</span>
                    </div>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      {targetModel === "compare"
                        ? "⚡ 두 모델 비교 헤드샷 생성하기"
                        : `${targetModel === "gemini-3.1-flash-image" ? "Gemini 3.1 Flash" : "Gemini 3.1 Lite"} 헤드샷 생성`}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Print Sheet Modal */}
      {showPrintModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPrintModal(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🖨️</span>
                <span>4×6 인화용 시트 생성</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              사진관이나 온라인 인화 서비스(4×6인치 사이즈)에서 출력하면 즉시 잘라서 사용할 수 있는 분할 인화 이미지 파일입니다.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                인화 규격 선택
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {PRINT_SIZES.map((size) => {
                  const isSel = selectedPrintSize.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedPrintSize(size)}
                      className={`
                        p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer
                        ${
                          isSel
                            ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20"
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
    </div>
  );
}
