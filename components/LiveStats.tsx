"use client";

import { useEffect, useState } from "react";
import type { CharSample } from "@/lib/stats";

interface Props {
  status: "idle" | "running" | "done";
  startedAt: number;
  typed: string;
  target: string;
  samples: CharSample[];
}

/**
 * 라이브 스탯을 iPhone 다이나믹 아일랜드처럼 상단에 떠 있는 어두운 캡슐로 표시.
 * 상태(idle↔running)가 바뀌면 캡슐이 통통 튀며 다시 등장한다.
 */
export function LiveStats({ status, startedAt, typed, target, samples }: Props) {
  const [, tick] = useState(0);

  // 실행 중에는 주기적으로 다시 그려 경과 시간/타수를 갱신
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => tick((n) => n + 1), 200);
    return () => clearInterval(id);
  }, [status]);

  const running = status === "running";
  const elapsedMs = running && startedAt ? Date.now() - startedAt : 0;
  const minutes = elapsedMs / 60_000;
  const correctStrokes = samples
    .filter((s) => s.correct)
    .reduce((a, s) => a + s.strokes, 0);
  const cpm = minutes > 0 ? Math.round(correctStrokes / minutes) : 0;

  let correct = 0;
  for (let i = 0; i < typed.length; i++) {
    if (i < target.length && typed[i] === target[i]) correct++;
  }
  const acc = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
  const seconds = Math.floor(elapsedMs / 1000);

  return (
    <div
      // status 가 바뀔 때마다 remount → island-in 애니메이션 재생(모핑 느낌)
      key={status}
      className="island-in fixed left-1/2 top-[4.75rem] z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-[#1c1c1e]/90 px-4 py-2 text-white shadow-[0_14px_44px_-12px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full bg-white dot-pulse ${
          running ? "" : "opacity-50"
        }`}
      />

      {running ? (
        <div className="island-seg flex items-center gap-3 font-mono tabular-nums">
          <Seg label="타수" value={String(cpm)} />
          <Divider />
          <Seg label="정확도" value={`${acc}%`} />
          <Divider />
          <Seg label="시간" value={`${seconds}s`} />
          <Divider />
          <span className="text-xs text-white/40">
            {typed.length}/{target.length}
          </span>
        </div>
      ) : (
        <span className="island-seg pr-1 text-sm text-white/70">
          타이핑을 시작하세요
        </span>
      )}
    </div>
  );
}

function Seg({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-[0.6rem] tracking-wider text-white/40">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </span>
  );
}

function Divider() {
  return <span className="h-3 w-px bg-white/15" />;
}
