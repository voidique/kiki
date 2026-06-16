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

export function LiveStats({
  status,
  startedAt,
  typed,
  target,
  samples,
}: Props) {
  const [, tick] = useState(0);

  // 실행 중에는 주기적으로 다시 그려 경과 시간/타수를 갱신
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => tick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [status]);

  const elapsedMs =
    status === "running" && startedAt ? Date.now() - startedAt : 0;
  const minutes = elapsedMs / 60_000;
  const correctStrokes = samples
    .filter((s) => s.correct)
    .reduce((a, s) => a + s.strokes, 0);
  const cpm = minutes > 0 ? Math.round(correctStrokes / minutes) : 0;

  let correct = 0;
  for (let i = 0; i < typed.length; i++) {
    if (i < target.length && typed[i] === target[i]) correct++;
  }
  const acc =
    typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
  const seconds = Math.floor(elapsedMs / 1000);

  return (
    <div className="flex items-end gap-8 font-mono text-muted tabular-nums">
      <Stat label="타수" value={status === "idle" ? "—" : String(cpm)} />
      <Stat label="정확도" value={status === "idle" ? "—" : `${acc}%`} />
      <Stat label="시간" value={status === "idle" ? "—" : `${seconds}s`} />
      <div className="ml-2 text-xs text-faint">
        {typed.length}/{target.length}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[0.65rem] uppercase tracking-widest text-faint">
        {label}
      </span>
      <span className="text-lg text-fg">{value}</span>
    </div>
  );
}
