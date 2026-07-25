import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ProShot — 셀카 한 장으로 AI 프로필 사진",
  description:
    "셀카 한 장으로 전문적인 AI 프로필 사진을 만들어보세요. ProShot이 몇 분 안에 스튜디오급 헤드샷을 생성합니다.",
  keywords: ["AI 프로필", "AI 헤드샷", "프로필 사진", "셀카", "ProShot"],
  openGraph: {
    title: "ProShot — 셀카 한 장으로 AI 프로필 사진",
    description:
      "셀카 한 장만 있으면 충분합니다. AI가 전문적인 프로필 사진을 만들어 드립니다.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
