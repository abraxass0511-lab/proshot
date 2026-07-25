"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "\uc5b4\ub5a4 \uc0ac\uc9c4\uc744 \uc5c5\ub85c\ub4dc\ud574\uc57c \ud558\ub098\uc694?",
    a: "\uc815\uba74\uc744 \ubc14\ub77c\ubcf4\ub294 \uc140\uce74 \ud55c \uc7a5\uc774\uba74 \ucda9\ubd84\ud569\ub2c8\ub2e4. \uc5bc\uad74\uc774 \uc798 \ubcf4\uc774\uace0, \uc870\uba85\uc774 \uc88b\uc740 \uc0ac\uc9c4\uc77c\uc218\ub85d \ub354 \uc88b\uc740 \uacb0\uacfc\ub97c \uc5bb\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4. JPG, PNG, WebP \ud615\uc2dd\uc744 \uc9c0\uc6d0\ud558\uba70 \ucd5c\ub300 8MB\uae4c\uc9c0 \uc5c5\ub85c\ub4dc \uac00\ub2a5\ud569\ub2c8\ub2e4.",
  },
  {
    q: "\uc0dd\uc131\uc5d0 \uc5bc\ub9c8\ub098 \uac78\ub9ac\ub098\uc694?",
    a: "\ubcf4\ud1b5 30\ucd08\uc5d0\uc11c 1\ubd84 \uc774\ub0b4\uc5d0 \uacb0\uacfc\uac00 \uc0dd\uc131\ub429\ub2c8\ub2e4. \uc11c\ubc84 \uc0c1\ud669\uc5d0 \ub530\ub77c \uc57d\uac04 \ub2e4\ub97c \uc218 \uc788\uc9c0\ub9cc, \ub300\ubd80\ubd84 \ube60\ub974\uac8c \ucc98\ub9ac\ub429\ub2c8\ub2e4.",
  },
  {
    q: "\uc5c5\ub85c\ub4dc\ud55c \uc0ac\uc9c4\uc740 \uc5b4\ub5bb\uac8c \ucc98\ub9ac\ub418\ub098\uc694?",
    a: "\uc5c5\ub85c\ub4dc\ud55c \uc0ac\uc9c4\uc740 AI \ud5e4\ub4dc\uc0f7 \uc0dd\uc131\uc5d0\ub9cc \uc0ac\uc6a9\ub418\uba70, \ucc98\ub9ac\uac00 \ub05d\ub098\uba74 \uc989\uc2dc \uc0ad\uc81c\ub429\ub2c8\ub2e4. \uc11c\ubc84\uc5d0 \uc800\uc7a5\ud558\uac70\ub098 \ub2e4\ub978 \uc6a9\ub3c4\ub85c \uc0ac\uc6a9\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.",
  },
  {
    q: "\ubb34\ub8cc\ub85c \uc5bc\ub9c8\ub098 \uc0ac\uc6a9\ud560 \uc218 \uc788\ub098\uc694?",
    a: "\ubb34\ub8cc \uccb4\ud5d8\uc73c\ub85c 2\ud68c \uc0dd\uc131\uc774 \uac00\ub2a5\ud569\ub2c8\ub2e4. \uc774\ud6c4\uc5d0\ub294 \ubcf8\uc778\uc758 Google Gemini API \ud0a4\ub97c \uc785\ub825\ud558\uba74 \ubb34\uc81c\ud55c\uc73c\ub85c \uc0ac\uc6a9\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4. API \ud0a4\ub294 Google AI Studio\uc5d0\uc11c \ubb34\ub8cc\ub85c \ubc1c\uae09\ubc1b\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
  },
  {
    q: "\uc0dd\uc131\ub41c \uc0ac\uc9c4\uc758 \ud488\uc9c8\uc740 \uc5b4\ub5a4\uac00\uc694?",
    a: "Google Gemini AI\ub97c \ud65c\uc6a9\ud558\uc5ec \uace0\ud488\uc9c8 \ud504\ub85c\ud544 \uc0ac\uc9c4\uc744 \uc0dd\uc131\ud569\ub2c8\ub2e4. \ub9c1\ud06c\ub4dc\uc778, \uc774\ub825\uc11c, \uba85\ud568 \ub4f1 \ub2e4\uc591\ud55c \uc804\ubb38\uc801 \uc6a9\ub3c4\uc5d0 \uc801\ud569\ud55c \uacb0\uacfc\ubb3c\uc744 \ubc1b\uc544\ubcf4\uc2e4 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIdx(openIdx === i ? null : i);
  };

  return (
    <section id="faq" className="px-6 pb-20 md:pb-32 max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-3">
          FAQ
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          {"\uc790\uc8fc \ubb3b\ub294 \uc9c8\ubb38"}
        </h2>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">
          {"\uad81\uae08\ud55c \uc810\uc774 \uc788\uc73c\uc2dc\uba74 \uc544\ub798\ub97c \ud655\uc778\ud574 \ubcf4\uc138\uc694"}
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              className={`rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? "border-indigo-200 bg-indigo-50/30 shadow-md shadow-indigo-50/50"
                  : "border-slate-100 bg-white/70 hover:border-slate-200 hover:shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left"
                aria-expanded={isOpen}
              >
                <span className={`text-sm sm:text-base font-semibold transition-colors duration-200 ${isOpen ? "text-indigo-700" : "text-slate-800"}`}>
                  {item.q}
                </span>
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-indigo-500 rotate-180" : "bg-slate-100"}`}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isOpen ? "white" : "#64748b"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>

              <div className={`faq-answer ${isOpen ? "open" : ""}`}>
                <div>
                  <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-slate-500 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
