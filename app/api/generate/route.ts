import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

/* ------------------------------------------------------------------ */
/*  Runtime config                                                     */
/* ------------------------------------------------------------------ */

export const runtime = "nodejs";
export const maxDuration = 60;

/* ------------------------------------------------------------------ */
/*  Style → English prompt map                                         */
/* ------------------------------------------------------------------ */

const STYLE_PROMPTS: Record<string, string> = {
  corporate:
    "Transform this selfie into a professional corporate headshot portrait. The person should be wearing a formal business suit with a clean solid neutral background. Apply professional studio lighting with sharp focus. The expression should be confident and approachable. Make it look like a high-end LinkedIn profile photo. Keep the person's face, features, and identity exactly the same.",
  studio:
    "Transform this selfie into a professional studio headshot portrait. Use a clean white or light grey background with soft diffused studio lighting. Sharp focus with natural, relaxed expression. Make it look like high-end professional photography. Keep the person's face, features, and identity exactly the same.",
  outdoor:
    "Transform this selfie into a professional outdoor headshot portrait. Use natural warm sunlight with a soft bokeh green nature background, as if shot during golden hour. The expression should be friendly and approachable, like editorial photography. Keep the person's face, features, and identity exactly the same.",
};

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

    const { imageBase64, style } = body as {
      imageBase64?: string;
      style?: string;
    };

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "이미지 데이터가 필요합니다." },
        { status: 400 },
      );
    }

    if (!style || !STYLE_PROMPTS[style]) {
      return NextResponse.json(
        { error: "유효한 스타일을 선택해 주세요." },
        { status: 400 },
      );
    }

    /* ---- Resolve API key: BYOK header takes priority ---- */
    const byokKey = req.headers.get("x-gemini-key");
    const apiKey = byokKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("[generate] No API key available (no BYOK, no env)");
      return NextResponse.json(
        { error: "서버 설정 오류가 발생했습니다. 관리자에게 문의해 주세요." },
        { status: 500 },
      );
    }

    // Never log or persist the user's BYOK key

    /* ---- Initialize Gemini client ---- */
    const ai = new GoogleGenAI({ apiKey });

    /* ---- Strip data-URL prefix ---- */
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Detect mime type from data URL prefix
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    /* ---- Call Gemini with image input → image output ---- */
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: [
            { text: STYLE_PROMPTS[style] },
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

    /* ---- Extract output image ---- */
    const parts = result.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      return NextResponse.json(
        { error: "이미지 생성에 실패했습니다. 다시 시도해 주세요." },
        { status: 500 },
      );
    }

    // Find the image part in the response
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
      return NextResponse.json(
        { error: "이미지를 생성하지 못했습니다. 다른 사진으로 다시 시도해 주세요." },
        { status: 500 },
      );
    }

    // Return the generated image as a base64 data URL
    const imageUrl = `data:${outputMime};base64,${outputBase64}`;

    return NextResponse.json({ imageUrl });
  } catch (err: unknown) {
    // Log full error server-side for debugging, never expose to client
    console.error("[generate] Error:", err);

    // Surface a safe Korean message only
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
