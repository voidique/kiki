import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 워드마크(kiki) 전용 — 본문 Pretendard 와 뚜렷이 구분되는 지오메트릭 디스플레이 폰트
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "kiki — 타이핑 연습",
  description:
    "순수 타자 연습에 집중한 모노크롬 미니멀 타이핑 앱. 무작위 단어 · 문장 · 명언 모드.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
