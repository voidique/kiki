"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "@/lib/settings";

/*
 * 우측 하단 글래스 컨트롤 클러스터 — 테마 토글 + 사운드.
 * 사운드 아이콘을 누르면 유리 느낌의 볼륨 슬라이더(progress)가 떠오른다.
 */
export function Controls() {
  const { theme, toggleTheme, soundOn, toggleSound, volume, setVolume } =
    useSettings();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 / ESC 로 팝오버 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="fixed bottom-5 right-5 z-50 flex items-end gap-2 sm:bottom-7 sm:right-7"
    >
      <div className="relative">
        {open && (
          <VolumePopover
            volume={soundOn ? volume : 0}
            onChange={(v) => {
              setVolume(v);
              // 0 으로 내리면 음소거, 다시 올리면 자동 활성
              if (v > 0 && !soundOn) toggleSound();
              if (v === 0 && soundOn) toggleSound();
            }}
          />
        )}
        <IconButton
          label="키보드 사운드 볼륨"
          active={open}
          onClick={() => setOpen((o) => !o)}
        >
          <SoundIcon on={soundOn && volume > 0} />
        </IconButton>
      </div>

      <IconButton
        label={theme === "dark" ? "라이트 모드로" : "다크 모드로"}
        onClick={toggleTheme}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </IconButton>
    </div>
  );
}

/* ── 공통 글래스 아이콘 버튼 ─────────────────────────────── */
function IconButton({
  label,
  onClick,
  active = false,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`glass glass-interactive grid h-11 w-11 place-items-center rounded-full text-fg ${
        active ? "glass-pill" : ""
      }`}
    >
      {children}
    </button>
  );
}

/* ── 유리 볼륨 슬라이더 (수직 progress) ─────────────────── */
function VolumePopover({
  volume,
  onChange,
}: {
  volume: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const setFromPointer = useCallback(
    (clientY: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // 아래(0) → 위(1)
      const ratio = 1 - (clientY - rect.top) / rect.height;
      onChange(Math.round(Math.min(1, Math.max(0, ratio)) * 100) / 100);
    },
    [onChange],
  );

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => setFromPointer(e.clientY);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, setFromPointer]);

  const pct = Math.round(volume * 100);

  return (
    <div className="glass absolute bottom-[calc(100%+10px)] left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 rounded-2xl p-3">
      <span className="font-mono text-[11px] tabular-nums text-muted">
        {pct}
      </span>
      {/* 트랙 */}
      <button
        type="button"
        ref={trackRef as unknown as React.RefObject<HTMLButtonElement>}
        aria-label="볼륨 조절"
        className="relative h-32 w-2.5 cursor-pointer touch-none rounded-full"
        style={{ background: "var(--glass-track)" }}
        onPointerDown={(e) => {
          e.preventDefault();
          setDragging(true);
          setFromPointer(e.clientY);
        }}
      >
        {/* 채워진 부분 */}
        <span
          className="absolute inset-x-0 bottom-0 rounded-full"
          style={{
            height: `${pct}%`,
            background: "var(--glass-fill)",
            boxShadow: "inset 0 1px 0 0 var(--glass-highlight)",
          }}
        />
        {/* 손잡이 */}
        <span
          className="glass absolute left-1/2 h-5 w-5 -translate-x-1/2 translate-y-1/2 rounded-full"
          style={{ bottom: `${pct}%` }}
        />
      </button>
    </div>
  );
}

/* ── 아이콘 (currentColor 스트로크) ─────────────────────── */
function SoundIcon({ on }: { on: boolean }) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: 버튼에 aria-label 있는 장식용 아이콘
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 5 6 9H3v6h3l5 4z" />
      {on ? (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      ) : (
        <>
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </>
      )}
    </svg>
  );
}

function MoonIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: 버튼에 aria-label 있는 장식용 아이콘
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

function SunIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: 버튼에 aria-label 있는 장식용 아이콘
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
