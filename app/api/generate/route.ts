import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildPrompt, type BgColor } from "@/app/lib/styles";

/* ------------------------------------------------------------------ */
/*  Runtime config                                                     */
/* ------------------------------------------------------------------ */

export const runtime = "nodejs";
export const maxDuration = 60;

/* ------------------------------------------------------------------ */
/*  GET handler – admin password verification                          */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const pw = req.headers.get("x-access-password") || req.headers.get("x-admin-password");
  const serverPw = process.env.ADMIN_PASSWORD || process.env.ACCESS_PASSWORD;

  // If no password is set on server, allow access. If password is set, verify it.
  if (serverPw && (!pw || pw !== serverPw)) {
    return NextResponse.json({ authorized: false }, { status: 401 });
  }

  return NextResponse.json({ authorized: true });
}

/* ------------------------------------------------------------------ */
/*  Helper: Call Gemini model for image generation                     */
/* ------------------------------------------------------------------ */

async function generateWithModel(
  ai: GoogleGenAI,
  modelName: string,
  promptText: string,
  mimeType: string,
  base64Data: string,
): Promise<string> {
  const result = await ai.models.generateContent({
    model: modelName,
    contents: [
      {
        role: "user",
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ["IMAGE", "TEXT"],
    },
  });

  const parts = result.candidates?.[0]?.content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error(`${modelName}: output parts empty`);
  }

  let outputMime = "image/png";
  let outputBase64 = "";

  for (const part of parts) {
    if (part.inlineData?.data) {
      outputMime = part.inlineData.mimeType || "image/png";
      outputBase64 = part.inlineData.data;
      break;
    }
  }

  if (!outputBase64) {
    throw new Error(`${modelName}: no image in output`);
  }

  return `data:${outputMime};base64,${outputBase64}`;
}

/* ------------------------------------------------------------------ */
/*  POST handler                                                       */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    /* ---- Parse & validate body ---- */
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "잘못된 요청 형식입니다." },
        { status: 400 },
      );
    }

    const {
      imageBase64,
      style = "corporate",
      targetModel = "compare",
      bgColor = "white",
      customPrompt = "",
    } = body as {
      imageBase64?: string;
      style?: string;
      targetModel?: string; // "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image" | "compare"
      bgColor?: BgColor;
      customPrompt?: string;
    };

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "이미지 데이터가 필요합니다." },
        { status: 400 },
      );
    }

    /* ---- Build final English prompt ---- */
    const finalPrompt = buildPrompt({
      styleId: style,
      bgColor,
      customPrompt,
    });

    /* ---- Resolve API key: BYOK header takes priority ---- */
    const byokKey = req.headers.get("x-gemini-key");
    const accessPw = req.headers.get("x-access-password") || req.headers.get("x-admin-password");
    const serverPw = process.env.ADMIN_PASSWORD || process.env.ACCESS_PASSWORD;

    if (serverPw && !byokKey && accessPw !== serverPw) {
      return NextResponse.json(
        { error: "접근 비밀번호가 올바르지 않거나 만료되었습니다." },
        { status: 401 },
      );
    }

    const apiKey = byokKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("[generate] No API key available (no BYOK, no env)");
      return NextResponse.json(
        { error: "서버 설정 오류가 발생했습니다. 관리자에게 문의해 주세요." },
        { status: 500 },
      );
    }

    /* ---- Initialize Gemini client ---- */
    const ai = new GoogleGenAI({ apiKey });

    /* ---- Strip data-URL prefix ---- */
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    if (targetModel === "compare") {
      /* ---- Compare mode: run both models in parallel ---- */
      const [res31, res20] = await Promise.allSettled([
        generateWithModel(ai, "gemini-3.1-flash-image", finalPrompt, mimeType, base64Data),
        generateWithModel(ai, "gemini-3.1-flash-lite-image", finalPrompt, mimeType, base64Data),
      ]);

      const imageUrl31 = res31.status === "fulfilled" ? res31.value : null;
      const imageUrl20 = res20.status === "fulfilled" ? res20.value : null;

      // Log detailed errors for debugging
      if (res31.status === "rejected") {
        console.error("[generate] gemini-3.1-flash-image failed:", res31.reason);
      }
      if (res20.status === "rejected") {
        console.error("[generate] gemini-3.1-flash-lite-image failed:", res20.reason);
      }

      if (!imageUrl31 && !imageUrl20) {
        return NextResponse.json(
          { error: "두 모델 모두 이미지 생성에 실패했습니다. 다른 사진으로 다시 시도해 주세요." },
          { status: 500 },
        );
      }

      return NextResponse.json({
        compareMode: true,
        imageUrl: imageUrl31 || imageUrl20,
        imageUrl31,
        imageUrl20,
      });
    }

    /* ---- Single model mode ---- */
    const modelToUse =
      targetModel === "gemini-3.1-flash-lite-image"
        ? "gemini-3.1-flash-lite-image"
        : "gemini-3.1-flash-image";

    const imageUrl = await generateWithModel(ai, modelToUse, finalPrompt, mimeType, base64Data);

    return NextResponse.json({ imageUrl, selectedModel: modelToUse });
  } catch (err: unknown) {
    console.error("[generate] Error:", err);

    let message = "헤드샷 생성 중 오류가 발생했습니다. 다시 시도해 주세요.";

    if (err instanceof Error) {
      if (err.message?.includes("quota") || err.message?.includes("429")) {
        message = "API 사용 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.";
      } else if (err.message?.includes("401") || err.message?.includes("403")) {
        message = "API 인증에 실패했습니다. 관리자에게 문의해 주세요.";
      } else if (err.message?.includes("safety") || err.message?.includes("SAFETY")) {
        message = "안전 정책에 의해 이미지 생성이 차단되었습니다. 다른 사진으로 시도해 주세요.";
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
