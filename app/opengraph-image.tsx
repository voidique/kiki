import { ImageResponse } from "next/og";

// 동적 OG 이미지 — 브랜드 모노크롬 카드 (아이콘/파비콘은 별도, 여기선 OG만)
export const alt = "kiki — minimal typing practice";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "96px",
        background: "#0b0b0b",
        color: "#ededed",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 168,
          fontWeight: 700,
          letterSpacing: "-0.05em",
          lineHeight: 1,
        }}
      >
        kiki
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 18,
          fontSize: 44,
          color: "#9a9a9a",
        }}
      >
        minimal typing practice
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 64,
          fontSize: 28,
          color: "#5a5a5a",
        }}
      >
        words · sentences · quotes — Korean &amp; English
      </div>
    </div>,
    { ...size },
  );
}
