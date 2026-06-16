import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { Controls } from "@/components/Controls";
import { SettingsProvider } from "@/lib/settings";
import "./globals.css";

/* 첫 페인트 전에 저장된 테마를 <html data-theme> 로 반영 → 다크/라이트 깜빡임 방지 */
const themeScript = `(function(){try{var t=localStorage.getItem("kiki.theme");if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

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

// 배포 도메인 — 실제 도메인이 정해지면 NEXT_PUBLIC_SITE_URL 로 덮어쓴다.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kiki-typing.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "kiki — minimal typing practice",
    template: "%s · kiki",
  },
  description:
    "kiki is a clean, monochrome, minimal typing-practice app focused on pure typing. Practice with random words, sentences, and quotes in Korean and English, and track your speed (CPM/WPM), accuracy, and consistency.",
  applicationName: "kiki",
  keywords: [
    "typing test",
    "typing practice",
    "typing speed",
    "monkeytype alternative",
    "CPM",
    "WPM",
    "words per minute",
    "Korean typing",
    "타자 연습",
    "타이핑",
    "한글 타자",
    "minimal",
    "monochrome",
  ],
  authors: [{ name: "kiki" }],
  creator: "kiki",
  publisher: "kiki",
  category: "productivity",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "kiki",
    title: "kiki — minimal typing practice",
    description:
      "A clean, monochrome typing-practice app. Words, sentences, and quotes in Korean and English. Track CPM, accuracy, and consistency.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "kiki — minimal typing practice",
    description:
      "A clean, monochrome typing-practice app. Words, sentences, and quotes in Korean and English.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      // 테마 스크립트가 첫 페인트 전 data-theme 를 주입 → 서버/클라 속성 차이는 의도된 것
      suppressHydrationWarning
      className={`${pretendard.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full`}
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: 테마 깜빡임 방지용 사전 실행 스크립트 */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <SettingsProvider>
          {children}
          <Controls />
        </SettingsProvider>
      </body>
    </html>
  );
}
